"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimeAgo = formatTimeAgo;
/**
 * Format a timestamp as a relative time string (e.g., "5m", "3h", "2d")
 * Used for displaying chat timestamps in a compact format
 */
function formatTimeAgo(timestamp) {
    if (!timestamp)
        return "now";
    var date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    var now = new Date();
    var diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)
        return "now";
    var years = Math.floor(diff / (60 * 60 * 24 * 365));
    var months = Math.floor((diff % (60 * 60 * 24 * 365)) / (60 * 60 * 24 * 30));
    var days = Math.floor((diff % (60 * 60 * 24 * 30)) / (60 * 60 * 24));
    var hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((diff % (60 * 60)) / 60);
    if (years > 0)
        return "".concat(years, "y");
    if (months > 0)
        return "".concat(months, "mo");
    if (days > 0)
        return "".concat(days, "d");
    if (hours > 0)
        return "".concat(hours, "h");
    if (minutes > 0)
        return "".concat(minutes, "m");
    return "now";
}
