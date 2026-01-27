"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickCommentInput = QuickCommentInput;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var utils_1 = require("../../../lib/utils");
function QuickCommentInput(_a) {
    var selectedText = _a.selectedText, source = _a.source, rect = _a.rect, onSubmit = _a.onSubmit, onCancel = _a.onCancel;
    var _b = (0, solid_js_1.createSignal)(""), comment = _b[0], setComment = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), inputRef = _c[0], setInputRef = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), containerRef = _d[0], setContainerRef = _d[1];
    // Auto-focus on mount
    (0, solid_js_1.createEffect)(function () {
        // Small delay to ensure portal is mounted
        var timer = setTimeout(function () {
            var _a;
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }, 10);
        return function () { return clearTimeout(timer); };
    });
    // Handle click outside
    (0, solid_js_1.createEffect)(function () {
        var handleClickOutside = function (e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onCancel();
            }
        };
        // Add with slight delay to prevent immediate trigger from the button click
        var timer = setTimeout(function () {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);
        return function () {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });
    var handleSubmit = function () {
        var trimmed = comment.trim();
        if (trimmed) {
            onSubmit(trimmed, selectedText, source);
        }
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };
    // Calculate position - below the selection by default, above if not enough space
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var inputWidth = 320;
    var inputHeight = 90;
    // Center horizontally on the selection
    var left = rect.left + rect.width / 2;
    left = Math.max(inputWidth / 2 + 16, Math.min(left, viewportWidth - inputWidth / 2 - 16));
    var centeredLeft = left - inputWidth / 2;
    // Position below by default, above if not enough space below
    var spaceBelow = viewportHeight - rect.bottom;
    var showBelow = spaceBelow > inputHeight + 8;
    var top = showBelow ? rect.bottom + 4 : rect.top - inputHeight - 4;
    var style = {
        position: "fixed",
        top: top,
        left: centeredLeft,
        width: inputWidth,
        zIndex: 100001
    };
    // Create preview text
    var preview = selectedText.length > 60 ? selectedText.slice(0, 60) + "..." : selectedText;
    // Get source label
    var sourceLabel = source.type === "diff" || source.type === "tool-edit" ? "".concat(source.filePath.split("/").pop()).concat(source.type === "diff" && source.lineNumber ? ":".concat(source.lineNumber) : "") : "from chat";
    // Animation: scale from direction of selection
    var animationClass = showBelow ? "animate-in fade-in-0 zoom-in-95 origin-top duration-100" : "animate-in fade-in-0 zoom-in-95 origin-bottom duration-100";
    var content = <div ref={containerRef} style={style} class={animationClass}>
      <div class="rounded-md bg-popover border border-border shadow-lg overflow-hidden">
        {/* Preview of selected text */}
        <div class="px-2.5 py-1.5 border-b border-border bg-muted/30">
          <div class="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
            <span>Replying to</span>
            <span class="font-medium text-foreground/70">{sourceLabel}</span>
          </div>
          <div class="text-xs text-muted-foreground font-mono line-clamp-2">
            {preview}
          </div>
        </div>

        {/* Input area */}
        <div class="p-1.5">
          <div class="flex items-center gap-1.5">
            <input ref={inputRef} type="text" value={comment} onChange={function (e) { return setComment(e.target.value); }} onKeyDown={handleKeyDown} placeholder="Add your reply..." class="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground px-1"/>
            <button onClick={handleSubmit} disabled={!comment.trim()} class={(0, utils_1.cn)("shrink-0 px-2 py-0.5 text-xs font-medium rounded transition-colors", comment.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>;
    return (0, web_1.createPortal)(content, document.body);
}
