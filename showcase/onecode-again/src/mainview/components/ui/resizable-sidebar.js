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
exports.ResizableSidebar = ResizableSidebar;
var jotai_1 = require("../../lib/state/jotai");
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var kbd_1 = require("./kbd");
var DEFAULT_MIN_WIDTH = 200;
var DEFAULT_MAX_WIDTH = 9999;
var DEFAULT_ANIMATION_DURATION = 0;
var EXTENDED_HOVER_AREA_WIDTH = 8;
function ResizableSidebar(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, widthAtom = _a.widthAtom, _b = _a.minWidth, minWidth = _b === void 0 ? DEFAULT_MIN_WIDTH : _b, _c = _a.maxWidth, maxWidth = _c === void 0 ? DEFAULT_MAX_WIDTH : _c, side = _a.side, closeHotkey = _a.closeHotkey, _d = _a.animationDuration, animationDuration = _d === void 0 ? DEFAULT_ANIMATION_DURATION : _d, children = _a.children, _e = _a.className, className = _e === void 0 ? "" : _e, _f = _a.initialWidth, initialWidth = _f === void 0 ? 0 : _f, _g = _a.exitWidth, exitWidth = _g === void 0 ? 0 : _g, dataAttributes = _a.dataAttributes, _h = _a.disableClickToClose, disableClickToClose = _h === void 0 ? false : _h, _j = _a.showResizeTooltip, showResizeTooltip = _j === void 0 ? false : _j, style = _a.style;
    var _k = (0, jotai_1.useAtom)(widthAtom), sidebarWidth = _k[0], setSidebarWidth = _k[1];
    // Track if this is the first open to avoid initial animation when already open
    var _l = (0, solid_js_1.createSignal)(false), hasOpenedOnce = _l[0], setHasOpenedOnce = _l[1];
    var _m = (0, solid_js_1.createSignal)(false), wasOpenRef = _m[0], setWasOpenRef = _m[1];
    var _o = (0, solid_js_1.createSignal)(!isOpen), shouldAnimate = _o[0], setShouldAnimate = _o[1];
    // Resize handle state
    var _p = (0, solid_js_1.createSignal)(false), isResizing = _p[0], setIsResizing = _p[1];
    var _q = (0, solid_js_1.createSignal)(false), isHoveringResizeHandle = _q[0], setIsHoveringResizeHandle = _q[1];
    var _r = (0, solid_js_1.createSignal)(null), tooltipY = _r[0], setTooltipY = _r[1];
    var _s = (0, solid_js_1.createSignal)(false), isTooltipDismissed = _s[0], setIsTooltipDismissed = _s[1];
    var _t = (0, solid_js_1.createSignal)(null), resizeHandleRef = _t[0], setResizeHandleRef = _t[1];
    var _u = (0, solid_js_1.createSignal)(null), sidebarRef = _u[0], setSidebarRef = _u[1];
    var _v = (0, solid_js_1.createSignal)(null), tooltipRef = _v[0], setTooltipRef = _v[1];
    var _w = (0, solid_js_1.createSignal)(null), tooltipTimeoutRef = _w[0], setTooltipTimeoutRef = _w[1];
    // Local width state for smooth resizing (avoids localStorage sync during resize)
    var _x = (0, solid_js_1.createSignal)(null), localWidth = _x[0], setLocalWidth = _x[1];
    // Use local width during resize, otherwise use persisted width
    var currentWidth = localWidth !== null && localWidth !== void 0 ? localWidth : sidebarWidth;
    // Calculate tooltip position dynamically based on sidebar position
    var tooltipPosition = (0, solid_js_1.createMemo)(function () {
        if (!tooltipY || !sidebarRef.current)
            return null;
        var rect = sidebarRef.current.getBoundingClientRect();
        // For left sidebar, tooltip appears to the right
        // For right sidebar, tooltip appears to the left
        var x = side === "left" ? rect.right + 8 : rect.left - 8;
        return {
            x: x,
            y: tooltipY
        };
    });
    (0, solid_js_1.createEffect)(function () {
        // When sidebar closes, reset hasOpenedOnce so animation plays on next open
        if (!isOpen && wasOpenRef.current) {
            hasOpenedOnce.current = false;
            setShouldAnimate(true);
            // Clear local width when sidebar closes
            setLocalWidth(null);
        }
        if (isOpen) {
            setIsTooltipDismissed(false);
        }
        wasOpenRef.current = isOpen;
        // Mark as opened after animation completes
        if (isOpen && !hasOpenedOnce.current) {
            var timer_1 = setTimeout(function () {
                hasOpenedOnce.current = true;
                setShouldAnimate(false);
            }, animationDuration * 1e3 + 50);
            return function () { return clearTimeout(timer_1); };
        }
        else if (isOpen && hasOpenedOnce.current) {
            // Already opened before, don't animate
            setShouldAnimate(false);
        }
    });
    var handleClose = function () {
        // If tooltip is visible, dismiss it first
        if (isHoveringResizeHandle && !isTooltipDismissed) {
            (0, web_1.flushSync)(function () {
                setIsTooltipDismissed(true);
            });
        }
        // Reset resizing state synchronously so exit animation sees the final width
        (0, web_1.flushSync)(function () {
            if (isResizing) {
                setIsResizing(false);
            }
            if (localWidth !== null) {
                setLocalWidth(null);
            }
        });
        // Ensure animation is enabled when closing
        setShouldAnimate(true);
        // Close sidebar - this will trigger exit animation via AnimatePresence
        onClose();
        setIsHoveringResizeHandle(false);
        setTooltipY(null);
    };
    // Cleanup tooltip timeout on unmount or when sidebar closes
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen) {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            setIsHoveringResizeHandle(false);
            setTooltipY(null);
        }
        return function () {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
        };
    });
    // Global click handler for tooltip dismissal
    (0, solid_js_1.createEffect)(function () {
        // Only register handlers when tooltip might be visible
        if (!isOpen || !isHoveringResizeHandle || isTooltipDismissed) {
            return;
        }
        var handleDocumentClick = function (e) {
            var target = e.target;
            var tooltipElement = target.closest("[data-tooltip=\"true\"]");
            var isClickOnTooltip = tooltipElement || tooltipRef.current && tooltipRef.current.contains(target);
            // Check if click is on tooltip
            if (isClickOnTooltip) {
                e.preventDefault();
                e.stopPropagation();
                (0, web_1.flushSync)(function () {
                    setIsTooltipDismissed(true);
                });
                handleClose();
            }
        };
        // Use capture phase to catch event early
        document.addEventListener("click", handleDocumentClick, true);
        document.addEventListener("pointerdown", handleDocumentClick, true);
        return function () {
            document.removeEventListener("click", handleDocumentClick, true);
            document.removeEventListener("pointerdown", handleDocumentClick, true);
        };
    });
    // Handle resize interactions (both handle and extended area)
    var handleResizePointerDown = function (event) {
        var _a, _b;
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        var startX = event.clientX;
        var startWidth = sidebarWidth;
        var pointerId = event.pointerId;
        var hasMoved = false;
        var currentLocalWidth = null;
        var handleElement = (_a = resizeHandleRef.current) !== null && _a !== void 0 ? _a : event.currentTarget;
        var clampWidth = function (width) { return Math.max(minWidth, Math.min(maxWidth, width)); };
        (_b = handleElement.setPointerCapture) === null || _b === void 0 ? void 0 : _b.call(handleElement, pointerId);
        // Clear tooltip timeout when starting resize
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setIsResizing(true);
        setIsHoveringResizeHandle(false);
        var updateWidth = function (clientX) {
            // For left sidebar, moving right increases width
            // For right sidebar, moving left increases width
            var delta = side === "left" ? clientX - startX : startX - clientX;
            var newWidth = clampWidth(startWidth + delta);
            currentLocalWidth = newWidth;
            // Use local state for smooth real-time updates during resize
            setLocalWidth(newWidth);
        };
        var handlePointerMove = function (pointerEvent) {
            var delta = Math.abs(side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX);
            if (!hasMoved && delta >= 3) {
                hasMoved = true;
            }
            if (hasMoved) {
                // Update width immediately for real-time resize
                updateWidth(pointerEvent.clientX);
            }
        };
        var finishResize = function (pointerEvent) {
            var _a;
            if ((_a = handleElement.hasPointerCapture) === null || _a === void 0 ? void 0 : _a.call(handleElement, pointerId)) {
                handleElement.releasePointerCapture(pointerId);
            }
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("pointercancel", handlePointerCancel);
            setIsResizing(false);
            if (!hasMoved && pointerEvent && !disableClickToClose) {
                handleClose();
            }
            else if (hasMoved && pointerEvent) {
                var delta = side === "left" ? pointerEvent.clientX - startX : startX - pointerEvent.clientX;
                var finalWidth = clampWidth(startWidth + delta);
                // Save final width to persisted atom (triggers localStorage sync)
                setSidebarWidth(finalWidth);
                // Clear local width to use persisted value
                setLocalWidth(null);
            }
            else {
                // If no pointer event but resize was happening, save current local width
                if (currentLocalWidth !== null) {
                    setSidebarWidth(currentLocalWidth);
                    setLocalWidth(null);
                }
            }
        };
        var handlePointerUp = function (pointerEvent) {
            finishResize(pointerEvent);
        };
        var handlePointerCancel = function () {
            finishResize();
        };
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp, { once: true });
        document.addEventListener("pointercancel", handlePointerCancel, { once: true });
    };
    // Determine resize handle position based on side
    var resizeHandleStyle = (0, solid_js_1.createMemo)(function () {
        if (side === "left") {
            return {
                right: "0px",
                width: "4px",
                marginRight: "-2px",
                paddingLeft: "2px",
                paddingRight: "2px"
            };
        }
        else {
            return {
                left: "0px",
                width: "4px",
                marginLeft: "-2px",
                paddingLeft: "2px",
                paddingRight: "2px"
            };
        }
    });
    var extendedHoverAreaStyle = (0, solid_js_1.createMemo)(function () {
        if (side === "left") {
            return {
                width: "".concat(EXTENDED_HOVER_AREA_WIDTH, "px"),
                right: "0px"
            };
        }
        else {
            return {
                width: "".concat(EXTENDED_HOVER_AREA_WIDTH, "px"),
                left: "0px"
            };
        }
    });
    return <>
      <react_1.AnimatePresence>
        {isOpen && <react_1.motion.div ref={sidebarRef} initial={!shouldAnimate ? {
                width: currentWidth,
                opacity: 1
            } : {
                width: initialWidth,
                opacity: 0
            }} animate={{
                width: currentWidth,
                opacity: 1
            }} exit={{
                width: exitWidth,
                opacity: 0
            }} transition={{
                duration: isResizing ? 0 : animationDuration,
                ease: [
                    .4,
                    0,
                    .2,
                    1
                ]
            }} class={"bg-transparent flex flex-col text-xs h-full relative ".concat(className)} style={__assign({ minWidth: minWidth, overflow: "hidden" }, style)} {...dataAttributes ? Object.fromEntries(Object.entries(dataAttributes).map(function (_a) {
            var key = _a[0], value = _a[1];
            return ["data-".concat(key), value];
        })) : {}}>
            {/* Extended hover area */}
            <div data-extended-hover-area class="absolute top-0 bottom-0 cursor-col-resize" style={__assign(__assign({}, extendedHoverAreaStyle), { pointerEvents: isResizing ? "none" : "auto", zIndex: isResizing ? 5 : 10 })} onPointerDown={handleResizePointerDown} onMouseEnter={function (e) {
                if (isResizing) {
                    return;
                }
                // Clear any existing timeout
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                }
                // Set Y position immediately for positioning
                if (!tooltipY) {
                    setTooltipY(e.clientY);
                }
                // Delay showing tooltip
                tooltipTimeoutRef.current = setTimeout(function () {
                    setIsHoveringResizeHandle(true);
                }, 300);
            }} onMouseLeave={function (e) {
                var _a;
                if (isResizing)
                    return;
                // Clear timeout if mouse leaves before tooltip appears
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                }
                var relatedTarget = e.relatedTarget;
                // Check if relatedTarget is a Node (not window or null)
                if (relatedTarget instanceof Node && (((_a = resizeHandleRef.current) === null || _a === void 0 ? void 0 : _a.contains(relatedTarget)) || resizeHandleRef.current === relatedTarget)) {
                    return;
                }
                setIsHoveringResizeHandle(false);
                setTooltipY(null);
                setIsTooltipDismissed(false);
            }}/>

            {/* Resize Handle */}
            <div ref={resizeHandleRef} onPointerDown={handleResizePointerDown} onMouseEnter={function (e) {
                // Clear any existing timeout
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                }
                // Set Y position immediately for positioning
                if (!tooltipY) {
                    setTooltipY(e.clientY);
                }
                // Delay showing tooltip
                tooltipTimeoutRef.current = setTimeout(function () {
                    setIsHoveringResizeHandle(true);
                }, 300);
            }} onMouseLeave={function (e) {
                // Clear timeout if mouse leaves before tooltip appears
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                }
                var relatedTarget = e.relatedTarget;
                // Check if relatedTarget is an Element (not window or null)
                if (relatedTarget instanceof Element && relatedTarget.closest("[data-extended-hover-area]")) {
                    return;
                }
                setIsHoveringResizeHandle(false);
                setTooltipY(null);
                setIsTooltipDismissed(false);
            }} class={"absolute top-0 bottom-0 cursor-col-resize z-10"} style={resizeHandleStyle}/>

            {/* Hover Tooltip - Notion style */}
            {showResizeTooltip && isHoveringResizeHandle && !isResizing && !isTooltipDismissed && tooltipPosition && typeof window !== "undefined" && (0, web_1.createPortal)(<react_1.AnimatePresence>
                  {tooltipPosition && <react_1.motion.div key="tooltip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                        duration: .05,
                        ease: "easeOut"
                    }} class="fixed z-10" style={{
                        left: "".concat(tooltipPosition.x, "px"),
                        top: "".concat(tooltipPosition.y, "px"),
                        transform: side === "left" ? "translateY(-50%)" : "translateX(-100%) translateY(-50%)",
                        transformOrigin: side === "left" ? "left center" : "right center",
                        pointerEvents: "none"
                    }}>
                      <div ref={tooltipRef} role="dialog" data-tooltip="true" class="relative rounded-md border border-border bg-popover px-2 py-1 flex flex-col items-start gap-0.5 text-xs text-popover-foreground shadow-lg dark pointer-events-auto" onPointerDown={function (e) {
                        e.stopPropagation();
                        if (e.button === 0) {
                            // Left mouse button
                            (0, web_1.flushSync)(function () {
                                setIsTooltipDismissed(true);
                            });
                            // Directly call handleClose - same as button
                            handleClose();
                        }
                    }} onClick={function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        (0, web_1.flushSync)(function () {
                            setIsTooltipDismissed(true);
                        });
                        // Directly call handleClose - same as button
                        handleClose();
                    }}>
                        {!disableClickToClose && <div class="flex items-center gap-1 text-xs">
                            <span>Close</span>
                            <span class="text-muted-foreground inline-flex items-center gap-1">
                              <span>Click</span>
                              {closeHotkey && <>
                                  <span>or</span>
                                  <kbd_1.Kbd>{closeHotkey}</kbd_1.Kbd>
                                </>}
                            </span>
                          </div>}
                        <div class="flex items-center gap-1 text-xs">
                          <span>Resize</span>
                          <span class="text-muted-foreground">Drag</span>
                        </div>
                      </div>
                    </react_1.motion.div>}
                </react_1.AnimatePresence>, document.body)}

            {/* Children content */}
            {children}
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </>;
}
