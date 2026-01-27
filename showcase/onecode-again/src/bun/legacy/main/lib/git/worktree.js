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
exports.generateBranchName = generateBranchName;
exports.createWorktree = createWorktree;
exports.removeWorktree = removeWorktree;
exports.getGitRoot = getGitRoot;
exports.worktreeExists = worktreeExists;
exports.hasOriginRemote = hasOriginRemote;
exports.getDefaultBranch = getDefaultBranch;
exports.fetchDefaultBranch = fetchDefaultBranch;
exports.refreshDefaultBranch = refreshDefaultBranch;
exports.checkNeedsRebase = checkNeedsRebase;
exports.hasUncommittedChanges = hasUncommittedChanges;
exports.hasUnpushedCommits = hasUnpushedCommits;
exports.branchExistsOnRemote = branchExistsOnRemote;
exports.detectBaseBranch = detectBaseBranch;
exports.listBranches = listBranches;
exports.getCurrentBranch = getCurrentBranch;
exports.checkBranchCheckoutSafety = checkBranchCheckoutSafety;
exports.checkoutBranch = checkoutBranch;
exports.refExistsLocally = refExistsLocally;
exports.sanitizeGitError = sanitizeGitError;
exports.safeCheckoutBranch = safeCheckoutBranch;
exports.createWorktreeForChat = createWorktreeForChat;
exports.getWorktreeDiff = getWorktreeDiff;
exports.commitWorktreeChanges = commitWorktreeChanges;
exports.mergeWorktreeToMain = mergeWorktreeToMain;
exports.pushWorktreeBranch = pushWorktreeBranch;
exports.getGitStatus = getGitStatus;
var node_child_process_1 = require("node:child_process");
var node_crypto_1 = require("node:crypto");
var promises_1 = require("node:fs/promises");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var node_util_1 = require("node:util");
var simple_git_1 = require("simple-git");
var unique_names_generator_1 = require("unique-names-generator");
var shell_env_1 = require("./shell-env");
var worktree_config_1 = require("./worktree-config");
var worktree_naming_1 = require("./worktree-naming");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
function isExecFileException(error) {
    return (error instanceof Error &&
        ("code" in error || "signal" in error || "killed" in error));
}
function getGitEnv() {
    return __awaiter(this, void 0, void 0, function () {
        var shellEnv, result, _i, _a, _b, key, value, pathKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, shell_env_1.getShellEnvironment)()];
                case 1:
                    shellEnv = _c.sent();
                    result = {};
                    for (_i = 0, _a = Object.entries(process.env); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (typeof value === "string") {
                            result[key] = value;
                        }
                    }
                    pathKey = process.platform === "win32" ? "Path" : "PATH";
                    if (shellEnv[pathKey]) {
                        result[pathKey] = shellEnv[pathKey];
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
function repoUsesLfs(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var lfsDir, stats, error_1, attributeFiles, _i, attributeFiles_1, filePath, content, error_2, git, lsFiles, sampleFiles, checkAttr, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    lfsDir = (0, node_path_1.join)(repoPath, ".git", "lfs");
                    return [4 /*yield*/, (0, promises_1.stat)(lfsDir)];
                case 1:
                    stats = _b.sent();
                    if (stats.isDirectory()) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    if (!isEnoent(error_1)) {
                        console.warn("[git] Could not check .git/lfs directory: ".concat(error_1));
                    }
                    return [3 /*break*/, 3];
                case 3:
                    attributeFiles = [
                        (0, node_path_1.join)(repoPath, ".gitattributes"),
                        (0, node_path_1.join)(repoPath, ".git", "info", "attributes"),
                        (0, node_path_1.join)(repoPath, ".lfsconfig"),
                    ];
                    _i = 0, attributeFiles_1 = attributeFiles;
                    _b.label = 4;
                case 4:
                    if (!(_i < attributeFiles_1.length)) return [3 /*break*/, 9];
                    filePath = attributeFiles_1[_i];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, "utf-8")];
                case 6:
                    content = _b.sent();
                    if (content.includes("filter=lfs") || content.includes("[lfs]")) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _b.sent();
                    if (!isEnoent(error_2)) {
                        console.warn("[git] Could not read ".concat(filePath, ": ").concat(error_2));
                    }
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    _b.trys.push([9, 13, , 14]);
                    git = (0, simple_git_1.default)(repoPath);
                    return [4 /*yield*/, git.raw(["ls-files"])];
                case 10:
                    lsFiles = _b.sent();
                    sampleFiles = lsFiles.split("\n").filter(Boolean).slice(0, 20);
                    if (!(sampleFiles.length > 0)) return [3 /*break*/, 12];
                    return [4 /*yield*/, git.raw(__spreadArray([
                            "check-attr",
                            "filter",
                            "--"
                        ], sampleFiles, true))];
                case 11:
                    checkAttr = _b.sent();
                    if (checkAttr.includes("filter: lfs")) {
                        return [2 /*return*/, true];
                    }
                    _b.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    _a = _b.sent();
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/, false];
            }
        });
    });
}
function isEnoent(error) {
    return (error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT");
}
function generateBranchName() {
    var name = (0, unique_names_generator_1.uniqueNamesGenerator)({
        dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.animals],
        separator: "-",
        length: 2,
        style: "lowerCase",
    });
    var suffix = (0, node_crypto_1.randomBytes)(3).toString("hex");
    return "".concat(name, "-").concat(suffix);
}
function createWorktree(mainRepoPath_1, branch_1, worktreePath_1) {
    return __awaiter(this, arguments, void 0, function (mainRepoPath, branch, worktreePath, startPoint) {
        var usesLfs, parentDir, env, lfsAvailable, git, commitHash, _a, localBranch, _b, error_3, errorMessage, lowerError, isLockError, isLfsError;
        if (startPoint === void 0) { startPoint = "origin/main"; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, repoUsesLfs(mainRepoPath)];
                case 1:
                    usesLfs = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 17, , 18]);
                    parentDir = (0, node_path_1.join)(worktreePath, "..");
                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, getGitEnv()];
                case 4:
                    env = _c.sent();
                    if (!usesLfs) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, shell_env_1.checkGitLfsAvailable)(env)];
                case 5:
                    lfsAvailable = _c.sent();
                    if (!lfsAvailable) {
                        throw new Error("This repository uses Git LFS, but git-lfs was not found. " +
                            "Please install git-lfs (e.g., 'brew install git-lfs') and run 'git lfs install'.");
                    }
                    _c.label = 6;
                case 6:
                    git = (0, simple_git_1.default)(mainRepoPath);
                    commitHash = void 0;
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 15]);
                    return [4 /*yield*/, git.revparse(["".concat(startPoint, "^{commit}")])];
                case 8:
                    commitHash = (_c.sent()).trim();
                    return [3 /*break*/, 15];
                case 9:
                    _a = _c.sent();
                    localBranch = startPoint.replace(/^origin\//, "");
                    _c.label = 10;
                case 10:
                    _c.trys.push([10, 12, , 14]);
                    return [4 /*yield*/, git.revparse(["".concat(localBranch, "^{commit}")])];
                case 11:
                    commitHash = (_c.sent()).trim();
                    return [3 /*break*/, 14];
                case 12:
                    _b = _c.sent();
                    return [4 /*yield*/, git.revparse([startPoint])];
                case 13:
                    commitHash = (_c.sent()).trim();
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 15];
                case 15: return [4 /*yield*/, execFileAsync("git", [
                        "-C",
                        mainRepoPath,
                        "worktree",
                        "add",
                        worktreePath,
                        "-b",
                        branch,
                        commitHash,
                    ], { env: env, timeout: 120000 })];
                case 16:
                    _c.sent();
                    return [3 /*break*/, 18];
                case 17:
                    error_3 = _c.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                    lowerError = errorMessage.toLowerCase();
                    isLockError = lowerError.includes("could not lock") ||
                        lowerError.includes("unable to lock") ||
                        (lowerError.includes(".lock") && lowerError.includes("file exists"));
                    if (isLockError) {
                        console.error("Git lock file error during worktree creation: ".concat(errorMessage));
                        throw new Error("Failed to create worktree: The git repository is locked by another process. " +
                            "This usually happens when another git operation is in progress, or a previous operation crashed. " +
                            "Please wait for the other operation to complete, or manually remove the lock file " +
                            "(e.g., .git/config.lock or .git/index.lock) if you're sure no git operations are running.");
                    }
                    isLfsError = lowerError.includes("git-lfs") ||
                        lowerError.includes("filter-process") ||
                        lowerError.includes("smudge filter") ||
                        (lowerError.includes("lfs") && lowerError.includes("not")) ||
                        (lowerError.includes("lfs") && usesLfs);
                    if (isLfsError) {
                        console.error("Git LFS error during worktree creation: ".concat(errorMessage));
                        throw new Error("Failed to create worktree: This repository uses Git LFS, but git-lfs was not found or failed. " +
                            "Please install git-lfs (e.g., 'brew install git-lfs') and run 'git lfs install'.");
                    }
                    console.error("Failed to create worktree: ".concat(errorMessage));
                    throw new Error("Failed to create worktree: ".concat(errorMessage));
                case 18: return [2 /*return*/];
            }
        });
    });
}
function removeWorktree(mainRepoPath, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var env, error_4, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getGitEnv()];
                case 1:
                    env = _a.sent();
                    return [4 /*yield*/, execFileAsync("git", ["-C", mainRepoPath, "worktree", "remove", worktreePath, "--force"], { env: env, timeout: 60000 })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    error_4 = _a.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                    console.error("Failed to remove worktree: ".concat(errorMessage));
                    return [2 /*return*/, { success: false, error: errorMessage }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getGitRoot(path) {
    return __awaiter(this, void 0, void 0, function () {
        var git, root, _error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    git = (0, simple_git_1.default)(path);
                    return [4 /*yield*/, git.revparse(["--show-toplevel"])];
                case 1:
                    root = _a.sent();
                    return [2 /*return*/, root.trim()];
                case 2:
                    _error_1 = _a.sent();
                    throw new Error("Not a git repository: ".concat(path));
                case 3: return [2 /*return*/];
            }
        });
    });
}
function worktreeExists(mainRepoPath, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, worktrees, lines, worktreePrefix_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    git = (0, simple_git_1.default)(mainRepoPath);
                    return [4 /*yield*/, git.raw(["worktree", "list", "--porcelain"])];
                case 1:
                    worktrees = _a.sent();
                    lines = worktrees.split("\n");
                    worktreePrefix_1 = "worktree ".concat(worktreePath);
                    return [2 /*return*/, lines.some(function (line) { return line.trim() === worktreePrefix_1; })];
                case 2:
                    error_5 = _a.sent();
                    console.error("Failed to check worktree existence: ".concat(error_5));
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function hasOriginRemote(mainRepoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, remotes, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    git = (0, simple_git_1.default)(mainRepoPath);
                    return [4 /*yield*/, git.getRemotes()];
                case 1:
                    remotes = _b.sent();
                    return [2 /*return*/, remotes.some(function (r) { return r.name === "origin"; })];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getDefaultBranch(mainRepoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, hasRemote, headRef, match, _a, branches, remoteBranches, _i, _b, candidate, _c, result, symrefMatch, _d, currentBranch, _e, localBranches, _f, _g, candidate, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    git = (0, simple_git_1.default)(mainRepoPath);
                    return [4 /*yield*/, hasOriginRemote(mainRepoPath)];
                case 1:
                    hasRemote = _j.sent();
                    if (!hasRemote) return [3 /*break*/, 12];
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, git.raw([
                            "symbolic-ref",
                            "refs/remotes/origin/HEAD",
                        ])];
                case 3:
                    headRef = _j.sent();
                    match = headRef.trim().match(/refs\/remotes\/origin\/(.+)/);
                    if (match)
                        return [2 /*return*/, match[1]];
                    return [3 /*break*/, 5];
                case 4:
                    _a = _j.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _j.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, git.branch(["-r"])];
                case 6:
                    branches = _j.sent();
                    remoteBranches = branches.all.map(function (b) { return b.replace("origin/", ""); });
                    for (_i = 0, _b = ["main", "master", "develop", "trunk"]; _i < _b.length; _i++) {
                        candidate = _b[_i];
                        if (remoteBranches.includes(candidate)) {
                            return [2 /*return*/, candidate];
                        }
                    }
                    return [3 /*break*/, 8];
                case 7:
                    _c = _j.sent();
                    return [3 /*break*/, 8];
                case 8:
                    _j.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, git.raw(["ls-remote", "--symref", "origin", "HEAD"])];
                case 9:
                    result = _j.sent();
                    symrefMatch = result.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
                    if (symrefMatch) {
                        return [2 /*return*/, symrefMatch[1]];
                    }
                    return [3 /*break*/, 11];
                case 10:
                    _d = _j.sent();
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 18];
                case 12:
                    _j.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, getCurrentBranch(mainRepoPath)];
                case 13:
                    currentBranch = _j.sent();
                    if (currentBranch) {
                        return [2 /*return*/, currentBranch];
                    }
                    return [3 /*break*/, 15];
                case 14:
                    _e = _j.sent();
                    return [3 /*break*/, 15];
                case 15:
                    _j.trys.push([15, 17, , 18]);
                    return [4 /*yield*/, git.branchLocal()];
                case 16:
                    localBranches = _j.sent();
                    for (_f = 0, _g = ["main", "master", "develop", "trunk"]; _f < _g.length; _f++) {
                        candidate = _g[_f];
                        if (localBranches.all.includes(candidate)) {
                            return [2 /*return*/, candidate];
                        }
                    }
                    // If we have any local branches, use the first one
                    if (localBranches.all.length > 0) {
                        return [2 /*return*/, localBranches.all[0]];
                    }
                    return [3 /*break*/, 18];
                case 17:
                    _h = _j.sent();
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/, "main"];
            }
        });
    });
}
function fetchDefaultBranch(mainRepoPath, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, commit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)(mainRepoPath);
                    return [4 /*yield*/, git.fetch("origin", defaultBranch)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, git.revparse("origin/".concat(defaultBranch))];
                case 2:
                    commit = _a.sent();
                    return [2 /*return*/, commit.trim()];
            }
        });
    });
}
/**
 * Refreshes the local origin/HEAD symref from the remote and returns the current default branch.
 * This detects when the remote repository's default branch has changed (e.g., master -> main).
 * @param mainRepoPath - Path to the main repository
 * @returns The current default branch name, or null if unable to determine
 */
