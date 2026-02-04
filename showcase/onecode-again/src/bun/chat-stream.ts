/**
 * Chat streaming handler for Claude Agent SDK
 * Ported from legacy tRPC claude router to Electrobun RPC
 */
import { eq } from "drizzle-orm";
import * as fs from "fs/promises";
import * as os from "os";
import path from "path";
import type { ChatRequests, CustomClaudeConfig, ImageAttachment, ToolInput, UIMessageChunk, UserQuestionResult } from "../shared/chat-rpc";
import { getClaudeShellEnvironment } from "./claude-env";
import { getProjectMcpServers, GLOBAL_MCP_PATH, readClaudeConfig, resolveProjectPathFromWorktree, type McpServerConfig } from "./claude-config";
import { getDatabase, subChats } from "./db";

// Dynamic import for ESM module - CACHED
let cachedClaudeQuery: typeof import("@anthropic-ai/claude-agent-sdk").query | null = null;
const getClaudeQuery = async () => {
  if (cachedClaudeQuery) {
    return cachedClaudeQuery;
  }
  const sdk = await import("@anthropic-ai/claude-agent-sdk");
  cachedClaudeQuery = sdk.query;
  return cachedClaudeQuery;
};

// Active sessions for cancellation
const activeSessions = new Map<string, AbortController>();

// In-memory cache of working MCP server names
const workingMcpServers = new Map<string, boolean>();
const GLOBAL_SCOPE = "__global__";

function mcpCacheKey(scope: string | null, serverName: string): string {
  return `${scope ?? GLOBAL_SCOPE}::${serverName}`;
}

// Cache for symlinks
const symlinksCreated = new Set<string>();

// Cache for MCP config
type McpConfigEntry = { command: string; args?: string[]; env?: Record<string, string> };
const mcpConfigCache = new Map<string, { config: Record<string, McpConfigEntry>; mtime: number }>();

// Pending tool approvals
export const pendingToolApprovals = new Map<
  string,
  {
    subChatId: string;
    resolve: (decision: { approved: boolean; message?: string; updatedInput?: ToolInput }) => void;
  }
>();

const PLAN_MODE_BLOCKED_TOOLS = new Set(["Bash", "NotebookEdit"]);

function parseMentions(prompt: string): {
  cleanedPrompt: string;
  agentMentions: string[];
  skillMentions: string[];
  fileMentions: string[];
  folderMentions: string[];
  toolMentions: string[];
} {
  const agentMentions: string[] = [];
  const skillMentions: string[] = [];
  const fileMentions: string[] = [];
  const folderMentions: string[] = [];
  const toolMentions: string[] = [];

  const mentionRegex = /@\[(file|folder|skill|agent|tool):([^\]]+)\]/g;
  let match;

  while ((match = mentionRegex.exec(prompt)) !== null) {
    const [, type, name] = match;
    switch (type) {
      case "agent":
        agentMentions.push(name);
        break;
      case "skill":
        skillMentions.push(name);
        break;
      case "file":
        fileMentions.push(name);
        break;
      case "folder":
        folderMentions.push(name);
        break;
      case "tool":
        if (/^[a-zA-Z0-9_-]+$/.test(name)) {
          toolMentions.push(name);
        }
        break;
    }
  }

  let cleanedPrompt = prompt
    .replace(/@\[agent:[^\]]+\]/g, "")
    .replace(/@\[skill:[^\]]+\]/g, "")
    .replace(/@\[tool:[^\]]+\]/g, "")
    .trim();

  cleanedPrompt = cleanedPrompt
    .replace(/@\[file:local:([^\]]+)\]/g, "$1")
    .replace(/@\[file:external:([^\]]+)\]/g, "$1")
    .replace(/@\[folder:local:([^\]]+)\]/g, "$1")
    .replace(/@\[folder:external:([^\]]+)\]/g, "$1");

  if (toolMentions.length > 0) {
    const toolHints = toolMentions.map((t) => `Use the ${t} tool for this request.`).join(" ");
    cleanedPrompt = `${toolHints}\n\n${cleanedPrompt}`;
  }

  return { cleanedPrompt, agentMentions, skillMentions, fileMentions, folderMentions, toolMentions };
}

type EmitFn = (chunk: UIMessageChunk) => void;

