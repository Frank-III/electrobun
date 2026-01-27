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
exports.createRollbackStash = createRollbackStash;
exports.applyRollbackStash = applyRollbackStash;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var shell_env_1 = require("./shell-env");
var shell_env_2 = require("./shell-env");
var APPLY_RETRIES = 3;
var APPLY_RETRY_DELAY_MS = 200;
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
function getGitEnv() {
    return __awaiter(this, void 0, void 0, function () {
        var shellEnv, env, _i, _a, _b, key, value, _c, _d, _e, key, value;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, shell_env_2.getShellEnvironment)()];
                case 1:
                    shellEnv = _f.sent();
                    env = {};
                    for (_i = 0, _a = Object.entries(process.env); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (typeof value === "string") {
                            env[key] = value;
                        }
                    }
                    for (_c = 0, _d = Object.entries(shellEnv); _c < _d.length; _c++) {
                        _e = _d[_c], key = _e[0], value = _e[1];
                        if (typeof value === "string") {
                            env[key] = value;
                        }
                    }
                    if (shellEnv.PATH) {
                        env.PATH = shellEnv.PATH;
                    }
                    return [2 /*return*/, env];
            }
        });
    });
}
function runGit(args, cwd, envOverride) {
    return __awaiter(this, void 0, void 0, function () {
        var env, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!envOverride) return [3 /*break*/, 2];
                    _b = [{}];
                    return [4 /*yield*/, getGitEnv()];
                case 1:
                    _a = __assign.apply(void 0, [__assign.apply(void 0, _b.concat([(_c.sent())])), envOverride]);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, getGitEnv()];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    env = _a;
                    return [2 /*return*/, (0, shell_env_1.runCommand)("git", args, { cwd: cwd, env: env })];
            }
        });
    });
}
function createRollbackStash(cwd, sdkMessageUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var indexTreeRaw, indexTree, worktreeTree, tempDir, tempIndexPath, env, _a, treeRaw, checkpointPayload, commitRaw, commitHash, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, runGit(["write-tree"], cwd)];
                case 1:
                    indexTreeRaw = _b.sent();
                    indexTree = indexTreeRaw.stdout.trim();
                    if (!indexTree) {
                        return [2 /*return*/];
                    }
                    worktreeTree = "";
                    tempDir = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 7, 10]);
                    return [4 /*yield*/, (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), "checkpoint-index-"))];
                case 3:
                    tempDir = _b.sent();
                    tempIndexPath = (0, path_1.join)(tempDir, "index");
                    _a = [{}];
                    return [4 /*yield*/, getGitEnv()];
                case 4:
                    env = __assign.apply(void 0, [__assign.apply(void 0, _a.concat([(_b.sent())])), { GIT_INDEX_FILE: tempIndexPath }]);
                    return [4 /*yield*/, runGit(["add", "-A"], cwd, env)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, runGit(["write-tree"], cwd, env)];
                case 6:
                    treeRaw = _b.sent();
                    worktreeTree = treeRaw.stdout.trim();
                    return [3 /*break*/, 10];
                case 7:
                    if (!tempDir) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, promises_1.rm)(tempDir, { recursive: true, force: true })];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [7 /*endfinally*/];
                case 10:
                    if (!worktreeTree) {
                        return [2 /*return*/];
                    }
                    checkpointPayload = {
                        sdkMessageUuid: sdkMessageUuid,
                        indexTree: indexTree,
                        worktreeTree: worktreeTree,
                    };
                    return [4 /*yield*/, runGit([
                            "-c",
                            "user.name=Checkpoint",
                            "-c",
                            "user.email=checkpoint@local",
                            "commit-tree",
                            worktreeTree,
                            "-m",
                            JSON.stringify(checkpointPayload),
                        ], cwd)];
                case 11:
                    commitRaw = _b.sent();
                    commitHash = commitRaw.stdout.trim();
                    if (!commitHash) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, runGit(["update-ref", "refs/checkpoints/".concat(sdkMessageUuid), commitHash], cwd)];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _b.sent();
                    console.error("[claude] Failed to create rollback checkpoint:", error_1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function parseCheckpointTrees(message) {
    var body = message.trim();
    if (body) {
        try {
            var parsed = JSON.parse(body);
            if (parsed.indexTree && parsed.worktreeTree) {
                return {
                    indexTree: parsed.indexTree,
                    worktreeTree: parsed.worktreeTree,
                };
            }
        }
        catch (_a) {
            // ignore
        }
    }
    return { indexTree: null, worktreeTree: null };
}
function applyRollbackStash(worktreePath, sdkMessageUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var ref, commitResult, commitHash, commitMessageResult, _a, indexTree, worktreeTree, lastError, attempt, error_2, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 14, , 15]);
                    ref = "refs/checkpoints/".concat(sdkMessageUuid);
                    return [4 /*yield*/, runGit(["rev-parse", ref], worktreePath)];
                case 1:
                    commitResult = _b.sent();
                    commitHash = commitResult.stdout.trim();
                    if (!commitHash) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, runGit(["show", "-s", "--format=%B", commitHash], worktreePath)];
                case 2:
                    commitMessageResult = _b.sent();
                    _a = parseCheckpointTrees(commitMessageResult.stdout), indexTree = _a.indexTree, worktreeTree = _a.worktreeTree;
                    if (!indexTree || !worktreeTree) {
                        console.error("[claude] Rollback checkpoint missing tree metadata for sdkMessageUuid=".concat(sdkMessageUuid));
                        return [2 /*return*/, false];
                    }
                    lastError = void 0;
                    attempt = 1;
                    _b.label = 3;
                case 3:
                    if (!(attempt <= APPLY_RETRIES)) return [3 /*break*/, 13];
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 9, , 12]);
                    return [4 /*yield*/, runGit(["read-tree", worktreeTree], worktreePath)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, runGit(["checkout-index", "-a", "-f"], worktreePath)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, runGit(["clean", "-fd"], worktreePath)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, runGit(["read-tree", indexTree], worktreePath)];
                case 8:
                    _b.sent();
                    return [2 /*return*/, true];
                case 9:
                    error_2 = _b.sent();
                    lastError = error_2;
                    if (!(attempt < APPLY_RETRIES)) return [3 /*break*/, 11];
                    return [4 /*yield*/, sleep(APPLY_RETRY_DELAY_MS)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3 /*break*/, 12];
                case 12:
                    attempt += 1;
                    return [3 /*break*/, 3];
                case 13: throw lastError;
                case 14:
                    error_3 = _b.sent();
                    console.error("[claude] Failed to apply rollback checkpoint:", error_3);
                    return [2 /*return*/, false];
                case 15: return [2 /*return*/];
            }
        });
    });
}
