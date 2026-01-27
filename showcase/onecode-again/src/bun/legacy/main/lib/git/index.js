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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitRouter = void 0;
exports.getGitRemoteInfo = getGitRemoteInfo;
/**
 * Git module - combines all git-related routers
 * Flattened structure to match Superset API (changes.getStatus, changes.stageFile, etc.)
 */
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var trpc_1 = require("../trpc");
var branches_1 = require("./branches");
var file_contents_1 = require("./file-contents");
var git_operations_1 = require("./git-operations");
var staging_1 = require("./staging");
var status_1 = require("./status");
var execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
// Re-export worktree utilities
__exportStar(require("./worktree"), exports);
__exportStar(require("./worktree-naming"), exports);
// Re-export GitHub utilities
__exportStar(require("./github"), exports);
/**
 * Combined git router with flattened procedures
 * This matches Superset's changes router API structure
 */
var createGitRouter = function () {
    return (0, trpc_1.router)(__assign(__assign(__assign(__assign(__assign({}, (0, status_1.createStatusRouter)()._def.procedures), (0, staging_1.createStagingRouter)()._def.procedures), (0, git_operations_1.createGitOperationsRouter)()._def.procedures), (0, branches_1.createBranchesRouter)()._def.procedures), (0, file_contents_1.createFileContentsRouter)()._def.procedures));
};
exports.createGitRouter = createGitRouter;
/**
 * Check if a path is a git repository
 */
function isGitRepo(path) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execAsync("git rev-parse --git-dir", { cwd: path })];
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
/**
 * Parse a git remote URL to extract provider, owner, and repo
 * Handles both formats:
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 */
function parseGitRemoteUrl(url) {
    // Normalize the URL
    var normalized = url.trim();
    // Remove .git suffix
    if (normalized.endsWith(".git")) {
        normalized = normalized.slice(0, -4);
    }
    // Try to extract provider, owner, repo
    var provider = null;
    var owner = null;
    var repo = null;
    // Match HTTPS format: https://github.com/owner/repo
    var httpsMatch = normalized.match(/https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/([^/]+)\/([^/]+)/);
    if (httpsMatch) {
        var host = httpsMatch[1], ownerPart = httpsMatch[2], repoPart = httpsMatch[3];
        provider =
            host === "github.com"
                ? "github"
                : host === "gitlab.com"
                    ? "gitlab"
                    : host === "bitbucket.org"
                        ? "bitbucket"
                        : null;
        owner = ownerPart || null;
        repo = repoPart || null;
        return { provider: provider, owner: owner, repo: repo };
    }
    // Match SSH format: git@github.com:owner/repo
    var sshMatch = normalized.match(/git@(github\.com|gitlab\.com|bitbucket\.org):([^/]+)\/(.+)/);
    if (sshMatch) {
        var host = sshMatch[1], ownerPart = sshMatch[2], repoPart = sshMatch[3];
        provider =
            host === "github.com"
                ? "github"
                : host === "gitlab.com"
                    ? "gitlab"
                    : host === "bitbucket.org"
                        ? "bitbucket"
                        : null;
        owner = ownerPart || null;
        repo = repoPart || null;
        return { provider: provider, owner: owner, repo: repo };
    }
    return { provider: null, owner: null, repo: null };
}
/**
 * Get git remote info for a project path
 * Extracts remote URL, provider (github/gitlab/bitbucket), owner, and repo name
 */
function getGitRemoteInfo(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var emptyResult, isRepo, stdout, remoteUrl, parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    emptyResult = {
                        remoteUrl: null,
                        provider: null,
                        owner: null,
                        repo: null,
                    };
                    return [4 /*yield*/, isGitRepo(projectPath)];
                case 1:
                    isRepo = _b.sent();
                    if (!isRepo) {
                        return [2 /*return*/, emptyResult];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, execAsync("git remote get-url origin", {
                            cwd: projectPath,
                        })];
                case 3:
                    stdout = (_b.sent()).stdout;
                    remoteUrl = stdout.trim();
                    if (!remoteUrl) {
                        return [2 /*return*/, emptyResult];
                    }
                    parsed = parseGitRemoteUrl(remoteUrl);
                    return [2 /*return*/, __assign({ remoteUrl: remoteUrl }, parsed)];
                case 4:
                    _a = _b.sent();
                    // No remote configured or other error
                    return [2 /*return*/, emptyResult];
                case 5: return [2 /*return*/];
            }
        });
    });
}
