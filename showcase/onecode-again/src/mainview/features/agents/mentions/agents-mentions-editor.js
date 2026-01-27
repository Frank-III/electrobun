"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsMentionsEditor = exports.MENTION_PREFIXES = void 0;
var utils_1 = require("../../../lib/utils");
var solid_js_1 = require("solid-js");
var agents_file_mention_1 = require("./agents-file-mention");
// Threshold for skipping expensive trigger detection (characters)
// Should be >= MAX_PASTE_LENGTH from paste-text.ts to avoid processing large pasted content
var LARGE_TEXT_THRESHOLD = 1e4;
// Mention ID prefixes
exports.MENTION_PREFIXES = {
    FILE: "file:",
    FOLDER: "folder:",
    SKILL: "skill:",
    AGENT: "agent:",
    TOOL: "tool:",
    QUOTE: "quote:",
    DIFF: "diff:",
    PASTED: "pasted:"
};
// Append text to element (no styling in input, ultrathink only in sent messages)
function appendText(root, text) {
    if (text) {
        root.appendChild(document.createTextNode(text));
    }
}
// Create styled mention chip (matching canvas style)
function createMentionNode(option) {
    var span = document.createElement("span");
    span.setAttribute("contenteditable", "false");
    span.setAttribute("data-mention-id", option.id);
    span.setAttribute("data-mention-type", option.type || "file");
    span.className = "inline-flex items-center gap-1 px-[6px] py-[1px] rounded-[4px] text-sm align-middle bg-black/[0.04] dark:bg-white/[0.08] text-foreground/80 [&.mention-selected]:bg-primary/70 [&.mention-selected]:text-primary-foreground";
    // Create icon element (pass type for folder icon)
    var iconElement = (0, agents_file_mention_1.createFileIconElement)(option.label, option.type);
    span.appendChild(iconElement);
    var label = document.createElement("span");
    label.textContent = option.label;
    span.appendChild(label);
    return span;
}
// Serialize DOM to text with @[id] tokens
function serializeContent(root) {
    var result = "";
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent || "";
            node = walker.nextNode();
            continue;
        }
        var el = node;
        // Handle <br> elements as newlines
        if (el.tagName === "BR") {
            result += "\n";
            node = walker.nextNode();
            continue;
        }
        // Handle <div> elements (some browsers wrap lines in divs)
        if (el.tagName === "DIV" && el !== root) {
            // Add newline before div content (if not at start)
            if (result.length > 0 && !result.endsWith("\n")) {
                result += "\n";
            }
            node = walker.nextNode();
            continue;
        }
        // Handle ultrathink styled nodes
        if (el.hasAttribute("data-ultrathink")) {
            result += el.textContent || "";
            // Skip subtree
            var next = el.nextSibling;
            if (next) {
                walker.currentNode = next;
                node = next;
                continue;
            }
            var parent_1 = el.parentNode;
            while (parent_1 && !parent_1.nextSibling)
                parent_1 = parent_1.parentNode;
            if (parent_1 && parent_1.nextSibling) {
                walker.currentNode = parent_1.nextSibling;
                node = parent_1.nextSibling;
            }
            else {
                node = null;
            }
            continue;
        }
        if (el.hasAttribute("data-mention-id")) {
            var id = el.getAttribute("data-mention-id") || "";
            result += "@[".concat(id, "]");
            // Skip subtree
            var next = el.nextSibling;
            if (next) {
                walker.currentNode = next;
                node = next;
                continue;
            }
            var parent_2 = el.parentNode;
            while (parent_2 && !parent_2.nextSibling)
                parent_2 = parent_2.parentNode;
            if (parent_2 && parent_2.nextSibling) {
                walker.currentNode = parent_2.nextSibling;
                node = parent_2.nextSibling;
            }
            else {
                node = null;
            }
            continue;
        }
        node = walker.nextNode();
    }
    return result;
}
// Build DOM from serialized text
function buildContentFromSerialized(root, serialized, resolveMention) {
    // Clear safely
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    var regex = /@\[([^\]]+)\]/g;
    var lastIndex = 0;
    var match;
    while ((match = regex.exec(serialized)) !== null) {
        // Text before mention
        if (match.index > lastIndex) {
            appendText(root, serialized.slice(lastIndex, match.index));
        }
        var id = match[1];
        // Try to resolve mention
        var option = null;
        if (resolveMention) {
            option = resolveMention(id);
        }
        if (!option && (id.startsWith(exports.MENTION_PREFIXES.FILE) || id.startsWith(exports.MENTION_PREFIXES.FOLDER))) {
            // Parse file/folder mention: file:repo:path or folder:repo:path
            var parts = id.split(":");
            if (parts.length >= 3) {
                var type = parts[0];
                var repo = parts[1];
                var path = parts.slice(2).join(":");
                var name_1 = path.split("/").pop() || path;
                option = {
                    id: id,
                    label: name_1,
                    path: path,
                    repository: repo,
                    type: type
                };
            }
        }
        if (!option && id.startsWith(exports.MENTION_PREFIXES.SKILL)) {
            // Parse skill mention: skill:skill-name
            var skillName = id.slice(exports.MENTION_PREFIXES.SKILL.length);
            option = {
                id: id,
                label: skillName,
                path: "",
                repository: "",
                type: "skill"
            };
        }
        if (!option && id.startsWith(exports.MENTION_PREFIXES.AGENT)) {
            // Parse agent mention: agent:agent-name
            var agentName = id.slice(exports.MENTION_PREFIXES.AGENT.length);
            option = {
                id: id,
                label: agentName,
                path: "",
                repository: "",
                type: "agent"
            };
        }
        if (!option && id.startsWith(exports.MENTION_PREFIXES.TOOL)) {
            // Parse tool mention: tool:mcp__servername__toolname
            var toolPath = id.slice(exports.MENTION_PREFIXES.TOOL.length);
            // Extract readable name from tool path (e.g., mcp__figma__get_design -> Get design)
            var parts = toolPath.split("__");
            var toolName = parts.length >= 3 ? parts.slice(2).join("__") : toolPath;
            var displayName = toolName.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }).trim();
            option = {
                id: id,
                label: displayName,
                path: toolPath,
                repository: "",
                type: "tool"
            };
        }
        if (option) {
            root.appendChild(createMentionNode(option));
            root.appendChild(document.createTextNode(" "));
        }
        else {
            // Fallback: just show the id
            root.appendChild(document.createTextNode("@[".concat(id, "]")));
        }
        lastIndex = match.index + match[0].length;
    }
    // Remaining text
    if (lastIndex < serialized.length) {
        appendText(root, serialized.slice(lastIndex));
    }
}
// Single O(n) tree walk that computes all needed data
function walkTreeOnce(root, range) {
    var serialized = "";
    var textBeforeCursor = "";
    var reachedCursor = false;
    var atPosition = null;
    var atIndex = -1;
    var slashPosition = null;
    var slashIndex = -1;
    // Handle case where cursor is in root element (not in a text node)
    // This happens when the editor is empty or cursor is at element boundary
    var cursorInRoot = false;
    var cursorRootOffset = 0;
    if (range && range.endContainer === root) {
        cursorInRoot = true;
        cursorRootOffset = range.endOffset;
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            var text = node.textContent || "";
            // Check if cursor is in this node (direct case)
            var cursorInThisNode = range && !reachedCursor && node === range.endContainer;
            // Handle cursor in root element - cursor is positioned between children
            // cursorRootOffset indicates the child index where cursor is
            var cursorAtRootBoundary = false;
            if (cursorInRoot && !reachedCursor && node.parentNode === root) {
                var children = Array.from(root.childNodes);
                var nodeIndex = children.indexOf(node);
                // If cursor is after this node, include full text
                // If cursor is at this node's position, we've passed the cursor
                if (nodeIndex >= cursorRootOffset) {
                    cursorAtRootBoundary = true;
                }
            }
            if (cursorInThisNode) {
                var cursorOffset = range.endOffset;
                textBeforeCursor += text.slice(0, cursorOffset);
                reachedCursor = true;
                // Find @ in text before cursor for this node
                var textBeforeInNode = text.slice(0, cursorOffset);
                var localAtIdx = textBeforeInNode.lastIndexOf("@");
                if (localAtIdx !== -1) {
                    var globalAtIdx = serialized.length + localAtIdx;
                    // Check character before @ - must be start of text, whitespace, or newline (not part of email/word)
                    var textUpToAt = serialized + textBeforeInNode.slice(0, localAtIdx);
                    var charBefore = globalAtIdx > 0 ? textUpToAt.charAt(globalAtIdx - 1) : null;
                    var isStandaloneAt = charBefore === null || /\s/.test(charBefore);
                    // Check if this @ is the most recent one AND is standalone
                    if (isStandaloneAt && globalAtIdx > atIndex) {
                        var afterAt = textBeforeCursor.slice(textBeforeCursor.lastIndexOf("@") + 1);
                        // Close on newline or double-space (not single space - allow multi-word search)
                        var hasNewline = afterAt.includes("\n");
                        var hasDoubleSpace = afterAt.includes("  ");
                        if (!hasNewline && !hasDoubleSpace) {
                            atIndex = globalAtIdx;
                            atPosition = {
                                node: node,
                                offset: localAtIdx
                            };
                        }
                    }
                }
                // Find / at start of line (for slash commands)
                // Check all occurrences of / in this node
                for (var i = 0; i < textBeforeInNode.length; i++) {
                    if (textBeforeInNode[i] === "/") {
                        var globalSlashIdx = serialized.length + i;
                        // / is valid only at start of text OR after newline
                        var charBefore = globalSlashIdx === 0 ? null : (serialized + textBeforeInNode.slice(0, i)).charAt(globalSlashIdx - 1);
                        if (charBefore === null || charBefore === "\n") {
                            // Check no space between / and cursor
                            var afterSlash = textBeforeCursor.slice(globalSlashIdx + 1);
                            if (!afterSlash.includes(" ") && !afterSlash.includes("\n")) {
                                slashIndex = globalSlashIdx;
                                slashPosition = {
                                    node: node,
                                    offset: i
                                };
                            }
                        }
                    }
                }
            }
            else if (cursorAtRootBoundary) {
                // Cursor is in root element, at or past this node's position
                // Mark as reached and don't include this text in textBeforeCursor
                reachedCursor = true;
            }
            else if (!reachedCursor) {
                textBeforeCursor += text;
                // Track @ positions as we go (only if standalone - not part of email/word)
                var localAtIdx = text.lastIndexOf("@");
                if (localAtIdx !== -1) {
                    var globalAtIdx = serialized.length + localAtIdx;
                    // Check character before @ - must be start of text, whitespace, or newline
                    var textUpToAt = serialized + text.slice(0, localAtIdx);
                    var charBefore = globalAtIdx > 0 ? textUpToAt.charAt(globalAtIdx - 1) : null;
                    var isStandaloneAt = charBefore === null || /\s/.test(charBefore);
                    if (isStandaloneAt) {
                        atIndex = globalAtIdx;
                        atPosition = {
                            node: node,
                            offset: localAtIdx
                        };
                    }
                }
            }
            serialized += text;
            node = walker.nextNode();
            continue;
        }
        // Element node - check for ultrathink or mention
        if (node.nodeType === Node.ELEMENT_NODE) {
            var el = node;
            // Handle ultrathink styled nodes
            if (el.hasAttribute("data-ultrathink")) {
                var text = el.textContent || "";
                serialized += text;
                if (!reachedCursor) {
                    textBeforeCursor += text;
                }
                // Skip ultrathink subtree
                var next = el.nextSibling;
                if (next) {
                    walker.currentNode = next;
                    node = next;
                    continue;
                }
                var parent_3 = el.parentNode;
                while (parent_3 && !parent_3.nextSibling)
                    parent_3 = parent_3.parentNode;
                if (parent_3 && parent_3.nextSibling) {
                    walker.currentNode = parent_3.nextSibling;
                    node = parent_3.nextSibling;
                    continue;
                }
                node = null;
                continue;
            }
            if (el.hasAttribute("data-mention-id")) {
                var id = el.getAttribute("data-mention-id") || "";
                var mentionToken = "@[".concat(id, "]");
                serialized += mentionToken;
                if (!reachedCursor) {
                    textBeforeCursor += mentionToken;
                }
                // Skip mention subtree
                var next = el.nextSibling;
                if (next) {
                    walker.currentNode = next;
                    node = next;
                    continue;
                }
                var parent_4 = el.parentNode;
                while (parent_4 && !parent_4.nextSibling)
                    parent_4 = parent_4.parentNode;
                if (parent_4 && parent_4.nextSibling) {
                    walker.currentNode = parent_4.nextSibling;
                    node = parent_4.nextSibling;
                    continue;
                }
                node = null;
                continue;
            }
        }
        node = walker.nextNode();
    }
    // Validate @ trigger - close on newline or double-space (allow single spaces for multi-word search)
    if (atIndex !== -1) {
        var afterAt = textBeforeCursor.slice(atIndex + 1);
        var hasNewline = afterAt.includes("\n");
        var hasDoubleSpace = afterAt.includes("  ");
        if (hasNewline || hasDoubleSpace) {
            atIndex = -1;
            atPosition = null;
        }
    }
    // Validate / trigger - check if space/newline after it
    if (slashIndex !== -1) {
        var afterSlash = textBeforeCursor.slice(slashIndex + 1);
        if (afterSlash.includes(" ") || afterSlash.includes("\n")) {
            slashIndex = -1;
            slashPosition = null;
        }
    }
    return {
        serialized: serialized,
        textBeforeCursor: textBeforeCursor,
        atPosition: atPosition,
        atIndex: atIndex,
        slashPosition: slashPosition,
        slashIndex: slashIndex
    };
}
// Memoized to prevent re-renders when parent re-renders
exports.AgentsMentionsEditor = memo(forwardRef(function AgentsMentionsEditor(_a, ref) {
    var initialValue = _a.initialValue, onTrigger = _a.onTrigger, onCloseTrigger = _a.onCloseTrigger, onSlashTrigger = _a.onSlashTrigger, onCloseSlashTrigger = _a.onCloseSlashTrigger, onContentChange = _a.onContentChange, placeholder = _a.placeholder, className = _a.className, onSubmit = _a.onSubmit, onForceSubmit = _a.onForceSubmit, disabled = _a.disabled, onPaste = _a.onPaste, onShiftTab = _a.onShiftTab, onFocus = _a.onFocus, onBlur = _a.onBlur;
    var _b = (0, solid_js_1.createSignal)(null), editorRef = _b[0], setEditorRef = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), triggerActive = _c[0], setTriggerActive = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), triggerStartIndex = _d[0], setTriggerStartIndex = _d[1];
    // Slash command trigger state
    var _e = (0, solid_js_1.createSignal)(false), slashTriggerActive = _e[0], setSlashTriggerActive = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), slashTriggerStartIndex = _f[0], setSlashTriggerStartIndex = _f[1];
    // Track if editor has content for placeholder (updated via DOM, no React state)
    var _g = (0, solid_js_1.createSignal)(false), hasContent = _g[0], setHasContent = _g[1];
    var _h = (0, solid_js_1.createSignal)([]), undoStack = _h[0], setUndoStack = _h[1];
    var _j = (0, solid_js_1.createSignal)([]), redoStack = _j[0], setRedoStack = _j[1];
    var _k = (0, solid_js_1.createSignal)(false), isUndoRedo = _k[0], setIsUndoRedo = _k[1];
    var _l = (0, solid_js_1.createSignal)(""), lastSavedHtml = _l[0], setLastSavedHtml = _l[1];
    var _m = (0, solid_js_1.createSignal)(null), debounceTimer = _m[0], setDebounceTimer = _m[1];
    // Get current editor state (html + cursor position)
    var getCurrentState = function () {
        var _a;
        if (!editorRef.current)
            return null;
        var html = editorRef.current.innerHTML;
        var sel = window.getSelection();
        var cursorOffset = 0;
        if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
            var range = sel.getRangeAt(0);
            // Calculate offset by walking through all nodes
            var walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
            var node = walker.nextNode();
            while (node) {
                if (node === range.startContainer) {
                    cursorOffset += range.startOffset;
                    break;
                }
                if (node.nodeType === Node.TEXT_NODE) {
                    cursorOffset += ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
                }
                else if (node.nodeType === Node.ELEMENT_NODE) {
                    var el = node;
                    // Mention nodes count as their serialized length for consistency
                    if (el.hasAttribute("data-mention-id")) {
                        cursorOffset += 1;
                        // Skip children of mention node - move walker to next sibling
                        var nextSibling = walker.nextSibling();
                        if (nextSibling) {
                            node = nextSibling;
                            continue;
                        }
                    }
                }
                node = walker.nextNode();
            }
        }
        return {
            html: html,
            cursorOffset: cursorOffset
        };
    };
    // Save state to undo stack (call before making changes)
    var saveUndoState = function () {
        if (!editorRef.current || isUndoRedo.current)
            return;
        var state = getCurrentState();
        if (!state)
            return;
        // Don't save if nothing changed
        if (state.html === lastSavedHtml.current)
            return;
        lastSavedHtml.current = state.html;
        undoStack.current.push(state);
        // Clear redo stack when new action is performed
        redoStack.current = [];
        // Limit stack size
        if (undoStack.current.length > 100) {
            undoStack.current.shift();
        }
    };
    // Debounced save for typing - saves state after 500ms of no typing
    var debouncedSaveUndoState = function () {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(function () {
            saveUndoState();
            debounceTimer.current = null;
        }, 500);
    };
    // Immediate save (for paste, mentions) - also cancels any pending debounce
    var immediateSaveUndoState = function () {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        saveUndoState();
    };
    // Restore cursor position after undo/redo
    // Handles both text nodes and mention nodes
    var restoreCursor = function (offset) {
        var _a;
        if (!editorRef.current)
            return;
        var sel = window.getSelection();
        if (!sel)
            return;
        var currentOffset = 0;
        var walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        var node = walker.nextNode();
        var lastTextNode = null;
        var lastTextNodeOffset = 0;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                var textNode = node;
                var nodeLength = ((_a = textNode.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
                if (currentOffset + nodeLength >= offset) {
                    var range = document.createRange();
                    range.setStart(textNode, Math.min(offset - currentOffset, nodeLength));
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return;
                }
                lastTextNode = textNode;
                lastTextNodeOffset = nodeLength;
                currentOffset += nodeLength;
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                var el = node;
                if (el.hasAttribute("data-mention-id")) {
                    // Mention counts as 1 unit
                    if (currentOffset + 1 >= offset) {
                        // Place cursor after mention
                        var range = document.createRange();
                        range.setStartAfter(el);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        return;
                    }
                    currentOffset += 1;
                    // Skip to next sibling (don't traverse inside mention)
                    var nextSibling = walker.nextSibling();
                    if (nextSibling) {
                        node = nextSibling;
                        continue;
                    }
                }
            }
            node = walker.nextNode();
        }
        // Fallback: move to end
        sel.selectAllChildren(editorRef.current);
        sel.collapseToEnd();
    };
    // Cleanup debounce timer on unmount
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    });
    // Resolve mention from id for rendering
    var resolveMention = function (id) {
        if (id.startsWith(exports.MENTION_PREFIXES.FILE) || id.startsWith(exports.MENTION_PREFIXES.FOLDER)) {
            var parts = id.split(":");
            if (parts.length >= 3) {
                var type = parts[0];
                var repo = parts[1];
                var path = parts.slice(2).join(":");
                var name_2 = path.split("/").pop() || path;
                return {
                    id: id,
                    label: name_2,
                    path: path,
                    repository: repo,
                    type: type
                };
            }
        }
        if (id.startsWith(exports.MENTION_PREFIXES.SKILL)) {
            var skillName = id.slice(exports.MENTION_PREFIXES.SKILL.length);
            return {
                id: id,
                label: skillName,
                path: "",
                repository: "",
                type: "skill"
            };
        }
        if (id.startsWith(exports.MENTION_PREFIXES.AGENT)) {
            var agentName = id.slice(exports.MENTION_PREFIXES.AGENT.length);
            return {
                id: id,
                label: agentName,
                path: "",
                repository: "",
                type: "agent"
            };
        }
        if (id.startsWith(exports.MENTION_PREFIXES.TOOL)) {
            var toolPath = id.slice(exports.MENTION_PREFIXES.TOOL.length);
            // Extract readable name from tool path (e.g., mcp__figma__get_design -> Get design)
            var parts = toolPath.split("__");
            var toolName = parts.length >= 3 ? parts.slice(2).join("__") : toolPath;
            var displayName = toolName.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }).trim();
            return {
                id: id,
                label: displayName,
                path: toolPath,
                repository: "",
                type: "tool"
            };
        }
        return null;
    };
    // Initialize editor with initialValue on mount
    (0, solid_js_1.createEffect)(function () {
        if (editorRef.current && initialValue) {
            buildContentFromSerialized(editorRef.current, initialValue, resolveMention);
            setHasContent(!!initialValue);
        }
        // Save initial state for undo (allows undo to empty)
        if (editorRef.current) {
            lastSavedHtml.current = editorRef.current.innerHTML;
            undoStack.current = [{
                    html: editorRef.current.innerHTML,
                    cursorOffset: 0
                }];
        }
    });
    // Handle selection changes to highlight mention chips
    // Throttled to avoid performance issues during rapid typing
    (0, solid_js_1.createEffect)(function () {
        var rafId = null;
        var lastRun = 0;
        var THROTTLE_MS = 100;
        var handleSelectionChange = function () {
            var now = Date.now();
            // Throttle: skip if called too recently
            if (now - lastRun < THROTTLE_MS) {
                // Schedule one final update after throttle period
                if (rafId)
                    cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(function () {
                    lastRun = Date.now();
                    updateMentionHighlights();
                });
                return;
            }
            lastRun = now;
            updateMentionHighlights();
        };
        var updateMentionHighlights = function () {
            if (!editorRef.current)
                return;
            var selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                // Clear all highlights when no selection
                var mentions_1 = editorRef.current.querySelectorAll("[data-mention-id]");
                mentions_1.forEach(function (mention) {
                    var mentionEl = mention;
                    mentionEl.classList.remove("mention-selected");
                });
                return;
            }
            var range = selection.getRangeAt(0);
            // Check if selection is within our editor
            var commonAncestor = range.commonAncestorContainer;
            var isInEditor = editorRef.current.contains(commonAncestor.nodeType === Node.ELEMENT_NODE ? commonAncestor : commonAncestor.parentElement);
            if (!isInEditor)
                return;
            // Get all mention chips
            var mentions = editorRef.current.querySelectorAll("[data-mention-id]");
            mentions.forEach(function (mention) {
                var mentionEl = mention;
                // Check if mention is within selection range
                if (range.intersectsNode(mentionEl)) {
                    mentionEl.classList.add("mention-selected");
                }
                else {
                    mentionEl.classList.remove("mention-selected");
                }
            });
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return function () {
            document.removeEventListener("selectionchange", handleSelectionChange);
            if (rafId)
                cancelAnimationFrame(rafId);
        };
    });
    // Trigger detection timeout ref for cleanup
    var _o = (0, solid_js_1.createSignal)(null), triggerDetectionTimeout = _o[0], setTriggerDetectionTimeout = _o[1];
    // Handle input - UNCONTROLLED: no onChange, just @ and / trigger detection
    var handleInput = function () {
        if (!editorRef.current)
            return;
        // Save undo state with debounce (for typing)
        // This captures state periodically during typing for proper undo
        debouncedSaveUndoState();
        // Update placeholder visibility and notify parent IMMEDIATELY (cheap operation)
        // Use textContent without trim() so placeholder hides even with just spaces
        var content = editorRef.current.textContent || "";
        var newHasContent = !!content;
        setHasContent(newHasContent);
        onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(newHasContent);
        // Skip expensive trigger detection for very large text
        // This prevents UI freeze when pasting large content
        if (content.length > LARGE_TEXT_THRESHOLD) {
            // Close any open triggers since we can't detect them
            if (triggerActive.current) {
                triggerActive.current = false;
                triggerStartIndex.current = null;
                onCloseTrigger();
            }
            if (slashTriggerActive.current) {
                slashTriggerActive.current = false;
                slashTriggerStartIndex.current = null;
                onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
            }
            return;
        }
        // Clear previous timeout
        if (triggerDetectionTimeout.current) {
            clearTimeout(triggerDetectionTimeout.current);
        }
        // For short content, run trigger detection immediately
        // For longer content, debounce to avoid performance issues
        var runTriggerDetection = function () {
            if (!editorRef.current)
                return;
            // Get selection for cursor position
            var sel = window.getSelection();
            var range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
            // Handle non-collapsed selection (close triggers)
            if (range && !range.collapsed) {
                if (triggerActive.current) {
                    triggerActive.current = false;
                    triggerStartIndex.current = null;
                    onCloseTrigger();
                }
                if (slashTriggerActive.current) {
                    slashTriggerActive.current = false;
                    slashTriggerStartIndex.current = null;
                    onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
                }
                return;
            }
            // Single tree walk for @ and / trigger detection
            var _a = walkTreeOnce(editorRef.current, range), textBeforeCursor = _a.textBeforeCursor, atPosition = _a.atPosition, atIndex = _a.atIndex, slashPosition = _a.slashPosition, slashIndex = _a.slashIndex;
            // Handle @ trigger (takes priority over /)
            if (atIndex !== -1 && atPosition) {
                triggerActive.current = true;
                triggerStartIndex.current = atIndex;
                // Close slash trigger if active
                if (slashTriggerActive.current) {
                    slashTriggerActive.current = false;
                    slashTriggerStartIndex.current = null;
                    onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
                }
                var afterAt = textBeforeCursor.slice(atIndex + 1);
                // Get position for dropdown
                // Use cursor position for vertical, parent container left edge for horizontal alignment
                if (range && editorRef.current) {
                    var tempRange = document.createRange();
                    tempRange.setStart(range.endContainer, range.endOffset);
                    tempRange.setEnd(range.endContainer, range.endOffset);
                    var cursorRect = tempRange.getBoundingClientRect();
                    // Use CURSOR position - menu should appear under cursor, not at text start
                    var rect = new DOMRect(cursorRect.left, cursorRect.top, 0, cursorRect.height);
                    onTrigger({
                        searchText: afterAt,
                        rect: rect
                    });
                    return;
                }
            }
            // Close @ trigger if no @ found
            if (triggerActive.current) {
                triggerActive.current = false;
                triggerStartIndex.current = null;
                onCloseTrigger();
            }
            // Handle / trigger (only if @ trigger is not active)
            if (slashIndex !== -1 && slashPosition && onSlashTrigger) {
                slashTriggerActive.current = true;
                slashTriggerStartIndex.current = slashIndex;
                var afterSlash = textBeforeCursor.slice(slashIndex + 1);
                // Get position for dropdown
                // Use cursor position for vertical, parent container left edge for horizontal alignment
                if (range && editorRef.current) {
                    var tempRange = document.createRange();
                    tempRange.setStart(range.endContainer, range.endOffset);
                    tempRange.setEnd(range.endContainer, range.endOffset);
                    var cursorRect = tempRange.getBoundingClientRect();
                    // Use CURSOR position - menu should appear under cursor, not at text start
                    var rect = new DOMRect(cursorRect.left, cursorRect.top, 0, cursorRect.height);
                    onSlashTrigger({
                        searchText: afterSlash,
                        rect: rect
                    });
                    return;
                }
            }
            // Close / trigger if no / found
            if (slashTriggerActive.current) {
                slashTriggerActive.current = false;
                slashTriggerStartIndex.current = null;
                onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
            }
        };
        // Always use requestAnimationFrame to avoid blocking input rendering
        // This allows the browser to render the typed character first,
        // then detect @ and / triggers in the next frame
        if (triggerDetectionTimeout.current) {
            cancelAnimationFrame(triggerDetectionTimeout.current);
        }
        triggerDetectionTimeout.current = requestAnimationFrame(runTriggerDetection);
    };
    // Cleanup on unmount
    (0, solid_js_1.createEffect)(function () {
        return function () {
            if (triggerDetectionTimeout.current) {
                cancelAnimationFrame(triggerDetectionTimeout.current);
            }
        };
    });
    // Handle keydown
    var handleKeyDown = function (e) {
        var _a;
        // Custom undo (Cmd+Z / Ctrl+Z)
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
            if (undoStack.current.length > 0) {
                e.preventDefault();
                isUndoRedo.current = true;
                // Save current state to redo stack
                var currentState = getCurrentState();
                if (currentState) {
                    redoStack.current.push(currentState);
                }
                // Restore previous state
                var state = undoStack.current.pop();
                if (editorRef.current) {
                    editorRef.current.innerHTML = state.html;
                    lastSavedHtml.current = state.html;
                    restoreCursor(state.cursorOffset);
                    var newHasContent = !!editorRef.current.textContent;
                    setHasContent(newHasContent);
                    onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(newHasContent);
                }
                isUndoRedo.current = false;
                return;
            }
        }
        // Custom redo (Cmd+Shift+Z / Ctrl+Shift+Z or Cmd+Y / Ctrl+Y)
        if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "z" && e.shiftKey || e.key.toLowerCase() === "y")) {
            if (redoStack.current.length > 0) {
                e.preventDefault();
                isUndoRedo.current = true;
                // Save current state to undo stack
                var currentState = getCurrentState();
                if (currentState) {
                    undoStack.current.push(currentState);
                }
                // Restore redo state
                var state = redoStack.current.pop();
                if (editorRef.current) {
                    editorRef.current.innerHTML = state.html;
                    lastSavedHtml.current = state.html;
                    restoreCursor(state.cursorOffset);
                    var newHasContent = !!editorRef.current.textContent;
                    setHasContent(newHasContent);
                    onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(newHasContent);
                }
                isUndoRedo.current = false;
                return;
            }
        }
        // Prevent submission during IME composition (e.g., Chinese/Japanese/Korean input)
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            if (triggerActive.current || slashTriggerActive.current) {
                // Let dropdown handle Enter
                return;
            }
            e.preventDefault();
            // Opt+Enter = force submit (bypass queue, stop stream and send immediately)
            if (e.altKey && onForceSubmit) {
                onForceSubmit();
            }
            else {
                onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit();
            }
        }
        if (e.key === "Escape") {
            // Close mention dropdown
            if (triggerActive.current) {
                e.preventDefault();
                triggerActive.current = false;
                triggerStartIndex.current = null;
                onCloseTrigger();
                return;
            }
            // Close command dropdown
            if (slashTriggerActive.current) {
                e.preventDefault();
                slashTriggerActive.current = false;
                slashTriggerStartIndex.current = null;
                onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
                return;
            }
            // If no dropdown is open, blur the editor (but don't prevent default
            // to allow other handlers like multi-select clear to run)
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            onShiftTab === null || onShiftTab === void 0 ? void 0 : onShiftTab();
        }
    };
    // Expose methods via ref (UNCONTROLLED pattern)
    useImperativeHandle(ref, function () { return ({
        focus: function () {
            var editor = editorRef.current;
            if (!editor)
                return;
            editor.focus();
            // Always ensure cursor is visible at end
            var sel = window.getSelection();
            if (sel && sel.rangeCount === 0) {
                sel.selectAllChildren(editor);
                sel.collapseToEnd();
            }
        },
        blur: function () {
            var editor = editorRef.current;
            if (!editor)
                return;
            editor.blur();
        },
        getValue: function () {
            if (!editorRef.current)
                return "";
            return serializeContent(editorRef.current);
        },
        setValue: function (value) {
            if (!editorRef.current)
                return;
            buildContentFromSerialized(editorRef.current, value, resolveMention);
            var newHasContent = !!value;
            setHasContent(newHasContent);
            onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(newHasContent);
            // Position cursor at the end of content
            if (newHasContent) {
                var sel = window.getSelection();
                if (sel) {
                    sel.selectAllChildren(editorRef.current);
                    sel.collapseToEnd();
                }
            }
        },
        clear: function () {
            if (!editorRef.current)
                return;
            editorRef.current.innerHTML = "";
            setHasContent(false);
            onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(false);
            triggerActive.current = false;
            triggerStartIndex.current = null;
            slashTriggerActive.current = false;
            slashTriggerStartIndex.current = null;
        },
        clearSlashCommand: function () {
            if (!editorRef.current || slashTriggerStartIndex.current === null)
                return;
            var sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                // Fallback: clear entire editor if we can't find the range
                editorRef.current.innerHTML = "";
                setHasContent(false);
                onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(false);
                slashTriggerActive.current = false;
                slashTriggerStartIndex.current = null;
                onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
                return;
            }
            var range = sel.getRangeAt(0);
            var node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                var text = node.textContent || "";
                // Find local position of / within this text node
                var localSlashPosition = null;
                var serializedCharCount = 0;
                var walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
                var walkNode = walker.nextNode();
                while (walkNode) {
                    if (walkNode === node) {
                        localSlashPosition = slashTriggerStartIndex.current - serializedCharCount;
                        break;
                    }
                    if (walkNode.nodeType === Node.TEXT_NODE) {
                        serializedCharCount += (walkNode.textContent || "").length;
                    }
                    else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        var el = walkNode;
                        if (el.hasAttribute("data-mention-id")) {
                            var id = el.getAttribute("data-mention-id") || "";
                            serializedCharCount += "@[".concat(id, "]").length;
                            var next = el.nextSibling;
                            if (next) {
                                walker.currentNode = next;
                                walkNode = next;
                                continue;
                            }
                        }
                    }
                    walkNode = walker.nextNode();
                }
                // Only proceed if we found the slash position
                if (localSlashPosition === null || localSlashPosition < 0) {
                    // Node not found in tree walk - just close the trigger without modifying text
                    slashTriggerActive.current = false;
                    slashTriggerStartIndex.current = null;
                    onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
                    return;
                }
                // Remove from / to cursor
                var beforeSlash = text.slice(0, localSlashPosition);
                var afterCursor = text.slice(range.startOffset);
                node.textContent = beforeSlash + afterCursor;
                // Move cursor to where / was
                var newRange = document.createRange();
                newRange.setStart(node, localSlashPosition);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                // Update hasContent
                var newContent = editorRef.current.textContent;
                setHasContent(!!newContent);
                onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(!!newContent);
            }
            // Close trigger
            slashTriggerActive.current = false;
            slashTriggerStartIndex.current = null;
            onCloseSlashTrigger === null || onCloseSlashTrigger === void 0 ? void 0 : onCloseSlashTrigger();
        },
        insertMention: function (option) {
            if (!editorRef.current)
                return;
            // Save state for undo before inserting mention (immediate, not debounced)
            immediateSaveUndoState();
            var sel = window.getSelection();
            var range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
            // Case 1: Triggered by @ - remove @ and search text, then insert mention
            if (range && range.startContainer.nodeType === Node.TEXT_NODE && triggerStartIndex.current !== null) {
                var node = range.startContainer;
                var text = node.textContent || "";
                // Find local position of @ within THIS text node
                var localAtPosition = 0;
                var serializedCharCount = 0;
                var walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
                var walkNode = walker.nextNode();
                while (walkNode) {
                    if (walkNode === node) {
                        localAtPosition = triggerStartIndex.current - serializedCharCount;
                        break;
                    }
                    if (walkNode.nodeType === Node.TEXT_NODE) {
                        serializedCharCount += (walkNode.textContent || "").length;
                    }
                    else if (walkNode.nodeType === Node.ELEMENT_NODE) {
                        var el = walkNode;
                        if (el.hasAttribute("data-mention-id")) {
                            var id = el.getAttribute("data-mention-id") || "";
                            serializedCharCount += "@[".concat(id, "]").length;
                            var next = el.nextSibling;
                            if (next) {
                                walker.currentNode = next;
                                walkNode = next;
                                continue;
                            }
                        }
                    }
                    walkNode = walker.nextNode();
                }
                var beforeAt = text.slice(0, localAtPosition);
                var afterCursor = text.slice(range.startOffset);
                node.textContent = beforeAt + afterCursor;
                // Insert mention node
                var mentionNode = createMentionNode(option);
                var newRange = document.createRange();
                newRange.setStart(node, localAtPosition);
                newRange.collapse(true);
                newRange.insertNode(mentionNode);
                // Add space after and move cursor
                var space = document.createTextNode(" ");
                mentionNode.after(space);
                newRange.setStartAfter(space);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                // Update hasContent
                setHasContent(true);
                // Close trigger
                triggerActive.current = false;
                triggerStartIndex.current = null;
                onCloseTrigger();
            }
            else {
                var mentionNode = createMentionNode(option);
                var space = document.createTextNode(" ");
                // Append to editor content
                editorRef.current.appendChild(mentionNode);
                editorRef.current.appendChild(space);
                // Move cursor after the space
                var newRange = document.createRange();
                newRange.setStartAfter(space);
                newRange.collapse(true);
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }
                // Update hasContent
                setHasContent(true);
                onContentChange === null || onContentChange === void 0 ? void 0 : onContentChange(true);
            }
        }
    }); }, [
        onCloseTrigger,
        onCloseSlashTrigger,
        resolveMention,
        onContentChange,
        immediateSaveUndoState
    ]);
    return <div class="relative">
          {!hasContent && placeholder && <div class="pointer-events-none absolute left-1 top-1 text-sm text-muted-foreground/60 whitespace-pre-wrap">
              {placeholder}
            </div>}
          <div ref={editorRef} contentEditable={!disabled} suppressContentEditableWarning spellCheck={false} onInput={handleInput} onKeyDown={handleKeyDown} onPaste={function (e) {
            // Save state for undo before paste (immediate, not debounced)
            immediateSaveUndoState();
            onPaste === null || onPaste === void 0 ? void 0 : onPaste(e);
        }} onFocus={onFocus} onBlur={onBlur} class={(0, utils_1.cn)("min-h-[24px] outline-none whitespace-pre-wrap break-words text-sm relative", disabled && "opacity-50 cursor-not-allowed", className)}/>
        </div>;
}));
