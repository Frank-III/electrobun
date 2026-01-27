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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMcpTools = fetchMcpTools;
exports.fetchMcpToolsStdio = fetchMcpToolsStdio;
exports.startMcpOAuth = startMcpOAuth;
exports.handleMcpOAuthCallback = handleMcpOAuthCallback;
exports.refreshMcpToken = refreshMcpToken;
exports.ensureMcpTokensFresh = ensureMcpTokensFresh;
exports.cancelAllPendingOAuth = cancelAllPendingOAuth;
exports.fetchMcpOAuthMetadata = fetchMcpOAuthMetadata;
exports.getMcpAuthStatus = getMcpAuthStatus;
var index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
var streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
var bun_1 = require("electrobun/bun");
var claude_config_1 = require("./claude-config");
var claude_env_1 = require("./claude-env");
var oauth_1 = require("./oauth");
/**
 * Fetch tools from an MCP server using the official MCP SDK
 * @param serverUrl The MCP server URL
 * @param accessToken Optional access token (not needed for public MCPs)
 */
function fetchMcpTools(serverUrl, headers) {
    return __awaiter(this, void 0, void 0, function () {
        var client, transport, requestInit, result, tools, error_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = null;
                    transport = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 10]);
                    client = new index_js_1.Client({
                        name: '21st-desktop',
                        version: '1.0.0',
                    });
                    requestInit = {};
                    if (headers && Object.keys(headers).length > 0) {
                        requestInit.headers = __assign({}, headers);
                    }
                    transport = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(serverUrl), {
                        requestInit: requestInit,
                    });
                    return [4 /*yield*/, client.connect(transport)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, client.listTools()];
                case 3:
                    result = _b.sent();
                    tools = result.tools || [];
                    console.log("[MCP] Fetched ".concat(tools.length, " tools via SDK"));
                    return [2 /*return*/, tools.map(function (t) { return t.name; })];
                case 4:
                    error_1 = _b.sent();
                    console.error('[MCP] Failed to fetch tools:', error_1);
                    return [2 /*return*/, []];
                case 5:
                    _b.trys.push([5, 8, , 9]);
                    if (!transport) return [3 /*break*/, 7];
                    return [4 /*yield*/, transport.close()];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    _a = _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sensitive env vars to filter out when spawning MCP subprocesses
 */
var BLOCKED_ENV_VARS = [
    'ANTHROPIC_API_KEY',
    'CLAUDE_CODE_OAUTH_TOKEN',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SESSION_TOKEN',
    'GITHUB_TOKEN',
    'GH_TOKEN',
    'OPENAI_API_KEY',
];
/**
 * Fetch tools from a stdio-based MCP server
 * Uses shell environment to ensure proper PATH (homebrew, nvm, etc.) in production
 */
function fetchMcpToolsStdio(config) {
    return __awaiter(this, void 0, void 0, function () {
        var transport, client, shellEnv, safeEnv, _i, _a, _b, key, value, result, tools, error_2, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    transport = null;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, 6, 11]);
                    client = new index_js_1.Client({
                        name: '21st-desktop',
                        version: '1.0.0',
                    });
                    return [4 /*yield*/, (0, claude_env_1.getClaudeShellEnvironment)()];
                case 2:
                    shellEnv = _d.sent();
                    safeEnv = {};
                    for (_i = 0, _a = Object.entries(shellEnv); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (!BLOCKED_ENV_VARS.includes(key)) {
                            safeEnv[key] = value;
                        }
                    }
                    transport = new stdio_js_1.StdioClientTransport({
                        command: config.command,
                        args: config.args,
                        env: __assign(__assign({}, safeEnv), config.env),
                    });
                    return [4 /*yield*/, client.connect(transport)];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, client.listTools()];
                case 4:
                    result = _d.sent();
                    tools = result.tools || [];
                    console.log("[MCP] Fetched ".concat(tools.length, " tools via stdio"));
                    return [2 /*return*/, tools.map(function (t) { return t.name; })];
                case 5:
                    error_2 = _d.sent();
                    console.error('[MCP] Failed to fetch tools via stdio:', error_2);
                    return [2 /*return*/, []];
                case 6:
                    _d.trys.push([6, 9, , 10]);
                    if (!transport) return [3 /*break*/, 8];
                    return [4 /*yield*/, transport.close()];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    _c = _d.sent();
                    return [3 /*break*/, 10];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
