/**
 * Terminal utility functions.
 */

/**
 * Escape file paths for shell usage.
 * Wraps paths containing spaces in quotes.
 *
 * @param paths - Array of file paths
 * @returns Space-separated string of escaped paths
 */
export function shellEscapePaths(paths: string[]): string {
  return paths
    .map((p) => {
      // If path contains spaces, special chars, or is empty, quote it
      if (!p || /[\s'"\\$`!]/.test(p)) {
        // Escape any existing double quotes and wrap in double quotes
        return `"${p.replace(/"/g, '\\"')}"`
      }
      return p
    })
    .join(" ")
}

/**
 * Debounce a function call - re-export from @solid-primitives/scheduled
 */
export { debounce } from "@solid-primitives/scheduled"
