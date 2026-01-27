import { rm } from "fs/promises";
import { relative, resolve, sep } from "path";
import { eq } from "drizzle-orm";
import { chats, getDatabase } from "./db";
import { fetchGitHubPRStatus } from "./github";
import { getDefaultBranch } from "./git-worktree";
import { execWithShellEnv } from "./shell-env";
import type { ChangedFile, CommitInfo, FileStatus, GitChangesStatus } from "../shared/changes-types";

const PROTECTED_BRANCHES = ["main", "master", "develop", "production", "staging"];

async function runGit(cwd: string, args: string[]) {
  return execWithShellEnv("git", args, { cwd });
}

function mapGitStatus(gitIndex: string, gitWorking: string): FileStatus {
  if (gitIndex === "A" || gitWorking === "A") return "added";
  if (gitIndex === "D" || gitWorking === "D") return "deleted";
  if (gitIndex === "R") return "renamed";
  if (gitIndex === "C") return "copied";
  if (gitIndex === "?" || gitWorking === "?") return "untracked";
  return "modified";
}

function toChangedFile(
  path: string,
  gitIndex: string,
  gitWorking: string,
  oldPath?: string,
): ChangedFile {
  return {
    path,
    oldPath,
    status: mapGitStatus(gitIndex, gitWorking),
    additions: 0,
    deletions: 0,
  };
}

function parsePorcelainStatus(output: string): {
  branch: string;
  staged: ChangedFile[];
  unstaged: ChangedFile[];
  untracked: ChangedFile[];
} {
  const staged: ChangedFile[] = [];
  const unstaged: ChangedFile[] = [];
  const untracked: ChangedFile[] = [];
  let branch = "HEAD";

  const lines = output.split("\n").filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("##")) {
      const info = line.slice(2).trim();
      const branchPart = info.split("...")[0];
      branch = branchPart || "HEAD";
      continue;
    }

    const x = line[0] || " ";
    const y = line[1] || " ";
    const rest = line.slice(3).trim();
    if (!rest) continue;

    if (x === "?" && y === "?") {
      untracked.push(toChangedFile(rest, x, y));
      continue;
    }

    let path = rest;
    let oldPath: string | undefined;
    if (rest.includes(" -> ")) {
      const [oldPart, newPart] = rest.split(" -> ");
      oldPath = oldPart?.trim();
      path = newPart?.trim() || rest;
    }

    if (x && x !== " " && x !== "?") {
      staged.push(toChangedFile(path, x, " ", oldPath));
    }

    if (y && y !== " " && y !== "?") {
      unstaged.push(toChangedFile(path, " ", y, oldPath));
    }
  }

  return { branch, staged, unstaged, untracked };
}

function parseDiffNumstat(numstatOutput: string): Map<string, { additions: number; deletions: number }> {
  const stats = new Map<string, { additions: number; deletions: number }>();

  for (const line of numstatOutput.trim().split("\n")) {
    if (!line.trim()) continue;
    const [addStr, delStr, ...pathParts] = line.split("\t");
    const rawPath = pathParts.join("\t");
    if (!rawPath) continue;

    const additions = addStr === "-" ? 0 : Number.parseInt(addStr, 10) || 0;
    const deletions = delStr === "-" ? 0 : Number.parseInt(delStr, 10) || 0;
    const entry = { additions, deletions };

    const renameMatch = rawPath.match(/^(.+) => (.+)$/);
    if (renameMatch) {
      stats.set(renameMatch[1]!, entry);
      stats.set(renameMatch[2]!, entry);
    } else {
      stats.set(rawPath, entry);
    }
  }

  return stats;
}

async function applyNumstatToFiles(cwd: string, files: ChangedFile[], args: string[]): Promise<void> {
  if (files.length === 0) return;
  const diff = await runGit(cwd, args);
  if (diff.code !== 0) return;

  const stats = parseDiffNumstat(diff.stdout);
  for (const file of files) {
    const stat = stats.get(file.path);
    if (stat) {
      file.additions = stat.additions;
      file.deletions = stat.deletions;
    }
  }
}

