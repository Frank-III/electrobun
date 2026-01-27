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
var git_worktree_1 = require("./git-worktree");
var shell_env_1 = require("./shell-env");
var cache = new Map();
var CACHE_TTL_MS = 10000;
function parseChecks(rollup) {
    if (!rollup || rollup.length === 0) {
        return [];
    }
    return rollup.map(function (ctx) {
        var name = (ctx === null || ctx === void 0 ? void 0 : ctx.name) || (ctx === null || ctx === void 0 ? void 0 : ctx.context) || "Unknown check";
        var url = (ctx === null || ctx === void 0 ? void 0 : ctx.detailsUrl) || (ctx === null || ctx === void 0 ? void 0 : ctx.targetUrl);
        var rawStatus = (ctx === null || ctx === void 0 ? void 0 : ctx.state) || (ctx === null || ctx === void 0 ? void 0 : ctx.conclusion);
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
        var status_1 = (ctx === null || ctx === void 0 ? void 0 : ctx.state) || (ctx === null || ctx === void 0 ? void 0 : ctx.conclusion);
        if (status_1 === "FAILURE" || status_1 === "ERROR" || status_1 === "TIMED_OUT") {
            hasFailure = true;
        }
        else if (status_1 === "PENDING" || status_1 === "" || status_1 === null || status_1 === undefined) {
            hasPending = true;
        }
    }
    if (hasFailure)
        return "failure";
    if (hasPending)
        return "pending";
    return "success";
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
function getRepoUrl(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var result, raw;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", ["repo", "view", "--json", "url"], {
                        cwd: worktreePath,
                    })];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0) {
                        return [2 /*return*/, null];
                    }
                    try {
                        raw = JSON.parse(result.stdout);
                        if (raw && typeof raw.url === "string") {
                            return [2 /*return*/, raw.url];
                        }
                    }
                    catch (_b) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function getPRForBranch(worktreePath, branch) {
    return __awaiter(this, void 0, void 0, function () {
        var result, errorText, raw, checks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", [
                        "pr",
                        "view",
                        branch,
                        "--json",
                        "number,title,url,state,isDraft,mergedAt,additions,deletions,reviewDecision,statusCheckRollup,mergeable",
                    ], { cwd: worktreePath })];
                case 1:
                    result = _a.sent();
                    if (result.code !== 0) {
                        errorText = "".concat(result.stderr, "\n").concat(result.stdout).toLowerCase();
                        if (errorText.includes("no pull requests found")) {
                            return [2 /*return*/, null];
                        }
                        throw new Error(result.stderr || result.stdout || "Failed to fetch PR data");
                    }
                    raw = JSON.parse(result.stdout);
                    if (!raw || typeof raw.number !== "number" || typeof raw.url !== "string") {
                        throw new Error("Invalid PR response");
                    }
                    checks = parseChecks(raw.statusCheckRollup || []);
                    return [2 /*return*/, {
                            number: raw.number,
                            title: raw.title || "",
                            url: raw.url,
                            state: mapPRState(raw.state, !!raw.isDraft),
                            mergedAt: raw.mergedAt ? new Date(raw.mergedAt).getTime() : undefined,
                            additions: typeof raw.additions === "number" ? raw.additions : 0,
                            deletions: typeof raw.deletions === "number" ? raw.deletions : 0,
                            reviewDecision: mapReviewDecision(raw.reviewDecision),
                            checksStatus: computeChecksStatus(raw.statusCheckRollup || []),
                            checks: checks,
                            mergeable: raw.mergeable,
                        }];
            }
        });
    });
}
function fetchGitHubPRStatus(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, repoUrl, branchResult, branchName, _a, branchCheck, prInfo, existsOnRemote, result, _b;
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
                    if (!repoUrl)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
                            cwd: worktreePath,
                        })];
                case 3:
                    branchResult = _c.sent();
                    if (branchResult.code !== 0)
                        return [2 /*return*/, null];
                    branchName = branchResult.stdout.trim();
                    return [4 /*yield*/, Promise.all([
                            (0, git_worktree_1.branchExistsOnRemote)(worktreePath, branchName),
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
                    cache.set(worktreePath, { data: result, timestamp: Date.now() });
                    return [2 /*return*/, result];
                case 5:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
