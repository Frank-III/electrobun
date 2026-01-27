"use strict";
/**
 * Utility functions for agent tool components
 *
 * CRITICAL: AI SDK mutates objects in-place during streaming!
 * This means prev.output === next.output (same reference) even when
 * the values inside have changed. We MUST cache state externally
 * and compare cached values, not object references.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.areToolPropsEqual = areToolPropsEqual;
exports.areTaskToolPropsEqual = areTaskToolPropsEqual;
exports.areExploringGroupPropsEqual = areExploringGroupPropsEqual;
exports.isPlanFile = isPlanFile;
exports.areAskUserQuestionPropsEqual = areAskUserQuestionPropsEqual;
var toolStateCache = new Map();
function getToolStateSnapshot(part) {
    return {
        state: part.state,
        inputJson: JSON.stringify(part.input || {}),
        outputJson: JSON.stringify(part.output || {}),
    };
}
function hasToolStateChanged(toolCallId, part) {
    var cached = toolStateCache.get(toolCallId);
    var current = getToolStateSnapshot(part);
    if (!cached) {
        toolStateCache.set(toolCallId, current);
        return true;
    }
    var changed = cached.state !== current.state ||
        cached.inputJson !== current.inputJson ||
        cached.outputJson !== current.outputJson;
    if (changed) {
        toolStateCache.set(toolCallId, current);
    }
    return changed;
}
/**
 * Compare two part objects by their significant fields.
 * Returns true if they are equal.
 *
 * IMPORTANT: Uses external cache to detect AI SDK in-place mutations.
 */
function arePartsEqual(prev, next) {
    // Different toolCallId = different tool
    if (prev.toolCallId !== next.toolCallId)
        return false;
    if (prev.type !== next.type)
        return false;
    // Use cache-based comparison for the next part
    // We check if the NEXT part has changed from what we cached
    var toolCallId = next.toolCallId;
    if (!toolCallId) {
        // No toolCallId - fall back to simple comparison
        return prev.state === next.state;
    }
    // Check if tool state has changed using our external cache
    // hasToolStateChanged updates the cache if changed
    var changed = hasToolStateChanged(toolCallId, next);
    // Return true (equal) if nothing changed
    return !changed;
}
/**
 * Check if a tool is completed (has output or error state).
 * Completed tools don't need to react to chatStatus changes.
 */
function isToolCompleted(part) {
    // Has output = completed
    if (part.output !== undefined && part.output !== null)
        return true;
    // Error state = completed
    if (part.state === "error")
        return true;
    // Result state = completed (for some tools)
    if (part.state === "result")
        return true;
    return false;
}
/**
 * Deep compare function for tool part props.
 * Used with React.memo() to prevent unnecessary re-renders when
 * parent component re-renders but the tool's actual data hasn't changed.
 *
 * This is critical for streaming performance - when ai-sdk updates messages,
 * it creates new object references for all parts, but most parts haven't
 * actually changed. This comparator checks the actual values.
 *
 * OPTIMIZATION: Completed tools don't re-render on chatStatus changes.
 */
function areToolPropsEqual(prevProps, nextProps) {
    // First check if the tool data itself changed
    var partsEqual = arePartsEqual(prevProps.part, nextProps.part);
    if (!partsEqual)
        return false;
    // If tool is completed, it doesn't care about chatStatus changes
    if (isToolCompleted(nextProps.part)) {
        return true;
    }
    // For pending tools, chatStatus matters (determines spinner vs completed)
    if (prevProps.chatStatus !== nextProps.chatStatus)
        return false;
    return true;
}
/**
 * Compare function for AgentTaskTool which has additional nestedTools prop.
 */
function areTaskToolPropsEqual(prevProps, nextProps) {
    // Compare main part first
    if (!arePartsEqual(prevProps.part, nextProps.part))
        return false;
    // Compare nestedTools array
    var prevNested = prevProps.nestedTools || [];
    var nextNested = nextProps.nestedTools || [];
    if (prevNested.length !== nextNested.length)
        return false;
    // Compare each nested tool
    for (var i = 0; i < prevNested.length; i++) {
        if (!arePartsEqual(prevNested[i], nextNested[i]))
            return false;
    }
    // If all tools are completed, don't care about chatStatus
    var mainCompleted = isToolCompleted(nextProps.part);
    var allNestedCompleted = nextNested.every(isToolCompleted);
    if (mainCompleted && allNestedCompleted) {
        return true;
    }
    // For pending tools, chatStatus matters
    if (prevProps.chatStatus !== nextProps.chatStatus)
        return false;
    return true;
}
/**
 * Compare function for AgentExploringGroup which has parts array.
 */
function areExploringGroupPropsEqual(prevProps, nextProps) {
    var prevParts = prevProps.parts || [];
    var nextParts = nextProps.parts || [];
    if (prevParts.length !== nextParts.length)
        return false;
    for (var i = 0; i < prevParts.length; i++) {
        if (!arePartsEqual(prevParts[i], nextParts[i]))
            return false;
    }
    // If all parts are completed, don't care about chatStatus or isStreaming
    var allCompleted = nextParts.every(isToolCompleted);
    if (allCompleted) {
        return true;
    }
    // For pending groups, these matter
    if (prevProps.chatStatus !== nextProps.chatStatus)
        return false;
    if (prevProps.isStreaming !== nextProps.isStreaming)
        return false;
    return true;
}
/**
 * Check if a file path is a plan file.
 * Plan files are stored in the claude-sessions directory under /plans/
 */
function isPlanFile(filePath) {
    var _a;
    // Check for official plan location in claude-sessions
    if (filePath.includes("claude-sessions") && filePath.includes("/plans/")) {
        return true;
    }
    // Also check for plan files by name pattern (for backwards compatibility)
    var fileName = ((_a = filePath.split("/").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    if (fileName.includes("plan") && fileName.endsWith(".md")) {
        return true;
    }
    return false;
}
var askUserStateCache = new Map();
function areAskUserQuestionPropsEqual(prevProps, nextProps) {
    // Different toolCallId = different tool
    if (prevProps.toolCallId !== nextProps.toolCallId)
        return false;
    var toolCallId = nextProps.toolCallId;
    if (!toolCallId) {
        // No toolCallId - fall back to simple comparison
        return prevProps.state === nextProps.state;
    }
    // Create current state snapshot
    var current = {
        state: nextProps.state,
        isError: nextProps.isError,
        errorText: nextProps.errorText,
        inputJson: JSON.stringify(nextProps.input || {}),
        resultJson: JSON.stringify(nextProps.result || {}),
    };
    var cached = askUserStateCache.get(toolCallId);
    if (!cached) {
        askUserStateCache.set(toolCallId, current);
        return false; // First render
    }
    var changed = cached.state !== current.state ||
        cached.isError !== current.isError ||
        cached.errorText !== current.errorText ||
        cached.inputJson !== current.inputJson ||
        cached.resultJson !== current.resultJson;
    if (changed) {
        askUserStateCache.set(toolCallId, current);
        return false;
    }
    // If tool has result, it's completed - don't care about isStreaming
    if (nextProps.result !== undefined) {
        return true;
    }
    // For pending state, isStreaming matters
    if (prevProps.isStreaming !== nextProps.isStreaming)
        return false;
    return true;
}
