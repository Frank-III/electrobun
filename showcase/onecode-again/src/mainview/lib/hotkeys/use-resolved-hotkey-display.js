"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResolvedHotkeyDisplay = useResolvedHotkeyDisplay;
exports.useResolvedHotkeyDisplayWithAlt = useResolvedHotkeyDisplayWithAlt;
var jotai_1 = require("../state/jotai");
var atoms_1 = require("../atoms");
var shortcut_registry_1 = require("./shortcut-registry");
/**
 * Hook to get the display string for a resolved hotkey.
 * Respects custom user bindings from customHotkeysAtom.
 *
 * @param actionId - The shortcut action ID from the registry
 * @returns Display string (e.g., "⌘⇧N") or null if action doesn't exist
 *
 * @example
 * const toggleSidebarHotkey = useResolvedHotkeyDisplay("toggle-sidebar")
 * // Returns "⌘\" by default, or custom binding if set
 */
function useResolvedHotkeyDisplay(actionId) {
    var config = (0, jotai_1.useAtomValue)(atoms_1.customHotkeysAtom);
    var hotkey = (0, shortcut_registry_1.getResolvedHotkey)(actionId, config);
    if (!hotkey)
        return null;
    return (0, shortcut_registry_1.hotkeyToDisplay)(hotkey);
}
/**
 * Hook to get both primary and alternative display strings for a resolved hotkey.
 * Useful for actions with altKeys (e.g., stop-generation: Esc or Ctrl+C)
 *
 * @param actionId - The shortcut action ID from the registry
 * @returns Object with primary and alt display strings, or null values if not found
 */
function useResolvedHotkeyDisplayWithAlt(actionId) {
    var config = (0, jotai_1.useAtomValue)(atoms_1.customHotkeysAtom);
    var hotkey = (0, shortcut_registry_1.getResolvedHotkey)(actionId, config);
    var action = (0, shortcut_registry_1.getShortcutAction)(actionId);
    var primary = hotkey ? (0, shortcut_registry_1.hotkeyToDisplay)(hotkey) : null;
    // Only show alt if not using custom binding
    var hasCustomBinding = config.bindings[actionId] !== undefined;
    var alt = (action === null || action === void 0 ? void 0 : action.altKeys) && !hasCustomBinding
        ? (0, shortcut_registry_1.hotkeyToDisplay)((0, shortcut_registry_1.keysToHotkeyString)(action.altKeys))
        : null;
    return { primary: primary, alt: alt };
}
