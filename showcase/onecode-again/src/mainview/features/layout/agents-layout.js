"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsLayout = AgentsLayout;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var platform_1 = require("../../lib/utils/platform");
var use_mobile_1 = require("../../lib/hooks/use-mobile");
var atoms_1 = require("../../lib/atoms");
var atoms_2 = require("../agents/atoms");
var trpc_1 = require("../../lib/trpc");
var agents_hotkeys_manager_1 = require("../agents/lib/agents-hotkeys-manager");
var search_1 = require("../agents/search");
var agents_settings_dialog_1 = require("../../components/dialogs/agents-settings-dialog");
var claude_login_modal_1 = require("../../components/dialogs/claude-login-modal");
var tooltip_1 = require("../../components/ui/tooltip");
var resizable_sidebar_1 = require("../../components/ui/resizable-sidebar");
var agents_sidebar_1 = require("../sidebar/agents-sidebar");
var agents_content_1 = require("../agents/ui/agents-content");
var update_banner_1 = require("../../components/update-banner");
var windows_title_bar_1 = require("../../components/windows-title-bar");
var use_update_checker_1 = require("../../lib/hooks/use-update-checker");
var sub_chat_store_1 = require("../agents/stores/sub-chat-store");
var queue_processor_1 = require("../agents/components/queue-processor");
// ============================================================================
// Constants
// ============================================================================
var SIDEBAR_MIN_WIDTH = 160;
var SIDEBAR_MAX_WIDTH = 300;
var SIDEBAR_ANIMATION_DURATION = 0;
var SIDEBAR_CLOSE_HOTKEY = "⌘\\";
// ============================================================================
// Component
// ============================================================================
function AgentsLayout() {
    var _this = this;
    // No useHydrateAtoms - desktop doesn't need SSR, atomWithStorage handles persistence
    var isMobile = (0, use_mobile_1.useIsMobile)();
    // Global desktop/fullscreen state - initialized here at root level
    var _a = (0, jotai_1.useAtom)(atoms_1.isDesktopAtom), isDesktop = _a[0], setIsDesktop = _a[1];
    var _b = (0, jotai_1.useAtom)(atoms_1.isFullscreenAtom), setIsFullscreen = _b[1];
    // Initialize isDesktop on mount
    (0, solid_js_1.createEffect)(function () {
        setIsDesktop((0, platform_1.isDesktopApp)());
    });
    // Subscribe to fullscreen changes from Electron
    (0, solid_js_1.createEffect)(function () {
        var _a, _b, _c;
        if (!isDesktop || typeof window === "undefined" || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowIsFullscreen))
            return;
        // Get initial fullscreen state
        window.desktopApi.windowIsFullscreen().then(setIsFullscreen);
        // In dev mode, HMR breaks IPC event subscriptions, so we poll instead
        var isDev = import.meta.env.DEV;
        if (isDev) {
            var interval_1 = setInterval(function () {
                var _a, _b;
                (_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowIsFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a).then(setIsFullscreen);
            }, 300);
            return function () { return clearInterval(interval_1); };
        }
        // In production, use events (more efficient)
        var unsubscribe = (_c = (_b = window.desktopApi).onFullscreenChange) === null || _c === void 0 ? void 0 : _c.call(_b, setIsFullscreen);
        return unsubscribe;
    });
    // Check for updates on mount and periodically
    (0, use_update_checker_1.useUpdateChecker)();
    var _c = (0, jotai_1.useAtom)(atoms_1.agentsSidebarOpenAtom), sidebarOpen = _c[0], setSidebarOpen = _c[1];
    var _d = (0, jotai_1.useAtom)(atoms_1.agentsSidebarWidthAtom), sidebarWidth = _d[0], setSidebarWidth = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_1.agentsSettingsDialogOpenAtom), settingsOpen = _e[0], setSettingsOpen = _e[1];
    var setSettingsActiveTab = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogActiveTabAtom);
    var _f = (0, jotai_1.useAtom)(atoms_2.selectedAgentChatIdAtom), selectedChatId = _f[0], setSelectedChatId = _f[1];
    var _g = (0, jotai_1.useAtom)(atoms_2.selectedProjectAtom), selectedProject = _g[0], setSelectedProject = _g[1];
    var setSelectedDraftId = (0, jotai_1.useSetAtom)(atoms_2.selectedDraftIdAtom);
    var setShowNewChatForm = (0, jotai_1.useSetAtom)(atoms_2.showNewChatFormAtom);
    var betaKanbanEnabled = (0, jotai_1.useAtomValue)(atoms_1.betaKanbanEnabledAtom);
    var setAnthropicOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_1.anthropicOnboardingCompletedAtom);
    // Fetch projects to validate selectedProject exists
    var _h = trpc_1.trpc.projects.list.useQuery(), projects = _h.data, isLoadingProjects = _h.isLoading;
    // Validated project - only valid if exists in DB
    // While loading, trust localStorage value to prevent clearing on app restart
    var validatedProject = (0, solid_js_1.createMemo)(function () {
        if (!selectedProject)
            return null;
        // While loading, trust localStorage value to prevent flicker and clearing
        if (isLoadingProjects)
            return selectedProject;
        // After loading, validate against DB
        if (!projects)
            return null;
        var exists = projects.some(function (p) { return p.id === selectedProject.id; });
        return exists ? selectedProject : null;
    });
    // Clear invalid project from storage (only after loading completes)
    (0, solid_js_1.createEffect)(function () {
        if (selectedProject && projects && !isLoadingProjects && !validatedProject) {
            setSelectedProject(null);
        }
    });
    // Hide native traffic lights when sidebar is closed (no traffic lights needed when sidebar is closed)
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isDesktop)
            return;
        if (typeof window === "undefined" || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setTrafficLightVisibility))
            return;
        // When sidebar is closed, hide native traffic lights
        // When sidebar is open, TrafficLights component handles visibility
        if (!sidebarOpen) {
            window.desktopApi.setTrafficLightVisibility(false);
        }
    });
    var setChatId = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.setChatId; });
    // Desktop user state
    var _j = (0, solid_js_1.createSignal)(null), desktopUser = _j[0], setDesktopUser = _j[1];
    // Fetch desktop user on mount
    (0, solid_js_1.createEffect)(function () {
        function fetchUser() {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getUser)) return [3 /*break*/, 2];
                            return [4 /*yield*/, window.desktopApi.getUser()];
                        case 1:
                            user = _b.sent();
                            setDesktopUser(user);
                            _b.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        }
        fetchUser();
    });
    // Track if this is the initial load - skip auto-open on first load to respect saved state
    var _k = (0, solid_js_1.createSignal)(true), isInitialLoadRef = _k[0], setIsInitialLoadRef = _k[1];
    // Auto-open sidebar when project is selected, close when no project
    // Skip on initial load to preserve user's saved sidebar preference
    (0, solid_js_1.createEffect)(function () {
        if (!projects)
            return;
        // On initial load, just mark as loaded and don't change sidebar state
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }
        // After initial load, react to project changes
        if (validatedProject) {
            setSidebarOpen(true);
        }
        else {
            setSidebarOpen(false);
        }
    });
    // Handle sign out
    var handleSignOut = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Clear selected project and anthropic onboarding on logout
                    setSelectedProject(null);
                    setSelectedChatId(null);
                    setAnthropicOnboardingCompleted(false);
                    if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.logout)) return [3 /*break*/, 2];
                    return [4 /*yield*/, window.desktopApi.logout()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    // Initialize sub-chats when chat is selected
    (0, solid_js_1.createEffect)(function () {
        if (selectedChatId) {
            setChatId(selectedChatId);
        }
        else {
            setChatId(null);
        }
    });
    // Chat search toggle
    var toggleChatSearch = (0, jotai_1.useSetAtom)(search_1.toggleSearchAtom);
    // Custom hotkeys config
    var customHotkeysConfig = (0, jotai_1.useAtomValue)(atoms_1.customHotkeysAtom);
    // Initialize hotkeys manager
    (0, agents_hotkeys_manager_1.useAgentsHotkeys)({
        setSelectedChatId: setSelectedChatId,
        setSelectedDraftId: setSelectedDraftId,
        setShowNewChatForm: setShowNewChatForm,
        setSidebarOpen: setSidebarOpen,
        setSettingsDialogOpen: setSettingsOpen,
        setSettingsActiveTab: setSettingsActiveTab,
        toggleChatSearch: toggleChatSearch,
        selectedChatId: selectedChatId,
        customHotkeysConfig: customHotkeysConfig,
        betaKanbanEnabled: betaKanbanEnabled
    });
    var handleCloseSidebar = function () {
        setSidebarOpen(false);
    };
    return <tooltip_1.TooltipProvider delayDuration={300}>
      {/* Global queue processor - handles message queues for all sub-chats */}
      <queue_processor_1.QueueProcessor />
      <agents_settings_dialog_1.AgentsSettingsDialog isOpen={settingsOpen} onClose={function () { return setSettingsOpen(false); }}/>
      <claude_login_modal_1.ClaudeLoginModal />
      <div class="flex flex-col w-full h-full relative overflow-hidden bg-background select-none">
        {/* Windows Title Bar (only shown on Windows with frameless window) */}
        <windows_title_bar_1.WindowsTitleBar />
        <div class="flex flex-1 overflow-hidden">
          {/* Left Sidebar (Agents) */}
          <resizable_sidebar_1.ResizableSidebar isOpen={!isMobile && sidebarOpen} onClose={handleCloseSidebar} widthAtom={atoms_1.agentsSidebarWidthAtom} minWidth={SIDEBAR_MIN_WIDTH} maxWidth={SIDEBAR_MAX_WIDTH} side="left" closeHotkey={SIDEBAR_CLOSE_HOTKEY} animationDuration={SIDEBAR_ANIMATION_DURATION} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="overflow-hidden bg-background border-r" style={{ borderRightWidth: "0.5px" }}>
          <agents_sidebar_1.AgentsSidebar desktopUser={desktopUser} onSignOut={handleSignOut} onToggleSidebar={handleCloseSidebar}/>
        </resizable_sidebar_1.ResizableSidebar>

          {/* Main Content */}
          <div class="flex-1 overflow-hidden flex flex-col min-w-0">
            <agents_content_1.AgentsContent />
          </div>
        </div>

        {/* Update Banner */}
        <update_banner_1.UpdateBanner />
      </div>
    </tooltip_1.TooltipProvider>;
}
