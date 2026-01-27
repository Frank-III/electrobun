"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsSettingsDialog = AgentsSettingsDialog;
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var icons_1 = require("../../icons");
var atoms_1 = require("../../lib/atoms");
var trpc_1 = require("../../lib/trpc");
var utils_1 = require("../../lib/utils");
var icons_2 = require("../ui/icons");
var agents_appearance_tab_1 = require("./settings-tabs/agents-appearance-tab");
var agents_beta_tab_1 = require("./settings-tabs/agents-beta-tab");
var agents_custom_agents_tab_1 = require("./settings-tabs/agents-custom-agents-tab");
var agents_debug_tab_1 = require("./settings-tabs/agents-debug-tab");
var agents_keyboard_tab_1 = require("./settings-tabs/agents-keyboard-tab");
var agents_mcp_tab_1 = require("./settings-tabs/agents-mcp-tab");
var agents_models_tab_1 = require("./settings-tabs/agents-models-tab");
var agents_preferences_tab_1 = require("./settings-tabs/agents-preferences-tab");
var agents_profile_tab_1 = require("./settings-tabs/agents-profile-tab");
var agents_project_worktree_tab_1 = require("./settings-tabs/agents-project-worktree-tab");
var agents_skills_tab_1 = require("./settings-tabs/agents-skills-tab");
// GitHub avatar icon with loading placeholder
function GitHubAvatarIcon(_a) {
    var gitOwner = _a.gitOwner, className = _a.className;
    var _b = (0, solid_js_1.createSignal)(false), isLoaded = _b[0], setIsLoaded = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), hasError = _c[0], setHasError = _c[1];
    var handleLoad = function () { return setIsLoaded(true); };
    var handleError = function () { return setHasError(true); };
    if (hasError) {
        return <lucide_solid_1.FolderOpen class={(0, utils_1.cn)("text-muted-foreground flex-shrink-0", className)}/>;
    }
    return <div class={(0, utils_1.cn)("relative flex-shrink-0", className)}>
      {/* Placeholder background while loading */}
      {!isLoaded && <div class="absolute inset-0 rounded-sm bg-muted"/>}
      <img src={"https://github.com/".concat(gitOwner, ".png?size=64")} alt={gitOwner} class={(0, utils_1.cn)("rounded-sm flex-shrink-0", className, isLoaded ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError}/>
    </div>;
}
// Hook to detect narrow screen
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
// Check if we're in development mode (use import.meta.env.DEV for Vite)
var isDevelopment = import.meta.env.DEV;
// Clicks required to unlock devtools in production
var DEVTOOLS_UNLOCK_CLICKS = 5;
// Main settings tabs
var MAIN_TABS = [
    {
        id: "profile",
        label: "Account",
        icon: icons_1.ProfileIconFilled,
        description: "Manage your account settings"
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: icons_1.EyeOpenFilledIcon,
        description: "Theme settings"
    },
    {
        id: "keyboard",
        label: "Keyboard",
        icon: icons_2.KeyboardFilledIcon,
        description: "Customize keyboard shortcuts"
    },
    {
        id: "preferences",
        label: "Preferences",
        icon: icons_1.SlidersFilledIcon,
        description: "Claude behavior settings"
    },
    {
        id: "models",
        label: "Models",
        icon: icons_2.BrainFilledIcon,
        description: "Model overrides and Claude Code auth"
    }
];
// Advanced/experimental tabs (base - without Debug)
var ADVANCED_TABS_BASE = [
    {
        id: "skills",
        label: "Skills",
        icon: icons_2.SkillIconFilled,
        description: "Custom Claude skills"
    },
    {
        id: "agents",
        label: "Custom Agents",
        icon: icons_2.CustomAgentIconFilled,
        description: "Manage custom Claude agents"
    },
    {
        id: "mcp",
        label: "MCP Servers",
        icon: icons_2.OriginalMCPIcon,
        description: "Model Context Protocol servers"
    },
    {
        id: "beta",
        label: "Beta",
        icon: icons_2.FlaskFilledIcon,
        description: "Experimental features"
    }
];
// Debug tab definition
var DEBUG_TAB = {
    id: "debug",
    label: "Debug",
    icon: icons_2.BugFilledIcon,
    description: "Test first-time user experience"
};
function TabButton(_a) {
    var tab = _a.tab, isActive = _a.isActive, onClick = _a.onClick, isNarrow = _a.isNarrow;
    var Icon = tab.icon;
    var isBeta = "beta" in tab && tab.beta;
    // Check if this is a project tab (has projectId property)
    var isProjectTab = "projectId" in tab;
    return <button onClick={onClick} class={(0, utils_1.cn)("inline-flex items-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer shadow-none w-full justify-start gap-2 text-left px-3 py-1.5 text-sm", isNarrow ? "h-12 rounded-lg bg-foreground/5 hover:bg-foreground/10" : "h-7 rounded-md", !isNarrow && isActive ? "bg-foreground/10 text-foreground font-medium hover:bg-foreground/15 hover:text-foreground" : !isNarrow ? "text-muted-foreground hover:bg-foreground/5 hover:text-foreground font-medium" : "text-foreground font-medium")}>
      <Icon class={(0, utils_1.cn)("h-4 w-4", 
        // For project tabs, always keep full opacity (especially for GitHub avatars)
        isProjectTab ? "opacity-100" : isNarrow ? "opacity-70" : isActive ? "opacity-100" : "opacity-50")}/>
      <span class="flex-1">{tab.label}</span>
      {isBeta && <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
          Beta
        </span>}
      {isNarrow && <lucide_solid_1.ChevronRight class="h-4 w-4 text-muted-foreground"/>}
    </button>;
}
function AgentsSettingsDialog(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = (0, jotai_1.useAtom)(atoms_1.agentsSettingsDialogActiveTabAtom), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_1.devToolsUnlockedAtom), devToolsUnlocked = _c[0], setDevToolsUnlocked = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), mounted = _d[0], setMounted = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), portalTarget = _e[0], setPortalTarget = _e[1];
    var isNarrowScreen = useIsNarrowScreen();
    // Beta tab click counter for unlocking devtools
    var _f = (0, solid_js_1.createSignal)(0), betaClickCountRef = _f[0], setBetaClickCountRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), betaClickTimeoutRef = _g[0], setBetaClickTimeoutRef = _g[1];
    // Get projects list for dynamic tabs
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    // Generate dynamic project tabs
    var projectTabs = (0, solid_js_1.createMemo)(function () {
        if (!projects || projects.length === 0) {
            return [];
        }
        return projects.map(function (project) { return ({
            id: "project-".concat(project.id),
            label: project.name,
            icon: project.gitOwner && project.gitProvider === "github" ? function (_a) {
                var className = _a.className;
                return <GitHubAvatarIcon gitOwner={project.gitOwner} class={className}/>;
            } : lucide_solid_1.FolderOpen,
            description: "Worktree setup for ".concat(project.name),
            projectId: project.id
        }); });
    });
    // Show debug tab if in development OR if devtools are unlocked
    var showDebugTab = isDevelopment || devToolsUnlocked;
    // Build advanced tabs with optional debug tab
    var ADVANCED_TABS = (0, solid_js_1.createMemo)(function () {
        if (showDebugTab) {
            return __spreadArray(__spreadArray([], ADVANCED_TABS_BASE, true), [DEBUG_TAB], false);
        }
        return ADVANCED_TABS_BASE;
    });
    // All tabs combined for lookups
    var ALL_TABS = (0, solid_js_1.createMemo)(function () { return __spreadArray(__spreadArray(__spreadArray([], MAIN_TABS, true), ADVANCED_TABS, true), projectTabs, true); });
    // Helper to get tab label from tab id
    var getTabLabel = function (tabId) {
        var _a, _b;
        return (_b = (_a = ALL_TABS.find(function (t) { return t.id === tabId; })) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : "Settings";
    };
    // Narrow screen: track whether we're showing tab list or content
    var _h = (0, solid_js_1.createSignal)(false), showContent = _h[0], setShowContent = _h[1];
    // Reset content view when dialog closes
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen) {
            setShowContent(false);
        }
    });
    // Handle keyboard navigation
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                if (isNarrowScreen && showContent) {
                    setShowContent(false);
                }
                else {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    // Ensure portal target only accessed on client
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
        if (typeof document !== "undefined") {
            setPortalTarget(document.body);
        }
    });
    var handleTabClick = function (tabId) {
        var _a;
        // Handle Beta tab clicks for devtools unlock
        // Works in both dev and production - the unlock just reveals the Debug tab
        if (tabId === "beta" && !devToolsUnlocked) {
            betaClickCountRef.current++;
            console.log("[Settings] Beta click ".concat(betaClickCountRef.current, "/").concat(DEVTOOLS_UNLOCK_CLICKS));
            // Reset counter after 2 seconds of no clicks
            if (betaClickTimeoutRef.current) {
                clearTimeout(betaClickTimeoutRef.current);
            }
            betaClickTimeoutRef.current = setTimeout(function () {
                betaClickCountRef.current = 0;
            }, 2e3);
            // Unlock devtools after required clicks
            if (betaClickCountRef.current >= DEVTOOLS_UNLOCK_CLICKS) {
                setDevToolsUnlocked(true);
                betaClickCountRef.current = 0;
                // Notify main process to rebuild menu with DevTools option
                (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.unlockDevTools();
                console.log("[Settings] DevTools unlocked!");
            }
        }
        setActiveTab(tabId);
        if (isNarrowScreen) {
            setShowContent(true);
        }
    };
    var renderTabContent = function () {
        // Handle dynamic project tabs
        if (activeTab.startsWith("project-")) {
            var projectId = activeTab.replace("project-", "");
            return <agents_project_worktree_tab_1.AgentsProjectWorktreeTab projectId={projectId}/>;
        }
        // Handle static tabs
        switch (activeTab) {
            case "profile": return <agents_profile_tab_1.AgentsProfileTab />;
            case "appearance": return <agents_appearance_tab_1.AgentsAppearanceTab />;
            case "keyboard": return <agents_keyboard_tab_1.AgentsKeyboardTab />;
            case "preferences": return <agents_preferences_tab_1.AgentsPreferencesTab />;
            case "models": return <agents_models_tab_1.AgentsModelsTab />;
            case "skills": return <agents_skills_tab_1.AgentsSkillsTab />;
            case "agents": return <agents_custom_agents_tab_1.AgentsCustomAgentsTab />;
            case "mcp": return <agents_mcp_tab_1.AgentsMcpTab />;
            case "beta": return <agents_beta_tab_1.AgentsBetaTab />;
            case "debug": return showDebugTab ? <agents_debug_tab_1.AgentsDebugTab /> : null;
            default: return null;
        }
    };
    var renderTabList = function () { return <div class="space-y-4 px-1">
      {/* Main tabs */}
      <div class="space-y-1">
        {MAIN_TABS.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return handleTabClick(tab.id); }} isNarrow={isNarrowScreen}/>; })}
      </div>

      {/* Separator */}
      <div class="border-t border-border/50 mx-2"/>

      {/* Advanced tabs */}
      <div class="space-y-1">
        {ADVANCED_TABS.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return handleTabClick(tab.id); }} isNarrow={isNarrowScreen}/>; })}
      </div>

      {/* Project tabs */}
      {projectTabs.length > 0 && <>
          {/* Separator */}
          <div class="border-t border-border/50 mx-2"/>

          <div class="space-y-1">
            {projectTabs.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return handleTabClick(tab.id); }} isNarrow={isNarrowScreen}/>; })}
          </div>
        </>}
    </div>; };
    if (!mounted || !portalTarget)
        return null;
    // Narrow screen: Full-screen overlay with two-screen navigation
    if (isNarrowScreen) {
        if (!isOpen)
            return null;
        return (0, web_1.createPortal)(<>
        {/* Full-screen settings panel */}
        <div class="fixed inset-0 z-[45] flex flex-col bg-background overflow-hidden select-none" role="dialog" aria-modal="true" aria-labelledby="agents-settings-dialog-title-narrow" data-modal="agents-settings" data-canvas-dialog data-agents-page>
          {/* Header */}
          <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
            {showContent && <button onClick={function () { return setShowContent(false); }} class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
                <lucide_solid_1.ChevronLeft class="h-5 w-5"/>
              </button>}
            <h2 id="agents-settings-dialog-title-narrow" class="text-lg font-semibold flex-1">
              {showContent ? getTabLabel(activeTab) : "Settings"}
            </h2>
            <button type="button" onClick={onClose} class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
              <lucide_solid_1.X class="h-4 w-4"/>
              <span class="sr-only">Close</span>
            </button>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto">
            {showContent ? <div class="bg-tl-background min-h-full">
                {renderTabContent()}
              </div> : <div class="p-4">
                {renderTabList()}
              </div>}
          </div>
        </div>
      </>, portalTarget);
    }
    // Wide screen: Centered modal with sidebar
    return (0, web_1.createPortal)(<react_1.AnimatePresence mode="wait">
      {isOpen && <>
          {/* Custom Overlay */}
          <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} class="fixed inset-0 z-40 bg-black/25" onClick={onClose} style={{ pointerEvents: isOpen ? "auto" : "none" }} data-modal="agents-settings"/>

          {/* Settings Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[45]">
            <react_1.motion.div initial={{
                scale: .95,
                opacity: 0
            }} animate={{
                scale: 1,
                opacity: 1
            }} exit={{
                scale: .95,
                opacity: 0
            }} transition={{ duration: .2 }} class="w-[90vw] h-[80vh] max-w-[900px] p-0 flex flex-col rounded-[20px] bg-background border-none bg-clip-padding shadow-2xl overflow-hidden select-none" role="dialog" aria-modal="true" aria-labelledby="agents-settings-dialog-title" data-modal="agents-settings" data-canvas-dialog data-agents-page>
              <h2 id="agents-settings-dialog-title" class="sr-only">
                Settings
              </h2>

              <div class="flex h-full p-2">
                {/* Left Sidebar - Tabs */}
                <div class="w-52 px-1 py-5 space-y-4">
                  <h2 class="text-lg font-semibold px-2 pb-3 text-foreground">
                    Settings
                  </h2>

                  {/* Main Tabs */}
                  <div class="space-y-1">
                    {MAIN_TABS.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return setActiveTab(tab.id); }}/>; })}
                  </div>

                  {/* Separator */}
                  <div class="border-t border-border/50 mx-2"/>

                  {/* Advanced Tabs */}
                  <div class="space-y-1">
                    {ADVANCED_TABS.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return setActiveTab(tab.id); }}/>; })}
                  </div>

                  {/* Project Tabs */}
                  {projectTabs.length > 0 && <>
                      {/* Separator */}
                      <div class="border-t border-border/50 mx-2"/>

                      <div class="space-y-1">
                        {projectTabs.map(function (tab) { return <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={function () { return setActiveTab(tab.id); }}/>; })}
                      </div>
                    </>}
                </div>

                {/* Right Content Area */}
                <div class="flex-1 h-full overflow-hidden">
                  <div class="flex flex-col relative h-full bg-tl-background rounded-xl w-full transition-all duration-300 overflow-y-auto">
                    {renderTabContent()}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button type="button" onClick={onClose} class="absolute appearance-none outline-none select-none top-5 right-5 rounded-full cursor-pointer flex items-center justify-center ring-offset-background focus:ring-ring bg-secondary h-7 w-7 text-foreground/70 hover:text-foreground focus:outline-hidden disabled:pointer-events-none active:scale-95 transition-all duration-200 ease-in-out z-[60] focus:outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2">
                <lucide_solid_1.X class="h-4 w-4"/>
                <span class="sr-only">Close</span>
              </button>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
