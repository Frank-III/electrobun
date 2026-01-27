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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatsHandlers = createChatsHandlers;
var promises_1 = require("fs/promises");
var drizzle_orm_1 = require("drizzle-orm");
var path_1 = require("path");
var db_1 = require("./db");
var git_diff_1 = require("./git-diff");
var git_worktree_1 = require("./git-worktree");
var github_1 = require("./github");
var git_stash_1 = require("./git-stash");
var shell_env_1 = require("./shell-env");
function getFallbackName(userMessage) {
    var trimmed = userMessage.trim();
    if (trimmed.length <= 25) {
        return trimmed || "New Chat";
    }
    return trimmed.substring(0, 25) + "...";
}
function createChatsHandlers() {
    var _this = this;
    return {
        chatsList: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, conditions;
            var projectId = _b.projectId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        conditions = [(0, drizzle_orm_1.isNull)(db_1.chats.archivedAt)];
                        if (projectId) {
                            conditions.push((0, drizzle_orm_1.eq)(db_1.chats.projectId, projectId));
                        }
                        return [2 /*return*/, db
                                .select()
                                .from(db_1.chats)
                                .where(drizzle_orm_1.and.apply(void 0, conditions))
                                .orderBy((0, drizzle_orm_1.desc)(db_1.chats.updatedAt))
                                .all()];
                }
            });
        }); },
        chatsListArchived: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, conditions;
            var projectId = _b.projectId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        conditions = [(0, drizzle_orm_1.isNotNull)(db_1.chats.archivedAt)];
                        if (projectId) {
                            conditions.push((0, drizzle_orm_1.eq)(db_1.chats.projectId, projectId));
                        }
                        return [2 /*return*/, db
                                .select()
                                .from(db_1.chats)
                                .where(drizzle_orm_1.and.apply(void 0, conditions))
                                .orderBy((0, drizzle_orm_1.desc)(db_1.chats.archivedAt))
                                .all()];
                }
            });
        }); },
        chatsGet: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, chatSubChats, project;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, id)).get();
                        if (!chat)
                            return [2 /*return*/, null];
                        chatSubChats = db
                            .select()
                            .from(db_1.subChats)
                            .where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, id))
                            .orderBy(db_1.subChats.createdAt)
                            .all();
                        project = db
                            .select()
                            .from(db_1.projects)
                            .where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId))
                            .get();
                        return [2 /*return*/, __assign(__assign({}, chat), { subChats: chatSubChats, project: project })];
                }
            });
        }); },
        chatsCreate: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, project, chat, initialMessages, subChat, worktreePath, worktreeBranch, worktreeBaseBranch, result;
            var _c, _d;
            var projectId = _b.projectId, name = _b.name, initialMessage = _b.initialMessage, initialMessageParts = _b.initialMessageParts, _e = _b.mode, mode = _e === void 0 ? "agent" : _e, _f = _b.useWorktree, useWorktree = _f === void 0 ? true : _f, baseBranch = _b.baseBranch, branchType = _b.branchType;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _g.sent();
                        project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, projectId)).get();
                        if (!project)
                            throw new Error("Project not found");
                        chat = db
                            .insert(db_1.chats)
                            .values({ name: name, projectId: projectId })
                            .returning()
                            .get();
                        initialMessages = "[]";
                        if (initialMessageParts && initialMessageParts.length > 0) {
                            initialMessages = JSON.stringify([
                                {
                                    id: "msg-".concat(Date.now()),
                                    role: "user",
                                    parts: initialMessageParts,
                                },
                            ]);
                        }
                        else if (initialMessage) {
                            initialMessages = JSON.stringify([
                                {
                                    id: "msg-".concat(Date.now()),
                                    role: "user",
                                    parts: [{ type: "text", text: initialMessage }],
                                },
                            ]);
                        }
                        subChat = db
                            .insert(db_1.subChats)
                            .values({
                            chatId: chat.id,
                            mode: mode,
                            messages: initialMessages,
                        })
                            .returning()
                            .get();
                        worktreePath = project.path;
                        worktreeBranch = null;
                        worktreeBaseBranch = null;
                        if (!useWorktree) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, git_worktree_1.createWorktreeForChat)(project.path, (0, git_worktree_1.sanitizeProjectName)(project.name), chat.id, baseBranch, branchType)];
                    case 2:
                        result = _g.sent();
                        if (result.success && result.worktreePath) {
                            worktreePath = result.worktreePath;
                            worktreeBranch = (_c = result.branch) !== null && _c !== void 0 ? _c : null;
                            worktreeBaseBranch = (_d = result.baseBranch) !== null && _d !== void 0 ? _d : null;
                            db.update(db_1.chats)
                                .set({
                                worktreePath: worktreePath,
                                branch: worktreeBranch,
                                baseBranch: worktreeBaseBranch,
                            })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                                .run();
                        }
                        else {
                            db.update(db_1.chats)
                                .set({ worktreePath: project.path })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                                .run();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        db.update(db_1.chats)
                            .set({ worktreePath: project.path })
                            .where((0, drizzle_orm_1.eq)(db_1.chats.id, chat.id))
                            .run();
                        _g.label = 4;
                    case 4: return [2 /*return*/, __assign(__assign({}, chat), { worktreePath: worktreePath, branch: worktreeBranch, baseBranch: worktreeBaseBranch, subChats: [subChat] })];
                }
            });
        }); },
        chatsRename: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, name = _b.name;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.chats)
                                .set({ name: name, updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsArchive: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, result, project;
            var id = _b.id, deleteWorktree = _b.deleteWorktree;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, id)).get();
                        result = db
                            .update(db_1.chats)
                            .set({ archivedAt: new Date() })
                            .where((0, drizzle_orm_1.eq)(db_1.chats.id, id))
                            .returning()
                            .get();
                        if (deleteWorktree && chat && chat.worktreePath && chat.branch) {
                            project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId)).get();
                            if (project) {
                                (0, git_worktree_1.removeWorktree)(project.path, chat.worktreePath)
                                    .then(function (worktreeResult) {
                                    if (worktreeResult.success) {
                                        db.update(db_1.chats)
                                            .set({ worktreePath: null })
                                            .where((0, drizzle_orm_1.eq)(db_1.chats.id, id))
                                            .run();
                                    }
                                })
                                    .catch(function () { });
                            }
                        }
                        return [2 /*return*/, result];
                }
            });
        }); },
        chatsArchiveBatch: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var chatIds = _b.chatIds;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        if (chatIds.length === 0)
                            return [2 /*return*/, []];
                        return [2 /*return*/, db
                                .update(db_1.chats)
                                .set({ archivedAt: new Date() })
                                .where((0, drizzle_orm_1.inArray)(db_1.chats.id, chatIds))
                                .returning()
                                .all()];
                }
            });
        }); },
        chatsRestore: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.chats)
                                .set({ archivedAt: null })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsDelete: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, project;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, id)).get();
                        if (!((chat === null || chat === void 0 ? void 0 : chat.worktreePath) && chat.branch)) return [3 /*break*/, 3];
                        project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId)).get();
                        if (!project) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, git_worktree_1.removeWorktree)(project.path, chat.worktreePath)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/, db.delete(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, id)).returning().get()];
                }
            });
        }); },
        chatsGetSubChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, subChat, chat, project;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        subChat = db.select().from(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.id, id)).get();
                        if (!subChat)
                            return [2 /*return*/, null];
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, subChat.chatId)).get();
                        project = chat
                            ? db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId)).get()
                            : null;
                        return [2 /*return*/, __assign(__assign({}, subChat), { chat: chat ? __assign(__assign({}, chat), { project: project }) : null })];
                }
            });
        }); },
        chatsCreateSubChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var chatId = _b.chatId, name = _b.name, _c = _b.mode, mode = _c === void 0 ? "agent" : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _d.sent();
                        return [2 /*return*/, db
                                .insert(db_1.subChats)
                                .values({ chatId: chatId, name: name, mode: mode, messages: "[]" })
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsUpdateSubChatMessages: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, messages = _b.messages;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.subChats)
                                .set({ messages: messages, updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsUpdateSubChatSession: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, sessionId = _b.sessionId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.subChats)
                                .set({ sessionId: sessionId })
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsUpdateSubChatMode: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, mode = _b.mode;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.subChats)
                                .set({ mode: mode })
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsRenameSubChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, name = _b.name;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.subChats)
                                .set({ name: name })
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsDeleteSubChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db.delete(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.id, id)).returning().get()];
                }
            });
        }); },
        chatsGenerateSubChatName: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userMessage = _b.userMessage;
            return __generator(this, function (_c) {
                return [2 /*return*/, { name: getFallbackName(userMessage) }];
            });
        }); },
        chatsGenerateCommitMessage: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var fallback;
            var chatId = _b.chatId, filePaths = _b.filePaths;
            return __generator(this, function (_c) {
                fallback = "chore: update ".concat((filePaths === null || filePaths === void 0 ? void 0 : filePaths.length) ? filePaths.length + " files" : "workspace");
                return [2 /*return*/, { message: fallback }];
            });
        }); },
        chatsGetDiff: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, result;
            var _c;
            var chatId = _b.chatId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _d.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                            return [2 /*return*/, { diff: null, error: "No worktree path" }];
                        }
                        return [4 /*yield*/, (0, git_worktree_1.getWorktreeDiff)(chat.worktreePath, (_c = chat.baseBranch) !== null && _c !== void 0 ? _c : undefined)];
                    case 2:
                        result = _d.sent();
                        if (!result.success) {
                            return [2 /*return*/, { diff: null, error: result.error }];
                        }
                        return [2 /*return*/, { diff: result.diff || "" }];
                }
            });
        }); },
        chatsGetParsedDiff: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, result, diffText, files, totalAdditions, totalDeletions, MAX_PREFETCH, MAX_FILE_SIZE, filesToFetch, fileContents;
            var _this = this;
            var _c;
            var chatId = _b.chatId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _d.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                            return [2 /*return*/, {
                                    files: [],
                                    totalAdditions: 0,
                                    totalDeletions: 0,
                                    fileContents: {},
                                    error: "No worktree path",
                                }];
                        }
                        return [4 /*yield*/, (0, git_worktree_1.getWorktreeDiff)(chat.worktreePath, (_c = chat.baseBranch) !== null && _c !== void 0 ? _c : undefined, {
                                onlyUncommitted: true,
                            })];
                    case 2:
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
                        diffText = result.diff || "";
                        files = (0, git_diff_1.splitUnifiedDiffByFile)(diffText);
                        totalAdditions = files.reduce(function (sum, file) { return sum + file.additions; }, 0);
                        totalDeletions = files.reduce(function (sum, file) { return sum + file.deletions; }, 0);
                        MAX_PREFETCH = 20;
                        MAX_FILE_SIZE = 2 * 1024 * 1024;
                        filesToFetch = files
                            .filter(function (file) { return !file.isBinary && !file.isDeletedFile; })
                            .slice(0, MAX_PREFETCH)
                            .map(function (file) { return ({
                            key: file.key,
                            filePath: file.newPath !== "/dev/null" ? file.newPath : file.oldPath,
                        }); })
                            .filter(function (file) { return file.filePath && file.filePath !== "/dev/null"; });
                        fileContents = {};
                        return [4 /*yield*/, Promise.all(filesToFetch.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var fullPath, stats, file, buffer, view, checkLength, i, _c;
                                var key = _b.key, filePath = _b.filePath;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _d.trys.push([0, 3, , 4]);
                                            fullPath = (0, path_1.join)(chat.worktreePath, filePath);
                                            return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                                        case 1:
                                            stats = _d.sent();
                                            if (stats.size > MAX_FILE_SIZE)
                                                return [2 /*return*/];
                                            file = Bun.file(fullPath);
                                            return [4 /*yield*/, file.arrayBuffer()];
                                        case 2:
                                            buffer = _d.sent();
                                            view = new Uint8Array(buffer);
                                            checkLength = Math.min(view.length, 8192);
                                            for (i = 0; i < checkLength; i += 1) {
                                                if (view[i] === 0)
                                                    return [2 /*return*/];
                                            }
                                            fileContents[key] = new TextDecoder().decode(view);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _c = _d.sent();
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        _d.sent();
                        return [2 /*return*/, {
                                files: files,
                                totalAdditions: totalAdditions,
                                totalDeletions: totalDeletions,
                                fileContents: fileContents,
                            }];
                }
            });
        }); },
        chatsGetPrContext: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, status_1, currentBranch, _c, baseBranch, _d, upstream, _e;
            var _f;
            var chatId = _b.chatId;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _g.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                            return [2 /*return*/, null];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 9, , 10]);
                        return [4 /*yield*/, (0, git_worktree_1.getWorktreeStatus)(chat.worktreePath)];
                    case 3:
                        status_1 = _g.sent();
                        _c = chat.branch;
                        if (_c) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, git_worktree_1.getCurrentBranch)(chat.worktreePath)];
                    case 4:
                        _c = (_g.sent());
                        _g.label = 5;
                    case 5:
                        currentBranch = _c;
                        _d = chat.baseBranch;
                        if (_d) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, git_worktree_1.getDefaultBranch)(chat.worktreePath)];
                    case 6:
                        _d = (_g.sent());
                        _g.label = 7;
                    case 7:
                        baseBranch = _d;
                        return [4 /*yield*/, (0, git_worktree_1.hasUpstream)(chat.worktreePath)];
                    case 8:
                        upstream = _g.sent();
                        return [2 /*return*/, {
                                branch: currentBranch || "unknown",
                                baseBranch: baseBranch || "main",
                                uncommittedCount: (_f = status_1 === null || status_1 === void 0 ? void 0 : status_1.uncommittedCount) !== null && _f !== void 0 ? _f : 0,
                                hasUpstream: upstream,
                            }];
                    case 9:
                        _e = _g.sent();
                        return [2 /*return*/, null];
                    case 10: return [2 /*return*/];
                }
            });
        }); },
        chatsUpdatePrInfo: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var chatId = _b.chatId, prUrl = _b.prUrl, prNumber = _b.prNumber;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.chats)
                                .set({ prUrl: prUrl, prNumber: prNumber, updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId))
                                .returning()
                                .get()];
                }
            });
        }); },
        chatsGetPrStatus: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat;
            var chatId = _b.chatId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, (0, github_1.fetchGitHubPRStatus)(chat.worktreePath)];
                    case 2: return [2 /*return*/, _c.sent()];
                }
            });
        }); },
        chatsMergePr: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, prStatus, result, errorMsg, lower, error_1;
            var _c;
            var chatId = _b.chatId, method = _b.method;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _d.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath) || !(chat === null || chat === void 0 ? void 0 : chat.prNumber)) {
                            return [2 /*return*/, { success: false, error: "No PR to merge" }];
                        }
                        return [4 /*yield*/, (0, github_1.fetchGitHubPRStatus)(chat.worktreePath)];
                    case 2:
                        prStatus = _d.sent();
                        if (((_c = prStatus === null || prStatus === void 0 ? void 0 : prStatus.pr) === null || _c === void 0 ? void 0 : _c.mergeable) === "CONFLICTING") {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "MERGE_CONFLICT: This PR has merge conflicts with the base branch. Please sync your branch with the latest changes from main to resolve conflicts.",
                                }];
                        }
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, shell_env_1.execWithShellEnv)("gh", [
                                "pr",
                                "merge",
                                String(chat.prNumber),
                                "--".concat(method || "squash"),
                                "--delete-branch",
                            ], { cwd: chat.worktreePath })];
                    case 4:
                        result = _d.sent();
                        if (result.code !== 0) {
                            errorMsg = (result.stderr || result.stdout || "Failed to merge PR").trim();
                            lower = errorMsg.toLowerCase();
                            if (lower.includes("not mergeable") || lower.includes("merge conflict") || lower.includes("conflicting")) {
                                return [2 /*return*/, {
                                        success: false,
                                        error: "MERGE_CONFLICT: This PR has merge conflicts with the base branch. Please sync your branch with the latest changes from main to resolve conflicts.",
                                    }];
                            }
                            return [2 /*return*/, { success: false, error: errorMsg }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_1 = _d.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : "Failed to merge PR",
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        }); },
        chatsGetFileStats: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, allChats, statsMap, _i, allChats_1, row, chatId, messages, fileStates, _c, messages_1, msg, _d, _e, part, filePath, oldString, newString, existing_1, subChatAdditions, subChatDeletions, subChatFileCount, _f, fileStates_1, _g, state, original, oldLines, newLines, existing;
            var _h, _j, _k, _l;
            var openSubChatIds = _b.openSubChatIds, chatIds = _b.chatIds;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _m.sent();
                        if ((!openSubChatIds || openSubChatIds.length === 0) && (!chatIds || chatIds.length === 0)) {
                            return [2 /*return*/, []];
                        }
                        if (chatIds && chatIds.length > 0) {
                            allChats = db
                                .select({
                                chatId: db_1.subChats.chatId,
                                subChatId: db_1.subChats.id,
                                messages: db_1.subChats.messages,
                            })
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.inArray)(db_1.subChats.chatId, chatIds))
                                .all();
                        }
                        else {
                            allChats = db
                                .select({
                                chatId: db_1.subChats.chatId,
                                subChatId: db_1.subChats.id,
                                messages: db_1.subChats.messages,
                            })
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.inArray)(db_1.subChats.id, openSubChatIds))
                                .all();
                        }
                        statsMap = new Map();
                        for (_i = 0, allChats_1 = allChats; _i < allChats_1.length; _i++) {
                            row = allChats_1[_i];
                            if (!row.messages || !row.chatId)
                                continue;
                            chatId = row.chatId;
                            try {
                                messages = JSON.parse(row.messages);
                                fileStates = new Map();
                                for (_c = 0, messages_1 = messages; _c < messages_1.length; _c++) {
                                    msg = messages_1[_c];
                                    if (msg.role !== "assistant")
                                        continue;
                                    for (_d = 0, _e = msg.parts || []; _d < _e.length; _d++) {
                                        part = _e[_d];
                                        if (part.type === "tool-Edit" || part.type === "tool-Write") {
                                            filePath = (_h = part.input) === null || _h === void 0 ? void 0 : _h.file_path;
                                            if (!filePath)
                                                continue;
                                            if (filePath.includes("claude-sessions") || filePath.includes("Application Support")) {
                                                continue;
                                            }
                                            oldString = ((_j = part.input) === null || _j === void 0 ? void 0 : _j.old_string) || "";
                                            newString = ((_k = part.input) === null || _k === void 0 ? void 0 : _k.new_string) || ((_l = part.input) === null || _l === void 0 ? void 0 : _l.content) || "";
                                            existing_1 = fileStates.get(filePath);
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
                                subChatAdditions = 0;
                                subChatDeletions = 0;
                                subChatFileCount = 0;
                                for (_f = 0, fileStates_1 = fileStates; _f < fileStates_1.length; _f++) {
                                    _g = fileStates_1[_f], state = _g[1];
                                    original = state.originalContent || "";
                                    if (original === state.currentContent)
                                        continue;
                                    oldLines = original ? original.split("\n").length : 0;
                                    newLines = state.currentContent ? state.currentContent.split("\n").length : 0;
                                    if (!original) {
                                        subChatAdditions += newLines;
                                    }
                                    else {
                                        subChatAdditions += newLines;
                                        subChatDeletions += oldLines;
                                    }
                                    subChatFileCount += 1;
                                }
                                existing = statsMap.get(chatId) || { additions: 0, deletions: 0, fileCount: 0 };
                                existing.additions += subChatAdditions;
                                existing.deletions += subChatDeletions;
                                existing.fileCount += subChatFileCount;
                                statsMap.set(chatId, existing);
                            }
                            catch (_o) {
                                continue;
                            }
                        }
                        return [2 /*return*/, Array.from(statsMap.entries()).map(function (_a) {
                                var chatId = _a[0], stats = _a[1];
                                return (__assign({ chatId: chatId }, stats));
                            })];
                }
            });
        }); },
        chatsGetPendingPlanApprovals: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, allSubChats, pendingApprovals, _loop_1, _i, allSubChats_1, row;
            var openSubChatIds = _b.openSubChatIds;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        if (openSubChatIds.length === 0) {
                            return [2 /*return*/, []];
                        }
                        allSubChats = db
                            .select({
                            chatId: db_1.subChats.chatId,
                            subChatId: db_1.subChats.id,
                            mode: db_1.subChats.mode,
                            messages: db_1.subChats.messages,
                        })
                            .from(db_1.subChats)
                            .where((0, drizzle_orm_1.inArray)(db_1.subChats.id, openSubChatIds))
                            .all();
                        pendingApprovals = [];
                        _loop_1 = function (row) {
                            if (!row.subChatId || !row.chatId)
                                return "continue";
                            if (row.mode === "agent")
                                return "continue";
                            if (!row.messages)
                                return "continue";
                            try {
                                var messages_2 = JSON.parse(row.messages);
                                var hasCompletedExitPlanMode = function () {
                                    for (var i = messages_2.length - 1; i >= 0; i -= 1) {
                                        var msg = messages_2[i];
                                        if (!msg)
                                            continue;
                                        if (msg.role === "assistant" && msg.parts) {
                                            var exitPlanPart = msg.parts.find(function (p) { return p.type === "tool-ExitPlanMode"; });
                                            if (exitPlanPart && exitPlanPart.output !== undefined) {
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                };
                                if (hasCompletedExitPlanMode()) {
                                    pendingApprovals.push({ subChatId: row.subChatId, chatId: row.chatId });
                                }
                            }
                            catch (_d) {
                                return "continue";
                            }
                        };
                        for (_i = 0, allSubChats_1 = allSubChats; _i < allSubChats_1.length; _i++) {
                            row = allSubChats_1[_i];
                            _loop_1(row);
                        }
                        return [2 /*return*/, pendingApprovals];
                }
            });
        }); },
        chatsGetWorktreeStatus: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, status;
            var _c;
            var chatId = _b.chatId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _d.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath) || !chat.branch) {
                            return [2 /*return*/, { hasWorktree: false, uncommittedCount: 0 }];
                        }
                        return [4 /*yield*/, (0, git_worktree_1.getWorktreeStatus)(chat.worktreePath)];
                    case 2:
                        status = _d.sent();
                        return [2 /*return*/, { hasWorktree: true, uncommittedCount: (_c = status === null || status === void 0 ? void 0 : status.uncommittedCount) !== null && _c !== void 0 ? _c : 0 }];
                }
            });
        }); },
        chatsExportChat: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chat, project, chatSubChats, singleSubChat, allMessages, _i, chatSubChats_1, subChat, messages, sanitizeFilename, exportName, safeFilename, text, _c, allMessages_1, subChatData, _d, _e, msg, role, _f, _g, part, markdown, _h, allMessages_2, subChatData, _j, _k, msg, role, _l, _m, part, toolName;
            var _o, _p, _q, _r, _s, _t;
            var chatId = _b.chatId, subChatId = _b.subChatId, _u = _b.format, format = _u === void 0 ? "markdown" : _u;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _v.sent();
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, chatId)).get();
                        if (!chat)
                            throw new Error("Chat not found");
                        project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, chat.projectId)).get();
                        if (subChatId) {
                            singleSubChat = db
                                .select()
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subChats.id, subChatId), (0, drizzle_orm_1.eq)(db_1.subChats.chatId, chatId)))
                                .get();
                            if (!singleSubChat)
                                throw new Error("Sub-chat not found");
                            chatSubChats = [singleSubChat];
                        }
                        else {
                            chatSubChats = db
                                .select()
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, chatId))
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
                            catch (_w) {
                                continue;
                            }
                        }
                        sanitizeFilename = function (name) {
                            return (name
                                .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
                                .replace(/\s+/g, "_")
                                .replace(/_+/g, "_")
                                .replace(/^_|_$/g, "")
                                .slice(0, 100) || "chat");
                        };
                        exportName = subChatId && ((_o = chatSubChats[0]) === null || _o === void 0 ? void 0 : _o.name)
                            ? "".concat(chat.name || "chat", "-").concat(chatSubChats[0].name)
                            : chat.name || "chat";
                        safeFilename = sanitizeFilename(exportName);
                        if (format === "json") {
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
                        if (format === "text") {
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
                            markdown += "**PR:** ".concat(chat.prUrl, "\n\n");
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
                                        else if ((toolName === "Edit" || toolName === "Write") && ((_s = part.input) === null || _s === void 0 ? void 0 : _s.file_path)) {
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
                }
            });
        }); },
        chatsGetChatStats: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, chatSubChats, singleSubChat, messageCount, userMessageCount, assistantMessageCount, toolCalls, toolUsage, totalInputTokens, totalOutputTokens, _i, chatSubChats_2, subChat, messages, _c, messages_3, msg, _d, _e, part;
            var _f, _g;
            var chatId = _b.chatId, subChatId = _b.subChatId;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _h.sent();
                        if (subChatId) {
                            singleSubChat = db
                                .select()
                                .from(db_1.subChats)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subChats.id, subChatId), (0, drizzle_orm_1.eq)(db_1.subChats.chatId, chatId)))
                                .get();
                            chatSubChats = singleSubChat ? [singleSubChat] : [];
                        }
                        else {
                            chatSubChats = db.select().from(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.chatId, chatId)).all();
                        }
                        messageCount = 0;
                        userMessageCount = 0;
                        assistantMessageCount = 0;
                        toolCalls = 0;
                        toolUsage = {};
                        totalInputTokens = 0;
                        totalOutputTokens = 0;
                        for (_i = 0, chatSubChats_2 = chatSubChats; _i < chatSubChats_2.length; _i++) {
                            subChat = chatSubChats_2[_i];
                            try {
                                messages = JSON.parse(subChat.messages || "[]");
                                for (_c = 0, messages_3 = messages; _c < messages_3.length; _c++) {
                                    msg = messages_3[_c];
                                    messageCount += 1;
                                    if (msg.role === "user") {
                                        userMessageCount += 1;
                                    }
                                    else if (msg.role === "assistant") {
                                        assistantMessageCount += 1;
                                        for (_d = 0, _e = msg.parts || []; _d < _e.length; _d++) {
                                            part = _e[_d];
                                            if (((_f = part.type) === null || _f === void 0 ? void 0 : _f.startsWith("tool-")) && part.toolName) {
                                                toolCalls += 1;
                                                toolUsage[part.toolName] = (toolUsage[part.toolName] || 0) + 1;
                                            }
                                        }
                                        if ((_g = msg.metadata) === null || _g === void 0 ? void 0 : _g.usage) {
                                            totalInputTokens += msg.metadata.usage.inputTokens || 0;
                                            totalOutputTokens += msg.metadata.usage.outputTokens || 0;
                                        }
                                    }
                                }
                            }
                            catch (_j) {
                                continue;
                            }
                        }
                        return [2 /*return*/, {
                                messageCount: messageCount,
                                userMessageCount: userMessageCount,
                                assistantMessageCount: assistantMessageCount,
                                toolCalls: toolCalls,
                                toolUsage: toolUsage,
                                totalInputTokens: totalInputTokens,
                                totalOutputTokens: totalOutputTokens,
                                subChatCount: chatSubChats.length,
                            }];
                }
            });
        }); },
        chatsRollbackToMessage: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, subChat, messages, targetIndex, chat, rollbackOk, truncatedMessages;
            var subChatId = _b.subChatId, sdkMessageUuid = _b.sdkMessageUuid;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        subChat = db.select().from(db_1.subChats).where((0, drizzle_orm_1.eq)(db_1.subChats.id, subChatId)).get();
                        if (!subChat) {
                            return [2 /*return*/, { success: false, error: "Sub-chat not found" }];
                        }
                        try {
                            messages = JSON.parse(subChat.messages || "[]");
                        }
                        catch (_d) {
                            return [2 /*return*/, { success: false, error: "Invalid message history" }];
                        }
                        targetIndex = messages.findIndex(function (msg) { var _a; return ((_a = msg === null || msg === void 0 ? void 0 : msg.metadata) === null || _a === void 0 ? void 0 : _a.sdkMessageUuid) === sdkMessageUuid; });
                        if (targetIndex === -1) {
                            return [2 /*return*/, { success: false, error: "Message not found" }];
                        }
                        chat = db.select().from(db_1.chats).where((0, drizzle_orm_1.eq)(db_1.chats.id, subChat.chatId)).get();
                        if (!(chat === null || chat === void 0 ? void 0 : chat.worktreePath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, git_stash_1.applyRollbackStash)(chat.worktreePath, sdkMessageUuid)];
                    case 2:
                        rollbackOk = _c.sent();
                        if (!rollbackOk) {
                            return [2 /*return*/, { success: false, error: "Git rollback failed" }];
                        }
                        _c.label = 3;
                    case 3:
                        truncatedMessages = messages.slice(0, targetIndex + 1);
                        truncatedMessages = truncatedMessages.map(function (msg, index) {
                            var _a = msg.metadata || {}, shouldResume = _a.shouldResume, restMeta = __rest(_a, ["shouldResume"]);
                            return __assign(__assign({}, msg), { metadata: __assign(__assign({}, restMeta), (index === truncatedMessages.length - 1 ? { shouldResume: true } : {})) });
                        });
                        db.update(db_1.subChats)
                            .set({
                            messages: JSON.stringify(truncatedMessages),
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.subChats.id, subChatId))
                            .run();
                        return [2 /*return*/, { success: true, messages: truncatedMessages }];
                }
            });
        }); },
    };
}
