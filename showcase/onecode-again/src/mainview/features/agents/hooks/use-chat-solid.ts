/**
 * SolidJS hook that subscribes to an RpcChat instance (Claude backend, no AI SDK).
 * Exposes messages, status, error as Solid accessors.
 */
import { createSignal, createEffect, onCleanup } from "solid-js";
import type { RpcChat } from "../lib/rpc-chat";
import type { UIMessage } from "../../../../shared/chat-rpc";

export type UseChatSolidOptions<UI_MESSAGE extends UIMessage = UIMessage> = {
  chat: RpcChat;
  id?: string;
  resume?: boolean;
  experimental_throttle?: number;
};

export type UseChatSolidReturn<UI_MESSAGE extends UIMessage = UIMessage> = {
  id: string;
  messages: () => UI_MESSAGE[];
  setMessages: (messages: UI_MESSAGE[] | ((messages: UI_MESSAGE[]) => UI_MESSAGE[])) => void;
  sendMessage: RpcChat["sendMessage"];
  regenerate: RpcChat["regenerate"];
  stop: RpcChat["stop"];
  error: () => Error | undefined;
  status: () => string;
};

export function useChatSolid<UI_MESSAGE extends UIMessage = UIMessage>(
  options: UseChatSolidOptions<UI_MESSAGE>
): UseChatSolidReturn<UI_MESSAGE> {
  const { chat, resume = false, experimental_throttle: throttleWaitMs } = options;

  const [messages, setMessagesSignal] = createSignal<UI_MESSAGE[]>(chat.messages as UI_MESSAGE[]);
  const [status, setStatusSignal] = createSignal<string>(chat.status);
  const [error, setErrorSignal] = createSignal<Error | undefined>(chat.error);

  createEffect(() => {
    const unregisterMessages = chat["~registerMessagesCallback"](
      () => setMessagesSignal(chat.messages as UI_MESSAGE[]),
      throttleWaitMs
    );
    const unregisterStatus = chat["~registerStatusCallback"](() => setStatusSignal(chat.status));
    const unregisterError = chat["~registerErrorCallback"](() => setErrorSignal(chat.error));
    onCleanup(() => {
      unregisterMessages();
      unregisterStatus();
      unregisterError();
    });
  });

  createEffect(() => {
    if (resume) {
      chat.resumeStream();
    }
  });

  const setMessages = (
    messagesParam: UI_MESSAGE[] | ((messages: UI_MESSAGE[]) => UI_MESSAGE[])
  ) => {
    const next =
      typeof messagesParam === "function"
        ? messagesParam(chat.messages as UI_MESSAGE[])
        : messagesParam;
    chat.setMessages(next);
  };

  return {
    id: chat.id,
    messages: () => messages(),
    setMessages,
    sendMessage: chat.sendMessage.bind(chat),
    regenerate: chat.regenerate.bind(chat),
    stop: chat.stop.bind(chat),
    error: () => error(),
    status: () => status(),
  };
}
