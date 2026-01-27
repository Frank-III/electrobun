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
exports.secureFs = void 0;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var path_validation_1 = require("./path-validation");
/**
 * Secure filesystem operations with built-in validation.
 *
 * Each operation:
 * 1. Validates worktree is registered (security boundary)
 * 2. Validates path doesn't escape worktree (defense in depth)
 * 3. For writes: validates target is not a symlink escaping worktree
 * 4. Performs the filesystem operation
 *
 * See path-validation.ts for the full security model and threat assumptions.
 */
/**
 * Check if a resolved path is within the worktree boundary using path.relative().
 * This is safer than string prefix matching which can have boundary bugs.
 */
function isPathWithinWorktree(worktreeReal, targetReal) {
    if (targetReal === worktreeReal) {
        return true;
    }
    var relativePath = (0, node_path_1.relative)(worktreeReal, targetReal);
    // Check if path escapes worktree:
    // - ".." means direct parent
    // - "../" prefix means ancestor escape (use sep for cross-platform)
    // - Absolute path means completely outside
    // Note: Don't use startsWith("..") as it incorrectly catches "..config" directories
    // Note: Empty relativePath ("") case is already handled by the equality check above
    var escapesWorktree = relativePath === ".." ||
        relativePath.startsWith("..".concat(node_path_1.sep)) ||
        (0, node_path_1.isAbsolute)(relativePath);
    return !escapesWorktree;
}
/**
 * Validate that the parent directory chain stays within the worktree.
 * Handles the case where the target file doesn't exist yet (ENOENT).
 *
 * This function walks up the directory tree to find the first existing
 * ancestor and validates it. It also detects dangling symlinks by checking
 * if any component is a symlink pointing outside the worktree.
 *
 * @throws PathValidationError if any ancestor escapes the worktree
 */
function assertParentInWorktree(worktreePath, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var worktreeReal, currentPath, stats, linkTarget, resolvedTarget, targetReal, error_1, targetRelative, parentReal, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.realpath)(worktreePath)];
                case 1:
                    worktreeReal = _a.sent();
                    currentPath = (0, node_path_1.dirname)(fullPath);
                    _a.label = 2;
                case 2:
                    if (!(currentPath !== (0, node_path_1.dirname)(currentPath))) return [3 /*break*/, 14];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 12, , 13]);
                    return [4 /*yield*/, (0, promises_1.lstat)(currentPath)];
                case 4:
                    stats = _a.sent();
                    if (!stats.isSymbolicLink()) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, promises_1.readlink)(currentPath)];
                case 5:
                    linkTarget = _a.sent();
                    resolvedTarget = (0, node_path_1.isAbsolute)(linkTarget)
                        ? linkTarget
                        : (0, node_path_1.resolve)((0, node_path_1.dirname)(currentPath), linkTarget);
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.realpath)(resolvedTarget)];
                case 7:
                    targetReal = _a.sent();
                    if (!isPathWithinWorktree(worktreeReal, targetReal)) {
                        throw new path_validation_1.PathValidationError("Symlink in path resolves outside the worktree", "SYMLINK_ESCAPE");
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    // Target doesn't exist - check if the resolved target path
                    // would be within worktree if it existed
                    if (error_1 instanceof Error &&
                        "code" in error_1 &&
                        error_1.code === "ENOENT") {
                        targetRelative = (0, node_path_1.relative)(worktreeReal, resolvedTarget);
                        // Use sep-aware check to avoid false positives on "..config" dirs
                        if (targetRelative === ".." ||
                            targetRelative.startsWith("..".concat(node_path_1.sep)) ||
                            (0, node_path_1.isAbsolute)(targetRelative)) {
                            throw new path_validation_1.PathValidationError("Dangling symlink points outside the worktree", "SYMLINK_ESCAPE");
                        }
                        // Target would be within worktree if it existed - continue
                        return [2 /*return*/];
                    }
                    if (error_1 instanceof path_validation_1.PathValidationError) {
                        throw error_1;
                    }
                    // Other errors - fail closed for security
                    throw new path_validation_1.PathValidationError("Cannot validate symlink target", "SYMLINK_ESCAPE");
                case 9: return [2 /*return*/]; // Symlink validated successfully
                case 10: return [4 /*yield*/, (0, promises_1.realpath)(currentPath)];
                case 11:
                    parentReal = _a.sent();
                    if (!isPathWithinWorktree(worktreeReal, parentReal)) {
                        throw new path_validation_1.PathValidationError("Parent directory resolves outside the worktree", "SYMLINK_ESCAPE");
                    }
                    return [2 /*return*/]; // Found valid ancestor
                case 12:
                    error_2 = _a.sent();
                    if (error_2 instanceof path_validation_1.PathValidationError) {
                        throw error_2;
                    }
                    if (error_2 instanceof Error &&
                        "code" in error_2 &&
                        error_2.code === "ENOENT") {
                        // This ancestor doesn't exist either, keep walking up
                        currentPath = (0, node_path_1.dirname)(currentPath);
                        return [3 /*break*/, 2];
                    }
                    // Other errors (EACCES, ENOTDIR, etc.) - fail closed for security
                    throw new path_validation_1.PathValidationError("Cannot validate path ancestry", "SYMLINK_ESCAPE");
                case 13: return [3 /*break*/, 2];
                case 14: 
                // Reached filesystem root without finding valid ancestor
                throw new path_validation_1.PathValidationError("Could not validate path ancestry within worktree", "SYMLINK_ESCAPE");
            }
        });
    });
}
/**
 * Check if the resolved realpath stays within the worktree boundary.
 * Prevents symlink escape attacks where a symlink points outside the worktree.
 *
 * @throws PathValidationError if realpath escapes worktree
 */
