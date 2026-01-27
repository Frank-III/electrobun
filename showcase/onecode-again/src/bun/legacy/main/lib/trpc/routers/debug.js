"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugRouter = void 0;
exports.isOfflineSimulated = isOfflineSimulated;
var index_1 = require("../index");
var db_1 = require("../../db");
var electron_1 = require("electron");
var index_2 = require("../../../index");
var zod_1 = require("zod");
var network_detector_1 = require("../../ollama/network-detector");
// Protocol constant (must match main/index.ts)
var IS_DEV = !!process.env.ELECTRON_RENDERER_URL;
var PROTOCOL = IS_DEV ? "twentyfirst-agents-dev" : "twentyfirst-agents";
// Global flag for simulating offline mode (for testing)
var simulateOfflineMode = false;
/**
 * Check if offline mode is being simulated (for testing)
 * Used by network-detector.ts
 */
function isOfflineSimulated() {
    return simulateOfflineMode;
}
exports.debugRouter = (0, index_1.router)({
    /**
     * Get system information for debug display
     */
    getSystemInfo: index_1.publicProcedure.query(function () {
        // Check protocol registration
        var protocolRegistered = false;
        try {
            protocolRegistered = process.defaultApp
                ? electron_1.app.isDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]])
                : electron_1.app.isDefaultProtocolClient(PROTOCOL);
        }
        catch (_a) {
            protocolRegistered = false;
        }
        return {
            version: electron_1.app.getVersion(),
            platform: process.platform,
            arch: process.arch,
            isDev: IS_DEV,
            userDataPath: electron_1.app.getPath("userData"),
            protocolRegistered: protocolRegistered,
        };
    }),
    /**
     * Get database statistics
     */
    getDbStats: index_1.publicProcedure.query(function () {
        var db = (0, db_1.getDatabase)();
        var projectCount = db.select().from(db_1.projects).all().length;
        var chatCount = db.select().from(db_1.chats).all().length;
        var subChatCount = db.select().from(db_1.subChats).all().length;
        return {
            projects: projectCount,
            chats: chatCount,
            subChats: subChatCount,
        };
    }),
    /**
     * Clear all chats and sub-chats (keeps projects)
     */
    clearChats: index_1.publicProcedure.mutation(function () {
        var db = (0, db_1.getDatabase)();
        // Delete sub_chats first (foreign key constraint)
        db.delete(db_1.subChats).run();
        db.delete(db_1.chats).run();
        console.log("[Debug] Cleared all chats and sub-chats");
        return { success: true };
    }),
    /**
     * Clear all data (projects, chats, sub-chats)
     */
    clearAllData: index_1.publicProcedure.mutation(function () {
        var db = (0, db_1.getDatabase)();
        // Delete in order due to foreign key constraints
        db.delete(db_1.subChats).run();
        db.delete(db_1.chats).run();
        db.delete(db_1.projects).run();
        console.log("[Debug] Cleared all database data");
        return { success: true };
    }),
    /**
     * Logout (clear auth only)
     */
    logout: index_1.publicProcedure.mutation(function () {
        var authManager = (0, index_2.getAuthManager)();
        authManager.logout();
        console.log("[Debug] User logged out");
        return { success: true };
    }),
    /**
     * Open userData folder in system file manager
     */
    openUserDataFolder: index_1.publicProcedure.mutation(function () {
        var userDataPath = electron_1.app.getPath("userData");
        electron_1.shell.openPath(userDataPath);
        console.log("[Debug] Opened userData folder:", userDataPath);
        return { success: true };
    }),
    /**
     * Get offline simulation status
     */
    getOfflineSimulation: index_1.publicProcedure.query(function () {
        return { enabled: simulateOfflineMode };
    }),
    /**
     * Set offline simulation status (for testing)
     */
    setOfflineSimulation: index_1.publicProcedure
        .input(zod_1.z.object({ enabled: zod_1.z.boolean() }))
        .mutation(function (_a) {
        var input = _a.input;
        simulateOfflineMode = input.enabled;
        // Clear network cache to force immediate re-check
        (0, network_detector_1.clearNetworkCache)();
        console.log("[Debug] Offline simulation ".concat(input.enabled ? "enabled" : "disabled"));
        return { success: true, enabled: simulateOfflineMode };
    }),
});
