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
const STREAM_STALL_TIMEOUT_MS = 120_000;
const DEBUG_CHAT_STREAM = process.env.DEBUG_CHAT_STREAM === "1";

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
        maxThinkingTokens,
        customConfig,
        selectedOllamaModel,
        offlineModeEnabled = false,
        enableTasks = true,
      } = params;

      if (DEBUG_CHAT_STREAM) {
        console.log("[chat-stream] chatStart called: subChatId=", subChatId, "mode=", mode, "historyEnabled=", historyEnabled);
      }

      // Abort any existing session for this subChatId
      const existingController = activeSessions.get(subChatId);
      if (existingController) {
        if (DEBUG_CHAT_STREAM) {
          console.log("[chat-stream] aborting existing session for", subChatId);
        }
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
        maxThinkingTokens,
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
  maxThinkingTokens?: number;
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
    maxThinkingTokens,
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

  let stallTimeout: ReturnType<typeof setTimeout> | null = null;
  const clearStallTimeout = () => {
    if (stallTimeout) {
      clearTimeout(stallTimeout);
      stallTimeout = null;
    }
  };
  const resetStallTimeout = () => {
    clearStallTimeout();
    stallTimeout = setTimeout(() => {
      if (abortController.signal.aborted) return;
      safeEmit({
        type: "error",
        errorText: `Stream stalled for ${Math.round(STREAM_STALL_TIMEOUT_MS / 1000)}s with no new events. Stopping.`,
      });
      abortController.abort();
    }, STREAM_STALL_TIMEOUT_MS);
  };

  try {
    const db = await getDatabase();

    // Get existing messages from DB
    const existing = db.select().from(subChats).where(eq(subChats.id, subChatId)).get();
    const existingMessages = JSON.parse(existing?.messages || "[]");
    const existingSessionId = existing?.sessionId || null;
    if (DEBUG_CHAT_STREAM) {
      console.log("[chat-stream] DB messages:", existingMessages.length, "roles:", existingMessages.map((m: any) => m.role), "sessionId:", existingSessionId);
    }

    // Get resumeSessionAt UUID
    const lastAssistantMsg = [...existingMessages].reverse().find((m: { role: string }) => m.role === "assistant");
    const resumeAtUuid = historyEnabled && lastAssistantMsg?.metadata?.shouldResume ? lastAssistantMsg?.metadata?.sdkMessageUuid || null : null;

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

    // Only resume if we have a valid conversation history (at least one assistant message).
    // Without assistant messages, the SDK session state won't match and may hang.
    const hasAssistantResponse = existingMessages.some((m: { role: string }) => m.role === "assistant");
    const resumeSessionId = historyEnabled && hasAssistantResponse ? existingSessionId || undefined : undefined;
    if (DEBUG_CHAT_STREAM) {
      console.log("[chat-stream] hasAssistantResponse=", hasAssistantResponse, "resumeSessionId=", resumeSessionId ?? "none");
    }

    // Read AGENTS.md from project root if it exists
    let agentsMdContent: string | undefined;
    try {
      const lookupPath = projectPath || cwd;
      const agentsMdPath = path.join(lookupPath, "AGENTS.md");
      agentsMdContent = await fs.readFile(agentsMdPath, "utf-8");
      if (agentsMdContent.trim()) {
        if (DEBUG_CHAT_STREAM) {
          console.log(`[chat-stream] Found AGENTS.md at ${agentsMdPath} (${agentsMdContent.length} chars)`);
        }
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

    // Accumulation state for streamed text/metadata
    let currentText = "";
    
    type StreamMetadata = {
      sessionId?: string;
      inputTokens?: number;
      outputTokens?: number;
      totalCostUsd?: number;
      durationMs?: number;
    };
    const metadata: StreamMetadata = {};

    type StreamEventPayload = {
      type?: string;
      index?: number;
      content_block?: { type?: string; text?: string; thinking?: string; id?: string; name?: string };
      delta?: { type?: string; text?: string; thinking?: string; partial_json?: string };
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const STREAM_BLOCK_FALLBACK_INDEX = -1;
    const streamingTextBlockIds = new Map<number, string>();
    const streamingReasoningBlockIds = new Map<number, string>();
    let sawTextStreamEvent = false;

    // Tool call streaming state
    let currentToolCallId: string | null = null;
    let currentToolName: string | null = null;
    let accumulatedToolInput = "";
    const emittedToolIds = new Set<string>();
    let currentParentToolUseId: string | null = null;
    const toolIdMapping = new Map<string, string>();

    // Compact tracking
    let lastCompactId: string | null = null;
    let compactCounter = 0;

    const normalizeStreamBlockIndex = (index: number | undefined): number =>
      typeof index === "number" ? index : STREAM_BLOCK_FALLBACK_INDEX;

    const ensureTextStreamBlock = (index: number | undefined): string => {
      const normalized = normalizeStreamBlockIndex(index);
      let textId = streamingTextBlockIds.get(normalized);
      if (!textId) {
        textId = crypto.randomUUID();
        streamingTextBlockIds.set(normalized, textId);
        safeEmit({ type: "text-start", id: textId });
      }
      return textId;
    };

    const ensureReasoningStreamBlock = (index: number | undefined): string => {
      const normalized = normalizeStreamBlockIndex(index);
      let reasoningId = streamingReasoningBlockIds.get(normalized);
      if (!reasoningId) {
        reasoningId = crypto.randomUUID();
        streamingReasoningBlockIds.set(normalized, reasoningId);
      }
      return reasoningId;
    };

    // Helper: close any open text stream blocks
    const closeOpenTextBlocks = () => {
      for (const textId of streamingTextBlockIds.values()) {
        safeEmit({ type: "text-end", id: textId });
      }
      streamingTextBlockIds.clear();
    };

    // Helper: finish current streaming tool input and emit tool-input-available
    const finishCurrentToolInput = () => {
      if (!currentToolCallId) return;
      emittedToolIds.add(currentToolCallId);

      let parsedInput: ToolInput = {};
      if (accumulatedToolInput) {
        try {
          parsedInput = JSON.parse(accumulatedToolInput);
        } catch {
          parsedInput = { _raw: accumulatedToolInput, _parseError: true };
        }
      }

      safeEmit({
        type: "tool-input-available",
        toolCallId: currentToolCallId,
        toolName: currentToolName || "unknown",
        input: parsedInput,
      });
      currentToolCallId = null;
      currentToolName = null;
      accumulatedToolInput = "";
    };

    // Run the query
    if (DEBUG_CHAT_STREAM) {
      console.log(`[chat-stream] Starting query for ${subChatId} mode=${mode}`);
    }

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
        ...(typeof maxThinkingTokens === "number" ? { maxThinkingTokens } : {}),
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
            const askUserQuestionInput = toolInput as AskUserQuestionInput;
            safeEmit({
              type: "tool-input-available",
              toolCallId: toolUseID,
              toolName,
              input: toolInput,
            });
            safeEmit({
              type: "ask-user-question",
              toolUseId: toolUseID,
              questions: askUserQuestionInput.questions,
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
              const resultMessage = response.message || "Skipped";
              safeEmit({ type: "tool-output-error", toolCallId: toolUseID, errorText: resultMessage });
              safeEmit({ type: "ask-user-question-result", toolUseId: toolUseID, result: resultMessage });
              return { behavior: "deny", message: response.message || "Skipped" };
            }

            const rawAnswers = (response.updatedInput as { answers?: Array<{ question: string; answer: string | string[] }> | Record<string, string | string[]> } | undefined)?.answers;
            const normalizedAnswers = Array.isArray(rawAnswers)
              ? rawAnswers
              : rawAnswers && typeof rawAnswers === "object"
                ? Object.entries(rawAnswers).map(([question, answer]) => ({ question, answer }))
                : [];
            const normalizedUpdatedInput = rawAnswers && !Array.isArray(rawAnswers)
              ? { ...response.updatedInput, answers: normalizedAnswers }
              : response.updatedInput;
            const resultPayload: UserQuestionResult = { answers: normalizedAnswers };
            safeEmit({ type: "tool-output-available", toolCallId: toolUseID, output: resultPayload });
            safeEmit({ type: "ask-user-question-result", toolUseId: toolUseID, result: resultPayload });
            return { behavior: "allow", updatedInput: normalizedUpdatedInput };
          }

          return { behavior: "allow", updatedInput: toolInput };
        },
        stderr: (data: string) => {
          console.error("[claude stderr]", data);
        },
        // Claude Agent SDK: `continue` and `resume` are mutually exclusive.
        ...(resumeSessionId && {
          resume: resumeSessionId,
          ...(resumeAtUuid ? { resumeSessionAt: resumeAtUuid } : {}),
        }),
        ...(model && { model }),
      } as Parameters<typeof claudeQuery>[0]["options"],
    });

    // Emit start
    safeEmit({ type: "start", messageId: crypto.randomUUID() });

    // Process the stream
    resetStallTimeout();
    for await (const message of queryResult) {
      if (abortController.signal.aborted) {
        break;
      }
      resetStallTimeout();

      // Transform SDK messages to UI chunks
      const msgAny = message as Record<string, any>;
      const msgType = msgAny.type as string;

      // Track parent_tool_use_id for nested tools (e.g. Explore agent)
      if (msgAny.parent_tool_use_id !== undefined) {
        currentParentToolUseId = msgAny.parent_tool_use_id || null;
      }

      // Detect SDK error messages BEFORE the switch
      if (msgType === "error" || msgAny.error) {
        const errorMsg = msgAny.error?.message || msgAny.message || "Unknown SDK error";
        safeEmit({ type: "error", errorText: String(errorMsg) });
        continue;
      }

      switch (msgType) {
        case "stream_event": {
          const streamEvent = (message as { event?: StreamEventPayload }).event;
          if (!streamEvent) break;

          switch (streamEvent.type) {
            case "content_block_start": {
              if (streamEvent.content_block?.type === "text") {
                sawTextStreamEvent = true;
                const textId = ensureTextStreamBlock(streamEvent.index);
                if (streamEvent.content_block.text) {
                  safeEmit({ type: "text-delta", id: textId, delta: streamEvent.content_block.text });
                  currentText += streamEvent.content_block.text;
                }
              } else if (streamEvent.content_block?.type === "thinking") {
                const reasoningId = ensureReasoningStreamBlock(streamEvent.index);
                if (streamEvent.content_block.thinking) {
                  safeEmit({ type: "reasoning", id: reasoningId, text: streamEvent.content_block.thinking });
                }
              } else if (streamEvent.content_block?.type === "tool_use") {
                // Close open text blocks and pending tool input
                closeOpenTextBlocks();
                finishCurrentToolInput();

                const originalId = streamEvent.content_block.id || crypto.randomUUID();
                const compositeId = currentParentToolUseId ? `${currentParentToolUseId}:${originalId}` : originalId;
                currentToolCallId = compositeId;
                currentToolName = streamEvent.content_block.name || "unknown";
                accumulatedToolInput = "";
                toolIdMapping.set(originalId, compositeId);

                safeEmit({
                  type: "tool-input-start",
                  toolCallId: compositeId,
                  toolName: currentToolName,
                });
              }
              break;
            }

            case "content_block_delta": {
              if (streamEvent.delta?.type === "text_delta" && streamEvent.delta.text) {
                sawTextStreamEvent = true;
                const textId = ensureTextStreamBlock(streamEvent.index);
                safeEmit({ type: "text-delta", id: textId, delta: streamEvent.delta.text });
                currentText += streamEvent.delta.text;
              } else if (streamEvent.delta?.type === "thinking_delta" && streamEvent.delta.thinking) {
                const reasoningId = ensureReasoningStreamBlock(streamEvent.index);
                safeEmit({ type: "reasoning-delta", id: reasoningId, delta: streamEvent.delta.thinking });
              } else if (streamEvent.delta?.type === "input_json_delta" && currentToolCallId) {
                const partialJson = streamEvent.delta.partial_json || "";
                accumulatedToolInput += partialJson;
                safeEmit({
                  type: "tool-input-delta",
                  toolCallId: currentToolCallId,
                  inputTextDelta: partialJson,
                });
              }
              break;
            }

            case "content_block_stop": {
              const normalized = normalizeStreamBlockIndex(streamEvent.index);
              const textId = streamingTextBlockIds.get(normalized);
              if (textId) {
                safeEmit({ type: "text-end", id: textId });
                streamingTextBlockIds.delete(normalized);
              }
              streamingReasoningBlockIds.delete(normalized);
              // Finish any streaming tool input
              if (currentToolCallId) {
                finishCurrentToolInput();
              }
              break;
            }

            case "message_delta": {
              if (streamEvent.usage) {
                if (typeof streamEvent.usage.input_tokens === "number") {
                  metadata.inputTokens = streamEvent.usage.input_tokens;
                }
                if (typeof streamEvent.usage.output_tokens === "number") {
                  metadata.outputTokens = streamEvent.usage.output_tokens;
                }
              }
              break;
            }
          }
          break;
        }

        case "assistant": {
          const assistantMessage = message as {
            message?: {
              content?: Array<{ type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }>;
              stop_reason?: string | null;
            };
          };
          const textContent = assistantMessage.message?.content;
          const isFinalAssistantMessage = assistantMessage.message?.stop_reason !== null && assistantMessage.message?.stop_reason !== undefined;

          if (textContent) {
            for (const block of textContent) {
              // Text blocks - only emit as fallback when no streaming occurred
              if (block.type === "text" && block.text && !sawTextStreamEvent && isFinalAssistantMessage) {
                const textId = crypto.randomUUID();
                safeEmit({ type: "text-start", id: textId });
                safeEmit({ type: "text-delta", id: textId, delta: block.text });
                safeEmit({ type: "text-end", id: textId });
                currentText += block.text;
              }

              // Tool use blocks - emit if not already emitted via streaming
              if (block.type === "tool_use" && block.id) {
                if (emittedToolIds.has(block.id)) continue;
                emittedToolIds.add(block.id);

                const compositeId = currentParentToolUseId ? `${currentParentToolUseId}:${block.id}` : block.id;
                toolIdMapping.set(block.id, compositeId);

                safeEmit({
                  type: "tool-input-available",
                  toolCallId: compositeId,
                  toolName: block.name || "unknown",
                  input: (block.input || {}) as ToolInput,
                });
              }
            }
          }
          break;
        }

        case "user": {
          // Tool results - emitted by SDK when a tool completes
          const userMsg = message as {
            message?: { content?: Array<{ type: string; tool_use_id?: string; content?: unknown; is_error?: boolean }> };
            tool_use_result?: unknown;
          };
          if (userMsg.message?.content && Array.isArray(userMsg.message.content)) {
            for (const block of userMsg.message.content) {
              if (block.type === "tool_result" && block.tool_use_id) {
                const compositeId = toolIdMapping.get(block.tool_use_id) || block.tool_use_id;

                if (block.is_error) {
                  safeEmit({
                    type: "tool-output-error",
                    toolCallId: compositeId,
                    errorText: String(block.content),
                  });
                } else {
                  let output = userMsg.tool_use_result;
                  if (!output && typeof block.content === "string") {
                    try {
                      const parsed = JSON.parse(block.content);
                      if (parsed && typeof parsed === "object") output = parsed;
                    } catch { /* not JSON, use raw */ }
                  }
                  output = output || block.content;

                  safeEmit({
                    type: "tool-output-available",
                    toolCallId: compositeId,
                    output: output as import("../shared/chat-rpc").ToolOutput,
                  });
                }
              }
            }
          }
          break;
        }

        case "system": {
          // Session init - MCP servers, tools, plugins, skills
          const sysMsg = message as {
            subtype?: string;
            status?: string;
            tools?: string[];
            mcp_servers?: Array<{ name: string; status: string; serverInfo?: { name: string; version: string }; error?: string }>;
            plugins?: Array<{ name: string; path: string }>;
            skills?: string[];
          };

          if (sysMsg.subtype === "init") {
            const mcpServers = (sysMsg.mcp_servers || []).map((s) => ({
              name: s.name,
              status: (["connected", "failed", "pending", "needs-auth"].includes(s.status) ? s.status : "pending") as import("../shared/chat-rpc").MCPServerStatus,
              ...(s.serverInfo && { serverInfo: s.serverInfo }),
              ...(s.error && { error: s.error }),
            }));
            safeEmit({
              type: "session-init",
              tools: sysMsg.tools || [],
              mcpServers,
              plugins: sysMsg.plugins || [],
              skills: sysMsg.skills || [],
            });
          }

          // Compacting status
          if (sysMsg.subtype === "status" && sysMsg.status === "compacting") {
            lastCompactId = `compact-${Date.now()}-${compactCounter++}`;
            safeEmit({
              type: "system-Compact",
              toolCallId: lastCompactId,
              state: "input-streaming",
            });
          }

          // Compact boundary - mark complete
          if (sysMsg.subtype === "compact_boundary") {
            let compactId = lastCompactId;
            if (!compactId) {
              compactId = `compact-${Date.now()}-${compactCounter++}`;
              safeEmit({
                type: "system-Compact",
                toolCallId: compactId,
                state: "input-streaming",
              });
            }
            safeEmit({
              type: "system-Compact",
              toolCallId: compactId,
              state: "output-available",
            });
            lastCompactId = null;
          }
          break;
        }

        case "result": {
          // Extract metadata
          const result = message as {
            result?: string;
            session_id?: string;
            usage?: { input_tokens?: number; output_tokens?: number };
            input_tokens?: number;
            output_tokens?: number;
            cost_usd?: number;
            total_cost_usd?: number;
            duration_ms?: number;
          };
          metadata.sessionId = result.session_id;
          metadata.inputTokens = result.usage?.input_tokens ?? result.input_tokens;
          metadata.outputTokens = result.usage?.output_tokens ?? result.output_tokens;
          metadata.totalCostUsd = result.total_cost_usd ?? result.cost_usd;
          metadata.durationMs = result.duration_ms;
          break;
        }

        default:
          if (DEBUG_CHAT_STREAM) {
            if (DEBUG_CHAT_STREAM) {
              console.log(`[chat-stream] Unknown message type: ${msgType}`);
            }
          }
      }
    }
    clearStallTimeout();

    // Ensure any open streamed text/tool blocks are closed before finishing.
    closeOpenTextBlocks();
    finishCurrentToolInput();

    // Save session ID if new
    if (metadata.sessionId && metadata.sessionId !== existingSessionId) {
      db.update(subChats)
        .set({ sessionId: metadata.sessionId, updatedAt: new Date() })
        .where(eq(subChats.id, subChatId))
        .run();
    }

    // Emit finish with metadata
    if (DEBUG_CHAT_STREAM) {
      console.log("[chat-stream] emitting finish for", subChatId, "sessionId=", metadata.sessionId, "tokens:", metadata.inputTokens, "/", metadata.outputTokens);
    }
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
    clearStallTimeout();
    const isAbortError = error instanceof Error && (error.name === "AbortError" || /aborted/i.test(error.message));
    console.error("[chat-stream] Stream error for", subChatId, ":", error);
    if (!isAbortError) {
      emit({ type: "error", errorText: error instanceof Error ? error.message : String(error) });
    }
    emit({ type: "finish" });
  } finally {
    clearStallTimeout();
    // Only clear if this stream still owns the active controller.
    // A newer stream for the same subChatId may have replaced it already.
    if (activeSessions.get(subChatId) === abortController) {
      activeSessions.delete(subChatId);
    }
  }
}
