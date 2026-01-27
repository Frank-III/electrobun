"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.createAnthropicAccountsHandlers = createAnthropicAccountsHandlers;
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("./db");
var utils_1 = require("./db/utils");
function encryptToken(token) {
    return Buffer.from(token).toString("base64");
}
function decryptToken(encrypted) {
    return Buffer.from(encrypted, "base64").toString("utf-8");
}
function createAnthropicAccountsHandlers() {
    var _this = this;
    return {
        anthropicAccountsList: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, accounts, legacyCred;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _e.sent();
                        try {
                            accounts = db
                                .select({
                                id: db_1.anthropicAccounts.id,
                                email: db_1.anthropicAccounts.email,
                                displayName: db_1.anthropicAccounts.displayName,
                                connectedAt: db_1.anthropicAccounts.connectedAt,
                                lastUsedAt: db_1.anthropicAccounts.lastUsedAt,
                            })
                                .from(db_1.anthropicAccounts)
                                .orderBy(db_1.anthropicAccounts.connectedAt)
                                .all();
                            if (accounts.length > 0) {
                                return [2 /*return*/, accounts.map(function (acc) {
                                        var _a, _b, _c, _d, _e, _f, _g, _h;
                                        return (__assign(__assign({}, acc), { connectedAt: (_d = (_c = (_b = (_a = acc.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : acc.connectedAt) !== null && _d !== void 0 ? _d : null, lastUsedAt: (_h = (_g = (_f = (_e = acc.lastUsedAt) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : acc.lastUsedAt) !== null && _h !== void 0 ? _h : null }));
                                    })];
                            }
                        }
                        catch (_f) {
                            // ignore
                        }
                        try {
                            legacyCred = db
                                .select()
                                .from(db_1.claudeCodeCredentials)
                                .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                                .get();
                            if (legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken) {
                                return [2 /*return*/, [
                                        {
                                            id: "legacy-default",
                                            email: null,
                                            displayName: "Anthropic Account",
                                            connectedAt: (_d = (_c = (_b = (_a = legacyCred.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : legacyCred.connectedAt) !== null && _d !== void 0 ? _d : null,
                                            lastUsedAt: null,
                                        },
                                    ]];
                            }
                        }
                        catch (_g) {
                            // ignore
                        }
                        return [2 /*return*/, []];
                }
            });
        }); },
        anthropicAccountsGetActive: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, settings, account, legacyCred;
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _j.sent();
                        try {
                            settings = db
                                .select()
                                .from(db_1.anthropicSettings)
                                .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                                .get();
                            if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
                                account = db
                                    .select({
                                    id: db_1.anthropicAccounts.id,
                                    email: db_1.anthropicAccounts.email,
                                    displayName: db_1.anthropicAccounts.displayName,
                                    connectedAt: db_1.anthropicAccounts.connectedAt,
                                })
                                    .from(db_1.anthropicAccounts)
                                    .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                                    .get();
                                if (account) {
                                    return [2 /*return*/, __assign(__assign({}, account), { connectedAt: (_d = (_c = (_b = (_a = account.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : account.connectedAt) !== null && _d !== void 0 ? _d : null })];
                                }
                            }
                        }
                        catch (_k) {
                            // ignore
                        }
                        try {
                            legacyCred = db
                                .select()
                                .from(db_1.claudeCodeCredentials)
                                .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                                .get();
                            if (legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken) {
                                return [2 /*return*/, {
                                        id: "legacy-default",
                                        email: null,
                                        displayName: "Anthropic Account",
                                        connectedAt: (_h = (_g = (_f = (_e = legacyCred.connectedAt) === null || _e === void 0 ? void 0 : _e.toISOString) === null || _f === void 0 ? void 0 : _f.call(_e)) !== null && _g !== void 0 ? _g : legacyCred.connectedAt) !== null && _h !== void 0 ? _h : null,
                                    }];
                            }
                        }
                        catch (_l) {
                            // ignore
                        }
                        return [2 /*return*/, null];
                }
            });
        }); },
        anthropicAccountsGetActiveToken: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, settings, account, token;
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
                        if (!(settings === null || settings === void 0 ? void 0 : settings.activeAccountId)) {
                            return [2 /*return*/, { token: null, error: "No active account" }];
                        }
                        account = db
                            .select()
                            .from(db_1.anthropicAccounts)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
                            .get();
                        if (!account) {
                            return [2 /*return*/, { token: null, error: "Active account not found" }];
                        }
                        try {
                            token = decryptToken(account.oauthToken);
                            return [2 /*return*/, { token: token, error: null }];
                        }
                        catch (error) {
                            console.error("[AnthropicAccounts] Decrypt error:", error);
                            return [2 /*return*/, { token: null, error: "Failed to decrypt token" }];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        anthropicAccountsSetActive: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, account;
            var accountId = _b.accountId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        account = db
                            .select()
                            .from(db_1.anthropicAccounts)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, accountId))
                            .get();
                        if (!account) {
                            throw new Error("Account not found");
                        }
                        db.insert(db_1.anthropicSettings)
                            .values({
                            id: "singleton",
                            activeAccountId: accountId,
                            updatedAt: new Date(),
                        })
                            .onConflictDoUpdate({
                            target: db_1.anthropicSettings.id,
                            set: {
                                activeAccountId: accountId,
                                updatedAt: new Date(),
                            },
                        })
                            .run();
                        db.update(db_1.anthropicAccounts)
                            .set({ lastUsedAt: new Date() })
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, accountId))
                            .run();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        anthropicAccountsAdd: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, encryptedToken, newId, countResult;
            var oauthToken = _b.oauthToken, email = _b.email, displayName = _b.displayName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        encryptedToken = encryptToken(oauthToken);
                        newId = (0, utils_1.createId)();
                        db.insert(db_1.anthropicAccounts)
                            .values({
                            id: newId,
                            email: email !== null && email !== void 0 ? email : null,
                            displayName: displayName || email || "Anthropic Account",
                            oauthToken: encryptedToken,
                            connectedAt: new Date(),
                            desktopUserId: null,
                        })
                            .run();
                        countResult = db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(db_1.anthropicAccounts)
                            .get();
                        if ((countResult === null || countResult === void 0 ? void 0 : countResult.count) === 1) {
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
                        return [2 /*return*/, { id: newId, success: true }];
                }
            });
        }); },
        anthropicAccountsRename: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, result;
            var accountId = _b.accountId, displayName = _b.displayName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        result = db
                            .update(db_1.anthropicAccounts)
                            .set({ displayName: displayName })
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, accountId))
                            .run();
                        if (result.changes === 0) {
                            throw new Error("Account not found");
                        }
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        anthropicAccountsRemove: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, settings, firstRemaining;
            var accountId = _b.accountId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        settings = db
                            .select()
                            .from(db_1.anthropicSettings)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                            .get();
                        db.delete(db_1.anthropicAccounts)
                            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, accountId))
                            .run();
                        if ((settings === null || settings === void 0 ? void 0 : settings.activeAccountId) === accountId) {
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
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        anthropicAccountsHasAccounts: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, countResult;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _b.sent();
                        countResult = db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(db_1.anthropicAccounts)
                            .get();
                        return [2 /*return*/, { hasAccounts: ((_a = countResult === null || countResult === void 0 ? void 0 : countResult.count) !== null && _a !== void 0 ? _a : 0) > 0 }];
                }
            });
        }); },
        anthropicAccountsMigrateLegacy: function () { return __awaiter(_this, void 0, void 0, function () {
            var db, existingAccounts, legacyCred, newId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _b.sent();
                        existingAccounts = db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(db_1.anthropicAccounts)
                            .get();
                        if (((_a = existingAccounts === null || existingAccounts === void 0 ? void 0 : existingAccounts.count) !== null && _a !== void 0 ? _a : 0) > 0) {
                            return [2 /*return*/, { migrated: false, reason: "accounts_exist" }];
                        }
                        legacyCred = db
                            .select()
                            .from(db_1.claudeCodeCredentials)
                            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                            .get();
                        if (!(legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken)) {
                            return [2 /*return*/, { migrated: false, reason: "no_legacy" }];
                        }
                        newId = (0, utils_1.createId)();
                        db.insert(db_1.anthropicAccounts)
                            .values({
                            id: newId,
                            oauthToken: legacyCred.oauthToken,
                            displayName: "Anthropic Account",
                            connectedAt: legacyCred.connectedAt,
                            desktopUserId: legacyCred.userId,
                        })
                            .run();
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
                        return [2 /*return*/, { migrated: true, accountId: newId }];
                }
            });
        }); },
    };
}
var templateObject_1, templateObject_2, templateObject_3;
