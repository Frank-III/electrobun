"use strict";
/**
 * Search Types for the Mention System
 *
 * Defines the context and result types for mention searches.
 * These types are used by the search engine and providers.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRelevance = calculateRelevance;
exports.sortByRelevance = sortByRelevance;
/**
 * Calculate relevance score for an item
 */
function calculateRelevance(item, query) {
    var _a, _b, _c, _d, _e, _f;
    var normalizedQuery = query.toLowerCase().trim();
    var normalizedLabel = item.label.toLowerCase();
    var normalizedDescription = (_b = (_a = item.description) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    // Split query into words for multi-word matching
    var queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
    var firstWord = (_c = queryWords[0]) !== null && _c !== void 0 ? _c : "";
    var exactMatch = 0;
    var prefixMatch = 0;
    var containsMatch = 0;
    var pathMatch = 0;
    var keywordsMatch = 0;
    // Empty query - return neutral score (items sorted by priority)
    if (queryWords.length === 0 || !normalizedQuery) {
        return {
            exactMatch: 0,
            prefixMatch: 0,
            containsMatch: 0,
            pathMatch: 0,
            keywordsMatch: 0,
            recency: 0,
            priority: Math.min(Math.max((_d = item.priority) !== null && _d !== void 0 ? _d : 0, -100), 100),
            total: Math.min(Math.max((_e = item.priority) !== null && _e !== void 0 ? _e : 0, -100), 100),
        };
    }
    // Single word query
    if (queryWords.length === 1) {
        if (normalizedLabel === normalizedQuery) {
            exactMatch = 100;
        }
        else if (firstWord && normalizedLabel.startsWith(firstWord)) {
            prefixMatch = 80;
        }
        else if (normalizedLabel.includes(normalizedQuery)) {
            containsMatch = 50;
        }
        if (normalizedDescription.includes(normalizedQuery)) {
            pathMatch = 30;
        }
    }
    else {
        // Multi-word query - all words must match somewhere
        var allWordsMatch = queryWords.every(function (word) {
            return normalizedLabel.includes(word) || normalizedDescription.includes(word);
        });
        if (allWordsMatch) {
            // Bonus for label starting with first word
            if (firstWord && normalizedLabel.startsWith(firstWord)) {
                prefixMatch = 60;
            }
            containsMatch = 40;
        }
    }
    // Check keywords (e.g., agent tools, skill tags)
    // This allows finding agents by their allowed tools
    if (item.keywords && item.keywords.length > 0 && queryWords.length > 0) {
        var normalizedKeywords_1 = item.keywords.map(function (k) { return k.toLowerCase(); });
        var matchedKeywords = queryWords.filter(function (word) {
            return normalizedKeywords_1.some(function (kw) { return kw.includes(word); });
        });
        // 20 points per matched keyword, up to 60
        keywordsMatch = Math.min(matchedKeywords.length * 20, 60);
    }
    // Priority from item (clamped to prevent abuse)
    var priority = Math.min(Math.max((_f = item.priority) !== null && _f !== void 0 ? _f : 0, -100), 100);
    // Calculate total
    var total = exactMatch + prefixMatch + containsMatch + pathMatch + keywordsMatch + priority;
    return {
        exactMatch: exactMatch,
        prefixMatch: prefixMatch,
        containsMatch: containsMatch,
        pathMatch: pathMatch,
        keywordsMatch: keywordsMatch,
        recency: 0, // Would be calculated with file mtime
        priority: priority,
        total: total,
    };
}
/**
 * Sort items by relevance to query
 */
function sortByRelevance(items, query) {
    if (!query.trim()) {
        // No query - sort by priority only
        return __spreadArray([], items, true).sort(function (a, b) { var _a, _b; return ((_a = b.priority) !== null && _a !== void 0 ? _a : 0) - ((_b = a.priority) !== null && _b !== void 0 ? _b : 0); });
    }
    return __spreadArray([], items, true).map(function (item) { return ({
        item: item,
        score: calculateRelevance(item, query),
    }); })
        .sort(function (a, b) {
        // Primary: total score
        if (b.score.total !== a.score.total) {
            return b.score.total - a.score.total;
        }
        // Secondary: shorter labels (more specific matches)
        return a.item.label.length - b.item.label.length;
    })
        .map(function (_a) {
        var item = _a.item;
        return item;
    });
}
