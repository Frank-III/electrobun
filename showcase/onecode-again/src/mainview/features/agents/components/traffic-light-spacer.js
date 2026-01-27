"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficLights = TrafficLights;
exports.TrafficLightSpacer = TrafficLightSpacer;
exports.NoDrag = NoDrag;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
/**
* Hybrid traffic lights component for macOS desktop app
* - Shows native macOS traffic lights when hovered
* - Shows custom muted circles when NOT hovered (for visual indication)
* Note: isDesktop prop should be passed from parent after mount to avoid hydration mismatch
*/
function TrafficLights(_a) {
    var _b = _a.isHovered, isHovered = _b === void 0 ? true : _b, _c = _a.isFullscreen, isFullscreen = _c === void 0 ? null : _c, _d = _a.isDesktop, isDesktop = _d === void 0 ? false : _d, _e = _a.className, className = _e === void 0 ? "" : _e, onHoverChange = _a.onHoverChange;
    var _f = (0, solid_js_1.createSignal)(isHovered), prevHoveredRef = _f[0], setPrevHoveredRef = _f[1];
    // Toggle native traffic light visibility based on hover state
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isDesktop || isFullscreen)
            return;
        if (typeof window === "undefined" || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setTrafficLightVisibility))
            return;
        // Only update if hover state changed
        if (prevHoveredRef.current !== isHovered) {
            prevHoveredRef.current = isHovered;
            window.desktopApi.setTrafficLightVisibility(isHovered);
        }
    });
    // NOTE: Removed mount effect that hides native lights
    // Native lights are shown by default (main process), and AgentsLayout controls visibility
    // This prevents the "flash of hidden lights" during loading state
    // Only show in desktop app, hide in fullscreen (native traffic lights always show in fullscreen)
    // isFullscreen === true means fullscreen, null or false means not fullscreen
    if (!isDesktop || isFullscreen === true)
        return null;
    // When hovered, native lights are visible - render invisible placeholder to maintain layout
    if (isHovered) {
        return <div class={(0, utils_1.cn)("relative", className)} style={{ WebkitAppRegion: "no-drag" }} data-sidebar-content>
        <div class="flex items-center gap-2" data-sidebar-content>
          <div class="w-3 h-3"/>
          <div class="w-3 h-3"/>
          <div class="w-3 h-3"/>
        </div>
      </div>;
    }
    // When NOT hovered, native lights are hidden - show custom muted circles
    return <div class={(0, utils_1.cn)("relative", className)} style={{ WebkitAppRegion: "no-drag" }} data-sidebar-content>
      {/* Muted traffic lights - just circles with border */}
      <div class="flex items-center gap-2" data-sidebar-content>
        <div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true"/>
        <div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true"/>
        <div class="w-3 h-3 rounded-full border border-foreground/20 bg-transparent" aria-hidden="true"/>
      </div>
    </div>;
}
/**
* Spacer component for macOS traffic light buttons (close/minimize/maximize)
* Only renders in Electron desktop app to provide space for the buttons
* Animates height smoothly when appearing/disappearing (e.g. fullscreen transitions)
*
* isFullscreen can be:
* - null: not initialized yet (no animation, assume not fullscreen)
* - boolean: initialized (animate only on real changes)
*/
function TrafficLightSpacer(_a) {
    var _b = _a.isFullscreen, isFullscreen = _b === void 0 ? null : _b, _c = _a.isDesktop, isDesktop = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var _e = (0, solid_js_1.createSignal)(isFullscreen), prevFullscreenRef = _e[0], setPrevFullscreenRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), shouldAnimate = _f[0], setShouldAnimate = _f[1];
    (0, solid_js_1.createEffect)(function () {
        // Enable animation only after first real fullscreen change (not initial load)
        // Both previous and current must be non-null (initialized) and different
        if (isFullscreen !== null && prevFullscreenRef.current !== null && prevFullscreenRef.current !== isFullscreen) {
            setShouldAnimate(true);
        }
        prevFullscreenRef.current = isFullscreen;
    });
    // Show spacer when desktop and not fullscreen
    // If isFullscreen is null (not initialized), assume not fullscreen
    var shouldShow = isDesktop && isFullscreen !== true;
    return <div class={(0, utils_1.cn)("w-full shrink-0 overflow-hidden", shouldAnimate && "transition-[height] duration-200 ease-out", className)} style={{ height: shouldShow ? 32 : 0 }}/>;
}
/**
* Wrapper to make child elements non-draggable within a draggable region
*/
function NoDrag(_a) {
    var children = _a.children;
    return <div style={{ WebkitAppRegion: "no-drag" }}>
      {children}
    </div>;
}
