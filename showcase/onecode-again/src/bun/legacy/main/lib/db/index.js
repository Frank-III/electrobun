"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
var better_sqlite3_1 = require("better-sqlite3");
var better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
var migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
var electron_1 = require("electron");
var path_1 = require("path");
var fs_1 = require("fs");
var schema = require("./schema");
var db = null;
var sqlite = null;
/**
 * Get the database path in the app's user data directory
 */
function getDatabasePath() {
    var userDataPath = electron_1.app.getPath("userData");
    var dataDir = (0, path_1.join)(userDataPath, "data");
    // Ensure data directory exists
    if (!(0, fs_1.existsSync)(dataDir)) {
        (0, fs_1.mkdirSync)(dataDir, { recursive: true });
    }
    return (0, path_1.join)(dataDir, "agents.db");
}
/**
 * Get the migrations folder path
 * Handles both development and production (packaged) environments
 */
function getMigrationsPath() {
    if (electron_1.app.isPackaged) {
        // Production: migrations bundled in resources
        return (0, path_1.join)(process.resourcesPath, "migrations");
    }
    // Development: from out/main -> apps/desktop/drizzle
    return (0, path_1.join)(__dirname, "../../drizzle");
}
/**
 * Initialize the database with Drizzle ORM
 */
function initDatabase() {
    if (db) {
        return db;
    }
    var dbPath = getDatabasePath();
    console.log("[DB] Initializing database at: ".concat(dbPath));
    // Create SQLite connection
    sqlite = new better_sqlite3_1.default(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    // Create Drizzle instance
    db = (0, better_sqlite3_2.drizzle)(sqlite, { schema: schema });
    // Run migrations
    var migrationsPath = getMigrationsPath();
    console.log("[DB] Running migrations from: ".concat(migrationsPath));
    try {
        (0, migrator_1.migrate)(db, { migrationsFolder: migrationsPath });
        console.log("[DB] Migrations completed");
    }
    catch (error) {
        console.error("[DB] Migration error:", error);
        throw error;
    }
    return db;
}
/**
 * Get the database instance
 */
function getDatabase() {
    if (!db) {
        return initDatabase();
    }
    return db;
}
/**
 * Close the database connection
 */
function closeDatabase() {
    if (sqlite) {
        sqlite.close();
        sqlite = null;
        db = null;
        console.log("[DB] Database connection closed");
    }
}
// Re-export schema for convenience
__exportStar(require("./schema"), exports);
