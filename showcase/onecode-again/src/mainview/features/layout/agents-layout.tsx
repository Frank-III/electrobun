import { createEffect, createSignal, createMemo, onCleanup } from "solid-js";
import { isDesktopApp } from "../../lib/utils/platform";
import { useIsMobile } from "../../lib/hooks/use-mobile";
import { agentsSidebarOpenAtom, agentsSidebarWidthAtom, agentsSettingsDialogOpenAtom, agentsSettingsDialogActiveTabAtom, isDesktopAtom, isFullscreenAtom, customHotkeysAtom, betaKanbanEnabledAtom } from "../../lib/atoms";
import { selectedAgentChatIdAtom, selectedProjectAtom, selectedDraftIdAtom, showNewChatFormAtom } from "../agents/atoms";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../lib/desktop-rpc";
import { useAgentsHotkeys } from "../agents/lib/agents-hotkeys-manager";
import { toggleSearchAtom } from "../agents/search";
import { AgentsSettingsDialog } from "../../components/dialogs/agents-settings-dialog";
import { ClaudeLoginModal } from "../../components/dialogs/claude-login-modal";
import { TooltipProvider } from "../../components/ui/tooltip";
import { ResizableSidebar } from "../../components/ui/resizable-sidebar";
import { AgentsSidebar } from "../sidebar/agents-sidebar";
import { AgentsContent } from "../agents/ui/agents-content";
import { UpdateBanner } from "../../components/update-banner";
import { WindowsTitleBar } from "../../components/windows-title-bar";
import { useUpdateChecker } from "../../lib/hooks/use-update-checker";
import { useAgentSubChatStore } from "../agents/stores/sub-chat-store";
import { QueueProcessor } from "../agents/components/queue-processor";
// ============================================================================
// Constants
// ============================================================================
const SIDEBAR_MIN_WIDTH = 160;
const SIDEBAR_MAX_WIDTH = 300;
const SIDEBAR_ANIMATION_DURATION = 0;
const SIDEBAR_CLOSE_HOTKEY = "⌘\\";
// ============================================================================
// Component
// ============================================================================
export function AgentsLayout() {
	// No useHydrateAtoms - desktop doesn't need SSR, atomWithStorage handles persistence
	const isMobile = useIsMobile();
	// Global desktop/fullscreen state - initialized here at root level
	const [isDesktop, setIsDesktop] = isDesktopAtom;
	const [, setIsFullscreen] = isFullscreenAtom;
	// Initialize isDesktop on mount
	createEffect(() => {
		setIsDesktop(isDesktopApp());
	});
	// Subscribe to fullscreen changes from Electrobun
	createEffect(() => {
		if (!isDesktop()) return;
		// Get initial fullscreen state
		desktopRpc.window.isFullscreen().then((result) => setIsFullscreen(result.isFullscreen));
		// Poll for fullscreen changes (Electrobun doesn't have fullscreen change events yet)
		const interval = setInterval(() => {
			desktopRpc.window.isFullscreen().then((result) => setIsFullscreen(result.isFullscreen));
		}, 500);
		onCleanup(() => clearInterval(interval));
	});
	// Check for updates on mount and periodically
	useUpdateChecker();
	const [sidebarOpen, setSidebarOpen] = agentsSidebarOpenAtom;
	const [sidebarWidth, setSidebarWidth] = agentsSidebarWidthAtom;
	const [settingsOpen, setSettingsOpen] = agentsSettingsDialogOpenAtom;
	const setSettingsActiveTab = agentsSettingsDialogActiveTabAtom[1];
	const [selectedChatId, setSelectedChatId] = selectedAgentChatIdAtom;
	const [selectedProject, setSelectedProject] = selectedProjectAtom;
	const setSelectedDraftId = selectedDraftIdAtom[1];
	const setShowNewChatForm = showNewChatFormAtom[1];
	const betaKanbanEnabled = betaKanbanEnabledAtom[0];
	// Fetch projects to validate selectedProject exists (Electrobun RPC + Solid Query)
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(),
	}));
	const projects = () => projectsQuery.data;
	const isLoadingProjects = () => projectsQuery.isLoading;
	// Validated project - only valid if exists in DB
	// While loading, trust localStorage value to prevent clearing on app restart
	const validatedProject = createMemo(() => {
		if (!selectedProject()) return null;
		// While loading, trust localStorage value to prevent flicker and clearing
		if (isLoadingProjects()) return selectedProject();
		// After loading, validate against DB
		const projs = projects();
		if (!projs) return null;
		const exists = projs.some((p) => p.id === selectedProject()!.id);
		return exists ? selectedProject() : null;
	});
	// Clear invalid project from storage (only after loading completes)
	createEffect(() => {
		if (selectedProject() && projects() && !isLoadingProjects() && !validatedProject()) {
			setSelectedProject(null);
		}
	});
	// Note: Traffic light visibility control is macOS-specific and not available in Electrobun
	// The traffic lights are always visible on macOS in Electrobun windows
	createEffect(() => {
		// No-op: Electrobun doesn't support setTrafficLightVisibility
		// When sidebar is open, TrafficLights component handles visibility
		if (!sidebarOpen) {
			window.desktopApi.setTrafficLightVisibility(false);
		}
	});
	const { setChatId } = useAgentSubChatStore();
	// Desktop user state
	const [desktopUser, setDesktopUser] = createSignal(null);
	// Fetch desktop user on mount
	createEffect(() => {
		async function fetchUser() {
			if (window.desktopApi?.getUser) {
				const user = await window.desktopApi.getUser();
				setDesktopUser(user);
			}
		}
		fetchUser();
	});
	// Track if this is the initial load - skip auto-open on first load to respect saved state
	const [isInitialLoad, setIsInitialLoad] = createSignal(true);
	// Auto-open sidebar when project is selected, close when no project
	// Skip on initial load to preserve user's saved sidebar preference
	createEffect(() => {
		if (!projects()) return;
		// On initial load, just mark as loaded and don't change sidebar state
		if (isInitialLoad()) {
			setIsInitialLoad(false);
			return;
		}
		// After initial load, react to project changes
		if (validatedProject()) {
			setSidebarOpen(true);
		} else {
			setSidebarOpen(false);
		}
	});
	// Handle sign out
	const handleSignOut = async () => {
		// Clear selected project and anthropic onboarding on logout
		setSelectedProject(null);
		setSelectedChatId(null);
		setAnthropicOnboardingCompleted(false);
		if (window.desktopApi?.logout) {
			await window.desktopApi.logout();
		}
	};
	// Initialize sub-chats when chat is selected
	createEffect(() => {
		if (selectedChatId) {
			setChatId(selectedChatId);
		} else {
			setChatId(null);
		}
	});
	// Chat search toggle
	const toggleChatSearch = toggleSearchAtom[1];
	// Custom hotkeys config
	const customHotkeysConfig = customHotkeysAtom[0];
	// Initialize hotkeys manager
	useAgentsHotkeys({
		setSelectedChatId,
		setSelectedDraftId,
		setShowNewChatForm,
		setSidebarOpen,
		setSettingsDialogOpen: setSettingsOpen,
		setSettingsActiveTab,
		toggleChatSearch,
		selectedChatId,
		customHotkeysConfig,
		betaKanbanEnabled
	});
	const handleCloseSidebar = () => {
		setSidebarOpen(false);
	};
	return <TooltipProvider delayDuration={300}>
      {	/* Global queue processor - handles message queues for all sub-chats */}
      <QueueProcessor />
      <AgentsSettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ClaudeLoginModal />
      <div class="flex flex-col w-full h-full relative overflow-hidden bg-background select-none">
        { /* Windows Title Bar (only shown on Windows with frameless window) */}
        <WindowsTitleBar />
        <div class="flex flex-1 overflow-hidden">
          { /* Left Sidebar (Agents) */}
          <ResizableSidebar isOpen={!isMobile && sidebarOpen} onClose={handleCloseSidebar} widthAtom={agentsSidebarWidthAtom} minWidth={SIDEBAR_MIN_WIDTH} maxWidth={SIDEBAR_MAX_WIDTH} side="left" closeHotkey={SIDEBAR_CLOSE_HOTKEY} animationDuration={SIDEBAR_ANIMATION_DURATION} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="overflow-hidden bg-background border-r" style={{ "border-right-width": "0.5px" }}>
          <AgentsSidebar desktopUser={desktopUser} onSignOut={handleSignOut} onToggleSidebar={handleCloseSidebar} />
        </ResizableSidebar>

          { /* Main Content */}
          <div class="flex-1 overflow-hidden flex flex-col min-w-0">
            <AgentsContent />
          </div>
        </div>

        { /* Update Banner */}
        <UpdateBanner />
      </div>
    </TooltipProvider>;
 }
