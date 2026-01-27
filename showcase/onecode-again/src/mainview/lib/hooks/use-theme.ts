import { useColorMode } from "@kobalte/core"

export type ThemeMode = "light" | "dark" | "system"

export function useTheme() {
  const { colorMode, setColorMode } = useColorMode()
  return {
    resolvedTheme: colorMode,
    setTheme: (value: ThemeMode) => setColorMode(value),
  }
}
