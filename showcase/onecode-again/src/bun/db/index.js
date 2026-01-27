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
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var bun_sqlite_1 = require("bun:sqlite");
var bun_sqlite_2 = require("drizzle-orm/bun-sqlite");
var migrator_1 = require("drizzle-orm/bun-sqlite/migrator");
var bun_1 = require("electrobun/bun");
var schema = require("./schema");
var db = null;
var sqlite = null;
function resolveUserDataDir() {
    return __awaiter(this, void 0, void 0, function () {
        var appDataFolder, _a, platform, home, base_1, base;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bun_1.Updater.appDataFolder()];
                case 1:
                    appDataFolder = _b.sent();
                    if (appDataFolder)
                        return [2 /*return*/, appDataFolder];
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3:
                    platform = process.platform;
                    home = process.env.HOME || process.env.USERPROFILE || process.cwd();
                    if (platform === "win32") {
                        base_1 = process.env.LOCALAPPDATA || (0, path_1.join)(home, "AppData", "Local");
                        return [2 /*return*/, (0, path_1.join)(base_1, "dev.onecode.again", "onecode-again")];
                    }
                    if (platform === "darwin") {
                        return [2 /*return*/, (0, path_1.join)(home, "Library", "Application Support", "dev.onecode.again", "onecode-again")];
                    }
                    base = process.env.XDG_DATA_HOME || (0, path_1.join)(home, ".local", "share");
                    return [2 /*return*/, (0, path_1.join)(base, "dev.onecode.again", "onecode-again")];
            }
        });
    });
}
function getDatabasePath() {
    return __awaiter(this, void 0, void 0, function () {
        var userDataPath, dataDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveUserDataDir()];
                case 1:
                    userDataPath = _a.sent();
                    dataDir = (0, path_1.join)(userDataPath, "data");
                    return [4 /*yield*/, (0, promises_1.mkdir)(dataDir, { recursive: true })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, (0, path_1.join)(dataDir, "agents.db")];
            }
        });
    });
}
function getMigrationsPath() {
    return (0, path_1.join)(import.meta.dir, "..", "legacy", "drizzle");
}
function initDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var dbPath, migrationsPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (db) {
                        return [2 /*return*/, db];
                    }
                    return [4 /*yield*/, getDatabasePath()];
                case 1:
                    dbPath = _a.sent();
                    sqlite = new bun_sqlite_1.Database(dbPath);
                    sqlite.exec("PRAGMA journal_mode = WAL;");
                    sqlite.exec("PRAGMA foreign_keys = ON;");
                    db = (0, bun_sqlite_2.drizzle)(sqlite, { schema: schema });
                    migrationsPath = getMigrationsPath();
                    try {
                        (0, migrator_1.migrate)(db, { migrationsFolder: migrationsPath });
                    }
                    catch (error) {
                        console.error("[DB] Migration error:", error);
                        throw error;
                    }
                    return [2 /*return*/, db];
            }
        });
    });
}
function getDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!db) {
                return [2 /*return*/, initDatabase()];
            }
            return [2 /*return*/, db];
        });
    });
}
function closeDatabase() {
    if (sqlite) {
        sqlite.close();
        sqlite = null;
        db = null;
    }
}
__exportStar(require("./schema"), exports);
