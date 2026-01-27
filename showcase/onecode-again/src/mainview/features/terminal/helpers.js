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
exports.getDefaultTerminalBg = getDefaultTerminalBg;
exports.createTerminalInstance = createTerminalInstance;
exports.setupKeyboardHandler = setupKeyboardHandler;
exports.setupPasteHandler = setupPasteHandler;
exports.setupFocusListener = setupFocusListener;
exports.setupResizeHandlers = setupResizeHandlers;
exports.setupClickToMoveCursor = setupClickToMoveCursor;
exports.setupContextMenuHandler = setupContextMenuHandler;
var xterm_1 = require("xterm");
var addon_fit_1 = require("@xterm/addon-fit");
var addon_webgl_1 = require("@xterm/addon-webgl");
var addon_canvas_1 = require("@xterm/addon-canvas");
var addon_serialize_1 = require("@xterm/addon-serialize");
var addon_web_links_1 = require("@xterm/addon-web-links");
var config_1 = require("./config");
var link_providers_1 = require("./link-providers");
var link_popup_1 = require("./link-providers/link-popup");
var suppressQueryResponses_1 = require("./suppressQueryResponses");
var utils_1 = require("./utils");
/**
 * Get the default terminal background color based on theme.
 */
function getDefaultTerminalBg(isDark) {
    var _a;
    if (isDark === void 0) { isDark = true; }
    var theme = isDark ? config_1.TERMINAL_THEME_DARK : config_1.TERMINAL_THEME_LIGHT;
    return (_a = theme === null || theme === void 0 ? void 0 : theme.background) !== null && _a !== void 0 ? _a : (isDark ? "#121212" : "#fafafa");
}
/**
 * Load GPU-accelerated renderer with automatic fallback.
 * Tries WebGL first, falls back to Canvas renderer if WebGL fails.
 */
function loadRenderer(xterm) {
    var renderer = null;
    console.log("[Terminal:loadRenderer] Attempting to load WebGL addon...");
    try {
        var webglAddon_1 = new addon_webgl_1.WebglAddon();
        console.log("[Terminal:loadRenderer] WebglAddon created");
        webglAddon_1.onContextLoss(function () {
            console.log("[Terminal:loadRenderer] WebGL context lost, switching to Canvas");
            webglAddon_1.dispose();
            try {
                renderer = new addon_canvas_1.CanvasAddon();
                xterm.loadAddon(renderer);
                console.log("[Terminal:loadRenderer] Canvas fallback loaded after context loss");
            }
            catch (_a) {
                console.log("[Terminal:loadRenderer] Canvas fallback failed");
            }
        });
        xterm.loadAddon(webglAddon_1);
        renderer = webglAddon_1;
        console.log("[Terminal:loadRenderer] WebGL addon loaded successfully");
    }
    catch (err) {
        console.log("[Terminal:loadRenderer] WebGL failed:", err);
        // WebGL not available, try Canvas
        try {
            renderer = new addon_canvas_1.CanvasAddon();
            xterm.loadAddon(renderer);
            console.log("[Terminal:loadRenderer] Canvas addon loaded as fallback");
        }
        catch (canvasErr) {
            console.log("[Terminal:loadRenderer] Canvas addon also failed:", canvasErr);
            // Both failed, use xterm's default renderer
        }
    }
    return {
        dispose: function () { return renderer === null || renderer === void 0 ? void 0 : renderer.dispose(); },
    };
}
/**
 * Creates and initializes an xterm instance with all addons.
 * Does: create → open → addons → fit
 * This ensures dimensions are ready before PTY creation.
 */