async function applyUntrackedLineCount(cwd: string, files: ChangedFile[]): Promise<void> {
  await Promise.all(
    files.map(async (file) => {
      try {
        const fullPath = resolveFilePath(cwd, file.path);
        const content = await Bun.file(fullPath).text();
        file.additions = content ? content.split("\n").length : 0;
        file.deletions = 0;
      } catch {
        // ignore
      }
    }),
  );
}

function parseNameStatus(output: string): ChangedFile[] {
  const files: ChangedFile[] = [];

  for (const line of output.trim().split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    const statusCode = parts[0];
    if (!statusCode) continue;

    const isRenameOrCopy = statusCode.startsWith("R") || statusCode.startsWith("C");
    const path = isRenameOrCopy ? parts[2] : parts[1];
    const oldPath = isRenameOrCopy ? parts[1] : undefined;

    if (!path) continue;

    let status: FileStatus;
    switch (statusCode[0]) {
      case "A":
        status = "added";
        break;
      case "D":
        status = "deleted";
        break;
      case "R":
        status = "renamed";
        break;
      case "C":
        status = "copied";
        break;
      default:
        status = "modified";
    }

    files.push({
      path,
      oldPath,
      status,
      additions: 0,
      deletions: 0,
    });
  }

  return files;
}

function parseGitLog(logOutput: string): CommitInfo[] {
  if (!logOutput.trim()) return [];
  const commits: CommitInfo[] = [];
  const lines = logOutput.trim().split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split("|");
    if (parts.length < 6) continue;

    const hash = parts[0]?.trim();
    const shortHash = parts[1]?.trim();
    const message = parts[2]?.trim();
    const description = parts.slice(3, -2).join("|").trim();
    const author = parts[parts.length - 2]?.trim();
    const dateStr = parts[parts.length - 1]?.trim();

    if (!hash || !shortHash) continue;

    const parsedDate = dateStr ? new Date(dateStr) : new Date();

    commits.push({
      hash,
      shortHash,
      message: message || "",
      description: description || undefined,
      author: author || "",
      date: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      files: [],
    });
  }

  return commits;
}

async function refExists(cwd: string, ref: string): Promise<boolean> {
  const result = await runGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  return result.code === 0;
}

function resolveFilePath(worktreePath: string, filePath: string): string {
  const fullPath = resolve(worktreePath, filePath);
  const rel = relative(worktreePath, fullPath);
  if (rel.startsWith("..") || rel.includes(`..${sep}`)) {
    throw new Error("Invalid file path");
  }
  return fullPath;
}

async function getTrackingStatus(cwd: string) {
  const tracking = await runGit(cwd, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]);
  if (tracking.code !== 0) {
    return { pushCount: 0, pullCount: 0, hasUpstream: false };
  }
  const [pullStr, pushStr] = tracking.stdout.trim().split(/\s+/);
  return {
    pushCount: Number.parseInt(pushStr || "0", 10),
    pullCount: Number.parseInt(pullStr || "0", 10),
    hasUpstream: true,
  };
}

