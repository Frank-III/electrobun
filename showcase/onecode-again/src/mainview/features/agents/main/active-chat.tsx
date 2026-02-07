import type { JSX } from "solid-js";
import { dbg } from "../../../lib/debug-effects";
import { stripEmojis } from "../../../components/chat-markdown-renderer";
import { Button } from "../../../components/ui/button";
import { AgentIcon, AttachIcon, CheckIcon, ClaudeCodeIcon, CollapseIcon, CopyIcon, CursorIcon, ExpandIcon, IconCloseSidebarRight, IconOpenSidebarRight, IconSpinner, IconTextUndo, PauseIcon, VolumeIcon } from "../../../components/ui/icons";
import { Kbd } from "../../../components/ui/kbd";
import { PromptInput, PromptInputActions } from "../../../components/ui/prompt-input";
import { ResizableSidebar } from "../../../components/ui/resizable-sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
// e2b API routes are used instead of useSandboxManager for agents
// import { clearSubChatSelectionAtom, isSubChatMultiSelectModeAtom, selectedSubChatIdsAtom } from "@/lib/atoms/agent-subchat-selection"
import { createRpcChat } from "../lib/rpc-chat";
import type { RpcChat, RpcChatTransport } from "../lib/rpc-chat";
import { useChatSolid } from "../hooks/use-chat-solid";
import type { DiffViewMode } from "../ui/agent-diff-view";
import { batch, createContext, createMemo, createSignal, createEffect, createRenderEffect, For, Index, Match, on, onCleanup, Show, Switch, useContext, mergeProps, splitProps, untrack, type Accessor } from "solid-js";
import { ReactiveSet } from "@solid-primitives/set";
import { ArrowDown, ChevronDown, GitFork, ListTree, TerminalSquare } from "lucide-solid";
import { Motion, Presence } from "solid-motionone";

import { toast } from "solid-sonner";
import type { FileStatus } from "../../../../shared/changes-types";
import { getQueryClient } from "../../../contexts/QueryProvider";
// Analytics removed: trackMessageSent
import { apiFetch } from "../../../lib/api-fetch";
import { chatSourceModeAtom, customClaudeConfigAtom, defaultAgentModeAtom, extendedThinkingEnabledAtom, historyEnabledAtom, isDesktopAtom, isFullscreenAtom, normalizeCustomClaudeConfig, selectedOllamaModelAtom, soundNotificationsEnabledAtom } from "../../../lib/atoms";
import { useRemoteChat } from "../../../lib/hooks/use-remote-chats";
import { remoteApi } from "../../../lib/remote-api";
import { useFileChangeListener, useGitWatcher } from "../../../lib/hooks/use-file-change-listener";
import { appStore } from "../../../lib/app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { transformAgentChatFromRpc } from "../../../lib/transform-chat";
import { cn } from "../../../lib/utils";
import { BUILTIN_SLASH_COMMANDS } from "../commands";
import { isDesktopApp } from "../../../lib/utils/platform";
import { useResolvedHotkeyDisplay } from "../../../lib/hotkeys";
import { ChangesPanel } from "../../changes";
import { DiffCenterPeekDialog } from "../../changes/components/diff-center-peek-dialog";
import { DiffFullPageView } from "../../changes/components/diff-full-page-view";
import { DiffSidebarHeader } from "../../changes/components/diff-sidebar-header";
import { getStatusIndicator } from "../../changes/utils/status";
import { useTerminalStore } from "../../terminal/terminal-store-context";
import { TerminalSidebar } from "../../terminal/terminal-sidebar";
import { agentsChangesPanelCollapsedAtom, agentsChangesPanelWidthAtom, agentsDiffSidebarWidthAtom, agentsPlanSidebarWidthAtom, agentsPreviewSidebarOpenAtom, agentsPreviewSidebarWidthAtom, agentsSubChatsSidebarModeAtom, agentsSubChatUnseenChangesAtom, agentsUnseenChangesAtom, clearLoading, compactingSubChatsAtom, currentPlanPathAtomFamily, diffSidebarOpenAtomFamily, diffViewDisplayModeAtom, filteredDiffFilesAtom, filteredSubChatIdAtom, isCreatingPrAtom, justCreatedIdsAtom, lastSelectedModelIdAtom, loadingSubChatsAtom, MODEL_ID_MAP, pendingAuthRetryMessageAtom, pendingConflictResolutionMessageAtom, pendingBuildPlanSubChatIdAtom, pendingPlanApprovalsAtom, planEditRefetchTriggerAtomFamily, workspaceDiffCacheAtomFamily, pendingPrMessageAtom, pendingReviewMessageAtom, pendingUserQuestionsAtom, planSidebarOpenAtomFamily, QUESTIONS_SKIPPED_MESSAGE, selectedAgentChatIdAtom, selectedCommitAtom, selectedDiffFilePathAtom, setLoading, subChatFilesAtom, subChatModeAtomFamily, undoStackAtom, openLocallyChatIdAtom, type AgentMode, type SelectedCommit, type DiffStatsCache } from "../atoms";
import { AgentSendButton } from "../components/agent-send-button";
import { OpenLocallyDialog } from "../components/open-locally-dialog";
import { PreviewSetupHoverCard } from "../components/preview-setup-hover-card";
import type { TextSelectionSource } from "../context/text-selection-context";
import { TextSelectionProvider } from "../context/text-selection-context";
import { useAgentsFileUpload } from "../hooks/use-agents-file-upload";
import { useAutoImport } from "../hooks/use-auto-import";
import { useChangedFilesTracking } from "../hooks/use-changed-files-tracking";
import { useDesktopNotifications } from "../hooks/use-desktop-notifications";
import { useFocusInputOnEnter } from "../hooks/use-focus-input-on-enter";
import { useHaptic } from "../hooks/use-haptic";
import { useTextContextSelection } from "../hooks/use-text-context-selection";
import { usePastedTextFiles } from "../hooks/use-pasted-text-files";
import { useToggleFocusOnCmdEsc } from "../hooks/use-toggle-focus-on-cmd-esc";
import { clearSubChatDraft, getSubChatDraftFull } from "../lib/drafts";
import { IPCChatTransport } from "../lib/ipc-chat-transport";
import { RemoteChatTransport } from "../lib/remote-chat-transport";
import { createQueueItem, generateQueueId, toQueuedFile, toQueuedImage, toQueuedTextContext } from "../lib/queue-utils";
import { createLocalChatQueryOptions } from "../lib/local-chat-query";
import { MENTION_PREFIXES, type AgentsMentionsEditorHandle } from "../mentions";
import { ChatSearchBar, chatSearchCurrentMatchAtom, SearchHighlightProvider } from "../search";
import { agentChatStore } from "../stores/agent-chat-store";
import { EMPTY_QUEUE, useMessageQueueStore } from "../stores/message-queue-store";
import { clearSubChatCaches, isRollingBackAtom, rollbackHandlerAtom, syncMessagesWithStatus } from "../stores/message-store";
import type { Message as StoreMessage } from "../stores/message-store";
import { useStreamingStatusStore } from "../stores/streaming-status-store";
import { useAgentSubChatStore, type SubChatMeta } from "../stores/sub-chat-store";
import { AgentDiffView, diffViewModeAtom, splitUnifiedDiffByFile, type AgentDiffViewRef, type ParsedDiffFile } from "../ui/agent-diff-view";
import { AgentPlanSidebar } from "../ui/agent-plan-sidebar";
import { AgentPreview } from "../ui/agent-preview";
import { AgentQueueIndicator } from "../ui/agent-queue-indicator";
import { AgentToolCall } from "../ui/agent-tool-call";
import { AgentToolRegistry } from "../ui/agent-tool-registry";
import { isPlanFile } from "../ui/agent-tool-utils";
import { AgentUserMessageBubble } from "../ui/agent-user-message-bubble";
import { AgentUserQuestion, type AgentUserQuestionHandle } from "../ui/agent-user-question";
import { AgentsHeaderControls } from "../ui/agents-header-controls";
import { ChatTitleEditor } from "../ui/chat-title-editor";
import { MobileChatHeader } from "../ui/mobile-chat-header";
import { QuickCommentInput } from "../ui/quick-comment-input";
import { SubChatSelector } from "../ui/sub-chat-selector";
import { SubChatStatusCard } from "../ui/sub-chat-status-card";
import { TextSelectionPopover } from "../ui/text-selection-popover";
import { autoRenameAgentChat } from "../utils/auto-rename";
import { generateCommitToPrMessage, generatePrMessage, generateReviewMessage } from "../utils/pr-message";
import { DiffStateContext, DiffSidebarRenderer, useDiffState, type Ref } from "./active-chat-diff-sidebar";
import { ChatInputArea } from "./chat-input-area";
import { IsolatedMessagesSection } from "./isolated-messages-section";
import { DetailsSidebar } from "../../details-sidebar/details-sidebar";
import { detailsSidebarOpenAtom, unifiedSidebarEnabledAtom } from "../../details-sidebar/atoms";
import type { UIMessage } from "../../../../shared/chat-rpc";
// NOTE: desktopRpc already imported above (line 31)
const selectedSubChatIdsAtom = createSignal(new ReactiveSet<string>());
const isSubChatMultiSelectModeAtom = createMemo(() => selectedSubChatIdsAtom[0]().size > 0);
// import { selectedTeamIdAtom } from "@/lib/atoms/team"
const selectedTeamIdAtom = createSignal<string | null>(null);
// import type { PlanType } from "@/lib/config/subscription-plans"
type PlanType = string;
// Set to true to enable verbose diff/chat transport logging
const DEBUG_AGENTS_DIFF = false;

