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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.chatsRouter = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var fs = require("fs/promises");
var path = require("path");
var simple_git_1 = require("simple-git");
var zod_1 = require("zod");
var index_1 = require("../../../index");
var analytics_1 = require("../../analytics");
var db_1 = require("../../db");
var git_1 = require("../../git");
var cache_1 = require("../../git/cache");
var diff_parser_1 = require("../../git/diff-parser");
var shell_env_1 = require("../../git/shell-env");
var stash_1 = require("../../git/stash");
var ollama_1 = require("../../ollama");
var manager_1 = require("../../terminal/manager");
var index_2 = require("../index");
// Fallback to truncated user message if AI generation fails
function getFallbackName(userMessage) {
    var trimmed = userMessage.trim();
    if (trimmed.length <= 25) {
        return trimmed || "New Chat";
    }
    return trimmed.substring(0, 25) + "...";
}
/**
 * Generate text using local Ollama model
 * Used for chat title generation in offline mode
 * @param userMessage - The user message to generate a title for
 * @param model - Optional model to use (if not provided, uses recommended model)
 */
function generateChatNameWithOllama(userMessage, model) {
    return __awaiter(this, void 0, void 0, function () {
        var ollamaStatus, modelToUse, prompt_1, response, data, result, cleaned, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 1:
                    ollamaStatus = _b.sent();
                    if (!ollamaStatus.available) {
                        return [2 /*return*/, null];
                    }
                    modelToUse = model || ollamaStatus.recommendedModel || ollamaStatus.models[0];
                    if (!modelToUse) {
                        console.error("[Ollama] No model available");
                        return [2 /*return*/, null];
                    }
                    prompt_1 = "Generate a very short (2-5 words) title for a coding chat that starts with this message. Only output the title, nothing else. No quotes, no explanations.\n\nUser message: \"".concat(userMessage.slice(0, 500), "\"\n\nTitle:");
                    return [4 /*yield*/, fetch("http://localhost:11434/api/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                model: modelToUse,
                                prompt: prompt_1,
                                stream: false,
                                options: {
                                    temperature: 0.3,
                                    num_predict: 50,
                                },
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        console.error("[Ollama] Generate chat name failed:", response.status);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    result = (_a = data.response) === null || _a === void 0 ? void 0 : _a.trim();
                    if (result) {
                        cleaned = result
                            .replace(/^["']|["']$/g, "")
                            .replace(/^title:\s*/i, "")
                            .trim()
                            .slice(0, 50);
                        if (cleaned.length > 0) {
                            return [2 /*return*/, cleaned];
                        }
                    }
                    return [2 /*return*/, null];
                case 4:
                    error_1 = _b.sent();
                    console.error("[Ollama] Generate chat name error:", error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate commit message using local Ollama model
 * Used for commit message generation in offline mode
 * @param diff - The diff text
 * @param fileCount - Number of files changed
 * @param additions - Lines added
 * @param deletions - Lines deleted
 * @param model - Optional model to use (if not provided, uses recommended model)
 */
function generateCommitMessageWithOllama(diff, fileCount, additions, deletions, model) {
    return __awaiter(this, void 0, void 0, function () {
        var ollamaStatus, modelToUse, prompt_2, response, data, result, firstLine, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 1:
                    ollamaStatus = _c.sent();
                    if (!ollamaStatus.available) {
                        return [2 /*return*/, null];
                    }
                    modelToUse = model || ollamaStatus.recommendedModel || ollamaStatus.models[0];
                    if (!modelToUse) {
                        console.error("[Ollama] No model available");
                        return [2 /*return*/, null];
                    }
                    prompt_2 = "Generate a conventional commit message for these changes. Use format: type: short description\n\nTypes: feat (new feature), fix (bug fix), docs, style, refactor, test, chore\n\nChanges: ".concat(fileCount, " files, +").concat(additions, "/-").concat(deletions, " lines\n\nDiff (truncated):\n").concat(diff.slice(0, 3000), "\n\nCommit message:");
                    return [4 /*yield*/, fetch("http://localhost:11434/api/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                model: modelToUse,
                                prompt: prompt_2,
                                stream: false,
                                options: {
                                    temperature: 0.3,
                                    num_predict: 50,
                                },
                            }),
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.ok) {
                        console.error("[Ollama] Generate commit message failed:", response.status);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _c.sent();
                    result = (_a = data.response) === null || _a === void 0 ? void 0 : _a.trim();
                    if (result) {
                        firstLine = (_b = result.split("\n")[0]) === null || _b === void 0 ? void 0 : _b.trim();
                        if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
                            return [2 /*return*/, firstLine];
                        }
                    }
                    return [2 /*return*/, null];
                case 4:
                    error_2 = _c.sent();
                    console.error("[Ollama] Generate commit message error:", error_2);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.chatsRouter = (0, index_2.router)({
    /**
     * List all non-archived chats (optionally filter by project)
     */
    list: index_2.publicProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var conditions = [(0, drizzle_orm_1.isNull)(db_1.chats.archivedAt)];
        if (input.projectId) {
            conditions.push((0, drizzle_orm_1.eq)(db_1.chats.projectId, input.projectId));
        }
        return db
            .select()
            .from(db_1.chats)
            .where(drizzle_orm_1.and.apply(void 0, conditions))
            .orderBy((0, drizzle_orm_1.desc)(db_1.chats.updatedAt))
            .all();
    }),
    /**
     * List archived chats (optionally filter by project)
     */
    listArchived: index_2.publicProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string().optional() }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var conditions = [(0, drizzle_orm_1.isNotNull)(db_1.chats.archivedAt)];
        if (input.projectId) {
            conditions.push((0, drizzle_orm_1.eq)(db_1.chats.projectId, input.projectId));
        }
        return db
            .select()
            .from(db_1.chats)
            .where(drizzle_orm_1.and.apply(void 0, conditions))
            .orderBy((0, drizzle_orm_1.desc)(db_1.chats.archivedAt))
            .all();
    }),
    /**
     * Get a single chat with all sub-chats
     */
    get: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id)).get();
        if (!chat)
            return null;
        var chatSubChats = db
            .select()
            .from(db_1.subChats)
            .where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, input.id))
            .orderBy(db_1.subChats.createdAt)
            .all();
        var project = db
            .select()
            .from(db_1.projects)
            .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
            .get();
        return __assign(__assign({}, chat), { subChats: chatSubChats, project: project });
    }),
    /**
     * Create a new chat with optional git worktree
     */
    create: index_2.publicProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        initialMessage: zod_1.z.string().optional(),
        initialMessageParts: zod_1.z
            .array(zod_1.z.union([
            zod_1.z.object({ type: zod_1.z.literal("text"), text: zod_1.z.string() }),
            zod_1.z.object({
                type: zod_1.z.literal("data-image"),
                data: zod_1.z.object({
                    url: zod_1.z.string(),
                    mediaType: zod_1.z.string().optional(),
                    filename: zod_1.z.string().optional(),
                    base64Data: zod_1.z.string().optional(),
                }),
            }),
            // Hidden file content - sent to agent but not displayed in UI
            zod_1.z.object({
                type: zod_1.z.literal("file-content"),
                filePath: zod_1.z.string(),
                content: zod_1.z.string(),
            }),
        ]))
            .optional(),
        baseBranch: zod_1.z.string().optional(), // Branch to base the worktree off
        branchType: zod_1.z.enum(["local", "remote"]).optional(), // Whether baseBranch is local or remote
        useWorktree: zod_1.z.boolean().default(true), // If false, work directly in project dir
        mode: zod_1.z.enum(["plan", "agent"]).default("agent"),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, project, chat, initialMessages, subChat, worktreeResult, result, response;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[chats.create] called with:", input);
                    db = (0, db_1.getDatabase)();
                    project = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId))
                        .get();
                    console.log("[chats.create] found project:", project);
                    if (!project)
                        throw new Error("Project not found");
                    chat = db
                        .insert(db_1.chats)
                        .values({ name: input.name, projectId: input.projectId })
                        .returning()
                        .get();
                    console.log("[chats.create] created chat:", chat);
                    initialMessages = "[]";
                    if (input.initialMessageParts && input.initialMessageParts.length > 0) {
                        initialMessages = JSON.stringify([
                            {
                                id: "msg-".concat(Date.now()),
                                role: "user",
                                parts: input.initialMessageParts,
                            },
                        ]);
                    }
                    else if (input.initialMessage) {
                        initialMessages = JSON.stringify([
                            {
                                id: "msg-".concat(Date.now()),
                                role: "user",
                                parts: [{ type: "text", text: input.initialMessage }],
                            },
                        ]);
                    }
                    subChat = db
                        .insert(db_1.subChats)
                        .values({
                        chatId: chat.id,
                        mode: input.mode,
                        messages: initialMessages,
                    })
                        .returning()
                        .get();
                    console.log("[chats.create] created subChat:", subChat);
                    worktreeResult = {};
                    if (!input.useWorktree) return [3 /*break*/, 2];
                    console.log("[chats.create] creating worktree with baseBranch:", input.baseBranch, "type:", input.branchType);
                    return [4 /*yield*/, (0, git_1.createWorktreeForChat)(project.path, (0, git_1.sanitizeProjectName)(project.name), chat.id, input.baseBranch, input.branchType)];
                case 1:
                    result = _c.sent();
                    console.log("[chats.create] worktree result:", result);
                    if (result.success && result.worktreePath) {
                        db.update(db_1.chats)
                            .set({
                            worktreePath: result.worktreePath,
                            branch: result.branch,
                            baseBranch: result.baseBranch,
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                            .run();
                        worktreeResult = {
                            worktreePath: result.worktreePath,
                            branch: result.branch,
                            baseBranch: result.baseBranch,
                        };
                    }
                    else {
                        console.warn("[Worktree] Failed: ".concat(result.error));
                        // Fallback to project path
                        db.update(db_1.chats)
                            .set({ worktreePath: project.path })
                            .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                            .run();
                        worktreeResult = { worktreePath: project.path };
                    }
                    return [3 /*break*/, 3];
                case 2:
                    // Local mode: use project path directly, no branch info
                    console.log("[chats.create] local mode - using project path directly");
                    db.update(db_1.chats)
                        .set({ worktreePath: project.path })
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                        .run();
                    worktreeResult = { worktreePath: project.path };
                    _c.label = 3;
                case 3:
                    response = __assign(__assign({}, chat), { worktreePath: worktreeResult.worktreePath || project.path, branch: worktreeResult.branch, baseBranch: worktreeResult.baseBranch, subChats: [subChat] });
                    // Track workspace created
                    (0, analytics_1.trackWorkspaceCreated)({
                        id: chat.id,
                        projectId: input.projectId,
                        useWorktree: input.useWorktree,
                    });
                    console.log("[chats.create] returning:", response);
                    return [2 /*return*/, response];
            }
        });
    }); }),
    /**
     * Rename a chat
     */
    rename: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.chats)
            .set({ name: input.name, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Archive a chat (also kills any terminal processes in the workspace)
     * Optionally deletes the worktree to free disk space
     */
    archive: index_2.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        deleteWorktree: zod_1.z.boolean().default(false),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, result, project;
        var input = _b.input;
        return __generator(this, function (_c) {
            db = (0, db_1.getDatabase)();
            chat = db
                .select()
                .from(db_1.chats)
                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id))
                .get();
            result = db
                .update(db_1.chats)
                .set({ archivedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id))
                .returning()
                .get();
            // Track workspace archived
            (0, analytics_1.trackWorkspaceArchived)(input.id);
            // Kill terminal processes in background (don't await)
            manager_1.terminalManager.killByWorkspaceId(input.id).then(function (killResult) {
                if (killResult.killed > 0) {
                    console.log("[chats.archive] Killed ".concat(killResult.killed, " terminal session(s) for workspace ").concat(input.id));
                }
            }).catch(function (error) {
                console.error("[chats.archive] Error killing processes:", error);
            });
            // Optionally delete worktree in background (don't await)
            if (input.deleteWorktree && (chat === null || chat === void 0 ? void 0 : chat.worktreePath) && (chat === null || chat === void 0 ? void 0 : chat.branch)) {
                project = db
                    .select()
                    .from(db_1.projects)
                    .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
                    .get();
                if (project) {
                    (0, git_1.removeWorktree)(project.path, chat.worktreePath).then(function (worktreeResult) {
                        if (worktreeResult.success) {
                            console.log("[chats.archive] Deleted worktree for workspace ".concat(input.id));
                            // Clear worktreePath since it's deleted (keep branch for reference)
                            db.update(db_1.chats)
                                .set({ worktreePath: null })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id))
                                .run();
                        }
                        else {
                            console.warn("[chats.archive] Failed to delete worktree: ".concat(worktreeResult.error));
                        }
                    }).catch(function (error) {
                        console.error("[chats.archive] Error removing worktree:", error);
                    });
                }
            }
            // Invalidate git cache for this worktree
            if (chat === null || chat === void 0 ? void 0 : chat.worktreePath) {
                cache_1.gitCache.invalidateStatus(chat.worktreePath);
                cache_1.gitCache.invalidateParsedDiff(chat.worktreePath);
            }
            return [2 /*return*/, result];
        });
    }); }),
    /**
     * Restore an archived chat
     */
    restore: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.chats)
            .set({ archivedAt: null })
            .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Archive multiple chats at once (also kills terminal processes in each workspace)
     */
    archiveBatch: index_2.publicProcedure
        .input(zod_1.z.object({ chatIds: zod_1.z.array(zod_1.z.string()) }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        if (input.chatIds.length === 0)
            return [];
        // Archive immediately (optimistic)
        var result = db
            .update(db_1.chats)
            .set({ archivedAt: new Date() })
            .where((0, drizzle_orm_1.inArray)(db_1.chats.id, input.chatIds))
            .returning()
            .all();
        // Kill terminal processes for all workspaces in background (don't await)
        Promise.all(input.chatIds.map(function (id) { return manager_1.terminalManager.killByWorkspaceId(id); })).then(function (killResults) {
            var totalKilled = killResults.reduce(function (sum, r) { return sum + r.killed; }, 0);
            if (totalKilled > 0) {
                console.log("[chats.archiveBatch] Killed ".concat(totalKilled, " terminal session(s) for ").concat(input.chatIds.length, " workspace(s)"));
            }
        }).catch(function (error) {
            console.error("[chats.archiveBatch] Error killing processes:", error);
        });
        return result;
    }),
    /**
     * Delete a chat permanently (with worktree cleanup)
     */
    delete: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, project, result;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id)).get();
                    if (!((chat === null || chat === void 0 ? void 0 : chat.worktreePath) && (chat === null || chat === void 0 ? void 0 : chat.branch))) return [3 /*break*/, 2];
                    project = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
                        .get();
                    if (!project) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, git_1.removeWorktree)(project.path, chat.worktreePath)];
                case 1:
                    result = _c.sent();
                    if (!result.success) {
                        console.warn("[Worktree] Cleanup failed: ".concat(result.error));
                    }
                    _c.label = 2;
                case 2:
                    // Track workspace deleted
                    (0, analytics_1.trackWorkspaceDeleted)(input.id);
                    // Invalidate git cache for this worktree
                    if (chat === null || chat === void 0 ? void 0 : chat.worktreePath) {
                        cache_1.gitCache.invalidateStatus(chat.worktreePath);
                        cache_1.gitCache.invalidateParsedDiff(chat.worktreePath);
                    }
                    return [2 /*return*/, db.delete(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, input.id)).returning().get()];
            }
        });
    }); }),
    // ============ Sub-chat procedures ============
    /**
     * Get a single sub-chat
     */
    getSubChat: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var subChat = db
            .select()
            .from(db_1.subChats)
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .get();
        if (!subChat)
            return null;
        var chat = db
            .select()
            .from(db_1.chats)
            .where((0, drizzle_orm_1.eq)(db_1.chats.id, subChat.chatId))
            .get();
        var project = chat
            ? db
                .select()
                .from(db_1.projects)
                .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
                .get()
            : null;
        return __assign(__assign({}, subChat), { chat: chat ? __assign(__assign({}, chat), { project: project }) : null });
    }),
    /**
     * Create a new sub-chat
     */
    createSubChat: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        name: zod_1.z.string().optional(),
        mode: zod_1.z.enum(["plan", "agent"]).default("agent"),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .insert(db_1.subChats)
            .values({
            chatId: input.chatId,
            name: input.name,
            mode: input.mode,
            messages: "[]",
        })
            .returning()
            .get();
    }),
    /**
     * Update sub-chat messages
     */
    updateSubChatMessages: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), messages: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.subChats)
            .set({ messages: input.messages, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Rollback to a specific message by sdkMessageUuid
     * Handles both git state rollback and message truncation
     * Git rollback is done first - if it fails, the whole operation aborts
     */
    rollbackToMessage: index_2.publicProcedure
        .input(zod_1.z.object({
        subChatId: zod_1.z.string(),
        sdkMessageUuid: zod_1.z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, subChat, messages, targetIndex, chat, res, truncatedMessages;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    subChat = db
                        .select()
                        .from(db_1.subChats)
                        .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                        .get();
                    if (!subChat) {
                        return [2 /*return*/, { success: false, error: "Sub-chat not found" }];
                    }
                    messages = JSON.parse(subChat.messages || "[]");
                    targetIndex = messages.findIndex(function (m) { var _a; return ((_a = m.metadata) === null || _a === void 0 ? void 0 : _a.sdkMessageUuid) === input.sdkMessageUuid; });
                    if (targetIndex === -1) {
                        return [2 /*return*/, { success: false, error: "Message not found" }];
                    }
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, subChat.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, stash_1.applyRollbackStash)(chat.worktreePath, input.sdkMessageUuid)];
                case 1:
                    res = _c.sent();
                    if (!res) {
                        return [2 /*return*/, { success: false, error: "Git rollback failed" }];
                    }
                    _c.label = 2;
                case 2:
                    truncatedMessages = messages.slice(0, targetIndex + 1);
                    // 5.5. Clear any old shouldResume flags, then set on the target message
                    truncatedMessages = truncatedMessages.map(function (m, i) {
                        var _a = m.metadata || {}, shouldResume = _a.shouldResume, restMeta = __rest(_a, ["shouldResume"]);
                        return __assign(__assign({}, m), { metadata: __assign(__assign({}, restMeta), (i === truncatedMessages.length - 1 && { shouldResume: true })) });
                    });
                    // 6. Update the sub-chat with truncated messages
                    db.update(db_1.subChats)
                        .set({
                        messages: JSON.stringify(truncatedMessages),
                        updatedAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId))
                        .returning()
                        .get();
                    return [2 /*return*/, {
                            success: true,
                            messages: truncatedMessages,
                        }];
            }
        });
    }); }),
    /**
     * Update sub-chat session ID (for Claude resume)
     */
    updateSubChatSession: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), sessionId: zod_1.z.string().nullable() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.subChats)
            .set({ sessionId: input.sessionId })
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Update sub-chat mode
     */
    updateSubChatMode: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), mode: zod_1.z.enum(["plan", "agent"]) }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.subChats)
            .set({ mode: input.mode })
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Rename a sub-chat
     */
    renameSubChat: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.subChats)
            .set({ name: input.name })
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Delete a sub-chat
     */
    deleteSubChat: index_2.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .delete(db_1.subChats)
            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Get git diff for a chat's worktree
     */
    getDiff: index_2.publicProcedure
        .input(zod_1.z.object({ chatId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, result;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                        return [2 /*return*/, { diff: null, error: "No worktree path" }];
                    }
                    return [4 /*yield*/, (0, git_1.getWorktreeDiff)(chat.worktreePath, (_c = chat.baseBranch) !== null && _c !== void 0 ? _c : undefined)];
                case 1:
                    result = _d.sent();
                    if (!result.success) {
                        return [2 /*return*/, { diff: null, error: result.error }];
                    }
                    return [2 /*return*/, { diff: result.diff || "" }];
            }
        });
    }); }),
    /**
     * Get parsed diff with prefetched file contents
     * This endpoint does all diff parsing on the server side to avoid blocking UI
     * Uses GitCache for instant responses when diff hasn't changed
     */
    getParsedDiff: index_2.publicProcedure
        .input(zod_1.z.object({ chatId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, result, diffHash, cached, files, totalAdditions, totalDeletions, MAX_PREFETCH, MAX_FILE_SIZE, filesToFetch, fileContents, response;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                        return [2 /*return*/, {
                                files: [],
                                totalAdditions: 0,
                                totalDeletions: 0,
                                fileContents: {},
                                error: "No worktree path",
                            }];
                    }
                    return [4 /*yield*/, (0, git_1.getWorktreeDiff)(chat.worktreePath, (_c = chat.baseBranch) !== null && _c !== void 0 ? _c : undefined, { onlyUncommitted: true })];
                case 1:
                    result = _d.sent();
                    if (!result.success) {
                        return [2 /*return*/, {
                                files: [],
                                totalAdditions: 0,
                                totalDeletions: 0,
                                fileContents: {},
                                error: result.error,
                            }];
                    }
                    diffHash = (0, cache_1.computeContentHash)(result.diff || "");
                    cached = cache_1.gitCache.getParsedDiff(chat.worktreePath, diffHash);
                    if (cached) {
                        return [2 /*return*/, cached];
                    }
                    files = (0, diff_parser_1.splitUnifiedDiffByFile)(result.diff || "");
                    totalAdditions = files.reduce(function (sum, f) { return sum + f.additions; }, 0);
                    totalDeletions = files.reduce(function (sum, f) { return sum + f.deletions; }, 0);
                    MAX_PREFETCH = 20;
                    MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
                    ;
                    filesToFetch = files
                        .filter(function (f) { return !f.isBinary && !f.isDeletedFile; })
                        .slice(0, MAX_PREFETCH)
                        .map(function (f) { return ({
                        key: f.key,
                        filePath: f.newPath !== "/dev/null" ? f.newPath : f.oldPath,
                    }); })
                        .filter(function (f) { return f.filePath && f.filePath !== "/dev/null"; });
                    fileContents = {};
                    // Read files in parallel
                    return [4 /*yield*/, Promise.all(filesToFetch.map(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                            var fullPath, stats, content, checkLength, i, _c;
                            var key = _b.key, filePath = _b.filePath;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _d.trys.push([0, 3, , 4]);
                                        fullPath = path.join(chat.worktreePath, filePath);
                                        return [4 /*yield*/, fs.stat(fullPath)];
                                    case 1:
                                        stats = _d.sent();
                                        if (stats.size > MAX_FILE_SIZE) {
                                            return [2 /*return*/]; // Skip large files
                                        }
                                        return [4 /*yield*/, fs.readFile(fullPath, "utf-8")
                                            // Quick binary check (NUL bytes in first 8KB)
                                        ];
                                    case 2:
                                        content = _d.sent();
                                        checkLength = Math.min(content.length, 8192);
                                        for (i = 0; i < checkLength; i++) {
                                            if (content.charCodeAt(i) === 0) {
                                                return [2 /*return*/]; // Skip binary files
                                            }
                                        }
                                        fileContents[key] = content;
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _c = _d.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    // Read files in parallel
                    _d.sent();
                    response = {
                        files: files,
                        totalAdditions: totalAdditions,
                        totalDeletions: totalDeletions,
                        fileContents: fileContents,
                    };
                    // 6. Store in cache
                    cache_1.gitCache.setParsedDiff(chat.worktreePath, diffHash, response);
                    return [2 /*return*/, response];
            }
        });
    }); }),
    /**
     * Generate a commit message using AI based on the diff
     * @param chatId - The chat ID to get worktree path from
     * @param filePaths - Optional list of file paths to generate message for (if not provided, uses all changed files)
     * @param ollamaModel - Optional Ollama model for offline generation
     */
    generateCommitMessage: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        filePaths: zod_1.z.array(zod_1.z.string()).optional(),
        ollamaModel: zod_1.z.string().nullish(), // Optional model for offline mode
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, result, files, selectedPaths_1, filteredDiff, additions, deletions, hasInternet, ollamaMessage, apiError, authManager, token, apiUrl, response, data, error_3, fileNames, hasNewFiles, hasDeletedFiles, hasOnlyDeletions, allPaths, hasTestFiles, hasDocFiles, hasConfigFiles, prefix, uniqueFileNames, message;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                        throw new Error("No worktree path");
                    }
                    return [4 /*yield*/, (0, git_1.getWorktreeDiff)(chat.worktreePath, (_c = chat.baseBranch) !== null && _c !== void 0 ? _c : undefined)];
                case 1:
                    result = _d.sent();
                    if (!result.success || !result.diff) {
                        throw new Error("Failed to get diff");
                    }
                    files = (0, diff_parser_1.splitUnifiedDiffByFile)(result.diff);
                    // Filter to only selected files if filePaths provided
                    if (input.filePaths && input.filePaths.length > 0) {
                        selectedPaths_1 = new Set(input.filePaths);
                        files = files.filter(function (f) {
                            var filePath = f.newPath !== "/dev/null" ? f.newPath : f.oldPath;
                            // Match by exact path or by path suffix (handle different path formats)
                            return selectedPaths_1.has(filePath) ||
                                __spreadArray([], selectedPaths_1, true).some(function (sp) { return filePath.endsWith(sp) || sp.endsWith(filePath); });
                        });
                        console.log("[generateCommitMessage] Filtered ".concat(files.length, " files from ").concat(input.filePaths.length, " selected paths"));
                    }
                    if (files.length === 0) {
                        throw new Error("No changes to commit");
                    }
                    filteredDiff = files.map(function (f) { return f.diffText; }).join('\n');
                    additions = files.reduce(function (sum, f) { return sum + f.additions; }, 0);
                    deletions = files.reduce(function (sum, f) { return sum + f.deletions; }, 0);
                    return [4 /*yield*/, (0, ollama_1.checkInternetConnection)()];
                case 2:
                    hasInternet = _d.sent();
                    if (!!hasInternet) return [3 /*break*/, 4];
                    console.log("[generateCommitMessage] Offline - trying Ollama...");
                    return [4 /*yield*/, generateCommitMessageWithOllama(filteredDiff, files.length, additions, deletions, input.ollamaModel)];
                case 3:
                    ollamaMessage = _d.sent();
                    if (ollamaMessage) {
                        console.log("[generateCommitMessage] Generated via Ollama:", ollamaMessage);
                        return [2 /*return*/, { message: ollamaMessage }];
                    }
                    console.log("[generateCommitMessage] Ollama failed, using heuristic fallback");
                    return [3 /*break*/, 14];
                case 4:
                    apiError = null;
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 12, , 13]);
                    authManager = (0, index_1.getAuthManager)();
                    return [4 /*yield*/, authManager.getValidToken()
                        // Use localhost in dev, production otherwise
                    ];
                case 6:
                    token = _d.sent();
                    apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://21st.dev";
                    if (!!token) return [3 /*break*/, 7];
                    apiError = "No auth token available";
                    return [3 /*break*/, 11];
                case 7: return [4 /*yield*/, fetch("".concat(apiUrl, "/api/agents/generate-commit-message"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Desktop-Token": token,
                        },
                        body: JSON.stringify({
                            diff: filteredDiff.slice(0, 10000), // Limit diff size, use filtered diff
                            fileCount: files.length,
                            additions: additions,
                            deletions: deletions,
                        }),
                    })];
                case 8:
                    response = _d.sent();
                    if (!response.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, response.json()];
                case 9:
                    data = _d.sent();
                    if (data.message) {
                        return [2 /*return*/, { message: data.message }];
                    }
                    apiError = "API returned ok but no message in response";
                    return [3 /*break*/, 11];
                case 10:
                    apiError = "API returned ".concat(response.status);
                    _d.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_3 = _d.sent();
                    apiError = "API call failed: ".concat(error_3 instanceof Error ? error_3.message : String(error_3));
                    return [3 /*break*/, 13];
                case 13:
                    if (apiError) {
                        console.log("[generateCommitMessage] API error:", apiError);
                    }
                    _d.label = 14;
                case 14:
                    fileNames = files.map(function (f) {
                        var filePath = f.newPath !== "/dev/null" ? f.newPath : f.oldPath;
                        // Note: Git diff paths always use forward slashes
                        return path.posix.basename(filePath) || filePath;
                    });
                    hasNewFiles = files.some(function (f) { return f.oldPath === "/dev/null"; });
                    hasDeletedFiles = files.some(function (f) { return f.newPath === "/dev/null"; });
                    hasOnlyDeletions = files.every(function (f) { return f.additions === 0 && f.deletions > 0; });
                    allPaths = files.map(function (f) { return f.newPath !== "/dev/null" ? f.newPath : f.oldPath; });
                    hasTestFiles = allPaths.some(function (p) { return p.includes("test") || p.includes("spec"); });
                    hasDocFiles = allPaths.some(function (p) { return p.endsWith(".md") || p.includes("doc"); });
                    hasConfigFiles = allPaths.some(function (p) {
                        return p.includes("config") ||
                            p.endsWith(".json") ||
                            p.endsWith(".yaml") ||
                            p.endsWith(".yml") ||
                            p.endsWith(".toml");
                    });
                    prefix = "chore";
                    if (hasNewFiles && !hasDeletedFiles) {
                        prefix = "feat";
                    }
                    else if (hasOnlyDeletions) {
                        prefix = "chore";
                    }
                    else if (hasTestFiles && !hasDocFiles && !hasConfigFiles) {
                        prefix = "test";
                    }
                    else if (hasDocFiles && !hasTestFiles && !hasConfigFiles) {
                        prefix = "docs";
                    }
                    else if (allPaths.some(function (p) { return p.includes("fix") || p.includes("bug"); })) {
                        prefix = "fix";
                    }
                    else if (files.length > 0 && files.every(function (f) { return f.additions > 0 || f.deletions > 0; })) {
                        // Default to fix for modifications (most common case)
                        prefix = "fix";
                    }
                    uniqueFileNames = __spreadArray([], new Set(fileNames), true);
                    if (uniqueFileNames.length === 1) {
                        message = "".concat(prefix, ": update ").concat(uniqueFileNames[0]);
                    }
                    else if (uniqueFileNames.length <= 3) {
                        message = "".concat(prefix, ": update ").concat(uniqueFileNames.join(", "));
                    }
                    else {
                        message = "".concat(prefix, ": update ").concat(uniqueFileNames.length, " files");
                    }
                    console.log("[generateCommitMessage] Generated fallback message:", message);
                    return [2 /*return*/, { message: message }];
            }
        });
    }); }),
    /**
     * Generate a name for a sub-chat using AI
     * Uses Ollama when offline, otherwise calls web API
     */
    generateSubChatName: index_2.publicProcedure
        .input(zod_1.z.object({
        userMessage: zod_1.z.string(),
        ollamaModel: zod_1.z.string().nullish(), // Optional model for offline mode
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var hasInternet, ollamaName, authManager, token, apiUrl, response, errorText, data, error_4;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, ollama_1.checkInternetConnection)()];
                case 1:
                    hasInternet = _c.sent();
                    if (!!hasInternet) return [3 /*break*/, 3];
                    console.log("[generateSubChatName] Offline - trying Ollama...");
                    return [4 /*yield*/, generateChatNameWithOllama(input.userMessage, input.ollamaModel)];
                case 2:
                    ollamaName = _c.sent();
                    if (ollamaName) {
                        console.log("[generateSubChatName] Generated name via Ollama:", ollamaName);
                        return [2 /*return*/, { name: ollamaName }];
                    }
                    console.log("[generateSubChatName] Ollama failed, using fallback");
                    return [2 /*return*/, { name: getFallbackName(input.userMessage) }];
                case 3:
                    authManager = (0, index_1.getAuthManager)();
                    return [4 /*yield*/, authManager.getValidToken()];
                case 4:
                    token = _c.sent();
                    apiUrl = "https://21st.dev";
                    console.log("[generateSubChatName] Online - calling API with token:", token ? "present" : "missing");
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/api/agents/sub-chat/generate-name"), {
                            method: "POST",
                            headers: __assign({ "Content-Type": "application/json" }, (token && { "X-Desktop-Token": token })),
                            body: JSON.stringify({ userMessage: input.userMessage }),
                        })];
                case 5:
                    response = _c.sent();
                    console.log("[generateSubChatName] Response status:", response.status);
                    if (!!response.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, response.text()];
                case 6:
                    errorText = _c.sent();
                    console.error("[generateSubChatName] API error:", response.status, errorText);
                    return [2 /*return*/, { name: getFallbackName(input.userMessage) }];
                case 7: return [4 /*yield*/, response.json()];
                case 8:
                    data = _c.sent();
                    console.log("[generateSubChatName] Generated name:", data.name);
                    return [2 /*return*/, { name: data.name || getFallbackName(input.userMessage) }];
                case 9:
                    error_4 = _c.sent();
                    console.error("[generateSubChatName] Error:", error_4);
                    return [2 /*return*/, { name: getFallbackName(input.userMessage) }];
                case 10: return [2 /*return*/];
            }
        });
    }); }),
    // ============ PR-related procedures ============
    /**
     * Get PR context for message generation (branch info, uncommitted changes, etc.)
     */
    getPrContext: index_2.publicProcedure
        .input(zod_1.z.object({ chatId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, git, status_1, hasUpstream, tracking, _c, error_5;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                        return [2 /*return*/, null];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, , 8]);
                    git = (0, simple_git_1.default)(chat.worktreePath);
                    return [4 /*yield*/, git.status()
                        // Check if upstream exists
                    ];
                case 2:
                    status_1 = _d.sent();
                    hasUpstream = false;
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, git.raw([
                            "rev-parse",
                            "--abbrev-ref",
                            "@{upstream}",
                        ])];
                case 4:
                    tracking = _d.sent();
                    hasUpstream = !!tracking.trim();
                    return [3 /*break*/, 6];
                case 5:
                    _c = _d.sent();
                    hasUpstream = false;
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, {
                        branch: chat.branch || status_1.current || "unknown",
                        baseBranch: chat.baseBranch || "main",
                        uncommittedCount: status_1.files.length,
                        hasUpstream: hasUpstream,
                    }];
                case 7:
                    error_5 = _d.sent();
                    console.error("[getPrContext] Error:", error_5);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Update PR info after Claude creates a PR
     */
    updatePrInfo: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        prUrl: zod_1.z.string(),
        prNumber: zod_1.z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var input = _b.input;
        return __generator(this, function (_c) {
            db = (0, db_1.getDatabase)();
            result = db
                .update(db_1.chats)
                .set({
                prUrl: input.prUrl,
                prNumber: input.prNumber,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                .returning()
                .get();
            // Track PR created
            (0, analytics_1.trackPRCreated)({
                workspaceId: input.chatId,
                prNumber: input.prNumber,
            });
            return [2 /*return*/, result];
        });
    }); }),
    /**
     * Get PR status from GitHub (via gh CLI)
     */
    getPrStatus: index_2.publicProcedure
        .input(zod_1.z.object({ chatId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, git_1.fetchGitHubPRStatus)(chat.worktreePath)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    /**
     * Merge PR via gh CLI
     * First checks if PR is mergeable, returns helpful error if conflicts exist
     */
    mergePr: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        method: zod_1.z.enum(["merge", "squash", "rebase"]).default("squash"),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, prStatus, error_6, errorMsg;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath) || !(chat === null || chat === void 0 ? void 0 : chat.prNumber)) {
                        throw new Error("No PR to merge");
                    }
                    return [4 /*yield*/, (0, git_1.fetchGitHubPRStatus)(chat.worktreePath)];
                case 1:
                    prStatus = _d.sent();
                    if (((_c = prStatus === null || prStatus === void 0 ? void 0 : prStatus.pr) === null || _c === void 0 ? void 0 : _c.mergeable) === "CONFLICTING") {
                        throw new Error("MERGE_CONFLICT: This PR has merge conflicts with the base branch. " +
                            "Please sync your branch with the latest changes from main to resolve conflicts.");
                    }
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", [
                            "pr",
                            "merge",
                            String(chat.prNumber),
                            "--".concat(input.method),
                            "--delete-branch",
                        ], { cwd: chat.worktreePath })];
                case 3:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
                case 4:
                    error_6 = _d.sent();
                    console.error("[mergePr] Error:", error_6);
                    errorMsg = error_6 instanceof Error ? error_6.message : "Failed to merge PR";
                    // Check for conflict-related error messages from gh CLI
                    if (errorMsg.includes("not mergeable") ||
                        errorMsg.includes("merge conflict") ||
                        errorMsg.includes("cannot be cleanly created") ||
                        errorMsg.includes("CONFLICTING")) {
                        throw new Error("MERGE_CONFLICT: This PR has merge conflicts with the base branch. " +
                            "Please sync your branch with the latest changes from main to resolve conflicts.");
                    }
                    throw new Error(errorMsg);
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get file change stats for workspaces
     * Parses messages from specified sub-chats and aggregates Edit/Write tool calls
     * Supports two modes:
     * - openSubChatIds: query specific sub-chats (used by main sidebar)
     * - chatIds: query all sub-chats for given chats (used by archive popover)
     */
    getFileStats: index_2.publicProcedure
        .input(zod_1.z.object({
        openSubChatIds: zod_1.z.array(zod_1.z.string()).optional(),
        chatIds: zod_1.z.array(zod_1.z.string()).optional(),
    }))
        .query(function (_a) {
        var _b, _c, _d, _e;
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        // Early return if nothing to check
        if ((!input.openSubChatIds || input.openSubChatIds.length === 0) &&
            (!input.chatIds || input.chatIds.length === 0)) {
            return [];
        }
        // Query sub-chats based on input mode
        var allChats;
        if (input.chatIds && input.chatIds.length > 0) {
            // Archive mode: query all sub-chats for given chat IDs
            allChats = db
                .select({
                chatId: db_1.subChats.chatId,
                subChatId: db_1.subChats.id,
                messages: db_1.subChats.messages,
            })
                .from(db_1.subChats)
                .where((0, drizzle_orm_1.inArray)(db_1.subChats.chatId, input.chatIds))
                .all();
        }
        else {
            // Main sidebar mode: query specific sub-chats
            allChats = db
                .select({
                chatId: db_1.subChats.chatId,
                subChatId: db_1.subChats.id,
                messages: db_1.subChats.messages,
            })
                .from(db_1.subChats)
                .where((0, drizzle_orm_1.inArray)(db_1.subChats.id, input.openSubChatIds))
                .all();
        }
        // Aggregate stats per workspace (chatId)
        var statsMap = new Map();
        for (var _i = 0, allChats_1 = allChats; _i < allChats_1.length; _i++) {
            var row = allChats_1[_i];
            if (!row.messages || !row.chatId)
                continue;
            var chatId = row.chatId; // TypeScript narrowing
            try {
                var messages = JSON.parse(row.messages);
                // Track file states for this sub-chat
                var fileStates = new Map();
                for (var _f = 0, messages_1 = messages; _f < messages_1.length; _f++) {
                    var msg = messages_1[_f];
                    if (msg.role !== "assistant")
                        continue;
                    for (var _g = 0, _h = msg.parts || []; _g < _h.length; _g++) {
                        var part = _h[_g];
                        if (part.type === "tool-Edit" || part.type === "tool-Write") {
                            var filePath = (_b = part.input) === null || _b === void 0 ? void 0 : _b.file_path;
                            if (!filePath)
                                continue;
                            // Skip session files
                            if (filePath.includes("claude-sessions") ||
                                filePath.includes("Application Support"))
                                continue;
                            var oldString = ((_c = part.input) === null || _c === void 0 ? void 0 : _c.old_string) || "";
                            var newString = ((_d = part.input) === null || _d === void 0 ? void 0 : _d.new_string) || ((_e = part.input) === null || _e === void 0 ? void 0 : _e.content) || "";
                            var existing_1 = fileStates.get(filePath);
                            if (existing_1) {
                                existing_1.currentContent = newString;
                            }
                            else {
                                fileStates.set(filePath, {
                                    originalContent: part.type === "tool-Write" ? null : oldString,
                                    currentContent: newString,
                                });
                            }
                        }
                    }
                }
                // Calculate stats for this sub-chat and add to workspace total
                var subChatAdditions = 0;
                var subChatDeletions = 0;
                var subChatFileCount = 0;
                for (var _j = 0, fileStates_1 = fileStates; _j < fileStates_1.length; _j++) {
                    var _k = fileStates_1[_j], state = _k[1];
                    var original = state.originalContent || "";
                    if (original === state.currentContent)
                        continue;
                    var oldLines = original ? original.split("\n").length : 0;
                    var newLines = state.currentContent
                        ? state.currentContent.split("\n").length
                        : 0;
                    if (!original) {
                        // New file
                        subChatAdditions += newLines;
                    }
                    else {
                        subChatAdditions += newLines;
                        subChatDeletions += oldLines;
                    }
                    subChatFileCount += 1;
                }
                // Add to workspace total
                var existing = statsMap.get(chatId) || {
                    additions: 0,
                    deletions: 0,
                    fileCount: 0,
                };
                existing.additions += subChatAdditions;
                existing.deletions += subChatDeletions;
                existing.fileCount += subChatFileCount;
                statsMap.set(chatId, existing);
            }
            catch (_l) {
                // Skip invalid JSON
            }
        }
        // Convert to array for easier consumption
        return Array.from(statsMap.entries()).map(function (_a) {
            var chatId = _a[0], stats = _a[1];
            return (__assign({ chatId: chatId }, stats));
        });
    }),
    /**
     * Get sub-chats with pending plan approvals
     * Uses mode field as source of truth: mode="plan" + completed ExitPlanMode = pending approval
     * Logic must match active-chat.tsx hasUnapprovedPlan
     * REQUIRES openSubChatIds to avoid loading all sub-chats (performance optimization)
     */
    getPendingPlanApprovals: index_2.publicProcedure
        .input(zod_1.z.object({ openSubChatIds: zod_1.z.array(zod_1.z.string()) }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        // Early return if no sub-chats to check
        if (input.openSubChatIds.length === 0) {
            return [];
        }
        // Query only the specified sub-chats, including mode for filtering
        var allSubChats = db
            .select({
            chatId: db_1.subChats.chatId,
            subChatId: db_1.subChats.id,
            mode: db_1.subChats.mode,
            messages: db_1.subChats.messages,
        })
            .from(db_1.subChats)
            .where((0, drizzle_orm_1.inArray)(db_1.subChats.id, input.openSubChatIds))
            .all();
        var pendingApprovals = [];
        var _loop_1 = function (row) {
            if (!row.subChatId || !row.chatId)
                return "continue";
            // If mode is "agent", plan is already approved - skip
            if (row.mode === "agent")
                return "continue";
            // Only check for ExitPlanMode in plan mode sub-chats
            if (!row.messages)
                return "continue";
            try {
                var messages_2 = JSON.parse(row.messages);
                // Check if there's a completed ExitPlanMode in messages
                var hasCompletedExitPlanMode = function () {
                    for (var i = messages_2.length - 1; i >= 0; i--) {
                        var msg = messages_2[i];
                        if (!msg)
                            continue;
                        // If assistant message with completed ExitPlanMode, we found an unapproved plan
                        if (msg.role === "assistant" && msg.parts) {
                            var exitPlanPart = msg.parts.find(function (p) { return p.type === "tool-ExitPlanMode"; });
                            // Check if ExitPlanMode is completed (has output, even if empty)
                            if (exitPlanPart && exitPlanPart.output !== undefined) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                if (hasCompletedExitPlanMode()) {
                    pendingApprovals.push({
                        subChatId: row.subChatId,
                        chatId: row.chatId,
                    });
                }
            }
            catch (_b) {
                // Skip invalid JSON
            }
        };
        for (var _i = 0, allSubChats_1 = allSubChats; _i < allSubChats_1.length; _i++) {
            var row = allSubChats_1[_i];
            _loop_1(row);
        }
        return pendingApprovals;
    }),
    /**
     * Get worktree status for archive dialog
     * Returns whether workspace has a worktree and uncommitted changes count
     */
    getWorktreeStatus: index_2.publicProcedure
        .input(zod_1.z.object({ chatId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, git, status_2, error_7;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    chat = db
                        .select()
                        .from(db_1.chats)
                        .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                        .get();
                    // No worktree if no branch (local mode)
                    if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath) || !(chat === null || chat === void 0 ? void 0 : chat.branch)) {
                        return [2 /*return*/, { hasWorktree: false, uncommittedCount: 0 }];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    git = (0, simple_git_1.default)(chat.worktreePath);
                    return [4 /*yield*/, git.status()];
                case 2:
                    status_2 = _c.sent();
                    return [2 /*return*/, {
                            hasWorktree: true,
                            uncommittedCount: status_2.files.length,
                        }];
                case 3:
                    error_7 = _c.sent();
                    // Worktree path doesn't exist or git error
                    console.warn("[getWorktreeStatus] Error checking worktree:", error_7);
                    return [2 /*return*/, { hasWorktree: false, uncommittedCount: 0 }];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Export a chat conversation to various formats.
     * Supports exporting entire workspace or a single sub-chat.
     * Useful for sharing, backup, or importing into other tools.
     */
    exportChat: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        subChatId: zod_1.z.string().optional(), // If provided, export only this sub-chat
        format: zod_1.z.enum(["json", "markdown", "text"]).default("markdown"),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, chat, project, chatSubChats, singleSubChat, allMessages, _i, chatSubChats_1, subChat, messages, sanitizeFilename, exportName, safeFilename, text, _c, allMessages_1, subChatData, _d, _e, msg, role, _f, _g, part, markdown, _h, allMessages_2, subChatData, _j, _k, msg, role, _l, _m, part, toolName;
        var _o, _p, _q, _r, _s, _t;
        var input = _b.input;
        return __generator(this, function (_u) {
            db = (0, db_1.getDatabase)();
            chat = db
                .select()
                .from(db_1.chats)
                .where((0, drizzle_orm_1.eq)(db_1.chats.id, input.chatId))
                .get();
            if (!chat) {
                throw new Error("Chat not found");
            }
            project = db
                .select()
                .from(db_1.projects)
                .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
                .get();
            if (input.subChatId) {
                singleSubChat = db
                    .select()
                    .from(db_1.subChats)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId), (0, drizzle_orm_1.eq)(db_1.subChats.chatId, input.chatId) // Ensure sub-chat belongs to this chat
                ))
                    .get();
                if (!singleSubChat) {
                    throw new Error("Sub-chat not found");
                }
                chatSubChats = [singleSubChat];
            }
            else {
                // Export all sub-chats
                chatSubChats = db
                    .select()
                    .from(db_1.subChats)
                    .where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, input.chatId))
                    .orderBy(db_1.subChats.createdAt)
                    .all();
            }
            allMessages = [];
            for (_i = 0, chatSubChats_1 = chatSubChats; _i < chatSubChats_1.length; _i++) {
                subChat = chatSubChats_1[_i];
                try {
                    messages = JSON.parse(subChat.messages || "[]");
                    allMessages.push({
                        subChatId: subChat.id,
                        subChatName: subChat.name,
                        messages: messages,
                    });
                }
                catch (_v) {
                    // skip invalid json
                }
            }
            sanitizeFilename = function (name) {
                return name
                    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // Invalid chars
                    .replace(/\s+/g, "_") // Replace spaces with underscores
                    .replace(/_+/g, "_") // Collapse multiple underscores
                    .replace(/^_|_$/g, "") // Trim underscores from ends
                    .slice(0, 100) // Limit length
                    || "chat"; // Fallback if empty
            };
            exportName = input.subChatId && ((_o = chatSubChats[0]) === null || _o === void 0 ? void 0 : _o.name)
                ? "".concat(chat.name || "chat", "-").concat(chatSubChats[0].name)
                : (chat.name || "chat");
            safeFilename = sanitizeFilename(exportName);
            if (input.format === "json") {
                return [2 /*return*/, {
                        format: "json",
                        content: JSON.stringify({
                            exportedAt: new Date().toISOString(),
                            chat: {
                                id: chat.id,
                                name: chat.name,
                                createdAt: chat.createdAt,
                                branch: chat.branch,
                                baseBranch: chat.baseBranch,
                                prUrl: chat.prUrl,
                            },
                            project: project
                                ? {
                                    id: project.id,
                                    name: project.name,
                                    path: project.path,
                                }
                                : null,
                            conversations: allMessages,
                        }, null, 2),
                        filename: "".concat(safeFilename, "-").concat(chat.id.slice(0, 8), ".json"),
                    }];
            }
            if (input.format === "text") {
                text = "# ".concat(chat.name || "Untitled Chat", "\n");
                text += "exported: ".concat(new Date().toISOString(), "\n");
                if (project) {
                    text += "project: ".concat(project.name, "\n");
                }
                text += "\n---\n\n";
                for (_c = 0, allMessages_1 = allMessages; _c < allMessages_1.length; _c++) {
                    subChatData = allMessages_1[_c];
                    if (subChatData.subChatName) {
                        text += "## ".concat(subChatData.subChatName, "\n\n");
                    }
                    for (_d = 0, _e = subChatData.messages; _d < _e.length; _d++) {
                        msg = _e[_d];
                        role = msg.role === "user" ? "You" : "Assistant";
                        text += "".concat(role, ":\n");
                        for (_f = 0, _g = msg.parts || []; _f < _g.length; _f++) {
                            part = _g[_f];
                            if (part.type === "text" && part.text) {
                                text += "".concat(part.text, "\n");
                            }
                            else if (((_p = part.type) === null || _p === void 0 ? void 0 : _p.startsWith("tool-")) && part.toolName) {
                                text += "[used ".concat(part.toolName, " tool]\n");
                            }
                        }
                        text += "\n";
                    }
                }
                return [2 /*return*/, {
                        format: "text",
                        content: text,
                        filename: "".concat(safeFilename, "-").concat(chat.id.slice(0, 8), ".txt"),
                    }];
            }
            markdown = "# ".concat(chat.name || "Untitled Chat", "\n\n");
            markdown += "**Exported:** ".concat(new Date().toISOString(), "\n\n");
            if (project) {
                markdown += "**Project:** ".concat(project.name, "\n\n");
            }
            if (chat.branch) {
                markdown += "**Branch:** `".concat(chat.branch, "`\n\n");
            }
            if (chat.prUrl) {
                markdown += "**PR:** [".concat(chat.prUrl, "](").concat(chat.prUrl, ")\n\n");
            }
            markdown += "---\n\n";
            for (_h = 0, allMessages_2 = allMessages; _h < allMessages_2.length; _h++) {
                subChatData = allMessages_2[_h];
                if (subChatData.subChatName) {
                    markdown += "## ".concat(subChatData.subChatName, "\n\n");
                }
                for (_j = 0, _k = subChatData.messages; _j < _k.length; _j++) {
                    msg = _k[_j];
                    role = msg.role === "user" ? "**You**" : "**Assistant**";
                    markdown += "### ".concat(role, "\n\n");
                    for (_l = 0, _m = msg.parts || []; _l < _m.length; _l++) {
                        part = _m[_l];
                        if (part.type === "text" && part.text) {
                            markdown += "".concat(part.text, "\n\n");
                        }
                        else if (((_q = part.type) === null || _q === void 0 ? void 0 : _q.startsWith("tool-")) && part.toolName) {
                            toolName = part.toolName;
                            if (toolName === "Bash" && ((_r = part.input) === null || _r === void 0 ? void 0 : _r.command)) {
                                markdown += "```bash\n".concat(part.input.command, "\n```\n\n");
                            }
                            else if ((toolName === "Edit" || toolName === "Write") &&
                                ((_s = part.input) === null || _s === void 0 ? void 0 : _s.file_path)) {
                                markdown += "> Modified: `".concat(part.input.file_path, "`\n\n");
                            }
                            else if (toolName === "Read" && ((_t = part.input) === null || _t === void 0 ? void 0 : _t.file_path)) {
                                markdown += "> Read: `".concat(part.input.file_path, "`\n\n");
                            }
                            else {
                                markdown += "> *Used ".concat(toolName, " tool*\n\n");
                            }
                        }
                    }
                }
            }
            return [2 /*return*/, {
                    format: "markdown",
                    content: markdown,
                    filename: "".concat(safeFilename, "-").concat(chat.id.slice(0, 8), ".md"),
                }];
        });
    }); }),
    /**
     * Get basic stats for a chat (message count, tool usage, etc.)
     * Supports both full chat stats and individual sub-chat stats.
     * Useful for showing chat summary in sidebar or export dialogs.
     */
    getChatStats: index_2.publicProcedure
        .input(zod_1.z.object({
        chatId: zod_1.z.string(),
        subChatId: zod_1.z.string().optional(), // If provided, return stats for only this sub-chat
    }))
        .query(function (_a) {
        var _b, _c;
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        var chatSubChats;
        if (input.subChatId) {
            // Get stats for a single sub-chat
            var singleSubChat = db
                .select()
                .from(db_1.subChats)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subChats.id, input.subChatId), (0, drizzle_orm_1.eq)(db_1.subChats.chatId, input.chatId)))
                .get();
            chatSubChats = singleSubChat ? [singleSubChat] : [];
        }
        else {
            // Get stats for all sub-chats
            chatSubChats = db
                .select()
                .from(db_1.subChats)
                .where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, input.chatId))
                .all();
        }
        var messageCount = 0;
        var userMessageCount = 0;
        var assistantMessageCount = 0;
        var toolCalls = 0;
        var toolUsage = {};
        var totalInputTokens = 0;
        var totalOutputTokens = 0;
        for (var _i = 0, chatSubChats_2 = chatSubChats; _i < chatSubChats_2.length; _i++) {
            var subChat = chatSubChats_2[_i];
            try {
                var messages = JSON.parse(subChat.messages || "[]");
                for (var _d = 0, messages_3 = messages; _d < messages_3.length; _d++) {
                    var msg = messages_3[_d];
                    messageCount++;
                    if (msg.role === "user") {
                        userMessageCount++;
                    }
                    else if (msg.role === "assistant") {
                        assistantMessageCount++;
                        // count tool calls
                        for (var _e = 0, _f = msg.parts || []; _e < _f.length; _e++) {
                            var part = _f[_e];
                            if (((_b = part.type) === null || _b === void 0 ? void 0 : _b.startsWith("tool-")) && part.toolName) {
                                toolCalls++;
                                toolUsage[part.toolName] = (toolUsage[part.toolName] || 0) + 1;
                            }
                        }
                        // aggregate token usage
                        if ((_c = msg.metadata) === null || _c === void 0 ? void 0 : _c.usage) {
                            totalInputTokens += msg.metadata.usage.inputTokens || 0;
                            totalOutputTokens += msg.metadata.usage.outputTokens || 0;
                        }
                    }
                }
            }
            catch (_g) {
                // skip invalid json
            }
        }
        return {
            messageCount: messageCount,
            userMessageCount: userMessageCount,
            assistantMessageCount: assistantMessageCount,
            toolCalls: toolCalls,
            toolUsage: toolUsage,
            totalInputTokens: totalInputTokens,
            totalOutputTokens: totalOutputTokens,
            subChatCount: chatSubChats.length,
        };
    }),
});
