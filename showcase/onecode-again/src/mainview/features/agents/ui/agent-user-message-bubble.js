"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentUserMessageBubble = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
var use_overflow_detection_1 = require("../../../hooks/use-overflow-detection");
var dialog_1 = require("../../../components/ui/dialog");
var agent_image_item_1 = require("./agent-image-item");
var render_file_mentions_1 = require("../mentions/render-file-mentions");
var search_1 = require("../search");
// Helper function to highlight text in DOM using TreeWalker
function highlightTextInDom(container, searchText, currentOffset, currentLength) {
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
    var globalOffset = 0;
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
            if (currentOffset !== null && currentLength !== null) {
                var matchStart = globalOffset + searchIndex;
                if (matchStart === currentOffset) {
                    mark.classList.add("search-highlight-current");
                }
            }
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
        globalOffset += text.length;
    };
    for (var _i = 0, textNodes_1 = textNodes; _i < textNodes_1.length; _i++) {
        var textNode = textNodes_1[_i];
        _loop_1(textNode);
    }
}
exports.AgentUserMessageBubble = memo(function AgentUserMessageBubble(_a) {
    var messageId = _a.messageId, textContent = _a.textContent, _b = _a.imageParts, imageParts = _b === void 0 ? [] : _b, _c = _a.skipTextMentionBlocks, skipTextMentionBlocks = _c === void 0 ? false : _c;
    var _d = (0, solid_js_1.createSignal)(false), isExpanded = _d[0], setIsExpanded = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), contentRef = _e[0], setContentRef = _e[1];
    // Extract quote/diff mentions to display above the bubble
    var _f = (0, solid_js_1.createMemo)(function () { return (0, render_file_mentions_1.extractTextMentions)(textContent); }), textMentions = _f.textMentions, cleanedText = _f.cleanedText;
    // VS Code style overflow detection using ResizeObserver (no layout thrashing)
    var showGradient = (0, use_overflow_detection_1.useOverflowDetection)(contentRef, [textContent]);
    // Search highlight support
    var highlights = (0, search_1.useSearchHighlight)(messageId, 0, "text");
    var searchQuery = (0, search_1.useSearchQuery)();
    var currentHighlight = highlights.find(function (h) { return h.isCurrent; });
    // Determine if we should scroll for search (has current highlight in this message)
    var hasCurrentSearchHighlight = currentHighlight !== undefined;
    // Track previous highlight state to detect when search leaves this message
    var _g = (0, solid_js_1.createSignal)(false), prevHadHighlight = _g[0], setPrevHadHighlight = _g[1];
    // Scroll to current highlight within the user message bubble
    (0, solid_js_1.createEffect)(function () {
        if (hasCurrentSearchHighlight && contentRef.current) {
            // Wait for DOM highlighting to be applied
            requestAnimationFrame(function () {
                var _a;
                var highlightEl = (_a = contentRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(".search-highlight-current");
                if (highlightEl) {
                    highlightEl.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            });
        }
        // Reset scroll position when search leaves this message
        if (prevHadHighlight.current && !hasCurrentSearchHighlight && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        prevHadHighlight.current = hasCurrentSearchHighlight;
    });
    // Apply DOM-based highlighting after render
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        if (!contentRef.current)
            return;
        highlightTextInDom(contentRef.current, searchQuery, (_a = currentHighlight === null || currentHighlight === void 0 ? void 0 : currentHighlight.offset) !== null && _a !== void 0 ? _a : null, (_b = currentHighlight === null || currentHighlight === void 0 ? void 0 : currentHighlight.length) !== null && _b !== void 0 ? _b : null);
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
    return <>
      <div class="flex justify-start drop-shadow-[0_10px_20px_hsl(var(--background))]" data-user-bubble>
        <div class="space-y-2 w-full">
          {/* Show attached images from stored message */}
          {imageParts.length > 0 && <div class="flex flex-wrap gap-1.5">
              {(function () {
                // Build allImages array for gallery navigation
                var allImages = imageParts.filter(function (img) { var _a; return (_a = img.data) === null || _a === void 0 ? void 0 : _a.url; }).map(function (img, idx) {
                    var _a, _b;
                    return ({
                        id: "".concat(messageId, "-img-").concat(idx),
                        filename: ((_a = img.data) === null || _a === void 0 ? void 0 : _a.filename) || "image",
                        url: ((_b = img.data) === null || _b === void 0 ? void 0 : _b.url) || ""
                    });
                });
                return imageParts.map(function (img, idx) { var _a, _b; return <agent_image_item_1.AgentImageItem key={"".concat(messageId, "-img-").concat(idx)} id={"".concat(messageId, "-img-").concat(idx)} filename={((_a = img.data) === null || _a === void 0 ? void 0 : _a.filename) || "image"} url={((_b = img.data) === null || _b === void 0 ? void 0 : _b.url) || ""} allImages={allImages} imageIndex={idx}/>; });
            })()}
            </div>}
          {/* Show text mentions (quote/diff) as blocks above text bubble - only if not rendered by parent */}
          {!skipTextMentionBlocks && textMentions.length > 0 && <render_file_mentions_1.TextMentionBlocks mentions={textMentions}/>}
          {/* Text bubble with overflow detection */}
          {cleanedText ? <div ref={contentRef} onClick={function () { return showGradient && !hasCurrentSearchHighlight && setIsExpanded(true); }} class={(0, utils_1.cn)("relative bg-input-background border px-3 py-2 rounded-xl whitespace-pre-wrap text-sm transition-all duration-200 max-h-[100px]", 
            // When searching in this message, allow scroll; otherwise hide overflow
            hasCurrentSearchHighlight ? "overflow-y-auto" : "overflow-hidden", 
            // Cursor and hover only when can expand (not during search)
            showGradient && !hasCurrentSearchHighlight && "cursor-pointer hover:brightness-110")} data-message-id={messageId} data-part-index={0} data-part-type="text">
              <render_file_mentions_1.RenderFileMentions text={cleanedText}/>
              {/* Show gradient only when collapsed and not searching in this message */}
              {showGradient && !hasCurrentSearchHighlight && <div class="absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-[hsl(var(--input-background))] to-transparent rounded-b-xl"/>}
            </div> : (imageParts.length > 0 || textMentions.length > 0) && !skipTextMentionBlocks ? <div class="bg-input-background border px-3 py-2 rounded-xl text-sm text-muted-foreground italic">
              {(function () {
                var parts = [];
                // Count images
                if (imageParts.length > 0) {
                    parts.push(imageParts.length === 1 ? "image" : "".concat(imageParts.length, " images"));
                }
                // Count text mentions by type
                var quoteCount = textMentions.filter(function (m) { return m.type === "quote" || m.type === "pasted"; }).length;
                var codeCount = textMentions.filter(function (m) { return m.type === "diff"; }).length;
                if (quoteCount > 0) {
                    parts.push(quoteCount === 1 ? "selected text" : "".concat(quoteCount, " text selections"));
                }
                if (codeCount > 0) {
                    parts.push(codeCount === 1 ? "code selection" : "".concat(codeCount, " code selections"));
                }
                return "Using ".concat(parts.join(", "));
            })()}
            </div> : null}
        </div>
      </div>

      {/* Full message dialog */}
      <dialog_1.Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <dialog_1.DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle class="text-sm font-medium text-muted-foreground">
              Full message
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div class="space-y-3">
            {textMentions.length > 0 && <render_file_mentions_1.TextMentionBlocks mentions={textMentions}/>}
            <div class="whitespace-pre-wrap text-sm">
              <render_file_mentions_1.RenderFileMentions text={cleanedText}/>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>;
});
