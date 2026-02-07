import type { RPCSchema } from "electrobun/bun";

// Tool input/output types - flexible JSON-serializable data
export type ToolInputValue = string | number | boolean | null | ToolInputValue[] | { [key: string]: ToolInputValue };
export type ToolInput = { [key: string]: ToolInputValue };
export type ToolOutput = string | number | boolean | null | ToolOutput[] | { [key: string]: ToolOutput };

// User question answer type
export type UserQuestionAnswer = { question: string; answer: string | string[] };
export type UserQuestionResult = string | UserQuestionAnswer[] | { answers: UserQuestionAnswer[] };

// Chat lifecycle status
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

// Message shape consumed by UI (role, parts). No dependency on "ai" package.
export type UIMessagePart = { type: string; text?: string; [key: string]: unknown };
export type UIMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
  metadata?: MessageMetadata;
};

// Chunk format - messages sent from Bun to webview during chat streaming
export type UIMessageChunk =
  // Message lifecycle
  | { type: "start"; messageId?: string }
  | { type: "finish"; messageMetadata?: MessageMetadata }
  | { type: "start-step" }
  | { type: "finish-step" }
  // Text streaming
  | { type: "text-start"; id: string }
  | { type: "text-delta"; id: string; delta: string }
  | { type: "text-end"; id: string }
  // Reasoning (Extended Thinking)
  | { type: "reasoning"; id: string; text: string }
  | { type: "reasoning-delta"; id: string; delta: string }
  // Tool calls
  | { type: "tool-input-start"; toolCallId: string; toolName: string }
  | { type: "tool-input-delta"; toolCallId: string; inputTextDelta: string }
  | {
      type: "tool-input-available";
      toolCallId: string;
      toolName: string;
      input: ToolInput;
    }
  | { type: "tool-output-available"; toolCallId: string; output: ToolOutput }
  | { type: "tool-output-error"; toolCallId: string; errorText: string }
  // Error & metadata
  | { type: "error"; errorText: string; debugInfo?: Record<string, string | number | boolean> }
  | {
      type: "ask-user-question";
      toolUseId: string;
      questions: Array<{
        question: string;
        header: string;
        options: Array<{ label: string; description: string }>;
        multiSelect: boolean;
      }>;
    }
  | { type: "ask-user-question-timeout"; toolUseId: string }
  | { type: "ask-user-question-result"; toolUseId: string; result: UserQuestionResult }
  | { type: "message-metadata"; messageMetadata: MessageMetadata }
  // System tools (rendered like regular tools)
  | {
      type: "system-Compact";
      toolCallId: string;
      state: "input-streaming" | "output-available";
    }
  // Session initialization (MCP servers, plugins, tools)
  | {
      type: "session-init";
      tools: string[];
      mcpServers: MCPServer[];
      plugins: { name: string; path: string }[];
      skills: string[];
    };

export type MCPServerStatus = "connected" | "failed" | "pending" | "needs-auth";

export type MCPServer = {
  name: string;
  status: MCPServerStatus;
  serverInfo?: {
    name: string;
    version: string;
  };
  error?: string;
};

export type MessageMetadata = {
  sessionId?: string;
  sdkMessageUuid?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  totalCostUsd?: number;
  durationMs?: number;
  resultSubtype?: string;
  finalTextId?: string;
};

export type ImageAttachment = {
  base64Data: string;
  mediaType: string;
  filename?: string;
};

export type CustomClaudeConfig = {
  token: string;
  baseUrl?: string;
  model?: string;
};

// Requests sent from webview to Bun
export type ChatRequests = {
  // Start a chat stream - returns immediately, chunks sent via messages
  chatStart: {
    params: {
      subChatId: string;
      chatId: string;
      prompt: string;
      cwd: string;
      projectPath?: string;
      mode: "plan" | "agent";
      model?: string;
      images?: ImageAttachment[];
      historyEnabled?: boolean;
      maxThinkingTokens?: number;
      customConfig?: CustomClaudeConfig;
      selectedOllamaModel?: string;
      offlineModeEnabled?: boolean;
      enableTasks?: boolean;
    };
    response: { streamId: string };
  };
  // Stop/abort a running chat stream
  chatStop: {
    params: { subChatId: string };
    response: { ok: boolean };
  };
  // Respond to a tool approval request
  chatRespondToolApproval: {
    params: {
      toolUseId: string;
      approved: boolean;
      message?: string;
      updatedInput?: ToolInput;
    };
    response: { ok: boolean };
  };
  // Respond to user questions from AskUserQuestion tool
  chatRespondUserQuestion: {
    params: {
      toolUseId: string;
      answers: Array<{ question: string; answer: string | string[] }>;
    };
    response: { ok: boolean };
  };
};

// Messages sent from Bun to webview (streaming chunks)
export type ChatMessages = {
  // Chat streaming chunks - includes subChatId to route to correct chat
  chatChunk: { subChatId: string; chunk: UIMessageChunk };
};

export interface ChatRPC {
  bun: RPCSchema<{
    requests: ChatRequests;
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: ChatMessages;
  }>;
}
