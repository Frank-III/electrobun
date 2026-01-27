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
exports.getBaseUrl = getBaseUrl;
exports.getAppUrl = getAppUrl;
exports.getAuthManager = getAuthManager;
exports.handleAuthCode = handleAuthCode;
var Sentry = require("@sentry/electron/main");
var electron_1 = require("electron");
var fs_1 = require("fs");
var http_1 = require("http");
var path_1 = require("path");
var auth_manager_1 = require("./auth-manager");
var analytics_1 = require("./lib/analytics");
var auto_updater_1 = require("./lib/auto-updater");
var db_1 = require("./lib/db");
var cli_1 = require("./lib/cli");
var watcher_1 = require("./lib/git/watcher");
var mcp_auth_1 = require("./lib/mcp-auth");
var main_1 = require("./windows/main");
var window_manager_1 = require("./windows/window-manager");
var constants_1 = require("./constants");
// Deep link protocol (must match package.json build.protocols.schemes)
// Use different protocol in dev to avoid conflicts with production app
var PROTOCOL = constants_1.IS_DEV ? "twentyfirst-agents-dev" : "twentyfirst-agents";
// Set dev mode userData path BEFORE requestSingleInstanceLock()
// This ensures dev and prod have separate instance locks
if (constants_1.IS_DEV) {
    var join_1 = require("path").join;
    var devUserData = join_1(electron_1.app.getPath("userData"), "..", "Agents Dev");
    electron_1.app.setPath("userData", devUserData);
    console.log("[Dev] Using separate userData path:", devUserData);
}
// Initialize Sentry before app is ready (production only)
if (electron_1.app.isPackaged && !constants_1.IS_DEV) {
    var sentryDsn = import.meta.env.MAIN_VITE_SENTRY_DSN;
    if (sentryDsn) {
        try {
            Sentry.init({
                dsn: sentryDsn,
            });
            console.log("[App] Sentry initialized");
        }
        catch (error) {
            console.warn("[App] Failed to initialize Sentry:", error);
        }
    }
    else {
        console.log("[App] Skipping Sentry initialization (no DSN configured)");
    }
}
else {
    console.log("[App] Skipping Sentry initialization (dev mode)");
}
// URL configuration (exported for use in other modules)
// In packaged app, ALWAYS use production URL to prevent localhost leaking into releases
// In dev mode, allow override via MAIN_VITE_API_URL env variable
function getBaseUrl() {
    if (electron_1.app.isPackaged) {
        return "https://21st.dev";
    }
    return import.meta.env.MAIN_VITE_API_URL || "https://21st.dev";
}
function getAppUrl() {
    return process.env.ELECTRON_RENDERER_URL || "https://21st.dev/agents";
}
// Auth manager singleton (use the one from auth-manager module)
var authManager;
function getAuthManager() {
    // First try to get from module, fallback to local variable for backwards compat
    return (0, auth_manager_1.getAuthManager)() || authManager;
}
// Handle auth code from deep link (exported for IPC handlers)
function handleAuthCode(code) {
    return __awaiter(this, void 0, void 0, function () {
        var authData, planData, e_1, ses, cookieError_1, windows, _i, windows_1, win, stableId, url, error_1, _a, _b, win;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("[Auth] Handling auth code:", code.slice(0, 8) + "...");
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, authManager.exchangeCode(code)];
                case 2:
                    authData = _d.sent();
                    console.log("[Auth] Success for user:", authData.user.email);
                    // Track successful authentication
                    (0, analytics_1.trackAuthCompleted)(authData.user.id, authData.user.email);
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, authManager.fetchUserPlan()];
                case 4:
                    planData = _d.sent();
                    if (planData) {
                        (0, analytics_1.setSubscriptionPlan)(planData.plan);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _d.sent();
                    console.warn("[Auth] Failed to fetch user plan for analytics:", e_1);
                    return [3 /*break*/, 6];
                case 6:
                    ses = electron_1.session.fromPartition("persist:main");
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 10, , 11]);
                    // First remove any existing cookie to avoid HttpOnly conflict
                    return [4 /*yield*/, ses.cookies.remove(getBaseUrl(), "x-desktop-token")];
                case 8:
                    // First remove any existing cookie to avoid HttpOnly conflict
                    _d.sent();
                    return [4 /*yield*/, ses.cookies.set({
                            url: getBaseUrl(),
                            name: "x-desktop-token",
                            value: authData.token,
                            expirationDate: Math.floor(new Date(authData.expiresAt).getTime() / 1000),
                            httpOnly: false,
                            secure: getBaseUrl().startsWith("https"),
                            sameSite: "lax",
                        })];
                case 9:
                    _d.sent();
                    console.log("[Auth] Desktop token cookie set");
                    return [3 /*break*/, 11];
                case 10:
                    cookieError_1 = _d.sent();
                    // Cookie setting is optional - auth data is already saved to disk
                    console.warn("[Auth] Cookie set failed (non-critical):", cookieError_1);
                    return [3 /*break*/, 11];
                case 11:
                    windows = (0, main_1.getAllWindows)();
                    for (_i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
                        win = windows_1[_i];
                        try {
                            if (win.isDestroyed())
                                continue;
                            win.webContents.send("auth:success", authData.user);
                            stableId = window_manager_1.windowManager.getStableId(win);
                            if (process.env.ELECTRON_RENDERER_URL) {
                                url = new URL(process.env.ELECTRON_RENDERER_URL);
                                url.searchParams.set("windowId", stableId);
                                win.loadURL(url.toString());
                            }
                            else {
                                // Pass window ID via hash for production
                                win.loadFile((0, path_1.join)(__dirname, "../renderer/index.html"), {
                                    hash: "windowId=".concat(stableId),
                                });
                            }
                        }
                        catch (error) {
                            // Window may have been destroyed during iteration
                            console.warn("[Auth] Failed to reload window:", error);
                        }
                    }
                    // Focus the first window
                    (_c = windows[0]) === null || _c === void 0 ? void 0 : _c.focus();
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _d.sent();
                    console.error("[Auth] Exchange failed:", error_1);
                    // Broadcast auth error to all windows (not just focused)
                    for (_a = 0, _b = (0, main_1.getAllWindows)(); _a < _b.length; _a++) {
                        win = _b[_a];
                        try {
                            if (!win.isDestroyed()) {
                                win.webContents.send("auth:error", error_1.message);
                            }
                        }
                        catch (_e) {
                            // Window destroyed during iteration
                        }
                    }
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Handle deep link
function handleDeepLink(url) {
    console.log("[DeepLink] Received:", url);
    try {
        var parsed = new URL(url);
        // Handle auth callback: twentyfirst-agents://auth?code=xxx
        if (parsed.pathname === "/auth" || parsed.host === "auth") {
            var code = parsed.searchParams.get("code");
            if (code) {
                handleAuthCode(code);
                return;
            }
        }
        // Handle MCP OAuth callback: twentyfirst-agents://mcp-oauth?code=xxx&state=yyy
        if (parsed.pathname === "/mcp-oauth" || parsed.host === "mcp-oauth") {
            var code = parsed.searchParams.get("code");
            var state = parsed.searchParams.get("state");
            if (code && state) {
                (0, mcp_auth_1.handleMcpOAuthCallback)(code, state);
                return;
            }
        }
    }
    catch (e) {
        console.error("[DeepLink] Failed to parse:", e);
    }
}
// Register protocol BEFORE app is ready
console.log("[Protocol] ========== PROTOCOL REGISTRATION ==========");
console.log("[Protocol] Protocol:", PROTOCOL);
console.log("[Protocol] Is dev mode (process.defaultApp):", process.defaultApp);
console.log("[Protocol] process.execPath:", process.execPath);
console.log("[Protocol] process.argv:", process.argv);
/**
 * Register the app as the handler for our custom protocol.
 * On macOS, this may not take effect immediately on first install -
 * Launch Services caches protocol handlers and may need time to update.
 */
