import { ChevronDown, Zap } from "lucide-solid";
import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { AgentIcon, AttachIcon, CheckIcon, ClaudeCodeIcon, PlanIcon, ThinkingIcon } from "../../../components/ui/icons";
import { Kbd } from "../../../components/ui/kbd";
import { PromptInput, PromptInputActions, PromptInputContextItems } from "../../../components/ui/prompt-input";
import { Switch } from "../../../components/ui/switch";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { autoOfflineModeAtom, customClaudeConfigAtom, extendedThinkingEnabledAtom, normalizeCustomClaudeConfig, selectedOllamaModelAtom, showOfflineModeFeaturesAtom } from "../../../lib/atoms";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { cn } from "../../../lib/utils";
import { lastSelectedModelIdAtom, subChatModeAtomFamily, getNextMode, type AgentMode, type SubChatFileChange } from "../atoms";
import { useAgentSubChatStore } from "../stores/sub-chat-store";
import { AgentsSlashCommand, type SlashCommandOption } from "../commands";
import { AgentSendButton } from "../components/agent-send-button";
import type { UploadedFile, UploadedImage } from "../hooks/use-agents-file-upload";
import { clearSubChatDraft, saveSubChatDraftWithAttachments } from "../lib/drafts";
import { CLAUDE_MODELS } from "../lib/models";
import type { DiffTextContext, SelectedTextContext } from "../lib/queue-utils";
import { AgentsFileMention, AgentsMentionsEditor, type AgentsMentionsEditorHandle, type FileMentionOption } from "../mentions";
import { AgentContextIndicator, type MessageTokenData } from "../ui/agent-context-indicator";
import { AgentDiffTextContextItem } from "../ui/agent-diff-text-context-item";
import { AgentFileItem } from "../ui/agent-file-item";
import { AgentImageItem } from "../ui/agent-image-item";
import { AgentPastedTextItem } from "../ui/agent-pasted-text-item";
import { AgentTextContextItem } from "../ui/agent-text-context-item";
import { VoiceWaveIndicator } from "../ui/voice-wave-indicator";
import { handlePasteEvent } from "../utils/paste-text";
import type { PastedTextFile } from "../hooks/use-pasted-text-files";
import { useVoiceRecording, blobToBase64, getAudioFormat } from "../../../lib/hooks/use-voice-recording";
import { getResolvedHotkey } from "../../../lib/hotkeys";
import { customHotkeysAtom } from "../../../lib/atoms";
// NOTE: desktopRpc already imported above (line 14)
// Hook to get available models (including offline models if Ollama is available and debug enabled)
function useAvailableModels() {
	const showOfflineFeatures = showOfflineModeFeaturesAtom[0];
	const ollamaQuery = useQuery(() => ({
		queryKey: ["ollama", "getStatus"] as const,
		queryFn: () => desktopRpc.ollama.getStatus(),
		refetchInterval: showOfflineFeatures() ? 3e4 : false,
		enabled: showOfflineFeatures(),
	}));
	const baseModels = CLAUDE_MODELS;
	// Wrap query data access in accessor for reactivity
	const status = () => ollamaQuery.data;
	const isOffline = () => {
		const s = status();
		return s ? !s.internet.online : false;
	};
	const hasOllama = () => {
		const s = status();
		return s?.ollama.available && (s.ollama.models?.length ?? 0) > 0;
	};
	const ollamaModels = () => status()?.ollama.models || [];
	const recommendedModel = () => status()?.ollama.recommendedModel;
	// Return accessors so consumers can react to changes
	return {
		get models() { return baseModels; },
		get ollamaModels() { return showOfflineFeatures() && hasOllama() && isOffline() ? ollamaModels() : []; },
		get recommendedModel() { return showOfflineFeatures() && hasOllama() && isOffline() ? recommendedModel() : undefined; },
		get isOffline() { return isOffline(); },
		get hasOllama() { return showOfflineFeatures() && hasOllama() && isOffline(); }
	};
}
export interface ChatInputAreaProps {
	// Editor ref - passed from parent for external access
	editorRef: Accessor<AgentsMentionsEditorHandle | null>;
	setEditorRef: (handle: AgentsMentionsEditorHandle | null) => void;
	// File input ref - for attachment button
	fileInputRef: Accessor<HTMLInputElement | null>;
	setFileInputRef: (el: HTMLInputElement | null) => void;
	// Core callbacks
	onSend: () => void;
	onForceSend: () => void;
	onStop: () => Promise<void>;
	onCompact: () => void;
	onCreateNewSubChat?: () => void;
	// State from parent
	isStreaming: boolean;
	isCompacting: boolean;
	// File uploads
	images: UploadedImage[];
	files: UploadedFile[];
	onAddAttachments: (files: File[]) => void;
	onRemoveImage: (id: string) => void;
	onRemoveFile: (id: string) => void;
	isUploading: boolean;
	// Text context from selected assistant message text
	textContexts: SelectedTextContext[];
	onRemoveTextContext: (id: string) => void;
	// Diff text context from selected diff sidebar text
	diffTextContexts?: DiffTextContext[];
	onRemoveDiffTextContext?: (id: string) => void;
	// Pasted text files (large pasted text saved as files)
	pastedTexts?: PastedTextFile[];
	onAddPastedText?: (text: string) => Promise<void>;
	onRemovePastedText?: (id: string) => void;
	// Callback to cache file content for dropped text files (content added to prompt on send)
	onCacheFileContent?: (mentionId: string, content: string) => void;
	// Pre-computed token data for context indicator (avoids passing messages array)
	messageTokenData: MessageTokenData;
	// Context
	subChatId: string;
	parentChatId: string;
	teamId?: string;
	repository?: string;
	sandboxId?: string;
	projectPath?: string;
	changedFiles: SubChatFileChange[];
	// Mobile
	isMobile?: boolean;
	// Queue - for sending from queue when input is empty
	queueLength?: number;
	onSendFromQueue?: (itemId: string) => void;
	firstQueueItemId?: string;
	// Callback to notify parent when input has content (for custom text with questions)
	onInputContentChange?: (hasContent: boolean) => void;
	// Callback to send message with question answer (Enter sends immediately, not to queue)
	onSubmitWithQuestionAnswer?: () => void;
}
/**
* Custom comparison for memo to prevent re-renders from unstable array references.
* Compares messages by length and last message id, changedFiles by length and paths.
*/
function arePropsEqual(prevProps: ChatInputAreaProps, nextProps: ChatInputAreaProps): boolean {
	// Compare primitives and stable references first (fast path)
	if (prevProps.isStreaming !== nextProps.isStreaming || prevProps.isCompacting !== nextProps.isCompacting || prevProps.isUploading !== nextProps.isUploading || prevProps.subChatId !== nextProps.subChatId || prevProps.parentChatId !== nextProps.parentChatId || prevProps.teamId !== nextProps.teamId || prevProps.repository !== nextProps.repository || prevProps.sandboxId !== nextProps.sandboxId || prevProps.projectPath !== nextProps.projectPath || prevProps.isMobile !== nextProps.isMobile) {
		return false;
	}
	// Compare refs by identity (they should be stable)
	if (prevProps.editorRef !== nextProps.editorRef || prevProps.fileInputRef !== nextProps.fileInputRef || prevProps.setEditorRef !== nextProps.setEditorRef || prevProps.setFileInputRef !== nextProps.setFileInputRef) {
		return false;
	}
	// Compare callbacks by identity (they should be memoized in parent)
	if (prevProps.onSend !== nextProps.onSend || prevProps.onForceSend !== nextProps.onForceSend || prevProps.onStop !== nextProps.onStop || prevProps.onCompact !== nextProps.onCompact || prevProps.onCreateNewSubChat !== nextProps.onCreateNewSubChat || prevProps.onAddAttachments !== nextProps.onAddAttachments || prevProps.onRemoveImage !== nextProps.onRemoveImage || prevProps.onRemoveFile !== nextProps.onRemoveFile || prevProps.onRemoveTextContext !== nextProps.onRemoveTextContext || prevProps.onAddPastedText !== nextProps.onAddPastedText || prevProps.onRemovePastedText !== nextProps.onRemovePastedText || prevProps.onCacheFileContent !== nextProps.onCacheFileContent || prevProps.onInputContentChange !== nextProps.onInputContentChange || prevProps.onSubmitWithQuestionAnswer !== nextProps.onSubmitWithQuestionAnswer) {
		return false;
	}
	// Compare textContexts array - by length and ids
	if (!prevProps.textContexts || !nextProps.textContexts) {
		return prevProps.textContexts === nextProps.textContexts;
	}
	if (prevProps.textContexts.length !== nextProps.textContexts.length) {
		return false;
	}
	for (let i = 0; i < prevProps.textContexts.length; i++) {
		if (prevProps.textContexts[i]?.id !== nextProps.textContexts[i]?.id) {
			return false;
		}
	}
	// Compare diffTextContexts array - by length and ids
	const prevDiff = prevProps.diffTextContexts || [];
	const nextDiff = nextProps.diffTextContexts || [];
	if (prevDiff.length !== nextDiff.length) {
		return false;
	}
	for (let i = 0; i < prevDiff.length; i++) {
		if (prevDiff[i]?.id !== nextDiff[i]?.id) {
			return false;
		}
	}
	// Compare images array - by length and ids
	if (!prevProps.images || !nextProps.images) {
		return prevProps.images === nextProps.images;
	}
	if (prevProps.images.length !== nextProps.images.length) {
		return false;
	}
	for (let i = 0; i < prevProps.images.length; i++) {
		if (prevProps.images[i]?.id !== nextProps.images[i]?.id) {
			return false;
		}
	}
	// Compare files array - by length and ids
	if (!prevProps.files || !nextProps.files) {
		return prevProps.files === nextProps.files;
	}
	if (prevProps.files.length !== nextProps.files.length) {
		return false;
	}
	for (let i = 0; i < prevProps.files.length; i++) {
		if (prevProps.files[i]?.id !== nextProps.files[i]?.id) {
			return false;
		}
	}
	// Compare pastedTexts array - by length and ids
	const prevPasted = prevProps.pastedTexts || [];
	const nextPasted = nextProps.pastedTexts || [];
	if (prevPasted.length !== nextPasted.length) {
		return false;
	}
	for (let i = 0; i < prevPasted.length; i++) {
		if (prevPasted[i]?.id !== nextPasted[i]?.id) {
			return false;
		}
	}
	// Compare messageTokenData - only re-render when token counts actually change
	// This is much more stable than comparing messages array reference
	if (prevProps.messageTokenData.totalInputTokens !== nextProps.messageTokenData.totalInputTokens || prevProps.messageTokenData.totalOutputTokens !== nextProps.messageTokenData.totalOutputTokens || prevProps.messageTokenData.messageCount !== nextProps.messageTokenData.messageCount) {
		return false;
	}
	// Compare changedFiles - by length and filePaths
	if (!prevProps.changedFiles || !nextProps.changedFiles) {
		return prevProps.changedFiles === nextProps.changedFiles;
	}
	if (prevProps.changedFiles.length !== nextProps.changedFiles.length) {
		return false;
	}
	for (let i = 0; i < prevProps.changedFiles.length; i++) {
		if (prevProps.changedFiles[i]?.filePath !== nextProps.changedFiles[i]?.filePath) {
			return false;
		}
	}
	return true;
}
/**
* ChatInputArea - Isolated input component to prevent re-renders of parent
*
* This component manages its own state for:
* - hasContent (whether input has text)
* - isFocused (editor focus state)
* - isDragOver (drag/drop state)
* - Mention dropdown state (showMentionDropdown, mentionSearchText, etc.)
* - Slash command dropdown state
* - Mode dropdown state
* - Model dropdown state
*
* When user types, only this component re-renders, not the entire ChatViewInner.
*/
export function ChatInputArea({ editorRef, setEditorRef, fileInputRef, setFileInputRef, onSend, onForceSend, onStop, onCompact, onCreateNewSubChat, isStreaming, isCompacting, images, files, onAddAttachments, onRemoveImage, onRemoveFile, isUploading, textContexts, onRemoveTextContext, diffTextContexts, onRemoveDiffTextContext, pastedTexts = [], onAddPastedText, onRemovePastedText, onCacheFileContent, messageTokenData, subChatId, parentChatId, teamId, repository, sandboxId, projectPath, changedFiles, isMobile = false, queueLength = 0, onSendFromQueue, firstQueueItemId, onInputContentChange, onSubmitWithQuestionAnswer }: ChatInputAreaProps) {
	// Local state - changes here don't re-render parent
	const [hasContent, setHasContent] = createSignal(false);
	const [isFocused, setIsFocused] = createSignal(false);
	const [isDragOver, setIsDragOver] = createSignal(false);
	// Mention dropdown state
	const [showMentionDropdown, setShowMentionDropdown] = createSignal(false);
	const [mentionSearchText, setMentionSearchText] = createSignal("");
	const [mentionPosition, setMentionPosition] = createSignal({
		top: 0,
		left: 0
	});
	// Mention dropdown subpage navigation state
	const [showingFilesList, setShowingFilesList] = createSignal(false);
	const [showingSkillsList, setShowingSkillsList] = createSignal(false);
	const [showingAgentsList, setShowingAgentsList] = createSignal(false);
	const [showingToolsList, setShowingToolsList] = createSignal(false);
	// Slash command dropdown state
	const [showSlashDropdown, setShowSlashDropdown] = createSignal(false);
	const [slashSearchText, setSlashSearchText] = createSignal("");
	const [slashPosition, setSlashPosition] = createSignal({
		top: 0,
		left: 0
	});
	// Mode dropdown state
	const [modeDropdownOpen, setModeDropdownOpen] = createSignal(false);
	const [modeTooltip, setModeTooltip] = createSignal<{ visible: boolean; position: { top: number; left: number }; mode: "agent" | "plan" } | null>(null);
	const [tooltipTimeoutRef, setTooltipTimeoutRef] = createSignal<ReturnType<typeof setTimeout> | null>(null);
	const [hasShownTooltipRef, setHasShownTooltipRef] = createSignal(false);
	// Model dropdown state
	const [isModelDropdownOpen, setIsModelDropdownOpen] = createSignal(false);
	const [lastSelectedModelId, setLastSelectedModelId] = lastSelectedModelIdAtom;
	const [selectedOllamaModel, setSelectedOllamaModel] = selectedOllamaModelAtom;
	const availableModels = useAvailableModels();
	const autoOfflineMode = autoOfflineModeAtom[0];
	const showOfflineFeatures = showOfflineModeFeaturesAtom[0];
	const [selectedModel, setSelectedModel] = createSignal<{ id: string; name: string }>(availableModels.models.find((m) => m.id === lastSelectedModelId()) || availableModels.models[1] || availableModels.models[0]);
	const customClaudeConfig = customClaudeConfigAtom[0];
	const normalizedCustomClaudeConfig = normalizeCustomClaudeConfig(customClaudeConfig());
	const hasCustomClaudeConfig = Boolean(normalizedCustomClaudeConfig);
	// Determine current Ollama model (selected or recommended)
	const currentOllamaModel = createMemo(() => selectedOllamaModel() || availableModels.recommendedModel || availableModels.ollamaModels[0]);
	// Debug: log selected Ollama model
	createEffect(() => {
		if (availableModels.isOffline) {
			console.log(`[Ollama UI] selectedOllamaModel atom value: ${selectedOllamaModel || "(null)"}, currentOllamaModel: ${currentOllamaModel}`);
		}
	});
	// Extended thinking (reasoning) toggle
	const [thinkingEnabled, setThinkingEnabled] = extendedThinkingEnabledAtom;
	// Auto-switch model based on network status (only if offline features enabled)
	// Note: When offline, we show Ollama models selector instead of Claude models
	// The selectedOllamaModel atom is used to track which Ollama model is selected
	// Plan mode - per-subChat using atomFamily
	const subChatModeSignal = createMemo(() => subChatModeAtomFamily(subChatId));
	const subChatMode = createMemo(() => subChatModeSignal()[0]());
	const setSubChatMode = (mode: AgentMode) => subChatModeSignal()[1](mode);
	// Helper to update mode (atomFamily + Zustand store sync)
	const updateMode = (newMode: AgentMode) => {
		setSubChatMode(newMode);
		useAgentSubChatStore.getState().updateSubChatMode(subChatId, newMode);
	};
	// Toggle mode helper
	const toggleMode = () => {
		updateMode(getNextMode(subChatMode()));
	};
	// Voice input state
	const { isRecording: isVoiceRecording, audioLevel: voiceAudioLevel, startRecording: startVoiceRecording, stopRecording: stopVoiceRecording, cancelRecording: cancelVoiceRecording } = useVoiceRecording();
	const [isTranscribing, setIsTranscribing] = createSignal(false);
	const [voiceMountedRef, setVoiceMountedRef] = createSignal(true);
	createEffect(() => {
		setVoiceMountedRef(true);
		onCleanup(() => {
			setVoiceMountedRef(false);
		});
	});
	const transcribeMutation = useMutation(() => ({
		mutationFn: (input: { audioBase64: string; format: string; language?: string }) =>
			desktopRpc.voice.transcribe.mutate(input),
	}));
	// Check if voice input is available (authenticated OR has OPENAI_API_KEY)
	const voiceQuery = useQuery(() => ({
		queryKey: ["voice", "isAvailable"] as const,
		queryFn: () => desktopRpc.voice.isAvailable(),
	}));
	const isVoiceAvailable = () => voiceQuery.data?.available ?? false;
	// Get resolved voice input hotkey
	const customHotkeys = customHotkeysAtom[0];
	const voiceInputHotkey = getResolvedHotkey("voice-input", customHotkeys());
	// Refs for draft saving
	const [currentSubChatIdRef, setCurrentSubChatIdRef] = createSignal<string>(subChatId);
	const [currentChatIdRef, setCurrentChatIdRef] = createSignal<string | null>(parentChatId);
	const [currentDraftTextRef, setCurrentDraftTextRef] = createSignal<string>("");
	setCurrentSubChatIdRef(subChatId);
	setCurrentChatIdRef(parentChatId);
	// Keyboard shortcut: Cmd+/ to open model selector
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.key === "/") {
				e.preventDefault();
				e.stopPropagation();
				if (!hasCustomClaudeConfig) {
					setIsModelDropdownOpen(true);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Voice input handlers
	const handleVoiceMouseDown = async () => {
		if (isStreaming || isTranscribing() || isVoiceRecording()) return;
		try {
			await startVoiceRecording();
		} catch (err) {
			console.error("[VoiceInput] Failed to start recording:", err);
		}
	};
	const handleVoiceMouseUp = async () => {
		if (!isVoiceRecording()) return;
		try {
			const blob = await stopVoiceRecording();
			// Don't transcribe very short recordings (likely accidental clicks)
			if (blob.size < 1e3) {
				console.log("[VoiceInput] Recording too short, ignoring");
				return;
			}
			if (!voiceMountedRef()) return;
			setIsTranscribing(true);
			const base64 = await blobToBase64(blob);
			const format = getAudioFormat(blob.type);
			const result = await transcribeMutation.mutateAsync({
				audioBase64: base64,
				format,
			});
			if (!voiceMountedRef()) return;
			const text = (result as { text: string }).text;
			if (text && text.trim()) {
				// Insert transcribed text into editor
				// Clean both current value and transcribed text
				const currentRaw = editorRef()?.getValue() || "";
				const current = currentRaw.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
				const transcribed = text.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
				// Add space separator only if current text exists and doesn't end with whitespace
				const needsSpace = current.length > 0 && !/\s$/.test(current);
				const newValue = current + (needsSpace ? " " : "") + transcribed;
				editorRef()?.setValue(newValue);
				editorRef()?.focus();
			}
		} catch (err) {
			console.error("[VoiceInput] Transcription failed:", err);
		} finally {
			if (voiceMountedRef()) {
				setIsTranscribing(false);
			}
		}
	};
	const handleVoiceMouseLeave = () => {
		if (isVoiceRecording()) {
			// Cancel instead of transcribing when leaving button area
			cancelVoiceRecording();
		}
	};
	// Keyboard shortcut: Voice input hotkey (push-to-talk: hold to record, release to transcribe)
	createEffect(() => {
		if (!voiceInputHotkey) return;
		// Parse hotkey once
		const parts = voiceInputHotkey.split("+").map((p) => p.toLowerCase());
		const modifiers = parts.filter((p) => [
			"cmd",
			"meta",
			"ctrl",
			"opt",
			"alt",
			"shift"
		].includes(p));
		const mainKey = parts.find((p) => ![
			"cmd",
			"meta",
			"ctrl",
			"opt",
			"alt",
			"shift"
		].includes(p));
		const needsCmd = modifiers.includes("cmd") || modifiers.includes("meta");
		const needsShift = modifiers.includes("shift");
		const needsCtrl = modifiers.includes("ctrl");
		const needsAlt = modifiers.includes("alt") || modifiers.includes("opt");
		// For modifier-only hotkeys (like ctrl+opt), we track when all modifiers are pressed
		const isModifierOnlyHotkey = !mainKey;
		const modifiersMatch = (e: KeyboardEvent) => {
			return e.metaKey === needsCmd && e.shiftKey === needsShift && e.ctrlKey === needsCtrl && e.altKey === needsAlt;
		};
		const matchesHotkey = (e: KeyboardEvent) => {
			if (isModifierOnlyHotkey) {
				// For modifier-only: just check if all required modifiers are pressed
				return modifiersMatch(e);
			}
			// For regular hotkey with main key
			const keyMatches = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey || e.code.toLowerCase() === `key${mainKey}` || mainKey === "space" && e.code === "Space";
			return keyMatches && modifiersMatch(e);
		};
		// Check if any modifier key is released
		const isModifierRelease = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			return key === "control" || key === "alt" || key === "meta" || key === "shift";
		};
		// Check if the released key is the main key (not a modifier)
		const isMainKeyRelease = (e: KeyboardEvent) => {
			if (isModifierOnlyHotkey) {
				return isModifierRelease(e);
			}
			const eventKey = e.key.toLowerCase();
			return eventKey === mainKey || e.code.toLowerCase() === mainKey || e.code.toLowerCase() === `key${mainKey}` || mainKey === "space" && e.code === "Space";
		};
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!matchesHotkey(e)) return;
			if (e.repeat) return;
			e.preventDefault();
			e.stopPropagation();
			// Start recording on keydown
			if (!isVoiceRecording() && !isTranscribing() && !isStreaming) {
				handleVoiceMouseDown();
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			// Stop recording when the main key (or any modifier for modifier-only hotkeys) is released
			if (!isMainKeyRelease(e)) return;
			// Only stop if we're currently recording
			if (isVoiceRecording()) {
				e.preventDefault();
				e.stopPropagation();
				handleVoiceMouseUp();
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		window.addEventListener("keyup", handleKeyUp, true);
		onCleanup(() => {
			window.removeEventListener("keydown", handleKeyDown, true);
			window.removeEventListener("keyup", handleKeyUp, true);
		});
	});
	// Save draft on blur (with attachments and text contexts)
	const handleEditorBlur = async () => {
		setIsFocused(false);
		const draft = editorRef()?.getValue() || "";
		const chatId = currentChatIdRef();
		const subChatIdValue = currentSubChatIdRef();
		// Update ref for unmount save
		setCurrentDraftTextRef(draft);
		if (!chatId) return;
		const hasContent = draft.trim() || images.length > 0 || files.length > 0 || textContexts.length > 0 || (diffTextContexts?.length ?? 0) > 0;
		if (hasContent) {
			await saveSubChatDraftWithAttachments(chatId, subChatIdValue, draft, {
				images,
				files,
				textContexts
			});
		} else {
			clearSubChatDraft(chatId, subChatIdValue);
		}
	};
	// Content change handler
	const handleContentChange = (newHasContent: boolean) => {
		setHasContent(newHasContent);
		onInputContentChange?.(newHasContent);
		// Sync the draft text ref for unmount save
		const draft = editorRef()?.getValue() || "";
		setCurrentDraftTextRef(draft);
	};
	// Editor submit handler - handles Enter key with queue logic
	// If input is empty and queue has items, stop stream and send first from queue
	const handleEditorSubmit = async () => {
		const inputValue = editorRef()?.getValue() || "";
		const hasText = inputValue.trim().length > 0;
		const hasAttachments = images.length > 0 || files.length > 0 || textContexts.length > 0 || (diffTextContexts?.length ?? 0) > 0;
		if (!hasText && !hasAttachments && queueLength > 0 && onSendFromQueue && firstQueueItemId) {
			// Input empty, queue has items - stop stream and send from queue
			await onStop();
			onSendFromQueue(firstQueueItemId);
		} else {
			onSend();
		}
	};
	// Mention select handler
	const handleMentionSelect = (mention: FileMentionOption) => {
		// Category navigation - enter subpage instead of inserting mention
		if (mention.type === "category") {
			if (mention.id === "files") {
				setShowingFilesList(true);
				return;
			}
			if (mention.id === "skills") {
				setShowingSkillsList(true);
				return;
			}
			if (mention.id === "agents") {
				setShowingAgentsList(true);
				return;
			}
			if (mention.id === "tools") {
				setShowingToolsList(true);
				return;
			}
		}
		// Otherwise: insert mention as normal
		editorRef()?.insertMention(mention);
		setShowMentionDropdown(false);
		// Reset subpage state
		setShowingFilesList(false);
		setShowingSkillsList(false);
		setShowingAgentsList(false);
		setShowingToolsList(false);
	};
	// Slash command handlers
	const handleSlashTrigger = ({ searchText, rect }: {
		searchText: string;
		rect: DOMRect;
	}) => {
		setSlashSearchText(searchText);
		setSlashPosition({
			top: rect.top,
			left: rect.left
		});
		setShowSlashDropdown(true);
	};
	const handleCloseSlashTrigger = () => {
		setShowSlashDropdown(false);
	};
	const handleSlashSelect = (command: SlashCommandOption) => {
		// Clear the slash command text from editor
		editorRef()?.clearSlashCommand();
		setShowSlashDropdown(false);
		// Handle builtin commands that change app state (no text input needed)
		if (command.category === "builtin") {
			switch (command.name) {
				case "clear":
					// Create a new sub-chat (fresh conversation)
					if (onCreateNewSubChat) {
						onCreateNewSubChat();
					}
					return;
				case "plan":
					if (subChatMode() !== "plan") {
						updateMode("plan");
					}
					return;
				case "agent":
					if (subChatMode() === "plan") {
						updateMode("agent");
					}
					return;
				case "compact":
					// Trigger context compaction
					onCompact();
					return;
			}
		}
		// For all other commands (builtin prompts and custom):
		// insert the command and let user add arguments or press Enter to send
		editorRef()?.setValue(`/${command.name} `);
	};
	// Paste handler for images, plain text, and large text (saved as files)
	const handlePaste = (e: ClipboardEvent) => handlePasteEvent(e, onAddAttachments, onAddPastedText);
	// Drag/drop handlers
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};
	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};
	// Text file extensions that should have content read and attached
	const TEXT_FILE_EXTENSIONS = new Set([
		".ts",
		".tsx",
		".js",
		".jsx",
		".mjs",
		".cjs",
		".py",
		".rb",
		".go",
		".rs",
		".java",
		".kt",
		".swift",
		".c",
		".cpp",
		".h",
		".hpp",
		".cs",
		".php",
		".lua",
		".r",
		".m",
		".mm",
		".scala",
		".clj",
		".ex",
		".exs",
		".hs",
		".elm",
		".erl",
		".fs",
		".fsx",
		".ml",
		".v",
		".vhdl",
		".zig",
		".json",
		".yaml",
		".yml",
		".toml",
		".xml",
		".ini",
		".env",
		".conf",
		".cfg",
		".properties",
		".plist",
		".html",
		".htm",
		".css",
		".scss",
		".sass",
		".less",
		".vue",
		".svelte",
		".astro",
		".md",
		".mdx",
		".rst",
		".txt",
		".text",
		".svg",
		".sh",
		".bash",
		".zsh",
		".fish",
		".ps1",
		".bat",
		".cmd",
		".sql",
		".graphql",
		".gql",
		".prisma",
		".dockerfile",
		".makefile",
		".gitignore",
		".gitattributes",
		".editorconfig",
		".eslintrc",
		".prettierrc"
	]);
	const MAX_FILE_SIZE_FOR_CONTENT = 100 * 1024;
	// Image extensions that should be handled as attachments (base64)
	const IMAGE_EXTENSIONS = new Set([
		".png",
		".jpg",
		".jpeg",
		".gif",
		".webp",
		".bmp"
	]);
	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const droppedFiles = Array.from(e.dataTransfer!.files);
		// Separate images from other files
		const imageFiles: File[] = [];
		const otherFiles: File[] = [];
		for (const file of droppedFiles) {
			const ext = file.name.includes(".") ? "." + file.name.split(".").pop()?.toLowerCase() : "";
			if (IMAGE_EXTENSIONS.has(ext)) {
				imageFiles.push(file);
			} else {
				otherFiles.push(file);
			}
		}
		// Handle images via existing attachment system (base64)
		if (imageFiles.length > 0) {
			onAddAttachments(imageFiles);
		}
		// Process other files - for text files, read content and add as file mention
		for (const file of otherFiles) {
			// Get file path using Electron's webUtils API (more reliable than file.path)
			// @ts-expect-error - Electron's webUtils API
			const filePath: string | undefined = window.webUtils?.getPathForFile?.(file) || (file as File & {
				path?: string;
			}).path;
			let mentionId: string;
			let mentionPath: string;
			if (projectPath && filePath && filePath.startsWith(projectPath)) {
				// File is inside project - use relative path
				const relativePath = filePath.slice(projectPath.length).replace(/^\//, "");
				mentionId = `file:local:${relativePath}`;
				mentionPath = relativePath;
			} else if (filePath) {
				// External file - use absolute path
				mentionId = `file:external:${filePath}`;
				mentionPath = filePath;
			} else {
				// No path available (shouldn't happen in Electron) - use filename
				mentionId = `file:external:${file.name}`;
				mentionPath = file.name;
			}
			const fileName = file.name;
			const ext = fileName.includes(".") ? "." + fileName.split(".").pop()?.toLowerCase() : "";
			// Files without extension are likely directories or special files - skip content reading
			const hasExtension = ext !== "";
			const isTextFile = hasExtension && TEXT_FILE_EXTENSIONS.has(ext);
			const isSmallEnough = file.size <= MAX_FILE_SIZE_FOR_CONTENT;
			// For text files that are small enough, read content and cache it
			// Show file chip, content will be added to prompt on send
			if (isTextFile && isSmallEnough && filePath) {
				// Add file chip for visual representation
				editorRef()?.insertMention({
					id: mentionId,
					label: fileName,
					path: mentionPath,
					repository: "local",
					type: "file"
				});
				// Read and cache content (will be added to prompt on send)
				try {
					const content = await desktopRpc.files.readFile({ filePath });
					onCacheFileContent?.(mentionId, content);
				} catch (err) {
					// If reading fails, chip is still there - agent can try to read via path
					console.error(`[handleDrop] Failed to read file content ${filePath}:`, err);
				}
			} else {
				// For binary files, large files - add as mention only
				// mentionPath contains full absolute path for external files
				editorRef()?.insertMention({
					id: mentionId,
					label: fileName,
					path: mentionPath,
					repository: "local",
					type: "file"
				});
			}
		}
		// Focus after state update - use double rAF to wait for React render
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				editorRef()?.focus();
			});
		});
	};
	return <div class="px-2 pb-2 shadow-sm shadow-background relative z-10">
      <div class="w-full max-w-2xl mx-auto">
        <div class="relative w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div class="relative w-full cursor-text" onClick={() => editorRef()?.focus()}>
            <PromptInput class={cn("border bg-input-background relative z-10 p-2 rounded-xl transition-[border-color,box-shadow] duration-150", isDragOver() && "ring-2 ring-primary/50 border-primary/50", isFocused() && !isDragOver() && "ring-2 ring-primary/50")} maxHeight={200} onSubmit={onSend} contextItems={<Show when={images.length > 0 || files.length > 0 || textContexts.length > 0 || (diffTextContexts?.length ?? 0) > 0 || pastedTexts.length > 0}>
                    <div class="flex flex-wrap gap-[6px]">
                      {(() => {
                        // Build allImages array for gallery navigation
                        const allImages = images.filter((img): img is typeof img & {
                          url: string;
                        } => !!img.url && !img.isLoading).map((img) => ({
                          id: img.id,
                          filename: img.filename,
                          url: img.url
                        }));
                        return <For each={images}>{(img, idx) => <AgentImageItem id={img.id} filename={img.filename} url={img.url || ""} isLoading={img.isLoading} onRemove={() => onRemoveImage(img.id)} allImages={allImages} imageIndex={idx()} />}</For>;
                      })()}
                      <For each={files}>{(f) => <AgentFileItem id={f.id} filename={f.filename} url={f.url || ""} size={f.size} isLoading={f.isLoading} onRemove={() => onRemoveFile(f.id)} />}</For>
                      <For each={textContexts}>{(tc) => <AgentTextContextItem text={tc.text} preview={tc.preview} onRemove={() => onRemoveTextContext(tc.id)} />}</For>
                      <For each={diffTextContexts ?? []}>{(dtc) => <AgentDiffTextContextItem text={dtc.text} preview={dtc.preview} filePath={dtc.filePath} lineNumber={dtc.lineNumber} lineType={dtc.lineType} onRemove={onRemoveDiffTextContext ? () => onRemoveDiffTextContext(dtc.id) : undefined} />}</For>
                      <For each={pastedTexts}>{(pt) => <AgentPastedTextItem filePath={pt.filePath} filename={pt.filename} size={pt.size} preview={pt.preview} onRemove={onRemovePastedText ? () => onRemovePastedText(pt.id) : undefined} />}</For>
                    </div>
                  </Show>}>
              <PromptInputContextItems />
              <div class="relative">
                <AgentsMentionsEditor ref={setEditorRef} onTrigger={({ searchText, rect }) => {
		// Desktop: use projectPath for local file search
		if (projectPath || repository) {
			setMentionSearchText(searchText);
			setMentionPosition({
				top: rect.top,
				left: rect.left
			});
			setShowMentionDropdown(true);
		}
	}} onCloseTrigger={() => {
		setShowMentionDropdown(false);
		// Reset subpage state when closing
		setShowingFilesList(false);
		setShowingSkillsList(false);
		setShowingAgentsList(false);
		setShowingToolsList(false);
	}} onSlashTrigger={handleSlashTrigger} onCloseSlashTrigger={handleCloseSlashTrigger} onContentChange={handleContentChange} onSubmit={onSubmitWithQuestionAnswer || handleEditorSubmit} onForceSubmit={onForceSend} onShiftTab={toggleMode} placeholder={isStreaming ? "Add to the queue" : "Plan, @ for context, / for commands"} class={cn("bg-transparent max-h-[200px] overflow-y-auto p-1", isMobile && "min-h-[56px]")} onPaste={handlePaste} onFocus={() => setIsFocused(true)} onBlur={handleEditorBlur} />
              </div>
              <PromptInputActions class="w-full">
                <div class="flex items-center gap-0.5 flex-1 min-w-0">
                  {	/* Mode toggle (Agent/Plan) */}
                  <DropdownMenu open={modeDropdownOpen()} onOpenChange={(open) => {
 setModeDropdownOpen(open);
		if (!open) {
			if (tooltipTimeoutRef()) {
				clearTimeout(tooltipTimeoutRef()!);
				setTooltipTimeoutRef(null);
			}
			setModeTooltip(null);
			setHasShownTooltipRef(false);
		}
	}}>
                    <DropdownMenuTrigger asChild>
                      <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
                        <Show when={subChatMode() === "plan"} fallback={<AgentIcon class="h-3.5 w-3.5 shrink-0" />}>
                          <PlanIcon class="h-3.5 w-3.5 shrink-0" />
                        </Show>
                        <span class="truncate">{subChatMode() === "plan" ? "Plan" : "Agent"}</span>
                        <ChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={6} class="!min-w-[116px] !w-[116px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                      <DropdownMenuItem onClick={() => {
		// Clear tooltip before closing dropdown (onMouseLeave won't fire)
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
		updateMode("agent");
		setModeDropdownOpen(false);
	}} class="justify-between gap-2" onMouseEnter={(e: MouseEvent) => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const showTooltip = () => {
			setModeTooltip({
				visible: true,
				position: {
					top: rect.top,
					left: rect.right + 8
				},
				mode: "agent"
			});
			setHasShownTooltipRef(true);
			setTooltipTimeoutRef(null);
		};
		if (hasShownTooltipRef()) {
			showTooltip();
		} else {
			setTooltipTimeoutRef(setTimeout(showTooltip, 1e3));
		}
	}} onMouseLeave={() => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
	}}>
                        <div class="flex items-center gap-2">
                          <AgentIcon class="w-4 h-4 text-muted-foreground" />
                          <span>Agent</span>
                        </div>
                        <Show when={subChatMode() !== "plan"}>
                          <CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0" />
                        </Show>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
		// Clear tooltip before closing dropdown (onMouseLeave won't fire)
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
		updateMode("plan");
		setModeDropdownOpen(false);
	}} class="justify-between gap-2" onMouseEnter={(e: MouseEvent) => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const showTooltip = () => {
			setModeTooltip({
				visible: true,
				position: {
					top: rect.top,
					left: rect.right + 8
				},
				mode: "plan"
			});
			setHasShownTooltipRef(true);
			setTooltipTimeoutRef(null);
		};
		if (hasShownTooltipRef()) {
			showTooltip();
		} else {
			setTooltipTimeoutRef(setTimeout(showTooltip, 1e3));
		}
	}} onMouseLeave={() => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
	}}>
                        <div class="flex items-center gap-2">
                          <PlanIcon class="w-4 h-4 text-muted-foreground" />
                          <span>Plan</span>
                        </div>
                        <Show when={subChatMode() === "plan"}>
                          <CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0" />
                        </Show>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    <Show when={modeTooltip()?.visible}>
                      <Portal mount={document.body}>
                        <div class="fixed z-[100000]" style={{
                          top: `${modeTooltip()!.position.top + 14}px`,
                          left: `${modeTooltip()!.position.left}px`,
                          transform: "translateY(-50%)"
                        }}>
                          <div data-tooltip="true" class="relative rounded-[12px] bg-popover px-2.5 py-1.5 text-xs text-popover-foreground dark max-w-[150px]">
                            <span>
                              {modeTooltip()!.mode === "agent" ? "Apply changes directly without a plan" : "Create a plan before making changes"}
                            </span>
                          </div>
                        </div>
                      </Portal>
                    </Show>
                  </DropdownMenu>

                  {	/* Model selector - shows Ollama models when offline, Claude models when online */}
                  <Show when={availableModels.isOffline && availableModels.hasOllama} fallback={<DropdownMenu open={hasCustomClaudeConfig ? false : isModelDropdownOpen()} onOpenChange={(open) => {
		if (!hasCustomClaudeConfig) {
			setIsModelDropdownOpen(open);
		}
	}}>
                      <DropdownMenuTrigger asChild>
                        <button disabled={hasCustomClaudeConfig} class={cn("flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground transition-colors rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", hasCustomClaudeConfig ? "opacity-70 cursor-not-allowed" : "hover:text-foreground hover:bg-muted/50")}>
                          <ClaudeCodeIcon class="h-3.5 w-3.5 shrink-0" />
                          <span class="truncate">
                            <Show when={!hasCustomClaudeConfig} fallback="Custom Model">
                                {selectedModel()?.name}{" "}
                                <span class="text-muted-foreground">4.5</span>
                            </Show>
                          </span>
                          <ChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" class="w-[200px]">
                        <For each={availableModels.models}>{(model) => {
		const isSelected = selectedModel()?.id === model.id;
		return <DropdownMenuItem onClick={() => {
			setSelectedModel(model);
			setLastSelectedModelId(model.id);
		}} class="gap-2 justify-between">
                              <div class="flex items-center gap-1.5">
                                <ClaudeCodeIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span>
                                  {model.name}{" "}
                                  <span class="text-muted-foreground">4.5</span>
                                </span>
                              </div>
                              <Show when={isSelected}>
                                <CheckIcon class="h-3.5 w-3.5 shrink-0" />
                              </Show>
                            </DropdownMenuItem>;
	}}</For>
                        <DropdownMenuSeparator />
                        <div class="flex items-center justify-between px-1.5 py-1.5 mx-1" onClick={(e) => e.stopPropagation()}>
                          <div class="flex items-center gap-1.5">
                            <ThinkingIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span class="text-sm">Thinking</span>
                          </div>
                          <Switch checked={thinkingEnabled()} onCheckedChange={setThinkingEnabled} class="scale-75" />
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>}>
                    <DropdownMenu open={isModelDropdownOpen()} onOpenChange={setIsModelDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 border border-border">
                          <Zap class="h-4 w-4 shrink-0" />
                          <span class="truncate">{currentOllamaModel() || "Select model"}</span>
                          <ChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" class="w-[240px]">
                        <For each={availableModels.ollamaModels}>{(model) => {
 const isSelected = model === currentOllamaModel();
		const isRecommended = model === availableModels.recommendedModel;
		return <DropdownMenuItem onClick={() => {
			console.log(`[Ollama UI] Setting selected model: ${model}`);
			setSelectedOllamaModel(model);
		}} class="gap-2 justify-between">
                              <div class="flex items-center gap-1.5">
                                <Zap class="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>
                                  {model}
                                  <Show when={isRecommended}>
                                    <span class="text-muted-foreground ml-1">(recommended)</span>
                                  </Show>
                                </span>
                              </div>
                              <Show when={isSelected}>
                                <CheckIcon class="h-3.5 w-3.5 shrink-0" />
                              </Show>
                            </DropdownMenuItem>;
	}}</For>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Show>
                </div>

                <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                  {	/* Hidden file input - accepts images and text/code files */}
                  <input type="file" ref={setFileInputRef} hidden accept="image/jpeg,image/png,.txt,.md,.markdown,.json,.yaml,.yml,.xml,.csv,.tsv,.log,.ini,.cfg,.conf,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.kt,.swift,.c,.cpp,.h,.hpp,.cs,.php,.html,.css,.scss,.sass,.less,.sql,.sh,.bash,.zsh,.ps1,.bat,.env,.gitignore,.dockerignore,.editorconfig,.prettierrc,.eslintrc,.babelrc,.nvmrc,.pdf" multiple onChange={(e) => {
 const inputFiles = Array.from(e.target.files || []);
		onAddAttachments(inputFiles);
		e.target.value = "";
	}} />

                  {	/* Voice wave indicator - shown during recording */}
                  <Show when={isVoiceRecording()} fallback={<>
                      { /* Context window indicator - click to compact */}
                      <AgentContextIndicator tokenData={messageTokenData} onCompact={onCompact} isCompacting={isCompacting} disabled={isStreaming} />

                      { /* Attachment button */}
                      <Button variant="ghost" size="icon" class="h-7 w-7 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" onClick={() => fileInputRef()?.click()} disabled={images.length >= 5 && files.length >= 10}>
                        <AttachIcon class="h-4 w-4" />
                      </Button>
                    </>}>
                    <VoiceWaveIndicator isRecording={isVoiceRecording()} audioLevel={voiceAudioLevel()} />
                  </Show>

                  { /* Send/Stop/Voice button */}
                  <div class="ml-1">
                    <AgentSendButton isStreaming={isStreaming} isSubmitting={false} disabled={!hasContent() && images.length === 0 && files.length === 0 && textContexts.length === 0 && (diffTextContexts?.length ?? 0) === 0 && queueLength === 0 || isUploading} hasContent={hasContent() || images.length > 0 || files.length > 0 || textContexts.length > 0 || (diffTextContexts?.length ?? 0) > 0} onClick={() => {
 // If input is empty and queue has items, send first queue item
		if (!hasContent() && images.length === 0 && files.length === 0 && queueLength > 0 && onSendFromQueue && firstQueueItemId) {
			onSendFromQueue(firstQueueItemId);
		} else {
			onSend();
		}
	}} onStop={onStop} mode={subChatMode()} showVoiceInput={isVoiceAvailable()} isRecording={isVoiceRecording()} isTranscribing={isTranscribing()} onVoiceMouseDown={handleVoiceMouseDown} onVoiceMouseUp={handleVoiceMouseUp} onVoiceMouseLeave={handleVoiceMouseLeave} />
                  </div>
                </div>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>
      </div>

      {	/* File mention dropdown */}
      { /* Desktop: use projectPath for local file search */}
      <AgentsFileMention isOpen={showMentionDropdown() && (!!projectPath || !!repository || !!sandboxId)} onClose={() => {
 setShowMentionDropdown(false);
		// Reset subpage state when closing
		setShowingFilesList(false);
		setShowingSkillsList(false);
		setShowingAgentsList(false);
		setShowingToolsList(false);
	}} onSelect={handleMentionSelect} searchText={mentionSearchText()} position={mentionPosition()} teamId={teamId} repository={repository} sandboxId={sandboxId} projectPath={projectPath} changedFiles={changedFiles} showingFilesList={showingFilesList()} showingSkillsList={showingSkillsList()} showingAgentsList={showingAgentsList()} showingToolsList={showingToolsList()} />

      {	/* Slash command dropdown */}
      <AgentsSlashCommand isOpen={showSlashDropdown()} onClose={handleCloseSlashTrigger} onSelect={handleSlashSelect} searchText={slashSearchText()} position={slashPosition()} projectPath={projectPath} mode={subChatMode()} />
    </div>;
}