var constants_1 = require("./constants");
var OAUTH_TIMEOUT_MS = 5 * 60 * 1000;
function getMcpOAuthRedirectUri() {
    return constants_1.IS_DEV
        ? "http://localhost:".concat(constants_1.AUTH_SERVER_PORT, "/callback")
        : "http://127.0.0.1:".concat(constants_1.AUTH_SERVER_PORT, "/callback");
}
var pendingOAuthFlows = new Map();
var authServerStarted = false;
function ensureAuthServer() {
    if (authServerStarted)
        return;
    authServerStarted = true;
    Bun.serve({
        port: constants_1.AUTH_SERVER_PORT,
        fetch: function (req) {
            var url = new URL(req.url);
            if (url.pathname === "/callback") {
                var code = url.searchParams.get("code");
                var state = url.searchParams.get("state");
                if (code && state) {
                    handleMcpOAuthCallback(code, state).catch(function (error) {
                        console.error("[MCP OAuth] Callback error:", error);
                    });
                    return new Response("MCP authentication complete. You can return to the app.");
                }
                return new Response("Missing OAuth parameters.", { status: 400 });
            }
            return new Response("Not found", { status: 404 });
        },
    });
}
/**
 * Start MCP OAuth flow for a server
 * Fetches OAuth metadata from .well-known endpoint
 */
function startMcpOAuth(serverName, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var config, serverConfig, redirectUri, oauth, authFlowResult, error_3, msg, authUrl, state, codeVerifier, tokenEndpoint, clientId, clientSecret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config = _a.sent();
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, projectPath, serverName)];
                case 2:
                    serverConfig = _a.sent();
                    if (!(serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.url)) {
                        return [2 /*return*/, { success: false, error: "MCP server \"".concat(serverName, "\" URL not configured") }];
                    }
                    redirectUri = getMcpOAuthRedirectUri();
                    oauth = new oauth_1.CraftOAuth({ mcpBaseUrl: (0, oauth_1.getMcpBaseUrl)(serverConfig.url), redirectUri: redirectUri }, { onStatus: function (msg) { return console.log("[MCP OAuth] ".concat(msg)); }, onError: function (err) { return console.error("[MCP OAuth] ".concat(err)); } });
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, oauth.startAuthFlow()];
                case 4:
                    authFlowResult = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    msg = error_3 instanceof Error ? error_3.message : String(error_3);
                    console.error("[MCP OAuth] Failed to start auth flow: ".concat(msg));
                    return [2 /*return*/, { success: false, error: msg }];
                case 6:
                    authUrl = authFlowResult.authUrl, state = authFlowResult.state, codeVerifier = authFlowResult.codeVerifier, tokenEndpoint = authFlowResult.tokenEndpoint, clientId = authFlowResult.clientId, clientSecret = authFlowResult.clientSecret;
                    // 4. Store pending flow and wait for callback
                    return [2 /*return*/, new Promise(function (resolve) {
                            ensureAuthServer();
                            var timeoutId = setTimeout(function () {
                                pendingOAuthFlows.delete(state);
                                resolve({ success: false, error: 'OAuth timeout' });
                            }, OAUTH_TIMEOUT_MS);
                            pendingOAuthFlows.set(state, {
                                serverName: serverName,
                                projectPath: projectPath,
                                codeVerifier: codeVerifier,
                                tokenEndpoint: tokenEndpoint,
                                clientId: clientId,
                                clientSecret: clientSecret,
                                redirectUri: redirectUri,
                                resolve: resolve,
                                timeoutId: timeoutId,
                            });
                            // Open browser
                            bun_1.Utils.openExternal(authUrl);
                        })];
            }
        });
    });
}
/**
 * Handle OAuth callback from deeplink
 */
