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
exports.createClaudeCodeHandlers = createClaudeCodeHandlers;
var bun_1 = require("electrobun/bun");
var drizzle_orm_1 = require("drizzle-orm");
var claude_env_1 = require("./claude-env");
var config_1 = require("./config");
var db_1 = require("./db");
var utils_1 = require("./db/utils");
var claude_token_1 = require("./legacy/main/lib/claude-token");
function encryptToken(token) {
    return Buffer.from(token).toString("base64");
}
function decryptToken(encrypted) {
    return Buffer.from(encrypted, "base64").toString("utf-8");
}
function getDesktopToken() {
    return (process.env.DESKTOP_TOKEN ||
        process.env.TWENTYFIRST_DESKTOP_TOKEN ||
        process.env.X_DESKTOP_TOKEN ||
        null);
}
function storeOAuthToken(db, oauthToken, setAsActive) {
    if (setAsActive === void 0) { setAsActive = true; }
    var encryptedToken = encryptToken(oauthToken);
    var newId = (0, utils_1.createId)();
    db.insert(db_1.anthropicAccounts)
        .values({
        id: newId,
        oauthToken: encryptedToken,
        displayName: "Anthropic Account",
        connectedAt: new Date(),
        desktopUserId: null,
    })
        .run();
    if (setAsActive) {
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
    db.delete(db_1.claudeCodeCredentials).where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default")).run();
    db.insert(db_1.claudeCodeCredentials)
        .values({
        id: "default",
        oauthToken: encryptedToken,
        connectedAt: new Date(),
        userId: null,
    })
        .run();
    return newId;
}
function createClaudeCodeHandlers() {
    var _this = this;
    return {
        claudeCodeHasExistingCliConfig: function () { return __awaiter(_this, void 0, void 0, function () {
            var shellEnv, hasConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, claude_env_1.getClaudeShellEnvironment)()];
                    case 1:
                        shellEnv = _a.sent();
                        hasConfig = !!(shellEnv.ANTHROPIC_API_KEY || shellEnv.ANTHROPIC_BASE_URL);
                        return [2 /*return*/, {
                                hasConfig: hasConfig,
                                hasApiKey: !!shellEnv.ANTHROPIC_API_KEY,
                                baseUrl: shellEnv.ANTHROPIC_BASE_URL || null,
                            }];
                }
            });
        }); },
        claudeCodeGetIntegration: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, settings, account, cred;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _j.sent();
                        settings = db
                            .select()
                            .from(db_1.anthropicSettings)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                            .get();
                        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
                            account = db
                                .select()
                                .from(db_1.anthropicAccounts)
                                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                                .get();
                            if (account) {
                                return [2 /*return*/, {
                                        isConnected: true,
                                        connectedAt: (_d = (_c = (_b = (_a = account.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : account.connectedAt) !== null && _d !== void 0 ? _d : null,
                                        accountId: account.id,
                                        displayName: account.displayName,
                                    }];
                            }
                        }
                        cred = db
                            .select()
                            .from(db_1.claudeCodeCredentials)
                            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                            .get();
                        return [2 /*return*/, {
                                isConnected: !!(cred === null || cred === void 0 ? void 0 : cred.oauthToken),
                                connectedAt: (_h = (_g = (_f = (_e = cred === null || cred === void 0 ? void 0 : cred.connectedAt) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : cred === null || cred === void 0 ? void 0 : cred.connectedAt) !== null && _h !== void 0 ? _h : null,
                                accountId: null,
                                displayName: null,
                            }];
                }
            });
        }); },
        claudeCodeStartAuth: function () { return __awaiter(_this, void 0, void 0, function () {
            var token, response, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = getDesktopToken();
                        if (!token) {
                            throw new Error("Missing desktop token. Set DESKTOP_TOKEN to start auth.");
                        }
                        return [4 /*yield*/, fetch("".concat((0, config_1.getApiUrl)(), "/api/auth/claude-code/start"), {
                                method: "POST",
                                headers: { "x-desktop-token": token },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({ error: "Unknown error" }); })];
                    case 2:
                        error = _a.sent();
                        throw new Error(error.error || "Start auth failed: ".concat(response.status));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, (_a.sent())];
                }
            });
        }); },
        claudeCodePollStatus: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response, data, error_1;
            var _c, _d;
            var sandboxUrl = _b.sandboxUrl, sessionId = _b.sessionId;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(sandboxUrl, "/api/auth/").concat(sessionId, "/status"))];
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
        }); },
        claudeCodeSubmitCode: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var codeRes, oauthToken, i, statusRes, status_1, db;
            var sandboxUrl = _b.sandboxUrl, sessionId = _b.sessionId, code = _b.code;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(sandboxUrl, "/api/auth/").concat(sessionId, "/code"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: code }),
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
                        return [4 /*yield*/, fetch("".concat(sandboxUrl, "/api/auth/").concat(sessionId, "/status"))];
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
                        i += 1;
                        return [3 /*break*/, 2];
                    case 7:
                        if (!oauthToken) {
                            throw new Error("Timeout waiting for OAuth token");
                        }
                        return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 8:
                        db = _c.sent();
                        storeOAuthToken(db, oauthToken);
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        claudeCodeGetSystemToken: function () { return __awaiter(_this, void 0, void 0, function () {
            var token;
            var _a, _b;
            return __generator(this, function (_c) {
                token = (_b = (_a = (0, claude_token_1.getExistingClaudeToken)()) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : null;
                return [2 /*return*/, { token: token }];
            });
        }); },
        claudeCodeImportSystemToken: function () { return __awaiter(_this, void 0, void 0, function () {
            var token, db;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = (_a = (0, claude_token_1.getExistingClaudeToken)()) === null || _a === void 0 ? void 0 : _a.trim();
                        if (!token) {
                            throw new Error("No existing Claude token found");
                        }
                        return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _b.sent();
                        storeOAuthToken(db, token);
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        claudeCodeGetToken: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, settings, account, token, cred, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _a.sent();
                        settings = db
                            .select()
                            .from(db_1.anthropicSettings)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                            .get();
                        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
                            account = db
                                .select()
                                .from(db_1.anthropicAccounts)
                                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                                .get();
                            if (account) {
                                try {
                                    token = decryptToken(account.oauthToken);
                                    return [2 /*return*/, { token: token, error: null }];
                                }
                                catch (error) {
                                    console.error("[ClaudeCode] Decrypt error:", error);
                                    return [2 /*return*/, { token: null, error: "Failed to decrypt token" }];
                                }
                            }
                        }
                        cred = db
                            .select()
                            .from(db_1.claudeCodeCredentials)
                            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                            .get();
                        if (!(cred === null || cred === void 0 ? void 0 : cred.oauthToken)) {
                            return [2 /*return*/, { token: null, error: "Not connected" }];
                        }
                        try {
                            token = decryptToken(cred.oauthToken);
                            return [2 /*return*/, { token: token, error: null }];
                        }
                        catch (error) {
                            console.error("[ClaudeCode] Decrypt error:", error);
                            return [2 /*return*/, { token: null, error: "Failed to decrypt token" }];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        claudeCodeDisconnect: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, settings, firstRemaining;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _a.sent();
                        settings = db
                            .select()
                            .from(db_1.anthropicSettings)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                            .get();
                        if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
                            db.delete(db_1.anthropicAccounts)
                                .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                                .run();
                            firstRemaining = db.select().from(db_1.anthropicAccounts).limit(1).get();
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
                        db.delete(db_1.claudeCodeCredentials).where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default")).run();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        claudeCodeOpenOAuthUrl: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var url = _b.url;
            return __generator(this, function (_c) {
                bun_1.Utils.openExternal(url);
                return [2 /*return*/, { success: true }];
            });
        }); },
    };
}
