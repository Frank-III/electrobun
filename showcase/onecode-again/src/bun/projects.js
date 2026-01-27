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
exports.createProjectsHandlers = createProjectsHandlers;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var bun_1 = require("electrobun/bun");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("./db");
var git_1 = require("./git");
var analytics_1 = require("./analytics");
var cli_1 = require("./cli");
function runCommand(command, args, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var proc, stdout, _a, stderr, _b, exitCode;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    proc = Bun.spawn(__spreadArray([command], args, true), {
                        cwd: cwd,
                        stdout: "pipe",
                        stderr: "pipe",
                    });
                    if (!proc.stdout) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Response(proc.stdout).text()];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = "";
                    _c.label = 3;
                case 3:
                    stdout = _a;
                    if (!proc.stderr) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Response(proc.stderr).text()];
                case 4:
                    _b = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _b = "";
                    _c.label = 6;
                case 6:
                    stderr = _b;
                    return [4 /*yield*/, proc.exited];
                case 7:
                    exitCode = _c.sent();
                    if ((exitCode !== null && exitCode !== void 0 ? exitCode : 0) !== 0) {
                        throw new Error(stderr || "Command failed: ".concat(command));
                    }
                    return [2 /*return*/, stdout];
            }
        });
    });
}
function createProjectsHandlers() {
    var _this = this;
    return {
        projectsGetLaunchDirectory: function () { return (0, cli_1.getLaunchDirectory)(); },
        projectsList: function () { return __awaiter(_this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, db.select().from(db_1.projects).orderBy((0, drizzle_orm_1.desc)(db_1.projects.updatedAt)).all()];
                }
            });
        }); },
        projectsGet: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, id)).get()];
                }
            });
        }); },
        projectsOpenFolder: function () { return __awaiter(_this, void 0, void 0, function () {
            var paths, folderPath, folderName, gitInfo, db, existing, updatedProject, newProject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bun_1.Utils.openFileDialog({
                            directory: true,
                            multiple: false,
                        })];
                    case 1:
                        paths = _a.sent();
                        if (!(paths === null || paths === void 0 ? void 0 : paths.length)) {
                            return [2 /*return*/, null];
                        }
                        folderPath = paths[0];
                        folderName = (0, path_1.basename)(folderPath);
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(folderPath)];
                    case 2:
                        gitInfo = _a.sent();
                        return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 3:
                        db = _a.sent();
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
                        (0, analytics_1.trackProjectOpened)({
                            id: newProject.id,
                            hasGitRemote: !!gitInfo.remoteUrl,
                        });
                        return [2 /*return*/, newProject];
                }
            });
        }); },
        projectsCreate: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, projectName, existing, gitInfo;
            var path = _b.path, name = _b.name;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        projectName = name || (0, path_1.basename)(path);
                        existing = db
                            .select()
                            .from(db_1.projects)
                            .where((0, drizzle_orm_1.eq)(db_1.projects.path, path))
                            .get();
                        if (existing) {
                            return [2 /*return*/, existing];
                        }
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(path)];
                    case 2:
                        gitInfo = _c.sent();
                        return [2 /*return*/, db
                                .insert(db_1.projects)
                                .values({
                                name: projectName,
                                path: path,
                                gitRemoteUrl: gitInfo.remoteUrl,
                                gitProvider: gitInfo.provider,
                                gitOwner: gitInfo.owner,
                                gitRepo: gitInfo.repo,
                            })
                                .returning()
                                .get()];
                }
            });
        }); },
        projectsRename: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id, name = _b.name;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.projects)
                                .set({ name: name, updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(db_1.projects.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        projectsDelete: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        return [2 /*return*/, db.delete(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, id)).returning().get()];
                }
            });
        }); },
        projectsRefreshGitInfo: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var db, project, gitInfo;
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _c.sent();
                        project = db.select().from(db_1.projects).where((0, drizzle_orm_1.eq)(db_1.projects.id, id)).get();
                        if (!project) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(project.path)];
                    case 2:
                        gitInfo = _c.sent();
                        return [2 /*return*/, db
                                .update(db_1.projects)
                                .set({
                                updatedAt: new Date(),
                                gitRemoteUrl: gitInfo.remoteUrl,
                                gitProvider: gitInfo.provider,
                                gitOwner: gitInfo.owner,
                                gitRepo: gitInfo.repo,
                            })
                                .where((0, drizzle_orm_1.eq)(db_1.projects.id, id))
                                .returning()
                                .get()];
                }
            });
        }); },
        projectsCloneFromGitHub: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var owner, repo, httpsMatch, sshMatch, shortMatch, homePath, reposDir, clonePath, db, existing, gitInfo_1, newProject_1, cloneUrl, gitInfo, newProject;
            var _c, _d, _e;
            var repoUrl = _b.repoUrl;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
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
                        homePath = (0, os_1.homedir)();
                        reposDir = (0, path_1.join)(homePath, ".21st", "repos", owner);
                        clonePath = (0, path_1.join)(reposDir, repo);
                        return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 1:
                        db = _f.sent();
                        if (!(0, fs_1.existsSync)(clonePath)) return [3 /*break*/, 3];
                        existing = db
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
                    case 2:
                        gitInfo_1 = _f.sent();
                        newProject_1 = db
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
                    case 3: return [4 /*yield*/, (0, promises_1.mkdir)(reposDir, { recursive: true })];
                    case 4:
                        _f.sent();
                        cloneUrl = "https://github.com/".concat(owner, "/").concat(repo, ".git");
                        return [4 /*yield*/, runCommand("git", ["clone", cloneUrl, clonePath])];
                    case 5:
                        _f.sent();
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(clonePath)];
                    case 6:
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
        }); },
        projectsLocateAndAdd: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var paths, folderPath, gitInfo, db, existing, updated, project;
            var expectedOwner = _b.expectedOwner, expectedRepo = _b.expectedRepo;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, bun_1.Utils.openFileDialog({
                            directory: true,
                            multiple: false,
                        })];
                    case 1:
                        paths = _c.sent();
                        if (!(paths === null || paths === void 0 ? void 0 : paths.length)) {
                            return [2 /*return*/, { success: false, reason: "canceled" }];
                        }
                        folderPath = paths[0];
                        return [4 /*yield*/, (0, git_1.getGitRemoteInfo)(folderPath)];
                    case 2:
                        gitInfo = _c.sent();
                        if (gitInfo.owner !== expectedOwner || gitInfo.repo !== expectedRepo) {
                            return [2 /*return*/, {
                                    success: false,
                                    reason: "wrong-repo",
                                    found: gitInfo.owner && gitInfo.repo
                                        ? "".concat(gitInfo.owner, "/").concat(gitInfo.repo)
                                        : "not a git repository",
                                }];
                        }
                        return [4 /*yield*/, (0, db_1.getDatabase)()];
                    case 3:
                        db = _c.sent();
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
        }); },
        projectsPickCloneDestination: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var homePath, defaultPath, paths, targetPath;
            var suggestedName = _b.suggestedName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        homePath = (0, os_1.homedir)();
                        defaultPath = (0, path_1.join)(homePath, ".21st", "repos");
                        return [4 /*yield*/, (0, promises_1.mkdir)(defaultPath, { recursive: true })];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, bun_1.Utils.openFileDialog({
                                directory: true,
                                multiple: false,
                                startingFolder: defaultPath,
                            })];
                    case 2:
                        paths = _c.sent();
                        if (!(paths === null || paths === void 0 ? void 0 : paths.length)) {
                            return [2 /*return*/, { success: false, reason: "canceled" }];
                        }
                        targetPath = (0, path_1.join)(paths[0], suggestedName);
                        return [2 /*return*/, { success: true, targetPath: targetPath }];
                }
            });
        }); },
    };
}
