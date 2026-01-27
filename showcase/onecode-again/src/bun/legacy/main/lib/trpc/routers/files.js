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
exports.filesRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var electron_1 = require("electron");
// Directories to ignore when scanning
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
// Files to ignore
var IGNORED_FILES = new Set([
    ".DS_Store",
    "Thumbs.db",
    ".gitkeep",
]);
// File extensions to ignore
var IGNORED_EXTENSIONS = new Set([
    ".log",
    ".lock", // We'll handle package-lock.json separately
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
// Lock files to keep (not ignore)
var ALLOWED_LOCK_FILES = new Set([
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "bun.lockb",
]);
// Cache for file and folder listings
var fileListCache = new Map();
var CACHE_TTL = 5000; // 5 seconds
/**
 * Recursively scan a directory and return all file and folder paths
 */
function scanDirectory(rootPath_1) {
    return __awaiter(this, arguments, void 0, function (rootPath, currentPath, depth, maxDepth) {
        var entries, dirEntries, _i, dirEntries_1, entry, fullPath, relativePath, subEntries, ext, error_1;
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
                    fullPath = (0, node_path_1.join)(currentPath, entry.name);
                    relativePath = (0, node_path_1.relative)(rootPath, fullPath);
                    if (!entry.isDirectory()) return [3 /*break*/, 5];
                    // Skip ignored directories
                    if (IGNORED_DIRS.has(entry.name))
                        return [3 /*break*/, 6];
                    // Skip hidden directories (except .github, .vscode, etc.)
                    if (entry.name.startsWith(".") && !entry.name.startsWith(".github") && !entry.name.startsWith(".vscode"))
                        return [3 /*break*/, 6];
                    // Add the folder itself to results
                    entries.push({ path: relativePath, type: "folder" });
                    return [4 /*yield*/, scanDirectory(rootPath, fullPath, depth + 1, maxDepth)];
                case 4:
                    subEntries = _b.sent();
                    entries.push.apply(entries, subEntries);
                    return [3 /*break*/, 6];
                case 5:
                    if (entry.isFile()) {
                        // Skip ignored files
                        if (IGNORED_FILES.has(entry.name))
                            return [3 /*break*/, 6];
                        ext = entry.name.includes(".") ? "." + ((_a = entry.name.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) : "";
                        if (IGNORED_EXTENSIONS.has(ext)) {
                            // Allow specific lock files
                            if (!ALLOWED_LOCK_FILES.has(entry.name))
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
                    error_1 = _b.sent();
                    // Silently skip directories we can't read
                    console.warn("[files] Could not read directory: ".concat(currentPath), error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, entries];
            }
        });
    });
}
/**
 * Get cached entry list or scan directory
 */
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
/**
 * Filter and sort entries (files and folders) by query
 */
function filterEntries(entries, query, limit) {
    var queryLower = query.toLowerCase();
    // Filter entries that match the query
    var filtered = entries;
    if (query) {
        filtered = entries.filter(function (entry) {
            var name = (0, node_path_1.basename)(entry.path).toLowerCase();
            var pathLower = entry.path.toLowerCase();
            return name.includes(queryLower) || pathLower.includes(queryLower);
        });
    }
    // Sort by relevance (exact match > starts with > shorter match > contains > alphabetical)
    // Files and folders are treated equally
    filtered.sort(function (a, b) {
        var aName = (0, node_path_1.basename)(a.path).toLowerCase();
        var bName = (0, node_path_1.basename)(b.path).toLowerCase();
        if (query) {
            // Priority 1: Exact name match
            var aExact = aName === queryLower;
            var bExact = bName === queryLower;
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
            // Priority 2: Name starts with query
            var aStarts = aName.startsWith(queryLower);
            var bStarts = bName.startsWith(queryLower);
            if (aStarts && !bStarts)
                return -1;
            if (!aStarts && bStarts)
                return 1;
            // Priority 3: If both start with query, shorter name = better match
            if (aStarts && bStarts) {
                if (aName.length !== bName.length) {
                    return aName.length - bName.length;
                }
            }
            // Priority 4: Name contains query (but doesn't start with it)
            var aContains = aName.includes(queryLower);
            var bContains = bName.includes(queryLower);
            if (aContains && !bContains)
                return -1;
            if (!aContains && bContains)
                return 1;
        }
        // Alphabetical by name
        return aName.localeCompare(bName);
    });
    // Limit results
    var limited = filtered.slice(0, Math.min(limit, 200));
    // Map to expected format with type
    return limited.map(function (entry) { return ({
        id: "".concat(entry.type, ":local:").concat(entry.path),
        label: (0, node_path_1.basename)(entry.path),
        path: entry.path,
        repository: "local",
        type: entry.type,
    }); });
}
exports.filesRouter = (0, index_1.router)({
    /**
     * Search files and folders in a local project directory
     */
    search: index_1.publicProcedure
        .input(zod_1.z.object({
        projectPath: zod_1.z.string(),
        query: zod_1.z.string().default(""),
        limit: zod_1.z.number().min(1).max(200).default(50),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var projectPath, query, limit, pathStat, entries, folderCount, fileCount, results, error_2;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    projectPath = input.projectPath, query = input.query, limit = input.limit;
                    if (!projectPath) {
                        return [2 /*return*/, []];
                    }
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
                    return [4 /*yield*/, getEntryList(projectPath)
                        // Debug: log folder count
                    ];
                case 3:
                    entries = _c.sent();
                    folderCount = entries.filter(function (e) { return e.type === "folder"; }).length;
                    fileCount = entries.filter(function (e) { return e.type === "file"; }).length;
                    console.log("[files] Scanned ".concat(projectPath, ": ").concat(folderCount, " folders, ").concat(fileCount, " files"));
                    results = filterEntries(entries, query, limit);
                    console.log("[files] Query \"".concat(query, "\": returning ").concat(results.length, " results, folders: ").concat(results.filter(function (r) { return r.type === "folder"; }).length));
                    return [2 /*return*/, results];
                case 4:
                    error_2 = _c.sent();
                    console.error("[files] Error searching files:", error_2);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Clear the file cache for a project (useful when files change)
     */
    clearCache: index_1.publicProcedure
        .input(zod_1.z.object({ projectPath: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        fileListCache.delete(input.projectPath);
        return { success: true };
    }),
    /**
     * Read file contents from filesystem
     */
    readFile: index_1.publicProcedure
        .input(zod_1.z.object({ filePath: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var filePath, content, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    filePath = input.filePath;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, "utf-8")];
                case 2:
                    content = _c.sent();
                    return [2 /*return*/, content];
                case 3:
                    error_3 = _c.sent();
                    console.error("[files] Error reading file ".concat(filePath, ":"), error_3);
                    throw new Error("Failed to read file: ".concat(error_3 instanceof Error ? error_3.message : "Unknown error"));
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Write pasted text to a file in the session's pasted directory
     * Used for large text pastes that shouldn't be embedded inline
     */
    writePastedText: index_1.publicProcedure
        .input(zod_1.z.object({
        subChatId: zod_1.z.string(),
        text: zod_1.z.string(),
        filename: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var subChatId, text, filename, sessionDir, pastedDir, finalFilename, filePath;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    subChatId = input.subChatId, text = input.text, filename = input.filename;
                    sessionDir = (0, node_path_1.join)(electron_1.app.getPath("userData"), "claude-sessions", subChatId);
                    pastedDir = (0, node_path_1.join)(sessionDir, "pasted");
                    return [4 /*yield*/, (0, promises_1.mkdir)(pastedDir, { recursive: true })
                        // Generate filename with timestamp
                    ];
                case 1:
                    _c.sent();
                    finalFilename = filename || "pasted_".concat(Date.now(), ".txt");
                    filePath = (0, node_path_1.join)(pastedDir, finalFilename);
                    // Write file
                    return [4 /*yield*/, (0, promises_1.writeFile)(filePath, text, "utf-8")];
                case 2:
                    // Write file
                    _c.sent();
                    console.log("[files] Wrote pasted text to ".concat(filePath, " (").concat(text.length, " bytes)"));
                    return [2 /*return*/, {
                            filePath: filePath,
                            filename: finalFilename,
                            size: text.length,
                        }];
            }
        });
    }); }),
});
