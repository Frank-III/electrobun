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
exports.createChangesHandlers = createChangesHandlers;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("./db");
var github_1 = require("./github");
var git_worktree_1 = require("./git-worktree");
var shell_env_1 = require("./shell-env");
var PROTECTED_BRANCHES = ["main", "master", "develop", "production", "staging"];
function runGit(cwd, args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, shell_env_1.execWithShellEnv)("git", args, { cwd: cwd })];
        });
    });
}
function mapGitStatus(gitIndex, gitWorking) {
    if (gitIndex === "A" || gitWorking === "A")
        return "added";
    if (gitIndex === "D" || gitWorking === "D")
        return "deleted";
    if (gitIndex === "R")
        return "renamed";
    if (gitIndex === "C")
        return "copied";
    if (gitIndex === "?" || gitWorking === "?")
        return "untracked";
    return "modified";
}
function toChangedFile(path, gitIndex, gitWorking, oldPath) {
    return {
        path: path,
        oldPath: oldPath,
        status: mapGitStatus(gitIndex, gitWorking),
        additions: 0,
        deletions: 0,
    };
}
function parsePorcelainStatus(output) {
    var staged = [];
    var unstaged = [];
    var untracked = [];
    var branch = "HEAD";
    var lines = output.split("\n").filter(Boolean);
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.startsWith("##")) {
            var info = line.slice(2).trim();
            var branchPart = info.split("...")[0];
            branch = branchPart || "HEAD";
            continue;
        }
        var x = line[0] || " ";
        var y = line[1] || " ";
        var rest = line.slice(3).trim();
        if (!rest)
            continue;
        if (x === "?" && y === "?") {
            untracked.push(toChangedFile(rest, x, y));
            continue;
        }
        var path = rest;
        var oldPath = void 0;
        if (rest.includes(" -> ")) {
            var _a = rest.split(" -> "), oldPart = _a[0], newPart = _a[1];
            oldPath = oldPart === null || oldPart === void 0 ? void 0 : oldPart.trim();
            path = (newPart === null || newPart === void 0 ? void 0 : newPart.trim()) || rest;
        }
        if (x && x !== " " && x !== "?") {
            staged.push(toChangedFile(path, x, " ", oldPath));
        }
        if (y && y !== " " && y !== "?") {
            unstaged.push(toChangedFile(path, " ", y, oldPath));
        }
    }
    return { branch: branch, staged: staged, unstaged: unstaged, untracked: untracked };
}
function parseDiffNumstat(numstatOutput) {
    var stats = new Map();
    for (var _i = 0, _a = numstatOutput.trim().split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        if (!line.trim())
            continue;
        var _b = line.split("\t"), addStr = _b[0], delStr = _b[1], pathParts = _b.slice(2);
        var rawPath = pathParts.join("\t");
        if (!rawPath)
            continue;
        var additions = addStr === "-" ? 0 : Number.parseInt(addStr, 10) || 0;
        var deletions = delStr === "-" ? 0 : Number.parseInt(delStr, 10) || 0;
        var entry = { additions: additions, deletions: deletions };
        var renameMatch = rawPath.match(/^(.+) => (.+)$/);
        if (renameMatch) {
            stats.set(renameMatch[1], entry);
            stats.set(renameMatch[2], entry);
        }
        else {
            stats.set(rawPath, entry);
        }
    }
    return stats;
}
function applyNumstatToFiles(cwd, files, args) {
    return __awaiter(this, void 0, void 0, function () {
        var diff, stats, _i, files_1, file, stat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (files.length === 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, runGit(cwd, args)];
                case 1:
                    diff = _a.sent();
                    if (diff.code !== 0)
                        return [2 /*return*/];
                    stats = parseDiffNumstat(diff.stdout);
                    for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                        file = files_1[_i];
                        stat = stats.get(file.path);
                        if (stat) {
                            file.additions = stat.additions;
                            file.deletions = stat.deletions;
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function applyUntrackedLineCount(cwd, files) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                        var fullPath, content, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    fullPath = resolveFilePath(cwd, file.path);
                                    return [4 /*yield*/, Bun.file(fullPath).text()];
                                case 1:
                                    content = _b.sent();
                                    file.additions = content ? content.split("\n").length : 0;
                                    file.deletions = 0;
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function parseNameStatus(output) {
    var files = [];
    for (var _i = 0, _a = output.trim().split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        if (!line.trim())
            continue;
        var parts = line.split("\t");
        var statusCode = parts[0];
        if (!statusCode)
            continue;
        var isRenameOrCopy = statusCode.startsWith("R") || statusCode.startsWith("C");
        var path = isRenameOrCopy ? parts[2] : parts[1];
        var oldPath = isRenameOrCopy ? parts[1] : undefined;
        if (!path)
            continue;
        var status_1 = void 0;
        switch (statusCode[0]) {
            case "A":
                status_1 = "added";
                break;
            case "D":
                status_1 = "deleted";
                break;
            case "R":
                status_1 = "renamed";
                break;
            case "C":
                status_1 = "copied";
                break;
            default:
                status_1 = "modified";
        }
        files.push({
            path: path,
            oldPath: oldPath,
            status: status_1,
            additions: 0,
            deletions: 0,
        });
    }
    return files;
}
function parseGitLog(logOutput) {
    var _a, _b, _c, _d, _e;
    if (!logOutput.trim())
        return [];
    var commits = [];
    var lines = logOutput.trim().split("\n");
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        if (!line.trim())
            continue;
        var parts = line.split("|");
        if (parts.length < 6)
            continue;
        var hash = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim();
        var shortHash = (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim();
        var message = (_c = parts[2]) === null || _c === void 0 ? void 0 : _c.trim();
        var description = parts.slice(3, -2).join("|").trim();
        var author = (_d = parts[parts.length - 2]) === null || _d === void 0 ? void 0 : _d.trim();
        var dateStr = (_e = parts[parts.length - 1]) === null || _e === void 0 ? void 0 : _e.trim();
        if (!hash || !shortHash)
            continue;
        var parsedDate = dateStr ? new Date(dateStr) : new Date();
        commits.push({
            hash: hash,
            shortHash: shortHash,
            message: message || "",
            description: description || undefined,
            author: author || "",
            date: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
            files: [],
        });
    }
    return commits;
}
function refExists(cwd, ref) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(cwd, ["rev-parse", "--verify", "--quiet", "".concat(ref, "^{commit}")])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function resolveFilePath(worktreePath, filePath) {
    var fullPath = (0, path_1.resolve)(worktreePath, filePath);
    var rel = (0, path_1.relative)(worktreePath, fullPath);
    if (rel.startsWith("..") || rel.includes("..".concat(path_1.sep))) {
        throw new Error("Invalid file path");
    }
    return fullPath;
}
function getTrackingStatus(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var tracking, _a, pullStr, pushStr;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, runGit(cwd, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"])];
                case 1:
                    tracking = _b.sent();
                    if (tracking.code !== 0) {
                        return [2 /*return*/, { pushCount: 0, pullCount: 0, hasUpstream: false }];
                    }
                    _a = tracking.stdout.trim().split(/\s+/), pullStr = _a[0], pushStr = _a[1];
                    return [2 /*return*/, {
                            pushCount: Number.parseInt(pushStr || "0", 10),
                            pullCount: Number.parseInt(pullStr || "0", 10),
                            hasUpstream: true,
                        }];
            }
        });
    });
}
function getBranchComparison(cwd, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var baseRef, tracking, _a, behindStr, aheadStr, behind, ahead, logOutput, commits, diffOutput, againstBase;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    baseRef = defaultBranch;
                    return [4 /*yield*/, refExists(cwd, "origin/".concat(defaultBranch))];
                case 1:
                    if (_b.sent()) {
                        baseRef = "origin/".concat(defaultBranch);
                    }
                    return [4 /*yield*/, refExists(cwd, baseRef)];
                case 2:
                    if (!(_b.sent())) {
                        return [2 /*return*/, { commits: [], againstBase: [], ahead: 0, behind: 0 }];
                    }
                    return [4 /*yield*/, runGit(cwd, ["rev-list", "--left-right", "--count", "".concat(baseRef, "...HEAD")])];
                case 3:
                    tracking = _b.sent();
                    _a = tracking.stdout.trim().split(/\s+/), behindStr = _a[0], aheadStr = _a[1];
                    behind = Number.parseInt(behindStr || "0", 10);
                    ahead = Number.parseInt(aheadStr || "0", 10);
                    return [4 /*yield*/, runGit(cwd, [
                            "log",
                            "".concat(baseRef, "..HEAD"),
                            "--format=%H|%h|%s|%b|%an|%aI",
                        ])];
                case 4:
                    logOutput = _b.sent();
                    commits = parseGitLog(logOutput.stdout);
                    return [4 /*yield*/, runGit(cwd, ["diff", "--name-status", "".concat(baseRef, "...HEAD")])];
                case 5:
                    diffOutput = _b.sent();
                    againstBase = parseNameStatus(diffOutput.stdout);
                    return [4 /*yield*/, applyNumstatToFiles(cwd, againstBase, ["diff", "--numstat", "".concat(baseRef, "...HEAD")])];
                case 6:
                    _b.sent();
                    return [2 /*return*/, { commits: commits, againstBase: againstBase, ahead: ahead, behind: behind }];
            }
        });
    });
}
function getLocalBranchesWithDates(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var result, branches, _i, _a, line, _b, branch, dateStr, timestamp;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, runGit(cwd, [
                        "for-each-ref",
                        "--format=%(refname:short)|%(committerdate:unix)",
                        "refs/heads",
                    ])];
                case 1:
                    result = _c.sent();
                    branches = [];
                    if (result.code !== 0)
                        return [2 /*return*/, branches];
                    for (_i = 0, _a = result.stdout.trim().split("\n"); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line.trim())
                            continue;
                        _b = line.split("|"), branch = _b[0], dateStr = _b[1];
                        timestamp = Number.parseInt(dateStr || "0", 10) * 1000;
                        branches.push({ branch: branch || "", lastCommitDate: Number.isNaN(timestamp) ? 0 : timestamp });
                    }
                    return [2 /*return*/, branches];
            }
        });
    });
}
function getCheckedOutBranches(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var result, lines, checkedOut, currentPath, _i, lines_3, line, branchRef, branch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(cwd, ["worktree", "list", "--porcelain"])];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0)
                        return [2 /*return*/, {}];
                    lines = result.stdout.split("\n");
                    checkedOut = {};
                    currentPath = null;
                    for (_i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
                        line = lines_3[_i];
                        if (line.startsWith("worktree ")) {
                            currentPath = line.slice("worktree ".length).trim();
                        }
                        else if (line.startsWith("branch ") && currentPath) {
                            branchRef = line.slice("branch ".length).trim();
                            branch = branchRef.replace("refs/heads/", "");
                            checkedOut[branch] = currentPath;
                        }
                    }
                    return [2 /*return*/, checkedOut];
            }
        });
    });
}
function ensureWorktreeRegistered(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var db, chat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                case 1:
                    db = _a.sent();
                    chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.worktreePath, worktreePath)).get();
                    return [2 /*return*/, !!chat];
            }
        });
    });
}
function createChangesHandlers() {
    var _this = this;
    return {
        changesGetStatus: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var statusResult, parsed, resolvedDefault, _c, branchComparison, trackingStatus, result;
            var worktreePath = _b.worktreePath, defaultBranch = _b.defaultBranch;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["status", "--porcelain=1", "-b"])];
                    case 1:
                        statusResult = _d.sent();
                        parsed = parsePorcelainStatus(statusResult.stdout || "");
                        _c = defaultBranch;
                        if (_c) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, git_worktree_1.getDefaultBranch)(worktreePath)];
                    case 2:
                        _c = (_d.sent());
                        _d.label = 3;
                    case 3:
                        resolvedDefault = _c;
                        return [4 /*yield*/, getBranchComparison(worktreePath, resolvedDefault)];
                    case 4:
                        branchComparison = _d.sent();
                        return [4 /*yield*/, getTrackingStatus(worktreePath)];
                    case 5:
                        trackingStatus = _d.sent();
                        return [4 /*yield*/, Promise.all([
                                applyNumstatToFiles(worktreePath, parsed.staged, ["diff", "--cached", "--numstat"]),
                                applyNumstatToFiles(worktreePath, parsed.unstaged, ["diff", "--numstat"]),
                                applyUntrackedLineCount(worktreePath, parsed.untracked),
                            ])];
                    case 6:
                        _d.sent();
                        result = {
                            branch: parsed.branch || "HEAD",
                            defaultBranch: resolvedDefault,
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
                        return [2 /*return*/, result];
                }
            });
        }); },
        changesGetBranches: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var branchResult, lines, localBranches, remote, current, _i, lines_4, line, trimmed, remoteName, local, defaultBranch, checkedOutBranches, _c;
            var _d;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["branch", "-a"])];
                    case 1:
                        branchResult = _e.sent();
                        lines = branchResult.stdout.split("\n");
                        localBranches = [];
                        remote = [];
                        current = "";
                        for (_i = 0, lines_4 = lines; _i < lines_4.length; _i++) {
                            line = lines_4[_i];
                            trimmed = line.replace(/^\*\s*/, "").trim();
                            if (!trimmed)
                                continue;
                            if (line.startsWith("*")) {
                                current = trimmed;
                            }
                            if (trimmed.startsWith("remotes/origin/")) {
                                remoteName = trimmed.replace("remotes/origin/", "");
                                if (remoteName !== "HEAD")
                                    remote.push(remoteName);
                            }
                            else if (!trimmed.startsWith("remotes/")) {
                                localBranches.push(trimmed);
                            }
                        }
                        return [4 /*yield*/, getLocalBranchesWithDates(worktreePath)];
                    case 2:
                        local = _e.sent();
                        return [4 /*yield*/, (0, git_worktree_1.getDefaultBranch)(worktreePath)];
                    case 3:
                        defaultBranch = _e.sent();
                        return [4 /*yield*/, getCheckedOutBranches(worktreePath)];
                    case 4:
                        checkedOutBranches = _e.sent();
                        _d = {};
                        _c = current;
                        if (_c) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, git_worktree_1.getDefaultBranch)(worktreePath)];
                    case 5:
                        _c = (_e.sent());
                        _e.label = 6;
                    case 6: return [2 /*return*/, (_d.current = _c,
                            _d.local = local,
                            _d.remote = remote.sort(),
                            _d.defaultBranch = defaultBranch,
                            _d.checkedOutBranches = checkedOutBranches,
                            _d)];
                }
            });
        }); },
        changesFetch: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["fetch", "--all", "--prune"])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to fetch");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesFetchRemote: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["fetch", "--all", "--prune"])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to fetch");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesCheckout: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var status, result;
            var worktreePath = _b.worktreePath, branch = _b.branch;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["status", "--porcelain"])];
                    case 1:
                        status = _c.sent();
                        if (status.stdout.trim()) {
                            throw new Error("Cannot switch branches: you have uncommitted changes. Please commit or stash your changes first.");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["checkout", branch])];
                    case 2:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to checkout branch");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesGetHistory: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, _c = _b.limit, limit = _c === void 0 ? 50 : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, [
                            "log",
                            "-".concat(limit),
                            "--format=%H|%h|%s|%an|%ae|%aI",
                        ])];
                    case 1:
                        result = _d.sent();
                        if (!result.stdout.trim())
                            return [2 /*return*/, []];
                        return [2 /*return*/, result.stdout
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
        }); },
        changesCommit: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var staged, result, hashResult;
            var worktreePath = _b.worktreePath, message = _b.message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!message.trim()) {
                            throw new Error("Commit message cannot be empty");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["diff", "--cached", "--name-only"])];
                    case 1:
                        staged = _c.sent();
                        if (!staged.stdout.trim()) {
                            throw new Error("No files staged for commit");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["commit", "-m", message])];
                    case 2:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Commit failed");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["rev-parse", "HEAD"])];
                    case 3:
                        hashResult = _c.sent();
                        return [2 /*return*/, { success: true, hash: hashResult.stdout.trim() }];
                }
            });
        }); },
        changesAtomicCommit: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var addResult, staged, commitResult, hashResult;
            var worktreePath = _b.worktreePath, filePaths = _b.filePaths, message = _b.message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!message.trim()) {
                            throw new Error("Commit message cannot be empty");
                        }
                        if (!filePaths.length) {
                            throw new Error("No files selected for commit");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["reset", "HEAD"])];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, runGit(worktreePath, __spreadArray(["add", "--"], filePaths, true))];
                    case 2:
                        addResult = _c.sent();
                        if (addResult.code !== 0) {
                            throw new Error(addResult.stderr || addResult.stdout || "Failed to stage files");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["diff", "--cached", "--name-only"])];
                    case 3:
                        staged = _c.sent();
                        if (!staged.stdout.trim()) {
                            throw new Error("Failed to stage files for commit");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["commit", "-m", message])];
                    case 4:
                        commitResult = _c.sent();
                        if (commitResult.code !== 0) {
                            throw new Error(commitResult.stderr || commitResult.stdout || "Commit failed");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["rev-parse", "HEAD"])];
                    case 5:
                        hashResult = _c.sent();
                        return [2 /*return*/, { success: true, hash: hashResult.stdout.trim() }];
                }
            });
        }); },
        changesPush: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var upstreamCheck, hasUpstream, branch, branchName, result, result;
            var worktreePath = _b.worktreePath, setUpstream = _b.setUpstream;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["rev-parse", "--abbrev-ref", "@{upstream}"])];
                    case 1:
                        upstreamCheck = _c.sent();
                        hasUpstream = upstreamCheck.code === 0;
                        if (!(setUpstream && !hasUpstream)) return [3 /*break*/, 4];
                        return [4 /*yield*/, runGit(worktreePath, ["rev-parse", "--abbrev-ref", "HEAD"])];
                    case 2:
                        branch = _c.sent();
                        branchName = branch.stdout.trim();
                        return [4 /*yield*/, runGit(worktreePath, ["push", "--set-upstream", "origin", branchName])];
                    case 3:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Push failed");
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, runGit(worktreePath, ["push"])];
                    case 5:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Push failed");
                        }
                        _c.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesForcePush: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var branch, branchName, result;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["rev-parse", "--abbrev-ref", "HEAD"])];
                    case 1:
                        branch = _c.sent();
                        branchName = branch.stdout.trim();
                        if (PROTECTED_BRANCHES.includes(branchName)) {
                            throw new Error("Cannot force push protected branch '".concat(branchName, "'"));
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["push", "--force-with-lease"])];
                    case 2:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Force push failed");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesPull: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var status, hasChanges, stashed, stashResult, pullResult;
            var worktreePath = _b.worktreePath, autoStash = _b.autoStash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["status", "--porcelain"])];
                    case 1:
                        status = _c.sent();
                        hasChanges = !!status.stdout.trim();
                        stashed = false;
                        if (!hasChanges) return [3 /*break*/, 3];
                        if (!autoStash) {
                            throw new Error("Cannot pull with uncommitted changes. Please commit or stash your changes first, or enable auto-stash.");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["stash", "push", "-u", "-m", "auto-stash"])];
                    case 2:
                        stashResult = _c.sent();
                        if (stashResult.code === 0) {
                            stashed = true;
                        }
                        _c.label = 3;
                    case 3: return [4 /*yield*/, runGit(worktreePath, ["pull", "--rebase"])];
                    case 4:
                        pullResult = _c.sent();
                        if (pullResult.code !== 0) {
                            throw new Error(pullResult.stderr || pullResult.stdout || "Pull failed");
                        }
                        if (!stashed) return [3 /*break*/, 6];
                        return [4 /*yield*/, runGit(worktreePath, ["stash", "pop"])];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesMergeFromDefault: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var status, defaultBranch, baseRef, result, message;
            var worktreePath = _b.worktreePath, useRebase = _b.useRebase;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["status", "--porcelain"])];
                    case 1:
                        status = _c.sent();
                        if (status.stdout.trim()) {
                            throw new Error("Cannot merge/rebase with uncommitted changes. Please commit or stash your changes first.");
                        }
                        return [4 /*yield*/, runGit(worktreePath, ["fetch", "--all"])];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, (0, git_worktree_1.getDefaultBranch)(worktreePath)];
                    case 3:
                        defaultBranch = _c.sent();
                        return [4 /*yield*/, refExists(worktreePath, "origin/".concat(defaultBranch))];
                    case 4:
                        baseRef = (_c.sent())
                            ? "origin/".concat(defaultBranch)
                            : defaultBranch;
                        return [4 /*yield*/, runGit(worktreePath, useRebase ? ["rebase", baseRef] : ["merge", baseRef, "--no-edit"])];
                    case 5:
                        result = _c.sent();
                        if (!(result.code !== 0)) return [3 /*break*/, 10];
                        message = result.stderr || result.stdout || "Merge/rebase failed";
                        if (!useRebase) return [3 /*break*/, 7];
                        return [4 /*yield*/, runGit(worktreePath, ["rebase", "--abort"]).catch(function () { })];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, runGit(worktreePath, ["merge", "--abort"]).catch(function () { })];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9: throw new Error(message);
                    case 10: return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesCreateBranch: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var branchRegex, invalidPatterns, _i, invalidPatterns_1, pattern, branchList, startPoint, result;
            var projectPath = _b.projectPath, branchName = _b.branchName, baseBranch = _b.baseBranch;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        branchRegex = /^[a-zA-Z0-9._/-]+$/;
                        invalidPatterns = [/^-/, /\.\./, /\.$/, /^\./, /@\{/, /\\/, /\s/];
                        if (!branchRegex.test(branchName)) {
                            throw new Error("Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes");
                        }
                        for (_i = 0, invalidPatterns_1 = invalidPatterns; _i < invalidPatterns_1.length; _i++) {
                            pattern = invalidPatterns_1[_i];
                            if (pattern.test(branchName)) {
                                throw new Error("Invalid branch name: '".concat(branchName, "'"));
                            }
                        }
                        if (branchName.length > 250) {
                            throw new Error("Branch name too long (max 250 characters)");
                        }
                        return [4 /*yield*/, runGit(projectPath, ["branch", "-a"])];
                    case 1:
                        branchList = _c.sent();
                        if (branchList.stdout.split("\n").some(function (line) { return line.replace(/^\*\s*/, "").trim() === branchName; })) {
                            throw new Error("Branch '".concat(branchName, "' already exists"));
                        }
                        startPoint = baseBranch;
                        return [4 /*yield*/, refExists(projectPath, "origin/".concat(baseBranch))];
                    case 2:
                        if (_c.sent()) {
                            startPoint = "origin/".concat(baseBranch);
                        }
                        return [4 /*yield*/, runGit(projectPath, ["branch", branchName, startPoint])];
                    case 3:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to create branch");
                        }
                        return [2 /*return*/, { success: true, branchName: branchName }];
                }
            });
        }); },
        changesGetCommitFiles: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var nameStatus, files;
            var worktreePath = _b.worktreePath, commitHash = _b.commitHash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, [
                            "diff-tree",
                            "--no-commit-id",
                            "--name-status",
                            "-r",
                            commitHash,
                        ])];
                    case 1:
                        nameStatus = _c.sent();
                        files = parseNameStatus(nameStatus.stdout);
                        return [4 /*yield*/, applyNumstatToFiles(worktreePath, files, [
                                "diff-tree",
                                "--no-commit-id",
                                "--numstat",
                                "-r",
                                commitHash,
                            ])];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, files];
                }
            });
        }); },
        changesGetCommitFileDiff: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var diff;
            var worktreePath = _b.worktreePath, commitHash = _b.commitHash, filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["diff", "".concat(commitHash, "^"), commitHash, "--", filePath])];
                    case 1:
                        diff = _c.sent();
                        return [2 /*return*/, diff.stdout];
                }
            });
        }); },
        changesIsWorktreeRegistered: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                return [2 /*return*/, ensureWorktreeRegistered(worktreePath)];
            });
        }); },
        changesGetGitHubStatus: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                return [2 /*return*/, (0, github_1.fetchGitHubPRStatus)(worktreePath)];
            });
        }); },
        changesStageFile: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["add", "--", filePath])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to stage file");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesUnstageFile: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["reset", "HEAD", "--", filePath])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to unstage file");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesDiscardChanges: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["checkout", "--", filePath])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to discard changes");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesStageAll: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["add", "-A"])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to stage files");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesUnstageAll: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, runGit(worktreePath, ["reset", "HEAD"])];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to unstage files");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesStageFiles: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePaths = _b.filePaths;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (filePaths.length === 0)
                            return [2 /*return*/, { success: true }];
                        return [4 /*yield*/, runGit(worktreePath, __spreadArray(["add", "--"], filePaths, true))];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to stage files");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesUnstageFiles: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePaths = _b.filePaths;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (filePaths.length === 0)
                            return [2 /*return*/, { success: true }];
                        return [4 /*yield*/, runGit(worktreePath, __spreadArray(["reset", "HEAD", "--"], filePaths, true))];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to unstage files");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesDeleteUntracked: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var fullPath;
            var worktreePath = _b.worktreePath, filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fullPath = resolveFilePath(worktreePath, filePath);
                        return [4 /*yield*/, (0, promises_1.rm)(fullPath, { recursive: true, force: true })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesDiscardMultipleChanges: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var result;
            var worktreePath = _b.worktreePath, filePaths = _b.filePaths;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (filePaths.length === 0)
                            return [2 /*return*/, { success: true }];
                        return [4 /*yield*/, runGit(worktreePath, __spreadArray(["checkout", "--"], filePaths, true))];
                    case 1:
                        result = _c.sent();
                        if (result.code !== 0) {
                            throw new Error(result.stderr || result.stdout || "Failed to discard changes");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        changesDeleteMultipleUntracked: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var worktreePath = _b.worktreePath, filePaths = _b.filePaths;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all(filePaths.map(function (filePath) { return (0, promises_1.rm)(resolveFilePath(worktreePath, filePath), { recursive: true, force: true }); }))];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
    };
}
