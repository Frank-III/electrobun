"use strict";
/**
 * SourceCredentialManager
 *
 * Unified credential management for sources. Consolidates credential CRUD,
 * credential ID resolution, expiry checking, and OAuth flows.
 *
 * This replaces scattered credential logic across:
 * - SourceService.getSourceToken()
 * - SourceService.getApiCredential()
 * - SourceService.getCredentialId()
 * - session-scoped-tools OAuth triggers
 * - IPC handlers for credential storage
 */
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
exports.SourceCredentialManager = void 0;
exports.sourceNeedsAuthentication = sourceNeedsAuthentication;
exports.getSourcesNeedingAuth = getSourcesNeedingAuth;
exports.getSourceCredentialManager = getSourceCredentialManager;
var types_ts_1 = require("./types.ts");
var index_ts_1 = require("../credentials/index.ts");
var oauth_ts_1 = require("../auth/oauth.ts");
var google_oauth_ts_1 = require("../auth/google-oauth.ts");
var slack_oauth_ts_1 = require("../auth/slack-oauth.ts");
var microsoft_oauth_ts_1 = require("../auth/microsoft-oauth.ts");
var debug_ts_1 = require("../utils/debug.ts");
var storage_ts_1 = require("./storage.ts");
/**
 * SourceCredentialManager - unified credential operations for sources
 *
 * Usage:
 * ```typescript
 * const credManager = new SourceCredentialManager();
 *
 * // Save credentials
 * await credManager.save(source, { value: 'token123' });
 *
 * // Load credentials
 * const cred = await credManager.load(source);
 *
 * // Run OAuth flow
 * const result = await credManager.authenticate(source, {
 *   onStatus: (msg) => console.log(msg),
 *   onError: (err) => console.error(err),
 * });
 * ```
 */
