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
exports.createFileHandlers = createFileHandlers;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var bun_1 = require("electrobun/bun");
var IGNORED_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    "release",
    ".next",
    ".nuxt",
    ".output",
    "coverage",
    "__pycache__",
    ".venv",
    "venv",
    ".cache",
    ".turbo",
    ".vercel",
    ".netlify",
    "out",
    ".svelte-kit",
    ".astro",
]);
var IGNORED_FILES = new Set([".DS_Store", "Thumbs.db", ".gitkeep"]);
var IGNORED_EXTENSIONS = new Set([
    ".log",
    ".lock",
    ".pyc",
    ".pyo",
    ".class",
    ".o",
    ".obj",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
]);
var ALLOWED_LOCK_FILES = new Set([
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
]);
var APP_IDENTIFIER = "dev.onecode.again";
var APP_NAME = "onecode-again";
var CACHE_TTL = 5000;
var fileListCache = new Map();
function resolveUserDataDir() {
    return __awaiter(this, void 0, void 0, function () {
        var appDataFolder, error_1, platform, home, base_1, base;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bun_1.Updater.appDataFolder()];
                case 1:
                    appDataFolder = _a.sent();
                    if (appDataFolder)
                        return [2 /*return*/, appDataFolder];
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.warn("[files] Updater.appDataFolder failed, using fallback path.", error_1);
                    return [3 /*break*/, 3];
                case 3:
                    platform = process.platform;
                    home = process.env.HOME || process.env.USERPROFILE || process.cwd();
                    if (platform === "win32") {
                        base_1 = process.env.LOCALAPPDATA || (0, path_1.join)(home, "AppData", "Local");
                        return [2 /*return*/, (0, path_1.join)(base_1, APP_IDENTIFIER, APP_NAME)];
                    }
                    if (platform === "darwin") {
                        return [2 /*return*/, (0, path_1.join)(home, "Library", "Application Support", APP_IDENTIFIER, APP_NAME)];
                    }
                    base = process.env.XDG_DATA_HOME || (0, path_1.join)(home, ".local", "share");
                    return [2 /*return*/, (0, path_1.join)(base, APP_IDENTIFIER, APP_NAME)];
            }
        });
    });
}
function scanDirectory(rootPath_1) {
    return __awaiter(this, arguments, void 0, function (rootPath, currentPath, depth, maxDepth) {
        var entries, dirEntries, _i, dirEntries_1, entry, fullPath, relativePath, subEntries, ext, error_2;
        var _a;
        if (currentPath === void 0) { currentPath = rootPath; }
        if (depth === void 0) { depth = 0; }
        if (maxDepth === void 0) { maxDepth = 15; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (depth > maxDepth)
                        return [2 /*return*/, []];
                    entries = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readdir)(currentPath, { withFileTypes: true })];
                case 2:
                    dirEntries = _b.sent();
                    _i = 0, dirEntries_1 = dirEntries;
                    _b.label = 3;
                case 3:
                    if (!(_i < dirEntries_1.length)) return [3 /*break*/, 7];
                    entry = dirEntries_1[_i];
                    fullPath = (0, path_1.join)(currentPath, entry.name);
                    relativePath = (0, path_1.relative)(rootPath, fullPath);
                    if (!entry.isDirectory()) return [3 /*break*/, 5];
                    if (IGNORED_DIRS.has(entry.name))
                        return [3 /*break*/, 6];
                    if (entry.name.startsWith(".") && !entry.name.startsWith(".github") && !entry.name.startsWith(".vscode")) {
                        return [3 /*break*/, 6];
                    }
                    entries.push({ path: relativePath, type: "folder" });
                    return [4 /*yield*/, scanDirectory(rootPath, fullPath, depth + 1, maxDepth)];
                case 4:
                    subEntries = _b.sent();
                    entries.push.apply(entries, subEntries);
                    return [3 /*break*/, 6];
                case 5:
                    if (entry.isFile()) {
                        if (IGNORED_FILES.has(entry.name))
                            return [3 /*break*/, 6];
                        ext = entry.name.includes(".") ? "." + ((_a = entry.name.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) : "";
                        if (IGNORED_EXTENSIONS.has(ext) && !ALLOWED_LOCK_FILES.has(entry.name)) {
                            return [3 /*break*/, 6];
                        }
                        entries.push({ path: relativePath, type: "file" });
                    }
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_2 = _b.sent();
                    console.warn("[files] Could not read directory: ".concat(currentPath), error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, entries];
            }
        });
    });
}
function getEntryList(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, now, entries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cached = fileListCache.get(projectPath);
                    now = Date.now();
                    if (cached && now - cached.timestamp < CACHE_TTL) {
                        return [2 /*return*/, cached.entries];
                    }
                    return [4 /*yield*/, scanDirectory(projectPath)];
                case 1:
                    entries = _a.sent();
                    fileListCache.set(projectPath, { entries: entries, timestamp: now });
                    return [2 /*return*/, entries];
            }
        });
    });
}
function filterEntries(entries, query, limit) {
    var queryLower = query.toLowerCase();
    var filtered = entries;
    if (query) {
        filtered = entries.filter(function (entry) {
            var name = (0, path_1.basename)(entry.path).toLowerCase();
            var pathLower = entry.path.toLowerCase();
            return name.includes(queryLower) || pathLower.includes(queryLower);
        });
    }
    filtered.sort(function (a, b) {
        var aName = (0, path_1.basename)(a.path).toLowerCase();
        var bName = (0, path_1.basename)(b.path).toLowerCase();
        if (query) {
            var aExact = aName === queryLower;
            var bExact = bName === queryLower;
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
            var aStarts = aName.startsWith(queryLower);
            var bStarts = bName.startsWith(queryLower);
            if (aStarts && !bStarts)
                return -1;
            if (!aStarts && bStarts)
                return 1;
            if (aStarts && bStarts && aName.length !== bName.length) {
                return aName.length - bName.length;
            }
            var aContains = aName.includes(queryLower);
            var bContains = bName.includes(queryLower);
            if (aContains && !bContains)
                return -1;
            if (!aContains && bContains)
                return 1;
        }
        return aName.localeCompare(bName);
    });
    var limited = filtered.slice(0, Math.min(limit, 200));
    return limited.map(function (entry) { return ({
        id: "".concat(entry.type, ":local:").concat(entry.path),
        label: (0, path_1.basename)(entry.path),
        path: entry.path,
        repository: "local",
        type: entry.type,
    }); });
}
function createFileHandlers() {
    var _this = this;
    return {
        filesSearch: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var pathStat, entries, error_3;
            var projectPath = _b.projectPath, query = _b.query, limit = _b.limit;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!projectPath)
                            return [2 /*return*/, []];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.stat)(projectPath)];
                    case 2:
                        pathStat = _c.sent();
                        if (!pathStat.isDirectory()) {
                            console.warn("[files] Not a directory: ".concat(projectPath));
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, getEntryList(projectPath)];
                    case 3:
                        entries = _c.sent();
                        return [2 /*return*/, filterEntries(entries, query !== null && query !== void 0 ? query : "", limit !== null && limit !== void 0 ? limit : 50)];
                    case 4:
                        error_3 = _c.sent();
                        console.error("[files] Error searching files:", error_3);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        }); },
        filesClearCache: function (_a) {
            var projectPath = _a.projectPath;
            fileListCache.delete(projectPath);
            return { success: true };
        },
        filesRead: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var error_4;
            var filePath = _b.filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Bun.file(filePath).text()];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2:
                        error_4 = _c.sent();
                        console.error("[files] Error reading file ".concat(filePath, ":"), error_4);
                        throw new Error("Failed to read file: ".concat(error_4 instanceof Error ? error_4.message : "Unknown error"));
                    case 3: return [2 /*return*/];
                }
            });
        }); },
        filesWritePastedText: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userDataDir, sessionDir, pastedDir, finalFilename, filePath;
            var subChatId = _b.subChatId, text = _b.text, filename = _b.filename;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, resolveUserDataDir()];
                    case 1:
                        userDataDir = _c.sent();
                        sessionDir = (0, path_1.join)(userDataDir, "claude-sessions", subChatId);
                        pastedDir = (0, path_1.join)(sessionDir, "pasted");
                        return [4 /*yield*/, (0, promises_1.mkdir)(pastedDir, { recursive: true })];
                    case 2:
                        _c.sent();
                        finalFilename = filename || "pasted_".concat(Date.now(), ".txt");
                        filePath = (0, path_1.join)(pastedDir, finalFilename);
                        return [4 /*yield*/, Bun.write(filePath, text)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, {
                                filePath: filePath,
                                filename: finalFilename,
                                size: text.length,
                            }];
                }
            });
        }); },
    };
}
