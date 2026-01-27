"use strict";
/**
 * Terminal theme mapper for VS Code themes
 *
 * Extracts terminal colors from VS Code theme and converts to xterm.js ITheme format
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTerminalTheme = extractTerminalTheme;
exports.hasTerminalColors = hasTerminalColors;
var vscode_to_css_mapping_1 = require("./vscode-to-css-mapping");
/**
 * Mapping from VS Code terminal color keys to xterm.js ITheme keys
 */
var TERMINAL_COLOR_MAP = {
    background: ["terminal.background", "editor.background"],
    foreground: ["terminal.foreground", "editor.foreground", "foreground"],
    cursor: ["terminalCursor.foreground", "terminal.foreground", "editor.foreground"],
    cursorAccent: ["terminalCursor.background", "terminal.background", "editor.background"],
    selectionBackground: ["terminal.selectionBackground", "editor.selectionBackground"],
    selectionForeground: ["terminal.selectionForeground"],
    selectionInactiveBackground: ["terminal.inactiveSelectionBackground", "editor.inactiveSelectionBackground"],
    // Standard ANSI colors
    black: ["terminal.ansiBlack"],
    red: ["terminal.ansiRed"],
    green: ["terminal.ansiGreen"],
    yellow: ["terminal.ansiYellow"],
    blue: ["terminal.ansiBlue"],
    magenta: ["terminal.ansiMagenta"],
    cyan: ["terminal.ansiCyan"],
    white: ["terminal.ansiWhite"],
    // Bright ANSI colors
    brightBlack: ["terminal.ansiBrightBlack"],
    brightRed: ["terminal.ansiBrightRed"],
    brightGreen: ["terminal.ansiBrightGreen"],
    brightYellow: ["terminal.ansiBrightYellow"],
    brightBlue: ["terminal.ansiBrightBlue"],
    brightMagenta: ["terminal.ansiBrightMagenta"],
    brightCyan: ["terminal.ansiBrightCyan"],
    brightWhite: ["terminal.ansiBrightWhite"],
    // extendedAnsi is not mapped from VS Code themes
};
/**
 * Default dark terminal ANSI colors (fallback)
 */
var DEFAULT_DARK_ANSI = {
    black: "#18181b",
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
    blue: "#3b82f6",
    magenta: "#a855f7",
    cyan: "#06b6d4",
    white: "#f4f4f5",
    brightBlack: "#71717a",
    brightRed: "#f87171",
    brightGreen: "#4ade80",
    brightYellow: "#facc15",
    brightBlue: "#60a5fa",
    brightMagenta: "#c084fc",
    brightCyan: "#22d3ee",
    brightWhite: "#fafafa",
};
/**
 * Default light terminal ANSI colors (fallback)
 */
var DEFAULT_LIGHT_ANSI = {
    black: "#18181b",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#ca8a04",
    blue: "#2563eb",
    magenta: "#9333ea",
    cyan: "#0891b2",
    white: "#f4f4f5",
    brightBlack: "#52525b",
    brightRed: "#ef4444",
    brightGreen: "#22c55e",
    brightYellow: "#eab308",
    brightBlue: "#3b82f6",
    brightMagenta: "#a855f7",
    brightCyan: "#06b6d4",
    brightWhite: "#fafafa",
};
/**
 * Extract a color from VS Code theme colors using priority keys
 */
function getColorFromTheme(colors, priorityKeys) {
    for (var _i = 0, priorityKeys_1 = priorityKeys; _i < priorityKeys_1.length; _i++) {
        var key = priorityKeys_1[_i];
        if (colors[key]) {
            return colors[key];
        }
    }
    return undefined;
}
/**
 * Convert VS Code theme colors to xterm.js ITheme
 */
function extractTerminalTheme(themeColors) {
    var theme = {};
    // Extract each terminal color (excluding extendedAnsi which is a string[])
    for (var _i = 0, _a = Object.entries(TERMINAL_COLOR_MAP); _i < _a.length; _i++) {
        var _b = _a[_i], xtermKey = _b[0], vsCodeKeys = _b[1];
        if (!vsCodeKeys)
            continue;
        var color = getColorFromTheme(themeColors, vsCodeKeys);
        if (color) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;
            theme[xtermKey] = color;
        }
    }
    // Determine if this is a light or dark theme based on background
    var bgColor = theme.background || themeColors["editor.background"] || "#000000";
    var isLight = (0, vscode_to_css_mapping_1.isLightColor)(bgColor);
    // Apply default ANSI colors for any missing colors
    var defaultAnsi = isLight ? DEFAULT_LIGHT_ANSI : DEFAULT_DARK_ANSI;
    // Ensure all required colors are present
    var finalTheme = {
        background: theme.background || (isLight ? "#fafafa" : "#121212"),
        foreground: theme.foreground || (isLight ? "#0a0a0a" : "#f4f4f5"),
        cursor: theme.cursor || theme.foreground || (isLight ? "#0a0a0a" : "#f4f4f5"),
        cursorAccent: theme.cursorAccent || theme.background || (isLight ? "#fafafa" : "#121212"),
        selectionBackground: theme.selectionBackground || (isLight ? "#d4d4d8" : "#3f3f46"),
        selectionForeground: theme.selectionForeground,
        // ANSI colors with fallbacks
        black: theme.black || defaultAnsi.black,
        red: theme.red || defaultAnsi.red,
        green: theme.green || defaultAnsi.green,
        yellow: theme.yellow || defaultAnsi.yellow,
        blue: theme.blue || defaultAnsi.blue,
        magenta: theme.magenta || defaultAnsi.magenta,
        cyan: theme.cyan || defaultAnsi.cyan,
        white: theme.white || defaultAnsi.white,
        brightBlack: theme.brightBlack || defaultAnsi.brightBlack,
        brightRed: theme.brightRed || defaultAnsi.brightRed,
        brightGreen: theme.brightGreen || defaultAnsi.brightGreen,
        brightYellow: theme.brightYellow || defaultAnsi.brightYellow,
        brightBlue: theme.brightBlue || defaultAnsi.brightBlue,
        brightMagenta: theme.brightMagenta || defaultAnsi.brightMagenta,
        brightCyan: theme.brightCyan || defaultAnsi.brightCyan,
        brightWhite: theme.brightWhite || defaultAnsi.brightWhite,
    };
    return finalTheme;
}
/**
 * Check if a VS Code theme has terminal colors defined
 */
function hasTerminalColors(themeColors) {
    return !!(themeColors["terminal.background"] ||
        themeColors["terminal.foreground"] ||
        themeColors["terminal.ansiBlack"]);
}
