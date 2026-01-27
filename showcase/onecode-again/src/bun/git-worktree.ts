import { randomBytes } from "crypto";
import { existsSync } from "fs";
import { mkdir, readFile, stat } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { checkGitLfsAvailable, getShellEnvironment, runCommand } from "./shell-env";
import { executeWorktreeSetup } from "./worktree-config";

export type BranchExistsResult =
  | { status: "exists" }
  | { status: "not_found" }
  | { status: "error"; message: string };

export interface WorktreeResult {
  success: boolean;
  worktreePath?: string;
  branch?: string;
  baseBranch?: string;
  error?: string;
}

const DEFAULT_BRANCH_CANDIDATES = ["main", "master", "develop", "trunk"];
const adjectives = [
  "brisk",
  "calm",
  "bright",
  "swift",
  "quiet",
  "bold",
  "gentle",
  "eager",
];
const landscapes = [
  "ridge",
  "meadow",
  "summit",
  "valley",
  "forest",
  "river",
  "canyon",
  "dune",
];

function randomHex(bytes = 3): string {
  return randomBytes(bytes).toString("hex");
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

async function getGitEnv(): Promise<Record<string, string>> {
  const shellEnv = await getShellEnvironment();
  const combined: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      combined[key] = value;
    }
  }

  for (const [key, value] of Object.entries(shellEnv)) {
    if (typeof value === "string") {
      combined[key] = value;
    }
  }

  if (shellEnv.PATH) {
    combined.PATH = shellEnv.PATH;
  }

  return combined;
}

async function runGit(
  args: string[],
  cwd: string,
  envOverride?: Record<string, string>,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const env = envOverride ? { ...(await getGitEnv()), ...envOverride } : await getGitEnv();
  return runCommand("git", args, { cwd, env });
}

async function isGitRepo(path: string): Promise<boolean> {
  const result = await runGit(["rev-parse", "--git-dir"], path);
  return result.code === 0;
}

async function hasOriginRemote(repoPath: string): Promise<boolean> {
  const result = await runGit(["remote"], repoPath);
  if (result.code !== 0) return false;
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .includes("origin");
}

export function sanitizeProjectName(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-.]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return sanitized || "project";
}

export function generateBranchName(): string {
  const name = `${pickRandom(adjectives)}-${pickRandom(landscapes)}`;
  const suffix = randomHex(3);
  return `${name}-${suffix}`;
}

export function generateWorktreeFolderName(parentDir: string): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const name = `${pickRandom(adjectives)}-${pickRandom(landscapes)}-${randomHex(2)}`;
    if (!existsSync(join(parentDir, name))) {
      return name;
    }
  }

  const fallback = `worktree-${Date.now().toString(36)}-${randomHex(2)}`;
  return fallback;
}

async function repoUsesLfs(repoPath: string): Promise<boolean> {
  try {
    const lfsDir = join(repoPath, ".git", "lfs");
    const stats = await stat(lfsDir);
    if (stats.isDirectory()) {
      return true;
    }
  } catch {
    // ignore
  }

  const attributeFiles = [
    join(repoPath, ".gitattributes"),
    join(repoPath, ".git", "info", "attributes"),
    join(repoPath, ".lfsconfig"),
  ];

  for (const filePath of attributeFiles) {
    try {
      const content = await readFile(filePath, "utf-8");
      if (content.includes("filter=lfs") || content.includes("[lfs]")) {
        return true;
      }
    } catch {
      // ignore missing files
    }
  }

  return false;
}

