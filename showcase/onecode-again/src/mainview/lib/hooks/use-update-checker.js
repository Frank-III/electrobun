"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateChecker = useUpdateChecker;
exports.clearDismissedUpdate = clearDismissedUpdate;
exports.clearDismissedVersion = clearDismissedVersion;
var react_1 = require("react");
var jotai_1 = require("../state/jotai");
var atoms_1 = require("../atoms");
// Note: Update checks are now triggered by window focus in main process (auto-updater.ts)
// This hook only handles events and provides actions
var DISMISSED_KEY = "update-dismissed";
var DISMISS_DURATION = 12 * 60 * 60 * 1000; // 12 hours
/**
 * Hook to manage auto-updates via electron-updater
 * Listens to update events from main process and provides actions
 */
function useUpdateChecker() {
    var _a = (0, jotai_1.useAtom)(atoms_1.updateStateAtom), state = _a[0], setState = _a[1];
    var versionRef = (0, react_1.useRef)(state.version);
    // Keep ref in sync with state
    (0, react_1.useEffect)(function () {
        versionRef.current = state.version;
    }, [state.version]);
    // Check if a version was dismissed recently
    var isDismissed = (0, react_1.useCallback)(function (version) {
        try {
            var dismissed = localStorage.getItem(DISMISSED_KEY);
            if (!dismissed)
                return false;
            var _a = JSON.parse(dismissed), dismissedVersion = _a.version, timestamp = _a.timestamp;
            var elapsed = Date.now() - timestamp;
            return dismissedVersion === version && elapsed < DISMISS_DURATION;
        }
        catch (_b) {
            return false;
        }
    }, []);
    // Subscribe to update events from main process
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var api = window.desktopApi;
        if (!api)
            return;
        var unsubs = [];
        // Checking for updates
        unsubs.push((_a = api.onUpdateChecking) === null || _a === void 0 ? void 0 : _a.call(api, function () {
            console.log("[Update] Checking for updates...");
            setState({ status: "checking" });
        }));
        // Update available
        unsubs.push((_b = api.onUpdateAvailable) === null || _b === void 0 ? void 0 : _b.call(api, function (info) {
            console.log("[Update] Update available: v".concat(info.version));
            // Check if user dismissed this version
            if (isDismissed(info.version)) {
                console.log("[Update] Version ".concat(info.version, " was dismissed, ignoring"));
                setState({ status: "idle" });
                return;
            }
            setState({
                status: "available",
                version: info.version,
            });
        }));
        // No update available
        unsubs.push((_c = api.onUpdateNotAvailable) === null || _c === void 0 ? void 0 : _c.call(api, function () {
            console.log("[Update] App is up to date");
            setState({ status: "idle" });
        }));
        // Download progress
        unsubs.push((_d = api.onUpdateProgress) === null || _d === void 0 ? void 0 : _d.call(api, function (progress) {
            console.log("[Update] Download progress: ".concat(progress.percent.toFixed(1), "%"));
            setState({
                status: "downloading",
                version: versionRef.current,
                progress: progress.percent,
                bytesPerSecond: progress.bytesPerSecond,
                transferred: progress.transferred,
                total: progress.total,
            });
        }));
        // Update downloaded and ready
        unsubs.push((_e = api.onUpdateDownloaded) === null || _e === void 0 ? void 0 : _e.call(api, function (info) {
            console.log("[Update] Update downloaded: v".concat(info.version));
            setState({
                status: "ready",
                version: info.version,
            });
        }));
        // Error during update
        unsubs.push((_f = api.onUpdateError) === null || _f === void 0 ? void 0 : _f.call(api, function (error) {
            console.error("[Update] Error:", error);
            setState({
                status: "error",
                error: error,
            });
        }));
        // Manual check from menu - clear dismiss state
        unsubs.push((_g = api.onUpdateManualCheck) === null || _g === void 0 ? void 0 : _g.call(api, function () {
            console.log("[Update] Manual check triggered - clearing dismiss state");
            localStorage.removeItem(DISMISSED_KEY);
        }));
        // Cleanup
        return function () {
            unsubs.forEach(function (unsub) { return unsub === null || unsub === void 0 ? void 0 : unsub(); });
        };
    }, [setState, isDismissed]);
    // Note: Periodic checks removed - main process now checks on window focus
    // This is more natural UX and avoids unnecessary network requests
    // Actions
    var checkForUpdates = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.checkForUpdates) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, []);
    var downloadUpdate = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.downloadUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, []);
    var installUpdate = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.installUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, []);
    var dismissUpdate = (0, react_1.useCallback)(function () {
        if (state.version) {
            localStorage.setItem(DISMISSED_KEY, JSON.stringify({
                version: state.version,
                timestamp: Date.now(),
            }));
            setState({ status: "idle" });
        }
    }, [state.version, setState]);
    return {
        state: state,
        checkForUpdates: checkForUpdates,
        downloadUpdate: downloadUpdate,
        installUpdate: installUpdate,
        dismissUpdate: dismissUpdate,
    };
}
/**
 * Clear dismissed version from storage
 * Call this after a successful update to reset dismissal state
 */
function clearDismissedUpdate() {
    localStorage.removeItem(DISMISSED_KEY);
}
/**
 * Clear dismiss for a specific version
 */
function clearDismissedVersion(version) {
    try {
        var dismissed = localStorage.getItem(DISMISSED_KEY);
        if (!dismissed)
            return;
        var dismissedVersion = JSON.parse(dismissed).version;
        if (dismissedVersion === version) {
            localStorage.removeItem(DISMISSED_KEY);
        }
    }
    catch (_a) {
        // Ignore errors
    }
}
