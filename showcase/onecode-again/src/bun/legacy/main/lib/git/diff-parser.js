"use strict";
/**
 * Diff Parser - Server-side parsing of unified diff format
 *
 * Moved from renderer to main process to:
 * - Avoid blocking UI on large diffs
 * - Single source of truth for diff parsing logic
 * - Enable prefetching file contents in the same request
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileLang = getFileLang;
exports.splitUnifiedDiffByFile = splitUnifiedDiffByFile;
/**
 * Language mapping for syntax highlighting
 */
var LANG_MAP = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    html: "html",
    htm: "html",
    xml: "xml",
    svg: "xml",
    yaml: "yaml",
    yml: "yaml",
    py: "python",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
    vue: "vue",
    svelte: "svelte",
};
/**
 * Get language identifier for syntax highlighting
 */
function getFileLang(filePath) {
    var _a;
    if (!filePath || filePath === "/dev/null")
        return null;
    var ext = ((_a = filePath.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    return LANG_MAP[ext] || ext || null;
}
/**
 * Validate if a diff hunk has valid structure
 * This is a lenient validator - only reject clearly malformed diffs
 */
function validateDiffHunk(diffText) {
    if (!diffText || diffText.trim().length === 0) {
        return { valid: false, reason: "empty diff" };
    }
    var lines = diffText.split("\n");
    var hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/;
    // Find the --- and +++ lines
    var minusLineIdx = lines.findIndex(function (l) { return l.startsWith("--- "); });
    var plusLineIdx = lines.findIndex(function (l) { return l.startsWith("+++ "); });
    // Must have both header lines
    if (minusLineIdx === -1 || plusLineIdx === -1) {
        return { valid: false, reason: "missing header lines" };
    }
    // +++ must come after ---
    if (plusLineIdx <= minusLineIdx) {
        return { valid: false, reason: "header order wrong" };
    }
    // Check for special cases that don't have hunks
    if (diffText.includes("new mode") ||
        diffText.includes("old mode") ||
        diffText.includes("rename from") ||
        diffText.includes("rename to") ||
        diffText.includes("Binary files")) {
        return { valid: true };
    }
    // Must have at least one hunk header after +++ line
    var hasHunk = false;
    for (var i = plusLineIdx + 1; i < lines.length; i++) {
        if (hunkHeaderRegex.test(lines[i])) {
            hasHunk = true;
            break;
        }
    }
    if (!hasHunk) {
        return { valid: false, reason: "no hunk headers found" };
    }
    return { valid: true };
}
/**
 * Split a unified diff into separate file diffs
 */
function splitUnifiedDiffByFile(diffText) {
    if (!diffText || !diffText.trim()) {
        return [];
    }
    var normalized = diffText.replace(/\r\n/g, "\n");
    var lines = normalized.split("\n");
    var blocks = [];
    var current = [];
    var pushCurrent = function () {
        var text = current.join("\n").trim();
        if (text &&
            (text.startsWith("diff --git ") ||
                text.startsWith("--- ") ||
                text.startsWith("+++ ") ||
                text.startsWith("Binary files ") ||
                text.includes("\n+++ ") ||
                text.includes("\nBinary files "))) {
            blocks.push(text);
        }
        current = [];
    };
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.startsWith("diff --git ") && current.length > 0) {
            pushCurrent();
        }
        current.push(line);
    }
    pushCurrent();
    return blocks.map(function (blockText, index) {
        var blockLines = blockText.split("\n");
        var oldPath = "";
        var newPath = "";
        var isBinary = false;
        var additions = 0;
        var deletions = 0;
        for (var _i = 0, blockLines_1 = blockLines; _i < blockLines_1.length; _i++) {
            var line = blockLines_1[_i];
            if (line.startsWith("Binary files ") && line.endsWith(" differ")) {
                isBinary = true;
            }
            if (line.startsWith("--- ")) {
                var raw = line.slice(4).trim();
                oldPath = raw.startsWith("a/") ? raw.slice(2) : raw;
            }
            if (line.startsWith("+++ ")) {
                var raw = line.slice(4).trim();
                newPath = raw.startsWith("b/") ? raw.slice(2) : raw;
            }
            if (line.startsWith("+") && !line.startsWith("+++ ")) {
                additions += 1;
            }
            else if (line.startsWith("-") && !line.startsWith("--- ")) {
                deletions += 1;
            }
        }
        var key = oldPath || newPath ? "".concat(oldPath, "->").concat(newPath) : "file-".concat(index);
        var validation = isBinary ? { valid: true } : validateDiffHunk(blockText);
        var isValid = validation.valid;
        var isNewFile = oldPath === "/dev/null";
        var isDeletedFile = newPath === "/dev/null";
        var actualPath = isNewFile ? newPath : isDeletedFile ? oldPath : newPath || oldPath;
        var fileLang = getFileLang(actualPath);
        return {
            key: key,
            oldPath: oldPath,
            newPath: newPath,
            diffText: blockText,
            isBinary: isBinary,
            additions: additions,
            deletions: deletions,
            isValid: isValid,
            fileLang: fileLang,
            isNewFile: isNewFile,
            isDeletedFile: isDeletedFile,
        };
    });
}
