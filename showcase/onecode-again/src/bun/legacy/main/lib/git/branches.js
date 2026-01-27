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
exports.createBranchesRouter = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("../db");
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var security_1 = require("./security");
var git_factory_1 = require("./git-factory");
/** Regex for valid branch names */
var BRANCH_NAME_REGEX = /^[a-zA-Z0-9._/-]+$/;
/** Invalid branch name patterns */
var INVALID_BRANCH_PATTERNS = [/^-/, /\.\./, /\.$/, /^\./, /@\{/, /\\/, /\s/];
var createBranchesRouter = function () {
    return (0, trpc_1.router)({
        getBranches: trpc_1.publicProcedure
            .input(zod_1.z.object({ worktreePath: zod_1.z.string() }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var git, branchSummary, localBranches, remote, _i, _c, name_1, remoteName, local, defaultBranch, checkedOutBranches;
            var input = _b.input;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        git = (0, git_factory_1.createGit)(input.worktreePath);
                        return [4 /*yield*/, git.branch(["-a"])];
                    case 1:
                        branchSummary = _d.sent();
                        localBranches = [];
                        remote = [];
                        for (_i = 0, _c = Object.keys(branchSummary.branches); _i < _c.length; _i++) {
                            name_1 = _c[_i];
                            if (name_1.startsWith("remotes/origin/")) {
                                if (name_1 === "remotes/origin/HEAD")
                                    continue;
                                remoteName = name_1.replace("remotes/origin/", "");
                                remote.push(remoteName);
                            }
                            else {
                                localBranches.push(name_1);
                            }
                        }
                        return [4 /*yield*/, getLocalBranchesWithDates(git, localBranches)];
                    case 2:
                        local = _d.sent();
                        return [4 /*yield*/, getDefaultBranch(git, remote)];
                    case 3:
                        defaultBranch = _d.sent();
                        return [4 /*yield*/, getCheckedOutBranches(git, input.worktreePath)];
                    case 4:
                        checkedOutBranches = _d.sent();
                        return [2 /*return*/, {
                                current: branchSummary.current,
                                local: local,
                                remote: remote.sort(),
                                defaultBranch: defaultBranch,
                                checkedOutBranches: checkedOutBranches,
                            }];
                }
            });
        }); }),
        switchBranch: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            branch: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var chat, db;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        chat = (0, security_1.getRegisteredChat)(input.worktreePath);
                        return [4 /*yield*/, (0, security_1.gitSwitchBranch)(input.worktreePath, input.branch)];
                    case 1:
                        _c.sent();
                        db = (0, db_1.getDatabase)();
                        db.update(db_1.chats)
                            .set({ branch: input.branch })
                            .where((0, drizzle_orm_1.eq)(db_1.chats.worktreePath, input.worktreePath))
                            .run();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); }),
        createBranch: trpc_1.publicProcedure
            .input(zod_1.z.object({
            projectPath: zod_1.z.string(),
            branchName: zod_1.z.string(),
            baseBranch: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var _i, INVALID_BRANCH_PATTERNS_1, pattern;
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.projectPath);
                // Validate branch name
                if (!BRANCH_NAME_REGEX.test(input.branchName)) {
                    throw new Error("Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes");
                }
                for (_i = 0, INVALID_BRANCH_PATTERNS_1 = INVALID_BRANCH_PATTERNS; _i < INVALID_BRANCH_PATTERNS_1.length; _i++) {
                    pattern = INVALID_BRANCH_PATTERNS_1[_i];
                    if (pattern.test(input.branchName)) {
                        throw new Error("Invalid branch name: '".concat(input.branchName, "'"));
                    }
                }
                if (input.branchName.length > 250) {
                    throw new Error("Branch name too long (max 250 characters)");
                }
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.projectPath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, branchSummary, allBranches, startPoint;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.projectPath);
                                    return [4 /*yield*/, git.branch(["-a"])];
                                case 1:
                                    branchSummary = _a.sent();
                                    allBranches = Object.keys(branchSummary.branches);
                                    if (allBranches.includes(input.branchName)) {
                                        throw new Error("Branch '".concat(input.branchName, "' already exists"));
                                    }
                                    startPoint = input.baseBranch;
                                    if (allBranches.includes("remotes/origin/".concat(input.baseBranch))) {
                                        startPoint = "origin/".concat(input.baseBranch);
                                    }
                                    // Create the new branch (without switching to it)
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.projectPath, function () {
                                            return git.branch([input.branchName, startPoint]);
                                        })];
                                case 2:
                                    // Create the new branch (without switching to it)
                                    _a.sent();
                                    return [2 /*return*/, { success: true, branchName: input.branchName }];
                            }
                        });
                    }); })];
            });
        }); }),
        deleteBranch: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            branch: zod_1.z.string(),
            force: zod_1.z.boolean().optional().default(false),
            deleteRemote: zod_1.z.boolean().optional().default(false),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                return [2 /*return*/, (0, git_factory_1.withGitLock)(input.worktreePath, function () { return __awaiter(void 0, void 0, void 0, function () {
                        var git, branchSummary, currentBranch, checkedOutBranches, deleteFlag, networkGit_1, error_1, message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    git = (0, git_factory_1.createGit)(input.worktreePath);
                                    return [4 /*yield*/, git.branch(["-a"])];
                                case 1:
                                    branchSummary = _a.sent();
                                    currentBranch = branchSummary.current;
                                    // Cannot delete current branch
                                    if (input.branch === currentBranch) {
                                        throw new Error("Cannot delete branch '".concat(input.branch, "' because it is currently checked out"));
                                    }
                                    return [4 /*yield*/, getCheckedOutBranches(git, input.worktreePath)];
                                case 2:
                                    checkedOutBranches = _a.sent();
                                    if (checkedOutBranches[input.branch]) {
                                        throw new Error("Cannot delete branch '".concat(input.branch, "' because it is checked out in another worktree: ").concat(checkedOutBranches[input.branch]));
                                    }
                                    deleteFlag = input.force ? "-D" : "-d";
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return git.branch([deleteFlag, input.branch]);
                                        })];
                                case 3:
                                    _a.sent();
                                    if (!input.deleteRemote) return [3 /*break*/, 7];
                                    _a.label = 4;
                                case 4:
                                    _a.trys.push([4, 6, , 7]);
                                    networkGit_1 = (0, git_factory_1.createGitForNetwork)(input.worktreePath);
                                    return [4 /*yield*/, (0, git_factory_1.withLockRetry)(input.worktreePath, function () {
                                            return networkGit_1.push(["origin", "--delete", input.branch]);
                                        })];
                                case 5:
                                    _a.sent();
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_1 = _a.sent();
                                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                                    // Ignore if remote branch doesn't exist
                                    if (!message.includes("remote ref does not exist")) {
                                        throw new Error("Local branch deleted, but failed to delete remote: ".concat(message));
                                    }
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
        // Clean up orphaned branches (branches that were created for worktrees that no longer exist)
        cleanupOrphanedBranches: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            dryRun: zod_1.z.boolean().optional().default(true),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var git, db, branchSummary, localBranches, activeChats, activeBranches, defaultBranch, worktreeBranchPattern, orphanedBranches, deleted, _i, orphanedBranches_1, branch, _c;
            var input = _b.input;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        git = (0, git_factory_1.createGit)(input.worktreePath);
                        db = (0, db_1.getDatabase)();
                        return [4 /*yield*/, git.branch(["-a"])];
                    case 1:
                        branchSummary = _d.sent();
                        localBranches = Object.keys(branchSummary.branches).filter(function (b) { return !b.startsWith("remotes/"); });
                        activeChats = db.select().from(db_1.chats).all();
                        activeBranches = new Set(activeChats.map(function (c) { return c.branch; }).filter(Boolean));
                        return [4 /*yield*/, getDefaultBranch(git, [])];
                    case 2:
                        defaultBranch = _d.sent();
                        activeBranches.add(defaultBranch);
                        activeBranches.add(branchSummary.current);
                        worktreeBranchPattern = /^[a-z]+-[a-z]+-[a-f0-9]{3,}$/;
                        orphanedBranches = localBranches.filter(function (branch) {
                            // Only consider auto-generated worktree branches
                            if (!worktreeBranchPattern.test(branch))
                                return false;
                            // Skip if branch is active
                            if (activeBranches.has(branch))
                                return false;
                            return true;
                        });
                        deleted = [];
                        if (!!input.dryRun) return [3 /*break*/, 8];
                        _i = 0, orphanedBranches_1 = orphanedBranches;
                        _d.label = 3;
                    case 3:
                        if (!(_i < orphanedBranches_1.length)) return [3 /*break*/, 8];
                        branch = orphanedBranches_1[_i];
                        _d.label = 4;
                    case 4:
                        _d.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, git.branch(["-D", branch])];
                    case 5:
                        _d.sent();
                        deleted.push(branch);
                        return [3 /*break*/, 7];
                    case 6:
                        _c = _d.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: return [2 /*return*/, { orphanedBranches: orphanedBranches, deleted: deleted }];
                }
            });
        }); }),
        fetchRemote: trpc_1.publicProcedure
            .input(zod_1.z.object({ worktreePath: zod_1.z.string() }))
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
                                    return [4 /*yield*/, git.fetch(["--prune", "--all"])];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); })];
            });
        }); }),
    });
};
exports.createBranchesRouter = createBranchesRouter;
function getLocalBranchesWithDates(git, localBranches) {
    return __awaiter(this, void 0, void 0, function () {
        var branchInfo, local, _i, _a, line, lastSpaceIdx, branch, timestamp, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, git.raw([
                            "for-each-ref",
                            "--sort=-committerdate",
                            "--format=%(refname:short) %(committerdate:unix)",
                            "refs/heads/",
                        ])];
                case 1:
                    branchInfo = _c.sent();
                    local = [];
                    for (_i = 0, _a = branchInfo.trim().split("\n"); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line)
                            continue;
                        lastSpaceIdx = line.lastIndexOf(" ");
                        branch = line.substring(0, lastSpaceIdx);
                        timestamp = Number.parseInt(line.substring(lastSpaceIdx + 1), 10);
                        if (localBranches.includes(branch)) {
                            local.push({
                                branch: branch,
                                lastCommitDate: timestamp * 1000,
                            });
                        }
                    }
                    return [2 /*return*/, local];
                case 2:
                    _b = _c.sent();
                    return [2 /*return*/, localBranches.map(function (branch) { return ({ branch: branch, lastCommitDate: 0 }); })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getDefaultBranch(git, remoteBranches) {
    return __awaiter(this, void 0, void 0, function () {
        var headRef, match, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, git.raw(["symbolic-ref", "refs/remotes/origin/HEAD"])];
                case 1:
                    headRef = _b.sent();
                    match = headRef.match(/refs\/remotes\/origin\/(.+)/);
                    if (match) {
                        return [2 /*return*/, match[1].trim()];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    if (remoteBranches.includes("master") && !remoteBranches.includes("main")) {
                        return [2 /*return*/, "master"];
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, "main"];
            }
        });
    });
}
function getCheckedOutBranches(git, currentWorktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var checkedOutBranches, worktreeList, lines, currentPath, _i, lines_1, line, branch, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    checkedOutBranches = {};
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.raw(["worktree", "list", "--porcelain"])];
                case 2:
                    worktreeList = _b.sent();
                    lines = worktreeList.split("\n");
                    currentPath = null;
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (line.startsWith("worktree ")) {
                            currentPath = line.substring(9).trim();
                        }
                        else if (line.startsWith("branch ")) {
                            branch = line.substring(7).trim().replace("refs/heads/", "");
                            if (currentPath && currentPath !== currentWorktreePath) {
                                checkedOutBranches[branch] = currentPath;
                            }
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, checkedOutBranches];
            }
        });
    });
}
