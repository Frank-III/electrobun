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
exports.fetchGitHubPRStatus = fetchGitHubPRStatus;
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var worktree_1 = require("../worktree");
var shell_env_1 = require("../shell-env");
var types_1 = require("./types");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
// Cache for GitHub status (10 second TTL)
var cache = new Map();
var CACHE_TTL_MS = 10000;
/**
 * Fetches GitHub PR status for a worktree using the `gh` CLI.
 * Returns null if `gh` is not installed, not authenticated, or on error.
 * Results are cached for 10 seconds.
 */
function fetchGitHubPRStatus(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, repoUrl, branchOutput, branchName, _a, branchCheck, prInfo, existsOnRemote, result, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cached = cache.get(worktreePath);
                    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
                        return [2 /*return*/, cached.data];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, getRepoUrl(worktreePath)];
                case 2:
                    repoUrl = _c.sent();
                    if (!repoUrl) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: worktreePath })];
                case 3:
                    branchOutput = (_c.sent()).stdout;
                    branchName = branchOutput.trim();
                    return [4 /*yield*/, Promise.all([
                            (0, worktree_1.branchExistsOnRemote)(worktreePath, branchName),
                            getPRForBranch(worktreePath, branchName),
                        ])];
                case 4:
                    _a = _c.sent(), branchCheck = _a[0], prInfo = _a[1];
                    existsOnRemote = branchCheck.status === "exists";
                    result = {
                        pr: prInfo,
                        repoUrl: repoUrl,
                        branchExistsOnRemote: existsOnRemote,
                        lastRefreshed: Date.now(),
                    };
                    // Cache the result
                    cache.set(worktreePath, { data: result, timestamp: Date.now() });
                    return [2 /*return*/, result];
                case 5:
                    _b = _c.sent();
                    // Any error (gh not installed, not auth'd, etc.) - return null
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getRepoUrl(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, raw, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", ["repo", "view", "--json", "url"], { cwd: worktreePath })];
                case 1:
                    stdout = (_b.sent()).stdout;
                    raw = JSON.parse(stdout);
                    result = types_1.GHRepoResponseSchema.safeParse(raw);
                    if (!result.success) {
                        console.error("[GitHub] Repo schema validation failed:", result.error);
                        console.error("[GitHub] Raw data:", JSON.stringify(raw, null, 2));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, result.data.url];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getPRForBranch(worktreePath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, raw, result, data, checks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", [
                            "pr",
                            "view",
                            branch,
                            "--json",
                            "number,title,url,state,isDraft,mergedAt,additions,deletions,reviewDecision,statusCheckRollup,mergeable",
                        ], { cwd: worktreePath })];
                case 1:
                    stdout = (_a.sent()).stdout;
                    raw = JSON.parse(stdout);
                    result = types_1.GHPRResponseSchema.safeParse(raw);
                    if (!result.success) {
                        console.error("[GitHub] PR schema validation failed:", result.error);
                        console.error("[GitHub] Raw data:", JSON.stringify(raw, null, 2));
                        throw new Error("PR schema validation failed");
                    }
                    data = result.data;
                    checks = parseChecks(data.statusCheckRollup);
                    return [2 /*return*/, {
                            number: data.number,
                            title: data.title,
                            url: data.url,
                            state: mapPRState(data.state, data.isDraft),
                            mergedAt: data.mergedAt ? new Date(data.mergedAt).getTime() : undefined,
                            additions: data.additions,
                            deletions: data.deletions,
                            reviewDecision: mapReviewDecision(data.reviewDecision),
                            checksStatus: computeChecksStatus(data.statusCheckRollup),
                            checks: checks,
                            mergeable: data.mergeable,
                        }];
                case 2:
                    error_1 = _a.sent();
                    // "no pull requests found" is not an error - just no PR
                    if (error_1 instanceof Error &&
                        error_1.message.includes("no pull requests found")) {
                        return [2 /*return*/, null];
                    }
                    // Re-throw other errors to be caught by parent
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function mapPRState(state, isDraft) {
    if (state === "MERGED")
        return "merged";
    if (state === "CLOSED")
        return "closed";
    if (isDraft)
        return "draft";
    return "open";
}
function mapReviewDecision(decision) {
    if (decision === "APPROVED")
        return "approved";
    if (decision === "CHANGES_REQUESTED")
        return "changes_requested";
    return "pending";
}
function parseChecks(rollup) {
    if (!rollup || rollup.length === 0) {
        return [];
    }
    return rollup.map(function (ctx) {
        // CheckRun uses 'name', StatusContext uses 'context'
        var name = ctx.name || ctx.context || "Unknown check";
        // CheckRun uses 'detailsUrl', StatusContext uses 'targetUrl'
        var url = ctx.detailsUrl || ctx.targetUrl;
        // StatusContext uses 'state', CheckRun uses 'conclusion'
        var rawStatus = ctx.state || ctx.conclusion;
        var status;
        if (rawStatus === "SUCCESS") {
            status = "success";
        }
        else if (rawStatus === "FAILURE" ||
            rawStatus === "ERROR" ||
            rawStatus === "TIMED_OUT") {
            status = "failure";
        }
        else if (rawStatus === "SKIPPED" || rawStatus === "NEUTRAL") {
            status = "skipped";
        }
        else if (rawStatus === "CANCELLED") {
            status = "cancelled";
        }
        else {
            status = "pending";
        }
        return { name: name, status: status, url: url };
    });
}
function computeChecksStatus(rollup) {
    if (!rollup || rollup.length === 0) {
        return "none";
    }
    var hasFailure = false;
    var hasPending = false;
    for (var _i = 0, rollup_1 = rollup; _i < rollup_1.length; _i++) {
        var ctx = rollup_1[_i];
        // StatusContext uses 'state', CheckRun uses 'conclusion'
        var status_1 = ctx.state || ctx.conclusion;
        if (status_1 === "FAILURE" || status_1 === "ERROR" || status_1 === "TIMED_OUT") {
            hasFailure = true;
        }
        else if (status_1 === "PENDING" ||
            status_1 === "" ||
            status_1 === null ||
            status_1 === undefined) {
            hasPending = true;
        }
    }
    if (hasFailure)
        return "failure";
    if (hasPending)
        return "pending";
    return "success";
}
