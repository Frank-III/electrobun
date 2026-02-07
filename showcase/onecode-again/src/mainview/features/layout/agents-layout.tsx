import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { isDesktopApp } from "../../lib/utils/platform";
import { useIsMobile } from "../../lib/hooks/use-mobile";
import { agentsSidebarOpenAtom, agentsSidebarWidthAtom, agentsSettingsDialogOpenAtom, agentsSettingsDialogActiveTabAtom, isDesktopAtom, isFullscreenAtom, customHotkeysAtom, betaKanbanEnabledAtom, anthropicOnboardingCompletedAtom } from "../../lib/atoms";
import { selectedAgentChatIdAtom, selectedProjectAtom, selectedDraftIdAtom, showNewChatFormAtom } from "../../lib/state/agents-store";
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
import { desktopRpc } from "../../lib/desktop-rpc";
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
	const { setChatId } = useAgentSubChatStore();
	// Desktop user state
	const [desktopUser, setDesktopUser] = createSignal<{ id: string; email?: string; name?: string } | null>(null);
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
	// Auto-open sidebar only when selected project identity changes.
	// Track by project id (stable scalar), not full object reference.
	// Keep initial persisted sidebar state as-is on first mount.
	createEffect(on(() => selectedProject()?.id ?? null, (projectId) => {
		const desiredOpen = !!projectId;
		if (sidebarOpen() !== desiredOpen) {
			setSidebarOpen(desiredOpen);
		}
	}, { defer: true }));
	// Handle sign out
	const handleSignOut = async () => {
		// Clear selected project and anthropic onboarding on logout
		setSelectedProject(null);
		setSelectedChatId(null);
		anthropicOnboardingCompletedAtom[1](false);
		if (window.desktopApi?.logout) {
			await window.desktopApi.logout();
		}
	};
	// Initialize sub-chats when chat is selected
	createEffect(on(() => selectedChatId() ?? null, (id, prevId) => {
		if ((id ?? null) === (prevId ?? null)) return;
		const currentStoreChatId = useAgentSubChatStore.getState().chatId;
		if ((id ?? null) === currentStoreChatId) return;
		setChatId(id ?? null);
	}));
	// Chat search toggle
	const toggleChatSearch = toggleSearchAtom;
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
      <AgentsSettingsDialog isOpen={settingsOpen()} onClose={() => setSettingsOpen(false)} />
      <ClaudeLoginModal />
      <div class="flex flex-col w-full h-full relative overflow-hidden bg-background">
        { /* Windows Title Bar (only shown on Windows with frameless window) */}
        <WindowsTitleBar />
        <div class="flex flex-1 overflow-hidden">
          { /* Left Sidebar (Agents) */}
			<ResizableSidebar isOpen={!isMobile() && sidebarOpen()} onClose={handleCloseSidebar} width={sidebarWidth} setWidth={setSidebarWidth} minWidth={SIDEBAR_MIN_WIDTH} maxWidth={SIDEBAR_MAX_WIDTH} side="left" closeHotkey={SIDEBAR_CLOSE_HOTKEY} animationDuration={SIDEBAR_ANIMATION_DURATION} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="overflow-hidden bg-background border-r" style={{ "border-right-width": "0.5px" }}>
          <AgentsSidebar desktopUser={desktopUser() as any} onSignOut={handleSignOut} onToggleSidebar={handleCloseSidebar} />
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