async function resolveCommitHash(repoPath: string, startPoint: string): Promise<string> {
  const attempt = await runGit(["rev-parse", `${startPoint}^{commit}`], repoPath);
  if (attempt.code === 0 && attempt.stdout.trim()) {
    return attempt.stdout.trim();
  }

  if (startPoint.startsWith("origin/")) {
    const localBranch = startPoint.replace(/^origin\//, "");
    const localAttempt = await runGit(["rev-parse", `${localBranch}^{commit}`], repoPath);
    if (localAttempt.code === 0 && localAttempt.stdout.trim()) {
      return localAttempt.stdout.trim();
    }
  }

  const fallback = await runGit(["rev-parse", startPoint], repoPath);
  if (fallback.code !== 0 || !fallback.stdout.trim()) {
    throw new Error(`Failed to resolve start point ${startPoint}`);
  }

  return fallback.stdout.trim();
}

async function createWorktree(
  mainRepoPath: string,
  branch: string,
  worktreePath: string,
  startPoint = "origin/main",
): Promise<void> {
  const usesLfs = await repoUsesLfs(mainRepoPath);
  const parentDir = join(worktreePath, "..");
  await mkdir(parentDir, { recursive: true });

  const env = await getGitEnv();

  if (usesLfs) {
    const lfsAvailable = await checkGitLfsAvailable(env);
    if (!lfsAvailable) {
      throw new Error(
        "This repository uses Git LFS, but git-lfs was not found. Please install git-lfs and run 'git lfs install'.",
      );
    }
  }

  const commitHash = await resolveCommitHash(mainRepoPath, startPoint);
  const result = await runGit(
    ["-C", mainRepoPath, "worktree", "add", worktreePath, "-b", branch, commitHash],
    mainRepoPath,
    env,
  );

  if (result.code !== 0) {
    const errorMessage = (result.stderr || result.stdout || "Failed to create worktree").trim();
    const lower = errorMessage.toLowerCase();

    const isLockError =
      lower.includes("could not lock") ||
      lower.includes("unable to lock") ||
      (lower.includes(".lock") && lower.includes("file exists"));

    if (isLockError) {
      throw new Error(
        "Failed to create worktree: The git repository is locked by another process. Please try again after the lock is released.",
      );
    }

    const isLfsError =
      lower.includes("git-lfs") ||
      lower.includes("filter-process") ||
      lower.includes("smudge filter") ||
      (lower.includes("lfs") && usesLfs);

    if (isLfsError) {
      throw new Error(
        "Failed to create worktree: Git LFS is required but not available. Install git-lfs and run 'git lfs install'.",
      );
    }

    throw new Error(`Failed to create worktree: ${errorMessage}`);
  }
}

export async function removeWorktree(
  mainRepoPath: string,
  worktreePath: string,
): Promise<{ success: boolean; error?: string }> {
  const env = await getGitEnv();
  const result = await runGit(
    ["-C", mainRepoPath, "worktree", "remove", worktreePath, "--force"],
    mainRepoPath,
    env,
  );

  if (result.code !== 0) {
    return { success: false, error: (result.stderr || result.stdout || "Unknown error").trim() };
  }

  return { success: true };
}

export async function getCurrentBranch(repoPath: string): Promise<string | null> {
  const result = await runGit(["rev-parse", "--abbrev-ref", "HEAD"], repoPath);
  if (result.code !== 0) return null;
  const trimmed = result.stdout.trim();
  return trimmed && trimmed !== "HEAD" ? trimmed : null;
}

export async function hasUpstream(repoPath: string): Promise<boolean> {
  const result = await runGit(["rev-parse", "--abbrev-ref", "@{upstream}"], repoPath);
  return result.code === 0 && result.stdout.trim().length > 0;
}

export async function refExistsLocally(repoPath: string, ref: string): Promise<boolean> {
  const result = await runGit(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], repoPath);
  return result.code === 0;
}

export async function getDefaultBranch(repoPath: string): Promise<string> {
  const hasRemote = await hasOriginRemote(repoPath);

  if (hasRemote) {
    const headRef = await runGit(["symbolic-ref", "refs/remotes/origin/HEAD"], repoPath);
    if (headRef.code === 0) {
      const match = headRef.stdout.trim().match(/refs\/remotes\/origin\/(.+)/);
      if (match) return match[1];
    }

    const remoteBranches = await runGit(["branch", "-r"], repoPath);
    if (remoteBranches.code === 0) {
      const branches = remoteBranches.stdout
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("origin/") && !line.includes("->"))
        .map((line) => line.replace("origin/", ""));

      for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
        if (branches.includes(candidate)) {
          return candidate;
        }
      }
    }

    const lsRemote = await runGit(["ls-remote", "--symref", "origin", "HEAD"], repoPath);
    if (lsRemote.code === 0) {
      const match = lsRemote.stdout.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
      if (match) return match[1];
    }
  } else {
    const currentBranch = await getCurrentBranch(repoPath);
    if (currentBranch) return currentBranch;

    const localBranches = await runGit(["branch", "--list"], repoPath);
    if (localBranches.code === 0) {
      const branches = localBranches.stdout
        .split("\n")
        .map((line) => line.replace(/^\*?\s*/, "").trim())
        .filter(Boolean);

      for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
        if (branches.includes(candidate)) {
          return candidate;
        }
      }

      if (branches.length > 0) {
        return branches[0]!;
      }
    }
  }

  return "main";
}

export function sanitizeGitError(message: string): string {
  return message.replace(/^fatal:\s*/i, "").replace(/^error:\s*/i, "").replace(/\n+/g, " ").trim();
}