function refreshDefaultBranch(mainRepoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, hasRemote, headRef, match, _a, result, symrefMatch, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    git = (0, simple_git_1.default)(mainRepoPath);
                    return [4 /*yield*/, hasOriginRemote(mainRepoPath)];
                case 1:
                    hasRemote = _c.sent();
                    if (!hasRemote) {
                        return [2 /*return*/, null];
                    }
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 5, , 10]);
                    // Git doesn't auto-update origin/HEAD on fetch, so we must explicitly
                    // sync it to detect when the remote's default branch changes
                    return [4 /*yield*/, git.remote(["set-head", "origin", "--auto"])];
                case 3:
                    // Git doesn't auto-update origin/HEAD on fetch, so we must explicitly
                    // sync it to detect when the remote's default branch changes
                    _c.sent();
                    return [4 /*yield*/, git.raw(["symbolic-ref", "refs/remotes/origin/HEAD"])];
                case 4:
                    headRef = _c.sent();
                    match = headRef.trim().match(/refs\/remotes\/origin\/(.+)/);
                    if (match) {
                        return [2 /*return*/, match[1]];
                    }
                    return [3 /*break*/, 10];
                case 5:
                    _a = _c.sent();
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, git.raw(["ls-remote", "--symref", "origin", "HEAD"])];
                case 7:
                    result = _c.sent();
                    symrefMatch = result.match(/ref:\s+refs\/heads\/(.+?)\tHEAD/);
                    if (symrefMatch) {
                        return [2 /*return*/, symrefMatch[1]];
                    }
                    return [3 /*break*/, 9];
                case 8:
                    _b = _c.sent();
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/, null];
            }
        });
    });
}
function checkNeedsRebase(worktreePath, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, behindCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--count",
                            "HEAD..origin/".concat(defaultBranch),
                        ])];
                case 1:
                    behindCount = _a.sent();
                    return [2 /*return*/, Number.parseInt(behindCount.trim(), 10) > 0];
            }
        });
    });
}
function hasUncommittedChanges(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status = _a.sent();
                    return [2 /*return*/, !status.isClean()];
            }
        });
    });
}
function hasUnpushedCommits(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, aheadCount, _a, localCommits, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    git = (0, simple_git_1.default)(worktreePath);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 8]);
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--count",
                            "@{upstream}..HEAD",
                        ])];
                case 2:
                    aheadCount = _c.sent();
                    return [2 /*return*/, Number.parseInt(aheadCount.trim(), 10) > 0];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--count",
                            "HEAD",
                            "--not",
                            "--remotes",
                        ])];
                case 5:
                    localCommits = _c.sent();
                    return [2 /*return*/, Number.parseInt(localCommits.trim(), 10) > 0];
                case 6:
                    _b = _c.sent();
                    return [2 /*return*/, false];
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Git exit codes for ls-remote --exit-code:
 * - 0: Refs found (branch exists)
 * - 2: No matching refs (branch doesn't exist)
 * - 128: Fatal error (auth, network, invalid repo, etc.)
 */
var GIT_EXIT_CODES = {
    SUCCESS: 0,
    NO_MATCHING_REFS: 2,
    FATAL_ERROR: 128,
};
/**
 * Patterns for categorizing git fatal errors (exit code 128).
 * These are checked against lowercase error messages/stderr.
 */
var GIT_ERROR_PATTERNS = {
    network: [
        "could not resolve host",
        "unable to access",
        "connection refused",
        "network is unreachable",
        "timed out",
        "ssl",
        "could not read from remote",
    ],
    auth: [
        "authentication",
        "permission denied",
        "403",
        "401",
        // SSH-specific auth failures
        "permission denied (publickey)",
        "host key verification failed",
    ],
    remoteNotConfigured: [
        "does not appear to be a git repository",
        "no such remote",
        "repository not found",
        "remote origin not found",
    ],
};
function categorizeGitError(errorMessage) {
    var lowerMessage = errorMessage.toLowerCase();
    if (GIT_ERROR_PATTERNS.network.some(function (p) { return lowerMessage.includes(p); })) {
        return {
            status: "error",
            message: "Cannot connect to remote. Check your network connection.",
        };
    }
    if (GIT_ERROR_PATTERNS.auth.some(function (p) { return lowerMessage.includes(p); })) {
        return {
            status: "error",
            message: "Authentication failed. Check your Git credentials.",
        };
    }
    if (GIT_ERROR_PATTERNS.remoteNotConfigured.some(function (p) { return lowerMessage.includes(p); })) {
        return {
            status: "error",
            message: "Remote 'origin' is not configured or the repository was not found.",
        };
    }
    return {
        status: "error",
        message: "Failed to verify branch: ".concat(errorMessage),
    };
}
function branchExistsOnRemote(worktreePath, branchName) {
    return __awaiter(this, void 0, void 0, function () {
        var env, error_6, errorText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getGitEnv()];
                case 1:
                    env = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    // Use execFileAsync directly to get reliable exit codes
                    // simple-git doesn't expose exit codes in a predictable way
                    return [4 /*yield*/, execFileAsync("git", [
                            "-C",
                            worktreePath,
                            "ls-remote",
                            "--exit-code",
                            "--heads",
                            "origin",
                            branchName,
                        ], { env: env, timeout: 30000 })];
                case 3:
                    // Use execFileAsync directly to get reliable exit codes
                    // simple-git doesn't expose exit codes in a predictable way
                    _a.sent();
                    // Exit code 0 = branch exists (--exit-code flag ensures this)
                    return [2 /*return*/, { status: "exists" }];
                case 4:
                    error_6 = _a.sent();
                    // Use type guard to safely access ExecFileException properties
                    if (!isExecFileException(error_6)) {
                        return [2 /*return*/, {
                                status: "error",
                                message: "Unexpected error: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)),
                            }];
                    }
                    // Handle spawn/system errors first (code is a string like "ENOENT")
                    if (typeof error_6.code === "string") {
                        if (error_6.code === "ENOENT") {
                            return [2 /*return*/, {
                                    status: "error",
                                    message: "Git is not installed or not found in PATH.",
                                }];
                        }
                        if (error_6.code === "ETIMEDOUT") {
                            return [2 /*return*/, {
                                    status: "error",
                                    message: "Git command timed out. Check your network connection.",
                                }];
                        }
                        // Other system errors
                        return [2 /*return*/, {
                                status: "error",
                                message: "System error: ".concat(error_6.code),
                            }];
                    }
                    // Handle killed/timed out processes (timeout option triggers this)
                    if (error_6.killed || error_6.signal) {
                        return [2 /*return*/, {
                                status: "error",
                                message: "Git command timed out. Check your network connection.",
                            }];
                    }
                    // Now code is numeric - it's a git exit code
                    if (error_6.code === GIT_EXIT_CODES.NO_MATCHING_REFS) {
                        return [2 /*return*/, { status: "not_found" }];
                    }
                    errorText = error_6.stderr || error_6.message || "";
                    return [2 /*return*/, categorizeGitError(errorText)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Detect which branch a worktree was likely based off of.
 * Uses merge-base to find the closest common ancestor with candidate base branches.
 */
function detectBaseBranch(worktreePath, currentBranch, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, candidates, bestCandidate, bestAheadCount, _i, candidates_1, candidate, remoteBranch, mergeBase, aheadCount, count, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)(worktreePath);
                    candidates = [
                        defaultBranch,
                        "main",
                        "master",
                        "develop",
                        "development",
                    ].filter(function (b, i, arr) { return arr.indexOf(b) === i; });
                    bestCandidate = null;
                    bestAheadCount = Number.POSITIVE_INFINITY;
                    _i = 0, candidates_1 = candidates;
                    _b.label = 1;
                case 1:
                    if (!(_i < candidates_1.length)) return [3 /*break*/, 8];
                    candidate = candidates_1[_i];
                    // Skip if this is the current branch
                    if (candidate === currentBranch)
                        return [3 /*break*/, 7];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    remoteBranch = "origin/".concat(candidate);
                    return [4 /*yield*/, git.raw(["rev-parse", "--verify", remoteBranch])];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, git.raw(["merge-base", "HEAD", remoteBranch])];
                case 4:
                    mergeBase = _b.sent();
                    return [4 /*yield*/, git.raw([
                            "rev-list",
                            "--count",
                            "".concat(mergeBase.trim(), "..HEAD"),
                        ])];
                case 5:
                    aheadCount = _b.sent();
                    count = Number.parseInt(aheadCount.trim(), 10);
                    if (count < bestAheadCount) {
                        bestAheadCount = count;
                        bestCandidate = candidate;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, bestCandidate];
            }
        });
    });
}
/**
 * Lists all local and remote branches in a repository
 * @param repoPath - Path to the repository
 * @param options.fetch - Whether to fetch and prune remote refs first (default: false)
 * @returns Object with local and remote branch arrays
 */
