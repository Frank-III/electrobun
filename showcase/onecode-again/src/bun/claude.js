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
exports.getAllMcpConfigHandler = getAllMcpConfigHandler;
exports.createClaudeHandlers = createClaudeHandlers;
var path_1 = require("path");
var claude_config_1 = require("./claude-config");
var mcp_auth_1 = require("./mcp-auth");
var oauth_1 = require("./oauth");
var workingMcpServers = new Map();
var GLOBAL_SCOPE = "__global__";
function mcpCacheKey(scope, serverName) {
    return "".concat(scope !== null && scope !== void 0 ? scope : GLOBAL_SCOPE, "::").concat(serverName);
}
function getServerStatusFromConfig(serverConfig) {
    var headers = serverConfig.headers;
    var oauth = serverConfig._oauth, authType = serverConfig.authType;
    if (authType === "none") {
        return "connected";
    }
    if (headers === null || headers === void 0 ? void 0 : headers.Authorization) {
        return "connected";
    }
    if ((oauth === null || oauth === void 0 ? void 0 : oauth.accessToken) && !(headers === null || headers === void 0 ? void 0 : headers.Authorization)) {
        return "needs-auth";
    }
    if (serverConfig.url && ["oauth", "bearer"].includes(authType !== null && authType !== void 0 ? authType : "")) {
        return "needs-auth";
    }
    return "connected";
}
function fetchToolsForServer(serverConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var timeoutMs, timeoutPromise, fetchPromise, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    timeoutMs = 2500;
                    timeoutPromise = new Promise(function (resolve) {
                        return setTimeout(function () { return resolve([]); }, timeoutMs);
                    });
                    fetchPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, command, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!serverConfig.url) return [3 /*break*/, 4];
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, mcp_auth_1.fetchMcpTools)(serverConfig.url, serverConfig.headers)];
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
function getAllMcpConfigHandler() {
    return __awaiter(this, void 0, void 0, function () {
        var totalStart, config_1, convertServers_1, groupTasks, _loop_1, _i, _a, _b, projectPath, projectConfig, results_1, groupsWithTiming, totalDuration, workingCount, sortedByDuration, _c, sortedByDuration_1, g, groups, error_1;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 3, , 4]);
                    totalStart = Date.now();
                    workingMcpServers.clear();
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
                                                        workingMcpServers.set(cacheKey, true);
                                                        return [3 /*break*/, 12];
                                                    case 5:
                                                        workingMcpServers.set(cacheKey, false);
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
                                            return [4 /*yield*/, convertServers_1(freshServers, null)];
                                        case 2:
                                            mcpServers = _a.sent();
                                            return [2 /*return*/, { mcpServers: mcpServers, duration: Date.now() - start }];
                                    }
                                });
                            }); })(),
                        });
                    }
                    else {
                        groupTasks.push({
                            groupName: "Global",
                            projectPath: null,
                            promise: Promise.resolve({ mcpServers: [], duration: 0 }),
                        });
                    }
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
                                                    return [4 /*yield*/, convertServers_1(freshServers, projectPath)];
                                                case 2:
                                                    mcpServers = _a.sent();
                                                    return [2 /*return*/, { mcpServers: mcpServers, duration: Date.now() - start }];
                                            }
                                        });
                                    }); })(),
                                });
                            }
                        };
                        for (_i = 0, _a = Object.entries(config_1.projects); _i < _a.length; _i++) {
                            _b = _a[_i], projectPath = _b[0], projectConfig = _b[1];
                            _loop_1(projectPath, projectConfig);
                        }
                    }
                    return [4 /*yield*/, Promise.all(groupTasks.map(function (t) { return t.promise; }))];
                case 2:
                    results_1 = _d.sent();
                    groupsWithTiming = groupTasks.map(function (task, i) { return ({
                        groupName: task.groupName,
                        projectPath: task.projectPath,
                        mcpServers: results_1[i].mcpServers,
                        duration: results_1[i].duration,
                    }); });
                    totalDuration = Date.now() - totalStart;
                    workingCount = __spreadArray([], workingMcpServers.values(), true).filter(function (v) { return v; }).length;
                    sortedByDuration = __spreadArray([], groupsWithTiming, true).sort(function (a, b) { return b.duration - a.duration; });
                    console.log("[MCP] Cache updated in ".concat(totalDuration, "ms. Working: ").concat(workingCount, "/").concat(workingMcpServers.size));
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
                            mcpServers: mcpServers,
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
function createClaudeHandlers() {
    var _this = this;
    return {
        claudeGetMcpConfig: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var config, projectMcpServers, mcpServers, error_3;
            var projectPath = _b.projectPath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                    case 1:
                        config = _c.sent();
                        return [4 /*yield*/, (0, claude_config_1.getProjectMcpServers)(config, projectPath)];
                    case 2:
                        projectMcpServers = _c.sent();
                        if (!projectMcpServers) {
                            return [2 /*return*/, { mcpServers: [], projectPath: projectPath }];
                        }
                        mcpServers = Object.entries(projectMcpServers).map(function (_a) {
                            var name = _a[0], serverConfig = _a[1];
                            var configObj = serverConfig;
                            var status = getServerStatusFromConfig(serverConfig);
                            var hasUrl = !!configObj.url;
                            return { name: name, status: status, config: __assign(__assign({}, configObj), { _hasUrl: hasUrl }) };
                        });
                        return [2 /*return*/, { mcpServers: mcpServers, projectPath: projectPath }];
                    case 3:
                        error_3 = _c.sent();
                        console.error("[getMcpConfig] Error reading config:", error_3);
                        return [2 /*return*/, { mcpServers: [], projectPath: projectPath, error: String(error_3) }];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        claudeGetAllMcpConfig: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, getAllMcpConfigHandler()];
        }); }); },
        claudeStartMcpOAuth: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var serverName = _b.serverName, projectPath = _b.projectPath;
            return __generator(this, function (_c) {
                return [2 /*return*/, (0, mcp_auth_1.startMcpOAuth)(serverName, projectPath)];
            });
        }); },
        claudeFetchMcpOAuthMetadata: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var metadata;
            var serverName = _b.serverName, projectPath = _b.projectPath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, mcp_auth_1.fetchMcpOAuthMetadata)(serverName, projectPath)];
                    case 1:
                        metadata = _c.sent();
                        return [2 /*return*/, { metadata: metadata !== null && metadata !== void 0 ? metadata : null }];
                }
            });
        }); },
    };
}
