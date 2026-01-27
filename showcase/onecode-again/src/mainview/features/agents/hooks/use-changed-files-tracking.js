"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChangedFilesTracking = useChangedFilesTracking;
var jotai_1 = require("../../../lib/state/jotai");
var react_1 = require("react");
var atoms_1 = require("../atoms");
// import { REPO_ROOT_PATH } from "@/lib/codesandbox-constants"
var REPO_ROOT_PATH = "/workspace"; // Desktop mock
/**
 * Custom hook to track changed files from Edit/Write tool calls in a sub-chat
 * Extracts file paths and calculates diff stats from message history
 * Only recalculates after streaming ends (not during streaming)
 */
function useChangedFilesTracking(messages, subChatId, isStreaming, chatId) {
    if (isStreaming === void 0) { isStreaming = false; }
    var setSubChatFiles = (0, jotai_1.useSetAtom)(atoms_1.subChatFilesAtom);
    var setSubChatToChatMap = (0, jotai_1.useSetAtom)(atoms_1.subChatToChatMapAtom);
    // Helper to get display path (removes sandbox prefixes and worktree paths)
    var getDisplayPath = (0, react_1.useCallback)(function (filePath) {
        if (!filePath)
            return "";
        // Use constant from codesandbox-constants
        var prefixes = ["".concat(REPO_ROOT_PATH, "/"), "/project/sandbox/", "/project/"];
        for (var _i = 0, prefixes_1 = prefixes; _i < prefixes_1.length; _i++) {
            var prefix = prefixes_1[_i];
            if (filePath.startsWith(prefix)) {
                return filePath.slice(prefix.length);
            }
        }
        // Handle worktree paths: /Users/.../.21st/worktrees/{chatId}/{subChatId}/relativePath
        // Extract everything after the subChatId directory
        var worktreeMatch = filePath.match(/\.21st\/worktrees\/[^/]+\/[^/]+\/(.+)$/);
        if (worktreeMatch) {
            return worktreeMatch[1];
        }
        // Heuristic: find common root directories
        if (filePath.startsWith("/")) {
            var parts = filePath.split("/");
            var rootIndicators_1 = ["apps", "packages", "src", "lib", "components"];
            var rootIndex = parts.findIndex(function (p) { return rootIndicators_1.includes(p); });
            if (rootIndex > 0) {
                return parts.slice(rootIndex).join("/");
            }
        }
        return filePath;
    }, []);
    // Calculate diff stats from old_string and new_string
    // For Edit: old_string lines are deletions, new_string lines are additions
    // For Write: counts lines in new content as additions
    var calculateDiffStats = (0, react_1.useCallback)(function (oldStr, newStr) {
        if (oldStr === newStr)
            return { additions: 0, deletions: 0 };
        var oldLines = oldStr ? oldStr.split("\n").length : 0;
        var newLines = newStr ? newStr.split("\n").length : 0;
        // Simple heuristic: if old is empty, it's a new file (Write)
        if (!oldStr) {
            return { additions: newLines, deletions: 0 };
        }
        // For edits: old lines are removed, new lines are added
        return {
            additions: newLines,
            deletions: oldLines,
        };
    }, []);
    // State to hold the calculated changed files (only updated when streaming ends)
    var _a = (0, react_1.useState)([]), changedFiles = _a[0], setChangedFiles = _a[1];
    var wasStreamingRef = (0, react_1.useRef)(false);
    var isInitializedRef = (0, react_1.useRef)(false);
    // Check if a file path is a session/plan file that should be excluded
    var isSessionFile = (0, react_1.useCallback)(function (filePath) {
        // Exclude files in claude-sessions (plan files stored in app's local storage)
        if (filePath.includes("claude-sessions"))
            return true;
        // Exclude files in Application Support directory
        if (filePath.includes("Application Support"))
            return true;
        return false;
    }, []);
    // Calculate changed files from messages
    var calculateChangedFiles = (0, react_1.useCallback)(function (inputMessages) {
        var _a, _b, _c, _d;
        if (inputMessages === void 0) { inputMessages = messages; }
        // Track file states: originalContent (first old_string) and currentContent (latest new_string)
        var fileStates = new Map();
        for (var _i = 0, inputMessages_1 = inputMessages; _i < inputMessages_1.length; _i++) {
            var msg = inputMessages_1[_i];
            if (msg.role !== "assistant")
                continue;
            for (var _e = 0, _f = msg.parts || []; _e < _f.length; _e++) {
                var part = _f[_e];
                if (part.type === "tool-Edit" || part.type === "tool-Write") {
                    var filePath = (_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path;
                    if (!filePath)
                        continue;
                    // Skip session/plan files stored in local app storage
                    if (isSessionFile(filePath))
                        continue;
                    var oldString = ((_b = part.input) === null || _b === void 0 ? void 0 : _b.old_string) || "";
                    var newString = ((_c = part.input) === null || _c === void 0 ? void 0 : _c.new_string) || ((_d = part.input) === null || _d === void 0 ? void 0 : _d.content) || "";
                    var existing = fileStates.get(filePath);
                    if (existing) {
                        // Update current content only (preserve original)
                        existing.currentContent = newString;
                    }
                    else {
                        // First time seeing this file - record original state
                        fileStates.set(filePath, {
                            // For Write (new file), original is null; for Edit, it's the old_string
                            originalContent: part.type === "tool-Write" ? null : oldString,
                            currentContent: newString,
                            displayPath: getDisplayPath(filePath),
                        });
                    }
                }
            }
        }
        // Calculate NET diff from original to current state
        var result = [];
        for (var _g = 0, fileStates_1 = fileStates; _g < fileStates_1.length; _g++) {
            var _h = fileStates_1[_g], filePath = _h[0], state = _h[1];
            var originalContent = state.originalContent || "";
            // Skip if file returned to original state (net change = 0)
            if (originalContent === state.currentContent) {
                continue;
            }
            var stats = calculateDiffStats(originalContent, state.currentContent);
            result.push({
                filePath: filePath,
                displayPath: state.displayPath,
                additions: stats.additions,
                deletions: stats.deletions,
            });
        }
        return result;
    }, [messages, getDisplayPath, calculateDiffStats, isSessionFile]);
    var recomputeChangedFiles = (0, react_1.useCallback)(function (overrideMessages) {
        var newChangedFiles = calculateChangedFiles(overrideMessages !== null && overrideMessages !== void 0 ? overrideMessages : messages);
        setChangedFiles(newChangedFiles);
        isInitializedRef.current = true;
    }, [calculateChangedFiles, messages]);
    // Only recalculate when streaming ends (transition from true to false)
    // Also calculate on initial mount if not streaming
    (0, react_1.useEffect)(function () {
        // Detect streaming end: was streaming, now not streaming
        if (wasStreamingRef.current && !isStreaming) {
            var newChangedFiles = calculateChangedFiles();
            setChangedFiles(newChangedFiles);
            isInitializedRef.current = true;
        }
        // Initialize on mount if we have messages and not streaming
        else if (!isInitializedRef.current && !isStreaming && messages.length > 0) {
            var newChangedFiles = calculateChangedFiles();
            setChangedFiles(newChangedFiles);
            isInitializedRef.current = true;
        }
        wasStreamingRef.current = isStreaming;
    }, [isStreaming, calculateChangedFiles, messages.length]);
    // Update atom when changed files change
    (0, react_1.useEffect)(function () {
        setSubChatFiles(function (prev) {
            var next = new Map(prev);
            next.set(subChatId, changedFiles);
            return next;
        });
    }, [subChatId, changedFiles, setSubChatFiles]);
    // Update subChatId -> chatId mapping for aggregation in workspace sidebar
    (0, react_1.useEffect)(function () {
        if (chatId) {
            setSubChatToChatMap(function (prev) {
                var next = new Map(prev);
                next.set(subChatId, chatId);
                return next;
            });
        }
    }, [subChatId, chatId, setSubChatToChatMap]);
    return { changedFiles: changedFiles, recomputeChangedFiles: recomputeChangedFiles };
}
