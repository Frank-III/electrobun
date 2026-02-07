import type { UIMessage, UIMessageChunk } from "../../../../shared/chat-rpc";
import type { ImageAttachment, CustomClaudeConfig } from "../../../../shared/chat-rpc";
import type { RpcChatTransport } from "./rpc-chat";
import { getRpcRequest, onChatMessage } from "../../../lib/electrobun-rpc";
import { QUESTIONS_TIMED_OUT_MESSAGE, askUserQuestionResultsAtom, pendingUserQuestionsAtom } from "../atoms";

const DEBUG_IPC_CHAT_TRANSPORT =
  import.meta.env?.MODE !== "production" &&
  typeof window !== "undefined" &&
  window.localStorage.getItem("DEBUG_IPC_CHAT_TRANSPORT") === "1";

export type ChatStreamOptions = {
  maxThinkingTokens?: number;
  historyEnabled: boolean;
  modelString?: string;
  customConfig?: CustomClaudeConfig;
  selectedOllamaModel?: string;
  offlineModeEnabled: boolean;
  currentMode: "plan" | "agent";
};

export type IPCChatTransportConfig = {
  chatId: string;
  subChatId: string;
  cwd: string;
  projectPath?: string;
  mode: "plan" | "agent";
  model?: string;
  getStreamOptions?: () => ChatStreamOptions;
  onChunkSideEffect?: (
    chunk: UIMessageChunk,
    ctx: { subChatId: string; prompt: string; images: ImageAttachment[] },
  ) => void;
};

/**
 * IPC chat transport using Electrobun RPC (backend uses Claude Agent SDK).
 * Starts a chat stream via RPC request, receives chunks via message listener.
 */
export class IPCChatTransport implements RpcChatTransport {
  constructor(private config: IPCChatTransportConfig) {}

