"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlLinkProvider = void 0;
var link_popup_1 = require("./link-popup");
/**
 * URL link provider for xterm.js.
 * Detects URLs in terminal output and makes them clickable.
 * Requires Cmd+Click (Mac) or Ctrl+Click (Windows/Linux) to activate.
 */
// URL pattern that matches http, https, and file URLs
var URL_PATTERN = /https?:\/\/[^\s<>"\])}]+|file:\/\/[^\s<>"\])}]+/gi;
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
var UrlLinkProvider = /** @class */ (function () {
    function UrlLinkProvider(xterm, onClick) {
        this.xterm = xterm;
        this.onClick = onClick;
    }
    UrlLinkProvider.prototype.provideLinks = function (bufferLineNumber, callback) {
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
        URL_PATTERN.lastIndex = 0;
        while ((match = URL_PATTERN.exec(lineText)) !== null) {
            var startX = match.index;
            var url = match[0];
            // Clean up trailing punctuation that's likely not part of the URL
            var cleanUrl = url.replace(/[.,;:!?)]+$/, "");
            var endX = startX + cleanUrl.length;
            links.push({
                range: {
                    start: { x: startX + 1, y: bufferLineNumber + 1 },
                    end: { x: endX + 1, y: bufferLineNumber + 1 },
                },
                text: cleanUrl,
                decorations: {
                    pointerCursor: true,
                    underline: true,
                },
                activate: function (event, text) {
                    // Require Cmd+Click (Mac) or Ctrl+Click (Windows/Linux)
                    if ((0, link_popup_1.isModifierPressed)(event)) {
                        _this.onClick(event, text);
                    }
                },
                hover: function (event, text) {
                    (0, link_popup_1.showLinkPopup)(event, text);
                },
                leave: function () {
                    (0, link_popup_1.removeLinkPopup)();
                },
            });
        }
        callback(links.length > 0 ? links : undefined);
    };
    return UrlLinkProvider;
}());
exports.UrlLinkProvider = UrlLinkProvider;