async function getBranchComparison(cwd: string, defaultBranch: string) {
  let baseRef = defaultBranch;
  if (await refExists(cwd, `origin/${defaultBranch}`)) {
    baseRef = `origin/${defaultBranch}`;
  }

  if (!(await refExists(cwd, baseRef))) {
    return { commits: [], againstBase: [], ahead: 0, behind: 0 };
  }

  const tracking = await runGit(cwd, ["rev-list", "--left-right", "--count", `${baseRef}...HEAD`]);
  const [behindStr, aheadStr] = tracking.stdout.trim().split(/\s+/);
  const behind = Number.parseInt(behindStr || "0", 10);
  const ahead = Number.parseInt(aheadStr || "0", 10);

  const logOutput = await runGit(cwd, [
    "log",
    `${baseRef}..HEAD",
    "--format=%H|%h|%s|%b|%an|%aI",
  ]);

  const commits = parseGitLog(logOutput.stdout);

  const diffOutput = await runGit(cwd, ["diff", "--name-status", `${baseRef}...HEAD`]);
  const againstBase = parseNameStatus(diffOutput.stdout);

  await applyNumstatToFiles(cwd, againstBase, ["diff", "--numstat", `${baseRef}...HEAD`]);

  return { commits, againstBase, ahead, behind };
}

async function getLocalBranchesWithDates(cwd: string) {
  const result = await runGit(cwd, [
    "for-each-ref",
    "--format=%(refname:short)|%(committerdate:unix)",
    "refs/heads",
  ]);

  const branches: Array<{ branch: string; lastCommitDate: number }> = [];
  if (result.code !== 0) return branches;

  for (const line of result.stdout.trim().split("\n")) {
    if (!line.trim()) continue;
    const [branch, dateStr] = line.split("|");
    const timestamp = Number.parseInt(dateStr || "0", 10) * 1000;
    branches.push({ branch: branch || "", lastCommitDate: Number.isNaN(timestamp) ? 0 : timestamp });
  }

  return branches;
}

async function getCheckedOutBranches(cwd: string): Promise<Record<string, string>> {
  const result = await runGit(cwd, ["worktree", "list", "--porcelain"]);
  if (result.code !== 0) return {};

  const lines = result.stdout.split("\n");
  const checkedOut: Record<string, string> = {};
  let currentPath: string | null = null;

  for (const line of lines) {
    if (line.startsWith("worktree ")) {
      currentPath = line.slice("worktree ".length).trim();
    } else if (line.startsWith("branch ") && currentPath) {
      const branchRef = line.slice("branch ".length).trim();
      const branch = branchRef.replace("refs/heads/", "");
      checkedOut[branch] = currentPath;
    }
  }

  return checkedOut;
}

async function ensureWorktreeRegistered(worktreePath: string): Promise<boolean> {
  const db = await getDatabase();
  const chat = db.select().from(chats).where(eq(chats.worktreePath, worktreePath)).get();
  return !!chat;
}

export function createChangesHandlers() {
  return {
    changesGetStatus: async ({ worktreePath, defaultBranch }: { worktreePath: string; defaultBranch?: string }) => {
      const statusResult = await runGit(worktreePath, ["status", "--porcelain=1", "-b"]);
      const parsed = parsePorcelainStatus(statusResult.stdout || "");

      const resolvedDefault = defaultBranch || (await getDefaultBranch(worktreePath));
      const branchComparison = await getBranchComparison(worktreePath, resolvedDefault);
      const trackingStatus = await getTrackingStatus(worktreePath);

      await Promise.all([
        applyNumstatToFiles(worktreePath, parsed.staged, ["diff", "--cached", "--numstat"]),
        applyNumstatToFiles(worktreePath, parsed.unstaged, ["diff", "--numstat"]),
        applyUntrackedLineCount(worktreePath, parsed.untracked),
      ]);

      const result: GitChangesStatus = {
        branch: parsed.branch || "HEAD",
        defaultBranch: resolvedDefault,
        againstBase: branchComparison.againstBase,
        commits: branchComparison.commits,
        staged: parsed.staged,
        unstaged: parsed.unstaged,
        untracked: parsed.untracked,
        ahead: branchComparison.ahead,
        behind: branchComparison.behind,
        pushCount: trackingStatus.pushCount,
        pullCount: trackingStatus.pullCount,
        hasUpstream: trackingStatus.hasUpstream,
      };

      return result;
    },

    changesGetBranches: async ({ worktreePath }: { worktreePath: string }) => {
      const branchResult = await runGit(worktreePath, ["branch", "-a"]);
      const lines = branchResult.stdout.split("\n");
      const localBranches: string[] = [];
      const remote: string[] = [];
      let current = "";

      for (const line of lines) {
        const trimmed = line.replace(/^\*\s*/, "").trim();
        if (!trimmed) continue;
        if (line.startsWith("*")) {
          current = trimmed;
        }
        if (trimmed.startsWith("remotes/origin/")) {
          const remoteName = trimmed.replace("remotes/origin/", "");
          if (remoteName !== "HEAD") remote.push(remoteName);
        } else if (!trimmed.startsWith("remotes/")) {
          localBranches.push(trimmed);
        }
      }

      const local = await getLocalBranchesWithDates(worktreePath);
      const defaultBranch = await getDefaultBranch(worktreePath);
      const checkedOutBranches = await getCheckedOutBranches(worktreePath);

      return {
        current: current || (await getDefaultBranch(worktreePath)),
        local,
        remote: remote.sort(),
        defaultBranch,
        checkedOutBranches,
      };
    },

    changesFetch: async ({ worktreePath }: { worktreePath: string }) => {
      const result = await runGit(worktreePath, ["fetch", "--all", "--prune"]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to fetch");
      }
      return { success: true } as const;
    },

    changesFetchRemote: async ({ worktreePath }: { worktreePath: string }) => {
      const result = await runGit(worktreePath, ["fetch", "--all", "--prune"]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to fetch");
      }
      return { success: true } as const;
    },

    changesCheckout: async ({ worktreePath, branch }: { worktreePath: string; branch: string }) => {
      const status = await runGit(worktreePath, ["status", "--porcelain"]);
      if (status.stdout.trim()) {
        throw new Error(
          "Cannot switch branches: you have uncommitted changes. Please commit or stash your changes first.",
        );
      }

      const result = await runGit(worktreePath, ["checkout", branch]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to checkout branch");
      }
      return { success: true } as const;
    },

    changesGetHistory: async ({ worktreePath, limit = 50 }: { worktreePath: string; limit?: number }) => {
      const result = await runGit(worktreePath, [
        "log",
        `-${limit}`,
        "--format=%H|%h|%s|%an|%ae|%aI",
      ]);

      if (!result.stdout.trim()) return [];

      return result.stdout
        .trim()
        .split("\n")
        .map((line) => {
          const [hash, shortHash, message, author, email, dateStr] = line.split("|");
          return {
            hash: hash || "",
            shortHash: shortHash || "",
            message: message || "",
            author: author || "",
            email: email || "",
            date: new Date(dateStr || ""),
          };
        });
    },

    changesCommit: async ({ worktreePath, message }: { worktreePath: string; message: string }) => {
      if (!message.trim()) {
        throw new Error("Commit message cannot be empty");
      }

      const staged = await runGit(worktreePath, ["diff", "--cached", "--name-only"]);
      if (!staged.stdout.trim()) {
        throw new Error("No files staged for commit");
      }

      const result = await runGit(worktreePath, ["commit", "-m", message]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Commit failed");
      }

      const hashResult = await runGit(worktreePath, ["rev-parse", "HEAD"]);
      return { success: true, hash: hashResult.stdout.trim() } as const;
    },

    changesAtomicCommit: async ({
      worktreePath,
      filePaths,
      message,
    }: {
      worktreePath: string;
      filePaths: string[];
      message: string;
    }) => {
      if (!message.trim()) {
        throw new Error("Commit message cannot be empty");
      }
      if (!filePaths.length) {
        throw new Error("No files selected for commit");
      }

      await runGit(worktreePath, ["reset", "HEAD"]);
      const addResult = await runGit(worktreePath, ["add", "--", ...filePaths]);
      if (addResult.code !== 0) {
        throw new Error(addResult.stderr || addResult.stdout || "Failed to stage files");
      }

      const staged = await runGit(worktreePath, ["diff", "--cached", "--name-only"]);
      if (!staged.stdout.trim()) {
        throw new Error("Failed to stage files for commit");
      }

      const commitResult = await runGit(worktreePath, ["commit", "-m", message]);
      if (commitResult.code !== 0) {
        throw new Error(commitResult.stderr || commitResult.stdout || "Commit failed");
      }

      const hashResult = await runGit(worktreePath, ["rev-parse", "HEAD"]);
      return { success: true, hash: hashResult.stdout.trim() } as const;
    },

    changesPush: async ({ worktreePath, setUpstream }: { worktreePath: string; setUpstream?: boolean }) => {
      const upstreamCheck = await runGit(worktreePath, ["rev-parse", "--abbrev-ref", "@{upstream}"]);
      const hasUpstream = upstreamCheck.code === 0;

      if (setUpstream && !hasUpstream) {
        const branch = await runGit(worktreePath, ["rev-parse", "--abbrev-ref", "HEAD"]);
        const branchName = branch.stdout.trim();
        const result = await runGit(worktreePath, ["push", "--set-upstream", "origin", branchName]);
        if (result.code !== 0) {
          throw new Error(result.stderr || result.stdout || "Push failed");
        }
      } else {
        const result = await runGit(worktreePath, ["push"]);
        if (result.code !== 0) {
          throw new Error(result.stderr || result.stdout || "Push failed");
        }
      }

      return { success: true } as const;
    },

    changesForcePush: async ({ worktreePath }: { worktreePath: string }) => {
      const branch = await runGit(worktreePath, ["rev-parse", "--abbrev-ref", "HEAD"]);
      const branchName = branch.stdout.trim();
      if (PROTECTED_BRANCHES.includes(branchName)) {
        throw new Error(`Cannot force push protected branch '${branchName}'`);
      }
      const result = await runGit(worktreePath, ["push", "--force-with-lease"]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Force push failed");
      }
      return { success: true } as const;
    },

    changesPull: async ({ worktreePath, autoStash }: { worktreePath: string; autoStash?: boolean }) => {
      const status = await runGit(worktreePath, ["status", "--porcelain"]);
      const hasChanges = !!status.stdout.trim();

      let stashed = false;
      if (hasChanges) {
        if (!autoStash) {
          throw new Error(
            "Cannot pull with uncommitted changes. Please commit or stash your changes first, or enable auto-stash.",
          );
        }
        const stashResult = await runGit(worktreePath, ["stash", "push", "-u", "-m", "auto-stash"]);
        if (stashResult.code === 0) {
          stashed = true;
        }
      }

      const pullResult = await runGit(worktreePath, ["pull", "--rebase"]);
      if (pullResult.code !== 0) {
        throw new Error(pullResult.stderr || pullResult.stdout || "Pull failed");
      }

      if (stashed) {
        await runGit(worktreePath, ["stash", "pop"]);
      }

      return { success: true } as const;
    },

    changesMergeFromDefault: async ({ worktreePath, useRebase }: { worktreePath: string; useRebase?: boolean }) => {
      const status = await runGit(worktreePath, ["status", "--porcelain"]);
      if (status.stdout.trim()) {
        throw new Error(
          "Cannot merge/rebase with uncommitted changes. Please commit or stash your changes first.",
        );
      }

      await runGit(worktreePath, ["fetch", "--all"]);
      const defaultBranch = await getDefaultBranch(worktreePath);
      const baseRef = (await refExists(worktreePath, `origin/${defaultBranch}`))
        ? `origin/${defaultBranch}`
        : defaultBranch;

      const result = await runGit(
        worktreePath,
        useRebase ? ["rebase", baseRef] : ["merge", baseRef, "--no-edit"],
      );
      if (result.code !== 0) {
        const message = result.stderr || result.stdout || "Merge/rebase failed";
        if (useRebase) {
          await runGit(worktreePath, ["rebase", "--abort"]).catch(() => {});
        } else {
          await runGit(worktreePath, ["merge", "--abort"]).catch(() => {});
        }
        throw new Error(message);
      }

      return { success: true } as const;
    },

    changesCreateBranch: async ({
      projectPath,
      branchName,
      baseBranch,
    }: {
      projectPath: string;
      branchName: string;
      baseBranch: string;
    }) => {
      const branchRegex = /^[a-zA-Z0-9._/-]+$/;
      const invalidPatterns = [/^-/, /\.\./, /\.$/, /^\./, /@\{/, /\\/, /\s/];

      if (!branchRegex.test(branchName)) {
        throw new Error("Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes");
      }
      for (const pattern of invalidPatterns) {
        if (pattern.test(branchName)) {
          throw new Error(`Invalid branch name: '${branchName}'`);
        }
      }
      if (branchName.length > 250) {
        throw new Error("Branch name too long (max 250 characters)");
      }

      const branchList = await runGit(projectPath, ["branch", "-a"]);
      if (branchList.stdout.split("\n").some((line) => line.replace(/^\*\s*/, "").trim() === branchName)) {
        throw new Error(`Branch '${branchName}' already exists`);
      }

      let startPoint = baseBranch;
      if (await refExists(projectPath, `origin/${baseBranch}`)) {
        startPoint = `origin/${baseBranch}`;
      }

      const result = await runGit(projectPath, ["branch", branchName, startPoint]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to create branch");
      }

      return { success: true, branchName } as const;
    },

    changesGetCommitFiles: async ({ worktreePath, commitHash }: { worktreePath: string; commitHash: string }) => {
      const nameStatus = await runGit(worktreePath, [
        "diff-tree",
        "--no-commit-id",
        "--name-status",
        "-r",
        commitHash,
      ]);

      const files = parseNameStatus(nameStatus.stdout);
      await applyNumstatToFiles(worktreePath, files, [
        "diff-tree",
        "--no-commit-id",
        "--numstat",
        "-r",
        commitHash,
      ]);

      return files;
    },

    changesGetCommitFileDiff: async ({
      worktreePath,
      commitHash,
      filePath,
    }: {
      worktreePath: string;
      commitHash: string;
      filePath: string;
    }) => {
      const diff = await runGit(worktreePath, ["diff", `${commitHash}^`, commitHash, "--", filePath]);
      return diff.stdout;
    },

    changesIsWorktreeRegistered: async ({ worktreePath }: { worktreePath: string }) => {
      return ensureWorktreeRegistered(worktreePath);
    },

    changesGetGitHubStatus: async ({ worktreePath }: { worktreePath: string }) => {
      return fetchGitHubPRStatus(worktreePath);
    },

    changesStageFile: async ({ worktreePath, filePath }: { worktreePath: string; filePath: string }) => {
      const result = await runGit(worktreePath, ["add", "--", filePath]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to stage file");
      }
      return { success: true } as const;
    },

    changesUnstageFile: async ({ worktreePath, filePath }: { worktreePath: string; filePath: string }) => {
      const result = await runGit(worktreePath, ["reset", "HEAD", "--", filePath]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to unstage file");
      }
      return { success: true } as const;
    },

    changesDiscardChanges: async ({ worktreePath, filePath }: { worktreePath: string; filePath: string }) => {
      const result = await runGit(worktreePath, ["checkout", "--", filePath]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to discard changes");
      }
      return { success: true } as const;
    },

    changesStageAll: async ({ worktreePath }: { worktreePath: string }) => {
      const result = await runGit(worktreePath, ["add", "-A"]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to stage files");
      }
      return { success: true } as const;
    },

    changesUnstageAll: async ({ worktreePath }: { worktreePath: string }) => {
      const result = await runGit(worktreePath, ["reset", "HEAD"]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to unstage files");
      }
      return { success: true } as const;
    },

    changesStageFiles: async ({ worktreePath, filePaths }: { worktreePath: string; filePaths: string[] }) => {
      if (filePaths.length === 0) return { success: true } as const;
      const result = await runGit(worktreePath, ["add", "--", ...filePaths]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to stage files");
      }
      return { success: true } as const;
    },

    changesUnstageFiles: async ({ worktreePath, filePaths }: { worktreePath: string; filePaths: string[] }) => {
      if (filePaths.length === 0) return { success: true } as const;
      const result = await runGit(worktreePath, ["reset", "HEAD", "--", ...filePaths]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to unstage files");
      }
      return { success: true } as const;
    },

    changesDeleteUntracked: async ({ worktreePath, filePath }: { worktreePath: string; filePath: string }) => {
      const fullPath = resolveFilePath(worktreePath, filePath);
      await rm(fullPath, { recursive: true, force: true });
      return { success: true } as const;
    },

    changesDiscardMultipleChanges: async ({ worktreePath, filePaths }: { worktreePath: string; filePaths: string[] }) => {
      if (filePaths.length === 0) return { success: true } as const;
      const result = await runGit(worktreePath, ["checkout", "--", ...filePaths]);
      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout || "Failed to discard changes");
      }
      return { success: true } as const;
    },

    changesDeleteMultipleUntracked: async ({ worktreePath, filePaths }: { worktreePath: string; filePaths: string[] }) => {
      await Promise.all(filePaths.map((filePath) => rm(resolveFilePath(worktreePath, filePath), { recursive: true, force: true })));
      return { success: true } as const;
    },
  };
}
