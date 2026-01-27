"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePathLinkProvider = void 0;
var link_popup_1 = require("./link-popup");
/**
 * File path link provider for xterm.js.
 * Detects file paths with optional line and column numbers and makes them clickable.
 * Requires Cmd+Click (Mac) or Ctrl+Click (Windows/Linux) to activate.
 *
 * Supported formats:
 * - /absolute/path/to/file.ts
 * - /absolute/path/to/file.ts:10
 * - /absolute/path/to/file.ts:10:5
 * - ./relative/path/file.ts
 * - ./relative/path/file.ts:10:5
 * - ../parent/path/file.ts:10
 */
// Pattern for file paths with optional line:column
// Matches:
// - Absolute paths starting with /
// - Relative paths starting with ./ or ../
// - Optionally followed by :line or :line:column
var FILE_PATH_PATTERN = /(?:^|[\s'"({\[])((?:\.\.?\/|\/)[^\s:'")\]}>]+?)(?::(\d+))?(?::(\d+))?(?=[\s'")\]}>]|$)/g;
/**
 * Get the text content of a buffer line.
 */
function getLineText(line) {
    var _a;
    var text = "";
    for (var i = 0; i < line.length; i++) {
        text += ((_a = line.getCell(i)) === null || _a === void 0 ? void 0 : _a.getChars()) || " ";
    }
    return text;
}
/**
 * Check if a path looks like a file (has an extension or is a dotfile).
 */
function looksLikeFile(path) {
    var basename = path.split("/").pop() || "";
    // Has an extension
    if (/\.[a-zA-Z0-9]+$/.test(basename)) {
        return true;
    }
    // Is a dotfile
    if (basename.startsWith(".") && basename.length > 1) {
        return true;
    }
    // Common extensionless files
    var extensionlessFiles = [
        "Makefile",
        "Dockerfile",
        "Vagrantfile",
        "Gemfile",
        "Rakefile",
        "LICENSE",
        "README",
        "CHANGELOG",
        "AUTHORS",
        "CONTRIBUTING",
    ];
    if (extensionlessFiles.includes(basename)) {
        return true;
    }
    return false;
}
var FilePathLinkProvider = /** @class */ (function () {
    function FilePathLinkProvider(xterm, onClick) {
        this.xterm = xterm;
        this.onClick = onClick;
    }
    FilePathLinkProvider.prototype.provideLinks = function (bufferLineNumber, callback) {
        var _this = this;
        var buffer = this.xterm.buffer.active;
        var line = buffer.getLine(bufferLineNumber);
        if (!line) {
            callback(undefined);
            return;
        }
        var lineText = getLineText(line);
        var links = [];
        var match;
        FILE_PATH_PATTERN.lastIndex = 0;
        var _loop_1 = function () {
            var fullMatch = match[0];
            var path = match[1];
            var lineNum = match[2] ? parseInt(match[2], 10) : undefined;
            var colNum = match[3] ? parseInt(match[3], 10) : undefined;
            // Skip if it doesn't look like a file
            if (!looksLikeFile(path)) {
                return "continue";
            }
            // Calculate the actual start position (accounting for leading whitespace/quote)
            var leadingChars = fullMatch.length - path.length - (match[2] ? match[2].length + 1 : 0) - (match[3] ? match[3].length + 1 : 0);
            var startX = match.index + leadingChars;
            // Build the link text (path with optional :line:col)
            var linkText = path;
            if (lineNum !== undefined) {
                linkText += ":".concat(lineNum);
                if (colNum !== undefined) {
                    linkText += ":".concat(colNum);
                }
            }
            var endX = startX + linkText.length;
            links.push({
                range: {
                    start: { x: startX + 1, y: bufferLineNumber + 1 },
                    end: { x: endX + 1, y: bufferLineNumber + 1 },
                },
                text: linkText,
                decorations: {
                    pointerCursor: true,
                    underline: true,
                },
                activate: function (event) {
                    // Require Cmd+Click (Mac) or Ctrl+Click (Windows/Linux)
                    if ((0, link_popup_1.isModifierPressed)(event)) {
                        _this.onClick(event, path, lineNum, colNum);
                    }
                },
                hover: function (event, text) {
                    (0, link_popup_1.showLinkPopup)(event, text);
                },
                leave: function () {
                    (0, link_popup_1.removeLinkPopup)();
                },
            });
        };
        while ((match = FILE_PATH_PATTERN.exec(lineText)) !== null) {
            _loop_1();
        }
        callback(links.length > 0 ? links : undefined);
    };
    return FilePathLinkProvider;
}());
exports.FilePathLinkProvider = FilePathLinkProvider;
