import { access, mkdir } from "fs/promises";
import { dirname, isAbsolute, join } from "path";

export interface WorktreeConfig {
  "setup-worktree-unix"?: string[] | string;
  "setup-worktree-windows"?: string[] | string;
  "setup-worktree"?: string[] | string;
}

export type WorktreeConfigSource = "custom" | "cursor" | "1code" | null;

export interface DetectedWorktreeConfig {
  config: WorktreeConfig | null;
  path: string | null;
  source: WorktreeConfigSource;
}

const CURSOR_CONFIG_PATH = ".cursor/worktrees.json";
const ONECODE_CONFIG_PATH = ".1code/worktree.json";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await Bun.file(filePath).text();
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function detectWorktreeConfig(
  projectPath: string,
  customPath?: string,
): Promise<DetectedWorktreeConfig> {
  if (customPath) {
    const fullPath = isAbsolute(customPath)
      ? customPath
      : join(projectPath, customPath);
    const config = await readJsonFile<WorktreeConfig>(fullPath);
    if (config) {
      return { config, path: fullPath, source: "custom" };
    }
  }

  const cursorPath = join(projectPath, CURSOR_CONFIG_PATH);
  if (await fileExists(cursorPath)) {
    const config = await readJsonFile<WorktreeConfig>(cursorPath);
    if (config) {
      return { config, path: cursorPath, source: "cursor" };
    }
  }

  const onecodePath = join(projectPath, ONECODE_CONFIG_PATH);
  if (await fileExists(onecodePath)) {
    const config = await readJsonFile<WorktreeConfig>(onecodePath);
    if (config) {
      return { config, path: onecodePath, source: "1code" };
    }
  }

  return { config: null, path: null, source: null };
}

export async function getAvailableConfigPaths(projectPath: string) {
  const cursorPath = join(projectPath, CURSOR_CONFIG_PATH);
  const onecodePath = join(projectPath, ONECODE_CONFIG_PATH);

  return {
    cursor: {
      exists: await fileExists(cursorPath),
      path: cursorPath,
    },
    onecode: {
      exists: await fileExists(onecodePath),
      path: onecodePath,
    },
  };
}

export async function saveWorktreeConfig(
  projectPath: string,
  config: WorktreeConfig,
  target: "cursor" | "1code" | string = "1code",
): Promise<{ success: boolean; path: string; error?: string }> {
  let targetPath: string;

  if (target === "cursor") {
    targetPath = join(projectPath, CURSOR_CONFIG_PATH);
  } else if (target === "1code") {
    targetPath = join(projectPath, ONECODE_CONFIG_PATH);
  } else {
    targetPath = isAbsolute(target) ? target : join(projectPath, target);
  }

  try {
    await mkdir(dirname(targetPath), { recursive: true });
    const content = JSON.stringify(config, null, 2);
    await Bun.write(targetPath, content);
    return { success: true, path: targetPath };
  } catch (error) {
    return {
      success: false,
      path: targetPath,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
