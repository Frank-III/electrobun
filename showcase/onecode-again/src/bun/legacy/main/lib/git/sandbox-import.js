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
exports.parseExportStream = parseExportStream;
exports.applySandboxGitState = applySandboxGitState;
exports.importSandboxToWorktree = importSandboxToWorktree;
var node_child_process_1 = require("node:child_process");
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var node_util_1 = require("node:util");
var node_os_1 = require("node:os");
var simple_git_1 = require("simple-git");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
/**
 * Parse NDJSON export stream into structured data
 */
function parseExportStream(stream) {
    return __awaiter(this, void 0, void 0, function () {
        var reader, decoder, buffer, chunkCount, result, _a, done, value, lines, _i, lines_1, line, chunk;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("[sandbox-import] parseExportStream starting...");
                    reader = stream.getReader();
                    decoder = new TextDecoder();
                    buffer = "";
                    chunkCount = 0;
                    result = {
                        meta: null,
                        bundle: null,
                        stagedPatch: null,
                        unstagedPatch: null,
                        untrackedFiles: [],
                        claudeSessions: [],
                    };
                    _d.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, reader.read()];
                case 2:
                    _a = _d.sent(), done = _a.done, value = _a.value;
                    if (done) {
                        console.log("[sandbox-import] Stream finished, processed ".concat(chunkCount, " chunks"));
                        return [3 /*break*/, 3];
                    }
                    buffer += decoder.decode(value, { stream: true });
                    lines = buffer.split("\n");
                    buffer = lines.pop() || ""; // Keep incomplete line in buffer
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (!line.trim())
                            continue;
                        chunk = JSON.parse(line);
                        chunkCount++;
                        console.log("[sandbox-import] Received chunk ".concat(chunkCount, ": type=").concat(chunk.type));
                        switch (chunk.type) {
                            case "meta":
                                result.meta = chunk;
                                console.log("[sandbox-import] Meta chunk:", {
                                    branch: chunk.branch,
                                    baseCommit: chunk.baseCommit,
                                    headCommit: chunk.headCommit,
                                    isFullExport: chunk.isFullExport,
                                    remoteUrl: chunk.remoteUrl,
                                });
                                break;
                            case "bundle":
                                if (chunk.data) {
                                    result.bundle = Buffer.from(chunk.data, "base64");
                                    console.log("[sandbox-import] Bundle chunk: ".concat(result.bundle.length, " bytes"));
                                }
                                else {
                                    console.log("[sandbox-import] Bundle chunk: null data");
                                }
                                break;
                            case "staged_patch":
                                result.stagedPatch = chunk.data;
                                console.log("[sandbox-import] Staged patch chunk: ".concat(((_b = chunk.data) === null || _b === void 0 ? void 0 : _b.length) || 0, " chars"));
                                break;
                            case "unstaged_patch":
                                result.unstagedPatch = chunk.data;
                                console.log("[sandbox-import] Unstaged patch chunk: ".concat(((_c = chunk.data) === null || _c === void 0 ? void 0 : _c.length) || 0, " chars"));
                                break;
                            case "untracked":
                                result.untrackedFiles.push({
                                    path: chunk.path,
                                    content: Buffer.from(chunk.data, "base64"),
                                });
                                console.log("[sandbox-import] Untracked file chunk: ".concat(chunk.path));
                                break;
                            case "claude_session":
                                result.claudeSessions.push(chunk);
                                console.log("[sandbox-import] Claude session chunk: ".concat(chunk.sessionId.slice(0, 8), "... (").concat(chunk.data.length, " chars)"));
                                break;
                            case "error":
                                console.error("[sandbox-import] Error chunk received: ".concat(chunk.error));
                                throw new Error("Export failed: ".concat(chunk.error));
                            case "done":
                                console.log("[sandbox-import] Done chunk received");
                                break;
                        }
                    }
                    return [3 /*break*/, 1];
                case 3:
                    if (!result.meta) {
                        console.error("[sandbox-import] No meta chunk received!");
                        throw new Error("Export stream missing metadata");
                    }
                    console.log("[sandbox-import] parseExportStream completed:", {
                        hasMeta: !!result.meta,
                        hasBundle: !!result.bundle,
                        hasStagedPatch: !!result.stagedPatch,
                        hasUnstagedPatch: !!result.unstagedPatch,
                        untrackedFilesCount: result.untrackedFiles.length,
                        claudeSessionsCount: result.claudeSessions.length,
                    });
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Apply sandbox git state to a worktree
 */
function applySandboxGitState(worktreePath, exportData) {
    return __awaiter(this, void 0, void 0, function () {
        var git, isFullExport, err_1, baseCommit, _a, fetchError_1, bundlePath, verifyResult, fetchResult, targetBranch, stagedPatchPath, error_1, unstagedPatchPath, error_2, _i, _b, file, fullPath, error_3, error_4, errorMessage;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("[sandbox-import] applySandboxGitState starting...");
                    console.log("[sandbox-import] Worktree path: ".concat(worktreePath));
                    git = (0, simple_git_1.default)(worktreePath);
                    isFullExport = (_c = exportData.meta.isFullExport) !== null && _c !== void 0 ? _c : false;
                    console.log("[sandbox-import] Is full export: ".concat(isFullExport));
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 53, , 54]);
                    if (!(isFullExport && exportData.meta.remoteUrl)) return [3 /*break*/, 5];
                    console.log("[sandbox-import] Setting up remote origin: ".concat(exportData.meta.remoteUrl));
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, git.addRemote("origin", exportData.meta.remoteUrl)];
                case 3:
                    _d.sent();
                    console.log("[sandbox-import] Added remote origin successfully");
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _d.sent();
                    // Remote might already exist
                    console.log("[sandbox-import] Remote origin already exists or failed to add:", err_1);
                    return [3 /*break*/, 5];
                case 5:
                    if (!!isFullExport) return [3 /*break*/, 13];
                    baseCommit = exportData.meta.baseCommit;
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 8, , 13]);
                    return [4 /*yield*/, git.raw(["cat-file", "-e", baseCommit])];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 13];
                case 8:
                    _a = _d.sent();
                    // Base commit doesn't exist locally, try to fetch
                    console.log("[sandbox-import] Base commit ".concat(baseCommit, " not found locally, fetching..."));
                    _d.label = 9;
                case 9:
                    _d.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, git.fetch("origin")];
                case 10:
                    _d.sent();
                    return [3 /*break*/, 12];
                case 11:
                    fetchError_1 = _d.sent();
                    console.warn("[sandbox-import] Fetch failed: ".concat(fetchError_1));
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 13];
                case 13:
                    if (!exportData.bundle) return [3 /*break*/, 26];
                    console.log("[sandbox-import] Step 2: Applying git bundle (".concat(exportData.bundle.length, " bytes)..."));
                    bundlePath = (0, node_path_1.join)((0, node_os_1.tmpdir)(), "sandbox-import-".concat(Date.now(), ".bundle"));
                    console.log("[sandbox-import] Bundle temp path: ".concat(bundlePath));
                    _d.label = 14;
                case 14:
                    _d.trys.push([14, , 24, 26]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(bundlePath, exportData.bundle)];
                case 15:
                    _d.sent();
                    console.log("[sandbox-import] Bundle written to temp file");
                    // Verify the bundle is valid
                    console.log("[sandbox-import] Verifying bundle...");
                    return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "bundle", "verify", bundlePath], {
                            timeout: 30000,
                        })];
                case 16:
                    verifyResult = _d.sent();
                    console.log("[sandbox-import] Bundle verify output:", verifyResult.stdout);
                    if (!isFullExport) return [3 /*break*/, 19];
                    // Full export: fetch all refs from bundle, then checkout the branch
                    // Use --update-head-ok to allow fetching into the currently checked out branch
                    console.log("[sandbox-import] Full export: fetching all refs from bundle...");
                    return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "fetch", "--update-head-ok", bundlePath, "refs/heads/*:refs/heads/*"], { timeout: 120000 })];
                case 17:
                    fetchResult = _d.sent();
                    console.log("[sandbox-import] Fetch output:", fetchResult.stdout, fetchResult.stderr);
                    targetBranch = exportData.meta.branch;
                    console.log("[sandbox-import] Checking out branch: ".concat(targetBranch));
                    return [4 /*yield*/, git.checkout(["-f", targetBranch])];
                case 18:
                    _d.sent();
                    console.log("[sandbox-import] Checked out branch successfully: ".concat(targetBranch));
                    return [3 /*break*/, 23];
                case 19: 
                // Delta export: fetch HEAD to temp branch, then reset
                return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "fetch", bundlePath, "HEAD:sandbox-import-temp"], { timeout: 60000 })];
                case 20:
                    // Delta export: fetch HEAD to temp branch, then reset
                    _d.sent();
                    // Reset to the fetched commits
                    return [4 /*yield*/, git.reset(["--hard", "sandbox-import-temp"])];
                case 21:
                    // Reset to the fetched commits
                    _d.sent();
                    // Clean up temp branch
                    return [4 /*yield*/, git.branch(["-D", "sandbox-import-temp"]).catch(function () { })];
                case 22:
                    // Clean up temp branch
                    _d.sent();
                    _d.label = 23;
                case 23: return [3 /*break*/, 26];
                case 24: return [4 /*yield*/, (0, promises_1.unlink)(bundlePath).catch(function () { })];
                case 25:
                    _d.sent();
                    return [7 /*endfinally*/];
                case 26:
                    if (!exportData.stagedPatch) return [3 /*break*/, 35];
                    console.log("[sandbox-import] Step 3: Applying staged patch (".concat(exportData.stagedPatch.length, " chars)..."));
                    stagedPatchPath = (0, node_path_1.join)((0, node_os_1.tmpdir)(), "sandbox-staged-".concat(Date.now(), ".patch"));
                    _d.label = 27;
                case 27:
                    _d.trys.push([27, 31, 32, 34]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(stagedPatchPath, exportData.stagedPatch)];
                case 28:
                    _d.sent();
                    // Apply and stage
                    return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "apply", "--cached", stagedPatchPath], { timeout: 60000 })];
                case 29:
                    // Apply and stage
                    _d.sent();
                    console.log("[sandbox-import] Staged patch applied successfully");
                    // Also apply to working directory
                    return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "checkout", "--", "."], {
                            timeout: 30000,
                        }).catch(function () { })];
                case 30:
                    // Also apply to working directory
                    _d.sent();
                    return [3 /*break*/, 34];
                case 31:
                    error_1 = _d.sent();
                    console.warn("[sandbox-import] Failed to apply staged patch: ".concat(error_1));
                    return [3 /*break*/, 34];
                case 32: return [4 /*yield*/, (0, promises_1.unlink)(stagedPatchPath).catch(function () { })];
                case 33:
                    _d.sent();
                    return [7 /*endfinally*/];
                case 34: return [3 /*break*/, 36];
                case 35:
                    console.log("[sandbox-import] Step 3: No staged patch to apply");
                    _d.label = 36;
                case 36:
                    if (!exportData.unstagedPatch) return [3 /*break*/, 44];
                    console.log("[sandbox-import] Step 4: Applying unstaged patch (".concat(exportData.unstagedPatch.length, " chars)..."));
                    unstagedPatchPath = (0, node_path_1.join)((0, node_os_1.tmpdir)(), "sandbox-unstaged-".concat(Date.now(), ".patch"));
                    _d.label = 37;
                case 37:
                    _d.trys.push([37, 40, 41, 43]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(unstagedPatchPath, exportData.unstagedPatch)];
                case 38:
                    _d.sent();
                    return [4 /*yield*/, execFileAsync("git", ["-C", worktreePath, "apply", unstagedPatchPath], {
                            timeout: 60000,
                        })];
                case 39:
                    _d.sent();
                    console.log("[sandbox-import] Unstaged patch applied successfully");
                    return [3 /*break*/, 43];
                case 40:
                    error_2 = _d.sent();
                    console.warn("[sandbox-import] Failed to apply unstaged patch: ".concat(error_2));
                    return [3 /*break*/, 43];
                case 41: return [4 /*yield*/, (0, promises_1.unlink)(unstagedPatchPath).catch(function () { })];
                case 42:
                    _d.sent();
                    return [7 /*endfinally*/];
                case 43: return [3 /*break*/, 45];
                case 44:
                    console.log("[sandbox-import] Step 4: No unstaged patch to apply");
                    _d.label = 45;
                case 45:
                    // 5. Write untracked files
                    console.log("[sandbox-import] Step 5: Writing ".concat(exportData.untrackedFiles.length, " untracked files..."));
                    _i = 0, _b = exportData.untrackedFiles;
                    _d.label = 46;
                case 46:
                    if (!(_i < _b.length)) return [3 /*break*/, 52];
                    file = _b[_i];
                    fullPath = (0, node_path_1.join)(worktreePath, file.path);
                    _d.label = 47;
                case 47:
                    _d.trys.push([47, 50, , 51]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, node_path_1.dirname)(fullPath), { recursive: true })];
                case 48:
                    _d.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, file.content)];
                case 49:
                    _d.sent();
                    console.log("[sandbox-import] Wrote untracked file: ".concat(file.path));
                    return [3 /*break*/, 51];
                case 50:
                    error_3 = _d.sent();
                    console.warn("[sandbox-import] Failed to write untracked file ".concat(file.path, ": ").concat(error_3));
                    return [3 /*break*/, 51];
                case 51:
                    _i++;
                    return [3 /*break*/, 46];
                case 52:
                    console.log("[sandbox-import] applySandboxGitState completed successfully!");
                    return [2 /*return*/, { success: true }];
                case 53:
                    error_4 = _d.sent();
                    errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                    console.error("[sandbox-import] applySandboxGitState FAILED: ".concat(errorMessage));
                    console.error("[sandbox-import] Stack:", error_4);
                    return [2 /*return*/, { success: false, error: errorMessage }];
                case 54: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch and apply sandbox export to a worktree
 * @param fullExport - If true, exports entire repo (for cloning to empty local repo)
 * @param sessionId - If provided, only export this specific Claude session (for subchat import)
 */
