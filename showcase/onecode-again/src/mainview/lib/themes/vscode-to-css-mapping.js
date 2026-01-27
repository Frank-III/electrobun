"use strict";
/**
 * VS Code theme colors to CSS variables mapping
 *
 * This module handles the conversion of VS Code theme colors to the app's CSS variables.
 * Uses a simplified mapping that extracts the essential colors for UI theming.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCODE_TO_CSS_MAP = void 0;
exports.hexToHSL = hexToHSL;
exports.isLightColor = isLightColor;
exports.generateCSSVariables = generateCSSVariables;
exports.applyCSSVariables = applyCSSVariables;
exports.removeCSSVariables = removeCSSVariables;
exports.getThemeTypeFromColors = getThemeTypeFromColors;
/**
 * Mapping from VS Code theme color keys to CSS variable names
 * Priority order: first matching key wins
 */
exports.VSCODE_TO_CSS_MAP = {
    // Background colors
    "--background": [
        "editor.background",
        "editorPane.background",
    ],
    "--foreground": [
        "editor.foreground",
        "foreground",
    ],
    // Primary colors (buttons, links, accents)
    "--primary": [
        "button.background",
        "focusBorder",
        "textLink.foreground",
        "activityBarBadge.background",
    ],
    "--primary-foreground": [
        "button.foreground",
        "activityBarBadge.foreground",
    ],
    // Card/Panel colors
    "--card": [
        "sideBar.background",
        "panel.background",
        "editor.background",
    ],
    "--card-foreground": [
        "sideBar.foreground",
        "foreground",
    ],
    // Popover/Dropdown colors
    "--popover": [
        "dropdown.background",
        "menu.background",
        "editorWidget.background",
        "editor.background",
    ],
    "--popover-foreground": [
        "dropdown.foreground",
        "menu.foreground",
        "editorWidget.foreground",
        "foreground",
    ],
    // Secondary colors (muted button backgrounds)
    "--secondary": [
        "button.secondaryBackground",
        "tab.inactiveBackground",
        "sideBar.background",
    ],
    "--secondary-foreground": [
        "button.secondaryForeground",
        "sideBar.foreground",
        "foreground",
    ],
    // Muted colors
    "--muted": [
        "tab.inactiveBackground",
        "editorGroupHeader.tabsBackground",
        "sideBar.background",
    ],
    "--muted-foreground": [
        "tab.inactiveForeground",
        "descriptionForeground",
        "editorLineNumber.foreground",
    ],
    // Accent colors (hover states, selections)
    "--accent": [
        "list.hoverBackground",
        "list.activeSelectionBackground",
        "editor.selectionBackground",
    ],
    // Text selection background
    "--selection": [
        "editor.selectionBackground",
        "selection.background",
    ],
    "--accent-foreground": [
        "list.activeSelectionForeground",
        "list.hoverForeground",
        "foreground",
    ],
    // Border colors - includes fallbacks for themes with very transparent borders
    "--border": [
        "panel.border",
        "sideBar.border",
        "editorGroup.border",
        "input.border",
        "editorIndentGuide.activeBackground1",
        "tree.indentGuidesStroke",
        "editorRuler.foreground",
        "contrastBorder",
    ],
    // Input border color (used for input/select/textarea borders)
    "--input": [
        "input.border",
        "panel.border",
        "sideBar.border",
        "contrastBorder",
    ],
    // Input background color (used for chat input, search, etc.)
    "--input-background": [
        "input.background",
        "editorWidget.background",
        "dropdown.background",
    ],
    // Ring/Focus colors
    "--ring": [
        "focusBorder",
        "button.background",
    ],
    // Destructive colors
    "--destructive": [
        "errorForeground",
        "editorError.foreground",
        "inputValidation.errorBorder",
    ],
    "--destructive-foreground": [
        "editorError.background",
        "inputValidation.errorBackground",
    ],
    // Timeline/Content background (used for sidebars, dialogs)
    // sideBar.background has priority for consistent sidebar color
    "--tl-background": [
        "sideBar.background",
        "panel.background",
        "editor.background",
    ],
};
/**
 * Convert HEX color to HSL values string (without hsl() wrapper)
 * Returns format: "H S% L%" for use in CSS variables
 * Note: Alpha is NOT included - Tailwind handles opacity via modifiers like /50
 *
 * @param hex - Hex color (3, 6, or 8 characters, with or without #)
 * @param backgroundHex - Optional background to blend with for transparent colors
 * @param preserveAlpha - If true, output alpha as "H S% L% / A%" instead of blending
 */
