import { eq } from "drizzle-orm";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { getDatabase } from "./db";
import { chats, projects } from "./db/schema";

let configLock: Promise<void> = Promise.resolve();

export const CLAUDE_CONFIG_PATH = path.join(os.homedir(), ".claude.json");

export interface McpServerConfig {
  command?: string;
  args?: string[];
  url?: string;
  authType?: "oauth" | "bearer" | "none";
  _oauth?: {
    accessToken: string;
    refreshToken?: string;
    clientId?: string;
    expiresAt?: number;
  };
  [key: string]: unknown;
}

export interface ProjectConfig {
  mcpServers?: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

export interface ClaudeConfig {
  mcpServers?: Record<string, McpServerConfig>;
  projects?: Record<string, ProjectConfig>;
  [key: string]: unknown;
}

export async function readClaudeConfig(): Promise<ClaudeConfig> {
  try {
    const content = await fs.readFile(CLAUDE_CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export function readClaudeConfigSync(): ClaudeConfig {
  try {
    const content = readFileSync(CLAUDE_CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function writeClaudeConfig(config: ClaudeConfig): Promise<void> {
  await fs.writeFile(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function writeClaudeConfigSync(config: ClaudeConfig): void {
  writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function updateClaudeConfigAtomic(
  updater: (config: ClaudeConfig) => ClaudeConfig | Promise<ClaudeConfig>,
): Promise<ClaudeConfig> {
  let release!: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  const prev = configLock;
  configLock = next;
  await prev;

  try {
    const config = await readClaudeConfig();
    const updatedConfig = await updater(config);
    await writeClaudeConfig(updatedConfig);
    return updatedConfig;
  } finally {
    release();
  }
}

export function claudeConfigExists(): boolean {
  return existsSync(CLAUDE_CONFIG_PATH);
}

export const GLOBAL_MCP_PATH = "__global__";

export async function getProjectMcpServers(
  config: ClaudeConfig,
  projectPath: string,
): Promise<Record<string, McpServerConfig> | undefined> {
  const resolvedPath = (await resolveProjectPathFromWorktree(projectPath)) || projectPath;
  return config.projects?.[resolvedPath]?.mcpServers;
}

export async function getMcpServerConfig(
  config: ClaudeConfig,
  projectPath: string | null,
  serverName: string,
): Promise<McpServerConfig | undefined> {
  if (!projectPath || projectPath === GLOBAL_MCP_PATH) {
    return config.mcpServers?.[serverName];
  }
  const resolvedPath = (await resolveProjectPathFromWorktree(projectPath)) || projectPath;
  return config.projects?.[resolvedPath]?.mcpServers?.[serverName];
}

export async function updateMcpServerConfig(
  config: ClaudeConfig,
  projectPath: string | null,
  serverName: string,
  update: Partial<McpServerConfig>,
): Promise<ClaudeConfig> {
  if (!projectPath || projectPath === GLOBAL_MCP_PATH) {
    config.mcpServers = config.mcpServers || {};
    config.mcpServers[serverName] = {
      ...config.mcpServers[serverName],
      ...update,
    };
    return config;
  }
  const resolvedPath = (await resolveProjectPathFromWorktree(projectPath)) || projectPath;
  config.projects = config.projects || {};
  config.projects[resolvedPath] = config.projects[resolvedPath] || {};
  config.projects[resolvedPath].mcpServers = config.projects[resolvedPath].mcpServers || {};
  config.projects[resolvedPath].mcpServers[serverName] = {
    ...config.projects[resolvedPath].mcpServers[serverName],
    ...update,
  };
  return config;
}

export async function resolveProjectPathFromWorktree(pathToResolve: string): Promise<string | null> {
  const worktreeMarker = path.join(".21st", "worktrees");
  const normalizedPath = pathToResolve.replace(/\\/g, "/");
  const normalizedMarker = worktreeMarker.replace(/\\/g, "/");

  if (!normalizedPath.includes(normalizedMarker)) {
    return pathToResolve;
  }

  try {
    const worktreeBase = path.join(os.homedir(), ".21st", "worktrees");
    const normalizedBase = worktreeBase.replace(/\\/g, "/");
    const relativePath = normalizedPath.replace(normalizedBase, "").replace(/^\//, "");
    const parts = relativePath.split("/");
    if (parts.length < 1 || !parts[0]) {
      return null;
    }

    const db = await getDatabase();

    const projectById = db
      .select({ path: projects.path })
      .from(projects)
      .where(eq(projects.id, parts[0]))
      .get();

    if (projectById) {
      return projectById.path;
    }

    if (parts.length >= 2) {
      const expectedWorktreePath = path.join(worktreeBase, parts[0], parts[1]);
      const chat = db
        .select({ projectId: chats.projectId })
        .from(chats)
        .where(eq(chats.worktreePath, expectedWorktreePath))
        .get();

      if (chat) {
        const project = db
          .select({ path: projects.path })
          .from(projects)
          .where(eq(projects.id, chat.projectId))
          .get();

        if (project) {
          return project.path;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("[worktree-utils] Failed to resolve project path:", error);
    return null;
  }
}
