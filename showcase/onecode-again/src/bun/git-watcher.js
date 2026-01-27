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
var path_1 = require("path");
var watcher_1 = require("@parcel/watcher");
function debounce(fn, wait) {
    var timeoutId = null;
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(function () { return fn.apply(void 0, args); }, wait);
    });
}
function normalizeType(type) {
    if (type === "create")
        return "add";
    if (type === "delete")
        return "unlink";
    return "change";
}
function isGitMeta(path, worktreePath) {
    var gitIndex = (0, path_1.join)(worktreePath, ".git", "index");
    var gitHead = (0, path_1.join)(worktreePath, ".git", "HEAD");
    return path === gitIndex || path === gitHead || path.endsWith("".concat(path_1.sep, ".git").concat(path_1.sep, "index")) || path.endsWith("".concat(path_1.sep, ".git").concat(path_1.sep, "HEAD"));
}
var GitWatcher = /** @class */ (function (_super) {
    __extends(GitWatcher, _super);
    function GitWatcher(config) {
        var _a;
        var _this = _super.call(this) || this;
        _this.pendingChanges = new Map();
        _this.isDisposed = false;
        _this.subscription = null;
        _this.worktreePath = config.worktreePath;
        _this.debounceMs = (_a = config.debounceMs) !== null && _a !== void 0 ? _a : 100;
        _this.initPromise = _this.initWatcher();
        return _this;
    }
    GitWatcher.prototype.initWatcher = function () {
        return __awaiter(this, void 0, void 0, function () {
            var flushChanges, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
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
                        _a = this;
                        return [4 /*yield*/, watcher_1.default.subscribe(this.worktreePath, function (err, events) {
                                if (_this.isDisposed)
                                    return;
                                if (err) {
                                    console.error("[GitWatcher] Error:", err);
                                    _this.emit("error", err);
                                    return;
                                }
                                for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                                    var event_1 = events_2[_i];
                                    if (!isGitMeta(event_1.path, _this.worktreePath))
                                        continue;
                                    _this.pendingChanges.set(event_1.path, normalizeType(event_1.type));
                                }
                                if (_this.pendingChanges.size > 0) {
                                    flushChanges();
                                }
                            }, {
                                ignore: function (path) { return !isGitMeta(path, _this.worktreePath); },
                            })];
                    case 1:
                        _a.subscription = _b.sent();
                        console.log("[GitWatcher] Watching: ".concat(this.worktreePath));
                        return [2 /*return*/];
                }
            });
        });
    };
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
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isDisposed)
                            return [2 /*return*/];
                        this.isDisposed = true;
                        return [4 /*yield*/, this.initPromise.catch(function () { })];
                    case 1:
                        _a.sent();
                        if (!this.subscription) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.subscription.unsubscribe()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
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
var GitWatcherRegistry = /** @class */ (function () {
    function GitWatcherRegistry() {
        this.watchers = new Map();
        this.listeners = new Map();
    }
    GitWatcherRegistry.prototype.getOrCreate = function (worktreePath) {
        return __awaiter(this, void 0, void 0, function () {
            var watcherInstance;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        watcherInstance = this.watchers.get(worktreePath);
                        if (!!watcherInstance) return [3 /*break*/, 2];
                        watcherInstance = new GitWatcher({ worktreePath: worktreePath, debounceMs: 100 });
                        this.watchers.set(worktreePath, watcherInstance);
                        watcherInstance.on("change", function (event) {
                            var listeners = _this.listeners.get(worktreePath);
                            if (!listeners)
                                return;
                            for (var _i = 0, _a = Array.from(listeners); _i < _a.length; _i++) {
                                var callback = _a[_i];
                                try {
                                    callback(event);
                                }
                                catch (error) {
                                    console.error("[GitWatcherRegistry] Listener error:", error);
                                }
                            }
                        });
                        return [4 /*yield*/, watcherInstance.waitForReady()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, watcherInstance];
                }
            });
        });
    };
    GitWatcherRegistry.prototype.subscribe = function (worktreePath, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var listeners;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOrCreate(worktreePath)];
                    case 1:
                        _a.sent();
                        listeners = this.listeners.get(worktreePath);
                        if (!listeners) {
                            listeners = new Set();
                            this.listeners.set(worktreePath, listeners);
                        }
                        listeners.add(callback);
                        return [2 /*return*/, function () {
                                listeners === null || listeners === void 0 ? void 0 : listeners.delete(callback);
                            }];
                }
            });
        });
    };
    GitWatcherRegistry.prototype.has = function (worktreePath) {
        return this.watchers.has(worktreePath);
    };
    GitWatcherRegistry.prototype.dispose = function (worktreePath) {
        return __awaiter(this, void 0, void 0, function () {
            var watcherInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        watcherInstance = this.watchers.get(worktreePath);
                        if (!watcherInstance) return [3 /*break*/, 2];
                        return [4 /*yield*/, watcherInstance.dispose()];
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
    GitWatcherRegistry.prototype.disposeAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var disposals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        disposals = Array.from(this.watchers.values()).map(function (watcherInstance) { return watcherInstance.dispose(); });
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
    return GitWatcherRegistry;
}());
exports.gitWatcherRegistry = new GitWatcherRegistry();
