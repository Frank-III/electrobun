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
exports.useTextSelection = useTextSelection;
exports.TextSelectionProvider = TextSelectionProvider;
var solid_js_1 = require("solid-js");
var TextSelectionContext = (0, solid_js_1.createContext)(null);
function useTextSelection() {
    var ctx = (0, solid_js_1.useContext)(TextSelectionContext);
    if (!ctx) {
        throw new Error("useTextSelection must be used within TextSelectionProvider");
    }
    return ctx;
}
// Helper to extract line number from diff selection
function extractDiffLineInfo(element) {
    var _a;
    // Find the closest table row (tr) which contains line number info
    var row = element.closest("tr");
    if (!row)
        return {};
    // @git-diff-view/react uses data attributes on line number cells
    // Try to find line numbers from the row
    var oldLineNumCell = row.querySelector("[data-line-num-old]");
    var newLineNumCell = row.querySelector("[data-line-num-new]");
    // Also check for class-based selectors as fallback
    var lineNumCells = row.querySelectorAll(".diff-line-num");
    var lineNumber;
    var lineType;
    // Prefer new line number if available
    if (newLineNumCell) {
        var numAttr = newLineNumCell.getAttribute("data-line-num-new");
        if (numAttr) {
            lineNumber = parseInt(numAttr, 10);
            lineType = "new";
        }
    }
    // Fall back to old line number
    if (!lineNumber && oldLineNumCell) {
        var numAttr = oldLineNumCell.getAttribute("data-line-num-old");
        if (numAttr) {
            lineNumber = parseInt(numAttr, 10);
            lineType = "old";
        }
    }
    // Try text content of line number cells as last resort
    if (!lineNumber && lineNumCells.length > 0) {
        for (var i = 0; i < lineNumCells.length; i++) {
            var cell = lineNumCells[i];
            var text = (_a = cell === null || cell === void 0 ? void 0 : cell.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            if (text && /^\d+$/.test(text)) {
                lineNumber = parseInt(text, 10);
                // Determine type based on cell class or position
                lineType = (cell === null || cell === void 0 ? void 0 : cell.classList.contains("diff-line-old-num")) ? "old" : "new";
                break;
            }
        }
    }
    return {
        lineNumber: lineNumber,
        lineType: lineType
    };
}
function TextSelectionProvider(_a) {
    var _b;
    var children = _a.children;
    var _c = (0, solid_js_1.createSignal)({
        selectedText: null,
        source: null,
        selectionRect: null
    }), state = _c[0], setState = _c[1];
    var clearSelection = function () {
        var _a;
        (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
        setState({
            selectedText: null,
            source: null,
            selectionRect: null
        });
    };
    (0, solid_js_1.createEffect)(function () {
        var rafId = null;
        var handleSelectionChange = function () {
            // Cancel any pending frame to debounce rapid selection changes
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(function () {
                var _a, _b, _c, _d, _e;
                rafId = null;
                var selection = window.getSelection();
                // No selection or collapsed (just cursor)
                if (!selection || selection.isCollapsed) {
                    setState({
                        selectedText: null,
                        source: null,
                        selectionRect: null
                    });
                    return;
                }
                var text = selection.toString().trim();
                if (!text) {
                    setState({
                        selectedText: null,
                        source: null,
                        selectionRect: null
                    });
                    return;
                }
                // Get the selection range
                var range = selection.getRangeAt(0);
                var container = range.commonAncestorContainer;
                // Find the element containing the selection
                var element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
                // Check for assistant message first
                // Must be inside [data-assistant-message-id] element
                var messageElement = (_a = element === null || element === void 0 ? void 0 : element.closest) === null || _a === void 0 ? void 0 : _a.call(element, "[data-assistant-message-id]");
                // Check for tool-edit (Edit/Write tool in chat)
                // Use specific selector for Edit/Write tools only
                var toolEditElement = (_b = element === null || element === void 0 ? void 0 : element.closest) === null || _b === void 0 ? void 0 : _b.call(element, "[data-part-type=\"tool-Edit\"], [data-part-type=\"tool-Write\"]");
                // Check for diff file - must be inside .agent-diff-wrapper (the actual code area)
                // This prevents selection in diff headers, buttons, etc.
                var diffWrapperElement = (_c = element === null || element === void 0 ? void 0 : element.closest) === null || _c === void 0 ? void 0 : _c.call(element, ".agent-diff-wrapper");
                var diffElement = (_d = diffWrapperElement === null || diffWrapperElement === void 0 ? void 0 : diffWrapperElement.closest) === null || _d === void 0 ? void 0 : _d.call(diffWrapperElement, "[data-diff-file-path]");
                // Check for plan sidebar content
                var planElement = (_e = element === null || element === void 0 ? void 0 : element.closest) === null || _e === void 0 ? void 0 : _e.call(element, "[data-plan-path]");
                // Build the source based on what we found
                // Priority: plan > tool-edit > diff > assistant-message
                var source = null;
                if (planElement) {
                    // Plan selection - extract plan path from data attribute
                    var planPath = planElement.getAttribute("data-plan-path") || "unknown";
                    source = {
                        type: "plan",
                        planPath: planPath
                    };
                }
                if (!source && toolEditElement) {
                    // Tool edit selection - extract file path from data attribute
                    var partType = toolEditElement.getAttribute("data-part-type");
                    var isWrite = partType === "tool-Write";
                    var filePath = toolEditElement.getAttribute("data-tool-file-path") || "unknown";
                    source = {
                        type: "tool-edit",
                        filePath: filePath,
                        isWrite: isWrite
                    };
                }
                if (!source && diffElement && diffWrapperElement) {
                    // Only allow diff selection if inside the actual diff content wrapper
                    var filePath = diffElement.getAttribute("data-diff-file-path");
                    if (filePath) {
                        var lineInfo = element ? extractDiffLineInfo(element) : {};
                        source = {
                            type: "diff",
                            filePath: filePath,
                            lineNumber: lineInfo.lineNumber,
                            lineType: lineInfo.lineType
                        };
                    }
                }
                // Fallback to assistant message (check last because tool-edit is nested inside)
                if (!source && messageElement) {
                    var messageId = messageElement.getAttribute("data-assistant-message-id");
                    if (messageId) {
                        source = {
                            type: "assistant-message",
                            messageId: messageId
                        };
                    }
                }
                // Selection is not within a supported element
                if (!source) {
                    setState({
                        selectedText: null,
                        source: null,
                        selectionRect: null
                    });
                    return;
                }
                // Get the bounding rect of the selection
                var rect = range.getBoundingClientRect();
                setState({
                    selectedText: text,
                    source: source,
                    selectionRect: rect
                });
            });
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return function () {
            document.removeEventListener("selectionchange", handleSelectionChange);
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    });
    // Compute legacy selectedMessageId for backwards compatibility
    var selectedMessageId = ((_b = state.source) === null || _b === void 0 ? void 0 : _b.type) === "assistant-message" ? state.source.messageId : null;
    // Memoize context value to prevent unnecessary re-renders of consumers
    var contextValue = (0, solid_js_1.createMemo)(function () { return (__assign(__assign({}, state), { clearSelection: clearSelection, selectedMessageId: selectedMessageId })); });
    return <TextSelectionContext.Provider value={contextValue}>
      {children}
    </TextSelectionContext.Provider>;
}
