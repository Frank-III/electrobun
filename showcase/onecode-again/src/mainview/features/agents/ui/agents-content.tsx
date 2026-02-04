import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
// import { useSearchParams, useRouter } from "next/navigation" // Desktop doesn't use next/navigation
// Desktop: mock Next.js navigation hooks
const useSearchParams = () => ({ get: (_key: string): string | null => null });
const useRouter = () => ({
	push: (_url: string, _options?: { scroll?: boolean }) => {},
	replace: (_url: string, _options?: { scroll?: boolean }) => {}
});
// Desktop: mock Clerk hooks
const useUser = () => ({ user: null });
const useClerk = () => ({ signOut: () => {} });
import { selectedAgentChatIdAtom, selectedChatIsRemoteAtom, previousAgentChatIdAtom, selectedDraftIdAtom, showNewChatFormAtom, agentsMobileViewModeAtom, agentsPreviewSidebarOpenAtom, agentsSidebarOpenAtom, agentsSubChatsSidebarModeAtom, agentsSubChatsSidebarWidthAtom, selectedProjectAtom } from "../atoms";
import { selectedTeamIdAtom, agentsQuickSwitchOpenAtom, agentsQuickSwitchSelectedIndexAtom, subChatsQuickSwitchOpenAtom, subChatsQuickSwitchSelectedIndexAtom, ctrlTabTargetAtom, betaKanbanEnabledAtom, chatSourceModeAtom } from "../../../lib/atoms";
import { NewChatForm } from "../main/new-chat-form";
import { KanbanView } from "../../kanban";
import { ChatView } from "../main/active-chat";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { transformAgentChatFromRpc } from "../../../lib/transform-chat";
import { useIsMobile } from "../../../lib/hooks/use-mobile";
import { AgentsSidebar } from "../../sidebar/agents-sidebar";
import { AgentsSubChatsSidebar } from "../../sidebar/agents-subchats-sidebar";
import { AgentPreview } from "./agent-preview";
import { AgentDiffView } from "./agent-diff-view";
import { TerminalSidebar } from "../../terminal/terminal-sidebar";
import { useTerminalStore } from "../../terminal/terminal-store-context";
import { useAgentSubChatStore, type SubChatMeta } from "../stores/sub-chat-store";
import { Motion, Presence } from "solid-motionone";
// import { ResizableSidebar } from "@/app/(alpha)/canvas/[id]/{components}/resizable-sidebar"
import { ResizableSidebar } from "../../../components/ui/resizable-sidebar";
// import { useClerk, useUser } from "@clerk/nextjs"
// import { useCombinedAuth } from "@/lib/hooks/use-combined-auth"
const useCombinedAuth = () => ({ userId: null });
import { Button } from "../../../components/ui/button";
import { AlignJustify } from "lucide-solid";
import { AgentsQuickSwitchDialog } from "../components/agents-quick-switch-dialog";
import { SubChatsQuickSwitchDialog } from "../components/subchats-quick-switch-dialog";
import { isDesktopApp } from "../../../lib/utils/platform";
import { Kbd } from "../../../components/ui/kbd";
import { cn } from "../../../lib/utils";
import { createShortcut, useKeyDownList } from "@solid-primitives/keyboard";
// Desktop mock
const useIsAdmin = () => false;

type CmdOverlayItem = {
  id: string;
  label: string;
  subLabel?: string | null;
  isActive?: boolean;
};

