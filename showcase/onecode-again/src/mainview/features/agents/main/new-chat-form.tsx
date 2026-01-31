import type { JSX } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createSignal, createEffect, createMemo, onCleanup, Show } from "solid-js";
import { AlignJustify, Plus, Zap } from "lucide-solid";
import { Portal } from "solid-js/web";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { AgentIcon, AttachIcon, BranchIcon, CheckIcon, ClaudeCodeIcon, CursorIcon, IconChevronDown, PlanIcon, SearchIcon } from "../../../components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { cn } from "../../../lib/utils";
import { agentsDebugModeAtom, justCreatedIdsAtom, lastSelectedAgentIdAtom, lastSelectedBranchesAtom, lastSelectedModelIdAtom, lastSelectedRepoAtom, lastSelectedWorkModeAtom, selectedAgentChatIdAtom, selectedChatIsRemoteAtom, selectedDraftIdAtom, selectedProjectAtom, getNextMode, type AgentMode } from "../atoms";
import { defaultAgentModeAtom } from "../../../lib/atoms";
import { ProjectSelector } from "../components/project-selector";
import { WorkModeSelector } from "../components/work-mode-selector";
// import { selectedTeamIdAtom } from "@/lib/atoms/team"
import { atom } from "../../../lib/state/store";
const selectedTeamIdAtom = createSignal<string | null>(null);
import { agentsSettingsDialogOpenAtom, agentsSettingsDialogActiveTabAtom, customClaudeConfigAtom, normalizeCustomClaudeConfig, showOfflineModeFeaturesAtom, selectedOllamaModelAtom, customHotkeysAtom, chatSourceModeAtom } from "../../../lib/atoms";
// Desktop uses desktop RPC + Solid Query
import { toast } from "solid-sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { AgentsSlashCommand, COMMAND_PROMPTS, BUILTIN_SLASH_COMMANDS, type SlashCommandOption } from "../commands";
import { useAgentsFileUpload } from "../hooks/use-agents-file-upload";
import { usePastedTextFiles } from "../hooks/use-pasted-text-files";
import { useFocusInputOnEnter } from "../hooks/use-focus-input-on-enter";
import { useToggleFocusOnCmdEsc } from "../hooks/use-toggle-focus-on-cmd-esc";
import { useVoiceRecording, blobToBase64, getAudioFormat } from "../../../lib/hooks/use-voice-recording";
import { getResolvedHotkey } from "../../../lib/hotkeys";
import { AgentsFileMention, AgentsMentionsEditor, MENTION_PREFIXES, type AgentsMentionsEditorHandle, type FileMentionOption } from "../mentions";
import { AgentImageItem } from "../ui/agent-image-item";
import { AgentPastedTextItem } from "../ui/agent-pasted-text-item";
import { AgentsHeaderControls } from "../ui/agents-header-controls";
import { VoiceWaveIndicator } from "../ui/voice-wave-indicator";
// import { CreateBranchDialog } from "@/app/(alpha)/agents/{components}/create-branch-dialog"
import { PromptInput, PromptInputActions, PromptInputContextItems } from "../../../components/ui/prompt-input";
import { agentsSidebarOpenAtom, agentsUnseenChangesAtom } from "../atoms";
import { AgentSendButton } from "../components/agent-send-button";
import { CreateBranchDialog } from "../components/create-branch-dialog";
import { formatTimeAgo } from "../utils/format-time-ago";
import { handlePasteEvent } from "../utils/paste-text";
import { loadGlobalDrafts, saveGlobalDrafts, generateDraftId, deleteNewChatDraft, markDraftVisible, type DraftProject } from "../lib/drafts";
import { CLAUDE_MODELS } from "../lib/models";