function importSandboxToWorktree(worktreePath_1, apiUrl_1, sandboxId_1, token_1) {
    return __awaiter(this, arguments, void 0, function (worktreePath, apiUrl, sandboxId, token, fullExport, sessionId) {
        var queryParams, queryString, exportUrl, response, exportData, gitResult, error_5, errorMessage;
        var _a;
        if (fullExport === void 0) { fullExport = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    queryParams = [];
                    if (fullExport)
                        queryParams.push("full=true");
                    if (sessionId)
                        queryParams.push("sessionId=".concat(sessionId));
                    queryString = queryParams.length > 0 ? "?".concat(queryParams.join("&")) : "";
                    exportUrl = "".concat(apiUrl, "/api/agents/sandbox/").concat(sandboxId, "/export").concat(queryString);
                    console.log("[OPEN-LOCALLY] Fetching sandbox export from: ".concat(exportUrl));
                    return [4 /*yield*/, fetch(exportUrl, {
                            method: "GET",
                            headers: {
                                "X-Desktop-Token": token,
                                Accept: "application/x-ndjson",
                            },
                        })];
                case 1:
                    response = _b.sent();
                    console.log("[sandbox-import] Export response status: ".concat(response.status, " ").concat(response.statusText));
                    if (!response.ok) {
                        throw new Error("Export API returned ".concat(response.status, ": ").concat(response.statusText));
                    }
                    if (!response.body) {
                        throw new Error("Export API returned no body");
                    }
                    // Parse the export stream
                    console.log("[sandbox-import] Parsing export stream...");
                    return [4 /*yield*/, parseExportStream(response.body)];
                case 2:
                    exportData = _b.sent();
                    console.log("[sandbox-import] Export data parsed:", {
                        branch: exportData.meta.branch,
                        baseCommit: exportData.meta.baseCommit,
                        headCommit: exportData.meta.headCommit,
                        isFullExport: exportData.meta.isFullExport,
                        remoteUrl: exportData.meta.remoteUrl,
                        hasBundle: !!exportData.bundle,
                        bundleSize: (_a = exportData.bundle) === null || _a === void 0 ? void 0 : _a.length,
                        hasStagedPatch: !!exportData.stagedPatch,
                        hasUnstagedPatch: !!exportData.unstagedPatch,
                        untrackedFilesCount: exportData.untrackedFiles.length,
                        claudeSessionsCount: exportData.claudeSessions.length,
                    });
                    // Apply the git state
                    console.log("[sandbox-import] Applying git state to worktree: ".concat(worktreePath));
                    return [4 /*yield*/, applySandboxGitState(worktreePath, exportData)];
                case 3:
                    gitResult = _b.sent();
                    // Return claudeSessions along with git result
                    return [2 /*return*/, __assign(__assign({}, gitResult), { claudeSessions: exportData.claudeSessions })];
                case 4:
                    error_5 = _b.sent();
                    errorMessage = error_5 instanceof Error ? error_5.message : String(error_5);
                    console.error("[sandbox-import] Import failed:", errorMessage);
                    return [2 /*return*/, { success: false, error: errorMessage }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
