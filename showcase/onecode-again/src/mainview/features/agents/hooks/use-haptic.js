"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHaptic = useHaptic;
var react_1 = require("react");
/**
 * Hook for triggering haptic feedback on supported devices (iOS Safari PWA).
 *
 * Uses the Vibration API which is supported on iOS Safari 13+.
 * Falls back silently on unsupported devices.
 *
 * @example
 * const { trigger } = useHaptic()
 * <button onClick={() => { trigger('light'); handleClick() }}>Click me</button>
 */
function useHaptic() {
    var trigger = (0, react_1.useCallback)(function (style) {
        if (style === void 0) { style = "light"; }
        // Check if Vibration API is available
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            var duration = style === "light" ? 10 : style === "medium" ? 20 : 30;
            try {
                navigator.vibrate(duration);
            }
            catch (_a) {
                // Silently fail if vibration is not allowed
            }
        }
    }, []);
    return { trigger: trigger };
}
