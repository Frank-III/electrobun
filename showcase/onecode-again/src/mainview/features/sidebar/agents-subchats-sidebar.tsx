import { createEffect, createMemo, createSignal, For, Show, Switch, Match, mergeProps, onCleanup, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { loadingSubChatsAtom, agentsSubChatUnseenChangesAtom, selectedAgentChatIdAtom, previousAgentChatIdAtom, subChatFilesAtom, justCreatedIdsAtom, pendingUserQuestionsAtom, undoStackAtom, subChatModeAtomFamily, type UndoItem } from "../agents/atoms";
import { selectedTeamIdAtom, selectedSubChatIdsAtom, isSubChatMultiSelectModeAtom, toggleSubChatSelectionAtom, selectAllSubChatsAtom, clearSubChatSelectionAtom, selectedSubChatsCountAtom, isDesktopAtom, isFullscreenAtom, chatSourceModeAtom, defaultAgentModeAtom } from "../../lib/atoms";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../lib/desktop-rpc";
import { appStore } from "../../lib/app-store";
import { useAgentSubChatStore, type SubChatMeta } from "../agents/stores/sub-chat-store";
import { PlusIcon, ArchiveIcon, IconDoubleChevronLeft, IconSpinner, LoadingDot, PlanIcon, AgentIcon, IconOpenSidebar, ClockIcon, QuestionIcon } from "../../components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Kbd } from "../../components/ui/kbd";
import { isDesktopApp, getShortcutKey } from "../../lib/utils/platform";
import { useResolvedHotkeyDisplay } from "../../lib/hotkeys";
import { TrafficLightSpacer } from "../agents/components/traffic-light-spacer";
import { PopoverTrigger } from "../../components/ui/popover";
import { AlignJustify } from "lucide-solid";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../../components/ui/context-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { toast } from "solid-sonner";
import { AgentsRenameSubChatDialog } from "../agents/components/agents-rename-subchat-dialog";
import { SearchCombobox } from "../../components/ui/search-combobox";
import { SubChatContextMenu } from "../agents/ui/sub-chat-context-menu";
import { formatTimeAgo } from "../agents/utils/format-time-ago";
import { pluralize } from "../agents/utils/pluralize";
import { useHotkeys } from "../../lib/hooks/use-hotkeys";
import { useSubChatDraftsCache, getSubChatDraftKey } from "../agents/lib/drafts";
import { Checkbox } from "../../components/ui/checkbox";
import { TypewriterText } from "../../components/ui/typewriter-text";
// Isolated Search History Popover for sidebar - prevents parent re-renders when popover opens/closes
interface SidebarSearchHistoryPopoverProps {
	sortedSubChats: SubChatMeta[];
	loadingSubChats: Map<string, string>;
	subChatUnseenChanges: () => Set<string>;
	pendingQuestionsMap: Map<string, {
		subChatId: string;
	}>;
	allSubChatsLength: number;
	onSelect: (subChat: SubChatMeta) => void;
}
function SidebarSearchHistoryPopover(props: SidebarSearchHistoryPopoverProps) {
	const [local] = splitProps(props, [
		"sortedSubChats",
		"loadingSubChats",
		"subChatUnseenChanges",
		"pendingQuestionsMap",
		"allSubChatsLength",
		"onSelect",
	]);
	const [isHistoryOpen, setIsHistoryOpen] = createSignal(false);
	const renderItem = (subChat: SubChatMeta) => {
		const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at);
		const isLoading = local.loadingSubChats.has(subChat.id);
		const mode = subChat.mode || "agent";
		const hasPendingQuestion = local.pendingQuestionsMap.has(subChat.id);
		return <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
          <Switch fallback={<AgentIcon class="w-4 h-4 text-muted-foreground" />}>
              <Match when={hasPendingQuestion}><QuestionIcon class="w-4 h-4 text-blue-500" /></Match>
              <Match when={isLoading}><IconSpinner class="w-4 h-4 text-muted-foreground" /></Match>
              <Match when={mode === "plan"}><PlanIcon class="w-4 h-4 text-muted-foreground" /></Match>
            </Switch>
          <Show when={local.subChatUnseenChanges().has(subChat.id) && !isLoading && !hasPendingQuestion}><div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-popover flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-[#307BD0]" />
            </div></Show>
        </div>
        <span class="text-sm truncate flex-1">
          {subChat.name || "New Chat"}
        </span>
        <span class="text-sm text-muted-foreground whitespace-nowrap">
          {timeAgo}
        </span>
      </div>;
	};
	return <SearchCombobox isOpen={isHistoryOpen()} onOpenChange={setIsHistoryOpen} items={local.sortedSubChats} onSelect={local.onSelect} placeholder="Search chats..." emptyMessage="No results" getItemValue={(subChat) => `${subChat.name || "New Chat"} ${subChat.id}`} renderItem={renderItem} side="bottom" align="end" sideOffset={4} collisionPadding={16} trigger={<Tooltip delayDuration={500}>
			<TooltipTrigger asChild>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="icon" class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" disabled={local.allSubChatsLength === 0}>
						<ClockIcon class="h-4 w-4" />
					</Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Chat history</TooltipContent>
        </Tooltip>} />;
}
interface AgentsSubChatsSidebarProps {
	onClose?: () => void;
	isMobile?: boolean;
	onBackToChats?: () => void;
	isSidebarOpen?: boolean;
	isLoading?: boolean;
	agentName?: string;
}
export function AgentsSubChatsSidebar(props: AgentsSubChatsSidebarProps) {
	const merged = mergeProps({
		isMobile: false,
		isSidebarOpen: false,
		isLoading: false
	}, props);
	const [local] = splitProps(merged, ["onClose", "isMobile", "onBackToChats", "isSidebarOpen", "isLoading", "agentName"]);
	// SolidJS fine-grained reactivity handles this - no useShallow needed
	const subChatStore = useAgentSubChatStore();
	const activeSubChatId = subChatStore.activeSubChatId;
	const openSubChatIds = subChatStore.openSubChatIds;
	const pinnedSubChatIds = subChatStore.pinnedSubChatIds;
	const allSubChats = subChatStore.allSubChats;
	const parentChatId = subChatStore.chatId;
	const togglePinSubChat = subChatStore.togglePinSubChat;
	const [loadingSubChats] = loadingSubChatsAtom;
	const subChatFiles = subChatFilesAtom[0];
	const selectedTeamId = selectedTeamIdAtom[0];
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const previousChatId = previousAgentChatIdAtom[0];
	// Fetch agent chats for navigation after archive
	const agentChatsQuery = useQuery(() => ({
		queryKey: ["chats", "list"] as const,
		queryFn: () => desktopRpc.chats.list.query(),
		enabled: !!selectedTeamId(),
	}));
	const agentChats = () => agentChatsQuery.data ?? [];
	const queryClient = useQueryClient();
	// SubChat name tooltip - using let refs instead of state to avoid re-renders on hover
	// Declared here so they can be used in archive mutation's onSuccess
	let subChatNameRefs = new Map<string, HTMLSpanElement>();
	let subChatTooltipTimerRef: ReturnType<typeof setTimeout> | undefined = undefined;
	let tooltipRef: HTMLDivElement | undefined = undefined;
	// Archive parent chat mutation
	const archiveChatMutation = useMutation(() => ({
		mutationFn: (input: { id: string; deleteWorktree?: boolean }) => desktopRpc.chats.archive.mutate(input),
		onSuccess: (_, variables) => {
			// Hide tooltip if visible (element may be removed from DOM before mouseLeave fires)
			if (subChatTooltipTimerRef) {
				clearTimeout(subChatTooltipTimerRef);
				subChatTooltipTimerRef = undefined;
			}
			if (tooltipRef) {
				tooltipRef.style.display = "none";
			}
			void queryClient.invalidateQueries({ queryKey: ["chats", "list"] });
			void queryClient.invalidateQueries({ queryKey: ["chats", "listArchived"] });
		// Navigate to previous chat or new workspace
		if (selectedChatId() === variables.id) {
			const chats = agentChats?.();
			const isPreviousAvailable = previousChatId() && chats?.some((c) => c.id === previousChatId());
			if (isPreviousAvailable) {
				setSelectedChatId(previousChatId());
			} else {
				setSelectedChatId(null);
			}
		}
		},
	}));
	const subChatUnseenChanges = agentsSubChatUnseenChangesAtom[0];
	// Resolved hotkey for tooltip
	const newAgentHotkey = useResolvedHotkeyDisplay("new-agent");
	const justCreatedIds = justCreatedIdsAtom[0];
	const pendingQuestionsMap = pendingUserQuestionsAtom[0];
	const defaultAgentMode = defaultAgentModeAtom[0];
	// Pending plan approvals from DB - only for open sub-chats
	const pendingPlanApprovalsQuery = useQuery(() => ({
		queryKey: ["chats", "getPendingPlanApprovals", openSubChatIds] as const,
		queryFn: () => desktopRpc.chats.getPendingPlanApprovals({ openSubChatIds }),
		refetchInterval: 5e3,
		enabled: openSubChatIds.length > 0,
		placeholderData: (prev) => prev,
	}));
	const pendingPlanApprovals = createMemo(() => {
		const set = new Set<string>();
		const data = pendingPlanApprovalsQuery.data;
		if (data) {
			for (const { subChatId } of data) {
				set.add(subChatId);
			}
		}
		return set;
	});
	// Unified undo stack for Cmd+Z support
	const setUndoStack = undoStackAtom[1];
	const [searchQuery, setSearchQuery] = createSignal("");
	const [focusedChatIndex, setFocusedChatIndex] = createSignal(-1);
	let searchInputRef: HTMLInputElement | undefined = undefined;
	let scrollContainerRef: HTMLDivElement | undefined = undefined;
	const [renameDialogOpen, setRenameDialogOpen] = createSignal(false);
	const [renamingSubChat, setRenamingSubChat] = createSignal<SubChatMeta | null>(null);
	const [renameLoading, setRenameLoading] = createSignal(false);
	const [showTopGradient, setShowTopGradient] = createSignal(false);
	const [showBottomGradient, setShowBottomGradient] = createSignal(false);
	// Using ref instead of state to avoid re-renders on hover
	let hoveredChatIndexRef = -1;
	const [archiveAgentDialogOpen, setArchiveAgentDialogOpen] = createSignal(false);
	const [subChatToArchive, setSubChatToArchive] = createSignal<SubChatMeta | null>(null);
	// Multi-select state
	const [selectedSubChatIds, setSelectedSubChatIds] = selectedSubChatIdsAtom;
	const isMultiSelectMode = isSubChatMultiSelectModeAtom[0];
	const selectedSubChatsCount = selectedSubChatsCountAtom[0];
	const toggleSubChatSelection = toggleSubChatSelectionAtom[1];
	const selectAllSubChats = selectAllSubChatsAtom[1];
	const clearSubChatSelection = clearSubChatSelectionAtom[1];
	// Global desktop/fullscreen state from atoms (initialized in AgentsLayout)
	const isDesktop = isDesktopAtom[0];
	const isFullscreen = isFullscreenAtom[0];
	// Chat source mode: "local" or "sandbox"
	const chatSourceMode = chatSourceModeAtom[0];
	// Map open IDs to metadata and sort by updated_at (most recent first)
	const openSubChats = createMemo(() => {
		const chats = openSubChatIds.map((id) => allSubChats.find((sc) => sc.id === id)).filter((sc): sc is SubChatMeta => !!sc).sort((a, b) => {
			const aT = new Date(a.updated_at || a.created_at || "0").getTime();
			const bT = new Date(b.updated_at || b.created_at || "0").getTime();
			return bT - aT;
		});
		return chats;
	});
	// Filter and separate pinned/unpinned sub-chats
	const pinnedAndUnpinned = createMemo(() => {
		const filtered = searchQuery().trim() ? openSubChats().filter((chat) => chat.name.toLowerCase().includes(searchQuery().toLowerCase())) : openSubChats();
		const pinned = filtered.filter((chat) => pinnedSubChatIds.includes(chat.id));
		const unpinned = filtered.filter((chat) => !pinnedSubChatIds.includes(chat.id));
		return {
			pinnedChats: pinned,
			unpinnedChats: unpinned
		};
	});
	const pinnedChats = () => pinnedAndUnpinned().pinnedChats;
	const unpinnedChats = () => pinnedAndUnpinned().unpinnedChats;
	const filteredSubChats = createMemo(() => {
		return [...pinnedChats(), ...unpinnedChats()];
	});
	// Reset focused index when search query changes
	createEffect(() => {
		searchQuery();
		filteredSubChats();
		setFocusedChatIndex(-1);
	});
	// Scroll focused item into view
	createEffect(() => {
		if (focusedChatIndex() >= 0 && filteredSubChats().length > 0) {
			const focusedElement = scrollContainerRef?.querySelector(`[data-subchat-index="${focusedChatIndex()}"]`) as HTMLElement | null;
			if (focusedElement) {
				focusedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth"
				});
			}
		}
	});
	// Unified scroll handler for gradients (works with both event and direct calls)
	const updateScrollGradients = (element?: HTMLDivElement) => {
		const container = element || scrollContainerRef;
		if (!container) return;
		const { scrollTop, scrollHeight, clientHeight } = container;
		const isScrollable = scrollHeight > clientHeight;
		if (!isScrollable) {
			setShowBottomGradient(false);
			setShowTopGradient(false);
			return;
		}
		const threshold = 5;
		const isAtTop = scrollTop <= threshold;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
		setShowTopGradient(!isAtTop);
		setShowBottomGradient(!isAtBottom);
	};
	// Handler for scroll event
	const handleScroll = (e: Event & { currentTarget: HTMLDivElement }) => {
		updateScrollGradients(e.currentTarget);
	};
	// Initialize gradients on mount and observe container size changes
	createEffect(() => {
		filteredSubChats();
		const container = scrollContainerRef;
		if (!container) return;
		updateScrollGradients();
		const resizeObserver = new ResizeObserver(() => updateScrollGradients());
		resizeObserver.observe(container);
		onCleanup(() => resizeObserver.disconnect());
	});
	// Hotkey: / to focus search input (only when sidebar is visible and input not focused)
	createEffect(() => {
		const handleSearchHotkey = (e: KeyboardEvent) => {
			// Only trigger if / is pressed without Cmd/Ctrl/Alt
			// Note: e.key automatically handles keyboard layouts (Shift is not checked, allowing international layouts)
			if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				// Don't trigger if already focused on an input/textarea
				const activeEl = document.activeElement;
				if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.hasAttribute("contenteditable")) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				searchInputRef?.focus();
				searchInputRef?.select();
			}
		};
		// Use capture phase to intercept before other handlers (e.g., prompt input)
		window.addEventListener("keydown", handleSearchHotkey, { capture: true });
		onCleanup(() => window.removeEventListener("keydown", handleSearchHotkey, { capture: true }));
	});
	// Derive which sub-chats are loading (keys = subChatIds)
	const loadingChatIds = createMemo(() => new Set([...loadingSubChats().keys()]));
	const handleSubChatClick = (subChatId: string) => {
		const store = useAgentSubChatStore.getState();
		store.setActiveSubChat(subChatId);
		// Clear unseen indicator for this sub-chat
		subChatUnseenChanges().delete(subChatId);
	};
	const handleArchiveSubChat = (subChatId: string) => {
		// If this is the last open subchat, show confirmation dialog
		if (openSubChats().length === 1) {
			const subChat = allSubChats.find((sc) => sc.id === subChatId);
			if (subChat) {
				setSubChatToArchive(subChat);
				setArchiveAgentDialogOpen(true);
			}
			return;
		}
		// Archive = remove from open tabs (but keep in allSubChats for history)
		useAgentSubChatStore.getState().removeFromOpenSubChats(subChatId);
		// Add to unified undo stack for Cmd+Z
		if (parentChatId) {
			const timeoutId = setTimeout(() => {
				setUndoStack((prev) => prev.filter((item) => !(item.type === "subchat" && item.subChatId === subChatId)));
			}, 1e4);
			setUndoStack((prev) => [...prev, {
				type: "subchat",
				subChatId,
				chatId: parentChatId,
				timeoutId
			}]);
		}
	};
	const handleConfirmArchiveAgent = () => {
		if (parentChatId) {
			// Archive the parent agent chat
			archiveChatMutation.mutate({ id: parentChatId });
		}
		setArchiveAgentDialogOpen(false);
		setSubChatToArchive(null);
	};
	// Handle sub-chat card hover for truncated name tooltip (1s delay)
	// Uses direct DOM manipulation instead of state to avoid re-renders
	const handleSubChatMouseEnter = (subChatId: string, name: string, cardElement: HTMLElement) => {
		// Clear any existing timer
		if (subChatTooltipTimerRef) {
			clearTimeout(subChatTooltipTimerRef);
		}
		const nameEl = subChatNameRefs.get(subChatId);
		if (!nameEl) return;
		// Check if name is truncated
		const isTruncated = nameEl.scrollWidth > nameEl.clientWidth;
		if (!isTruncated) return;
		// Show tooltip after 1 second delay via DOM manipulation (no state update)
		subChatTooltipTimerRef = setTimeout(() => {
			const tooltip = tooltipRef;
			if (!tooltip) return;
			const rect = cardElement.getBoundingClientRect();
			tooltip.style.display = "block";
			tooltip.style.top = `${rect.top + rect.height / 2}px`;
			tooltip.style.left = `${rect.right + 8}px`;
			tooltip.textContent = name;
		}, 1e3);
	};
	const handleSubChatMouseLeave = () => {
		// Clear timer if hovering ends before delay
		if (subChatTooltipTimerRef) {
			clearTimeout(subChatTooltipTimerRef);
			subChatTooltipTimerRef = undefined;
		}
		// Hide tooltip via DOM - no state update, no re-render
		const tooltip = tooltipRef;
		if (tooltip) {
			tooltip.style.display = "none";
		}
	};
	const handleArchiveAllBelow = (subChatId: string) => {
		const currentIndex = filteredSubChats().findIndex((c) => c.id === subChatId);
		if (currentIndex === -1 || currentIndex === filteredSubChats().length - 1) return;
		const state = useAgentSubChatStore.getState();
		const idsToClose = filteredSubChats().slice(currentIndex + 1).map((c) => c.id);
		idsToClose.forEach((id) => state.removeFromOpenSubChats(id));
		// Add each to unified undo stack for Cmd+Z
		if (parentChatId) {
			const newItems: UndoItem[] = idsToClose.map((id) => {
				const timeoutId = setTimeout(() => {
					setUndoStack((prev) => prev.filter((item) => !(item.type === "subchat" && item.subChatId === id)));
				}, 1e4);
				return {
					type: "subchat" as const,
					subChatId: id,
					chatId: parentChatId,
					timeoutId
				};
			});
			setUndoStack((prev) => [...prev, ...newItems]);
		}
	};
	const onCloseOtherChats = (subChatId: string) => {
		const state = useAgentSubChatStore.getState();
		const idsToClose = state.openSubChatIds.filter((id) => id !== subChatId);
		idsToClose.forEach((id) => state.removeFromOpenSubChats(id));
		state.setActiveSubChat(subChatId);
		// Add each to unified undo stack for Cmd+Z
		if (parentChatId) {
			const newItems: UndoItem[] = idsToClose.map((id) => {
				const timeoutId = setTimeout(() => {
					setUndoStack((prev) => prev.filter((item) => !(item.type === "subchat" && item.subChatId === id)));
				}, 1e4);
				return {
					type: "subchat" as const,
					subChatId: id,
					chatId: parentChatId,
					timeoutId
				};
			});
			setUndoStack((prev) => [...prev, ...newItems]);
		}
	};
	const renameMutation = useMutation(() => ({
		mutationFn: (args: { subChatId: string; name: string }) =>
			desktopRpc.chats.renameSubChat.mutate({ id: args.subChatId, name: args.name }),
		onError: (error: { data?: { code?: string } }) => {
			if (error.data?.code === "NOT_FOUND") {
				toast.error("Send a message first before renaming this chat");
			} else {
				toast.error("Failed to rename chat");
			}
		},
	}));
	const handleRenameClick = (subChat: SubChatMeta) => {
		setRenamingSubChat(subChat);
		setRenameDialogOpen(true);
	};
	const handleRenameSave = async (newName: string) => {
		const current = renamingSubChat();
		if (!current) return;
		const subChatId = current.id;
		const oldName = current.name;
		// Optimistically update store
		useAgentSubChatStore.getState().updateSubChatName(subChatId, newName);
		// Remove from justCreatedIds to prevent typewriter animation on manual rename
		justCreatedIds().delete(subChatId);
		setRenameLoading(true);
		try {
			await renameMutation.mutateAsync({
				subChatId,
				name: newName
			});
		} catch {
			// Rollback on error
			useAgentSubChatStore.getState().updateSubChatName(subChatId, oldName || "New Chat");
		} finally {
			setRenameLoading(false);
			setRenamingSubChat(null);
		}
	};
	const handleCreateNew = async () => {
		if (!parentChatId) return;
		const store = useAgentSubChatStore.getState();
		let newId: string;
		if (chatSourceMode() === "sandbox") {
			// Sandbox mode: lazy creation (web app pattern)
			// Sub-chat will be persisted on first message via RemoteChatTransport UPSERT
			newId = crypto.randomUUID();
		} else {
			// Local mode: create sub-chat in DB first to get the real ID
			const newSubChat = await desktopRpc.chats.createSubChat.mutate({
				chatId: parentChatId,
				name: "New Chat",
				mode: defaultAgentMode()
			});
			newId = newSubChat.id;
		}
		// Track this subchat as just created for typewriter effect
		justCreatedIds().add(newId);
		// Initialize atomFamily mode for the new sub-chat
		appStore.set(subChatModeAtomFamily(newId), defaultAgentMode());
		// Add to allSubChats with placeholder name
		store.addToAllSubChats({
			id: newId,
			name: "New Chat",
			created_at: new Date().toISOString(),
			mode: defaultAgentMode()
		});
		// Add to open tabs and set as active
		store.addToOpenSubChats(newId);
		store.setActiveSubChat(newId);
	};
	const handleSelectFromHistory = (subChat: SubChatMeta) => {
		const state = useAgentSubChatStore.getState();
		const isAlreadyOpen = state.openSubChatIds.includes(subChat.id);
		if (!isAlreadyOpen) {
			state.addToOpenSubChats(subChat.id);
		}
		state.setActiveSubChat(subChat.id);
	};
	// Sort sub-chats by most recent first for history
	const sortedSubChats = createMemo(() => [...allSubChats].sort((a, b) => {
		const aT = new Date(a.updated_at || a.created_at || "0").getTime();
		const bT = new Date(b.updated_at || b.created_at || "0").getTime();
		return bT - aT;
	}));
	// Update gradients when filtered chats change or on resize
	createEffect(() => {
		updateScrollGradients();
	});
	// Update gradients on window resize
	createEffect(() => {
		const handleResize = () => updateScrollGradients();
		window.addEventListener("resize", handleResize, { passive: true });
		onCleanup(() => window.removeEventListener("resize", handleResize));
	});
	// Check if all selected sub-chats are pinned
	const areAllSelectedPinned = createMemo(() => {
		if (selectedSubChatIds().size === 0) return false;
		return Array.from(selectedSubChatIds()).every((id: string) => pinnedSubChatIds.includes(id));
	});
	// Check if all selected sub-chats are unpinned
	const areAllSelectedUnpinned = createMemo(() => {
		if (selectedSubChatIds().size === 0) return false;
		return Array.from(selectedSubChatIds()).every((id: string) => !pinnedSubChatIds.includes(id));
	});
	// Show pin option only if all selected have same pin state
	const canShowPinOption = () => areAllSelectedPinned() || areAllSelectedUnpinned();
	// Handle bulk pin of selected sub-chats
	const handleBulkPin = () => {
		const idsToPin = Array.from(selectedSubChatIds()) as string[];
		if (idsToPin.length > 0) {
			idsToPin.forEach((id: string) => {
				if (!pinnedSubChatIds.includes(id)) {
					togglePinSubChat(id);
				}
			});
			clearSubChatSelection();
		}
	};
	// Handle bulk unpin of selected sub-chats
	const handleBulkUnpin = () => {
		const idsToUnpin = Array.from(selectedSubChatIds()) as string[];
		if (idsToUnpin.length > 0) {
			idsToUnpin.forEach((id: string) => {
				if (pinnedSubChatIds.includes(id)) {
					togglePinSubChat(id);
				}
			});
			clearSubChatSelection();
		}
	};
	// Handle bulk archive of selected sub-chats
	const handleBulkArchive = () => {
		const idsToArchive = Array.from(selectedSubChatIds()) as string[];
		if (idsToArchive.length > 0) {
			// Check if closing all open tabs
			const remainingOpenIds = openSubChatIds.filter((id) => !idsToArchive.includes(id));
			if (remainingOpenIds.length === 0) {
				// Closing all tabs - show archive agent confirmation
				const firstSubChat = allSubChats.find((sc) => idsToArchive.includes(sc.id));
				if (firstSubChat) {
					setSubChatToArchive(firstSubChat);
					setArchiveAgentDialogOpen(true);
					clearSubChatSelection();
				}
			} else {
				// Some tabs remain - just close selected ones
				const state = useAgentSubChatStore.getState();
				idsToArchive.forEach((id: string) => state.removeFromOpenSubChats(id));
				clearSubChatSelection();
				// Add each to unified undo stack for Cmd+Z
				if (parentChatId) {
					const newItems: UndoItem[] = idsToArchive.map((id: string) => {
						const timeoutId = setTimeout(() => {
							setUndoStack((prev) => prev.filter((item) => !(item.type === "subchat" && item.subChatId === id)));
						}, 1e4);
						return {
							type: "subchat" as const,
							subChatId: id,
							chatId: parentChatId,
							timeoutId
						};
					});
					setUndoStack((prev) => [...prev, ...newItems]);
				}
			}
		}
	};
	// Handle checkbox click
	const handleCheckboxClick = (e: MouseEvent, subChatId: string) => {
		e.stopPropagation();
		toggleSubChatSelection(subChatId);
	};
	// Handle sub-chat item click with shift support
	const handleSubChatItemClick = (subChatId: string, e?: MouseEvent, globalIndex?: number) => {
		// Shift+click for range selection
		if (e?.shiftKey) {
			e.preventDefault();
			const clickedIndex = globalIndex ?? filteredSubChats().findIndex((c) => c.id === subChatId);
			if (clickedIndex === -1) return;
			// Find the anchor: use active sub-chat
			let anchorIndex = -1;
			if (activeSubChatId) {
				anchorIndex = filteredSubChats().findIndex((c) => c.id === activeSubChatId);
			}
			// If no active sub-chat, try to use the first selected item
			if (anchorIndex === -1 && selectedSubChatIds().size > 0) {
				for (let i = 0; i < filteredSubChats().length; i++) {
					if (selectedSubChatIds().has(filteredSubChats()[i]!.id)) {
						anchorIndex = i;
						break;
					}
				}
			}
			// If still no anchor, just select the clicked item
			if (anchorIndex === -1) {
				if (!selectedSubChatIds().has(subChatId)) {
					toggleSubChatSelection(subChatId);
				}
				return;
			}
			// Select range from anchor to clicked item
			const startIndex = Math.min(anchorIndex, clickedIndex);
			const endIndex = Math.max(anchorIndex, clickedIndex);
			const newSelection = new Set(selectedSubChatIds());
			for (let i = startIndex; i <= endIndex; i++) {
				const chat = filteredSubChats()[i];
				if (chat) {
					newSelection.add(chat.id);
				}
			}
			setSelectedSubChatIds(newSelection);
			return;
		}
		// Normal click - navigate to sub-chat
		handleSubChatClick(subChatId);
	};
	// Multi-select hotkeys
	// X to toggle selection of hovered or focused chat
	useHotkeys("x", () => {
		if (!filteredSubChats() || filteredSubChats().length === 0) return;
		// Prefer hovered (via ref), then focused
		const targetIndex = hoveredChatIndexRef >= 0 ? hoveredChatIndexRef : focusedChatIndex() >= 0 ? focusedChatIndex() : -1;
		if (targetIndex >= 0 && targetIndex < filteredSubChats().length) {
			const subChatId = filteredSubChats()[targetIndex]!.id;
			toggleSubChatSelection(subChatId);
		}
	}, [
		filteredSubChats,
		focusedChatIndex,
		toggleSubChatSelection
	]);
	// Cmd+A / Ctrl+A to select all sub-chats (only when at least one is already selected)
	useHotkeys("mod+a", (e) => {
		if (isMultiSelectMode() && filteredSubChats().length > 0) {
			e.preventDefault();
			selectAllSubChats(filteredSubChats().map((c) => c.id));
		}
	}, [
		filteredSubChats,
		selectAllSubChats,
		isMultiSelectMode
	]);
	// Escape to clear selection (but not when dialogs are open)
	useHotkeys("escape", () => {
		if (archiveAgentDialogOpen() || renameDialogOpen()) return;
		if (isMultiSelectMode()) {
			clearSubChatSelection();
			setFocusedChatIndex(-1);
		}
	}, [
		isMultiSelectMode,
		clearSubChatSelection,
		archiveAgentDialogOpen,
		renameDialogOpen
	]);
	// Clear selection when parent chat changes
	createEffect(() => {
		clearSubChatSelection();
	});
	// Drafts cache - uses event-based sync instead of polling
	const draftsCache = useSubChatDraftsCache();
	// Get draft for a sub-chat
	const getDraftText = (subChatId: string): string | null => {
		if (!parentChatId) return null;
		const key = getSubChatDraftKey(parentChatId, subChatId);
		return draftsCache()[key] || null;
	};
	// History and Close buttons - reusable element
	const headerButtons = () => <Show when={local.onClose}><div class="flex items-center gap-1">
      <SidebarSearchHistoryPopover sortedSubChats={sortedSubChats()} loadingSubChats={loadingSubChats()} subChatUnseenChanges={subChatUnseenChanges} pendingQuestionsMap={pendingQuestionsMap()} allSubChatsLength={allSubChats.length} onSelect={handleSelectFromHistory} />
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={local.onClose} tabIndex={-1} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close sidebar">
            <IconDoubleChevronLeft class="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Close chats pane</TooltipContent>
      </Tooltip>
    </div></Show>;
	return <div class="flex flex-col h-full bg-background border-r overflow-hidden relative" style={{ "border-right-width": "0.5px" }}>
      {	/* Draggable area for window movement - background layer (hidden in fullscreen) */}
      <Show when={isDesktop() && !isFullscreen()}><div class="absolute inset-0 z-0" style={{ "-webkit-app-region": "drag" } as any} /></Show>

      { /* Spacer for macOS traffic lights - only when agents sidebar is open */}
      <Show when={local.isSidebarOpen}><TrafficLightSpacer isDesktop={isDesktop} isFullscreen={isFullscreen} /></Show>

      { /* Header buttons - absolutely positioned when agents sidebar is open */}
      <Show when={local.isSidebarOpen}><div class="absolute right-2 top-2 z-20" style={{ WebkitAppRegion: "no-drag" }}>
          {headerButtons()}
        </div></Show>

      { /* Header */}
      <div class="p-2 pb-3 flex-shrink-0 relative z-10">
        <div class="space-y-2">
          { /* Top row - different layout based on agents sidebar state */}
          <Show when={local.isSidebarOpen} fallback={<div class="flex items-center justify-between gap-1 mb-1">
              <Show when={local.onBackToChats}><Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={local.onBackToChats} tabIndex={-1} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="Toggle agents sidebar" style={{ WebkitAppRegion: "no-drag" }}>
                      <AlignJustify class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open chats sidebar</TooltipContent>
                </Tooltip></Show>
              <div class="flex-1" />
              <div style={{ WebkitAppRegion: "no-drag" }}>
                {headerButtons()}
              </div>
            </div>}><div class="h-6" /></Show>
          { /* Search Input */}
          <div class="relative" style={{ WebkitAppRegion: "no-drag" }}>
            <Input ref={(el) => searchInputRef = el} placeholder="Search chats..." value={searchQuery()} onInput={(e) => setSearchQuery(e.currentTarget.value)} onKeyDown={(e) => {
 if (e.key === "Escape") {
			e.preventDefault();
			searchInputRef?.blur();
			setFocusedChatIndex(-1);
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setFocusedChatIndex((prev) => {
				if (prev === -1) return 0;
				return prev < filteredSubChats().length - 1 ? prev + 1 : prev;
			});
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setFocusedChatIndex((prev) => {
				if (prev === -1) return filteredSubChats().length - 1;
				return prev > 0 ? prev - 1 : prev;
			});
			return;
		}
		if (e.key === "Enter") {
			e.preventDefault();
			if (focusedChatIndex() >= 0) {
				const focusedChat = filteredSubChats()[focusedChatIndex()];
				if (focusedChat) {
					handleSubChatClick(focusedChat.id);
					searchInputRef?.blur();
					setFocusedChatIndex(-1);
				}
			}
			return;
		}
	}} class="h-7 w-full rounded-lg text-sm bg-muted border border-input placeholder:text-muted-foreground/40" />
          </div>
          {	/* New Chat Button */}
          <div style={{ WebkitAppRegion: "no-drag" }}>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateNew} variant="outline" size="sm" class="h-7 px-2 w-full hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground rounded-lg">
                  <span class="text-sm font-medium">New Chat</span>
                </Button>
              </TooltipTrigger>
            <TooltipContent side="right">
              Create a new chat
              <Show when={newAgentHotkey}><Kbd>{newAgentHotkey}</Kbd></Show>
            </TooltipContent>
          </Tooltip>
          </div>
        </div>
      </div>

      { /* Scrollable Sub-Chats List */}
      <div class="flex-1 min-h-0 relative z-10" style={{ WebkitAppRegion: "no-drag" }}>
        { /* Loading state - centered spinner */}
        <Show when={local.isLoading} fallback={<>
            { /* Top gradient */}
            <Show when={showTopGradient()}><div class="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" /></Show>

            { /* Bottom gradient */}
            <Show when={showBottomGradient()}><div class="absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" /></Show>

            <div ref={scrollContainerRef} onScroll={handleScroll} class={cn("h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent", isMultiSelectMode() ? "px-0" : "px-2")}>
              <Show when={filteredSubChats().length > 0} fallback={<Show when={searchQuery().trim()}><div class="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                  <div>
                    <p class="mb-1">No results</p>
                    <p class="text-xs text-muted-foreground/60">
                      Try a different search term
                    </p>
                  </div>
                </div></Show>}><div class={cn("mb-4", isMultiSelectMode() ? "px-0" : "-mx-1")}>
                  { /* Pinned section */}
                  <Show when={pinnedChats.length > 0}>
                      <div class={cn("flex items-center h-4 mb-1", isMultiSelectMode() ? "pl-3" : "pl-2")}>
                        <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Pinned Chats
                        </h3>
                      </div>
                      <div class="list-none p-0 m-0 mb-3">
                        <For each={pinnedChats}>{(subChat) => {
 const isSubChatLoading = loadingChatIds.has(subChat.id);
		const isActive = activeSubChatId === subChat.id;
		const isPinned = pinnedSubChatIds.includes(subChat.id);
		const globalIndex = filteredSubChats().findIndex((c) => c.id === subChat.id);
		const isFocused = focusedChatIndex() === globalIndex && focusedChatIndex() >= 0;
		const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at);
		const mode = subChat.mode || "agent";
		const isChecked = selectedSubChatIds.has(subChat.id);
		const draftText = getDraftText(subChat.id);
		const hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
		const hasPendingPlan = pendingPlanApprovals.has(subChat.id);
		const fileChanges = subChatFiles.get(subChat.id) || [];
		const stats = fileChanges.length > 0 ? fileChanges.reduce((acc, f) => ({
			fileCount: acc.fileCount + 1,
			additions: acc.additions + f.additions,
			deletions: acc.deletions + f.deletions
		}), {
			fileCount: 0,
			additions: 0,
			deletions: 0
		}) : null;
		return <ContextMenu key={subChat.id}>
                              <ContextMenuTrigger asChild>
                                <div data-subchat-index={globalIndex} onClick={(e) => handleSubChatItemClick(subChat.id, e, globalIndex)} tabIndex={0} onKeyDown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleSubChatItemClick(subChat.id, undefined, globalIndex);
			}
		}} onMouseEnter={(e) => {
			hoveredChatIndexRef = globalIndex;
			handleSubChatMouseEnter(subChat.id, subChat.name || "New Chat", e.currentTarget);
		}} onMouseLeave={() => {
			hoveredChatIndexRef = -1;
			handleSubChatMouseLeave();
		}} class={cn("w-full text-left py-1.5 transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isMultiSelectMode() ? "px-3" : "pl-2 pr-2", isMultiSelectMode() ? "" : "rounded-md", isActive ? "bg-foreground/5 text-foreground" : isChecked ? "bg-foreground/5 text-foreground" : isFocused ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                                  <div class="flex items-start gap-2.5">
                                    {		/* Icon/Checkbox container */}
                                    <div class="pt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                                      { /* Checkbox - shown in multi-select mode */}
                                      <div class={cn("absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode() ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")} onClick={(e) => handleCheckboxClick(e, subChat.id)}>
                                        <Checkbox checked={isChecked} class="cursor-pointer h-4 w-4" tabIndex={isMultiSelectMode() ? 0 : -1} />
                                      </div>
                                      { /* Mode icon or Question icon - hidden in multi-select mode */}
                                      <div class={cn("transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode() ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>
                                        <Switch fallback={<AgentIcon class="w-4 h-4 text-muted-foreground" />}>
                                          <Match when={hasPendingQuestion}><QuestionIcon class="w-4 h-4 text-blue-500" /></Match>
                                          <Match when={mode === "plan"}><PlanIcon class="w-4 h-4 text-muted-foreground" /></Match>
                                        </Switch>
                                      </div>
                                      { /* Badge - read subChatUnseenChanges() inline for Solid reactivity */}
                                      <Show when={(isSubChatLoading || subChatUnseenChanges().has(subChat.id) || hasPendingPlan) && !isMultiSelectMode() && !hasPendingQuestion}><div class={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isActive ? "bg-[#E8E8E8] dark:bg-[#1B1B1B]" : "bg-[#F4F4F4] group-hover:bg-[#E8E8E8] dark:bg-[#101010] dark:group-hover:bg-[#1B1B1B]")}>
                                            <Switch fallback={<LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground" />}>
                                              <Match when={isSubChatLoading}><LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground" /></Match>
                                              <Match when={hasPendingPlan}><div class="w-1.5 h-1.5 rounded-full bg-amber-500" /></Match>
                                            </Switch>
                                          </div></Show>
                                    </div>
                                    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <div class="flex items-center gap-1">
                                        <span ref={(el) => {
 if (el) subChatNameRefs.set(subChat.id, el);
		}} class="truncate block text-sm leading-tight flex-1">
                                          <TypewriterText text={subChat.name || ""} placeholder="New Chat" id={subChat.id} isJustCreated={justCreatedIds().has(subChat.id)} showPlaceholder={true} />
                                        </span>
                                        <Show when={!isMultiSelectMode()}><button onClick={(e) => {
			e.stopPropagation();
			handleArchiveSubChat(subChat.id);
		}} tabIndex={-1} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive agent">
                                            <ArchiveIcon class="h-3.5 w-3.5" />
                                          </button></Show>
                                      </div>
                                      <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 min-w-0">
                                        <Show when={draftText} fallback={<span class="truncate flex-1 min-w-0">
                                            <Show when={stats}><>
                                                {stats.fileCount}{" "}
                                                {stats.fileCount === 1 ? "file" : "files"}
                                              </></Show>
                                          </span>}><span class="truncate flex-1 min-w-0">
                                            <span class="text-blue-500">Draft:</span>{" "}
                                            {draftText}
                                          </span></Show>
                                        <div class="flex items-center gap-1.5 flex-shrink-0">
                                          <Show when={!draftText && stats && (stats.additions > 0 || stats.deletions > 0)}><>
                                              <span class="text-green-600 dark:text-green-400">
                                                +{stats.additions}
                                              </span>
                                              <span class="text-red-600 dark:text-red-400">
                                                -{stats.deletions}
                                              </span>
                                            </></Show>
                                          <span>{timeAgo}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </ContextMenuTrigger>
                              {		/* Multi-select context menu */}
                              <Show when={isMultiSelectMode() && selectedSubChatIds().has(subChat.id)} fallback={<SubChatContextMenu subChat={subChat} isPinned={isPinned} onTogglePin={togglePinSubChat} onRename={handleRenameClick} onArchive={handleArchiveSubChat} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={onCloseOtherChats} isOnlyChat={openSubChats().length === 1} currentIndex={globalIndex} totalCount={filteredSubChats().length} chatId={parentChatId} />}><ContextMenuContent class="w-48">
                                  <Show when={canShowPinOption()}><>
                                      <ContextMenuItem onClick={areAllSelectedPinned() ? handleBulkUnpin : handleBulkPin}>
                                        {areAllSelectedPinned() ? `Unpin ${selectedSubChatIds().size} ${pluralize(selectedSubChatIds().size, "chat")}` : `Pin ${selectedSubChatIds().size} ${pluralize(selectedSubChatIds().size, "chat")}`}
                                      </ContextMenuItem>
                                      <ContextMenuSeparator />
                                    </></Show>
                                  <ContextMenuItem onClick={handleBulkArchive}>
                                    Archive {selectedSubChatIds().size}{" "}
                                    {pluralize(selectedSubChatIds().size, "chat")}
                                  </ContextMenuItem>
                                </ContextMenuContent></Show>
                            </ContextMenu>;
 }}</For>
                      </div>
                    </Show>

                  {	/* Unpinned section */}
                  <Show when={unpinnedChats.length > 0}><>
                      <div class={cn("flex items-center h-4 mb-1", isMultiSelectMode() ? "pl-3" : "pl-2")}>
                        <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {pinnedChats.length > 0 ? "Recent chats" : "Chats"}
                        </h3>
                      </div>
                      <div class="list-none p-0 m-0">
                        <For each={unpinnedChats}>{(subChat) => {
 const isSubChatLoading = loadingChatIds.has(subChat.id);
		const isActive = activeSubChatId === subChat.id;
		const isPinned = pinnedSubChatIds.includes(subChat.id);
		const globalIndex = filteredSubChats().findIndex((c) => c.id === subChat.id);
		const isFocused = focusedChatIndex() === globalIndex && focusedChatIndex() >= 0;
		const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at);
		const mode = subChat.mode || "agent";
		const isChecked = selectedSubChatIds.has(subChat.id);
		const draftText = getDraftText(subChat.id);
		const hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
		const hasPendingPlan = pendingPlanApprovals.has(subChat.id);
		const fileChanges = subChatFiles.get(subChat.id) || [];
		const stats = fileChanges.length > 0 ? fileChanges.reduce((acc, f) => ({
			fileCount: acc.fileCount + 1,
			additions: acc.additions + f.additions,
			deletions: acc.deletions + f.deletions
		}), {
			fileCount: 0,
			additions: 0,
			deletions: 0
		}) : null;
		return <ContextMenu key={subChat.id}>
                              <ContextMenuTrigger asChild>
                                <div data-subchat-index={globalIndex} onClick={(e) => handleSubChatItemClick(subChat.id, e, globalIndex)} tabIndex={0} onKeyDown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleSubChatItemClick(subChat.id, undefined, globalIndex);
			}
		}} onMouseEnter={(e) => {
			hoveredChatIndexRef = globalIndex;
			handleSubChatMouseEnter(subChat.id, subChat.name || "New Chat", e.currentTarget);
		}} onMouseLeave={() => {
			hoveredChatIndexRef = -1;
			handleSubChatMouseLeave();
		}} class={cn("w-full text-left py-1.5 transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isMultiSelectMode() ? "px-3" : "pl-2 pr-2", isMultiSelectMode() ? "" : "rounded-md", isActive ? "bg-foreground/5 text-foreground" : isChecked ? "bg-foreground/5 text-foreground" : isFocused ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                                  <div class="flex items-start gap-2.5">
                                    {		/* Icon/Checkbox container */}
                                    <div class="pt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                                      { /* Checkbox - shown in multi-select mode */}
                                      <div class={cn("absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode() ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")} onClick={(e) => handleCheckboxClick(e, subChat.id)}>
                                        <Checkbox checked={isChecked} class="cursor-pointer h-4 w-4" tabIndex={isMultiSelectMode() ? 0 : -1} />
                                      </div>
                                      { /* Mode icon or Question icon - hidden in multi-select mode */}
                                      <div class={cn("transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode() ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>
                                        <Switch fallback={<AgentIcon class="w-4 h-4 text-muted-foreground" />}>
                                          <Match when={hasPendingQuestion}><QuestionIcon class="w-4 h-4 text-blue-500" /></Match>
                                          <Match when={mode === "plan"}><PlanIcon class="w-4 h-4 text-muted-foreground" /></Match>
                                        </Switch>
                                      </div>
                                      { /* Badge - read subChatUnseenChanges() inline for Solid reactivity */}
                                      <Show when={(isSubChatLoading || subChatUnseenChanges().has(subChat.id) || hasPendingPlan) && !isMultiSelectMode() && !hasPendingQuestion}><div class={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isActive ? "bg-[#E8E8E8] dark:bg-[#1B1B1B]" : "bg-[#F4F4F4] group-hover:bg-[#E8E8E8] dark:bg-[#101010] dark:group-hover:bg-[#1B1B1B]")}>
                                            <Switch fallback={<LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground" />}>
                                              <Match when={isSubChatLoading}><LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground" /></Match>
                                              <Match when={hasPendingPlan}><div class="w-1.5 h-1.5 rounded-full bg-amber-500" /></Match>
                                            </Switch>
                                          </div></Show>
                                    </div>
                                    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <div class="flex items-center gap-1">
                                        <span ref={(el) => {
 if (el) subChatNameRefs.set(subChat.id, el);
		}} class="truncate block text-sm leading-tight flex-1">
                                          <TypewriterText text={subChat.name || ""} placeholder="New Chat" id={subChat.id} isJustCreated={justCreatedIds().has(subChat.id)} showPlaceholder={true} />
                                        </span>
                                        <Show when={!isMultiSelectMode()}><button onClick={(e) => {
			e.stopPropagation();
			handleArchiveSubChat(subChat.id);
		}} tabIndex={-1} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive agent">
                                            <ArchiveIcon class="h-3.5 w-3.5" />
                                          </button></Show>
                                      </div>
                                      <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 min-w-0">
                                        <Show when={draftText} fallback={<span class="truncate flex-1 min-w-0">
                                            <Show when={stats}><>
                                                {stats.fileCount}{" "}
                                                {stats.fileCount === 1 ? "file" : "files"}
                                              </></Show>
                                          </span>}><span class="truncate flex-1 min-w-0">
                                            <span class="text-blue-500">Draft:</span>{" "}
                                            {draftText}
                                          </span></Show>
                                        <div class="flex items-center gap-1.5 flex-shrink-0">
                                          <Show when={!draftText && stats && (stats.additions > 0 || stats.deletions > 0)}><>
                                              <span class="text-green-600 dark:text-green-400">
                                                +{stats.additions}
                                              </span>
                                              <span class="text-red-600 dark:text-red-400">
                                                -{stats.deletions}
                                              </span>
                                            </></Show>
                                          <span>{timeAgo}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </ContextMenuTrigger>
                              {		/* Multi-select context menu */}
                              <Show when={isMultiSelectMode() && selectedSubChatIds().has(subChat.id)} fallback={<SubChatContextMenu subChat={subChat} isPinned={isPinned} onTogglePin={togglePinSubChat} onRename={handleRenameClick} onArchive={handleArchiveSubChat} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={onCloseOtherChats} isOnlyChat={openSubChats().length === 1} currentIndex={globalIndex} totalCount={filteredSubChats().length} chatId={parentChatId} />}><ContextMenuContent class="w-48">
                                  <Show when={canShowPinOption()}><>
                                      <ContextMenuItem onClick={areAllSelectedPinned() ? handleBulkUnpin : handleBulkPin}>
                                        {areAllSelectedPinned() ? `Unpin ${selectedSubChatIds().size} ${pluralize(selectedSubChatIds().size, "chat")}` : `Pin ${selectedSubChatIds().size} ${pluralize(selectedSubChatIds().size, "chat")}`}
                                      </ContextMenuItem>
                                      <ContextMenuSeparator />
                                    </></Show>
                                  <ContextMenuItem onClick={handleBulkArchive}>
                                    Archive {selectedSubChatIds().size}{" "}
                                    {pluralize(selectedSubChatIds().size, "chat")}
                                  </ContextMenuItem>
                                </ContextMenuContent></Show>
                            </ContextMenu>;
 }}</For>
                      </div>
                    </></Show>
                </div></Show>
            </div>
          </>}>
          <div class="flex items-center justify-center h-full">
            <IconSpinner class="w-4 h-4 text-muted-foreground" />
          </div>
        </Show>
      </div>

      {	/* Multi-select Footer Toolbar */}
      <Show when={isMultiSelectMode()}>
        <div class="flex-shrink-0 p-2 bg-background space-y-2 relative z-10" style={{ "webkit-app-region": "no-drag" }}>
            <div class="flex items-center justify-between px-1">
              <span class="text-xs text-muted-foreground">
                {selectedSubChatsCount()} selected
              </span>
              <button onClick={clearSubChatSelection} class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>

            <div class="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={handleBulkArchive} class="flex-1 h-8 gap-1.5 text-xs rounded-lg">
                <ArchiveIcon class="h-3.5 w-3.5" />
                Archive
              </Button>
            </div>
          </div>
      </Show>

      {	/* Rename Dialog */}
      <AgentsRenameSubChatDialog isOpen={renameDialogOpen()} onClose={() => {
 setRenameDialogOpen(false);
		setRenamingSubChat(null);
	}} onSave={handleRenameSave} currentName={renamingSubChat()?.name || ""} isLoading={renameLoading()} />

      {	/* Archive Agent Confirmation Dialog */}
      <AlertDialog open={archiveAgentDialogOpen()} onOpenChange={(open) => {
 setArchiveAgentDialogOpen(open);
		if (!open) {
			setSubChatToArchive(null);
		}
	}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive agent</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription class="px-5 pb-5">
            Do you want to archive agent{" "}
            <span class="font-medium text-foreground">
              {local.agentName || subChatToArchive()?.name || "this agent"}
            </span>
            ? You can restore it from history later.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchiveAgent} autofocus>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {	/* SubChat name tooltip portal - always rendered, visibility controlled via ref */}
      <Portal>
        <div ref={(el) => tooltipRef = el} class="fixed z-[100000] max-w-xs px-2 py-1 text-xs bg-popover border border-border rounded-md shadow-lg pointer-events-none text-foreground/90 whitespace-nowrap" style={{
 display: "none",
		transform: "translateY(-50%)"
	}} />
      </Portal>
    </div>;
}
