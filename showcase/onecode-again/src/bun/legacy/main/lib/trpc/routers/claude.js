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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.claudeRouter = exports.workingMcpServers = void 0;
exports.clearClaudeCaches = clearClaudeCaches;
exports.getAllMcpConfigHandler = getAllMcpConfigHandler;
var observable_1 = require("@trpc/server/observable");
var drizzle_orm_1 = require("drizzle-orm");
var electron_1 = require("electron");
var fs = require("fs/promises");
var os = require("os");
var path_1 = require("path");
var zod_1 = require("zod");
var claude_1 = require("../../claude");
var claude_config_1 = require("../../claude-config");
var db_1 = require("../../db");
var stash_1 = require("../../git/stash");
var mcp_auth_1 = require("../../mcp-auth");
var oauth_1 = require("../../oauth");
var analytics_1 = require("../../analytics");
var index_1 = require("../index");
var agent_utils_1 = require("./agent-utils");
/**
 * Parse @[agent:name], @[skill:name], and @[tool:name] mentions from prompt text
 * Returns the cleaned prompt and lists of mentioned agents/skills/tools
 *
 * File mention formats:
 * - @[file:local:relative/path] - file inside project (relative path)
 * - @[file:external:/absolute/path] - file outside project (absolute path)
 * - @[file:owner/repo:path] - legacy web format (repo:path)
 * - @[folder:local:path] or @[folder:external:path] - folder mentions
 */
function parseMentions(prompt) {
    var agentMentions = [];
    var skillMentions = [];
    var fileMentions = [];
    var folderMentions = [];
    var toolMentions = [];
    // Match @[prefix:name] pattern
    var mentionRegex = /@\[(file|folder|skill|agent|tool):([^\]]+)\]/g;
    var match;
    while ((match = mentionRegex.exec(prompt)) !== null) {
        var type = match[1], name_1 = match[2];
        switch (type) {
            case "agent":
                agentMentions.push(name_1);
                break;
            case "skill":
                skillMentions.push(name_1);
                break;
            case "file":
                fileMentions.push(name_1);
                break;
            case "folder":
                folderMentions.push(name_1);
                break;
            case "tool":
                // Validate tool name format: only alphanumeric, underscore, hyphen allowed
                // This prevents prompt injection via malicious tool names
                if (/^[a-zA-Z0-9_-]+$/.test(name_1)) {
                    toolMentions.push(name_1);
                }
                break;
        }
    }
    // Clean agent/skill/tool mentions from prompt (they will be added as context or hints)
    // Keep file/folder mentions as they are useful context
    var cleanedPrompt = prompt
        .replace(/@\[agent:[^\]]+\]/g, "")
        .replace(/@\[skill:[^\]]+\]/g, "")
        .replace(/@\[tool:[^\]]+\]/g, "")
        .trim();
    // Transform file mentions to readable paths for the agent
    // @[file:local:path] -> path (relative to project)
    // @[file:external:/abs/path] -> /abs/path (absolute)
    cleanedPrompt = cleanedPrompt
        .replace(/@\[file:local:([^\]]+)\]/g, "$1")
        .replace(/@\[file:external:([^\]]+)\]/g, "$1")
        .replace(/@\[folder:local:([^\]]+)\]/g, "$1")
        .replace(/@\[folder:external:([^\]]+)\]/g, "$1");
    // Add tool usage hints if tools were mentioned
    // Tool names are already validated to contain only safe characters
    if (toolMentions.length > 0) {
        var toolHints = toolMentions
            .map(function (t) { return "Use the ".concat(t, " tool for this request."); })
            .join(" ");
        cleanedPrompt = "".concat(toolHints, "\n\n").concat(cleanedPrompt);
    }
    return { cleanedPrompt: cleanedPrompt, agentMentions: agentMentions, skillMentions: skillMentions, fileMentions: fileMentions, folderMentions: folderMentions, toolMentions: toolMentions };
}
/**
 * Decrypt token using Electron's safeStorage
 */
function decryptToken(encrypted) {
    if (!electron_1.safeStorage.isEncryptionAvailable()) {
        return Buffer.from(encrypted, "base64").toString("utf-8");
    }
    var buffer = Buffer.from(encrypted, "base64");
    return electron_1.safeStorage.decryptString(buffer);
}
/**
 * Get Claude Code OAuth token from local SQLite
 * Returns null if not connected
 */
function getClaudeCodeToken() {
    try {
        var db = (0, db_1.getDatabase)();
        var cred = db
            .select()
            .from(db_1.claudeCodeCredentials)
            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
            .get();
        if (!(cred === null || cred === void 0 ? void 0 : cred.oauthToken)) {
            console.log("[claude] No Claude Code credentials found");
            return null;
        }
        return decryptToken(cred.oauthToken);
    }
    catch (error) {
        console.error("[claude] Error getting Claude Code token:", error);
        return null;
    }
}
// Dynamic import for ESM module - CACHED to avoid re-importing on every message
var cachedClaudeQuery = null;
var getClaudeQuery = function () { return __awaiter(void 0, void 0, void 0, function () {
    var sdk;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (cachedClaudeQuery) {
                    return [2 /*return*/, cachedClaudeQuery];
                }
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@anthropic-ai/claude-agent-sdk"); })];
            case 1:
                sdk = _a.sent();
                cachedClaudeQuery = sdk.query;
                return [2 /*return*/, cachedClaudeQuery];
        }
    });
}); };
// Active sessions for cancellation (onAbort handles stash + abort + restore)
// Active sessions for cancellation
var activeSessions = new Map();
// In-memory cache of working MCP server names (resets on app restart)
// Key: "scope::serverName" where scope is "__global__" or projectPath
// Value: true if working (has tools), false if failed
exports.workingMcpServers = new Map();
// Helper to build scoped cache key
var GLOBAL_SCOPE = "__global__";
function mcpCacheKey(scope, serverName) {
    return "".concat(scope !== null && scope !== void 0 ? scope : GLOBAL_SCOPE, "::").concat(serverName);
}
// Cache for symlinks (track which subChatIds have already set up symlinks)
var symlinksCreated = new Set();
// Cache for MCP config (avoid re-reading ~/.claude.json on every message)
var mcpConfigCache = new Map();
var pendingToolApprovals = new Map();
var PLAN_MODE_BLOCKED_TOOLS = new Set([
    "Bash",
    "NotebookEdit",
]);
var clearPendingApprovals = function (message, subChatId) {
    for (var _i = 0, pendingToolApprovals_1 = pendingToolApprovals; _i < pendingToolApprovals_1.length; _i++) {
        var _a = pendingToolApprovals_1[_i], toolUseId = _a[0], pending = _a[1];
        if (subChatId && pending.subChatId !== subChatId)
            continue;
        pending.resolve({ approved: false, message: message });
        pendingToolApprovals.delete(toolUseId);
    }
};
// Image attachment schema
var imageAttachmentSchema = zod_1.z.object({
    base64Data: zod_1.z.string(),
    mediaType: zod_1.z.string(), // e.g. "image/png", "image/jpeg"
    filename: zod_1.z.string().optional(),
});
/**
 * Clear all performance caches (for testing/debugging)
 */
function clearClaudeCaches() {
    cachedClaudeQuery = null;
    symlinksCreated.clear();
    mcpConfigCache.clear();
    console.log("[claude] All caches cleared");
}
/**
 * Determine server status based on config
 * - If authType is "none" -> "connected" (no auth required)
 * - If has Authorization header -> "connected" (OAuth completed, SDK can use it)
 * - If has _oauth but no headers -> "needs-auth" (legacy config, needs re-auth to migrate)
 * - If HTTP server (has URL) with explicit authType -> "needs-auth"
 * - HTTP server without authType -> "connected" (assume public)
 * - Local stdio server -> "connected"
 */
function getServerStatusFromConfig(serverConfig) {
    var headers = serverConfig.headers;
    var oauth = serverConfig._oauth, authType = serverConfig.authType;
    // If authType is explicitly "none", no auth required
    if (authType === "none") {
        return "connected";
    }
    // If has Authorization header, it's ready for SDK to use
    if (headers === null || headers === void 0 ? void 0 : headers.Authorization) {
        return "connected";
    }
    // If has _oauth but no headers, this is a legacy config that needs re-auth
    // (old format that SDK can't use)
    if ((oauth === null || oauth === void 0 ? void 0 : oauth.accessToken) && !(headers === null || headers === void 0 ? void 0 : headers.Authorization)) {
        return "needs-auth";
    }
    // If HTTP server with explicit authType (oauth/bearer), needs auth
    if (serverConfig.url && (["oauth", "bearer"].includes(authType !== null && authType !== void 0 ? authType : ""))) {
        return "needs-auth";
    }
    // HTTP server without authType - assume no auth required (public endpoint)
    // Local stdio server - also connected
    return "connected";
}
var MCP_FETCH_TIMEOUT_MS = 10000;
/**
 * Fetch tools from an MCP server (HTTP or stdio transport)
 * Times out after 10 seconds to prevent slow MCPs from blocking the cache update
 */
function fetchToolsForServer(serverConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var timeoutPromise, fetchPromise, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    timeoutPromise = new Promise(function (_, reject) {
                        return setTimeout(function () { return reject(new Error('Timeout')); }, MCP_FETCH_TIMEOUT_MS);
                    });
                    fetchPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                        var headers, _a, command, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!serverConfig.url) return [3 /*break*/, 4];
                                    headers = serverConfig.headers;
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, mcp_auth_1.fetchMcpTools)(serverConfig.url, headers)];
                                case 2: return [2 /*return*/, _c.sent()];
                                case 3:
                                    _a = _c.sent();
                                    return [2 /*return*/, []];
                                case 4:
                                    command = serverConfig.command;
                                    if (!command) return [3 /*break*/, 8];
                                    _c.label = 5;
                                case 5:
                                    _c.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, (0, mcp_auth_1.fetchMcpToolsStdio)({
                                            command: command,
                                            args: serverConfig.args,
                                            env: serverConfig.env,
                                        })];
                                case 6: return [2 /*return*/, _c.sent()];
                                case 7:
                                    _b = _c.sent();
                                    return [2 /*return*/, []];
                                case 8: return [2 /*return*/, []];
                            }
                        });
                    }); })();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.race([fetchPromise, timeoutPromise])];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handler for getAllMcpConfig - exported so it can be called on app startup
 */
