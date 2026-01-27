"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.TerminalSidebar = TerminalSidebar;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var use_theme_1 = require("../../lib/hooks/use-theme");
var atoms_1 = require("@/lib/atoms");
var react_1 = require("motion/react");
var resizable_sidebar_1 = require("@/components/ui/resizable-sidebar");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var icons_1 = require("@/components/ui/icons");
var lucide_solid_1 = require("lucide-solid");
var kbd_1 = require("@/components/ui/kbd");
var hotkeys_1 = require("@/lib/hotkeys");
var terminal_1 = require("./terminal");
var terminal_tabs_1 = require("./terminal-tabs");
var helpers_1 = require("./helpers");
var atoms_2 = require("./atoms");
var trpc_1 = require("@/lib/trpc");
// Animation constants - keep in sync with ResizableSidebar animationDuration
var SIDEBAR_ANIMATION_DURATION_SECONDS = 0;
var SIDEBAR_ANIMATION_DURATION_MS = 0;
var ANIMATION_BUFFER_MS = 0;
/**
* Generate a unique terminal ID
*/
function generateTerminalId() {
    return crypto.randomUUID().slice(0, 8);
}
/**
* Generate a paneId for TerminalManager
*/
function generatePaneId(chatId, terminalId) {
    return "".concat(chatId, ":term:").concat(terminalId);
}
/**
* Get the next terminal name based on existing terminals
*/
function getNextTerminalName(terminals) {
    var existingNumbers = terminals.map(function (t) {
        var match = t.name.match(/^Terminal (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
    }).filter(function (n) { return n > 0; });
    var maxNumber = existingNumbers.length > 0 ? Math.max.apply(Math, existingNumbers) : 0;
    return "Terminal ".concat(maxNumber + 1);
}
function TerminalSidebar(_a) {
    var chatId = _a.chatId, cwd = _a.cwd, workspaceId = _a.workspaceId, tabId = _a.tabId, initialCommands = _a.initialCommands, _b = _a.isMobileFullscreen, isMobileFullscreen = _b === void 0 ? false : _b, onClose = _a.onClose;
    // Per-chat terminal sidebar state
    var terminalSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_2.terminalSidebarOpenAtomFamily)(chatId); });
    var _c = (0, jotai_1.useAtom)(terminalSidebarAtom), isOpen = _c[0], setIsOpen = _c[1];
    var _d = (0, jotai_1.useAtom)(atoms_2.terminalsAtom), allTerminals = _d[0], setAllTerminals = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_2.activeTerminalIdAtom), allActiveIds = _e[0], setAllActiveIds = _e[1];
    var terminalCwds = (0, jotai_1.useAtomValue)(atoms_2.terminalCwdAtom);
    // Theme detection for terminal background
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var isDark = resolvedTheme() === "dark";
    // Resolved hotkey for tooltip
    var toggleTerminalHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-terminal");
    var fullThemeData = (0, jotai_1.useAtomValue)(atoms_1.fullThemeDataAtom);
    var terminalBg = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
        // Use VS Code theme terminal background if available
        if ((_a = fullThemeData === null || fullThemeData === void 0 ? void 0 : fullThemeData.colors) === null || _a === void 0 ? void 0 : _a["terminal.background"]) {
            return fullThemeData.colors["terminal.background"];
        }
        if ((_b = fullThemeData === null || fullThemeData === void 0 ? void 0 : fullThemeData.colors) === null || _b === void 0 ? void 0 : _b["editor.background"]) {
            return fullThemeData.colors["editor.background"];
        }
        return (0, helpers_1.getDefaultTerminalBg)(isDark);
    });
    // Get terminals for this chat
    var terminals = (0, solid_js_1.createMemo)(function () { return allTerminals[chatId] || []; });
    // Get active terminal ID for this chat
    var activeTerminalId = (0, solid_js_1.createMemo)(function () { return allActiveIds[chatId] || null; });
    // Get the active terminal instance
    var activeTerminal = (0, solid_js_1.createMemo)(function () { return terminals.find(function (t) { return t.id === activeTerminalId; }) || null; });
    // tRPC mutation for killing terminal sessions
    var killMutation = trpc_1.trpc.terminal.kill.useMutation();
    // Refs to avoid callback recreation
    var _f = (0, solid_js_1.createSignal)(chatId), chatIdRef = _f[0], setChatIdRef = _f[1];
    chatIdRef.current = chatId;
    var _g = (0, solid_js_1.createSignal)(terminals), terminalsRef = _g[0], setTerminalsRef = _g[1];
    terminalsRef.current = terminals;
    var _h = (0, solid_js_1.createSignal)(activeTerminalId), activeTerminalIdRef = _h[0], setActiveTerminalIdRef = _h[1];
    activeTerminalIdRef.current = activeTerminalId;
    // Create a new terminal - stable callback
    var createTerminal = function () {
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        var id = generateTerminalId();
        var paneId = generatePaneId(currentChatId, id);
        var name = getNextTerminalName(currentTerminals);
        var newTerminal = {
            id: id,
            paneId: paneId,
            name: name,
            createdAt: Date.now()
        };
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = __spreadArray(__spreadArray([], prev[currentChatId] || [], true), [newTerminal], false), _a)));
        });
        // Set as active
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    // Select a terminal - stable callback
    var selectTerminal = function (id) {
        var currentChatId = chatIdRef.current;
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    // Close a terminal - stable callback
    var closeTerminal = function (id) {
        var _a;
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        var currentActiveId = activeTerminalIdRef.current;
        var terminal = currentTerminals.find(function (t) { return t.id === id; });
        if (!terminal)
            return;
        // Kill the session on the backend
        killMutation.mutate({ paneId: terminal.paneId });
        // Remove from state
        var newTerminals = currentTerminals.filter(function (t) { return t.id !== id; });
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = newTerminals, _a)));
        });
        // If we closed the active terminal, switch to another
        if (currentActiveId === id) {
            var newActive_1 = ((_a = newTerminals[newTerminals.length - 1]) === null || _a === void 0 ? void 0 : _a.id) || null;
            setAllActiveIds(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = newActive_1, _a)));
            });
        }
    };
    // Rename a terminal - stable callback
    var renameTerminal = function (id, name) {
        var currentChatId = chatIdRef.current;
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = (prev[currentChatId] || []).map(function (t) { return t.id === id ? __assign(__assign({}, t), { name: name }) : t; }), _a)));
        });
    };
    // Close other terminals - stable callback
    var closeOtherTerminals = function (id) {
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        // Kill all terminals except the one with the given id
        currentTerminals.forEach(function (terminal) {
            if (terminal.id !== id) {
                killMutation.mutate({ paneId: terminal.paneId });
            }
        });
        // Keep only the terminal with the given id
        var remainingTerminal = currentTerminals.find(function (t) { return t.id === id; });
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = remainingTerminal ? [remainingTerminal] : [], _a)));
        });
        // Set the remaining terminal as active
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    // Close terminals to the right - stable callback
    var closeTerminalsToRight = function (id) {
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        var index = currentTerminals.findIndex(function (t) { return t.id === id; });
        if (index === -1)
            return;
        // Kill terminals to the right
        var terminalsToClose = currentTerminals.slice(index + 1);
        terminalsToClose.forEach(function (terminal) {
            killMutation.mutate({ paneId: terminal.paneId });
        });
        // Keep only terminals up to and including the one with the given id
        var remainingTerminals = currentTerminals.slice(0, index + 1);
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = remainingTerminals, _a)));
        });
        // If active terminal was closed, switch to the last remaining one
        var currentActiveId = activeTerminalIdRef.current;
        if (currentActiveId && !remainingTerminals.find(function (t) { return t.id === currentActiveId; })) {
            setAllActiveIds(function (prev) {
                var _a;
                var _b;
                return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = ((_b = remainingTerminals[remainingTerminals.length - 1]) === null || _b === void 0 ? void 0 : _b.id) || null, _a)));
            });
        }
    };
    // Close sidebar callback - stable
    var closeSidebar = function () {
        setIsOpen(false);
    };
    // Delay terminal rendering until animation completes to avoid xterm.js sizing issues
    var _j = (0, solid_js_1.createSignal)(false), canRenderTerminal = _j[0], setCanRenderTerminal = _j[1];
    var _k = (0, solid_js_1.createSignal)(false), wasOpenRef = _k[0], setWasOpenRef = _k[1];
    (0, solid_js_1.createEffect)(function () {
        if (isOpen && !wasOpenRef.current) {
            // Sidebar just opened - delay terminal render until animation completes
            setCanRenderTerminal(false);
            var timer_1 = setTimeout(function () {
                setCanRenderTerminal(true);
            }, SIDEBAR_ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS);
            wasOpenRef.current = true;
            return function () { return clearTimeout(timer_1); };
        }
        else if (!isOpen) {
            // Sidebar closed - reset state
            wasOpenRef.current = false;
            setCanRenderTerminal(false);
        }
    });
    // Auto-create first terminal when sidebar opens and no terminals exist
    (0, solid_js_1.createEffect)(function () {
        if (isOpen && terminals.length === 0) {
            createTerminal();
        }
    });
    // Keyboard shortcut: Cmd+J to toggle terminal sidebar
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey && e.code === "KeyJ") {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(function (prev) { return !prev; });
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Handle mobile close - also close the sidebar atom to prevent re-opening as desktop sidebar
    var handleMobileClose = function () {
        setIsOpen(false);
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    // Mobile fullscreen layout
    if (isMobileFullscreen) {
        return <div class="flex flex-col h-full w-full bg-background">
        {/* Mobile header with back button and tabs */}
        <div class="flex items-center gap-1.5 px-2 py-2 flex-shrink-0 border-b" style={{
                backgroundColor: terminalBg,
                WebkitAppRegion: "drag",
                borderBottomWidth: "0.5px"
            }}>
          {/* Back button */}
          <button_1.Button variant="ghost" size="icon" onClick={handleMobileClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="Back to chat" style={{ WebkitAppRegion: "no-drag" }}>
            <lucide_solid_1.AlignJustify class="h-4 w-4"/>
          </button_1.Button>

          {/* Terminal Tabs - directly after back button, inherits drag from parent */}
          <div class="flex items-center gap-1 flex-1 min-w-0">
            {terminals.length > 0 && <terminal_tabs_1.TerminalTabs terminals={terminals} activeTerminalId={activeTerminalId} cwds={terminalCwds} initialCwd={cwd} terminalBg={terminalBg} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal}/>}
          </div>
        </div>

        {/* Terminal Content */}
        <div class="flex-1 min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: terminalBg }}>
          {activeTerminal && canRenderTerminal ? <react_1.motion.div key={activeTerminal.paneId} class="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0 }}>
              <terminal_1.Terminal paneId={activeTerminal.paneId} cwd={cwd} workspaceId={workspaceId} tabId={tabId} initialCommands={initialCommands} initialCwd={cwd}/>
            </react_1.motion.div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
              {!canRenderTerminal ? "" : "No terminal open"}
            </div>}
        </div>
      </div>;
    }
    // Desktop sidebar layout
    return <resizable_sidebar_1.ResizableSidebar isOpen={isOpen} onClose={closeSidebar} widthAtom={atoms_2.terminalSidebarWidthAtom} side="right" minWidth={300} maxWidth={800} animationDuration={SIDEBAR_ANIMATION_DURATION_SECONDS} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-background border-l" style={{
            borderLeftWidth: "0.5px",
            overflow: "hidden"
        }}>
      <div class="flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header with tabs */}
        <div class="flex items-center gap-1 pl-1 pr-2 py-1.5 flex-shrink-0" style={{ backgroundColor: terminalBg }}>
          {/* Close button - on the left */}
          <div class="flex items-center flex-shrink-0">
            <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button variant="ghost" size="icon" onClick={closeSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close terminal">
                  <icons_1.IconDoubleChevronRight class="h-4 w-4"/>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="bottom">
                Close terminal
                {toggleTerminalHotkey && <kbd_1.Kbd>{toggleTerminalHotkey}</kbd_1.Kbd>}
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
          </div>

          {/* Terminal Tabs */}
          {terminals.length > 0 && <terminal_tabs_1.TerminalTabs terminals={terminals} activeTerminalId={activeTerminalId} cwds={terminalCwds} initialCwd={cwd} terminalBg={terminalBg} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal}/>}
        </div>

        {/* Terminal Content */}
        <div class="flex-1 min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: terminalBg }}>
          {activeTerminal && canRenderTerminal ? <react_1.motion.div key={activeTerminal.paneId} class="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0 }}>
              <terminal_1.Terminal paneId={activeTerminal.paneId} cwd={cwd} workspaceId={workspaceId} tabId={tabId} initialCommands={initialCommands} initialCwd={cwd}/>
            </react_1.motion.div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
              {!canRenderTerminal ? "" : "No terminal open"}
            </div>}
        </div>
      </div>
    </resizable_sidebar_1.ResizableSidebar>;
}
