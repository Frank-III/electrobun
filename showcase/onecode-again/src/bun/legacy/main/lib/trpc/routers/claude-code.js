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
exports.claudeCodeRouter = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var electron_1 = require("electron");
var zod_1 = require("zod");
var index_1 = require("../../../index");
var claude_1 = require("../../claude");
var claude_token_1 = require("../../claude-token");
var config_1 = require("../../config");
var db_1 = require("../../db");
var utils_1 = require("../../db/utils");
var index_2 = require("../index");
/**
 * Get desktop auth token for server API calls
 */
function getDesktopToken() {
    return __awaiter(this, void 0, void 0, function () {
        var authManager;
        return __generator(this, function (_a) {
            authManager = (0, index_1.getAuthManager)();
            return [2 /*return*/, authManager.getValidToken()];
        });
    });
}
/**
 * Encrypt token using Electron's safeStorage
 */
function encryptToken(token) {
    if (!electron_1.safeStorage.isEncryptionAvailable()) {
        console.warn("[ClaudeCode] Encryption not available, storing as base64");
        return Buffer.from(token).toString("base64");
    }
    return electron_1.safeStorage.encryptString(token).toString("base64");
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
 * Store OAuth token - now uses multi-account system
 * If setAsActive is true, also sets this account as active
 */
function storeOAuthToken(oauthToken, setAsActive) {
    var _a, _b;
    if (setAsActive === void 0) { setAsActive = true; }
    var authManager = (0, index_1.getAuthManager)();
    var user = authManager.getUser();
    var encryptedToken = encryptToken(oauthToken);
    var db = (0, db_1.getDatabase)();
    var newId = (0, utils_1.createId)();
    // Store in new multi-account table
    db.insert(db_1.anthropicAccounts)
        .values({
        id: newId,
        oauthToken: encryptedToken,
        displayName: "Anthropic Account",
        connectedAt: new Date(),
        desktopUserId: (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : null,
    })
        .run();
    if (setAsActive) {
        // Set as active account
        db.insert(db_1.anthropicSettings)
            .values({
            id: "singleton",
            activeAccountId: newId,
            updatedAt: new Date(),
        })
            .onConflictDoUpdate({
            target: db_1.anthropicSettings.id,
            set: {
                activeAccountId: newId,
                updatedAt: new Date(),
            },
        })
            .run();
    }
    // Also update legacy table for backward compatibility
    db.delete(db_1.claudeCodeCredentials)
        .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
        .run();
    db.insert(db_1.claudeCodeCredentials)
        .values({
        id: "default",
        oauthToken: encryptedToken,
        connectedAt: new Date(),
        userId: (_b = user === null || user === void 0 ? void 0 : user.id) !== null && _b !== void 0 ? _b : null,
    })
        .run();
    return newId;
}
/**
 * Claude Code OAuth router for desktop
 * Uses server only for sandbox creation, stores token locally
 */
exports.claudeCodeRouter = (0, index_2.router)({
    /**
     * Check if user has existing CLI config (API key or proxy)
     * If true, user can skip OAuth onboarding
     * Based on PR #29 by @sa4hnd
     */
    hasExistingCliConfig: index_2.publicProcedure.query(function () {
        var shellEnv = (0, claude_1.getClaudeShellEnvironment)();
        var hasConfig = !!(shellEnv.ANTHROPIC_API_KEY || shellEnv.ANTHROPIC_BASE_URL);
        return {
            hasConfig: hasConfig,
            hasApiKey: !!shellEnv.ANTHROPIC_API_KEY,
            baseUrl: shellEnv.ANTHROPIC_BASE_URL || null,
        };
    }),
    /**
     * Check if user has Claude Code connected (local check)
     * Now uses multi-account system - checks for active account
     */
    getIntegration: index_2.publicProcedure.query(function () {
        var _a, _b, _c, _d;
        var db = (0, db_1.getDatabase)();
        // First try multi-account system
        var settings = db
            .select()
            .from(db_1.anthropicSettings)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
            .get();
        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
            var account = db
                .select()
                .from(db_1.anthropicAccounts)
                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                .get();
            if (account) {
                return {
                    isConnected: true,
                    connectedAt: (_b = (_a = account.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                    accountId: account.id,
                    displayName: account.displayName,
                };
            }
        }
        // Fallback to legacy table
        var cred = db
            .select()
            .from(db_1.claudeCodeCredentials)
            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
            .get();
        return {
            isConnected: !!(cred === null || cred === void 0 ? void 0 : cred.oauthToken),
            connectedAt: (_d = (_c = cred === null || cred === void 0 ? void 0 : cred.connectedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            accountId: null,
            displayName: null,
        };
    }),
    /**
     * Start OAuth flow - calls server to create sandbox
     */
    startAuth: index_2.publicProcedure.mutation(function () { return __awaiter(void 0, void 0, void 0, function () {
        var token, response, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDesktopToken()];
                case 1:
                    token = _a.sent();
                    if (!token) {
                        throw new Error("Not authenticated with 21st.dev");
                    }
                    return [4 /*yield*/, fetch("".concat((0, config_1.getApiUrl)(), "/api/auth/claude-code/start"), {
                            method: "POST",
                            headers: { "x-desktop-token": token },
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: "Unknown error" }); })];
                case 3:
                    error = _a.sent();
                    throw new Error(error.error || "Start auth failed: ".concat(response.status));
                case 4: return [4 /*yield*/, response.json()];
                case 5: return [2 /*return*/, (_a.sent())];
            }
        });
    }); }),
    /**
     * Poll for OAuth URL - calls sandbox directly
     */
    pollStatus: index_2.publicProcedure
        .input(zod_1.z.object({
        sandboxUrl: zod_1.z.string(),
        sessionId: zod_1.z.string(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var response, data, error_1;
        var _c, _d;
        var input = _b.input;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(input.sandboxUrl, "/api/auth/").concat(input.sessionId, "/status"))];
                case 1:
                    response = _e.sent();
                    if (!response.ok) {
                        return [2 /*return*/, { state: "error", oauthUrl: null, error: "Failed to poll status" }];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _e.sent();
                    return [2 /*return*/, {
                            state: data.state,
                            oauthUrl: (_c = data.oauthUrl) !== null && _c !== void 0 ? _c : null,
                            error: (_d = data.error) !== null && _d !== void 0 ? _d : null,
                        }];
                case 3:
                    error_1 = _e.sent();
                    console.error("[ClaudeCode] Poll status error:", error_1);
                    return [2 /*return*/, { state: "error", oauthUrl: null, error: "Connection failed" }];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Submit OAuth code - calls sandbox directly, stores token locally
     */
    submitCode: index_2.publicProcedure
        .input(zod_1.z.object({
        sandboxUrl: zod_1.z.string(),
        sessionId: zod_1.z.string(),
        code: zod_1.z.string().min(1),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var codeRes, oauthToken, i, statusRes, status_1;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetch("".concat(input.sandboxUrl, "/api/auth/").concat(input.sessionId, "/code"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: input.code }),
                    })];
                case 1:
                    codeRes = _c.sent();
                    if (!codeRes.ok) {
                        throw new Error("Code submission failed: ".concat(codeRes.statusText));
                    }
                    oauthToken = null;
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < 10)) return [3 /*break*/, 7];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, fetch("".concat(input.sandboxUrl, "/api/auth/").concat(input.sessionId, "/status"))];
                case 4:
                    statusRes = _c.sent();
                    if (!statusRes.ok)
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, statusRes.json()];
                case 5:
                    status_1 = _c.sent();
                    if (status_1.state === "success" && status_1.oauthToken) {
                        oauthToken = status_1.oauthToken;
                        return [3 /*break*/, 7];
                    }
                    if (status_1.state === "error") {
                        throw new Error(status_1.error || "Authentication failed");
                    }
                    _c.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7:
                    if (!oauthToken) {
                        throw new Error("Timeout waiting for OAuth token");
                    }
                    storeOAuthToken(oauthToken);
                    console.log("[ClaudeCode] Token stored locally");
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    /**
     * Import an existing OAuth token from the local machine
     */
    importToken: index_2.publicProcedure
        .input(zod_1.z.object({
        token: zod_1.z.string().min(1),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var oauthToken;
        var input = _b.input;
        return __generator(this, function (_c) {
            oauthToken = input.token.trim();
            storeOAuthToken(oauthToken);
            console.log("[ClaudeCode] Token imported locally");
            return [2 /*return*/, { success: true }];
        });
    }); }),
    /**
     * Check for existing Claude token in system credentials
     */
    getSystemToken: index_2.publicProcedure.query(function () {
        var _a, _b;
        var token = (_b = (_a = (0, claude_token_1.getExistingClaudeToken)()) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : null;
        return { token: token };
    }),
    /**
     * Import Claude token from system credentials
     */
    importSystemToken: index_2.publicProcedure.mutation(function () {
        var _a;
        var token = (_a = (0, claude_token_1.getExistingClaudeToken)()) === null || _a === void 0 ? void 0 : _a.trim();
        if (!token) {
            throw new Error("No existing Claude token found");
        }
        storeOAuthToken(token);
        console.log("[ClaudeCode] Token imported from system");
        return { success: true };
    }),
    /**
     * Get decrypted OAuth token (local)
     * Now uses multi-account system - gets token from active account
     */
    getToken: index_2.publicProcedure.query(function () {
        var db = (0, db_1.getDatabase)();
        // First try multi-account system
        var settings = db
            .select()
            .from(db_1.anthropicSettings)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
            .get();
        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
            var account = db
                .select()
                .from(db_1.anthropicAccounts)
                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                .get();
            if (account) {
                try {
                    var token = decryptToken(account.oauthToken);
                    return { token: token, error: null };
                }
                catch (error) {
                    console.error("[ClaudeCode] Decrypt error:", error);
                    return { token: null, error: "Failed to decrypt token" };
                }
            }
        }
        // Fallback to legacy table
        var cred = db
            .select()
            .from(db_1.claudeCodeCredentials)
            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
            .get();
        if (!(cred === null || cred === void 0 ? void 0 : cred.oauthToken)) {
            return { token: null, error: "Not connected" };
        }
        try {
            var token = decryptToken(cred.oauthToken);
            return { token: token, error: null };
        }
        catch (error) {
            console.error("[ClaudeCode] Decrypt error:", error);
            return { token: null, error: "Failed to decrypt token" };
        }
    }),
    /**
     * Disconnect - delete active account from multi-account system
     */
    disconnect: index_2.publicProcedure.mutation(function () {
        var db = (0, db_1.getDatabase)();
        // Get active account
        var settings = db
            .select()
            .from(db_1.anthropicSettings)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
            .get();
        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
            // Remove active account
            db.delete(db_1.anthropicAccounts)
                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                .run();
            // Try to set another account as active
            var firstRemaining = db.select().from(db_1.anthropicAccounts).limit(1).get();
            if (firstRemaining) {
                db.update(db_1.anthropicSettings)
                    .set({
                    activeAccountId: firstRemaining.id,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                    .run();
            }
            else {
                db.update(db_1.anthropicSettings)
                    .set({
                    activeAccountId: null,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                    .run();
            }
        }
        // Also clear legacy table
        db.delete(db_1.claudeCodeCredentials)
            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
            .run();
        console.log("[ClaudeCode] Disconnected");
        return { success: true };
    }),
    /**
     * Open OAuth URL in browser
     */
    openOAuthUrl: index_2.publicProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var url = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, electron_1.shell.openExternal(url)];
                case 1:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