function createTerminalInstance(container, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var initialTheme = options.initialTheme, _b = options.isDark, isDark = _b === void 0 ? true : _b, onFileLinkClick = options.onFileLinkClick, onUrlClick = options.onUrlClick;
    // Debug: Check container dimensions
    var rect = container.getBoundingClientRect();
    console.log("[Terminal:create] Container dimensions:", {
        width: rect.width,
        height: rect.height,
        isConnected: container.isConnected,
    });
    // Use provided theme, or get theme based on isDark
    var theme = initialTheme !== null && initialTheme !== void 0 ? initialTheme : (0, config_1.getTerminalTheme)(isDark);
    var terminalOptions = __assign(__assign({}, config_1.TERMINAL_OPTIONS), { theme: theme });
    // 1. Create xterm instance
    console.log("[Terminal:create] Step 1: Creating XTerm instance");
    var xterm = new xterm_1.Terminal(terminalOptions);
    // 2. Open in DOM first
    console.log("[Terminal:create] Step 2: Opening in DOM");
    xterm.open(container);
    // Debug: Check _renderService after open
    var core = xterm._core;
    console.log("[Terminal:create] After open - _renderService exists:", !!(core === null || core === void 0 ? void 0 : core._renderService));
    // 3. Load fit addon
    console.log("[Terminal:create] Step 3: Loading FitAddon");
    var fitAddon = new addon_fit_1.FitAddon();
    xterm.loadAddon(fitAddon);
    // 4. Load serialize addon for state persistence
    console.log("[Terminal:create] Step 4: Loading SerializeAddon");
    var serializeAddon = new addon_serialize_1.SerializeAddon();
    xterm.loadAddon(serializeAddon);
    // 5. Load GPU-accelerated renderer
    console.log("[Terminal:create] Step 5: Loading renderer");
    var renderer = loadRenderer(xterm);
    // Debug: Check dimensions after renderer
    var coreAfter = xterm._core;
    console.log("[Terminal:create] After renderer - dimensions:", (_a = coreAfter === null || coreAfter === void 0 ? void 0 : coreAfter._renderService) === null || _a === void 0 ? void 0 : _a.dimensions);
    // 6. Set up query response suppression
    console.log("[Terminal:create] Step 6: Setting up query suppression");
    var cleanupQuerySuppression = (0, suppressQueryResponses_1.suppressQueryResponses)(xterm);
    // 7. Set up URL link provider using official WebLinksAddon
    if (onUrlClick) {
        console.log("[Terminal:create] Step 7: Registering WebLinksAddon");
        var webLinksAddon = new addon_web_links_1.WebLinksAddon(function (event, uri) {
            // Require Cmd+Click (Mac) or Ctrl+Click (Windows/Linux)
            if ((0, link_popup_1.isModifierPressed)(event)) {
                onUrlClick(uri);
            }
        }, {
            hover: function (event, uri) {
                (0, link_popup_1.showLinkPopup)(event, uri, onUrlClick);
            },
            leave: function () {
                (0, link_popup_1.removeLinkPopup)();
            },
        });
        xterm.loadAddon(webLinksAddon);
    }
    // 8. Set up file path link provider
    if (onFileLinkClick) {
        console.log("[Terminal:create] Step 8: Registering file path link provider");
        var filePathLinkProvider = new link_providers_1.FilePathLinkProvider(xterm, function (_event, path, line, column) {
            console.log("[Terminal:create] File path link clicked:", path, line, column);
            onFileLinkClick(path, line, column);
        });
        xterm.registerLinkProvider(filePathLinkProvider);
    }
    // 9. Fit to get actual dimensions
    console.log("[Terminal:create] Step 9: Fitting terminal");
    try {
        fitAddon.fit();
        console.log("[Terminal:create] Fit successful - cols:", xterm.cols, "rows:", xterm.rows);
    }
    catch (err) {
        console.log("[Terminal:create] Fit failed:", err);
    }
    console.log("[Terminal:create] Complete!");
    return {
        xterm: xterm,
        fitAddon: fitAddon,
        serializeAddon: serializeAddon,
        cleanup: function () {
            cleanupQuerySuppression();
            renderer.dispose();
        },
    };
}
/**
 * Setup keyboard handling for xterm including:
 * - Shift+Enter: Sends ESC+CR sequence
 * - Cmd+K: Clear terminal
 * - Ctrl+V / Cmd+V: Intercept to allow browser paste event
 *
 * Returns a cleanup function to remove the handler.
 */