function handleMcpOAuthCallback(code, state) {
    return __awaiter(this, void 0, void 0, function () {
        var pending, config, serverUrl, oauth, tokens, error_4, msg;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pending = pendingOAuthFlows.get(state);
                    if (!pending) {
                        console.warn("[MCP OAuth] No pending flow for state: ".concat(state.slice(0, 8), "..."));
                        return [2 /*return*/];
                    }
                    clearTimeout(pending.timeoutId);
                    pendingOAuthFlows.delete(state);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 2:
                    config = _b.sent();
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, pending.projectPath, pending.serverName)];
                case 3:
                    serverUrl = (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.url;
                    if (!serverUrl) {
                        throw new Error("Server URL not found for ".concat(pending.serverName));
                    }
                    oauth = new oauth_1.CraftOAuth({ mcpBaseUrl: (0, oauth_1.getMcpBaseUrl)(serverUrl), redirectUri: pending.redirectUri }, { onStatus: function () { }, onError: function () { } });
                    return [4 /*yield*/, oauth.completeAuthFlow(code, pending.codeVerifier, pending.tokenEndpoint, pending.clientId, pending.clientSecret)];
                case 4:
                    tokens = _b.sent();
                    // 3. Save to ~/.claude.json
                    return [4 /*yield*/, saveTokensToClaudeJson(pending.serverName, pending.projectPath, tokens, pending.clientId)];
                case 5:
                    // 3. Save to ~/.claude.json
                    _b.sent();
                    pending.resolve({ success: true });
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _b.sent();
                    msg = error_4 instanceof Error ? error_4.message : String(error_4);
                    pending.resolve({ success: false, error: msg });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if MCP token needs refresh (within 5 minutes of expiry)
 */
function needsRefresh(expiresAt) {
    if (!expiresAt)
        return false;
    var fiveMinutes = 5 * 60 * 1000;
    return Date.now() > expiresAt - fiveMinutes;
}
/**
 * Refresh MCP OAuth token for a server
 * Returns the new access token, or null if refresh fails
 */
function refreshMcpToken(serverName, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var config, serverConfig, resolvedProjectPath, globalConfig, oauth, craftOAuth, tokens, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config = _a.sent();
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, projectPath, serverName)];
                case 2:
                    serverConfig = _a.sent();
                    resolvedProjectPath = projectPath;
                    if (!!(serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.url)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, claude_config_1.GLOBAL_MCP_PATH, serverName)];
                case 3:
                    globalConfig = _a.sent();
                    if (globalConfig === null || globalConfig === void 0 ? void 0 : globalConfig.url) {
                        serverConfig = globalConfig;
                        resolvedProjectPath = claude_config_1.GLOBAL_MCP_PATH;
                    }
                    _a.label = 4;
                case 4:
                    if (!(serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.url)) {
                        console.log("[MCP Refresh] No URL for server ".concat(serverName));
                        return [2 /*return*/, null];
                    }
                    oauth = serverConfig._oauth;
                    if (!(oauth === null || oauth === void 0 ? void 0 : oauth.refreshToken) || !(oauth === null || oauth === void 0 ? void 0 : oauth.clientId)) {
                        console.log("[MCP Refresh] No refresh token or clientId for ".concat(serverName));
                        return [2 /*return*/, null];
                    }
                    craftOAuth = new oauth_1.CraftOAuth({ mcpBaseUrl: (0, oauth_1.getMcpBaseUrl)(serverConfig.url) }, { onStatus: function () { }, onError: function () { } });
                    return [4 /*yield*/, craftOAuth.refreshAccessToken(oauth.refreshToken, oauth.clientId)];
                case 5:
                    tokens = _a.sent();
                    // Update ~/.claude.json with new tokens
                    return [4 /*yield*/, saveTokensToClaudeJson(serverName, resolvedProjectPath, tokens, oauth.clientId)];
                case 6:
                    // Update ~/.claude.json with new tokens
                    _a.sent();
                    console.log("[MCP Refresh] Successfully refreshed token for ".concat(serverName));
                    return [2 /*return*/, tokens.accessToken];
                case 7:
                    error_5 = _a.sent();
                    console.error("[MCP Refresh] Failed to refresh token for ".concat(serverName, ":"), error_5);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Ensure MCP servers have valid tokens, refreshing if needed
 * Call this before passing servers to the SDK
 * Returns the servers config with updated Authorization headers
 */
