"use client";
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVSCodeTheme = useVSCodeTheme;
exports.VSCodeThemeProvider = VSCodeThemeProvider;
exports.useTerminalTheme = useTerminalTheme;
exports.useShikiTheme = useShikiTheme;
/**
* VS Code Theme Provider
*
* Provides full VS Code theme support for the application:
* - Applies CSS variables for UI theming
* - Provides terminal theme for xterm.js
* - Integrates with Shiki for syntax highlighting
*/
var solid_js_1 = require("solid-js");
var jotai_1 = require("../state/jotai");
var core_1 = require("@kobalte/core");
var atoms_1 = require("../atoms");
var vscode_to_css_mapping_1 = require("./vscode-to-css-mapping");
var terminal_theme_mapper_1 = require("./terminal-theme-mapper");
var builtin_themes_1 = require("./builtin-themes");
var ThemeContext = (0, solid_js_1.createContext)(null);
/**
* Hook to access the theme context
*/
function useVSCodeTheme() {
    var context = (0, solid_js_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error("useVSCodeTheme must be used within a VSCodeThemeProvider");
    }
    return context;
}
/**
* Default terminal themes (fallback when no VS Code theme is selected)
*/
var DEFAULT_TERMINAL_THEME_DARK = {
    background: "#121212",
    foreground: "#f4f4f5",
    cursor: "#f4f4f5",
    cursorAccent: "#121212",
    selectionBackground: "#3f3f46",
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
    brightWhite: "#fafafa"
};
var DEFAULT_TERMINAL_THEME_LIGHT = {
    background: "#fafafa",
    foreground: "#0a0a0a",
    cursor: "#0a0a0a",
    cursorAccent: "#fafafa",
    selectionBackground: "#d4d4d8",
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
    brightWhite: "#fafafa"
};
/**
* VS Code Theme Provider Component
*/
function VSCodeThemeProvider(props) {
    var _a = (0, core_1.useColorMode)(), colorMode = _a.colorMode, setColorMode = _a.setColorMode;
    // Atoms
    var _b = (0, jotai_1.useAtom)(atoms_1.selectedFullThemeIdAtom), selectedThemeId = _b[0], setSelectedThemeId = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_1.fullThemeDataAtom), fullThemeData = _c[0], setFullThemeData = _c[1];
    var systemLightThemeId = (0, jotai_1.useAtomValue)(atoms_1.systemLightThemeIdAtom);
    var systemDarkThemeId = (0, jotai_1.useAtomValue)(atoms_1.systemDarkThemeIdAtom);
    var importedThemes = (0, jotai_1.useAtomValue)(atoms_1.importedThemesAtom);
    // Combine builtin and imported themes
    var allThemes = (0, solid_js_1.createMemo)(function () { return __spreadArray(__spreadArray([], builtin_themes_1.BUILTIN_THEMES, true), importedThemes(), true); });
    // Determine if we're in dark mode (from color mode or theme type)
    var isDark = (0, solid_js_1.createMemo)(function () {
        var fullTheme = fullThemeData();
        if (fullTheme) {
            return fullTheme.type === "dark";
        }
        return colorMode() === "dark";
    });
    // Find the current theme by ID (considering system mode)
    var currentTheme = (0, solid_js_1.createMemo)(function () {
        var selectedId = selectedThemeId();
        if (selectedId === null) {
            // System mode - use the appropriate theme based on system preference
            var systemThemeId_1 = colorMode() === "dark" ? systemDarkThemeId() : systemLightThemeId();
            // First check in all themes (includes imported), then fallback to builtin
            return allThemes().find(function (t) { return t.id === systemThemeId_1; }) || (0, builtin_themes_1.getBuiltinThemeById)(systemThemeId_1) || null;
        }
        return allThemes().find(function (t) { return t.id === selectedId; }) || null;
    });
    // Update fullThemeData when theme changes
    (0, solid_js_1.createEffect)(function () {
        var theme = currentTheme();
        if (theme) {
            setFullThemeData(theme);
        }
        else {
            setFullThemeData(null);
        }
    });
    // Apply CSS variables when theme changes
    (0, solid_js_1.createEffect)(function () {
        var currentTheme = fullThemeData();
        var selectedId = selectedThemeId();
        if (currentTheme === null || currentTheme === void 0 ? void 0 : currentTheme.colors) {
            // Generate and apply CSS variables
            var cssVars = (0, vscode_to_css_mapping_1.generateCSSVariables)(currentTheme.colors);
            (0, vscode_to_css_mapping_1.applyCSSVariables)(cssVars);
            // For system mode, let color mode follow system preference
            if (selectedId === null) {
                setColorMode("system");
            }
            else {
                // Sync color mode with the theme type
                var themeType = (0, vscode_to_css_mapping_1.getThemeTypeFromColors)(currentTheme.colors);
                setColorMode(themeType);
            }
        }
        else {
            // Remove custom CSS variables when no theme is selected
            (0, vscode_to_css_mapping_1.removeCSSVariables)();
        }
        return function () {
            // Cleanup on unmount
            (0, vscode_to_css_mapping_1.removeCSSVariables)();
        };
    });
    // Get terminal theme
    var terminalTheme = (0, solid_js_1.createMemo)(function () {
        var currentTheme = fullThemeData();
        if (currentTheme === null || currentTheme === void 0 ? void 0 : currentTheme.colors) {
            return (0, terminal_theme_mapper_1.extractTerminalTheme)(currentTheme.colors);
        }
        // Fallback to default themes
        return isDark() ? DEFAULT_TERMINAL_THEME_DARK : DEFAULT_TERMINAL_THEME_LIGHT;
    });
    // Get Shiki theme name for syntax highlighting
    var shikiThemeName = (0, solid_js_1.createMemo)(function () {
        var currentTheme = fullThemeData();
        if (currentTheme) {
            // For builtin themes, use the ID directly (Shiki supports these)
            if (currentTheme.source === "builtin") {
                return currentTheme.id;
            }
            // For imported/discovered themes, we'd need to load them into Shiki
            // For now, fall back to a compatible theme
            return currentTheme.type === "dark" ? "github-dark" : "github-light";
        }
        // Default based on system theme
        return isDark() ? "github-dark" : "github-light";
    });
    // Theme actions
    var setThemeById = function (id) {
        setSelectedThemeId(id);
    };
    var contextValue = (0, solid_js_1.createMemo)(function () { return ({
        currentTheme: fullThemeData(),
        currentThemeId: selectedThemeId(),
        isDark: isDark(),
        terminalTheme: terminalTheme(),
        allThemes: allThemes(),
        setThemeById: setThemeById,
        shikiThemeName: shikiThemeName()
    }); });
    return <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>;
}
/**
* Hook to get just the terminal theme (for performance)
*/
function useTerminalTheme() {
    var terminalTheme = useVSCodeTheme().terminalTheme;
    return terminalTheme;
}
/**
* Hook to get just the Shiki theme name
*/
function useShikiTheme() {
    var shikiThemeName = useVSCodeTheme().shikiThemeName;
    return shikiThemeName;
}
