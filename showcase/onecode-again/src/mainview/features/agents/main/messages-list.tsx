import type { JSX, Component } from "solid-js";
import { createMemo, createContext, useContext, createEffect, createSignal, For, Show } from "solid-js";
import { AssistantMessageItem } from "./assistant-message-item";
import { messageAtomFamily, isLastMessageAtomFamily, isStreamingAtom, chatStatusAtom } from "../stores/message-store";
import { extractTextMentions, TextMentionBlocks } from "../mentions/render-file-mentions";
// ============================================================================
// MESSAGE STORE - External store for fine-grained subscriptions
// ============================================================================
type Message = any;
interface MessageStore {
	messages: Message[];
	status: string;
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => {
		messages: Message[];
		status: string;
	};
	initMessages: (messages: Message[], status: string) => void;
	setMessages: (messages: Message[], status: string) => void;
}
function createMessageStore(): MessageStore {
	let messages: Message[] = [];
	let status = "ready";
	let listeners = new Set<() => void>();
	// Store snapshots of message state (not references!) to detect changes
	// Since AI SDK mutates objects in place, we can't compare object references
	//
	// NOTE: This is a thorough change detection that checks ALL parts.
	// Compare with message-store.ts hasMessageChanged() which only checks the
	// LAST part for performance during high-frequency streaming updates.
	// Both approaches are correct for their use cases:
	// - This (messages-list): Solid signals need accurate change detection
	// - message-store.ts: Jotai atoms optimized for streaming (last part only)
	const messageSnapshotsMap = new Map<string, {
		partsCount: number;
		textLengths: number[];
		partStates: (string | undefined)[];
	}>();
	function getMessageSnapshot(msg: Message) {
		const parts = msg.parts || [];
		return {
			partsCount: parts.length,
			textLengths: parts.map((p: any) => p.type === "text" ? p.text?.length || 0 : -1),
			partStates: parts.map((p: any) => p.state)
		};
	}
	function hasMessageChanged(msgId: string, newMsg: Message): boolean {
		const existingSnapshot = messageSnapshotsMap.get(msgId);
		const newSnapshot = getMessageSnapshot(newMsg);
		// No existing snapshot = new message
		if (!existingSnapshot) {
			return true;
		}
		// Compare parts count
		if (existingSnapshot.partsCount !== newSnapshot.partsCount) {
			return true;
		}
		// Compare text lengths (this detects streaming text changes!)
		for (let i = 0; i < newSnapshot.textLengths.length; i++) {
			if (existingSnapshot.textLengths[i] !== newSnapshot.textLengths[i]) {
				return true;
			}
		}
		// Compare part states
		for (let i = 0; i < newSnapshot.partStates.length; i++) {
			if (existingSnapshot.partStates[i] !== newSnapshot.partStates[i]) {
				return true;
			}
		}
		return false;
	}
	function stabilizeMessages(newMessages: Message[]): Message[] {
		// Check if any message changed
		let anyChanged = false;
		for (const msg of newMessages) {
			if (hasMessageChanged(msg.id, msg)) {
				anyChanged = true;
				// Update snapshot for this message
				messageSnapshotsMap.set(msg.id, getMessageSnapshot(msg));
			}
		}
		// If length changed, definitely return new array
		if (newMessages.length !== messages.length) {
			anyChanged = true;
		}
		// Return new array reference if anything changed, so subscribers see the update
		return anyChanged ? [...newMessages] : messages;
	}
	return {
		get messages() {
			return messages;
		},
		get status() {
			return status;
		},
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot() {
			return {
				messages,
				status
			};
		},
		initMessages(newMessages: Message[], newStatus: string) {
			const stabilized = stabilizeMessages(newMessages);
			messages = stabilized;
			status = newStatus;
		},
		setMessages(newMessages: Message[], newStatus: string) {
			const stabilized = stabilizeMessages(newMessages);
			// Only notify if something actually changed
			const messagesChanged = stabilized !== messages;
			const statusChanged = newStatus !== status;
			if (messagesChanged || statusChanged) {
				messages = stabilized;
				status = newStatus;
				listeners.forEach((l) => l());
			}
		}
	};
}
// Reactive slice: Solid signals kept in sync with the store so hooks use createMemo only
interface MessageStoreReactive {
	messages: () => Message[];
	status: () => string;
}
const MessageStoreContext = createContext<MessageStoreReactive | null>(null);

