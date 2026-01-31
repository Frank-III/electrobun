import type { UIMessage, UIMessageChunk } from "../../../../shared/chat-rpc";
import type { ImageAttachment, CustomClaudeConfig } from "../../../../shared/chat-rpc";
import type { RpcChatTransport } from "./rpc-chat";
import { getRpcRequest, onChatMessage } from "../../../lib/electrobun-rpc";

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

        // Set up abort handling
        let isAborted = false;
        const abortHandler = () => {
          isAborted = true;
          rpc.chatStop({ subChatId }).catch(console.error);
          controller.close();
        };

        if (abortSignal) {
          abortSignal.addEventListener("abort", abortHandler);
        }

        // Subscribe to chat messages
        const unsubscribe = onChatMessage(subChatId, (chunk) => {
          if (isAborted) return;

          // Call side effect handler if provided
          onChunkSideEffect?.(chunk, { subChatId, prompt, images });

          // Enqueue chunk
          controller.enqueue(chunk);

          // Close stream on finish
          if (chunk.type === "finish") {
            unsubscribe();
            controller.close();
          }
        });

        try {
          // Start the chat stream
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
            customConfig: streamOptions.customConfig,
            selectedOllamaModel: streamOptions.selectedOllamaModel,
            offlineModeEnabled: streamOptions.offlineModeEnabled ?? false,
            enableTasks: true,
          });
        } catch (error) {
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
