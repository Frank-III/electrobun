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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExportStream = parseExportStream;
exports.applySandboxGitState = applySandboxGitState;
exports.importSandboxToWorktree = importSandboxToWorktree;
exports.createSandboxImportHandlers = createSandboxImportHandlers;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var os_1 = require("os");
var drizzle_orm_1 = require("drizzle-orm");
var bun_1 = require("electrobun/bun");
var db_1 = require("./db");
var config_1 = require("./config");
var git_worktree_1 = require("./git-worktree");
var git_1 = require("./git");
var shell_env_1 = require("./shell-env");
function runGit(cwd, args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, shell_env_1.execWithShellEnv)("git", args, { cwd: cwd })];
        });
    });
}
function parseExportStream(stream) {
    return __awaiter(this, void 0, void 0, function () {
        var reader, decoder, buffer, result, _a, done, value, lines, _i, lines_1, line, chunk;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = stream.getReader();
                    decoder = new TextDecoder();
                    buffer = "";
                    result = {
                        meta: null,
                        bundle: null,
                        stagedPatch: null,
                        unstagedPatch: null,
                        untrackedFiles: [],
                        claudeSessions: [],
                    };
                    _b.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, reader.read()];
                case 2:
                    _a = _b.sent(), done = _a.done, value = _a.value;
                    if (done)
                        return [3 /*break*/, 3];
                    buffer += decoder.decode(value, { stream: true });
                    lines = buffer.split("\n");
                    buffer = lines.pop() || "";
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (!line.trim())
                            continue;
                        chunk = JSON.parse(line);
                        switch (chunk.type) {
                            case "meta":
                                result.meta = chunk;
                                break;
                            case "bundle":
                                result.bundle = chunk.data ? Buffer.from(chunk.data, "base64") : null;
                                break;
                            case "staged_patch":
                                result.stagedPatch = chunk.data || null;
                                break;
                            case "unstaged_patch":
                                result.unstagedPatch = chunk.data || null;
                                break;
                            case "untracked":
                                result.untrackedFiles.push({
                                    path: chunk.path,
                                    content: Buffer.from(chunk.data, "base64"),
                                });
                                break;
                            case "claude_session":
                                result.claudeSessions.push(chunk);
                                break;
                            case "error":
                                throw new Error(chunk.error);
                            case "done":
                                break;
                        }
                    }
                    return [3 /*break*/, 1];
                case 3:
                    if (!result.meta) {
                        throw new Error("Sandbox export missing metadata");
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
function applySandboxGitState(worktreePath, exportData) {
    return __awaiter(this, void 0, void 0, function () {
        var isFullExport, baseCommit, baseCheck, bundlePath, stagedPatchPath, unstagedPatchPath, _i, _a, file, filePath, error_1, message;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isFullExport = (_b = exportData.meta.isFullExport) !== null && _b !== void 0 ? _b : false;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 37, , 38]);
                    if (!(isFullExport && exportData.meta.remoteUrl)) return [3 /*break*/, 3];
                    return [4 /*yield*/, runGit(worktreePath, ["remote", "add", "origin", exportData.meta.remoteUrl]).catch(function () { })];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    if (!!isFullExport) return [3 /*break*/, 6];
                    baseCommit = exportData.meta.baseCommit;
                    return [4 /*yield*/, runGit(worktreePath, ["cat-file", "-e", baseCommit])];
                case 4:
                    baseCheck = _c.sent();
                    if (!(baseCheck.code !== 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, runGit(worktreePath, ["fetch", "origin"]).catch(function () { })];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    if (!exportData.bundle) return [3 /*break*/, 19];
                    bundlePath = (0, path_1.join)((0, os_1.tmpdir)(), "sandbox-import-".concat(Date.now(), ".bundle"));
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, , 17, 19]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(bundlePath, exportData.bundle)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["bundle", "verify", bundlePath])];
                case 9:
                    _c.sent();
                    if (!isFullExport) return [3 /*break*/, 12];
                    return [4 /*yield*/, runGit(worktreePath, [
                            "fetch",
                            "--update-head-ok",
                            bundlePath,
                            "refs/heads/*:refs/heads/*",
                        ])];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["checkout", "-f", exportData.meta.branch])];
                case 11:
                    _c.sent();
                    return [3 /*break*/, 16];
                case 12: return [4 /*yield*/, runGit(worktreePath, ["fetch", bundlePath, "HEAD:sandbox-import-temp"])];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["reset", "--hard", "sandbox-import-temp"])];
                case 14:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["branch", "-D", "sandbox-import-temp"]).catch(function () { })];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16: return [3 /*break*/, 19];
                case 17: return [4 /*yield*/, (0, promises_1.unlink)(bundlePath).catch(function () { })];
                case 18:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 19:
                    if (!exportData.stagedPatch) return [3 /*break*/, 25];
                    stagedPatchPath = (0, path_1.join)((0, os_1.tmpdir)(), "sandbox-staged-".concat(Date.now(), ".patch"));
                    _c.label = 20;
                case 20:
                    _c.trys.push([20, , 23, 25]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(stagedPatchPath, exportData.stagedPatch)];
                case 21:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["apply", "--index", stagedPatchPath])];
                case 22:
                    _c.sent();
                    return [3 /*break*/, 25];
                case 23: return [4 /*yield*/, (0, promises_1.unlink)(stagedPatchPath).catch(function () { })];
                case 24:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 25:
                    if (!exportData.unstagedPatch) return [3 /*break*/, 31];
                    unstagedPatchPath = (0, path_1.join)((0, os_1.tmpdir)(), "sandbox-unstaged-".concat(Date.now(), ".patch"));
                    _c.label = 26;
                case 26:
                    _c.trys.push([26, , 29, 31]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(unstagedPatchPath, exportData.unstagedPatch)];
                case 27:
                    _c.sent();
                    return [4 /*yield*/, runGit(worktreePath, ["apply", unstagedPatchPath])];
                case 28:
                    _c.sent();
                    return [3 /*break*/, 31];
                case 29: return [4 /*yield*/, (0, promises_1.unlink)(unstagedPatchPath).catch(function () { })];
                case 30:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 31:
                    if (!(exportData.untrackedFiles.length > 0)) return [3 /*break*/, 36];
                    _i = 0, _a = exportData.untrackedFiles;
                    _c.label = 32;
                case 32:
                    if (!(_i < _a.length)) return [3 /*break*/, 36];
                    file = _a[_i];
                    filePath = (0, path_1.join)(worktreePath, file.path);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(filePath), { recursive: true })];
                case 33:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(filePath, file.content)];
                case 34:
                    _c.sent();
                    _c.label = 35;
                case 35:
                    _i++;
                    return [3 /*break*/, 32];
                case 36: return [2 /*return*/, { success: true }];
                case 37:
                    error_1 = _c.sent();
                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                    console.error("[sandbox-import] applySandboxGitState failed:", message);
                    return [2 /*return*/, { success: false, error: message }];
                case 38: return [2 /*return*/];
            }
        });
    });
}
function importSandboxToWorktree(worktreePath_1, apiUrl_1, sandboxId_1, token_1) {
    return __awaiter(this, arguments, void 0, function (worktreePath, apiUrl, sandboxId, token, fullExport, sessionId) {
        var query, queryString, exportUrl, response, exportData, applyResult, error_2, message;
        if (fullExport === void 0) { fullExport = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    query = new URLSearchParams();
                    if (fullExport)
                        query.set("full", "true");
                    if (sessionId)
                        query.set("sessionId", sessionId);
                    queryString = query.toString() ? "?".concat(query.toString()) : "";
                    exportUrl = "".concat(apiUrl, "/api/agents/sandbox/").concat(sandboxId, "/export").concat(queryString);
                    return [4 /*yield*/, fetch(exportUrl, {
                            method: "GET",
                            headers: {
                                "X-Desktop-Token": token,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok || !response.body) {
                        return [2 /*return*/, { success: false, error: "Export failed: ".concat(response.status, " ").concat(response.statusText) }];
                    }
                    return [4 /*yield*/, parseExportStream(response.body)];
                case 2:
                    exportData = _a.sent();
                    return [4 /*yield*/, applySandboxGitState(worktreePath, exportData)];
                case 3:
                    applyResult = _a.sent();
                    return [2 /*return*/, {
                            success: applyResult.success,
                            error: applyResult.error,
                            claudeSessions: exportData.claudeSessions,
                        }];
                case 4:
                    error_2 = _a.sent();
                    message = error_2 instanceof Error ? error_2.message : String(error_2);
                    console.error("[sandbox-import] importSandboxToWorktree failed:", message);
                    return [2 /*return*/, { success: false, error: message }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function normalizeRemoteChat(data) {
    var _a, _b, _c, _d, _e, _f;
    var subChats = Array.isArray(data === null || data === void 0 ? void 0 : data.subChats) ? data.subChats : [];
    return {
        id: String((_a = data === null || data === void 0 ? void 0 : data.id) !== null && _a !== void 0 ? _a : ""),
        name: (_b = data === null || data === void 0 ? void 0 : data.name) !== null && _b !== void 0 ? _b : null,
        sandboxId: (_c = data === null || data === void 0 ? void 0 : data.sandboxId) !== null && _c !== void 0 ? _c : null,
        meta: (_d = data === null || data === void 0 ? void 0 : data.meta) !== null && _d !== void 0 ? _d : null,
        createdAt: (_e = data === null || data === void 0 ? void 0 : data.createdAt) !== null && _e !== void 0 ? _e : new Date().toISOString(),
        updatedAt: (_f = data === null || data === void 0 ? void 0 : data.updatedAt) !== null && _f !== void 0 ? _f : new Date().toISOString(),
        subChats: subChats,
    };
}
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
function writeClaudeSession(subChatId, localProjectPath, session) {
    return __awaiter(this, void 0, void 0, function () {
        var userDataDir, isolatedConfigDir, sanitizedPath, projectDir, rewrittenData, sessionFile, indexData, indexPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveUserDataDir()];
                case 1:
                    userDataDir = _a.sent();
                    isolatedConfigDir = (0, path_1.join)(userDataDir, "claude-sessions", subChatId);
                    sanitizedPath = localProjectPath.replace(/[/.]/g, "-");
                    projectDir = (0, path_1.join)(isolatedConfigDir, "projects", sanitizedPath);
                    return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true })];
                case 2:
                    _a.sent();
                    rewrittenData = session.data.replace(/\/home\/user\/repo/g, localProjectPath);
                    sessionFile = (0, path_1.join)(projectDir, "".concat(session.sessionId, ".jsonl"));
                    return [4 /*yield*/, (0, promises_1.writeFile)(sessionFile, rewrittenData, "utf-8")];
                case 3:
                    _a.sent();
                    indexData = {
                        sessions: [
                            {
                                id: session.sessionId,
                                firstPrompt: session.metadata.firstPrompt,
                                messageCount: session.metadata.messageCount,
                                created: session.metadata.created,
                                modified: session.metadata.modified,
                                gitBranch: session.metadata.gitBranch,
                            },
                        ],
                    };
                    indexPath = (0, path_1.join)(projectDir, "sessions-index.json");
                    return [4 /*yield*/, (0, promises_1.writeFile)(indexPath, JSON.stringify(indexData, null, 2), "utf-8")];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getDesktopToken() {
    return (process.env.DESKTOP_TOKEN ||
        process.env.TWENTYFIRST_DESKTOP_TOKEN ||
        process.env.X_DESKTOP_TOKEN ||
        null);
}
function createSandboxImportHandlers() {
    var _this = this;
    return {
        sandboxImportImportSandboxChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, token, apiUrl, project, chatExportUrl, chatResponse, remoteChatData, _c, targetSessionId, targetSubChat, messagesArray, lastAssistant, worktreeResult, importResult, chat, claudeSessions, _loop_1, _i, _d, remoteSubChat, importedSubChats;
            var _e, _f;
            var sandboxId = _b.sandboxId, remoteChatId = _b.remoteChatId, remoteSubChatId = _b.remoteSubChatId, projectId = _b.projectId, chatName = _b.chatName;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _g.sent();
                        token = getDesktopToken();
                        apiUrl = (0, config_1.getApiUrl)();
                        if (!token) {
                            throw new Error("Not authenticated");
                        }
                        project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, projectId)).get();
                        if (!project) {
                            throw new Error("Project not found");
                        }
                        chatExportUrl = remoteSubChatId
                            ? "".concat(apiUrl, "/api/agents/chat/").concat(remoteChatId, "/export?subChatId=").concat(remoteSubChatId)
                            : "".concat(apiUrl, "/api/agents/chat/").concat(remoteChatId, "/export");
                        return [4 /*yield*/, fetch(chatExportUrl, {
                                method: "GET",
                                headers: { "X-Desktop-Token": token },
                            })];
                    case 2:
                        chatResponse = _g.sent();
                        if (!chatResponse.ok) {
                            throw new Error("Failed to fetch chat data: ".concat(chatResponse.statusText));
                        }
                        _c = normalizeRemoteChat;
                        return [4 /*yield*/, chatResponse.json()];
                    case 3:
                        remoteChatData = _c.apply(void 0, [_g.sent()]);
                        if (remoteChatData.subChats.length > 0) {
                            targetSubChat = remoteChatData.subChats[0];
                            messagesArray = targetSubChat.messages || [];
                            lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                            targetSessionId = (_e = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _e === void 0 ? void 0 : _e.sessionId;
                        }
                        return [4 /*yield*/, (0, git_worktree_1.createWorktreeForChat)(project.path, projectId, "imported-".concat(Date.now()))];
                    case 4:
                        worktreeResult = _g.sent();
                        if (!worktreeResult.success || !worktreeResult.worktreePath) {
                            throw new Error(worktreeResult.error || "Failed to create worktree");
                        }
                        return [4 /*yield*/, importSandboxToWorktree(worktreeResult.worktreePath, apiUrl, sandboxId, token, false, targetSessionId)];
                    case 5:
                        importResult = _g.sent();
                        chat = db
                            .insert(db_1.chats)
                            .values({
                            name: chatName || remoteChatData.name || "Imported Chat",
                            projectId: projectId,
                            worktreePath: worktreeResult.worktreePath,
                            branch: worktreeResult.branch,
                            baseBranch: worktreeResult.baseBranch,
                        })
                            .returning()
                            .get();
                        claudeSessions = importResult.claudeSessions || [];
                        _loop_1 = function (remoteSubChat) {
                            var messagesArray, lastAssistant, messageSessionId, matchingSession, createdSubChat;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        messagesArray = remoteSubChat.messages || [];
                                        lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                                        messageSessionId = (_f = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _f === void 0 ? void 0 : _f.sessionId;
                                        matchingSession = messageSessionId
                                            ? claudeSessions.find(function (s) { return s.sessionId === messageSessionId; })
                                            : undefined;
                                        createdSubChat = db
                                            .insert(db_1.subChats)
                                            .values(__assign({ chatId: chat.id, name: remoteSubChat.name, mode: remoteSubChat.mode === "plan" ? "plan" : "agent", messages: JSON.stringify(messagesArray) }, (matchingSession && { sessionId: messageSessionId })))
                                            .returning()
                                            .get();
                                        if (!matchingSession) return [3 /*break*/, 2];
                                        return [4 /*yield*/, writeClaudeSession(createdSubChat.id, worktreeResult.worktreePath, matchingSession).catch(function (error) {
                                                console.error("[sandbox-import] Failed to write Claude session:", error);
                                            })];
                                    case 1:
                                        _h.sent();
                                        _h.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _d = remoteChatData.subChats;
                        _g.label = 6;
                    case 6:
                        if (!(_i < _d.length)) return [3 /*break*/, 9];
                        remoteSubChat = _d[_i];
                        return [5 /*yield**/, _loop_1(remoteSubChat)];
                    case 7:
                        _g.sent();
                        _g.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9:
                        importedSubChats = db.select().from(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, chat.id)).all();
                        if (importedSubChats.length === 0) {
                            db.insert(db_1.subChats)
                                .values({ chatId: chat.id, name: "Main", mode: "agent", messages: "[]" })
                                .run();
                        }
                        return [2 /*return*/, {
                                success: true,
                                chatId: chat.id,
                                worktreePath: worktreeResult.worktreePath,
                                gitImportSuccess: importResult.success,
                                gitImportError: importResult.error,
                            }];
                }
            });
        }); },
        sandboxImportCloneFromSandbox: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, token, apiUrl, chatExportUrl, chatResponse, remoteChatData, _c, targetSessionId, targetSubChat, messagesArray, lastAssistant, importResult, gitInfo, finalOwner, finalRepo, finalRemoteUrl, finalProvider, repoFromMeta, _d, metaOwner, metaRepo, actualBranch, branchResult, existingProject, project, chat, claudeSessions, _loop_2, _i, _e, remoteSubChat, importedSubChats;
            var _this = this;
            var _f, _g, _h, _j;
            var sandboxId = _b.sandboxId, remoteChatId = _b.remoteChatId, remoteSubChatId = _b.remoteSubChatId, chatName = _b.chatName, targetPath = _b.targetPath;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _k.sent();
                        token = getDesktopToken();
                        apiUrl = (0, config_1.getApiUrl)();
                        if (!token) {
                            throw new Error("Not authenticated");
                        }
                        chatExportUrl = remoteSubChatId
                            ? "".concat(apiUrl, "/api/agents/chat/").concat(remoteChatId, "/export?subChatId=").concat(remoteSubChatId)
                            : "".concat(apiUrl, "/api/agents/chat/").concat(remoteChatId, "/export");
                        return [4 /*yield*/, fetch(chatExportUrl, {
                                method: "GET",
                                headers: { "X-Desktop-Token": token },
                            })];
                    case 2:
                        chatResponse = _k.sent();
                        if (!chatResponse.ok) {
                            throw new Error("Failed to fetch chat data: ".concat(chatResponse.statusText));
                        }
                        _c = normalizeRemoteChat;
                        return [4 /*yield*/, chatResponse.json()];
                    case 3:
                        remoteChatData = _c.apply(void 0, [_k.sent()]);
                        if (remoteChatData.subChats.length > 0) {
                            targetSubChat = remoteChatData.subChats[0];
                            messagesArray = targetSubChat.messages || [];
                            lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                            targetSessionId = (_f = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _f === void 0 ? void 0 : _f.sessionId;
                        }
                        return [4 /*yield*/, (0, promises_1.mkdir)(targetPath, { recursive: true })];
                    case 4:
                        _k.sent();
                        return [4 /*yield*/, runGit(targetPath, ["init"])];
                    case 5:
                        _k.sent();
                        return [4 /*yield*/, importSandboxToWorktree(targetPath, apiUrl, sandboxId, token, true, targetSessionId)];
                    case 6:
                        importResult = _k.sent();
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(targetPath)];
                    case 7:
                        gitInfo = _k.sent();
                        finalOwner = gitInfo.owner;
                        finalRepo = gitInfo.repo;
                        finalRemoteUrl = gitInfo.remoteUrl;
                        finalProvider = gitInfo.provider;
                        if (!(!finalOwner || !finalRepo)) return [3 /*break*/, 9];
                        repoFromMeta = (_g = remoteChatData.meta) === null || _g === void 0 ? void 0 : _g.repository;
                        if (!repoFromMeta) return [3 /*break*/, 9];
                        _d = repoFromMeta.split("/"), metaOwner = _d[0], metaRepo = _d[1];
                        if (!(metaOwner && metaRepo)) return [3 /*break*/, 9];
                        finalOwner = metaOwner;
                        finalRepo = metaRepo;
                        finalProvider = "github";
                        finalRemoteUrl = "https://github.com/".concat(metaOwner, "/").concat(metaRepo);
                        return [4 /*yield*/, runGit(targetPath, ["remote", "add", "origin", finalRemoteUrl]).catch(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, runGit(targetPath, ["remote", "set-url", "origin", finalRemoteUrl]).catch(function () { })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 8:
                        _k.sent();
                        _k.label = 9;
                    case 9:
                        actualBranch = ((_h = remoteChatData.meta) === null || _h === void 0 ? void 0 : _h.branch) || "main";
                        return [4 /*yield*/, runGit(targetPath, ["rev-parse", "--abbrev-ref", "HEAD"])];
                    case 10:
                        branchResult = _k.sent();
                        if (branchResult.code === 0 && branchResult.stdout.trim()) {
                            actualBranch = branchResult.stdout.trim();
                        }
                        existingProject = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.path, targetPath)).get();
                        project = existingProject
                            ? db
                                .update(db_1.projects)
                                .set({
                                updatedAt: new Date(),
                                gitRemoteUrl: finalRemoteUrl,
                                gitProvider: finalProvider,
                                gitOwner: finalOwner,
                                gitRepo: finalRepo,
                            })
                                .where((0, drizzle_orm_1.eq)(db_1.projects.id, existingProject.id))
                                .returning()
                                .get()
                            : db
                                .insert(db_1.projects)
                                .values({
                                name: (0, path_1.basename)(targetPath),
                                path: targetPath,
                                gitRemoteUrl: finalRemoteUrl,
                                gitProvider: finalProvider,
                                gitOwner: finalOwner,
                                gitRepo: finalRepo,
                            })
                                .returning()
                                .get();
                        chat = db
                            .insert(db_1.chats)
                            .values({
                            name: chatName || remoteChatData.name || "Imported Chat",
                            projectId: project.id,
                            worktreePath: targetPath,
                            branch: actualBranch,
                            baseBranch: "main",
                        })
                            .returning()
                            .get();
                        claudeSessions = importResult.claudeSessions || [];
                        _loop_2 = function (remoteSubChat) {
                            var messagesArray, lastAssistant, messageSessionId, matchingSession, createdSubChat;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        messagesArray = remoteSubChat.messages || [];
                                        lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                                        messageSessionId = (_j = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _j === void 0 ? void 0 : _j.sessionId;
                                        matchingSession = messageSessionId
                                            ? claudeSessions.find(function (s) { return s.sessionId === messageSessionId; })
                                            : undefined;
                                        createdSubChat = db
                                            .insert(db_1.subChats)
                                            .values(__assign({ chatId: chat.id, name: remoteSubChat.name, mode: remoteSubChat.mode === "plan" ? "plan" : "agent", messages: JSON.stringify(messagesArray) }, (matchingSession && { sessionId: messageSessionId })))
                                            .returning()
                                            .get();
                                        if (!matchingSession) return [3 /*break*/, 2];
                                        return [4 /*yield*/, writeClaudeSession(createdSubChat.id, targetPath, matchingSession).catch(function (error) {
                                                console.error("[sandbox-import] Failed to write Claude session:", error);
                                            })];
                                    case 1:
                                        _l.sent();
                                        _l.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _e = remoteChatData.subChats;
                        _k.label = 11;
                    case 11:
                        if (!(_i < _e.length)) return [3 /*break*/, 14];
                        remoteSubChat = _e[_i];
                        return [5 /*yield**/, _loop_2(remoteSubChat)];
                    case 12:
                        _k.sent();
                        _k.label = 13;
                    case 13:
                        _i++;
                        return [3 /*break*/, 11];
                    case 14:
                        importedSubChats = db.select().from(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, chat.id)).all();
                        if (importedSubChats.length === 0) {
                            db.insert(db_1.subChats)
                                .values({ chatId: chat.id, name: "Main", mode: "agent", messages: "[]" })
                                .run();
                        }
                        return [2 /*return*/, {
                                success: true,
                                projectId: project.id,
                                chatId: chat.id,
                                gitImportSuccess: importResult.success,
                                gitImportError: importResult.error,
                            }];
                }
            });
        }); },
    };
}
