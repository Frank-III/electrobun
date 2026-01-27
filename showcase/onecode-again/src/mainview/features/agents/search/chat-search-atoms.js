"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightRangesAtomFamily = exports.chatSearchCountInfoAtom = exports.chatSearchCurrentMatchAtom = exports.chatSearchCurrentIndexAtom = exports.chatSearchMatchesAtom = exports.chatSearchQueryAtom = exports.chatSearchInputAtom = exports.chatSearchOpenAtom = void 0;
exports.goToNextMatchAtom = goToNextMatchAtom;
exports.goToPrevMatchAtom = goToPrevMatchAtom;
exports.closeSearchAtom = closeSearchAtom;
exports.openSearchAtom = openSearchAtom;
exports.toggleSearchAtom = toggleSearchAtom;
var solid_js_1 = require("solid-js");
// ============================================================================
// SEARCH STATE ATOMS
// ============================================================================
// Search panel open state
exports.chatSearchOpenAtom = (0, solid_js_1.createSignal)(false);
// Raw input value (updates immediately for responsive UI)
exports.chatSearchInputAtom = (0, solid_js_1.createSignal)("");
// Debounced search query (for actual searching)
exports.chatSearchQueryAtom = (0, solid_js_1.createSignal)("");
// All matches found
exports.chatSearchMatchesAtom = (0, solid_js_1.createSignal)([]);
// Current match index (0-based)
exports.chatSearchCurrentIndexAtom = (0, solid_js_1.createSignal)(0);
// ============================================================================
// DERIVED ATOMS
// ============================================================================
// Current match for scroll-to
exports.chatSearchCurrentMatchAtom = (0, solid_js_1.createMemo)(function () {
    var _a;
    var matches = exports.chatSearchMatchesAtom[0]();
    var index = exports.chatSearchCurrentIndexAtom[0]();
    return (_a = matches[index]) !== null && _a !== void 0 ? _a : null;
});
// Match count info for display
exports.chatSearchCountInfoAtom = (0, solid_js_1.createMemo)(function () {
    var matches = exports.chatSearchMatchesAtom[0]();
    var index = exports.chatSearchCurrentIndexAtom[0]();
    return {
        current: matches.length > 0 ? index + 1 : 0,
        total: matches.length,
    };
});
// ============================================================================
// HIGHLIGHT RANGES PER MESSAGE/PART
// ============================================================================
// Cache for highlight ranges by message and part
// Key format: `${messageId}:${partIndex}:${partType}`
var highlightRangesCache = new Map();
// Accessor factory for highlight ranges per message/part
var highlightRangesAccessors = new Map();
var highlightRangesAtomFamily = function (key) {
    if (!highlightRangesAccessors.has(key)) {
        highlightRangesAccessors.set(key, (0, solid_js_1.createMemo)(function () {
            var matches = exports.chatSearchMatchesAtom[0]();
            var currentMatch = (0, exports.chatSearchCurrentMatchAtom)();
            // Parse key
            var _a = key.split(":"), messageId = _a[0], partIndexStr = _a[1], partType = _a[2];
            var partIndex = parseInt(partIndexStr, 10);
            // Filter matches for this message/part
            var relevantMatches = matches.filter(function (m) {
                return m.messageId === messageId &&
                    m.partIndex === partIndex &&
                    m.partType === partType;
            });
            if (relevantMatches.length === 0) {
                return [];
            }
            // Convert to highlight ranges
            var ranges = relevantMatches.map(function (m, idx) { return ({
                offset: m.offset,
                length: m.length,
                isCurrent: (currentMatch === null || currentMatch === void 0 ? void 0 : currentMatch.id) === m.id,
                indexInPart: idx,
            }); });
            // Check cache for stable reference
            var cached = highlightRangesCache.get(key);
            if (cached &&
                cached.length === ranges.length &&
                cached.every(function (r, i) {
                    return r.offset === ranges[i].offset &&
                        r.length === ranges[i].length &&
                        r.isCurrent === ranges[i].isCurrent;
                })) {
                return cached;
            }
            highlightRangesCache.set(key, ranges);
            return ranges;
        }));
    }
    return highlightRangesAccessors.get(key);
};
exports.highlightRangesAtomFamily = highlightRangesAtomFamily;
// ============================================================================
// ACTIONS
// ============================================================================
// Navigate to next match
function goToNextMatchAtom() {
    var matches = exports.chatSearchMatchesAtom[0]();
    var currentIndex = exports.chatSearchCurrentIndexAtom[0]();
    if (matches.length === 0)
        return;
    var newIndex = (currentIndex + 1) % matches.length;
    exports.chatSearchCurrentIndexAtom[1](newIndex);
}
// Navigate to previous match
function goToPrevMatchAtom() {
    var matches = exports.chatSearchMatchesAtom[0]();
    var currentIndex = exports.chatSearchCurrentIndexAtom[0]();
    if (matches.length === 0)
        return;
    var newIndex = currentIndex === 0 ? matches.length - 1 : currentIndex - 1;
    exports.chatSearchCurrentIndexAtom[1](newIndex);
}
// Close search and clear state
function closeSearchAtom() {
    exports.chatSearchOpenAtom[1](false);
    exports.chatSearchInputAtom[1]("");
    exports.chatSearchQueryAtom[1]("");
    exports.chatSearchMatchesAtom[1]([]);
    exports.chatSearchCurrentIndexAtom[1](0);
    highlightRangesCache.clear();
}
// Open search
function openSearchAtom() {
    exports.chatSearchOpenAtom[1](true);
}
/**
 * Toggle search - if already open, select all text instead of closing
 * This allows users to press Cmd+F again to quickly start a new search
 */
function toggleSearchAtom() {
    var isOpen = exports.chatSearchOpenAtom[0]();
    if (isOpen) {
        // Dispatch custom event to select all text in search input
        window.dispatchEvent(new CustomEvent("chat-search-select-all"));
    }
    else {
        openSearchAtom();
    }
}
