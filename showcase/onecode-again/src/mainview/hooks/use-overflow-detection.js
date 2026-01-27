"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOverflowDetection = useOverflowDetection;
var react_1 = require("react");
/**
 * VS Code style overflow detection hook
 *
 * Detects when an element's content overflows its container using ResizeObserver.
 * This approach avoids layout thrashing by:
 * - Using ResizeObserver instead of window resize events
 * - Batching measurements with requestAnimationFrame
 * - Proper cleanup through dispose pattern
 *
 * @param contentRef - Ref to the element to observe
 * @param deps - Additional dependencies that should trigger a re-measurement
 * @returns boolean indicating if the element has overflow
 *
 * @example
 * ```tsx
 * const contentRef = useRef<HTMLDivElement>(null)
 * const hasOverflow = useOverflowDetection(contentRef, [textContent])
 *
 * return (
 *   <div ref={contentRef} className="max-h-[100px] overflow-hidden">
 *     {textContent}
 *   </div>
 *   {hasOverflow && <div className="gradient-overlay" />}
 * )
 * ```
 */
function useOverflowDetection(contentRef, deps) {
    if (deps === void 0) { deps = []; }
    var _a = (0, react_1.useState)(false), hasOverflow = _a[0], setHasOverflow = _a[1];
    var rafIdRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        var element = contentRef.current;
        if (!element)
            return;
        // Dispose pattern - track if effect has been cleaned up
        var disposed = false;
        var measureOverflow = function () {
            // Cancel any pending animation frame
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            // Schedule measurement at next animation frame to batch with browser paint
            rafIdRef.current = requestAnimationFrame(function () {
                if (disposed || !contentRef.current)
                    return;
                var el = contentRef.current;
                // Single synchronous read - batched with browser's paint cycle
                var overflows = el.scrollHeight > el.clientHeight;
                setHasOverflow(overflows);
            });
        };
        // Initial measurement
        measureOverflow();
        // ResizeObserver fires AFTER layout, not during - avoids layout thrashing
        var observer = new ResizeObserver(measureOverflow);
        observer.observe(element);
        // Cleanup (VS Code dispose pattern)
        return function () {
            disposed = true;
            observer.disconnect();
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return hasOverflow;
}
