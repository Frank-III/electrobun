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
exports.showLoginPage = showLoginPage;
exports.getWindow = getWindow;
exports.getAllWindows = getAllWindows;
exports.createWindow = createWindow;
exports.createMainWindow = createMainWindow;
var electron_1 = require("electron");
var path_1 = require("path");
var fs_1 = require("fs");
var main_1 = require("trpc-electron/main");
var routers_1 = require("../lib/trpc/routers");
var index_1 = require("../index");
var watcher_1 = require("../lib/git/watcher");
var vscode_theme_scanner_1 = require("../lib/vscode-theme-scanner");
var window_manager_1 = require("./window-manager");
// Helper to get window from IPC event
function getWindowFromEvent(event) {
    var webContents = event.sender;
    var win = electron_1.BrowserWindow.fromWebContents(webContents);
    return win && !win.isDestroyed() ? win : null;
}
// Register IPC handlers for window operations (only once)
var ipcHandlersRegistered = false;
function registerIpcHandlers() {
    var _this = this;
    if (ipcHandlersRegistered)
        return;
    ipcHandlersRegistered = true;
    // App info
    electron_1.ipcMain.handle("app:version", function () { return electron_1.app.getVersion(); });
    electron_1.ipcMain.handle("app:isPackaged", function () { return electron_1.app.isPackaged; });
    // Windows: Frame preference persistence
    electron_1.ipcMain.handle("window:set-frame-preference", function (_event, useNativeFrame) {
        try {
            var settingsPath = (0, path_1.join)(electron_1.app.getPath("userData"), "window-settings.json");
            var settingsDir = electron_1.app.getPath("userData");
            (0, fs_1.mkdirSync)(settingsDir, { recursive: true });
            (0, fs_1.writeFileSync)(settingsPath, JSON.stringify({ useNativeFrame: useNativeFrame }, null, 2));
            return true;
        }
        catch (error) {
            console.error("[Main] Failed to save frame preference:", error);
            return false;
        }
    });
    // Windows: Get current window frame state
    electron_1.ipcMain.handle("window:get-frame-state", function () {
        if (process.platform !== "win32")
            return false;
        try {
            var settingsPath = (0, path_1.join)(electron_1.app.getPath("userData"), "window-settings.json");
            if ((0, fs_1.existsSync)(settingsPath)) {
                var settings = JSON.parse((0, fs_1.readFileSync)(settingsPath, "utf-8"));
                return settings.useNativeFrame === true;
            }
            return false; // Default: frameless
        }
        catch (_a) {
            return false;
        }
    });
    // Note: Update checking is now handled by auto-updater module (lib/auto-updater.ts)
    electron_1.ipcMain.handle("app:set-badge", function (event, count) {
        var win = getWindowFromEvent(event);
        if (process.platform === "darwin") {
            electron_1.app.dock.setBadge(count ? String(count) : "");
        }
        else if (process.platform === "win32" && win) {
            // Windows: Update title with count as fallback
            if (count !== null && count > 0) {
                win.setTitle("1Code (".concat(count, ")"));
            }
            else {
                win.setTitle("1Code");
                win.setOverlayIcon(null, "");
            }
        }
    });
    // Windows: Badge overlay icon
    electron_1.ipcMain.handle("app:set-badge-icon", function (event, imageData) {
        var win = getWindowFromEvent(event);
        if (process.platform === "win32" && win) {
            if (imageData) {
                var image = electron_1.nativeImage.createFromDataURL(imageData);
                win.setOverlayIcon(image, "New messages");
            }
            else {
                win.setOverlayIcon(null, "");
            }
        }
    });
    electron_1.ipcMain.handle("app:show-notification", function (event, options) {
        try {
            var Notification_1 = require("electron").Notification;
            var iconPath = (0, path_1.join)(__dirname, "../../../build/icon.ico");
            var icon = (0, fs_1.existsSync)(iconPath) ? electron_1.nativeImage.createFromPath(iconPath) : undefined;
            var notification = new Notification_1(__assign({ title: options.title, body: options.body, icon: icon }, (process.platform === "win32" && { silent: false })));
            notification.show();
            notification.on("click", function () {
                var win = getWindowFromEvent(event);
                if (win) {
                    if (win.isMinimized())
                        win.restore();
                    win.focus();
                }
            });
        }
        catch (error) {
            console.error("[Main] Failed to show notification:", error);
        }
    });
    // API base URL for fetch requests
    electron_1.ipcMain.handle("app:get-api-base-url", function () { return (0, index_1.getBaseUrl)(); });
    // Window controls - use event.sender to identify window
    electron_1.ipcMain.handle("window:minimize", function (event) {
        var _a;
        (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.minimize();
    });
    electron_1.ipcMain.handle("window:maximize", function (event) {
        var win = getWindowFromEvent(event);
        if (win === null || win === void 0 ? void 0 : win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win === null || win === void 0 ? void 0 : win.maximize();
        }
    });
    electron_1.ipcMain.handle("window:close", function (event) {
        var _a;
        (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.close();
    });
    electron_1.ipcMain.handle("window:is-maximized", function (event) {
        var _a, _b;
        return (_b = (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.isMaximized()) !== null && _b !== void 0 ? _b : false;
    });
    electron_1.ipcMain.handle("window:toggle-fullscreen", function (event) {
        var win = getWindowFromEvent(event);
        if (win) {
            win.setFullScreen(!win.isFullScreen());
        }
    });
    electron_1.ipcMain.handle("window:is-fullscreen", function (event) {
        var _a, _b;
        return (_b = (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.isFullScreen()) !== null && _b !== void 0 ? _b : false;
    });
    // Traffic light visibility control (for hybrid native/custom approach)
    electron_1.ipcMain.handle("window:set-traffic-light-visibility", function (event, visible) {
        var win = getWindowFromEvent(event);
        if (win && process.platform === "darwin") {
            // In fullscreen, always show native traffic lights (don't let React hide them)
            if (win.isFullScreen()) {
                win.setWindowButtonVisibility(true);
            }
            else {
                win.setWindowButtonVisibility(visible);
            }
        }
    });
    // Zoom controls
    electron_1.ipcMain.handle("window:zoom-in", function (event) {
        var win = getWindowFromEvent(event);
        if (win) {
            var zoom = win.webContents.getZoomFactor();
            win.webContents.setZoomFactor(Math.min(zoom + 0.1, 3));
        }
    });
    electron_1.ipcMain.handle("window:zoom-out", function (event) {
        var win = getWindowFromEvent(event);
        if (win) {
            var zoom = win.webContents.getZoomFactor();
            win.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5));
        }
    });
    electron_1.ipcMain.handle("window:zoom-reset", function (event) {
        var _a;
        (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.webContents.setZoomFactor(1);
    });
    electron_1.ipcMain.handle("window:get-zoom", function (event) {
        var _a, _b;
        return (_b = (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.webContents.getZoomFactor()) !== null && _b !== void 0 ? _b : 1;
    });
    // New window - optionally open with specific chat/subchat
    electron_1.ipcMain.handle("window:new", function (_event, options) {
        createWindow(options);
    });
    // Set window title
    electron_1.ipcMain.handle("window:set-title", function (event, title) {
        var win = getWindowFromEvent(event);
        if (win) {
            // Show just the title, or default app name if empty
            win.setTitle(title || "1Code");
        }
    });
    // DevTools - only allowed in dev mode or when unlocked
    electron_1.ipcMain.handle("window:toggle-devtools", function (event) {
        var win = getWindowFromEvent(event);
        // Check if devtools are unlocked (or in dev mode)
        var isUnlocked = !electron_1.app.isPackaged || global.__devToolsUnlocked;
        if (win && isUnlocked) {
            win.webContents.toggleDevTools();
        }
    });
    // Unlock DevTools (hidden feature - 5 clicks on Beta tab)
    electron_1.ipcMain.handle("window:unlock-devtools", function () {
        // Mark as unlocked locally for IPC check
        ;
        global.__devToolsUnlocked = true;
        // Call the global function to rebuild menu
        if (global.__unlockDevTools) {
            ;
            global.__unlockDevTools();
        }
    });
    // Analytics
    electron_1.ipcMain.handle("analytics:set-opt-out", function (_event, optedOut) { return __awaiter(_this, void 0, void 0, function () {
        var setOptOut;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("../lib/analytics"); })];
                case 1:
                    setOptOut = (_a.sent()).setOptOut;
                    setOptOut(optedOut);
                    return [2 /*return*/];
            }
        });
    }); });
    // Shell
    electron_1.ipcMain.handle("shell:open-external", function (_event, url) {
        return electron_1.shell.openExternal(url);
    });
    // Clipboard
    electron_1.ipcMain.handle("clipboard:write", function (_event, text) {
        return electron_1.clipboard.writeText(text);
    });
    electron_1.ipcMain.handle("clipboard:read", function () { return electron_1.clipboard.readText(); });
    // Auth IPC handlers
    var validateSender = function (event) {
        var senderUrl = event.sender.getURL();
        try {
            var parsed = new URL(senderUrl);
            if (parsed.protocol === "file:")
                return true;
            var hostname_1 = parsed.hostname.toLowerCase();
            var trusted = ["21st.dev", "localhost", "127.0.0.1"];
            return trusted.some(function (h) { return hostname_1 === h || hostname_1.endsWith(".".concat(h)); });
        }
        catch (_a) {
            return false;
        }
    };
    electron_1.ipcMain.handle("auth:get-user", function (event) {
        if (!validateSender(event))
            return null;
        return (0, index_1.getAuthManager)().getUser();
    });
    electron_1.ipcMain.handle("auth:is-authenticated", function (event) {
        if (!validateSender(event))
            return false;
        return (0, index_1.getAuthManager)().isAuthenticated();
    });
    electron_1.ipcMain.handle("auth:logout", function (event) { return __awaiter(_this, void 0, void 0, function () {
        var ses, err_1, _i, _a, win;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!validateSender(event))
                        return [2 /*return*/];
                    (0, index_1.getAuthManager)().logout();
                    ses = electron_1.session.fromPartition("persist:main");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ses.cookies.remove((0, index_1.getBaseUrl)(), "x-desktop-token")];
                case 2:
                    _b.sent();
                    console.log("[Auth] Cookie cleared on logout");
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    console.error("[Auth] Failed to clear cookie:", err_1);
                    return [3 /*break*/, 4];
                case 4:
                    // Show login page in all windows
                    for (_i = 0, _a = window_manager_1.windowManager.getAll(); _i < _a.length; _i++) {
                        win = _a[_i];
                        showLoginPageInWindow(win);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.handle("auth:start-flow", function (event) {
        if (!validateSender(event))
            return;
        var win = getWindowFromEvent(event);
        (0, index_1.getAuthManager)().startAuthFlow(win);
    });
    electron_1.ipcMain.handle("auth:submit-code", function (event, code) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!validateSender(event))
                        return [2 /*return*/];
                    if (!code || typeof code !== "string") {
                        (_a = getWindowFromEvent(event)) === null || _a === void 0 ? void 0 : _a.webContents.send("auth:error", "Invalid authorization code");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, index_1.handleAuthCode)(code)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.handle("auth:update-user", function (event, updates) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateSender(event))
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, index_1.getAuthManager)().updateUser(updates)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_1 = _a.sent();
                    console.error("[Auth] Failed to update user:", error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    electron_1.ipcMain.handle("auth:get-token", function (event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!validateSender(event))
                return [2 /*return*/, null];
            return [2 /*return*/, (0, index_1.getAuthManager)().getValidToken()];
        });
    }); });
    // Signed fetch - proxies requests through main process (no CORS)
    electron_1.ipcMain.handle("api:signed-fetch", function (event, url, options) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[SignedFetch] IPC handler called with URL:", url);
                    if (!validateSender(event)) {
                        console.log("[SignedFetch] Unauthorized sender");
                        return [2 /*return*/, { ok: false, status: 403, data: null, error: "Unauthorized sender" }];
                    }
                    console.log("[SignedFetch] Sender validated OK");
                    return [4 /*yield*/, (0, index_1.getAuthManager)().getValidToken()];
                case 1:
                    token = _a.sent();
                    console.log("[SignedFetch] Token:", token ? "present" : "missing", "URL:", url);
                    if (!token) {
                        return [2 /*return*/, { ok: false, status: 401, data: null, error: "Not authenticated" }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, {
                            method: (options === null || options === void 0 ? void 0 : options.method) || "GET",
                            body: options === null || options === void 0 ? void 0 : options.body,
                            headers: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.headers), { "X-Desktop-Token": token, "Content-Type": "application/json" }),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json().catch(function () { return null; })];
                case 4:
                    data = _a.sent();
                    console.log("[SignedFetch] Response:", response.status, response.ok ? "OK" : "FAILED");
                    return [2 /*return*/, {
                            ok: response.ok,
                            status: response.status,
                            data: data,
                            error: response.ok ? null : "Request failed: ".concat(response.status),
                        }];
                case 5:
                    error_2 = _a.sent();
                    console.log("[SignedFetch] Error:", error_2);
                    return [2 /*return*/, {
                            ok: false,
                            status: 0,
                            data: null,
                            error: error_2 instanceof Error ? error_2.message : "Network error",
                        }];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    // Streaming fetch - for SSE responses (chat streaming)
    // Uses a unique stream ID to match chunks with the right request
    electron_1.ipcMain.handle("api:stream-fetch", function (event, streamId, url, options) { return __awaiter(_this, void 0, void 0, function () {
        var token, response, errorText, reader_1, error_3;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("[StreamFetch] Starting stream:", streamId, url);
                    if (!validateSender(event)) {
                        console.log("[StreamFetch] Unauthorized sender");
                        return [2 /*return*/, { ok: false, status: 403, error: "Unauthorized sender" }];
                    }
                    return [4 /*yield*/, (0, index_1.getAuthManager)().getValidToken()];
                case 1:
                    token = _b.sent();
                    if (!token) {
                        return [2 /*return*/, { ok: false, status: 401, error: "Not authenticated" }];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, fetch(url, {
                            method: (options === null || options === void 0 ? void 0 : options.method) || "POST",
                            body: options === null || options === void 0 ? void 0 : options.body,
                            headers: __assign(__assign({}, options === null || options === void 0 ? void 0 : options.headers), { "X-Desktop-Token": token, "Content-Type": "application/json" }),
                        })];
                case 3:
                    response = _b.sent();
                    console.log("[StreamFetch] Response:", response.status, response.ok);
                    if (!!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.text().catch(function () { return "Unknown error"; })];
                case 4:
                    errorText = _b.sent();
                    return [2 /*return*/, { ok: false, status: response.status, error: errorText }];
                case 5:
                    reader_1 = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
                    if (!reader_1) {
                        return [2 /*return*/, { ok: false, status: 500, error: "No response body" }];
                    }
                    // Send chunks asynchronously
                    ;
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, done, value, err_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 4, , 5]);
                                    _b.label = 1;
                                case 1:
                                    if (!true) return [3 /*break*/, 3];
                                    return [4 /*yield*/, reader_1.read()];
                                case 2:
                                    _a = _b.sent(), done = _a.done, value = _a.value;
                                    if (done) {
                                        event.sender.send("stream:".concat(streamId, ":done"));
                                        return [3 /*break*/, 3];
                                    }
                                    // Send chunk to renderer
                                    event.sender.send("stream:".concat(streamId, ":chunk"), value);
                                    return [3 /*break*/, 1];
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    err_2 = _b.sent();
                                    console.error("[StreamFetch] Stream error:", err_2);
                                    event.sender.send("stream:".concat(streamId, ":error"), err_2 instanceof Error ? err_2.message : "Stream error");
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })();
                    return [2 /*return*/, { ok: true, status: response.status }];
                case 6:
                    error_3 = _b.sent();
                    console.error("[StreamFetch] Fetch error:", error_3);
                    return [2 /*return*/, {
                            ok: false,
                            status: 0,
                            error: error_3 instanceof Error ? error_3.message : "Network error",
                        }];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    // Register git watcher IPC handlers
    (0, watcher_1.registerGitWatcherIPC)();
    // Register VS Code theme scanner IPC handlers
    (0, vscode_theme_scanner_1.registerThemeScannerIPC)();
}
/**
 * Show login page in a specific window
 */
