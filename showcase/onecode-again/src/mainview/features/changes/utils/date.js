"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRelativeDate = formatRelativeDate;
function formatRelativeDate(date) {
    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffMinutes = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMinutes / 60);
    var diffDays = Math.floor(diffHours / 24);
    if (diffMinutes < 1)
        return "just now";
    if (diffMinutes < 60)
        return "".concat(diffMinutes, "m ago");
    if (diffHours < 24)
        return "".concat(diffHours, "h ago");
    if (diffDays < 7)
        return "".concat(diffDays, "d ago");
    return date.toLocaleDateString();
}
