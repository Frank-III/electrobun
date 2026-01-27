"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowManager = void 0;
var electron_1 = require("electron");
var ipc_bridge_1 = require("../lib/git/watcher/ipc-bridge");
/**
 * Manages multiple application windows
 */
var WindowManager = /** @class */ (function () {
    function WindowManager() {
        this.windows = new Map();
        this.focusedWindowId = null;
        this.mainWindowId = null; // Track the "main" window
        this.windowIdMap = new Map(); // Map Electron window.id to stable ID
        this.nextSecondaryId = 2; // Counter for secondary windows
    }
    /**
     * Register a window with the manager and assign a stable ID
     * Returns the stable window ID to use for localStorage namespacing
     */
    WindowManager.prototype.register = function (window) {
        var _this = this;
        var electronId = window.id;
        this.windows.set(electronId, window);
        // Assign stable ID
        var stableId;
        if (this.mainWindowId === null) {
            // First window ever registered becomes the "main" window
            this.mainWindowId = electronId;
            stableId = "main";
        }
        else {
            // Secondary windows get incrementing IDs
            stableId = "window-".concat(this.nextSecondaryId++);
        }
        this.windowIdMap.set(electronId, stableId);
        // Track focus
        window.on("focus", function () {
            _this.focusedWindowId = electronId;
        });
        // Clean up on close
        // Note: Electron automatically removes all listeners when a window is destroyed,
        // so we only need to clean up our internal tracking here
        window.on("closed", function () {
            // Cleanup git watcher subscriptions for this window to prevent memory leaks
            (0, ipc_bridge_1.cleanupWindowSubscriptions)(electronId);
            _this.windows.delete(electronId);
            _this.windowIdMap.delete(electronId);
            if (_this.focusedWindowId === electronId) {
                _this.focusedWindowId = null;
            }
            // If main window is closed, update mainWindowId for internal tracking
            // but DON'T change the stable ID of remaining windows - they keep their localStorage namespace
            if (_this.mainWindowId === electronId) {
                var remainingWindows = Array.from(_this.windows.keys());
                _this.mainWindowId = remainingWindows.length > 0 ? remainingWindows[0] : null;
                // Note: We intentionally keep the existing stable ID (e.g., "window-2")
                // Changing it to "main" would orphan the window's localStorage data
            }
        });
        // Set as focused if it's the only window
        if (this.windows.size === 1) {
            this.focusedWindowId = electronId;
        }
        return stableId;
    };
    /**
     * Get the stable ID for a window
     */
    WindowManager.prototype.getStableId = function (window) {
        var _a;
        return (_a = this.windowIdMap.get(window.id)) !== null && _a !== void 0 ? _a : "main";
    };
    /**
     * Unregister a window
     */
    WindowManager.prototype.unregister = function (window) {
        this.windows.delete(window.id);
        if (this.focusedWindowId === window.id) {
            this.focusedWindowId = null;
        }
    };
    /**
     * Get a window by ID
     */
    WindowManager.prototype.get = function (id) {
        return this.windows.get(id);
    };
    /**
     * Get the currently focused window
     */
    WindowManager.prototype.getFocused = function () {
        if (this.focusedWindowId !== null) {
            var win = this.windows.get(this.focusedWindowId);
            if (win && !win.isDestroyed()) {
                return win;
            }
        }
        // Fallback to BrowserWindow.getFocusedWindow() with destroyed check
        var focusedWin = electron_1.BrowserWindow.getFocusedWindow();
        if (focusedWin && !focusedWin.isDestroyed()) {
            return focusedWin;
        }
        return null;
    };
    /**
     * Get all windows
     */
    WindowManager.prototype.getAll = function () {
        return Array.from(this.windows.values()).filter(function (w) { return !w.isDestroyed(); });
    };
    /**
     * Get the number of windows
     */
    WindowManager.prototype.count = function () {
        return this.windows.size;
    };
    /**
     * Find window by webContents ID
     */
    WindowManager.prototype.findByWebContentsId = function (webContentsId) {
        for (var _i = 0, _a = this.windows.values(); _i < _a.length; _i++) {
            var window_1 = _a[_i];
            if (!window_1.isDestroyed() && window_1.webContents.id === webContentsId) {
                return window_1;
            }
        }
        return undefined;
    };
    return WindowManager;
}());
// Singleton instance
exports.windowManager = new WindowManager();
