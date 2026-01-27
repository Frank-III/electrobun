"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResolvedHotkeyDisplayWithAlt = exports.useResolvedHotkeyDisplay = exports.useHotkeyRecorder = exports.CATEGORY_LABELS = exports.keysToDisplay = exports.hotkeyToDisplay = exports.keyToDisplay = exports.detectConflicts = exports.normalizeHotkey = exports.isCustomHotkey = exports.getResolvedKeys = exports.getResolvedHotkey = exports.hotkeyStringToKeys = exports.keysToHotkeyString = exports.getShortcutAction = exports.getShortcutsByCategory = exports.ALL_SHORTCUT_ACTIONS = void 0;
// Registry
var shortcut_registry_1 = require("./shortcut-registry");
Object.defineProperty(exports, "ALL_SHORTCUT_ACTIONS", { enumerable: true, get: function () { return shortcut_registry_1.ALL_SHORTCUT_ACTIONS; } });
Object.defineProperty(exports, "getShortcutsByCategory", { enumerable: true, get: function () { return shortcut_registry_1.getShortcutsByCategory; } });
Object.defineProperty(exports, "getShortcutAction", { enumerable: true, get: function () { return shortcut_registry_1.getShortcutAction; } });
Object.defineProperty(exports, "keysToHotkeyString", { enumerable: true, get: function () { return shortcut_registry_1.keysToHotkeyString; } });
Object.defineProperty(exports, "hotkeyStringToKeys", { enumerable: true, get: function () { return shortcut_registry_1.hotkeyStringToKeys; } });
Object.defineProperty(exports, "getResolvedHotkey", { enumerable: true, get: function () { return shortcut_registry_1.getResolvedHotkey; } });
Object.defineProperty(exports, "getResolvedKeys", { enumerable: true, get: function () { return shortcut_registry_1.getResolvedKeys; } });
Object.defineProperty(exports, "isCustomHotkey", { enumerable: true, get: function () { return shortcut_registry_1.isCustomHotkey; } });
Object.defineProperty(exports, "normalizeHotkey", { enumerable: true, get: function () { return shortcut_registry_1.normalizeHotkey; } });
Object.defineProperty(exports, "detectConflicts", { enumerable: true, get: function () { return shortcut_registry_1.detectConflicts; } });
Object.defineProperty(exports, "keyToDisplay", { enumerable: true, get: function () { return shortcut_registry_1.keyToDisplay; } });
Object.defineProperty(exports, "hotkeyToDisplay", { enumerable: true, get: function () { return shortcut_registry_1.hotkeyToDisplay; } });
Object.defineProperty(exports, "keysToDisplay", { enumerable: true, get: function () { return shortcut_registry_1.keysToDisplay; } });
Object.defineProperty(exports, "CATEGORY_LABELS", { enumerable: true, get: function () { return shortcut_registry_1.CATEGORY_LABELS; } });
// Hooks
var use_hotkey_recorder_1 = require("./use-hotkey-recorder");
Object.defineProperty(exports, "useHotkeyRecorder", { enumerable: true, get: function () { return use_hotkey_recorder_1.useHotkeyRecorder; } });
var use_resolved_hotkey_display_1 = require("./use-resolved-hotkey-display");
Object.defineProperty(exports, "useResolvedHotkeyDisplay", { enumerable: true, get: function () { return use_resolved_hotkey_display_1.useResolvedHotkeyDisplay; } });
Object.defineProperty(exports, "useResolvedHotkeyDisplayWithAlt", { enumerable: true, get: function () { return use_resolved_hotkey_display_1.useResolvedHotkeyDisplayWithAlt; } });
