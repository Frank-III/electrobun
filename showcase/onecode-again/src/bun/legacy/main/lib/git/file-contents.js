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
exports.createFileContentsRouter = void 0;
var detect_language_1 = require("../../../shared/detect-language");
var simple_git_1 = require("simple-git");
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var security_1 = require("./security");
var cache_1 = require("./cache");
/** Maximum file size for reading (2 MiB) */
var MAX_FILE_SIZE = 2 * 1024 * 1024;
/** Bytes to scan for binary detection */
var BINARY_CHECK_SIZE = 8192;
/**
 * Detects if a buffer contains binary content by checking for NUL bytes
 */
function isBinaryContent(buffer) {
    var checkLength = Math.min(buffer.length, BINARY_CHECK_SIZE);
    for (var i = 0; i < checkLength; i++) {
        if (buffer[i] === 0) {
            return true;
        }
    }
    return false;
}
var createFileContentsRouter = function () {
    return (0, trpc_1.router)({
        getFileContents: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            filePath: zod_1.z.string(),
            oldPath: zod_1.z.string().optional(),
            category: zod_1.z.enum(["against-base", "committed", "staged", "unstaged"]),
            commitHash: zod_1.z.string().optional(),
            defaultBranch: zod_1.z.string().optional(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var cacheKey, cached, parsed, git, defaultBranch, originalPath, _c, original, modified, result;
            var input = _b.input;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, security_1.assertRegisteredWorktree)(input.worktreePath);
                        cacheKey = "".concat(input.filePath, ":").concat(input.category, ":").concat(input.commitHash || "working", ":").concat(input.oldPath || "");
                        cached = cache_1.gitCache.getFileContent(input.worktreePath, cacheKey);
                        if (cached) {
                            try {
                                parsed = JSON.parse(cached);
                                console.log("[getFileContents] Cache hit for:", input.filePath);
                                return [2 /*return*/, parsed];
                            }
                            catch (_e) {
                                // Invalid cache entry, continue to fetch
                            }
                        }
                        console.log("[getFileContents] Cache miss, fetching:", input.filePath);
                        git = (0, simple_git_1.default)(input.worktreePath);
                        defaultBranch = input.defaultBranch || "main";
                        originalPath = input.oldPath || input.filePath;
                        return [4 /*yield*/, getFileVersions(git, input.worktreePath, input.filePath, originalPath, input.category, defaultBranch, input.commitHash)];
                    case 1:
                        _c = _d.sent(), original = _c.original, modified = _c.modified;
                        result = {
                            original: original,
                            modified: modified,
                            language: (0, detect_language_1.detectLanguage)(input.filePath),
                        };
                        // Store in cache
                        cache_1.gitCache.setFileContent(input.worktreePath, cacheKey, JSON.stringify(result));
                        return [2 /*return*/, result];
                }
            });
        }); }),
        saveFile: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            filePath: zod_1.z.string(),
            content: zod_1.z.string(),
        }))
            .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, security_1.secureFs.writeFile(input.worktreePath, input.filePath, input.content)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); }),
        /**
         * Read a working tree file safely with size cap and binary detection.
         * Used for File Viewer raw/rendered modes.
         */
        readWorkingFile: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            filePath: zod_1.z.string(),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var stats, buffer, error_1;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, security_1.secureFs.stat(input.worktreePath, input.filePath)];
                    case 1:
                        stats = _c.sent();
                        if (stats.size > MAX_FILE_SIZE) {
                            return [2 /*return*/, { ok: false, reason: "too-large" }];
                        }
                        return [4 /*yield*/, security_1.secureFs.readFileBuffer(input.worktreePath, input.filePath)];
                    case 2:
                        buffer = _c.sent();
                        if (isBinaryContent(buffer)) {
                            return [2 /*return*/, { ok: false, reason: "binary" }];
                        }
                        return [2 /*return*/, {
                                ok: true,
                                content: buffer.toString("utf-8"),
                                truncated: false,
                                byteLength: buffer.length,
                            }];
                    case 3:
                        error_1 = _c.sent();
                        if (error_1 instanceof security_1.PathValidationError) {
                            if (error_1.code === "SYMLINK_ESCAPE") {
                                return [2 /*return*/, { ok: false, reason: "symlink-escape" }];
                            }
                            return [2 /*return*/, { ok: false, reason: "outside-worktree" }];
                        }
                        return [2 /*return*/, { ok: false, reason: "not-found" }];
                    case 4: return [2 /*return*/];
                }
            });
        }); }),
        /**
         * Read multiple working tree files in a single IPC call.
         * Used for batch prefetching file contents for diff view.
         */
        readMultipleWorkingFiles: trpc_1.publicProcedure
            .input(zod_1.z.object({
            worktreePath: zod_1.z.string(),
            files: zod_1.z.array(zod_1.z.object({
                key: zod_1.z.string(),
                filePath: zod_1.z.string(),
            })),
        }))
            .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var results;
            var input = _b.input;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = {};
                        // Read all files in parallel within the same IPC call
                        return [4 /*yield*/, Promise.all(input.files.map(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                                var stats, buffer, _c;
                                var key = _b.key, filePath = _b.filePath;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _d.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, security_1.secureFs.stat(input.worktreePath, filePath)];
                                        case 1:
                                            stats = _d.sent();
                                            if (stats.size > MAX_FILE_SIZE) {
                                                results[key] = { ok: false };
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, security_1.secureFs.readFileBuffer(input.worktreePath, filePath)];
                                        case 2:
                                            buffer = _d.sent();
                                            if (isBinaryContent(buffer)) {
                                                results[key] = { ok: false };
                                                return [2 /*return*/];
                                            }
                                            results[key] = {
                                                ok: true,
                                                content: buffer.toString("utf-8"),
                                            };
                                            return [3 /*break*/, 4];
                                        case 3:
                                            _c = _d.sent();
                                            results[key] = { ok: false };
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        // Read all files in parallel within the same IPC call
                        _c.sent();
                        return [2 /*return*/, results];
                }
            });
        }); }),
    });
};
exports.createFileContentsRouter = createFileContentsRouter;
function getFileVersions(git, worktreePath, filePath, originalPath, category, defaultBranch, commitHash) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (category) {
                case "against-base":
                    return [2 /*return*/, getAgainstBaseVersions(git, filePath, originalPath, defaultBranch)];
                case "committed":
                    if (!commitHash) {
                        throw new Error("commitHash required for committed category");
                    }
                    return [2 /*return*/, getCommittedVersions(git, filePath, originalPath, commitHash)];
                case "staged":
                    return [2 /*return*/, getStagedVersions(git, filePath, originalPath)];
                case "unstaged":
                    return [2 /*return*/, getUnstagedVersions(git, worktreePath, filePath, originalPath)];
            }
            return [2 /*return*/];
        });
    });
}
/** Helper to safely get git show content with size limit and memory protection */
function safeGitShow(git, spec) {
    return __awaiter(this, void 0, void 0, function () {
        var sizeOutput, blobSize, _a, content, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, git.raw(["cat-file", "-s", spec])];
                case 2:
                    sizeOutput = _c.sent();
                    blobSize = Number.parseInt(sizeOutput.trim(), 10);
                    if (!Number.isNaN(blobSize) && blobSize > MAX_FILE_SIZE) {
                        return [2 /*return*/, "[File content truncated - exceeds ".concat(MAX_FILE_SIZE / 1024 / 1024, "MB limit]")];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, git.show([spec])];
                case 5:
                    content = _c.sent();
                    return [2 /*return*/, content];
                case 6:
                    _b = _c.sent();
                    return [2 /*return*/, ""];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getAgainstBaseVersions(git, filePath, originalPath, defaultBranch) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, original, modified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        safeGitShow(git, "origin/".concat(defaultBranch, ":").concat(originalPath)),
                        safeGitShow(git, "HEAD:".concat(filePath)),
                    ])];
                case 1:
                    _a = _b.sent(), original = _a[0], modified = _a[1];
                    return [2 /*return*/, { original: original, modified: modified }];
            }
        });
    });
}
function getCommittedVersions(git, filePath, originalPath, commitHash) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, original, modified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        safeGitShow(git, "".concat(commitHash, "^:").concat(originalPath)),
                        safeGitShow(git, "".concat(commitHash, ":").concat(filePath)),
                    ])];
                case 1:
                    _a = _b.sent(), original = _a[0], modified = _a[1];
                    return [2 /*return*/, { original: original, modified: modified }];
            }
        });
    });
}
function getStagedVersions(git, filePath, originalPath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, original, modified;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        safeGitShow(git, "HEAD:".concat(originalPath)),
                        safeGitShow(git, ":0:".concat(filePath)),
                    ])];
                case 1:
                    _a = _b.sent(), original = _a[0], modified = _a[1];
                    return [2 /*return*/, { original: original, modified: modified }];
            }
        });
    });
}
function getUnstagedVersions(git, worktreePath, filePath, originalPath) {
    return __awaiter(this, void 0, void 0, function () {
        var original, modified, stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, safeGitShow(git, ":0:".concat(originalPath))];
                case 1:
                    original = _b.sent();
                    if (!!original) return [3 /*break*/, 3];
                    return [4 /*yield*/, safeGitShow(git, "HEAD:".concat(originalPath))];
                case 2:
                    original = _b.sent();
                    _b.label = 3;
                case 3:
                    modified = "";
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, security_1.secureFs.stat(worktreePath, filePath)];
                case 5:
                    stats = _b.sent();
                    if (!(stats.size <= MAX_FILE_SIZE)) return [3 /*break*/, 7];
                    return [4 /*yield*/, security_1.secureFs.readFile(worktreePath, filePath)];
                case 6:
                    modified = _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    modified = "[File content truncated - exceeds ".concat(MAX_FILE_SIZE / 1024 / 1024, "MB limit]");
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    _a = _b.sent();
                    // File doesn't exist or validation failed - that's ok for diff display
                    modified = "";
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, { original: original, modified: modified }];
            }
        });
    });
}
