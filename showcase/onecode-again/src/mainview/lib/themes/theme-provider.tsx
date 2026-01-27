"use client"

/**
 * VS Code Theme Provider
 * 
 * Provides full VS Code theme support for the application:
 * - Applies CSS variables for UI theming
 * - Provides terminal theme for xterm.js
 * - Integrates with Shiki for syntax highlighting
 */

import {
  createContext,
  useContext,
  createEffect,
  createMemo,
  type ParentProps,
} from "solid-js"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useColorMode } from "@kobalte/core"
import type { ITheme } from "xterm"

import {
  selectedFullThemeIdAtom,
  fullThemeDataAtom,
  systemLightThemeIdAtom,
  systemDarkThemeIdAtom,
  importedThemesAtom,
  type VSCodeFullTheme,
} from "../atoms"
import {
  generateCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  getThemeTypeFromColors,
} from "./vscode-to-css-mapping"
import { extractTerminalTheme } from "./terminal-theme-mapper"
import {
  BUILTIN_THEMES,
  getBuiltinThemeById,
  DEFAULT_DARK_THEME_ID,
  DEFAULT_LIGHT_THEME_ID,
} from "./builtin-themes"

/**
 * Theme context value
 */
interface ThemeContextValue {
  // Current theme
  currentTheme: VSCodeFullTheme | null
  currentThemeId: string | null
  
  // Theme type (light/dark)
  isDark: boolean
  
  // Terminal theme for xterm.js
  terminalTheme: ITheme
  
  // All available themes
  allThemes: VSCodeFullTheme[]
  
  // Theme actions
  setThemeById: (id: string | null) => void
  
  // Shiki theme name (for syntax highlighting)
  shikiThemeName: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Hook to access the theme context
 */
export function useVSCodeTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useVSCodeTheme must be used within a VSCodeThemeProvider")
  }
  return context
}

/**
 * Default terminal themes (fallback when no VS Code theme is selected)
 */
const DEFAULT_TERMINAL_THEME_DARK: ITheme = {
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
  brightWhite: "#fafafa",
}

const DEFAULT_TERMINAL_THEME_LIGHT: ITheme = {
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
  brightWhite: "#fafafa",
}

/**
 * VS Code Theme Provider Component
 */
export function VSCodeThemeProvider(props: ParentProps) {
  const { colorMode, setColorMode } = useColorMode()
  
  // Atoms
  const [selectedThemeId, setSelectedThemeId] = useAtom(selectedFullThemeIdAtom)
  const [fullThemeData, setFullThemeData] = useAtom(fullThemeDataAtom)
  const systemLightThemeId = useAtomValue(systemLightThemeIdAtom)
  const systemDarkThemeId = useAtomValue(systemDarkThemeIdAtom)
  const importedThemes = useAtomValue(importedThemesAtom)

  // Combine builtin and imported themes
  const allThemes = createMemo(
    () => [...BUILTIN_THEMES, ...importedThemes],
  )
  
  // Determine if we're in dark mode (from color mode or theme type)
  const isDark = createMemo(() => {
    if (fullThemeData) {
      return fullThemeData.type === "dark"
    }
    return colorMode() === "dark"
  })
  
  // Find the current theme by ID (considering system mode)
  const currentTheme = createMemo(() => {
    if (selectedThemeId === null) {
      // System mode - use the appropriate theme based on system preference
      const systemThemeId = colorMode() === "dark" ? systemDarkThemeId : systemLightThemeId
      // First check in all themes (includes imported), then fallback to builtin
      return allThemes().find((t) => t.id === systemThemeId) || getBuiltinThemeById(systemThemeId) || null
    }
    return allThemes().find((t) => t.id === selectedThemeId) || null
  })
  
  // Update fullThemeData when theme changes
  createEffect(() => {
    const theme = currentTheme()
    if (theme) {
      setFullThemeData(theme)
    } else {
      setFullThemeData(null)
    }
  })
  
  // Apply CSS variables when theme changes
  createEffect(() => {
    if (fullThemeData?.colors) {
      // Generate and apply CSS variables
      const cssVars = generateCSSVariables(fullThemeData.colors)
      applyCSSVariables(cssVars)
      
      // For system mode, let color mode follow system preference
      if (selectedThemeId === null) {
        setColorMode("system")
      } else {
        // Sync color mode with the theme type
        const themeType = getThemeTypeFromColors(fullThemeData.colors)
        setColorMode(themeType)
      }
    } else {
      // Remove custom CSS variables when no theme is selected
      removeCSSVariables()
    }
    
    return () => {
      // Cleanup on unmount
      removeCSSVariables()
    }
  })
  
  // Get terminal theme
  const terminalTheme = createMemo((): ITheme => {
    if (fullThemeData?.colors) {
      return extractTerminalTheme(fullThemeData.colors)
    }
    // Fallback to default themes
    return isDark() ? DEFAULT_TERMINAL_THEME_DARK : DEFAULT_TERMINAL_THEME_LIGHT
  })
  
  // Get Shiki theme name for syntax highlighting
  const shikiThemeName = createMemo(() => {
    if (fullThemeData) {
      // For builtin themes, use the ID directly (Shiki supports these)
      if (fullThemeData.source === "builtin") {
        return fullThemeData.id
      }
      // For imported/discovered themes, we'd need to load them into Shiki
      // For now, fall back to a compatible theme
      return fullThemeData.type === "dark" ? "github-dark" : "github-light"
    }
    // Default based on system theme
    return isDark() ? "github-dark" : "github-light"
  })
  
  // Theme actions
  const setThemeById = (id: string | null) => {
    setSelectedThemeId(id)
  }
  
  const contextValue = createMemo((): ThemeContextValue => ({
    currentTheme: fullThemeData,
    currentThemeId: selectedThemeId,
    isDark: isDark(),
    terminalTheme: terminalTheme(),
    allThemes: allThemes(),
    setThemeById,
    shikiThemeName: shikiThemeName(),
  }))
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to get just the terminal theme (for performance)
 */
export function useTerminalTheme(): ITheme {
  const { terminalTheme } = useVSCodeTheme()
  return terminalTheme
}

/**
 * Hook to get just the Shiki theme name
 */
export function useShikiTheme(): string {
  const { shikiThemeName } = useVSCodeTheme()
  return shikiThemeName
}