export function createChatStreamHandlers(
  emitChunk: (subChatId: string, chunk: UIMessageChunk) => void,
) {
  return {
    chatStart: async (params: ChatRequests["chatStart"]["params"]): Promise<{ streamId: string }> => {
      const {
        subChatId,
        chatId,
        prompt,
        cwd,
        projectPath,
        mode,
        model,
        images,
        historyEnabled = false,
        customConfig,
        selectedOllamaModel,
        offlineModeEnabled = false,
        enableTasks = true,
      } = params;

      // Abort any existing session for this subChatId
      const existingController = activeSessions.get(subChatId);
      if (existingController) {
        existingController.abort();
      }

      const abortController = new AbortController();
      const streamId = crypto.randomUUID();
      activeSessions.set(subChatId, abortController);

      const emit: EmitFn = (chunk) => emitChunk(subChatId, chunk);

      // Run the streaming in background
      runChatStream({
        subChatId,
        chatId,
        prompt,
        cwd,
        projectPath,
        mode,
        model,
        images,
        historyEnabled,
        customConfig,
        selectedOllamaModel,
        offlineModeEnabled,
        enableTasks,
        abortController,
        streamId,
        emit,
      }).catch((error) => {
        console.error("[chat-stream] Error:", error);
        emit({ type: "error", errorText: error.message });
        emit({ type: "finish" });
      });

      return { streamId };
    },

    chatStop: async (params: { subChatId: string }): Promise<{ ok: boolean }> => {
      const controller = activeSessions.get(params.subChatId);
      if (controller) {
        controller.abort();
        activeSessions.delete(params.subChatId);
        return { ok: true };
      }
      return { ok: false };
    },

    chatRespondToolApproval: async (params: {
      toolUseId: string;
      approved: boolean;
      message?: string;
      updatedInput?: ToolInput;
    }): Promise<{ ok: boolean }> => {
      const pending = pendingToolApprovals.get(params.toolUseId);
      if (!pending) return { ok: false };
      pending.resolve({
        approved: params.approved,
        message: params.message,
        updatedInput: params.updatedInput,
      });
      pendingToolApprovals.delete(params.toolUseId);
      return { ok: true };
    },

    chatRespondUserQuestion: async (params: {
      toolUseId: string;
      answers: Array<{ question: string; answer: string | string[] }>;
    }): Promise<{ ok: boolean }> => {
      const pending = pendingToolApprovals.get(params.toolUseId);
      if (!pending) return { ok: false };
      pending.resolve({
        approved: true,
        updatedInput: { answers: params.answers },
      });
      pendingToolApprovals.delete(params.toolUseId);
      return { ok: true };
    },
  };
}

