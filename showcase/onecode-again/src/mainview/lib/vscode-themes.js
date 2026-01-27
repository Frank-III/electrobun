"use strict";
/**
 * VS Code built-in themes available in Shiki
 * These themes are bundled with Shiki and can be used directly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCODE_BUILTIN_THEMES = void 0;
exports.getThemesByType = getThemesByType;
exports.getThemeById = getThemeById;
exports.isBuiltinTheme = isBuiltinTheme;
/**
 * Built-in VS Code themes available in Shiki
 * These are the themes that come pre-bundled with Shiki
 */
exports.VSCODE_BUILTIN_THEMES = [
    { id: "dark-plus", name: "Dark+ (default dark)", type: "dark", source: "builtin" },
    { id: "light-plus", name: "Light+ (default light)", type: "light", source: "builtin" },
    { id: "min-dark", name: "Min Dark", type: "dark", source: "builtin" },
    { id: "min-light", name: "Min Light", type: "light", source: "builtin" },
    { id: "slack-dark", name: "Slack Dark", type: "dark", source: "builtin" },
    { id: "slack-ochin", name: "Slack Ochin", type: "light", source: "builtin" },
    { id: "vitesse-dark", name: "Vitesse Dark", type: "dark", source: "builtin" },
    { id: "vitesse-light", name: "Vitesse Light", type: "light", source: "builtin" },
    { id: "material-theme-darker", name: "Material Theme Darker", type: "dark", source: "builtin" },
    { id: "material-theme-default", name: "Material Theme Default", type: "dark", source: "builtin" },
    { id: "material-theme-lighter", name: "Material Theme Lighter", type: "light", source: "builtin" },
    { id: "material-theme-ocean", name: "Material Theme Ocean", type: "dark", source: "builtin" },
    { id: "material-theme-palenight", name: "Material Theme Palenight", type: "dark", source: "builtin" },
    { id: "poimandres", name: "Poimandres", type: "dark", source: "builtin" },
];
/**
 * Get all themes filtered by type
 */
function getThemesByType(type) {
    return exports.VSCODE_BUILTIN_THEMES.filter(function (theme) { return theme.type === type; });
}
/**
 * Get theme by ID
 */
function getThemeById(id) {
    return exports.VSCODE_BUILTIN_THEMES.find(function (theme) { return theme.id === id; });
}
/**
 * Check if theme ID is a built-in theme
 */
function isBuiltinTheme(themeId) {
    return exports.VSCODE_BUILTIN_THEMES.some(function (theme) { return theme.id === themeId; });
}