function assertRealpathInWorktree(worktreePath, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var real, worktreeReal, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 6]);
                    return [4 /*yield*/, (0, promises_1.realpath)(fullPath)];
                case 1:
                    real = _a.sent();
                    return [4 /*yield*/, (0, promises_1.realpath)(worktreePath)];
                case 2:
                    worktreeReal = _a.sent();
                    // Use path.relative for safer boundary checking
                    if (!isPathWithinWorktree(worktreeReal, real)) {
                        throw new path_validation_1.PathValidationError("File is a symlink pointing outside the worktree", "SYMLINK_ESCAPE");
                    }
                    return [3 /*break*/, 6];
                case 3:
                    error_3 = _a.sent();
                    if (!(error_3 instanceof Error && "code" in error_3 && error_3.code === "ENOENT")) return [3 /*break*/, 5];
                    return [4 /*yield*/, assertDanglingSymlinkSafe(worktreePath, fullPath)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5:
                    // Re-throw PathValidationError
                    if (error_3 instanceof path_validation_1.PathValidationError) {
                        throw error_3;
                    }
                    // Other errors (permission denied, etc.) - fail closed for security
                    throw new path_validation_1.PathValidationError("Cannot validate file path", "SYMLINK_ESCAPE");
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle the ENOENT case: check if fullPath is a dangling symlink pointing outside
 * the worktree, or if it truly doesn't exist (in which case validate parent chain).
 *
 * Attack scenario this prevents:
 * - Repo contains `docs/config.yml` → symlink to `~/.ssh/some_new_file` (doesn't exist)
 * - realpath() fails with ENOENT (target missing)
 * - Without this check, we'd only validate parent (`docs/`) which is valid
 * - Write would follow symlink and create `~/.ssh/some_new_file`
 *
 * @throws PathValidationError if symlink escapes worktree
 */
function assertDanglingSymlinkSafe(worktreePath, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var worktreeReal, stats, linkTarget, resolvedTarget, targetRelative, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.realpath)(worktreePath)];
                case 1:
                    worktreeReal = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 10]);
                    return [4 /*yield*/, (0, promises_1.lstat)(fullPath)];
                case 3:
                    stats = _a.sent();
                    if (!stats.isSymbolicLink()) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.readlink)(fullPath)];
                case 4:
                    linkTarget = _a.sent();
                    resolvedTarget = (0, node_path_1.isAbsolute)(linkTarget)
                        ? linkTarget
                        : (0, node_path_1.resolve)((0, node_path_1.dirname)(fullPath), linkTarget);
                    targetRelative = (0, node_path_1.relative)(worktreeReal, resolvedTarget);
                    if (targetRelative === ".." ||
                        targetRelative.startsWith("..".concat(node_path_1.sep)) ||
                        (0, node_path_1.isAbsolute)(targetRelative)) {
                        throw new path_validation_1.PathValidationError("Dangling symlink points outside the worktree", "SYMLINK_ESCAPE");
                    }
                    // Dangling symlink points within worktree - allow the operation
                    return [2 /*return*/];
                case 5: 
                // Not a symlink but lstat succeeded - weird state, but validate parent chain
                return [4 /*yield*/, assertParentInWorktree(worktreePath, fullPath)];
                case 6:
                    // Not a symlink but lstat succeeded - weird state, but validate parent chain
                    _a.sent();
                    return [3 /*break*/, 10];
                case 7:
                    error_4 = _a.sent();
                    if (error_4 instanceof path_validation_1.PathValidationError) {
                        throw error_4;
                    }
                    if (!(error_4 instanceof Error && "code" in error_4 && error_4.code === "ENOENT")) return [3 /*break*/, 9];
                    // Path truly doesn't exist (not even as a symlink) - validate parent chain
                    return [4 /*yield*/, assertParentInWorktree(worktreePath, fullPath)];
                case 8:
                    // Path truly doesn't exist (not even as a symlink) - validate parent chain
                    _a.sent();
                    return [2 /*return*/];
                case 9: 
                // Other errors - fail closed
                throw new path_validation_1.PathValidationError("Cannot validate path", "SYMLINK_ESCAPE");
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.secureFs = {
    /**
     * Read a file within a worktree.
     *
     * SECURITY: Enforces symlink-escape check. If the file is a symlink
     * pointing outside the worktree, this will throw PathValidationError.
     *
     * @throws PathValidationError with code "SYMLINK_ESCAPE" if file escapes worktree
     */
    readFile: function (worktreePath_1, filePath_1) {
        return __awaiter(this, arguments, void 0, function (worktreePath, filePath, encoding) {
            var fullPath;
            if (encoding === void 0) { encoding = "utf-8"; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        // Block reads through symlinks that escape the worktree
                        return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 1:
                        // Block reads through symlinks that escape the worktree
                        _a.sent();
                        return [2 /*return*/, (0, promises_1.readFile)(fullPath, encoding)];
                }
            });
        });
    },
    /**
     * Read a file as a Buffer within a worktree.
     *
     * SECURITY: Enforces symlink-escape check. If the file is a symlink
     * pointing outside the worktree, this will throw PathValidationError.
     *
     * @throws PathValidationError with code "SYMLINK_ESCAPE" if file escapes worktree
     */
    readFileBuffer: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        // Block reads through symlinks that escape the worktree
                        return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 1:
                        // Block reads through symlinks that escape the worktree
                        _a.sent();
                        return [2 /*return*/, (0, promises_1.readFile)(fullPath)];
                }
            });
        });
    },
    /**
     * Write content to a file within a worktree.
     *
     * SECURITY: Blocks writes if the file is a symlink pointing outside
     * the worktree. This prevents malicious repos from tricking users
     * into overwriting sensitive files like ~/.bashrc.
     *
     * @throws PathValidationError with code "SYMLINK_ESCAPE" if target escapes worktree
     */
    writeFile: function (worktreePath, filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        // Block writes through symlinks that escape the worktree
                        return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 1:
                        // Block writes through symlinks that escape the worktree
                        _a.sent();
                        return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, content, "utf-8")];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Delete a file or directory within a worktree.
     *
     * SECURITY: Validates the real path is within worktree before deletion.
     * - Symlinks: Deletes the link itself (safe - link lives in worktree)
     * - Files/dirs: Validates realpath then deletes
     *
     * This prevents symlink escape attacks where a malicious repo contains
     * `docs -> /Users/victim` and a delete of `docs/file` would delete
     * `/Users/victim/file`.
     */
    delete: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, stats, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath, {
                            allowRoot: false,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, promises_1.lstat)(fullPath)];
                    case 2:
                        stats = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        // File doesn't exist - idempotent delete, nothing to do
                        if (error_5 instanceof Error &&
                            "code" in error_5 &&
                            error_5.code === "ENOENT") {
                            return [2 /*return*/];
                        }
                        throw error_5;
                    case 4:
                        if (!stats.isSymbolicLink()) return [3 /*break*/, 6];
                        // Symlink - safe to delete the link itself (it lives in the worktree).
                        // Don't use recursive as we're just removing the symlink file.
                        return [4 /*yield*/, (0, promises_1.rm)(fullPath)];
                    case 5:
                        // Symlink - safe to delete the link itself (it lives in the worktree).
                        // Don't use recursive as we're just removing the symlink file.
                        _a.sent();
                        return [2 /*return*/];
                    case 6: 
                    // Regular file or directory - validate realpath is within worktree.
                    // This catches path traversal via symlinked parent components:
                    // e.g., `docs -> /victim`, delete `docs/file` → realpath is `/victim/file`
                    return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 7:
                        // Regular file or directory - validate realpath is within worktree.
                        // This catches path traversal via symlinked parent components:
                        // e.g., `docs -> /victim`, delete `docs/file` → realpath is `/victim/file`
                        _a.sent();
                        // Safe to delete - realpath confirmed within worktree.
                        // Note: Symlinks INSIDE a directory are safe - rm deletes the links, not targets.
                        return [4 /*yield*/, (0, promises_1.rm)(fullPath, { recursive: true, force: true })];
                    case 8:
                        // Safe to delete - realpath confirmed within worktree.
                        // Note: Symlinks INSIDE a directory are safe - rm deletes the links, not targets.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get file stats within a worktree.
     *
     * Uses `stat` (follows symlinks) to get the real file size.
     * Validates that the resolved path stays within the worktree boundary.
     */
    stat: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, (0, promises_1.stat)(fullPath)];
                }
            });
        });
    },
    /**
     * Get file stats without following symlinks.
     *
     * Use this when you need to know if something IS a symlink.
     * For size checks, prefer `stat` instead.
     */
    lstat: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                return [2 /*return*/, (0, promises_1.lstat)(fullPath)];
            });
        });
    },
    /**
     * Check if a file exists within a worktree.
     *
     * Returns false for non-existent files, symlink escapes, and validation failures.
     */
    exists: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        return [4 /*yield*/, assertRealpathInWorktree(worktreePath, fullPath)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Check if a file is a symlink that points outside the worktree.
     *
     * WARNING: This is a best-effort helper for UI warnings only.
     * It returns `false` on errors, so it is NOT suitable as a security gate.
     * For security enforcement, use the read/write methods which call
     * assertRealpathInWorktree internally.
     *
     * @returns true if the file is definitely a symlink escaping the worktree,
     *          false if not escaping OR if we can't determine (errors)
     */
    isSymlinkEscaping: function (worktreePath, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, stats, real, worktreeReal, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        (0, path_validation_1.assertRegisteredWorktree)(worktreePath);
                        fullPath = (0, path_validation_1.resolvePathInWorktree)(worktreePath, filePath);
                        return [4 /*yield*/, (0, promises_1.lstat)(fullPath)];
                    case 1:
                        stats = _b.sent();
                        if (!stats.isSymbolicLink()) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, (0, promises_1.realpath)(fullPath)];
                    case 2:
                        real = _b.sent();
                        return [4 /*yield*/, (0, promises_1.realpath)(worktreePath)];
                    case 3:
                        worktreeReal = _b.sent();
                        return [2 /*return*/, !isPathWithinWorktree(worktreeReal, real)];
                    case 4:
                        _a = _b.sent();
                        // If we can't determine, assume not escaping (file may not exist)
                        // NOTE: This makes this method unsuitable as a security gate
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
};
