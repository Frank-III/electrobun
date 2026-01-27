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
exports.sandboxImportRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var db_1 = require("../../db");
var schema_1 = require("../../db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var electron_1 = require("electron");
var index_2 = require("../../../index");
var worktree_1 = require("../../git/worktree");
var sandbox_import_1 = require("../../git/sandbox-import");
var git_1 = require("../../git");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
/**
 * Schema for remote chat data from web API
 */
var remoteSubChatSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    mode: zod_1.z.string(),
    messages: zod_1.z.any(), // JSON messages array
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
var remoteChatSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    sandboxId: zod_1.z.string().nullable(),
    meta: zod_1.z
        .object({
        repository: zod_1.z.string().optional(),
        branch: zod_1.z.string().nullable().optional(),
    })
        .nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    subChats: zod_1.z.array(remoteSubChatSchema),
});
/**
 * Write Claude session files to the isolated config directory for a subChat
 * This allows conversations to be resumed after importing from sandbox
 */
function writeClaudeSession(subChatId, localProjectPath, session) {
    return __awaiter(this, void 0, void 0, function () {
        var isolatedConfigDir, sanitizedPath, projectDir, rewrittenData, sessionFilePath, indexData, indexPath;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    isolatedConfigDir = (0, node_path_1.join)(electron_1.app.getPath("userData"), "claude-sessions", subChatId);
                    sanitizedPath = localProjectPath.replace(/[/.]/g, "-");
                    projectDir = (0, node_path_1.join)(isolatedConfigDir, "projects", sanitizedPath);
                    console.log("[writeClaudeSession] ========== DEBUG ==========");
                    console.log("[writeClaudeSession] subChatId: ".concat(subChatId));
                    console.log("[writeClaudeSession] localProjectPath: ".concat(localProjectPath));
                    console.log("[writeClaudeSession] sanitizedPath: ".concat(sanitizedPath));
                    console.log("[writeClaudeSession] isolatedConfigDir: ".concat(isolatedConfigDir));
                    console.log("[writeClaudeSession] projectDir: ".concat(projectDir));
                    console.log("[writeClaudeSession] sessionId: ".concat(session.sessionId));
                    return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true })];
                case 1:
                    _f.sent();
                    rewrittenData = session.data.replace(/\/home\/user\/repo/g, localProjectPath);
                    sessionFilePath = (0, node_path_1.join)(projectDir, "".concat(session.sessionId, ".jsonl"));
                    return [4 /*yield*/, (0, promises_1.writeFile)(sessionFilePath, rewrittenData, "utf-8")];
                case 2:
                    _f.sent();
                    console.log("[writeClaudeSession] Wrote session file: ".concat(sessionFilePath));
                    indexData = {
                        version: 1,
                        entries: [{
                                sessionId: session.sessionId,
                                fullPath: sessionFilePath,
                                projectPath: localProjectPath,
                                firstPrompt: ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.firstPrompt) || "",
                                messageCount: ((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.messageCount) || 0,
                                created: ((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.created) || new Date().toISOString(),
                                modified: ((_d = session.metadata) === null || _d === void 0 ? void 0 : _d.modified) || new Date().toISOString(),
                                gitBranch: ((_e = session.metadata) === null || _e === void 0 ? void 0 : _e.gitBranch) || "",
                                fileMtime: Date.now(),
                                isSidechain: false,
                            }],
                    };
                    indexPath = (0, node_path_1.join)(projectDir, "sessions-index.json");
                    return [4 /*yield*/, (0, promises_1.writeFile)(indexPath, JSON.stringify(indexData, null, 2), "utf-8")];
                case 3:
                    _f.sent();
                    console.log("[writeClaudeSession] Wrote index file: ".concat(indexPath));
                    console.log("[writeClaudeSession] ========== END DEBUG ==========");
                    return [2 /*return*/];
            }
        });
    });
}
exports.sandboxImportRouter = (0, index_1.router)({
    /**
     * Import a sandbox chat to a local worktree
     */
    importSandboxChat: index_1.publicProcedure
        .input(zod_1.z.object({
        sandboxId: zod_1.z.string(),
        remoteChatId: zod_1.z.string(),
        remoteSubChatId: zod_1.z.string().optional(),
        projectId: zod_1.z.string(),
        chatName: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, authManager, apiUrl, token, project, chatExportUrl, chatResponse, remoteChatData, _c, _d, targetSessionId, targetSubChat, messagesArray, lastAssistant, worktreeResult, importResult, chat, claudeSessions, _loop_1, _i, _e, remoteSubChat, importedSubChats;
        var _f, _g, _h;
        var input = _b.input;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    authManager = (0, index_2.getAuthManager)();
                    apiUrl = (0, index_2.getBaseUrl)();
                    console.log("[OPEN-LOCALLY] Starting import: remoteChatId=".concat(input.remoteChatId, ", remoteSubChatId=").concat(input.remoteSubChatId || "all", ", sandboxId=").concat(input.sandboxId));
                    return [4 /*yield*/, authManager.getValidToken()];
                case 1:
                    token = _j.sent();
                    if (!token) {
                        throw new Error("Not authenticated");
                    }
                    project = db
                        .select()
                        .from(schema_1.projects)
                        .where((0, drizzle_orm_1.eq)(schema_1.projects.id, input.projectId))
                        .get();
                    if (!project) {
                        throw new Error("Project not found");
                    }
                    chatExportUrl = input.remoteSubChatId
                        ? "".concat(apiUrl, "/api/agents/chat/").concat(input.remoteChatId, "/export?subChatId=").concat(input.remoteSubChatId)
                        : "".concat(apiUrl, "/api/agents/chat/").concat(input.remoteChatId, "/export");
                    console.log("[OPEN-LOCALLY] Fetching chat data from: ".concat(chatExportUrl));
                    return [4 /*yield*/, fetch(chatExportUrl, {
                            method: "GET",
                            headers: {
                                "X-Desktop-Token": token,
                            },
                        })];
                case 2:
                    chatResponse = _j.sent();
                    if (!chatResponse.ok) {
                        throw new Error("Failed to fetch chat data: ".concat(chatResponse.statusText));
                    }
                    _d = (_c = remoteChatSchema).parse;
                    return [4 /*yield*/, chatResponse.json()];
                case 3:
                    remoteChatData = _d.apply(_c, [_j.sent()]);
                    console.log("[OPEN-LOCALLY] Found ".concat(remoteChatData.subChats.length, " subchat(s) to import"));
                    if (remoteChatData.subChats.length > 0) {
                        targetSubChat = remoteChatData.subChats[0];
                        messagesArray = targetSubChat.messages || [];
                        lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                        targetSessionId = (_f = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _f === void 0 ? void 0 : _f.sessionId;
                        console.log("[OPEN-LOCALLY] Target sessionId from subchat messages: ".concat(targetSessionId || "none"));
                    }
                    return [4 /*yield*/, (0, worktree_1.createWorktreeForChat)(project.path, input.projectId, "imported-".concat(Date.now()))];
                case 4:
                    worktreeResult = _j.sent();
                    if (!worktreeResult.success || !worktreeResult.worktreePath) {
                        throw new Error(worktreeResult.error || "Failed to create worktree");
                    }
                    return [4 /*yield*/, (0, sandbox_import_1.importSandboxToWorktree)(worktreeResult.worktreePath, apiUrl, input.sandboxId, token, false, // fullExport = false
                        targetSessionId)];
                case 5:
                    importResult = _j.sent();
                    console.log("[OPEN-LOCALLY] Received ".concat(((_g = importResult.claudeSessions) === null || _g === void 0 ? void 0 : _g.length) || 0, " Claude session(s) from sandbox"));
                    if (!importResult.success) {
                        console.warn("[sandbox-import] Git state import failed: ".concat(importResult.error));
                        // Continue anyway - chat history is still valuable
                    }
                    chat = db
                        .insert(schema_1.chats)
                        .values({
                        name: input.chatName || remoteChatData.name || "Imported Chat",
                        projectId: input.projectId,
                        worktreePath: worktreeResult.worktreePath,
                        branch: worktreeResult.branch,
                        baseBranch: worktreeResult.baseBranch,
                    })
                        .returning()
                        .get();
                    claudeSessions = importResult.claudeSessions || [];
                    console.log("[sandbox-import] Available Claude sessions: ".concat(claudeSessions.length));
                    _loop_1 = function (remoteSubChat) {
                        var messagesArray, lastAssistant, messageSessionId, matchingSession, createdSubChat, sessionErr_1;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    messagesArray = remoteSubChat.messages || [];
                                    lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                                    messageSessionId = (_h = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _h === void 0 ? void 0 : _h.sessionId;
                                    matchingSession = messageSessionId && claudeSessions.length > 0
                                        ? claudeSessions.find(function (s) { return s.sessionId === messageSessionId; })
                                        : undefined;
                                    createdSubChat = db.insert(schema_1.subChats)
                                        .values(__assign({ chatId: chat.id, name: remoteSubChat.name, mode: remoteSubChat.mode === "plan" ? "plan" : "agent", messages: JSON.stringify(messagesArray) }, (matchingSession && { sessionId: messageSessionId })))
                                        .returning()
                                        .get();
                                    if (!matchingSession) return [3 /*break*/, 4];
                                    _k.label = 1;
                                case 1:
                                    _k.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, writeClaudeSession(createdSubChat.id, worktreeResult.worktreePath, matchingSession)];
                                case 2:
                                    _k.sent();
                                    console.log("[sandbox-import] Wrote Claude session for subChat ".concat(createdSubChat.id, " with sessionId ").concat(messageSessionId));
                                    return [3 /*break*/, 4];
                                case 3:
                                    sessionErr_1 = _k.sent();
                                    console.error("[sandbox-import] Failed to write Claude session:", sessionErr_1);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _e = remoteChatData.subChats;
                    _j.label = 6;
                case 6:
                    if (!(_i < _e.length)) return [3 /*break*/, 9];
                    remoteSubChat = _e[_i];
                    return [5 /*yield**/, _loop_1(remoteSubChat)];
                case 7:
                    _j.sent();
                    _j.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    importedSubChats = db
                        .select()
                        .from(schema_1.subChats)
                        .where((0, drizzle_orm_1.eq)(schema_1.subChats.chatId, chat.id))
                        .all();
                    if (importedSubChats.length === 0) {
                        db.insert(schema_1.subChats)
                            .values({
                            chatId: chat.id,
                            name: "Main",
                            mode: "agent",
                            messages: "[]",
                        })
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
    }); }),
    /**
     * Get list of user's remote sandbox chats
     */
    listRemoteSandboxChats: index_1.publicProcedure
        .input(zod_1.z.object({
        teamId: zod_1.z.string(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var authManager, apiUrl, token, response;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    authManager = (0, index_2.getAuthManager)();
                    apiUrl = (0, index_2.getBaseUrl)();
                    return [4 /*yield*/, authManager.getValidToken()];
                case 1:
                    token = _c.sent();
                    if (!token) {
                        throw new Error("Not authenticated");
                    }
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/api/agents/chats?teamId=").concat(input.teamId), {
                            method: "GET",
                            headers: {
                                "X-Desktop-Token": token,
                            },
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch sandbox chats: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    }); }),
    /**
     * Clone a repository from sandbox and import the chat
     * This is for cases when user doesn't have the repo locally
     */
    cloneFromSandbox: index_1.publicProcedure
        .input(zod_1.z.object({
        sandboxId: zod_1.z.string(),
        remoteChatId: zod_1.z.string(),
        remoteSubChatId: zod_1.z.string().optional(),
        chatName: zod_1.z.string().optional(),
        targetPath: zod_1.z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, authManager, apiUrl, token, chatExportUrl, chatResponse, chatJson, remoteChatData, targetSessionId, targetSubChat, messagesArray, lastAssistant, debugUrl, debugResponse, debugData, debugErr_1, importResult, gitInfo, finalOwner, finalRepo, finalRemoteUrl, finalProvider, repoFromMeta, _c, metaOwner, metaRepo, err_1, _d, actualBranch, currentBranch, err_2, existingProject, project, chat, claudeSessions, _loop_2, _i, _e, remoteSubChat, importedSubChats;
        var _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var input = _b.input;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    console.log("[OPEN-LOCALLY] Starting clone process");
                    console.log("[OPEN-LOCALLY] Input:", {
                        sandboxId: input.sandboxId,
                        remoteChatId: input.remoteChatId,
                        remoteSubChatId: input.remoteSubChatId || "all",
                        chatName: input.chatName,
                        targetPath: input.targetPath,
                    });
                    db = (0, db_1.getDatabase)();
                    authManager = (0, index_2.getAuthManager)();
                    apiUrl = (0, index_2.getBaseUrl)();
                    console.log("[OPEN-LOCALLY] API URL: ".concat(apiUrl));
                    // Verify auth
                    console.log("[OPEN-LOCALLY] Getting auth token...");
                    return [4 /*yield*/, authManager.getValidToken()];
                case 1:
                    token = _q.sent();
                    if (!token) {
                        console.error("[OPEN-LOCALLY] No auth token available");
                        throw new Error("Not authenticated");
                    }
                    console.log("[OPEN-LOCALLY] Auth token obtained");
                    chatExportUrl = input.remoteSubChatId
                        ? "".concat(apiUrl, "/api/agents/chat/").concat(input.remoteChatId, "/export?subChatId=").concat(input.remoteSubChatId)
                        : "".concat(apiUrl, "/api/agents/chat/").concat(input.remoteChatId, "/export");
                    console.log("[OPEN-LOCALLY] Fetching chat data from: ".concat(chatExportUrl));
                    return [4 /*yield*/, fetch(chatExportUrl, {
                            method: "GET",
                            headers: {
                                "X-Desktop-Token": token,
                            },
                        })];
                case 2:
                    chatResponse = _q.sent();
                    if (!chatResponse.ok) {
                        console.error("[OPEN-LOCALLY] Failed to fetch chat data: ".concat(chatResponse.status, " ").concat(chatResponse.statusText));
                        throw new Error("Failed to fetch chat data: ".concat(chatResponse.statusText));
                    }
                    return [4 /*yield*/, chatResponse.json()];
                case 3:
                    chatJson = _q.sent();
                    console.log("[OPEN-LOCALLY] Remote chat data received:", {
                        id: chatJson.id,
                        name: chatJson.name,
                        sandboxId: chatJson.sandboxId,
                        meta: chatJson.meta,
                        subChatsCount: (_f = chatJson.subChats) === null || _f === void 0 ? void 0 : _f.length,
                    });
                    remoteChatData = remoteChatSchema.parse(chatJson);
                    console.log("[OPEN-LOCALLY] Found ".concat(remoteChatData.subChats.length, " subchat(s) to import"));
                    if (remoteChatData.subChats.length > 0) {
                        targetSubChat = remoteChatData.subChats[0];
                        messagesArray = targetSubChat.messages || [];
                        lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                        targetSessionId = (_g = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _g === void 0 ? void 0 : _g.sessionId;
                        console.log("[OPEN-LOCALLY] Target sessionId from subchat messages: ".concat(targetSessionId || "none"));
                    }
                    _q.label = 4;
                case 4:
                    _q.trys.push([4, 9, , 10]);
                    debugUrl = "".concat(apiUrl, "/api/agents/sandbox/").concat(input.sandboxId, "/export/debug");
                    console.log("[OPEN-LOCALLY] Fetching debug info from: ".concat(debugUrl));
                    return [4 /*yield*/, fetch(debugUrl, {
                            method: "GET",
                            headers: { "X-Desktop-Token": token },
                        })];
                case 5:
                    debugResponse = _q.sent();
                    if (!debugResponse.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, debugResponse.json()];
                case 6:
                    debugData = _q.sent();
                    console.log("[OPEN-LOCALLY] ========== SANDBOX DEBUG INFO ==========");
                    console.log("[OPEN-LOCALLY] Paths:", debugData.paths);
                    console.log("[OPEN-LOCALLY] Checks:", debugData.checks);
                    console.log("[OPEN-LOCALLY] Files in .claude:", (_h = debugData.files) === null || _h === void 0 ? void 0 : _h.claudeHome);
                    console.log("[OPEN-LOCALLY] Projects dirs:", (_j = debugData.files) === null || _j === void 0 ? void 0 : _j.projects);
                    console.log("[OPEN-LOCALLY] Project dir contents:", (_k = debugData.files) === null || _k === void 0 ? void 0 : _k.projectDir);
                    console.log("[OPEN-LOCALLY] Sessions index:", debugData.sessionsIndex);
                    console.log("[OPEN-LOCALLY] Session files exist:", debugData.sessionFilesExist);
                    console.log("[OPEN-LOCALLY] Errors:", debugData.errors);
                    console.log("[OPEN-LOCALLY] ========== END SANDBOX DEBUG ==========");
                    return [3 /*break*/, 8];
                case 7:
                    console.log("[OPEN-LOCALLY] Debug endpoint returned ".concat(debugResponse.status));
                    _q.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    debugErr_1 = _q.sent();
                    console.log("[OPEN-LOCALLY] Debug fetch failed:", debugErr_1);
                    return [3 /*break*/, 10];
                case 10:
                    // Create target directory
                    console.log("[OPEN-LOCALLY] Creating target directory: ".concat(input.targetPath));
                    return [4 /*yield*/, (0, promises_1.mkdir)(input.targetPath, { recursive: true })];
                case 11:
                    _q.sent();
                    console.log("[OPEN-LOCALLY] Target directory created");
                    // Initialize git repo
                    console.log("[OPEN-LOCALLY] Initializing git repo...");
                    return [4 /*yield*/, execAsync("git init", { cwd: input.targetPath })];
                case 12:
                    _q.sent();
                    console.log("[OPEN-LOCALLY] Git repo initialized");
                    // Import sandbox git state with FULL export (includes entire repo history)
                    // Pass sessionId to get only that specific session
                    console.log("[OPEN-LOCALLY] Starting sandbox import with full export, sessionId: ".concat(targetSessionId || "all"));
                    return [4 /*yield*/, (0, sandbox_import_1.importSandboxToWorktree)(input.targetPath, apiUrl, input.sandboxId, token, true, // fullExport = true for cloning
                        targetSessionId)];
                case 13:
                    importResult = _q.sent();
                    console.log("[OPEN-LOCALLY] Import result:", {
                        success: importResult.success,
                        error: importResult.error,
                        claudeSessionsCount: ((_l = importResult.claudeSessions) === null || _l === void 0 ? void 0 : _l.length) || 0,
                    });
                    if (!importResult.success) {
                        console.warn("[OPEN-LOCALLY] Git state import failed: ".concat(importResult.error));
                        // Continue anyway - we can still use the directory
                    }
                    // Get git remote info (should have been set from the bundle)
                    console.log("[OPEN-LOCALLY] Getting git remote info...");
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(input.targetPath)];
                case 14:
                    gitInfo = _q.sent();
                    console.log("[OPEN-LOCALLY] Git remote info:", gitInfo);
                    finalOwner = gitInfo.owner;
                    finalRepo = gitInfo.repo;
                    finalRemoteUrl = gitInfo.remoteUrl;
                    finalProvider = gitInfo.provider;
                    if (!(!finalOwner || !finalRepo)) return [3 /*break*/, 22];
                    repoFromMeta = (_m = remoteChatData.meta) === null || _m === void 0 ? void 0 : _m.repository;
                    if (!repoFromMeta) return [3 /*break*/, 22];
                    _c = repoFromMeta.split("/"), metaOwner = _c[0], metaRepo = _c[1];
                    if (!(metaOwner && metaRepo)) return [3 /*break*/, 22];
                    console.log("[OPEN-LOCALLY] Git remote missing, using meta.repository: ".concat(repoFromMeta));
                    finalOwner = metaOwner;
                    finalRepo = metaRepo;
                    finalProvider = "github"; // Assume GitHub for now
                    finalRemoteUrl = "https://github.com/".concat(metaOwner, "/").concat(metaRepo);
                    _q.label = 15;
                case 15:
                    _q.trys.push([15, 17, , 22]);
                    return [4 /*yield*/, execAsync("git remote add origin ".concat(finalRemoteUrl), { cwd: input.targetPath })];
                case 16:
                    _q.sent();
                    console.log("[OPEN-LOCALLY] Added origin remote: ".concat(finalRemoteUrl));
                    return [3 /*break*/, 22];
                case 17:
                    err_1 = _q.sent();
                    _q.label = 18;
                case 18:
                    _q.trys.push([18, 20, , 21]);
                    return [4 /*yield*/, execAsync("git remote set-url origin ".concat(finalRemoteUrl), { cwd: input.targetPath })];
                case 19:
                    _q.sent();
                    console.log("[OPEN-LOCALLY] Updated origin remote: ".concat(finalRemoteUrl));
                    return [3 /*break*/, 21];
                case 20:
                    _d = _q.sent();
                    console.warn("[OPEN-LOCALLY] Could not set origin remote");
                    return [3 /*break*/, 21];
                case 21: return [3 /*break*/, 22];
                case 22:
                    console.log("[OPEN-LOCALLY] Final git info: owner=\"".concat(finalOwner, "\", repo=\"").concat(finalRepo, "\""));
                    // Get the actual current branch from git
                    console.log("[OPEN-LOCALLY] Getting current branch from git...");
                    actualBranch = ((_o = remoteChatData.meta) === null || _o === void 0 ? void 0 : _o.branch) || "main";
                    _q.label = 23;
                case 23:
                    _q.trys.push([23, 25, , 26]);
                    return [4 /*yield*/, execAsync("git rev-parse --abbrev-ref HEAD", { cwd: input.targetPath })];
                case 24:
                    currentBranch = (_q.sent()).stdout;
                    actualBranch = currentBranch.trim();
                    console.log("[OPEN-LOCALLY] Actual git branch: ".concat(actualBranch));
                    return [3 /*break*/, 26];
                case 25:
                    err_2 = _q.sent();
                    console.warn("[OPEN-LOCALLY] Could not get current branch, using fallback: ".concat(actualBranch), err_2);
                    return [3 /*break*/, 26];
                case 26:
                    // Check if project already exists (from a previous failed attempt)
                    console.log("[OPEN-LOCALLY] Checking for existing project at path: ".concat(input.targetPath));
                    existingProject = db
                        .select()
                        .from(schema_1.projects)
                        .where((0, drizzle_orm_1.eq)(schema_1.projects.path, input.targetPath))
                        .get();
                    console.log("[OPEN-LOCALLY] Existing project:", existingProject ? { id: existingProject.id, name: existingProject.name } : null);
                    project = existingProject
                        ? db
                            .update(schema_1.projects)
                            .set({
                            updatedAt: new Date(),
                            gitRemoteUrl: finalRemoteUrl,
                            gitProvider: finalProvider,
                            gitOwner: finalOwner,
                            gitRepo: finalRepo,
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.projects.id, existingProject.id))
                            .returning()
                            .get()
                        : db
                            .insert(schema_1.projects)
                            .values({
                            name: (0, node_path_1.basename)(input.targetPath),
                            path: input.targetPath,
                            gitRemoteUrl: finalRemoteUrl,
                            gitProvider: finalProvider,
                            gitOwner: finalOwner,
                            gitRepo: finalRepo,
                        })
                            .returning()
                            .get();
                    console.log("[OPEN-LOCALLY] Project created/updated:", { id: project.id, name: project.name });
                    // Create chat record (using the project path directly, no separate worktree needed
                    // since this is a fresh clone)
                    console.log("[OPEN-LOCALLY] Creating chat record with branch: ".concat(actualBranch));
                    chat = db
                        .insert(schema_1.chats)
                        .values({
                        name: input.chatName || remoteChatData.name || "Imported Chat",
                        projectId: project.id,
                        worktreePath: input.targetPath,
                        branch: actualBranch,
                        baseBranch: "main",
                    })
                        .returning()
                        .get();
                    console.log("[OPEN-LOCALLY] Chat created:", { id: chat.id, name: chat.name });
                    // Import sub-chats with messages and Claude sessions
                    console.log("[OPEN-LOCALLY] Importing ".concat(remoteChatData.subChats.length, " sub-chats..."));
                    claudeSessions = importResult.claudeSessions || [];
                    console.log("[OPEN-LOCALLY] Available Claude sessions: ".concat(claudeSessions.length));
                    _loop_2 = function (remoteSubChat) {
                        var messagesArray, messagesCount, lastAssistant, messageSessionId, matchingSession, createdSubChat, sessionErr_2;
                        return __generator(this, function (_r) {
                            switch (_r.label) {
                                case 0:
                                    messagesArray = remoteSubChat.messages || [];
                                    messagesCount = Array.isArray(messagesArray) ? messagesArray.length : 0;
                                    console.log("[OPEN-LOCALLY] Importing sub-chat: ".concat(remoteSubChat.name, " (mode: ").concat(remoteSubChat.mode, ", messages: ").concat(messagesCount, ")"));
                                    console.log("[OPEN-LOCALLY] Messages preview:", JSON.stringify(messagesArray).slice(0, 500));
                                    lastAssistant = __spreadArray([], messagesArray, true).reverse().find(function (m) { return m.role === "assistant"; });
                                    messageSessionId = (_p = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _p === void 0 ? void 0 : _p.sessionId;
                                    matchingSession = messageSessionId && claudeSessions.length > 0
                                        ? claudeSessions.find(function (s) { return s.sessionId === messageSessionId; })
                                        : undefined;
                                    createdSubChat = db.insert(schema_1.subChats)
                                        .values(__assign({ chatId: chat.id, name: remoteSubChat.name, mode: remoteSubChat.mode === "plan" ? "plan" : "agent", messages: JSON.stringify(messagesArray) }, (matchingSession && { sessionId: messageSessionId })))
                                        .returning()
                                        .get();
                                    if (!matchingSession) return [3 /*break*/, 5];
                                    _r.label = 1;
                                case 1:
                                    _r.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, writeClaudeSession(createdSubChat.id, input.targetPath, matchingSession)];
                                case 2:
                                    _r.sent();
                                    console.log("[OPEN-LOCALLY] Wrote Claude session for subChat ".concat(createdSubChat.id, " with sessionId ").concat(messageSessionId));
                                    return [3 /*break*/, 4];
                                case 3:
                                    sessionErr_2 = _r.sent();
                                    console.error("[OPEN-LOCALLY] Failed to write Claude session:", sessionErr_2);
                                    return [3 /*break*/, 4];
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    if (messageSessionId) {
                                        console.log("[OPEN-LOCALLY] No matching Claude session found for sessionId: ".concat(messageSessionId.slice(0, 8), "..."));
                                    }
                                    else {
                                        console.log("[OPEN-LOCALLY] No sessionId in messages or no sessions exported");
                                    }
                                    _r.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _e = remoteChatData.subChats;
                    _q.label = 27;
                case 27:
                    if (!(_i < _e.length)) return [3 /*break*/, 30];
                    remoteSubChat = _e[_i];
                    return [5 /*yield**/, _loop_2(remoteSubChat)];
                case 28:
                    _q.sent();
                    _q.label = 29;
                case 29:
                    _i++;
                    return [3 /*break*/, 27];
                case 30:
                    importedSubChats = db
                        .select()
                        .from(schema_1.subChats)
                        .where((0, drizzle_orm_1.eq)(schema_1.subChats.chatId, chat.id))
                        .all();
                    if (importedSubChats.length === 0) {
                        console.log("[OPEN-LOCALLY] No sub-chats imported, creating default");
                        db.insert(schema_1.subChats)
                            .values({
                            chatId: chat.id,
                            name: "Main",
                            mode: "agent",
                            messages: "[]",
                        })
                            .run();
                    }
                    console.log("[OPEN-LOCALLY] Clone completed successfully!");
                    console.log("[OPEN-LOCALLY] Final result:", {
                        projectId: project.id,
                        chatId: chat.id,
                        gitImportSuccess: importResult.success,
                        gitImportError: importResult.error,
                    });
                    return [2 /*return*/, {
                            success: true,
                            projectId: project.id,
                            chatId: chat.id,
                            gitImportSuccess: importResult.success,
                            gitImportError: importResult.error,
                        }];
            }
        });
    }); }),
});