function listBranches(repoPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var git, _a, localResult, local, remoteResult, remote;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)(repoPath);
                    if (!(options === null || options === void 0 ? void 0 : options.fetch)) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.fetch(["--prune"])];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, git.branchLocal()];
                case 5:
                    localResult = _b.sent();
                    local = localResult.all;
                    return [4 /*yield*/, git.branch(["-r"])];
                case 6:
                    remoteResult = _b.sent();
                    remote = remoteResult.all
                        .filter(function (b) { return b.startsWith("origin/") && !b.includes("->"); })
                        .map(function (b) { return b.replace("origin/", ""); });
                    return [2 /*return*/, { local: local, remote: remote }];
            }
        });
    });
}
/**
 * Gets the current branch name (HEAD)
 * @param repoPath - Path to the repository
 * @returns The current branch name, or null if in detached HEAD state
 */
function getCurrentBranch(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, branch, trimmed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)(repoPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.revparse(["--abbrev-ref", "HEAD"])];
                case 2:
                    branch = _b.sent();
                    trimmed = branch.trim();
                    // "HEAD" means detached HEAD state
                    return [2 /*return*/, trimmed === "HEAD" ? null : trimmed];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Performs safety checks before a branch checkout:
 * 1. Checks for uncommitted changes (staged/unstaged/created/renamed)
 * 2. Checks for untracked files that might be overwritten
 * 3. Runs git fetch --prune to clean up stale remote refs
 * @param repoPath - Path to the repository
 * @returns Safety check result indicating if checkout is safe
 */
