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
exports.projectsRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var db_1 = require("../../db");
var drizzle_orm_1 = require("drizzle-orm");
var electron_1 = require("electron");
var path_1 = require("path");
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var node_fs_1 = require("node:fs");
var promises_1 = require("node:fs/promises");
var git_1 = require("../../git");
var analytics_1 = require("../../analytics");
var cli_1 = require("../../cli");
var execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
exports.projectsRouter = (0, index_1.router)({
    /**
     * Get launch directory from CLI args (consumed once)
     * Based on PR #16 by @caffeinum
     */
    getLaunchDirectory: index_1.publicProcedure.query(function () {
        return (0, cli_1.getLaunchDirectory)();
    }),
    /**
     * List all projects
     */
    list: index_1.publicProcedure.query(function () {
        var db = (0, db_1.getDatabase)();
        return db.select().from(db_1.projects).orderBy((0, drizzle_orm_1.desc)(db_1.projects.updatedAt)).all();
    }),
    /**
     * Get a single project by ID
     */
    get: index_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id)).get();
    }),
    /**
     * Open folder picker and create project
     */
    openFolder: index_1.publicProcedure.mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var window, result, folderPath, folderName, gitInfo, db, existing, updatedProject, newProject;
        var _c, _d;
        var ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    window = (_d = (_c = ctx.getWindow) === null || _c === void 0 ? void 0 : _c.call(ctx)) !== null && _d !== void 0 ? _d : electron_1.BrowserWindow.getFocusedWindow();
                    if (!window) {
                        console.error("[Projects] No window available for folder dialog");
                        return [2 /*return*/, null];
                    }
                    if (!!window.isFocused()) return [3 /*break*/, 2];
                    console.log("[Projects] Window not focused, focusing before dialog...");
                    window.focus();
                    // Small delay to ensure focus is applied by the OS
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 1:
                    // Small delay to ensure focus is applied by the OS
                    _e.sent();
                    _e.label = 2;
                case 2: return [4 /*yield*/, electron_1.dialog.showOpenDialog(window, {
                        properties: ["openDirectory", "createDirectory"],
                        title: "Select Project Folder",
                        buttonLabel: "Open Project",
                    })];
                case 3:
                    result = _e.sent();
                    if (result.canceled || result.filePaths.length === 0) {
                        return [2 /*return*/, null];
                    }
                    folderPath = result.filePaths[0];
                    folderName = (0, path_1.basename)(folderPath);
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(folderPath)];
                case 4:
                    gitInfo = _e.sent();
                    db = (0, db_1.getDatabase)();
                    existing = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.path, folderPath))
                        .get();
                    if (existing) {
                        updatedProject = db
                            .update(db_1.projects)
                            .set({
                            updatedAt: new Date(),
                            gitRemoteUrl: gitInfo.remoteUrl,
                            gitProvider: gitInfo.provider,
                            gitOwner: gitInfo.owner,
                            gitRepo: gitInfo.repo,
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.projects.id, existing.id))
                            .returning()
                            .get();
                        // Track project opened
                        (0, analytics_1.trackProjectOpened)({
                            id: updatedProject.id,
                            hasGitRemote: !!gitInfo.remoteUrl,
                        });
                        return [2 /*return*/, updatedProject];
                    }
                    newProject = db
                        .insert(db_1.projects)
                        .values({
                        name: folderName,
                        path: folderPath,
                        gitRemoteUrl: gitInfo.remoteUrl,
                        gitProvider: gitInfo.provider,
                        gitOwner: gitInfo.owner,
                        gitRepo: gitInfo.repo,
                    })
                        .returning()
                        .get();
                    // Track project opened
                    (0, analytics_1.trackProjectOpened)({
                        id: newProject.id,
                        hasGitRemote: !!gitInfo.remoteUrl,
                    });
                    return [2 /*return*/, newProject];
            }
        });
    }); }),
    /**
     * Create a project from a known path
     */
    create: index_1.publicProcedure
        .input(zod_1.z.object({ path: zod_1.z.string(), name: zod_1.z.string().optional() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, name, existing, gitInfo;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    name = input.name || (0, path_1.basename)(input.path);
                    existing = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.path, input.path))
                        .get();
                    if (existing) {
                        return [2 /*return*/, existing];
                    }
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(input.path)];
                case 1:
                    gitInfo = _c.sent();
                    return [2 /*return*/, db
                            .insert(db_1.projects)
                            .values({
                            name: name,
                            path: input.path,
                            gitRemoteUrl: gitInfo.remoteUrl,
                            gitProvider: gitInfo.provider,
                            gitOwner: gitInfo.owner,
                            gitRepo: gitInfo.repo,
                        })
                            .returning()
                            .get()];
            }
        });
    }); }),
    /**
     * Rename a project
     */
    rename: index_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .update(db_1.projects)
            .set({ name: input.name, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Delete a project and all its chats
     */
    delete: index_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var db = (0, db_1.getDatabase)();
        return db
            .delete(db_1.projects)
            .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id))
            .returning()
            .get();
    }),
    /**
     * Refresh git info for a project (in case remote changed)
     */
    refreshGitInfo: index_1.publicProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, project, gitInfo;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    db = (0, db_1.getDatabase)();
                    project = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id))
                        .get();
                    if (!project) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(project.path)
                        // Update project
                    ];
                case 1:
                    gitInfo = _c.sent();
                    // Update project
                    return [2 /*return*/, db
                            .update(db_1.projects)
                            .set({
                            updatedAt: new Date(),
                            gitRemoteUrl: gitInfo.remoteUrl,
                            gitProvider: gitInfo.provider,
                            gitOwner: gitInfo.owner,
                            gitRepo: gitInfo.repo,
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.projects.id, input.id))
                            .returning()
                            .get()];
            }
        });
    }); }),
    /**
     * Clone a GitHub repo and create a project
     */
    cloneFromGitHub: index_1.publicProcedure
        .input(zod_1.z.object({ repoUrl: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var repoUrl, owner, repo, httpsMatch, sshMatch, shortMatch, homePath, reposDir, clonePath, db_2, existing, gitInfo_1, newProject_1, cloneUrl, db, gitInfo, newProject;
        var _c, _d, _e;
        var input = _b.input;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    repoUrl = input.repoUrl;
                    owner = null;
                    repo = null;
                    httpsMatch = repoUrl.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
                    if (httpsMatch) {
                        owner = httpsMatch[1] || null;
                        repo = ((_c = httpsMatch[2]) === null || _c === void 0 ? void 0 : _c.replace(/\.git$/, "")) || null;
                    }
                    sshMatch = repoUrl.match(/git@github\.com:([^/]+)\/(.+)/);
                    if (sshMatch) {
                        owner = sshMatch[1] || null;
                        repo = ((_d = sshMatch[2]) === null || _d === void 0 ? void 0 : _d.replace(/\.git$/, "")) || null;
                    }
                    shortMatch = repoUrl.match(/^([^/]+)\/([^/]+)$/);
                    if (shortMatch) {
                        owner = shortMatch[1] || null;
                        repo = ((_e = shortMatch[2]) === null || _e === void 0 ? void 0 : _e.replace(/\.git$/, "")) || null;
                    }
                    if (!owner || !repo) {
                        throw new Error("Invalid GitHub URL or repo format");
                    }
                    homePath = electron_1.app.getPath("home");
                    reposDir = (0, path_1.join)(homePath, ".21st", "repos", owner);
                    clonePath = (0, path_1.join)(reposDir, repo);
                    if (!(0, node_fs_1.existsSync)(clonePath)) return [3 /*break*/, 2];
                    db_2 = (0, db_1.getDatabase)();
                    existing = db_2
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.path, clonePath))
                        .get();
                    if (existing) {
                        (0, analytics_1.trackProjectOpened)({
                            id: existing.id,
                            hasGitRemote: !!existing.gitRemoteUrl,
                        });
                        return [2 /*return*/, existing];
                    }
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(clonePath)];
                case 1:
                    gitInfo_1 = _f.sent();
                    newProject_1 = db_2
                        .insert(db_1.projects)
                        .values({
                        name: repo,
                        path: clonePath,
                        gitRemoteUrl: gitInfo_1.remoteUrl,
                        gitProvider: gitInfo_1.provider,
                        gitOwner: gitInfo_1.owner,
                        gitRepo: gitInfo_1.repo,
                    })
                        .returning()
                        .get();
                    (0, analytics_1.trackProjectOpened)({
                        id: newProject_1.id,
                        hasGitRemote: !!gitInfo_1.remoteUrl,
                    });
                    return [2 /*return*/, newProject_1];
                case 2: 
                // Create repos directory
                return [4 /*yield*/, (0, promises_1.mkdir)(reposDir, { recursive: true })
                    // Clone the repo
                ];
                case 3:
                    // Create repos directory
                    _f.sent();
                    cloneUrl = "https://github.com/".concat(owner, "/").concat(repo, ".git");
                    return [4 /*yield*/, execAsync("git clone \"".concat(cloneUrl, "\" \"").concat(clonePath, "\""))
                        // Get git info and create project
                    ];
                case 4:
                    _f.sent();
                    db = (0, db_1.getDatabase)();
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(clonePath)];
                case 5:
                    gitInfo = _f.sent();
                    newProject = db
                        .insert(db_1.projects)
                        .values({
                        name: repo,
                        path: clonePath,
                        gitRemoteUrl: gitInfo.remoteUrl,
                        gitProvider: gitInfo.provider,
                        gitOwner: gitInfo.owner,
                        gitRepo: gitInfo.repo,
                    })
                        .returning()
                        .get();
                    (0, analytics_1.trackProjectOpened)({
                        id: newProject.id,
                        hasGitRemote: !!gitInfo.remoteUrl,
                    });
                    return [2 /*return*/, newProject];
            }
        });
    }); }),
    /**
     * Open folder picker to locate an existing clone of a specific repo
     * Validates that the selected folder matches the expected owner/repo
     */
    locateAndAddProject: index_1.publicProcedure
        .input(zod_1.z.object({
        expectedOwner: zod_1.z.string(),
        expectedRepo: zod_1.z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var window, result, folderPath, gitInfo, db, existing, updated, project;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    window = (_d = (_c = ctx.getWindow) === null || _c === void 0 ? void 0 : _c.call(ctx)) !== null && _d !== void 0 ? _d : electron_1.BrowserWindow.getFocusedWindow();
                    if (!window) {
                        return [2 /*return*/, { success: false, reason: "no-window" }];
                    }
                    if (!!window.isFocused()) return [3 /*break*/, 2];
                    window.focus();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 1:
                    _e.sent();
                    _e.label = 2;
                case 2: return [4 /*yield*/, electron_1.dialog.showOpenDialog(window, {
                        properties: ["openDirectory"],
                        title: "Locate ".concat(input.expectedOwner, "/").concat(input.expectedRepo),
                        buttonLabel: "Select",
                    })];
                case 3:
                    result = _e.sent();
                    if (result.canceled || !result.filePaths[0]) {
                        return [2 /*return*/, { success: false, reason: "canceled" }];
                    }
                    folderPath = result.filePaths[0];
                    return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(folderPath)
                        // Validate it's the correct repo
                    ];
                case 4:
                    gitInfo = _e.sent();
                    // Validate it's the correct repo
                    if (gitInfo.owner !== input.expectedOwner ||
                        gitInfo.repo !== input.expectedRepo) {
                        return [2 /*return*/, {
                                success: false,
                                reason: "wrong-repo",
                                found: gitInfo.owner && gitInfo.repo
                                    ? "".concat(gitInfo.owner, "/").concat(gitInfo.repo)
                                    : "not a git repository",
                            }];
                    }
                    db = (0, db_1.getDatabase)();
                    existing = db
                        .select()
                        .from(db_1.projects)
                        .where((0, drizzle_orm_1.eq)(db_1.projects.path, folderPath))
                        .get();
                    if (existing) {
                        updated = db
                            .update(db_1.projects)
                            .set({
                            updatedAt: new Date(),
                            gitRemoteUrl: gitInfo.remoteUrl,
                            gitProvider: gitInfo.provider,
                            gitOwner: gitInfo.owner,
                            gitRepo: gitInfo.repo,
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.projects.id, existing.id))
                            .returning()
                            .get();
                        return [2 /*return*/, { success: true, project: updated }];
                    }
                    project = db
                        .insert(db_1.projects)
                        .values({
                        name: (0, path_1.basename)(folderPath),
                        path: folderPath,
                        gitRemoteUrl: gitInfo.remoteUrl,
                        gitProvider: gitInfo.provider,
                        gitOwner: gitInfo.owner,
                        gitRepo: gitInfo.repo,
                    })
                        .returning()
                        .get();
                    return [2 /*return*/, { success: true, project: project }];
            }
        });
    }); }),
    /**
     * Open folder picker to choose where to clone a repository
     */
    pickCloneDestination: index_1.publicProcedure
        .input(zod_1.z.object({ suggestedName: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var window, homePath, defaultPath, result, targetPath;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    window = (_d = (_c = ctx.getWindow) === null || _c === void 0 ? void 0 : _c.call(ctx)) !== null && _d !== void 0 ? _d : electron_1.BrowserWindow.getFocusedWindow();
                    if (!window) {
                        return [2 /*return*/, { success: false, reason: "no-window" }];
                    }
                    if (!!window.isFocused()) return [3 /*break*/, 2];
                    window.focus();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 1:
                    _e.sent();
                    _e.label = 2;
                case 2:
                    homePath = electron_1.app.getPath("home");
                    defaultPath = (0, path_1.join)(homePath, ".21st", "repos");
                    return [4 /*yield*/, (0, promises_1.mkdir)(defaultPath, { recursive: true })];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, electron_1.dialog.showOpenDialog(window, {
                            properties: ["openDirectory", "createDirectory"],
                            title: "Choose where to clone",
                            defaultPath: defaultPath,
                            buttonLabel: "Clone Here",
                        })];
                case 4:
                    result = _e.sent();
                    if (result.canceled || !result.filePaths[0]) {
                        return [2 /*return*/, { success: false, reason: "canceled" }];
                    }
                    targetPath = (0, path_1.join)(result.filePaths[0], input.suggestedName);
                    return [2 /*return*/, { success: true, targetPath: targetPath }];
            }
        });
    }); }),
});
