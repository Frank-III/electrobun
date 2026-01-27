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
exports.GIT_TIMEOUTS = void 0;
exports.createGit = createGit;
exports.createGitForNetwork = createGitForNetwork;
exports.createGitForLongOperation = createGitForLongOperation;
exports.withGitLock = withGitLock;
exports.cleanStaleLockFiles = cleanStaleLockFiles;
exports.isLockFileError = isLockFileError;
exports.withLockRetry = withLockRetry;
exports.hasUncommittedChanges = hasUncommittedChanges;
exports.getUncommittedChanges = getUncommittedChanges;
exports.getRepositoryState = getRepositoryState;
var simple_git_1 = require("simple-git");
var promises_1 = require("fs/promises");
var path_1 = require("path");
/**
 * Default timeout values for git operations (in milliseconds)
 */
exports.GIT_TIMEOUTS = {
    /** Local operations (status, add, commit, etc.) */
    LOCAL: 30000, // 30 seconds
    /** Network operations (fetch, push, pull, clone) */
    NETWORK: 120000, // 2 minutes
    /** Long-running operations (clone large repos, initial fetch) */
    LONG: 300000, // 5 minutes
};
/**
 * Per-worktree operation locks to prevent concurrent git operations
 */
var operationLocks = new Map();
/**
 * Creates a simple-git instance with configured timeouts.
 *
 * @param worktreePath - Path to the git worktree/repository
 * @param timeout - Timeout in milliseconds (defaults to LOCAL timeout)
 * @returns Configured SimpleGit instance
 */
function createGit(worktreePath, timeout) {
    if (timeout === void 0) { timeout = exports.GIT_TIMEOUTS.LOCAL; }
    var options = {
        baseDir: worktreePath,
        binary: "git",
        maxConcurrentProcesses: 6,
        timeout: {
            block: timeout,
        },
    };
    return (0, simple_git_1.default)(options);
}
/**
 * Creates a simple-git instance configured for network operations.
 * Uses longer timeout suitable for fetch, push, pull operations.
 */
function createGitForNetwork(worktreePath) {
    return createGit(worktreePath, exports.GIT_TIMEOUTS.NETWORK);
}
/**
 * Creates a simple-git instance configured for long-running operations.
 * Uses extended timeout suitable for clone, large fetches, etc.
 */
function createGitForLongOperation(worktreePath) {
    return createGit(worktreePath, exports.GIT_TIMEOUTS.LONG);
}
/**
 * Executes a git operation with a per-worktree mutex lock.
 * Prevents concurrent git operations on the same worktree which can
 * cause lock file conflicts and corruption.
 *
 * @param worktreePath - Path to the git worktree
 * @param operation - Async function to execute
 * @returns Result of the operation
 */
function withGitLock(worktreePath, operation) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, resolveLock, lock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existing = operationLocks.get(worktreePath);
                    if (!existing) return [3 /*break*/, 2];
                    return [4 /*yield*/, existing.catch(function () { })];
                case 1:
                    _a.sent(); // Ignore errors from previous operation
                    _a.label = 2;
                case 2:
                    lock = new Promise(function (resolve) {
                        resolveLock = resolve;
                    });
                    operationLocks.set(worktreePath, lock);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, , 5, 6]);
                    return [4 /*yield*/, operation()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    resolveLock();
                    // Clean up the lock if it's still ours
                    if (operationLocks.get(worktreePath) === lock) {
                        operationLocks.delete(worktreePath);
                    }
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Known lock files that git creates during operations
 */
var GIT_LOCK_FILES = [
    ".git/index.lock",
    ".git/config.lock",
    ".git/HEAD.lock",
    ".git/refs/heads/*.lock",
    ".git/shallow.lock",
];
/**
 * Checks for and removes stale git lock files.
 * A lock file is considered stale if it's older than the specified max age.
 *
 * @param worktreePath - Path to the git worktree
 * @param maxAgeMs - Maximum age in milliseconds before a lock is considered stale (default: 5 minutes)
 * @returns Array of removed lock file paths
 */
function cleanStaleLockFiles(worktreePath_1) {
    return __awaiter(this, arguments, void 0, function (worktreePath, maxAgeMs) {
        var removedLocks, basicLocks, _i, basicLocks_1, lockRelPath, lockPath, stats, age, _a;
        if (maxAgeMs === void 0) { maxAgeMs = 5 * 60 * 1000; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    removedLocks = [];
                    basicLocks = [
                        ".git/index.lock",
                        ".git/config.lock",
                        ".git/HEAD.lock",
                        ".git/shallow.lock",
                    ];
                    _i = 0, basicLocks_1 = basicLocks;
                    _b.label = 1;
                case 1:
                    if (!(_i < basicLocks_1.length)) return [3 /*break*/, 8];
                    lockRelPath = basicLocks_1[_i];
                    lockPath = (0, path_1.join)(worktreePath, lockRelPath);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.stat)(lockPath)];
                case 3:
                    stats = _b.sent();
                    age = Date.now() - stats.mtimeMs;
                    if (!(age > maxAgeMs)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.unlink)(lockPath)];
                case 4:
                    _b.sent();
                    removedLocks.push(lockPath);
                    console.log("[git-factory] Removed stale lock file: ".concat(lockPath, " (age: ").concat(Math.round(age / 1000), "s)"));
                    _b.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, removedLocks];
            }
        });
    });
}
/**
 * Detects if an error is caused by a git lock file conflict.
 */
