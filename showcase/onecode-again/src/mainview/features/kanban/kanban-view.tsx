import { createMemo, createEffect, createSignal, onCleanup } from "solid-js";
import { toast } from "solid-sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../lib/desktop-rpc";
import { getWindowId } from "../../contexts/WindowContext";
import { selectedAgentChatIdAtom, selectedDraftIdAtom, showNewChatFormAtom, loadingSubChatsAtom, pendingUserQuestionsAtom, pendingPlanApprovalsAtom, agentsUnseenChangesAtom, selectedProjectAtom, agentsSidebarOpenAtom } from "../agents/atoms";
import { selectedAgentChatIdsAtom, isAgentMultiSelectModeAtom, toggleAgentChatSelectionAtom } from "../../lib/atoms";
import { KanbanBoard } from "./components/kanban-board";
import type { KanbanCardData } from "./components/kanban-card";
import { deriveWorkspaceStatus } from "./lib/derive-status";
import { useNewChatDrafts } from "../agents/lib/drafts";
import { exportChat, copyChat } from "../agents/lib/export-chat";
import { AgentsRenameSubChatDialog } from "../agents/components/agents-rename-subchat-dialog";
import { ConfirmArchiveDialog } from "../../components/confirm-archive-dialog";
import { AgentsHeaderControls } from "../agents/ui/agents-header-controls";
// Event for open sub-chats changes
const OPEN_SUB_CHATS_CHANGE_EVENT = "open-sub-chats-change";
export function KanbanView() {
	const setSelectedChatId = selectedAgentChatIdAtom[1];
	const setSelectedDraftId = selectedDraftIdAtom[1];
	const setShowNewChatForm = showNewChatFormAtom[1];
	// Sidebar state for header controls
	const sidebarOpen = agentsSidebarOpenAtom[0];
	const setSidebarOpen = agentsSidebarOpenAtom[1];
	// Multi-select state
	const selectedChatIds = selectedAgentChatIdsAtom[0];
	const isMultiSelectMode = isAgentMultiSelectModeAtom[0];
	const toggleChatSelection = toggleAgentChatSelectionAtom[1];
	// Status atoms
	const loadingSubChats = loadingSubChatsAtom[0];
	const pendingQuestions = pendingUserQuestionsAtom[0];
	const pendingPlanApprovals = pendingPlanApprovalsAtom[0];
	const unseenChanges = agentsUnseenChangesAtom[0];
	// Project for pinned chats storage
	const selectedProject = selectedProjectAtom[0];
	// Pinned chats (stored in localStorage per project)
	const [pinnedChatIds, setPinnedChatIds] = createSignal(new Set());
	// Rename dialog state
	const [renameDialogOpen, setRenameDialogOpen] = createSignal(false);
	const [renamingChat, setRenamingChat] = createSignal(null);
	// Archive confirmation dialog state
	const [confirmArchiveDialogOpen, setConfirmArchiveDialogOpen] = createSignal(false);
	const [archivingChatId, setArchivingChatId] = createSignal(null);
	const [activeProcessCount, setActiveProcessCount] = createSignal(0);
	const [hasWorktree, setHasWorktree] = createSignal(false);
	const [uncommittedCount, setUncommittedCount] = createSignal(0);
	const queryClient = useQueryClient();
	// Load pinned IDs from localStorage when project changes
	createEffect(() => {
		if (!selectedProject()?.id) {
			setPinnedChatIds(new Set());
			return;
		}
		try {
			const windowId = getWindowId();
			const stored = localStorage.getItem(`${windowId}:agent-pinned-chats-${selectedProject()!.id}`);
			setPinnedChatIds(stored ? new Set(JSON.parse(stored)) : new Set());
		} catch {
			setPinnedChatIds(new Set());
		}
	});
	// Save pinned IDs to localStorage when they change
	const [prevPinnedRef, setPrevPinnedRef] = createSignal<Set<string>>(new Set());
	createEffect(() => {
		if (!selectedProject()?.id) return;
		const current = pinnedChatIds();
		const prev = prevPinnedRef();
		if (current !== prev && (current.size > 0 || prev.size > 0)) {
			const windowId = getWindowId();
			localStorage.setItem(`${windowId}:agent-pinned-chats-${selectedProject()!.id}`, JSON.stringify([...current]));
		}
		setPrevPinnedRef(current);
	});
	// Toggle pin handler
	const handleTogglePin = (chatId: string) => {
		setPinnedChatIds((prev) => {
			const next = new Set(prev);
			if (next.has(chatId)) {
				next.delete(chatId);
			} else {
				next.add(chatId);
			}
			return next;
		});
	};
	// Drafts from localStorage
	const drafts = useNewChatDrafts();
	// Fetch all chats (workspaces)
	const { data: chats } = useQuery(() => ({
		queryKey: ["chats", "list"] as const,
		queryFn: () => desktopRpc.chats.list.query({}),
	}));
	// Fetch projects for metadata
	const { data: projects } = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query({}),
	}));
	// Create projects map
	type Project = { id: string; name: string; path: string; [k: string]: unknown };
	const projectsMap = createMemo(() => {
		const proj = projects?.();
		if (!proj) return new Map<string, Project>();
		return new Map(proj.map((p) => [p.id, p as Project]));
	});
	// Track open sub-chat changes for reactivity
	const [openSubChatsVersion, setOpenSubChatsVersion] = createSignal(0);
	createEffect(() => {
		const handleChange = () => setOpenSubChatsVersion((v) => v + 1);
		window.addEventListener(OPEN_SUB_CHATS_CHANGE_EVENT, handleChange);
		onCleanup(() => window.removeEventListener(OPEN_SUB_CHATS_CHANGE_EVENT, handleChange));
	});
	// Store previous value to avoid unnecessary React Query refetches
	const [prevOpenSubChatIdsRef, setPrevOpenSubChatIdsRef] = createSignal<string[]>([]);
	// Collect all open sub-chat IDs from localStorage for all workspaces
	const allOpenSubChatIds = createMemo(() => {
		void openSubChatsVersion;
		const chatList = chats?.();
		if (!chatList) return prevOpenSubChatIdsRef();
		const windowId = getWindowId();
		const allIds: string[] = [];
		for (const chat of chatList) {
			try {
				const stored = localStorage.getItem(`${windowId}:agent-open-sub-chats-${chat.id}`);
				if (stored) {
					const ids = JSON.parse(stored) as string[];
					allIds.push(...ids);
				}
			} catch {}
		}
		const prev = prevOpenSubChatIdsRef();
		const sorted = [...allIds].sort();
		const prevSorted = [...prev].sort();
		if (sorted.length === prevSorted.length && sorted.every((id, i) => id === prevSorted[i])) {
			return prev;
		}
		setPrevOpenSubChatIdsRef(allIds);
		return allIds;
	});
	// Pending plan approvals from DB
	const { data: pendingPlanApprovalsData } = useQuery(() => ({
		queryKey: ["chats", "getPendingPlanApprovals", allOpenSubChatIds()] as const,
		queryFn: () => desktopRpc.chats.getPendingPlanApprovals({ openSubChatIds: allOpenSubChatIds() }),
		refetchInterval: 5e3,
		enabled: allOpenSubChatIds().length > 0,
		placeholderData: (prev) => prev,
	}));
	// File stats from DB
	const { data: fileStatsData } = useQuery(() => ({
		queryKey: ["chats", "getFileStats", allOpenSubChatIds()] as const,
		queryFn: () => desktopRpc.chats.getFileStats({ openSubChatIds: allOpenSubChatIds() }),
		refetchInterval: 5e3,
		enabled: allOpenSubChatIds().length > 0,
		placeholderData: (prev) => prev,
	}));
	// Build set of chatIds with pending plan approvals from DB
	const workspacesWithPendingApprovalsFromDb = createMemo(() => {
		const set = new Set<string>();
		const data = pendingPlanApprovalsData?.();
		if (data) {
			for (const item of data) {
				set.add(item.chatId);
			}
		}
		return set;
	});
	// Build set of chatIds with pending plan approvals from runtime atom
	const workspacesWithPendingApprovals = createMemo(() => {
		const set = new Set<string>(workspacesWithPendingApprovalsFromDb);
		// Add from runtime atom (parentChatId is the workspace id)
		pendingPlanApprovals.forEach((parentChatId) => {
			set.add(parentChatId);
		});
		return set;
	});
	// Build file stats map (chatId -> stats)
	const workspaceFileStats = createMemo(() => {
		const statsMap = new Map<string, {
			fileCount: number;
			additions: number;
			deletions: number;
		}>();
		const data = fileStatsData?.();
		if (data) {
			for (const stat of data) {
				statsMap.set(stat.chatId, {
					fileCount: stat.fileCount,
					additions: stat.additions,
					deletions: stat.deletions
				});
			}
		}
		return statsMap;
	});
	// Build set of chatIds with pending questions
	const workspacesWithPendingQuestions = createMemo(() => {
		const set = new Set<string>();
		pendingQuestions.forEach((q) => {
			set.add(q.parentChatId);
		});
		return set;
	});
	// Build set of chatIds (workspace IDs) that are loading
	// loadingSubChats is Map<subChatId, parentChatId>, we need the VALUES (parentChatId)
	const workspacesLoading = createMemo(() => new Set([...loadingSubChats.values()]));
	// Build kanban cards from workspaces (chats) + drafts
	const cards = createMemo(() => {
		const result: KanbanCardData[] = [];
		// Add drafts first (they go to "draft" column)
		for (const draft of drafts) {
			result.push({
				id: draft.id,
				name: draft.text.slice(0, 50) + (draft.text.length > 50 ? "..." : ""),
				chatId: draft.id,
				chatName: null,
				projectName: draft.project?.gitRepo || draft.project?.name || null,
				branch: null,
				mode: "agent",
				status: "draft",
				hasUnseenChanges: false,
				hasPendingPlan: false,
				hasPendingQuestion: false,
				createdAt: new Date(draft.updatedAt),
				updatedAt: new Date(draft.updatedAt),
				isDraft: true,
				isPinned: false,
				isSelected: false
			});
		}
		// Add workspaces
		const chatList = chats?.();
		if (chatList) {
			for (const chat of chatList) {
				const project = projectsMap.get(chat.projectId);
				const status = deriveWorkspaceStatus(chat.id, {
					workspacesLoading,
					workspacesWithPendingQuestions,
					workspacesWithPendingApprovals
				});
				result.push({
					id: chat.id,
					name: chat.name,
					chatId: chat.id,
					chatName: chat.name,
					projectName: project?.gitRepo || project?.name || null,
					branch: chat.branch,
					mode: "agent",
					status,
					hasUnseenChanges: unseenChanges().has(chat.id),
					hasPendingPlan: workspacesWithPendingApprovals.has(chat.id),
					hasPendingQuestion: workspacesWithPendingQuestions.has(chat.id),
					createdAt: new Date(chat.createdAt || Date.now()),
					updatedAt: chat.updatedAt ? new Date(chat.updatedAt) : null,
					isDraft: false,
					stats: workspaceFileStats.get(chat.id),
					isPinned: pinnedChatIds.has(chat.id),
					isSelected: selectedChatIds().has(chat.id)
				});
			}
		}
		return result;
	});
	// Navigation on card click
	const handleCardClick = (card: KanbanCardData, e?: MouseEvent) => {
		// In multi-select mode with shift/cmd, toggle selection instead of navigating
		if (isMultiSelectMode() || e?.shiftKey || e?.metaKey) {
			if (!card.isDraft) {
				toggleChatSelection(card.chatId);
			}
			return;
		}
		if (card.isDraft) {
			// Navigate to NewChatForm with this draft selected
			setSelectedChatId(null);
			setSelectedDraftId(card.id);
			setShowNewChatForm(false);
		} else {
			// Navigate to workspace
			setSelectedChatId(card.chatId);
			setShowNewChatForm(false);
		}
	};
	// Checkbox click handler for multi-select
	const handleCheckboxClick = (e: MouseEvent, chatId: string) => {
		e.stopPropagation();
		toggleChatSelection(chatId);
	};
	// Rename mutation
	const renameChatMutation = useMutation(() => ({
		mutationFn: (input: { id: string; name: string }) => desktopRpc.chats.rename.mutate(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["chats", "list"] });
		},
		onError: () => {
			toast.error("Failed to rename workspace");
		},
	}));
	// Rename handler
	const handleRenameClick = (chat: {
		id: string;
		name: string | null;
	}) => {
		setRenamingChat(chat);
		setRenameDialogOpen(true);
	};
	const handleRenameSave = async (newName: string) => {
		if (!renamingChat) return;
		await renameChatMutation.mutateAsync({
			id: renamingChat.id,
			name: newName
		});
		setRenameDialogOpen(false);
		setRenamingChat(null);
	};
	// Archive mutation
	const archiveChatMutation = useMutation(() => ({
		mutationFn: (input: { id: string; deleteWorktree?: boolean }) => desktopRpc.chats.archive.mutate(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["chats", "list"] });
			toast.success("Workspace archived");
		},
		onError: () => {
			toast.error("Failed to archive workspace");
		},
	}));
	// Archive handler with confirmation for active processes
	// Electrobun RPC does not expose terminal.getActiveSessionCount yet; use 0 until it does.
	const handleArchive = async (chatId: string) => {
		const [sessionCount, worktreeStatus] = await Promise.all([
			Promise.resolve(0),
			desktopRpc.chats.getWorktreeStatus({ chatId }),
		]);
		const needsConfirmation = sessionCount > 0 || worktreeStatus.hasWorktree;
		if (needsConfirmation) {
			setArchivingChatId(chatId);
			setActiveProcessCount(sessionCount);
			setHasWorktree(worktreeStatus.hasWorktree);
			setUncommittedCount(worktreeStatus.uncommittedCount);
			setConfirmArchiveDialogOpen(true);
		} else {
			await archiveChatMutation.mutateAsync({ id: chatId });
		}
	};
	const handleConfirmArchive = async () => {
		if (!archivingChatId) return;
		await archiveChatMutation.mutateAsync({ id: archivingChatId });
		setConfirmArchiveDialogOpen(false);
		setArchivingChatId(null);
	};
	const handleCancelArchive = () => {
		setConfirmArchiveDialogOpen(false);
		setArchivingChatId(null);
	};
	// Copy branch name to clipboard
	const handleCopyBranch = (branch: string) => {
		navigator.clipboard.writeText(branch);
		toast.success("Branch name copied", { description: branch });
	};
	// Export chat handler
	const handleExportChat = (params: {
		chatId: string;
		format: "markdown" | "json" | "text";
	}) => {
		exportChat(params);
	};
	// Copy chat handler
	const handleCopyChat = (params: {
		chatId: string;
		format: "markdown" | "json" | "text";
	}) => {
		copyChat(params);
	};
	return <div class="flex flex-col h-full w-full bg-background">
      {	/* Header with sidebar toggle */}
      <div class="flex-shrink-0 flex items-center p-1.5">
        <AgentsHeaderControls isSidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      </div>

      { /* Board */}
      <div class="flex-1 overflow-hidden">
        <KanbanBoard cards={cards} pinnedChatIds={pinnedChatIds} isMultiSelectMode={isMultiSelectMode} selectedChatIds={selectedChatIds} onCardClick={handleCardClick} onCheckboxClick={handleCheckboxClick} onTogglePin={handleTogglePin} onRename={handleRenameClick} onArchive={handleArchive} onCopyBranch={handleCopyBranch} onExportChat={handleExportChat} onCopyChat={handleCopyChat} />
      </div>

      { /* Rename Dialog */}
      <AgentsRenameSubChatDialog isOpen={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} currentName={renamingChat?.name || ""} onSave={handleRenameSave} />

      { /* Archive Confirmation Dialog */}
      <ConfirmArchiveDialog isOpen={confirmArchiveDialogOpen} onClose={handleCancelArchive} onConfirm={handleConfirmArchive} activeProcessCount={activeProcessCount} hasWorktree={hasWorktree} uncommittedCount={uncommittedCount} />
    </div>;
 }
