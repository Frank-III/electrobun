"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.sanitizeProjectName = sanitizeProjectName;
exports.generateBranchName = generateBranchName;
exports.generateWorktreeFolderName = generateWorktreeFolderName;
exports.removeWorktree = removeWorktree;
exports.getCurrentBranch = getCurrentBranch;
exports.hasUpstream = hasUpstream;
exports.refExistsLocally = refExistsLocally;
exports.getDefaultBranch = getDefaultBranch;
exports.sanitizeGitError = sanitizeGitError;
exports.branchExistsOnRemote = branchExistsOnRemote;
exports.createWorktreeForChat = createWorktreeForChat;
exports.getWorktreeDiff = getWorktreeDiff;
exports.getWorktreeStatus = getWorktreeStatus;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var shell_env_1 = require("./shell-env");
var worktree_config_1 = require("./worktree-config");
var DEFAULT_BRANCH_CANDIDATES = ["main", "master", "develop", "trunk"];
var adjectives = [
    "brisk",
    "calm",
    "bright",
    "swift",
    "quiet",
    "bold",
    "gentle",
    "eager",
];
var landscapes = [
    "ridge",
    "meadow",
    "summit",
    "valley",
    "forest",
    "river",
    "canyon",
    "dune",
];
function randomHex(bytes) {
    if (bytes === void 0) { bytes = 3; }
    return (0, crypto_1.randomBytes)(bytes).toString("hex");
}
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
function getGitEnv() {
    return __awaiter(this, void 0, void 0, function () {
        var shellEnv, combined, _i, _a, _b, key, value, _c, _d, _e, key, value;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, shell_env_1.getShellEnvironment)()];
                case 1:
                    shellEnv = _f.sent();
                    combined = {};
                    for (_i = 0, _a = Object.entries(process.env); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (typeof value === "string") {
                            combined[key] = value;
                        }
                    }
                    for (_c = 0, _d = Object.entries(shellEnv); _c < _d.length; _c++) {
                        _e = _d[_c], key = _e[0], value = _e[1];
                        if (typeof value === "string") {
                            combined[key] = value;
                        }
                    }
                    if (shellEnv.PATH) {
                        combined.PATH = shellEnv.PATH;
                    }
                    return [2 /*return*/, combined];
            }
        });
    });
}
function runGit(args, cwd, envOverride) {
    return __awaiter(this, void 0, void 0, function () {
        var env, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!envOverride) return [3 /*break*/, 2];
                    _b = [{}];
                    return [4 /*yield*/, getGitEnv()];
                case 1:
                    _a = __assign.apply(void 0, [__assign.apply(void 0, _b.concat([(_c.sent())])), envOverride]);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getGitEnv()];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    env = _a;
                    return [2 /*return*/, (0, shell_env_1.runCommand)("git", args, { cwd: cwd, env: env })];
            }
        });
    });
}
function isGitRepo(path) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "--git-dir"], path)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function hasOriginRemote(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["remote"], repoPath)];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0)
                        return [2 /*return*/, false];
                    return [2 /*return*/, result.stdout
                            .split("\n")
                            .map(function (line) { return line.trim(); })
                            .filter(Boolean)
                            .includes("origin")];
            }
        });
    });
}
function sanitizeProjectName(name) {
    var sanitized = name
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9\-.]/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
    return sanitized || "project";
}
function generateBranchName() {
    var name = "".concat(pickRandom(adjectives), "-").concat(pickRandom(landscapes));
    var suffix = randomHex(3);
    return "".concat(name, "-").concat(suffix);
}
function generateWorktreeFolderName(parentDir) {
    for (var attempt = 0; attempt < 10; attempt += 1) {
        var name_1 = "".concat(pickRandom(adjectives), "-").concat(pickRandom(landscapes), "-").concat(randomHex(2));
        if (!(0, fs_1.existsSync)((0, path_1.join)(parentDir, name_1))) {
            return name_1;
        }
    }
    var fallback = "worktree-".concat(Date.now().toString(36), "-").concat(randomHex(2));
    return fallback;
}
function repoUsesLfs(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var lfsDir, stats, _a, attributeFiles, _i, attributeFiles_1, filePath, content, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    lfsDir = (0, path_1.join)(repoPath, ".git", "lfs");
                    return [4 /*yield*/, (0, promises_1.stat)(lfsDir)];
                case 1:
                    stats = _c.sent();
                    if (stats.isDirectory()) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _c.sent();
                    return [3 /*break*/, 3];
                case 3:
                    attributeFiles = [
                        (0, path_1.join)(repoPath, ".gitattributes"),
                        (0, path_1.join)(repoPath, ".git", "info", "attributes"),
                        (0, path_1.join)(repoPath, ".lfsconfig"),
                    ];
                    _i = 0, attributeFiles_1 = attributeFiles;
                    _c.label = 4;
                case 4:
                    if (!(_i < attributeFiles_1.length)) return [3 /*break*/, 9];
                    filePath = attributeFiles_1[_i];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, "utf-8")];
                case 6:
                    content = _c.sent();
                    if (content.includes("filter=lfs") || content.includes("[lfs]")) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 8];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9: return [2 /*return*/, false];
            }
        });
    });
}
function resolveCommitHash(repoPath, startPoint) {
    return __awaiter(this, void 0, void 0, function () {
        var attempt, localBranch, localAttempt, fallback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "".concat(startPoint, "^{commit}")], repoPath)];
                case 1:
                    attempt = _a.sent();
                    if (attempt.code === 0 && attempt.stdout.trim()) {
                        return [2 /*return*/, attempt.stdout.trim()];
                    }
                    if (!startPoint.startsWith("origin/")) return [3 /*break*/, 3];
                    localBranch = startPoint.replace(/^origin\//, "");
                    return [4 /*yield*/, runGit(["rev-parse", "".concat(localBranch, "^{commit}")], repoPath)];
                case 2:
                    localAttempt = _a.sent();
                    if (localAttempt.code === 0 && localAttempt.stdout.trim()) {
                        return [2 /*return*/, localAttempt.stdout.trim()];
                    }
                    _a.label = 3;
                case 3: return [4 /*yield*/, runGit(["rev-parse", startPoint], repoPath)];
                case 4:
                    fallback = _a.sent();
                    if (fallback.code !== 0 || !fallback.stdout.trim()) {
                        throw new Error("Failed to resolve start point ".concat(startPoint));
                    }
                    return [2 /*return*/, fallback.stdout.trim()];
            }
        });
    });
}
function createWorktree(mainRepoPath_1, branch_1, worktreePath_1) {
    return __awaiter(this, arguments, void 0, function (mainRepoPath, branch, worktreePath, startPoint) {
        var usesLfs, parentDir, env, lfsAvailable, commitHash, result, errorMessage, lower, isLockError, isLfsError;
        if (startPoint === void 0) { startPoint = "origin/main"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, repoUsesLfs(mainRepoPath)];
                case 1:
                    usesLfs = _a.sent();
                    parentDir = (0, path_1.join)(worktreePath, "..");
                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, getGitEnv()];
                case 3:
                    env = _a.sent();
                    if (!usesLfs) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, shell_env_1.checkGitLfsAvailable)(env)];
                case 4:
                    lfsAvailable = _a.sent();
                    if (!lfsAvailable) {
                        throw new Error("This repository uses Git LFS, but git-lfs was not found. Please install git-lfs and run 'git lfs install'.");
                    }
                    _a.label = 5;
                case 5: return [4 /*yield*/, resolveCommitHash(mainRepoPath, startPoint)];
                case 6:
                    commitHash = _a.sent();
                    return [4 /*yield*/, runGit(["-C", mainRepoPath, "worktree", "add", worktreePath, "-b", branch, commitHash], mainRepoPath, env)];
                case 7:
                    result = _a.sent();
                    if (result.code !== 0) {
                        errorMessage = (result.stderr || result.stdout || "Failed to create worktree").trim();
                        lower = errorMessage.toLowerCase();
                        isLockError = lower.includes("could not lock") ||
                            lower.includes("unable to lock") ||
                            (lower.includes(".lock") && lower.includes("file exists"));
                        if (isLockError) {
                            throw new Error("Failed to create worktree: The git repository is locked by another process. Please try again after the lock is released.");
                        }
                        isLfsError = lower.includes("git-lfs") ||
                            lower.includes("filter-process") ||
                            lower.includes("smudge filter") ||
                            (lower.includes("lfs") && usesLfs);
                        if (isLfsError) {
                            throw new Error("Failed to create worktree: Git LFS is required but not available. Install git-lfs and run 'git lfs install'.");
                        }
                        throw new Error("Failed to create worktree: ".concat(errorMessage));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function removeWorktree(mainRepoPath, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var env, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGitEnv()];
                case 1:
                    env = _a.sent();
                    return [4 /*yield*/, runGit(["-C", mainRepoPath, "worktree", "remove", worktreePath, "--force"], mainRepoPath, env)];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        return [2 /*return*/, { success: false, error: (result.stderr || result.stdout || "Unknown error").trim() }];
                    }
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
function getCurrentBranch(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var result, trimmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "--abbrev-ref", "HEAD"], repoPath)];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0)
                        return [2 /*return*/, null];
                    trimmed = result.stdout.trim();
                    return [2 /*return*/, trimmed && trimmed !== "HEAD" ? trimmed : null];
            }
        });
    });
}
function hasUpstream(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "--abbrev-ref", "@{upstream}"], repoPath)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0 && result.stdout.trim().length > 0];
            }
        });
    });
}
function refExistsLocally(repoPath, ref) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "--verify", "--quiet", "".concat(ref, "^{commit}")], repoPath)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function getDefaultBranch(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var hasRemote, headRef, match, remoteBranches, branches, _i, DEFAULT_BRANCH_CANDIDATES_1, candidate, lsRemote, match, currentBranch, localBranches, branches, _a, DEFAULT_BRANCH_CANDIDATES_2, candidate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, hasOriginRemote(repoPath)];
                case 1:
                    hasRemote = _b.sent();
                    if (!hasRemote) return [3 /*break*/, 5];
                    return [4 /*yield*/, runGit(["symbolic-ref", "refs/remotes/origin/HEAD"], repoPath)];
                case 2:
                    headRef = _b.sent();
                    if (headRef.code === 0) {
                        match = headRef.stdout.trim().match(/refs\/remotes\/origin\/(.+)/);
                        if (match)
                            return [2 /*return*/, match[1]];
                    }
                    return [4 /*yield*/, runGit(["branch", "-r"], repoPath)];
                case 3:
                    remoteBranches = _b.sent();
                    if (remoteBranches.code === 0) {
                        branches = remoteBranches.stdout
                            .split("\n")
                            .map(function (line) { return line.trim(); })
                            .filter(function (line) { return line.startsWith("origin/") && !line.includes("->"); })
                            .map(function (line) { return line.replace("origin/", ""); });
                        for (_i = 0, DEFAULT_BRANCH_CANDIDATES_1 = DEFAULT_BRANCH_CANDIDATES; _i < DEFAULT_BRANCH_CANDIDATES_1.length; _i++) {
                            candidate = DEFAULT_BRANCH_CANDIDATES_1[_i];
                            if (branches.includes(candidate)) {
                                return [2 /*return*/, candidate];
                            }
                        }
                    }
                    return [4 /*yield*/, runGit(["ls-remote", "--symref", "origin", "HEAD"], repoPath)];
                case 4:
                    lsRemote = _b.sent();
                    if (lsRemote.code === 0) {
                        match = lsRemote.stdout.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
                        if (match)
                            return [2 /*return*/, match[1]];
                    }
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, getCurrentBranch(repoPath)];
                case 6:
                    currentBranch = _b.sent();
                    if (currentBranch)
                        return [2 /*return*/, currentBranch];
                    return [4 /*yield*/, runGit(["branch", "--list"], repoPath)];
                case 7:
                    localBranches = _b.sent();
                    if (localBranches.code === 0) {
                        branches = localBranches.stdout
                            .split("\n")
                            .map(function (line) { return line.replace(/^\*?\s*/, "").trim(); })
                            .filter(Boolean);
                        for (_a = 0, DEFAULT_BRANCH_CANDIDATES_2 = DEFAULT_BRANCH_CANDIDATES; _a < DEFAULT_BRANCH_CANDIDATES_2.length; _a++) {
                            candidate = DEFAULT_BRANCH_CANDIDATES_2[_a];
                            if (branches.includes(candidate)) {
                                return [2 /*return*/, candidate];
                            }
                        }
                        if (branches.length > 0) {
                            return [2 /*return*/, branches[0]];
                        }
                    }
                    _b.label = 8;
                case 8: return [2 /*return*/, "main"];
            }
        });
    });
}
function sanitizeGitError(message) {
    return message.replace(/^fatal:\s*/i, "").replace(/^error:\s*/i, "").replace(/\n+/g, " ").trim();
}
function branchExistsOnRemote(worktreePath, branchName) {
    return __awaiter(this, void 0, void 0, function () {
        var env, result, message, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getGitEnv()];
                case 1:
                    env = _a.sent();
                    return [4 /*yield*/, runGit(["-C", worktreePath, "ls-remote", "--exit-code", "--heads", "origin", branchName], worktreePath, env)];
                case 2:
                    result = _a.sent();
                    if (result.code === 0) {
                        return [2 /*return*/, { status: "exists" }];
                    }
                    if (result.code === 2) {
                        return [2 /*return*/, { status: "not_found" }];
                    }
                    message = sanitizeGitError((result.stderr || result.stdout || "").trim());
                    return [2 /*return*/, {
                            status: "error",
                            message: message || "Failed to verify branch",
                        }];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            status: "error",
                            message: error_1 instanceof Error ? error_1.message : "Failed to verify branch",
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createWorktreeForChat(projectPath, projectSlug, chatId, selectedBaseBranch, branchType) {
    return __awaiter(this, void 0, void 0, function () {
        var isRepo, baseBranch, _a, branch, worktreesDir, projectWorktreeDir, folderName, worktreePath, startPoint, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, isGitRepo(projectPath)];
                case 1:
                    isRepo = _b.sent();
                    if (!isRepo) {
                        return [2 /*return*/, { success: true, worktreePath: projectPath }];
                    }
                    _a = selectedBaseBranch;
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, getDefaultBranch(projectPath)];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    baseBranch = _a;
                    branch = generateBranchName();
                    worktreesDir = (0, path_1.join)((0, os_1.homedir)(), ".21st", "worktrees");
                    projectWorktreeDir = (0, path_1.join)(worktreesDir, projectSlug);
                    folderName = generateWorktreeFolderName(projectWorktreeDir);
                    worktreePath = (0, path_1.join)(projectWorktreeDir, folderName);
                    startPoint = branchType === "local" ? baseBranch : "origin/".concat(baseBranch);
                    return [4 /*yield*/, createWorktree(projectPath, branch, worktreePath, startPoint)];
                case 4:
                    _b.sent();
                    (0, worktree_config_1.executeWorktreeSetup)(worktreePath, projectPath)
                        .then(function (setupResult) {
                        if (!setupResult.success) {
                            console.warn("[worktree] Setup completed with errors: ".concat(setupResult.errors.join(", ")));
                        }
                        else {
                            console.log("[worktree] Setup completed successfully for ".concat(chatId));
                        }
                    })
                        .catch(function (setupError) {
                        console.warn("[worktree] Setup failed: ".concat(setupError));
                    });
                    return [2 /*return*/, { success: true, worktreePath: worktreePath, branch: branch, baseBranch: baseBranch }];
                case 5:
                    error_2 = _b.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : "Unknown error",
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getWorktreeDiff(worktreePath, baseBranch, options) {
    return __awaiter(this, void 0, void 0, function () {
        var status_1, statusLines, hasChanges, exclusionArgs, workingDiff, untrackedFiles, devNull, untrackedDiffs, _i, untrackedFiles_1, file, diff_1, text, combinedDiff, targetBranch, _a, baseRef, diff, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, runGit(["status", "--porcelain"], worktreePath)];
                case 1:
                    status_1 = _b.sent();
                    statusLines = status_1.stdout.split("\n").filter(Boolean);
                    hasChanges = statusLines.length > 0;
                    if (!hasChanges) return [3 /*break*/, 7];
                    exclusionArgs = [
                        ":!*.lock",
                        ":!*-lock.*",
                        ":!package-lock.json",
                        ":!pnpm-lock.yaml",
                        ":!yarn.lock",
                    ];
                    return [4 /*yield*/, runGit(__spreadArray(["diff", "HEAD", "--no-color", "--"], exclusionArgs, true), worktreePath)];
                case 2:
                    workingDiff = _b.sent();
                    untrackedFiles = statusLines
                        .filter(function (line) { return line.startsWith("?? "); })
                        .map(function (line) { return line.slice(3); })
                        .filter(function (file) {
                        if (file.endsWith(".lock"))
                            return false;
                        if (file.includes("-lock."))
                            return false;
                        if (file.endsWith("package-lock.json"))
                            return false;
                        if (file.endsWith("pnpm-lock.yaml"))
                            return false;
                        if (file.endsWith("yarn.lock"))
                            return false;
                        return true;
                    });
                    devNull = process.platform === "win32" ? "NUL" : "/dev/null";
                    untrackedDiffs = [];
                    _i = 0, untrackedFiles_1 = untrackedFiles;
                    _b.label = 3;
                case 3:
                    if (!(_i < untrackedFiles_1.length)) return [3 /*break*/, 6];
                    file = untrackedFiles_1[_i];
                    return [4 /*yield*/, runGit(["diff", "--no-color", "--no-index", devNull, file], worktreePath)];
                case 4:
                    diff_1 = _b.sent();
                    text = diff_1.stdout || diff_1.stderr || "";
                    if (text.includes("diff --git")) {
                        untrackedDiffs.push(text.substring(text.indexOf("diff --git")));
                    }
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    combinedDiff = [workingDiff.stdout, untrackedDiffs.join("\n")]
                        .filter(Boolean)
                        .join("\n");
                    return [2 /*return*/, { success: true, diff: combinedDiff }];
                case 7:
                    if (options === null || options === void 0 ? void 0 : options.onlyUncommitted) {
                        return [2 /*return*/, { success: true, diff: "" }];
                    }
                    _a = baseBranch;
                    if (_a) return [3 /*break*/, 9];
                    return [4 /*yield*/, getDefaultBranch(worktreePath)];
                case 8:
                    _a = (_b.sent());
                    _b.label = 9;
                case 9:
                    targetBranch = _a;
                    return [4 /*yield*/, refExistsLocally(worktreePath, "origin/".concat(targetBranch))];
                case 10:
                    baseRef = (_b.sent())
                        ? "origin/".concat(targetBranch)
                        : targetBranch;
                    return [4 /*yield*/, runGit([
                            "diff",
                            "".concat(baseRef, "...HEAD"),
                            "--no-color",
                            "--",
                            ":!*.lock",
                            ":!*-lock.*",
                            ":!package-lock.json",
                            ":!pnpm-lock.yaml",
                            ":!yarn.lock",
                        ], worktreePath)];
                case 11:
                    diff = _b.sent();
                    return [2 /*return*/, { success: true, diff: diff.stdout || "" }];
                case 12:
                    error_3 = _b.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_3 instanceof Error ? error_3.message : "Unknown error",
                        }];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function getWorktreeStatus(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var status, lines;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["status", "--porcelain"], worktreePath)];
                case 1:
                    status = _a.sent();
                    if (status.code !== 0)
                        return [2 /*return*/, null];
                    lines = status.stdout.split("\n").filter(Boolean);
                    return [2 /*return*/, { uncommittedCount: lines.length }];
            }
        });
    });
}
