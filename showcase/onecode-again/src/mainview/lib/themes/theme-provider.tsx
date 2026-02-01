/**
* VS Code Theme Provider
* 
* Provides full VS Code theme support for the application:
* - Applies CSS variables for UI theming
 * - Integrates with Shiki for syntax highlighting
 */
import { createContext, useContext, createEffect, createMemo, onCleanup, type ParentProps } from "solid-js";
import { useColorMode } from "@kobalte/core";
import { selectedFullThemeIdAtom, fullThemeDataAtom, systemLightThemeIdAtom, systemDarkThemeIdAtom, importedThemesAtom, type VSCodeFullTheme } from "../atoms";
import { generateCSSVariables, applyCSSVariables, removeCSSVariables, getThemeTypeFromColors } from "./vscode-to-css-mapping";
import { BUILTIN_THEMES, getBuiltinThemeById, DEFAULT_DARK_THEME_ID, DEFAULT_LIGHT_THEME_ID } from "./builtin-themes";
/**
* Theme context value
*/
interface ThemeContextValue {
	// Current theme
	currentTheme: VSCodeFullTheme | null;
	currentThemeId: string | null;
	// Theme type (light/dark)
	isDark: boolean;
	// All available themes
	allThemes: VSCodeFullTheme[];
	// Theme actions
	setThemeById: (id: string | null) => void;
	// Shiki theme name (for syntax highlighting)
	shikiThemeName: string;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);
/**
* Hook to access the theme context
*/
export function useVSCodeTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useVSCodeTheme must be used within a VSCodeThemeProvider");
	}
	return context;
}
/**
* VS Code Theme Provider Component
*/
/**
* VS Code Theme Provider Component
*/
export function VSCodeThemeProvider(props: ParentProps) {
	const { colorMode, setColorMode } = useColorMode();
	// Atoms
	const [selectedThemeId, setSelectedThemeId] = selectedFullThemeIdAtom;
	const [fullThemeData, setFullThemeData] = fullThemeDataAtom;
	const systemLightThemeId = systemLightThemeIdAtom[0];
	const systemDarkThemeId = systemDarkThemeIdAtom[0];
	const importedThemes = importedThemesAtom[0];
	// Combine builtin and imported themes
	const allThemes = createMemo(() => [...BUILTIN_THEMES, ...importedThemes()]);
	// Determine if we're in dark mode (from color mode or theme type)
	const isDark = createMemo(() => {
		const fullTheme = fullThemeData();
		if (fullTheme) {
			return fullTheme.type === "dark";
		}
		return colorMode() === "dark";
	});
	// Find the current theme by ID (considering system mode)
	const currentTheme = createMemo(() => {
		const selectedId = selectedThemeId();
		if (selectedId === null) {
			// System mode - use the appropriate theme based on system preference
			const systemThemeId = colorMode() === "dark" ? systemDarkThemeId() : systemLightThemeId();
			// First check in all themes (includes imported), then fallback to builtin
			return allThemes().find((t) => t.id === systemThemeId) || getBuiltinThemeById(systemThemeId) || null;
		}
		return allThemes().find((t) => t.id === selectedId) || null;
	});
	// Update fullThemeData when theme changes
	createEffect(() => {
		const theme = currentTheme();
		if (theme) {
			setFullThemeData(theme);
		} else {
			setFullThemeData(null);
		}
	});
	// Apply CSS variables when theme changes
	createEffect(() => {
		const currentTheme = fullThemeData();
		const selectedId = selectedThemeId();
		if (currentTheme?.colors) {
			// Generate and apply CSS variables
			const cssVars = generateCSSVariables(currentTheme.colors);
			applyCSSVariables(cssVars);
			// For system mode, let color mode follow system preference
			if (selectedId === null) {
				setColorMode("system");
			} else {
				// Sync color mode with the theme type
				const themeType = getThemeTypeFromColors(currentTheme.colors);
				setColorMode(themeType);
			}
		} else {
			// Remove custom CSS variables when no theme is selected
			removeCSSVariables();
		}
		// Cleanup on unmount
		onCleanup(() => {
			removeCSSVariables();
		});
	});
	// Get Shiki theme name for syntax highlighting
	const shikiThemeName = createMemo(() => {
		const currentTheme = fullThemeData();
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
	const setThemeById = (id: string | null) => {
		setSelectedThemeId(id);
	};
	const contextValue = createMemo((): ThemeContextValue => ({
		currentTheme: fullThemeData(),
		currentThemeId: selectedThemeId(),
		isDark: isDark(),
		allThemes: allThemes(),
		setThemeById,
		shikiThemeName: shikiThemeName()
	}));
	return <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>;
}
/**
* Hook to get just the Shiki theme name
*/
export function useShikiTheme(): string {
	const { shikiThemeName } = useVSCodeTheme();
	return shikiThemeName;
}