  async sendMessages(options: {
    trigger: "submit-message" | "regenerate-message";
    chatId: string;
    messageId: string | undefined;
    messages: UIMessage[];
    abortSignal: AbortSignal | undefined;
  }): Promise<ReadableStream<UIMessageChunk>> {
    const { messages, abortSignal } = options;
    const { subChatId, cwd, projectPath, mode, model, getStreamOptions, onChunkSideEffect } = this.config;
    const chatId = this.config.chatId;
    const setPendingQuestions = pendingUserQuestionsAtom[1];
    const setAskUserQuestionResults = askUserQuestionResultsAtom[1];

    // Get the last user message as the prompt
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    let prompt = "";
    const images: ImageAttachment[] = [];

    if (lastUserMessage?.parts) {
      for (const part of lastUserMessage.parts) {
        if (part.type === "text" && part.text) {
          prompt += part.text;
        } else if (part.type === "file") {
          const filePart = part as { type: "file"; file?: { base64Data?: string; mediaType?: string; name?: string } };
          if (filePart.file?.mediaType?.startsWith("image/") && filePart.file.base64Data) {
            images.push({
              base64Data: filePart.file.base64Data,
              mediaType: filePart.file.mediaType,
              filename: filePart.file.name,
            });
          }
        }
      }
    }

    const streamOptions = getStreamOptions?.() ?? {
      historyEnabled: true,
      offlineModeEnabled: false,
      currentMode: mode,
    };

    return new ReadableStream<UIMessageChunk>({
      start: async (controller) => {
        const rpc = getRpcRequest();
        const clearPendingQuestion = (toolUseId?: string) => {
          setPendingQuestions((current) => {
            const existing = current.get(subChatId);
            if (!existing) return current;
            if (toolUseId && existing.toolUseId !== toolUseId) return current;
            const next = new Map(current);
            next.delete(subChatId);
            return next;
          });
        };

        const applyChunkSideEffects = (chunk: UIMessageChunk) => {
          switch (chunk.type) {
            case "ask-user-question":
              setAskUserQuestionResults((current) => {
                if (!current.has(chunk.toolUseId)) return current;
                const next = new Map(current);
                next.delete(chunk.toolUseId);
                return next;
              });
              setPendingQuestions((current) => {
                const next = new Map(current);
                next.set(subChatId, {
                  subChatId,
                  parentChatId: chatId,
                  toolUseId: chunk.toolUseId,
                  questions: chunk.questions,
                });
                return next;
              });
              break;
            case "ask-user-question-result":
              setAskUserQuestionResults((current) => {
                const next = new Map(current);
                next.set(chunk.toolUseId, chunk.result);
                return next;
              });
              clearPendingQuestion(chunk.toolUseId);
              break;
            case "ask-user-question-timeout":
              setAskUserQuestionResults((current) => {
                const next = new Map(current);
                next.set(chunk.toolUseId, QUESTIONS_TIMED_OUT_MESSAGE);
                return next;
              });
              clearPendingQuestion(chunk.toolUseId);
              break;
            case "finish":
            case "error":
              clearPendingQuestion();
              break;
          }
        };

        // Set up abort handling
        let isAborted = false;
        const abortHandler = () => {
          isAborted = true;
          rpc.chatStop({ subChatId }).catch(console.error);
          clearPendingQuestion();
          controller.close();
        };

        if (abortSignal) {
          abortSignal.addEventListener("abort", abortHandler);
        }

        // Subscribe to chat messages
        if (DEBUG_IPC_CHAT_TRANSPORT) {
          console.log("[ipc-transport] subscribing to chunks for", subChatId);
        }
        const unsubscribe = onChatMessage(subChatId, (chunk) => {
          if (isAborted) return;

          if (chunk.type === "start" || chunk.type === "finish" || chunk.type === "error") {
            if (DEBUG_IPC_CHAT_TRANSPORT) {
              console.log("[ipc-transport] chunk received:", chunk.type, "subChatId=", subChatId);
            }
          }

          // Call side effect handler if provided
          onChunkSideEffect?.(chunk, { subChatId, prompt, images });
          applyChunkSideEffects(chunk);

          // Enqueue chunk (try/catch: abort can race with incoming chunk)
          try {
            controller.enqueue(chunk);
          } catch (enqueueErr) {
            console.warn("[ipc-transport] enqueue failed:", enqueueErr);
            unsubscribe();
            return;
          }

          // Close stream on finish
          if (chunk.type === "finish") {
            if (DEBUG_IPC_CHAT_TRANSPORT) {
              console.log("[ipc-transport] finish → closing stream for", subChatId);
            }
            unsubscribe();
            try { controller.close(); } catch { /* already closed */ }
          }
        });

        try {
          // Start the chat stream
          if (DEBUG_IPC_CHAT_TRANSPORT) {
            console.log("[ipc-transport] calling rpc.chatStart for", subChatId);
          }
          await rpc.chatStart({
            subChatId,
            chatId,
            prompt,
            cwd,
            projectPath,
            mode,
            model,
            images: images.length > 0 ? images : undefined,
            historyEnabled: streamOptions.historyEnabled ?? true,
            maxThinkingTokens: streamOptions.maxThinkingTokens,
            customConfig: streamOptions.customConfig,
            selectedOllamaModel: streamOptions.selectedOllamaModel,
            offlineModeEnabled: streamOptions.offlineModeEnabled ?? false,
            enableTasks: true,
          });
          if (DEBUG_IPC_CHAT_TRANSPORT) {
            console.log("[ipc-transport] chatStart returned OK for", subChatId);
          }
        } catch (error) {
          console.error("[ipc-transport] chatStart FAILED for", subChatId, error);
          unsubscribe();
          controller.error(error);
        }
      },
    });
  }

  async reconnectToStream(_options: {
    chatId: string;
  }): Promise<ReadableStream<UIMessageChunk> | null> {
    // TODO: Implement stream reconnection if needed
    return null;
  }
}
