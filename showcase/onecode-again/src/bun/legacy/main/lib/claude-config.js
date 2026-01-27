"use strict";
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
exports.GLOBAL_MCP_PATH = exports.CLAUDE_CONFIG_PATH = void 0;
exports.readClaudeConfig = readClaudeConfig;
exports.readClaudeConfigSync = readClaudeConfigSync;
exports.writeClaudeConfig = writeClaudeConfig;
exports.writeClaudeConfigSync = writeClaudeConfigSync;
exports.updateClaudeConfigAtomic = updateClaudeConfigAtomic;
exports.claudeConfigExists = claudeConfigExists;
exports.getProjectMcpServers = getProjectMcpServers;
exports.getMcpServerConfig = getMcpServerConfig;
exports.updateMcpServerConfig = updateMcpServerConfig;
exports.resolveProjectPathFromWorktree = resolveProjectPathFromWorktree;
/**
 * Helpers for reading and writing ~/.claude.json configuration
 */
var async_mutex_1 = require("async-mutex");
var drizzle_orm_1 = require("drizzle-orm");
var fs_1 = require("fs");
var fs = require("fs/promises");
var os = require("os");
var path = require("path");
var db_1 = require("./db");
var schema_1 = require("./db/schema");
/**
 * Mutex for protecting read-modify-write operations on ~/.claude.json
 * This prevents race conditions when multiple concurrent operations
 * (e.g., token refreshes for different MCP servers) try to update the config.
 */
var configMutex = new async_mutex_1.Mutex();
exports.CLAUDE_CONFIG_PATH = path.join(os.homedir(), ".claude.json");
/**
 * Read ~/.claude.json asynchronously
 * Returns empty config if file doesn't exist or is invalid
 */
function readClaudeConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.readFile(exports.CLAUDE_CONFIG_PATH, "utf-8")];
                case 1:
                    content = _b.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read ~/.claude.json synchronously
 * Returns empty config if file doesn't exist or is invalid
 */
function readClaudeConfigSync() {
    try {
        var content = (0, fs_1.readFileSync)(exports.CLAUDE_CONFIG_PATH, "utf-8");
        return JSON.parse(content);
    }
    catch (_a) {
        return {};
    }
}
/**
 * Write ~/.claude.json asynchronously
 */
function writeClaudeConfig(config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.writeFile(exports.CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Write ~/.claude.json synchronously
 */
function writeClaudeConfigSync(config) {
    (0, fs_1.writeFileSync)(exports.CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
/**
 * Execute a read-modify-write operation on ~/.claude.json atomically.
 * This is the ONLY safe way to update the config when concurrent writes are possible.
 *
 * Uses a mutex to ensure that only one read-modify-write cycle happens at a time,
 * preventing race conditions where concurrent token refreshes could overwrite
 * each other's updates.
 *
 * @param updater Function that receives current config and returns updated config
 * @returns The updated config
 */
function updateClaudeConfigAtomic(updater) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, configMutex.runExclusive(function () { return __awaiter(_this, void 0, void 0, function () {
                    var config, updatedConfig;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, readClaudeConfig()];
                            case 1:
                                config = _a.sent();
                                return [4 /*yield*/, updater(config)];
                            case 2:
                                updatedConfig = _a.sent();
                                return [4 /*yield*/, writeClaudeConfig(updatedConfig)];
                            case 3:
                                _a.sent();
                                return [2 /*return*/, updatedConfig];
                        }
                    });
                }); })];
        });
    });
}
/**
 * Check if ~/.claude.json exists
 */
function claudeConfigExists() {
    return (0, fs_1.existsSync)(exports.CLAUDE_CONFIG_PATH);
}
/**
 * Get MCP servers config for a specific project
 * Automatically resolves worktree paths to original project paths
 */
function getProjectMcpServers(config, projectPath) {
    var _a, _b;
    var resolvedPath = resolveProjectPathFromWorktree(projectPath) || projectPath;
    return (_b = (_a = config.projects) === null || _a === void 0 ? void 0 : _a[resolvedPath]) === null || _b === void 0 ? void 0 : _b.mcpServers;
}
// Special marker for global MCP servers (not tied to a project)
exports.GLOBAL_MCP_PATH = "__global__";
/**
 * Get a specific MCP server config
 * Use projectPath = GLOBAL_MCP_PATH (or null) for global MCP servers
 * Automatically resolves worktree paths to original project paths
 */
