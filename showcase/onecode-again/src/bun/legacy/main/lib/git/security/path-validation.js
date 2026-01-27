"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathValidationError = void 0;
exports.assertRegisteredWorktree = assertRegisteredWorktree;
exports.getRegisteredChat = getRegisteredChat;
exports.validateRelativePath = validateRelativePath;
exports.resolvePathInWorktree = resolvePathInWorktree;
exports.assertValidGitPath = assertValidGitPath;
var node_path_1 = require("node:path");
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("../../db");
/**
 * Error thrown when path validation fails.
 * Includes a code for programmatic handling.
 */
var PathValidationError = /** @class */ (function (_super) {
    __extends(PathValidationError, _super);
    function PathValidationError(message, code) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = "PathValidationError";
        return _this;
    }
    return PathValidationError;
}(Error));
exports.PathValidationError = PathValidationError;
/**
 * Validates that a workspace path is registered in database.
 * This is THE critical security boundary.
 *
 * Accepts:
 * - Worktree paths (from chats.worktreePath)
 * - Project paths (from projects.path)
 *
 * @throws PathValidationError if path is not registered
 */
function assertRegisteredWorktree(workspacePath) {
    var db = (0, db_1.getDatabase)();
    // Check chats.worktreePath first (most common case)
    var chatExists = db
        .select()
        .from(db_1.chats)
        .where((0, drizzle_orm_1.eq)(db_1.chats.worktreePath, workspacePath))
        .get();
    if (chatExists) {
        return;
    }
    // Check projects.path for direct project access
    var projectExists = db
        .select()
        .from(db_1.projects)
        .where((0, drizzle_orm_1.eq)(db_1.projects.path, workspacePath))
        .get();
    if (projectExists) {
        return;
    }
    throw new PathValidationError("Workspace path not registered in database", "UNREGISTERED_WORKTREE");
}
/**
 * Gets the chat record if registered. Returns record for updates.
 *
 * @throws PathValidationError if chat is not registered
 */
function getRegisteredChat(worktreePath) {
    var db = (0, db_1.getDatabase)();
    var chat = db
        .select()
        .from(db_1.chats)
        .where((0, drizzle_orm_1.eq)(db_1.chats.worktreePath, worktreePath))
        .get();
    if (!chat) {
        throw new PathValidationError("Chat not registered in database", "UNREGISTERED_WORKTREE");
    }
    return chat;
}
/**
 * Validates a relative file path for safety.
 * Rejects absolute paths and path traversal attempts.
 *
 * @throws PathValidationError if path is invalid
 */
function validateRelativePath(filePath, options) {
    if (options === void 0) { options = {}; }
    var _a = options.allowRoot, allowRoot = _a === void 0 ? false : _a;
    // Reject absolute paths
    if ((0, node_path_1.isAbsolute)(filePath)) {
        throw new PathValidationError("Absolute paths are not allowed", "ABSOLUTE_PATH");
    }
    var normalized = (0, node_path_1.normalize)(filePath);
    var segments = normalized.split(node_path_1.sep);
    // Reject ".." as a path segment (allows "..foo" directories)
    if (segments.includes("..")) {
        throw new PathValidationError("Path traversal not allowed", "PATH_TRAVERSAL");
    }
    // Reject root path unless explicitly allowed
    if (!allowRoot && (normalized === "" || normalized === ".")) {
        throw new PathValidationError("Cannot target worktree root", "INVALID_TARGET");
    }
}
/**
 * Validates and resolves a path within a worktree. Sync, simple.
 *
 * @param worktreePath - The worktree base path
 * @param filePath - The relative file path to validate
 * @param options - Validation options
 * @returns The resolved full path
 * @throws PathValidationError if path is invalid
 */
function resolvePathInWorktree(worktreePath, filePath, options) {
    if (options === void 0) { options = {}; }
    validateRelativePath(filePath, options);
    // Use resolve to handle any worktreePath (relative or absolute)
    return (0, node_path_1.resolve)(worktreePath, (0, node_path_1.normalize)(filePath));
}
/**
 * Validates a path for git commands. Lighter check that allows root.
 *
 * @throws PathValidationError if path is invalid
 */
function assertValidGitPath(filePath) {
    validateRelativePath(filePath, { allowRoot: true });
}