function hexToHSL(hex, backgroundHex, preserveAlpha) {
    // Remove # if present
    hex = hex.replace(/^#/, "");
    // Handle shorthand hex (e.g., #fff)
    if (hex.length === 3) {
        hex = hex.split("").map(function (c) { return c + c; }).join("");
    }
    var r, g, b;
    var outputAlpha = null;
    // Handle 8-char hex with alpha
    if (hex.length === 8) {
        var alpha = parseInt(hex.slice(6, 8), 16) / 255;
        var fgR = parseInt(hex.slice(0, 2), 16);
        var fgG = parseInt(hex.slice(2, 4), 16);
        var fgB = parseInt(hex.slice(4, 6), 16);
        if (preserveAlpha && alpha < 1) {
            // Preserve alpha in output (for selection backgrounds, etc.)
            r = fgR / 255;
            g = fgG / 255;
            b = fgB / 255;
            outputAlpha = alpha;
        }
        else if (backgroundHex && alpha < 1) {
            // Blend with background for solid color output
            var bg = backgroundHex.replace(/^#/, "");
            var bgR = parseInt(bg.slice(0, 2), 16);
            var bgG = parseInt(bg.slice(2, 4), 16);
            var bgB = parseInt(bg.slice(4, 6), 16);
            // Alpha compositing: result = fg * alpha + bg * (1 - alpha)
            r = (fgR * alpha + bgR * (1 - alpha)) / 255;
            g = (fgG * alpha + bgG * (1 - alpha)) / 255;
            b = (fgB * alpha + bgB * (1 - alpha)) / 255;
        }
        else {
            // No background provided, just use the color as-is (ignore alpha)
            r = fgR / 255;
            g = fgG / 255;
            b = fgB / 255;
        }
    }
    else {
        r = parseInt(hex.slice(0, 2), 16) / 255;
        g = parseInt(hex.slice(2, 4), 16) / 255;
        b = parseInt(hex.slice(4, 6), 16) / 255;
    }
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var h = 0;
    var s = 0;
    if (max !== min) {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    var hsl = "".concat(Math.round(h * 360), " ").concat(Math.round(s * 100), "% ").concat(Math.round(l * 100), "%");
    // Output with alpha if preserving
    if (outputAlpha !== null) {
        return "".concat(hsl, " / ").concat(Math.round(outputAlpha * 100), "%");
    }
    return hsl;
}
/**
 * Determine if a color is "light" (should use dark text) or "dark" (should use light text)
 */
function isLightColor(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
        hex = hex.split("").map(function (c) { return c + c; }).join("");
    }
    if (hex.length === 8) {
        hex = hex.slice(0, 6);
    }
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);
    // Calculate perceived brightness using ITU-R BT.709 coefficients
    var brightness = (r * 0.2126 + g * 0.7152 + b * 0.0722);
    return brightness > 128;
}
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
    return null;
}
// CSS variables that should preserve alpha instead of blending
var PRESERVE_ALPHA_VARS = new Set([
    "--selection",
]);
/**
 * Generate CSS variable values from VS Code theme colors
 * Transparent colors are blended with the background for accurate appearance
 * Exception: selection colors preserve alpha for proper overlay effect
 */
function generateCSSVariables(themeColors) {
    var cssVariables = {};
    // Get background color for blending transparent colors
    var backgroundColor = themeColors["editor.background"] || themeColors["editorPane.background"] || "#000000";
    for (var _i = 0, _a = Object.entries(exports.VSCODE_TO_CSS_MAP); _i < _a.length; _i++) {
        var _b = _a[_i], cssVar = _b[0], priorityKeys = _b[1];
        var color = getColorFromTheme(themeColors, priorityKeys);
        if (color) {
            var preserveAlpha = PRESERVE_ALPHA_VARS.has(cssVar);
            cssVariables[cssVar] = hexToHSL(color, backgroundColor, preserveAlpha);
        }
    }
    return cssVariables;
}
/**
 * Apply CSS variables to the document root
 */
function applyCSSVariables(variables, element) {
    if (element === void 0) { element = document.documentElement; }
    for (var _i = 0, _a = Object.entries(variables); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], value = _b[1];
        element.style.setProperty(name_1, value);
    }
}
/**
 * Remove custom CSS variables from the document root (reset to defaults)
 */
function removeCSSVariables(element) {
    if (element === void 0) { element = document.documentElement; }
    for (var _i = 0, _a = Object.keys(exports.VSCODE_TO_CSS_MAP); _i < _a.length; _i++) {
        var cssVar = _a[_i];
        element.style.removeProperty(cssVar);
    }
}
/**
 * Get the theme type (light/dark) from VS Code theme colors
 */
function getThemeTypeFromColors(colors) {
    var bgColor = colors["editor.background"] || colors["editorPane.background"] || "#000000";
    return isLightColor(bgColor) ? "light" : "dark";
}
