import path from "path";
import type { McpServerConfig } from "./claude-config";
import { GLOBAL_MCP_PATH, getProjectMcpServers, readClaudeConfig } from "./claude-config";
import {
  ensureMcpTokensFresh,
  fetchMcpOAuthMetadata,
  fetchMcpTools,
  fetchMcpToolsStdio,
  startMcpOAuth,
} from "./mcp-auth";
import { fetchOAuthMetadata, getMcpBaseUrl } from "./oauth";

const workingMcpServers = new Map<string, boolean>();
const GLOBAL_SCOPE = "__global__";

function mcpCacheKey(scope: string | null, serverName: string): string {
  return `${scope ?? GLOBAL_SCOPE}::${serverName}`;
}

function getServerStatusFromConfig(serverConfig: McpServerConfig): string {
  const headers = serverConfig.headers as Record<string, string> | undefined;
  const { _oauth: oauth, authType } = serverConfig;

  if (authType === "none") {
    return "connected";
  }

  if (headers?.Authorization) {
    return "connected";
  }

  if (oauth?.accessToken && !headers?.Authorization) {
    return "needs-auth";
  }

  if (serverConfig.url && ["oauth", "bearer"].includes(authType ?? "")) {
    return "needs-auth";
  }

  return "connected";
}

async function fetchToolsForServer(serverConfig: McpServerConfig): Promise<string[]> {
  const timeoutMs = 2500;
  const timeoutPromise = new Promise<string[]>((resolve) =>
    setTimeout(() => resolve([]), timeoutMs),
  );

  const fetchPromise = (async () => {
    if (serverConfig.url) {
      try {
        return await fetchMcpTools(serverConfig.url, serverConfig.headers as Record<string, string>);
      } catch {
        return [];
      }
    }

    const command = (serverConfig as any).command as string | undefined;
    if (command) {
      try {
        return await fetchMcpToolsStdio({
          command,
          args: (serverConfig as any).args,
          env: (serverConfig as any).env,
        });
      } catch {
        return [];
      }
    }

    return [];
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return [];
  }
}

export async function getAllMcpConfigHandler() {
  try {
    const totalStart = Date.now();
    workingMcpServers.clear();

    const config = await readClaudeConfig();

    const convertServers = async (
      servers: Record<string, McpServerConfig> | undefined,
      scope: string | null,
    ) => {
      if (!servers) return [];

      const results = await Promise.all(
        Object.entries(servers).map(async ([name, serverConfig]) => {
          const configObj = serverConfig as Record<string, unknown>;
          let status = getServerStatusFromConfig(serverConfig);
          const headers = serverConfig.headers as Record<string, string> | undefined;

          let tools: string[] = [];
          let needsAuth = false;

          try {
            tools = await fetchToolsForServer(serverConfig);
          } catch (error) {
            console.error(`[MCP] Failed to fetch tools for ${name}:`, error);
          }

          const cacheKey = mcpCacheKey(scope, name);
          if (tools.length > 0) {
            status = "connected";
            workingMcpServers.set(cacheKey, true);
          } else {
            workingMcpServers.set(cacheKey, false);
            if (serverConfig.url) {
              try {
                const baseUrl = getMcpBaseUrl(serverConfig.url);
                const metadata = await fetchOAuthMetadata(baseUrl);
                needsAuth = !!metadata && !!metadata.authorization_endpoint;
              } catch {
                // ignore
              }
            } else if (serverConfig.authType === "oauth" || serverConfig.authType === "bearer") {
              needsAuth = true;
            }

            if (needsAuth && !headers?.Authorization) {
              status = "needs-auth";
            }
          }

          return { name, status, tools, needsAuth, config: configObj };
        }),
      );

      return results;
    };

    const groupTasks: Array<{
      groupName: string;
      projectPath: string | null;
      promise: Promise<{
        mcpServers: Array<{
          name: string;
          status: string;
          tools: string[];
          needsAuth: boolean;
          config: Record<string, unknown>;
        }>;
        duration: number;
      }>;
    }> = [];

    if (config.mcpServers) {
      groupTasks.push({
        groupName: "Global",
        projectPath: null,
        promise: (async () => {
          const start = Date.now();
          const freshServers = await ensureMcpTokensFresh(config.mcpServers!, GLOBAL_MCP_PATH);
          const mcpServers = await convertServers(freshServers, null);
          return { mcpServers, duration: Date.now() - start };
        })(),
      });
    } else {
      groupTasks.push({
        groupName: "Global",
        projectPath: null,
        promise: Promise.resolve({ mcpServers: [], duration: 0 }),
      });
    }

    if (config.projects) {
      for (const [projectPath, projectConfig] of Object.entries(config.projects)) {
        if (projectConfig.mcpServers && Object.keys(projectConfig.mcpServers).length > 0) {
          const groupName = path.basename(projectPath) || projectPath;
          groupTasks.push({
            groupName,
            projectPath,
            promise: (async () => {
              const start = Date.now();
              const freshServers = await ensureMcpTokensFresh(projectConfig.mcpServers!, projectPath);
              const mcpServers = await convertServers(freshServers, projectPath);
              return { mcpServers, duration: Date.now() - start };
            })(),
          });
        }
      }
    }

    const results = await Promise.all(groupTasks.map((t) => t.promise));

    const groupsWithTiming = groupTasks.map((task, i) => ({
      groupName: task.groupName,
      projectPath: task.projectPath,
      mcpServers: results[i].mcpServers,
      duration: results[i].duration,
    }));

    const totalDuration = Date.now() - totalStart;
    const workingCount = [...workingMcpServers.values()].filter((v) => v).length;
    const sortedByDuration = [...groupsWithTiming].sort((a, b) => b.duration - a.duration);

    console.log(`[MCP] Cache updated in ${totalDuration}ms. Working: ${workingCount}/${workingMcpServers.size}`);
    for (const g of sortedByDuration) {
      if (g.mcpServers.length > 0) {
        console.log(`[MCP]   ${g.groupName}: ${g.duration}ms (${g.mcpServers.length} servers)`);
      }
    }

    const groups = groupsWithTiming.map(({ groupName, projectPath, mcpServers }) => ({
      groupName,
      projectPath,
      mcpServers,
    }));

    return { groups };
  } catch (error) {
    console.error("[getAllMcpConfig] Error:", error);
    return { groups: [], error: String(error) };
  }
}

export function createClaudeHandlers() {
  return {
    claudeGetMcpConfig: async ({ projectPath }: { projectPath: string }) => {
      try {
        const config = await readClaudeConfig();
        const projectMcpServers = await getProjectMcpServers(config, projectPath);

        if (!projectMcpServers) {
          return { mcpServers: [], projectPath };
        }

        const mcpServers = Object.entries(projectMcpServers).map(([name, serverConfig]) => {
          const configObj = serverConfig as Record<string, unknown>;
          const status = getServerStatusFromConfig(serverConfig);
          const hasUrl = !!configObj.url;
          return { name, status, config: { ...configObj, _hasUrl: hasUrl } };
        });

        return { mcpServers, projectPath };
      } catch (error) {
        console.error("[getMcpConfig] Error reading config:", error);
        return { mcpServers: [], projectPath, error: String(error) };
      }
    },

    claudeGetAllMcpConfig: async () => getAllMcpConfigHandler(),

    claudeStartMcpOAuth: async ({ serverName, projectPath }: { serverName: string; projectPath: string }) => {
      return startMcpOAuth(serverName, projectPath);
    },

    claudeFetchMcpOAuthMetadata: async ({
      serverName,
      projectPath,
    }: {
      serverName: string;
      projectPath: string;
    }) => {
      const metadata = await fetchMcpOAuthMetadata(serverName, projectPath);
      return { metadata: metadata ?? null };
    },
  };
}