function CmdKeymapOverlay(props: {
  open: boolean;
  sessions: CmdOverlayItem[];
  tabs: CmdOverlayItem[];
  worktrees: CmdOverlayItem[];
}) {
  const renderKeyHint = (modifiers: string[], index: number) => (
    <div class="flex items-center gap-1 text-[11px] text-muted-foreground">
      <For each={modifiers}>{(modifier) => <Kbd>{modifier}</Kbd>}</For>
      <Kbd>{index + 1}</Kbd>
    </div>
  );

  const renderSection = (title: string, items: CmdOverlayItem[], modifiers: string[], emptyLabel: string) => (
    <div class="space-y-2">
      <div class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {title}
      </div>
      <div class="space-y-1">
        <Show when={items.length > 0} fallback={
          <div class="text-xs text-muted-foreground/60 py-2">{emptyLabel}</div>
        }>
          <For each={items}>{(item, index) => (
            <div class={cn(
              "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 border border-transparent",
              item.isActive ? "bg-foreground/5 border-border/60" : "bg-muted/40"
            )}>
              <div class="min-w-0">
                <div class={cn("text-sm truncate", item.isActive ? "text-foreground" : "text-muted-foreground")}>\
                  {item.label}
                </div>
                <Show when={item.subLabel}>
                  <div class="text-xs text-muted-foreground/70 truncate">{item.subLabel}</div>
                </Show>
              </div>
              {renderKeyHint(modifiers, index())}
            </div>
          )}</For>
        </Show>
      </div>
    </div>
  );

  return (
    <Show when={props.open}>
      <Portal>
        <div class="fixed inset-0 z-[70]">
          <div class="absolute inset-0 bg-background/40 backdrop-blur-sm" />
          <div class="absolute left-1/2 top-16 w-[720px] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl border border-border/60 bg-background/90 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <div class="flex items-center justify-between px-4 pt-4">
              <div class="text-sm font-medium text-foreground">Command Navigation</div>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Hold</span>
                <Kbd>Cmd</Kbd>
                <span>then press a number</span>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              {renderSection("Worktrees", props.worktrees, ["Cmd", "Opt"], "No worktrees")}
              {renderSection("Sessions", props.sessions, ["Cmd"], "No sessions")}
              {renderSection("Tabs", props.tabs, ["Cmd", "Shift"], "No tabs")}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
// Main Component
export function AgentsContent() {
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const [, setSelectedChatIsRemote] = selectedChatIsRemoteAtom;
	const [, setChatSourceMode] = chatSourceModeAtom;
	const [chatSourceMode] = chatSourceModeAtom;
	const [selectedDraftId] = selectedDraftIdAtom;
	const [showNewChatForm] = showNewChatFormAtom;
	const [betaKanbanEnabled] = betaKanbanEnabledAtom;
	const [selectedTeamId] = selectedTeamIdAtom;
	const [selectedProject, setSelectedProject] = selectedProjectAtom;
	const [sidebarOpen, setSidebarOpen] = agentsSidebarOpenAtom;
	const [previewSidebarOpen, setPreviewSidebarOpen] = agentsPreviewSidebarOpenAtom;
	const [mobileViewMode, setMobileViewMode] = agentsMobileViewModeAtom;
	const [subChatsSidebarMode, setSubChatsSidebarMode] = agentsSubChatsSidebarModeAtom;
	const [store, setStore] = useTerminalStore();
	const terminalSidebarOpen = () => store.sidebarOpenByChatId[selectedChatId() || ""] ?? false;
	const setTerminalSidebarOpen = (open: boolean) => setStore("sidebarOpenByChatId", selectedChatId() || "", open);
	const [hasOpenedSubChatsSidebar, setHasOpenedSubChatsSidebar] = createSignal(false);
	const [wasSubChatsSidebarOpen, setWasSubChatsSidebarOpen] = createSignal(false);
	const [shouldAnimateSubChatsSidebar, setShouldAnimateSubChatsSidebar] = createSignal(subChatsSidebarMode() !== "sidebar");
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isInitialized, setIsInitialized] = createSignal(false);
	const [isFirstRenderRef, setIsFirstRenderRef] = createSignal(true);
	const [isNavigatingRef, setIsNavigatingRef] = createSignal(false);
	const [newChatFormKeyRef, setNewChatFormKeyRef] = createSignal(0);
	const isMobile = useIsMobile();
	const [isHydrated, setIsHydrated] = createSignal(false);
	const { userId } = useCombinedAuth();
	const { user } = useUser();
	const { signOut } = useClerk();
	const isAdmin = useIsAdmin();
	// Quick-switch dialog state - Agents (Opt+Ctrl+Tab)
	const [quickSwitchOpen, setQuickSwitchOpen] = agentsQuickSwitchOpenAtom;
	const [quickSwitchSelectedIndex, setQuickSwitchSelectedIndex] = agentsQuickSwitchSelectedIndexAtom;
	const [holdTimerRef, setHoldTimerRef] = createSignal<ReturnType<typeof setTimeout> | null>(null);
	const [modifierKeysHeldRef, setModifierKeysHeldRef] = createSignal(false);
	const [wasShiftPressedRef, setWasShiftPressedRef] = createSignal(false);
	const [isQuickSwitchingRef, setIsQuickSwitchingRef] = createSignal(false);
	const [frozenRecentChatsRef, setFrozenRecentChatsRef] = createSignal<any[]>([]);
	// Ctrl+Tab target preference
	const [ctrlTabTarget] = ctrlTabTargetAtom;
	// Quick-switch dialog state - Sub-chats (Ctrl+Tab)
	const [subChatQuickSwitchOpen, setSubChatQuickSwitchOpen] = subChatsQuickSwitchOpenAtom;
	const [subChatQuickSwitchSelectedIndex, setSubChatQuickSwitchSelectedIndex] = subChatsQuickSwitchSelectedIndexAtom;
	const [subChatHoldTimerRef, setSubChatHoldTimerRef] = createSignal<ReturnType<typeof setTimeout> | null>(null);
	const [subChatModifierKeysHeldRef, setSubChatModifierKeysHeldRef] = createSignal(false);
	const [subChatWasShiftPressedRef, setSubChatWasShiftPressedRef] = createSignal(false);
	const [frozenSubChatsRef, setFrozenSubChatsRef] = createSignal<SubChatMeta[]>([]);
	// Refs to avoid effect re-running when dialog state changes (prevents keyup event loss)
	const [subChatQuickSwitchOpenRef, setSubChatQuickSwitchOpenRef] = createSignal(subChatQuickSwitchOpen());
	const [subChatQuickSwitchSelectedIndexRef, setSubChatQuickSwitchSelectedIndexRef] = createSignal(subChatQuickSwitchSelectedIndex());
	const [cmdOverlayOpen, setCmdOverlayOpen] = createSignal(false);
	const [cmdOverlayHeld, setCmdOverlayHeld] = createSignal(false);
	createEffect(() => {
		setSubChatQuickSwitchOpenRef(subChatQuickSwitchOpen());
		setSubChatQuickSwitchSelectedIndexRef(subChatQuickSwitchSelectedIndex());
	});
	// Get sub-chats from store - SolidJS fine-grained reactivity handles this
	const subChatStore = useAgentSubChatStore();
	const allSubChats = subChatStore.allSubChats;
	const openSubChatIds = subChatStore.openSubChatIds;
	const activeSubChatId = subChatStore.activeSubChatId;
	const setActiveSubChat = subChatStore.setActiveSubChat;
	// Update window title when active sub-chat changes
	const activeSubChatName = createMemo(() => {
		if (!activeSubChatId) return null;
		const subChat = allSubChats.find((sc) => sc.id === activeSubChatId);
		return subChat?.name ?? null;
	});
	createEffect(() => {
		desktopRpc.window.setTitle.mutate({ title: activeSubChatName() || "1Code" });
	});
	// Fetch teams for header (desktop: no teams, stub)
	const teamsQuery = useQuery(() => ({
		queryKey: ["teams", "user"] as const,
		queryFn: () => Promise.resolve([] as any[]),
		enabled: !!selectedTeamId(),
	}));
	const teams = () => teamsQuery.data ?? [];
	const selectedTeam = () => teams()?.find((t: any) => t.id === selectedTeamId()) as any;
	// Fetch agent chats for keyboard navigation and mobile view
	const agentChatsQuery = useQuery(() => ({
		queryKey: ["chats", "list"] as const,
		queryFn: () => desktopRpc.chats.list.query(),
		enabled: !!selectedTeamId(),
	}));
	const agentChats = () => agentChatsQuery.data ?? [];
	// Fetch all projects for git info (like sidebar does) — Electrobun RPC + Solid Query
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(),
	}));
	const projects = () => projectsQuery.data;
	// Create map for quick project lookup by id
	const projectsMap = createMemo(() => {
		const projs = projects();
		if (!projs) return new Map();
		return new Map(projs.map((p) => [p.id, p]));
	});
	// Fetch current chat data for preview info
	const chatDataQuery = useQuery(() => ({
		queryKey: ["chats", "get", selectedChatId()] as const,
		queryFn: () => desktopRpc.chats.get({ id: selectedChatId()! }),
		enabled: !!selectedChatId(),
	}));
	const chatData = createMemo(() => transformAgentChatFromRpc(chatDataQuery.data));
	// Track previous chat ID for navigation after archive
	const [previousChatId, setPreviousChatId] = previousAgentChatIdAtom;
	const [prevSelectedChatIdRef, setPrevSelectedChatIdRef] = createSignal<string | null>(null);
	// Update previousChatId when selectedChatId changes
	createEffect(() => {
		// Only update if we're switching from one chat to another
		if (prevSelectedChatIdRef() && prevSelectedChatIdRef() !== selectedChatId()) {
			setPreviousChatId(prevSelectedChatIdRef());
		}
		setPrevSelectedChatIdRef(selectedChatId());
	});
	// Note: Archive mutations moved to AgentsSidebar to share undo stack with Cmd+Z
	// Track hydration
	createEffect(() => {
		setIsHydrated(true);
	});
	// On mount: read URL → set atom
	createEffect(() => {
		if (isInitialized()) return;
		setIsInitialized(true);
		const chatIdFromUrl = searchParams.get("chat");
		if (chatIdFromUrl) {
			setSelectedChatId(chatIdFromUrl);
		}
	});
	// When atom changes: update URL and increment NewChatForm key when returning to new chat view
	createEffect(() => {
		// Skip the first render - let the URL read effect set the initial value first
		// This prevents a race condition where this effect would clear the chat param
		// before the atom has been updated from the URL
		if (isFirstRenderRef()) {
			setIsFirstRenderRef(false);
			return;
		}
		const currentChatId = searchParams.get("chat");
		if (selectedChatId() !== currentChatId) {
			const url = new URL(window.location.href);
			if (selectedChatId()) {
				url.searchParams.set("chat", selectedChatId()!);
			} else {
				url.searchParams.delete("chat");
				// Increment key to force NewChatForm remount and trigger focus
				setNewChatFormKeyRef((k) => k + 1);
			}
			router.replace(url.pathname + url.search, { scroll: false });
		}
	});
	// Auto-close sidebars on mobile devices
	createEffect(() => {
		if (isMobile() && isHydrated()) {
			setSidebarOpen(false);
			setPreviewSidebarOpen(false);
		}
	});
	// On mobile: when chat is selected, switch to chat mode
	createEffect(() => {
		if (isMobile() && selectedChatId() && mobileViewMode() === "chats") {
			setMobileViewMode("chat");
		}
	});
	// On mobile: when in terminal mode, sync with terminal sidebar close
	createEffect(() => {
		if (isMobile() && mobileViewMode() === "terminal" && !terminalSidebarOpen()) {
			setMobileViewMode("chat");
		}
	});
	// On mobile: hide native traffic lights when not in "chats" mode
	// Note: Electrobun doesn't support setTrafficLightVisibility (macOS-specific)
	// Traffic lights are always visible in Electrobun windows
	createEffect(() => {
		// No-op: Electrobun doesn't support traffic light visibility control
	});
	// Get recent chats for quick-switch dialog
	// Order: current chat first (left), then previous chats by last updated
	// IMPORTANT: Only recalculate when dialog is closed to prevent flickering
	const sortedChats = () => (agentChats() ? [...agentChats()].sort((a: any, b: any) => new Date(b.updatedAt ?? b.updated_at).getTime() - new Date(a.updatedAt ?? a.updated_at).getTime()) : []);
	let recentChats: any[] = [];
	// Use frozen chats when dialog is open to prevent recalculation
	if (quickSwitchOpen() && frozenRecentChatsRef() && frozenRecentChatsRef().length > 0) {
		recentChats = frozenRecentChatsRef() ?? [];
	} else if (selectedChatId()) {
		// Put current chat first, then take next 4
		const sorted = sortedChats();
		const currentChat = sorted.find((c: any) => c.id === selectedChatId());
		const otherChats = sorted.filter((c: any) => c.id !== selectedChatId()).slice(0, 4);
		recentChats = currentChat ? [currentChat, ...otherChats] : otherChats;
	} else {
		recentChats = sortedChats().slice(0, 5);
	}
	// Keyboard navigation: Quick switch between workspaces
	// Shortcut depends on ctrlTabTarget preference:
	// - "workspaces" (default): Ctrl+Tab switches workspaces
	// - "agents": Opt+Ctrl+Tab switches workspaces
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Determine shortcut based on preference
			const isCtrlTabOnly = e.ctrlKey && e.key === "Tab" && !e.altKey && !e.metaKey;
			const isOptCtrlTab = e.altKey && e.ctrlKey && e.key === "Tab" && !e.metaKey;
			// Workspace switch: Ctrl+Tab by default, or Opt+Ctrl+Tab when ctrlTabTarget is "agents"
			const isWorkspaceSwitchShortcut = ctrlTabTarget() === "workspaces" ? isCtrlTabOnly : isOptCtrlTab;
			if (isWorkspaceSwitchShortcut) {
				e.preventDefault();
					setWasShiftPressedRef(e.shiftKey);
				if (recentChats.length === 0) return;
				// If dialog is open, navigate through chats
				if (quickSwitchOpen()) {
					let nextIndex: number;
					if (e.shiftKey) {
						// Shift + Tab = Previous
						nextIndex = quickSwitchSelectedIndex() - 1;
						if (nextIndex < 0) {
							nextIndex = (frozenRecentChatsRef()?.length ?? 1) - 1;
						}
					} else {
						// Tab = Next
						nextIndex = (quickSwitchSelectedIndex() + 1) % (frozenRecentChatsRef()?.length ?? 1);
					}
					setQuickSwitchSelectedIndex(nextIndex);
					return;
				}
				// If dialog is not open yet, start hold timer
				if (!quickSwitchOpen() && !holdTimerRef()) {
					setModifierKeysHeldRef(true);
					// Freeze current recentChats snapshot for this dialog session
					setFrozenRecentChatsRef([...recentChats]);
					// Start timer to show dialog after 30ms (almost instant)
					setHoldTimerRef(setTimeout(() => {
						// Clear timer ref AFTER it fires - this is critical for close detection
						setHoldTimerRef(null);
						if (modifierKeysHeldRef()) {
							// Show dialog
							setQuickSwitchOpen(true);
							// Current chat is always at index 0 (left), select next chat (index 1)
							// For Shift+Tab, select last chat
							if (wasShiftPressedRef()) {
								// Shift: go to last chat
								setQuickSwitchSelectedIndex((frozenRecentChatsRef()?.length ?? 1) - 1);
							} else {
								// Tab: go to next chat (index 1), or wrap to 0 if only one chat
								setQuickSwitchSelectedIndex((frozenRecentChatsRef()?.length ?? 1) > 1 ? 1 : 0);
							}
						}
					}, 30));
					return;
				}
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			// ESC to close dialog without navigating
			if (e.key === "Escape" && quickSwitchOpen()) {
				e.preventDefault();
				setModifierKeysHeldRef(false);
				setIsQuickSwitchingRef(false);
				if (holdTimerRef()) {
					clearTimeout(holdTimerRef()!);
					setHoldTimerRef(null);
				}
				setQuickSwitchOpen(false);
				setQuickSwitchSelectedIndex(0);
				return;
			}
			// When modifier key is released
			// For workspaces mode (Ctrl+Tab only): react to Control release
			// For agents mode (Opt+Ctrl+Tab): react to Alt or Control release
			const isRelevantKeyRelease = ctrlTabTarget() === "workspaces" ? e.key === "Control" : e.key === "Alt" || e.key === "Control";
			if (isRelevantKeyRelease) {
				setModifierKeysHeldRef(false);
				// If timer is still running (quick press - dialog not shown yet)
				if (holdTimerRef()) {
					clearTimeout(holdTimerRef()!);
					setHoldTimerRef(null);
					setIsQuickSwitchingRef(false);
					// Do quick switch without showing dialog
					if (!isNavigatingRef() && agentChats() && agentChats().length > 0) {
						// Get sorted chat list
						const list = agentChats();
						const sortedChats = [...(list ?? [])].sort((a: any, b: any) => new Date(b.updatedAt ?? b.updated_at).getTime() - new Date(a.updatedAt ?? a.updated_at).getTime());
						setIsNavigatingRef(true);
						setTimeout(() => {
							setIsNavigatingRef(false);
						}, 300);
						// If no chat selected, select first one
						if (!selectedChatId()) {
							setSelectedChatId(sortedChats[0].id);
							// agentChats are local chats only, so always set isRemote to false
							setSelectedChatIsRemote(false);
							setChatSourceMode("local");
							return;
						}
						// Find current index
						const currentIndex = sortedChats.findIndex((chat) => chat.id === selectedChatId());
						if (currentIndex === -1) {
							setSelectedChatId(sortedChats[0].id);
							setSelectedChatIsRemote(false);
							setChatSourceMode("local");
							return;
						}
						// Navigate forward or backward
						let nextIndex: number;
						if (wasShiftPressedRef()) {
							nextIndex = currentIndex - 1;
							if (nextIndex < 0) {
								nextIndex = sortedChats.length - 1;
							}
						} else {
							nextIndex = currentIndex + 1;
							if (nextIndex >= sortedChats.length) {
								nextIndex = 0;
							}
						}
						setSelectedChatId(sortedChats[nextIndex].id);
						setSelectedChatIsRemote(false);
						setChatSourceMode("local");
					}
					return;
				}
				// If dialog is open, navigate to selected chat and close
				if (quickSwitchOpen()) {
					const selectedChat = frozenRecentChatsRef()?.[quickSwitchSelectedIndex()];
					if (selectedChat) {
						setSelectedChatId(selectedChat.id);
						// agentChats are local chats only
						setSelectedChatIsRemote(false);
						setChatSourceMode("local");
					}
					setQuickSwitchOpen(false);
					setQuickSwitchSelectedIndex(0);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		onCleanup(() => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			if (holdTimerRef()) {
				clearTimeout(holdTimerRef()!);
			}
		});
	});
	// Get open sub-chats for quick-switch (only tabs that are open in the selector)
	// Sorted by position in openSubChatIds, with active first
	// Limited to 5 items for quick-switch dialog
	const recentSubChats = createMemo(() => {
		if (!openSubChatIds || openSubChatIds.length === 0) return [];
		// Get sub-chat metadata for open tabs
		const openSubChats = openSubChatIds.map((id) => allSubChats.find((c) => c.id === id)).filter((c): c is SubChatMeta => c !== undefined);
		if (openSubChats.length === 0) return [];
		// Put active sub-chat first, keep rest in tab order, limit to 5
		if (activeSubChatId) {
			const activeChat = openSubChats.find((c) => c.id === activeSubChatId);
			const otherChats = openSubChats.filter((c) => c.id !== activeSubChatId).slice(0, 4);
			return activeChat ? [activeChat, ...otherChats] : openSubChats.slice(0, 5);
		}
		return openSubChats.slice(0, 5);
	});
	const cmdOverlaySessions = createMemo<CmdOverlayItem[]>(() => {
		const list = agentChats() ?? [];
		return list.slice(0, 9).map((chat: any) => {
			const projectPath = chat.projectId && projectsMap().get(chat.projectId)?.path;
			return {
				id: chat.id,
				label: chat.name ?? "Untitled session",
				subLabel: projectPath ?? chat.worktreePath ?? chat.projectPath ?? null,
				isActive: chat.id === selectedChatId(),
			};
		});
	});
	const cmdOverlayTabs = createMemo<CmdOverlayItem[]>(() => {
		if (!openSubChatIds || openSubChatIds.length === 0) return [];
		return openSubChatIds
			.slice(0, 9)
			.map((id) => {
				const subChat = allSubChats.find((entry) => entry.id === id);
				if (!subChat) return null;
				return {
					id: subChat.id,
					label: subChat.name ?? "Tab",
					subLabel: subChat.mode as string | null,
					isActive: subChat.id === activeSubChatId,
				} as CmdOverlayItem;
			})
			.filter((item): item is CmdOverlayItem => item !== null);
	});
	const cmdOverlayWorktrees = createMemo<CmdOverlayItem[]>(() => {
		const list = projects() ?? [];
		return list.slice(0, 9).map((project: any) => ({
			id: project.id,
			label: project.name ?? project.path ?? "Worktree",
			subLabel: project.path ?? null,
			isActive: project.id === selectedProject()?.id,
		}));
	});
	const selectSessionByIndex = (index: number) => {
		const target = cmdOverlaySessions()[index];
		if (!target) return;
		setSelectedChatId(target.id);
		setSelectedChatIsRemote(false);
		setChatSourceMode("local");
		setCmdOverlayOpen(false);
	};
	const selectTabByIndex = (index: number) => {
		const target = cmdOverlayTabs()[index];
		if (!target) return;
		const store = useAgentSubChatStore.getState();
		store.addToOpenSubChats(target.id);
		store.setActiveSubChat(target.id);
		setCmdOverlayOpen(false);
	};
	const selectWorktreeByIndex = (index: number) => {
		const target = cmdOverlayWorktrees()[index];
		if (!target) return;
		const project = (projects() ?? []).find((entry: any) => entry.id === target.id);
		if (!project?.id || !project.path) return;
		setSelectedProject({
			id: project.id,
			name: project.name ?? project.path,
			path: project.path,
			gitRemoteUrl: project.gitRemoteUrl ?? null,
			gitProvider: (project.gitProvider as "github" | "gitlab" | "bitbucket" | null) ?? null,
			gitOwner: project.gitOwner ?? null,
			gitRepo: project.gitRepo ?? null,
		});
		setSelectedChatId(null);
		setSelectedChatIsRemote(false);
		setChatSourceMode("local");
		setCmdOverlayOpen(false);
	};
	const pressedKeys = useKeyDownList();
	createEffect(() => {
		const hasMeta = pressedKeys().includes("META");
		if (hasMeta && !cmdOverlayHeld()) {
			setCmdOverlayHeld(true);
			setCmdOverlayOpen(true);
			return;
		}
		if (!hasMeta && cmdOverlayHeld()) {
			setCmdOverlayHeld(false);
			setCmdOverlayOpen(false);
		}
	});
	for (let index = 0; index < 9; index += 1) {
		const key = String(index + 1);
		createShortcut(["META", key], (event) => {
			if (event?.ctrlKey) return;
			selectSessionByIndex(index);
		});
		createShortcut(["META", "SHIFT", key], (event) => {
			if (event?.ctrlKey) return;
			selectTabByIndex(index);
		});
		createShortcut(["META", "ALT", key], (event) => {
			if (event?.ctrlKey) return;
			selectWorktreeByIndex(index);
		});
	}
	// Keyboard navigation: Quick switch between agents (sub-chats within workspace)
	// Shortcut depends on ctrlTabTarget preference:
	// - "workspaces" (default): Opt+Ctrl+Tab switches agents
	// - "agents": Ctrl+Tab switches agents
	// Uses refs for dialog state to avoid effect re-running and losing keyup events
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Determine shortcut based on preference
			const isCtrlTabOnly = e.ctrlKey && e.key === "Tab" && !e.altKey && !e.metaKey;
			const isOptCtrlTab = e.altKey && e.ctrlKey && e.key === "Tab" && !e.metaKey;
			// Agent switch: Opt+Ctrl+Tab by default, or Ctrl+Tab when ctrlTabTarget is "agents"
			const isAgentSwitchShortcut = ctrlTabTarget() === "agents" ? isCtrlTabOnly : isOptCtrlTab;
			if (isAgentSwitchShortcut) {
				e.preventDefault();
				setSubChatWasShiftPressedRef(e.shiftKey);
				// If dialog is open, navigate through sub-chats
				if (subChatQuickSwitchOpenRef()) {
					let nextIndex: number;
					if (e.shiftKey) {
						nextIndex = subChatQuickSwitchSelectedIndexRef() - 1;
						if (nextIndex < 0) {
							nextIndex = (frozenSubChatsRef()?.length ?? 1) - 1;
						}
					} else {
						nextIndex = (subChatQuickSwitchSelectedIndexRef() + 1) % (frozenSubChatsRef()?.length ?? 1);
					}
					setSubChatQuickSwitchSelectedIndex(nextIndex);
					return;
				}
				// If dialog is not open yet, start hold timer
				if (!subChatQuickSwitchOpenRef() && !subChatHoldTimerRef()) {
					// Get fresh data from store for snapshot
					const store = useAgentSubChatStore.getState();
					const currentOpenIds = store.openSubChatIds;
					const currentAllSubChats = store.allSubChats;
					const currentActiveId = store.activeSubChatId;
					if (currentOpenIds.length === 0) return;
					setSubChatModifierKeysHeldRef(true);
					// Build frozen snapshot from current store state
					const openSubChats = currentOpenIds.map((id) => currentAllSubChats.find((c) => c.id === id)).filter((c): c is SubChatMeta => c !== undefined);
					if (openSubChats.length === 0) return;
					// Put active sub-chat first, limit to 5
					if (currentActiveId) {
						const activeChat = openSubChats.find((c) => c.id === currentActiveId);
						const otherChats = openSubChats.filter((c) => c.id !== currentActiveId).slice(0, 4);
						setFrozenSubChatsRef(activeChat ? [activeChat, ...otherChats] : openSubChats.slice(0, 5));
					} else {
						setFrozenSubChatsRef(openSubChats.slice(0, 5));
					}
					setSubChatHoldTimerRef(setTimeout(() => {
						// Clear timer ref AFTER it fires - this is critical for close detection
						setSubChatHoldTimerRef(null);
						if (subChatModifierKeysHeldRef()) {
							// Update ref immediately so keyUp can detect dialog is open
							// (before React re-renders and updates the ref from state)
							setSubChatQuickSwitchOpenRef(true);
							setSubChatQuickSwitchOpen(true);
							if (subChatWasShiftPressedRef()) {
								setSubChatQuickSwitchSelectedIndex((frozenSubChatsRef()?.length ?? 1) - 1);
							} else {
								setSubChatQuickSwitchSelectedIndex((frozenSubChatsRef()?.length ?? 1) > 1 ? 1 : 0);
							}
						}
					}, 30));
					return;
				}
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			// ESC to close dialog without navigating
			if (e.key === "Escape" && subChatQuickSwitchOpenRef()) {
				e.preventDefault();
				setSubChatModifierKeysHeldRef(false);
				if (subChatHoldTimerRef()) {
					clearTimeout(subChatHoldTimerRef()!);
					setSubChatHoldTimerRef(null);
				}
				setSubChatQuickSwitchOpen(false);
				setSubChatQuickSwitchSelectedIndex(0);
				return;
			}
			// When modifier key is released
			// For agents mode (Ctrl+Tab): react to Control release
			// For workspaces mode (Opt+Ctrl+Tab): react to Alt or Control release
			const isRelevantKeyRelease = ctrlTabTarget() === "agents" ? e.key === "Control" : e.key === "Alt" || e.key === "Control";
			if (isRelevantKeyRelease) {
				setSubChatModifierKeysHeldRef(false);
				// If timer is still running (quick press - dialog not shown yet)
				if (subChatHoldTimerRef()) {
					clearTimeout(subChatHoldTimerRef()!);
					setSubChatHoldTimerRef(null);
					// Do quick switch without showing dialog (only between open tabs)
					const store = useAgentSubChatStore.getState();
					const currentOpenIds = store.openSubChatIds;
					const currentActiveId = store.activeSubChatId;
					if (currentOpenIds && currentOpenIds.length > 1) {
						if (!currentActiveId) {
							store.setActiveSubChat(currentOpenIds[0]);
							return;
						}
						const currentIndex = currentOpenIds.indexOf(currentActiveId);
						if (currentIndex === -1) {
							store.setActiveSubChat(currentOpenIds[0]);
							return;
						}
						let nextIndex: number;
						if (subChatWasShiftPressedRef()) {
							nextIndex = currentIndex - 1;
							if (nextIndex < 0) nextIndex = currentOpenIds.length - 1;
						} else {
							nextIndex = currentIndex + 1;
							if (nextIndex >= currentOpenIds.length) nextIndex = 0;
						}
						store.setActiveSubChat(currentOpenIds[nextIndex]);
					}
					return;
				}
				// If dialog is open, navigate to selected sub-chat and close
				if (subChatQuickSwitchOpenRef()) {
					const selectedSubChat = frozenSubChatsRef()?.[subChatQuickSwitchSelectedIndexRef()];
					if (selectedSubChat) {
						useAgentSubChatStore.getState().setActiveSubChat(selectedSubChat.id);
					}
					setSubChatQuickSwitchOpen(false);
					setSubChatQuickSwitchSelectedIndex(0);
				}
			}
		};
	window.addEventListener("keydown", handleKeyDown);
	window.addEventListener("keyup", handleKeyUp);
	onCleanup(() => {
		window.removeEventListener("keydown", handleKeyDown);
		window.removeEventListener("keyup", handleKeyUp);
		const timer = subChatHoldTimerRef();
		if (timer) {
			clearTimeout(timer);
		}
	});
	});
	// Note: Cmd+E archive hotkey is handled in AgentsSidebar to share undo stack
	const handleSignOut = async () => {
		// Electrobun mode: auth removed, just clear local state
		console.log("[SignOut] Auth removed in Electrobun mode");
		// Navigate to home or reload
		window.location.href = "/";
	};
	// Check if sub-chats data is loaded (reactive store access; subChatStore from above)
	const subChatsStoreChatId = createMemo(() => subChatStore.chatId);
	const subChatsCount = createMemo(() => subChatStore.allSubChats.length);
	// Check if sub-chats are still loading (store not yet initialized for this chat)
	const isLoadingSubChats = createMemo(() => selectedChatId() !== null && (subChatsStoreChatId() !== selectedChatId() || subChatsCount() === 0));
	// Track sub-chats sidebar open state for animation control
	// Now renders even while loading to show spinner (mobile always uses tabs)
	const isSubChatsSidebarOpen = selectedChatId() && subChatsSidebarMode() === "sidebar" && !isMobile();
	createEffect(() => {
		// When sidebar closes, reset for animation on next open
		if (!isSubChatsSidebarOpen && wasSubChatsSidebarOpen()) {
			setHasOpenedSubChatsSidebar(false);
			setShouldAnimateSubChatsSidebar(true);
		}
		setWasSubChatsSidebarOpen(!!isSubChatsSidebarOpen);
		// Mark as opened after animation completes
		if (isSubChatsSidebarOpen && !hasOpenedSubChatsSidebar()) {
			const timer = setTimeout(() => {
				setHasOpenedSubChatsSidebar(true);
				setShouldAnimateSubChatsSidebar(false);
			}, 150 + 50);
			onCleanup(() => clearTimeout(timer));
		} else if (isSubChatsSidebarOpen && hasOpenedSubChatsSidebar()) {
			setShouldAnimateSubChatsSidebar(false);
		}
	});
	// Check if chat has sandbox with port for preview
	const chatMeta = chatData()?.meta as {
		sandboxConfig?: {
			port?: number;
		};
		isQuickSetup?: boolean;
		repository?: string;
	} | undefined;
	const isQuickSetup = chatMeta?.isQuickSetup === true;
	const canShowPreview = !!(chatData()?.sandbox_id && !isQuickSetup && chatMeta?.sandboxConfig?.port);
	// Check if diff can be shown (sandbox exists)
	const canShowDiff = !!chatData()?.sandbox_id;
	// Check if terminal can be shown (worktree exists - desktop only)
	const worktreePath = (chatData() as any)?.worktreePath as string | undefined;
	const canShowTerminal = !!worktreePath;
	// Use Show for proper SolidJS reactivity (if/return doesn't re-run on signal changes)
	return (
		<Show when={isMobile()} fallback={<>
      <div class="flex h-full">
        {	/* Sub-chats sidebar - only show in sidebar mode when viewing a chat */}
		<ResizableSidebar isOpen={!!isSubChatsSidebarOpen} onClose={() => {
 setShouldAnimateSubChatsSidebar(true);
		setSubChatsSidebarMode("tabs");
	}} width={agentsSubChatsSidebarWidthAtom[0]} setWidth={agentsSubChatsSidebarWidthAtom[1]} minWidth={160} maxWidth={300} side="left" animationDuration={0} initialWidth={0} exitWidth={0} disableClickToClose={true}>
          <AgentsSubChatsSidebar onClose={() => {
		setShouldAnimateSubChatsSidebar(true);
		setSubChatsSidebarMode("tabs");
	}} isMobile={isMobile()} isSidebarOpen={sidebarOpen()} onBackToChats={() => setSidebarOpen((prev) => !prev)} isLoading={isLoadingSubChats()} agentName={chatData()?.name as string | undefined} />
        </ResizableSidebar>

        {	/* Main content */}
        <div class="flex-1 min-w-0 overflow-hidden" style={{ "min-width": "350px" }}>
	      <Show
	        when={selectedChatId()}
			keyed
	        fallback={(
	          <Show
	            when={selectedDraftId() || showNewChatForm()}
	            fallback={(
	              <Show
	                when={betaKanbanEnabled()}
	                fallback={(
	                  <div class="h-full flex flex-col relative overflow-hidden">
	                    <Show when={newChatFormKeyRef() + 1} keyed>
	                      <NewChatForm />
	                    </Show>
	                  </div>
	                )}
	              >
	                <KanbanView />
	              </Show>
	            )}
	          >
	            <div class="h-full flex flex-col relative overflow-hidden">
	              <Show when={newChatFormKeyRef() + 1} keyed>
	                <NewChatForm />
	              </Show>
	            </div>
	          </Show>
	        )}
	      >
	        {(chatId) => (
				<div class="h-full flex flex-col relative overflow-hidden">
					<ChatView chatId={chatId} isSidebarOpen={sidebarOpen()} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} selectedTeamName={selectedTeam()?.name} selectedTeamImageUrl={selectedTeam()?.image_url} />
				</div>
			)}
	      </Show>
        </div>
      </div>

      { /* Quick-switch dialog - Agents (Opt+Ctrl+Tab) */}
	      <AgentsQuickSwitchDialog isOpen={quickSwitchOpen()} chats={quickSwitchOpen() ? frozenRecentChatsRef() ?? [] : recentChats} selectedIndex={quickSwitchSelectedIndex()} projectsMap={projectsMap()} onHover={setQuickSwitchSelectedIndex} />

	      { /* Quick-switch dialog - Sub-chats (Ctrl+Tab) */}
	      <SubChatsQuickSwitchDialog isOpen={subChatQuickSwitchOpen()} subChats={subChatQuickSwitchOpen() ? frozenSubChatsRef() ?? [] : recentSubChats()} selectedIndex={subChatQuickSwitchSelectedIndex()} onHover={setSubChatQuickSwitchSelectedIndex} />

	      <CmdKeymapOverlay
	        open={cmdOverlayOpen()}
	        sessions={cmdOverlaySessions()}
	        tabs={cmdOverlayTabs()}
	        worktrees={cmdOverlayWorktrees()}
	      />

	      { /* Dev mode / Admin sandbox debugger */}
	      <Show when={(process.env.NODE_ENV === "development" || isAdmin) && chatData()?.sandbox_id}>
	        <a href={`https://codesandbox.io/p/devbox/${chatData()!.sandbox_id}`} target="_blank" rel="noopener noreferrer" class="fixed bottom-4 right-4 z-50 bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-mono opacity-70 hover:opacity-100 hover:bg-zinc-800 transition-all cursor-pointer">
	          sandbox: {chatData()!.sandbox_id as string}
	        </a>
	      </Show>
    </>}>
			{/* Mobile layout */}
			<div class="flex h-full bg-background" data-agents-page data-mobile-view>
				<Show
					when={mobileViewMode() === "chats"}
					fallback={(
						<Show
							when={mobileViewMode() === "preview" && selectedChatId() && canShowPreview}
							fallback={(
								<Show
									when={mobileViewMode() === "diff" && selectedChatId() && canShowDiff}
									fallback={(
										<Show
											when={mobileViewMode() === "terminal" && selectedChatId() && canShowTerminal}
											fallback={(
												<div class="h-full w-full flex flex-col overflow-hidden select-text" data-mobile-chat-mode>
													<Show
														when={selectedChatId()}
														keyed
														fallback={(
															<div class="h-full flex flex-col relative overflow-hidden">
																<NewChatForm isMobileFullscreen={true} onBackToChats={() => setMobileViewMode("chats")} />
															</div>
														)}
													>
														{(chatId) => (
															<ChatView
																chatId={chatId}
																isSidebarOpen={false}
																onToggleSidebar={() => {}}
																selectedTeamName={selectedTeam()?.name}
																selectedTeamImageUrl={selectedTeam()?.image_url}
																isMobileFullscreen={true}
																onBackToChats={() => {
																	setMobileViewMode("chats");
																	setSelectedChatId(null);
																}}
																onOpenPreview={canShowPreview ? () => setMobileViewMode("preview") : undefined}
																onOpenDiff={canShowDiff ? () => setMobileViewMode("diff") : undefined}
																onOpenTerminal={canShowTerminal ? () => {
																	setTerminalSidebarOpen(true);
																	setMobileViewMode("terminal");
																} : undefined}
															/>
														)}
													</Show>
												</div>
											)}
										>
											<TerminalSidebar chatId={selectedChatId()!} cwd={worktreePath!} isMobileFullscreen={true} onClose={() => setMobileViewMode("chat")} />
										</Show>
									)}
								>
									<AgentDiffView chatId={selectedChatId()!} sandboxId={chatData()!.sandbox_id as string} worktreePath={worktreePath} repository={chatMeta?.repository} showFooter={true} isMobile={true} onClose={() => setMobileViewMode("chat")} />
							</Show>
						)}
					>
						<AgentPreview chatId={selectedChatId()!} sandboxId={chatData()!.sandbox_id as string} port={chatMeta?.sandboxConfig?.port!} isMobile={true} onClose={() => setMobileViewMode("chat")} />
					</Show>
					)}
				>
					<AgentsSidebar userId={userId} clerkUser={user} onSignOut={handleSignOut} onToggleSidebar={() => {}} isMobileFullscreen={true} onChatSelect={() => setMobileViewMode("chat")} />
				</Show>
			</div>
		</Show>
	);
}
