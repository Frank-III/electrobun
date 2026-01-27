import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { runCommand } from "./shell-env";
import { getShellEnvironment } from "./shell-env";

const APPLY_RETRIES = 3;
const APPLY_RETRY_DELAY_MS = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type CheckpointPayload = {
  sdkMessageUuid: string;
  indexTree: string;
  worktreeTree: string;
};

async function getGitEnv(): Promise<Record<string, string>> {
  const shellEnv = await getShellEnvironment();
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  for (const [key, value] of Object.entries(shellEnv)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  if (shellEnv.PATH) {
    env.PATH = shellEnv.PATH;
  }
  return env;
}

async function runGit(
  args: string[],
  cwd: string,
  envOverride?: Record<string, string>,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const env = envOverride ? { ...(await getGitEnv()), ...envOverride } : await getGitEnv();
  return runCommand("git", args, { cwd, env });
}

export async function createRollbackStash(cwd: string, sdkMessageUuid: string): Promise<void> {
  try {
    const indexTreeRaw = await runGit(["write-tree"], cwd);
    const indexTree = indexTreeRaw.stdout.trim();
    if (!indexTree) {
      return;
    }

    let worktreeTree = "";
    let tempDir: string | undefined;
    try {
      tempDir = await mkdtemp(join(tmpdir(), "checkpoint-index-"));
      const tempIndexPath = join(tempDir, "index");
      const env = { ...(await getGitEnv()), GIT_INDEX_FILE: tempIndexPath };
      await runGit(["add", "-A"], cwd, env);
      const treeRaw = await runGit(["write-tree"], cwd, env);
      worktreeTree = treeRaw.stdout.trim();
    } finally {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    }

    if (!worktreeTree) {
      return;
    }

    const checkpointPayload: CheckpointPayload = {
      sdkMessageUuid,
      indexTree,
      worktreeTree,
    };

    const commitRaw = await runGit(
      [
        "-c",
        "user.name=Checkpoint",
        "-c",
        "user.email=checkpoint@local",
        "commit-tree",
        worktreeTree,
        "-m",
        JSON.stringify(checkpointPayload),
      ],
      cwd,
    );
    const commitHash = commitRaw.stdout.trim();
    if (!commitHash) {
      return;
    }

    await runGit(["update-ref", `refs/checkpoints/${sdkMessageUuid}`, commitHash], cwd);
  } catch (error) {
    console.error("[claude] Failed to create rollback checkpoint:", error);
  }
}

function parseCheckpointTrees(message: string): { indexTree: string | null; worktreeTree: string | null } {
  const body = message.trim();
  if (body) {
    try {
      const parsed = JSON.parse(body) as CheckpointPayload;
      if (parsed.indexTree && parsed.worktreeTree) {
        return {
          indexTree: parsed.indexTree,
          worktreeTree: parsed.worktreeTree,
        };
      }
    } catch {
      // ignore
    }
  }

  return { indexTree: null, worktreeTree: null };
}

export async function applyRollbackStash(worktreePath: string, sdkMessageUuid: string): Promise<boolean> {
  try {
    const ref = `refs/checkpoints/${sdkMessageUuid}`;
    const commitResult = await runGit(["rev-parse", ref], worktreePath);
    const commitHash = commitResult.stdout.trim();
    if (!commitHash) {
      return true;
    }

    const commitMessageResult = await runGit(["show", "-s", "--format=%B", commitHash], worktreePath);
    const { indexTree, worktreeTree } = parseCheckpointTrees(commitMessageResult.stdout);

    if (!indexTree || !worktreeTree) {
      console.error(
        `[claude] Rollback checkpoint missing tree metadata for sdkMessageUuid=${sdkMessageUuid}`,
      );
      return false;
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= APPLY_RETRIES; attempt += 1) {
      try {
        await runGit(["read-tree", worktreeTree], worktreePath);
        await runGit(["checkout-index", "-a", "-f"], worktreePath);
        await runGit(["clean", "-fd"], worktreePath);
        await runGit(["read-tree", indexTree], worktreePath);
        return true;
      } catch (error) {
        lastError = error;
        if (attempt < APPLY_RETRIES) {
          await sleep(APPLY_RETRY_DELAY_MS);
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("[claude] Failed to apply rollback checkpoint:", error);
    return false;
  }
}
