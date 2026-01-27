"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoizedTextPart = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var search_1 = require("../search");
// Helper function to highlight text in DOM using TreeWalker
function highlightTextInDom(container, searchText, currentMatchIndex) {
    if (currentMatchIndex === void 0) { currentMatchIndex = null; }
    // Remove existing highlights first
    var existingHighlights = container.querySelectorAll(".search-highlight");
    existingHighlights.forEach(function (el) {
        var parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ""), el);
            parent.normalize();
        }
    });
    if (!searchText)
        return;
    var lowerSearch = searchText.toLowerCase();
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var node;
    while (node = walker.nextNode()) {
        if (node.nodeValue && node.nodeValue.toLowerCase().includes(lowerSearch)) {
            textNodes.push(node);
        }
    }
    var matchCounter = 0;
    var _loop_1 = function (textNode) {
        var text = textNode.nodeValue || "";
        var lowerText = text.toLowerCase();
        var lastIndex = 0;
        var fragments = [];
        var searchIndex = 0;
        while ((searchIndex = lowerText.indexOf(lowerSearch, lastIndex)) !== -1) {
            if (searchIndex > lastIndex) {
                fragments.push(text.slice(lastIndex, searchIndex));
            }
            var mark = document.createElement("mark");
            mark.className = "search-highlight";
            mark.textContent = text.slice(searchIndex, searchIndex + searchText.length);
            if (currentMatchIndex !== null && matchCounter === currentMatchIndex) {
                mark.classList.add("search-highlight-current");
            }
            matchCounter++;
            fragments.push(mark);
            lastIndex = searchIndex + searchText.length;
        }
        if (lastIndex < text.length) {
            fragments.push(text.slice(lastIndex));
        }
        if (fragments.length > 0) {
            var parent_1 = textNode.parentNode;
            if (parent_1) {
                fragments.forEach(function (frag) {
                    if (typeof frag === "string") {
                        parent_1.insertBefore(document.createTextNode(frag), textNode);
                    }
                    else {
                        parent_1.insertBefore(frag, textNode);
                    }
                });
                parent_1.removeChild(textNode);
            }
        }
    };
    for (var _i = 0, textNodes_1 = textNodes; _i < textNodes_1.length; _i++) {
        var textNode = textNodes_1[_i];
        _loop_1(textNode);
    }
}
// Inner component - pure render, no hooks that cause re-renders
// Only re-renders when props change (text, styling props)
var MemoizedTextPartInner = memo(function MemoizedTextPartInner(_a) {
    var text = _a.text, messageId = _a.messageId, partIndex = _a.partIndex, isFinalText = _a.isFinalText, visibleStepsCount = _a.visibleStepsCount;
    if (!(text === null || text === void 0 ? void 0 : text.trim()))
        return null;
    return <div class={(0, utils_1.cn)("text-foreground px-2", isFinalText && visibleStepsCount > 0 && "pt-3 border-t border-border/50")} data-message-id={messageId} data-part-index={partIndex} data-part-type="text">
      {isFinalText && visibleStepsCount > 0 && <div class="text-[12px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">
          Response
        </div>}
      <chat_markdown_renderer_1.MemoizedMarkdown content={text} id={"".concat(messageId, "-").concat(partIndex)} size="sm"/>
    </div>;
}, function (prev, next) {
    return prev.text === next.text && prev.messageId === next.messageId && prev.partIndex === next.partIndex && prev.isFinalText === next.isFinalText && prev.visibleStepsCount === next.visibleStepsCount;
});
// Outer component - handles search highlighting via DOM manipulation
// This may re-render when search changes, but the inner MemoizedTextPartInner won't
// because its props (text, etc.) haven't changed
exports.MemoizedTextPart = memo(function MemoizedTextPart(_a) {
    var _b;
    var text = _a.text, messageId = _a.messageId, partIndex = _a.partIndex, isFinalText = _a.isFinalText, visibleStepsCount = _a.visibleStepsCount, _c = _a.isStreaming, isStreaming = _c === void 0 ? false : _c;
    var _d = (0, solid_js_1.createSignal)(null), containerRef = _d[0], setContainerRef = _d[1];
    // Search hooks - when search is closed, these return empty/null values
    // and don't cause re-renders (SearchHighlightProvider returns static context)
    var searchQuery = (0, search_1.useSearchQuery)();
    var highlights = (0, search_1.useSearchHighlight)(messageId, partIndex, "text");
    var currentHighlight = highlights.find(function (h) { return h.isCurrent; });
    var currentMatchIndexInPart = (_b = currentHighlight === null || currentHighlight === void 0 ? void 0 : currentHighlight.indexInPart) !== null && _b !== void 0 ? _b : null;
    // Apply DOM-based highlighting after render
    // Skip during streaming to avoid performance issues
    (0, solid_js_1.createEffect)(function () {
        if (!containerRef.current || isStreaming || !searchQuery)
            return;
        highlightTextInDom(containerRef.current, searchQuery, currentMatchIndexInPart);
        return function () {
            if (containerRef.current) {
                var existingHighlights = containerRef.current.querySelectorAll(".search-highlight");
                existingHighlights.forEach(function (el) {
                    var parent = el.parentNode;
                    if (parent) {
                        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
                        parent.normalize();
                    }
                });
            }
        };
    });
    if (!(text === null || text === void 0 ? void 0 : text.trim()))
        return null;
    return <div ref={containerRef}>
      <MemoizedTextPartInner text={text} messageId={messageId} partIndex={partIndex} isFinalText={isFinalText} visibleStepsCount={visibleStepsCount}/>
    </div>;
}, function (prev, next) {
    // Only re-render outer component when these props change
    // Search-related re-renders happen but inner component stays memoized
    return prev.text === next.text && prev.messageId === next.messageId && prev.partIndex === next.partIndex && prev.isFinalText === next.isFinalText && prev.visibleStepsCount === next.visibleStepsCount && prev.isStreaming === next.isStreaming;
});