function getAllMcpConfigHandler() {
    return __awaiter(this, void 0, void 0, function () {
        var totalStart, config_1, convertServers_1, groupTasks, _loop_1, _i, _a, _b, projectPath, projectConfig, results_1, groupsWithTiming, totalDuration, workingCount, sortedByDuration, _c, sortedByDuration_1, g, groups, error_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    totalStart = Date.now();
                    // Clear cache before repopulating
                    exports.workingMcpServers.clear();
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config_1 = _d.sent();
                    convertServers_1 = function (servers, scope) { return __awaiter(_this, void 0, void 0, function () {
                        var results;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!servers)
                                        return [2 /*return*/, []];
                                    return [4 /*yield*/, Promise.all(Object.entries(servers).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                            var configObj, status, headers, tools, needsAuth, error_2, cacheKey, baseUrl, metadata, _c;
                                            var name = _b[0], serverConfig = _b[1];
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        configObj = serverConfig;
                                                        status = getServerStatusFromConfig(serverConfig);
                                                        headers = serverConfig.headers;
                                                        tools = [];
                                                        needsAuth = false;
                                                        _d.label = 1;
                                                    case 1:
                                                        _d.trys.push([1, 3, , 4]);
                                                        return [4 /*yield*/, fetchToolsForServer(serverConfig)];
                                                    case 2:
                                                        tools = _d.sent();
                                                        return [3 /*break*/, 4];
                                                    case 3:
                                                        error_2 = _d.sent();
                                                        console.error("[MCP] Failed to fetch tools for ".concat(name, ":"), error_2);
                                                        return [3 /*break*/, 4];
                                                    case 4:
                                                        cacheKey = mcpCacheKey(scope, name);
                                                        if (!(tools.length > 0)) return [3 /*break*/, 5];
                                                        status = "connected";
                                                        exports.workingMcpServers.set(cacheKey, true);
                                                        return [3 /*break*/, 12];
                                                    case 5:
                                                        exports.workingMcpServers.set(cacheKey, false);
                                                        if (!serverConfig.url) return [3 /*break*/, 10];
                                                        _d.label = 6;
                                                    case 6:
                                                        _d.trys.push([6, 8, , 9]);
                                                        baseUrl = (0, oauth_1.getMcpBaseUrl)(serverConfig.url);
                                                        return [4 /*yield*/, (0, oauth_1.fetchOAuthMetadata)(baseUrl)];
                                                    case 7:
                                                        metadata = _d.sent();
                                                        needsAuth = !!metadata && !!metadata.authorization_endpoint;
                                                        return [3 /*break*/, 9];
                                                    case 8:
                                                        _c = _d.sent();
                                                        return [3 /*break*/, 9];
                                                    case 9: return [3 /*break*/, 11];
                                                    case 10:
                                                        if (serverConfig.authType === "oauth" || serverConfig.authType === "bearer") {
                                                            needsAuth = true;
                                                        }
                                                        _d.label = 11;
                                                    case 11:
                                                        if (needsAuth && !(headers === null || headers === void 0 ? void 0 : headers.Authorization)) {
                                                            status = "needs-auth";
                                                        }
                                                        _d.label = 12;
                                                    case 12: return [2 /*return*/, { name: name, status: status, tools: tools, needsAuth: needsAuth, config: configObj }];
                                                }
                                            });
                                        }); }))];
                                case 1:
                                    results = _a.sent();
                                    return [2 /*return*/, results];
                            }
                        });
                    }); };
                    groupTasks = [];
                    // Global MCPs
                    if (config_1.mcpServers) {
                        groupTasks.push({
                            groupName: "Global",
                            projectPath: null,
                            promise: (function () { return __awaiter(_this, void 0, void 0, function () {
                                var start, freshServers, mcpServers;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            start = Date.now();
                                            return [4 /*yield*/, (0, mcp_auth_1.ensureMcpTokensFresh)(config_1.mcpServers, claude_config_1.GLOBAL_MCP_PATH)];
                                        case 1:
                                            freshServers = _a.sent();
                                            return [4 /*yield*/, convertServers_1(freshServers, null)]; // null = global scope
                                        case 2:
                                            mcpServers = _a.sent() // null = global scope
                                            ;
                                            return [2 /*return*/, { mcpServers: mcpServers, duration: Date.now() - start }];
                                    }
                                });
                            }); })()
                        });
                    }
                    else {
                        groupTasks.push({
                            groupName: "Global",
                            projectPath: null,
                            promise: Promise.resolve({ mcpServers: [], duration: 0 })
                        });
                    }
                    // Project MCPs
                    if (config_1.projects) {
                        _loop_1 = function (projectPath, projectConfig) {
                            if (projectConfig.mcpServers && Object.keys(projectConfig.mcpServers).length > 0) {
                                var groupName = path_1.default.basename(projectPath) || projectPath;
                                groupTasks.push({
                                    groupName: groupName,
                                    projectPath: projectPath,
                                    promise: (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var start, freshServers, mcpServers;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    start = Date.now();
                                                    return [4 /*yield*/, (0, mcp_auth_1.ensureMcpTokensFresh)(projectConfig.mcpServers, projectPath)];
                                                case 1:
                                                    freshServers = _a.sent();
                                                    return [4 /*yield*/, convertServers_1(freshServers, projectPath)]; // projectPath = scope
                                                case 2:
                                                    mcpServers = _a.sent() // projectPath = scope
                                                    ;
                                                    return [2 /*return*/, { mcpServers: mcpServers, duration: Date.now() - start }];
                                            }
                                        });
                                    }); })()
                                });
                            }
                        };
                        for (_i = 0, _a = Object.entries(config_1.projects); _i < _a.length; _i++) {
                            _b = _a[_i], projectPath = _b[0], projectConfig = _b[1];
                            _loop_1(projectPath, projectConfig);
                        }
                    }
                    return [4 /*yield*/, Promise.all(groupTasks.map(function (t) { return t.promise; }))
                        // Build groups with timing info
                    ];
                case 2:
                    results_1 = _d.sent();
                    groupsWithTiming = groupTasks.map(function (task, i) { return ({
                        groupName: task.groupName,
                        projectPath: task.projectPath,
                        mcpServers: results_1[i].mcpServers,
                        duration: results_1[i].duration
                    }); });
                    totalDuration = Date.now() - totalStart;
                    workingCount = __spreadArray([], exports.workingMcpServers.values(), true).filter(function (v) { return v; }).length;
                    sortedByDuration = __spreadArray([], groupsWithTiming, true).sort(function (a, b) { return b.duration - a.duration; });
                    console.log("[MCP] Cache updated in ".concat(totalDuration, "ms. Working: ").concat(workingCount, "/").concat(exports.workingMcpServers.size));
                    for (_c = 0, sortedByDuration_1 = sortedByDuration; _c < sortedByDuration_1.length; _c++) {
                        g = sortedByDuration_1[_c];
                        if (g.mcpServers.length > 0) {
                            console.log("[MCP]   ".concat(g.groupName, ": ").concat(g.duration, "ms (").concat(g.mcpServers.length, " servers)"));
                        }
                    }
                    groups = groupsWithTiming.map(function (_a) {
                        var groupName = _a.groupName, projectPath = _a.projectPath, mcpServers = _a.mcpServers;
                        return ({
                            groupName: groupName,
                            projectPath: projectPath,
                            mcpServers: mcpServers
                        });
                    });
                    return [2 /*return*/, { groups: groups }];
                case 3:
                    error_1 = _d.sent();
                    console.error("[getAllMcpConfig] Error:", error_1);
                    return [2 /*return*/, { groups: [], error: String(error_1) }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.claudeRouter = (0, index_1.router)({
    /**
     * Stream chat with Claude - single subscription handles everything
     */
    chat: index_1.publicProcedure
        .input(zod_1.z.object({
        subChatId: zod_1.z.string(),
        chatId: zod_1.z.string(),
        prompt: zod_1.z.string(),
        cwd: zod_1.z.string(),
        projectPath: zod_1.z.string().optional(), // Original project path for MCP config lookup
        mode: zod_1.z.enum(["plan", "agent"]).default("agent"),
        sessionId: zod_1.z.string().optional(),
        model: zod_1.z.string().optional(),
        customConfig: zod_1.z
            .object({
            model: zod_1.z.string().min(1),
            token: zod_1.z.string().min(1),
            baseUrl: zod_1.z.string().min(1),
        })
            .optional(),
        maxThinkingTokens: zod_1.z.number().optional(), // Enable extended thinking
        images: zod_1.z.array(imageAttachmentSchema).optional(), // Image attachments
        historyEnabled: zod_1.z.boolean().optional(),
        offlineModeEnabled: zod_1.z.boolean().optional(), // Whether offline mode (Ollama) is enabled in settings
    }))
        .subscription(function (_a) {
        var input = _a.input;
        return (0, observable_1.observable)(function (emit) {
            // Abort any existing session for this subChatId before starting a new one
            // This prevents race conditions if two messages are sent in quick succession
            var existingController = activeSessions.get(input.subChatId);
            if (existingController) {
                existingController.abort();
            }
            var abortController = new AbortController();
            var streamId = crypto.randomUUID();
            activeSessions.set(input.subChatId, abortController);
            // Stream debug logging
            var subId = input.subChatId.slice(-8); // Short ID for logs
            var streamStart = Date.now();
            var chunkCount = 0;
            var lastChunkType = "";
            // Shared sessionId for cleanup to save on abort
            var currentSessionId = null;
            console.log("[SD] M:START sub=".concat(subId, " stream=").concat(streamId.slice(-8), " mode=").concat(input.mode));
            // Track if observable is still active (not unsubscribed)
            var isObservableActive = true;
            // Helper to safely emit (no-op if already unsubscribed)
            var safeEmit = function (chunk) {
                if (!isObservableActive)
                    return false;
                try {
                    emit.next(chunk);
                    return true;
                }
                catch (_a) {
                    isObservableActive = false;
                    return false;
                }
            };
            // Helper to safely complete (no-op if already closed)
            var safeComplete = function () {
                try {
                    emit.complete();
                }
                catch (_a) {
                    // Already completed or closed
                }
            };
            // Helper to emit error to frontend
            var emitError = function (error, context) {
                var _a;
                var errorMessage = error instanceof Error ? error.message : String(error);
                var errorStack = error instanceof Error ? error.stack : undefined;
                console.error("[claude] ".concat(context, ":"), errorMessage);
                if (errorStack)
                    console.error("[claude] Stack:", errorStack);
                // Send detailed error to frontend (safely)
                safeEmit(__assign({ type: "error", errorText: "".concat(context, ": ").concat(errorMessage) }, (process.env.NODE_ENV !== "production" && {
                    debugInfo: {
                        context: context,
                        cwd: input.cwd,
                        mode: input.mode,
                        PATH: (_a = process.env.PATH) === null || _a === void 0 ? void 0 : _a.slice(0, 200),
                    },
                })));
            };
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                // Create an async generator that yields a single SDKUserMessage
                function createPromptWithImages() {
                    return __asyncGenerator(this, arguments, function createPromptWithImages_1() {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, __await({
                                        type: "user",
                                        message: {
                                            role: "user",
                                            content: messageContent_1,
                                        },
                                        parent_tool_use_id: null,
                                    })];
                                case 1: return [4 /*yield*/, _a.sent()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                var db, existing, existingMessages, existingSessionId, lastAssistantMsg, resumeAtUuid, historyEnabled, lastMsg, isDuplicate, userMessage, messagesToSave, claudeCodeToken, offlineResult, finalCustomConfig, isUsingOllama_1, connectionMethod, isDefaultAnthropicUrl, claudeQuery, sdkError_1, transform, parts_2, currentText, metadata, stderrLines_1, _a, cleanedPrompt, agentMentions, skillMentions, agentsOption, finalPrompt, prompt_1, messageContent_1, claudeEnv, isolatedConfigDir, mcpServersForSdk, cacheKey, homeClaudeDir, skillsSource, skillsTarget, agentsSource, agentsTarget, skillsSourceExists, skillsTargetExists, symlinkErr_1, agentsSourceExists, agentsTargetExists, symlinkErr_2, claudeJsonSource, stats, currentMtime, cached, lookupPath, claudeConfig, _b, _c, globalServers, projectServers, allServers, filtered, resolvedProjectPath, _i, _d, _e, name_2, config, scope, skipped, configErr_1, mkdirErr_1, hasExistingApiConfig, finalEnv, claudeBinaryPath, resumeSessionId, expectedSanitizedCwd, expectedSessionPath, redactedConfig, resolvedModel, testResponse, data, models, err_1, mcpServersFiltered, lookupPath, finalQueryPrompt, historyText, historyParts, _f, existingMessages_1, msg, textParts, parts_3, textParts, toolSummaries, _g, parts_1, p, toolName, toolInput, toolInfo, cmd, assistantContent, history_1, ollamaContext, systemPromptConfig, queryOptions, stream, messageCount, lastError, firstMessageReceived, lastAssistantUuid, streamIterationStart, planCompleted, exitPlanModeToolCallId, _h, stream_1, stream_1_1, msg, msgAnyPreview, timeToFirstMessage, msgAny, messageText, sdkError, rawErrorCode, errorCategory, errorContext, _loop_2, _j, _k, chunk, state_1, e_1_1, streamDuration, streamError_1, err, stderrOutput, errorContext, errorCategory, isSessionNotFound, Sentry, _l, assistantMessage, finalMessages, assistantMessage, finalMessages, duration, error_3, duration;
                var _m, e_1, _o, _p;
                var _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
                return __generator(this, function (_18) {
                    switch (_18.label) {
                        case 0:
                            _18.trys.push([0, 67, 68, 69]);
                            db = (0, db_1.getDatabase)();
                            existing = db
                                .select()
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                .get();
                            existingMessages = JSON.parse((existing === null || existing === void 0 ? void 0 : existing.messages) || "[]");
                            existingSessionId = (existing === null || existing === void 0 ? void 0 : existing.sessionId) || null;
                            lastAssistantMsg = __spreadArray([], existingMessages, true).reverse().find(function (m) { return m.role === "assistant"; });
                            resumeAtUuid = ((_q = lastAssistantMsg === null || lastAssistantMsg === void 0 ? void 0 : lastAssistantMsg.metadata) === null || _q === void 0 ? void 0 : _q.shouldResume)
                                ? (((_r = lastAssistantMsg === null || lastAssistantMsg === void 0 ? void 0 : lastAssistantMsg.metadata) === null || _r === void 0 ? void 0 : _r.sdkMessageUuid) || null)
                                : null;
                            historyEnabled = input.historyEnabled === true;
                            lastMsg = existingMessages[existingMessages.length - 1];
                            isDuplicate = (lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.role) === "user" &&
                                ((_t = (_s = lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.parts) === null || _s === void 0 ? void 0 : _s[0]) === null || _t === void 0 ? void 0 : _t.text) === input.prompt;
                            userMessage = void 0;
                            messagesToSave = void 0;
                            if (isDuplicate) {
                                userMessage = lastMsg;
                                messagesToSave = existingMessages;
                            }
                            else {
                                userMessage = {
                                    id: crypto.randomUUID(),
                                    role: "user",
                                    parts: [{ type: "text", text: input.prompt }],
                                };
                                messagesToSave = __spreadArray(__spreadArray([], existingMessages, true), [userMessage], false);
                                db.update(db_1.subChats)
                                    .set({
                                    messages: JSON.stringify(messagesToSave),
                                    streamId: streamId,
                                    updatedAt: new Date(),
                                })
                                    .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                    .run();
                            }
                            claudeCodeToken = getClaudeCodeToken();
                            return [4 /*yield*/, (0, claude_1.checkOfflineFallback)(input.customConfig, claudeCodeToken, undefined, // selectedOllamaModel - will be read from customConfig if present
                                (_u = input.offlineModeEnabled) !== null && _u !== void 0 ? _u : false)];
                        case 1:
                            offlineResult = _18.sent();
                            if (offlineResult.error) {
                                emitError(new Error(offlineResult.error), 'Offline mode unavailable');
                                safeEmit({ type: 'finish' });
                                safeComplete();
                                return [2 /*return*/];
                            }
                            finalCustomConfig = offlineResult.config || input.customConfig;
                            isUsingOllama_1 = offlineResult.isUsingOllama;
                            connectionMethod = "claude-subscription" // default (Claude Code OAuth)
                            ;
                            if (isUsingOllama_1) {
                                connectionMethod = "offline-ollama";
                            }
                            else if (finalCustomConfig) {
                                isDefaultAnthropicUrl = !finalCustomConfig.baseUrl ||
                                    finalCustomConfig.baseUrl.includes("anthropic.com");
                                connectionMethod = isDefaultAnthropicUrl ? "api-key" : "custom-model";
                            }
                            (0, analytics_1.setConnectionMethod)(connectionMethod);
                            claudeQuery = void 0;
                            _18.label = 2;
                        case 2:
                            _18.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, getClaudeQuery()];
                        case 3:
                            claudeQuery = _18.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            sdkError_1 = _18.sent();
                            emitError(sdkError_1, "Failed to load Claude SDK");
                            console.log("[SD] M:END sub=".concat(subId, " reason=sdk_load_error n=").concat(chunkCount));
                            safeEmit({ type: "finish" });
                            safeComplete();
                            return [2 /*return*/];
                        case 5:
                            transform = (0, claude_1.createTransformer)({
                                emitSdkMessageUuid: historyEnabled,
                                isUsingOllama: isUsingOllama_1,
                            });
                            parts_2 = [];
                            currentText = "";
                            metadata = {};
                            stderrLines_1 = [];
                            _a = parseMentions(input.prompt), cleanedPrompt = _a.cleanedPrompt, agentMentions = _a.agentMentions, skillMentions = _a.skillMentions;
                            return [4 /*yield*/, (0, agent_utils_1.buildAgentsOption)(agentMentions, input.cwd)
                                // Log if agents were mentioned
                            ];
                        case 6:
                            agentsOption = _18.sent();
                            // Log if agents were mentioned
                            if (agentMentions.length > 0) {
                                console.log("[claude] Registering agents via SDK:", Object.keys(agentsOption));
                            }
                            // Log if skills were mentioned
                            if (skillMentions.length > 0) {
                                console.log("[claude] Skills mentioned:", skillMentions);
                            }
                            finalPrompt = cleanedPrompt;
                            // Handle empty prompt when only mentions are present
                            if (!finalPrompt.trim()) {
                                if (agentMentions.length > 0 && skillMentions.length > 0) {
                                    finalPrompt = "Use the ".concat(agentMentions.join(", "), " agent(s) and invoke the \"").concat(skillMentions.join('", "'), "\" skill(s) using the Skill tool for this task.");
                                }
                                else if (agentMentions.length > 0) {
                                    finalPrompt = "Use the ".concat(agentMentions.join(", "), " agent(s) for this task.");
                                }
                                else if (skillMentions.length > 0) {
                                    finalPrompt = "Invoke the \"".concat(skillMentions.join('", "'), "\" skill(s) using the Skill tool for this task.");
                                }
                            }
                            else if (skillMentions.length > 0) {
                                // Append skill instruction to existing prompt
                                finalPrompt = "".concat(finalPrompt, "\n\nUse the \"").concat(skillMentions.join('", "'), "\" skill(s) for this task.");
                            }
                            prompt_1 = finalPrompt;
                            if (input.images && input.images.length > 0) {
                                messageContent_1 = __spreadArray([], input.images.map(function (img) { return ({
                                    type: "image",
                                    source: {
                                        type: "base64",
                                        media_type: img.mediaType,
                                        data: img.base64Data,
                                    },
                                }); }), true);
                                // Add text if present
                                if (finalPrompt.trim()) {
                                    messageContent_1.push({
                                        type: "text",
                                        text: finalPrompt,
                                    });
                                }
                                prompt_1 = createPromptWithImages();
                            }
                            claudeEnv = (0, claude_1.buildClaudeEnv)(finalCustomConfig
                                ? {
                                    customEnv: {
                                        ANTHROPIC_AUTH_TOKEN: finalCustomConfig.token,
                                        ANTHROPIC_BASE_URL: finalCustomConfig.baseUrl,
                                    },
                                }
                                : undefined);
                            // Debug logging in dev
                            if (process.env.NODE_ENV !== "production") {
                                (0, claude_1.logClaudeEnv)(claudeEnv, "[".concat(input.subChatId, "] "));
                            }
                            isolatedConfigDir = path_1.default.join(electron_1.app.getPath("userData"), "claude-sessions", isUsingOllama_1 ? input.chatId : input.subChatId);
                            mcpServersForSdk = void 0;
                            _18.label = 7;
                        case 7:
                            _18.trys.push([7, 31, , 32]);
                            return [4 /*yield*/, fs.mkdir(isolatedConfigDir, { recursive: true })
                                // Only create symlinks if not already created for this config dir
                            ];
                        case 8:
                            _18.sent();
                            cacheKey = isUsingOllama_1 ? input.chatId : input.subChatId;
                            if (!!symlinksCreated.has(cacheKey)) return [3 /*break*/, 22];
                            homeClaudeDir = path_1.default.join(os.homedir(), ".claude");
                            skillsSource = path_1.default.join(homeClaudeDir, "skills");
                            skillsTarget = path_1.default.join(isolatedConfigDir, "skills");
                            agentsSource = path_1.default.join(homeClaudeDir, "agents");
                            agentsTarget = path_1.default.join(isolatedConfigDir, "agents");
                            _18.label = 9;
                        case 9:
                            _18.trys.push([9, 14, , 15]);
                            return [4 /*yield*/, fs.stat(skillsSource).then(function () { return true; }).catch(function () { return false; })];
                        case 10:
                            skillsSourceExists = _18.sent();
                            return [4 /*yield*/, fs.lstat(skillsTarget).then(function () { return true; }).catch(function () { return false; })];
                        case 11:
                            skillsTargetExists = _18.sent();
                            if (!(skillsSourceExists && !skillsTargetExists)) return [3 /*break*/, 13];
                            return [4 /*yield*/, fs.symlink(skillsSource, skillsTarget, "dir")];
                        case 12:
                            _18.sent();
                            _18.label = 13;
                        case 13: return [3 /*break*/, 15];
                        case 14:
                            symlinkErr_1 = _18.sent();
                            return [3 /*break*/, 15];
                        case 15:
                            _18.trys.push([15, 20, , 21]);
                            return [4 /*yield*/, fs.stat(agentsSource).then(function () { return true; }).catch(function () { return false; })];
                        case 16:
                            agentsSourceExists = _18.sent();
                            return [4 /*yield*/, fs.lstat(agentsTarget).then(function () { return true; }).catch(function () { return false; })];
                        case 17:
                            agentsTargetExists = _18.sent();
                            if (!(agentsSourceExists && !agentsTargetExists)) return [3 /*break*/, 19];
                            return [4 /*yield*/, fs.symlink(agentsSource, agentsTarget, "dir")];
                        case 18:
                            _18.sent();
                            _18.label = 19;
                        case 19: return [3 /*break*/, 21];
                        case 20:
                            symlinkErr_2 = _18.sent();
                            return [3 /*break*/, 21];
                        case 21:
                            symlinksCreated.add(cacheKey);
                            _18.label = 22;
                        case 22:
                            claudeJsonSource = path_1.default.join(os.homedir(), ".claude.json");
                            _18.label = 23;
                        case 23:
                            _18.trys.push([23, 29, , 30]);
                            return [4 /*yield*/, fs.stat(claudeJsonSource).catch(function () { return null; })];
                        case 24:
                            stats = _18.sent();
                            if (!stats) return [3 /*break*/, 28];
                            currentMtime = stats.mtimeMs;
                            cached = mcpConfigCache.get(claudeJsonSource);
                            lookupPath = input.projectPath || input.cwd;
                            claudeConfig = void 0;
                            if (!(cached && cached.mtime === currentMtime)) return [3 /*break*/, 25];
                            claudeConfig = cached.config;
                            return [3 /*break*/, 27];
                        case 25:
                            _c = (_b = JSON).parse;
                            return [4 /*yield*/, fs.readFile(claudeJsonSource, "utf-8")];
                        case 26:
                            claudeConfig = _c.apply(_b, [_18.sent()]);
                            mcpConfigCache.set(claudeJsonSource, { config: claudeConfig, mtime: currentMtime });
                            _18.label = 27;
                        case 27:
                            globalServers = claudeConfig.mcpServers || {};
                            projectServers = (0, claude_config_1.getProjectMcpServers)(claudeConfig, lookupPath) || {};
                            allServers = __assign(__assign({}, globalServers), projectServers);
                            // Filter to only working MCPs using scoped cache keys
                            if (exports.workingMcpServers.size > 0) {
                                filtered = {};
                                resolvedProjectPath = (0, claude_config_1.resolveProjectPathFromWorktree)(lookupPath) || lookupPath;
                                for (_i = 0, _d = Object.entries(allServers); _i < _d.length; _i++) {
                                    _e = _d[_i], name_2 = _e[0], config = _e[1];
                                    scope = name_2 in projectServers ? resolvedProjectPath : null;
                                    if (exports.workingMcpServers.get(mcpCacheKey(scope, name_2)) === true) {
                                        filtered[name_2] = config;
                                    }
                                }
                                mcpServersForSdk = filtered;
                                skipped = Object.keys(allServers).length - Object.keys(filtered).length;
                                if (skipped > 0) {
                                    console.log("[claude] Filtered out ".concat(skipped, " non-working MCP(s)"));
                                }
                            }
                            else {
                                mcpServersForSdk = allServers;
                            }
                            _18.label = 28;
                        case 28: return [3 /*break*/, 30];
                        case 29:
                            configErr_1 = _18.sent();
                            console.error("[claude] Failed to read MCP config:", configErr_1);
                            return [3 /*break*/, 30];
                        case 30: return [3 /*break*/, 32];
                        case 31:
                            mkdirErr_1 = _18.sent();
                            console.error("[claude] Failed to setup isolated config dir:", mkdirErr_1);
                            return [3 /*break*/, 32];
                        case 32:
                            hasExistingApiConfig = !!(claudeEnv.ANTHROPIC_API_KEY || claudeEnv.ANTHROPIC_BASE_URL);
                            if (hasExistingApiConfig) {
                                console.log("[claude] Using existing CLI config - API_KEY: ".concat(claudeEnv.ANTHROPIC_API_KEY ? "set" : "not set", ", BASE_URL: ").concat(claudeEnv.ANTHROPIC_BASE_URL || "default"));
                            }
                            finalEnv = __assign(__assign(__assign({}, claudeEnv), (claudeCodeToken && !hasExistingApiConfig && {
                                CLAUDE_CODE_OAUTH_TOKEN: claudeCodeToken,
                            })), { 
                                // Re-enable CLAUDE_CONFIG_DIR now that we properly map MCP configs
                                CLAUDE_CONFIG_DIR: isolatedConfigDir });
                            claudeBinaryPath = (0, claude_1.getBundledClaudeBinaryPath)();
                            resumeSessionId = input.sessionId || existingSessionId || undefined;
                            expectedSanitizedCwd = input.cwd.replace(/[/.]/g, "-");
                            expectedSessionPath = path_1.default.join(isolatedConfigDir, "projects", expectedSanitizedCwd, "".concat(resumeSessionId, ".jsonl"));
                            console.log("[claude] ========== SESSION DEBUG ==========");
                            console.log("[claude] subChatId: ".concat(input.subChatId));
                            console.log("[claude] cwd: ".concat(input.cwd));
                            console.log("[claude] sanitized cwd (expected): ".concat(expectedSanitizedCwd));
                            console.log("[claude] CLAUDE_CONFIG_DIR: ".concat(isolatedConfigDir));
                            console.log("[claude] Expected session path: ".concat(expectedSessionPath));
                            console.log("[claude] Session ID to resume: ".concat(resumeSessionId));
                            console.log("[claude] Existing sessionId from DB: ".concat(existingSessionId));
                            console.log("[claude] Resume at UUID: ".concat(resumeAtUuid));
                            console.log("[claude] ========== END SESSION DEBUG ==========");
                            console.log("[SD] Query options - cwd: ".concat(input.cwd, ", projectPath: ").concat(input.projectPath || "(not set)", ", mcpServers: ").concat(mcpServersForSdk ? Object.keys(mcpServersForSdk).join(", ") : "(none)"));
                            if (finalCustomConfig) {
                                redactedConfig = __assign(__assign({}, finalCustomConfig), { token: "".concat(finalCustomConfig.token.slice(0, 6), "...") });
                                if (isUsingOllama_1) {
                                    console.log("[Ollama] Using offline mode - Model: ".concat(finalCustomConfig.model, ", Base URL: ").concat(finalCustomConfig.baseUrl));
                                }
                                else {
                                    console.log("[claude] Custom config: ".concat(JSON.stringify(redactedConfig)));
                                }
                            }
                            resolvedModel = (finalCustomConfig === null || finalCustomConfig === void 0 ? void 0 : finalCustomConfig.model) || input.model;
                            if (!(isUsingOllama_1 && finalCustomConfig)) return [3 /*break*/, 39];
                            console.log('[Ollama Debug] Testing Ollama connectivity...');
                            _18.label = 33;
                        case 33:
                            _18.trys.push([33, 38, , 39]);
                            return [4 /*yield*/, fetch("".concat(finalCustomConfig.baseUrl, "/api/tags"), {
                                    signal: AbortSignal.timeout(2000)
                                })];
                        case 34:
                            testResponse = _18.sent();
                            if (!testResponse.ok) return [3 /*break*/, 36];
                            return [4 /*yield*/, testResponse.json()];
                        case 35:
                            data = _18.sent();
                            models = ((_v = data.models) === null || _v === void 0 ? void 0 : _v.map(function (m) { return m.name; })) || [];
                            console.log('[Ollama Debug] Ollama is responding. Available models:', models);
                            if (!models.includes(finalCustomConfig.model)) {
                                console.error("[Ollama Debug] WARNING: Model \"".concat(finalCustomConfig.model, "\" not found in Ollama!"));
                                console.error("[Ollama Debug] Available models:", models);
                                console.error("[Ollama Debug] This will likely cause the stream to hang or fail silently.");
                            }
                            else {
                                console.log("[Ollama Debug] \u2713 Model \"".concat(finalCustomConfig.model, "\" is available"));
                            }
                            return [3 /*break*/, 37];
                        case 36:
                            console.error('[Ollama Debug] Ollama returned error:', testResponse.status);
                            _18.label = 37;
                        case 37: return [3 /*break*/, 39];
                        case 38:
                            err_1 = _18.sent();
                            console.error('[Ollama Debug] Failed to connect to Ollama:', err_1);
                            return [3 /*break*/, 39];
                        case 39:
                            mcpServersFiltered = void 0;
                            if (!isUsingOllama_1) return [3 /*break*/, 40];
                            console.log('[Ollama] Skipping MCP servers to speed up initialization');
                            mcpServersFiltered = undefined;
                            return [3 /*break*/, 43];
                        case 40:
                            if (!(mcpServersForSdk && Object.keys(mcpServersForSdk).length > 0)) return [3 /*break*/, 42];
                            lookupPath = input.projectPath || input.cwd;
                            return [4 /*yield*/, (0, mcp_auth_1.ensureMcpTokensFresh)(mcpServersForSdk, lookupPath)];
                        case 41:
                            mcpServersFiltered = _18.sent();
                            return [3 /*break*/, 43];
                        case 42:
                            mcpServersFiltered = mcpServersForSdk;
                            _18.label = 43;
                        case 43:
                            // Log SDK configuration for debugging
                            if (isUsingOllama_1) {
                                console.log('[Ollama Debug] SDK Configuration:', {
                                    model: resolvedModel,
                                    baseUrl: finalEnv.ANTHROPIC_BASE_URL,
                                    cwd: input.cwd,
                                    configDir: isolatedConfigDir,
                                    hasAuthToken: !!finalEnv.ANTHROPIC_AUTH_TOKEN,
                                    tokenPreview: ((_w = finalEnv.ANTHROPIC_AUTH_TOKEN) === null || _w === void 0 ? void 0 : _w.slice(0, 10)) + '...',
                                });
                                console.log('[Ollama Debug] Session settings:', {
                                    resumeSessionId: resumeSessionId || 'none (first message)',
                                    mode: resumeSessionId ? 'resume' : 'continue',
                                    note: resumeSessionId
                                        ? 'Resuming existing session to maintain chat history'
                                        : 'Starting new session with continue mode'
                                });
                            }
                            finalQueryPrompt = prompt_1;
                            if (isUsingOllama_1 && typeof prompt_1 === 'string') {
                                historyText = '';
                                if (existingMessages.length > 0) {
                                    historyParts = [];
                                    for (_f = 0, existingMessages_1 = existingMessages; _f < existingMessages_1.length; _f++) {
                                        msg = existingMessages_1[_f];
                                        if (msg.role === 'user') {
                                            textParts = ((_x = msg.parts) === null || _x === void 0 ? void 0 : _x.filter(function (p) { return p.type === 'text'; }).map(function (p) { return p.text; })) || [];
                                            if (textParts.length > 0) {
                                                historyParts.push("User: ".concat(textParts.join('\n')));
                                            }
                                        }
                                        else if (msg.role === 'assistant') {
                                            parts_3 = msg.parts || [];
                                            textParts = [];
                                            toolSummaries = [];
                                            for (_g = 0, parts_1 = parts_3; _g < parts_1.length; _g++) {
                                                p = parts_1[_g];
                                                if (p.type === 'text' && p.text) {
                                                    textParts.push(p.text);
                                                }
                                                else if (p.type === 'tool_use' || p.type === 'tool-use') {
                                                    toolName = p.name || p.tool || 'unknown';
                                                    toolInput = p.input || {};
                                                    toolInfo = "[Used ".concat(toolName);
                                                    if (toolName === 'Read' && (toolInput.file_path || toolInput.file)) {
                                                        toolInfo += ": ".concat(toolInput.file_path || toolInput.file);
                                                    }
                                                    else if (toolName === 'Edit' && toolInput.file_path) {
                                                        toolInfo += ": ".concat(toolInput.file_path);
                                                    }
                                                    else if (toolName === 'Write' && toolInput.file_path) {
                                                        toolInfo += ": ".concat(toolInput.file_path);
                                                    }
                                                    else if (toolName === 'Glob' && toolInput.pattern) {
                                                        toolInfo += ": ".concat(toolInput.pattern);
                                                    }
                                                    else if (toolName === 'Grep' && toolInput.pattern) {
                                                        toolInfo += ": \"".concat(toolInput.pattern, "\"");
                                                    }
                                                    else if (toolName === 'Bash' && toolInput.command) {
                                                        cmd = String(toolInput.command).slice(0, 50);
                                                        toolInfo += ": ".concat(cmd).concat(toolInput.command.length > 50 ? '...' : '');
                                                    }
                                                    toolInfo += ']';
                                                    toolSummaries.push(toolInfo);
                                                }
                                            }
                                            assistantContent = '';
                                            if (textParts.length > 0) {
                                                assistantContent = textParts.join('\n');
                                            }
                                            if (toolSummaries.length > 0) {
                                                if (assistantContent) {
                                                    assistantContent += '\n' + toolSummaries.join(' ');
                                                }
                                                else {
                                                    assistantContent = toolSummaries.join(' ');
                                                }
                                            }
                                            if (assistantContent) {
                                                historyParts.push("Assistant: ".concat(assistantContent));
                                            }
                                        }
                                    }
                                    if (historyParts.length > 0) {
                                        history_1 = historyParts.join('\n\n');
                                        if (history_1.length > 10000) {
                                            history_1 = '...(earlier messages truncated)...\n\n' + history_1.slice(-10000);
                                        }
                                        historyText = "[CONVERSATION HISTORY]\n".concat(history_1, "\n[/CONVERSATION HISTORY]\n\n");
                                        console.log("[Ollama] Added ".concat(historyParts.length, " messages to history (").concat(history_1.length, " chars)"));
                                    }
                                }
                                ollamaContext = "[CONTEXT]\nYou are a coding assistant in OFFLINE mode (Ollama model: ".concat(resolvedModel || 'unknown', ").\nProject: ").concat(input.projectPath || input.cwd, "\nWorking directory: ").concat(input.cwd, "\n\nIMPORTANT: When using tools, use these EXACT parameter names:\n- Read: use \"file_path\" (not \"file\")\n- Write: use \"file_path\" and \"content\"\n- Edit: use \"file_path\", \"old_string\", \"new_string\"\n- Glob: use \"pattern\" (e.g. \"**/*.ts\") and optionally \"path\"\n- Grep: use \"pattern\" and optionally \"path\"\n- Bash: use \"command\"\n\nWhen asked about the project, use Glob to find files and Read to examine them.\nBe concise and helpful.\n[/CONTEXT]\n\n").concat(historyText, "[CURRENT REQUEST]\n").concat(prompt_1, "\n[/CURRENT REQUEST]");
                                finalQueryPrompt = ollamaContext;
                                console.log('[Ollama] Context prefix added to prompt');
                            }
                            systemPromptConfig = {
                                type: "preset",
                                preset: "claude_code",
                            };
                            queryOptions = {
                                prompt: finalQueryPrompt,
                                options: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ abortController: abortController, cwd: input.cwd, systemPrompt: systemPromptConfig }, (!isUsingOllama_1 && Object.keys(agentsOption).length > 0 && { agents: agentsOption })), (mcpServersFiltered && Object.keys(mcpServersFiltered).length > 0 && { mcpServers: mcpServersFiltered })), { env: finalEnv, permissionMode: input.mode === "plan"
                                        ? "plan"
                                        : "bypassPermissions" }), (input.mode !== "plan" && {
                                    allowDangerouslySkipPermissions: true,
                                })), { includePartialMessages: true }), (!isUsingOllama_1 && { settingSources: ["project", "user"] })), { canUseTool: function (toolName, toolInput, options) { return __awaiter(void 0, void 0, void 0, function () {
                                        var filePath, toolUseID_1, response, askToolPart, errorMessage, answers, answerResult;
                                        var _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    // Fix common parameter mistakes from Ollama models
                                                    // Local models often use slightly wrong parameter names
                                                    if (isUsingOllama_1) {
                                                        // Read: "file" -> "file_path"
                                                        if (toolName === "Read" && toolInput.file && !toolInput.file_path) {
                                                            toolInput.file_path = toolInput.file;
                                                            delete toolInput.file;
                                                            console.log('[Ollama] Fixed Read tool: file -> file_path');
                                                        }
                                                        // Write: "file" -> "file_path", "content" is usually correct
                                                        if (toolName === "Write" && toolInput.file && !toolInput.file_path) {
                                                            toolInput.file_path = toolInput.file;
                                                            delete toolInput.file;
                                                            console.log('[Ollama] Fixed Write tool: file -> file_path');
                                                        }
                                                        // Edit: "file" -> "file_path"
                                                        if (toolName === "Edit" && toolInput.file && !toolInput.file_path) {
                                                            toolInput.file_path = toolInput.file;
                                                            delete toolInput.file;
                                                            console.log('[Ollama] Fixed Edit tool: file -> file_path');
                                                        }
                                                        // Glob: "path" might be passed as "directory" or "dir"
                                                        if (toolName === "Glob") {
                                                            if (toolInput.directory && !toolInput.path) {
                                                                toolInput.path = toolInput.directory;
                                                                delete toolInput.directory;
                                                                console.log('[Ollama] Fixed Glob tool: directory -> path');
                                                            }
                                                            if (toolInput.dir && !toolInput.path) {
                                                                toolInput.path = toolInput.dir;
                                                                delete toolInput.dir;
                                                                console.log('[Ollama] Fixed Glob tool: dir -> path');
                                                            }
                                                        }
                                                        // Grep: "query" -> "pattern", "directory" -> "path"
                                                        if (toolName === "Grep") {
                                                            if (toolInput.query && !toolInput.pattern) {
                                                                toolInput.pattern = toolInput.query;
                                                                delete toolInput.query;
                                                                console.log('[Ollama] Fixed Grep tool: query -> pattern');
                                                            }
                                                            if (toolInput.directory && !toolInput.path) {
                                                                toolInput.path = toolInput.directory;
                                                                delete toolInput.directory;
                                                                console.log('[Ollama] Fixed Grep tool: directory -> path');
                                                            }
                                                        }
                                                        // Bash: "cmd" -> "command"
                                                        if (toolName === "Bash" && toolInput.cmd && !toolInput.command) {
                                                            toolInput.command = toolInput.cmd;
                                                            delete toolInput.cmd;
                                                            console.log('[Ollama] Fixed Bash tool: cmd -> command');
                                                        }
                                                    }
                                                    if (input.mode === "plan") {
                                                        if (toolName === "Edit" || toolName === "Write") {
                                                            filePath = typeof toolInput.file_path === "string"
                                                                ? toolInput.file_path
                                                                : "";
                                                            if (!/\.md$/i.test(filePath)) {
                                                                return [2 /*return*/, {
                                                                        behavior: "deny",
                                                                        message: 'Only ".md" files can be modified in plan mode.',
                                                                    }];
                                                            }
                                                        }
                                                        else if (PLAN_MODE_BLOCKED_TOOLS.has(toolName)) {
                                                            return [2 /*return*/, {
                                                                    behavior: "deny",
                                                                    message: "Tool \"".concat(toolName, "\" blocked in plan mode."),
                                                                }];
                                                        }
                                                    }
                                                    if (!(toolName === "AskUserQuestion")) return [3 /*break*/, 2];
                                                    toolUseID_1 = options.toolUseID;
                                                    // Emit to UI (safely in case observer is closed)
                                                    safeEmit({
                                                        type: "ask-user-question",
                                                        toolUseId: toolUseID_1,
                                                        questions: toolInput.questions,
                                                    });
                                                    return [4 /*yield*/, new Promise(function (resolve) {
                                                            var timeoutId = setTimeout(function () {
                                                                pendingToolApprovals.delete(toolUseID_1);
                                                                // Emit chunk to notify UI that the question has timed out
                                                                // This ensures the pending question dialog is cleared
                                                                safeEmit({
                                                                    type: "ask-user-question-timeout",
                                                                    toolUseId: toolUseID_1,
                                                                });
                                                                resolve({ approved: false, message: "Timed out" });
                                                            }, 60000);
                                                            pendingToolApprovals.set(toolUseID_1, {
                                                                subChatId: input.subChatId,
                                                                resolve: function (d) {
                                                                    clearTimeout(timeoutId);
                                                                    resolve(d);
                                                                },
                                                            });
                                                        })
                                                        // Find the tool part in accumulated parts
                                                    ];
                                                case 1:
                                                    response = _b.sent();
                                                    askToolPart = parts_2.find(function (p) { return p.toolCallId === toolUseID_1 && p.type === "tool-AskUserQuestion"; });
                                                    if (!response.approved) {
                                                        errorMessage = response.message || "Skipped";
                                                        if (askToolPart) {
                                                            askToolPart.result = errorMessage;
                                                            askToolPart.state = "result";
                                                        }
                                                        // Emit result to frontend so it updates in real-time
                                                        safeEmit({
                                                            type: "ask-user-question-result",
                                                            toolUseId: toolUseID_1,
                                                            result: errorMessage,
                                                        });
                                                        return [2 /*return*/, {
                                                                behavior: "deny",
                                                                message: errorMessage,
                                                            }];
                                                    }
                                                    answers = (_a = response.updatedInput) === null || _a === void 0 ? void 0 : _a.answers;
                                                    answerResult = { answers: answers };
                                                    if (askToolPart) {
                                                        askToolPart.result = answerResult;
                                                        askToolPart.state = "result";
                                                    }
                                                    // Emit result to frontend so it updates in real-time
                                                    safeEmit({
                                                        type: "ask-user-question-result",
                                                        toolUseId: toolUseID_1,
                                                        result: answerResult,
                                                    });
                                                    return [2 /*return*/, {
                                                            behavior: "allow",
                                                            updatedInput: response.updatedInput,
                                                        }];
                                                case 2: return [2 /*return*/, {
                                                        behavior: "allow",
                                                        updatedInput: toolInput,
                                                    }];
                                            }
                                        });
                                    }); }, stderr: function (data) {
                                        stderrLines_1.push(data);
                                        if (isUsingOllama_1) {
                                            console.error("[Ollama stderr]", data);
                                        }
                                        else {
                                            console.error("[claude stderr]", data);
                                        }
                                    }, 
                                    // Use bundled binary
                                    pathToClaudeCodeExecutable: claudeBinaryPath }), (resumeSessionId && __assign({ resume: resumeSessionId }, (resumeAtUuid && !isUsingOllama_1
                                    ? { resumeSessionAt: resumeAtUuid }
                                    : { continue: true })))), (!resumeSessionId && { continue: true })), (resolvedModel && { model: resolvedModel })), (input.maxThinkingTokens && {
                                    maxThinkingTokens: input.maxThinkingTokens,
                                })),
                            };
                            stream = void 0;
                            try {
                                stream = claudeQuery(queryOptions);
                            }
                            catch (queryError) {
                                console.error("[CLAUDE] ✗ Failed to create SDK query:", queryError);
                                emitError(queryError, "Failed to start Claude query");
                                console.log("[SD] M:END sub=".concat(subId, " reason=query_error n=").concat(chunkCount));
                                safeEmit({ type: "finish" });
                                safeComplete();
                                return [2 /*return*/];
                            }
                            messageCount = 0;
                            lastError = null;
                            firstMessageReceived = false;
                            lastAssistantUuid = null;
                            streamIterationStart = Date.now();
                            planCompleted = false;
                            exitPlanModeToolCallId = null;
                            if (isUsingOllama_1) {
                                console.log("[Ollama] ===== STARTING STREAM ITERATION =====");
                                console.log("[Ollama] Model: ".concat(finalCustomConfig === null || finalCustomConfig === void 0 ? void 0 : finalCustomConfig.model));
                                console.log("[Ollama] Base URL: ".concat(finalCustomConfig === null || finalCustomConfig === void 0 ? void 0 : finalCustomConfig.baseUrl));
                                console.log("[Ollama] Prompt: \"".concat(typeof input.prompt === 'string' ? input.prompt.slice(0, 100) : 'N/A', "...\""));
                                console.log("[Ollama] CWD: ".concat(input.cwd));
                            }
                            _18.label = 44;
                        case 44:
                            _18.trys.push([44, 57, , 64]);
                            _18.label = 45;
                        case 45:
                            _18.trys.push([45, 50, 51, 56]);
                            _h = true, stream_1 = __asyncValues(stream);
                            _18.label = 46;
                        case 46: return [4 /*yield*/, stream_1.next()];
                        case 47:
                            if (!(stream_1_1 = _18.sent(), _m = stream_1_1.done, !_m)) return [3 /*break*/, 49];
                            _p = stream_1_1.value;
                            _h = false;
                            msg = _p;
                            if (abortController.signal.aborted) {
                                if (isUsingOllama_1)
                                    console.log("[Ollama] Stream aborted by user");
                                return [3 /*break*/, 49];
                            }
                            messageCount++;
                            // Extra logging for Ollama to diagnose issues
                            if (isUsingOllama_1) {
                                msgAnyPreview = msg;
                                console.log("[Ollama] ===== MESSAGE #".concat(messageCount, " ====="));
                                console.log("[Ollama] Type: ".concat(msgAnyPreview.type));
                                console.log("[Ollama] Subtype: ".concat(msgAnyPreview.subtype || 'none'));
                                if (msgAnyPreview.event) {
                                    console.log("[Ollama] Event: ".concat(msgAnyPreview.event.type), {
                                        delta_type: (_y = msgAnyPreview.event.delta) === null || _y === void 0 ? void 0 : _y.type,
                                        content_block_type: (_z = msgAnyPreview.event.content_block) === null || _z === void 0 ? void 0 : _z.type
                                    });
                                }
                                if ((_0 = msgAnyPreview.message) === null || _0 === void 0 ? void 0 : _0.content) {
                                    console.log("[Ollama] Message content blocks:", msgAnyPreview.message.content.length);
                                    msgAnyPreview.message.content.forEach(function (block, idx) {
                                        var _a;
                                        console.log("[Ollama]   Block ".concat(idx, ": type=").concat(block.type, ", text_length=").concat(((_a = block.text) === null || _a === void 0 ? void 0 : _a.length) || 0));
                                    });
                                }
                            }
                            // Warn if SDK initialization is slow (MCP delay)
                            if (!firstMessageReceived) {
                                firstMessageReceived = true;
                                timeToFirstMessage = Date.now() - streamIterationStart;
                                if (isUsingOllama_1) {
                                    console.log("[Ollama] Time to first message: ".concat(timeToFirstMessage, "ms"));
                                }
                                if (timeToFirstMessage > 5000) {
                                    console.warn("[claude] SDK initialization took ".concat((timeToFirstMessage / 1000).toFixed(1), "s (MCP servers loading?)"));
                                }
                            }
                            // Log raw message for debugging
                            (0, claude_1.logRawClaudeMessage)(input.chatId, msg);
                            msgAny = msg;
                            if (msgAny.type === "error" || msgAny.error) {
                                messageText = (_3 = (_2 = (_1 = msgAny.message) === null || _1 === void 0 ? void 0 : _1.content) === null || _2 === void 0 ? void 0 : _2[0]) === null || _3 === void 0 ? void 0 : _3.text;
                                sdkError = messageText || msgAny.error || msgAny.message || "Unknown SDK error";
                                lastError = new Error(sdkError);
                                // Detailed SDK error logging in main process
                                console.error("[CLAUDE SDK ERROR] ========================================");
                                console.error("[CLAUDE SDK ERROR] Raw error: ".concat(sdkError));
                                console.error("[CLAUDE SDK ERROR] Message type: ".concat(msgAny.type));
                                console.error("[CLAUDE SDK ERROR] SubChat ID: ".concat(input.subChatId));
                                console.error("[CLAUDE SDK ERROR] Chat ID: ".concat(input.chatId));
                                console.error("[CLAUDE SDK ERROR] CWD: ".concat(input.cwd));
                                console.error("[CLAUDE SDK ERROR] Mode: ".concat(input.mode));
                                console.error("[CLAUDE SDK ERROR] Session ID: ".concat(msgAny.session_id || 'none'));
                                console.error("[CLAUDE SDK ERROR] Has custom config: ".concat(!!finalCustomConfig));
                                console.error("[CLAUDE SDK ERROR] Is using Ollama: ".concat(isUsingOllama_1));
                                console.error("[CLAUDE SDK ERROR] Model: ".concat(resolvedModel || 'default'));
                                console.error("[CLAUDE SDK ERROR] Has OAuth token: ".concat(!!claudeCodeToken));
                                console.error("[CLAUDE SDK ERROR] MCP servers: ".concat(mcpServersFiltered ? Object.keys(mcpServersFiltered).join(', ') : 'none'));
                                console.error("[CLAUDE SDK ERROR] Full message:", JSON.stringify(msgAny, null, 2));
                                console.error("[CLAUDE SDK ERROR] ========================================");
                                rawErrorCode = msgAny.error || "";
                                errorCategory = "SDK_ERROR";
                                errorContext = sdkError;
                                if (rawErrorCode === "authentication_failed" ||
                                    sdkError.includes("authentication")) {
                                    errorCategory = "AUTH_FAILED_SDK";
                                    errorContext =
                                        "Authentication failed - not logged into Claude Code CLI";
                                }
                                else if (String(sdkError).includes("invalid_token") ||
                                    String(sdkError).includes("Invalid access token")) {
                                    errorCategory = "MCP_INVALID_TOKEN";
                                    errorContext = "Invalid access token. Update MCP settings";
                                }
                                else if (rawErrorCode === "invalid_api_key" ||
                                    sdkError.includes("api_key")) {
                                    errorCategory = "INVALID_API_KEY_SDK";
                                    errorContext = "Invalid API key in Claude Code CLI";
                                }
                                else if (rawErrorCode === "rate_limit_exceeded" ||
                                    sdkError.includes("rate")) {
                                    errorCategory = "RATE_LIMIT_SDK";
                                    errorContext = "Session limit reached";
                                }
                                else if (rawErrorCode === "overloaded" ||
                                    sdkError.includes("overload")) {
                                    errorCategory = "OVERLOADED_SDK";
                                    errorContext = "Claude is overloaded, try again later";
                                }
                                else if (rawErrorCode === "invalid_request" ||
                                    sdkError.includes("Usage Policy") ||
                                    sdkError.includes("violate")) {
                                    // Usage Policy violation - keep the full detailed error text
                                    errorCategory = "USAGE_POLICY_VIOLATION";
                                    // errorContext already contains the full message from sdkError
                                }
                                // Emit auth-error for authentication failures, regular error otherwise
                                if (errorCategory === "AUTH_FAILED_SDK") {
                                    safeEmit({
                                        type: "auth-error",
                                        errorText: errorContext,
                                    });
                                }
                                else {
                                    safeEmit({
                                        type: "error",
                                        errorText: errorContext,
                                        debugInfo: {
                                            category: errorCategory,
                                            rawErrorCode: rawErrorCode,
                                            sessionId: msgAny.session_id,
                                            messageId: (_4 = msgAny.message) === null || _4 === void 0 ? void 0 : _4.id,
                                        },
                                    });
                                }
                                console.log("[SD] M:END sub=".concat(subId, " reason=sdk_error cat=").concat(errorCategory, " n=").concat(chunkCount));
                                console.error("[SD] SDK Error details:", {
                                    errorCategory: errorCategory,
                                    errorContext: errorContext.slice(0, 200), // Truncate for log readability
                                    rawErrorCode: rawErrorCode,
                                    sessionId: msgAny.session_id,
                                    messageId: (_5 = msgAny.message) === null || _5 === void 0 ? void 0 : _5.id,
                                    fullMessage: JSON.stringify(msgAny, null, 2),
                                });
                                safeEmit({ type: "finish" });
                                safeComplete();
                                return [2 /*return*/];
                            }
                            // Track sessionId for rollback support (available on all messages)
                            if (msgAny.session_id) {
                                metadata.sessionId = msgAny.session_id;
                                currentSessionId = msgAny.session_id; // Share with cleanup
                            }
                            // Track UUID from assistant messages for resumeSessionAt
                            if (msgAny.type === "assistant" && msgAny.uuid) {
                                lastAssistantUuid = msgAny.uuid;
                            }
                            // When result arrives, assign the last assistant UUID to metadata
                            // It will be emitted as part of the merged message-metadata chunk below
                            if (msgAny.type === "result" && historyEnabled && lastAssistantUuid) {
                                metadata.sdkMessageUuid = lastAssistantUuid;
                            }
                            // Debug: Log system messages from SDK
                            if (msgAny.type === "system") {
                                // Full log to see all fields including MCP errors
                                console.log("[SD] SYSTEM message: subtype=".concat(msgAny.subtype), JSON.stringify({
                                    cwd: msgAny.cwd,
                                    mcp_servers: msgAny.mcp_servers,
                                    tools: msgAny.tools,
                                    plugins: msgAny.plugins,
                                    permissionMode: msgAny.permissionMode,
                                }, null, 2));
                            }
                            _loop_2 = function (chunk) {
                                chunkCount++;
                                lastChunkType = chunk.type;
                                // For message-metadata, inject sdkMessageUuid before emitting
                                // so the frontend receives the full merged metadata in one chunk
                                if (chunk.type === "message-metadata" && metadata.sdkMessageUuid) {
                                    chunk.messageMetadata = __assign(__assign({}, chunk.messageMetadata), { sdkMessageUuid: metadata.sdkMessageUuid });
                                }
                                // Use safeEmit to prevent throws when observer is closed
                                if (!safeEmit(chunk)) {
                                    // Observer closed (user clicked Stop), break out of loop
                                    console.log("[SD] M:EMIT_CLOSED sub=".concat(subId, " type=").concat(chunk.type, " n=").concat(chunkCount));
                                    return "break";
                                }
                                // Accumulate based on chunk type
                                switch (chunk.type) {
                                    case "text-delta":
                                        currentText += chunk.delta;
                                        break;
                                    case "text-end":
                                        if (currentText.trim()) {
                                            parts_2.push({ type: "text", text: currentText });
                                            currentText = "";
                                        }
                                        break;
                                    case "tool-input-available":
                                        // DEBUG: Log tool calls
                                        console.log("[SD] M:TOOL_CALL sub=".concat(subId, " toolName=\"").concat(chunk.toolName, "\" mode=").concat(input.mode, " callId=").concat(chunk.toolCallId));
                                        // Track ExitPlanMode toolCallId so we can stop when it completes
                                        if (input.mode === "plan" && chunk.toolName === "ExitPlanMode") {
                                            console.log("[SD] M:PLAN_TOOL_DETECTED sub=".concat(subId, " callId=").concat(chunk.toolCallId));
                                            exitPlanModeToolCallId = chunk.toolCallId;
                                        }
                                        parts_2.push({
                                            type: "tool-".concat(chunk.toolName),
                                            toolCallId: chunk.toolCallId,
                                            toolName: chunk.toolName,
                                            input: chunk.input,
                                            state: "call",
                                            startedAt: Date.now(),
                                        });
                                        break;
                                    case "tool-output-available":
                                        var toolPart = parts_2.find(function (p) {
                                            var _a;
                                            return ((_a = p.type) === null || _a === void 0 ? void 0 : _a.startsWith("tool-")) &&
                                                p.toolCallId === chunk.toolCallId;
                                        });
                                        if (toolPart) {
                                            toolPart.result = chunk.output;
                                            toolPart.output = chunk.output; // Backwards compatibility for the UI that relies on output field
                                            toolPart.state = "result";
                                            // Notify renderer about file changes for Write/Edit tools
                                            if (toolPart.type === "tool-Write" || toolPart.type === "tool-Edit") {
                                                var filePath = (_6 = toolPart.input) === null || _6 === void 0 ? void 0 : _6.file_path;
                                                if (filePath) {
                                                    var windows = electron_1.BrowserWindow.getAllWindows();
                                                    for (var _19 = 0, windows_1 = windows; _19 < windows_1.length; _19++) {
                                                        var win = windows_1[_19];
                                                        win.webContents.send("file-changed", {
                                                            filePath: filePath,
                                                            type: toolPart.type,
                                                            subChatId: input.subChatId
                                                        });
                                                    }
                                                }
                                            }
                                            // Check if ExitPlanMode just completed - stop the stream
                                            if (exitPlanModeToolCallId && chunk.toolCallId === exitPlanModeToolCallId) {
                                                console.log("[SD] M:PLAN_FINISH sub=".concat(subId, " - ExitPlanMode completed, emitting finish"));
                                                planCompleted = true;
                                                safeEmit({ type: "finish" });
                                            }
                                        }
                                        break;
                                    case "message-metadata":
                                        metadata = __assign(__assign({}, metadata), chunk.messageMetadata);
                                        break;
                                    case "system-Compact":
                                        // Add system-Compact to parts so it renders in the chat
                                        // Find existing part by toolCallId or add new one
                                        var existingCompact = parts_2.find(function (p) { return p.type === "system-Compact" && p.toolCallId === chunk.toolCallId; });
                                        if (existingCompact) {
                                            existingCompact.state = chunk.state;
                                        }
                                        else {
                                            parts_2.push({
                                                type: "system-Compact",
                                                toolCallId: chunk.toolCallId,
                                                state: chunk.state,
                                            });
                                        }
                                        break;
                                }
                                // Break from chunk loop if plan is done
                                if (planCompleted) {
                                    console.log("[SD] M:PLAN_BREAK_CHUNK sub=".concat(subId));
                                    return "break";
                                }
                            };
                            // Transform and emit + accumulate
                            for (_j = 0, _k = transform(msg); _j < _k.length; _j++) {
                                chunk = _k[_j];
                                state_1 = _loop_2(chunk);
                                if (state_1 === "break")
                                    break;
                            }
                            // Break from stream loop if observer closed (user clicked Stop)
                            if (!isObservableActive) {
                                console.log("[SD] M:OBSERVER_CLOSED_STREAM sub=".concat(subId));
                                return [3 /*break*/, 49];
                            }
                            // Break from stream loop if plan completed
                            if (planCompleted) {
                                console.log("[SD] M:PLAN_BREAK_STREAM sub=".concat(subId));
                                return [3 /*break*/, 49];
                            }
                            _18.label = 48;
                        case 48:
                            _h = true;
                            return [3 /*break*/, 46];
                        case 49: return [3 /*break*/, 56];
                        case 50:
                            e_1_1 = _18.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 56];
                        case 51:
                            _18.trys.push([51, , 54, 55]);
                            if (!(!_h && !_m && (_o = stream_1.return))) return [3 /*break*/, 53];
                            return [4 /*yield*/, _o.call(stream_1)];
                        case 52:
                            _18.sent();
                            _18.label = 53;
                        case 53: return [3 /*break*/, 55];
                        case 54:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 55: return [7 /*endfinally*/];
                        case 56:
                            streamDuration = Date.now() - streamIterationStart;
                            if (isUsingOllama_1) {
                                console.log("[Ollama] ===== STREAM COMPLETED =====");
                                console.log("[Ollama] Total messages: ".concat(messageCount));
                                console.log("[Ollama] Duration: ".concat(streamDuration, "ms"));
                                console.log("[Ollama] Chunks emitted: ".concat(chunkCount));
                            }
                            if (messageCount === 0) {
                                console.error("[claude] Stream yielded no messages - model not responding");
                                if (isUsingOllama_1) {
                                    console.error("[Ollama] ===== DIAGNOSIS =====");
                                    console.error("[Ollama] Problem: Stream completed but NO messages received from SDK");
                                    console.error("[Ollama] This usually means:");
                                    console.error("[Ollama]   1. Ollama doesn't support Anthropic Messages API format (/v1/messages)");
                                    console.error("[Ollama]   2. Model failed to start generating (check Ollama logs: ollama logs)");
                                    console.error("[Ollama]   3. Network issue between Claude SDK and Ollama");
                                    console.error("[Ollama] ===== NEXT STEPS =====");
                                    console.error("[Ollama]   1. Check if model works: curl http://localhost:11434/api/generate -d '{\"model\":\"".concat(finalCustomConfig === null || finalCustomConfig === void 0 ? void 0 : finalCustomConfig.model, "\",\"prompt\":\"test\"}'"));
                                    console.error("[Ollama]   2. Check Ollama version supports Messages API");
                                    console.error("[Ollama]   3. Try using a proxy that converts Anthropic API \u2192 Ollama format");
                                }
                            }
                            else if (messageCount === 1 && isUsingOllama_1) {
                                console.warn("[Ollama] Only received 1 message (likely just init). No actual content generated.");
                            }
                            return [3 /*break*/, 64];
                        case 57:
                            streamError_1 = _18.sent();
                            err = streamError_1;
                            stderrOutput = stderrLines_1.join("\n");
                            if (isUsingOllama_1) {
                                console.error("[Ollama] ===== STREAM ERROR =====");
                                console.error("[Ollama] Error message: ".concat(err.message));
                                console.error("[Ollama] Error stack:", err.stack);
                                console.error("[Ollama] Messages received before error: ".concat(messageCount));
                                if (stderrOutput) {
                                    console.error("[Ollama] Claude binary stderr:", stderrOutput);
                                }
                            }
                            errorContext = "Claude streaming error";
                            errorCategory = "UNKNOWN";
                            isSessionNotFound = stderrOutput === null || stderrOutput === void 0 ? void 0 : stderrOutput.includes("No conversation found with session ID");
                            if (isSessionNotFound) {
                                // Clear the invalid session ID from database so next attempt starts fresh
                                console.log("[claude] Session not found - clearing invalid sessionId from database");
                                db.update(db_1.subChats)
                                    .set({ sessionId: null })
                                    .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                    .run();
                                errorContext = "Previous session expired. Please try again.";
                                errorCategory = "SESSION_EXPIRED";
                            }
                            else if ((_7 = err.message) === null || _7 === void 0 ? void 0 : _7.includes("exited with code")) {
                                errorContext = "Claude Code process crashed";
                                errorCategory = "PROCESS_CRASH";
                            }
                            else if ((_8 = err.message) === null || _8 === void 0 ? void 0 : _8.includes("ENOENT")) {
                                errorContext = "Required executable not found in PATH";
                                errorCategory = "EXECUTABLE_NOT_FOUND";
                            }
                            else if (((_9 = err.message) === null || _9 === void 0 ? void 0 : _9.includes("authentication")) ||
                                ((_10 = err.message) === null || _10 === void 0 ? void 0 : _10.includes("401"))) {
                                errorContext = "Authentication failed - check your API key";
                                errorCategory = "AUTH_FAILURE";
                            }
                            else if (((_11 = err.message) === null || _11 === void 0 ? void 0 : _11.includes("invalid_api_key")) ||
                                ((_12 = err.message) === null || _12 === void 0 ? void 0 : _12.includes("Invalid API Key")) ||
                                (stderrOutput === null || stderrOutput === void 0 ? void 0 : stderrOutput.includes("invalid_api_key"))) {
                                errorContext = "Invalid API key";
                                errorCategory = "INVALID_API_KEY";
                            }
                            else if (((_13 = err.message) === null || _13 === void 0 ? void 0 : _13.includes("rate_limit")) ||
                                ((_14 = err.message) === null || _14 === void 0 ? void 0 : _14.includes("429"))) {
                                errorContext = "Session limit reached";
                                errorCategory = "RATE_LIMIT";
                            }
                            else if (((_15 = err.message) === null || _15 === void 0 ? void 0 : _15.includes("network")) ||
                                ((_16 = err.message) === null || _16 === void 0 ? void 0 : _16.includes("ECONNREFUSED")) ||
                                ((_17 = err.message) === null || _17 === void 0 ? void 0 : _17.includes("fetch failed"))) {
                                errorContext = "Network error - check your connection";
                                errorCategory = "NETWORK_ERROR";
                            }
                            if (!(electron_1.app.isReady() && electron_1.app.isPackaged)) return [3 /*break*/, 61];
                            _18.label = 58;
                        case 58:
                            _18.trys.push([58, 60, , 61]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require("@sentry/electron/main"); })];
                        case 59:
                            Sentry = _18.sent();
                            Sentry.captureException(err, {
                                tags: {
                                    errorCategory: errorCategory,
                                    mode: input.mode,
                                },
                                extra: {
                                    context: errorContext,
                                    cwd: input.cwd,
                                    stderr: stderrOutput || "(no stderr captured)",
                                    chatId: input.chatId,
                                    subChatId: input.subChatId,
                                },
                            });
                            return [3 /*break*/, 61];
                        case 60:
                            _l = _18.sent();
                            return [3 /*break*/, 61];
                        case 61:
                            // Send error with stderr output to frontend (only if not aborted by user)
                            if (!abortController.signal.aborted) {
                                safeEmit({
                                    type: "error",
                                    errorText: stderrOutput
                                        ? "".concat(errorContext, ": ").concat(err.message, "\n\nProcess output:\n").concat(stderrOutput)
                                        : "".concat(errorContext, ": ").concat(err.message),
                                    debugInfo: {
                                        context: errorContext,
                                        category: errorCategory,
                                        cwd: input.cwd,
                                        mode: input.mode,
                                        stderr: stderrOutput || "(no stderr captured)",
                                    },
                                });
                            }
                            // ALWAYS save accumulated parts before returning (even on abort/error)
                            console.log("[SD] M:CATCH_SAVE sub=".concat(subId, " aborted=").concat(abortController.signal.aborted, " parts=").concat(parts_2.length));
                            if (currentText.trim()) {
                                parts_2.push({ type: "text", text: currentText });
                            }
                            if (!(parts_2.length > 0)) return [3 /*break*/, 63];
                            assistantMessage = {
                                id: crypto.randomUUID(),
                                role: "assistant",
                                parts: parts_2,
                                metadata: metadata,
                            };
                            finalMessages = __spreadArray(__spreadArray([], messagesToSave, true), [assistantMessage], false);
                            db.update(db_1.subChats)
                                .set({
                                messages: JSON.stringify(finalMessages),
                                sessionId: metadata.sessionId,
                                streamId: null,
                                updatedAt: new Date(),
                            })
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                .run();
                            db.update(db_1.chats)
                                .set({ updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                                .run();
                            if (!(historyEnabled && metadata.sdkMessageUuid && input.cwd)) return [3 /*break*/, 63];
                            return [4 /*yield*/, (0, stash_1.createRollbackStash)(input.cwd, metadata.sdkMessageUuid)];
                        case 62:
                            _18.sent();
                            _18.label = 63;
                        case 63:
                            console.log("[SD] M:END sub=".concat(subId, " reason=stream_error cat=").concat(errorCategory, " n=").concat(chunkCount, " last=").concat(lastChunkType));
                            safeEmit({ type: "finish" });
                            safeComplete();
                            return [2 /*return*/];
                        case 64:
                            // 6. Check if we got any response
                            if (messageCount === 0 && !abortController.signal.aborted) {
                                emitError(new Error("No response received from Claude"), "Empty response");
                                console.log("[SD] M:END sub=".concat(subId, " reason=no_response n=").concat(chunkCount));
                                safeEmit({ type: "finish" });
                                safeComplete();
                                return [2 /*return*/];
                            }
                            // 7. Save final messages to DB
                            // ALWAYS save accumulated parts, even on abort (so user sees partial responses after reload)
                            console.log("[SD] M:SAVE sub=".concat(subId, " aborted=").concat(abortController.signal.aborted, " parts=").concat(parts_2.length));
                            // Flush any remaining text
                            if (currentText.trim()) {
                                parts_2.push({ type: "text", text: currentText });
                            }
                            if (parts_2.length > 0) {
                                assistantMessage = {
                                    id: crypto.randomUUID(),
                                    role: "assistant",
                                    parts: parts_2,
                                    metadata: metadata,
                                };
                                finalMessages = __spreadArray(__spreadArray([], messagesToSave, true), [assistantMessage], false);
                                db.update(db_1.subChats)
                                    .set({
                                    messages: JSON.stringify(finalMessages),
                                    sessionId: metadata.sessionId,
                                    streamId: null,
                                    updatedAt: new Date(),
                                })
                                    .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                    .run();
                            }
                            else {
                                // No assistant response - just clear streamId
                                db.update(db_1.subChats)
                                    .set({
                                    sessionId: metadata.sessionId,
                                    streamId: null,
                                    updatedAt: new Date(),
                                })
                                    .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                                    .run();
                            }
                            // Update parent chat timestamp
                            db.update(db_1.chats)
                                .set({ updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                                .run();
                            if (!(historyEnabled && metadata.sdkMessageUuid && input.cwd)) return [3 /*break*/, 66];
                            return [4 /*yield*/, (0, stash_1.createRollbackStash)(input.cwd, metadata.sdkMessageUuid)];
                        case 65:
                            _18.sent();
                            _18.label = 66;
                        case 66:
                            duration = ((Date.now() - streamStart) / 1000).toFixed(1);
                            console.log("[SD] M:END sub=".concat(subId, " reason=ok n=").concat(chunkCount, " last=").concat(lastChunkType, " t=").concat(duration, "s"));
                            safeComplete();
                            return [3 /*break*/, 69];
                        case 67:
                            error_3 = _18.sent();
                            duration = ((Date.now() - streamStart) / 1000).toFixed(1);
                            console.log("[SD] M:END sub=".concat(subId, " reason=unexpected_error n=").concat(chunkCount, " t=").concat(duration, "s"));
                            emitError(error_3, "Unexpected error");
                            safeEmit({ type: "finish" });
                            safeComplete();
                            return [3 /*break*/, 69];
                        case 68:
                            activeSessions.delete(input.subChatId);
                            return [7 /*endfinally*/];
                        case 69: return [2 /*return*/];
                    }
                });
            }); })();
            // Cleanup on unsubscribe
            return function () {
                console.log("[SD] M:CLEANUP sub=".concat(subId, " sessionId=").concat(currentSessionId || 'none'));
                isObservableActive = false; // Prevent emit after unsubscribe
                abortController.abort();
                activeSessions.delete(input.subChatId);
                clearPendingApprovals("Session ended.", input.subChatId);
                // Save sessionId on abort so conversation can be resumed
                // Clear streamId since we're no longer streaming
                var db = (0, db_1.getDatabase)();
                db.update(db_1.subChats)
                    .set(__assign({ streamId: null }, (currentSessionId && { sessionId: currentSessionId })))
                    .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                    .run();
            };
        });
    }),
    /**
     * Get MCP servers configuration for a project
     * This allows showing MCP servers in UI before starting a chat session
     * NOTE: Does NOT fetch OAuth metadata here - that's done lazily when user clicks Auth
     */
    getMcpConfig: index_1.publicProcedure
        .input(zod_1.z.object({ projectPath: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var config, projectMcpServers, mcpServers, error_4;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config = _c.sent();
                    projectMcpServers = (0, claude_config_1.getProjectMcpServers)(config, input.projectPath);
                    if (!projectMcpServers) {
                        return [2 /*return*/, { mcpServers: [], projectPath: input.projectPath }];
                    }
                    mcpServers = Object.entries(projectMcpServers).map(function (_a) {
                        var name = _a[0], serverConfig = _a[1];
                        var configObj = serverConfig;
                        var status = getServerStatusFromConfig(configObj);
                        var hasUrl = !!configObj.url;
                        return {
                            name: name,
                            status: status,
                            config: __assign(__assign({}, configObj), { _hasUrl: hasUrl }),
                        };
                    });
                    return [2 /*return*/, { mcpServers: mcpServers, projectPath: input.projectPath }];
                case 2:
                    error_4 = _c.sent();
                    console.error("[getMcpConfig] Error reading config:", error_4);
                    return [2 /*return*/, { mcpServers: [], projectPath: input.projectPath, error: String(error_4) }];
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get ALL MCP servers configuration (global + all projects)
     * Returns grouped data for display in settings
     * Also populates the workingMcpServers cache
     */
    getAllMcpConfig: index_1.publicProcedure.query(getAllMcpConfigHandler),
    /**
     * Cancel active session
     */
    cancel: index_1.publicProcedure
        .input(zod_1.z.object({ subChatId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var controller = activeSessions.get(input.subChatId);
        if (controller) {
            controller.abort();
            activeSessions.delete(input.subChatId);
            clearPendingApprovals("Session cancelled.", input.subChatId);
            return { cancelled: true };
        }
        return { cancelled: false };
    }),
    /**
     * Check if session is active
     */
    isActive: index_1.publicProcedure
        .input(zod_1.z.object({ subChatId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return activeSessions.has(input.subChatId);
    }),
    respondToolApproval: index_1.publicProcedure
        .input(zod_1.z.object({
        toolUseId: zod_1.z.string(),
        approved: zod_1.z.boolean(),
        message: zod_1.z.string().optional(),
        updatedInput: zod_1.z.unknown().optional(),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        var pending = pendingToolApprovals.get(input.toolUseId);
        if (!pending) {
            return { ok: false };
        }
        pending.resolve({
            approved: input.approved,
            message: input.message,
            updatedInput: input.updatedInput,
        });
        pendingToolApprovals.delete(input.toolUseId);
        return { ok: true };
    }),
    /**
     * Start MCP OAuth flow for a server
     * Fetches OAuth metadata internally when needed
     */
    startMcpOAuth: index_1.publicProcedure
        .input(zod_1.z.object({
        serverName: zod_1.z.string(),
        projectPath: zod_1.z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            return [2 /*return*/, (0, mcp_auth_1.startMcpOAuth)(input.serverName, input.projectPath)];
        });
    }); }),
    /**
     * Get MCP auth status for a server
     */
    getMcpAuthStatus: index_1.publicProcedure
        .input(zod_1.z.object({
        serverName: zod_1.z.string(),
        projectPath: zod_1.z.string(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            return [2 /*return*/, (0, mcp_auth_1.getMcpAuthStatus)(input.serverName, input.projectPath)];
        });
    }); }),
});