// import type { PlanType } from "@/lib/config/subscription-plans"
type PlanType = string;
// Codex icon (OpenAI style)
const CodexIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>;
// Hook to get available models (including offline models if Ollama is available and debug enabled)
function useAvailableModels() {
	const showOfflineFeatures = showOfflineModeFeaturesAtom[0];
	const ollamaQuery = useQuery(() => ({
		queryKey: ["ollama", "getStatus"] as const,
		queryFn: () => desktopRpc.ollama.getStatus(),
		refetchInterval: () => (showOfflineFeatures() ? 3e4 : false),
		enabled: !!showOfflineFeatures(),
	}));
	const ollamaStatus = () => ollamaQuery.data;
	const baseModels = CLAUDE_MODELS;
	const isOffline = () => (ollamaStatus() ? !ollamaStatus()!.internet.online : false);
	const hasOllama = () => ollamaStatus()?.ollama.available && (ollamaStatus()?.ollama.models?.length ?? 0) > 0;
	const ollamaModels = () => ollamaStatus()?.ollama.models || [];
	const recommendedModel = () => ollamaStatus()?.ollama.recommendedModel;
	// Only show offline models if:
	// 1. Debug flag is enabled (showOfflineFeatures)
	// 2. Ollama is available with models
	// 3. User is actually offline
	if (showOfflineFeatures() && hasOllama() && isOffline()) {
		return {
			models: baseModels,
			ollamaModels: ollamaModels(),
			recommendedModel: recommendedModel(),
			isOffline: isOffline(),
			hasOllama: true,
		};
	}
	return {
		models: baseModels,
		ollamaModels: [] as string[],
		recommendedModel: undefined as string | undefined,
		isOffline: isOffline(),
		hasOllama: false,
	};
}
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
interface NewChatFormProps {
	isMobileFullscreen?: boolean;
	onBackToChats?: () => void;
}
export function NewChatForm({ isMobileFullscreen = false, onBackToChats }: NewChatFormProps = {}) {
	// UNCONTROLLED: just track if editor has content for send button
	const [hasContent, setHasContent] = createSignal(false);
	const [selectedTeamId] = selectedTeamIdAtom;
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const setSelectedChatIsRemote = selectedChatIsRemoteAtom[1];
	const setChatSourceMode = chatSourceModeAtom[1];
	const [selectedDraftId, setSelectedDraftId] = selectedDraftIdAtom;
	const [sidebarOpen, setSidebarOpen] = agentsSidebarOpenAtom;
	// Current draft ID being edited (generated when user starts typing in empty form)
	const [currentDraftIdRef, setCurrentDraftIdRef] = createSignal<string | null>(null);
	const unseenChanges = agentsUnseenChangesAtom[0];
	// Check if any chat has unseen changes
	const hasAnyUnseenChanges = unseenChanges().size > 0;
	const [lastSelectedRepo, setLastSelectedRepo] = lastSelectedRepoAtom;
	const [selectedProject, setSelectedProject] = selectedProjectAtom;
	// Fetch projects to validate selectedProject exists
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(),
	}));
	const projectsList = () => projectsQuery.data;
	const isLoadingProjects = () => projectsQuery.isLoading;
	// Validate selected project exists in DB
	// While loading, trust the stored value to prevent flicker
	const validatedProject = createMemo(() => {
		const proj = selectedProject();
		if (!proj) return null;
		// While loading, trust localStorage value to prevent flicker
		if (isLoadingProjects()) return proj;
		// After loading, validate against DB
		const list = projectsList();
		if (!list) return null;
		const exists = list.some((p) => p.id === proj.id);
		return exists ? proj : null;
	});
	// Clear invalid project from storage
	createEffect(() => {
		if (selectedProject() && projectsList() && !validatedProject()) {
			setSelectedProject(null);
		}
	});
	const [lastSelectedAgentId, setLastSelectedAgentId] = lastSelectedAgentIdAtom;
	const [lastSelectedModelId, setLastSelectedModelId] = lastSelectedModelIdAtom;
	// Mode for new chat - uses user's default preference directly
	// Note: defaultAgentMode is initialized synchronously via atomWithStorage with getOnInit: true
	const defaultAgentMode = defaultAgentModeAtom[0];
	const [agentMode, setAgentMode] = createSignal(defaultAgentMode());
	// Toggle mode helper
	const toggleMode = () => {
		setAgentMode(getNextMode(agentMode()));
	};
	const [workMode, setWorkMode] = lastSelectedWorkModeAtom;
	const debugMode = agentsDebugModeAtom[0];
	const customClaudeConfig = customClaudeConfigAtom[0];
	const normalizedCustomClaudeConfig = normalizeCustomClaudeConfig(customClaudeConfig());
	const hasCustomClaudeConfig = Boolean(normalizedCustomClaudeConfig);
	const setSettingsDialogOpen = agentsSettingsDialogOpenAtom[1];
	const setSettingsActiveTab = agentsSettingsDialogActiveTabAtom[1];
	const justCreatedIds = justCreatedIdsAtom[0];
	const [repoSearchQuery, setRepoSearchQuery] = createSignal("");
	const [createBranchDialogOpen, setCreateBranchDialogOpen] = createSignal(false);
	// Worktree config banner state
	const [worktreeBannerDismissed, setWorktreeBannerDismissed] = createSignal((() => {
		try {
			return localStorage.getItem("worktree-banner-dismissed") === "true";
		} catch {
			return false;
		}
	})());
	// Check if project has worktree config
	const worktreeConfigQuery = useQuery(() => ({
		queryKey: ["worktreeConfig", "get", validatedProject()?.id] as const,
		queryFn: () => desktopRpc.worktreeConfig.get({ projectId: validatedProject()!.id }),
		enabled: !!validatedProject()?.id && workMode() === "worktree" && !worktreeBannerDismissed(),
	}));
	const worktreeConfigData = () => worktreeConfigQuery.data;
	const showWorktreeBanner = () => workMode() === "worktree" && !!validatedProject() && !worktreeBannerDismissed() && !!worktreeConfigData() && !worktreeConfigData()?.config;
	const handleDismissWorktreeBanner = () => {
		setWorktreeBannerDismissed(true);
		try {
			localStorage.setItem("worktree-banner-dismissed", "true");
		} catch {}
	};
	const handleConfigureWorktree = () => {
		// Open the project-specific worktree settings tab
		const project = validatedProject();
		if (project?.id) {
			setSettingsActiveTab(`project-${project.id}` as any);
			setSettingsDialogOpen(true);
		}
	};
	// Parse owner/repo from GitHub URL
	const parseGitHubUrl = (url: string) => {
		const match = url.match(/(?:github\.com\/)?([^\/]+)\/([^\/\s#?]+)/);
		if (!match) return null;
		return `${match[1]}/${match[2].replace(/\.git$/, "")}`;
	};
	const [selectedAgent, setSelectedAgent] = createSignal(agents.find((a) => a.id === lastSelectedAgentId()) || agents[0]);
	// Get available models (with offline support)
	const availableModels = useAvailableModels();
	const [selectedOllamaModel, setSelectedOllamaModel] = selectedOllamaModelAtom;
	const [selectedModel, setSelectedModel] = createSignal(availableModels.models.find((m) => m.id === lastSelectedModelId()) || availableModels.models[1]);
	// Determine current Ollama model (selected or recommended)
	const currentOllamaModel = () => selectedOllamaModel() || availableModels.recommendedModel || availableModels.ollamaModels[0];
	const [repoPopoverOpen, setRepoPopoverOpen] = createSignal(false);
	const [branchPopoverOpen, setBranchPopoverOpen] = createSignal(false);
	const [lastSelectedBranches, setLastSelectedBranches] = lastSelectedBranchesAtom;
	const [branchSearch, setBranchSearch] = createSignal("");
	const [selectedBranchType, setSelectedBranchType] = createSignal<"local" | "remote" | undefined>(undefined);
	// Get/set selected branch for current project (persisted per project)
	const selectedBranch = createMemo(() => validatedProject()?.id ? lastSelectedBranches()[validatedProject()!.id]?.name || "" : "");
	const setSelectedBranch = (branch: string, type?: "local" | "remote") => {
		const project = validatedProject();
		if (project?.id && type) {
			setLastSelectedBranches((prev) => ({
				...prev,
				[project.id]: {
					name: branch,
					type
				}
			}));
			setSelectedBranchType(type);
		}
	};
	const [branchListRef, setBranchListRef] = createSignal<HTMLDivElement | null>(null);
	const [editorRef, setEditorRef] = createSignal<AgentsMentionsEditorHandle | null>(null);
	const [fileInputRef, setFileInputRef] = createSignal<HTMLInputElement | null>(null);
	// Restore selectedBranchType from persisted storage when project changes
	createEffect(() => {
		const project = validatedProject();
		if (project?.id) {
			const stored = lastSelectedBranches()[project.id];
			if (stored?.type) {
				setSelectedBranchType(stored.type);
			} else {
				setSelectedBranchType(undefined);
			}
		} else {
			setSelectedBranchType(undefined);
		}
	});
	// Image upload hook
	const { images, handleAddAttachments, removeImage, clearImages, isUploading } = useAgentsFileUpload();
	// Pasted text files - use a stable temp ID for new chat
	const [tempPastedIdRef, setTempPastedIdRef] = createSignal(`new-chat-${Date.now()}`);
	const { pastedTexts, addPastedText, removePastedText, clearPastedTexts } = usePastedTextFiles(tempPastedIdRef());
	// File contents cache - stores content for file mentions (keyed by mentionId)
	// This content gets added to the prompt when sending, without showing a separate card
	const [fileContentsRef, setFileContentsRef] = createSignal<Map<string, string>>(new Map());
	// Mention dropdown state
	const [showMentionDropdown, setShowMentionDropdown] = createSignal(false);
	const [mentionSearchText, setMentionSearchText] = createSignal("");
	const [mentionPosition, setMentionPosition] = createSignal({
		top: 0,
		left: 0
	});
	// Mention subpage navigation state
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
	// Mode tooltip state (floating tooltip like canvas)
	const [modeTooltip, setModeTooltip] = createSignal<{ visible: boolean; position: { top: number; left: number }; mode: string } | null>(null);
	const [tooltipTimeoutRef, setTooltipTimeoutRef] = createSignal<ReturnType<typeof setTimeout> | null>(null);
	const [hasShownTooltipRef, setHasShownTooltipRef] = createSignal(false);
	const [modeDropdownOpen, setModeDropdownOpen] = createSignal(false);
	const [isModelDropdownOpen, setIsModelDropdownOpen] = createSignal(false);
	// Voice input state
	const customHotkeys = customHotkeysAtom[0]();
	const { isRecording: isVoiceRecording, audioLevel: voiceAudioLevel, startRecording, stopRecording, cancelRecording } = useVoiceRecording();
	const [isTranscribing, setIsTranscribing] = createSignal(false);
	const transcribeMutation = useMutation(() => ({
		mutationFn: (input: { audioBase64: string; format: string; language?: string }) =>
			desktopRpc.voice.transcribe.mutate(input),
	}));
	// Check if voice input is available (authenticated OR has OPENAI_API_KEY)
	const voiceAvailabilityQuery = useQuery(() => ({
		queryKey: ["voice", "isAvailable"] as const,
		queryFn: () => desktopRpc.voice.isAvailable(),
	}));
	const voiceAvailability = () => voiceAvailabilityQuery.data;
	const isVoiceAvailable = () => voiceAvailability()?.available ?? false;
	// Voice input handlers
	const handleVoiceMouseDown = async () => {
		if (isUploading() || isTranscribing() || isVoiceRecording()) return;
		try {
			await startRecording();
		} catch (err) {
			console.error("[NewChatForm] Failed to start recording:", err);
		}
	};
	const handleVoiceMouseUp = async () => {
		if (!isVoiceRecording()) return;
		try {
			const blob = await stopRecording();
			if (blob.size < 1e3) {
				console.log("[NewChatForm] Recording too short, ignoring");
				return;
			}
			setIsTranscribing(true);
			const base64 = await blobToBase64(blob);
			const format = getAudioFormat(blob.type);
			const result = await transcribeMutation.mutateAsync({
				audioBase64: base64,
				format,
			});
			if (result?.text && result.text.trim()) {
				const currentValue = editorRef()?.getValue() || "";
				// Clean transcribed text - remove any remaining whitespace issues
				const transcribed = result.text.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
				// Add space separator only if current text exists and doesn't end with whitespace
				const needsSpace = currentValue.length > 0 && !/\s$/.test(currentValue);
				const newValue = currentValue + (needsSpace ? " " : "") + transcribed;
				editorRef()?.setValue(newValue);
				setHasContent(true);
			}
		} catch (err) {
			console.error("[NewChatForm] Transcription failed:", err);
		} finally {
			setIsTranscribing(false);
		}
	};
	const handleVoiceMouseLeave = () => {
		if (isVoiceRecording()) {
			cancelRecording();
		}
	};
	// Voice hotkey listener (push-to-talk: hold to record, release to transcribe)
	createEffect(() => {
		const voiceHotkey = getResolvedHotkey("voice-input", customHotkeys);
		if (!voiceHotkey) return;
		// Parse hotkey once
		const parts = voiceHotkey.split("+").map((p) => p.toLowerCase());
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
			if (!isVoiceRecording && !isTranscribing) {
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
	// Shift+Tab handler for mode switching (now handled inside input component via onShiftTab prop)
	// Keyboard shortcut: Enter to focus input when not already focused
	useFocusInputOnEnter(editorRef() ?? undefined);
	// Keyboard shortcut: Cmd+Esc to toggle focus/blur
	useToggleFocusOnCmdEsc(editorRef() ?? undefined);
	// Fetch repos from team
	// Desktop: no remote repos, we use local projects
	type RepoType = { id: string; name: string; full_name: string; sandbox_status: "not_setup" | "in_progress" | "ready" | "error"; pushed_at?: string };
	const reposData = { repositories: [] as RepoType[] };
	const isLoadingRepos = false;
	// Memoize repos arrays to prevent useEffect from running on every keystroke
	// Apply debug mode simulations
	const repos = createMemo(() => {
		const dm = debugMode();
		if (dm?.enabled && dm?.simulateNoRepos) {
			return [] as RepoType[];
		}
		return reposData?.repositories || [];
	});
	const readyRepos = createMemo(() => {
		const dm = debugMode();
		if (dm?.enabled && dm?.simulateNoReadyRepos) {
			return [] as RepoType[];
		}
		return repos().filter((r) => r.sandbox_status === "ready");
	});
	const notReadyRepos = createMemo(() => repos().filter((r) => r.sandbox_status !== "ready"));
	// Use state to avoid hydration mismatch
	const [resolvedRepo, setResolvedRepo] = createSignal<RepoType | null>(null);
	// Derive selected repo from saved or first available (client-side only)
	// Now includes all repos, not just ready ones
	createEffect(() => {
		const lastRepo = lastSelectedRepo();
		if (lastRepo) {
			// For public imports, use lastSelectedRepo directly (it won't be in repos list)
			if (lastRepo.isPublicImport) {
				setResolvedRepo({
					id: lastRepo.id,
					name: lastRepo.name,
					full_name: lastRepo.full_name,
					sandbox_status: lastRepo.sandbox_status || "not_setup"
				} as RepoType);
				return;
			}
			// Look in all repos by id or full_name
			// Only compare IDs when lastSelectedRepo.id is non-empty (old localStorage data might have empty id)
			const stillExists = repos().find((r) => lastRepo.id && r.id === lastRepo.id || r.full_name === lastRepo.full_name);
			if (stillExists) {
				setResolvedRepo(stillExists);
				return;
			}
		}
		if (repos().length === 0) {
			setResolvedRepo(null);
			return;
		}
		// Auto-save first repo if none saved (prefer ready repos, then any)
		if (!lastRepo && repos().length > 0) {
			const firstRepo = readyRepos()[0] || repos()[0];
			setLastSelectedRepo({
				id: firstRepo.id,
				name: firstRepo.name,
				full_name: firstRepo.full_name,
				sandbox_status: firstRepo.sandbox_status
			});
		}
		setResolvedRepo(readyRepos()[0] || repos()[0] || null);
	});
	// Desktop: fetch branches from local git repository
	const branchesQuery = useQuery(() => ({
		queryKey: ["changes", "getBranches", validatedProject()?.path] as const,
		queryFn: () => desktopRpc.changes.getBranches({ worktreePath: validatedProject()!.path || "" }),
		enabled: !!validatedProject()?.path,
		staleTime: 3e4,
	}));
	const fetchRemoteMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string }) => desktopRpc.changes.fetchRemote.mutate(input),
	}));
	// Manual refresh branches
	const handleRefreshBranches = () => {
		const project = validatedProject();
		if (project?.path) {
			fetchRemoteMutation.mutate(
				{ worktreePath: project.path },
				{
					onSuccess: () => {
						branchesQuery.refetch();
					},
					onError: (error: Error) => {
						console.error("Failed to fetch remote branches:", error);
					},
				},
			);
		}
	};
	// Transform branch data to match web app format
	const branches = createMemo(() => {
		const data = branchesQuery.data;
		if (!data) return [];
		const { local, remote, defaultBranch } = data;
		const result: Array<{
			name: string;
			type: "local" | "remote";
			protected: boolean;
			isDefault: boolean;
			committedAt: string | null;
			authorName: null;
		}> = [];
		// Add local branches
		for (const { branch, lastCommitDate } of local) {
			result.push({
				name: branch,
				type: "local",
				protected: false,
				isDefault: branch === defaultBranch,
				committedAt: lastCommitDate ? new Date(lastCommitDate).toISOString() : null,
				authorName: null
			});
		}
		// Add remote branches
		for (const name of remote) {
			result.push({
				name,
				type: "remote",
				protected: false,
				isDefault: name === defaultBranch,
				committedAt: null,
				authorName: null
			});
		}
		// Sort: default first, then local, then remote, alphabetically
		return result.sort((a, b) => {
			if (a.isDefault && !b.isDefault) return -1;
			if (!a.isDefault && b.isDefault) return 1;
			if (a.type !== b.type) return a.type === "local" ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	});
	// Filter branches based on search
	const filteredBranches = createMemo(() => {
		if (!branchSearch().trim()) return branches();
		const search = branchSearch().toLowerCase();
		return branches().filter((b) => b.name.toLowerCase().includes(search));
	});
	// Virtualizer for branch list (Solid) - only active when popover is open
	const branchVirtualizer = createVirtualizer({
		get count() {
			return filteredBranches().length;
		},
		getScrollElement: () => branchListRef(),
		estimateSize: () => 28,
		overscan: 5,
		get enabled() {
			return branchPopoverOpen();
		}
	});
	// Force virtualizer to re-measure when popover opens
	createEffect(() => {
		if (branchPopoverOpen()) {
			const timer = setTimeout(() => branchVirtualizer.measure(), 0);
			onCleanup(() => clearTimeout(timer));
		}
	});
	// Format relative time for branches (reuse shared utility)
	const formatRelativeTime = (dateString: string | null): string => {
		if (!dateString) return "";
		return formatTimeAgo(dateString);
	};
	// Set default branch when project/branches change (only if no saved branch for this project)
	createEffect(() => {
		const project = validatedProject();
		if (branchesQuery.data?.defaultBranch && project?.id && !selectedBranch()) {
			// Find the default branch in the branches list to get its type
			// Prefer local over remote if both exist
			const branchList = branches();
			const defaultBranchObj = branchList.find((b) => b.name === branchesQuery.data!.defaultBranch && b.isDefault && b.type === "local") || branchList.find((b) => b.name === branchesQuery.data!.defaultBranch && b.isDefault && b.type === "remote");
			// Fallback to "local" if branch not found in list (shouldn't happen but prevents empty selector)
			const branchType = defaultBranchObj?.type || "local";
			setSelectedBranch(branchesQuery.data!.defaultBranch, branchType);
		}
	});
	// Auto-focus input when NewChatForm is shown (when clicking "New Chat")
	// Skip on mobile to prevent keyboard from opening automatically
	createEffect(() => {
		if (isMobileFullscreen) return;
		// Small delay to ensure DOM is ready and animations complete
		const timeoutId = setTimeout(() => {
			editorRef()?.focus();
		}, 150);
		onCleanup(() => clearTimeout(timeoutId));
	});
	// Track last saved text to avoid unnecessary updates
	const [lastSavedTextRef, setLastSavedTextRef] = createSignal<string>("");
	// Track previous draft ID to detect when switching away from a draft
	const [prevSelectedDraftIdRef, setPrevSelectedDraftIdRef] = createSignal<string | null>(null);
	// Restore draft when a specific draft is selected from sidebar
	// Or clear editor when "New Workspace" is clicked (selectedDraftId becomes null)
	createEffect(() => {
		const hadDraftBefore = prevSelectedDraftIdRef() !== null;
		setPrevSelectedDraftIdRef(selectedDraftId());
		if (!selectedDraftId()) {
			// No draft selected - only clear if we had a draft before (user clicked "New Workspace")
			// Don't clear if user is currently typing (currentDraftIdRef has a value)
			if (hadDraftBefore) {
				setCurrentDraftIdRef(null);
				setLastSavedTextRef("");
				if (editorRef()) {
					editorRef()!.clear();
					setHasContent(false);
				}
				// Fetch remote branches in background when starting new workspace
				if (validatedProject()?.path) {
					handleRefreshBranches();
				}
			}
			return;
		}
		const globalDrafts = loadGlobalDrafts();
		const draftId = selectedDraftId();
		if (!draftId) return;
		const draft = globalDrafts[draftId];
		if (draft?.text) {
			setCurrentDraftIdRef(draftId);
			setLastSavedTextRef(draft.text);
			// Try to set value immediately if editor is ready
			if (editorRef()) {
				editorRef()!.setValue(draft.text);
				setHasContent(true);
			} else {
				// Fallback: wait for editor to initialize (rare case)
				const timeoutId = setTimeout(() => {
					editorRef()?.setValue(draft.text);
					setHasContent(true);
				}, 50);
				onCleanup(() => clearTimeout(timeoutId));
			}
		}
	});
	// Mark draft as visible when component unmounts (user navigates away)
	// This ensures the draft only appears in the sidebar after leaving the form
	createEffect(() => {
		onCleanup(() => {
			// On unmount, mark current draft as visible so it appears in sidebar
			const draftId = currentDraftIdRef();
			if (draftId) {
				markDraftVisible(draftId);
			}
		});
	});
	// Filter all repos by search (combined list) and sort by preview status
	const filteredRepos = createMemo(() => repos().filter((repo) => repo.name.toLowerCase().includes(repoSearchQuery().toLowerCase()) || repo.full_name.toLowerCase().includes(repoSearchQuery().toLowerCase())).sort((a, b) => {
		// 1. Repos with preview (sandbox_status === "ready") come first
		const aHasPreview = a.sandbox_status === "ready";
		const bHasPreview = b.sandbox_status === "ready";
		if (aHasPreview && !bHasPreview) return -1;
		if (!aHasPreview && bHasPreview) return 1;
		// 2. Sort by last commit date (pushed_at) - most recent first
		const aDate = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
		const bDate = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
		return bDate - aDate;
	}));
	// Create chat mutation (desktop RPC)
	const queryClient = useQueryClient();
	const createChatMutation = useMutation(() => ({
		mutationFn: (input: Parameters<typeof desktopRpc.chats.create.mutate>[0]) =>
			desktopRpc.chats.create.mutate(input),
		onSuccess: (data: Awaited<ReturnType<typeof desktopRpc.chats.create.mutate>>) => {
			// Clear editor, images, pasted texts, and file contents cache only on success
			editorRef()?.clear();
			clearImages();
			clearPastedTexts();
			fileContentsRef().clear();
			clearCurrentDraft();
			queryClient.invalidateQueries({ queryKey: ["chats", "list"] });
			setSelectedChatId(data.id);
			// New chats are always local
			setSelectedChatIsRemote(false);
			setChatSourceMode("local");
			// Track this chat and its first subchat as just created for typewriter effect
			const ids = [data.id];
			if (data.subChats?.[0]?.id) {
				ids.push(data.subChats[0].id);
			}
			const justCreated = justCreatedIds();
			ids.forEach((id) => justCreated.add(id));
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	}));
	// Open folder mutation for selecting a project
	const openFolder = useMutation(() => ({
		mutationFn: () => desktopRpc.projects.openFolder.mutate({}),
		onSuccess: (project: Awaited<ReturnType<typeof desktopRpc.projects.openFolder.mutate>>) => {
			if (project) {
				// Optimistically update the projects list cache to prevent "Select repo" flash
				queryClient.setQueryData(["projects", "list"], (oldData: typeof project[] | undefined) => {
					if (!oldData) return [project];
					const exists = oldData.some((p) => p.id === project.id);
					if (exists) {
						return oldData.map((p) => (p.id === project.id ? { ...p, updatedAt: project.updatedAt } : p));
					}
					return [project, ...oldData];
				});
				setSelectedProject({
					id: project.id,
					name: project.name,
					path: project.path,
					gitRemoteUrl: project.gitRemoteUrl,
					gitProvider: project.gitProvider as "github" | "gitlab" | "bitbucket" | null,
					gitOwner: project.gitOwner,
					gitRepo: project.gitRepo,
				});
			}
		},
	}));
	const handleOpenFolder = async () => {
		await openFolder.mutateAsync();
	};
	const getAgentIcon = (agentId: string, cls?: string) => {
		switch (agentId) {
			case "claude-code": return <ClaudeCodeIcon class={cls} />;
			case "cursor": return <CursorIcon class={cls} />;
			case "codex": return <CodexIcon class={cls} />;
			default: return null;
		}
	};
	const handleSend = async () => {
		// Get value from uncontrolled editor
		let message = editorRef()?.getValue() || "";
		// Allow send if there's text, images, or pasted text files
		const hasText = message.trim().length > 0;
		const hasImages = images().filter((img) => !img.isLoading && img.url).length > 0;
		const hasPastedTexts = pastedTexts().length > 0;
		if (!hasText && !hasImages && !hasPastedTexts || !selectedProject) {
			return;
		}
		// Check if message is a slash command with arguments (e.g. "/hello world")
		// Note: 's' flag makes '.' match newlines, so multi-line arguments are captured
		const slashMatch = message.match(/^\/(\S+)\s*(.*)$/s);
		if (slashMatch) {
			const [, commandName, args] = slashMatch;
			// Check if it's a builtin command - if so, don't process as custom command
			const builtinNames = new Set(BUILTIN_SLASH_COMMANDS.map((cmd) => cmd.name));
			if (!builtinNames.has(commandName)) {
				// This is a custom command - load content and replace $ARGUMENTS
				try {
					const commands = await desktopRpc.commands.list({ projectPath: validatedProject()?.path });
					const cmd = commands.find((c: { name: string }) => c.name.toLowerCase() === commandName.toLowerCase());
					if (cmd) {
						const { content } = await desktopRpc.commands.getContent({ path: cmd.path });
						// Replace $ARGUMENTS with the provided args
						message = content.replace(/\$ARGUMENTS/g, args.trim());
					}
				} catch (error) {
					console.error("Failed to process custom command:", error);
				}
			}
		}
		// Build message parts array (images first, then text, then hidden file contents)
type MessagePart = {
			type: "text";
			text: string;
		} | {
			type: "data-image";
			data: {
				url: string;
				mediaType?: string;
				filename?: string;
				base64Data?: string;
			};
		} | {
			type: "file-content";
			filePath: string;
			content: string;
		};
		const parts: MessagePart[] = images().filter((img) => !img.isLoading && img.url).map((img) => ({
			type: "data-image" as const,
			data: {
				url: img.url!,
				mediaType: img.mediaType,
				filename: img.filename,
				base64Data: img.base64Data
			}
		}));
		// Add pasted text as pasted mentions (format: pasted:size:preview|filepath)
		// Using | as separator since filepath can contain colons
		let finalMessage = message.trim();
		if (pastedTexts().length > 0) {
			const pastedMentions = pastedTexts().map((pt) => {
				// Sanitize preview to remove special characters that break mention parsing
				const sanitizedPreview = pt.preview.replace(/[:\[\]|]/g, "");
				return `@[${MENTION_PREFIXES.PASTED}${pt.size}:${sanitizedPreview}|${pt.filePath}]`;
			}).join(" ");
			finalMessage = pastedMentions + (finalMessage ? " " + finalMessage : "");
		}
		if (finalMessage) {
			parts.push({
				type: "text" as const,
				text: finalMessage
			});
		}
		// Add cached file contents as hidden parts (sent to agent but not displayed in UI)
		// These are from dropped text files - content is embedded so agent sees it immediately
		if (fileContentsRef().size > 0) {
			for (const [mentionId, content] of fileContentsRef().entries()) {
				// Extract file path from mentionId (file:local:path or file:external:path)
				const filePath = mentionId.replace(/^file:(local|external):/, "");
				parts.push({
					type: "file-content" as const,
					filePath,
					content
				});
			}
		}
		// Create chat with selected project, branch, and initial message
		createChatMutation.mutate({
			projectId: selectedProject()!.id,
			name: message.trim().slice(0, 50),
			initialMessageParts: parts.length > 0 ? parts : undefined,
			baseBranch: workMode() === "worktree" ? selectedBranch() || undefined : undefined,
			branchType: workMode() === "worktree" ? selectedBranchType() : undefined,
			useWorktree: workMode() === "worktree",
			mode: agentMode()
		});
		// Editor, images, and pasted texts are cleared in onSuccess callback
	};
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
	// Save draft to localStorage when content changes
	const handleContentChange = (hasContent: boolean) => {
		setHasContent(hasContent);
		const text = editorRef()?.getValue() || "";
		// Skip if text hasn't changed
		if (text === lastSavedTextRef()) {
			return;
		}
		setLastSavedTextRef(text);
		const globalDrafts = loadGlobalDrafts();
		if (text.trim() && validatedProject()) {
			// If no current draft ID, create a new one
			if (!currentDraftIdRef()) {
				setCurrentDraftIdRef(generateDraftId());
			}
			const key = currentDraftIdRef()!;
			const project = validatedProject();
			if (project) {
				globalDrafts[key] = {
					text,
					updatedAt: Date.now(),
					project: {
						id: project.id,
						name: project.name,
						path: project.path,
						gitOwner: project.gitOwner,
						gitRepo: project.gitRepo,
						gitProvider: project.gitProvider
					}
				};
			}
			saveGlobalDrafts(globalDrafts);
		} else if (currentDraftIdRef()) {
			// Text is empty - delete the current draft
			deleteNewChatDraft(currentDraftIdRef()!);
			setCurrentDraftIdRef(null);
		}
	};
	// Clear current draft when chat is created
	const clearCurrentDraft = () => {
		const draftId = currentDraftIdRef();
		if (!draftId) return;
		deleteNewChatDraft(draftId);
		setCurrentDraftIdRef(null);
		setSelectedDraftId(null);
	};
	// Memoized callbacks to prevent re-renders
	const handleMentionTrigger = ({ searchText, rect }: {
		searchText: string;
		rect: DOMRect;
	}) => {
		if (validatedProject()) {
			setMentionSearchText(searchText);
			setMentionPosition({
				top: rect.top,
				left: rect.left
			});
			// Reset subpage state when opening dropdown
			setShowingFilesList(false);
			setShowingSkillsList(false);
			setShowingAgentsList(false);
			setShowingToolsList(false);
			setShowMentionDropdown(true);
		}
	};
	const handleCloseTrigger = () => {
		setShowMentionDropdown(false);
		// Reset subpage state when closing
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
					editorRef()?.clear();
					return;
				case "plan":
					if (agentMode() !== "plan") {
						setAgentMode("plan");
					}
					return;
				case "agent":
					if (agentMode() === "plan") {
						setAgentMode("agent");
					}
					return;
			}
		}
		// For all other commands (builtin prompts and custom):
		// insert the command and let user add arguments or press Enter to send
		editorRef()?.setValue(`/${command.name} `);
	};
	// Paste handler for images, plain text, and large text (saved as files)
	const handlePaste = (e: ClipboardEvent) => handlePasteEvent(e, handleAddAttachments, addPastedText);
	// Drag and drop handlers
	const [isDragOver, setIsDragOver] = createSignal(false);
	// Focus state for ring
	const [isFocused, setIsFocused] = createSignal(false);
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
		const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
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
			handleAddAttachments(imageFiles);
		}
		// Process other files - for text files, read content and add as file mention
		for (const file of otherFiles) {
			// Get file path using Electron's webUtils API (more reliable than file.path)
			const filePath: string | undefined = (window as Window & { webUtils?: { getPathForFile?: (file: File) => string } }).webUtils?.getPathForFile?.(file) || (file as File & {
				path?: string;
			}).path;
			let mentionId: string;
			let mentionPath: string;
			// Check if file is inside the project
			const project = validatedProject();
			if (project?.path && filePath && filePath.startsWith(project.path)) {
				// Project file: use relative path with file:local: prefix
				const relativePath = filePath.slice(project.path.length).replace(/^\//, "");
				mentionId = `file:local:${relativePath}`;
				mentionPath = relativePath;
			} else if (filePath) {
				// External file: use absolute path with file:external: prefix
				mentionId = `file:external:${filePath}`;
				mentionPath = filePath;
			} else {
				// Fallback: use filename only
				mentionId = `file:external:${file.name}`;
				mentionPath = file.name;
			}
			const fileName = file.name;
			const ext = fileName.includes(".") ? "." + fileName.split(".").pop()?.toLowerCase() : "";
			// Files without extension are likely directories or special files - skip content reading
			const hasExtension = ext !== "";
			const isTextFile = hasExtension && TEXT_FILE_EXTENSIONS.has(ext);
			const isSmallEnough = file.size <= MAX_FILE_SIZE_FOR_CONTENT;
			// For text files that are small enough, read content and store it
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
					fileContentsRef().set(mentionId, content);
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
	// Context items for images and pasted text files
	const contextItems = createMemo(() => images().length > 0 || pastedTexts().length > 0 ? <div class="flex flex-wrap gap-[6px]">
        {(() => {
		// Build allImages array for gallery navigation
		const allImages = images().filter((img) => img.url && !img.isLoading).map((img) => ({
			id: img.id,
			filename: img.filename,
			url: img.url
		}));
		return images().map((img, idx) => <AgentImageItem id={img.id} filename={img.filename} url={img.url} isLoading={img.isLoading} onRemove={() => removeImage(img.id)} allImages={allImages} imageIndex={idx} />);
	})()}
        {pastedTexts().map((pt) => <AgentPastedTextItem filePath={pt.filePath} filename={pt.filename} size={pt.size} preview={pt.preview} onRemove={() => removePastedText(pt.id)} />)}
      </div> : null);
	// Handle container click to focus editor
	const handleContainerClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget || !(e.target as HTMLElement).closest("button, [contenteditable]")) {
			editorRef()?.focus();
		}
	};
	return <div class="flex h-full flex-col">
      {	/* Header - Simple burger on mobile, AgentsHeaderControls on desktop */}
      <div class="flex-shrink-0 flex items-center justify-between bg-background p-1.5">
        <div class="flex-1 min-w-0 flex items-center gap-2">
          {isMobileFullscreen ? <Button variant="ghost" size="icon" onClick={onBackToChats} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="All projects">
              <AlignJustify class="h-4 w-4" />
            </Button> : <AgentsHeaderControls isSidebarOpen={sidebarOpen()} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} hasUnseenChanges={hasAnyUnseenChanges} />}
        </div>
      </div>

      <div class="flex flex-1 items-center justify-center overflow-y-auto relative">
        <div class="w-full max-w-2xl space-y-4 md:space-y-6 relative z-10 px-4">
          { /* Title - only show when project is selected */}
          {validatedProject() && <div class="text-center">
              <h1 class="text-2xl md:text-4xl font-medium tracking-tight">
                What do you want to get done?
              </h1>
            </div>}

          { /* Input Area or Select Repo State */}
          {!validatedProject() ? <div class="flex justify-center">
              <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed">
                {openFolder.isPending ? "Opening..." : "Select repo"}
              </button>
            </div> : <div class="relative w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <div class="relative w-full cursor-text" onClick={handleContainerClick}>
                <PromptInput class={cn("border bg-input-background relative z-10 p-2 rounded-xl transition-[border-color,box-shadow] duration-150", isDragOver() && "ring-2 ring-primary/50 border-primary/50", isFocused() && !isDragOver() && "ring-2 ring-primary/50")} maxHeight={240} onSubmit={handleSend} contextItems={contextItems()}>
                  <PromptInputContextItems />
                  <div class="relative">
                    <AgentsMentionsEditor ref={setEditorRef} onTrigger={handleMentionTrigger} onCloseTrigger={handleCloseTrigger} onSlashTrigger={handleSlashTrigger} onCloseSlashTrigger={handleCloseSlashTrigger} onContentChange={handleContentChange} onSubmit={handleSend} onShiftTab={toggleMode} placeholder="Plan, @ for context, / for commands" class={cn("bg-transparent max-h-[240px] overflow-y-auto p-1", isMobileFullscreen ? "min-h-[56px]" : "min-h-[44px]")} onPaste={handlePaste} disabled={createChatMutation.isPending} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
                  </div>
                  <PromptInputActions class="w-full">
                    <div class="flex items-center gap-0.5 flex-1 min-w-0">
                      { /* Mode toggle (Agent/Plan) */}
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
                        <DropdownMenuTrigger class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
                          {agentMode() === "plan" ? <PlanIcon class="h-3.5 w-3.5" /> : <AgentIcon class="h-3.5 w-3.5" />}
                          <span>{agentMode() === "plan" ? "Plan" : "Agent"}</span>
                          <IconChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={6} class="!min-w-[116px] !w-[116px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                          <DropdownMenuItem onClick={() => {
		// Clear tooltip before closing dropdown (onMouseLeave won't fire)
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
		setAgentMode("agent");
		setModeDropdownOpen(false);
	}} class="justify-between gap-2" onMouseEnter={(e: MouseEvent & { currentTarget: HTMLElement }) => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		const rect = e.currentTarget.getBoundingClientRect();
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
                            {agentMode() !== "plan" && <CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
		// Clear tooltip before closing dropdown (onMouseLeave won't fire)
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		setModeTooltip(null);
		setAgentMode("plan");
		setModeDropdownOpen(false);
	}} class="justify-between gap-2" onMouseEnter={(e: MouseEvent & { currentTarget: HTMLElement }) => {
		if (tooltipTimeoutRef()) {
			clearTimeout(tooltipTimeoutRef()!);
			setTooltipTimeoutRef(null);
		}
		const rect = e.currentTarget.getBoundingClientRect();
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
                            {agentMode() === "plan" && <CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0" />}
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
                      {availableModels.isOffline && availableModels.hasOllama ? <DropdownMenu open={isModelDropdownOpen()} onOpenChange={setIsModelDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 border border-border">
                              <Zap class="h-4 w-4" />
                              <span>{currentOllamaModel() || "Select model"}</span>
                              <IconChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" class="w-[240px]">
                            {availableModels.ollamaModels.map((model) => {
 const isSelected = model === currentOllamaModel();
		const isRecommended = model === availableModels.recommendedModel;
		return <DropdownMenuItem onClick={() => setSelectedOllamaModel(model)} class="gap-2 justify-between">
                                  <div class="flex items-center gap-1.5">
                                    <Zap class="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>
                                      {model}
                                      {isRecommended && <span class="text-muted-foreground ml-1">(recommended)</span>}
                                    </span>
                                  </div>
                                  {isSelected && <CheckIcon class="h-3.5 w-3.5 shrink-0" />}
                                </DropdownMenuItem>;
	})}
                          </DropdownMenuContent>
                        </DropdownMenu> : <DropdownMenu open={hasCustomClaudeConfig ? false : isModelDropdownOpen()} onOpenChange={(open) => {
		if (!hasCustomClaudeConfig) {
			setIsModelDropdownOpen(open);
		}
	}}>
                          <DropdownMenuTrigger asChild>
                            <button disabled={hasCustomClaudeConfig} class={cn("flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground transition-[background-color,color] duration-150 ease-out rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", hasCustomClaudeConfig ? "opacity-70 cursor-not-allowed" : "hover:text-foreground hover:bg-muted/50")}>
                              <ClaudeCodeIcon class="h-3.5 w-3.5" />
                              <span>
                                {hasCustomClaudeConfig ? "Custom Model" : <>
                                    {selectedModel()?.name}{" "}
                                    <span class="text-muted-foreground">4.5</span>
                                  </>}
                              </span>
                              <IconChevronDown class="h-3 w-3 shrink-0 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" class="w-[200px]">
                            {availableModels.models.map((model) => {
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
                                  {isSelected && <CheckIcon class="h-3.5 w-3.5 shrink-0" />}
                                </DropdownMenuItem>;
	})}
                          </DropdownMenuContent>
                        </DropdownMenu>}
                    </div>

                    <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                      {	/* Hidden file input */}
                      <input type="file" ref={setFileInputRef} hidden accept="image/jpeg,image/png" multiple onChange={(e) => {
 const files = Array.from(e.target.files || []);
		handleAddAttachments(files);
		e.target.value = "";
	}} />
                      {	/* Voice wave indicator or Attachment button */}
                      {isVoiceRecording() ? <VoiceWaveIndicator isRecording={isVoiceRecording()} audioLevel={voiceAudioLevel()} /> : <Button variant="ghost" size="icon" class="h-7 w-7 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" onClick={() => fileInputRef()?.click()} disabled={images().length >= 5}>
                          <AttachIcon class="h-4 w-4" />
                        </Button>}
                      <div class="ml-1">
                        <AgentSendButton isStreaming={false} isSubmitting={createChatMutation.isPending || isUploading()} disabled={Boolean(!hasContent() || !selectedProject() || isUploading())} onClick={handleSend} mode={agentMode()} hasContent={hasContent()} showVoiceInput={isVoiceAvailable()} isRecording={isVoiceRecording()} isTranscribing={isTranscribing()} onVoiceMouseDown={handleVoiceMouseDown} onVoiceMouseUp={handleVoiceMouseUp} onVoiceMouseLeave={handleVoiceMouseLeave} />
                      </div>
                    </div>
                  </PromptInputActions>
                </PromptInput>

                { /* Project, Work Mode, and Branch selectors - directly under input */}
                <div class="mt-1.5 md:mt-2 ml-[5px] flex items-center gap-2">
                  <ProjectSelector />

                  { /* Work mode selector - between project and branch */}
                  {validatedProject() && <WorkModeSelector value={workMode()} onChange={setWorkMode} disabled={createChatMutation.isPending} />}

                  { /* Branch selector - only visible when worktree mode is selected */}
                  {validatedProject() && workMode() === "worktree" && <Popover open={branchPopoverOpen()} onOpenChange={(open) => {
 if (!open) {
			setBranchSearch("");
		}
		setBranchPopoverOpen(open);
	}}>
                      <PopoverTrigger asChild>
                        <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" disabled={branchesQuery.isLoading}>
                          <BranchIcon class="w-4 h-4" />
                          <span class="truncate max-w-[100px]">
                            {selectedBranch() || branchesQuery.data?.defaultBranch || "main"}
                          </span>
                          <IconChevronDown class="w-3 h-3 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent class="w-80 p-0" align="start">
                        {	/* Search input with Create button */}
                        <div class="flex items-center gap-1.5 h-7 px-1.5 mx-1 my-1 rounded-md bg-muted/50">
                          <SearchIcon class="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input type="text" placeholder="Search branches..." value={branchSearch()} onInput={(e) => setBranchSearch(e.currentTarget.value)} class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autofocus />
                          <Button size="sm" variant="ghost" class="h-6 px-1.5 flex items-center gap-1 text-xs shrink-0" onClick={(e) => {
 e.preventDefault();
		e.stopPropagation();
		setCreateBranchDialogOpen(true);
		setBranchPopoverOpen(false);
	}}>
                            <Plus class="h-3 w-3" />
                            Create
                          </Button>
                        </div>

                        {	/* Virtualized branch list */}
                        {filteredBranches().length === 0 ? <div class="py-6 text-center text-sm text-muted-foreground">
                            No branches found.
                          </div> : <div ref={setBranchListRef} class="overflow-auto py-1 scrollbar-hide" style={{ height: `${Math.min(filteredBranches().length * 32 + 8, 300)}px` }}>
                            <div style={{
 height: `${branchVirtualizer.getTotalSize()}px`,
		width: "100%",
		position: "relative"
	}}>
                              {branchVirtualizer.getVirtualItems().map((virtualItem) => {
		const branch = filteredBranches()[virtualItem.index];
		const isSelected = selectedBranch() === branch.name && selectedBranchType() === branch.type || !selectedBranch() && branch.isDefault && branch.type === "local";
		return <button onClick={() => {
			setSelectedBranch(branch.name, branch.type);
			setBranchPopoverOpen(false);
			setBranchSearch("");
		}} class={cn("flex items-center gap-1.5 w-[calc(100%-8px)] mx-1 px-1.5 text-sm text-left absolute left-0 top-0 rounded-md cursor-default select-none outline-none transition-colors", isSelected ? "dark:bg-neutral-800 text-foreground" : "dark:hover:bg-neutral-800 hover:text-foreground")} style={{
			height: `${virtualItem.size}px`,
			transform: `translateY(${virtualItem.start}px)`
		}}>
                                      <BranchIcon class="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span class="truncate flex-1">
                                        {branch.name}
                                      </span>
                                      <span class={cn("text-[10px] px-1.5 py-0.5 rounded shrink-0", branch.type === "local" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500")}>
                                        {branch.type}
                                      </span>
                                      {branch.committedAt && <span class="text-xs text-muted-foreground/70 shrink-0">
                                          {formatRelativeTime(branch.committedAt)}
                                        </span>}
                                      {branch.isDefault && <span class="text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded shrink-0">
                                          default
                                        </span>}
                                      {isSelected && <CheckIcon class="h-4 w-4 shrink-0 ml-auto" />}
                                    </button>;
	})}
                            </div>
                          </div>}
                      </PopoverContent>
                    </Popover>}

                  {	/* Create Branch Dialog */}
                  {validatedProject() && <CreateBranchDialog open={createBranchDialogOpen()} onOpenChange={setCreateBranchDialogOpen} projectPath={validatedProject()!.path} branches={branches()} defaultBranch={branchesQuery.data?.defaultBranch || "main"} onBranchCreated={(branchName) => {
 setSelectedBranch(branchName, "local");
	}} />}
                </div>

                {	/* Worktree config banner - absolute positioned to avoid layout shift */}
                {showWorktreeBanner() && <div class="absolute left-0 right-0 top-full mt-2 ml-[5px] mr-[5px] p-3 pb-4 bg-muted/50 rounded-lg border border-border space-y-3">
                    <p class="text-sm text-muted-foreground">
                      Configure a worktree setup script to install dependencies or copy environment variables.
                    </p>
                    <div class="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={handleConfigureWorktree}>
                        Settings
                      </Button>
                      <Button size="sm" onClick={() => {
 const prompt = COMMAND_PROMPTS["worktree-setup"];
		const project = validatedProject();
		if (prompt && project) {
			createChatMutation.mutate({
				projectId: project.id,
				name: "Worktree Setup",
				initialMessageParts: [{
					type: "text",
					text: prompt
				}],
				useWorktree: false,
				mode: "agent"
			});
		}
	}}>
                        Fill with AI
                      </Button>
                    </div>
                  </div>}

                {	/* File mention dropdown */}
                { /* Desktop: use projectPath for local file search */}
                <AgentsFileMention isOpen={showMentionDropdown() && !!validatedProject()} onClose={() => {
 setShowMentionDropdown(false);
		// Reset subpage state when dropdown closes
		setShowingFilesList(false);
		setShowingSkillsList(false);
		setShowingAgentsList(false);
		setShowingToolsList(false);
	}} onSelect={handleMentionSelect} searchText={mentionSearchText()} position={mentionPosition()} projectPath={validatedProject()?.path} showingFilesList={showingFilesList()} showingSkillsList={showingSkillsList()} showingAgentsList={showingAgentsList()} showingToolsList={showingToolsList()} />

                {	/* Slash command dropdown */}
                <AgentsSlashCommand isOpen={showSlashDropdown()} onClose={handleCloseSlashTrigger} onSelect={handleSlashSelect} searchText={slashSearchText()} position={slashPosition()} projectPath={validatedProject()?.path} mode={agentMode()} disabledCommands={["clear"]} />
              </div>
            </div>}
        </div>
      </div>
    </div>;
 }