// UTF-8 safe base64 encoding (btoa doesn't support Unicode)
function utf8ToBase64(str: string): string {
	const bytes = new TextEncoder().encode(str);
	const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
	return btoa(binString);
}
// Exploring tools - these get grouped when 2+ consecutive
const EXPLORING_TOOLS = new Set([
	"tool-Read",
	"tool-Grep",
	"tool-Glob",
	"tool-WebSearch",
	"tool-WebFetch"
]);
// Group consecutive exploring tools into exploring-group
function groupExploringTools(parts: any[], nestedToolIds: Set<string>): any[] {
	const result: any[] = [];
	let currentGroup: any[] = [];
	for (const part of parts) {
		// Skip nested tools - they shouldn't be grouped, they render inside parent
		const isNested = part.toolCallId && nestedToolIds.has(part.toolCallId);
		if (EXPLORING_TOOLS.has(part.type) && !isNested) {
			currentGroup.push(part);
		} else {
			// Flush group if 3+
			if (currentGroup.length >= 3) {
				result.push({
					type: "exploring-group",
					parts: currentGroup
				});
			} else {
				result.push(...currentGroup);
			}
			currentGroup = [];
			result.push(part);
		}
	}
	// Flush remaining
	if (currentGroup.length >= 3) {
		result.push({
			type: "exploring-group",
			parts: currentGroup
		});
	} else {
		result.push(...currentGroup);
	}
	return result;
}
// Get the ID of the first sub-chat by creation date
function getFirstSubChatId(subChats: Array<{
	id: string;
	created_at?: Date | string | null;
}> | undefined): string | null {
	if (!subChats?.length) return null;
	const sorted = [...subChats].sort((a, b) => (a.created_at ? new Date(a.created_at).getTime() : 0) - (b.created_at ? new Date(b.created_at).getTime() : 0));
	return sorted[0]?.id ?? null;
}
// Layout constants for chat header and sticky messages
const CHAT_LAYOUT = {
	paddingTopSidebarOpen: "pt-12",
	paddingTopSidebarClosed: "pt-4",
	paddingTopMobile: "pt-14",
	stickyTopSidebarOpen: "top-0",
	stickyTopSidebarClosed: "top-0",
	stickyTopMobile: "top-0",
	headerPaddingSidebarOpen: "pt-1.5 pb-12 px-3 pl-2",
	headerPaddingSidebarClosed: "p-2 pt-1.5"
} as const;
// Codex icon (OpenAI style)
const CodexIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>;
// Model options for Claude Code
const claudeModels = [
	{
		id: "opus",
		name: "Opus"
	},
	{
		id: "sonnet",
		name: "Sonnet"
	},
	{
		id: "haiku",
		name: "Haiku"
	}
];
const EXTENDED_THINKING_MAX_TOKENS = 128_000;
// Agent providers
const agents = [
	{
		id: "claude-code",
		name: "Claude Code",
		hasModels: true
	},
	{
		id: "cursor",
		name: "Cursor CLI",
		disabled: true
	},
	{
		id: "codex",
		name: "OpenAI Codex",
		disabled: true
	}
];
// Helper function to get agent icon
const getAgentIcon = (agentId: string, cls?: string) => {
	switch (agentId) {
		case "claude-code": return <ClaudeCodeIcon class={cls} />;
		case "cursor": return <CursorIcon class={cls} />;
		case "codex": return <CodexIcon class={cls} />;
		default: return null;
	}
};
// Copy button component with tooltip feedback (matches project style)
interface CopyButtonProps {
	onCopy: () => void;
	isMobile?: boolean;
}
function CopyButton(props: CopyButtonProps) {
	const merged = mergeProps({ isMobile: false }, props);
	const [copied, setCopied] = createSignal(false);
	const { trigger: triggerHaptic } = useHaptic();
	const handleCopy = () => {
		merged.onCopy();
		triggerHaptic("medium");
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	return <button onClick={handleCopy} tabIndex={-1} class="p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]">
      <div class="relative w-3.5 h-3.5">
        <CopyIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
        <CheckIcon class={cn("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
      </div>
    </button>;
}
// Play button component for TTS (text-to-speech) with streaming support
type PlayButtonState = "idle" | "loading" | "playing";
const PLAYBACK_SPEEDS = [
	1,
	2,
	3
] as const;
type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
function PlayButton(rawProps: {
	text: string;
	isMobile?: boolean;
	playbackRate?: PlaybackSpeed;
	onPlaybackRateChange?: (rate: PlaybackSpeed) => void;
}) {
	const props = mergeProps({ isMobile: false, playbackRate: 1 as PlaybackSpeed }, rawProps);
	const [state, setState] = createSignal<"idle" | "loading" | "playing">("idle");
	const [audioRef, setAudioRef] = createSignal<HTMLAudioElement | null>(null);
	const [mediaSourceRef, setMediaSourceRef] = createSignal<MediaSource | null>(null);
	const [sourceBufferRef, setSourceBufferRef] = createSignal<SourceBuffer | null>(null);
	const [abortControllerRef, setAbortControllerRef] = createSignal<AbortController | null>(null);
	const [chunkCountRef, setChunkCountRef] = createSignal(0);
	// Update playback rate when it changes
	createEffect(() => {
		const audio = audioRef();
		if (audio) {
			audio.playbackRate = props.playbackRate;
		}
	});
	const cleanup = () => {
		const ac = abortControllerRef();
		if (ac) {
			ac.abort();
			setAbortControllerRef(null);
		}
		const audio = audioRef();
		if (audio) {
			audio.pause();
			if (audio.src) {
				URL.revokeObjectURL(audio.src);
			}
			setAudioRef(null);
		}
		const ms = mediaSourceRef();
		if (ms && ms.readyState === "open") {
			try {
				ms.endOfStream();
			} catch {}
		}
		setMediaSourceRef(null);
		setSourceBufferRef(null);
		setChunkCountRef(0);
	};
	const handlePlay = async () => {
		// If playing, stop the audio
		if (state() === "playing") {
			cleanup();
			setState("idle");
			return;
		}
		// If loading, cancel and reset
		if (state() === "loading") {
			cleanup();
			setState("idle");
			return;
		}
		// Start loading
		setState("loading");
		setChunkCountRef(0);
		try {
			// Check if MediaSource is supported for streaming
			const supportsMediaSource = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg");
			if (supportsMediaSource) {
				// Use streaming approach with MediaSource API
				await playWithStreaming();
			} else {
				// Fallback: wait for full response (Safari, older browsers)
				await playWithFallback();
			}
		} catch (error) {
			if ((error as Error).name !== "AbortError") {
				console.error("[PlayButton] TTS error:", error);
			}
			cleanup();
			setState("idle");
		}
	};
	const playWithStreaming = async () => {
		const mediaSource = new MediaSource();
		setMediaSourceRef(mediaSource);
		const audio = new Audio();
		setAudioRef(audio);
		audio.src = URL.createObjectURL(mediaSource);
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		// Track if we've already started playing
		let hasStartedPlaying = false;
		// Start playback when browser has enough data (canplay event)
		audio.oncanplay = async () => {
			if (hasStartedPlaying) return;
			hasStartedPlaying = true;
			try {
				await audio.play();
				audio.playbackRate = props.playbackRate;
				setState("playing");
			} catch {
				cleanup();
				setState("idle");
			}
		};
		// Wait for MediaSource to open
		await new Promise<void>((resolve, reject) => {
			mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
			mediaSource.addEventListener("error", () => reject(new Error("MediaSource error")), { once: true });
		});
		const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
		setSourceBufferRef(sourceBuffer);
		// Create abort controller for this request
		const ac = new AbortController();
		setAbortControllerRef(ac);
		const fetchStartTime = Date.now();
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: props.text }),
			signal: ac.signal
		});
		if (!response.ok) {
			throw new Error("TTS request failed");
		}
		if (!response.body) {
			throw new Error("No response body");
		}
		const reader = response.body.getReader();
		const pendingChunks: Uint8Array[] = [];
		let isAppending = false;
		const appendNextChunk = () => {
			const sb = sourceBufferRef();
			if (isAppending || pendingChunks.length === 0 || !sb || sb.updating) {
				return;
			}
			isAppending = true;
			const chunk = pendingChunks.shift()!;
			try {
				// Use ArrayBuffer.isView to ensure TypeScript knows this is a valid BufferSource
				const buffer = new Uint8Array(chunk.buffer.slice(0)) as BufferSource;
				sb.appendBuffer(buffer);
			} catch {
				// Buffer might be full or source closed
				isAppending = false;
			}
		};
		sourceBuffer.addEventListener("updateend", () => {
			isAppending = false;
			appendNextChunk();
		});
		// Read stream chunks
		const processStream = async () => {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					// Wait for all pending chunks to be appended
					while (pendingChunks.length > 0 || sourceBuffer.updating) {
						await new Promise((r) => setTimeout(r, 50));
					}
					if (mediaSource.readyState === "open") {
						try {
							mediaSource.endOfStream();
						} catch {}
					}
					break;
				}
				if (value) {
					setChunkCountRef((c) => c + 1);
					pendingChunks.push(value);
					appendNextChunk();
				}
			}
		};
		// Start processing stream - playback will start via canplay event
		processStream();
	};
	const playWithFallback = async () => {
		const ac = new AbortController();
		setAbortControllerRef(ac);
		const response = await apiFetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: props.text }),
			signal: ac.signal
		});
		if (!response.ok) {
			throw new Error("TTS request failed");
		}
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);
		const audio = new Audio(audioUrl);
		setAudioRef(audio);
		audio.onended = () => {
			cleanup();
			setState("idle");
		};
		audio.onerror = () => {
			cleanup();
			setState("idle");
		};
		await audio.play();
		// Set playback rate AFTER play() - browser resets it when setting src
		audio.playbackRate = props.playbackRate;
		setState("playing");
	};
	// Cleanup on unmount
	createEffect(() => {
		return cleanup;
	});
	return <div class="relative flex items-center">
      <button onClick={handlePlay} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", state() === "loading" && "cursor-wait")}>
        <div class="relative w-3.5 h-3.5">
          <Show when={state() === "loading"} fallback={<Show when={state() === "playing"} fallback={<VolumeIcon class="w-3.5 h-3.5 text-muted-foreground" />}><PauseIcon class="w-3.5 h-3.5 text-muted-foreground" /></Show>}><IconSpinner class="w-3.5 h-3.5 text-muted-foreground animate-spin" /></Show>
        </div>
      </button>

      {	/* Speed selector - cyclic button with animation, only visible when playing */}
      <Show when={state() === "playing"}><button onClick={() => {
 const currentIndex = PLAYBACK_SPEEDS.indexOf(props.playbackRate);
		const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
		props.onPlaybackRateChange?.(PLAYBACK_SPEEDS[nextIndex]);
	}} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", props.isMobile ? "opacity-100" : "opacity-0 group-hover/message:opacity-100")}>
          <div class="relative w-4 h-3.5 flex items-center justify-center">
            <For each={PLAYBACK_SPEEDS}>
              {(speed) => (
                <span class={cn("absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground transition-[opacity,transform] duration-200 ease-out", speed === props.playbackRate ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                  {speed}x
                </span>
              )}
            </For>
          </div>
        </button></Show>
    </div>;
}
// Rollback button component for reverting to a previous message state
function RollbackButton(rawProps: {
	disabled?: boolean;
	onRollback: () => void;
	isRollingBack?: boolean;
}) {
	const props = mergeProps({ disabled: false, isRollingBack: false }, rawProps);
	return <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={props.onRollback} disabled={props.disabled || props.isRollingBack} tabIndex={-1} class={cn("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", props.isRollingBack && "opacity-50 cursor-not-allowed")}>
          <IconTextUndo class="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {props.isRollingBack ? "Rolling back..." : "Rollback to here"}
      </TooltipContent>
    </Tooltip>;
}
// Isolated scroll-to-bottom button - uses own scroll listener to avoid re-renders of parent
function ScrollToBottomButton(rawProps: {
	containerRef: Accessor<HTMLElement | null>;
	onScrollToBottom: () => void;
	hasStackedCards?: boolean;
	subChatId?: string;
	isActive?: boolean;
}) {
	const props = mergeProps({ hasStackedCards: false, isActive: true }, rawProps);
	const [isVisible, setIsVisible] = createSignal(false);
	// Keep isActive in ref for scroll event handler
	const [isActiveRef, setIsActiveRef] = createSignal(props.isActive);
	createEffect(on(() => props.isActive, (val) => setIsActiveRef(val)));
	createEffect(() => {
		// Skip scroll monitoring for inactive tabs (keep-alive)
		if (!props.isActive) return;
		const container = props.containerRef();
		if (!container) return;
		// RAF throttle to avoid setState on every scroll event
		let rafId: number | null = null;
		let lastAtBottom: boolean | null = null;
		const checkVisibility = () => {
			// Skip if not active or RAF already pending
			if (!isActiveRef() || rafId !== null) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				// Double-check active state in RAF callback
				if (!isActiveRef()) return;
				const threshold = 50;
				const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
				// Only update state if value actually changed
				if (lastAtBottom !== atBottom) {
					lastAtBottom = atBottom;
					setIsVisible(!atBottom);
				}
			});
		};
		// Check initial state after a short delay to allow scroll position to be set
		// This handles the case when entering a sub-chat that's scrolled to a specific position
		const timeoutId = setTimeout(() => {
			// Skip if not active
			if (!isActiveRef()) return;
			// Direct check for initial state (no RAF needed)
			const threshold = 50;
			const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
			lastAtBottom = atBottom;
			setIsVisible(!atBottom);
		}, 50);
		container.addEventListener("scroll", checkVisibility, { passive: true });
		onCleanup(() => {
			clearTimeout(timeoutId);
			if (rafId !== null) cancelAnimationFrame(rafId);
			container.removeEventListener("scroll", checkVisibility);
		});
	});
	return <Presence>
      <Show when={isVisible}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Motion.button initial={{
		opacity: 0,
		scale: .96,
		y: 8
	}} animate={{
		opacity: 1,
		scale: 1,
		y: 0
	}} exit={{
		opacity: 0,
		scale: .96,
		y: 8
	}} transition={{
		duration: .2,
		easing: [
			.23,
			1,
			.32,
			1
		]
	}} onClick={props.onScrollToBottom} class={cn("absolute right-4 p-2 rounded-full bg-background border border-border shadow-md hover:bg-accent active:scale-[0.97] transition-colors z-20", props.hasStackedCards ? "bottom-44 sm:bottom-36" : "bottom-32 sm:bottom-24")} aria-label="Scroll to bottom">
              <ArrowDown class="h-4 w-4 text-muted-foreground" />
            </Motion.button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Scroll to bottom
            <span class="inline-flex items-center gap-0.5">
              <Kbd>⌘</Kbd>
              <Kbd>
                <ArrowDown class="h-3 w-3" />
              </Kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      </Show>
    </Presence>;
}
// Message group wrapper - measures user message height for sticky todo positioning
interface MessageGroupProps {
	children: JSX.Element;
	isLastGroup?: boolean;
}
function MessageGroup(props: MessageGroupProps) {
	const [groupRef, setGroupRef] = createSignal<HTMLDivElement | null>(null);
	createEffect(() => {
		const groupEl = groupRef();
		if (!groupEl) return;
		// Find the actual bubble element (not the wrapper which includes gradient)
		const bubbleEl = groupEl.querySelector("[data-user-bubble]") as HTMLDivElement | null;
		if (!bubbleEl) return;
		const updateHeight = () => {
			const height = bubbleEl.offsetHeight;
			// Set CSS variable directly on DOM - no React state, no re-renders
			groupEl.style.setProperty("--user-message-height", `${height}px`);
		};
		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(bubbleEl);
		onCleanup(() => observer.disconnect());
	});
	return <div ref={setGroupRef} class="relative" style={{
		"content-visibility": "auto",
		"contain-intrinsic-size": "auto 200px",
		...props.isLastGroup && { minHeight: "calc(var(--chat-container-height) - 32px)" }
	} as Record<string, string>} data-last-group={props.isLastGroup || undefined}>
      {props.children}
    </div>;
}
// Collapsible steps component for intermediate content before final response
interface CollapsibleStepsProps {
	stepsCount: number;
	children: JSX.Element;
	defaultExpanded?: boolean;
}
function CollapsibleSteps(rawProps: CollapsibleStepsProps) {
	const props = mergeProps({ defaultExpanded: false }, rawProps);
	const [isExpanded, setIsExpanded] = createSignal(props.defaultExpanded);
	return <Show when={props.stepsCount > 0}>
	<div class="mb-2" data-collapsible-steps="true">
      {	/* Header row - styled like AgentToolCall with expand icon on right */}
      <div class="flex items-center justify-between rounded-md py-0.5 px-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsExpanded((prev) => !prev)}>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListTree class="w-3.5 h-3.5 flex-shrink-0" />
          <span class="font-medium whitespace-nowrap">
            {props.stepsCount} {props.stepsCount === 1 ? "step" : "steps"}
          </span>
        </div>
        <button class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95" onClick={(e) => {
 e.stopPropagation();
		setIsExpanded((prev) => !prev);
	}}>
          <div class="relative w-4 h-4">
            <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
            <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
          </div>
        </button>
      </div>
      <Show when={isExpanded()}><div class="mt-1 space-y-1.5">{props.children}</div></Show>
    </div>
	</Show>;
}
// Diff sidebar content component with responsive layout
interface DiffSidebarContentProps {
	worktreePath: string | null;
	selectedFilePath: string | null;
	onFileSelect: (file: {
		path: string;
	}, category: string) => void;
	chatId: string;
	sandboxId: string | null;
	repository: {
		owner: string;
		name: string;
	} | null;
	diffStats: {
		isLoading: boolean;
		hasChanges: boolean;
		fileCount: number;
		additions: number;
		deletions: number;
	};
	setDiffStats: (stats: {
		isLoading: boolean;
		hasChanges: boolean;
		fileCount: number;
		additions: number;
		deletions: number;
	}) => void;
	diffContent: string | null;
	parsedFileDiffs: ParsedDiffFile[] | null;
	prefetchedFileContents: Record<string, string> | undefined;
	setDiffCollapseState?: (state: { allCollapsed: boolean; allExpanded: boolean }) => void;
	diffViewRef: Ref<{
		expandAll: () => void;
		collapseAll: () => void;
		getViewedCount: () => number;
		markAllViewed: () => void;
		markAllUnviewed: () => void;
	} | null>;
	agentChat: {
		prUrl?: string | null;
		prNumber?: number | null;
	} | null | undefined;
	// Real-time sidebar width for responsive layout during resize
	sidebarWidth: number;
	// Commit with AI
	onCommitWithAI?: () => void;
	isCommittingWithAI?: boolean;
	// Diff view mode
	diffMode: DiffViewMode;
	setDiffMode: (mode: DiffViewMode) => void;
	// Create PR callback
	onCreatePr?: () => void;
	// Called after successful commit to reset diff view state
	onCommitSuccess?: () => void;
	// Subchats with changed files for filtering
	subChats?: Array<{
		id: string;
		name: string;
		filePaths: string[];
		fileCount: number;
	}>;
	// Initial subchat filter (e.g., from Review button)
	initialSubChatFilter?: string | null;
	// Callback when marking file as viewed to select next file
	onSelectNextFile?: (filePath: string) => void;
}
// Memoized commit file item for History tab
function CommitFileItem(props: {
	file: {
		path: string;
		status: FileStatus;
	};
	onClick: () => void;
}) {
	const fileName = createMemo(() => props.file.path.split("/").pop() || props.file.path);
	const dirPath = createMemo(() => props.file.path.includes("/") ? props.file.path.substring(0, props.file.path.lastIndexOf("/")) : "");
	return <div class={cn("flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors", "hover:bg-muted/80")} onClick={props.onClick}>
      <div class="flex-1 min-w-0 flex items-center overflow-hidden">
        <Show when={dirPath()}><span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
            {dirPath()}/
          </span></Show>
        <span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
          {fileName()}
        </span>
      </div>
      <div class="shrink-0">
        {getStatusIndicator(props.file.status)}
      </div>
    </div>;
}
function DiffSidebarContent(rawProps: Omit<DiffSidebarContentProps, "selectedFilePath" | "onFileSelect" | "onCommitSuccess" | "initialSubChatFilter" | "onSelectNextFile">) {
	const props = mergeProps({ isCommittingWithAI: false, subChats: [] as Array<{ id: string; name: string; filePaths: string[]; fileCount: number }> }, rawProps);
	// Get values from context instead of props
	const { selectedFilePath, filteredSubChatId, handleDiffFileSelect, handleSelectNextFile, handleCommitSuccess, handleViewedCountChange, resetActiveTabRef, setResetActiveTabRef } = useDiffState();
	// Compute initial selected file synchronously for first render
	// This prevents AgentDiffView from rendering all files before filter kicks in
	const initialSelectedFile = createMemo(() => {
		if (selectedFilePath) return selectedFilePath;
		if (props.parsedFileDiffs && props.parsedFileDiffs.length > 0) {
			const firstFile = props.parsedFileDiffs[0];
			const filePath = firstFile.newPath !== "/dev/null" ? firstFile.newPath : firstFile.oldPath;
			if (filePath && filePath !== "/dev/null") {
				return filePath;
			}
		}
		return null;
	});
	const [changesPanelWidth, setChangesPanelWidth] = agentsChangesPanelWidthAtom;
	const [isChangesPanelCollapsed, setIsChangesPanelCollapsed] = agentsChangesPanelCollapsedAtom;
	const [isResizing, setIsResizing] = createSignal(false);
	// Active tab state (Changes/History)
	const [activeTab, setActiveTab] = createSignal("changes");
	// Register the reset function so handleCloseDiff can reset to "changes" tab before closing
	// This prevents React 19 ref cleanup issues with HistoryView's ContextMenu components
	createEffect(() => {
		setResetActiveTabRef(() => setActiveTab("changes"));
		onCleanup(() => {
			setResetActiveTabRef(null);
		});
	});
	// Selected commit for History tab
	const [selectedCommit, setSelectedCommit] = selectedCommitAtom;
	// When sidebar is narrow (< 500px), use vertical layout
	const isNarrow = props.sidebarWidth < 500;
	// Get diff stats for collapsed header display
	type GitStatusResult = { staged?: unknown[]; unstaged?: unknown[]; untracked?: unknown[]; pushCount?: number };
	const diffStatusQuery = useQuery(() => ({
		queryKey: ["changes", "getStatus", props.worktreePath || ""] as const,
		queryFn: async (): Promise<GitStatusResult> =>
			(await desktopRpc.changes.getStatus({ worktreePath: props.worktreePath || "" })) ?? {},
		enabled: !!props.worktreePath && isNarrow,
	}));
	const diffStatus = () => diffStatusQuery.data;
	// Handle resize drag
	const handleResizePointerDown = (event: PointerEvent) => {
		if (event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = changesPanelWidth();
		const pointerId = event.pointerId;
		const handleElement = event.currentTarget as HTMLElement;
		const minWidth = 200;
		const maxWidth = 450;
		const clampWidth = (width: number) => Math.max(minWidth, Math.min(maxWidth, width));
		handleElement.setPointerCapture?.(pointerId);
		setIsResizing(true);
		const handlePointerMove = (e: PointerEvent) => {
			const delta = e.clientX - startX;
			const newWidth = clampWidth(startWidth + delta);
			setChangesPanelWidth(newWidth);
		};
		const handlePointerUp = () => {
			if (handleElement.hasPointerCapture?.(pointerId)) {
				handleElement.releasePointerCapture(pointerId);
			}
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			setIsResizing(false);
		};
		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp, { once: true });
	};
	// Handle commit selection in History tab
	const handleCommitSelect = (commit: SelectedCommit) => {
		setSelectedCommit(commit);
		// Reset file selection when changing commits
		// The HistoryView will auto-select first file
	};
	// Handle file selection in commit (History tab)
	const handleCommitFileSelect = (file: {
		path: string;
	}, commitHash: string) => {
		// Set selected file path for highlighting
		handleDiffFileSelect(file, "");
	};
	// Fetch commit files when a commit is selected
	const commitFilesQuery = useQuery(() => ({
		queryKey: ["changes", "getCommitFiles", props.worktreePath || "", selectedCommit()?.hash || ""] as const,
		queryFn: async (): Promise<Array<{ path: string; status: FileStatus }>> =>
			(await desktopRpc.changes.getCommitFiles({ worktreePath: props.worktreePath || "", commitHash: selectedCommit()?.hash || "" })) ?? [],
		enabled: !!props.worktreePath && !!selectedCommit(),
		staleTime: 6e4,
	}));
	const commitFiles = () => commitFilesQuery.data;
	// Fetch commit file diff when a commit is selected
	const commitFileDiffQuery = useQuery(() => ({
		queryKey: ["changes", "getCommitFileDiff", props.worktreePath || "", selectedCommit()?.hash || "", selectedFilePath || ""] as const,
		queryFn: async (): Promise<string> =>
			(await desktopRpc.changes.getCommitFileDiff({ worktreePath: props.worktreePath || "", commitHash: selectedCommit()?.hash || "", filePath: selectedFilePath || "" })) ?? "",
		enabled: !!props.worktreePath && !!selectedCommit() && !!selectedFilePath,
		staleTime: 6e4,
	}));
	const commitFileDiff = () => commitFileDiffQuery.data;
	// Use commit diff or regular diff based on selection
	// Only use commit data when in History tab, otherwise always use regular diff
	const shouldUseCommitDiff = activeTab() === "history" && selectedCommit();
	const effectiveDiff = shouldUseCommitDiff && commitFileDiff() ? (commitFileDiff() as string) : props.diffContent;
	const effectiveParsedFiles = shouldUseCommitDiff ? null : props.parsedFileDiffs;
	const effectivePrefetchedContents = shouldUseCommitDiff ? undefined : props.prefetchedFileContents;
	return <Show when={isNarrow} fallback={
		// Horizontal layout: files on left, diff on right
		<div class="flex flex-1 min-h-0 overflow-hidden">
      {	/* Left: ChangesPanel (file list + commit) with resize handle */}
      <Show when={props.worktreePath}><div class="h-full flex-shrink-0 relative" style={{ width: `${changesPanelWidth()}px` }}>
          <ChangesPanel worktreePath={props.worktreePath!} selectedFilePath={selectedFilePath} onFileSelect={handleDiffFileSelect} onFileOpenPinned={() => {}} onCreatePr={props.onCreatePr} onCommitSuccess={handleCommitSuccess} subChats={props.subChats} initialSubChatFilter={filteredSubChatId} chatId={props.chatId} selectedCommitHash={selectedCommit()?.hash ?? undefined} onCommitSelect={handleCommitSelect} onCommitFileSelect={handleCommitFileSelect} onActiveTabChange={setActiveTab} pushCount={(diffStatus() as { pushCount?: number } | undefined)?.pushCount} />
          { /* Resize handle - styled like ResizableSidebar */}
          <div onPointerDown={handleResizePointerDown} class="absolute top-0 bottom-0 cursor-col-resize z-10" style={{
 right: 0,
		width: "4px",
		"margin-right": "-2px"
	}} />
        </div></Show>
      {	/* Right: File list (when History tab) or AgentDiffView (when Changes tab) */}
      { /* Both views are always mounted but hidden via CSS to prevent expensive re-mounts */}
      <div class={cn("flex-1 h-full min-w-0 overflow-hidden relative", "border-l border-border/50")}>
        { /* History view - files in commit */}
        <div class={cn("absolute inset-0 overflow-y-auto", activeTab() === "history" && selectedCommit() ? "z-10" : "z-0 invisible")}>
          <Show when={selectedCommit()}>{(commit) => (
            <Switch>
              <Match when={!commitFiles()}>
                <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Loading files...
                </div>
              </Match>
              <Match when={commitFiles()?.length === 0}>
                <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No files changed in this commit
                </div>
              </Match>
              <Match when={true}>
                { /* Commit message and description */}
                <div class="px-3 py-2 border-b border-border/50">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <div class="text-sm font-medium text-foreground flex-1">
                      {commit().message}
                    </div>
                    <button onClick={() => {
                      navigator.clipboard.writeText(commit().hash);
                      toast.success("Copied SHA to clipboard");
                    }} class="text-xs font-mono text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0">
                      {commit().shortHash}
                    </button>
                  </div>
                  <Show when={commit().description}><div class="text-xs text-foreground/80 mb-2 whitespace-pre-wrap">
                      {commit().description}
                    </div></Show>
                  <div class="text-xs text-muted-foreground">
                    {commit().author} • {commit().date ? new Date(commit().date as string | number | Date).toLocaleString() : "Unknown date"}
                  </div>
                </div>

                <div class="px-2 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b border-border/50">
                  Files in commit ({commitFiles()?.length ?? 0})
                </div>
                <For each={commitFiles() ?? []}>{(file) => <CommitFileItem file={file} onClick={() => {}} />}</For>
              </Match>
            </Switch>
          )}</Show>
        </div>
        {	/* Diff view - always mounted to prevent expensive re-initialization */}
        <div class={cn("absolute inset-0 overflow-hidden", activeTab() === "history" && selectedCommit() ? "z-0 invisible" : "z-10")}>
          <AgentDiffView ref={props.diffViewRef} chatId={props.chatId} sandboxId={props.sandboxId ?? ""} worktreePath={props.worktreePath || undefined} repository={props.repository ? `${props.repository.owner}/${props.repository.name}` : undefined} onStatsChange={props.setDiffStats} initialDiff={effectiveDiff} initialParsedFiles={effectiveParsedFiles} prefetchedFileContents={effectivePrefetchedContents} showFooter={true} onCollapsedStateChange={props.setDiffCollapseState} onSelectNextFile={handleSelectNextFile} onViewedCountChange={handleViewedCountChange} initialSelectedFile={initialSelectedFile() ?? undefined} />
        </div>
      </div>
    </div>
	}>
		{/* Vertical layout: ChangesPanel on top, diff/file list below */}
		<div class="flex flex-col flex-1 min-h-0 overflow-hidden">
        {		/* Top: ChangesPanel (file list + commit) */}
        <Show when={props.worktreePath}><div class={cn("flex-shrink-0 overflow-hidden flex flex-col", "h-[45%] min-h-[200px] border-b border-border/50")}>
            <ChangesPanel worktreePath={props.worktreePath!} selectedFilePath={selectedFilePath} onFileSelect={handleDiffFileSelect} onFileOpenPinned={() => {}} onCreatePr={props.onCreatePr} onCommitSuccess={handleCommitSuccess} subChats={props.subChats} initialSubChatFilter={filteredSubChatId} chatId={props.chatId} selectedCommitHash={selectedCommit()?.hash ?? undefined} onCommitSelect={handleCommitSelect} onCommitFileSelect={handleCommitFileSelect} onActiveTabChange={setActiveTab} pushCount={(diffStatus() as { pushCount?: number } | undefined)?.pushCount} />
          </div></Show>
        { /* Bottom: File list (when History tab + commit selected) or AgentDiffView (diff) */}
        { /* Both views are always mounted but hidden via CSS to prevent expensive re-mounts */}
        <div class="flex-1 overflow-hidden flex flex-col relative">
          { /* History view - files in commit */}
          <div class={cn("absolute inset-0 overflow-y-auto", activeTab() === "history" && selectedCommit() ? "z-10" : "z-0 invisible")}>
            <Show when={selectedCommit()}>{(commit) => (
                <Switch>
                  <Match when={!commitFiles()}>
                    <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      Loading files...
                    </div>
                  </Match>
                  <Match when={commitFiles()?.length === 0}>
                    <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      No files changed in this commit
                    </div>
                  </Match>
                  <Match when={true}>
                    { /* Commit message and description */}
                    <div class="px-3 py-2 border-b border-border/50">
                      <div class="flex items-start justify-between gap-2 mb-1">
                        <div class="text-sm font-medium text-foreground flex-1">
                          {commit().message}
                        </div>
                        <button onClick={() => {
                          navigator.clipboard.writeText(commit().hash);
                          toast.success("Copied SHA to clipboard");
                        }} class="text-xs font-mono text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0">
                          {commit().shortHash}
                        </button>
                      </div>
                      <Show when={commit().description}><div class="text-xs text-foreground/80 mb-2 whitespace-pre-wrap">
                          {commit().description}
                        </div></Show>
                      <div class="text-xs text-muted-foreground">
                        {commit().author} • {commit().date ? new Date(commit().date as string | number | Date).toLocaleString() : "Unknown date"}
                      </div>
                    </div>

                    <div class="px-2 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b border-border/50">
                      Files in commit ({commitFiles()?.length ?? 0})
                    </div>
                    <For each={commitFiles() ?? []}>{(file) => <CommitFileItem file={file} onClick={() => {}} />}</For>
                  </Match>
                </Switch>
              )}</Show>
          </div>
          {		/* Diff view - always mounted to prevent expensive re-initialization */}
          <div class={cn("absolute inset-0 overflow-hidden", activeTab() === "history" && selectedCommit() ? "z-0 invisible" : "z-10")}>
            <AgentDiffView ref={props.diffViewRef} chatId={props.chatId} sandboxId={props.sandboxId ?? ""} worktreePath={props.worktreePath || undefined} repository={props.repository ? `${props.repository.owner}/${props.repository.name}` : undefined} onStatsChange={props.setDiffStats} initialDiff={effectiveDiff} initialParsedFiles={effectiveParsedFiles} prefetchedFileContents={effectivePrefetchedContents} showFooter={false} onCollapsedStateChange={props.setDiffCollapseState} onSelectNextFile={handleSelectNextFile} onViewedCountChange={handleViewedCountChange} initialSelectedFile={initialSelectedFile() ?? undefined} />
          </div>
        </div>
      </div>
	</Show>;
}
// ============================================================================
// DiffStateProvider - manages diff state in isolation from ChatView
// This prevents ChatView from re-rendering when selected file changes
// ============================================================================
interface DiffStateProviderProps {
	isDiffSidebarOpen: boolean;
	parsedFileDiffs: ParsedDiffFile[] | null;
	isDiffSidebarNarrow: boolean;
	setIsDiffSidebarOpen: (open: boolean) => void;
	setDiffStats: (stats: {
		isLoading: boolean;
		hasChanges: boolean;
		fileCount: number;
		additions: number;
		deletions: number;
	}) => void;
	setDiffContent: (content: string | null) => void;
	setParsedFileDiffs: (files: ParsedDiffFile[] | null) => void;
	setPrefetchedFileContents: (contents: Record<string, string>) => void;
	fetchDiffStats: () => void;
	children: JSX.Element;
}
function DiffStateProvider(props: DiffStateProviderProps) {
	// IMPORTANT: Use props.xxx pattern instead of destructuring to preserve SolidJS reactivity
	// Destructuring children would evaluate it immediately before context is set up
	const { isDiffSidebarOpen, parsedFileDiffs, isDiffSidebarNarrow, setIsDiffSidebarOpen, setDiffStats, setDiffContent, setParsedFileDiffs, setPrefetchedFileContents, fetchDiffStats } = props;
	// Viewed count state - kept here to avoid re-rendering ChatView
	const [viewedCount, setViewedCount] = createSignal(0);
	// Ref for resetting activeTab to "changes" before closing
	// This prevents React 19 ref cleanup issues with HistoryView's ContextMenu components
	const [resetActiveTabRef, setResetActiveTabRef] = createSignal<(() => void) | null>(null);
	// All diff-related atoms are read HERE, not in ChatView
	const [selectedFilePath, setSelectedFilePath] = selectedDiffFilePathAtom;
	const [, setFilteredDiffFiles] = filteredDiffFilesAtom;
	const [filteredSubChatId, setFilteredSubChatId] = filteredSubChatIdAtom;
	const isChangesPanelCollapsed = agentsChangesPanelCollapsedAtom[0];
	// Auto-select first file when diff sidebar opens - use useLayoutEffect for synchronous update
	// This prevents the initial render from showing all 11 files before filter kicks in
	createEffect(() => {
		if (!isDiffSidebarOpen) {
			setSelectedFilePath(null);
			setFilteredDiffFiles(null);
			return;
		}
		// Determine which file to select
		let fileToSelect: string | null = selectedFilePath();
		if (!fileToSelect && parsedFileDiffs && Array.isArray(parsedFileDiffs) && parsedFileDiffs.length > 0) {
			const firstFile = (parsedFileDiffs as Array<{ newPath?: string; oldPath?: string }>)[0];
			fileToSelect = firstFile.newPath !== "/dev/null" ? firstFile.newPath ?? firstFile.oldPath ?? null : firstFile.oldPath ?? null;
			if (fileToSelect && fileToSelect !== "/dev/null") {
				setSelectedFilePath(fileToSelect);
			}
		}
		// Filter logic based on layout mode
		const shouldShowAllFiles = isDiffSidebarNarrow && isChangesPanelCollapsed();
		if (shouldShowAllFiles) {
			setFilteredDiffFiles(null);
		} else if (fileToSelect) {
			setFilteredDiffFiles([fileToSelect]);
		} else {
			setFilteredDiffFiles(null);
		}
	});
	// Stable callbacks
	const handleDiffFileSelect = (file: {
		path: string;
	}, _category: string) => {
		setSelectedFilePath(file.path);
		setFilteredDiffFiles([file.path]);
	};
	const handleSelectNextFile = (filePath: string) => {
		setSelectedFilePath(filePath);
		setFilteredDiffFiles([filePath]);
	};
	const handleCommitSuccess = () => {
		setSelectedFilePath(null);
		setFilteredDiffFiles(null);
		setParsedFileDiffs(null);
		setDiffContent(null);
		setPrefetchedFileContents({});
		setDiffStats({
			fileCount: 0,
			additions: 0,
			deletions: 0,
			isLoading: true,
			hasChanges: false
		});
		setTimeout(() => {
			fetchDiffStats();
		}, 500);
	};
	const handleCloseDiff = () => {
		// SolidJS signals update synchronously, no flushSync needed
		resetActiveTabRef()?.();
		setIsDiffSidebarOpen(false);
		setFilteredSubChatId(null);
	};
	const handleViewedCountChange = (count: number) => {
		setViewedCount(count);
	};
	const contextValue = createMemo(() => ({
		selectedFilePath: selectedFilePath(),
		filteredSubChatId: filteredSubChatId(),
		viewedCount: viewedCount(),
		handleDiffFileSelect,
		handleSelectNextFile,
		handleCommitSuccess,
		handleCloseDiff,
		handleViewedCountChange,
		resetActiveTabRef: resetActiveTabRef(),
		setResetActiveTabRef,
	}));
	return <DiffStateContext.Provider value={contextValue()}>
      {props.children}
    </DiffStateContext.Provider>;
}
// Inner chat component - only rendered when chat object is ready
// Memoized to prevent re-renders when parent state changes (e.g., selectedFilePath)
function ChatViewInner(rawProps: {
	chat: RpcChat;
	subChatId: string;
	parentChatId: string;
	isFirstSubChat: boolean;
	onAutoRename: (userMessage: string, subChatId: string) => void;
	onCreateNewSubChat?: () => void;
	refreshDiff?: () => void;
	teamId?: string;
	repository?: string;
	streamId?: string | null;
	isMobile?: boolean;
	sandboxSetupStatus?: "cloning" | "ready" | "error";
	sandboxSetupError?: string;
	onRetrySetup?: () => void;
	isSubChatsSidebarOpen?: boolean;
	sandboxId?: string;
	projectPath?: string;
	isArchived?: boolean;
	onRestoreWorkspace?: () => void;
	existingPrUrl?: string | null;
	isActive?: boolean;
}) {
	const props = mergeProps({ isMobile: false, sandboxSetupStatus: "ready" as const, isSubChatsSidebarOpen: false, isArchived: false, isActive: true }, rawProps);
	const [hasTriggeredRenameRef, setHasTriggeredRenameRef] = createSignal(false);
	const [hasTriggeredAutoGenerateRef, setHasTriggeredAutoGenerateRef] = createSignal(false);
	// Keep isActive in ref for use in callbacks (avoid stale closures)
	const [isActiveRef, setIsActiveRef] = createSignal(props.isActive);
	createEffect(on(() => props.isActive, (val) => setIsActiveRef(val)));
	// Scroll management state (like canvas chat)
	// Using only ref to avoid re-renders on scroll
	const [shouldAutoScrollRef, setShouldAutoScrollRef] = createSignal(true);
	const [isAutoScrollingRef, setIsAutoScrollingRef] = createSignal(false);
	const [isInitializingScrollRef, setIsInitializingScrollRef] = createSignal(false);
	const [hasUnapprovedPlanRef, setHasUnapprovedPlanRef] = createSignal(false);
	const [chatContainerRef, setChatContainerRef] = createSignal<HTMLElement | null>(null);
	// Cleanup isAutoScrollingRef on unmount to prevent stuck state
	createEffect(() => {
		onCleanup(() => {
			setIsAutoScrollingRef(false);
		});
	});
	// Track chat container height via CSS custom property (no re-renders)
	const [chatContainerObserverRef, setChatContainerObserverRef] = createSignal<ResizeObserver | null>(null);
	const [editorRef, setEditorRef] = createSignal<AgentsMentionsEditorHandle | null>(null);
	const [fileInputRef, setFileInputRef] = createSignal<HTMLInputElement | null>(null);
	const [questionRef, setQuestionRef] = createSignal<AgentUserQuestionHandle | null>(null);
	const [prevChatKeyRef, setPrevChatKeyRef] = createSignal<string | null>(null);
	const [prevSubChatIdRef, setPrevSubChatIdRef] = createSignal<string | null>(null);
	// TTS playback rate state (persists across messages and sessions via localStorage)
	const [ttsPlaybackRate, setTtsPlaybackRate] = createSignal<PlaybackSpeed>((() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("tts-playback-rate");
			if (saved && PLAYBACK_SPEEDS.includes(Number(saved) as PlaybackSpeed)) {
				return Number(saved) as PlaybackSpeed;
			}
		}
		return 1 as PlaybackSpeed;
	})());
	// Save playback rate to localStorage when it changes
	const handlePlaybackRateChange = (rate: PlaybackSpeed) => {
		setTtsPlaybackRate(rate);
		localStorage.setItem("tts-playback-rate", String(rate));
	};
	// PR creation loading state - from atom to allow resetting after message sent
	const setIsCreatingPr = isCreatingPrAtom[1];
	// Rollback state
	const [isRollingBack, setIsRollingBack] = createSignal(false);
	// Check if user is at bottom of chat (like canvas)
	const isAtBottom = () => {
		const container = chatContainerRef();
		if (!container) return true;
		const threshold = 50;
		return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
	};
	// Track previous scroll position to detect scroll direction
	const [prevScrollTopRef, setPrevScrollTopRef] = createSignal(0);
	// Handle scroll events to detect user scrolling
	// Updates shouldAutoScrollRef based on scroll direction
	// Using refs only to avoid re-renders on scroll
	const handleScroll = () => {
		// Skip scroll handling for inactive tabs (keep-alive)
		if (!isActiveRef()) return;
		const container = chatContainerRef();
		if (!container) return;
		const currentScrollTop = container.scrollTop;
		const prevScrollTop = prevScrollTopRef();
		setPrevScrollTopRef(currentScrollTop);
		// Ignore scroll events during initialization (content loading)
		if (isInitializingScrollRef()) return;
		// If user scrolls UP - disable auto-scroll immediately
		// This works even during auto-scroll animation (user intent takes priority)
		if (currentScrollTop < prevScrollTop) {
			setShouldAutoScrollRef(false);
			return;
		}
		// Ignore other scroll direction checks during auto-scroll animation
		if (isAutoScrollingRef()) return;
		// If user scrolls DOWN and reaches bottom - enable auto-scroll
		setShouldAutoScrollRef(isAtBottom());
	};
	// Scroll to bottom handler with ease-in-out animation
	const scrollToBottom = () => {
		const container = chatContainerRef();
		if (!container) return;
		setIsAutoScrollingRef(true);
		setShouldAutoScrollRef(true);
		const start = container.scrollTop;
		const duration = 300;
		const startTime = performance.now();
		// Ease-in-out cubic function
		const easeInOutCubic = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		const animateScroll = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeInOutCubic(progress);
			// Calculate end on each frame to handle dynamic content
			const end = container.scrollHeight - container.clientHeight;
			container.scrollTop = start + (end - start) * easedProgress;
			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			} else {
				// Ensure we're at the absolute bottom
				container.scrollTop = container.scrollHeight;
				setIsAutoScrollingRef(false);
			}
		};
		requestAnimationFrame(animateScroll);
	};
	const queryClient = useQueryClient();
	// Get sub-chat name from store (Solid store - no selector, use memo for derived value)
	const subChatStore = useAgentSubChatStore();
	const subChatName = createMemo(() => subChatStore.allSubChats.find((sc: SubChatMeta) => sc.id === props.subChatId)?.name || "");
	// Mutation for renaming sub-chat
	const renameSubChatMutation = useMutation(() => ({
		mutationFn: (args: { subChatId: string; name: string }) =>
			desktopRpc.chats.renameSubChat.mutate({ id: args.subChatId, name: args.name }),
		onError: (error: { data?: { code?: string }; message?: string }) => {
			if (error.data?.code === "NOT_FOUND") {
				toast.error("Send a message first before renaming this chat");
			} else {
				toast.error("Failed to rename chat");
			}
		},
	}));
	// Handler for renaming sub-chat
	// Using ref for mutation to avoid callback recreation
	const [renameSubChatMutationRef, setRenameSubChatMutationRef] = createSignal(renameSubChatMutation);
	createEffect(on(() => renameSubChatMutation, (val) => setRenameSubChatMutationRef(val)));
	const handleRenameSubChat = async (newName: string) => {
		const previousName = subChatName();
		// Optimistic update in store
		useAgentSubChatStore.getState().updateSubChatName(props.subChatId, newName);
		// Save to database
		try {
			await renameSubChatMutationRef().mutateAsync({
				subChatId: props.subChatId,
				name: newName
			});
		} catch {
			// Revert on error (toast shown by mutation onError)
			useAgentSubChatStore.getState().updateSubChatName(props.subChatId, previousName || "New Chat");
		}
	};
	// Plan mode state (per-subChat using atomFamily)
	const [subChatMode, setSubChatMode] = subChatModeAtomFamily(props.subChatId);
	// Mutation for updating sub-chat mode in database
			const updateSubChatModeMutation = useMutation(() => ({
				mutationFn: (args: { subChatId: string; mode: "plan" | "agent" }) =>
					desktopRpc.chats.updateSubChatMode.mutate({ id: args.subChatId, mode: args.mode }),
				onSuccess: () => {
					void queryClient.invalidateQueries({ queryKey: ["chats", "get", props.parentChatId] });
				},
		onError: (error: { message?: string }, variables: { subChatId: string; mode: "plan" | "agent" }) => {
			if (error.message === "Sub-chat not found") {
				console.warn("Sub-chat not found in DB, keeping local mode state");
				return;
			}
			const revertedMode: AgentMode = variables.mode === "plan" ? "agent" : "plan";
			setSubChatMode(revertedMode);
			useAgentSubChatStore.getState().updateSubChatMode(variables.subChatId, revertedMode);
			console.error("Failed to update sub-chat mode:", error.message);
		},
	}));
	// Sync atomFamily mode to Zustand store on mount/subChatId change
	// This ensures the sidebar shows the correct mode icon
	createEffect(() => {
		dbg("Chat:syncMode");
		if (props.subChatId) {
			// Read mode directly from atomFamily to ensure we get the correct value
			const mode = appStore.get(subChatModeAtomFamily(props.subChatId));
			useAgentSubChatStore.getState().updateSubChatMode(props.subChatId, mode);
		}
	});
	// NOTE: We no longer clear caches on deactivation.
	// With proper subChatId isolation, each chat's caches are separate.
	// Caches are only cleared on unmount (when tab is evicted from keep-alive pool).
	// Cleanup message caches on unmount (when tab is evicted from keep-alive)
	// CRITICAL: Use a delayed cleanup to avoid clearing caches during temporary unmount/remount
	// (e.g., React StrictMode, HMR, or parent re-render causing component remount)
	createEffect(() => {
		dbg("Chat:cleanupCaches");
		const currentSubChatId = props.subChatId;
		onCleanup(() => {
			// Delay cache clearing to allow remount to happen first
			// If the component remounts with the same subChatId, the sync will repopulate the atoms
			// If it truly unmounts, the timeout will clear the caches
			const timeoutId = setTimeout(() => {
				clearSubChatCaches(currentSubChatId);
			}, 100);
			(window as any).__pendingCacheCleanups = (window as any).__pendingCacheCleanups || new Map();
			(window as any).__pendingCacheCleanups.set(currentSubChatId, timeoutId);
		});
	});
	// Cancel pending cleanup if we remount with the same subChatId
	createEffect(() => {
		dbg("Chat:cancelCleanup");
		const pendingCleanups = (window as any).__pendingCacheCleanups as Map<string, number> | undefined;
		if (pendingCleanups?.has(props.subChatId)) {
			clearTimeout(pendingCleanups.get(props.subChatId));
			pendingCleanups.delete(props.subChatId);
		}
	});
	// Handle mode changes - updates atomFamily, store, and database together
	// No effect needed - this is called directly when user toggles mode
	const handleModeChange = (newMode: AgentMode) => {
		// Update atomFamily (source of truth for UI)
		setSubChatMode(newMode);
		// Update Zustand store (for other components that read from store)
		useAgentSubChatStore.getState().updateSubChatMode(props.subChatId, newMode);
		// Save to database (skip temp IDs that haven't been persisted yet)
		if (!props.subChatId.startsWith("temp-")) {
			updateSubChatModeMutation.mutate({
				subChatId: props.subChatId,
				mode: newMode
			});
		}
	};
	// File/image upload hook
	const { images, files, handleAddAttachments, removeImage, removeFile, clearAll, isUploading, setImagesFromDraft, setFilesFromDraft } = useAgentsFileUpload();
	// Text context selection hook (for selecting text from assistant messages and diff)
	const { textContexts, diffTextContexts, addTextContext: addTextContextOriginal, addDiffTextContext, removeTextContext, removeDiffTextContext, clearTextContexts, clearDiffTextContexts, textContextsRef, diffTextContextsRef, setTextContextsFromDraft, setDiffTextContextsFromDraft } = useTextContextSelection();
	// Pasted text files (large pasted text saved as files)
	const { pastedTexts, addPastedText, removePastedText, clearPastedTexts, pastedTextsRef } = usePastedTextFiles(props.subChatId);
	// File contents cache - stores content for file mentions (keyed by mentionId)
	// This content gets added to the prompt when sending, without showing a separate card
	const [fileContentsRef, setFileContentsRef] = createSignal<Map<string, string>>(new Map());
	const cacheFileContent = (mentionId: string, content: string) => {
		setFileContentsRef((prev) => {
			const next = new Map(prev);
			next.set(mentionId, content);
			return next;
		});
	};
	const clearFileContents = () => {
		setFileContentsRef(new Map());
	};
	// Clear file contents cache when switching subChats to prevent stale data
	createEffect(() => {
		dbg("Chat:clearFileContents");
		setFileContentsRef(new Map());
	});
	// Quick comment state
	const [quickCommentState, setQuickCommentState] = createSignal<{ selectedText: string; source: TextSelectionSource; rect: DOMRect } | null>(null);
	// Message queue for sending messages while streaming
	const queueStore = useMessageQueueStore();
	const queue = createMemo(() => queueStore.queues[props.subChatId] ?? EMPTY_QUEUE);
	const addToQueue = queueStore.addToQueue;
	const removeFromQueue = queueStore.removeFromQueue;
	const popItemFromQueue = queueStore.popItem;
	// Plan approval pending state (for tool approval loading)
	const [planApprovalPending, setPlanApprovalPending] = createSignal<Record<string, boolean>>({});
	// Track chat changes for rename trigger reset
	const [chatRef, setChatRef] = createSignal<RpcChat | null>(null);
	createEffect(() => {
		dbg("Chat:trackChanges");
		if (prevSubChatIdRef() !== props.subChatId) {
			setHasTriggeredRenameRef(false);
			setHasTriggeredAutoGenerateRef(false);
			untrack(() => setPrevSubChatIdRef(props.subChatId));
		}
		setChatRef(props.chat);
	});
	// Restore draft when subChatId changes (switching between sub-chats)
	const [prevSubChatIdForDraftRef, setPrevSubChatIdForDraftRef] = createSignal<string | null>(null);
	createEffect(() => {
		dbg("Chat:restoreDraft");
		// Restore full draft (text + attachments + text contexts) for new sub-chat
		const savedDraft = props.parentChatId ? getSubChatDraftFull(props.parentChatId, props.subChatId) : null;
		if (savedDraft) {
			// Restore text
			const editor = editorRef();
			if (savedDraft.text) {
				editor?.setValue(savedDraft.text);
			} else {
				editor?.clear();
			}
			// Restore images
			if (savedDraft.images.length > 0) {
				setImagesFromDraft(savedDraft.images);
			} else {
				clearAll();
			}
			// Restore files
			if (savedDraft.files.length > 0) {
				setFilesFromDraft(savedDraft.files);
			}
			// Restore text contexts
			if (savedDraft.textContexts.length > 0) {
				setTextContextsFromDraft(savedDraft.textContexts);
			} else {
				clearTextContexts();
			}
		} else if (prevSubChatIdForDraftRef() && prevSubChatIdForDraftRef() !== props.subChatId) {
			// Clear everything when switching to a sub-chat with no draft
			editorRef()?.clear();
			clearAll();
			clearTextContexts();
		}
		untrack(() => setPrevSubChatIdForDraftRef(props.subChatId));
	});
	// Use subChatId as stable key to prevent HMR-induced duplicate resume requests
	// resume: !!streamId to reconnect to active streams (background streaming support)
	const { messages, sendMessage, status, stop, regenerate, setMessages } = useChatSolid({
		chat: props.chat,
		id: props.subChatId,
		resume: !!props.streamId,
		experimental_throttle: 50
	});
	// Refs for sendMessage/stop to keep callbacks stable across renders
	const [sendMessageRef, setSendMessageRef] = createSignal(sendMessage);
	createEffect(on(() => sendMessage, (val) => setSendMessageRef(() => val)));
	const [stopRef, setStopRef] = createSignal(stop);
	createEffect(on(() => stop, (val) => setStopRef(() => val)));
	const isStreaming = () => status() === "streaming" || status() === "submitted";
	// Ref for isStreaming to use in callbacks/effects that need fresh value
	const [isStreamingRef, setIsStreamingRef] = createSignal(isStreaming());
	createEffect(on(isStreaming, (val) => setIsStreamingRef(val)));
	// Track compacting status from SDK
	const compactingSubChats = compactingSubChatsAtom[0];
	const isCompacting = createMemo(() => compactingSubChats().has(props.subChatId));
	// Desktop/fullscreen state for window drag region
	const isDesktop = isDesktopAtom[0];
	const isFullscreen = isFullscreenAtom[0];
	// Handler to trigger manual context compaction
	const handleCompact = () => {
		if (isStreamingRef()) return;
		sendMessageRef()({
			role: "user",
			parts: [{
				type: "text",
				text: "/compact"
			}]
		});
	};
	// Handler to stop streaming - memoized to prevent ChatInputArea re-renders
	const handleStop = async () => {
		// Mark as manually aborted to prevent completion sound
		agentChatStore.setManuallyAborted(props.subChatId, true);
		await stopRef()();
		// Call DELETE endpoint to cancel server-side stream
		await fetch(`/api/agents/chat?id=${encodeURIComponent(props.subChatId)}`, {
			method: "DELETE",
			credentials: "include"
		});
	};
	// Wrapper for addTextContext that handles TextSelectionSource
	const addTextContext = (text: string, source: TextSelectionSource) => {
		if (source.type === "assistant-message") {
			addTextContextOriginal(text, source.messageId);
		} else if (source.type === "diff") {
			addDiffTextContext(text, source.filePath, source.lineNumber, source.lineType);
		} else if (source.type === "tool-edit") {
			// Tool edit selections are treated as code selections (similar to diff)
			addDiffTextContext(text, source.filePath);
		} else if (source.type === "plan") {
			// Plan selections are treated as code selections (similar to diff)
			addDiffTextContext(text, source.planPath);
		}
	};
	// Focus handler for text selection popover - focus chat input after adding to context
	const handleFocusInput = () => {
		editorRef()?.focus();
	};
	// Handler for quick comment trigger from popover
	const handleQuickComment = (text: string, source: TextSelectionSource, rect: DOMRect) => {
		setQuickCommentState({
			selectedText: text,
			source,
			rect
		});
	};
	// Handler for quick comment submission
	const handleQuickCommentSubmit = (comment: string, selectedText: string, source: TextSelectionSource) => {
		// Format message with mention token + comment
		const preview = selectedText.slice(0, 50).replace(/[:\[\]]/g, "");
		const encodedText = utf8ToBase64(selectedText);
		let mentionToken: string;
		if (source.type === "diff") {
			const lineNum = source.lineNumber || 0;
			mentionToken = `@[${MENTION_PREFIXES.DIFF}${source.filePath}:${lineNum}:${preview}:${encodedText}]`;
		} else if (source.type === "tool-edit") {
			// Tool edit is treated as code/diff context
			mentionToken = `@[${MENTION_PREFIXES.DIFF}${source.filePath}:0:${preview}:${encodedText}]`;
		} else {
			mentionToken = `@[${MENTION_PREFIXES.QUOTE}${preview}:${encodedText}]`;
		}
		const message = `${mentionToken} ${comment}`;
		// If streaming, add to queue
		if (isStreamingRef()) {
			const item = createQueueItem(generateQueueId(), message);
			addToQueue(props.subChatId, item);
			toast.success("Reply queued", { description: "Will be sent when current response completes" });
		} else {
			// Send directly
			sendMessageRef()({
				role: "user",
				parts: [{
					type: "text",
					text: message
				}]
			});
			toast.success("Reply sent");
		}
		// Clear state and selection
		setQuickCommentState(null);
		window.getSelection()?.removeAllRanges();
	};
	// Handler for quick comment cancel
	const handleQuickCommentCancel = () => {
		setQuickCommentState(null);
	};
	// Sync loading status to atom for UI indicators
	// When streaming starts, set loading. When it stops, clear loading.
	// Unseen changes, sound notification, and sidebar refresh are handled in onFinish callback
	const setLoadingSubChats = loadingSubChatsAtom[1];
	createEffect(() => {
		dbg("Chat:syncLoading");
		const storedParentChatId = agentChatStore.getParentChatId(props.subChatId);
		if (!storedParentChatId) return;
		if (isStreaming()) {
			setLoading(setLoadingSubChats, props.subChatId, storedParentChatId);
		} else {
			clearLoading(setLoadingSubChats, props.subChatId);
		}
	});
	// Watch for pending PR message and send it
	const [pendingPrMessage, setPendingPrMessage] = pendingPrMessageAtom;
	createEffect(() => {
		dbg("Chat:pendingPr");
		const msg = pendingPrMessage();
		if (msg && !isStreaming()) {
			// Clear the pending message immediately to prevent double-sending
			// Use untrack to avoid re-triggering this effect
			untrack(() => setPendingPrMessage(null));
			// Send the message to Claude
			sendMessage({
				role: "user",
				parts: [{
					type: "text",
					text: msg
				}]
			});
			// Reset creating PR state after message is sent
			untrack(() => setIsCreatingPr(false));
		}
	});
	// Watch for pending Review message and send it
	const [pendingReviewMessage, setPendingReviewMessage] = pendingReviewMessageAtom;
	createEffect(() => {
		dbg("Chat:pendingReview");
		const msg = pendingReviewMessage();
		if (msg && !isStreaming()) {
			// Clear the pending message immediately to prevent double-sending
			untrack(() => setPendingReviewMessage(null));
			// Send the message to Claude
			sendMessage({
				role: "user",
				parts: [{
					type: "text",
					text: msg
				}]
			});
		}
	});
	// Watch for pending conflict resolution message and send it
	const [pendingConflictMessage, setPendingConflictMessage] = pendingConflictResolutionMessageAtom;
	createEffect(() => {
		dbg("Chat:pendingConflict");
		const msg = pendingConflictMessage();
		if (msg && !isStreaming()) {
			// Clear the pending message immediately to prevent double-sending
			untrack(() => setPendingConflictMessage(null));
			// Send the message to Claude
			sendMessage({
				role: "user",
				parts: [{
					type: "text",
					text: msg
				}]
			});
		}
	});
	// Handle pending "Build plan" from sidebar (atom - effect is defined after handleApprovePlan)
	const [pendingBuildPlanSubChatId, setPendingBuildPlanSubChatId] = pendingBuildPlanSubChatIdAtom;
	// Pending user questions from AskUserQuestion tool
	const [pendingQuestionsMap, setPendingQuestionsMap] = pendingUserQuestionsAtom;
	// Get pending questions for this specific subChat
	const pendingQuestions = createMemo(() => pendingQuestionsMap().get(props.subChatId) ?? null);
	// Track whether chat input has content (for custom text with questions)
	const [inputHasContent, setInputHasContent] = createSignal(false);
	// Memoize the last assistant message to avoid unnecessary recalculations
	const lastAssistantMessage = createMemo(() => [...messages()].reverse().find((m: UIMessage) => m.role === "assistant"));
	// Pre-compute token data for ChatInputArea to avoid passing unstable messages array
	// This prevents ChatInputArea from re-rendering on every streaming chunk
	const messageTokenData = createMemo(() => {
		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalCostUsd = 0;
		for (const msg of messages()) {
			if (msg.metadata) {
				totalInputTokens += msg.metadata.inputTokens || 0;
				totalOutputTokens += msg.metadata.outputTokens || 0;
				totalCostUsd += msg.metadata.totalCostUsd || 0;
			}
		}
		return {
			totalInputTokens,
			totalOutputTokens,
			totalCostUsd,
			messageCount: messages().length
		};
	});
	// Track previous streaming state to detect stream stop
	const [prevIsStreamingRef, setPrevIsStreamingRef] = createSignal(isStreaming());
	// Track if we recently stopped streaming (to prevent sync effect from restoring)
	const [recentlyStoppedStreamRef, setRecentlyStoppedStreamRef] = createSignal(false);
	// Clear pending questions when streaming is aborted
	// This effect runs when isStreaming transitions from true to false
	createEffect(() => {
		dbg("Chat:clearPendingQuestions");
		const wasStreaming = prevIsStreamingRef();
		untrack(() => setPrevIsStreamingRef(isStreaming()));
		// Detect streaming stop transition
		if (wasStreaming && !isStreaming()) {
			// Mark that we recently stopped streaming
			setRecentlyStoppedStreamRef(true);
			// Clear the flag after a delay
			const flagTimeout = setTimeout(() => {
				setRecentlyStoppedStreamRef(false);
			}, 500);
			// Streaming just stopped - if there's a pending question for this chat,
			// clear it after a brief delay (backend already handled the abort)
			if (pendingQuestions()) {
				const timeout = setTimeout(() => {
					// Re-check if still showing the same question (might have been cleared by other means)
					setPendingQuestionsMap((current) => {
						if (current.has(props.subChatId)) {
							const newMap = new Map(current);
							newMap.delete(props.subChatId);
							return newMap;
						}
						return current;
					});
				}, 150);
				onCleanup(() => {
					clearTimeout(timeout);
					clearTimeout(flagTimeout);
				});
				return;
			}
			onCleanup(() => clearTimeout(flagTimeout));
		}
	});
	// Sync pending questions with messages state
	// This handles: 1) restoring on chat switch, 2) clearing when question is answered/timed out
	createEffect(() => {
		// Check if there's a pending AskUserQuestion in the last assistant message
		const pendingQuestionPart = lastAssistantMessage()?.parts?.find((part: any) => part.type === "tool-AskUserQuestion" && part.state !== "output-available" && part.state !== "output-error" && part.state !== "result" && part.input?.questions) as any | undefined;
		// Helper to clear pending question for this subChat
		const clearPendingQuestion = () => {
			setPendingQuestionsMap((current) => {
				if (current.has(props.subChatId)) {
					const newMap = new Map(current);
					newMap.delete(props.subChatId);
					return newMap;
				}
				return current;
			});
		};
		// If streaming and we already have a pending question for this chat, keep it
		// (transport will manage it via chunks)
		if (isStreaming() && pendingQuestions()) {
			// But if the question in messages is already answered, clear the atom
			if (!pendingQuestionPart) {
				// Check if the specific toolUseId is now answered
				const answeredPart = lastAssistantMessage()?.parts?.find((part: any) => part.type === "tool-AskUserQuestion" && part.toolCallId === pendingQuestions()?.toolUseId && (part.state === "output-available" || part.state === "output-error" || part.state === "result"));
				if (answeredPart) {
					clearPendingQuestion();
				}
			}
			return;
		}
		// Not streaming - DON'T restore pending questions from messages
		// If stream is not active, the question is either:
		// 1. Already answered (state would be "output-available")
		// 2. Interrupted/aborted (should not show dialog)
		// 3. Timed out (should not show dialog)
		// We only show the question dialog during active streaming when
		// the backend is waiting for user response.
		if (pendingQuestionPart) {
			// Don't restore - if there's an existing pending question for this chat, clear it
			if (pendingQuestions()) {
				clearPendingQuestion();
			}
		} else {
			// No pending question - clear if belongs to this sub-chat
			if (pendingQuestions()) {
				clearPendingQuestion();
			}
		}
	});
	// Helper to clear pending question for this subChat (used in callbacks)
	const clearPendingQuestionCallback = () => {
		setPendingQuestionsMap((current) => {
			if (current.has(props.subChatId)) {
				const newMap = new Map(current);
				newMap.delete(props.subChatId);
				return newMap;
			}
			return current;
		});
	};
	// Handle answering questions
	const handleQuestionsAnswer = async (answers: Record<string, string>) => {
		if (!pendingQuestions()) return;
		const normalizedAnswers = Object.entries(answers).map(([question, answer]) => ({ question, answer }));
		await desktopRpc.chat.respondUserQuestion.mutate({
			toolUseId: pendingQuestions()!.toolUseId,
			answers: normalizedAnswers,
		});
		clearPendingQuestionCallback();
	};
	// Handle skipping questions
	const handleQuestionsSkip = async () => {
		if (!pendingQuestions()) return;
		const toolUseId = pendingQuestions()!.toolUseId;
		// Clear UI immediately - don't wait for backend
		// This ensures dialog closes even if stream was already aborted
		clearPendingQuestionCallback();
		// Try to notify backend (may fail if already aborted - that's ok)
		try {
			await desktopRpc.claude.respondToolApproval.mutate({
				toolUseId,
				approved: false,
				message: QUESTIONS_SKIPPED_MESSAGE
			});
		} catch {}
	};
	// Ref to prevent double submit of question answer
	const [isSubmittingQuestionAnswerRef, setIsSubmittingQuestionAnswerRef] = createSignal(false);
	// Handle answering questions with custom text from input (called on Enter in input)
	const handleSubmitWithQuestionAnswer = async () => {
		if (!pendingQuestions()) return;
		if (isSubmittingQuestionAnswerRef()) return;
		setIsSubmittingQuestionAnswerRef(true);
		try {
			// 1. Get custom text from input
			const customText = editorRef()?.getValue()?.trim() || "";
			if (!customText) {
				setIsSubmittingQuestionAnswerRef(false);
				return;
			}
			// 2. Get already selected answers from question component
			const selectedAnswers = questionRef()?.getAnswers() || {};
			const formattedAnswers: Record<string, string> = { ...selectedAnswers };
			// 3. Add custom text to the last question as "Other"
			const lastQuestion = pendingQuestions()!.questions[pendingQuestions()!.questions.length - 1];
			if (lastQuestion) {
				const existingAnswer = formattedAnswers[lastQuestion.question];
				if (existingAnswer) {
					// Append to existing answer
					formattedAnswers[lastQuestion.question] = `${existingAnswer}, Other: ${customText}`;
				} else {
					formattedAnswers[lastQuestion.question] = `Other: ${customText}`;
				}
			}
			// 4. Submit tool response with all answers
			const normalizedAnswers = Object.entries(formattedAnswers).map(([question, answer]) => ({ question, answer }));
			await desktopRpc.chat.respondUserQuestion.mutate({
				toolUseId: pendingQuestions()!.toolUseId,
				answers: normalizedAnswers,
			});
			clearPendingQuestionCallback();
			// 5. Stop stream if currently streaming
			if (isStreamingRef()) {
				agentChatStore.setManuallyAborted(props.subChatId, true);
				await stopRef()();
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			// 6. Clear input
			editorRef()?.clear();
			if (props.parentChatId) {
				clearSubChatDraft(props.parentChatId, props.subChatId);
			}
			// 7. Send custom text as a new user message
			setShouldAutoScrollRef(true);
			await sendMessageRef()({
				role: "user",
				parts: [{
					type: "text",
					text: customText
				}]
			});
		} finally {
			setIsSubmittingQuestionAnswerRef(false);
		}
	};
	// Memoize the callback to prevent ChatInputArea re-renders
	// Only provide callback when there's a pending question for this subChat
	const submitWithQuestionAnswerCallback = createMemo(() => pendingQuestions() ? handleSubmitWithQuestionAnswer : undefined);
	// Watch for pending auth retry message (after successful OAuth flow)
	const [pendingAuthRetry, setPendingAuthRetry] = pendingAuthRetryMessageAtom;
	createEffect(() => {
		// Only retry when:
		// 1. There's a pending message
		// 2. readyToRetry is true (set by modal on OAuth success)
		// 3. We're in the correct chat
		// 4. Not currently streaming
		if (pendingAuthRetry() && pendingAuthRetry()!.readyToRetry && pendingAuthRetry()!.subChatId === props.subChatId && !isStreaming()) {
			// Clear the pending message immediately to prevent double-sending
			setPendingAuthRetry(null);
			// Build message parts
			const parts: Array<{
				type: "text";
				text: string;
			} | {
				type: "data-image";
				data: any;
			}> = [{
				type: "text",
				text: pendingAuthRetry()!.prompt
			}];
			// Add images if present
			if (pendingAuthRetry()?.images && pendingAuthRetry()!.images!.length > 0) {
				for (const img of pendingAuthRetry()!.images!) {
					parts.push({
						type: "data-image",
						data: {
							base64Data: img.base64Data,
							mediaType: img.mediaType,
							filename: img.filename
						}
					});
				}
			}
			// Send the message to Claude
			sendMessage({
				role: "user",
				parts
			});
		}
	});
	const handlePlanApproval = async (toolUseId: string, approved: boolean) => {
		if (!toolUseId) return;
		setPlanApprovalPending((prev) => ({
			...prev,
			[toolUseId]: true
		}));
		try {
			await desktopRpc.claude.respondToolApproval.mutate({
				toolUseId,
				approved
			});
		} catch (error) {
			console.error("[plan-approval] Failed to respond:", error);
			toast.error("Failed to send plan approval. Please try again.");
		} finally {
			setPlanApprovalPending((prev) => {
				const next = { ...prev };
				delete next[toolUseId];
				return next;
			});
		}
	};
	// Handle plan approval - sends "Build plan" message and switches to agent mode
	const handleApprovePlan = () => {
		// Update store mode synchronously BEFORE sending (transport reads from store)
		useAgentSubChatStore.getState().updateSubChatMode(props.subChatId, "agent");
		// Sync mode to database for sidebar indicator (getPendingPlanApprovals)
		if (!props.subChatId.startsWith("temp-")) {
			updateSubChatModeMutation.mutate({
				subChatId: props.subChatId,
				mode: "agent"
			});
		}
		// Update atomFamily state (for UI) - this also syncs to store via effect
		setSubChatMode("agent");
		// Enable auto-scroll and immediately scroll to bottom
		setShouldAutoScrollRef(true);
		scrollToBottom();
		// Send "Build plan" message (now in agent mode)
		sendMessageRef()({
			role: "user",
			parts: [{
				type: "text",
				text: "Build plan"
			}]
		});
	};
	// Handle pending "Build plan" from sidebar
	createEffect(() => {
		// Only trigger if this is the target sub-chat and we're active
		if (pendingBuildPlanSubChatId() === props.subChatId && props.isActive) {
			setPendingBuildPlanSubChatId(null);
			handleApprovePlan();
		}
	});
	// Detect PR URLs in assistant messages and store them
	// Initialize with existing PR URL to prevent duplicate toast on re-mount
	const [detectedPrUrlRef, setDetectedPrUrlRef] = createSignal<string | null>(props.existingPrUrl ?? null);
	createEffect(() => {
		// Only check after streaming ends
		if (isStreaming()) return;
		// Capture current value before checking messages
		const currentDetectedPrUrl = detectedPrUrlRef();
		// Look through messages for PR URLs
		for (const msg of messages()) {
			if (msg.role !== "assistant") continue;
			// Extract text content from message
			const textContent = msg.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ") || "";
			// Match GitHub PR URL pattern
			const prUrlMatch = textContent.match(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/(\d+)/);
			if (prUrlMatch && prUrlMatch[0] !== currentDetectedPrUrl) {
				const prUrl = prUrlMatch[0];
				const prNumber = parseInt(prUrlMatch[1], 10);
				// Store to prevent duplicate calls
				untrack(() => setDetectedPrUrlRef(prUrl));
				// Update database
				desktopRpc.chats.updatePrInfo.mutate({
					chatId: props.parentChatId,
					prUrl,
					prNumber
						}).then(() => {
							// Invalidate the agentChat query to refetch with new PR info
							queryClient.invalidateQueries({ queryKey: ["chats", "get", props.parentChatId] });
						});
					break;
				}
		}
	});
	// Track plan Edit completions to trigger sidebar refetch
	const [, triggerPlanEditRefetch] = planEditRefetchTriggerAtomFamily(props.subChatId);
	const [lastPlanEditCountRef, setLastPlanEditCountRef] = createSignal(0);
	createEffect(() => {
		// Count completed plan Edits
		let completedPlanEdits = 0;
		for (const msg of messages()) {
			if (msg.role !== "assistant" || !(msg as any).parts) continue;
			for (const part of (msg as any).parts as any[]) {
				if (part.type === "tool-Edit" && part.state !== "input-streaming" && part.state !== "pending" && isPlanFile(part.input?.file_path || "")) {
					completedPlanEdits++;
				}
			}
		}
		// Trigger refetch if count increased (new Edit completed)
		const lastCount = lastPlanEditCountRef();
		if (completedPlanEdits > lastCount) {
			untrack(() => setLastPlanEditCountRef(completedPlanEdits));
			triggerPlanEditRefetch((prev: number) => prev + 1);
		}
	});
	const { changedFiles: changedFilesForSubChat, recomputeChangedFiles } = useChangedFilesTracking(messages(), props.subChatId, isStreaming(), props.parentChatId);
	// Rollback handler - truncates messages to the clicked assistant message and restores git state
	// The SDK UUID from the last assistant message will be used for resumeSessionAt on next send
	const handleRollback = async (assistantMsg: (ReturnType<typeof messages>)[0]) => {
		if (isRollingBack()) {
			toast.error("Rollback already in progress");
			return;
		}
		if (isStreaming()) {
			toast.error("Cannot rollback while streaming");
			return;
		}
		const sdkUuid = (assistantMsg.metadata as any)?.sdkMessageUuid;
		if (!sdkUuid) {
			toast.error("Cannot rollback: message has no SDK UUID");
			return;
		}
		setIsRollingBack(true);
		try {
			// Single call handles both message truncation and git rollback
			const result = await desktopRpc.chats.rollbackToMessage.mutate({
				subChatId: props.subChatId,
				sdkMessageUuid: sdkUuid
			});
			if (!result.success) {
				toast.error(`Failed to rollback: ${result.error}`);
				setIsRollingBack(false);
				return;
			}
			// Update local state with truncated messages from server
			if (result.messages) {
				setMessages(result.messages);
				recomputeChangedFiles(result.messages);
			}
			props.refreshDiff?.();
		} catch (error) {
			console.error("[handleRollback] Error:", error);
			toast.error("Failed to rollback");
		} finally {
			setIsRollingBack(false);
		}
	};
	// Expose rollback handler/state via atoms for message action bar
	const setRollbackHandler = rollbackHandlerAtom[1];
	createEffect(() => {
		setRollbackHandler(() => handleRollback);
		onCleanup(() => setRollbackHandler(null));
	});
	const setIsRollingBackAtom = isRollingBackAtom[1];
	createEffect(() => {
		setIsRollingBackAtom(isRollingBack);
	});
	// ESC, Ctrl+C and Cmd+Shift+Backspace handler for stopping stream
	createEffect(() => {
		// Skip keyboard handlers for inactive tabs (keep-alive)
		if (!props.isActive) return;
		const handleKeyDown = async (e: KeyboardEvent) => {
			let shouldStop = false;
			let shouldSkipQuestions = false;
			// Check for Escape key without modifiers (works even from input fields, like terminal Ctrl+C)
			// Ignore if Cmd/Ctrl is pressed (reserved for Cmd+Esc to focus input)
			if (e.key === "Escape" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && isStreaming()) {
				const target = e.target as HTMLElement;
				// Allow ESC to propagate if it originated from a modal/dialog/dropdown
				const isInsideOverlay = target.closest("[role=\"dialog\"], [role=\"alertdialog\"], [role=\"menu\"], [role=\"listbox\"], [data-radix-popper-content-wrapper], [data-state=\"open\"]");
				// Also check if any dialog/modal is open anywhere in the document (not just at event target)
				// This prevents stopping stream when settings dialog is open but not focused
				const hasOpenDialog = document.querySelector("[role=\"dialog\"][aria-modal=\"true\"], [data-modal=\"agents-settings\"]");
				if (!isInsideOverlay && !hasOpenDialog) {
					// If there are pending questions for this chat, skip them instead of stopping stream
					if (pendingQuestions()) {
						shouldSkipQuestions = true;
					} else {
						shouldStop = true;
					}
				}
			}
			// Check for Ctrl+C (only Ctrl, not Cmd on Mac)
			if (e.ctrlKey && !e.metaKey && e.code === "KeyC") {
				if (!isStreaming()) return;
				const selection = window.getSelection();
				const hasSelection = selection && selection.toString().length > 0;
				// If there's a text selection, let browser handle copy
				if (hasSelection) return;
				shouldStop = true;
			}
			// Check for Cmd+Shift+Backspace (Mac) or Ctrl+Shift+Backspace (Windows/Linux)
			if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Backspace" && isStreaming()) {
				shouldStop = true;
			}
			if (shouldSkipQuestions) {
				e.preventDefault();
				await handleQuestionsSkip();
			} else if (shouldStop) {
				e.preventDefault();
				// Mark as manually aborted to prevent completion sound
				agentChatStore.setManuallyAborted(props.subChatId, true);
				await stop();
				// Call DELETE endpoint to cancel server-side stream
				await fetch(`/api/agents/chat?id=${encodeURIComponent(props.subChatId)}`, {
					method: "DELETE",
					credentials: "include"
				});
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Keyboard shortcut: Enter to focus input when not already focused
	useFocusInputOnEnter({ focus: () => editorRef()?.focus() });
	// Keyboard shortcut: Cmd+Esc to toggle focus/blur (without stopping generation)
	useToggleFocusOnCmdEsc({ focus: () => editorRef()?.focus(), blur: () => editorRef()?.blur() });
	const justCreatedIds = justCreatedIdsAtom[0];

	const hasJustCreatedMarker = () => {
		const ids = justCreatedIds();
		return ids.has(props.subChatId) || ids.has(props.parentChatId);
	};

	const consumeJustCreatedMarker = () => {
		const ids = justCreatedIds();
		ids.delete(props.subChatId);
		ids.delete(props.parentChatId);
	};

	// Auto-trigger AI response when we have initial message but no response yet
	// Also trigger auto-rename for initial sub-chat with pre-populated message
	// IMPORTANT: Skip if there's an active streamId (prevents double-generation on resume)
	// NOTE: queueMicrotask instead of onMount/createEffect — SolidJS batching
	// swallows the effect silently. This is a one-time mount-time check.
	queueMicrotask(() => {
		if (!hasJustCreatedMarker()) return;
		const msgLen = messages().length;
		const currentStatus = status();
		const streamId = props.streamId;
		const hasAutoGenerated = hasTriggeredAutoGenerateRef();
		const hasRenamedRef = hasTriggeredRenameRef();
		if (msgLen === 1 && currentStatus === "ready" && !streamId && !hasAutoGenerated) {
			consumeJustCreatedMarker();
			setHasTriggeredAutoGenerateRef(true);
			// Trigger rename for pre-populated initial message (from createAgentChat)
			if (!hasRenamedRef && props.isFirstSubChat) {
				const firstMsg = messages()[0];
				if (firstMsg?.role === "user") {
					const textPart = firstMsg.parts?.find((p: any) => p.type === "text");
					if (textPart && "text" in textPart) {
						setHasTriggeredRenameRef(true);
						props.onAutoRename(textPart.text ?? "", props.subChatId);
					}
				}
			}
			regenerate();
		}
	});
	// Ref to track if initial scroll has been set for this sub-chat
	const [scrollInitializedRef, setScrollInitializedRef] = createSignal(false);
	// Track if this tab has been initialized (for keep-alive)
	const [hasInitializedRef, setHasInitializedRef] = createSignal(false);
	// Initialize scroll position on mount (only once per tab with keep-alive)
	// Strategy: wait for content to stabilize, then scroll to bottom ONCE
	// No jumping around - just wait and scroll when ready
	createEffect(() => {
		// Skip if not active (keep-alive: hidden tabs don't need scroll init)
		if (!props.isActive) return;
		const container = chatContainerRef();
		if (!container) return;
		// With keep-alive, only initialize once per tab mount
		const hasInitialized = hasInitializedRef();
		if (hasInitialized) return;
		untrack(() => {
			setHasInitializedRef(true);
			// Reset on sub-chat change
			setScrollInitializedRef(false);
			setIsInitializingScrollRef(true);
		});
		// IMMEDIATE scroll to bottom - no waiting
		container.scrollTop = container.scrollHeight;
		untrack(() => {
			setShouldAutoScrollRef(true);
			// Mark as initialized IMMEDIATELY
			setScrollInitializedRef(true);
			setIsInitializingScrollRef(false);
		});
		// MutationObserver for async content (images, code blocks loading after initial render)
		const observer = new MutationObserver((mutations) => {
			// Skip if not active (keep-alive: don't scroll hidden tabs)
			if (!props.isActive) return;
			if (!shouldAutoScrollRef()) return;
			// Check if content was added
			const hasAddedContent = mutations.some((m) => m.type === "childList" && m.addedNodes.length > 0);
			if (hasAddedContent) {
				requestAnimationFrame(() => {
					setIsAutoScrollingRef(true);
					container.scrollTop = container.scrollHeight;
					requestAnimationFrame(() => {
						setIsAutoScrollingRef(false);
					});
				});
			}
		});
		observer.observe(container, {
			childList: true,
			subtree: true
		});
		onCleanup(() => {
			observer.disconnect();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	});
	// Attach scroll listener (separate effect)
	createEffect(() => {
		const container = chatContainerRef();
		if (!container) return;
		container.addEventListener("scroll", handleScroll, { passive: true });
		onCleanup(() => {
			container.removeEventListener("scroll", handleScroll);
		});
	});
	// Auto scroll to bottom when messages change during streaming
	// Only kicks in after content fills the viewport (overflow behavior)
	createEffect(() => {
		// Skip if not active (keep-alive: don't scroll hidden tabs)
		if (!props.isActive) return;
		// Skip if scroll not yet initialized
		if (!scrollInitializedRef()) return;
		// Auto-scroll during streaming if user hasn't scrolled up
		if (shouldAutoScrollRef() && status() === "streaming") {
			const container = chatContainerRef();
			if (container) {
				// Always scroll during streaming if auto-scroll is enabled
				// (user can disable by scrolling up)
				requestAnimationFrame(() => {
					setIsAutoScrollingRef(true);
					container.scrollTop = container.scrollHeight;
					requestAnimationFrame(() => {
						setIsAutoScrollingRef(false);
					});
				});
			}
		}
	});
	// Auto-focus input when switching to this chat (any sub-chat change)
	// Skip on mobile to prevent keyboard from opening automatically
	createEffect(() => {
		// Skip if not active (keep-alive: don't focus hidden tabs)
		if (!props.isActive) return;
		if (props.isMobile) return;
		// Use requestAnimationFrame to ensure DOM is ready after render
		requestAnimationFrame(() => {
			editorRef()?.focus();
		});
	});
	// Refs for handleSend to avoid recreating callback on every messages change
	const [messagesLengthRef, setMessagesLengthRef] = createSignal(messages().length);
	createEffect(on(() => messages().length, (val) => setMessagesLengthRef(val)));
	const [subChatModeRef, setSubChatModeRef] = createSignal<AgentMode>(subChatMode());
	createEffect(on(subChatMode, (val) => setSubChatModeRef(val)));
	const [imagesRef, setImagesRef] = createSignal(images());
	createEffect(on(images, (val) => setImagesRef(val)));
	const [filesRef, setFilesRef] = createSignal(files());
	createEffect(on(files, (val) => setFilesRef(val)));
	const handleSend = async () => {
		// Block sending while sandbox is still being set up
		if (props.sandboxSetupStatus !== "ready") {
			return;
		}
		// Get value from uncontrolled editor
		const inputValue = editorRef()?.getValue() || "";
		const hasText = inputValue.trim().length > 0;
		const currentImages = imagesRef();
		const currentFiles = filesRef();
		const currentTextContexts = textContextsRef.current;
		const currentPastedTexts = pastedTextsRef.current;
		const hasImages = currentImages.filter((img) => !img.isLoading && img.url).length > 0;
		const hasTextContexts = currentTextContexts.length > 0;
		const hasPastedTexts = currentPastedTexts.length > 0;
		if (!hasText && !hasImages && !hasTextContexts && !hasPastedTexts) return;
		// If streaming, add to queue instead of sending directly
		if (isStreamingRef()) {
			const queuedImages = currentImages.filter((img) => !img.isLoading && img.url).map(toQueuedImage);
			const queuedFiles = currentFiles.filter((f) => !f.isLoading && f.url).map(toQueuedFile);
			const queuedTextContexts = currentTextContexts.map(toQueuedTextContext);
			const item = createQueueItem(generateQueueId(), inputValue.trim(), queuedImages.length > 0 ? queuedImages : undefined, queuedFiles.length > 0 ? queuedFiles : undefined, queuedTextContexts.length > 0 ? queuedTextContexts : undefined);
			addToQueue(props.subChatId, item);
			// Clear input and attachments
			editorRef()?.clear();
			if (props.parentChatId) {
				clearSubChatDraft(props.parentChatId, props.subChatId);
			}
			clearAll();
			clearTextContexts();
			return;
		}
		// Auto-restore archived workspace when sending a message
		if (props.isArchived && props.onRestoreWorkspace) {
			props.onRestoreWorkspace();
		}
		const text = inputValue.trim();
		// Expand custom slash commands with arguments (e.g. "/Apex my argument")
		// This mirrors the logic in new-chat-form.tsx
		let finalText = text;
		const slashMatch = text.match(/^\/(\S+)\s*(.*)$/s);
		if (slashMatch) {
			const [, commandName, args] = slashMatch;
			const builtinNames = new Set(BUILTIN_SLASH_COMMANDS.map((cmd) => cmd.name));
			if (!builtinNames.has(commandName)) {
				try {
					const commands = await desktopRpc.commands.list({ projectPath: props.projectPath });
					const cmd = commands.find((c: { name: string; path: string }) => c.name.toLowerCase() === commandName.toLowerCase());
					if (cmd) {
						const { content } = await desktopRpc.commands.getContent({ path: cmd.path });
						finalText = content.replace(/\$ARGUMENTS/g, args.trim());
					}
				} catch (error) {
					console.error("Failed to expand custom slash command:", error);
				}
			}
		}
		// Clear editor and draft from localStorage
		editorRef()?.clear();
		if (props.parentChatId) {
			clearSubChatDraft(props.parentChatId, props.subChatId);
		}
		// Trigger auto-rename on first message in a new sub-chat
		if (messagesLengthRef() === 0 && !hasTriggeredRenameRef()) {
			setHasTriggeredRenameRef(true);
			props.onAutoRename(finalText || "Image message", props.subChatId);
		}
		// Build message parts: images first, then files, then text
		// Include base64Data for API transmission
		const parts: any[] = [...currentImages.filter((img) => !img.isLoading && img.url).map((img) => ({
			type: "data-image" as const,
			data: {
				url: img.url,
				mediaType: img.mediaType,
				filename: img.filename,
				base64Data: img.base64Data
			}
		})), ...currentFiles.filter((f) => !f.isLoading && f.url).map((f) => ({
			type: "data-file" as const,
			data: {
				url: f.url,
				mediaType: (f as any).mediaType,
				filename: f.filename,
				size: f.size
			}
		}))];
		// Add text contexts as mention tokens
		const currentDiffTextContexts = diffTextContextsRef.current;
		let mentionPrefix = "";
		if (currentTextContexts.length > 0 || currentDiffTextContexts.length > 0 || currentPastedTexts.length > 0) {
			const quoteMentions = currentTextContexts.map((tc) => {
				const preview = tc.preview.replace(/[:\[\]]/g, "");
				const encodedText = utf8ToBase64(tc.text);
				return `@[${MENTION_PREFIXES.QUOTE}${preview}:${encodedText}]`;
			});
			const diffMentions = currentDiffTextContexts.map((dtc) => {
				const preview = dtc.preview.replace(/[:\[\]]/g, "");
				const encodedText = utf8ToBase64(dtc.text);
				const lineNum = dtc.lineNumber || 0;
				return `@[${MENTION_PREFIXES.DIFF}${dtc.filePath}:${lineNum}:${preview}:${encodedText}]`;
			});
			// Add pasted text as pasted mentions (format: pasted:size:preview|filepath)
			// Using | as separator since filepath can contain colons
			const pastedTextMentions = currentPastedTexts.map((pt) => {
				// Sanitize preview to remove special characters that break mention parsing
				const sanitizedPreview = pt.preview.replace(/[:\[\]|]/g, "");
				return `@[${MENTION_PREFIXES.PASTED}${pt.size}:${sanitizedPreview}|${pt.filePath}]`;
			});
			mentionPrefix = [
				...quoteMentions,
				...diffMentions,
				...pastedTextMentions
			].join(" ") + " ";
		}
		if (finalText || mentionPrefix) {
			parts.push({
				type: "text",
				text: mentionPrefix + (finalText || "")
			});
		}
		// Add cached file contents as hidden parts (sent to agent but not displayed in UI)
		// These are from dropped text files - content is embedded so agent sees it immediately
		if (fileContentsRef().size > 0) {
			for (const [mentionId, content] of fileContentsRef().entries()) {
				// Extract file path from mentionId (file:local:path or file:external:path)
				const filePath = mentionId.replace(/^file:(local|external):/, "");
				parts.push({
					type: "file-content",
					filePath,
					content
				});
			}
		}
		clearAll();
		clearTextContexts();
		clearDiffTextContexts();
		clearPastedTexts();
		clearFileContents();
		// Optimistic update: immediately update chat's updated_at and resort array for instant sidebar resorting
		if (props.teamId) {
			const now = new Date();
			queryClient.setQueryData(["chats", "list"], (old: any) => {
				if (!old) return old;
				// Update the timestamp and sort by updated_at descending
				const updated = old.map((c: any) => c.id === props.parentChatId ? {
					...c,
					updated_at: now
				} : c);
				return updated.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
			});
		}
		// Desktop app: Optimistic update for chats.list to update sidebar immediately
		const desktopQueryClient = getQueryClient();
		if (desktopQueryClient) {
			const now = new Date();
			const queries = desktopQueryClient.getQueryCache().getAll();
			const chatsListQuery = queries.find((q) => Array.isArray(q.queryKey) && Array.isArray(q.queryKey[0]) && q.queryKey[0][0] === "chats" && q.queryKey[0][1] === "list");
			if (chatsListQuery) {
				desktopQueryClient.setQueryData(chatsListQuery.queryKey, (old: any[] | undefined) => {
					if (!old) return old;
					// Update the timestamp and sort by updatedAt descending
					const updated = old.map((c: any) => c.id === props.parentChatId ? {
						...c,
						updatedAt: now
					} : c);
					return updated.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
				});
			}
		}
		// Optimistically update sub-chat timestamp to move it to top
		useAgentSubChatStore.getState().updateSubChatTimestamp(props.subChatId);
		// Enable auto-scroll and immediately scroll to bottom
		setShouldAutoScrollRef(true);
		scrollToBottom();
		await sendMessageRef()({
			role: "user",
			parts
		});
	};
	// Queue handlers for sending queued messages
	const handleSendFromQueue = async (itemId: string) => {
		const item = popItemFromQueue(props.subChatId, itemId);
		if (!item) return;
		// Stop current stream if streaming and wait for status to become ready
		if (isStreamingRef()) {
			await handleStop();
			// Wait for status to become "ready" (max 2 seconds)
			const maxWait = 2e3;
			const pollInterval = 50;
			let waited = 0;
			while (isStreamingRef() && waited < maxWait) {
				await new Promise((resolve) => setTimeout(resolve, pollInterval));
				waited += pollInterval;
			}
		}
		// Build message parts from queued item
		const parts: any[] = [...(item.images || []).map((img) => ({
			type: "data-image" as const,
			data: {
				url: img.url,
				mediaType: img.mediaType,
				filename: img.filename,
				base64Data: img.base64Data
			}
		})), ...(item.files || []).map((f) => ({
			type: "data-file" as const,
			data: {
				url: f.url,
				mediaType: f.mediaType,
				filename: f.filename,
				size: f.size
			}
		}))];
		// Add text contexts as mention tokens
		let mentionPrefix = "";
		if (item.textContexts && item.textContexts.length > 0) {
			const quoteMentions = item.textContexts.map((tc) => {
				const preview = tc.text.slice(0, 50).replace(/[:\[\]]/g, "");
				const encodedText = utf8ToBase64(tc.text);
				return `@[${MENTION_PREFIXES.QUOTE}${preview}:${encodedText}]`;
			});
			mentionPrefix = quoteMentions.join(" ") + " ";
		}
		// Add diff text contexts as mention tokens
		if (item.diffTextContexts && item.diffTextContexts.length > 0) {
			const diffMentions = item.diffTextContexts.map((dtc) => {
				const preview = dtc.text.slice(0, 50).replace(/[:\[\]]/g, "");
				const encodedText = utf8ToBase64(dtc.text);
				const lineNum = dtc.lineNumber || 0;
				return `@[${MENTION_PREFIXES.DIFF}${dtc.filePath}:${lineNum}:${preview}:${encodedText}]`;
			});
			mentionPrefix += diffMentions.join(" ") + " ";
		}
		if (item.message || mentionPrefix) {
			parts.push({
				type: "text",
				text: mentionPrefix + (item.message || "")
			});
		}
		// Update timestamps
		useAgentSubChatStore.getState().updateSubChatTimestamp(props.subChatId);
		// Enable auto-scroll and immediately scroll to bottom
		setShouldAutoScrollRef(true);
		scrollToBottom();
		await sendMessageRef()({
			role: "user",
			parts
		});
	};
	const handleRemoveFromQueue = (itemId: string) => {
		removeFromQueue(props.subChatId, itemId);
	};
	// Force send - stop stream and send immediately, bypassing queue (Opt+Enter)
	const handleForceSend = async () => {
		// Block sending while sandbox is still being set up
		if (props.sandboxSetupStatus !== "ready") {
			return;
		}
		// Get value from uncontrolled editor
		const inputValue = editorRef()?.getValue() || "";
		const hasText = inputValue.trim().length > 0;
		const currentImages = imagesRef();
		const currentFiles = filesRef();
		const hasImages = currentImages.filter((img) => !img.isLoading && img.url).length > 0;
		if (!hasText && !hasImages) return;
		// Stop current stream if streaming and wait for status to become ready
		if (isStreamingRef()) {
			await handleStop();
			// Wait for status to become "ready" (max 2 seconds)
			const maxWait = 2e3;
			const pollInterval = 50;
			let waited = 0;
			while (isStreamingRef() && waited < maxWait) {
				await new Promise((resolve) => setTimeout(resolve, pollInterval));
				waited += pollInterval;
			}
		}
		// Auto-restore archived workspace when sending a message
		if (props.isArchived && props.onRestoreWorkspace) {
			props.onRestoreWorkspace();
		}
		const text = inputValue.trim();
		// Expand custom slash commands with arguments (e.g. "/Apex my argument")
		let finalText = text;
		const slashMatch = text.match(/^\/(\S+)\s*(.*)$/s);
		if (slashMatch) {
			const [, commandName, args] = slashMatch;
			const builtinNames = new Set(BUILTIN_SLASH_COMMANDS.map((cmd) => cmd.name));
			if (!builtinNames.has(commandName)) {
				try {
					const commands = await desktopRpc.commands.list({ projectPath: props.projectPath });
					const cmd = commands.find((c: { name: string; path: string }) => c.name.toLowerCase() === commandName.toLowerCase());
					if (cmd) {
						const { content } = await desktopRpc.commands.getContent({ path: cmd.path });
						finalText = content.replace(/\$ARGUMENTS/g, args.trim());
					}
				} catch (error) {
					console.error("Failed to expand custom slash command:", error);
				}
			}
		}
		// Clear editor and draft from localStorage
		editorRef()?.clear();
		if (props.parentChatId) {
			clearSubChatDraft(props.parentChatId, props.subChatId);
		}
		// Build message parts
		const parts: any[] = [...currentImages.filter((img) => !img.isLoading && img.url).map((img) => ({
			type: "data-image" as const,
			data: {
				url: img.url,
				mediaType: img.mediaType,
				filename: img.filename,
				base64Data: img.base64Data
			}
		})), ...currentFiles.filter((f) => !f.isLoading && f.url).map((f) => ({
			type: "data-file" as const,
			data: {
				url: f.url,
				mediaType: f.type,
				filename: f.filename,
				size: f.size
			}
		}))];
		if (finalText) {
			parts.push({
				type: "text",
				text: finalText
			});
		}
		// Clear attachments
		clearAll();
		// Update timestamps
		useAgentSubChatStore.getState().updateSubChatTimestamp(props.subChatId);
		// Force scroll to bottom
		setShouldAutoScrollRef(true);
		scrollToBottom();
		await sendMessageRef()({
			role: "user",
			parts
		});
	};
	// NOTE: Auto-processing of queue is now handled globally by QueueProcessor
	// component in agents-layout.tsx. This ensures queues continue processing
	// even when user navigates to different sub-chats or workspaces.
	// Helper to get message text content
	const getMessageTextContent = (msg: any): string => {
		return msg.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n") || "";
	};
	// Helper to copy message content
	const copyMessageContent = (msg: any) => {
		const textContent = getMessageTextContent(msg);
		if (textContent) {
			navigator.clipboard.writeText(stripEmojis(textContent));
		}
	};
	// Check if there's an unapproved plan (in plan mode with completed ExitPlanMode)
	const hasUnapprovedPlan = createMemo(() => {
		// If already in agent mode, plan is approved (mode is the source of truth)
		if (subChatMode() !== "plan") return false;
		// Look for completed ExitPlanMode in messages
		for (let i = messages().length - 1; i >= 0; i--) {
			const msg = messages()[i];
			// If assistant message with completed ExitPlanMode, we found an unapproved plan
			if (msg.role === "assistant" && msg.parts) {
				const exitPlanPart = msg.parts.find((p: any) => p.type === "tool-ExitPlanMode");
				// Check if ExitPlanMode is completed (has output, even if empty)
				if (exitPlanPart && exitPlanPart.output !== undefined) {
					return true;
				}
			}
		}
		return false;
	});
	// Keep ref in sync for use in initializeScroll (which runs in useLayoutEffect)
	setHasUnapprovedPlanRef(hasUnapprovedPlan);
	// Update pending plan approvals atom for sidebar indicators
	const setPendingPlanApprovals = pendingPlanApprovalsAtom[1];
	createEffect(() => {
		setPendingPlanApprovals((prev: Map<string, string>) => {
			const newMap = new Map(prev);
			if (hasUnapprovedPlan()) {
				newMap.set(props.subChatId, props.parentChatId);
			} else {
				newMap.delete(props.subChatId);
			}
			// Only return new map if it changed
			if (newMap.size !== prev.size || ![...newMap.keys()].every((id) => prev.has(id))) {
				return newMap;
			}
			return prev;
		});
	});
	// Keyboard shortcut: Cmd+Enter to approve plan
	createEffect(() => {
		if (!props.isActive) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter" && e.metaKey && !e.shiftKey && hasUnapprovedPlan() && !isStreaming()) {
				e.preventDefault();
				handleApprovePlan();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Cmd/Ctrl + Arrow Down to scroll to bottom (works even when focused in input)
	// But don't intercept if input has content - let native cursor navigation work
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
				// Don't intercept if input has content - let native cursor navigation work
				const inputValue = editorRef()?.getValue() || "";
				if (inputValue.trim().length > 0) {
					return;
				}
				e.preventDefault();
				scrollToBottom();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Clean up pending plan approval when unmounting
	createEffect(() => {
		onCleanup(() => {
			setPendingPlanApprovals((prev: Map<string, string>) => {
				if (prev.has(props.subChatId)) {
					const newMap = new Map(prev);
					newMap.delete(props.subChatId);
					return newMap;
				}
				return prev;
			});
		});
	});
	// Compute sticky top class for user messages
	const stickyTopClass = props.isMobile ? CHAT_LAYOUT.stickyTopMobile : props.isSubChatsSidebarOpen ? CHAT_LAYOUT.stickyTopSidebarOpen : CHAT_LAYOUT.stickyTopSidebarClosed;
	// Sync messages to Jotai store for isolated rendering
	// CRITICAL: Only sync from the ACTIVE tab to prevent overwriting global atoms
	// Each tab has its own useChatSolid() instance, but global atoms (messageIdsAtom, etc.) are shared.
	// Only the active tab should update these global atoms.
	const syncMessages = syncMessagesWithStatus;
	const syncableMessages = (): StoreMessage[] => {
		// Legacy chats may have messages without ids; generate deterministic ids so the
		// isolated message store can render historical content reliably.
		return messages().map((msg, idx) => {
			const id = typeof msg.id === "string" && msg.id.length > 0 ? msg.id : `legacy-${props.subChatId}-${idx}`;
			return {
				id,
				role: msg.role,
				parts: msg.parts ?? [],
				metadata: msg.metadata,
			};
		});
	};
	createEffect(() => {
		// Skip syncing for inactive tabs - they shouldn't update global atoms
		if (!props.isActive) return;
		const msgs = syncableMessages();
		syncMessages({
			messages: msgs,
			status: status(),
			subChatId: props.subChatId
		});
	});
	// Sync status to global streaming status store for queue processing
	const streamingStatusStore = useStreamingStatusStore();
	createEffect(() => {
		streamingStatusStore.setStatus(props.subChatId, status() as "ready" | "streaming" | "submitted" | "error");
	});
	// Chat search - scroll to current match
	// Use ref to track scroll lock and prevent race conditions
	const [searchScrollLockRef, setSearchScrollLockRef] = createSignal<number>(0);
	const currentSearchMatch = chatSearchCurrentMatchAtom;
	createEffect(() => {
		const match = currentSearchMatch();
		if (!match) return;
		const container = chatContainerRef();
		if (!container) return;
		// Increment lock to cancel any pending scroll operations
		const currentLock = searchScrollLockRef() + 1;
		untrack(() => setSearchScrollLockRef(currentLock));
		// Use double requestAnimationFrame + small delay to ensure DOM has updated with new highlights
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setTimeout(() => {
					// Check if this scroll operation is still valid (not superseded by newer one)
					if (searchScrollLockRef() !== currentLock) return;
					// First try to find the highlight mark
					let targetElement: Element | null = container.querySelector(".search-highlight-current");
					// If no highlight mark, find the message element with matching data attributes
					if (!targetElement) {
						const selector = `[data-message-id="${match.messageId}"][data-part-index="${match.partIndex}"]`;
						targetElement = container.querySelector(selector);
					}
					if (targetElement) {
						// Check if this is inside a sticky user message container
						const stickyParent = targetElement.closest("[data-user-message-id]");
						if (stickyParent) {
							const messageGroupWrapper = stickyParent.parentElement;
							if (messageGroupWrapper) {
								messageGroupWrapper.scrollIntoView({
									behavior: "smooth",
									block: "start"
								});
								return;
							}
						}
						targetElement.scrollIntoView({
							behavior: "smooth",
							block: "center"
						});
					}
				}, 50);
			});
		});
	});
	// Calculate top offset for search bar based on sub-chat selector
	const searchBarTopOffset = props.isSubChatsSidebarOpen ? "52px" : undefined;
	return <SearchHighlightProvider>
      <div class="flex flex-col flex-1 min-h-0 relative">
        {	/* Text selection popover for adding text to context */}
        <TextSelectionPopover onAddToContext={addTextContext} onQuickComment={handleQuickComment} onFocusInput={handleFocusInput} />

        { /* Quick comment input */}
        <Show when={quickCommentState()}>{(state) => <QuickCommentInput selectedText={state().selectedText} source={state().source} rect={state().rect} onSubmit={handleQuickCommentSubmit} onCancel={handleQuickCommentCancel} />}</Show>

        { /* Chat search bar */}
		<ChatSearchBar messages={syncableMessages()} topOffset={searchBarTopOffset} />

        { /* Chat title - flex above scroll area (desktop only) */}
		<Show when={!props.isMobile}><div class={cn("flex-shrink-0 pb-2", props.isSubChatsSidebarOpen ? "pt-[52px]" : "pt-2")}>
			<ChatTitleEditor name={subChatName()} placeholder="New Chat" onSave={handleRenameSubChat} isMobile={false} chatId={props.subChatId} hasMessages={syncableMessages().length > 0} />
		</div></Show>

      { /* Messages */}
      <div ref={(el) => {
 // Cleanup previous observer
		const obs = chatContainerObserverRef();
		if (obs) {
			obs.disconnect();
			setChatContainerObserverRef(null);
		}
		setChatContainerRef(el);
		// Setup ResizeObserver for --chat-container-height CSS variable
		if (el) {
			const observer = new ResizeObserver((entries) => {
				const height = entries[0]?.contentRect.height ?? 0;
				el.style.setProperty("--chat-container-height", `${height}px`);
			});
			observer.observe(el);
			setChatContainerObserverRef(observer);
		}
	}} class="flex-1 overflow-y-auto w-full relative allow-text-selection outline-none" tabIndex={-1} data-chat-container>
        <div class="px-2 max-w-2xl mx-auto -mb-4 space-y-4" style={{ "padding-bottom": "32px" }}>
          <div>
            {	/* ISOLATED: Messages rendered via Jotai atom subscription
	Each component subscribes to specific atoms and only re-renders when those change
	KEY: Force remount on props.subChatId change to ensure fresh atom reads after syncMessages */}
			<IsolatedMessagesSection subChatId={props.subChatId} chatId={props.parentChatId} isMobile={props.isMobile} sandboxSetupStatus={props.sandboxSetupStatus} stickyTopClass={stickyTopClass} sandboxSetupError={props.sandboxSetupError} onRetrySetup={props.onRetrySetup} UserBubbleComponent={AgentUserMessageBubble} ToolCallComponent={AgentToolCall} MessageGroupWrapper={MessageGroup} toolRegistry={AgentToolRegistry} />
          </div>
        </div>
      </div>

      { /* User questions panel - shows when AskUserQuestion tool is called */}
      { /* Only show if the pending question belongs to THIS sub-chat */}
      <Show when={pendingQuestions()}>{(questions) => <div class="px-4 relative z-20">
          <div class="w-full px-2 max-w-2xl mx-auto">
            <AgentUserQuestion ref={questionRef} pendingQuestions={questions()} onAnswer={handleQuestionsAnswer} onSkip={handleQuestionsSkip} hasCustomText={inputHasContent()} />
          </div>
        </div>}</Show>

      { /* Stacked cards container - queue + status */}
      <Show when={!pendingQuestions() && (queue().length > 0 || changedFilesForSubChat().length > 0)}><div class="px-2 -mb-6 relative z-10">
            <div class="w-full max-w-2xl mx-auto px-2">
              { /* Queue indicator card - top card */}
              <Show when={queue().length > 0}><AgentQueueIndicator queue={queue()} onRemoveItem={handleRemoveFromQueue} onSendNow={handleSendFromQueue} isStreaming={isStreaming()} hasStatusCardBelow={changedFilesForSubChat().length > 0} /></Show>
              { /* Status card - bottom card, only when there are changed files */}
              <Show when={changedFilesForSubChat().length > 0}><SubChatStatusCard chatId={props.parentChatId} subChatId={props.subChatId} isStreaming={isStreaming()} isCompacting={isCompacting()} changedFiles={changedFilesForSubChat()} worktreePath={props.projectPath} onStop={handleStop} hasQueueCardAbove={queue().length > 0} /></Show>
            </div>
          </div></Show>

      { /* Input - isolated component to prevent re-renders */}
      <ChatInputArea editorRef={editorRef} setEditorRef={setEditorRef} fileInputRef={fileInputRef} setFileInputRef={setFileInputRef} onSend={handleSend} onForceSend={handleForceSend} onStop={handleStop} onCompact={handleCompact} onCreateNewSubChat={props.onCreateNewSubChat} isStreaming={isStreaming()} isCompacting={isCompacting()} images={images()} files={files()} onAddAttachments={handleAddAttachments} onRemoveImage={removeImage} onRemoveFile={removeFile} isUploading={isUploading()} textContexts={textContexts()} onRemoveTextContext={removeTextContext} diffTextContexts={diffTextContexts()} onRemoveDiffTextContext={removeDiffTextContext} pastedTexts={pastedTexts()} onAddPastedText={addPastedText} onRemovePastedText={removePastedText} onCacheFileContent={cacheFileContent} messageTokenData={messageTokenData()} subChatId={props.subChatId} parentChatId={props.parentChatId} teamId={props.teamId} repository={props.repository} sandboxId={props.sandboxId} projectPath={props.projectPath} changedFiles={changedFilesForSubChat()} isMobile={props.isMobile} queueLength={queue().length} onSendFromQueue={handleSendFromQueue} firstQueueItemId={queue()[0]?.id} onInputContentChange={setInputHasContent} onSubmitWithQuestionAnswer={submitWithQuestionAnswerCallback()} />

        { /* Scroll to bottom button - isolated component to avoid re-renders during streaming */}
        <ScrollToBottomButton containerRef={chatContainerRef} onScrollToBottom={scrollToBottom} hasStackedCards={!pendingQuestions() && (queue().length > 0 || changedFilesForSubChat().length > 0)} subChatId={props.subChatId} isActive={props.isActive} />
      </div>
    </SearchHighlightProvider>;
}
// Chat View wrapper - handles loading and creates chat object
export function ChatView(rawProps: {
	chatId: string;
	isSidebarOpen: boolean;
	onToggleSidebar: () => void;
	selectedTeamName?: string;
	selectedTeamImageUrl?: string;
	isMobileFullscreen?: boolean;
	onBackToChats?: () => void;
	onOpenPreview?: () => void;
	onOpenDiff?: () => void;
	onOpenTerminal?: () => void;
}) {
	const props = mergeProps({ isMobileFullscreen: false }, rawProps);
	const [selectedTeamId] = selectedTeamIdAtom;
	const [selectedModelId] = lastSelectedModelIdAtom;
	const selectedModelName = createMemo(
		() => claudeModels.find((model) => model.id === selectedModelId())?.name ?? "Sonnet",
	);
	// Get active sub-chat ID from store for mode tracking (reactive)
	const subChatStoreForMode = useAgentSubChatStore();
	const activeSubChatIdForMode = createMemo(() => subChatStoreForMode.activeSubChatId);
	// Use per-subChat mode atom - falls back to "agent" if no active sub-chat
	const [subChatMode] = subChatModeAtomFamily(activeSubChatIdForMode() || "");
	// Current mode - use subChatMode when there's an active sub-chat, otherwise default to "agent"
	const currentMode = createMemo<AgentMode>(() => activeSubChatIdForMode() ? subChatMode() : "agent");
	// Default mode for new sub-chats
	const defaultAgentMode = defaultAgentModeAtom[0];
	const [historyEnabled] = historyEnabledAtom;
	const [extendedThinkingEnabled] = extendedThinkingEnabledAtom;
	const isDesktop = isDesktopAtom[0];
	const isFullscreen = isFullscreenAtom[0];
	const customClaudeConfig = customClaudeConfigAtom[0];
	const selectedOllamaModel = selectedOllamaModelAtom[0];
	const normalizedCustomClaudeConfig = createMemo(() =>
		normalizeCustomClaudeConfig(customClaudeConfig()),
	);
	const hasCustomClaudeConfig = createMemo(() =>
		Boolean(normalizedCustomClaudeConfig()),
	);
	const setLoadingSubChats = loadingSubChatsAtom[1];
	const unseenChanges = agentsUnseenChangesAtom[0];
	const subChatUnseenChanges = agentsSubChatUnseenChangesAtom[0];
	const justCreatedIds = justCreatedIdsAtom[0];
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const setUndoStack = undoStackAtom[1];
	const setSelectedFilePath = selectedDiffFilePathAtom[1];
	const setFilteredDiffFiles = filteredDiffFilesAtom[1];
	const { notifyAgentComplete } = useDesktopNotifications();
	// Check if any chat has unseen changes
	const hasAnyUnseenChanges = unseenChanges().size > 0;
	const [forceUpdateCounter, setForceUpdate] = createSignal(0);
	const forceUpdate = () => setForceUpdate((n) => n + 1);
	const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = agentsPreviewSidebarOpenAtom;
	// Per-chat diff sidebar state - each chat remembers its own open/close state
	const [isDiffSidebarOpen, setIsDiffSidebarOpen] = diffSidebarOpenAtomFamily(props.chatId);
	// Subscribe to activeSubChatId for plan sidebar (needs to update when switching sub-chats)
	const activeSubChatIdForPlan = createMemo(() => subChatStoreForMode.activeSubChatId);
	// Per-subChat plan sidebar state - each sub-chat remembers its own open/close state
	const [isPlanSidebarOpen, setIsPlanSidebarOpen] = planSidebarOpenAtomFamily(activeSubChatIdForPlan() || "");
	const [currentPlanPath, setCurrentPlanPath] = currentPlanPathAtomFamily(activeSubChatIdForPlan() || "");
	// Details sidebar state (unified sidebar that combines all right sidebars)
	const isUnifiedSidebarEnabled = unifiedSidebarEnabledAtom[0];
	const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = detailsSidebarOpenAtom;
	// Resolved hotkeys for tooltips
	const toggleDetailsHotkey = useResolvedHotkeyDisplay("toggle-details");
	const toggleTerminalHotkey = useResolvedHotkeyDisplay("toggle-terminal");
	// Close plan sidebar when switching to a sub-chat that has no plan
	const [prevSubChatIdRef, setPrevSubChatIdRef] = createSignal(activeSubChatIdForPlan());
	createEffect(() => {
		if (prevSubChatIdRef() !== activeSubChatIdForPlan()) {
			// Sub-chat changed - if new one has no plan path, close sidebar
			if (!currentPlanPath()) {
				setIsPlanSidebarOpen(false);
			}
			untrack(() => setPrevSubChatIdRef(activeSubChatIdForPlan()));
		}
	});
	const [, setPendingBuildPlanSubChatId] = pendingBuildPlanSubChatIdAtom;
	// Read plan edit refetch trigger from atom (set by ChatViewInner when Edit completes)
	const planEditRefetchTriggerAtom = createMemo(() => planEditRefetchTriggerAtomFamily(activeSubChatIdForPlan() || ""));
	const [planEditRefetchTrigger] = planEditRefetchTriggerAtom();
	// Handler for plan sidebar "Build plan" button
	// Uses getState() to get fresh activeSubChatId (avoids stale closure)
	const handleApprovePlanFromSidebar = () => {
		const activeSubChatId = useAgentSubChatStore.getState().activeSubChatId;
		if (activeSubChatId) {
			setPendingBuildPlanSubChatId(activeSubChatId);
		}
	};
	const [store, setStore] = useTerminalStore();
	const isTerminalSidebarOpen = () => store.sidebarOpenByChatId[props.chatId] ?? false;
	const setIsTerminalSidebarOpen = (open: boolean) => setStore("sidebarOpenByChatId", props.chatId, open);
	// Mutual exclusion: Details sidebar vs Plan/Terminal/Diff(side-peek) sidebars
	// When one opens, close the conflicting ones and remember for restoration
	// Track what was auto-closed and by whom for restoration
	const autoClosedStateRef: {
		// What closed Details
		detailsClosedBy: "plan" | "terminal" | "diff" | null;
		// What Details closed
		planClosedByDetails: boolean;
		terminalClosedByDetails: boolean;
		diffClosedByDetails: boolean;
	} = {
		detailsClosedBy: null,
		planClosedByDetails: false,
		terminalClosedByDetails: false,
		diffClosedByDetails: false
	};
	// Track previous states to detect opens/closes
	let prevSidebarStatesRef = {
		details: isDetailsSidebarOpen(),
		plan: isPlanSidebarOpen() && !!currentPlanPath(),
		terminal: isTerminalSidebarOpen()
	};
	createEffect(() => {
		const prev = prevSidebarStatesRef;
		const auto = autoClosedStateRef;
		const unifiedEnabled = isUnifiedSidebarEnabled();
		const detailsOpen = isDetailsSidebarOpen();
		const planOpenRaw = isPlanSidebarOpen();
		const planPath = currentPlanPath();
		const planOpen = planOpenRaw && !!planPath;
		const terminalOpen = isTerminalSidebarOpen();
		if (!unifiedEnabled) {
			// Unified sidebar disabled - don't enforce mutual exclusion.
			auto.detailsClosedBy = null;
			auto.planClosedByDetails = false;
			auto.terminalClosedByDetails = false;
			prevSidebarStatesRef = {
				details: false,
				plan: planOpen,
				terminal: terminalOpen,
			};
			return;
		}
		// Detect state changes
		const detailsJustOpened = detailsOpen && !prev.details;
		const detailsJustClosed = !detailsOpen && prev.details;
		const planJustOpened = planOpen && !prev.plan;
		const planJustClosed = !planOpen && prev.plan;
		const terminalJustOpened = terminalOpen && !prev.terminal;
		const terminalJustClosed = !terminalOpen && prev.terminal;
		let nextDetails = detailsOpen;
		let nextPlan = planOpen;
		let nextTerminal = terminalOpen;
		// Details opened → close conflicting sidebars and remember
		if (detailsJustOpened) {
			if (planOpen) {
				auto.planClosedByDetails = true;
				nextPlan = false;
			}
			if (terminalOpen) {
				auto.terminalClosedByDetails = true;
				nextTerminal = false;
			}
		} else if (detailsJustClosed) {
			if (auto.planClosedByDetails && planPath) {
				auto.planClosedByDetails = false;
				nextPlan = true;
			}
			if (auto.terminalClosedByDetails) {
				auto.terminalClosedByDetails = false;
				nextTerminal = true;
			}
		} else if (planJustOpened && detailsOpen) {
			auto.detailsClosedBy = "plan";
			nextDetails = false;
		} else if (planJustClosed && auto.detailsClosedBy === "plan") {
			auto.detailsClosedBy = null;
			nextDetails = true;
		} else if (terminalJustOpened && detailsOpen) {
			auto.detailsClosedBy = "terminal";
			nextDetails = false;
		} else if (terminalJustClosed && auto.detailsClosedBy === "terminal") {
			auto.detailsClosedBy = null;
			nextDetails = true;
		}
		batch(() => {
			if (nextDetails !== detailsOpen) {
				setIsDetailsSidebarOpen(nextDetails);
			}
			if (nextPlan !== planOpenRaw) {
				setIsPlanSidebarOpen(nextPlan);
			}
			if (nextTerminal !== terminalOpen) {
				setIsTerminalSidebarOpen(nextTerminal);
			}
		});
		prevSidebarStatesRef = {
			details: nextDetails,
			plan: nextPlan,
			terminal: nextTerminal,
		};
	});
	// Diff data cache - stored in atoms to persist across workspace switches
	const [diffCache, setDiffCache] = workspaceDiffCacheAtomFamily(props.chatId);
	// Extract diff data from cache
	const diffStats = createMemo(() => diffCache().diffStats);
	const parsedFileDiffs = createMemo(() => diffCache().parsedFileDiffs as ParsedDiffFile[] | null);
	const prefetchedFileContents = createMemo(() => diffCache().prefetchedFileContents);
	const diffContent = createMemo(() => diffCache().diffContent);
	// Smart setters that update the cache
	const setDiffStats = (val: any) => {
		setDiffCache((prev: any) => {
			const newVal = typeof val === "function" ? val(prev.diffStats) : val;
			// Only update if something changed
			if (prev.diffStats.fileCount === newVal.fileCount && prev.diffStats.additions === newVal.additions && prev.diffStats.deletions === newVal.deletions && prev.diffStats.isLoading === newVal.isLoading && prev.diffStats.hasChanges === newVal.hasChanges) {
				return prev;
			}
			return {
				...prev,
				diffStats: newVal
			};
		});
	};
	const setParsedFileDiffs = (files: ParsedDiffFile[] | null) => {
		setDiffCache((prev: any) => ({
			...prev,
			parsedFileDiffs: files as any
		}));
	};
	const setPrefetchedFileContents = (contents: Record<string, string>) => {
		setDiffCache((prev: any) => ({
			...prev,
			prefetchedFileContents: contents
		}));
	};
	const setDiffContent = (content: string | null) => {
		setDiffCache((prev: any) => ({
			...prev,
			diffContent: content
		}));
	};
	const [diffMode, setDiffMode] = diffViewModeAtom;
	const [diffDisplayMode, setDiffDisplayMode] = diffViewDisplayModeAtom;
	const subChatsSidebarMode = agentsSubChatsSidebarModeAtom[0];
	// Force narrow width when switching to side-peek mode (from dialog/fullscreen)
	createEffect(() => {
		if (diffDisplayMode() === "side-peek") {
			// Set to narrow width (400px) to ensure correct layout
			appStore.set(agentsDiffSidebarWidthAtom, 400);
		}
	});
	// Handle Diff + Details sidebar conflict (side-peek mode only)
	// - If Diff opens in side-peek while Details is open: switch Diff to center-peek (dialog) mode
	// - If user manually switches Diff to side-peek while Details is open: close Details and remember
	// - If Details opens while Diff is in side-peek mode: close Diff and remember
	let prevDiffStateRef: {
		isOpen: boolean;
		mode: string;
		detailsOpen: boolean;
	} = {
		isOpen: isDiffSidebarOpen(),
		mode: diffDisplayMode(),
		detailsOpen: isDetailsSidebarOpen()
	};
	// Flag to skip center-peek switch when restoring Diff after Details closes
	const [isRestoringDiffRef, setIsRestoringDiffRef] = createSignal(false);
	createEffect(() => {
		const prev = prevDiffStateRef;
		const auto = autoClosedStateRef;
		const isNowSidePeek = isDiffSidebarOpen() && diffDisplayMode() === "side-peek";
		const wasSidePeek = prev.isOpen && prev.mode === "side-peek";
		const detailsJustOpened = isDetailsSidebarOpen() && !prev.detailsOpen;
		const detailsJustClosed = !isDetailsSidebarOpen() && prev.detailsOpen;
		const diffSidePeekJustClosed = wasSidePeek && !isNowSidePeek;
		if (isNowSidePeek && isDetailsSidebarOpen()) {
			// Details just opened while Diff is in side-peek → close Diff and remember
			if (detailsJustOpened) {
				auto.diffClosedByDetails = true;
				setIsDiffSidebarOpen(false);
			} else if (!prev.isOpen && !isRestoringDiffRef()) {
				setDiffDisplayMode("center-peek");
			} else if (prev.isOpen && prev.mode !== "side-peek") {
				auto.detailsClosedBy = "diff";
				setIsDetailsSidebarOpen(false);
			}
		} else if (diffSidePeekJustClosed && auto.detailsClosedBy === "diff") {
			auto.detailsClosedBy = null;
			setIsDetailsSidebarOpen(true);
		} else if (detailsJustClosed && auto.diffClosedByDetails) {
			auto.diffClosedByDetails = false;
			setIsRestoringDiffRef(true);
			setIsDiffSidebarOpen(true);
			// Reset flag after state update
			requestAnimationFrame(() => {
				setIsRestoringDiffRef(false);
			});
		}
		prevDiffStateRef = {
			isOpen: isDiffSidebarOpen(),
			mode: diffDisplayMode(),
			detailsOpen: isDetailsSidebarOpen(),
		};
	});
	// Hide traffic lights when full-page diff is open (they would overlap with content)
	createEffect(() => {
		if (!isDesktop() || isFullscreen()) return;
		if (isDiffSidebarOpen() && diffDisplayMode() === "full-page") {
			desktopRpc.window.setTrafficLightVisibility.mutate({ visible: false });
		}
	});
	// Track diff sidebar width for responsive header
	const storedDiffSidebarWidth = agentsDiffSidebarWidthAtom[0];
	const [diffSidebarRef, setDiffSidebarRef] = createSignal<HTMLDivElement | null>(null);
	const [diffViewRef, setDiffViewRef] = createSignal<AgentDiffViewRef | null>(null);
	const [diffSidebarWidth, setDiffSidebarWidth] = createSignal(storedDiffSidebarWidth());
	// Track if all diff files are collapsed/expanded for button disabled states
	const [diffCollapseState, setDiffCollapseState] = createSignal({
		allCollapsed: false,
		allExpanded: true
	});
	// Compute isNarrow for filtering logic (same threshold as DiffSidebarContent)
	const isDiffSidebarNarrow = createMemo(() => diffSidebarWidth() < 500);
	// ResizeObserver to track diff sidebar width in real-time (atom only updates after resize ends)
	createEffect(() => {
		if (!isDiffSidebarOpen()) {
			return;
		}
		const element = diffSidebarRef();
		if (!element) {
			return;
		}
		let observer: ResizeObserver | null = null;
		// Set initial width
		setDiffSidebarWidth(element.offsetWidth || storedDiffSidebarWidth());
		observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				if (width > 0) {
					setDiffSidebarWidth(width);
				}
			}
		});
		observer.observe(element);
		onCleanup(() => {
			if (observer) observer.disconnect();
		});
	});
	// Track changed files across all sub-chats for throttled diff refresh
	const subChatFiles = subChatFilesAtom[0];
	// Initialize to Date.now() to prevent double-fetch on mount
	// (the "mount" effect already fetches, throttle should wait)
	const [lastDiffFetchTimeRef, setLastDiffFetchTimeRef] = createSignal<number>(Date.now());
	const DIFF_THROTTLE_MS = 2e3;
	// Clear "unseen changes" when chat is opened
	createEffect(() => {
		const set = unseenChanges();
		if (set.has(props.chatId)) {
			set.delete(props.chatId);
		}
	});
	// Get sub-chat state from store - use reactive accessors for proper updates
	const subChatStoreState = useAgentSubChatStore();
	// Reactive getters - these update when store changes
	const activeSubChatId = () => subChatStoreState.activeSubChatId;
	const openSubChatIds = () => subChatStoreState.openSubChatIds;
	const pinnedSubChatIds = () => subChatStoreState.pinnedSubChatIds;
	// Clear sub-chat "unseen changes" indicator when sub-chat becomes active
	createEffect(() => {
		const id = activeSubChatId();
		if (!id) return;
		const set = subChatUnseenChanges();
		if (set.has(id)) {
			set.delete(id);
		}
	});
	// Reactive getter for allSubChats
	const allSubChats = () => subChatStoreState.allSubChats;
	const renameSubChatMutation = useMutation(() => ({
		mutationFn: (args: { subChatId: string; name: string }) =>
			desktopRpc.chats.renameSubChat.mutate({ id: args.subChatId, name: args.name }),
	}));
	const renameChatMutation = useMutation(() => ({
		mutationFn: (args: { chatId: string; name: string }) =>
			desktopRpc.chats.rename.mutate({ id: args.chatId, name: args.name }),
	}));
	const generateSubChatNameMutation = useMutation(() => ({
		mutationFn: (args: { userMessage: string; ollamaModel?: string | null }) =>
			desktopRpc.chats.generateSubChatName.mutate({
				userMessage: args.userMessage,
				ollamaModel: args.ollamaModel ?? undefined,
			}),
	}));
	// PR creation loading state - using atom to allow ChatViewInner to reset it
	const [isCreatingPr, setIsCreatingPr] = isCreatingPrAtom;
	// Review loading state
	const [isReviewing, setIsReviewing] = createSignal(false);
	// Subchat filter setter - used by handleReview to filter by active subchat
	const setFilteredSubChatId = filteredSubChatIdAtom[1];
		// Determine if we're in sandbox mode
		const [chatSourceMode, setChatSourceMode] = chatSourceModeAtom;
		const LOCAL_CHAT_LOAD_TIMEOUT_MS = 12_000;
		// Fetch chat data from local or remote based on mode
		const localAgentChatQuery = useQuery(() => ({
			...createLocalChatQueryOptions(props.chatId),
			enabled: !!props.chatId,
		}));
		const localAgentChat = createMemo(() => transformAgentChatFromRpc(localAgentChatQuery.data));
		const hasResolvedLocalChat = () =>
			localAgentChatQuery.status === "success" ||
			localAgentChatQuery.status === "error";
			const isLocalLoading = () =>
				!!props.chatId &&
				!hasResolvedLocalChat();
			const isLocalChatError = () =>
				chatSourceMode() === "local" &&
				localAgentChatQuery.status === "error";
			const localChatErrorMessage = () => {
				const err = localAgentChatQuery.error as { message?: string } | null;
				return err?.message || "Failed to load workspace.";
			};
			const [localLoadingGateTimedOut, setLocalLoadingGateTimedOut] = createSignal(false);
		createEffect(() => {
			if (chatSourceMode() !== "local" || hasResolvedLocalChat()) {
				setLocalLoadingGateTimedOut(false);
				return;
			}
			const timer = setTimeout(() => {
				console.error(
					`[chat-view] local loading gate timed out for chat ${props.chatId}; forcing fallback`,
				);
				setLocalLoadingGateTimedOut(true);
			}, LOCAL_CHAT_LOAD_TIMEOUT_MS + 2_000);
			onCleanup(() => clearTimeout(timer));
		});
		createEffect(() => {
			if (chatSourceMode() !== "local") return;
			if (isLocalLoading()) return;
			// If this selected workspace no longer exists locally, fall back to new chat view.
			if (localAgentChatQuery.data === null && selectedChatId() === props.chatId) {
				console.warn(
					`[chat-view] local chat ${props.chatId} resolved to null; clearing stale selection`,
				);
				setSelectedChatId(null);
			}
		});
		const remoteAgentChatQuery = useRemoteChat(chatSourceMode() === "sandbox" ? props.chatId : null);
		const remoteAgentChat = () => remoteAgentChatQuery.data;
		const isRemoteLoading = () => remoteAgentChatQuery.isLoading;
		const hasResolvedRemoteChat = () =>
			remoteAgentChatQuery.status === "success" ||
			remoteAgentChatQuery.status === "error";
		createEffect(() => {
			if (selectedChatId() !== props.chatId) return;
			if (chatSourceMode() === "local") {
				if (!hasResolvedLocalChat()) return;
				if (localAgentChatQuery.data !== null) return;
				console.warn(`[chat-view] local chat ${props.chatId} unresolved; clearing stale selection`);
				setSelectedChatId(null);
				setChatSourceMode("local");
				return;
			}
			if (!hasResolvedRemoteChat()) return;
			if (agentChat()) return;
			console.warn(`[chat-view] sandbox chat ${props.chatId} unresolved; falling back to local`);
			setSelectedChatId(null);
			setChatSourceMode("local");
		});
	// Use the appropriate data source
	// IMPORTANT: Must memoize to prevent infinite re-render loop
	// The inline object spread creates a new reference on every render,
	// which triggers the useEffect that calls setAllSubChats(), causing re-renders
	const agentChat = createMemo(() => {
		if (chatSourceMode() === "sandbox") {
			// Defensive fallback: if sandbox fetch is unavailable in desktop mode,
			// still render the local chat instead of showing a blank/stuck state.
			const remoteChatData = remoteAgentChat();
			if (!remoteChatData) {
				return localAgentChat();
			}
			const remoteWorktreePath = (remoteChatData as any).worktreePath ?? (remoteChatData as any).projectPath ?? null;
			const remoteProjectPath = (remoteChatData as any).projectPath ?? null;
			const hasSandbox = !!remoteChatData.sandbox_id;
			return {
				...remoteChatData,
				createdAt: new Date(remoteChatData.created_at),
				updatedAt: new Date(remoteChatData.updated_at),
				archivedAt: null,
				projectId: (remoteChatData as any).projectId ?? null,
				worktreePath: remoteWorktreePath,
				branch: remoteChatData.meta?.branch ?? null,
				baseBranch: null,
				prUrl: null,
				prNumber: null,
				sandbox_id: remoteChatData.sandbox_id,
				sandboxId: remoteChatData.sandbox_id,
				isRemote: hasSandbox,
				remoteStats: remoteChatData.stats,
				project: remoteProjectPath ? { path: remoteProjectPath } : null,
				subChats: remoteChatData.subChats?.map((sc) => ({
					...sc,
					created_at: new Date(sc.created_at),
					updated_at: new Date(sc.updated_at)
				})) ?? []
			};
		}
		return localAgentChat();
	});
	const isLoading = () => (chatSourceMode() === "sandbox" ? isRemoteLoading() : isLocalLoading());
	// Compute if we're waiting for local chat data (used as loading gate)
		const isLocalChatLoading = () =>
			chatSourceMode() === "local" &&
			isLocalLoading() &&
			!localLoadingGateTimedOut();
	// Projects query for "Open Locally" functionality
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: async () => (await desktopRpc.projects.list.query()) ?? [],
	}));
  const projects = () => (projectsQuery.data ?? []) as Parameters<typeof getMatchingProjects>[0];
	// Open Locally dialog state
	const [openLocallyDialogOpen, setOpenLocallyDialogOpen] = createSignal(false);
	// Auto-import hook for "Open Locally"
	const { getMatchingProjects, autoImport, isImporting } = useAutoImport();
	// Handler for "Open Locally" button in header
	const handleOpenLocally = () => {
		const remoteChatData = remoteAgentChat();
		if (!remoteChatData) return;
    const matchingProjects = getMatchingProjects(projects(), remoteChatData);
		if (matchingProjects.length === 1) {
			// Auto-import: single match found
			autoImport(remoteChatData, matchingProjects[0]!);
		} else {
			// Show dialog: 0 or 2+ matches
			setOpenLocallyDialogOpen(true);
		}
	};
	// Determine if "Open Locally" button should show
	const showOpenLocally = () => chatSourceMode() === "sandbox" && !!remoteAgentChat();
	// Get matching projects for dialog (only computed when needed)
	const openLocallyMatchingProjects = createMemo(() => {
		const remoteChatData = remoteAgentChat();
		if (!remoteChatData) return [];
    return getMatchingProjects(projects(), remoteChatData);
	});
	// Reactive getter for server sub-chats - updates when agentChat() changes
	type AgentSubChat = {
		id: string;
		name?: string | null;
		mode?: "plan" | "agent" | null;
		created_at?: Date | string | null;
		updated_at?: Date | string | null;
		messages?: any;
		stream_id?: string | null;
	};
	const agentSubChats = (): AgentSubChat[] => (agentChat()?.subChats ?? []) as AgentSubChat[];
	// Workspace isolation: limit mounted tabs to prevent memory growth
	// CRITICAL: Filter by workspace to prevent rendering sub-chats from other workspaces
	// Always render: active + pinned, then fill with recent up to limit
	const MAX_MOUNTED_TABS = 5;
	const tabsToRender = createMemo(() => {
		// Call reactive getters inside memo for proper reactivity
		const activeId = activeSubChatId();
		const serverSubChats = agentSubChats();
		const localSubChats = allSubChats();
		const openIds = openSubChatIds();
		const pinnedIds = pinnedSubChatIds();
		if (!activeId) return [];
		// Use agentSubChats from server (tRPC/remote API) as the authoritative source for validation.
		// This fixes the race condition where:
		// 1. setChatId resets allSubChats to [] but loads activeSubChatId from localStorage
		// 2. tabsToRender was checking activeSubChatId against empty allSubChats → always failing
		//
		// agentSubChats comes from the server and is the "truth" about which sub-chats exist.
		// allSubChats in Zustand is only populated AFTER the init useEffect runs.
		//
		// For optimistic updates when creating new sub-chats, we fall back to allSubChats
		// since the new sub-chat won't be in agentSubChats yet (tRPC query is stale).
		const sourceForValidation = serverSubChats.length > 0 ? serverSubChats : localSubChats;
		const validSubChatIds = new Set(sourceForValidation.map((sc: { id: string }) => sc.id));
		// If active sub-chat doesn't belong to this workspace → return []
		// This prevents rendering sub-chats from another workspace during race condition
		if (!validSubChatIds.has(activeId)) {
			return [];
		}
		// Filter openSubChatIds and pinnedSubChatIds to only valid IDs for this workspace
		const validOpenIds = openIds.filter((id: string) => validSubChatIds.has(id));
		const validPinnedIds = pinnedIds.filter((id: string) => validSubChatIds.has(id));
		// Start with active (must always be mounted)
		const mustRender = new Set([activeId]);
		// Add pinned tabs (only valid ones)
		for (const id of validPinnedIds) {
			mustRender.add(id);
		}
		// If we have room, add recent tabs from openSubChatIds (only valid ones)
		if (mustRender.size < MAX_MOUNTED_TABS) {
			const remaining = MAX_MOUNTED_TABS - mustRender.size;
			const recentTabs = validOpenIds.filter((id: string) => !mustRender.has(id)).slice(-remaining);
			for (const id of recentTabs) {
				mustRender.add(id);
			}
		}
		// Return tabs to render
		// Always include activeSubChatId even if not in validOpenIds (handles race condition
		// where openSubChatIds from localStorage doesn't include the active tab yet)
		const result = validOpenIds.filter((id: string) => mustRender.has(id));
		if (!result.includes(activeId)) {
			result.unshift(activeId);
		}
		return result;
	});
	const renderTabIds = createMemo(() => {
		const tabs = tabsToRender();
		if (tabs.length > 0) return tabs;
		if (isLocalChatLoading()) return [];
		const firstServerSubChatId = agentSubChats()[0]?.id;
		return firstServerSubChatId ? [firstServerSubChatId] : [];
	});
	// Get PR status when PR exists (for checking if it's open/merged/closed)
	const hasPrNumber = !!agentChat()?.prNumber;
	const prStatusQuery = useQuery<{ pr?: { state?: string; mergeable?: string } } | null>(() => ({
		queryKey: ["chats", "getPrStatus", props.chatId] as const,
		queryFn: async () => {
			const status = await desktopRpc.chats.getPrStatus({ chatId: props.chatId });
			// Guard against undefined from transport/runtime mismatch.
			return (status ?? null) as { pr?: { state?: string; mergeable?: string } } | null;
		},
		enabled: hasPrNumber,
		refetchInterval: 3e4,
	}));
	// Wrap PR status data access in accessors for reactivity
	const prState = () => prStatusQuery.data?.pr?.state as "open" | "draft" | "merged" | "closed" | undefined;
	const prMergeable = () => prStatusQuery.data?.pr?.mergeable;
	const hasMergeConflicts = () => prMergeable() === "CONFLICTING";
	// PR is open if state is explicitly "open" or "draft"
	// When PR status is still loading, assume open to avoid showing wrong button
	const isPrOpen = () => hasPrNumber && (prStatusQuery.isLoading || prState() === "open" || prState() === "draft");
	// Query client for cache invalidation
	const queryClient = getQueryClient();
	// Sync from main mutation (for resolving merge conflicts)
	const mergeFromDefaultMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; useRebase?: boolean }) =>
			desktopRpc.changes.mergeFromDefault.mutate(input),
		onSuccess: () => {
			toast.success("Branch synced with main. You can now merge the PR.", { position: "top-center" });
			void queryClient?.invalidateQueries({ queryKey: ["chats", "getPrStatus", props.chatId] });
		},
		onError: (error) => {
			toast.error(error.message || "Failed to sync with main", { position: "top-center" });
		},
	}));
	const mergePrMutation = useMutation(() => ({
		mutationFn: (input: { chatId: string; method?: "merge" | "squash" | "rebase" }) =>
			desktopRpc.chats.mergePr.mutate(input),
		onSuccess: () => {
			toast.success("PR merged successfully!", { position: "top-center" });
			void queryClient?.invalidateQueries({ queryKey: ["chats", "getPrStatus", props.chatId] });
		},
		onError: (error) => {
			const errorMsg = error.message || "Failed to merge PR";
			// Check if it's a merge conflict error
			if (errorMsg.includes("MERGE_CONFLICT")) {
				toast.error("PR has merge conflicts. Sync with main to resolve.", {
					position: "top-center",
					duration: 8e3,
					action: worktreePath() ? {
						label: "Sync with Main",
						onClick: () => {
							mergeFromDefaultMutation.mutate({
								worktreePath: worktreePath()!,
								useRebase: false
							});
						}
					} : undefined
				});
			} else {
				toast.error(errorMsg, { position: "top-center" });
			}
		}
	}));
	const handleMergePr = () => {
		mergePrMutation.mutate({
			chatId: props.chatId,
			method: "squash",
		});
	};
	// Restore archived workspace mutation (silent - no toast)
	const restoreWorkspaceMutation = useMutation(() => ({
		mutationFn: (input: { id: string }) => desktopRpc.chats.restore.mutate(input),
		onSuccess: (restoredChat) => {
			if (restoredChat && queryClient) {
				queryClient.setQueryData(["chats", "list"], (oldData: any[] | undefined) => {
					if (!oldData) return [restoredChat];
					if (oldData.some((c: any) => c.id === restoredChat.id)) return oldData;
					return [restoredChat, ...oldData];
				});
			}
				void queryClient?.invalidateQueries({ queryKey: ["chats", "list"] });
				void queryClient?.invalidateQueries({ queryKey: ["chats", "listArchived"] });
				void queryClient?.invalidateQueries({ queryKey: ["chats", "get", props.chatId] });
			},
		}));
	const handleRestoreWorkspace = () => {
		restoreWorkspaceMutation.mutate({ id: props.chatId });
	};
	// Check if this workspace is archived
	const isArchived = !!agentChat()?.archivedAt;
	const existingPrUrl = typeof agentChat()?.prUrl === "string" ? (agentChat()?.prUrl as string) : null;
	// Get user usage data for credit checks (desktop: no usage limits)
	const usageQuery = useQuery(() => ({
		queryKey: ["usage", "user"] as const,
		queryFn: () =>
			Promise.resolve({
				usage: 0,
				limit: Infinity,
				planType: "desktop" as const,
				next_payment_at: null,
			}),
	}));
	const usageData = () => usageQuery.data;
	// Desktop: use worktreePath instead of sandbox
	// REACTIVE GETTERS - must call inside reactive contexts to track dependencies
	const worktreePath = () => ((agentChat() as any)?.worktreePath ?? (agentChat() as any)?.project?.path ?? (agentChat() as any)?.projectPath ?? null) as string | null;
	// Desktop: original project path for MCP config lookup
	const originalProjectPath = () => ((agentChat() as any)?.project?.path ?? (agentChat() as any)?.projectPath) as string | undefined;
	// Fallback for web: use sandbox_id
	const sandboxId = (): string | null => typeof agentChat()?.sandbox_id === "string"
		? agentChat()?.sandbox_id as string
		: null;
	const sandboxUrl = () => sandboxId() ? `https://3003-${sandboxId()}.e2b.app` : null;
	// Desktop uses worktreePath, web uses sandboxUrl
	const chatWorkingDir = () => worktreePath() || sandboxUrl();
	// Listen for file changes from Claude Write/Edit tools and invalidate git status
	useFileChangeListener(worktreePath);
	// Subscribe to GitWatcher for real-time file system monitoring (@parcel/watcher on main process)
	useGitWatcher(worktreePath);
	// Extract port, repository, and quick setup flag from meta
	const meta = agentChat()?.meta as {
		sandboxConfig?: {
			port?: number;
		};
		repository?: string;
		branch?: string | null;
		isQuickSetup?: boolean;
	} | null;
	const repository = typeof meta?.repository === "string" ? meta.repository : null;
	const repositoryInfo = createMemo(() => {
		if (!repository) return null;
		const [owner, name] = repository.split("/");
		if (!owner || !name) return null;
		return { owner, name };
	});
	// Remote info for Details sidebar (when worktreePath is null but sandboxId exists)
	const remoteInfo = createMemo(() => {
		if (worktreePath() || !sandboxId()) return null;
		return {
			repository: repository ?? undefined,
			branch: typeof meta?.branch === "string" ? meta.branch : null,
			sandboxId: sandboxId() ?? undefined,
		};
	});
	// Track if we've already triggered sandbox setup for this chat
	// Check if this is a quick setup (no preview available)
	const isQuickSetup = meta?.isQuickSetup || !meta?.sandboxConfig?.port;
	const previewPort = meta?.sandboxConfig?.port ?? 3e3;
	// Check if preview can be opened (sandbox with port exists and not quick setup)
	const canOpenPreview = () => !!(sandboxId() && !isQuickSetup && meta?.sandboxConfig?.port);
	// Check if diff button can be shown (stats available)
	// This shows the Changes button with stats in header
	const canShowDiffButton = () => !!worktreePath() || !!sandboxId();
	// Check if diff sidebar can be opened (actual diff content available)
	// Desktop remote chats (sandboxId without worktree) cannot open diff sidebar - only stats in header
	const canOpenDiff = () => !!worktreePath() || !!sandboxId() && !isDesktopApp();
	// Create list of subchats with changed files for filtering
	// Only include subchats that have uncommitted changes, sorted by most recent first
	const subChatsWithFiles = createMemo(() => {
		const result: Array<{
			id: string;
			name: string;
			filePaths: string[];
			fileCount: number;
			updatedAt: string;
		}> = [];
		// Only include subchats that have files (uncommitted changes)
		for (const subChat of allSubChats()) {
			const files = subChatFiles().get(subChat.id) || [];
			if (files.length > 0) {
				result.push({
					id: subChat.id,
					name: subChat.name || "New Chat",
					filePaths: files.map((f: { filePath: string }) => f.filePath),
					fileCount: files.length,
					updatedAt: subChat.updated_at || subChat.created_at || ""
				});
			}
		}
		// Sort by most recent first
		result.sort((a, b) => {
			if (!a.updatedAt && !b.updatedAt) return 0;
			if (!a.updatedAt) return 1;
			if (!b.updatedAt) return -1;
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		});
		return result;
	});
	// Close preview sidebar if preview becomes unavailable
	createEffect(() => {
		if (!canOpenPreview && isPreviewSidebarOpen()) {
			setIsPreviewSidebarOpen(false);
		}
	});
	// Note: We no longer forcibly close diff sidebar when canOpenDiff is false.
	// The sidebar render is guarded by canOpenDiff, so it naturally hides.
	// Per-chat state (diffSidebarOpenAtomFamily) preserves each chat's preference.
	// Fetch diff stats - extracted as callback for reuse in onFinish
	const [fetchDiffStatsDebounceRef, setFetchDiffStatsDebounceRef] = createSignal<NodeJS.Timeout | null>(null);
	const [isFetchingDiffRef, setIsFetchingDiffRef] = createSignal(false);
	const fetchDiffStats = async () => {
		if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Called with:", { worktreePath: worktreePath(), sandboxId: sandboxId(), chatId: props.chatId, isDesktop: isDesktopApp() });
		// Desktop uses worktreePath, web uses sandboxId
		// Don't reset stats if worktreePath is temporarily undefined - just skip the fetch
		// This prevents the button from becoming disabled when component re-renders
		if (!worktreePath() && !sandboxId()) {
			if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Skipping - no worktreePath or sandboxId");
			return;
		}
		// Prevent duplicate parallel fetches
		if (isFetchingDiffRef()) {
			if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Skipping - already fetching");
			return;
		}
		setIsFetchingDiffRef(true);
		if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Starting fetch...");
		try {
			// Desktop: use new getParsedDiff endpoint (all-in-one: parsing + file contents)
			if (worktreePath() && props.chatId) {
				const result = await desktopRpc.chats.getParsedDiff({ chatId: props.chatId });
				if (result.files.length > 0) {
					// Store parsed files directly (already parsed on server)
					setParsedFileDiffs(result.files as ParsedDiffFile[]);
					// Store prefetched file contents
					setPrefetchedFileContents(result.fileContents);
					// Set diff content to null since we have parsed files
					// (AgentDiffView will use parsedFileDiffs when available)
					setDiffContent(null);
					setDiffStats({
						fileCount: result.files.length,
						additions: result.totalAdditions,
						deletions: result.totalDeletions,
						isLoading: false,
						hasChanges: result.files.length > 0
					});
				} else {
					setDiffStats({
						fileCount: 0,
						additions: 0,
						deletions: 0,
						isLoading: false,
						hasChanges: false
					});
					// Use empty array instead of null to signal "no changes" vs "still loading"
					setParsedFileDiffs([]);
					setPrefetchedFileContents({});
					setDiffContent(null);
				}
				return;
			}
			// Desktop without chat (viewing main repo directly)
			if (worktreePath() && !props.chatId) {
				// TODO: Need to add endpoint that accepts worktreePath directly
				return;
			}
			// Remote sandbox: use stats from chat data (desktop) or fetch diff (web)
			if (sandboxId()) {
				if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Sandbox mode - sandboxId:", sandboxId());
				// Desktop app: use stats already provided in chat data
				// The diff sidebar won't work for remote chats (no worktree), but stats will show
				if (isDesktopApp()) {
					const remoteStats = (agentChat() as any)?.remoteStats;
					if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Desktop remote chat - using remoteStats:", remoteStats);
					if (remoteStats) {
						setDiffStats({
							fileCount: remoteStats.fileCount,
							additions: remoteStats.additions,
							deletions: remoteStats.deletions,
							isLoading: false,
							hasChanges: remoteStats.fileCount > 0
						});
					} else {
						setDiffStats({
							fileCount: 0,
							additions: 0,
							deletions: 0,
							isLoading: false,
							hasChanges: false
						});
					}
					// No parsed files for remote chats - diff view not available
					setParsedFileDiffs([]);
					setPrefetchedFileContents({});
					setDiffContent(null);
					return;
				}
				// Web: use relative fetch to get actual diff
				let rawDiff: string | null = null;
				const response = await fetch(`/api/agents/sandbox/${sandboxId}/diff`);
				if (!response.ok) {
					setDiffStats((prev: DiffStatsCache) => ({
						...prev,
						isLoading: false
					}));
					return;
				}
				const data = await response.json();
				rawDiff = data.diff || null;
				// Store raw diff for AgentDiffView
				if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Setting diff content, length:", rawDiff?.length ?? 0);
				setDiffContent(rawDiff);
				if (rawDiff && rawDiff.trim()) {
					// Parse diff to get file list and stats (client-side for web)
					if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Parsing diff...");
					const parsedFiles = splitUnifiedDiffByFile(rawDiff);
					if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Parsed files:", parsedFiles.length, "files");
					setParsedFileDiffs(parsedFiles);
					let additions = 0;
					let deletions = 0;
					for (const file of parsedFiles) {
						additions += file.additions;
						deletions += file.deletions;
					}
					if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Setting stats:", { fileCount: parsedFiles.length, additions, deletions });
					setDiffStats({
						fileCount: parsedFiles.length,
						additions,
						deletions,
						isLoading: false,
						hasChanges: parsedFiles.length > 0
					});
				} else {
					if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] No diff content, setting empty stats");
					setDiffStats({
						fileCount: 0,
						additions: 0,
						deletions: 0,
						isLoading: false,
						hasChanges: false
					});
					// Use empty array instead of null to signal "no changes" vs "still loading"
					setParsedFileDiffs([]);
					setPrefetchedFileContents({});
				}
			}
		} catch (error) {
			console.error("[fetchDiffStats] Error:", error);
			setDiffStats((prev: DiffStatsCache) => ({
				...prev,
				isLoading: false
			}));
		} finally {
			if (DEBUG_AGENTS_DIFF) console.log("[fetchDiffStats] Done");
			setIsFetchingDiffRef(false);
		}
	};
	// Debounced version for calling after stream ends
	const fetchDiffStatsDebounced = () => {
		const existingTimeout = fetchDiffStatsDebounceRef();
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}
		setFetchDiffStatsDebounceRef(setTimeout(() => {
			fetchDiffStats();
		}, 500));
	};
	// Ref to hold the latest fetchDiffStatsDebounced for use in onFinish callbacks
	const [fetchDiffStatsRef, setFetchDiffStatsRef] = createSignal(fetchDiffStatsDebounced);
	createEffect(() => {
		setFetchDiffStatsRef(() => fetchDiffStatsDebounced);
	});
	// Fetch diff stats on mount and when worktreePath/sandboxId changes
	createEffect(() => {
		fetchDiffStats();
	});
	// Refresh diff stats when diff sidebar opens (background refresh - don't block UI)
	// Keep existing data visible while fetching, only update if data changed
	createEffect(() => {
		if (isDiffSidebarOpen()) {
			// Fetch in background - existing parsedFileDiffs will be shown immediately
			fetchDiffStats();
		}
	});
	// Calculate total file count across all sub-chats for change detection
	const totalSubChatFileCount = createMemo(() => {
		let count = 0;
		subChatFiles().forEach((files: { length: number }) => {
			count += files.length;
		});
		return count;
	});
	// Throttled refetch when sub-chat files change (agent edits/writes files)
	// This keeps the top-right diff sidebar in sync with the bottom "Generated X files" bar
	createEffect(() => {
		// Skip if no files tracked yet (initial state)
		if (totalSubChatFileCount() === 0) return;
		const now = Date.now();
		const lastFetchTime = lastDiffFetchTimeRef();
		const timeSinceLastFetch = now - lastFetchTime;
		if (timeSinceLastFetch >= DIFF_THROTTLE_MS) {
			// Enough time passed, fetch immediately
			untrack(() => setLastDiffFetchTimeRef(now));
			fetchDiffStats();
		} else {
			// Schedule fetch for when throttle window ends
			const delay = DIFF_THROTTLE_MS - timeSinceLastFetch;
			const timer = setTimeout(() => {
				untrack(() => setLastDiffFetchTimeRef(Date.now()));
				fetchDiffStats();
			}, delay);
			onCleanup(() => clearTimeout(timer));
		}
	});
	// Handle Create PR - sends a message to Claude to create the PR
	const setPendingPrMessage = pendingPrMessageAtom[1];
	const handleCreatePr = async () => {
		if (!props.chatId) {
			toast.error("Chat ID is required", { position: "top-center" });
			return;
		}
		setIsCreatingPr(true);
		try {
			// Get PR context from backend
			const context = await desktopRpc.chats.getPrContext({ chatId: props.chatId });
			if (!context) {
				toast.error("Could not get git context", { position: "top-center" });
				setIsCreatingPr(false);
				return;
			}
			// Generate message and set it for ChatViewInner to send
			const message = generatePrMessage(context);
			setPendingPrMessage(message);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to prepare PR request", { position: "top-center" });
			setIsCreatingPr(false);
		}
	};
	// Handle Commit to existing PR - sends a message to Claude to commit and push
	// selectedPaths parameter is optional - if provided, only those files will be mentioned
	const [isCommittingToPr, setIsCommittingToPr] = createSignal(false);
	const handleCommitToPr = async (_selectedPaths?: string[]) => {
		if (!props.chatId) {
			toast.error("Chat ID is required", { position: "top-center" });
			return;
		}
		try {
			setIsCommittingToPr(true);
			const context = await desktopRpc.chats.getPrContext({ chatId: props.chatId });
			if (!context) {
				toast.error("Could not get git context", { position: "top-center" });
				return;
			}
			const message = generateCommitToPrMessage(context);
			setPendingPrMessage(message);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to prepare commit request", { position: "top-center" });
		} finally {
			setIsCommittingToPr(false);
		}
	};
	// Handle Review - sends a message to Claude to review the diff
	const setPendingReviewMessage = pendingReviewMessageAtom[1];
	const handleReview = async () => {
		if (!props.chatId) {
			toast.error("Chat ID is required", { position: "top-center" });
			return;
		}
		setIsReviewing(true);
		try {
			// Get PR context from backend
			const context = await desktopRpc.chats.getPrContext({ chatId: props.chatId });
			if (!context) {
				toast.error("Could not get git context", { position: "top-center" });
				return;
			}
			// Set filter to show only files from the active subchat
			if (activeSubChatId) {
				setFilteredSubChatId(activeSubChatId);
			}
			// Generate review message and set it for ChatViewInner to send
			const message = generateReviewMessage(context);
			setPendingReviewMessage(message);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to start review", { position: "top-center" });
		} finally {
			setIsReviewing(false);
		}
	};
	// Handle Fix Conflicts - sends a message to Claude to sync with main and fix merge conflicts
	const setPendingConflictResolutionMessage = pendingConflictResolutionMessageAtom[1];
	const handleFixConflicts = () => {
		const message = `This PR has merge conflicts with the main branch. Please:

1. First, fetch and merge the latest changes from main branch using git commands
2. If there are any merge conflicts, resolve them carefully by keeping the correct code from both branches
3. After resolving conflicts, commit the merge
4. Push the changes to update the PR

Make sure to preserve all functionality from both branches when resolving conflicts.`;
		setPendingConflictResolutionMessage(message);
	};
	// Fetch branch data for diff sidebar header
	const branchDataQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", worktreePath() || ""] as const,
		queryFn: async () => (await desktopRpc.changes.getBranches({ worktreePath: worktreePath() || "" })) ?? null,
		enabled: !!worktreePath(),
	}));
	const branchData = () => branchDataQuery.data;
	// Fetch git status for sync counts (pushCount, pullCount, hasUpstream)
	const gitStatusQuery = useQuery(() => ({
		queryKey: ["changes", "getStatus", worktreePath() || ""] as const,
		queryFn: async () => (await desktopRpc.changes.getStatus({ worktreePath: worktreePath() || "" })) ?? null,
		enabled: !!worktreePath() && isDiffSidebarOpen(),
		staleTime: 3e4,
	}));
	const gitStatus = () => gitStatusQuery.data;
	const refetchGitStatus = () => gitStatusQuery.refetch();
	const isGitStatusLoading = () => gitStatusQuery.isLoading;
	// Refetch git status and diff stats when window gains focus
	createEffect(() => {
		if (!worktreePath() || !isDiffSidebarOpen()) return;
		const handleWindowFocus = () => {
			// Refetch git status
			refetchGitStatus();
			// Refetch diff stats to get latest changes
			fetchDiffStats();
		};
		window.addEventListener("focus", handleWindowFocus);
		onCleanup(() => window.removeEventListener("focus", handleWindowFocus));
	});
	// Sync parsedFileDiffs with git status - clear diff data when all files are committed
	// This fixes the issue where diff sidebar shows stale files after external git commit
	createEffect(() => {
		const gs = gitStatus() as { staged?: unknown[]; unstaged?: unknown[]; untracked?: unknown[] } | undefined;
		if (!gs || isGitStatusLoading()) return;
		// Check if git status shows no uncommitted changes
		const hasUncommittedChanges = (gs.staged?.length ?? 0) > 0 || (gs.unstaged?.length ?? 0) > 0 || (gs.untracked?.length ?? 0) > 0;
		// If git shows no changes but we still have parsedFileDiffs, clear them
		if (!hasUncommittedChanges && parsedFileDiffs && parsedFileDiffs.length > 0) {
			if (DEBUG_AGENTS_DIFF) console.log("[active-chat] Git status empty but parsedFileDiffs has files, refreshing diff data");
			setParsedFileDiffs([]);
			setPrefetchedFileContents({});
			setDiffContent(null);
			setDiffStats({
				fileCount: 0,
				additions: 0,
				deletions: 0,
				isLoading: false,
				hasChanges: false
			});
		}
	});
	// Stable callbacks for DiffSidebarHeader to prevent re-renders
	const handleRefreshGitStatus = () => {
		refetchGitStatus();
	};
	const handleExpandAll = () => {
		diffViewRef()?.expandAll();
	};
	const handleCollapseAll = () => {
		diffViewRef()?.collapseAll();
	};
	const handleMarkAllViewed = () => {
		diffViewRef()?.markAllViewed();
	};
	const handleMarkAllUnviewed = () => {
		diffViewRef()?.markAllUnviewed();
	};
	const areSubChatsEqual = (next: SubChatMeta[], prev: SubChatMeta[]) => {
		if (next.length !== prev.length) return false;
		for (let i = 0; i < next.length; i++) {
			const a = next[i];
			const b = prev[i];
			if (!b) return false;
			if (
				a.id !== b.id ||
				a.name !== b.name ||
				a.created_at !== b.created_at ||
				a.updated_at !== b.updated_at ||
				a.mode !== b.mode
			) {
				return false;
			}
		}
		return true;
	};
	// Initialize store when chat data loads
	createRenderEffect(() => {
		const chat = agentChat();
		if (!chat) return;
		// Avoid tracking store reads to prevent update loops.
		untrack(() => {
			const store = useAgentSubChatStore.getState();
			// Only initialize if chatId changed
			if (store.chatId !== props.chatId) {
				store.setChatId(props.chatId);
			}
			// Re-get fresh state after setChatId may have loaded from localStorage
			const freshState = useAgentSubChatStore.getState();
			// Get sub-chats from DB (like Canvas - no isPersistedInDb flag)
			// Build a map of existing local sub-chats to preserve their created_at if DB doesn't have it
			const existingSubChatsMap = new Map(freshState.allSubChats.map((sc) => [sc.id, sc]));
			const latestSubChats = (chat.subChats ?? []) as ReturnType<typeof agentSubChats>;
			const dbSubChats: SubChatMeta[] = latestSubChats.map((sc) => {
				const existingLocal = existingSubChatsMap.get(sc.id);
				const createdAt = typeof sc.created_at === "string" ? sc.created_at : sc.created_at?.toISOString();
				const updatedAt = typeof sc.updated_at === "string" ? sc.updated_at : sc.updated_at?.toISOString();
				return {
					id: sc.id,
					name: sc.name || existingLocal?.name || "New Chat",
					created_at: createdAt ?? existingLocal?.created_at ?? new Date().toISOString(),
					updated_at: updatedAt ?? existingLocal?.updated_at,
					mode: sc.mode as "plan" | "agent" | undefined || existingLocal?.mode || "agent"
				};
			});
			const dbSubChatIds = new Set(dbSubChats.map((sc) => sc.id));
			const isLocalSource = chatSourceMode() === "local";
			// Start with DB sub-chats
			const allSubChats: SubChatMeta[] = [...dbSubChats];
			// Reconcile stale open IDs from localStorage.
			// Local chats should only keep DB-backed IDs (plus optimistic IDs already in store).
			// Sandbox chats can keep non-DB IDs for lazy-created optimistic sub-chats.
			const currentOpenIds = freshState.openSubChatIds;
			const reconciledOpenIds = isLocalSource
				? currentOpenIds.filter((id) => dbSubChatIds.has(id) || existingSubChatsMap.has(id))
				: currentOpenIds;
			const openIdsChanged = reconciledOpenIds.length !== currentOpenIds.length || reconciledOpenIds.some((id, index) => id !== currentOpenIds[index]);
			if (openIdsChanged) {
				freshState.setOpenSubChats(reconciledOpenIds);
			}
			// For non-DB tabs, keep placeholders only when we have optimistic local metadata
			// or when running in sandbox mode.
			reconciledOpenIds.forEach((id) => {
				if (!dbSubChatIds.has(id)) {
					const existingLocal = existingSubChatsMap.get(id);
					if (isLocalSource && !existingLocal) return;
					allSubChats.push({
						id,
						name: existingLocal?.name || "New Chat",
						created_at: existingLocal?.created_at ?? new Date().toISOString(),
						updated_at: existingLocal?.updated_at,
						mode: existingLocal?.mode
					});
				}
			});
			if (!areSubChatsEqual(allSubChats, freshState.allSubChats)) {
				freshState.setAllSubChats(allSubChats);
			}
			// Initialize atomFamily mode for each sub-chat from database
			// This ensures new chats with mode="plan" use the correct mode
			for (const sc of dbSubChats) {
				if (sc.mode) {
					appStore.set(subChatModeAtomFamily(sc.id), sc.mode);
				}
			}
			const validOpenIds = reconciledOpenIds;
			if (validOpenIds.length === 0 && allSubChats.length > 0) {
				// No valid open tabs, open the first sub-chat
				freshState.addToOpenSubChats(allSubChats[0].id);
				freshState.setActiveSubChat(allSubChats[0].id);
			} else if (validOpenIds.length > 0) {
				// Validate active tab is in open tabs
				const currentActive = freshState.activeSubChatId;
				if (!currentActive || !validOpenIds.includes(currentActive)) {
					freshState.setActiveSubChat(validOpenIds[0]);
				}
			}
		});
	});
	// Recovery path for rare race conditions where store init does not open any sub-chat.
	createEffect(() => {
		if (!agentChat()) return;
		if (isLocalChatLoading()) return;
		if (tabsToRender().length > 0) return;
		const serverSubChats = agentSubChats();
		if (!serverSubChats.length) return;
		const firstSubChatId = serverSubChats[0]?.id;
		if (!firstSubChatId) return;
		untrack(() => {
			let state = useAgentSubChatStore.getState();
			if (state.chatId !== props.chatId) {
				state.setChatId(props.chatId);
				// Re-read snapshot after setChatId to avoid acting on stale values.
				state = useAgentSubChatStore.getState();
			}
			if (!state.openSubChatIds.includes(firstSubChatId)) {
				state.setOpenSubChats([firstSubChatId]);
			}
			if (state.activeSubChatId !== firstSubChatId) {
				state.setActiveSubChat(firstSubChatId);
			}
		});
	});
	// Auto-detect plan path from ACTIVE sub-chat messages when sub-chat changes
	// This ensures the plan sidebar shows the correct plan for the active sub-chat only
	createEffect(() => {
		const subChats = agentSubChats();
		if (!subChats || subChats.length === 0 || !activeSubChatIdForPlan()) {
			setCurrentPlanPath(null);
			return;
		}
		// Find the active sub-chat
		const activeSubChat = subChats.find((sc) => sc.id === activeSubChatIdForPlan());
		if (!activeSubChat) {
			setCurrentPlanPath(null);
			return;
		}
		// Find last plan file path from active sub-chat only
		let lastPlanPath: string | null = null;
		const messages = activeSubChat.messages as any[] || [];
		for (const msg of messages) {
			if (msg.role !== "assistant") continue;
			const parts = msg.parts || [];
			for (const part of parts) {
				if (part.type === "tool-Write" && isPlanFile(part.input?.file_path || "")) {
					lastPlanPath = part.input.file_path;
				}
			}
		}
		setCurrentPlanPath(lastPlanPath);
	});
	// Persist messages to DB with a single retry on failure
	const persistMessages = (subChatId: string, msgs: UIMessage[]) => {
		if (msgs.length === 0) return;
		desktopRpc.chats.updateSubChatMessages
			.mutate({ id: subChatId, messages: JSON.stringify(msgs) })
			.catch(() => {
				// Single retry
				desktopRpc.chats.updateSubChatMessages
					.mutate({ id: subChatId, messages: JSON.stringify(msgs) })
					.catch((err) => console.error("[chat-view] persist failed after retry:", err));
			});
	};
	// Create or get Chat instance for a sub-chat
	const getOrCreateChat = (subChatId: string): RpcChat | null => {
		if (!agentChat()) {
			return null;
		}
		// Return existing chat if we have it
		const existing = agentChatStore.get(subChatId);
		if (existing) {
			return existing;
		}
		// Find sub-chat data
		const subChat = agentSubChats().find((sc) => sc.id === subChatId);
		const messages = subChat?.messages as any[] || [];
		// Get mode from store metadata (falls back to currentMode)
		const subChatMeta = useAgentSubChatStore.getState().allSubChats.find((sc) => sc.id === subChatId);
		const subChatMode = subChatMeta?.mode || currentMode() as "agent" | "plan";
		// Create transport based on chat type (local worktree vs remote sandbox)
		// Note: Extended thinking setting is read dynamically inside the transport
		// projectPath: original project path for MCP config lookup (worktreePath is the cwd)
		const projectPath = (agentChat() as any)?.project?.path as string | undefined;
		const chatSandboxId = (agentChat() as any)?.sandboxId || (agentChat() as any)?.sandbox_id;
		const chatSandboxUrl = chatSandboxId ? `https://3003-${chatSandboxId}.e2b.app` : null;
		const isRemoteChat = !!(agentChat() as any)?.isRemote || !!chatSandboxId;
		let transport: RpcChatTransport | null = null;
		if (isRemoteChat && chatSandboxUrl) {
			// Remote sandbox chat: use HTTP SSE transport
			const subChatName = subChat?.name || "Chat";
			const modelString = MODEL_ID_MAP[selectedModelId()];
			transport = new RemoteChatTransport({
				chatId: props.chatId,
				subChatId,
				subChatName,
				sandboxUrl: chatSandboxUrl,
				mode: subChatMode,
				model: modelString
			});
		} else if (worktreePath()) {
			// Local worktree chat: use IPC transport
			transport = new IPCChatTransport({
				chatId: props.chatId,
				subChatId,
				cwd: worktreePath()!,
				projectPath,
				mode: subChatMode,
				getStreamOptions: () => {
					const currentConfig = normalizeCustomClaudeConfig(customClaudeConfig());
					return {
						historyEnabled: historyEnabled(),
						maxThinkingTokens: extendedThinkingEnabled() ? EXTENDED_THINKING_MAX_TOKENS : undefined,
						customConfig: currentConfig,
						selectedOllamaModel: selectedOllamaModel() ?? undefined,
						offlineModeEnabled: currentConfig?.token === "ollama",
						currentMode: subChatMode,
					};
				},
			});
		}
		if (!transport) {
			// Keep history view functional even when cwd/sandbox metadata is missing.
			transport = {
				sendMessages: async () => {
					throw new Error("No chat transport available for this workspace (missing worktree/sandbox metadata).");
				},
				reconnectToStream: async () => null,
			};
		}
		const newChat = createRpcChat({
			id: subChatId,
			messages,
			transport,
			chatId: props.chatId,
			onError: () => {
				useStreamingStatusStore().setStatus(subChatId, "ready");
				const errorChat = agentChatStore.get(subChatId);
				if (errorChat) persistMessages(subChatId, errorChat.messages);
			},
			onFinish: () => {
				clearLoading(setLoadingSubChats, subChatId);
				useStreamingStatusStore().setStatus(subChatId, "ready");
				const finishedChat = agentChatStore.get(subChatId);
				if (finishedChat) persistMessages(subChatId, finishedChat.messages);
				const wasManuallyAborted = agentChatStore.wasManuallyAborted(subChatId);
				agentChatStore.clearManuallyAborted(subChatId);
				const currentActiveSubChatId = useAgentSubChatStore.getState().activeSubChatId;
				const currentSelectedChatId = selectedAgentChatIdAtom[0]();
				const isViewingThisSubChat = currentActiveSubChatId === subChatId;
				const isViewingThisChat = currentSelectedChatId === props.chatId;
				if (!isViewingThisSubChat) {
					subChatUnseenChanges().add(subChatId);
				}
				if (!isViewingThisChat) {
					unseenChanges().add(props.chatId);
					if (!wasManuallyAborted) {
							const isSoundEnabled = soundNotificationsEnabledAtom[0]();
						if (isSoundEnabled) {
							try {
								const audio = new Audio("./sound.mp3");
								audio.volume = 1;
								audio.play().catch(() => {});
							} catch {}
						}
						notifyAgentComplete(String(agentChat()?.name ?? "Agent"));
					}
				}
				fetchDiffStatsRef()();
			},
		});
		agentChatStore.set(subChatId, newChat, props.chatId);
		// Store streamId at creation time to prevent resume during active streaming
		// tRPC refetch would update stream_id in DB, but store stays stable
		agentChatStore.setStreamId(subChatId, subChat?.stream_id || null);
		forceUpdate();
		return newChat;
	};
	// Handle creating a new sub-chat
	const handleCreateNewSubChat = async () => {
		const store = useAgentSubChatStore.getState();
		// New sub-chats use the user's default mode preference
		const newSubChatMode = defaultAgentMode;
		// Check if this is a remote sandbox chat
		const isRemoteChat = !!(agentChat() as any)?.isRemote;
		let newId: string;
		if (isRemoteChat) {
			// Sandbox mode: lazy creation (web app pattern)
			// Sub-chat will be persisted on first message via RemoteChatTransport UPSERT
			newId = crypto.randomUUID();
		} else {
			// Local mode: create sub-chat in DB first to get the real ID
				const newSubChat = await desktopRpc.chats.createSubChat.mutate({
					chatId: props.chatId,
					name: "New Chat",
					mode: newSubChatMode() as "agent" | "plan",
				});
					newId = newSubChat.id;
					queryClient?.invalidateQueries({ queryKey: ["chats", "get", props.chatId] });
					// Optimistic update: add new sub-chat to React Query cache immediately
				// This is CRITICAL for workspace isolation - without this, the new sub-chat
				// won't be in validSubChatIds and will be filtered out by tabsToRender
				queryClient?.setQueryData(["chats", "get", props.chatId], (old: { subChats?: any[] } | undefined) => {
				if (!old) return old;
					return {
						...old,
						subChats: [...old.subChats || [], {
						id: newId,
						name: "New Chat",
						mode: newSubChatMode() as "agent" | "plan",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						messages: null,
						stream_id: null
						}]
					};
				});
				}
		// Track this subchat as just created for typewriter effect
		justCreatedIds().add(newId);
		// Add to allSubChats with placeholder name
		store.addToAllSubChats({
			id: newId,
			name: "New Chat",
			created_at: new Date().toISOString(),
			mode: newSubChatMode() as "agent" | "plan"
		});
		// Add to open tabs and set as active
		store.addToOpenSubChats(newId);
		store.setActiveSubChat(newId);
		// Create empty Chat instance for the new sub-chat
		const projectPath = (agentChat() as any)?.project?.path as string | undefined;
		const newSubChatSandboxId = (agentChat() as any)?.sandboxId || (agentChat() as any)?.sandbox_id;
		const newSubChatSandboxUrl = newSubChatSandboxId ? `https://3003-${newSubChatSandboxId}.e2b.app` : null;
		const isNewSubChatRemote = !!(agentChat() as any)?.isRemote || !!newSubChatSandboxId;
		if (DEBUG_AGENTS_DIFF) console.log("[createNewSubChat] Transport selection", {
			newId: newId.slice(-8),
			isNewSubChatRemote,
			newSubChatSandboxId,
			newSubChatSandboxUrl
		});
		let newSubChatTransport: RpcChatTransport | null = null;
		if (isNewSubChatRemote && newSubChatSandboxUrl) {
			// Remote sandbox chat: use HTTP SSE transport
			const modelString = MODEL_ID_MAP[selectedModelId()];
			if (DEBUG_AGENTS_DIFF) console.log("[createNewSubChat] Using RemoteChatTransport", { model: modelString });
			newSubChatTransport = new RemoteChatTransport({
				chatId: props.chatId,
				subChatId: newId,
				subChatName: "New Chat",
				sandboxUrl: newSubChatSandboxUrl,
				mode: newSubChatMode() as "agent" | "plan",
				model: modelString
			});
		} else if (worktreePath()) {
			// Local worktree chat: use IPC transport
			newSubChatTransport = new IPCChatTransport({
				chatId: props.chatId,
				subChatId: newId,
				cwd: worktreePath()!,
				projectPath,
				mode: newSubChatMode() as "agent" | "plan",
				getStreamOptions: () => {
					const currentConfig = normalizeCustomClaudeConfig(customClaudeConfig());
					return {
						historyEnabled: historyEnabled(),
						maxThinkingTokens: extendedThinkingEnabled() ? EXTENDED_THINKING_MAX_TOKENS : undefined,
						customConfig: currentConfig,
						selectedOllamaModel: selectedOllamaModel() ?? undefined,
						offlineModeEnabled: currentConfig?.token === "ollama",
						currentMode: newSubChatMode() as "agent" | "plan",
					};
				},
			});
		}
		if (newSubChatTransport) {
			const transport = newSubChatTransport;
			const newChat = createRpcChat({
				id: newId,
				messages: [],
				transport,
				chatId: props.chatId,
				onError: () => {
					useStreamingStatusStore().setStatus(newId, "ready");
					const errorChat = agentChatStore.get(newId);
					if (errorChat) persistMessages(newId, errorChat.messages);
				},
				onFinish: () => {
					clearLoading(setLoadingSubChats, newId);
					useStreamingStatusStore().setStatus(newId, "ready");
					const finishedChat = agentChatStore.get(newId);
					if (finishedChat) persistMessages(newId, finishedChat.messages);
					const wasManuallyAborted = agentChatStore.wasManuallyAborted(newId);
					agentChatStore.clearManuallyAborted(newId);
					const currentActiveSubChatId = useAgentSubChatStore.getState().activeSubChatId;
					const currentSelectedChatId = selectedAgentChatIdAtom[0]();
					const isViewingThisSubChat = currentActiveSubChatId === newId;
					const isViewingThisChat = currentSelectedChatId === props.chatId;
					if (!isViewingThisSubChat) subChatUnseenChanges().add(newId);
					if (!isViewingThisChat) {
						unseenChanges().add(props.chatId);
						if (!wasManuallyAborted) {
							const isSoundEnabled = soundNotificationsEnabledAtom[0]();
							if (isSoundEnabled) {
								try {
									const audio = new Audio("./sound.mp3");
									audio.volume = 1;
									audio.play().catch(() => {});
								} catch {}
							}
						notifyAgentComplete(String(agentChat()?.name ?? "Agent"));
						}
					}
					fetchDiffStatsRef()();
				},
			});
			agentChatStore.set(newId, newChat, props.chatId);
			agentChatStore.setStreamId(newId, null);
			forceUpdate();
		}
	};
	// Keyboard shortcut: New sub-chat
	// Web: Opt+Cmd+T (browser uses Cmd+T for new tab)
	// Desktop: Cmd+T
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isDesktop = isDesktopApp();
			// Desktop: Cmd+T (without Alt)
			if (isDesktop && e.metaKey && e.code === "KeyT" && !e.altKey) {
				e.preventDefault();
				handleCreateNewSubChat();
				return;
			}
			// Web: Opt+Cmd+T (with Alt)
			if (e.altKey && e.metaKey && e.code === "KeyT") {
				e.preventDefault();
				handleCreateNewSubChat();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// NOTE: Desktop notifications for pending questions are now triggered directly
	// in ipc-chat-transport.ts when the ask-user-question chunk arrives.
	// This prevents duplicate notifications from multiple ChatView instances.
	// Multi-select state for sub-chats (for Cmd+W bulk close)
	const selectedSubChatIds = selectedSubChatIdsAtom[0];
	const isSubChatMultiSelectMode = isSubChatMultiSelectModeAtom;
	const clearSubChatSelection = () => selectedSubChatIdsAtom[1](new ReactiveSet<string>());
	// Helper to add sub-chat to undo stack
	const addSubChatToUndoStack = (subChatId: string) => {
		const timeoutId = setTimeout(() => {
			setUndoStack((prev) => prev.filter((item) => !(item.type === "subchat" && item.subChatId === subChatId)));
		}, 1e4);
		setUndoStack((prev) => [...prev, {
			type: "subchat",
			subChatId,
			chatId: props.chatId,
			timeoutId
		}]);
	};
	// Keyboard shortcut: Close active sub-chat (or bulk close if multi-select mode)
	// Web: Opt+Cmd+W (browser uses Cmd+W to close tab)
	// Desktop: Cmd+W
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isDesktop = isDesktopApp();
			// Desktop: Cmd+W (without Alt)
			const isDesktopShortcut = isDesktop && e.metaKey && e.code === "KeyW" && !e.altKey && !e.shiftKey && !e.ctrlKey;
			// Web: Opt+Cmd+W (with Alt)
			const isWebShortcut = e.altKey && e.metaKey && e.code === "KeyW";
			if (isDesktopShortcut || isWebShortcut) {
				e.preventDefault();
				const store = useAgentSubChatStore.getState();
				// If multi-select mode, bulk close selected sub-chats
				if (isSubChatMultiSelectMode() && selectedSubChatIds().size > 0) {
					const idsToClose = Array.from(selectedSubChatIds());
					const remainingOpenIds = store.openSubChatIds.filter((id: string) => !idsToClose.includes(id));
					// Don't close all tabs via hotkey - user should use sidebar dialog for last tab
					if (remainingOpenIds.length > 0) {
						idsToClose.forEach((id) => {
							store.removeFromOpenSubChats(id);
							addSubChatToUndoStack(id);
						});
					}
					clearSubChatSelection();
					return;
				}
				// Otherwise close active sub-chat
				const activeId = store.activeSubChatId;
				const openIds = store.openSubChatIds;
				// Only close if we have more than one tab open and there's an active tab
				// removeFromOpenSubChats automatically switches to the last remaining tab
				if (activeId && openIds.length > 1) {
					store.removeFromOpenSubChats(activeId);
					addSubChatToUndoStack(activeId);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Keyboard shortcut: Navigate between sub-chats
	// Web: Opt+Cmd+[ and Opt+Cmd+] (browser uses Cmd+[ for back)
	// Desktop: Cmd+[ and Cmd+]
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isDesktop = isDesktopApp();
			// Check for previous sub-chat shortcut ([ key)
			const isPrevDesktop = isDesktop && e.metaKey && e.code === "BracketLeft" && !e.altKey && !e.shiftKey && !e.ctrlKey;
			const isPrevWeb = e.altKey && e.metaKey && e.code === "BracketLeft";
			if (isPrevDesktop || isPrevWeb) {
				e.preventDefault();
				const store = useAgentSubChatStore.getState();
				const activeId = store.activeSubChatId;
				const openIds = store.openSubChatIds;
				// Only navigate if we have multiple tabs
				if (openIds.length <= 1) return;
				// If no active tab, select first one
				if (!activeId) {
					store.setActiveSubChat(openIds[0]);
					return;
				}
				// Find current index
				const currentIndex = openIds.indexOf(activeId);
				if (currentIndex === -1) {
					// Current tab not found, select first
					store.setActiveSubChat(openIds[0]);
					return;
				}
				// Navigate to previous tab (cycle to end if at start)
				const nextIndex = currentIndex - 1 < 0 ? openIds.length - 1 : currentIndex - 1;
				const nextId = openIds[nextIndex];
				if (nextId) {
					store.setActiveSubChat(nextId);
				}
			}
			// Check for next sub-chat shortcut (] key)
			const isNextDesktop = isDesktop && e.metaKey && e.code === "BracketRight" && !e.altKey && !e.shiftKey && !e.ctrlKey;
			const isNextWeb = e.altKey && e.metaKey && e.code === "BracketRight";
			if (isNextDesktop || isNextWeb) {
				e.preventDefault();
				const store = useAgentSubChatStore.getState();
				const activeId = store.activeSubChatId;
				const openIds = store.openSubChatIds;
				// Only navigate if we have multiple tabs
				if (openIds.length <= 1) return;
				// If no active tab, select first one
				if (!activeId) {
					store.setActiveSubChat(openIds[0]);
					return;
				}
				// Find current index
				const currentIndex = openIds.indexOf(activeId);
				if (currentIndex === -1) {
					// Current tab not found, select first
					store.setActiveSubChat(openIds[0]);
					return;
				}
				// Navigate to next tab (cycle to start if at end)
				const nextIndex = (currentIndex + 1) % openIds.length;
				const nextId = openIds[nextIndex];
				if (nextId) {
					store.setActiveSubChat(nextId);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Keyboard shortcut: Cmd + D to toggle diff sidebar
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check for Cmd (Meta) + D (without Alt/Shift)
			if (e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey && e.code === "KeyD") {
				e.preventDefault();
				e.stopPropagation();
				// Toggle diff sidebar
				setIsDiffSidebarOpen(!isDiffSidebarOpen());
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Keyboard shortcut: Create PR (preview)
	// Web: Opt+Cmd+P (browser uses Cmd+P for print)
	// Desktop: Cmd+P
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isDesktop = isDesktopApp();
			// Desktop: Cmd+P (without Alt)
			const isDesktopShortcut = isDesktop && e.metaKey && e.code === "KeyP" && !e.altKey && !e.shiftKey && !e.ctrlKey;
			// Web: Opt+Cmd+P (with Alt)
			const isWebShortcut = e.altKey && e.metaKey && e.code === "KeyP";
			if (isDesktopShortcut || isWebShortcut) {
				e.preventDefault();
				e.stopPropagation();
				// Only create PR if there are changes and not already creating
				if (diffStats().hasChanges && !isCreatingPr()) {
					handleCreatePr();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Keyboard shortcut: Cmd + Shift + E to restore archived workspace
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey && e.code === "KeyE") {
				if (isArchived && !restoreWorkspaceMutation.isPending) {
					e.preventDefault();
					e.stopPropagation();
					handleRestoreWorkspace();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Handle auto-rename for sub-chat and parent chat
	// Receives subChatId as param to avoid stale closure issues
	const handleAutoRename = (userMessage: string, subChatId: string) => {
		// Check if this is the first sub-chat using agentSubChats directly
		// to avoid race condition with store initialization
		const firstSubChatId = getFirstSubChatId(agentSubChats());
		const isFirst = firstSubChatId === subChatId;
		autoRenameAgentChat({
			subChatId,
			parentChatId: props.chatId,
			userMessage,
			isFirstSubChat: isFirst,
			generateName: async (msg) => {
				return generateSubChatNameMutation.mutateAsync({
					userMessage: msg,
					ollamaModel: selectedOllamaModel()
				});
			},
			renameSubChat: async (input) => {
				await renameSubChatMutation.mutateAsync(input);
			},
			renameChat: async (input) => {
				await renameChatMutation.mutateAsync(input);
			},
			updateSubChatName: (subChatIdToUpdate, name) => {
				// Update local store
				useAgentSubChatStore.getState().updateSubChatName(subChatIdToUpdate, name);
				// Also update query cache so init effect doesn't overwrite
				if (!queryClient) return;
					type ChatData = { subChats: Array<{ id: string; name?: string | null; created_at?: Date | string; updated_at?: Date | string; messages?: unknown[]; mode?: string; stream_id?: string | null; chat_id?: string }> };
					queryClient.setQueryData<ChatData | undefined>(["chats", "get", props.chatId], (old) => {
					if (!old) return old;
					const existsInCache = old.subChats.some((sc) => sc.id === subChatIdToUpdate);
					if (!existsInCache) {
						// Sub-chat not in cache yet (DB save still in flight) - add it
						return {
							...old,
							subChats: [...old.subChats, {
								id: subChatIdToUpdate,
								name,
								created_at: new Date(),
								updated_at: new Date(),
								messages: [],
								mode: "agent",
								stream_id: null,
								chat_id: props.chatId
							}]
						};
					}
					return {
							...old,
							subChats: old.subChats.map((sc) => sc.id === subChatIdToUpdate ? {
								...sc,
								name
							} : sc)
						};
					});
					},
			updateChatName: (chatIdToUpdate, name) => {
				if (!queryClient) return;
				// Optimistic update for sidebar (list query)
				// On desktop, selectedTeamId is always null, so we update unconditionally
				type ChatListItem = { id: string; name?: string | null };
				queryClient.setQueryData<ChatListItem[] | undefined>(["chats", "list"], (old) => {
					if (!old) return old;
					return old.map((c) => c.id === chatIdToUpdate ? {
						...c,
						name
					} : c);
				});
				// Optimistic update for header (single chat query)
				type ChatNameData = { name?: string | null };
				queryClient.setQueryData<ChatNameData | undefined>(["chats", "get", chatIdToUpdate], (old) => {
					if (!old) return old;
					return {
						...old,
						name
					};
				});
			}
		});
	};
	// Get or create Chat instance for active sub-chat
	const activeChat = createMemo(() => {
		const id = activeSubChatId();
		if (!id || !agentChat()) {
			return null;
		}
		return getOrCreateChat(id);
	});
	// Check if active sub-chat is the first one (for renaming parent chat)
	// Use agentSubChats directly to avoid race condition with store initialization
	const isFirstSubChatActive = createMemo(() => {
		const id = activeSubChatId();
		if (!id) return false;
		return getFirstSubChatId(agentSubChats()) === id;
	});
	// Determine if chat header should be hidden
	const shouldHideChatHeader = subChatsSidebarMode() === "sidebar" && isPreviewSidebarOpen() && isDiffSidebarOpen() && !props.isMobileFullscreen;
	// No early return - let the UI render with loading state handled by activeChat check below
	return <TextSelectionProvider>
    <div class="flex h-full flex-col">
      {	/* Main content */}
      <div class="flex-1 overflow-hidden flex">
        { /* Chat Panel */}
        <div class="flex-1 flex flex-col overflow-hidden relative" style={{ "min-width": "350px" }}>
          { /* SubChatSelector header - absolute when sidebar open (desktop only), regular div otherwise */}
          <Show when={!shouldHideChatHeader}><div class={cn(
 "relative z-20 pointer-events-none",
		// Mobile: always flex; Desktop: absolute when sidebar open, flex when closed
		!props.isMobileFullscreen && subChatsSidebarMode() === "sidebar" ? `absolute top-0 left-0 right-0 ${CHAT_LAYOUT.headerPaddingSidebarOpen}` : `flex-shrink-0 ${CHAT_LAYOUT.headerPaddingSidebarClosed}`
	)}>
              {	/* Gradient background - only when not absolute */}
              <Show when={props.isMobileFullscreen || subChatsSidebarMode() !== "sidebar"}><div class="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" /></Show>
              <div class="pointer-events-auto flex items-center justify-between relative">
                <div class="flex-1 min-w-0 flex items-center gap-2">
                  { /* Mobile header - simplified with chat name as trigger */}
                  <Show when={props.isMobileFullscreen} fallback={<>
                      { /* Header controls - desktop only */}
                      <AgentsHeaderControls isSidebarOpen={props.isSidebarOpen} onToggleSidebar={props.onToggleSidebar} hasUnseenChanges={hasAnyUnseenChanges} isSubChatsSidebarOpen={subChatsSidebarMode() === "sidebar"} />
                      <SubChatSelector onCreateNew={handleCreateNewSubChat} isMobile={false} onBackToChats={props.onBackToChats} onOpenPreview={props.onOpenPreview} canOpenPreview={canOpenPreview()} onOpenDiff={canOpenDiff() ? () => setIsDiffSidebarOpen(true) : undefined} canOpenDiff={canShowDiffButton()} isDiffSidebarOpen={isDiffSidebarOpen()} diffStats={diffStats()} onOpenTerminal={() => setIsTerminalSidebarOpen(true)} canOpenTerminal={!!worktreePath()} chatId={props.chatId} />
                      { /* Open Locally button - desktop only, sandbox mode */}
                      <Show when={showOpenLocally()}><Tooltip delayDuration={500}>
                          <TooltipTrigger asChild>
                            <Button variant="default" size="sm" onClick={handleOpenLocally} disabled={isImporting} class="h-6 px-2 gap-1.5 text-xs font-medium ml-2">
                              <Show when={isImporting} fallback={<GitFork class="h-3 w-3" />}><IconSpinner class="h-3 w-3 animate-spin" /></Show>
                              Fork Locally
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Continue this session on your local machine
                          </TooltipContent>
                        </Tooltip></Show>
                    </>}><MobileChatHeader onCreateNew={handleCreateNewSubChat} onBackToChats={props.onBackToChats} onOpenPreview={props.onOpenPreview} canOpenPreview={canOpenPreview()} onOpenDiff={props.onOpenDiff} canOpenDiff={canShowDiffButton()} diffStats={diffStats()} onOpenTerminal={props.onOpenTerminal} canOpenTerminal={!!worktreePath()} isArchived={isArchived} onRestore={handleRestoreWorkspace} onOpenLocally={handleOpenLocally} showOpenLocally={showOpenLocally()} /></Show>
                </div>
                { /* Open Preview Button - shows when preview is closed (desktop only, local mode only) */}
                <Show when={!props.isMobileFullscreen && !isPreviewSidebarOpen && sandboxId() && chatSourceMode() === "local"}>
                  <Show when={canOpenPreview()} fallback={<PreviewSetupHoverCard>
                      <span class="inline-flex ml-2">
                        <Button variant="ghost" size="icon" disabled class="h-6 w-6 p-0 text-muted-foreground flex-shrink-0 rounded-md cursor-not-allowed pointer-events-none" aria-label="Preview not available">
                          <IconOpenSidebarRight class="h-4 w-4" />
                        </Button>
                      </span>
                    </PreviewSetupHoverCard>}>
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setIsPreviewSidebarOpen(true)} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="Open preview">
                          <IconOpenSidebarRight class="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open preview</TooltipContent>
                    </Tooltip>
                  </Show>
                </Show>
                { /* Overview/Terminal Button - shows when sidebar is closed and worktree/sandbox exists (desktop only) */}
                <Show when={!props.isMobileFullscreen && (worktreePath() || sandboxId())}>
                  <Show when={isUnifiedSidebarEnabled()} fallback={
                    <Show when={!isTerminalSidebarOpen()}><Tooltip delayDuration={500}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsTerminalSidebarOpen(true)} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="Open terminal">
                              <TerminalSquare class="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Open terminal
                            <Show when={toggleTerminalHotkey}><Kbd>{toggleTerminalHotkey}</Kbd></Show>
                          </TooltipContent>
                        </Tooltip></Show>
                  }>
                    <Show when={!isDetailsSidebarOpen()}><Tooltip delayDuration={500}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setIsDetailsSidebarOpen(true)} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="View details">
                              <IconOpenSidebarRight class="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            View details
                            <Show when={toggleDetailsHotkey}><Kbd>{toggleDetailsHotkey}</Kbd></Show>
                          </TooltipContent>
                        </Tooltip></Show>
                  </Show>
                </Show>
                { /* Restore Button - shows when viewing archived workspace (desktop only) */}
                <Show when={!props.isMobileFullscreen && isArchived}><Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={handleRestoreWorkspace} disabled={restoreWorkspaceMutation.isPending} class="h-6 px-2 gap-1.5 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2 flex items-center" aria-label="Restore workspace">
                        <IconTextUndo class="h-4 w-4" />
                        <span class="text-xs">Restore</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Restore workspace
                      <Kbd>⇧⌘E</Kbd>
                    </TooltipContent>
                  </Tooltip></Show>
              </div>
            </div></Show>

          { /* Chat Content - Keep-alive: render all open tabs, hide inactive with CSS */}
          <Show when={renderTabIds().length > 0 && agentChat()} fallback={<>
              {	/* Empty chat area - no loading indicator */}
              <div class="flex-1 flex items-center justify-center">
                <Show
                  when={isLocalChatLoading()}
                  fallback={
                    <Show
                      when={isLocalChatError()}
                      fallback={
                        <Show
                          when={chatSourceMode() === "local" && localLoadingGateTimedOut()}
                          fallback={<div />}
                        >
                          <div class="flex flex-col items-center gap-2 text-center">
                            <div class="text-sm text-muted-foreground">
                              This workspace took too long to load.
                            </div>
                            <div class="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  void localAgentChatQuery.refetch();
                                }}
                              >
                                Retry
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedChatId(null);
                                  setChatSourceMode("local");
                                }}
                              >
                                Back to Chats
                              </Button>
                            </div>
                          </div>
                        </Show>
                      }
                    >
                      <div class="flex flex-col items-center gap-2 text-center">
                        <div class="text-sm text-muted-foreground">
                          {localChatErrorMessage()}
                        </div>
                        <div class="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              void localAgentChatQuery.refetch();
                            }}
                          >
                            Retry
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedChatId(null);
                              setChatSourceMode("local");
                            }}
                          >
                            Back to Chats
                          </Button>
                        </div>
                      </div>
                    </Show>
                  }
                >
                  <IconSpinner class="h-6 w-6 animate-spin" />
                </Show>
              </div>

              { /* Disabled input while loading */}
              <div class="px-2 pb-2">
                <div class="w-full max-w-2xl mx-auto">
                  <div class="relative w-full">
                    <PromptInput class="border bg-input-background relative z-10 p-2 rounded-xl opacity-50 pointer-events-none" maxHeight={200}>
                      <div class="p-1 text-muted-foreground text-sm">
                        Plan, @ for context, / for commands
                      </div>
                      <PromptInputActions class="w-full">
                        <div class="flex items-center gap-0.5 flex-1 min-w-0">
                          { /* Mode selector placeholder */}
                          <button disabled class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground rounded-md cursor-not-allowed">
                            <AgentIcon class="h-3.5 w-3.5" />
                            <span>Agent</span>
                            <ChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                          </button>

                          { /* Model selector placeholder */}
                          <button disabled class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground rounded-md cursor-not-allowed">
                            <ClaudeCodeIcon class="h-3.5 w-3.5" />
                            <span>
                              <Show when={hasCustomClaudeConfig()} fallback={selectedModelName()}>
                                Custom Model
                              </Show>
                            </span>
                            <ChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                          </button>
                        </div>
                        <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                          { /* Attach button placeholder */}
                          <Button variant="ghost" size="icon" disabled class="h-7 w-7 rounded-sm cursor-not-allowed">
                            <AttachIcon class="h-4 w-4" />
                          </Button>

                          { /* Send button */}
                          <div class="ml-1">
                            <AgentSendButton disabled={true} onClick={() => {}} />
                          </div>
                        </div>
                      </PromptInputActions>
                    </PromptInput>
                  </div>
                </div>
              </div>
            </>}><div class="relative flex-1 min-h-0">
              { /* Loading gate: prevent getOrCreateChat() from caching empty messages before data is ready */}
              <Show when={!isLocalChatLoading()} fallback={<div class="flex items-center justify-center h-full">
                  <IconSpinner class="h-6 w-6 animate-spin" />
                </div>}>
                <For each={renderTabIds()}>{(subChatId: string) => {
 const chat = getOrCreateChat(subChatId);
		const isActive = () => {
			const activeId = activeSubChatId();
			if (activeId) return subChatId === activeId;
			return subChatId === renderTabIds()[0];
		};
		const isFirstSubChat = () => getFirstSubChatId(agentSubChats()) === subChatId;
		// Defense in depth: double-check workspace ownership
		// Use agentSubChats (server data) as primary source, fall back to allSubChats for optimistic updates
		// This fixes the race condition where allSubChats is empty after setChatId but before setAllSubChats
		const belongsToWorkspace = agentSubChats().some((sc: { id: string }) => sc.id === subChatId) || allSubChats().some((sc) => sc.id === subChatId);
		if (!chat || !belongsToWorkspace) return null;
		return <div class="absolute inset-0 flex flex-col" style={{
			transform: isActive() ? "translateZ(0)" : "translateZ(0) scale(0.98)",
			opacity: isActive() ? 1 : 0,
			"pointer-events": isActive() ? "auto" : "none",
			"will-change": "transform, opacity",
			contain: "layout style paint"
		}} aria-hidden={!isActive()}>
		<ChatViewInner chat={chat} subChatId={subChatId} parentChatId={props.chatId} isFirstSubChat={isFirstSubChat()} onAutoRename={handleAutoRename} onCreateNewSubChat={handleCreateNewSubChat} teamId={selectedTeamId() || undefined} repository={repository ?? undefined} streamId={agentChatStore.getStreamId(subChatId)} isMobile={props.isMobileFullscreen} isSubChatsSidebarOpen={subChatsSidebarMode() === "sidebar"} sandboxId={sandboxId() ?? undefined} projectPath={worktreePath() ?? undefined} isArchived={isArchived} onRestoreWorkspace={handleRestoreWorkspace} existingPrUrl={existingPrUrl} isActive={isActive()} />
					</div>;
			}}</For>
              </Show>
            </div></Show>
        </div>

        { /* Plan Sidebar - shows plan files on the right (leftmost right sidebar) */}
        { /* Only show when we have an active sub-chat with a plan */}
		<Show when={!props.isMobileFullscreen && activeSubChatIdForPlan()}><ResizableSidebar isOpen={isPlanSidebarOpen() && !!currentPlanPath()} onClose={() => setIsPlanSidebarOpen(false)} width={agentsPlanSidebarWidthAtom[0]} setWidth={agentsPlanSidebarWidthAtom[1]} minWidth={400} maxWidth={800} side="right" animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{ "border-left-width": "0.5px" }}>
			<AgentPlanSidebar chatId={activeSubChatIdForPlan()!} planPath={currentPlanPath()} onClose={() => setIsPlanSidebarOpen(false)} onBuildPlan={handleApprovePlanFromSidebar} refetchTrigger={planEditRefetchTrigger()} mode={currentMode()} />
		  </ResizableSidebar></Show>

        { /* Diff View - hidden on mobile fullscreen and when diff is not available */}
        { /* Supports three display modes: side-peek (sidebar), center-peek (dialog), full-page */}
        { /* Wrapped in DiffStateProvider to isolate diff state and prevent ChatView re-renders */}
		<Show when={canOpenDiff() && !props.isMobileFullscreen}><DiffStateProvider isDiffSidebarOpen={isDiffSidebarOpen()} parsedFileDiffs={parsedFileDiffs()} isDiffSidebarNarrow={isDiffSidebarNarrow()} setIsDiffSidebarOpen={setIsDiffSidebarOpen} setDiffStats={setDiffStats} setDiffContent={setDiffContent} setParsedFileDiffs={setParsedFileDiffs} setPrefetchedFileContents={setPrefetchedFileContents} fetchDiffStats={fetchDiffStats}>
	            <DiffSidebarRenderer worktreePath={worktreePath() ?? null} chatId={props.chatId} sandboxId={sandboxId() ?? null} repository={repositoryInfo()} diffStats={diffStats()} branchData={branchData()} gitStatus={gitStatus()} isGitStatusLoading={isGitStatusLoading()} isDiffSidebarOpen={isDiffSidebarOpen()} diffDisplayMode={diffDisplayMode()} diffSidebarWidth={diffSidebarWidth()} diffViewRef={setDiffViewRef} diffSidebarRef={setDiffSidebarRef} handleReview={handleReview} isReviewing={isReviewing()} handleCreatePr={handleCreatePr} isCreatingPr={isCreatingPr()} handleMergePr={handleMergePr} mergePrMutation={mergePrMutation} handleRefreshGitStatus={handleRefreshGitStatus} hasPrNumber={hasPrNumber} isPrOpen={isPrOpen()} hasMergeConflicts={hasMergeConflicts()} handleFixConflicts={handleFixConflicts} handleExpandAll={handleExpandAll} handleCollapseAll={handleCollapseAll} diffMode={diffMode()} setDiffMode={setDiffMode} handleMarkAllViewed={handleMarkAllViewed} handleMarkAllUnviewed={handleMarkAllUnviewed} isDesktop={isDesktop()} isFullscreen={isFullscreen() ?? false} setDiffDisplayMode={setDiffDisplayMode} handleCommitToPr={handleCommitToPr} isCommittingToPr={isCommittingToPr()}>
	              <DiffSidebarContent worktreePath={worktreePath() ?? null} chatId={props.chatId} sandboxId={sandboxId() ?? null} repository={repositoryInfo()} diffStats={diffStats()} setDiffStats={setDiffStats} diffContent={diffContent()} parsedFileDiffs={parsedFileDiffs()} prefetchedFileContents={prefetchedFileContents()} setDiffCollapseState={setDiffCollapseState} diffViewRef={setDiffViewRef} agentChat={agentChat()} sidebarWidth={diffDisplayMode() === "side-peek" ? diffSidebarWidth() : diffDisplayMode() === "center-peek" ? 1200 : typeof window !== "undefined" ? window.innerWidth : 1200} onCommitWithAI={handleCommitToPr} isCommittingWithAI={isCommittingToPr()} diffMode={diffMode()} setDiffMode={setDiffMode} onCreatePr={handleCreatePr} subChats={subChatsWithFiles()} />
	            </DiffSidebarRenderer>
	          </DiffStateProvider></Show>

        { /* Preview Sidebar - hidden on mobile fullscreen and when preview is not available */}
		<Show when={canOpenPreview() && !props.isMobileFullscreen}><ResizableSidebar isOpen={isPreviewSidebarOpen()} onClose={() => setIsPreviewSidebarOpen(false)} width={agentsPreviewSidebarWidthAtom[0]} setWidth={agentsPreviewSidebarWidthAtom[1]} minWidth={350} side="right" animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{ "border-left-width": "0.5px" }}>
            <Show when={!isQuickSetup} fallback={<div class="flex flex-col h-full">
                { /* Header with close button */}
                <div class="flex items-center justify-end px-3 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
                  <Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={() => setIsPreviewSidebarOpen(false)}>
                    <IconCloseSidebarRight class="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                { /* Content */}
                <div class="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <div class="text-muted-foreground mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-50">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <p class="text-sm text-muted-foreground mb-2">
                    Preview not available
                  </p>
                  <p class="text-xs text-muted-foreground/70 max-w-[200px]">
                    Set up this repository to enable live preview
                  </p>
                </div>
			</div>}><AgentPreview chatId={props.chatId} sandboxId={sandboxId()!} port={previewPort} repository={repository ?? undefined} hideHeader={false} onClose={() => setIsPreviewSidebarOpen(false)} /></Show>
          </ResizableSidebar></Show>

		{ /* Terminal Sidebar - shows when worktree exists (desktop only) */}
		<Show when={worktreePath()}><TerminalSidebar chatId={props.chatId} cwd={worktreePath()!} /></Show>

        { /* Open Locally Dialog - for importing sandbox chats to local */}
		<OpenLocallyDialog isOpen={openLocallyDialogOpen()} onClose={() => setOpenLocallyDialogOpen(false)} remoteChat={remoteAgentChat() ?? null} matchingProjects={openLocallyMatchingProjects()} allProjects={projects()} remoteSubChatId={activeSubChatId()} />

        { /* Unified Details Sidebar - combines all right sidebars into one (rightmost) */}
        { /* Show for both local (worktreePath) and remote (sandboxId) chats */}
		<Show when={isUnifiedSidebarEnabled() && !props.isMobileFullscreen && (worktreePath() || sandboxId())}><DetailsSidebar chatId={props.chatId} worktreePath={worktreePath() ?? null} planPath={currentPlanPath()} mode={currentMode()} onBuildPlan={handleApprovePlanFromSidebar} planRefetchTrigger={planEditRefetchTrigger()} activeSubChatId={activeSubChatIdForPlan()} isPlanSidebarOpen={isPlanSidebarOpen() && !!currentPlanPath()} isTerminalSidebarOpen={isTerminalSidebarOpen()} isDiffSidebarOpen={isDiffSidebarOpen()} diffDisplayMode={diffDisplayMode()} canOpenDiff={canOpenDiff()} setIsDiffSidebarOpen={setIsDiffSidebarOpen} diffStats={diffStats()} parsedFileDiffs={parsedFileDiffs()} onCommit={handleCommitToPr} isCommitting={isCommittingToPr()} onExpandTerminal={() => setIsTerminalSidebarOpen(true)} onExpandPlan={() => setIsPlanSidebarOpen(true)} onExpandDiff={() => setIsDiffSidebarOpen(true)} onFileSelect={(filePath) => {
 // Set the selected file path
		setSelectedFilePath(filePath);
		// Set filtered files to just this file
		setFilteredDiffFiles([filePath]);
		// Open the diff sidebar
		setIsDiffSidebarOpen(true);
	}} remoteInfo={remoteInfo()} isRemoteChat={!!remoteInfo()} /></Show>
      </div>
    </div>
    </TextSelectionProvider>;
}
