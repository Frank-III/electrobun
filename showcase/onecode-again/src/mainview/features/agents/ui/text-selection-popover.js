"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSelectionPopover = TextSelectionPopover;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var text_selection_context_1 = require("../context/text-selection-context");
function TextSelectionPopover(_a) {
    var onAddToContext = _a.onAddToContext, onQuickComment = _a.onQuickComment, onFocusInput = _a.onFocusInput;
    var _b = (0, text_selection_context_1.useTextSelection)(), selectedText = _b.selectedText, source = _b.source, selectionRect = _b.selectionRect, clearSelection = _b.clearSelection;
    var _c = (0, solid_js_1.createSignal)(false), isVisible = _c[0], setIsVisible = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), isMouseDown = _d[0], setIsMouseDown = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), popoverRef = _e[0], setPopoverRef = _e[1];
    var handleAddToContext = function () {
        if (selectedText && source) {
            onAddToContext(selectedText, source);
            clearSelection();
            setIsVisible(false);
            // Focus the chat input after adding to context
            requestAnimationFrame(function () {
                onFocusInput === null || onFocusInput === void 0 ? void 0 : onFocusInput();
            });
        }
    };
    var handleQuickComment = function () {
        if (selectedText && source && selectionRect && onQuickComment) {
            onQuickComment(selectedText, source, selectionRect);
            setIsVisible(false);
        }
    };
    // Track mouse down/up to know when selection is complete
    (0, solid_js_1.createEffect)(function () {
        var handleMouseDown = function (e) {
            var _a;
            // Ignore clicks on the popover itself
            if ((_a = popoverRef.current) === null || _a === void 0 ? void 0 : _a.contains(e.target)) {
                return;
            }
            setIsMouseDown(true);
            setIsVisible(false);
        };
        var handleMouseUp = function (e) {
            var _a;
            // Ignore clicks on the popover itself
            if ((_a = popoverRef.current) === null || _a === void 0 ? void 0 : _a.contains(e.target)) {
                return;
            }
            setIsMouseDown(false);
        };
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);
        return function () {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    });
    // Show popover only when mouse is up and we have a valid selection
    (0, solid_js_1.createEffect)(function () {
        if (!isMouseDown && selectedText && source && selectionRect) {
            setIsVisible(true);
        }
        else if (!selectedText || !source || !selectionRect) {
            setIsVisible(false);
        }
    });
    // Don't render if not visible
    if (!isVisible || !selectedText || !source || !selectionRect) {
        return null;
    }
    // Calculate position - above the selection by default, below if not enough space
    var viewportWidth = window.innerWidth;
    var popoverWidth = 120;
    var popoverHeight = 28;
    var left = selectionRect.left + selectionRect.width / 2;
    // Clamp left position to prevent overflow
    left = Math.max(popoverWidth / 2 + 8, Math.min(left, viewportWidth - popoverWidth / 2 - 8));
    // Calculate actual left position accounting for centering
    var popoverWidthEstimate = onQuickComment && (source.type === "diff" || source.type === "tool-edit") ? 160 : 100;
    var centeredLeft = left - popoverWidthEstimate / 2;
    // Position above by default, below if not enough space above
    var spaceAbove = selectionRect.top;
    var showAbove = spaceAbove > popoverHeight + 8;
    var top = showAbove ? selectionRect.top - popoverHeight - 4 : selectionRect.bottom + 4;
    var style = {
        position: "fixed",
        top: top,
        left: centeredLeft,
        zIndex: 1e5
    };
    // Animation: scale from direction of selection
    var animationClass = showAbove ? "animate-in fade-in-0 zoom-in-95 origin-bottom duration-100" : "animate-in fade-in-0 zoom-in-95 origin-top duration-100";
    var popoverContent = <div ref={popoverRef} style={style} class={animationClass}>
      <div class="flex items-center gap-0.5 rounded-md border border-border bg-popover px-0.5 py-0.5 shadow-lg">
        <button onClick={handleAddToContext} class="rounded px-1.5 py-0.5 text-xs text-popover-foreground hover:bg-white/15 transition-colors duration-100 active:scale-[0.97]">
          Add to context
        </button>
        {/* Quick comment button shows for diff and tool-edit selections */}
        {onQuickComment && (source.type === "diff" || source.type === "tool-edit") && <>
            <div class="w-px h-3 bg-border"/>
            <button onClick={handleQuickComment} class="rounded px-1.5 py-0.5 text-xs text-popover-foreground hover:bg-white/15 transition-colors duration-100 active:scale-[0.97]">
              Reply
            </button>
          </>}
      </div>
    </div>;
    return (0, web_1.createPortal)(popoverContent, document.body);
}
