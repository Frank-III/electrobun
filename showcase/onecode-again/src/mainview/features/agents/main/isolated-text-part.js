"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolatedTextPartsList = exports.IsolatedTextPart = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var utils_1 = require("../../../lib/utils");
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var message_store_1 = require("../stores/message-store");
var search_1 = require("../search");
var jotai_store_1 = require("../../../lib/jotai-store");
// ============================================================================
// TEXT PART STORE - External store for text parts to avoid re-renders
// ============================================================================
// Problem: Jotai's derived atoms always call the getter when dependencies change,
// even if the result is the same. This causes IsolatedTextPart to re-render
// even when its specific text part hasn't changed.
//
// Solution: Use useSyncExternalStore with a custom store that only triggers
// re-renders when the specific text part actually changes.
// Cache for text content per part
var textPartStore = new Map();
// Subscribers per part key
var textPartSubscribers = new Map();
// Get text from a specific part
function getTextPart(messageId, partIndex) {
    var key = "".concat(messageId, ":").concat(partIndex);
    var cached = textPartStore.get(key);
    if (cached !== undefined)
        return cached;
    // Get from Jotai store
    var message = jotai_store_1.appStore.get((0, message_store_1.messageAtomFamily)(messageId));
    var parts = (message === null || message === void 0 ? void 0 : message.parts) || [];
    var part = parts[partIndex];
    var text = (part === null || part === void 0 ? void 0 : part.type) === "text" ? part.text || "" : "";
    textPartStore.set(key, text);
    return text;
}
// Subscribe to changes for a specific part
function subscribeToTextPart(messageId, partIndex, callback) {
    var key = "".concat(messageId, ":").concat(partIndex);
    // Add to subscribers
    if (!textPartSubscribers.has(key)) {
        textPartSubscribers.set(key, new Set());
    }
    textPartSubscribers.get(key).add(callback);
    // Subscribe to Jotai message atom
    var unsubscribe = jotai_store_1.appStore.sub((0, message_store_1.messageAtomFamily)(messageId), function () {
        var message = jotai_store_1.appStore.get((0, message_store_1.messageAtomFamily)(messageId));
        var parts = (message === null || message === void 0 ? void 0 : message.parts) || [];
        var part = parts[partIndex];
        var newText = (part === null || part === void 0 ? void 0 : part.type) === "text" ? part.text || "" : "";
        var oldText = textPartStore.get(key);
        if (oldText !== newText) {
            textPartStore.set(key, newText);
            // Only notify THIS part's subscribers
            var subs = textPartSubscribers.get(key);
            if (subs) {
                subs.forEach(function (cb) { return cb(); });
            }
        }
    });
    return function () {
        var _a;
        (_a = textPartSubscribers.get(key)) === null || _a === void 0 ? void 0 : _a.delete(callback);
        unsubscribe();
    };
}
// Hook to get text part with minimal re-renders
function useTextPart(messageId, partIndex) {
    var subscribe = function (callback) { return subscribeToTextPart(messageId, partIndex, callback); };
    var getSnapshot = function () { return getTextPart(messageId, partIndex); };
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
// Stable comparison - only re-render if props change (they don't during streaming)
function arePropsEqual(prev, next) {
    return prev.messageId === next.messageId && prev.partIndex === next.partIndex && prev.isFinalText === next.isFinalText && prev.visibleStepsCount === next.visibleStepsCount;
}
// Helper function to highlight text in DOM using TreeWalker
// currentMatchIndex: which match (0-based) to mark as current, or null if none
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
            // Add text before match
            if (searchIndex > lastIndex) {
                fragments.push(text.slice(lastIndex, searchIndex));
            }
            // Create highlight mark
            var mark = document.createElement("mark");
            mark.className = "search-highlight";
            mark.textContent = text.slice(searchIndex, searchIndex + searchText.length);
            // Mark match as current if it's the one we're looking for
            if (currentMatchIndex !== null && matchCounter === currentMatchIndex) {
                mark.classList.add("search-highlight-current");
            }
            matchCounter++;
            fragments.push(mark);
            lastIndex = searchIndex + searchText.length;
        }
        // Add remaining text
        if (lastIndex < text.length) {
            fragments.push(text.slice(lastIndex));
        }
        // Replace text node with fragments
        if (fragments.length > 0) {
            var parent_1 = textNode.parentNode;
            if (parent_1) {
                fragments.forEach(function (frag, i) {
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
exports.IsolatedTextPart = memo(function IsolatedTextPart(_a) {
    var _b;
    var messageId = _a.messageId, partIndex = _a.partIndex, isFinalText = _a.isFinalText, visibleStepsCount = _a.visibleStepsCount;
    var _c = (0, solid_js_1.createSignal)(null), contentRef = _c[0], setContentRef = _c[1];
    // Use external store to subscribe to ONLY this text part
    // This prevents re-renders when other parts of the same message change
    var text = useTextPart(messageId, partIndex);
    // Use per-message streaming atom instead of global isStreamingAtom
    // This prevents re-renders of old messages when streaming status changes
    var isTextStreaming = (0, jotai_1.useAtomValue)((0, message_store_1.isMessageStreamingAtomFamily)(messageId));
    // Get search highlights for this text part
    var highlights = (0, search_1.useSearchHighlight)(messageId, partIndex, "text");
    // Get search query from context
    var searchQuery = (0, search_1.useSearchQuery)();
    // Find current highlight (the one marked as current)
    var currentHighlight = highlights.find(function (h) { return h.isCurrent; });
    // Memoize the current index to ensure stable dependency for useEffect
    var currentMatchIndexInPart = (_b = currentHighlight === null || currentHighlight === void 0 ? void 0 : currentHighlight.indexInPart) !== null && _b !== void 0 ? _b : null;
    // Apply DOM-based highlighting after render
    // If currentHighlight exists, use its indexInPart to mark the correct match as current
    (0, solid_js_1.createEffect)(function () {
        if (!contentRef.current || isTextStreaming)
            return;
        // Apply highlighting
        highlightTextInDom(contentRef.current, searchQuery, currentMatchIndexInPart);
        // Cleanup on unmount or when highlights change
        return function () {
            if (contentRef.current) {
                var existingHighlights = contentRef.current.querySelectorAll(".search-highlight");
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
    return <div class={(0, utils_1.cn)("text-foreground px-2", isFinalText && visibleStepsCount > 0 && "pt-3 border-t border-border/50")} data-message-id={messageId} data-part-index={partIndex} data-part-type="text">
      {isFinalText && visibleStepsCount > 0 && <div class="text-[12px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">
          Response
        </div>}
      <div ref={contentRef}>
        <chat_markdown_renderer_1.MemoizedMarkdown content={text} id={"".concat(messageId, "-").concat(partIndex)} size="sm"/>
      </div>
    </div>;
}, arePropsEqual);
function areListPropsEqual(prev, next) {
    return prev.messageId === next.messageId && prev.finalTextIndex === next.finalTextIndex && prev.visibleStepsCount === next.visibleStepsCount && prev.showOnlyFinalText === next.showOnlyFinalText;
}
exports.IsolatedTextPartsList = memo(function IsolatedTextPartsList(_a) {
    var messageId = _a.messageId, finalTextIndex = _a.finalTextIndex, visibleStepsCount = _a.visibleStepsCount, _b = _a.showOnlyFinalText, showOnlyFinalText = _b === void 0 ? false : _b;
    // Subscribe to message just to get parts structure (not content)
    var message = (0, jotai_1.useAtomValue)((0, message_store_1.messageAtomFamily)(messageId));
    // Find indices of text parts that should be rendered
    // This is a stable calculation - only changes when parts array structure changes
    var textPartIndices = (0, solid_js_1.createMemo)(function () {
        var _a;
        var parts = (message === null || message === void 0 ? void 0 : message.parts) || [];
        var indices = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.type === "text" && ((_a = part.text) === null || _a === void 0 ? void 0 : _a.trim())) {
                // Apply filtering based on finalTextIndex
                if (showOnlyFinalText) {
                    if (finalTextIndex !== -1 && i >= finalTextIndex) {
                        indices.push(i);
                    }
                }
                else {
                    if (finalTextIndex === -1 || i < finalTextIndex) {
                        indices.push(i);
                    }
                }
            }
        }
        return indices;
    });
    if (textPartIndices.length === 0)
        return null;
    return <>
      {textPartIndices.map(function (partIndex) { return <exports.IsolatedTextPart key={"".concat(messageId, "-text-").concat(partIndex)} messageId={messageId} partIndex={partIndex} isFinalText={showOnlyFinalText && finalTextIndex !== -1 && partIndex === finalTextIndex} visibleStepsCount={visibleStepsCount}/>; })}
    </>;
}, areListPropsEqual);
