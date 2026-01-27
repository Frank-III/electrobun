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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = Terminal;
var solid_js_1 = require("solid-js");
var use_theme_1 = require("../../lib/hooks/use-theme");
var jotai_1 = require("../../lib/state/jotai");
var solid_sonner_1 = require("solid-sonner");
var trpc_1 = require("@/lib/trpc");
var atoms_1 = require("./atoms");
var atoms_2 = require("@/lib/atoms");
var helpers_1 = require("./helpers");
var config_1 = require("./config");
var parseCwd_1 = require("./parseCwd");
var commandBuffer_1 = require("./commandBuffer");
var utils_1 = require("./utils");
var TerminalSearch_1 = require("./TerminalSearch");
require("xterm/css/xterm.css");
function Terminal(_a) {
    var paneId = _a.paneId, cwd = _a.cwd, workspaceId = _a.workspaceId, tabId = _a.tabId, initialCommands = _a.initialCommands, initialCwd = _a.initialCwd;
    var _b = (0, solid_js_1.createSignal)(null), containerRef = _b[0], setContainerRef = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), xtermRef = _c[0], setXtermRef = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), fitAddonRef = _d[0], setFitAddonRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), searchAddonRef = _e[0], setSearchAddonRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), serializeAddonRef = _f[0], setSerializeAddonRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), isExitedRef = _g[0], setIsExitedRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(""), commandBufferRef = _h[0], setCommandBufferRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(false), isSearchOpen = _j[0], setIsSearchOpen = _j[1];
    var _k = (0, solid_js_1.createSignal)(initialCwd || cwd), terminalCwd = _k[0], setTerminalCwd = _k[1];
    var setGlobalCwds = (0, jotai_1.useSetAtom)(atoms_1.terminalCwdAtom);
    // Theme detection
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var isDark = resolvedTheme() === "dark";
    // VS Code theme data (if a full theme is selected)
    var fullThemeData = (0, jotai_1.useAtomValue)(atoms_2.fullThemeDataAtom);
    // Ref for terminalCwd to avoid effect re-runs when cwd changes
    var _l = (0, solid_js_1.createSignal)(terminalCwd), terminalCwdRef = _l[0], setTerminalCwdRef = _l[1];
    terminalCwdRef.current = terminalCwd;
    // Ref for paneId to use in callbacks
    var _m = (0, solid_js_1.createSignal)(paneId), paneIdRef = _m[0], setPaneIdRef = _m[1];
    paneIdRef.current = paneId;
    // Mutations
    var createOrAttachMutation = trpc_1.trpc.terminal.createOrAttach.useMutation();
    var writeMutation = trpc_1.trpc.terminal.write.useMutation();
    var resizeMutation = trpc_1.trpc.terminal.resize.useMutation();
    var detachMutation = trpc_1.trpc.terminal.detach.useMutation();
    var clearScrollbackMutation = trpc_1.trpc.terminal.clearScrollback.useMutation();
    // Refs for mutations to avoid effect re-runs
    var _o = (0, solid_js_1.createSignal)(createOrAttachMutation.mutate), createOrAttachRef = _o[0], setCreateOrAttachRef = _o[1];
    var _p = (0, solid_js_1.createSignal)(writeMutation.mutate), writeRef = _p[0], setWriteRef = _p[1];
    var _q = (0, solid_js_1.createSignal)(resizeMutation.mutate), resizeRef = _q[0], setResizeRef = _q[1];
    var _r = (0, solid_js_1.createSignal)(detachMutation.mutate), detachRef = _r[0], setDetachRef = _r[1];
    var _s = (0, solid_js_1.createSignal)(clearScrollbackMutation.mutate), clearScrollbackRef = _s[0], setClearScrollbackRef = _s[1];
    createOrAttachRef.current = createOrAttachMutation.mutate;
    writeRef.current = writeMutation.mutate;
    resizeRef.current = resizeMutation.mutate;
    detachRef.current = detachMutation.mutate;
    clearScrollbackRef.current = clearScrollbackMutation.mutate;
    // Parse terminal data for cwd (OSC 7 sequences)
    var updateCwdFromData = function (data) {
        var parsedCwd = (0, parseCwd_1.parseCwd)(data);
        if (parsedCwd !== null) {
            console.log("[Terminal] Parsed cwd from OSC-7:", parsedCwd);
            setTerminalCwd(parsedCwd);
            // Also update global atom for the tabs to show
            setGlobalCwds(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[paneIdRef.current] = parsedCwd, _a)));
            });
        }
    };
    var _t = (0, solid_js_1.createSignal)(updateCwdFromData), updateCwdRef = _t[0], setUpdateCwdRef = _t[1];
    updateCwdRef.current = updateCwdFromData;
    // Handle stream data
    var handleStreamData = function (event) {
        if (!xtermRef.current)
            return;
        if (event.type === "data" && event.data) {
            xtermRef.current.write(event.data);
            updateCwdRef.current(event.data);
        }
        else if (event.type === "exit") {
            isExitedRef.current = true;
            xtermRef.current.writeln("\r\n\r\n[Process exited with code ".concat(event.exitCode, "]"));
            xtermRef.current.writeln("[Press any key to restart]");
        }
    };
    // Subscribe to terminal output
    trpc_1.trpc.terminal.stream.useSubscription(paneId, {
        onData: handleStreamData,
        onError: function (err) {
            var _a;
            console.error("[Terminal] Stream error:", err);
            (_a = xtermRef.current) === null || _a === void 0 ? void 0 : _a.write("\r\n\u001B[31m[Connection error: ".concat(err.message, "]\u001B[0m\r\n"));
        },
        enabled: true
    });
    // Initialize terminal
    (0, solid_js_1.createEffect)(function () {
        var container = containerRef.current;
        if (!container)
            return;
        console.log("[Terminal:useEffect] MOUNT - paneId:", paneId);
        console.log("[Terminal:useEffect] Container rect:", container.getBoundingClientRect());
        var isUnmounted = false;
        // Create xterm instance
        console.log("[Terminal:useEffect] Creating terminal instance...", { isDark: isDark });
        var _a = (0, helpers_1.createTerminalInstance)(container, {
            cwd: terminalCwdRef.current || cwd,
            isDark: isDark,
            onFileLinkClick: function (path, line, column) {
                console.log("[Terminal] File link clicked:", path, line, column);
                // TODO: Open file in editor
            },
            onUrlClick: function (url) {
                console.log("[Terminal] URL clicked:", url);
                window.desktopApi.openExternal(url);
            }
        }), xterm = _a.xterm, fitAddon = _a.fitAddon, serializeAddon = _a.serializeAddon, cleanup = _a.cleanup;
        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;
        serializeAddonRef.current = serializeAddon;
        isExitedRef.current = false;
        // Lazy load search addon
        Promise.resolve().then(function () { return require("@xterm/addon-search"); }).then(function (_a) {
            var SearchAddon = _a.SearchAddon;
            if (isUnmounted || !xtermRef.current)
                return;
            var searchAddon = new SearchAddon();
            xtermRef.current.loadAddon(searchAddon);
            searchAddonRef.current = searchAddon;
        });
        // Apply serialized state from server
        var applySerializedState = function (serializedState) {
            if (serializedState) {
                xterm.write(serializedState);
            }
        };
        // Restart terminal after exit
        var restartTerminal = function () {
            isExitedRef.current = false;
            xterm.clear();
            createOrAttachRef.current({
                paneId: paneId,
                tabId: tabId,
                workspaceId: workspaceId,
                cols: xterm.cols,
                rows: xterm.rows,
                cwd: terminalCwdRef.current || cwd
            }, { onSuccess: function (result) {
                    applySerializedState(result.serializedState);
                } });
        };
        // Input handler
        var handleTerminalInput = function (data) {
            if (isExitedRef.current) {
                restartTerminal();
                return;
            }
            writeRef.current({
                paneId: paneId,
                data: data
            });
        };
        // Key handler for command buffer (tab title)
        var handleKeyPress = function (event) {
            var domEvent = event.domEvent;
            if (domEvent.key === "Enter") {
                var title = (0, commandBuffer_1.sanitizeForTitle)(commandBufferRef.current);
                if (title) { }
                commandBufferRef.current = "";
            }
            else if (domEvent.key === "Backspace") {
                commandBufferRef.current = commandBufferRef.current.slice(0, -1);
            }
            else if (domEvent.key === "c" && domEvent.ctrlKey) {
                commandBufferRef.current = "";
            }
            else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.metaKey) {
                commandBufferRef.current += domEvent.key;
            }
        };
        // Create or attach to session
        createOrAttachRef.current({
            paneId: paneId,
            tabId: tabId,
            workspaceId: workspaceId,
            cols: xterm.cols,
            rows: xterm.rows,
            cwd: initialCwd || cwd,
            initialCommands: initialCommands
        }, {
            onSuccess: function (result) {
                applySerializedState(result.serializedState);
                xterm.focus();
            },
            onError: function (err) {
                xterm.write("\u001B[31m[Failed to start terminal: ".concat(err.message, "]\u001B[0m\r\n"));
            }
        });
        // Set up handlers
        var inputDisposable = xterm.onData(handleTerminalInput);
        var keyDisposable = xterm.onKey(handleKeyPress);
        var handleClear = function () {
            xterm.clear();
            clearScrollbackRef.current({ paneId: paneId });
        };
        var handleWrite = function (data) {
            if (!isExitedRef.current) {
                writeRef.current({
                    paneId: paneId,
                    data: data
                });
            }
        };
        var cleanupKeyboard = (0, helpers_1.setupKeyboardHandler)(xterm, {
            onShiftEnter: function () { return handleWrite("\x1B\r"); },
            onClear: handleClear
        });
        var cleanupClickToMove = (0, helpers_1.setupClickToMoveCursor)(xterm, { onWrite: handleWrite });
        var cleanupFocus = (0, helpers_1.setupFocusListener)(xterm, function () {
            // TODO: Set focused pane
        });
        var cleanupResize = (0, helpers_1.setupResizeHandlers)(container, xterm, fitAddon, function (cols, rows) {
            resizeRef.current({
                paneId: paneId,
                cols: cols,
                rows: rows
            });
        });
        var cleanupPaste = (0, helpers_1.setupPasteHandler)(xterm, { onPaste: function (text) {
                commandBufferRef.current += text;
            } });
        var cleanupContextMenu = (0, helpers_1.setupContextMenuHandler)(xterm, {
            onCopy: function () {
                solid_sonner_1.toast.success("Copied to clipboard");
            },
            onPaste: function (text) {
                commandBufferRef.current += text;
            },
            onCopyError: function () {
                solid_sonner_1.toast.error("Failed to copy to clipboard");
            },
            onPasteError: function () {
                solid_sonner_1.toast.error("Failed to paste from clipboard");
            }
        });
        // Cleanup on unmount
        return function () {
            console.log("[Terminal:useEffect] UNMOUNT - paneId:", paneId);
            isUnmounted = true;
            inputDisposable.dispose();
            keyDisposable.dispose();
            cleanupKeyboard();
            cleanupClickToMove();
            cleanupFocus === null || cleanupFocus === void 0 ? void 0 : cleanupFocus();
            cleanupResize();
            cleanupPaste();
            cleanupContextMenu();
            cleanup();
            // Serialize terminal state before detaching
            console.log("[Terminal:useEffect] Serializing state before detach...");
            var serializedState = serializeAddon.serialize();
            // Detach instead of kill - keeps session alive for reattach
            detachRef.current({
                paneId: paneId,
                serializedState: serializedState
            });
            console.log("[Terminal:useEffect] Disposing xterm...");
            xterm.dispose();
            xtermRef.current = null;
            fitAddonRef.current = null;
            searchAddonRef.current = null;
            serializeAddonRef.current = null;
            console.log("[Terminal:useEffect] UNMOUNT complete");
        };
        // Note: terminalCwd is accessed via ref to avoid remounting on cwd changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });
    // Update theme when isDark changes or VS Code theme changes (without recreating terminal)
    (0, solid_js_1.createEffect)(function () {
        if (xtermRef.current) {
            var newTheme = (0, config_1.getTerminalThemeFromVSCode)(fullThemeData === null || fullThemeData === void 0 ? void 0 : fullThemeData.colors, isDark);
            xtermRef.current.options.theme = newTheme;
        }
    });
    // Keyboard shortcut for search
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.key === "f" && e.metaKey && !e.shiftKey) {
                e.preventDefault();
                setIsSearchOpen(function (prev) { return !prev; });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Drag and drop files
    var handleDragOver = function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };
    var handleDrop = function (event) {
        event.preventDefault();
        var files = Array.from(event.dataTransfer.files);
        if (files.length === 0)
            return;
        // Get file paths (Electron exposes webUtils)
        var paths = files.map(function (file) {
            var _a, _b;
            // @ts-expect-error - Electron's webUtils API
            return ((_b = (_a = window.webUtils) === null || _a === void 0 ? void 0 : _a.getPathForFile) === null || _b === void 0 ? void 0 : _b.call(_a, file)) || file.name;
        });
        var text = (0, utils_1.shellEscapePaths)(paths);
        if (!isExitedRef.current) {
            writeRef.current({
                paneId: paneId,
                data: text
            });
        }
    };
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
    return <div role="application" class="relative h-full w-full overflow-hidden" style={{ backgroundColor: terminalBg }} onDragOver={handleDragOver} onDrop={handleDrop}>
      <TerminalSearch_1.TerminalSearch searchAddon={searchAddonRef.current} isOpen={isSearchOpen} onClose={function () { return setIsSearchOpen(false); }}/>
      <div ref={containerRef} class="h-full w-full" style={{ padding: "8px" }}/>
    </div>;
}
