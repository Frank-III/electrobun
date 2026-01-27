"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="@welldone-software/why-did-you-render" />
var react_1 = require("react");
var why_did_you_render_1 = require("@welldone-software/why-did-you-render");
// ============================================================================
// WDYR (Why Did You Render) - React Re-render Debugging
// ============================================================================
// Set to true to enable re-render tracking and infinite loop detection.
// See DEBUG-WDYR.md for usage instructions.
// ============================================================================
var WDYR_ENABLED = false;
if (import.meta.env.DEV && WDYR_ENABLED) {
    // Track render counts per component to detect infinite loops
    var renderCounts_1 = {};
    var THRESHOLD_1 = 10; // Max renders before triggering debugger
    var TIME_WINDOW_1 = 1000; // Time window in ms
    (0, why_did_you_render_1.default)(react_1.default, {
        trackAllPureComponents: true,
        trackHooks: true,
        logOwnerReasons: true, // Shows parent chain causing re-renders
        logOnDifferentValues: true, // Log ALL re-renders
        collapseGroups: true,
        notifier: function (info) {
            var _a, _b, _c, _d, _e, _f, _g;
            var name = info.displayName || ((_a = info.Component) === null || _a === void 0 ? void 0 : _a.name) || "Unknown";
            var now = Date.now();
            // Reset count if outside time window
            if (!renderCounts_1[name] || now - renderCounts_1[name].lastTime > TIME_WINDOW_1) {
                renderCounts_1[name] = { count: 0, lastTime: now };
            }
            renderCounts_1[name].count++;
            renderCounts_1[name].lastTime = now;
            // Log every render with prop names (safely handle different data types)
            var getDiffNames = function (diff) {
                if (!diff)
                    return [];
                if (Array.isArray(diff))
                    return diff.map(function (d) { return (d === null || d === void 0 ? void 0 : d.pathString) || (d === null || d === void 0 ? void 0 : d.name) || 'unknown'; });
                if (typeof diff === 'object')
                    return Object.keys(diff);
                return [];
            };
            var propNames = getDiffNames((_b = info.reason) === null || _b === void 0 ? void 0 : _b.propsDifferences);
            var stateNames = getDiffNames((_c = info.reason) === null || _c === void 0 ? void 0 : _c.stateDifferences);
            var hookNames = getDiffNames((_d = info.reason) === null || _d === void 0 ? void 0 : _d.hookDifferences);
            console.log("[WDYR] ".concat(name, " render #").concat(renderCounts_1[name].count), {
                props: propNames.length > 0 ? propNames : false,
                state: stateNames.length > 0 ? stateNames : false,
                hooks: hookNames.length > 0 ? hookNames : false,
            });
            // Trigger debugger before crash if threshold exceeded
            if (renderCounts_1[name].count >= THRESHOLD_1) {
                console.error("\uD83D\uDD34 INFINITE LOOP DETECTED: ".concat(name, " rendered ").concat(THRESHOLD_1, "+ times in ").concat(TIME_WINDOW_1, "ms"));
                console.error("Full info:", info);
                console.error("Props diff:", (_e = info.reason) === null || _e === void 0 ? void 0 : _e.propsDifferences);
                console.error("State diff:", (_f = info.reason) === null || _f === void 0 ? void 0 : _f.stateDifferences);
                console.error("Hook diff:", (_g = info.reason) === null || _g === void 0 ? void 0 : _g.hookDifferences);
                debugger; // Pause here - inspect call stack!
            }
        },
    });
    console.log("[WDYR] Why Did You Render initialized with loop detection");
}
