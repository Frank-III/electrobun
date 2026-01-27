"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeProjectName = sanitizeProjectName;
exports.generateWorktreeFolderName = generateWorktreeFolderName;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var unique_names_generator_1 = require("unique-names-generator");
var landscapes_1 = require("./dictionaries/landscapes");
var MAX_RETRIES = 10;
function generateLandscapeName() {
    return (0, unique_names_generator_1.uniqueNamesGenerator)({
        dictionaries: [unique_names_generator_1.adjectives, landscapes_1.landscapes],
        separator: "-",
        length: 2,
        style: "lowerCase",
    });
}
/**
 * Sanitize a project name for use as a filesystem directory name.
 * Lowercases, replaces spaces/underscores with hyphens, strips special characters.
 * Truncates to 50 characters to stay within filesystem path length limits.
 *
 * Slug collisions (e.g., "My Project" and "my_project" both becoming "my-project")
 * are safe because resolveProjectPathFromWorktree() looks up the full worktree path
 * via the chats table, not just the project folder name.
 */
function sanitizeProjectName(name) {
    var sanitized = name
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9\-.]/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
    return sanitized || "project";
}
/**
 * Generate a unique, human-readable folder name for a worktree.
 * Uses adjective-landscape pattern (e.g., "golden-meadow", "quiet-ridge").
 * Checks the parent directory for existing folders to avoid collisions.
 * Falls back to appending a numeric suffix if random generation keeps colliding.
 *
 * Note: There is a theoretical TOCTOU race between existsSync and the actual
 * git worktree add. In practice this is negligible (180k combinations, single
 * local user). If it occurs, git worktree add fails atomically and the error
 * is caught by createWorktreeForChat().
 */
function generateWorktreeFolderName(parentDir) {
    for (var attempt = 0; attempt < MAX_RETRIES; attempt++) {
        var name_1 = generateLandscapeName();
        if (!(0, node_fs_1.existsSync)((0, node_path_1.join)(parentDir, name_1))) {
            return name_1;
        }
    }
    // Fallback: generate a base name and append numeric suffix
    var baseName = generateLandscapeName();
    for (var suffix = 2; suffix <= 999; suffix++) {
        var name_2 = "".concat(baseName, "-").concat(suffix);
        if (!(0, node_fs_1.existsSync)((0, node_path_1.join)(parentDir, name_2))) {
            return name_2;
        }
    }
    // Absolute fallback: append timestamp
    return "".concat(baseName, "-").concat(Date.now().toString(36));
}
