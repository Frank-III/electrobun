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
exports.createGitOperationsRouter = exports.isUpstreamMissingError = void 0;
var electron_1 = require("electron");
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var git_utils_1 = require("./git-utils");
Object.defineProperty(exports, "isUpstreamMissingError", { enumerable: true, get: function () { return git_utils_1.isUpstreamMissingError; } });
var security_1 = require("./security");
var github_1 = require("./github");
var git_factory_1 = require("./git-factory");
function hasUpstreamBranch(git) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, git.raw(["rev-parse", "--abbrev-ref", "@{upstream}"])];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/** Protected branches that should not be force-pushed to */
var PROTECTED_BRANCHES = ["main", "master", "develop", "production", "staging"];
var createGitOperationsRouter = function () {
    return (0, trpc_1.router)({
        // NOTE: saveFile is defined in file-contents.ts with hardened path validation
        // Do NOT add saveFile here - it would overwrite the secure version
        fetch: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.fetch(["--all", "--prune"]);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        checkout: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            branch: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, git_factory_1.hasUncommittedChanges)(input.worktreePath)];
                                case 1:
                                    // Check for uncommitted changes before checkout
                                    if (_a.sent()) {
                                        throw new Error("Cannot switch branches: you have uncommitted changes. Please commit or stash your changes first.");
                                    }
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.checkout(input.branch);
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        getHistory: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            limit: zod_1.z.number().optional().default(50),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var git, logOutput;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        git = (0, git_factory_1.createGit)(input.worktreePath);
                        return [4 /*yield*/, git.raw([
                                "log",
                                "-".concat(input.limit),
                                "--format=%H|%h|%s|%an|%ae|%aI",
                            ])];
                    case 1:
                        logOutput = _c.sent();
                        if (!logOutput.trim())
                            return [2 /*return*/, []];
                        return [2 /*return*/, logOutput
                                .trim()
                                .split("\n")
                                .map(function (line) {
                                var _a = line.split("|"), hash = _a[0], shortHash = _a[1], message = _a[2], author = _a[3], email = _a[4], dateStr = _a[5];
                                return {
                                    hash: hash || "",
                                    shortHash: shortHash || "",
                                    message: message || "",
                                    author: author || "",
                                    email: email || "",
                                    date: new Date(dateStr || ""),
                                };
                            })];
                }
            });
        }); }),
        commit: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            message: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                // Validate message
                if (!input.message.trim()) {
                    throw new Error("Commit message cannot be empty");
                }
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, status, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    return [4 /*yield*/, git.status()];
                                case 1:
                                    status = _a.sent();
                                    if (status.staged.length === 0) {
                                        throw new Error("No files staged for commit");
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.commit(input.message);
                                        })];
                                case 2:
                                    result = _a.sent();
                                    return [2 /*return*/, { success: true, hash: result.commit }];
                            }
                        });
                    }); })];
            });
        }); }),
        // Atomic commit: stage specific files and commit in one operation
        atomicCommit: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            filePaths: zod_1.z.array(zod_1.z.string()),
            message: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                // Validate message
                if (!input.message.trim()) {
                    throw new Error("Commit message cannot be empty");
                }
                // Validate files
                if (input.filePaths.length === 0) {
                    throw new Error("No files selected for commit");
                }
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, status, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    // First, unstage everything to start fresh
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.reset(["HEAD"]);
                                        })];
                                case 1:
                                    // First, unstage everything to start fresh
                                    _a.sent();
                                    // Stage only the selected files
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.add(__spreadArray(["--"], input.filePaths, true));
                                        })];
                                case 2:
                                    // Stage only the selected files
                                    _a.sent();
                                    return [4 /*yield*/, git.status()];
                                case 3:
                                    status = _a.sent();
                                    if (status.staged.length === 0) {
                                        throw new Error("Failed to stage files for commit");
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.commit(input.message);
                                        })];
                                case 4:
                                    result = _a.sent();
                                    return [2 /*return*/, { success: true, hash: result.commit }];
                            }
                        });
                    }); })];
            });
        }); }),
        push: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            setUpstream: zod_1.z.boolean().optional(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, hasUpstream, branch_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, hasUpstreamBranch(git)];
                                case 1:
                                    hasUpstream = _a.sent();
                                    if (!(input.setUpstream && !hasUpstream)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, git.revparse(["--abbrev-ref", "HEAD"])];
                                case 2:
                                    branch_1 = _a.sent();
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.push(["--set-upstream", "origin", branch_1.trim()]);
                                        })];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 4: return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () { return git.push(); })];
                                case 5:
                                    _a.sent();
                                    _a.label = 6;
                                case 6: return [4 /*yield*/, git.fetch()];
                                case 7:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        pull: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            autoStash: zod_1.z.boolean().optional().default(false),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, hasChanges, repoState, stashError_1, error_1, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.hasUncommittedChanges)(input.worktreePath)];
                                case 1:
                                    hasChanges = _a.sent();
                                    if (hasChanges && !input.autoStash) {
                                        throw new Error("Cannot pull with uncommitted changes. Please commit or stash your changes first, or enable auto-stash.");
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.getRepositoryState)(input.worktreePath)];
                                case 2:
                                    repoState = _a.sent();
                                    if (repoState.isRebasing || repoState.isMerging) {
                                        throw new Error("Cannot pull: a rebase or merge is in progress. Please complete or abort it first.");
                                    }
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 11, , 14]);
                                    if (!(input.autoStash && hasChanges)) return [3 /*break*/, 5];
                                    // Stash changes before pull
                                    return [4 /*yield*/, git.stash(["push", "-m", "Auto-stash before pull"])];
                                case 4:
                                    // Stash changes before pull
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                        return git.pull(["--rebase"]);
                                    })];
                                case 6:
                                    _a.sent();
                                    if (!(input.autoStash && hasChanges)) return [3 /*break*/, 10];
                                    _a.label = 7;
                                case 7:
                                    _a.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, git.stash(["pop"])];
                                case 8:
                                    _a.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    stashError_1 = _a.sent();
                                    // Stash pop failed (likely conflict)
                                    throw new Error("Pull succeeded but failed to restore your stashed changes. Your changes are saved in git stash. Run 'git stash pop' to restore them.");
                                case 10: return [3 /*break*/, 14];
                                case 11:
                                    error_1 = _a.sent();
                                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                                    if ((0, git_utils_1.isUpstreamMissingError)(message)) {
                                        throw new Error("No upstream branch to pull from. The remote branch may have been deleted.");
                                    }
                                    if (!(message.includes("CONFLICT") || message.includes("could not apply"))) return [3 /*break*/, 13];
                                    // Abort the rebase
                                    return [4 /*yield*/, git.rebase(["--abort"]).catch(function () { })];
                                case 12:
                                    // Abort the rebase
                                    _a.sent();
                                    throw new Error("Pull failed due to conflicts. The operation has been aborted. Please resolve conflicts manually or try a different approach.");
                                case 13: throw error_1;
                                case 14: return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        sync: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            autoStash: zod_1.z.boolean().optional().default(false),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, hasChanges, repoState, _a, error_2, message, branch_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.hasUncommittedChanges)(input.worktreePath)];
                                case 1:
                                    hasChanges = _b.sent();
                                    if (hasChanges && !input.autoStash) {
                                        throw new Error("Cannot sync with uncommitted changes. Please commit or stash your changes first.");
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.getRepositoryState)(input.worktreePath)];
                                case 2:
                                    repoState = _b.sent();
                                    if (repoState.isRebasing || repoState.isMerging) {
                                        throw new Error("Cannot sync: a rebase or merge is in progress. Please complete or abort it first.");
                                    }
                                    _b.label = 3;
                                case 3:
                                    _b.trys.push([3, 11, , 18]);
                                    if (!(input.autoStash && hasChanges)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, git.stash(["push", "-m", "Auto-stash before sync"])];
                                case 4:
                                    _b.sent();
                                    _b.label = 5;
                                case 5: return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                        return git.pull(["--rebase"]);
                                    })];
                                case 6:
                                    _b.sent();
                                    if (!(input.autoStash && hasChanges)) return [3 /*break*/, 10];
                                    _b.label = 7;
                                case 7:
                                    _b.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, git.stash(["pop"])];
                                case 8:
                                    _b.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    _a = _b.sent();
                                    throw new Error("Sync pull succeeded but failed to restore your stashed changes. Your changes are saved in git stash.");
                                case 10: return [3 /*break*/, 18];
                                case 11:
                                    error_2 = _b.sent();
                                    message = error_2 instanceof Error ? error_2.message : String(error_2);
                                    if (!(0, git_utils_1.isUpstreamMissingError)(message)) return [3 /*break*/, 15];
                                    return [4 /*yield*/, git.revparse(["--abbrev-ref", "HEAD"])];
                                case 12:
                                    branch_2 = _b.sent();
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.push(["--set-upstream", "origin", branch_2.trim()]);
                                        })];
                                case 13:
                                    _b.sent();
                                    return [4 /*yield*/, git.fetch()];
                                case 14:
                                    _b.sent();
                                    return [2 /*return*/, { success: true }];
                                case 15:
                                    if (!(message.includes("CONFLICT") || message.includes("could not apply"))) return [3 /*break*/, 17];
                                    return [4 /*yield*/, git.rebase(["--abort"]).catch(function () { })];
                                case 16:
                                    _b.sent();
                                    throw new Error("Sync failed due to conflicts. The operation has been aborted. Please resolve conflicts manually.");
                                case 17: throw error_2;
                                case 18: return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () { return git.push(); })];
                                case 19:
                                    _b.sent();
                                    return [4 /*yield*/, git.fetch()];
                                case 20:
                                    _b.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        forcePush: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            confirmProtectedBranch: zod_1.z.boolean().optional().default(false),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, branch;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, git.revparse(["--abbrev-ref", "HEAD"])];
                                case 1:
                                    branch = (_a.sent()).trim();
                                    // Check if it's a protected branch
                                    if (PROTECTED_BRANCHES.includes(branch) && !input.confirmProtectedBranch) {
                                        throw new Error("Cannot force push to protected branch '".concat(branch, "'. This action requires explicit confirmation."));
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.push(["--force-with-lease"]);
                                        })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, git.fetch()];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        mergeFromDefault: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            useRebase: zod_1.z.boolean().optional().default(false),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, repoState, defaultBranch, _a, _b, error_3, message;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.hasUncommittedChanges)(input.worktreePath)];
                                case 1:
                                    // Safety check: prevent merge/rebase with uncommitted changes
                                    if (_c.sent()) {
                                        throw new Error("Cannot merge/rebase with uncommitted changes. Please commit or stash your changes first.");
                                    }
                                    return [4 /*yield*/, (0, git_factory_1.getRepositoryState)(input.worktreePath)];
                                case 2:
                                    repoState = _c.sent();
                                    if (repoState.isRebasing || repoState.isMerging) {
                                        throw new Error("Cannot merge/rebase: another merge or rebase is in progress. Please complete or abort it first.");
                                    }
                                    // Fetch latest from remote first
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.fetch(["--all"]);
                                        })];
                                case 3:
                                    // Fetch latest from remote first
                                    _c.sent();
                                    defaultBranch = "main";
                                    _c.label = 4;
                                case 4:
                                    _c.trys.push([4, 6, , 11]);
                                    return [4 /*yield*/, git.raw(["rev-parse", "--verify", "origin/main"])];
                                case 5:
                                    _c.sent();
                                    return [3 /*break*/, 11];
                                case 6:
                                    _a = _c.sent();
                                    _c.label = 7;
                                case 7:
                                    _c.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, git.raw(["rev-parse", "--verify", "origin/master"])];
                                case 8:
                                    _c.sent();
                                    defaultBranch = "master";
                                    return [3 /*break*/, 10];
                                case 9:
                                    _b = _c.sent();
                                    throw new Error("Could not find default branch (main or master)");
                                case 10: return [3 /*break*/, 11];
                                case 11:
                                    _c.trys.push([11, 16, , 22]);
                                    if (!input.useRebase) return [3 /*break*/, 13];
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.rebase(["origin/".concat(defaultBranch)]);
                                        })];
                                case 12:
                                    _c.sent();
                                    return [3 /*break*/, 15];
                                case 13: return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                        return git.merge(["origin/".concat(defaultBranch), "--no-edit"]);
                                    })];
                                case 14:
                                    _c.sent();
                                    _c.label = 15;
                                case 15: return [3 /*break*/, 22];
                                case 16:
                                    error_3 = _c.sent();
                                    message = error_3 instanceof Error ? error_3.message : String(error_3);
                                    if (!(message.includes("CONFLICT") ||
                                        message.includes("could not apply") ||
                                        message.includes("merge failed"))) return [3 /*break*/, 21];
                                    if (!input.useRebase) return [3 /*break*/, 18];
                                    return [4 /*yield*/, git.rebase(["--abort"]).catch(function () { })];
                                case 17:
                                    _c.sent();
                                    return [3 /*break*/, 20];
                                case 18: return [4 /*yield*/, git.merge(["--abort"]).catch(function () { })];
                                case 19:
                                    _c.sent();
                                    _c.label = 20;
                                case 20: throw new Error("".concat(input.useRebase ? "Rebase" : "Merge", " failed due to conflicts. The operation has been aborted. Please resolve conflicts manually or use a different strategy."));
                                case 21: throw error_3;
                                case 22: return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        // Abort an ongoing rebase
        abortRebase: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    return [4 /*yield*/, git.rebase(["--abort"])];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        // Abort an ongoing merge
        abortMerge: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    return [4 /*yield*/, git.merge(["--abort"])];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        // Get repository state (rebase/merge in progress, conflicts)
        getRepositoryState: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.getRepositoryState)(input.worktreePath)];
            });
        }); }),
        createPR: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, branch, hasUpstream, remoteUrl, repoMatch, repo, url;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, git.revparse(["--abbrev-ref", "HEAD"])];
                                case 1:
                                    branch = (_a.sent()).trim();
                                    return [4 /*yield*/, hasUpstreamBranch(git)];
                                case 2:
                                    hasUpstream = _a.sent();
                                    if (!!hasUpstream) return [3 /*break*/, 4];
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.push(["--set-upstream", "origin", branch]);
                                        })];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 4: 
                                // Push any unpushed commits
                                return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () { return git.push(); })];
                                case 5:
                                    // Push any unpushed commits
                                    _a.sent();
                                    _a.label = 6;
                                case 6: return [4 /*yield*/, git.remote(["get-url", "origin"])];
                                case 7:
                                    remoteUrl = (_a.sent()) || "";
                                    repoMatch = remoteUrl
                                        .trim()
                                        .match(/github\.com[:/](.+?)(?:\.git)?$/);
                                    if (!repoMatch) {
                                        throw new Error("Could not determine GitHub repository URL");
                                    }
                                    repo = repoMatch[1].replace(/\.git$/, "");
                                    url = "https://github.com/".concat(repo, "/compare/").concat(branch, "?expand=1");
                                    return [4 /*yield*/, electron_1.shell.openExternal(url)];
                                case 8:
                                    _a.sent();
                                    return [4 /*yield*/, git.fetch()];
                                case 9:
                                    _a.sent();
                                    return [2 /*return*/, { success: true, url: url }];
                            }
                        });
                    }); })];
            });
        }); }),
        getGitHubStatus: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        return [4 /*yield*/, (0, github_1.fetchGitHubPRStatus)(input.worktreePath)];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        }); }),
    });
};
exports.createGitOperationsRouter = createGitOperationsRouter;
