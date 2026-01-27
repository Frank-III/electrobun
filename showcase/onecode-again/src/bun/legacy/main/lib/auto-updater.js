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
exports.initAutoUpdater = initAutoUpdater;
exports.checkForUpdates = checkForUpdates;
exports.downloadUpdate = downloadUpdate;
exports.setupFocusUpdateCheck = setupFocusUpdateCheck;
var electron_1 = require("electron");
var electron_log_1 = require("electron-log");
var electron_updater_1 = require("electron-updater");
/**
 * IMPORTANT: Do NOT use lazy/dynamic imports for electron-updater!
 *
 * In v0.0.6 we tried using async getAutoUpdater() with dynamic imports,
 * which broke the auto-updater completely. The synchronous import is required
 * for electron-updater to work correctly.
 *
 * See commit d946614c5 for the broken implementation - do not repeat this mistake.
 */
function initAutoUpdaterConfig() {
    // Configure logging
    electron_log_1.default.transports.file.level = "info";
    electron_updater_1.autoUpdater.logger = electron_log_1.default;
    // Configure updater behavior
    electron_updater_1.autoUpdater.autoDownload = false; // Let user decide when to download
    electron_updater_1.autoUpdater.autoInstallOnAppQuit = true; // Install on quit if downloaded
    electron_updater_1.autoUpdater.autoRunAppAfterInstall = true; // Restart app after install
}
// CDN base URL for updates
var CDN_BASE = "https://cdn.21st.dev/releases/desktop";
// Minimum interval between update checks (prevent spam on rapid focus/blur)
var MIN_CHECK_INTERVAL = 60 * 1000; // 1 minute
var lastCheckTime = 0;
var getAllWindows = null;
/**
 * Send update event to all renderer windows
 * Update events are app-wide and should be visible in all windows
 */
function sendToAllRenderers(channel, data) {
    var _a;
    var windows = (_a = getAllWindows === null || getAllWindows === void 0 ? void 0 : getAllWindows()) !== null && _a !== void 0 ? _a : electron_1.BrowserWindow.getAllWindows();
    for (var _i = 0, windows_1 = windows; _i < windows_1.length; _i++) {
        var win = windows_1[_i];
        try {
            if (win && !win.isDestroyed()) {
                win.webContents.send(channel, data);
            }
        }
        catch (_b) {
            // Window may have been destroyed between check and send
        }
    }
}
/**
 * Initialize the auto-updater with event handlers and IPC
 */
function initAutoUpdater(getWindows) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            getAllWindows = getWindows;
            // Initialize config
            initAutoUpdaterConfig();
            // Configure feed URL to point to R2 CDN
            // Note: We use a custom request headers to bypass CDN cache
            electron_updater_1.autoUpdater.setFeedURL({
                provider: "generic",
                url: CDN_BASE,
            });
            // Add cache-busting to update requests
            electron_updater_1.autoUpdater.requestHeaders = {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
            };
            // Event: Checking for updates
            electron_updater_1.autoUpdater.on("checking-for-update", function () {
                electron_log_1.default.info("[AutoUpdater] Checking for updates...");
                sendToAllRenderers("update:checking");
            });
            // Event: Update available
            electron_updater_1.autoUpdater.on("update-available", function (info) {
                electron_log_1.default.info("[AutoUpdater] Update available: v".concat(info.version));
                // Update menu to show "Update to vX.X.X..."
                var setUpdateAvailable = global.__setUpdateAvailable;
                if (setUpdateAvailable) {
                    setUpdateAvailable(true, info.version);
                }
                sendToAllRenderers("update:available", {
                    version: info.version,
                    releaseDate: info.releaseDate,
                    releaseNotes: info.releaseNotes,
                });
            });
            // Event: No update available
            electron_updater_1.autoUpdater.on("update-not-available", function (info) {
                electron_log_1.default.info("[AutoUpdater] App is up to date (v".concat(info.version, ")"));
                sendToAllRenderers("update:not-available", {
                    version: info.version,
                });
            });
            // Event: Download progress
            electron_updater_1.autoUpdater.on("download-progress", function (progress) {
                electron_log_1.default.info("[AutoUpdater] Download progress: ".concat(progress.percent.toFixed(1), "% ") +
                    "(".concat(formatBytes(progress.transferred), "/").concat(formatBytes(progress.total), ")"));
                sendToAllRenderers("update:progress", {
                    percent: progress.percent,
                    bytesPerSecond: progress.bytesPerSecond,
                    transferred: progress.transferred,
                    total: progress.total,
                });
            });
            // Event: Update downloaded
            electron_updater_1.autoUpdater.on("update-downloaded", function (info) {
                electron_log_1.default.info("[AutoUpdater] Update downloaded: v".concat(info.version));
                // Reset menu back to "Check for Updates..." since update is ready
                var setUpdateAvailable = global.__setUpdateAvailable;
                if (setUpdateAvailable) {
                    setUpdateAvailable(false);
                }
                sendToAllRenderers("update:downloaded", {
                    version: info.version,
                    releaseDate: info.releaseDate,
                    releaseNotes: info.releaseNotes,
                });
            });
            // Event: Error
            electron_updater_1.autoUpdater.on("error", function (error) {
                electron_log_1.default.error("[AutoUpdater] Error:", error.message);
                sendToAllRenderers("update:error", error.message);
            });
            // Register IPC handlers
            registerIpcHandlers();
            electron_log_1.default.info("[AutoUpdater] Initialized with feed URL:", CDN_BASE);
            return [2 /*return*/];
        });
    });
}
/**
 * Register IPC handlers for update operations
 */
