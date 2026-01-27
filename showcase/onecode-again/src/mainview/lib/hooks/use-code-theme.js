"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCodeTheme = useCodeTheme;
var jotai_1 = require("../state/jotai");
var use_theme_1 = require("./use-theme");
var atoms_1 = require("../atoms");
/**
 * Hook to get the current code theme based on UI theme
 * Returns the appropriate theme ID for light or dark mode
 *
 * Priority:
 * 1. Full VS Code theme (if selected)
 * 2. Fallback to legacy code-only theme atoms
 */
function useCodeTheme() {
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var lightTheme = (0, jotai_1.useAtomValue)(atoms_1.vscodeCodeThemeLightAtom);
    var darkTheme = (0, jotai_1.useAtomValue)(atoms_1.vscodeCodeThemeDarkAtom);
    var fullTheme = (0, jotai_1.useAtomValue)(atoms_1.fullThemeDataAtom);
    // If a full VS Code theme is selected, use its ID for syntax highlighting
    if (fullTheme) {
        return fullTheme.id;
    }
    // Fallback to legacy code-only theme selection
    return resolvedTheme() === "light" ? lightTheme : darkTheme;
}
