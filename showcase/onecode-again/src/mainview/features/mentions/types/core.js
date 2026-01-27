"use strict";
/**
 * Core types for the scalable mention system
 *
 * This module defines the fundamental types used across all mention providers.
 * Inspired by VS Code's extension model for maximum extensibility.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENTION_PREFIXES = void 0;
exports.createProviderId = createProviderId;
exports.getMentionPrefix = getMentionPrefix;
exports.isMentionType = isMentionType;
/**
 * Helper to create a MentionProviderId
 */
function createProviderId(id) {
    return id;
}
/**
 * Mention prefix constants for different item types
 * Used in serialization/deserialization
 */
exports.MENTION_PREFIXES = {
    FILE: "file:",
    FOLDER: "folder:",
    SKILL: "skill:",
    AGENT: "agent:",
    TOOL: "tool:",
    QUOTE: "quote:",
    DIFF: "diff:",
    PASTED: "pasted:",
    SYMBOL: "symbol:",
    GITHUB_ISSUE: "github:issue:",
    GITHUB_PR: "github:pr:",
};
/**
 * Extract prefix from a mention ID
 */
function getMentionPrefix(id) {
    for (var _i = 0, _a = Object.values(exports.MENTION_PREFIXES); _i < _a.length; _i++) {
        var prefix = _a[_i];
        if (id.startsWith(prefix)) {
            return prefix;
        }
    }
    return null;
}
/**
 * Check if a mention ID belongs to a specific type
 */
function isMentionType(id, type) {
    return id.startsWith(exports.MENTION_PREFIXES[type]);
}
