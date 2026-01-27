"use strict";
/**
 * Terminal utility functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.shellEscapePaths = shellEscapePaths;
exports.debounce = debounce;
/**
 * Escape file paths for shell usage.
 * Wraps paths containing spaces in quotes.
 *
 * @param paths - Array of file paths
 * @returns Space-separated string of escaped paths
 */
function shellEscapePaths(paths) {
    return paths
        .map(function (p) {
        // If path contains spaces, special chars, or is empty, quote it
        if (!p || /[\s'"\\$`!]/.test(p)) {
            // Escape any existing double quotes and wrap in double quotes
            return "\"".concat(p.replace(/"/g, '\\"'), "\"");
        }
        return p;
    })
        .join(" ");
}
/**
 * Debounce a function call.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with cancel method
 */
function debounce(fn, delay) {
    var timeoutId = null;
    var debounced = (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function () {
            fn.apply(void 0, args);
            timeoutId = null;
        }, delay);
    });
    debounced.cancel = function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    return debounced;
}
