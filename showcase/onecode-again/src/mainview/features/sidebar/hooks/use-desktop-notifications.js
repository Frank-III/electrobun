"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDesktopNotifications = useDesktopNotifications;
exports.showAgentNotification = showAgentNotification;
var react_1 = require("react");
var jotai_1 = require("../../../lib/state/jotai");
var signal_storage_1 = require("../../../lib/state/signal-storage");
var platform_1 = require("../../../lib/utils/platform");
// Track pending notifications count for badge
var pendingNotificationsAtom = (0, signal_storage_1.createStoredSignal)("desktop-pending-notifications", 0);
// Track window focus state
var isWindowFocused = true;
/**
 * Generate a badge icon image for Windows taskbar overlay
 * Creates a 32x32 canvas with a red circle and white number
 */
function generateBadgeIcon(count) {
    var size = 32;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    if (!ctx)
        return "";
    // Draw red circle background
    ctx.fillStyle = "#FF4444";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // Draw white border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw white number text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Format count (show "9+" if > 9)
    var displayText = count > 9 ? "9+" : String(count);
    ctx.fillText(displayText, size / 2, size / 2);
    return canvas.toDataURL("image/png");
}
/**
 * Hook to manage desktop notifications and badge count
 * - Shows native notifications when window is not focused
 * - Updates dock badge with pending notification count
 * - Clears badge when window regains focus
 */
function useDesktopNotifications() {
    var _a = (0, jotai_1.useAtom)(pendingNotificationsAtom), pendingCount = _a[0], setPendingCount = _a[1];
    var isInitialized = (0, react_1.useRef)(false);
    // Subscribe to window focus changes
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (!(0, platform_1.isDesktopApp)() || typeof window === "undefined")
            return;
        // Initialize focus state
        isWindowFocused = document.hasFocus();
        var handleFocus = function () {
            var _a;
            isWindowFocused = true;
            // Clear badge when window gains focus
            setPendingCount(0);
            (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setBadge(null);
        };
        var handleBlur = function () {
            isWindowFocused = false;
        };
        // Use both window events and Electron API
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);
        // Also subscribe to Electron focus events
        var unsubscribe = (_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.onFocusChange) === null || _b === void 0 ? void 0 : _b.call(_a, function (focused) {
            if (focused) {
                handleFocus();
            }
            else {
                handleBlur();
            }
        });
        isInitialized.current = true;
        return function () {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
            unsubscribe === null || unsubscribe === void 0 ? void 0 : unsubscribe();
        };
    }, [setPendingCount]);
    // Update badge when pending count changes
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d, _e, _f;
        if (!(0, platform_1.isDesktopApp)() || typeof window === "undefined")
            return;
        if (pendingCount > 0) {
            (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setBadge(pendingCount);
            // Windows: Generate and set overlay icon with badge number
            if (((_b = window.desktopApi) === null || _b === void 0 ? void 0 : _b.platform) === "win32" && ((_c = window.desktopApi) === null || _c === void 0 ? void 0 : _c.setBadgeIcon)) {
                var badgeImage = generateBadgeIcon(pendingCount);
                window.desktopApi.setBadgeIcon(badgeImage);
            }
        }
        else {
            (_d = window.desktopApi) === null || _d === void 0 ? void 0 : _d.setBadge(null);
            // Clear overlay icon on Windows
            if (((_e = window.desktopApi) === null || _e === void 0 ? void 0 : _e.platform) === "win32" && ((_f = window.desktopApi) === null || _f === void 0 ? void 0 : _f.setBadgeIcon)) {
                window.desktopApi.setBadgeIcon(null);
            }
        }
    }, [pendingCount]);
    /**
     * Show a notification for agent completion
     * Only shows if window is not focused (in desktop app)
     */
    var notifyAgentComplete = (0, react_1.useCallback)(function (agentName) {
        var _a;
        if (!(0, platform_1.isDesktopApp)() || typeof window === "undefined")
            return;
        // Only notify if window is not focused
        if (!isWindowFocused) {
            // Increment badge count
            setPendingCount(function (prev) { return prev + 1; });
            // Show native notification
            (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.showNotification({
                title: "Agent finished",
                body: "".concat(agentName, " completed the task"),
            });
        }
    }, [setPendingCount]);
    /**
     * Check if window is currently focused
     */
    var isAppFocused = (0, react_1.useCallback)(function () {
        return isWindowFocused;
    }, []);
    return {
        notifyAgentComplete: notifyAgentComplete,
        isAppFocused: isAppFocused,
        pendingCount: pendingCount,
        clearBadge: function () {
            var _a;
            setPendingCount(0);
            (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setBadge(null);
        },
    };
}
/**
 * Standalone function to show notification (for use outside React components)
 */
function showAgentNotification(agentName) {
    var _a;
    if (!(0, platform_1.isDesktopApp)() || typeof window === "undefined")
        return;
    // Only notify if window is not focused
    if (!document.hasFocus()) {
        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.showNotification({
            title: "Agent finished",
            body: "".concat(agentName, " completed the task"),
        });
    }
}
