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
exports.createRollbackStash = createRollbackStash;
exports.applyRollbackStash = applyRollbackStash;
var promises_1 = require("node:fs/promises");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var simple_git_1 = require("simple-git");
var APPLY_RETRIES = 3;
var APPLY_RETRY_DELAY_MS = 200;
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
/**
 * Create a checkpoint ref for rollback support.
 * Stores index and worktree trees in an orphan commit under refs/checkpoints/.
 * If there are no changes, no checkpoint is created (this is fine).
 */
function createRollbackStash(cwd, sdkMessageUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var git, indexTreeRaw, indexTree, worktreeTree, tempDir, tempIndexPath, gitWithTempIndex, checkpointPayload, commitRaw, commitHash, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    git = (0, simple_git_1.default)(cwd);
                    return [4 /*yield*/, git.raw(["write-tree"])];
                case 1:
                    indexTreeRaw = _a.sent();
                    indexTree = indexTreeRaw.trim();
                    if (!indexTree) {
                        return [2 /*return*/];
                    }
                    worktreeTree = "";
                    tempDir = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 9]);
                    return [4 /*yield*/, (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "checkpoint-index-"))];
                case 3:
                    tempDir = _a.sent();
                    tempIndexPath = (0, node_path_1.join)(tempDir, "index");
                    gitWithTempIndex = (0, simple_git_1.default)(cwd).env({
                        GIT_INDEX_FILE: tempIndexPath,
                    });
                    return [4 /*yield*/, gitWithTempIndex.raw(["add", "-A"])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, gitWithTempIndex.raw(["write-tree"])];
                case 5:
                    worktreeTree = (_a.sent()).trim();
                    return [3 /*break*/, 9];
                case 6:
                    if (!tempDir) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, promises_1.rm)(tempDir, { recursive: true, force: true })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9:
                    if (!worktreeTree) {
                        return [2 /*return*/];
                    }
                    checkpointPayload = {
                        sdkMessageUuid: sdkMessageUuid,
                        indexTree: indexTree,
                        worktreeTree: worktreeTree,
                    };
                    return [4 /*yield*/, git.raw([
                            "-c",
                            "user.name=Checkpoint",
                            "-c",
                            "user.email=checkpoint@local",
                            "commit-tree",
                            worktreeTree,
                            "-m",
                            JSON.stringify(checkpointPayload),
                        ])];
                case 10:
                    commitRaw = _a.sent();
                    commitHash = commitRaw.trim();
                    if (!commitHash) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, git.raw([
                            "update-ref",
                            "refs/checkpoints/".concat(sdkMessageUuid),
                            commitHash,
                        ])];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 12:
                    e_1 = _a.sent();
                    console.error("[claude] Failed to create rollback checkpoint:", e_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
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
            // Ignore invalid payload.
        }
    }
    return {
        indexTree: null,
        worktreeTree: null,
    };
}
function applyRollbackStash(worktreePath, sdkMessageUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var git, ref, commitHash, error_1, commitMessage, _a, indexTree, worktreeTree, lastError, attempt, error_2, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 17, , 18]);
                    git = (0, simple_git_1.default)(worktreePath);
                    ref = "refs/checkpoints/".concat(sdkMessageUuid);
                    commitHash = "";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.raw(["rev-parse", ref])];
                case 2:
                    commitHash = (_b.sent()).trim();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.warn("[claude] Rollback checkpoint not found for sdkMessageUuid=".concat(sdkMessageUuid));
                    return [2 /*return*/, true]; // This is fine, just skip
                case 4: return [4 /*yield*/, git.raw([
                        "show",
                        "-s",
                        "--format=%B",
                        commitHash,
                    ])];
                case 5:
                    commitMessage = _b.sent();
                    _a = parseCheckpointTrees(commitMessage), indexTree = _a.indexTree, worktreeTree = _a.worktreeTree;
                    if (!indexTree || !worktreeTree) {
                        console.error("[claude] Rollback checkpoint missing tree metadata for sdkMessageUuid=".concat(sdkMessageUuid));
                        return [2 /*return*/, false];
                    }
                    lastError = void 0;
                    attempt = 1;
                    _b.label = 6;
                case 6:
                    if (!(attempt <= APPLY_RETRIES)) return [3 /*break*/, 16];
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 12, , 15]);
                    return [4 /*yield*/, git.raw(["read-tree", worktreeTree])];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, git.raw(["checkout-index", "-a", "-f"])];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, git.raw(["clean", "-fd"])];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, git.raw(["read-tree", indexTree])];
                case 11:
                    _b.sent();
                    return [2 /*return*/, true];
                case 12:
                    error_2 = _b.sent();
                    lastError = error_2;
                    if (!(attempt < APPLY_RETRIES)) return [3 /*break*/, 14];
                    return [4 /*yield*/, sleep(APPLY_RETRY_DELAY_MS)];
                case 13:
                    _b.sent();
                    _b.label = 14;
                case 14: return [3 /*break*/, 15];
                case 15:
                    attempt += 1;
                    return [3 /*break*/, 6];
                case 16: throw lastError;
                case 17:
                    e_2 = _b.sent();
                    console.error("[claude] Failed to apply rollback checkpoint:", e_2);
                    return [2 /*return*/, false];
                case 18: return [2 /*return*/];
            }
        });
    });
}
