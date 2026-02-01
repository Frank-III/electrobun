/**
 * Get the default terminal background color based on theme.
 */
export function getDefaultTerminalBg(isDark = true): string {
  return isDark ? "#121212" : "#fafafa";
}