function showLoginPageInWindow(window) {
    console.log("[Main] Showing login page in window", window.id);
    // In dev mode, login.html is in src/renderer, not out/renderer
    if (process.env.ELECTRON_RENDERER_URL) {
        // Dev mode: load from source directory
        var loginPath = (0, path_1.join)(electron_1.app.getAppPath(), "src/renderer/login.html");
        console.log("[Main] Loading login from:", loginPath);
        window.loadFile(loginPath);
    }
    else {
        // Production: load from built output
        window.loadFile((0, path_1.join)(__dirname, "../renderer/login.html"));
    }
}
/**
 * Show login page in the focused window (or first window)
 */
function showLoginPage() {
    var win = window_manager_1.windowManager.getFocused() || window_manager_1.windowManager.getAll()[0];
    if (!win)
        return;
    showLoginPageInWindow(win);
}
// Singleton IPC handler (prevents duplicate handlers on macOS window recreation)
var ipcHandler = null;
/**
 * Get the focused window reference
 * Used by tRPC procedures that need window access
 */
function getWindow() {
    return window_manager_1.windowManager.getFocused();
}
/**
 * Get all windows
 */
function getAllWindows() {
    return window_manager_1.windowManager.getAll();
}
/**
 * Read window frame preference from settings file (Windows only)
 * Returns true if native frame should be used, false for frameless
 */