var SourceCredentialManager = /** @class */ (function () {
    function SourceCredentialManager() {
    }
    // ============================================================
    // Core CRUD Operations
    // ============================================================
    /**
     * Save credential for a source
     */
    SourceCredentialManager.prototype.save = function (source, credential) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialId, manager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentialId = this.getCredentialId(source);
                        manager = (0, index_ts_1.getCredentialManager)();
                        return [4 /*yield*/, manager.set(credentialId, credential)];
                    case 1:
                        _a.sent();
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Saved ".concat(credentialId.type, " for ").concat(source.config.slug));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load credential for a source
     *
     * For MCP sources, tries both OAuth and bearer credentials as fallback
     * (credentials may have been stored via different auth modes)
     */
    SourceCredentialManager.prototype.load = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var manager, credentialId, cred;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        manager = (0, index_ts_1.getCredentialManager)();
                        // For MCP sources, try both OAuth and bearer credentials
                        // (stdio transport doesn't need credentials)
                        if (source.config.type === 'mcp' && ((_a = source.config.mcp) === null || _a === void 0 ? void 0 : _a.transport) !== 'stdio' && ((_b = source.config.mcp) === null || _b === void 0 ? void 0 : _b.authType) !== 'none') {
                            return [2 /*return*/, this.loadMcpCredential(source)];
                        }
                        credentialId = this.getCredentialId(source);
                        return [4 /*yield*/, manager.get(credentialId)];
                    case 1:
                        cred = _c.sent();
                        if (cred) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] Found ".concat(credentialId.type, " for ").concat(source.config.slug));
                        }
                        return [2 /*return*/, cred];
                }
            });
        });
    };
    /**
     * Load MCP credential with fallback (OAuth -> bearer)
     */
    SourceCredentialManager.prototype.loadMcpCredential = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var manager, baseId, oauthCreds, bearerCreds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = (0, index_ts_1.getCredentialManager)();
                        baseId = {
                            workspaceId: source.workspaceId,
                            sourceId: source.config.slug,
                        };
                        return [4 /*yield*/, manager.get(__assign({ type: 'source_oauth' }, baseId))];
                    case 1:
                        oauthCreds = _a.sent();
                        if (oauthCreds === null || oauthCreds === void 0 ? void 0 : oauthCreds.value) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] Found source_oauth for ".concat(source.config.slug));
                            return [2 /*return*/, oauthCreds];
                        }
                        return [4 /*yield*/, manager.get(__assign({ type: 'source_bearer' }, baseId))];
                    case 2:
                        bearerCreds = _a.sent();
                        if (bearerCreds === null || bearerCreds === void 0 ? void 0 : bearerCreds.value) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] Found source_bearer for ".concat(source.config.slug));
                            return [2 /*return*/, bearerCreds];
                        }
                        (0, debug_ts_1.debug)("[SourceCredentialManager] No credential found for MCP source ".concat(source.config.slug));
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Delete credential for a source
     */
    SourceCredentialManager.prototype.delete = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialId, manager, deleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentialId = this.getCredentialId(source);
                        manager = (0, index_ts_1.getCredentialManager)();
                        return [4 /*yield*/, manager.delete(credentialId)];
                    case 1:
                        deleted = _a.sent();
                        if (deleted) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] Deleted ".concat(credentialId.type, " for ").concat(source.config.slug));
                        }
                        return [2 /*return*/, deleted];
                }
            });
        });
    };
    /**
     * Get token value for a source (convenience method)
     * Returns null if no credential exists or if expired
     */
    SourceCredentialManager.prototype.getToken = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var cred;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.load(source)];
                    case 1:
                        cred = _a.sent();
                        if (!(cred === null || cred === void 0 ? void 0 : cred.value))
                            return [2 /*return*/, null];
                        // Check expiry
                        if (this.isExpired(cred)) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] Token expired for ".concat(source.config.slug));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, cred.value];
                }
            });
        });
    };
    /**
     * Get API credential for a source (handles basic auth JSON parsing)
     */
    SourceCredentialManager.prototype.getApiCredential = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var cred, parsed;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.load(source)];
                    case 1:
                        cred = _b.sent();
                        if (!(cred === null || cred === void 0 ? void 0 : cred.value))
                            return [2 /*return*/, null];
                        // Check for basic auth (JSON with username/password)
                        if (((_a = source.config.api) === null || _a === void 0 ? void 0 : _a.authType) === 'basic') {
                            try {
                                parsed = JSON.parse(cred.value);
                                if (parsed.username && parsed.password) {
                                    return [2 /*return*/, parsed];
                                }
                            }
                            catch (_c) {
                                // Not JSON, treat as regular credential
                            }
                        }
                        return [2 /*return*/, cred.value];
                }
            });
        });
    };
    // ============================================================
    // Credential ID Resolution
    // ============================================================
    /**
     * Get the credential ID for a source
     *
     * Determines the correct credential type based on:
     * - Source type (mcp, api, local)
     * - Auth type (oauth, bearer, header, etc.)
     */
    SourceCredentialManager.prototype.getCredentialId = function (source) {
        var mcp = source.config.mcp;
        var api = source.config.api;
        var type;
        if (source.config.type === 'mcp') {
            type = (mcp === null || mcp === void 0 ? void 0 : mcp.authType) === 'bearer' ? 'source_bearer' : 'source_oauth';
        }
        else if (source.config.type === 'api') {
            // OAuth providers (Google/Slack/Microsoft) store credentials as source_oauth.
            // This separates HOW we get credentials (OAuth flow) from HOW we send them (Bearer header).
            if ((0, types_ts_1.isApiOAuthProvider)(source.config.provider)) {
                type = 'source_oauth';
            }
            else if ((api === null || api === void 0 ? void 0 : api.authType) === 'bearer') {
                type = 'source_bearer';
            }
            else if ((api === null || api === void 0 ? void 0 : api.authType) === 'basic') {
                type = 'source_basic';
            }
            else {
                // header, query, or other → stored as apikey
                type = 'source_apikey';
            }
        }
        else {
            type = 'source_oauth';
        }
        return {
            type: type,
            workspaceId: source.workspaceId,
            sourceId: source.config.slug,
        };
    };
    // ============================================================
    // Expiry Checking
    // ============================================================
    /**
     * Check if a credential is expired
     */
    SourceCredentialManager.prototype.isExpired = function (credential) {
        if (!credential.expiresAt)
            return false;
        return Date.now() > credential.expiresAt;
    };
    /**
     * Check if a credential needs refresh (within 5 min of expiry)
     */
    SourceCredentialManager.prototype.needsRefresh = function (credential) {
        if (!credential.expiresAt)
            return false;
        var fiveMinutes = 5 * 60 * 1000;
        return Date.now() > credential.expiresAt - fiveMinutes;
    };
    /**
     * Mark a source as needing re-authentication.
     * Called when token is missing/expired or token refresh fails.
     * Updates config.json so the UI shows "needs auth" and the agent gets proper context.
     */
    SourceCredentialManager.prototype.markSourceNeedsReauth = function (source, errorMessage) {
        try {
            var config = (0, storage_ts_1.loadSourceConfig)(source.workspaceRootPath, source.config.slug);
            if (config) {
                config.isAuthenticated = false;
                config.connectionStatus = 'needs_auth';
                config.connectionError = errorMessage;
                (0, storage_ts_1.saveSourceConfig)(source.workspaceRootPath, config);
                (0, debug_ts_1.debug)("[SourceCredentialManager] Marked ".concat(source.config.slug, " as needing re-auth: ").concat(errorMessage));
            }
        }
        catch (error) {
            (0, debug_ts_1.debug)("[SourceCredentialManager] Failed to mark ".concat(source.config.slug, " as needing re-auth:"), error);
        }
    };
    /**
     * Check if source has valid (non-expired) credentials
     */
    SourceCredentialManager.prototype.hasValidCredentials = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getToken(source)];
                    case 1:
                        token = _a.sent();
                        return [2 /*return*/, token !== null];
                }
            });
        });
    };
    // ============================================================
    // OAuth Authentication
    // ============================================================
    /**
     * Authenticate source via OAuth
     *
     * Handles both MCP OAuth and Gmail OAuth flows.
     * On success, credentials are automatically saved.
     */
    SourceCredentialManager.prototype.authenticate = function (source, callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultCallbacks, cb;
            var _a;
            return __generator(this, function (_b) {
                defaultCallbacks = {
                    onStatus: function (msg) { return (0, debug_ts_1.debug)("[SourceCredentialManager] ".concat(msg)); },
                    onError: function (err) { return (0, debug_ts_1.debug)("[SourceCredentialManager] Error: ".concat(err)); },
                };
                cb = callbacks || defaultCallbacks;
                // Google APIs use Google OAuth
                if (source.config.provider === 'google') {
                    return [2 /*return*/, this.authenticateGoogle(source, cb)];
                }
                // Slack APIs use Slack OAuth
                if (source.config.provider === 'slack') {
                    return [2 /*return*/, this.authenticateSlack(source, cb)];
                }
                // Microsoft APIs use Microsoft OAuth
                if (source.config.provider === 'microsoft') {
                    return [2 /*return*/, this.authenticateMicrosoft(source, cb)];
                }
                // MCP OAuth flow
                if (source.config.type === 'mcp' && ((_a = source.config.mcp) === null || _a === void 0 ? void 0 : _a.authType) === 'oauth') {
                    return [2 /*return*/, this.authenticateMcp(source, cb)];
                }
                return [2 /*return*/, {
                        success: false,
                        error: "Source ".concat(source.config.slug, " does not use OAuth authentication"),
                    }];
            });
        });
    };
    /**
     * Authenticate MCP source via OAuth
     */
    SourceCredentialManager.prototype.authenticateMcp = function (source, callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var oauth, _a, tokens, clientId, error_1, message;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_b = source.config.mcp) === null || _b === void 0 ? void 0 : _b.url)) {
                            return [2 /*return*/, { success: false, error: 'MCP URL not configured' }];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        oauth = new oauth_ts_1.CraftOAuth({ mcpBaseUrl: (0, oauth_ts_1.getMcpBaseUrl)(source.config.mcp.url) }, callbacks);
                        return [4 /*yield*/, oauth.authenticate()];
                    case 2:
                        _a = _c.sent(), tokens = _a.tokens, clientId = _a.clientId;
                        // Save the credentials
                        return [4 /*yield*/, this.save(source, {
                                value: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                                expiresAt: tokens.expiresAt,
                                clientId: clientId,
                                tokenType: tokens.tokenType,
                            })];
                    case 3:
                        // Save the credentials
                        _c.sent();
                        // Mark source as authenticated in config.json
                        (0, storage_ts_1.markSourceAuthenticated)(source.workspaceRootPath, source.config.slug);
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_1 = _c.sent();
                        message = error_1 instanceof Error ? error_1.message : String(error_1);
                        callbacks.onError(message);
                        return [2 /*return*/, { success: false, error: message }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authenticate Google API source via Google OAuth
     *
     * Supports multiple Google services (Gmail, Calendar, Drive) via:
     * - provider: "google" with googleService field
     * - provider: "google" with custom googleScopes
     * - Inferred from baseUrl (e.g., gmail.googleapis.com → gmail)
     */
    SourceCredentialManager.prototype.authenticateGoogle = function (source, callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var api, service, scopes, serviceName, options, result, error_2, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        api = source.config.api;
                        service = void 0;
                        scopes = void 0;
                        if ((api === null || api === void 0 ? void 0 : api.googleScopes) && api.googleScopes.length > 0) {
                            // Custom scopes take precedence
                            scopes = api.googleScopes;
                        }
                        else if (api === null || api === void 0 ? void 0 : api.googleService) {
                            // Use predefined service scopes
                            service = api.googleService;
                        }
                        else {
                            // Infer from baseUrl
                            service = (0, types_ts_1.inferGoogleServiceFromUrl)(api === null || api === void 0 ? void 0 : api.baseUrl);
                            if (!service) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Cannot determine Google service for source '".concat(source.config.slug, "'. Set googleService ('gmail', 'calendar', or 'drive') in api config."),
                                    }];
                            }
                        }
                        serviceName = service || 'Google API';
                        callbacks.onStatus("Starting ".concat(serviceName, " OAuth flow..."));
                        options = {
                            service: service,
                            scopes: scopes,
                            appType: 'electron',
                        };
                        return [4 /*yield*/, (0, google_oauth_ts_1.startGoogleOAuth)(options)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            return [2 /*return*/, { success: false, error: result.error || 'Google OAuth failed' }];
                        }
                        // Save the credentials
                        return [4 /*yield*/, this.save(source, {
                                value: result.accessToken,
                                refreshToken: result.refreshToken,
                                expiresAt: result.expiresAt,
                            })];
                    case 2:
                        // Save the credentials
                        _a.sent();
                        // Mark source as authenticated in config.json
                        (0, storage_ts_1.markSourceAuthenticated)(source.workspaceRootPath, source.config.slug);
                        callbacks.onStatus("".concat(serviceName, " authentication successful"));
                        return [2 /*return*/, { success: true, email: result.email }];
                    case 3:
                        error_2 = _a.sent();
                        message = error_2 instanceof Error ? error_2.message : String(error_2);
                        callbacks.onError(message);
                        return [2 /*return*/, { success: false, error: message }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authenticate Slack API source via Slack OAuth
     *
     * Supports multiple Slack services via:
     * - provider: "slack" with slackService field
     * - provider: "slack" with custom slackBotScopes/slackUserScopes
     * - Inferred from baseUrl (slack.com → full)
     */
    SourceCredentialManager.prototype.authenticateSlack = function (source, callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var api, service, userScopes, serviceName, options, result, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        api = source.config.api;
                        service = void 0;
                        userScopes = void 0;
                        if ((api === null || api === void 0 ? void 0 : api.slackUserScopes) && api.slackUserScopes.length > 0) {
                            // Custom scopes take precedence
                            userScopes = api.slackUserScopes;
                        }
                        else if (api === null || api === void 0 ? void 0 : api.slackService) {
                            // Use predefined service scopes
                            service = api.slackService;
                        }
                        else {
                            // Infer from baseUrl (defaults to 'full')
                            service = (0, types_ts_1.inferSlackServiceFromUrl)(api === null || api === void 0 ? void 0 : api.baseUrl) || 'full';
                        }
                        serviceName = service ? "Slack ".concat(service) : 'Slack';
                        callbacks.onStatus("Starting ".concat(serviceName, " OAuth flow..."));
                        options = {
                            service: service,
                            userScopes: userScopes,
                            appType: 'electron',
                        };
                        return [4 /*yield*/, (0, slack_oauth_ts_1.startSlackOAuth)(options)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            return [2 /*return*/, { success: false, error: result.error || 'Slack OAuth failed' }];
                        }
                        // Save the credentials
                        return [4 /*yield*/, this.save(source, {
                                value: result.accessToken,
                                refreshToken: result.refreshToken,
                                expiresAt: result.expiresAt,
                            })];
                    case 2:
                        // Save the credentials
                        _a.sent();
                        // Mark source as authenticated in config.json
                        (0, storage_ts_1.markSourceAuthenticated)(source.workspaceRootPath, source.config.slug);
                        callbacks.onStatus("".concat(serviceName, " authentication successful"));
                        // Use teamName as the identifier (similar to email for Google)
                        return [2 /*return*/, { success: true, email: result.teamName }];
                    case 3:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : String(error_3);
                        callbacks.onError(message);
                        return [2 /*return*/, { success: false, error: message }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authenticate Microsoft API source via Microsoft OAuth
     *
     * Supports multiple Microsoft services (Outlook, OneDrive, Calendar, Teams) via:
     * - provider: "microsoft" with microsoftService field
     * - provider: "microsoft" with custom microsoftScopes
     * - Inferred from baseUrl (e.g., graph.microsoft.com → outlook)
     */
    SourceCredentialManager.prototype.authenticateMicrosoft = function (source, callbacks) {
        return __awaiter(this, void 0, void 0, function () {
            var api, service, scopes, serviceName, options, result, error_4, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        api = source.config.api;
                        service = void 0;
                        scopes = void 0;
                        if ((api === null || api === void 0 ? void 0 : api.microsoftScopes) && api.microsoftScopes.length > 0) {
                            // Custom scopes take precedence
                            scopes = api.microsoftScopes;
                        }
                        else if (api === null || api === void 0 ? void 0 : api.microsoftService) {
                            // Use predefined service scopes
                            service = api.microsoftService;
                        }
                        else {
                            // Infer from baseUrl
                            service = (0, types_ts_1.inferMicrosoftServiceFromUrl)(api === null || api === void 0 ? void 0 : api.baseUrl);
                            if (!service) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Cannot determine Microsoft service for source '".concat(source.config.slug, "'. Set microsoftService ('outlook', 'calendar', 'onedrive', 'teams', or 'sharepoint') in api config."),
                                    }];
                            }
                        }
                        serviceName = service || 'Microsoft API';
                        callbacks.onStatus("Starting ".concat(serviceName, " OAuth flow..."));
                        options = {
                            service: service,
                            scopes: scopes,
                            appType: 'electron',
                        };
                        return [4 /*yield*/, (0, microsoft_oauth_ts_1.startMicrosoftOAuth)(options)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            return [2 /*return*/, { success: false, error: result.error || 'Microsoft OAuth failed' }];
                        }
                        // Save the credentials
                        return [4 /*yield*/, this.save(source, {
                                value: result.accessToken,
                                refreshToken: result.refreshToken,
                                expiresAt: result.expiresAt,
                            })];
                    case 2:
                        // Save the credentials
                        _a.sent();
                        // Mark source as authenticated in config.json
                        (0, storage_ts_1.markSourceAuthenticated)(source.workspaceRootPath, source.config.slug);
                        callbacks.onStatus("".concat(serviceName, " authentication successful"));
                        return [2 /*return*/, { success: true, email: result.email }];
                    case 3:
                        error_4 = _a.sent();
                        message = error_4 instanceof Error ? error_4.message : String(error_4);
                        callbacks.onError(message);
                        return [2 /*return*/, { success: false, error: message }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh token for a source
     *
     * Returns the new access token, or null if refresh fails.
     * On success, credentials are automatically updated.
     */
    SourceCredentialManager.prototype.refresh = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var cred;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.load(source)];
                    case 1:
                        cred = _b.sent();
                        if (!(cred === null || cred === void 0 ? void 0 : cred.refreshToken)) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] No refresh token for ".concat(source.config.slug));
                            return [2 /*return*/, null];
                        }
                        // Google API refresh
                        if (source.config.provider === 'google') {
                            return [2 /*return*/, this.refreshGoogle(source, cred)];
                        }
                        // Slack API refresh
                        if (source.config.provider === 'slack') {
                            return [2 /*return*/, this.refreshSlack(source, cred)];
                        }
                        // Microsoft API refresh
                        if (source.config.provider === 'microsoft') {
                            return [2 /*return*/, this.refreshMicrosoft(source, cred)];
                        }
                        // MCP refresh
                        if (source.config.type === 'mcp' && ((_a = source.config.mcp) === null || _a === void 0 ? void 0 : _a.url)) {
                            return [2 /*return*/, this.refreshMcp(source, cred)];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Refresh Google OAuth token
     */
    SourceCredentialManager.prototype.refreshGoogle = function (source, cred) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, google_oauth_ts_1.refreshGoogleToken)(cred.refreshToken)];
                    case 1:
                        result = _a.sent();
                        // Update stored credentials
                        return [4 /*yield*/, this.save(source, __assign(__assign({}, cred), { value: result.accessToken, expiresAt: result.expiresAt }))];
                    case 2:
                        // Update stored credentials
                        _a.sent();
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Refreshed Google token for ".concat(source.config.slug));
                        return [2 /*return*/, result.accessToken];
                    case 3:
                        error_5 = _a.sent();
                        errorMsg = error_5 instanceof Error ? error_5.message : String(error_5);
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Google token refresh failed:", error_5);
                        this.markSourceNeedsReauth(source, "Token refresh failed: ".concat(errorMsg));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh Slack OAuth token
     */
    SourceCredentialManager.prototype.refreshSlack = function (source, cred) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, slack_oauth_ts_1.refreshSlackToken)(cred.refreshToken, cred.clientId)];
                    case 1:
                        result = _a.sent();
                        // Update stored credentials
                        return [4 /*yield*/, this.save(source, __assign(__assign({}, cred), { value: result.accessToken, expiresAt: result.expiresAt }))];
                    case 2:
                        // Update stored credentials
                        _a.sent();
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Refreshed Slack token for ".concat(source.config.slug));
                        return [2 /*return*/, result.accessToken];
                    case 3:
                        error_6 = _a.sent();
                        errorMsg = error_6 instanceof Error ? error_6.message : String(error_6);
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Slack token refresh failed:", error_6);
                        this.markSourceNeedsReauth(source, "Token refresh failed: ".concat(errorMsg));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh Microsoft OAuth token
     */
    SourceCredentialManager.prototype.refreshMicrosoft = function (source, cred) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, microsoft_oauth_ts_1.refreshMicrosoftToken)(cred.refreshToken)];
                    case 1:
                        result = _a.sent();
                        // Update stored credentials (Microsoft may rotate refresh tokens)
                        return [4 /*yield*/, this.save(source, __assign(__assign({}, cred), { value: result.accessToken, refreshToken: result.refreshToken || cred.refreshToken, expiresAt: result.expiresAt }))];
                    case 2:
                        // Update stored credentials (Microsoft may rotate refresh tokens)
                        _a.sent();
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Refreshed Microsoft token for ".concat(source.config.slug));
                        return [2 /*return*/, result.accessToken];
                    case 3:
                        error_7 = _a.sent();
                        errorMsg = error_7 instanceof Error ? error_7.message : String(error_7);
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Microsoft token refresh failed:", error_7);
                        this.markSourceNeedsReauth(source, "Token refresh failed: ".concat(errorMsg));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh MCP OAuth token
     */
    SourceCredentialManager.prototype.refreshMcp = function (source, cred) {
        return __awaiter(this, void 0, void 0, function () {
            var oauth, tokens, error_8, errorMsg;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!cred.clientId) {
                            (0, debug_ts_1.debug)("[SourceCredentialManager] No clientId for MCP token refresh");
                            this.markSourceNeedsReauth(source, 'Missing clientId for token refresh');
                            return [2 /*return*/, null];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        // Only HTTP/SSE transport can refresh tokens - stdio doesn't use OAuth
                        if (!((_a = source.config.mcp) === null || _a === void 0 ? void 0 : _a.url)) {
                            // This is expected for stdio transport - not an error
                            (0, debug_ts_1.debug)("[SourceCredentialManager] No URL for MCP token refresh (stdio transport)");
                            return [2 /*return*/, null];
                        }
                        oauth = new oauth_ts_1.CraftOAuth({ mcpBaseUrl: (0, oauth_ts_1.getMcpBaseUrl)(source.config.mcp.url) }, {
                            onStatus: function () { },
                            onError: function () { },
                        });
                        return [4 /*yield*/, oauth.refreshAccessToken(cred.refreshToken, cred.clientId)];
                    case 2:
                        tokens = _b.sent();
                        // Update stored credentials
                        return [4 /*yield*/, this.save(source, __assign(__assign({}, cred), { value: tokens.accessToken, refreshToken: tokens.refreshToken || cred.refreshToken, expiresAt: tokens.expiresAt }))];
                    case 3:
                        // Update stored credentials
                        _b.sent();
                        (0, debug_ts_1.debug)("[SourceCredentialManager] Refreshed MCP token for ".concat(source.config.slug));
                        return [2 /*return*/, tokens.accessToken];
                    case 4:
                        error_8 = _b.sent();
                        errorMsg = error_8 instanceof Error ? error_8.message : String(error_8);
                        (0, debug_ts_1.debug)("[SourceCredentialManager] MCP token refresh failed:", error_8);
                        this.markSourceNeedsReauth(source, "Token refresh failed: ".concat(errorMsg));
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return SourceCredentialManager;
}());
exports.SourceCredentialManager = SourceCredentialManager;
// ============================================================
// Helper Functions
// ============================================================
/**
 * Check if a single source needs authentication.
 * Returns true if the source requires auth but isn't yet authenticated.
 *
 * This correctly handles:
 * - MCP sources with authType: "none" → never needs auth
 * - MCP sources with stdio transport → never needs auth (runs locally)
 * - MCP sources with oauth/bearer → needs auth if not authenticated
 * - API sources with authType: "none" → never needs auth
 * - API sources with bearer/basic/header/query auth → needs auth if not authenticated
 */
function sourceNeedsAuthentication(source) {
    var mcp = source.config.mcp;
    var api = source.config.api;
    // MCP sources with oauth/bearer auth (stdio transport never needs auth)
    if (source.config.type === 'mcp' && mcp) {
        if (mcp.transport === 'stdio') {
            // Stdio sources run locally and don't need authentication
            return false;
        }
        // Only require auth if authType is explicitly set to 'oauth' or 'bearer'
        // Undefined or 'none' means no authentication required
        if (mcp.authType && mcp.authType !== 'none' && !source.config.isAuthenticated) {
            return true;
        }
    }
    // API sources with auth requirements
    if (source.config.type === 'api' && api) {
        if (api.authType !== 'none' && api.authType !== undefined && !source.config.isAuthenticated) {
            return true;
        }
    }
    return false;
}
/**
 * Get sources that need authentication
 * Returns enabled sources that require auth but aren't yet authenticated
 */
function getSourcesNeedingAuth(sources) {
    return sources.filter(function (source) {
        if (!source.config.enabled)
            return false;
        return sourceNeedsAuthentication(source);
    });
}
// Singleton instance
var instance = null;
/**
 * Get shared SourceCredentialManager instance
 */
function getSourceCredentialManager() {
    if (!instance) {
        instance = new SourceCredentialManager();
    }
    return instance;
}
