"use strict";
/**
 * Security module for changes routers.
 *
 * Security model:
 * - PRIMARY: Worktree must be registered in localDb
 * - SECONDARY: Paths validated for traversal attempts
 *
 * See path-validation.ts header for full threat model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureFs = exports.validateRelativePath = exports.resolvePathInWorktree = exports.PathValidationError = exports.getRegisteredChat = exports.assertValidGitPath = exports.assertRegisteredWorktree = exports.gitUnstageFiles = exports.gitUnstageFile = exports.gitUnstageAll = exports.gitSwitchBranch = exports.gitStageFiles = exports.gitStageFile = exports.gitStageAll = exports.gitCheckoutFiles = exports.gitCheckoutFile = void 0;
var git_commands_1 = require("./git-commands");
Object.defineProperty(exports, "gitCheckoutFile", { enumerable: true, get: function () { return git_commands_1.gitCheckoutFile; } });
Object.defineProperty(exports, "gitCheckoutFiles", { enumerable: true, get: function () { return git_commands_1.gitCheckoutFiles; } });
Object.defineProperty(exports, "gitStageAll", { enumerable: true, get: function () { return git_commands_1.gitStageAll; } });
Object.defineProperty(exports, "gitStageFile", { enumerable: true, get: function () { return git_commands_1.gitStageFile; } });
Object.defineProperty(exports, "gitStageFiles", { enumerable: true, get: function () { return git_commands_1.gitStageFiles; } });
Object.defineProperty(exports, "gitSwitchBranch", { enumerable: true, get: function () { return git_commands_1.gitSwitchBranch; } });
Object.defineProperty(exports, "gitUnstageAll", { enumerable: true, get: function () { return git_commands_1.gitUnstageAll; } });
Object.defineProperty(exports, "gitUnstageFile", { enumerable: true, get: function () { return git_commands_1.gitUnstageFile; } });
Object.defineProperty(exports, "gitUnstageFiles", { enumerable: true, get: function () { return git_commands_1.gitUnstageFiles; } });
var path_validation_1 = require("./path-validation");
Object.defineProperty(exports, "assertRegisteredWorktree", { enumerable: true, get: function () { return path_validation_1.assertRegisteredWorktree; } });
Object.defineProperty(exports, "assertValidGitPath", { enumerable: true, get: function () { return path_validation_1.assertValidGitPath; } });
Object.defineProperty(exports, "getRegisteredChat", { enumerable: true, get: function () { return path_validation_1.getRegisteredChat; } });
Object.defineProperty(exports, "PathValidationError", { enumerable: true, get: function () { return path_validation_1.PathValidationError; } });
Object.defineProperty(exports, "resolvePathInWorktree", { enumerable: true, get: function () { return path_validation_1.resolvePathInWorktree; } });
Object.defineProperty(exports, "validateRelativePath", { enumerable: true, get: function () { return path_validation_1.validateRelativePath; } });
var secure_fs_1 = require("./secure-fs");
Object.defineProperty(exports, "secureFs", { enumerable: true, get: function () { return secure_fs_1.secureFs; } });
