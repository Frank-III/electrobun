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
var drizzle_orm_1 = require("drizzle-orm");
var fs_1 = require("fs");
var fs = require("fs/promises");
var os = require("os");
var path = require("path");
var db_1 = require("./db");
var schema_1 = require("./db/schema");
var configLock = Promise.resolve();
exports.CLAUDE_CONFIG_PATH = path.join(os.homedir(), ".claude.json");
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
function readClaudeConfigSync() {
    try {
        var content = (0, fs_1.readFileSync)(exports.CLAUDE_CONFIG_PATH, "utf-8");
        return JSON.parse(content);
    }
    catch (_a) {
        return {};
    }
}
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
function writeClaudeConfigSync(config) {
    (0, fs_1.writeFileSync)(exports.CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
function updateClaudeConfigAtomic(updater) {
    return __awaiter(this, void 0, void 0, function () {
        var release, next, prev, config, updatedConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    next = new Promise(function (resolve) {
                        release = resolve;
                    });
                    prev = configLock;
                    configLock = next;
                    return [4 /*yield*/, prev];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 7]);
                    return [4 /*yield*/, readClaudeConfig()];
                case 3:
                    config = _a.sent();
                    return [4 /*yield*/, updater(config)];
                case 4:
                    updatedConfig = _a.sent();
                    return [4 /*yield*/, writeClaudeConfig(updatedConfig)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, updatedConfig];
                case 6:
                    release();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function claudeConfigExists() {
    return (0, fs_1.existsSync)(exports.CLAUDE_CONFIG_PATH);
}
exports.GLOBAL_MCP_PATH = "__global__";
function getProjectMcpServers(config, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, resolveProjectPathFromWorktree(projectPath)];
                case 1:
                    resolvedPath = (_c.sent()) || projectPath;
                    return [2 /*return*/, (_b = (_a = config.projects) === null || _a === void 0 ? void 0 : _a[resolvedPath]) === null || _b === void 0 ? void 0 : _b.mcpServers];
            }
        });
    });
}
function getMcpServerConfig(config, projectPath, serverName) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!projectPath || projectPath === exports.GLOBAL_MCP_PATH) {
                        return [2 /*return*/, (_a = config.mcpServers) === null || _a === void 0 ? void 0 : _a[serverName]];
                    }
                    return [4 /*yield*/, resolveProjectPathFromWorktree(projectPath)];
                case 1:
                    resolvedPath = (_e.sent()) || projectPath;
                    return [2 /*return*/, (_d = (_c = (_b = config.projects) === null || _b === void 0 ? void 0 : _b[resolvedPath]) === null || _c === void 0 ? void 0 : _c.mcpServers) === null || _d === void 0 ? void 0 : _d[serverName]];
            }
        });
    });
}
function updateMcpServerConfig(config, projectPath, serverName, update) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!projectPath || projectPath === exports.GLOBAL_MCP_PATH) {
                        config.mcpServers = config.mcpServers || {};
                        config.mcpServers[serverName] = __assign(__assign({}, config.mcpServers[serverName]), update);
                        return [2 /*return*/, config];
                    }
                    return [4 /*yield*/, resolveProjectPathFromWorktree(projectPath)];
                case 1:
                    resolvedPath = (_a.sent()) || projectPath;
                    config.projects = config.projects || {};
                    config.projects[resolvedPath] = config.projects[resolvedPath] || {};
                    config.projects[resolvedPath].mcpServers = config.projects[resolvedPath].mcpServers || {};
                    config.projects[resolvedPath].mcpServers[serverName] = __assign(__assign({}, config.projects[resolvedPath].mcpServers[serverName]), update);
                    return [2 /*return*/, config];
            }
        });
    });
}
function resolveProjectPathFromWorktree(pathToResolve) {
    return __awaiter(this, void 0, void 0, function () {
        var worktreeMarker, normalizedPath, normalizedMarker, worktreeBase, normalizedBase, relativePath, parts, db, projectById, expectedWorktreePath, chat, project, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    worktreeMarker = path.join(".21st", "worktrees");
                    normalizedPath = pathToResolve.replace(/\\/g, "/");
                    normalizedMarker = worktreeMarker.replace(/\\/g, "/");
                    if (!normalizedPath.includes(normalizedMarker)) {
                        return [2 /*return*/, pathToResolve];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    worktreeBase = path.join(os.homedir(), ".21st", "worktrees");
                    normalizedBase = worktreeBase.replace(/\\/g, "/");
                    relativePath = normalizedPath.replace(normalizedBase, "").replace(/^\//, "");
                    parts = relativePath.split("/");
                    if (parts.length < 1 || !parts[0]) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, db_1.getDatabase)()];
                case 2:
                    db = _a.sent();
                    projectById = db
                        .select({ path: schema_1.projects.path })
                        .from(schema_1.projects)
                        .where((0, drizzle_orm_1.eq)(schema_1.projects.id, parts[0]))
                        .get();
                    if (projectById) {
                        return [2 /*return*/, projectById.path];
                    }
                    if (parts.length >= 2) {
                        expectedWorktreePath = path.join(worktreeBase, parts[0], parts[1]);
                        chat = db
                            .select({ projectId: schema_1.chats.projectId })
                            .from(schema_1.chats)
                            .where((0, drizzle_orm_1.eq)(schema_1.chats.worktreePath, expectedWorktreePath))
                            .get();
                        if (chat) {
                            project = db
                                .select({ path: schema_1.projects.path })
                                .from(schema_1.projects)
                                .where((0, drizzle_orm_1.eq)(schema_1.projects.id, chat.projectId))
                                .get();
                            if (project) {
                                return [2 /*return*/, project.path];
                            }
                        }
                    }
                    return [2 /*return*/, null];
                case 3:
                    error_1 = _a.sent();
                    console.error("[worktree-utils] Failed to resolve project path:", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
