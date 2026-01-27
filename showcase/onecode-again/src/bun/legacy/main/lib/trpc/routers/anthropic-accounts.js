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
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropicAccountsRouter = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var electron_1 = require("electron");
var zod_1 = require("zod");
var index_1 = require("../../../index");
var db_1 = require("../../db");
var utils_1 = require("../../db/utils");
var index_2 = require("../index");
/**
 * Encrypt token using Electron's safeStorage
 */
function encryptToken(token) {
    if (!electron_1.safeStorage.isEncryptionAvailable()) {
        console.warn("[AnthropicAccounts] Encryption not available, storing as base64");
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
 * Multi-account Anthropic management router
 */
exports.anthropicAccountsRouter = (0, index_2.router)({
    /**
     * List all stored Anthropic accounts
     */
    list: index_2.publicProcedure.query(function () {
        var _a, _b;
        var db = (0, db_1.getDatabase)();
        try {
            var accounts = db
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
            // If we have accounts in new table, return them
            if (accounts.length > 0) {
                return accounts.map(function (acc) {
                    var _a, _b, _c, _d;
                    return (__assign(__assign({}, acc), { connectedAt: (_b = (_a = acc.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null, lastUsedAt: (_d = (_c = acc.lastUsedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null }));
                });
            }
        }
        catch (_c) {
            // Table doesn't exist yet, fall through to legacy
        }
        // Fallback: check legacy table and return as single account
        try {
            var legacyCred = db
                .select()
                .from(db_1.claudeCodeCredentials)
                .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                .get();
            if (legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken) {
                return [{
                        id: "legacy-default",
                        email: null,
                        displayName: "Anthropic Account",
                        connectedAt: (_b = (_a = legacyCred.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                        lastUsedAt: null,
                    }];
            }
        }
        catch (_d) {
            // Legacy table also doesn't exist
        }
        return [];
    }),
    /**
     * Get currently active account info
     */
    getActive: index_2.publicProcedure.query(function () {
        var _a, _b, _c, _d;
        var db = (0, db_1.getDatabase)();
        try {
            var settings = db
                .select()
                .from(db_1.anthropicSettings)
                .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
                .get();
            if (settings === null || settings === void 0 ? void 0 : settings.activeAccountId) {
                var account = db
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
                    return __assign(__assign({}, account), { connectedAt: (_b = (_a = account.connectedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null });
                }
            }
        }
        catch (_e) {
            // Tables don't exist yet, fall through to legacy
        }
        // Fallback: if legacy credential exists, treat it as active
        try {
            var legacyCred = db
                .select()
                .from(db_1.claudeCodeCredentials)
                .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
                .get();
            if (legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken) {
                return {
                    id: "legacy-default",
                    email: null,
                    displayName: "Anthropic Account",
                    connectedAt: (_d = (_c = legacyCred.connectedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                };
            }
        }
        catch (_f) {
            // Legacy table also doesn't exist
        }
        return null;
    }),
    /**
     * Get decrypted OAuth token for active account
     */
    getActiveToken: index_2.publicProcedure.query(function () {
        var db = (0, db_1.getDatabase)();
        var settings = db
            .select()
            .from(db_1.anthropicSettings)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
            .get();
        if (!(settings === null || settings === void 0 ? void 0 : settings.activeAccountId)) {
            return { token: null, error: "No active account" };
        }
        var account = db
            .select()
            .from(db_1.anthropicAccounts)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, settings.activeAccountId))
            .get();
        if (!account) {
            return { token: null, error: "Active account not found" };
        }
        try {
            var token = decryptToken(account.oauthToken);
            return { token: token, error: null };
        }
        catch (error) {
            console.error("[AnthropicAccounts] Decrypt error:", error);
            return { token: null, error: "Failed to decrypt token" };
        }
    }),
    /**
     * Switch to a different account
     */
    setActive: index_2.publicProcedure
        .input(zod_1.z.object({ accountId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        // Verify account exists
        var account = db
            .select()
            .from(db_1.anthropicAccounts)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, input.accountId))
            .get();
        if (!account) {
            throw new Error("Account not found");
        }
        // Update or insert settings
        db.insert(db_1.anthropicSettings)
            .values({
            id: "singleton",
            activeAccountId: input.accountId,
            updatedAt: new Date(),
        })
            .onConflictDoUpdate({
            target: db_1.anthropicSettings.id,
            set: {
                activeAccountId: input.accountId,
                updatedAt: new Date(),
            },
        })
            .run();
        // Update lastUsedAt on the account
        db.update(db_1.anthropicAccounts)
            .set({ lastUsedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, input.accountId))
            .run();
        console.log("[AnthropicAccounts] Switched to account: ".concat(input.accountId));
        return { success: true };
    }),
    /**
     * Add a new account (called after OAuth flow)
     */
    add: index_2.publicProcedure
        .input(zod_1.z.object({
        oauthToken: zod_1.z.string().min(1),
        email: zod_1.z.string().optional(),
        displayName: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) {
        var _b, _c;
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var authManager = (0, index_1.getAuthManager)();
        var user = authManager.getUser();
        var encryptedToken = encryptToken(input.oauthToken);
        var newId = (0, utils_1.createId)();
        db.insert(db_1.anthropicAccounts)
            .values({
            id: newId,
            email: (_b = input.email) !== null && _b !== void 0 ? _b : null,
            displayName: input.displayName || input.email || "Anthropic Account",
            oauthToken: encryptedToken,
            connectedAt: new Date(),
            desktopUserId: (_c = user === null || user === void 0 ? void 0 : user.id) !== null && _c !== void 0 ? _c : null,
        })
            .run();
        // Count accounts
        var countResult = db
            .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
            .from(db_1.anthropicAccounts)
            .get();
        // Automatically set as active if it's the first account
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
        console.log("[AnthropicAccounts] Added new account: ".concat(newId));
        return { id: newId, success: true };
    }),
    /**
     * Update account display name
     */
    rename: index_2.publicProcedure
        .input(zod_1.z.object({
        accountId: zod_1.z.string(),
        displayName: zod_1.z.string().min(1),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var result = db
            .update(db_1.anthropicAccounts)
            .set({ displayName: input.displayName })
            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, input.accountId))
            .run();
        if (result.changes === 0) {
            throw new Error("Account not found");
        }
        console.log("[AnthropicAccounts] Renamed account ".concat(input.accountId, " to \"").concat(input.displayName, "\""));
        return { success: true };
    }),
    /**
     * Remove an account
     */
    remove: index_2.publicProcedure
        .input(zod_1.z.object({ accountId: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        // Check if this is the active account
        var settings = db
            .select()
            .from(db_1.anthropicSettings)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicSettings.id, "singleton"))
            .get();
        // Delete the account
        db.delete(db_1.anthropicAccounts)
            .where((0, drizzle_orm_1.eq)(db_1.anthropicAccounts.id, input.accountId))
            .run();
        // If deleted account was active, set another account as active
        if ((settings === null || settings === void 0 ? void 0 : settings.activeAccountId) === input.accountId) {
            var firstRemaining = db
                .select()
                .from(db_1.anthropicAccounts)
                .limit(1)
                .get();
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
        console.log("[AnthropicAccounts] Removed account: ".concat(input.accountId));
        return { success: true };
    }),
    /**
     * Check if any accounts are connected
     */
    hasAccounts: index_2.publicProcedure.query(function () {
        var _a;
        var db = (0, db_1.getDatabase)();
        var countResult = db
            .select({ count: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
            .from(db_1.anthropicAccounts)
            .get();
        return { hasAccounts: ((_a = countResult === null || countResult === void 0 ? void 0 : countResult.count) !== null && _a !== void 0 ? _a : 0) > 0 };
    }),
    /**
     * Migrate legacy account from claude_code_credentials to anthropic_accounts
     * Called automatically if legacy account exists but no multi-accounts
     */
    migrateLegacy: index_2.publicProcedure.mutation(function () {
        var _a;
        var db = (0, db_1.getDatabase)();
        // Check if we already have accounts
        var existingAccounts = db
            .select({ count: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
            .from(db_1.anthropicAccounts)
            .get();
        if (((_a = existingAccounts === null || existingAccounts === void 0 ? void 0 : existingAccounts.count) !== null && _a !== void 0 ? _a : 0) > 0) {
            return { migrated: false, reason: "accounts_exist" };
        }
        // Check for legacy credential
        var legacyCred = db
            .select()
            .from(db_1.claudeCodeCredentials)
            .where((0, drizzle_orm_1.eq)(db_1.claudeCodeCredentials.id, "default"))
            .get();
        if (!(legacyCred === null || legacyCred === void 0 ? void 0 : legacyCred.oauthToken)) {
            return { migrated: false, reason: "no_legacy" };
        }
        var newId = (0, utils_1.createId)();
        // Insert into new table
        db.insert(db_1.anthropicAccounts)
            .values({
            id: newId,
            oauthToken: legacyCred.oauthToken,
            displayName: "Anthropic Account",
            connectedAt: legacyCred.connectedAt,
            desktopUserId: legacyCred.userId,
        })
            .run();
        // Set as active
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
        return { migrated: true, accountId: newId };
    }),
});
var templateObject_1, templateObject_2, templateObject_3;