function checkBranchCheckoutSafety(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status_1, hasUncommittedChanges_1, hasUntrackedFiles, _a, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)(repoPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, git.status()];
                case 2:
                    status_1 = _b.sent();
                    hasUncommittedChanges_1 = status_1.staged.length > 0 ||
                        status_1.modified.length > 0 ||
                        status_1.deleted.length > 0 ||
                        status_1.created.length > 0 ||
                        status_1.renamed.length > 0 ||
                        status_1.conflicted.length > 0;
                    hasUntrackedFiles = status_1.not_added.length > 0;
                    if (hasUncommittedChanges_1) {
                        return [2 /*return*/, {
                                safe: false,
                                error: "Cannot switch branches: you have uncommitted changes. Please commit or stash your changes first.",
                                hasUncommittedChanges: true,
                                hasUntrackedFiles: hasUntrackedFiles,
                            }];
                    }
                    // Block on untracked files as they could be overwritten by checkout
                    if (hasUntrackedFiles) {
                        return [2 /*return*/, {
                                safe: false,
                                error: "Cannot switch branches: you have untracked files that may be overwritten. Please commit, stash, or remove them first.",
                                hasUncommittedChanges: false,
                                hasUntrackedFiles: true,
                            }];
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, git.fetch(["--prune"])];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, {
                        safe: true,
                        hasUncommittedChanges: false,
                        hasUntrackedFiles: false,
                    }];
                case 7:
                    error_7 = _b.sent();
                    return [2 /*return*/, {
                            safe: false,
                            error: "Failed to check repository status: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)),
                        }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks out a branch in a repository.
 * If the branch only exists on remote, creates a local tracking branch.
 * @param repoPath - Path to the repository
 * @param branch - The branch name to checkout
 */
function checkoutBranch(repoPath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, localBranches, remoteBranches, remoteBranchName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)(repoPath);
                    return [4 /*yield*/, git.branchLocal()];
                case 1:
                    localBranches = _a.sent();
                    if (!localBranches.all.includes(branch)) return [3 /*break*/, 3];
                    return [4 /*yield*/, git.checkout(branch)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, git.branch(["-r"])];
                case 4:
                    remoteBranches = _a.sent();
                    remoteBranchName = "origin/".concat(branch);
                    if (!remoteBranches.all.includes(remoteBranchName)) return [3 /*break*/, 6];
                    // Create local branch tracking the remote
                    return [4 /*yield*/, git.checkout(["-b", branch, "--track", remoteBranchName])];
                case 5:
                    // Create local branch tracking the remote
                    _a.sent();
                    return [2 /*return*/];
                case 6: 
                // Branch doesn't exist anywhere - let git checkout fail with its normal error
                return [4 /*yield*/, git.checkout(branch)];
                case 7:
                    // Branch doesn't exist anywhere - let git checkout fail with its normal error
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Safe branch checkout that performs safety checks first.
 * This is the preferred method for branch workspaces.
 * @param repoPath - Path to the repository
 * @param branch - Branch to checkout
 * @throws Error if safety checks fail or checkout fails
 */
/**
 * Checks if a git ref exists locally (without network access).
 * Uses --verify --quiet to only check exit code without output.
 * @param repoPath - Path to the repository
 * @param ref - The ref to check (e.g., "main", "origin/main")
 * @returns true if the ref exists locally, false otherwise
 */
function refExistsLocally(repoPath, ref) {
    return __awaiter(this, void 0, void 0, function () {
        var git, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    git = (0, simple_git_1.default)(repoPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    // Use --verify --quiet to check if ref exists without output
                    // Append ^{commit} to ensure it resolves to a commit-ish
                    return [4 /*yield*/, git.raw(["rev-parse", "--verify", "--quiet", "".concat(ref, "^{commit}")])];
                case 2:
                    // Use --verify --quiet to check if ref exists without output
                    // Append ^{commit} to ensure it resolves to a commit-ish
                    _b.sent();
                    return [2 /*return*/, true];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sanitizes git error messages for user display.
 * Strips "fatal:" prefixes, excessive newlines, and other git plumbing text.
 * @param message - Raw git error message
 * @returns Cleaned message suitable for UI display
 */
function sanitizeGitError(message) {
    return message
        .replace(/^fatal:\s*/i, "")
        .replace(/^error:\s*/i, "")
        .replace(/\n+/g, " ")
        .trim();
}
function safeCheckoutBranch(repoPath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var currentBranch, safety, verifyBranch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCurrentBranch(repoPath)];
                case 1:
                    currentBranch = _a.sent();
                    if (currentBranch === branch) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, checkBranchCheckoutSafety(repoPath)];
                case 2:
                    safety = _a.sent();
                    if (!safety.safe) {
                        throw new Error(safety.error);
                    }
                    // Proceed with checkout
                    return [4 /*yield*/, checkoutBranch(repoPath, branch)];
                case 3:
                    // Proceed with checkout
                    _a.sent();
                    return [4 /*yield*/, getCurrentBranch(repoPath)];
                case 4:
                    verifyBranch = _a.sent();
                    if (verifyBranch !== branch) {
                        throw new Error("Branch checkout verification failed: expected \"".concat(branch, "\" but HEAD is on \"").concat(verifyBranch !== null && verifyBranch !== void 0 ? verifyBranch : "detached HEAD", "\""));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a git worktree for a chat (wrapper for chats.ts)
 * @param projectPath - Path to the main repository
 * @param projectSlug - Sanitized project name for worktree directory
 * @param chatId - Chat ID (used for logging)
 * @param selectedBaseBranch - Optional branch to base the worktree off (defaults to auto-detected default branch)
 */
function createWorktreeForChat(projectPath, projectSlug, chatId, selectedBaseBranch, branchType) {
    return __awaiter(this, void 0, void 0, function () {
        var git, isRepo, baseBranch, _a, branch, worktreesDir, projectWorktreeDir, folderName, worktreePath, startPoint, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    git = (0, simple_git_1.default)(projectPath);
                    return [4 /*yield*/, git.checkIsRepo()];
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
                    worktreesDir = (0, node_path_1.join)((0, node_os_1.homedir)(), ".21st", "worktrees");
                    projectWorktreeDir = (0, node_path_1.join)(worktreesDir, projectSlug);
                    folderName = (0, worktree_naming_1.generateWorktreeFolderName)(projectWorktreeDir);
                    worktreePath = (0, node_path_1.join)(projectWorktreeDir, folderName);
                    startPoint = branchType === "local" ? baseBranch : "origin/".concat(baseBranch);
                    return [4 /*yield*/, createWorktree(projectPath, branch, worktreePath, startPoint)];
                case 4:
                    _b.sent();
                    // Run worktree setup commands in BACKGROUND (don't block chat creation)
                    // This allows the user to start chatting immediately while deps install
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
                    error_8 = _b.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_8 instanceof Error ? error_8.message : "Unknown error",
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get diff for a worktree compared to its base branch
 * @param worktreePath - Path to the worktree
 * @param baseBranch - The base branch to compare against (if not provided, uses default branch)
 */
function getWorktreeDiff(worktreePath, baseBranch, options) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status_2, currentBranch, exclusionArgs, workingDiff, untrackedFiles, untrackedDiffs, _i, untrackedFiles_1, file, fileDiff, error_9, gitError, diffStart, untrackedDiff, combinedDiff, targetBranch, _a, baseRef, diff, _b, error_10;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 17, , 18]);
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status_2 = _c.sent();
                    currentBranch = status_2.current;
                    if (!!status_2.isClean()) return [3 /*break*/, 9];
                    exclusionArgs = [
                        ":!*.lock",
                        ":!*-lock.*",
                        ":!package-lock.json",
                        ":!pnpm-lock.yaml",
                        ":!yarn.lock",
                    ];
                    return [4 /*yield*/, git.diff(__spreadArray([
                            "HEAD",
                            "--no-color",
                            "--"
                        ], exclusionArgs, true))];
                case 2:
                    workingDiff = _c.sent();
                    untrackedFiles = status_2.not_added.filter(function (file) {
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
                    untrackedDiffs = [];
                    _i = 0, untrackedFiles_1 = untrackedFiles;
                    _c.label = 3;
                case 3:
                    if (!(_i < untrackedFiles_1.length)) return [3 /*break*/, 8];
                    file = untrackedFiles_1[_i];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, git.raw([
                            "diff",
                            "--no-color",
                            "--no-index",
                            node_os_1.devNull,
                            file,
                        ])];
                case 5:
                    fileDiff = _c.sent();
                    if (fileDiff) {
                        untrackedDiffs.push(fileDiff);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_9 = _c.sent();
                    gitError = error_9;
                    if (gitError.message && gitError.message.includes("diff --git")) {
                        diffStart = gitError.message.indexOf("diff --git");
                        if (diffStart !== -1) {
                            untrackedDiffs.push(gitError.message.substring(diffStart));
                        }
                    }
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    untrackedDiff = untrackedDiffs.join("\n");
                    combinedDiff = [workingDiff, untrackedDiff]
                        .filter(Boolean)
                        .join("\n");
                    return [2 /*return*/, { success: true, diff: combinedDiff }];
                case 9:
                    // All committed - if onlyUncommitted mode, return empty diff
                    if (options === null || options === void 0 ? void 0 : options.onlyUncommitted) {
                        return [2 /*return*/, { success: true, diff: "" }];
                    }
                    _a = baseBranch;
                    if (_a) return [3 /*break*/, 11];
                    return [4 /*yield*/, getDefaultBranch(worktreePath)];
                case 10:
                    _a = (_c.sent());
                    _c.label = 11;
                case 11:
                    targetBranch = _a;
                    return [4 /*yield*/, refExistsLocally(worktreePath, "origin/".concat(targetBranch))];
                case 12:
                    baseRef = (_c.sent())
                        ? "origin/".concat(targetBranch)
                        : targetBranch;
                    _c.label = 13;
                case 13:
                    _c.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, git.diff([
                            "".concat(baseRef, "...HEAD"),
                            "--no-color",
                            "--",
                            ":!*.lock",
                            ":!*-lock.*",
                            ":!package-lock.json",
                            ":!pnpm-lock.yaml",
                            ":!yarn.lock",
                        ])];
                case 14:
                    diff = _c.sent();
                    return [2 /*return*/, { success: true, diff: diff || "" }];
                case 15:
                    _b = _c.sent();
                    return [2 /*return*/, { success: true, diff: "" }];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_10 = _c.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_10 instanceof Error ? error_10.message : "Unknown error",
                        }];
                case 18: return [2 /*return*/];
            }
        });
    });
}
/**
 * Commit all changes in a worktree
 */