function ensureMcpTokensFresh(mcpServers, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var updatedServers, _i, _a, _b, serverName, serverConfig, oauth, newToken;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    updatedServers = __assign({}, mcpServers);
                    _i = 0, _a = Object.entries(mcpServers);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], serverName = _b[0], serverConfig = _b[1];
                    oauth = serverConfig._oauth;
                    // Skip servers without OAuth
                    if (!(oauth === null || oauth === void 0 ? void 0 : oauth.accessToken))
                        return [3 /*break*/, 3];
                    if (!needsRefresh(oauth.expiresAt)) return [3 /*break*/, 3];
                    console.log("[MCP] Token for ".concat(serverName, " expires soon, refreshing..."));
                    return [4 /*yield*/, refreshMcpToken(serverName, projectPath)];
                case 2:
                    newToken = _c.sent();
                    if (newToken) {
                        // Update the server config with the new token
                        updatedServers[serverName] = __assign(__assign({}, serverConfig), { headers: __assign(__assign({}, (serverConfig.headers || {})), { Authorization: "Bearer ".concat(newToken) }), _oauth: __assign(__assign({}, oauth), { accessToken: newToken }) });
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, updatedServers];
            }
        });
    });
}
/**
 * Save OAuth tokens to ~/.claude.json atomically.
 * Uses a mutex to prevent race conditions when multiple concurrent
 * token refreshes try to update the config simultaneously.
 */
function saveTokensToClaudeJson(serverName, projectPath, tokens, clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, claude_config_1.updateClaudeConfigAtomic)(function (config) { return __awaiter(_this, void 0, void 0, function () {
                        var existingConfig, serverUrl, serverType, existingHeaders, headers;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, projectPath, serverName)];
                                case 1:
                                    existingConfig = (_a.sent()) || {};
                                    serverUrl = existingConfig.url;
                                    serverType = (serverUrl === null || serverUrl === void 0 ? void 0 : serverUrl.endsWith('/sse')) ? 'sse' : 'http';
                                    existingHeaders = existingConfig.headers || {};
                                    headers = __assign(__assign({}, existingHeaders), { Authorization: "Bearer ".concat(tokens.accessToken) });
                                    return [4 /*yield*/, (0, claude_config_1.updateMcpServerConfig)(config, projectPath, serverName, {
                                            // SDK-required fields
                                            type: serverType,
                                            headers: headers,
                                            // Internal tracking (for token refresh, status checking)
                                            _oauth: {
                                                accessToken: tokens.accessToken,
                                                refreshToken: tokens.refreshToken,
                                                clientId: clientId,
                                                expiresAt: tokens.expiresAt,
                                            },
                                        })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cancelAllPendingOAuth() {
    for (var _i = 0, pendingOAuthFlows_1 = pendingOAuthFlows; _i < pendingOAuthFlows_1.length; _i++) {
        var _a = pendingOAuthFlows_1[_i], state = _a[0], pending = _a[1];
        clearTimeout(pending.timeoutId);
        pending.resolve({ success: false, error: 'Cancelled' });
    }
    pendingOAuthFlows.clear();
}
/**
 * Fetch OAuth metadata for MCP server if available
 * Returns metadata if server supports OAuth, undefined otherwise
 */
function fetchMcpOAuthMetadata(serverName, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var config, serverConfig, baseUrl, metadata, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config = _b.sent();
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, projectPath, serverName)];
                case 2:
                    serverConfig = _b.sent();
                    if (!(serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.url)) {
                        return [2 /*return*/, undefined];
                    }
                    baseUrl = (0, oauth_1.getMcpBaseUrl)(serverConfig.url);
                    return [4 /*yield*/, (0, oauth_1.fetchOAuthMetadata)(baseUrl)];
                case 3:
                    metadata = _b.sent();
                    return [2 /*return*/, metadata !== null && metadata !== void 0 ? metadata : undefined];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get auth status for MCP server
 */
function getMcpAuthStatus(serverName, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var config, oauth, isExpired, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, claude_config_1.readClaudeConfig)()];
                case 1:
                    config = _c.sent();
                    return [4 /*yield*/, (0, claude_config_1.getMcpServerConfig)(config, projectPath, serverName)];
                case 2:
                    oauth = (_b = (_c.sent())) === null || _b === void 0 ? void 0 : _b._oauth;
                    if (!(oauth === null || oauth === void 0 ? void 0 : oauth.accessToken))
                        return [2 /*return*/, { hasTokens: false }];
                    isExpired = oauth.expiresAt ? Date.now() > oauth.expiresAt : false;
                    return [2 /*return*/, { hasTokens: true, isExpired: isExpired }];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, { hasTokens: false }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