function getUseNativeFramePreference() {
    if (process.platform !== "win32")
        return false;
    try {
        var settingsPath = (0, path_1.join)(electron_1.app.getPath("userData"), "window-settings.json");
        if ((0, fs_1.existsSync)(settingsPath)) {
            var settings = JSON.parse((0, fs_1.readFileSync)(settingsPath, "utf-8"));
            return settings.useNativeFrame === true;
        }
        return false; // Default: frameless (dark title bar)
    }
    catch (_a) {
        return false;
    }
}
/**
 * Create a new application window
 * @param options Optional settings for the new window
 * @param options.chatId Open this chat in the new window
 * @param options.subChatId Open this sub-chat in the new window
 */
function createWindow(options) {
    var _this = this;
    // Register IPC handlers before creating first window
    registerIpcHandlers();
    // Read Windows frame preference
    var useNativeFrame = getUseNativeFramePreference();
    var window = new electron_1.BrowserWindow(__assign(__assign({ width: 1400, height: 900, minWidth: 500, minHeight: 600, show: false, title: "1Code", backgroundColor: electron_1.nativeTheme.shouldUseDarkColors ? "#09090b" : "#ffffff", 
        // hiddenInset shows native traffic lights inset in the window
        // Start with traffic lights off-screen (custom ones shown in normal mode)
        // Native lights will be moved on-screen in fullscreen mode
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default", trafficLightPosition: process.platform === "darwin" ? { x: 15, y: 12 } : undefined }, (process.platform === "win32" && {
        frame: useNativeFrame,
        autoHideMenuBar: true,
    })), { webPreferences: {
            preload: (0, path_1.join)(__dirname, "../preload/index.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Required for electron-trpc
            webSecurity: true,
            partition: "persist:main", // Use persistent session for cookies
        } }));
    // Register window with manager and get stable ID for localStorage namespacing
    var stableWindowId = window_manager_1.windowManager.register(window);
    console.log("[Main] Created window ".concat(window.id, " with stable ID \"").concat(stableWindowId, "\" (total: ").concat(window_manager_1.windowManager.count(), ")"));
    // Setup tRPC IPC handler (singleton pattern)
    if (ipcHandler) {
        // Reuse existing handler, just attach new window
        ipcHandler.attachWindow(window);
    }
    else {
        // Create new handler with context
        ipcHandler = (0, main_1.createIPCHandler)({
            router: (0, routers_1.createAppRouter)(getWindow),
            windows: [window],
            createContext: function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, ({
                            getWindow: getWindow,
                        })];
                });
            }); },
        });
    }
    // Show window when ready
    window.on("ready-to-show", function () {
        console.log("[Main] Window", window.id, "ready to show");
        // Ensure native traffic lights are visible by default (login page, loading states)
        if (process.platform === "darwin") {
            window.setWindowButtonVisibility(true);
        }
        window.show();
    });
    // Emit fullscreen change events and manage traffic lights
    window.on("enter-full-screen", function () {
        // Always show native traffic lights in fullscreen
        if (process.platform === "darwin") {
            window.setWindowButtonVisibility(true);
        }
        window.webContents.send("window:fullscreen-change", true);
    });
    window.on("leave-full-screen", function () {
        // Show native traffic lights when exiting fullscreen (TrafficLights component will manage after mount)
        if (process.platform === "darwin") {
            window.setWindowButtonVisibility(true);
        }
        window.webContents.send("window:fullscreen-change", false);
    });
    // Emit focus change events
    window.on("focus", function () {
        window.webContents.send("window:focus-change", true);
    });
    window.on("blur", function () {
        window.webContents.send("window:focus-change", false);
    });
    // Disable Cmd+R / Ctrl+R to prevent accidental page refresh
    // Users can still use Cmd+Shift+R / Ctrl+Shift+R for intentional reloads
    window.webContents.on("before-input-event", function (event, input) {
        var isMac = process.platform === "darwin";
        var modifierKey = isMac ? input.meta : input.control;
        if (modifierKey && input.key.toLowerCase() === "r" && !input.shift) {
            event.preventDefault();
        }
    });
    // Handle external links
    window.webContents.setWindowOpenHandler(function (_a) {
        var url = _a.url;
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    // Handle window close
    window.on("closed", function () {
        console.log("[Main] Window ".concat(window.id, " closed"));
        // windowManager handles cleanup via 'closed' event listener
    });
    // Load the renderer - check auth first
    var devServerUrl = process.env.ELECTRON_RENDERER_URL;
    var authManager = (0, index_1.getAuthManager)();
    console.log("[Main] ========== AUTH CHECK ==========");
    console.log("[Main] AuthManager exists:", !!authManager);
    var isAuth = authManager.isAuthenticated();
    console.log("[Main] isAuthenticated():", isAuth);
    var user = authManager.getUser();
    console.log("[Main] getUser():", user ? user.email : "null");
    console.log("[Main] ================================");
    if (isAuth) {
        console.log("[Main] ✓ User authenticated, loading app");
        // Get stable window ID from manager (assigned during register)
        // "main" for first window, "window-2", "window-3", etc. for additional windows
        var windowId_1 = window_manager_1.windowManager.getStableId(window);
        // Build URL params including optional chatId/subChatId
        var buildParams = function (params) {
            params.set("windowId", windowId_1);
            if (options === null || options === void 0 ? void 0 : options.chatId)
                params.set("chatId", options.chatId);
            if (options === null || options === void 0 ? void 0 : options.subChatId)
                params.set("subChatId", options.subChatId);
        };
        if (devServerUrl) {
            // Pass params via query for dev mode
            var url = new URL(devServerUrl);
            buildParams(url.searchParams);
            window.loadURL(url.toString());
            // Only open devtools for first window in development
            if (!electron_1.app.isPackaged && windowId_1 === "main") {
                window.webContents.openDevTools();
            }
        }
        else {
            // Pass params via hash for production (file:// URLs)
            var hashParams = new URLSearchParams();
            buildParams(hashParams);
            window.loadFile((0, path_1.join)(__dirname, "../renderer/index.html"), {
                hash: hashParams.toString(),
            });
        }
    }
    else {
        console.log("[Main] ✗ Not authenticated, showing login page");
        // In dev mode, login.html is in src/renderer
        if (devServerUrl) {
            var loginPath = (0, path_1.join)(electron_1.app.getAppPath(), "src/renderer/login.html");
            window.loadFile(loginPath);
        }
        else {
            window.loadFile((0, path_1.join)(__dirname, "../renderer/login.html"));
        }
    }
    // Ensure traffic lights are visible after page load (covers reload/Cmd+R case)
    window.webContents.on("did-finish-load", function () {
        console.log("[Main] Page finished loading in window", window.id);
        if (process.platform === "darwin") {
            window.setWindowButtonVisibility(true);
        }
    });
    window.webContents.on("did-fail-load", function (_event, errorCode, errorDescription) {
        console.error("[Main] Page failed to load in window", window.id, ":", errorCode, errorDescription);
    });
    return window;
}
/**
 * Create the main application window (alias for createWindow for backwards compatibility)
 */
function createMainWindow() {
    return createWindow();
}
