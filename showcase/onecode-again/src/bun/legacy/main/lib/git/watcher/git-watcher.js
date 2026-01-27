"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.gitWatcherRegistry = exports.GitWatcher = void 0;
var events_1 = require("events");
// Simple debounce implementation to avoid lodash-es dependency in main process
function debounce(func, wait) {
    var timeoutId = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
var DEFAULT_IGNORE_PATTERNS = [
    // Node/JS
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/out/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/.cache/**",
    "**/coverage/**",
    "**/*.log",
    "**/.DS_Store",
    "**/package-lock.json",
    "**/pnpm-lock.yaml",
    "**/yarn.lock",
    "**/.env*",
    "**/*.map",
    "**/*.d.ts",
    // Rust
    "**/target/**",
    // Python
    "**/__pycache__/**",
    "**/.pytest_cache/**",
    "**/*.pyc",
    // Go/PHP
    "**/vendor/**",
    // Java/Kotlin
    "**/.gradle/**",
    "**/*.class",
    // IDE
    "**/.idea/**",
    "**/.vscode/**",
    // iOS
    "**/Pods/**",
    // C/C++
    "**/*.o",
    "**/*.obj",
    // Temporary files
    "**/*.swp",
    "**/*.swo",
    "**/*~",
];
/**
 * GitWatcher monitors a worktree directory for file changes using chokidar.
 * Changes are batched and debounced to avoid overwhelming the renderer with events.
 */
var GitWatcher = /** @class */ (function (_super) {
    __extends(GitWatcher, _super);
    function GitWatcher(config) {
        var _a;
        var _this = _super.call(this) || this;
        _this.watcher = null;
        _this.pendingChanges = new Map();
        _this.isDisposed = false;
        _this.worktreePath = config.worktreePath;
        _this.debounceMs = (_a = config.debounceMs) !== null && _a !== void 0 ? _a : 100;
        _this.initPromise = _this.initWatcher(config);
        return _this;
    }
    GitWatcher.prototype.initWatcher = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var chokidar, path, gitIndexPath, gitHeadPath, watchPaths, flushChanges;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("chokidar"); })];
                    case 1:
                        chokidar = _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("path"); })];
                    case 2:
                        path = _a.sent();
                        gitIndexPath = path.join(config.worktreePath, ".git", "index");
                        gitHeadPath = path.join(config.worktreePath, ".git", "HEAD");
                        watchPaths = [gitIndexPath, gitHeadPath];
                        this.watcher = chokidar.watch(watchPaths, {
                            persistent: true,
                            ignoreInitial: true,
                            awaitWriteFinish: {
                                stabilityThreshold: 50,
                                pollInterval: 25,
                            },
                            // Native events (no polling) for efficiency
                            usePolling: false,
                            // Don't follow symlinks
                            followSymlinks: false,
                        });
                        flushChanges = debounce(function () {
                            if (_this.isDisposed || _this.pendingChanges.size === 0)
                                return;
                            var changes = Array.from(_this.pendingChanges.entries()).map(function (_a) {
                                var path = _a[0], type = _a[1];
                                return ({
                                    path: path,
                                    type: type,
                                });
                            });
                            _this.pendingChanges.clear();
                            var event = {
                                type: "batch",
                                changes: changes,
                                timestamp: Date.now(),
                                worktreePath: _this.worktreePath,
                            };
                            _this.emit("change", event);
                        }, this.debounceMs);
                        this.watcher
                            .on("add", function (path) {
                            _this.pendingChanges.set(path, "add");
                            flushChanges();
                        })
                            .on("change", function (path) {
                            _this.pendingChanges.set(path, "change");
                            flushChanges();
                        })
                            .on("unlink", function (path) {
                            _this.pendingChanges.set(path, "unlink");
                            flushChanges();
                        })
                            .on("error", function (error) {
                            console.error("[GitWatcher] Error:", error);
                            _this.emit("error", error);
                        });
                        console.log("[GitWatcher] Watching: ".concat(config.worktreePath));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Wait for the watcher to be initialized.
     */
    GitWatcher.prototype.waitForReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitWatcher.prototype.getWorktreePath = function () {
        return this.worktreePath;
    };
    GitWatcher.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isDisposed)
                            return [2 /*return*/];
                        this.isDisposed = true;
                        // Wait for init to complete before disposing
                        return [4 /*yield*/, this.initPromise.catch(function () { })];
                    case 1:
                        // Wait for init to complete before disposing
                        _b.sent();
                        return [4 /*yield*/, ((_a = this.watcher) === null || _a === void 0 ? void 0 : _a.close())];
                    case 2:
                        _b.sent();
                        this.pendingChanges.clear();
                        this.removeAllListeners();
                        console.log("[GitWatcher] Disposed: ".concat(this.worktreePath));
                        return [2 /*return*/];
                }
            });
        });
    };
    return GitWatcher;
}(events_1.EventEmitter));
exports.GitWatcher = GitWatcher;
/**
 * Registry for managing multiple GitWatcher instances (one per worktree).
 * Ensures only one watcher exists per worktree path.
 */