export async function branchExistsOnRemote(
  worktreePath: string,
  branchName: string,
): Promise<BranchExistsResult> {
  try {
    const env = await getGitEnv();
    const result = await runGit(
      ["-C", worktreePath, "ls-remote", "--exit-code", "--heads", "origin", branchName],
      worktreePath,
      env,
    );

    if (result.code === 0) {
      return { status: "exists" };
    }

    if (result.code === 2) {
      return { status: "not_found" };
    }

    const message = sanitizeGitError((result.stderr || result.stdout || "").trim());
    return {
      status: "error",
      message: message || "Failed to verify branch",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to verify branch",
    };
  }
}

export async function createWorktreeForChat(
  projectPath: string,
  projectSlug: string,
  chatId: string,
  selectedBaseBranch?: string,
  branchType?: "local" | "remote",
): Promise<WorktreeResult> {
  try {
    const isRepo = await isGitRepo(projectPath);
    if (!isRepo) {
      return { success: true, worktreePath: projectPath };
    }

    const baseBranch = selectedBaseBranch || (await getDefaultBranch(projectPath));
    const branch = generateBranchName();
    const worktreesDir = join(homedir(), ".21st", "worktrees");
    const projectWorktreeDir = join(worktreesDir, projectSlug);
    const folderName = generateWorktreeFolderName(projectWorktreeDir);
    const worktreePath = join(projectWorktreeDir, folderName);

    const startPoint = branchType === "local" ? baseBranch : `origin/${baseBranch}`;
    await createWorktree(projectPath, branch, worktreePath, startPoint);

    executeWorktreeSetup(worktreePath, projectPath)
      .then((setupResult) => {
        if (!setupResult.success) {
          console.warn(
            `[worktree] Setup completed with errors: ${setupResult.errors.join(", ")}`,
          );
        } else {
          console.log(`[worktree] Setup completed successfully for ${chatId}`);
        }
      })
      .catch((setupError) => {
        console.warn(`[worktree] Setup failed: ${setupError}`);
      });

    return { success: true, worktreePath, branch, baseBranch };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWorktreeDiff(
  worktreePath: string,
  baseBranch?: string,
  options?: { onlyUncommitted?: boolean },
): Promise<{ success: boolean; diff?: string; error?: string }> {
  try {
    const status = await runGit(["status", "--porcelain"], worktreePath);
    const statusLines = status.stdout.split("\n").filter(Boolean);
    const hasChanges = statusLines.length > 0;

    if (hasChanges) {
      const exclusionArgs = [
        ":!*.lock",
        ":!*-lock.*",
        ":!package-lock.json",
        ":!pnpm-lock.yaml",
        ":!yarn.lock",
      ];

      const workingDiff = await runGit(
        ["diff", "HEAD", "--no-color", "--", ...exclusionArgs],
        worktreePath,
      );

      const untrackedFiles = statusLines
        .filter((line) => line.startsWith("?? "))
        .map((line) => line.slice(3))
        .filter((file) => {
          if (file.endsWith(".lock")) return false;
          if (file.includes("-lock.")) return false;
          if (file.endsWith("package-lock.json")) return false;
          if (file.endsWith("pnpm-lock.yaml")) return false;
          if (file.endsWith("yarn.lock")) return false;
          return true;
        });

      const devNull = process.platform === "win32" ? "NUL" : "/dev/null";
      const untrackedDiffs: string[] = [];

      for (const file of untrackedFiles) {
        const diff = await runGit(
          ["diff", "--no-color", "--no-index", devNull, file],
          worktreePath,
        );
        const text = diff.stdout || diff.stderr || "";
        if (text.includes("diff --git")) {
          untrackedDiffs.push(text.substring(text.indexOf("diff --git")));
        }
      }

      const combinedDiff = [workingDiff.stdout, untrackedDiffs.join("\n")]
        .filter(Boolean)
        .join("\n");

      return { success: true, diff: combinedDiff };
    }

    if (options?.onlyUncommitted) {
      return { success: true, diff: "" };
    }

    const targetBranch = baseBranch || (await getDefaultBranch(worktreePath));
    const baseRef = (await refExistsLocally(worktreePath, `origin/${targetBranch}`))
      ? `origin/${targetBranch}`
      : targetBranch;

    const diff = await runGit(
      [
        "diff",
        `${baseRef}...HEAD`,
        "--no-color",
        "--",
        ":!*.lock",
        ":!*-lock.*",
        ":!package-lock.json",
        ":!pnpm-lock.yaml",
        ":!yarn.lock",
      ],
      worktreePath,
    );

    return { success: true, diff: diff.stdout || "" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWorktreeStatus(
  worktreePath: string,
): Promise<{ uncommittedCount: number } | null> {
  const status = await runGit(["status", "--porcelain"], worktreePath);
  if (status.code !== 0) return null;
  const lines = status.stdout.split("\n").filter(Boolean);
  return { uncommittedCount: lines.length };
}
