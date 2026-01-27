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
exports.createStatusRouter = void 0;
var simple_git_1 = require("simple-git");
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var security_1 = require("./security");
var apply_numstat_1 = require("./utils/apply-numstat");
var parse_status_1 = require("./utils/parse-status");
var cache_1 = require("./cache");
var createStatusRouter = function () {
    return (0, trpc_1.router)({
        getStatus: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            defaultBranch: zod_1.z.string().optional(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var cached, git, defaultBranch, status, parsed, _c, branchComparison, trackingStatus, result;
            var input = _b.input;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        cached = cache_1.gitCache.getStatus(input.worktreePath);
                        if (cached) {
                            console.log("[getStatus] Cache hit for:", input.worktreePath);
                            return [2 /*return*/, cached];
                        }
                        console.log("[getStatus] Cache miss, fetching:", input.worktreePath);
                        git = (0, simple_git_1.default)(input.worktreePath);
                        defaultBranch = input.defaultBranch || "main";
                        return [4 /*yield*/, git.status()];
                    case 1:
                        status = _d.sent();
                        parsed = (0, parse_status_1.parseGitStatus)(status);
                        return [4 /*yield*/, Promise.all([
                                getBranchComparison(git, defaultBranch),
                                getTrackingBranchStatus(git),
                            ])];
                    case 2:
                        _c = _d.sent(), branchComparison = _c[0], trackingStatus = _c[1];
                        // Run numstat operations in parallel
                        return [4 /*yield*/, Promise.all([
                                (0, apply_numstat_1.applyNumstatToFiles)(git, parsed.staged, [
                                    "diff",
                                    "--cached",
                                    "--numstat",
                                ]),
                                (0, apply_numstat_1.applyNumstatToFiles)(git, parsed.unstaged, ["diff", "--numstat"]),
                                applyUntrackedLineCount(input.worktreePath, parsed.untracked),
                            ])];
                    case 3:
                        // Run numstat operations in parallel
                        _d.sent();
                        result = {
                            branch: parsed.branch,
                            defaultBranch: defaultBranch,
                            againstBase: branchComparison.againstBase,
                            commits: branchComparison.commits,
                            staged: parsed.staged,
                            unstaged: parsed.unstaged,
                            untracked: parsed.untracked,
                            ahead: branchComparison.ahead,
                            behind: branchComparison.behind,
                            pushCount: trackingStatus.pushCount,
                            pullCount: trackingStatus.pullCount,
                            hasUpstream: trackingStatus.hasUpstream,
                        };
                        // Store in cache
                        cache_1.gitCache.setStatus(input.worktreePath, result);
                        console.log("[getStatus] Cached and returning:", {
                            branch: result.branch,
                            stagedCount: result.staged.length,
                            unstagedCount: result.unstaged.length,
                            untrackedCount: result.untracked.length,
                            commitsCount: result.commits.length,
                        });
                        return [2 /*return*/, result];
                }
            });
        }); }),
        getCommitFiles: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            commitHash: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var git, nameStatus, files, error_1;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log("[getCommitFiles] START:", {
                            worktreePath: input.worktreePath,
                            commitHash: input.commitHash,
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        console.log("[getCommitFiles] Worktree validated");
                        git = (0, simple_git_1.default)(input.worktreePath);
                        return [4 /*yield*/, git.raw([
                                "diff-tree",
                                "--no-commit-id",
                                "--name-status",
                                "-r",
                                input.commitHash,
                            ])];
                    case 2:
                        nameStatus = _c.sent();
                        console.log("[getCommitFiles] diff-tree output:", {
                            length: nameStatus.length,
                            output: nameStatus.substring(0, 500), // First 500 chars
                        });
                        files = (0, parse_status_1.parseNameStatus)(nameStatus);
                        console.log("[getCommitFiles] Parsed files:", {
                            count: files.length,
                            files: files.map(function (f) { return ({ path: f.path, status: f.status }); }),
                        });
                        return [4 /*yield*/, (0, apply_numstat_1.applyNumstatToFiles)(git, files, [
                                "diff-tree",
                                "--no-commit-id",
                                "--numstat",
                                "-r",
                                input.commitHash,
                            ])];
                    case 3:
                        _c.sent();
                        console.log("[getCommitFiles] SUCCESS:", { filesCount: files.length });
                        return [2 /*return*/, files];
                    case 4:
                        error_1 = _c.sent();
                        console.error("[getCommitFiles] ERROR:", {
                            error: error_1 instanceof Error ? error_1.message : String(error_1),
                            stack: error_1 instanceof Error ? error_1.stack : undefined,
                            worktreePath: input.worktreePath,
                            commitHash: input.commitHash,
                        });
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        }); }),
        /** Check if worktree is registered in database */
        isWorktreeRegistered: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                try {
                    (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                    return [2 /*return*/, true];
                }
                catch (error) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        }); }),
        /** Get the unified diff for a specific file in a commit */
        getCommitFileDiff: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            commitHash: zod_1.z.string(),
            filePath: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var git, diff;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        git = (0, simple_git_1.default)(input.worktreePath);
                        return [4 /*yield*/, git.raw([
                                "diff",
                                "".concat(input.commitHash, "^"),
                                input.commitHash,
                                "--",
                                input.filePath,
                            ])];
                    case 1:
                        diff = _c.sent();
                        return [2 /*return*/, diff];
                }
            });
        }); }),
    });
};
exports.createStatusRouter = createStatusRouter;
function getBranchComparison(git, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var commits, againstBase, ahead, behind, tracking, _a, behindStr, aheadStr, logOutput, nameStatus, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    commits = [];
                    againstBase = [];
                    ahead = 0;
                    behind = 0;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--left-right",
                            "--count",
                            "origin/".concat(defaultBranch, "...HEAD"),
                        ])];
                case 2:
                    tracking = _c.sent();
                    _a = tracking.trim().split(/\s+/), behindStr = _a[0], aheadStr = _a[1];
                    behind = Number.parseInt(behindStr || "0", 10);
                    ahead = Number.parseInt(aheadStr || "0", 10);
                    return [4 /*yield*/, git.raw([
                            "log",
                            "origin/".concat(defaultBranch, "..HEAD"),
                            "--format=%H|%h|%s|%b|%an|%aI",
                        ])];
                case 3:
                    logOutput = _c.sent();
                    commits = (0, parse_status_1.parseGitLog)(logOutput);
                    if (!(ahead > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, git.raw([
                            "diff",
                            "--name-status",
                            "origin/".concat(defaultBranch, "...HEAD"),
                        ])];
                case 4:
                    nameStatus = _c.sent();
                    againstBase = (0, parse_status_1.parseNameStatus)(nameStatus);
                    return [4 /*yield*/, (0, apply_numstat_1.applyNumstatToFiles)(git, againstBase, [
                            "diff",
                            "--numstat",
                            "origin/".concat(defaultBranch, "...HEAD"),
                        ])];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, { commits: commits, againstBase: againstBase, ahead: ahead, behind: behind }];
            }
        });
    });
}
/** Max file size for line counting (1 MiB) - skip larger files to avoid OOM */
var MAX_LINE_COUNT_SIZE = 1 * 1024 * 1024;
function applyUntrackedLineCount(worktreePath, untracked) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, untracked_1, file, stats, content, lineCount, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, untracked_1 = untracked;
                    _b.label = 1;
                case 1:
                    if (!(_i < untracked_1.length)) return [3 /*break*/, 7];
                    file = untracked_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, security_1.secureFs.stat(worktreePath, file.path)];
                case 3:
                    stats = _b.sent();
                    if (stats.size > MAX_LINE_COUNT_SIZE)
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, security_1.secureFs.readFile(worktreePath, file.path)];
                case 4:
                    content = _b.sent();
                    lineCount = content.split("\n").length;
                    file.additions = lineCount;
                    file.deletions = 0;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getTrackingBranchStatus(git) {
    return __awaiter(this, void 0, void 0, function () {
        var tracking, _a, pullStr, pushStr, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--left-right",
                            "--count",
                            "@{upstream}...HEAD",
                        ])];
                case 1:
                    tracking = _c.sent();
                    _a = tracking.trim().split(/\s+/), pullStr = _a[0], pushStr = _a[1];
                    return [2 /*return*/, {
                            pushCount: Number.parseInt(pushStr || "0", 10),
                            pullCount: Number.parseInt(pullStr || "0", 10),
                            hasUpstream: true,
                        }];
                case 2:
                    _b = _c.sent();
                    // No upstream branch configured
                    return [2 /*return*/, { pushCount: 0, pullCount: 0, hasUpstream: false }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