function registerProtocol() {
    var success = false;
    if (process.defaultApp) {
        // Dev mode: need to pass execPath and script path
        if (process.argv.length >= 2) {
            success = electron_1.app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
                process.argv[1],
            ]);
            console.log("[Protocol] Dev mode registration:", success ? "success" : "failed");
        }
        else {
            console.warn("[Protocol] Dev mode: insufficient argv for registration");
        }
    }
    else {
        // Production mode
        success = electron_1.app.setAsDefaultProtocolClient(PROTOCOL);
        console.log("[Protocol] Production registration:", success ? "success" : "failed");
    }
    return success;
}
// Store initial registration result (set in app.whenReady())
var initialRegistration = false;
// Verify registration (this checks if OS recognizes us as the handler)
function verifyProtocolRegistration() {
    var isDefault = process.defaultApp
        ? electron_1.app.isDefaultProtocolClient(PROTOCOL, process.execPath, [
            process.argv[1],
        ])
        : electron_1.app.isDefaultProtocolClient(PROTOCOL);
    console.log("[Protocol] Verification - isDefaultProtocolClient: ".concat(isDefault));
    if (!isDefault && initialRegistration) {
        console.warn("[Protocol] Registration returned success but verification failed.");
        console.warn("[Protocol] This is common on first install - macOS Launch Services may need time to update.");
        console.warn("[Protocol] The protocol should work after app restart.");
    }
}
console.log("[Protocol] =============================================");
// Note: app.on("open-url") will be registered in app.whenReady()
// SVG favicon as data URI for auth callback pages (matches web app favicon)
var FAVICON_SVG = "<svg width=\"32\" height=\"32\" viewBox=\"0 0 1024 1024\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"1024\" height=\"1024\" fill=\"#0033FF\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M800.165 148C842.048 148 876 181.952 876 223.835V686.415C876 690.606 872.606 694 868.415 694H640.915C636.729 694 633.335 697.394 633.335 701.585V868.415C633.335 872.606 629.936 876 625.75 876H223.835C181.952 876 148 842.048 148 800.165V702.59C148 697.262 150.807 692.326 155.376 689.586L427.843 526.1C434.031 522.388 431.956 513.238 425.327 512.118L423.962 512H155.585C151.394 512 148 508.606 148 504.415V337.585C148 333.394 151.394 330 155.585 330H443.75C447.936 330 451.335 326.606 451.335 322.415V155.585C451.335 151.394 454.729 148 458.915 148H800.165ZM458.915 330C454.729 330 451.335 333.394 451.335 337.585V686.415C451.335 690.606 454.729 694 458.915 694H625.75C629.936 694 633.335 690.606 633.335 686.415V337.585C633.335 333.394 629.936 330 625.75 330H458.915Z\" fill=\"#F4F4F4\"/></svg>";
var FAVICON_DATA_URI = "data:image/svg+xml,".concat(encodeURIComponent(FAVICON_SVG));
// Start local HTTP server for auth callbacks
// This catches http://localhost:{AUTH_SERVER_PORT}/auth/callback?code=xxx and /callback (for MCP OAuth)
var server = (0, http_1.createServer)(function (req, res) {
    var url = new URL(req.url || "", "http://localhost:".concat(constants_1.AUTH_SERVER_PORT));
    // Serve favicon
    if (url.pathname === "/favicon.ico" || url.pathname === "/favicon.svg") {
        res.writeHead(200, { "Content-Type": "image/svg+xml" });
        res.end(FAVICON_SVG);
        return;
    }
    if (url.pathname === "/auth/callback") {
        var code = url.searchParams.get("code");
        console.log("[Auth Server] Received callback with code:", (code === null || code === void 0 ? void 0 : code.slice(0, 8)) + "...");
        if (code) {
            // Handle the auth code
            handleAuthCode(code);
            // Send success response and close the browser tab
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <link rel=\"icon\" type=\"image/svg+xml\" href=\"".concat(FAVICON_DATA_URI, "\">\n  <title>1Code - Authentication</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    :root {\n      --bg: #09090b;\n      --text: #fafafa;\n      --text-muted: #71717a;\n    }\n    @media (prefers-color-scheme: light) {\n      :root {\n        --bg: #ffffff;\n        --text: #09090b;\n        --text-muted: #71717a;\n      }\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      min-height: 100vh;\n      background: var(--bg);\n      color: var(--text);\n    }\n    .container {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 8px;\n    }\n    .logo {\n      width: 24px;\n      height: 24px;\n      margin-bottom: 8px;\n    }\n    h1 {\n      font-size: 14px;\n      font-weight: 500;\n      margin-bottom: 4px;\n    }\n    p {\n      font-size: 12px;\n      color: var(--text-muted);\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <svg class=\"logo\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.3333 0C15.2538 0 16 0.746192 16 1.66667V11.8333C16 11.9254 15.9254 12 15.8333 12H10.8333C10.7413 12 10.6667 12.0746 10.6667 12.1667V15.8333C10.6667 15.9254 10.592 16 10.5 16H1.66667C0.746192 16 0 15.2538 0 14.3333V12.1888C0 12.0717 0.0617409 11.9632 0.162081 11.903L6.15043 8.30986C6.28644 8.22833 6.24077 8.02716 6.09507 8.00256L6.06511 8H0.166667C0.0746186 8 0 7.92538 0 7.83333V4.16667C0 4.07462 0.0746193 4 0.166667 4H6.5C6.59205 4 6.66667 3.92538 6.66667 3.83333V0.166667C6.66667 0.0746193 6.74129 0 6.83333 0H14.3333ZM6.83333 4C6.74129 4 6.66667 4.07462 6.66667 4.16667V11.8333C6.66667 11.9254 6.74129 12 6.83333 12H10.5C10.592 12 10.6667 11.9254 10.6667 11.8333V4.16667C10.6667 4.07462 10.592 4 10.5 4H6.83333Z\" fill=\"#0033FF\"/>\n    </svg>\n    <h1>Authentication successful</h1>\n    <p>You can close this tab</p>\n  </div>\n  <script>setTimeout(() => window.close(), 1000)</script>\n</body>\n</html>"));
        }
        else {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Missing code parameter");
        }
    }
    else if (url.pathname === "/callback") {
        // Handle MCP OAuth callback
        var code = url.searchParams.get("code");
        var state = url.searchParams.get("state");
        console.log("[Auth Server] Received MCP OAuth callback with code:", (code === null || code === void 0 ? void 0 : code.slice(0, 8)) + "...", "state:", (state === null || state === void 0 ? void 0 : state.slice(0, 8)) + "...");
        if (code && state) {
            // Handle the MCP OAuth callback
            (0, mcp_auth_1.handleMcpOAuthCallback)(code, state);
            // Send success response and close the browser tab
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <link rel=\"icon\" type=\"image/svg+xml\" href=\"".concat(FAVICON_DATA_URI, "\">\n  <title>1Code - MCP Authentication</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    :root {\n      --bg: #09090b;\n      --text: #fafafa;\n      --text-muted: #71717a;\n    }\n    @media (prefers-color-scheme: light) {\n      :root {\n        --bg: #ffffff;\n        --text: #09090b;\n        --text-muted: #71717a;\n      }\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      min-height: 100vh;\n      background: var(--bg);\n      color: var(--text);\n    }\n    .container {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 8px;\n    }\n    .logo {\n      width: 24px;\n      height: 24px;\n      margin-bottom: 8px;\n    }\n    h1 {\n      font-size: 14px;\n      font-weight: 500;\n      margin-bottom: 4px;\n    }\n    p {\n      font-size: 12px;\n      color: var(--text-muted);\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <svg class=\"logo\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n      <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.3333 0C15.2538 0 16 0.746192 16 1.66667V11.8333C16 11.9254 15.9254 12 15.8333 12H10.8333C10.7413 12 10.6667 12.0746 10.6667 12.1667V15.8333C10.6667 15.9254 10.592 16 10.5 16H1.66667C0.746192 16 0 15.2538 0 14.3333V12.1888C0 12.0717 0.0617409 11.9632 0.162081 11.903L6.15043 8.30986C6.28644 8.22833 6.24077 8.02716 6.09507 8.00256L6.06511 8H0.166667C0.0746186 8 0 7.92538 0 7.83333V4.16667C0 4.07462 0.0746193 4 0.166667 4H6.5C6.59205 4 6.66667 3.92538 6.66667 3.83333V0.166667C6.66667 0.0746193 6.74129 0 6.83333 0H14.3333ZM6.83333 4C6.74129 4 6.66667 4.07462 6.66667 4.16667V11.8333C6.66667 11.9254 6.74129 12 6.83333 12H10.5C10.592 12 10.6667 11.9254 10.6667 11.8333V4.16667C10.6667 4.07462 10.592 4 10.5 4H6.83333Z\" fill=\"#0033FF\"/>\n    </svg>\n    <h1>MCP Server authenticated</h1>\n    <p>You can close this tab</p>\n  </div>\n  <script>setTimeout(() => window.close(), 1000)</script>\n</body>\n</html>"));
        }
        else {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Missing code or state parameter");
        }
    }
    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
});
server.listen(constants_1.AUTH_SERVER_PORT, function () {
    console.log("[Auth Server] Listening on http://localhost:".concat(constants_1.AUTH_SERVER_PORT));
});
// Clean up stale lock files from crashed instances
// Returns true if locks were cleaned, false otherwise
function cleanupStaleLocks() {
    var userDataPath = electron_1.app.getPath("userData");
    var lockPath = (0, path_1.join)(userDataPath, "SingletonLock");
    if (!(0, fs_1.existsSync)(lockPath))
        return false;
    try {
        // SingletonLock is a symlink like "hostname-pid"
        var lockTarget = (0, fs_1.readlinkSync)(lockPath);
        var match = lockTarget.match(/-(\d+)$/);
        if (match) {
            var pid = parseInt(match[1], 10);
            try {
                // Check if process is running (signal 0 doesn't kill, just checks)
                process.kill(pid, 0);
                // Process exists, lock is valid
                console.log("[App] Lock held by running process:", pid);
                return false;
            }
            catch (_a) {
                // Process doesn't exist, clean up stale locks
                console.log("[App] Cleaning stale locks (pid", pid, "not running)");
                var filesToRemove = ["SingletonLock", "SingletonSocket", "SingletonCookie"];
                for (var _i = 0, filesToRemove_1 = filesToRemove; _i < filesToRemove_1.length; _i++) {
                    var file = filesToRemove_1[_i];
                    var filePath = (0, path_1.join)(userDataPath, file);
                    if ((0, fs_1.existsSync)(filePath)) {
                        try {
                            (0, fs_1.unlinkSync)(filePath);
                        }
                        catch (e) {
                            console.warn("[App] Failed to remove", file, e);
                        }
                    }
                }
                return true;
            }
        }
    }
    catch (e) {
        console.warn("[App] Failed to check lock file:", e);
    }
    return false;
}
// Prevent multiple instances
var gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    // Maybe stale lock - try cleanup and retry once
    var cleaned = cleanupStaleLocks();
    if (cleaned) {
        gotTheLock = electron_1.app.requestSingleInstanceLock();
    }
    if (!gotTheLock) {
        electron_1.app.quit();
    }
}
if (gotTheLock) {
    // Handle second instance launch (also handles deep links on Windows/Linux)
    electron_1.app.on("second-instance", function (_event, commandLine) {
        // Check for deep link in command line args
        var url = commandLine.find(function (arg) { return arg.startsWith("".concat(PROTOCOL, "://")); });
        if (url) {
            handleDeepLink(url);
        }
        // Focus on the first available window
        var windows = (0, main_1.getAllWindows)();
        if (windows.length > 0) {
            var window_1 = windows[0];
            if (window_1.isMinimized())
                window_1.restore();
            window_1.focus();
        }
        else {
            // No windows open, create a new one
            (0, main_1.createMainWindow)();
        }
    });
    // App ready
    electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
        var claudeCodeVersion, isDev, versionPath, versionContent, updateAvailable, availableVersion, devToolsUnlocked, buildMenu, dockMenu, setUpdateAvailable, unlockDevTools, user, deepLinkUrl;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Set dev mode app name (userData path was already set before requestSingleInstanceLock)
                    if (constants_1.IS_DEV) {
                        electron_1.app.name = "Agents Dev";
                    }
                    // Register protocol handler (must be after app is ready)
                    initialRegistration = registerProtocol();
                    // Handle deep link on macOS (app already running)
                    electron_1.app.on("open-url", function (event, url) {
                        console.log("[Protocol] open-url event received:", url);
                        event.preventDefault();
                        handleDeepLink(url);
                    });
                    // Set app user model ID for Windows (different in dev to avoid taskbar conflicts)
                    if (process.platform === "win32") {
                        electron_1.app.setAppUserModelId(constants_1.IS_DEV ? "dev.21st.1code.dev" : "dev.21st.1code");
                    }
                    console.log("[App] Starting 1Code".concat(constants_1.IS_DEV ? " (DEV)" : "", "..."));
                    // Verify protocol registration after app is ready
                    // This helps diagnose first-install issues where the protocol isn't recognized yet
                    verifyProtocolRegistration();
                    claudeCodeVersion = "unknown";
                    try {
                        isDev = !electron_1.app.isPackaged;
                        versionPath = isDev
                            ? (0, path_1.join)(electron_1.app.getAppPath(), "resources/bin/VERSION")
                            : (0, path_1.join)(process.resourcesPath, "bin/VERSION");
                        if ((0, fs_1.existsSync)(versionPath)) {
                            versionContent = (0, fs_1.readFileSync)(versionPath, "utf-8");
                            claudeCodeVersion = ((_a = versionContent.split("\n")[0]) === null || _a === void 0 ? void 0 : _a.trim()) || "unknown";
                        }
                    }
                    catch (error) {
                        console.warn("[App] Failed to read Claude Code version:", error);
                    }
                    // Set About panel options with Claude Code version
                    electron_1.app.setAboutPanelOptions({
                        applicationName: "1Code",
                        applicationVersion: electron_1.app.getVersion(),
                        version: "Claude Code ".concat(claudeCodeVersion),
                        copyright: "Copyright © 2026 21st.dev",
                    });
                    updateAvailable = false;
                    availableVersion = null;
                    devToolsUnlocked = false;
                    buildMenu = function () {
                        // Show devtools menu item only in dev mode or when unlocked
                        var showDevTools = !electron_1.app.isPackaged || devToolsUnlocked;
                        var template = [
                            {
                                label: electron_1.app.name,
                                submenu: [
                                    { role: "about", label: "About 1Code" },
                                    {
                                        label: updateAvailable
                                            ? "Update to v".concat(availableVersion, "...")
                                            : "Check for Updates...",
                                        click: function () {
                                            // Send event to renderer to clear dismiss state
                                            var win = (0, main_1.getWindow)();
                                            if (win) {
                                                win.webContents.send("update:manual-check");
                                            }
                                            // If update is already available, start downloading immediately
                                            if (updateAvailable) {
                                                (0, auto_updater_1.downloadUpdate)();
                                            }
                                            else {
                                                (0, auto_updater_1.checkForUpdates)(true);
                                            }
                                        },
                                    },
                                    { type: "separator" },
                                    {
                                        label: (0, cli_1.isCliInstalled)()
                                            ? "Uninstall '1code' Command..."
                                            : "Install '1code' Command in PATH...",
                                        click: function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var dialog, result, result;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("electron"); })];
                                                    case 1:
                                                        dialog = (_a.sent()).dialog;
                                                        if (!(0, cli_1.isCliInstalled)()) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, (0, cli_1.uninstallCli)()];
                                                    case 2:
                                                        result = _a.sent();
                                                        if (result.success) {
                                                            dialog.showMessageBox({
                                                                type: "info",
                                                                message: "CLI command uninstalled",
                                                                detail: "The '1code' command has been removed from your PATH.",
                                                            });
                                                            buildMenu();
                                                        }
                                                        else {
                                                            dialog.showErrorBox("Uninstallation Failed", result.error || "Unknown error");
                                                        }
                                                        return [3 /*break*/, 5];
                                                    case 3: return [4 /*yield*/, (0, cli_1.installCli)()];
                                                    case 4:
                                                        result = _a.sent();
                                                        if (result.success) {
                                                            dialog.showMessageBox({
                                                                type: "info",
                                                                message: "CLI command installed",
                                                                detail: "You can now use '1code .' in any terminal to open 1Code in that directory.",
                                                            });
                                                            buildMenu();
                                                        }
                                                        else {
                                                            dialog.showErrorBox("Installation Failed", result.error || "Unknown error");
                                                        }
                                                        _a.label = 5;
                                                    case 5: return [2 /*return*/];
                                                }
                                            });
                                        }); },
                                    },
                                    { type: "separator" },
                                    { role: "services" },
                                    { type: "separator" },
                                    { role: "hide" },
                                    { role: "hideOthers" },
                                    { role: "unhide" },
                                    { type: "separator" },
                                    { role: "quit" },
                                ],
                            },
                            {
                                label: "File",
                                submenu: [
                                    {
                                        label: "New Chat",
                                        accelerator: "CmdOrCtrl+N",
                                        click: function () {
                                            console.log("[Menu] New Chat clicked (Cmd+N)");
                                            var win = (0, main_1.getWindow)();
                                            if (win) {
                                                console.log("[Menu] Sending shortcut:new-agent to renderer");
                                                win.webContents.send("shortcut:new-agent");
                                            }
                                            else {
                                                console.log("[Menu] No window found!");
                                            }
                                        },
                                    },
                                    {
                                        label: "New Window",
                                        accelerator: "CmdOrCtrl+Shift+N",
                                        click: function () {
                                            console.log("[Menu] New Window clicked (Cmd+Shift+N)");
                                            (0, main_1.createWindow)();
                                        },
                                    },
                                    { type: "separator" },
                                    {
                                        label: "Close Window",
                                        accelerator: "CmdOrCtrl+W",
                                        click: function () {
                                            var win = (0, main_1.getWindow)();
                                            if (win) {
                                                win.close();
                                            }
                                        },
                                    },
                                ],
                            },
                            {
                                label: "Edit",
                                submenu: [
                                    { role: "undo" },
                                    { role: "redo" },
                                    { type: "separator" },
                                    { role: "cut" },
                                    { role: "copy" },
                                    { role: "paste" },
                                    { role: "selectAll" },
                                ],
                            },
                            {
                                label: "View",
                                submenu: __spreadArray(__spreadArray([
                                    // Cmd+R is disabled to prevent accidental page refresh
                                    // Use Cmd+Shift+R (Force Reload) for intentional reloads
                                    { role: "forceReload" }
                                ], (showDevTools ? [{ role: "toggleDevTools" }] : []), true), [
                                    { type: "separator" },
                                    { role: "resetZoom" },
                                    { role: "zoomIn" },
                                    { role: "zoomOut" },
                                    { type: "separator" },
                                    { role: "togglefullscreen" },
                                ], false),
                            },
                            {
                                label: "Window",
                                submenu: [
                                    { role: "minimize" },
                                    { role: "zoom" },
                                    { type: "separator" },
                                    { role: "front" },
                                ],
                            },
                            {
                                role: "help",
                                submenu: [
                                    {
                                        label: "Learn More",
                                        click: function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var shell;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("electron"); })];
                                                    case 1:
                                                        shell = (_a.sent()).shell;
                                                        return [4 /*yield*/, shell.openExternal("https://21st.dev")];
                                                    case 2:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); },
                                    },
                                ],
                            },
                        ];
                        electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
                    };
                    // macOS: Set dock menu (right-click on dock icon)
                    if (process.platform === "darwin") {
                        dockMenu = electron_1.Menu.buildFromTemplate([
                            {
                                label: "New Window",
                                click: function () {
                                    console.log("[Dock] New Window clicked");
                                    (0, main_1.createWindow)();
                                },
                            },
                        ]);
                        electron_1.app.dock.setMenu(dockMenu);
                    }
                    setUpdateAvailable = function (available, version) {
                        updateAvailable = available;
                        availableVersion = version || null;
                        buildMenu();
                    };
                    unlockDevTools = function () {
                        if (!devToolsUnlocked) {
                            devToolsUnlocked = true;
                            console.log("[App] DevTools unlocked via hidden feature");
                            buildMenu();
                        }
                    };
                    global.__setUpdateAvailable = setUpdateAvailable;
                    global.__unlockDevTools = unlockDevTools;
                    // Build initial menu
                    buildMenu();
                    // Initialize auth manager (uses singleton from auth-manager module)
                    authManager = (0, auth_manager_1.initAuthManager)(!!process.env.ELECTRON_RENDERER_URL);
                    console.log("[App] Auth manager initialized");
                    // Initialize analytics after auth manager so we can identify user
                    (0, analytics_1.initAnalytics)();
                    // If user already authenticated from previous session, identify them
                    if (authManager.isAuthenticated()) {
                        user = authManager.getUser();
                        if (user) {
                            (0, analytics_1.identify)(user.id, { email: user.email });
                            console.log("[Analytics] User identified from saved session:", user.id);
                        }
                    }
                    // Track app opened (now with correct user ID if authenticated)
                    (0, analytics_1.trackAppOpened)();
                    // Set up callback to update cookie when token is refreshed
                    authManager.setOnTokenRefresh(function (authData) { return __awaiter(void 0, void 0, void 0, function () {
                        var ses, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("[Auth] Token refreshed, updating cookie...");
                                    ses = electron_1.session.fromPartition("persist:main");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, ses.cookies.set({
                                            url: getBaseUrl(),
                                            name: "x-desktop-token",
                                            value: authData.token,
                                            expirationDate: Math.floor(new Date(authData.expiresAt).getTime() / 1000),
                                            httpOnly: false,
                                            secure: getBaseUrl().startsWith("https"),
                                            sameSite: "lax",
                                        })];
                                case 2:
                                    _a.sent();
                                    console.log("[Auth] Desktop token cookie updated after refresh");
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    console.error("[Auth] Failed to update cookie:", err_1);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Initialize database
                    try {
                        (0, db_1.initDatabase)();
                        console.log("[App] Database initialized");
                    }
                    catch (error) {
                        console.error("[App] Failed to initialize database:", error);
                    }
                    // Create main window
                    (0, main_1.createMainWindow)();
                    if (!electron_1.app.isPackaged) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, auto_updater_1.initAutoUpdater)(main_1.getAllWindows)
                        // Setup update check on window focus (instead of periodic interval)
                    ];
                case 1:
                    _b.sent();
                    // Setup update check on window focus (instead of periodic interval)
                    (0, auto_updater_1.setupFocusUpdateCheck)(main_1.getAllWindows);
                    // Check for updates 5 seconds after startup (force to bypass interval check)
                    setTimeout(function () {
                        (0, auto_updater_1.checkForUpdates)(true);
                    }, 5000);
                    _b.label = 2;
                case 2:
                    // Warm up MCP cache 3 seconds after startup (background, non-blocking)
                    // This populates the cache so all future sessions can use filtered MCP servers
                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var getAllMcpConfigHandler, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./lib/trpc/routers/claude"); })];
                                case 1:
                                    getAllMcpConfigHandler = (_a.sent()).getAllMcpConfigHandler;
                                    return [4 /*yield*/, getAllMcpConfigHandler()];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _a.sent();
                                    console.error("[App] MCP warmup failed:", error_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }, 3000);
                    // Handle directory argument from CLI (e.g., `1code /path/to/project`)
                    (0, cli_1.parseLaunchDirectory)();
                    deepLinkUrl = process.argv.find(function (arg) {
                        return arg.startsWith("".concat(PROTOCOL, "://"));
                    });
                    if (deepLinkUrl) {
                        handleDeepLink(deepLinkUrl);
                    }
                    // macOS: Re-create window when dock icon is clicked
                    electron_1.app.on("activate", function () {
                        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                            (0, main_1.createMainWindow)();
                        }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    // Quit when all windows are closed (except on macOS)
    electron_1.app.on("window-all-closed", function () {
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
    // Cleanup before quit
    electron_1.app.on("before-quit", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[App] Shutting down...");
                    (0, mcp_auth_1.cancelAllPendingOAuth)();
                    return [4 /*yield*/, (0, watcher_1.cleanupGitWatchers)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, analytics_1.shutdown)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, db_1.closeDatabase)()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Handle uncaught exceptions
    process.on("uncaughtException", function (error) {
        console.error("[App] Uncaught exception:", error);
    });
    process.on("unhandledRejection", function (reason, promise) {
        console.error("[App] Unhandled rejection at:", promise, "reason:", reason);
    });
}