function getMcpServerConfig(config, projectPath, serverName) {
    var _a, _b, _c, _d;
    // Global MCP servers (root level mcpServers in ~/.claude.json)
    if (!projectPath || projectPath === exports.GLOBAL_MCP_PATH) {
        return (_a = config.mcpServers) === null || _a === void 0 ? void 0 : _a[serverName];
    }
    // Project-specific MCP servers (resolve worktree paths)
    var resolvedPath = resolveProjectPathFromWorktree(projectPath) || projectPath;
    return (_d = (_c = (_b = config.projects) === null || _b === void 0 ? void 0 : _b[resolvedPath]) === null || _c === void 0 ? void 0 : _c.mcpServers) === null || _d === void 0 ? void 0 : _d[serverName];
}
/**
 * Update MCP server config (creates path if needed)
 * Use projectPath = GLOBAL_MCP_PATH (or null) for global MCP servers
 * Automatically resolves worktree paths to original project paths
 */
function updateMcpServerConfig(config, projectPath, serverName, update) {
    // Global MCP servers (root level mcpServers in ~/.claude.json)
    if (!projectPath || projectPath === exports.GLOBAL_MCP_PATH) {
        config.mcpServers = config.mcpServers || {};
        config.mcpServers[serverName] = __assign(__assign({}, config.mcpServers[serverName]), update);
        return config;
    }
    // Project-specific MCP servers (resolve worktree paths)
    var resolvedPath = resolveProjectPathFromWorktree(projectPath) || projectPath;
    config.projects = config.projects || {};
    config.projects[resolvedPath] = config.projects[resolvedPath] || {};
    config.projects[resolvedPath].mcpServers = config.projects[resolvedPath].mcpServers || {};
    config.projects[resolvedPath].mcpServers[serverName] = __assign(__assign({}, config.projects[resolvedPath].mcpServers[serverName]), update);
    return config;
}
/**
 * Resolve original project path from a worktree path.
 * Supports legacy (~/.21st/worktrees/{projectId}/{chatId}/) and
 * new format (~/.21st/worktrees/{projectName}/{worktreeFolder}/).
 *
 * @param pathToResolve - Either a worktree path or regular project path
 * @returns The original project path, or the input if not a worktree, or null if resolution fails
 */
function resolveProjectPathFromWorktree(pathToResolve) {
    var worktreeMarker = path.join(".21st", "worktrees");
    // Normalize for cross-platform (handle both / and \ separators)
    var normalizedPath = pathToResolve.replace(/\\/g, "/");
    var normalizedMarker = worktreeMarker.replace(/\\/g, "/");
    if (!normalizedPath.includes(normalizedMarker)) {
        // Not a worktree path, return as-is
        return pathToResolve;
    }
    try {
        // Extract segments from path structure
        // Path format: /Users/.../.21st/worktrees/{projectSlug}/{worktreeFolder}
        var worktreeBase = path.join(os.homedir(), ".21st", "worktrees");
        var normalizedBase = worktreeBase.replace(/\\/g, "/");
        var relativePath = normalizedPath
            .replace(normalizedBase, "")
            .replace(/^\//, "");
        var parts = relativePath.split("/");
        if (parts.length < 1 || !parts[0]) {
            return null;
        }
        var db = (0, db_1.getDatabase)();
        // Strategy 1: Legacy lookup - folder name is a projectId
        var projectById = db
            .select({ path: schema_1.projects.path })
            .from(schema_1.projects)
            .where((0, drizzle_orm_1.eq)(schema_1.projects.id, parts[0]))
            .get();
        if (projectById) {
            return projectById.path;
        }
        // Strategy 2: New format - folder name is the project name.
        // Look up via chats.worktreePath which stores the full path.
        if (parts.length >= 2) {
            var expectedWorktreePath = path.join(worktreeBase, parts[0], parts[1]);
            var chat = db
                .select({ projectId: schema_1.chats.projectId })
                .from(schema_1.chats)
                .where((0, drizzle_orm_1.eq)(schema_1.chats.worktreePath, expectedWorktreePath))
                .get();
            if (chat) {
                var project = db
                    .select({ path: schema_1.projects.path })
                    .from(schema_1.projects)
                    .where((0, drizzle_orm_1.eq)(schema_1.projects.id, chat.projectId))
                    .get();
                if (project) {
                    return project.path;
                }
            }
        }
        return null;
    }
    catch (error) {
        console.error("[worktree-utils] Failed to resolve project path:", error);
        return null;
    }
}
