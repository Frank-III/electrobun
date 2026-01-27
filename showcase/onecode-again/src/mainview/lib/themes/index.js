"use strict";
/**
 * Themes module exports
 *
 * This module provides full VS Code theme support for the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadedThemes = exports.highlightCode = exports.ensureThemeLoaded = exports.loadFullTheme = exports.getHighlighter = exports.hasTerminalColors = exports.extractTerminalTheme = exports.getThemeTypeFromColors = exports.isLightColor = exports.hexToHSL = exports.removeCSSVariables = exports.applyCSSVariables = exports.generateCSSVariables = exports.CURSOR_MIDNIGHT = exports.CURSOR_LIGHT = exports.CURSOR_DARK = exports.DEFAULT_DARK_THEME_ID = exports.DEFAULT_LIGHT_THEME_ID = exports.getBuiltinThemesByType = exports.getBuiltinThemeById = exports.BUILTIN_THEMES = exports.useShikiTheme = exports.useTerminalTheme = exports.useVSCodeTheme = exports.VSCodeThemeProvider = void 0;
// Theme provider
var theme_provider_1 = require("./theme-provider");
Object.defineProperty(exports, "VSCodeThemeProvider", { enumerable: true, get: function () { return theme_provider_1.VSCodeThemeProvider; } });
Object.defineProperty(exports, "useVSCodeTheme", { enumerable: true, get: function () { return theme_provider_1.useVSCodeTheme; } });
Object.defineProperty(exports, "useTerminalTheme", { enumerable: true, get: function () { return theme_provider_1.useTerminalTheme; } });
Object.defineProperty(exports, "useShikiTheme", { enumerable: true, get: function () { return theme_provider_1.useShikiTheme; } });
// Builtin themes
var builtin_themes_1 = require("./builtin-themes");
Object.defineProperty(exports, "BUILTIN_THEMES", { enumerable: true, get: function () { return builtin_themes_1.BUILTIN_THEMES; } });
Object.defineProperty(exports, "getBuiltinThemeById", { enumerable: true, get: function () { return builtin_themes_1.getBuiltinThemeById; } });
Object.defineProperty(exports, "getBuiltinThemesByType", { enumerable: true, get: function () { return builtin_themes_1.getBuiltinThemesByType; } });
Object.defineProperty(exports, "DEFAULT_LIGHT_THEME_ID", { enumerable: true, get: function () { return builtin_themes_1.DEFAULT_LIGHT_THEME_ID; } });
Object.defineProperty(exports, "DEFAULT_DARK_THEME_ID", { enumerable: true, get: function () { return builtin_themes_1.DEFAULT_DARK_THEME_ID; } });
// Cursor themes (with full tokenColors)
var cursor_themes_1 = require("./cursor-themes");
Object.defineProperty(exports, "CURSOR_DARK", { enumerable: true, get: function () { return cursor_themes_1.CURSOR_DARK; } });
Object.defineProperty(exports, "CURSOR_LIGHT", { enumerable: true, get: function () { return cursor_themes_1.CURSOR_LIGHT; } });
Object.defineProperty(exports, "CURSOR_MIDNIGHT", { enumerable: true, get: function () { return cursor_themes_1.CURSOR_MIDNIGHT; } });
// CSS variable mapping
var vscode_to_css_mapping_1 = require("./vscode-to-css-mapping");
Object.defineProperty(exports, "generateCSSVariables", { enumerable: true, get: function () { return vscode_to_css_mapping_1.generateCSSVariables; } });
Object.defineProperty(exports, "applyCSSVariables", { enumerable: true, get: function () { return vscode_to_css_mapping_1.applyCSSVariables; } });
Object.defineProperty(exports, "removeCSSVariables", { enumerable: true, get: function () { return vscode_to_css_mapping_1.removeCSSVariables; } });
Object.defineProperty(exports, "hexToHSL", { enumerable: true, get: function () { return vscode_to_css_mapping_1.hexToHSL; } });
Object.defineProperty(exports, "isLightColor", { enumerable: true, get: function () { return vscode_to_css_mapping_1.isLightColor; } });
Object.defineProperty(exports, "getThemeTypeFromColors", { enumerable: true, get: function () { return vscode_to_css_mapping_1.getThemeTypeFromColors; } });
// Terminal theme mapping
var terminal_theme_mapper_1 = require("./terminal-theme-mapper");
Object.defineProperty(exports, "extractTerminalTheme", { enumerable: true, get: function () { return terminal_theme_mapper_1.extractTerminalTheme; } });
Object.defineProperty(exports, "hasTerminalColors", { enumerable: true, get: function () { return terminal_theme_mapper_1.hasTerminalColors; } });
// Shiki theme loader
var shiki_theme_loader_1 = require("./shiki-theme-loader");
Object.defineProperty(exports, "getHighlighter", { enumerable: true, get: function () { return shiki_theme_loader_1.getHighlighter; } });
Object.defineProperty(exports, "loadFullTheme", { enumerable: true, get: function () { return shiki_theme_loader_1.loadFullTheme; } });
Object.defineProperty(exports, "ensureThemeLoaded", { enumerable: true, get: function () { return shiki_theme_loader_1.ensureThemeLoaded; } });
Object.defineProperty(exports, "highlightCode", { enumerable: true, get: function () { return shiki_theme_loader_1.highlightCode; } });
Object.defineProperty(exports, "getLoadedThemes", { enumerable: true, get: function () { return shiki_theme_loader_1.getLoadedThemes; } });