function commitWorktreeChanges(worktreePath, message) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status_3, hasChanges, result, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.add("-A")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, git.status()];
                case 2:
                    status_3 = _a.sent();
                    hasChanges = status_3.staged.length > 0 || status_3.files.length > 0;
                    if (!hasChanges) {
                        return [2 /*return*/, { success: false, error: "No changes to commit" }];
                    }
                    return [4 /*yield*/, git.commit(message)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, { success: true, commitHash: result.commit }];
                case 4:
                    error_11 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_11 instanceof Error ? error_11.message : "Unknown error",
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Merge worktree branch into base branch
 */
function mergeWorktreeToMain(projectPath, worktreeBranch, baseBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, error_12, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    git = (0, simple_git_1.default)(projectPath);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 7]);
                    return [4 /*yield*/, git.checkout(baseBranch)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, git.merge([worktreeBranch, "--no-edit"])];
                case 3:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 4:
                    error_12 = _a.sent();
                    errorMsg = error_12 instanceof Error ? error_12.message : "Unknown error";
                    if (!(errorMsg.includes("CONFLICT") || errorMsg.includes("merge failed"))) return [3 /*break*/, 6];
                    return [4 /*yield*/, git.merge(["--abort"]).catch(function () { })];
                case 5:
                    _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: "Merge conflicts detected. Please resolve manually.",
                        }];
                case 6: return [2 /*return*/, { success: false, error: errorMsg }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Push worktree branch to remote
 */
function pushWorktreeBranch(worktreePath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var git, remotes, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.getRemotes()];
                case 1:
                    remotes = _a.sent();
                    if (remotes.length === 0) {
                        return [2 /*return*/, { success: false, error: "No remote repository configured" }];
                    }
                    return [4 /*yield*/, git.push(["-u", "origin", branch])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    error_13 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: error_13 instanceof Error ? error_13.message : "Unknown error",
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current git status summary
 */
function getGitStatus(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var git, status_4, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    git = (0, simple_git_1.default)(worktreePath);
                    return [4 /*yield*/, git.status()];
                case 1:
                    status_4 = _a.sent();
                    return [2 /*return*/, {
                            hasUncommittedChanges: !status_4.isClean(),
                            hasUnpushedCommits: status_4.ahead > 0,
                            currentBranch: status_4.current || "",
                        }];
                case 2:
                    error_14 = _a.sent();
                    return [2 /*return*/, {
                            hasUncommittedChanges: false,
                            hasUnpushedCommits: false,
                            currentBranch: "",
                            error: error_14 instanceof Error ? error_14.message : "Unknown error",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
