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
exports.gitSwitchBranch = gitSwitchBranch;
exports.gitCheckoutFile = gitCheckoutFile;
exports.gitCheckoutFiles = gitCheckoutFiles;
exports.gitStageFile = gitStageFile;
exports.gitStageAll = gitStageAll;
exports.gitStageFiles = gitStageFiles;
exports.gitUnstageFile = gitUnstageFile;
exports.gitUnstageAll = gitUnstageAll;
exports.gitUnstageFiles = gitUnstageFiles;
var path_validation_1 = require("./path-validation");
var git_factory_1 = require("../git-factory");
/**
 * Git command helpers with semantic naming.
 *
 * Design principle: Different functions for different git semantics.
 * You can't accidentally use file checkout syntax for branch switching.
 *
 * Each function:
 * 1. Validates worktree is registered
 * 2. Validates paths/refs as appropriate
 * 3. Uses the correct git command syntax
 */
/**
 * Switch to a branch.
 *
 * Uses `git switch` (unambiguous branch operation, git 2.23+).
 * Falls back to `git checkout <branch>` for older git versions.
 *
 * Note: `git checkout -- <branch>` is WRONG - that's file checkout syntax.
 */
function gitSwitchBranch(worktreePath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    // Validate: reject anything that looks like a flag
                    if (branch.startsWith("-")) {
                        throw new Error("Invalid branch name: cannot start with -");
                    }
                    // Validate: reject empty branch names
                    if (!branch.trim()) {
                        throw new Error("Invalid branch name: cannot be empty");
                    }
                    git = (0, git_factory_1.createGit)(worktreePath);
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return __awaiter(_this, void 0, void 0, function () {
                            var switchError_1, errorMessage;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 6]);
                                        // Prefer `git switch` - unambiguous branch operation (git 2.23+)
                                        return [4 /*yield*/, git.raw(["switch", branch])];
                                    case 1:
                                        // Prefer `git switch` - unambiguous branch operation (git 2.23+)
                                        _a.sent();
                                        return [3 /*break*/, 6];
                                    case 2:
                                        switchError_1 = _a.sent();
                                        errorMessage = String(switchError_1);
                                        if (!errorMessage.includes("is not a git command")) return [3 /*break*/, 4];
                                        // Fallback for older git versions
                                        // Note: checkout WITHOUT -- is correct for branches
                                        return [4 /*yield*/, git.checkout(branch)];
                                    case 3:
                                        // Fallback for older git versions
                                        // Note: checkout WITHOUT -- is correct for branches
                                        _a.sent();
                                        return [3 /*break*/, 5];
                                    case 4: throw switchError_1;
                                    case 5: return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Checkout (restore) a file path, discarding local changes.
 *
 * Uses `git checkout -- <path>` - the `--` is REQUIRED here
 * to indicate path mode (not branch mode).
 */
function gitCheckoutFile(worktreePath, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    (0, path_validation_1.assertValidGitPath)(filePath);
                    git = (0, git_factory_1.createGit)(worktreePath);
                    // `--` is correct here - we want path semantics
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.checkout(["--", filePath]); })];
                case 1:
                    // `--` is correct here - we want path semantics
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Checkout (restore) multiple file paths, discarding local changes.
 *
 * Uses `git checkout -- <paths...>` to restore multiple files at once,
 * avoiding multiple sequential git calls and lock conflicts.
 */
function gitCheckoutFiles(worktreePath, filePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, filePaths_1, filePath, git, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    for (_i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
                        filePath = filePaths_1[_i];
                        (0, path_validation_1.assertValidGitPath)(filePath);
                    }
                    if (filePaths.length === 0)
                        return [2 /*return*/];
                    git = (0, git_factory_1.createGit)(worktreePath);
                    _loop_1 = function (i) {
                        var batch;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    batch = filePaths.slice(i, i + BATCH_SIZE);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.checkout(__spreadArray(["--"], batch, true)); })];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < filePaths.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Stage a file for commit.
 *
 * Uses `git add -- <path>` - the `--` prevents paths starting
 * with `-` from being interpreted as flags.
 */
function gitStageFile(worktreePath, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    (0, path_validation_1.assertValidGitPath)(filePath);
                    git = (0, git_factory_1.createGit)(worktreePath);
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.add(["--", filePath]); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Stage all changes for commit.
 *
 * Uses `git add -A` to stage all changes (new, modified, deleted).
 */
function gitStageAll(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    git = (0, git_factory_1.createGit)(worktreePath);
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.add("-A"); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Stage multiple files for commit in a single git operation.
 *
 * Uses `git add -- <paths...>` to stage multiple files at once,
 * avoiding multiple sequential git calls and lock conflicts.
 */
/** Maximum files per batch to avoid command line length limits */
var BATCH_SIZE = 100;
function gitStageFiles(worktreePath, filePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, filePaths_2, filePath, git, _loop_2, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    for (_i = 0, filePaths_2 = filePaths; _i < filePaths_2.length; _i++) {
                        filePath = filePaths_2[_i];
                        (0, path_validation_1.assertValidGitPath)(filePath);
                    }
                    if (filePaths.length === 0)
                        return [2 /*return*/];
                    git = (0, git_factory_1.createGit)(worktreePath);
                    _loop_2 = function (i) {
                        var batch;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    batch = filePaths.slice(i, i + BATCH_SIZE);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.add(__spreadArray(["--"], batch, true)); })];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < filePaths.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_2(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Unstage a file (remove from staging area).
 *
 * Uses `git reset HEAD -- <path>` to unstage without
 * discarding changes.
 */
function gitUnstageFile(worktreePath, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    (0, path_validation_1.assertValidGitPath)(filePath);
                    git = (0, git_factory_1.createGit)(worktreePath);
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.reset(["HEAD", "--", filePath]); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Unstage all files.
 *
 * Uses `git reset HEAD` to unstage all changes without
 * discarding them.
 */
function gitUnstageAll(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    git = (0, git_factory_1.createGit)(worktreePath);
                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.reset(["HEAD"]); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Unstage multiple files in a single git operation.
 *
 * Uses `git reset HEAD -- <paths...>` to unstage multiple files at once,
 * avoiding multiple sequential git calls and lock conflicts.
 */
function gitUnstageFiles(worktreePath, filePaths) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, filePaths_3, filePath, git, _loop_3, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                    for (_i = 0, filePaths_3 = filePaths; _i < filePaths_3.length; _i++) {
                        filePath = filePaths_3[_i];
                        (0, path_validation_1.assertValidGitPath)(filePath);
                    }
                    if (filePaths.length === 0)
                        return [2 /*return*/];
                    git = (0, git_factory_1.createGit)(worktreePath);
                    _loop_3 = function (i) {
                        var batch;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    batch = filePaths.slice(i, i + BATCH_SIZE);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(worktreePath, function () { return git.reset(__spreadArray(["HEAD", "--"], batch, true)); })];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < filePaths.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_3(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