function setupKeyboardHandler(xterm, options) {
    if (options === void 0) { options = {}; }
    var handler = function (event) {
        // Shift+Enter - line continuation
        var isShiftEnter = event.key === "Enter" &&
            event.shiftKey &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey;
        if (isShiftEnter) {
            if (event.type === "keydown" && options.onShiftEnter) {
                options.onShiftEnter();
            }
            return false; // Prevent xterm from processing
        }
        // Cmd+K - clear terminal (macOS)
        var isClearShortcut = event.key === "k" && event.metaKey && !event.shiftKey && !event.altKey;
        if (isClearShortcut) {
            if (event.type === "keydown" && options.onClear) {
                options.onClear();
            }
            return false; // Prevent xterm from processing
        }
        // Ctrl+V (Windows/Linux) or Cmd+V (macOS) - let Electron menu handle paste
        // Return false to prevent xterm from showing ^v character
        // The Electron menu's "paste" role will trigger a paste event on the textarea
        var isPasteShortcut = event.key === "v" &&
            !event.shiftKey &&
            !event.altKey &&
            ((0, link_popup_1.isMac)() ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey);
        if (isPasteShortcut) {
            return false; // Prevent xterm from showing ^v, let Electron menu handle it
        }
        return true; // Let xterm process the key
    };
    xterm.attachCustomKeyEventHandler(handler);
    return function () {
        xterm.attachCustomKeyEventHandler(function () { return true; });
    };
}
/**
 * Setup paste handler for xterm to ensure bracketed paste mode works correctly.
 *
 * This is required for TUI applications like vim that expect bracketed paste mode
 * to distinguish between typed and pasted content.
 *
 * Returns a cleanup function to remove the handler.
 */
function setupPasteHandler(xterm, options) {
    if (options === void 0) { options = {}; }
    var textarea = xterm.textarea;
    if (!textarea)
        return function () { };
    var handlePaste = function (event) {
        var _a, _b;
        var text = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        if (!text)
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        (_b = options.onPaste) === null || _b === void 0 ? void 0 : _b.call(options, text);
        xterm.paste(text);
    };
    textarea.addEventListener("paste", handlePaste, { capture: true });
    return function () {
        textarea.removeEventListener("paste", handlePaste, { capture: true });
    };
}
/**
 * Setup focus listener for the terminal.
 *
 * Returns a cleanup function to remove the listener.
 */
function setupFocusListener(xterm, onFocus) {
    var textarea = xterm.textarea;
    if (!textarea)
        return null;
    textarea.addEventListener("focus", onFocus);
    return function () {
        textarea.removeEventListener("focus", onFocus);
    };
}
/**
 * Setup resize handlers for the terminal container.
 *
 * Returns a cleanup function to remove the handlers.
 */