// Provider: holds the store (for stabilization) and exposes signals for Solid reactivity
export function MessageStoreProvider(props: {
	children: JSX.Element;
	messages: Message[];
	status: string;
}) {
	const [storeRef, setStoreRef] = createSignal<MessageStore | null>(null);
	const [messagesSignal, setMessagesSignal] = createSignal<Message[]>([]);
	const [statusSignal, setStatusSignal] = createSignal<string>("ready");

	// One-time init store and initial signal values
	let store = storeRef();
	if (!store) {
		store = createMessageStore();
		store.initMessages(props.messages, props.status);
		setStoreRef(store);
		setMessagesSignal(store.messages);
		setStatusSignal(store.status);
	}

	// Sync props → store (with stabilization)
	createEffect(() => {
		storeRef()?.setMessages(props.messages, props.status);
	});

	// When store notifies, push to signals so createMemo dependencies update
	createEffect(() => {
		const s = storeRef();
		if (!s) return;
		const unsub = s.subscribe(() => {
			setMessagesSignal(s.messages);
			setStatusSignal(s.status);
		});
		return unsub;
	});

	const value = { messages: messagesSignal, status: statusSignal };
	return <MessageStoreContext.Provider value={value}>{props.children}</MessageStoreContext.Provider>;
}
// Hook to get a specific message by ID - only re-runs when messages() changes (Solid fine-grained)
export function useMessage(messageId: string) {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useMessage must be used within MessageStoreProvider");
	return createMemo(() => ctx.messages().find((m) => m.id === messageId));
}
// Hook to get message IDs only (for list rendering)
export function useMessageIds() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useMessageIds must be used within MessageStoreProvider");
	return createMemo(() => ctx.messages().filter((m) => m.role === "assistant").map((m) => m.id));
}
// Hook to get streaming status - only re-runs when status or last message changes
export function useStreamingStatus() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useStreamingStatus must be used within MessageStoreProvider");
	return createMemo(() => {
		const msgs = ctx.messages();
		const s = ctx.status();
		const lastId = msgs.length > 0 ? msgs[msgs.length - 1]?.id : null;
		return {
			isStreaming: s === "streaming" || s === "submitted",
			status: s,
			lastMessageId: lastId
		};
	});
}
// ============================================================================
// MESSAGE ITEM - Subscribes to its own message only
// ============================================================================
interface MessageItemWrapperProps {
	messageId: string;
	subChatId: string;
	chatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
}
// Hook that only re-runs when last message id changes (Solid memo)
function useIsLastMessage(messageId: string) {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useIsLastMessage must be used within MessageStoreProvider");
	return createMemo(() => {
		const msgs = ctx.messages();
		const lastId = msgs.length > 0 ? msgs[msgs.length - 1]?.id : null;
		return messageId === lastId;
	});
}
// Hook that only re-runs when streaming status changes
function useIsStreaming() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useIsStreaming must be used within MessageStoreProvider");
	return createMemo(() => {
		const s = ctx.status();
		return { isStreaming: s === "streaming" || s === "submitted", status: s };
	});
}
interface NonStreamingMessageItemProps {
	messageId: string;
	subChatId: string;
	chatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
}
function NonStreamingMessageItem(props: NonStreamingMessageItemProps) {
	// Subscribe to this specific message via Jotai - only re-renders when THIS message changes
	const message = messageAtomFamily(props.messageId)[0];
	if (!message) return null;
	return <AssistantMessageItem message={message} isLastMessage={false} isStreaming={false} status="ready" subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />;
}
// For the last message - subscribes to streaming status AND message via Jotai
// Passes message as prop to AssistantMessageItem
interface StreamingMessageItemProps {
	messageId: string;
	subChatId: string;
	chatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
}
function StreamingMessageItem(props: StreamingMessageItemProps) {
	// Subscribe to this specific message via Jotai - only re-renders when THIS message changes
	const message = messageAtomFamily(props.messageId)[0];
	// Subscribe to streaming status
	const isStreaming = isStreamingAtom[0];
	const status = chatStatusAtom[0];
	if (!message) return null;
	return <AssistantMessageItem message={message} isLastMessage={true} isStreaming={isStreaming} status={status} subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />;
}
// Combined hook - get message AND isLast in one memo (Solid)
function useMessageWithLastStatus(messageId: string) {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useMessageWithLastStatus must be used within MessageStoreProvider");
	return createMemo(() => {
		const msgs = ctx.messages();
		const message = msgs.find((m) => m.id === messageId);
		const lastId = msgs.length > 0 ? msgs[msgs.length - 1]?.id : null;
		return { message, isLast: messageId === lastId };
	});
}
export function MessageItemWrapper(props: MessageItemWrapperProps) {
	// Only subscribe to isLast - NOT to message content!
	// StreamingMessageItem and NonStreamingMessageItem will subscribe to message themselves
	const isLast = isLastMessageAtomFamily(props.messageId)[0];
	// Only the last message subscribes to streaming status
	if (isLast()) {
		// StreamingMessageItem subscribes to messageAtomFamily internally
		return <StreamingMessageItem messageId={props.messageId} subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />;
	}
	// NonStreamingMessageItem subscribes to messageAtomFamily internally
	return <NonStreamingMessageItem messageId={props.messageId} subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />;
}
// ============================================================================
// MEMOIZED ASSISTANT MESSAGES - Only re-renders when message IDs change
// ============================================================================
// This is the KEY optimization component.
// By wrapping the assistant messages .map() in a memoized component that
// compares ONLY the message IDs (not the full message objects), we prevent
// the parent's re-render from causing MessageItemWrapper to be called.
interface MemoizedAssistantMessagesProps {
	assistantMsgIds: string[];
	subChatId: string;
	chatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
}
function areMemoizedAssistantMessagesEqual(prev: MemoizedAssistantMessagesProps, next: MemoizedAssistantMessagesProps): boolean {
	// Only re-render if IDs changed (new message added/removed)
	if (prev.assistantMsgIds.length !== next.assistantMsgIds.length) {
		return false;
	}
	// Check if all IDs are the same
	for (let i = 0; i < prev.assistantMsgIds.length; i++) {
		if (prev.assistantMsgIds[i] !== next.assistantMsgIds[i]) {
			return false;
		}
	}
	// Also check static props
	if (prev.subChatId !== next.subChatId) return false;
	if (prev.chatId !== next.chatId) return false;
	if (prev.isMobile !== next.isMobile) return false;
	if (prev.sandboxSetupStatus !== next.sandboxSetupStatus) return false;
	return true;
}
export function MemoizedAssistantMessages(props: MemoizedAssistantMessagesProps) {
	// This component only re-renders when assistantMsgIds changes
	// During streaming, IDs stay the same, so this doesn't re-render
	// Therefore, MessageItemWrapper is never called, and the store
	// subscription handles updates directly
	return <>
      <For each={props.assistantMsgIds}>
        {(id) => <MessageItemWrapper messageId={id} subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />}
      </For>
    </>;
}
// ============================================================================
// HOOKS FOR ISOLATED RENDERING
// ============================================================================
// Hook to get ALL messages (user + assistant) - Solid memo
export function useAllMessages() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useAllMessages must be used within MessageStoreProvider");
	return createMemo(() => ctx.messages());
}
// Hook to get message groups - computed from store, only updates when messages change
// Returns stable references for groups that haven't changed
interface MessageGroup {
	userMsg: Message;
	assistantMsgIds: string[];
	assistantMsgsCount: number;
}
export function useMessageGroups() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useMessageGroups must be used within MessageStoreProvider");
	return createMemo(() => {
		const messages = ctx.messages();
		const groups: MessageGroup[] = [];
		let currentGroup: MessageGroup | null = null;
		for (const msg of messages) {
			if (msg.role === "user") {
				if (currentGroup) groups.push(currentGroup);
				currentGroup = { userMsg: msg, assistantMsgIds: [], assistantMsgsCount: 0 };
			} else if (currentGroup && msg.role === "assistant") {
				currentGroup.assistantMsgIds.push(msg.id);
				currentGroup.assistantMsgsCount++;
			}
		}
		if (currentGroup) groups.push(currentGroup);
		return groups;
	});
}
// ============================================================================
// MESSAGES LIST - Only re-renders when message IDs change (add/remove)
// ============================================================================
interface MessagesListProps {
	subChatId: string;
	chatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
}
export function MessagesList(props: MessagesListProps) {
	const messageIds = useMessageIds();
	return <>
      <For each={messageIds()}>
        {(id) => <MessageItemWrapper messageId={id} subChatId={props.subChatId} chatId={props.chatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />}
      </For>
    </>;
}
// ============================================================================
// HOOK: useUserMessageIds - Only returns user message IDs (for groups)
// ============================================================================
export function useUserMessageIds() {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useUserMessageIds must be used within MessageStoreProvider");
	return createMemo(() => ctx.messages().filter((m) => m.role === "user").map((m) => m.id));
}
// ============================================================================
// HOOK: useUserMessageWithAssistants - Get user message and its assistant IDs
// ============================================================================
export function useUserMessageWithAssistants(userMsgId: string) {
	const ctx = useContext(MessageStoreContext);
	if (!ctx) throw new Error("useUserMessageWithAssistants must be used within MessageStoreProvider");
	return createMemo(() => {
		const messages = ctx.messages();
		const userMsg = messages.find((m) => m.id === userMsgId);
		if (!userMsg) {
			return { userMsg: undefined as Message | undefined, assistantMsgIds: [] as string[], isLastGroup: false };
		}
		const userIndex = messages.findIndex((m) => m.id === userMsgId);
		const assistantMsgIds: string[] = [];
		for (let i = userIndex + 1; i < messages.length; i++) {
			const msg = messages[i];
			if (msg.role === "user") break;
			if (msg.role === "assistant") assistantMsgIds.push(msg.id);
		}
		const userMsgIds = messages.filter((m) => m.role === "user").map((m) => m.id);
		const isLastGroup = userMsgIds[userMsgIds.length - 1] === userMsgId;
		return { userMsg, assistantMsgIds, isLastGroup };
	});
}
// ============================================================================
// ISOLATED MESSAGE GROUP - Renders a single user message + its assistants
// ============================================================================
// This component subscribes to ONE user message and its assistant IDs.
// It only re-renders when:
// - The user message content changes
// - New assistant messages are added to this group
// - This becomes/stops being the last group
interface SimpleIsolatedGroupProps {
	userMsgId: string;
	subChatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
	isSubChatsSidebarOpen: boolean;
	stickyTopClass: string;
	sandboxSetupError?: string;
	onRetrySetup?: () => void;
	// Components passed from parent - must be stable references
	UserBubbleComponent: Component<{
		messageId: string;
		textContent: string;
		imageParts: any[];
		skipTextMentionBlocks?: boolean;
	}>;
	ToolCallComponent: Component<{
		icon: any;
		title: string;
		isPending: boolean;
		isError: boolean;
	}>;
	MessageGroupComponent: Component<{
		children: JSX.Element;
	}>;
	toolRegistry: Record<string, {
		icon: any;
		title: (args: any) => string;
	}>;
}
function areSimpleGroupPropsEqual(prev: SimpleIsolatedGroupProps, next: SimpleIsolatedGroupProps): boolean {
	return prev.userMsgId === next.userMsgId && prev.subChatId === next.subChatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.isSubChatsSidebarOpen === next.isSubChatsSidebarOpen && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupComponent === next.MessageGroupComponent && prev.toolRegistry === next.toolRegistry;
}
export function SimpleIsolatedGroup(props: SimpleIsolatedGroupProps) {
	const groupData = useUserMessageWithAssistants(props.userMsgId);
	const streamingStatus = useStreamingStatus();
	const userMsg = () => groupData().userMsg;
	const assistantMsgIds = () => groupData().assistantMsgIds;
	const isLastGroup = () => groupData().isLastGroup;
	const isStreaming = () => streamingStatus().isStreaming;
	const rawTextContent = createMemo(() => {
		const msg = userMsg();
		return msg ? (msg.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n") || "") : "";
	});
	const imageParts = createMemo(() => userMsg()?.parts?.filter((p: any) => p.type === "data-image") || []);
	return <props.MessageGroupComponent>
      <Show when={userMsg()}>
        {(msg) => {
          const raw = rawTextContent();
          const images = imageParts();
          const ids = assistantMsgIds();
          const isLast = isLastGroup();
          const streaming = isStreaming();
          const shouldShowCloning = props.sandboxSetupStatus === "cloning" && isLast && ids.length === 0;
          const shouldShowSetupError = props.sandboxSetupStatus === "error" && isLast && ids.length === 0;
          const { textMentions: mentions, cleanedText: content } = extractTextMentions(raw);
          return <>
      <Show when={images.length > 0}>
        <div class="mb-2 pointer-events-auto">
          <props.UserBubbleComponent messageId={msg.id} textContent="" imageParts={images} skipTextMentionBlocks />
        </div>
      </Show>
      <Show when={mentions.length > 0}>
        <div class="mb-2 pointer-events-auto">
          <TextMentionBlocks mentions={mentions} />
        </div>
      </Show>
      <div data-user-message-id={msg.id} class={`[&>div]:!mb-4 pointer-events-auto sticky z-10 ${props.stickyTopClass}`}>
        <Show when={!content.trim() && (images.length > 0 || mentions.length > 0)} fallback={<props.UserBubbleComponent messageId={msg.id} textContent={content} imageParts={[]} skipTextMentionBlocks />}>
          <div class="flex justify-start drop-shadow-[0_10px_20px_hsl(var(--background))]" data-user-bubble>
            <div class="space-y-2 w-full">
              <div class="bg-input-background border px-3 py-2 rounded-xl text-sm text-muted-foreground italic">
                {(() => {
                  const parts: string[] = [];
                  if (images.length > 0) parts.push(images.length === 1 ? "image" : `${images.length} images`);
                  const quoteCount = mentions.filter((m) => m.type === "quote" || m.type === "pasted").length;
                  const codeCount = mentions.filter((m) => m.type === "diff").length;
                  if (quoteCount > 0) parts.push(quoteCount === 1 ? "selected text" : `${quoteCount} text selections`);
                  if (codeCount > 0) parts.push(codeCount === 1 ? "code selection" : `${codeCount} code selections`);
                  return `Using ${parts.join(", ")}`;
                })()}
              </div>
            </div>
          </div>
        </Show>
        <Show when={shouldShowCloning}>
          <div class="mt-4">
            <props.ToolCallComponent icon={props.toolRegistry["tool-cloning"]?.icon} title={props.toolRegistry["tool-cloning"]?.title({}) || "Cloning..."} isPending={true} isError={false} />
          </div>
        </Show>
        <Show when={shouldShowSetupError}>
          <div class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div class="flex items-center gap-2 text-destructive text-sm">
              <span>Failed to set up sandbox{props.sandboxSetupError ? `: ${props.sandboxSetupError}` : ""}</span>
              <Show when={props.onRetrySetup}>
                <button class="px-2 py-1 text-sm hover:bg-destructive/20 rounded" onClick={props.onRetrySetup}>Retry</button>
              </Show>
            </div>
          </div>
        </Show>
      </div>
      <Show when={ids.length > 0}>
        <MemoizedAssistantMessages assistantMsgIds={ids} subChatId={props.subChatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} />
      </Show>
      <Show when={streaming && isLast && ids.length === 0 && props.sandboxSetupStatus === "ready"}>
        <div class="mt-4">
          <props.ToolCallComponent icon={props.toolRegistry["tool-planning"]?.icon} title={props.toolRegistry["tool-planning"]?.title({}) || "Planning..."} isPending={true} isError={false} />
        </div>
      </Show>
    </>;
        }}
      </Show>
    </props.MessageGroupComponent>;
}
// ============================================================================
// SIMPLE ISOLATED MESSAGES LIST - Renders all message groups
// ============================================================================
interface SimpleIsolatedListProps {
	subChatId: string;
	isMobile: boolean;
	sandboxSetupStatus: "cloning" | "ready" | "error";
	isSubChatsSidebarOpen: boolean;
	stickyTopClass: string;
	sandboxSetupError?: string;
	onRetrySetup?: () => void;
	UserBubbleComponent: SimpleIsolatedGroupProps["UserBubbleComponent"];
	ToolCallComponent: SimpleIsolatedGroupProps["ToolCallComponent"];
	MessageGroupComponent: SimpleIsolatedGroupProps["MessageGroupComponent"];
	toolRegistry: SimpleIsolatedGroupProps["toolRegistry"];
}
function areSimpleListPropsEqual(prev: SimpleIsolatedListProps, next: SimpleIsolatedListProps): boolean {
	return prev.subChatId === next.subChatId && prev.isMobile === next.isMobile && prev.sandboxSetupStatus === next.sandboxSetupStatus && prev.isSubChatsSidebarOpen === next.isSubChatsSidebarOpen && prev.stickyTopClass === next.stickyTopClass && prev.sandboxSetupError === next.sandboxSetupError && prev.onRetrySetup === next.onRetrySetup && prev.UserBubbleComponent === next.UserBubbleComponent && prev.ToolCallComponent === next.ToolCallComponent && prev.MessageGroupComponent === next.MessageGroupComponent && prev.toolRegistry === next.toolRegistry;
}
export function SimpleIsolatedMessagesList(props: SimpleIsolatedListProps) {
	// Subscribe to user message IDs only
	const userMsgIds = useUserMessageIds();
	return <>
      <For each={userMsgIds}>
        {(userMsgId) => (
          <SimpleIsolatedGroup
            userMsgId={userMsgId}
            subChatId={props.subChatId}
            isMobile={props.isMobile}
            sandboxSetupStatus={props.sandboxSetupStatus}
            isSubChatsSidebarOpen={props.isSubChatsSidebarOpen}
            stickyTopClass={props.stickyTopClass}
            sandboxSetupError={props.sandboxSetupError}
            onRetrySetup={props.onRetrySetup}
            UserBubbleComponent={props.UserBubbleComponent}
            ToolCallComponent={props.ToolCallComponent}
            MessageGroupComponent={props.MessageGroupComponent}
            toolRegistry={props.toolRegistry}
          />
        )}
      </For>
    </>;
}