function isLockFileError(error) {
    var message = error instanceof Error ? error.message : String(error);
    return (message.includes("index.lock") ||
        message.includes("Unable to create") ||
        message.includes("Another git process seems to be running") ||
        message.includes(".lock': File exists"));
}
/**
 * Executes a git operation with automatic retry on lock file conflicts.
 * Will attempt to clean stale locks and retry the operation.
 *
 * @param worktreePath - Path to the git worktree
 * @param operation - Async function to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 1000)
 * @returns Result of the operation
 */
function withLockRetry(worktreePath_1, operation_1) {
    return __awaiter(this, arguments, void 0, function (worktreePath, operation, maxRetries, retryDelayMs) {
        var lastError, _loop_1, attempt, state_1;
        if (maxRetries === void 0) { maxRetries = 3; }
        if (retryDelayMs === void 0) { retryDelayMs = 1000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (attempt) {
                        var _b, error_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 7]);
                                    _b = {};
                                    return [4 /*yield*/, operation()];
                                case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                case 2:
                                    error_1 = _c.sent();
                                    lastError = error_1;
                                    if (!(isLockFileError(error_1) && attempt < maxRetries)) return [3 /*break*/, 5];
                                    console.log("[git-factory] Lock file conflict on attempt ".concat(attempt + 1, ", cleaning and retrying..."));
                                    // Try to clean stale locks
                                    return [4 /*yield*/, cleanStaleLockFiles(worktreePath)];
                                case 3:
                                    // Try to clean stale locks
                                    _c.sent();
                                    // Wait before retry with exponential backoff
                                    return [4 /*yield*/, new Promise(function (resolve) {
                                            return setTimeout(resolve, retryDelayMs * Math.pow(2, attempt));
                                        })];
                                case 4:
                                    // Wait before retry with exponential backoff
                                    _c.sent();
                                    return [3 /*break*/, 6];
                                case 5: throw error_1;
                                case 6: return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: throw lastError;
            }
        });
    });
}
/**
 * Checks if a repository has uncommitted changes.
 * Returns true if there are staged, unstaged, or untracked changes.
 */
function hasUncommittedChanges(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = createGit(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status = _a.sent();
                    return [2 /*return*/, !status.isClean()];
            }
        });
    });
}
/**
 * Gets detailed uncommitted changes information.
 */
function getUncommittedChanges(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = createGit(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status = _a.sent();
                    return [2 /*return*/, {
                            hasChanges: !status.isClean(),
                            staged: status.staged,
                            modified: status.modified,
                            deleted: status.deleted,
                            untracked: status.not_added,
                            conflicted: status.conflicted,
                        }];
            }
        });
    });
}
/**
 * Checks if the repository is in a rebase or merge state.
 */
function getRepositoryState(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status, isRebasing, hasConflicts, existsSync, gitDir;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = createGit(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status = _b.sent();
                    isRebasing = ((_a = status.current) === null || _a === void 0 ? void 0 : _a.includes("(no branch")) || false;
                    hasConflicts = status.conflicted.length > 0;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 2:
                    existsSync = (_b.sent()).existsSync;
                    gitDir = (0, path_1.join)(worktreePath, ".git");
                    return [2 /*return*/, {
                            isRebasing: existsSync((0, path_1.join)(gitDir, "rebase-merge")) || existsSync((0, path_1.join)(gitDir, "rebase-apply")),
                            isMerging: existsSync((0, path_1.join)(gitDir, "MERGE_HEAD")),
                            isCherryPicking: existsSync((0, path_1.join)(gitDir, "CHERRY_PICK_HEAD")),
                            isReverting: existsSync((0, path_1.join)(gitDir, "REVERT_HEAD")),
                            hasConflicts: hasConflicts,
                        }];
            }
        });
    });
}
