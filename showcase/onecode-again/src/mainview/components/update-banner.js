"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBanner = UpdateBanner;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var use_update_checker_1 = require("../lib/hooks/use-update-checker");
var use_just_updated_1 = require("../lib/hooks/use-just-updated");
var button_1 = require("./ui/button");
var icons_1 = require("../icons");
// For testing: set to "available", "downloading", or "just-updated" to see the UI
// Change to "none" for production
var MOCK_STATE = "none";
function UpdateBanner() {
    var _a = (0, use_update_checker_1.useUpdateChecker)(), realState = _a.state, downloadUpdate = _a.downloadUpdate, installUpdate = _a.installUpdate, dismissUpdate = _a.dismissUpdate;
    var _b = (0, use_just_updated_1.useJustUpdated)(), realJustUpdated = _b.justUpdated, justUpdatedVersion = _b.justUpdatedVersion, dismissJustUpdated = _b.dismissJustUpdated, openChangelog = _b.openChangelog;
    var _c = (0, solid_js_1.createSignal)(false), hasTriggeredInstall = _c[0], setHasTriggeredInstall = _c[1];
    // Optimistic loading state - show spinner immediately on click
    var _d = (0, solid_js_1.createSignal)(false), isPending = _d[0], setIsPending = _d[1];
    // Use mock or real state
    var isMocking = MOCK_STATE !== "none";
    // Mock state for testing UI
    var _e = (0, solid_js_1.createSignal)(MOCK_STATE === "none" ? "available" : MOCK_STATE), mockStatus = _e[0], setMockStatus = _e[1];
    var _f = (0, solid_js_1.createSignal)(0), mockProgress = _f[0], setMockProgress = _f[1];
    // Simulate progress when mocking download
    (0, solid_js_1.createEffect)(function () {
        if (isMocking && mockStatus === "downloading") {
            var interval_1 = setInterval(function () {
                setMockProgress(function (prev) {
                    if (prev >= 100) {
                        clearInterval(interval_1);
                        return 100;
                    }
                    return prev + 5;
                });
            }, 200);
            return function () { return clearInterval(interval_1); };
        }
    });
    // Just updated state (show "What's New" banner)
    // When mocking "just-updated", we need to show that state regardless of real state
    var justUpdated = isMocking && MOCK_STATE === "just-updated" ? true : realJustUpdated;
    // Get current app version for display
    var _g = (0, solid_js_1.createSignal)(null), currentVersion = _g[0], setCurrentVersion = _g[1];
    // Track if app is packaged (official build) - default to true to avoid flash
    var _h = (0, solid_js_1.createSignal)(true), isPackaged = _h[0], setIsPackaged = _h[1];
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getVersion().then(setCurrentVersion);
        (_b = window.desktopApi) === null || _b === void 0 ? void 0 : _b.isPackaged().then(setIsPackaged);
    });
    // Use current version for display (or the just updated version if available)
    var displayVersion = justUpdatedVersion || currentVersion;
    // For mocking just-updated, force idle state so only the "What's New" banner shows
    var state = isMocking && MOCK_STATE === "just-updated" ? {
        status: "idle",
        progress: 0
    } : isMocking ? {
        status: mockStatus === "dismissed" || mockStatus === "just-updated" ? "idle" : mockStatus,
        progress: mockProgress
    } : realState;
    // Clear pending state when status changes from "available"
    // This handles: download started, error occurred, or state reset
    (0, solid_js_1.createEffect)(function () {
        if (realState.status !== "available") {
            setIsPending(false);
        }
    });
    // Get progress percentage
    var progress = "progress" in state ? state.progress : undefined;
    // Auto-install when download completes
    (0, solid_js_1.createEffect)(function () {
        if (realState.status === "ready" && !hasTriggeredInstall.current) {
            hasTriggeredInstall.current = true;
            // Small delay to ensure UI updates before restart
            setTimeout(function () {
                installUpdate();
            }, 500);
        }
    });
    // Reset install trigger when going back to available state
    (0, solid_js_1.createEffect)(function () {
        if (realState.status === "available") {
            hasTriggeredInstall.current = false;
        }
    });
    // Mock handlers for testing
    var handleUpdate = function () {
        if (isMocking) {
            setMockStatus("downloading");
        }
        else {
            // Force synchronous render to show spinner immediately
            (0, web_1.flushSync)(function () {
                setIsPending(true);
            });
            downloadUpdate();
        }
    };
    var handleDismiss = function () {
        if (isMocking) {
            setMockStatus("dismissed");
        }
        else {
            dismissUpdate();
        }
    };
    var handleOpenChangelog = function () {
        var _a;
        // Open changelog URL
        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.openExternal("https://1code.dev/changelog");
        // Dismiss the banner
        if (isMocking) {
            setMockStatus("dismissed");
        }
        else {
            dismissJustUpdated();
        }
    };
    var handleDismissWhatsNew = function () {
        if (isMocking) {
            setMockStatus("dismissed");
        }
        else {
            dismissJustUpdated();
        }
    };
    // For open source builds (!isPackaged), hide all update banners
    if (!isPackaged) {
        return null;
    }
    // Show "What's New" banner if app was just updated
    if (justUpdated) {
        return <div class="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-popover p-2.5 text-sm text-popover-foreground shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
        <span class="text-foreground">
          Updated to v{displayVersion}
        </span>
        <div class="flex items-center gap-2 ml-2">
          <button_1.Button size="sm" onClick={handleOpenChangelog}>
            See what's new
          </button_1.Button>
          <button onClick={handleDismissWhatsNew} class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted" aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>;
    }
    // Don't show anything for idle, checking, or error states
    if (state.status === "idle" || state.status === "checking" || state.status === "error") {
        return null;
    }
    // Updating state (downloading or ready to install, or pending click)
    var isUpdating = state.status === "downloading" || state.status === "ready" || isPending;
    return <div class="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-popover p-2.5 text-sm text-popover-foreground shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
      {/* Update Available State */}
      {state.status === "available" && !isPending && <>
          <span class="text-foreground">Update available</span>
          <div class="flex items-center gap-2 ml-2">
            <button onClick={handleDismiss} class="text-muted-foreground hover:text-foreground transition-colors">
              Later
            </button>
            <button_1.Button size="sm" onClick={handleUpdate}>
              Update
            </button_1.Button>
          </div>
        </>}

      {/* Updating State (downloading, installing, or pending) */}
      {isUpdating && <>
          <icons_1.IconSpinner class="h-4 w-4 text-muted-foreground"/>
          <span class="text-foreground">
            {isPending ? "Starting update..." : "Updating..."}
          </span>
          {progress !== undefined && !isPending && <span class="text-muted-foreground ml-1">
              {Math.round(progress)}%
            </span>}
        </>}
    </div>;
}
