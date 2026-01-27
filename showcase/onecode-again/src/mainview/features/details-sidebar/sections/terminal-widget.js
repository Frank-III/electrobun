"use client";
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
exports.TerminalWidget = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var use_theme_1 = require("../../../lib/hooks/use-theme");
var atoms_1 = require("@/lib/atoms");
var react_1 = require("motion/react");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("@/components/ui/button");
var icons_1 = require("@/components/ui/icons");
var tooltip_1 = require("@/components/ui/tooltip");
var kbd_1 = require("@/components/ui/kbd");
var hotkeys_1 = require("@/lib/hotkeys");
var terminal_1 = require("@/features/terminal/terminal");
var terminal_tabs_1 = require("@/features/terminal/terminal-tabs");
var helpers_1 = require("@/features/terminal/helpers");
var atoms_2 = require("@/features/terminal/atoms");
var trpc_1 = require("@/lib/trpc");
var utils_1 = require("@/lib/utils");
function generateTerminalId() {
    return crypto.randomUUID().slice(0, 8);
}
function generatePaneId(chatId, terminalId) {
    return "".concat(chatId, ":term:").concat(terminalId);
}
function getNextTerminalName(terminals) {
    var existingNumbers = terminals.map(function (t) {
        var match = t.name.match(/^Terminal (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
    }).filter(function (n) { return n > 0; });
    var maxNumber = existingNumbers.length > 0 ? Math.max.apply(Math, existingNumbers) : 0;
    return "Terminal ".concat(maxNumber + 1);
}
/**
* Terminal Widget for Overview Sidebar
* Combines WidgetCard header with terminal tabs and content
* Memoized to prevent re-renders when parent updates
*/
exports.TerminalWidget = memo(function TerminalWidget(_a) {
    var chatId = _a.chatId, cwd = _a.cwd, workspaceId = _a.workspaceId, onExpand = _a.onExpand;
    // Terminal state - reuse existing atoms
    var _b = (0, jotai_1.useAtom)(atoms_2.terminalsAtom), allTerminals = _b[0], setAllTerminals = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_2.activeTerminalIdAtom), allActiveIds = _c[0], setAllActiveIds = _c[1];
    var terminalCwds = (0, jotai_1.useAtomValue)(atoms_2.terminalCwdAtom);
    // Theme detection for terminal background
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var isDark = resolvedTheme() === "dark";
    var fullThemeData = (0, jotai_1.useAtomValue)(atoms_1.fullThemeDataAtom);
    // Resolved hotkey for tooltip
    var toggleTerminalHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-terminal");
    var terminalBg = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
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
    var activeTerminalId = (0, solid_js_1.createMemo)(function () { return allActiveIds[chatId] || null; });
    var activeTerminal = (0, solid_js_1.createMemo)(function () { return terminals.find(function (t) { return t.id === activeTerminalId; }) || null; });
    var killMutation = trpc_1.trpc.terminal.kill.useMutation();
    // Refs for stable callbacks
    var _d = (0, solid_js_1.createSignal)(chatId), chatIdRef = _d[0], setChatIdRef = _d[1];
    chatIdRef.current = chatId;
    var _e = (0, solid_js_1.createSignal)(terminals), terminalsRef = _e[0], setTerminalsRef = _e[1];
    terminalsRef.current = terminals;
    var _f = (0, solid_js_1.createSignal)(activeTerminalId), activeTerminalIdRef = _f[0], setActiveTerminalIdRef = _f[1];
    activeTerminalIdRef.current = activeTerminalId;
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
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    var selectTerminal = function (id) {
        var currentChatId = chatIdRef.current;
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    var closeTerminal = function (id) {
        var _a;
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        var currentActiveId = activeTerminalIdRef.current;
        var terminal = currentTerminals.find(function (t) { return t.id === id; });
        if (!terminal)
            return;
        killMutation.mutate({ paneId: terminal.paneId });
        var newTerminals = currentTerminals.filter(function (t) { return t.id !== id; });
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = newTerminals, _a)));
        });
        if (currentActiveId === id) {
            var newActive_1 = ((_a = newTerminals[newTerminals.length - 1]) === null || _a === void 0 ? void 0 : _a.id) || null;
            setAllActiveIds(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = newActive_1, _a)));
            });
        }
    };
    var renameTerminal = function (id, name) {
        var currentChatId = chatIdRef.current;
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = (prev[currentChatId] || []).map(function (t) { return t.id === id ? __assign(__assign({}, t), { name: name }) : t; }), _a)));
        });
    };
    var closeOtherTerminals = function (id) {
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        currentTerminals.forEach(function (terminal) {
            if (terminal.id !== id) {
                killMutation.mutate({ paneId: terminal.paneId });
            }
        });
        var remainingTerminal = currentTerminals.find(function (t) { return t.id === id; });
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = remainingTerminal ? [remainingTerminal] : [], _a)));
        });
        setAllActiveIds(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = id, _a)));
        });
    };
    var closeTerminalsToRight = function (id) {
        var currentChatId = chatIdRef.current;
        var currentTerminals = terminalsRef.current;
        var index = currentTerminals.findIndex(function (t) { return t.id === id; });
        if (index === -1)
            return;
        var terminalsToClose = currentTerminals.slice(index + 1);
        terminalsToClose.forEach(function (terminal) {
            killMutation.mutate({ paneId: terminal.paneId });
        });
        var remainingTerminals = currentTerminals.slice(0, index + 1);
        setAllTerminals(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = remainingTerminals, _a)));
        });
        var currentActiveId = activeTerminalIdRef.current;
        if (currentActiveId && !remainingTerminals.find(function (t) { return t.id === currentActiveId; })) {
            setAllActiveIds(function (prev) {
                var _a;
                var _b;
                return (__assign(__assign({}, prev), (_a = {}, _a[currentChatId] = ((_b = remainingTerminals[remainingTerminals.length - 1]) === null || _b === void 0 ? void 0 : _b.id) || null, _a)));
            });
        }
    };
    // Auto-create first terminal when section is rendered and no terminals exist
    (0, solid_js_1.createEffect)(function () {
        if (terminals.length === 0) {
            createTerminal();
        }
    });
    // Delay terminal rendering slightly
    var _g = (0, solid_js_1.createSignal)(false), canRenderTerminal = _g[0], setCanRenderTerminal = _g[1];
    (0, solid_js_1.createEffect)(function () {
        var timer = setTimeout(function () {
            setCanRenderTerminal(true);
        }, 50);
        return function () { return clearTimeout(timer); };
    });
    return <div class="mx-2 mb-2">
      <div class={(0, utils_1.cn)("rounded-lg border border-border/50 overflow-hidden")}>
        {/* Widget Header with Tabs - like terminal-sidebar.tsx */}
        <div class="flex items-center gap-1 pl-1 pr-2 py-1.5 select-none group" style={{ backgroundColor: terminalBg }}>
          {/* Terminal Tabs - directly without wrapper, like in terminal-sidebar.tsx */}
          {terminals.length > 0 && <terminal_tabs_1.TerminalTabs terminals={terminals} activeTerminalId={activeTerminalId} cwds={terminalCwds} initialCwd={cwd} terminalBg={terminalBg} hidePlusButton small onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal}/>}

          {/* Plus button after tabs */}
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button variant="ghost" size="icon" onClick={createTerminal} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md flex-shrink-0" aria-label="New terminal">
                <icons_1.PlusIcon class="h-3.5 w-3.5"/>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="bottom">New terminal</tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>

          {/* Expand to sidebar button */}
          {onExpand && <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button variant="ghost" size="icon" onClick={onExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label="Expand terminal">
                  <lucide_solid_1.ArrowUpRight class="h-3 w-3"/>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="left">
                Expand to sidebar
                {toggleTerminalHotkey && <kbd_1.Kbd>{toggleTerminalHotkey}</kbd_1.Kbd>}
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>}
        </div>

        {/* Terminal Content */}
        <div class="min-h-0 overflow-hidden" style={{
            backgroundColor: terminalBg,
            height: "200px"
        }}>
          {activeTerminal && canRenderTerminal ? <react_1.motion.div key={activeTerminal.paneId} class="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0 }}>
              <terminal_1.Terminal paneId={activeTerminal.paneId} cwd={cwd} workspaceId={workspaceId} initialCwd={cwd}/>
            </react_1.motion.div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
              {!canRenderTerminal ? "" : "No terminal open"}
            </div>}
        </div>
      </div>
    </div>;
});