async function runChatStream(options: {
  subChatId: string;
  chatId: string;
  prompt: string;
  cwd: string;
  projectPath?: string;
  mode: "plan" | "agent";
  model?: string;
  images?: ImageAttachment[];
  historyEnabled: boolean;
  customConfig?: CustomClaudeConfig;
  selectedOllamaModel?: string;
  offlineModeEnabled: boolean;
  enableTasks: boolean;
  abortController: AbortController;
  streamId: string;
  emit: EmitFn;
}) {
  const {
    subChatId,
    chatId,
    prompt,
    cwd,
    projectPath,
    mode,
    model,
    images,
    historyEnabled,
    customConfig,
    offlineModeEnabled,
    enableTasks,
    abortController,
    streamId,
    emit,
  } = options;

  const safeEmit = (chunk: UIMessageChunk) => {
    if (abortController.signal.aborted) return false;
    try {
      emit(chunk);
      return true;
    } catch {
      return false;
    }
  };

  try {
    const db = await getDatabase();

    // Get existing messages from DB
    const existing = db.select().from(subChats).where(eq(subChats.id, subChatId)).get();
    const existingMessages = JSON.parse(existing?.messages || "[]");
    const existingSessionId = existing?.sessionId || null;

    // Get resumeSessionAt UUID
    const lastAssistantMsg = [...existingMessages].reverse().find((m: { role: string }) => m.role === "assistant");
    const resumeAtUuid = lastAssistantMsg?.metadata?.shouldResume ? lastAssistantMsg?.metadata?.sdkMessageUuid || null : null;

    // Check for duplicate message
    const lastMsg = existingMessages[existingMessages.length - 1];
    const isDuplicate = lastMsg?.role === "user" && lastMsg?.parts?.[0]?.text === prompt;

    // Create user message
    type ChatMessage = { id: string; role: string; parts: { type: string; text: string }[]; metadata?: { shouldResume?: boolean; sdkMessageUuid?: string } };
    let userMessage: ChatMessage;
    let messagesToSave: ChatMessage[];

    if (isDuplicate) {
      userMessage = lastMsg;
      messagesToSave = existingMessages;
    } else {
      userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: prompt }],
      };
      messagesToSave = [...existingMessages, userMessage];

      db.update(subChats)
        .set({
          messages: JSON.stringify(messagesToSave),
          streamId,
          updatedAt: new Date(),
        })
        .where(eq(subChats.id, subChatId))
        .run();
    }

    // Check for API key
    if (!customConfig) {
      const shellEnv = await getClaudeShellEnvironment();
      if (!shellEnv.ANTHROPIC_API_KEY) {
        safeEmit({ type: "error", errorText: "No ANTHROPIC_API_KEY found in environment. Please set it in your shell configuration." });
        safeEmit({ type: "finish" });
        return;
      }
    }

    // Get Claude SDK
    let claudeQuery;
    try {
      claudeQuery = await getClaudeQuery();
    } catch (sdkError) {
      safeEmit({ type: "error", errorText: `Failed to load Claude SDK: ${sdkError}` });
      safeEmit({ type: "finish" });
      return;
    }

    // Parse mentions
    const { cleanedPrompt, agentMentions, skillMentions } = parseMentions(prompt);

    // Build final prompt
    let finalPrompt = cleanedPrompt;
    if (!finalPrompt.trim()) {
      if (agentMentions.length > 0 && skillMentions.length > 0) {
        finalPrompt = `Use the ${agentMentions.join(", ")} agent(s) and invoke the "${skillMentions.join('", "')}" skill(s).`;
      } else if (agentMentions.length > 0) {
        finalPrompt = `Use the ${agentMentions.join(", ")} agent(s) for this task.`;
      } else if (skillMentions.length > 0) {
        finalPrompt = `Invoke the "${skillMentions.join('", "')}" skill(s) for this task.`;
      }
    } else if (skillMentions.length > 0) {
      finalPrompt = `${finalPrompt}\n\nUse the "${skillMentions.join('", "')}" skill(s) for this task.`;
    }

    // Build prompt with images if present
    type ImageContent = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
    type TextContent = { type: "text"; text: string };
    type MessageContent = ImageContent | TextContent;
    type UserPromptMessage = { type: "user"; message: { role: "user"; content: MessageContent[] }; parent_tool_use_id: null };
    
    let queryPrompt: string | AsyncIterable<UserPromptMessage> = finalPrompt;
    if (images && images.length > 0) {
      const messageContent: MessageContent[] = [
        ...images.map((img) => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: img.mediaType,
            data: img.base64Data,
          },
        })),
      ];

      if (finalPrompt.trim()) {
        messageContent.push({ type: "text" as const, text: finalPrompt });
      }

      async function* createPromptWithImages(): AsyncGenerator<UserPromptMessage> {
        yield {
          type: "user" as const,
          message: { role: "user" as const, content: messageContent },
          parent_tool_use_id: null,
        };
      }

      queryPrompt = createPromptWithImages();
    }

    // Build Claude environment
    const shellEnv = await getClaudeShellEnvironment();
    const claudeEnv: Record<string, string> = {
      ...process.env as Record<string, string>,
      ...shellEnv,
    };

    if (customConfig) {
      claudeEnv.ANTHROPIC_API_KEY = customConfig.token;
      if (customConfig.baseUrl) {
        claudeEnv.ANTHROPIC_BASE_URL = customConfig.baseUrl;
      }
    }

    // Create isolated config directory
    const userDataPath = process.env.ELECTROBUN_APP_DATA_DIR || os.homedir();
    const isolatedConfigDir = path.join(userDataPath, "claude-sessions", subChatId);

    try {
      await fs.mkdir(isolatedConfigDir, { recursive: true });

      // Symlink skills/agents from ~/.claude/
      if (!symlinksCreated.has(subChatId)) {
        const homeClaudeDir = path.join(os.homedir(), ".claude");
        const skillsSource = path.join(homeClaudeDir, "skills");
        const skillsTarget = path.join(isolatedConfigDir, "skills");
        const agentsSource = path.join(homeClaudeDir, "agents");
        const agentsTarget = path.join(isolatedConfigDir, "agents");

        try {
          const skillsSourceExists = await fs.stat(skillsSource).then(() => true).catch(() => false);
          const skillsTargetExists = await fs.lstat(skillsTarget).then(() => true).catch(() => false);
          if (skillsSourceExists && !skillsTargetExists) {
            await fs.symlink(skillsSource, skillsTarget, "dir");
          }
        } catch { /* ignore */ }

        try {
          const agentsSourceExists = await fs.stat(agentsSource).then(() => true).catch(() => false);
          const agentsTargetExists = await fs.lstat(agentsTarget).then(() => true).catch(() => false);
          if (agentsSourceExists && !agentsTargetExists) {
            await fs.symlink(agentsSource, agentsTarget, "dir");
          }
        } catch { /* ignore */ }

        symlinksCreated.add(subChatId);
      }
    } catch (err) {
      console.error("[chat-stream] Failed to setup isolated config dir:", err);
    }

    // Read MCP servers
    type McpServerSdkConfig = { command: string; args?: string[]; env?: Record<string, string> };
    let mcpServersForSdk: Record<string, McpServerSdkConfig> | undefined;
    try {
      const config = await readClaudeConfig();
      const lookupPath = projectPath || cwd;
      const globalServers = config.mcpServers || {};
      const projectServers = (await getProjectMcpServers(config, lookupPath)) || {};
      const allServers = { ...globalServers, ...projectServers };

      if (Object.keys(allServers).length > 0) {
        // Filter to only servers with command (required by SDK) and cast to SDK type
        const commandServers: Record<string, McpServerSdkConfig> = {};
        for (const [name, server] of Object.entries(allServers)) {
          if (server.command) {
            commandServers[name] = {
              command: server.command,
              args: server.args,
              env: server.env as Record<string, string> | undefined,
            };
          }
        }
        if (Object.keys(commandServers).length > 0) {
          mcpServersForSdk = commandServers;
        }
      }
    } catch (err) {
      console.error("[chat-stream] Failed to read MCP config:", err);
    }

    claudeEnv.CLAUDE_CONFIG_DIR = isolatedConfigDir;

    const resumeSessionId = existingSessionId || undefined;

    // Read AGENTS.md from project root if it exists
    let agentsMdContent: string | undefined;
    try {
      const lookupPath = projectPath || cwd;
      const agentsMdPath = path.join(lookupPath, "AGENTS.md");
      agentsMdContent = await fs.readFile(agentsMdPath, "utf-8");
      if (agentsMdContent.trim()) {
        console.log(`[chat-stream] Found AGENTS.md at ${agentsMdPath} (${agentsMdContent.length} chars)`);
      } else {
        agentsMdContent = undefined;
      }
    } catch {
      // AGENTS.md doesn't exist or can't be read - that's fine
    }

    // System prompt config - if AGENTS.md exists, append its content
    const systemPromptConfig = agentsMdContent
      ? {
          type: "preset" as const,
          preset: "claude_code" as const,
          append: `\n\n# AGENTS.md\nThe following are the project's AGENTS.md instructions:\n\n${agentsMdContent}`,
        }
      : {
          type: "preset" as const,
          preset: "claude_code" as const,
        };

    // Accumulation state - parts and metadata are typed for SDK message processing
    type ResponsePart = { type: string; text?: string; toolCallId?: string; toolName?: string };
    const parts: ResponsePart[] = [];
    let currentText = "";
    
    type StreamMetadata = {
      sessionId?: string;
      inputTokens?: number;
      outputTokens?: number;
      totalCostUsd?: number;
      durationMs?: number;
    };
    const metadata: StreamMetadata = {};

    // Run the query
    console.log(`[chat-stream] Starting query for ${subChatId} mode=${mode}`);

    // Use type assertion for SDK compatibility - the SDK types are complex and the runtime behavior is correct
    const queryResult = claudeQuery({
      prompt: queryPrompt as Parameters<typeof claudeQuery>[0]["prompt"],
      options: {
        abortController,
        cwd,
        systemPrompt: systemPromptConfig,
        ...(mcpServersForSdk && Object.keys(mcpServersForSdk).length > 0 && { mcpServers: mcpServersForSdk }),
        env: claudeEnv,
        permissionMode: mode === "plan" ? ("plan" as const) : ("bypassPermissions" as const),
        ...(mode !== "plan" && { allowDangerouslySkipPermissions: true }),
        includePartialMessages: true,
        settingSources: ["project" as const, "user" as const],
        canUseTool: async (
          toolName: string,
          toolInput: ToolInput,
          opts: { signal: AbortSignal; toolUseID: string },
        ): Promise<{ behavior: "allow"; updatedInput?: ToolInput } | { behavior: "deny"; message: string }> => {
          if (mode === "plan") {
            if (toolName === "Edit" || toolName === "Write") {
              const filePath = typeof toolInput.file_path === "string" ? toolInput.file_path : "";
              if (!/\.md$/i.test(filePath)) {
                return { behavior: "deny", message: 'Only ".md" files can be modified in plan mode.' };
              }
            } else if (PLAN_MODE_BLOCKED_TOOLS.has(toolName)) {
              return { behavior: "deny", message: `Tool "${toolName}" blocked in plan mode.` };
            }
          }

          if (toolName === "AskUserQuestion") {
            const { toolUseID } = opts;
            type AskUserQuestionInput = { questions: Array<{ question: string; header: string; options: Array<{ label: string; description: string }>; multiSelect: boolean }> };
            safeEmit({
              type: "ask-user-question",
              toolUseId: toolUseID,
              questions: (toolInput as AskUserQuestionInput).questions,
            });

            const response = await new Promise<{ approved: boolean; message?: string; updatedInput?: ToolInput }>((resolve) => {
              const timeoutId = setTimeout(() => {
                pendingToolApprovals.delete(toolUseID);
                safeEmit({ type: "ask-user-question-timeout", toolUseId: toolUseID });
                resolve({ approved: false, message: "Timed out" });
              }, 60000);

              pendingToolApprovals.set(toolUseID, {
                subChatId,
                resolve: (d) => {
                  clearTimeout(timeoutId);
                  resolve(d);
                },
              });
            });

            if (!response.approved) {
              safeEmit({ type: "ask-user-question-result", toolUseId: toolUseID, result: response.message || "Skipped" });
              return { behavior: "deny", message: response.message || "Skipped" };
            }

            const resultPayload: UserQuestionResult = response.updatedInput ? { answers: (response.updatedInput as { answers: Array<{ question: string; answer: string | string[] }> }).answers } : "Approved";
            safeEmit({ type: "ask-user-question-result", toolUseId: toolUseID, result: resultPayload });
            return { behavior: "allow", updatedInput: response.updatedInput };
          }

          return { behavior: "allow", updatedInput: toolInput };
        },
        stderr: (data: string) => {
          console.error("[claude stderr]", data);
        },
        ...(resumeSessionId && {
          resume: resumeSessionId,
          ...(resumeAtUuid ? { resumeSessionAt: resumeAtUuid } : { continue: true }),
        }),
        ...(!resumeSessionId && { continue: true }),
        ...(model && { model }),
      } as Parameters<typeof claudeQuery>[0]["options"],
    });

    // Emit start
    safeEmit({ type: "start", messageId: crypto.randomUUID() });

    // Process the stream
    for await (const message of queryResult) {
      if (abortController.signal.aborted) {
        break;
      }

      // Transform SDK messages to UI chunks
      const msgType = (message as { type: string }).type;

      switch (msgType) {
        case "assistant":
          // Text content
          const textContent = (message as { message?: { content?: Array<{ type: string; text?: string }> } }).message?.content;
          if (textContent) {
            for (const block of textContent) {
              if (block.type === "text" && block.text) {
                const textId = crypto.randomUUID();
                safeEmit({ type: "text-start", id: textId });
                safeEmit({ type: "text-delta", id: textId, delta: block.text });
                safeEmit({ type: "text-end", id: textId });
                currentText += block.text;
              }
            }
          }
          break;

        case "result":
          // Extract metadata
          const result = message as {
            result?: string;
            session_id?: string;
            input_tokens?: number;
            output_tokens?: number;
            cost_usd?: number;
            duration_ms?: number;
          };
          metadata.sessionId = result.session_id;
          metadata.inputTokens = result.input_tokens;
          metadata.outputTokens = result.output_tokens;
          metadata.totalCostUsd = result.cost_usd;
          metadata.durationMs = result.duration_ms;
          break;

        default:
          // Log unknown message types for debugging
          console.log(`[chat-stream] Unknown message type: ${msgType}`);
      }
    }

    // Save session ID if new
    if (metadata.sessionId && metadata.sessionId !== existingSessionId) {
      db.update(subChats)
        .set({ sessionId: metadata.sessionId, updatedAt: new Date() })
        .where(eq(subChats.id, subChatId))
        .run();
    }

    // Emit finish with metadata
    safeEmit({
      type: "finish",
      messageMetadata: {
        sessionId: metadata.sessionId,
        inputTokens: metadata.inputTokens,
        outputTokens: metadata.outputTokens,
        totalTokens: (metadata.inputTokens || 0) + (metadata.outputTokens || 0),
        totalCostUsd: metadata.totalCostUsd,
        durationMs: metadata.durationMs,
      },
    });

  } catch (error) {
    console.error("[chat-stream] Stream error:", error);
    emit({ type: "error", errorText: error instanceof Error ? error.message : String(error) });
    emit({ type: "finish" });
  } finally {
    activeSessions.delete(subChatId);
  }
}
