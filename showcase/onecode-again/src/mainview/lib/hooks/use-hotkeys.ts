/**
 * SolidJS hotkeys using @solid-primitives/keyboard.
 * Replaces react-hotkeys-hook. Listens for keydown and invokes callback when key combo matches.
 */
import { createShortcut } from "@solid-primitives/keyboard";

/** Parse hotkey string into key names for createShortcut. "mod+a" → modifier + key; "escape" → ["Escape"] */
function parseHotkey(hotkey: string): { key: string; mod: boolean } {
  const lower = hotkey.toLowerCase().trim();
  const mod = lower.startsWith("mod+");
  const keyPart = mod ? lower.slice(4) : lower;
  const key =
    keyPart === "escape"
      ? "Escape"
      : keyPart === " "
        ? " "
        : keyPart;
  return { key, mod };
}

/**
 * Subscribe to a hotkey. Callback runs when key combo matches.
 * Supports: "x", "escape", "mod+a" (Cmd+A on Mac, Ctrl+A on Win/Linux).
 * Uses createShortcut from @solid-primitives/keyboard (cleans up with component).
 */
export function useHotkeys(
  hotkey: string,
  callback: (e: KeyboardEvent) => void,
  _deps?: unknown[]
): void {
  const { key, mod } = parseHotkey(hotkey);

  const run = (e: KeyboardEvent | null) => callback(e ?? ({} as KeyboardEvent));

  if (mod) {
    createShortcut(["Meta", key], run, { preventDefault: true });
    createShortcut(["Control", key], run, { preventDefault: true });
    return;
  }

  createShortcut([key], run, { preventDefault: true });
}