var GitWatcherRegistry = /** @class */ (function () {
    function GitWatcherRegistry() {
        this.watchers = new Map();
        this.listeners = new Map();
    }
    /**
     * Get or create a watcher for the given worktree path.
     * If a watcher already exists, returns the existing one.
     */
    GitWatcherRegistry.prototype.getOrCreate = function (worktreePath) {
        return __awaiter(this, void 0, void 0, function () {
            var watcher;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        watcher = this.watchers.get(worktreePath);
                        if (!!watcher) return [3 /*break*/, 2];
                        watcher = new GitWatcher({
                            worktreePath: worktreePath,
                            debounceMs: 100,
                        });
                        this.watchers.set(worktreePath, watcher);
                        // Wire up event forwarding
                        watcher.on("change", function (event) {
                            var listeners = _this.listeners.get(worktreePath);
                            if (listeners) {
                                var callbacks = Array.from(listeners);
                                for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                                    var callback = callbacks_1[_i];
                                    try {
                                        callback(event);
                                    }
                                    catch (error) {
                                        console.error("[GitWatcherRegistry] Listener error:", error);
                                    }
                                }
                            }
                        });
                        // Wait for the watcher to be ready
                        return [4 /*yield*/, watcher.waitForReady()];
                    case 1:
                        // Wait for the watcher to be ready
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, watcher];
                }
            });
        });
    };
    /**
     * Subscribe to file change events for a worktree.
     * Returns an unsubscribe function.
     *
     * NOTE: This is async to ensure the watcher is ready before returning.
     * This prevents race conditions where events could be missed if the
     * callback is added before the watcher finishes initializing.
     */
    GitWatcherRegistry.prototype.subscribe = function (worktreePath, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var listeners;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Wait for watcher to be ready before adding listener
                    return [4 /*yield*/, this.getOrCreate(worktreePath)];
                    case 1:
                        // Wait for watcher to be ready before adding listener
                        _a.sent();
                        listeners = this.listeners.get(worktreePath);
                        if (!listeners) {
                            listeners = new Set();
                            this.listeners.set(worktreePath, listeners);
                        }
                        listeners.add(callback);
                        // Return unsubscribe function
                        return [2 /*return*/, function () {
                                listeners === null || listeners === void 0 ? void 0 : listeners.delete(callback);
                                // Keep watcher alive for potential reuse (only 2 file descriptors)
                            }];
                }
            });
        });
    };
    /**
     * Check if a watcher exists for the given worktree.
     */
    GitWatcherRegistry.prototype.has = function (worktreePath) {
        return this.watchers.has(worktreePath);
    };
    /**
     * Dispose a specific watcher.
     */
    GitWatcherRegistry.prototype.dispose = function (worktreePath) {
        return __awaiter(this, void 0, void 0, function () {
            var watcher;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        watcher = this.watchers.get(worktreePath);
                        if (!watcher) return [3 /*break*/, 2];
                        return [4 /*yield*/, watcher.dispose()];
                    case 1:
                        _a.sent();
                        this.watchers.delete(worktreePath);
                        this.listeners.delete(worktreePath);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dispose all watchers. Call this when the app is shutting down.
     */
    GitWatcherRegistry.prototype.disposeAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var disposals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        disposals = Array.from(this.watchers.values()).map(function (watcher) {
                            return watcher.dispose();
                        });
                        return [4 /*yield*/, Promise.all(disposals)];
                    case 1:
                        _a.sent();
                        this.watchers.clear();
                        this.listeners.clear();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the number of active watchers.
     */
    GitWatcherRegistry.prototype.getWatcherCount = function () {
        return this.watchers.size;
    };
    return GitWatcherRegistry;
}());
// Singleton instance
exports.gitWatcherRegistry = new GitWatcherRegistry();
