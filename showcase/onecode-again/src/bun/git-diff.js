"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileLang = getFileLang;
exports.splitUnifiedDiffByFile = splitUnifiedDiffByFile;
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
function getFileLang(filePath) {
    var _a;
    if (!filePath || filePath === "/dev/null")
        return null;
    var ext = ((_a = filePath.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    return LANG_MAP[ext] || ext || null;
}
function validateDiffHunk(diffText) {
    if (!diffText || diffText.trim().length === 0) {
        return { valid: false, reason: "empty diff" };
    }
    var lines = diffText.split("\n");
    var hunkHeaderRegex = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/;
    var minusLineIdx = lines.findIndex(function (l) { return l.startsWith("--- "); });
    var plusLineIdx = lines.findIndex(function (l) { return l.startsWith("+++ "); });
    if (minusLineIdx === -1 || plusLineIdx === -1) {
        return { valid: false, reason: "missing header lines" };
    }
    if (plusLineIdx <= minusLineIdx) {
        return { valid: false, reason: "header order wrong" };
    }
    if (diffText.includes("new mode") ||
        diffText.includes("old mode") ||
        diffText.includes("rename from") ||
        diffText.includes("rename to") ||
        diffText.includes("Binary files")) {
        return { valid: true };
    }
    var hasHunk = false;
    for (var i = plusLineIdx + 1; i < lines.length; i += 1) {
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