function registerIpcHandlers() {
    var _this = this;
    // Check for updates
    electron_1.ipcMain.handle("update:check", function (_event, force) { return __awaiter(_this, void 0, void 0, function () {
        var cacheBuster, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!electron_1.app.isPackaged) {
                        electron_log_1.default.info("[AutoUpdater] Skipping update check in dev mode");
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // If force is true, add cache-busting timestamp to URL
                    if (force) {
                        cacheBuster = "?t=".concat(Date.now());
                        electron_updater_1.autoUpdater.setFeedURL({
                            provider: "generic",
                            url: "".concat(CDN_BASE).concat(cacheBuster),
                        });
                        electron_log_1.default.info("[AutoUpdater] Force check with cache-busting:", "".concat(CDN_BASE).concat(cacheBuster));
                    }
                    return [4 /*yield*/, electron_updater_1.autoUpdater.checkForUpdates()
                        // Reset feed URL back to normal after force check
                    ];
                case 2:
                    result = _a.sent();
                    // Reset feed URL back to normal after force check
                    if (force) {
                        electron_updater_1.autoUpdater.setFeedURL({
                            provider: "generic",
                            url: CDN_BASE,
                        });
                    }
                    return [2 /*return*/, (result === null || result === void 0 ? void 0 : result.updateInfo) || null];
                case 3:
                    error_1 = _a.sent();
                    electron_log_1.default.error("[AutoUpdater] Check failed:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Download update
    electron_1.ipcMain.handle("update:download", function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, electron_updater_1.autoUpdater.downloadUpdate()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    error_2 = _a.sent();
                    electron_log_1.default.error("[AutoUpdater] Download failed:", error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Install update and restart
    electron_1.ipcMain.handle("update:install", function () {
        electron_log_1.default.info("[AutoUpdater] Installing update and restarting...");
        // Give renderer time to save state
        setTimeout(function () {
            electron_updater_1.autoUpdater.quitAndInstall(false, true);
        }, 100);
    });
    // Get current update state (useful for re-renders)
    electron_1.ipcMain.handle("update:get-state", function () {
        return {
            currentVersion: electron_1.app.getVersion(),
        };
    });
}
/**
 * Manually trigger an update check
 * @param force - Skip the minimum interval check
 */
function checkForUpdates() {
    return __awaiter(this, arguments, void 0, function (force) {
        var now;
        if (force === void 0) { force = false; }
        return __generator(this, function (_a) {
            if (!electron_1.app.isPackaged) {
                electron_log_1.default.info("[AutoUpdater] Skipping update check in dev mode");
                return [2 /*return*/, Promise.resolve(null)];
            }
            now = Date.now();
            if (!force && now - lastCheckTime < MIN_CHECK_INTERVAL) {
                electron_log_1.default.info("[AutoUpdater] Skipping check - last check was ".concat(Math.round((now - lastCheckTime) / 1000), "s ago"));
                return [2 /*return*/, Promise.resolve(null)];
            }
            lastCheckTime = now;
            return [2 /*return*/, electron_updater_1.autoUpdater.checkForUpdates()];
        });
    });
}
/**
 * Start downloading the update
 */
function downloadUpdate() {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!electron_1.app.isPackaged) {
                        electron_log_1.default.info("[AutoUpdater] Skipping download in dev mode");
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    electron_log_1.default.info("[AutoUpdater] Starting update download...");
                    return [4 /*yield*/, electron_updater_1.autoUpdater.downloadUpdate()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    error_3 = _a.sent();
                    electron_log_1.default.error("[AutoUpdater] Download failed:", error_3);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check for updates when window gains focus
 * This is more natural than checking on an interval
 */
function setupFocusUpdateCheck(_getWindows) {
    // Listen for window focus events
    electron_1.app.on("browser-window-focus", function () {
        electron_log_1.default.info("[AutoUpdater] Window focused - checking for updates");
        checkForUpdates();
    });
}
/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
