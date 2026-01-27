"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHotkeyRecorder = useHotkeyRecorder;
var react_1 = require("react");
/**
 * Map of KeyboardEvent.key values to our internal key names
 */
var KEY_MAP = {
    Meta: "cmd",
    Control: "ctrl",
    Alt: "opt",
    Shift: "shift",
    Escape: "Esc",
    Enter: "Enter",
    Backspace: "Backspace",
    Delete: "Delete",
    Tab: "Tab",
    " ": "Space",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
};
/**
 * Display mapping for keys
 */
var DISPLAY_MAP = {
    cmd: "⌘",
    ctrl: "⌃",
    opt: "⌥",
    shift: "⇧",
    Esc: "Esc",
    Enter: "↵",
    Backspace: "⌫",
    Delete: "⌦",
    Tab: "Tab",
    Space: "Space",
};
/**
 * Modifiers in display order
 */
var MODIFIER_ORDER = ["cmd", "ctrl", "opt", "shift"];
/**
 * Check if a key is a modifier
 */
function isModifier(key) {
    return MODIFIER_ORDER.includes(key);
}
/**
 * Convert KeyboardEvent to our internal key representation
 */
function eventKeyToInternal(e) {
    var mapped = KEY_MAP[e.key];
    if (mapped)
        return mapped;
    // For single characters, use uppercase
    if (e.key.length === 1) {
        return e.key.toUpperCase();
    }
    // For special keys like F1, F2, etc.
    return e.key;
}
/**
 * Convert internal key to display format
 */
function keyToDisplay(key) {
    return DISPLAY_MAP[key] || key;
}
/**
 * Build hotkey string from modifiers and key
 */
function buildHotkeyString(modifiers, key) {
    var parts = [];
    // Add modifiers in order
    for (var _i = 0, MODIFIER_ORDER_1 = MODIFIER_ORDER; _i < MODIFIER_ORDER_1.length; _i++) {
        var mod = MODIFIER_ORDER_1[_i];
        if (modifiers.has(mod)) {
            parts.push(mod);
        }
    }
    // Add the main key
    if (key) {
        parts.push(key.toLowerCase());
    }
    return parts.join("+");
}
/**
 * Build display string from modifiers and key
 */
function buildDisplayString(modifiers, key) {
    var parts = [];
    // Add modifiers in order
    for (var _i = 0, MODIFIER_ORDER_2 = MODIFIER_ORDER; _i < MODIFIER_ORDER_2.length; _i++) {
        var mod = MODIFIER_ORDER_2[_i];
        if (modifiers.has(mod)) {
            parts.push(keyToDisplay(mod));
        }
    }
    // Add the main key
    if (key) {
        parts.push(keyToDisplay(key));
    }
    return parts.join("");
}
/**
 * Hook for recording keyboard shortcuts
 *
 * Usage:
 * ```tsx
 * const { currentKeys, currentDisplay, recorderRef } = useHotkeyRecorder({
 *   onRecord: (hotkey) => console.log("Recorded:", hotkey),
 *   onCancel: () => console.log("Cancelled"),
 *   isRecording: true,
 * })
 * ```
 */
function useHotkeyRecorder(_a) {
    var onRecord = _a.onRecord, onCancel = _a.onCancel, isRecording = _a.isRecording;
    var _b = (0, react_1.useState)(new Set()), modifiers = _b[0], setModifiers = _b[1];
    var _c = (0, react_1.useState)(null), mainKey = _c[0], setMainKey = _c[1];
    var recorderRef = (0, react_1.useRef)(null);
    // Track if we've recorded a complete combination
    var hasRecordedRef = (0, react_1.useRef)(false);
    // Reset state when recording starts (not when it stops, to avoid flicker)
    (0, react_1.useEffect)(function () {
        if (isRecording) {
            setModifiers(new Set());
            setMainKey(null);
            hasRecordedRef.current = false;
        }
    }, [isRecording]);
    // Handle keydown
    var handleKeyDown = (0, react_1.useCallback)(function (e) {
        if (!isRecording)
            return;
        e.preventDefault();
        e.stopPropagation();
        var key = eventKeyToInternal(e);
        // Handle Escape to cancel (always cancels, even with modifiers held)
        if (key === "Esc") {
            onCancel();
            return;
        }
        if (isModifier(key)) {
            // Add modifier
            setModifiers(function (prev) { return new Set(__spreadArray(__spreadArray([], prev, true), [key], false)); });
        }
        else {
            // Set main key
            setMainKey(key);
        }
    }, [isRecording, modifiers, onCancel]);
    // Handle keyup
    var handleKeyUp = (0, react_1.useCallback)(function (e) {
        if (!isRecording)
            return;
        // Don't process keyup after recording - keep state frozen
        if (hasRecordedRef.current)
            return;
        var key = eventKeyToInternal(e);
        if (isModifier(key)) {
            // If we have a main key, record the combination before removing modifier
            if (mainKey) {
                hasRecordedRef.current = true;
                var hotkey = buildHotkeyString(modifiers, mainKey);
                onRecord(hotkey);
                // Don't remove modifier - keep display frozen
                return;
            }
            // No main key yet, remove modifier
            setModifiers(function (prev) {
                var next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
        else {
            // Main key released - record if we have modifiers or it's a valid single key
            var validSingleKeys = ["?", "/", "Esc", "Enter", "Tab"];
            if (modifiers.size > 0 || validSingleKeys.includes(key)) {
                hasRecordedRef.current = true;
                var hotkey = buildHotkeyString(modifiers, key);
                onRecord(hotkey);
            }
        }
    }, [isRecording, mainKey, modifiers, onRecord]);
    // Attach event listeners
    (0, react_1.useEffect)(function () {
        if (!isRecording)
            return;
        // Use capture phase to intercept before other handlers
        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("keyup", handleKeyUp, true);
        return function () {
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keyup", handleKeyUp, true);
        };
    }, [isRecording, handleKeyDown, handleKeyUp]);
    // Build current keys array for display
    var currentKeys = __spreadArray(__spreadArray([], MODIFIER_ORDER.filter(function (mod) { return modifiers.has(mod); }), true), (mainKey ? [mainKey] : []), true);
    var currentDisplay = buildDisplayString(modifiers, mainKey);
    return {
        currentKeys: currentKeys,
        currentDisplay: currentDisplay,
        recorderRef: recorderRef,
    };
}