function setupResizeHandlers(container, xterm, fitAddon, onResize) {
    var debouncedHandleResize = (0, utils_1.debounce)(function () {
        try {
            fitAddon.fit();
            onResize(xterm.cols, xterm.rows);
        }
        catch (_a) {
            // Ignore resize errors
        }
    }, config_1.RESIZE_DEBOUNCE_MS);
    var resizeObserver = new ResizeObserver(debouncedHandleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", debouncedHandleResize);
    return function () {
        window.removeEventListener("resize", debouncedHandleResize);
        resizeObserver.disconnect();
        debouncedHandleResize.cancel();
    };
}
/**
 * Convert mouse event coordinates to terminal cell coordinates.
 */
function getTerminalCoordsFromEvent(xterm, event) {
    var _a, _b, _c;
    var element = xterm.element;
    if (!element)
        return null;
    var rect = element.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    // Access internal render service for cell dimensions
    var dimensions = (_b = (_a = xterm._core) === null || _a === void 0 ? void 0 : _a._renderService) === null || _b === void 0 ? void 0 : _b.dimensions;
    if (!((_c = dimensions === null || dimensions === void 0 ? void 0 : dimensions.css) === null || _c === void 0 ? void 0 : _c.cell))
        return null;
    var cellWidth = dimensions.css.cell.width;
    var cellHeight = dimensions.css.cell.height;
    if (cellWidth <= 0 || cellHeight <= 0)
        return null;
    var col = Math.max(0, Math.min(xterm.cols - 1, Math.floor(x / cellWidth)));
    var row = Math.max(0, Math.min(xterm.rows - 1, Math.floor(y / cellHeight)));
    return { col: col, row: row };
}
/**
 * Setup click-to-move cursor functionality.
 * Allows clicking on the current prompt line to move the cursor.
 *
 * Returns a cleanup function to remove the handler.
 */
function setupClickToMoveCursor(xterm, options) {
    var _a;
    var handleClick = function (event) {
        // Don't interfere with full-screen apps (vim, less, etc.)
        if (xterm.buffer.active !== xterm.buffer.normal)
            return;
        if (event.button !== 0)
            return;
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
            return;
        if (xterm.hasSelection())
            return;
        var coords = getTerminalCoordsFromEvent(xterm, event);
        if (!coords)
            return;
        var buffer = xterm.buffer.active;
        var clickBufferRow = coords.row + buffer.viewportY;
        // Only move cursor on the same line (editable prompt area)
        if (clickBufferRow !== buffer.cursorY + buffer.viewportY)
            return;
        var delta = coords.col - buffer.cursorX;
        if (delta === 0)
            return;
        // Right arrow: \x1b[C, Left arrow: \x1b[D
        var arrowKey = delta > 0 ? "\x1b[C" : "\x1b[D";
        options.onWrite(arrowKey.repeat(Math.abs(delta)));
    };
    (_a = xterm.element) === null || _a === void 0 ? void 0 : _a.addEventListener("click", handleClick);
    return function () {
        var _a;
        (_a = xterm.element) === null || _a === void 0 ? void 0 : _a.removeEventListener("click", handleClick);
    };
}
/**
 * Setup right-click context menu for terminal with copy/paste support.
 * - If text is selected: copies to clipboard
 * - If no selection: pastes from clipboard
 *
 * Returns a cleanup function to remove the handler.
 */
function setupContextMenuHandler(xterm, options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var element = xterm.element;
    if (!element) {
        return function () { }; // noop cleanup if element not available
    }
    var handleContextMenu = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var selection, err_1, text, err_2;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    event.preventDefault();
                    selection = xterm.getSelection();
                    if (!selection) return [3 /*break*/, 5];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(selection)];
                case 2:
                    _e.sent();
                    (_a = options.onCopy) === null || _a === void 0 ? void 0 : _a.call(options, selection);
                    // Clear selection after copy (optional, mimics typical terminal behavior)
                    xterm.clearSelection();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _e.sent();
                    console.warn("[Terminal] Failed to copy to clipboard:", err_1);
                    (_b = options.onCopyError) === null || _b === void 0 ? void 0 : _b.call(options, err_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 8];
                case 5:
                    _e.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, navigator.clipboard.readText()];
                case 6:
                    text = _e.sent();
                    if (text) {
                        (_c = options.onPaste) === null || _c === void 0 ? void 0 : _c.call(options, text);
                        xterm.paste(text);
                    }
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _e.sent();
                    console.warn("[Terminal] Failed to paste from clipboard:", err_2);
                    (_d = options.onPasteError) === null || _d === void 0 ? void 0 : _d.call(options, err_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    element.addEventListener("contextmenu", handleContextMenu);
    return function () {
        element.removeEventListener("contextmenu", handleContextMenu);
    };
}
