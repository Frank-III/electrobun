"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPreview = AgentPreview;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var button_1 = require("../../../components/ui/button");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var preview_url_input_1 = require("./preview-url-input");
var atoms_1 = require("../atoms");
var utils_1 = require("../../../lib/utils");
var viewport_toggle_1 = require("./viewport-toggle");
var scale_control_1 = require("./scale-control");
var device_presets_bar_1 = require("./device-presets-bar");
var resize_handle_1 = require("./resize-handle");
var mobile_copy_link_button_1 = require("./mobile-copy-link-button");
var constants_1 = require("../constants");
// import { getSandboxPreviewUrl } from "@/app/(alpha)/canvas/{components}/settings-tabs/repositories/preview-url"
var getSandboxPreviewUrl = function (sandboxId, port, _type) { return "https://".concat(sandboxId, "-").concat(port, ".csb.app"); };
function AgentPreview(_a) {
    var chatId = _a.chatId, sandboxId = _a.sandboxId, port = _a.port, repository = _a.repository, _b = _a.hideHeader, hideHeader = _b === void 0 ? false : _b, onClose = _a.onClose, _c = _a.isMobile, isMobile = _c === void 0 ? false : _c;
    var _d = (0, solid_js_1.createSignal)(false), isLoaded = _d[0], setIsLoaded = _d[1];
    var _e = (0, solid_js_1.createSignal)(0), reloadKey = _e[0], setReloadKey = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), isRefreshing = _f[0], setIsRefreshing = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), iframeRef = _g[0], setIframeRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), frameRef = _h[0], setFrameRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), resizeCleanupRef = _j[0], setResizeCleanupRef = _j[1];
    // Persisted state from Jotai atoms (per chatId)
    var _k = (0, jotai_1.useAtom)((0, atoms_1.previewPathAtomFamily)(chatId)), persistedPath = _k[0], setPersistedPath = _k[1];
    var _l = (0, jotai_1.useAtom)((0, atoms_1.viewportModeAtomFamily)(chatId)), viewportMode = _l[0], setViewportMode = _l[1];
    var _m = (0, jotai_1.useAtom)((0, atoms_1.previewScaleAtomFamily)(chatId)), scale = _m[0], setScale = _m[1];
    var _o = (0, jotai_1.useAtom)((0, atoms_1.mobileDeviceAtomFamily)(chatId)), device = _o[0], setDevice = _o[1];
    // Local state for resizing
    var _p = (0, solid_js_1.createSignal)(false), isResizing = _p[0], setIsResizing = _p[1];
    var _q = (0, solid_js_1.createSignal)(constants_1.AGENTS_PREVIEW_CONSTANTS.MAX_WIDTH), maxWidth = _q[0], setMaxWidth = _q[1];
    // Dual state architecture:
    // - loadedPath: Controls iframe src (stable, only changes on manual navigation)
    // - currentPath: Display path (updates immediately on internal navigation)
    var _r = (0, solid_js_1.createSignal)(persistedPath), loadedPath = _r[0], setLoadedPath = _r[1];
    var _s = (0, solid_js_1.createSignal)(persistedPath), currentPath = _s[0], setCurrentPath = _s[1];
    // Listen for reload events from external header
    (0, solid_js_1.createEffect)(function () {
        var handleReload = function (e) {
            var _a;
            if (((_a = e.detail) === null || _a === void 0 ? void 0 : _a.chatId) === chatId) {
                setReloadKey(function (prev) { return prev + 1; });
                setIsRefreshing(true);
                setTimeout(function () { return setIsRefreshing(false); }, 400);
            }
        };
        window.addEventListener("agent-preview-reload", handleReload);
        return function () { return window.removeEventListener("agent-preview-reload", handleReload); };
    });
    // Listen for navigation events from external header
    (0, solid_js_1.createEffect)(function () {
        var handleNavigate = function (e) {
            var _a, _b;
            if (((_a = e.detail) === null || _a === void 0 ? void 0 : _a.chatId) === chatId && ((_b = e.detail) === null || _b === void 0 ? void 0 : _b.path)) {
                setLoadedPath(e.detail.path);
                setCurrentPath(e.detail.path);
                setPersistedPath(e.detail.path);
                setIsLoaded(false);
            }
        };
        window.addEventListener("agent-preview-navigate", handleNavigate);
        return function () { return window.removeEventListener("agent-preview-navigate", handleNavigate); };
    });
    // Dispatch path updates to header
    (0, solid_js_1.createEffect)(function () {
        window.dispatchEvent(new CustomEvent("agent-preview-path-update", { detail: {
                chatId: chatId,
                path: currentPath
            } }));
    });
    // Sync loadedPath when persistedPath changes (e.g., on mount with stored value)
    (0, solid_js_1.createEffect)(function () {
        setLoadedPath(persistedPath);
        setCurrentPath(persistedPath);
    });
    // Compute base host and preview URL
    var previewBaseUrl = (0, solid_js_1.createMemo)(function () { return getSandboxPreviewUrl(sandboxId, port, "agents"); });
    var baseHost = (0, solid_js_1.createMemo)(function () {
        return new URL(previewBaseUrl).host;
    });
    var previewUrl = (0, solid_js_1.createMemo)(function () {
        return "".concat(previewBaseUrl).concat(loadedPath);
    });
    // Handle path selection from URL bar
    var handlePathSelect = function (path) {
        setLoadedPath(path);
        setCurrentPath(path);
        setPersistedPath(path);
        setIsLoaded(false);
    };
    // Listen for SET_URL messages from iframe for bi-directional sync
    (0, solid_js_1.createEffect)(function () {
        var handleMessage = function (event) {
            var _a;
            // Verify source is our iframe
            if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
                return;
            }
            // Handle SET_URL messages from preview script
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) === "SET_URL") {
                var newPath = event.data.url || "/";
                // Skip srcdoc paths (edge case from iframe)
                if (newPath.includes("srcdoc")) {
                    return;
                }
                // Update ONLY currentPath for immediate display update
                // Do NOT update loadedPath - that would cause iframe remount
                setCurrentPath(newPath);
                setPersistedPath(newPath);
            }
        };
        window.addEventListener("message", handleMessage);
        return function () { return window.removeEventListener("message", handleMessage); };
    });
    // Calculate max width on mount and window resize
    (0, solid_js_1.createEffect)(function () {
        var updateMaxWidth = function () {
            var availableWidth = window.innerWidth - 64;
            setMaxWidth(Math.max(constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, availableWidth));
        };
        updateMaxWidth();
        window.addEventListener("resize", updateMaxWidth);
        return function () { return window.removeEventListener("resize", updateMaxWidth); };
    });
    // Cleanup resize handlers on unmount
    (0, solid_js_1.createEffect)(function () {
        return function () {
            var _a;
            (_a = resizeCleanupRef.current) === null || _a === void 0 ? void 0 : _a.call(resizeCleanupRef);
        };
    });
    var handleReload = function () {
        if (isRefreshing)
            return;
        setIsRefreshing(true);
        setIsLoaded(false);
        setReloadKey(function (prev) { return prev + 1; });
        setTimeout(function () { return setIsRefreshing(false); }, 400);
    };
    var handlePresetChange = function (presetName) {
        var preset = constants_1.DEVICE_PRESETS.find(function (p) { return p.name === presetName; });
        if (preset) {
            setDevice({
                width: preset.width,
                height: preset.height,
                preset: preset.name
            });
        }
    };
    var handleWidthChange = function (width) {
        setDevice(__assign(__assign({}, device), { width: width, preset: "Custom" }));
    };
    var handleResizeStart = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var handle = e.currentTarget;
        var pointerId = e.pointerId;
        var isLeftHandle = handle.getAttribute("data-side") === "left";
        var startX = e.clientX;
        var startWidth = device.width;
        var frame = frameRef.current;
        if (!frame)
            return;
        handle.setPointerCapture(pointerId);
        setIsResizing(true);
        var handlePointerMove = function (e) {
            var delta = e.clientX - startX;
            if (isLeftHandle) {
                delta = -delta;
            }
            var newWidth = Math.round(Math.max(constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, Math.min(maxWidth, startWidth + delta * 2)));
            frame.style.width = "".concat(newWidth, "px");
            setDevice(__assign(__assign({}, device), { width: newWidth, preset: "Custom" }));
        };
        var handlePointerUp = function () {
            if (handle.hasPointerCapture(pointerId)) {
                handle.releasePointerCapture(pointerId);
            }
            setIsResizing(false);
            cleanup();
        };
        var handlePointerCancel = function () {
            if (handle.hasPointerCapture(pointerId)) {
                handle.releasePointerCapture(pointerId);
            }
            cleanup();
        };
        var cleanup = function () {
            handle.removeEventListener("pointermove", handlePointerMove);
            handle.removeEventListener("pointerup", handlePointerUp);
            handle.removeEventListener("pointercancel", handlePointerCancel);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
            resizeCleanupRef.current = null;
        };
        document.body.style.userSelect = "none";
        document.body.style.cursor = "ew-resize";
        handle.addEventListener("pointermove", handlePointerMove);
        handle.addEventListener("pointerup", handlePointerUp);
        handle.addEventListener("pointercancel", handlePointerCancel);
        resizeCleanupRef.current = cleanup;
    };
    return <div class={(0, utils_1.cn)("flex flex-col bg-tl-background", isMobile ? "h-full w-full" : "h-full")}>
      {/* Mobile Header */}
      {isMobile && !hideHeader && <div class="flex-shrink-0 bg-background/95 backdrop-blur border-b h-11 min-h-[44px] max-h-[44px]" data-mobile-preview-header style={{ WebkitAppRegion: "drag" }}>
          <div class="flex h-full items-center px-2 gap-2" style={{ WebkitAppRegion: "no-drag" }}>
            {/* Chat button */}
            <button_1.Button variant="ghost" size="icon" onClick={onClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
              <icons_1.IconChatBubble class="h-4 w-4"/>
              <span class="sr-only">Back to chat</span>
            </button_1.Button>

            {/* Reload button */}
            <button_1.Button variant="ghost" size="icon" onClick={handleReload} disabled={isRefreshing} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md">
              <lucide_solid_1.RotateCw class={(0, utils_1.cn)("h-4 w-4", isRefreshing && "animate-spin")}/>
            </button_1.Button>

            {/* URL Input - centered, flexible */}
            <div class="flex-1 min-w-0 mx-1">
              <preview_url_input_1.PreviewUrlInput baseHost={baseHost} currentPath={currentPath} onPathChange={handlePathSelect} isLoading={!isLoaded} class="w-full" variant="mobile"/>
            </div>

            {/* Scale control */}
            <scale_control_1.ScaleControl value={scale} onChange={setScale}/>

            {/* Copy link button */}
            <mobile_copy_link_button_1.MobileCopyLinkButton url={previewUrl}/>
          </div>
        </div>}

      {/* Desktop Header */}
      {!isMobile && !hideHeader && <div class="flex items-center justify-between px-3 h-10 bg-tl-background flex-shrink-0">
          {/* Left: Refresh + Viewport Toggle + Scale */}
          <div class="flex items-center gap-1 flex-1">
            <button_1.Button variant="ghost" onClick={handleReload} disabled={isRefreshing} class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
              <lucide_solid_1.RotateCw class={(0, utils_1.cn)("h-3.5 w-3.5 text-muted-foreground", isRefreshing && "animate-spin")}/>
            </button_1.Button>

            <viewport_toggle_1.ViewportToggle value={viewportMode} onChange={setViewportMode}/>

            <scale_control_1.ScaleControl value={scale} onChange={setScale}/>
          </div>

          {/* Center: URL bar */}
          <div class="flex-1 mx-2 min-w-0 flex items-center justify-center">
            <preview_url_input_1.PreviewUrlInput baseHost={baseHost} currentPath={currentPath} onPathChange={handlePathSelect} isLoading={!isLoaded} class="max-w-[350px] w-full"/>
          </div>

          {/* Right: External link + Mode toggle + Close */}
          <div class="flex items-center justify-end gap-1 flex-1">
            <button_1.Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={function () { return window.open(previewUrl, "_blank"); }}>
              <icons_1.ExternalLinkIcon class="h-3.5 w-3.5 text-muted-foreground"/>
            </button_1.Button>

            {onClose && <button_1.Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={onClose}>
                <icons_1.IconDoubleChevronRight class="h-4 w-4 text-muted-foreground"/>
              </button_1.Button>}
          </div>
        </div>}

      {/* Device presets bar - only visible in mobile viewport mode (not on actual mobile devices) */}
      {!isMobile && !hideHeader && viewportMode === "mobile" && <device_presets_bar_1.DevicePresetsBar selectedPreset={device.preset} width={device.width} height={device.height} onPresetChange={handlePresetChange} onWidthChange={handleWidthChange} maxWidth={maxWidth}/>}

      {/* Content area */}
      <div class={(0, utils_1.cn)("flex-1 relative flex items-center justify-center overflow-hidden", isMobile ? "w-full h-full" : "px-1 pb-1")}>
        {isMobile ? <div class="relative overflow-hidden w-full h-full flex-shrink-0 bg-background">
            <div class="w-full h-full" style={scale !== 100 ? {
                width: "".concat(100 / scale * 100, "%"),
                height: "".concat(100 / scale * 100, "%"),
                transform: "scale(".concat(scale / 100, ")"),
                transformOrigin: "top left"
            } : undefined}>
              <iframe ref={iframeRef} key={reloadKey} src={previewUrl} width="100%" height="100%" style={{ border: "none" }} title="Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" allow="clipboard-write" onLoad={function () { return setIsLoaded(true); }} onError={function () { return setIsLoaded(true); }}/>
            </div>
            {/* Loading overlay */}
            {!isLoaded && <div class="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div class="w-6 h-6 animate-pulse">
                  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="21st logo">
                    <path fillRule="evenodd" clipRule="evenodd" d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z" fill="currentColor" class="text-muted-foreground"/>
                  </svg>
                </div>
              </div>}
          </div> : <>
            {/* Left resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode === "mobile" && <resize_handle_1.ResizeHandle side="left" onPointerDown={handleResizeStart} isResizing={isResizing}/>}

            {/* Frame with dynamic size */}
            <div ref={frameRef} class={(0, utils_1.cn)("relative overflow-hidden flex-shrink-0 bg-background", !isResizing && "transition-[width,height,margin] duration-300 ease-in-out", viewportMode === "desktop" ? "border-[0.5px] rounded-sm" : "shadow-lg border")} style={{
                width: viewportMode === "desktop" ? "100%" : "".concat(device.width, "px"),
                height: "100%",
                maxHeight: viewportMode === "mobile" ? "".concat(device.height, "px") : "100%",
                marginLeft: viewportMode === "mobile" ? "16px" : "0",
                marginRight: viewportMode === "mobile" ? "16px" : "0",
                borderRadius: viewportMode === "desktop" ? "8px" : "24px"
            }}>
              {/* Scale transform wrapper */}
              <div class="w-full h-full" style={scale !== 100 ? {
                width: "".concat(100 / scale * 100, "%"),
                height: "".concat(100 / scale * 100, "%"),
                transform: "scale(".concat(scale / 100, ")"),
                transformOrigin: "top left"
            } : undefined}>
                <iframe ref={iframeRef} key={reloadKey} src={previewUrl} width="100%" height="100%" style={{
                border: "none",
                borderRadius: viewportMode === "desktop" ? "8px" : "24px"
            }} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" onLoad={function () { return setIsLoaded(true); }} title="Preview" tabIndex={-1}/>

                {/* Loading overlay */}
                {!isLoaded && <div class="absolute inset-0 flex items-center justify-center bg-background z-10 rounded-[inherit]">
                    <div class="w-6 h-6 animate-pulse">
                      <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="21st logo">
                        <path fillRule="evenodd" clipRule="evenodd" d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z" fill="currentColor" class="text-muted-foreground"/>
                      </svg>
                    </div>
                  </div>}
              </div>
            </div>

            {/* Right resize handle - only in mobile viewport mode (not on actual mobile devices) */}
            {viewportMode === "mobile" && <resize_handle_1.ResizeHandle side="right" onPointerDown={handleResizeStart} isResizing={isResizing}/>}
          </>}
      </div>
    </div>;
}
