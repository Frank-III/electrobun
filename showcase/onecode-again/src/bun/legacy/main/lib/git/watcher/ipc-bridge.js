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
exports.registerGitWatcherIPC = registerGitWatcherIPC;
exports.cleanupWindowSubscriptions = cleanupWindowSubscriptions;
exports.cleanupGitWatchers = cleanupGitWatchers;
var electron_1 = require("electron");
var git_watcher_1 = require("./git-watcher");
var cache_1 = require("../cache");
/**
 * IPC Bridge for GitWatcher.
 * Handles subscription/unsubscription from renderer and forwards file change events.
 */
// Track active subscriptions per worktree with subscribing window ID
// This ensures events are sent to the window that subscribed, not the focused window
var activeSubscriptions = new Map();
/**
 * Register IPC handlers for git watcher.
 * Call this once during app initialization.
 */
function registerGitWatcherIPC() {
    var _this = this;
    // Handle subscription requests from renderer
    electron_1.ipcMain.handle("git:subscribe-watcher", function (event, worktreePath) { return __awaiter(_this, void 0, void 0, function () {
        var subscribingWindow, windowId, unsubscribe;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!worktreePath)
                        return [2 /*return*/];
                    // Already subscribed?
                    if (activeSubscriptions.has(worktreePath)) {
                        return [2 /*return*/];
                    }
                    subscribingWindow = electron_1.BrowserWindow.fromWebContents(event.sender);
                    if (!subscribingWindow || subscribingWindow.isDestroyed())
                        return [2 /*return*/];
                    windowId = subscribingWindow.id;
                    return [4 /*yield*/, git_watcher_1.gitWatcherRegistry.subscribe(worktreePath, function (watchEvent) {
                            // Send to the subscribing window, not the focused window
                            var subscription = activeSubscriptions.get(worktreePath);
                            if (!subscription)
                                return;
                            var targetWindow = electron_1.BrowserWindow.fromId(subscription.windowId);
                            if (!targetWindow || targetWindow.isDestroyed())
                                return;
                            // We're watching .git/index and .git/HEAD, so any event means a git operation occurred.
                            // Invalidate status and parsedDiff caches - these are always affected by git operations.
                            // File content cache is content-addressed and will update on next request if hash changed.
                            cache_1.gitCache.invalidateStatus(worktreePath);
                            cache_1.gitCache.invalidateParsedDiff(worktreePath);
                            // Send event to renderer
                            try {
                                targetWindow.webContents.send("git:status-changed", {
                                    worktreePath: watchEvent.worktreePath,
                                    changes: watchEvent.changes,
                                });
                            }
                            catch (_a) {
                                // Window may have been destroyed between check and send
                            }
                        })];
                case 1:
                    unsubscribe = _a.sent();
                    activeSubscriptions.set(worktreePath, { windowId: windowId, unsubscribe: unsubscribe });
                    console.log("[GitWatcher] Window ".concat(windowId, " subscribed to: ").concat(worktreePath));
                    return [2 /*return*/];
            }
        });
    }); });
    // Handle unsubscription requests from renderer
    electron_1.ipcMain.handle("git:unsubscribe-watcher", function (_event, worktreePath) { return __awaiter(_this, void 0, void 0, function () {
        var subscription;
        return __generator(this, function (_a) {
            if (!worktreePath)
                return [2 /*return*/];
            subscription = activeSubscriptions.get(worktreePath);
            if (subscription) {
                subscription.unsubscribe();
                activeSubscriptions.delete(worktreePath);
                console.log("[GitWatcher] Window ".concat(subscription.windowId, " unsubscribed from: ").concat(worktreePath));
            }
            return [2 /*return*/];
        });
    }); });
}
/**
 * Cleanup subscriptions for a specific window.
 * Call this when a window is closed to prevent memory leaks.
 */
function cleanupWindowSubscriptions(windowId) {
    for (var _i = 0, activeSubscriptions_1 = activeSubscriptions; _i < activeSubscriptions_1.length; _i++) {
        var _a = activeSubscriptions_1[_i], path = _a[0], subscription = _a[1];
        if (subscription.windowId === windowId) {
            subscription.unsubscribe();
            activeSubscriptions.delete(path);
            console.log("[GitWatcher] Cleaned up subscription for closed window ".concat(windowId, ": ").concat(path));
        }
    }
}
/**
 * Cleanup all watchers.
 * Call this when the app is shutting down.
 */
function cleanupGitWatchers() {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions, _i, subscriptions_1, subscription;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptions = Array.from(activeSubscriptions.values());
                    for (_i = 0, subscriptions_1 = subscriptions; _i < subscriptions_1.length; _i++) {
                        subscription = subscriptions_1[_i];
                        subscription.unsubscribe();
                    }
                    activeSubscriptions.clear();
                    // Dispose all watchers
                    return [4 /*yield*/, git_watcher_1.gitWatcherRegistry.disposeAll()];
                case 1:
                    // Dispose all watchers
                    _a.sent();
                    console.log("[GitWatcher] All watchers cleaned up");
                    return [2 /*return*/];
            }
        });
    });
}
