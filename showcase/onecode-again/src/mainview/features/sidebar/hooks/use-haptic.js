"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHaptic = useHaptic;
/**
 * Mock haptic feedback hook for desktop
 * On desktop, we don't have haptic feedback, so this is a no-op
 */
function useHaptic() {
    return {
        trigger: function (_intensity) {
            // No-op on desktop - haptics are for mobile only
        },
    };
}
