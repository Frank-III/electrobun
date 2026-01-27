"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchHighlightProvider = SearchHighlightProvider;
exports.useSearchHighlightContext = useSearchHighlightContext;
exports.useSearchHighlight = useSearchHighlight;
exports.useIsSearchActive = useIsSearchActive;
exports.useSearchQuery = useSearchQuery;
var solid_js_1 = require("solid-js");
var chat_search_atoms_1 = require("./chat-search-atoms");
var SearchHighlightContext = (0, solid_js_1.createContext)(null);
// ============================================================================
// PROVIDER
// ============================================================================
// Empty context value when search is closed - stable reference to avoid re-renders
var EMPTY_HIGHLIGHT_RANGES = [];
var emptyGetHighlightRanges = function () { return EMPTY_HIGHLIGHT_RANGES; };
var CLOSED_SEARCH_VALUE = {
    query: function () { return ""; },
    isSearchActive: function () { return false; },
    getHighlightRanges: emptyGetHighlightRanges
};
function SearchHighlightProvider(props) {
    // Only subscribe to isOpen first - this is the gate
    var isOpen = chat_search_atoms_1.chatSearchOpenAtom[0];
    // When search is closed, render with static empty context
    // This prevents any subscriptions to query/matches/currentMatch
    if (!isOpen()) {
        return <SearchHighlightContext.Provider value={CLOSED_SEARCH_VALUE}>
        {props.children}
      </SearchHighlightContext.Provider>;
    }
    // Search is open - render the active provider
    return <SearchHighlightProviderActive>
      {props.children}
    </SearchHighlightProviderActive>;
}
// Separate component for when search is active
// This isolates the subscriptions to query/matches/currentMatch
function SearchHighlightProviderActive(props) {
    var query = chat_search_atoms_1.chatSearchQueryAtom[0];
    var isSearchActive = (0, solid_js_1.createMemo)(function () { return query().trim().length > 0; });
    var getHighlightRanges = function (messageId, partIndex, partType) {
        if (!isSearchActive())
            return EMPTY_HIGHLIGHT_RANGES;
        var key = "".concat(messageId, ":").concat(partIndex, ":").concat(partType);
        return (0, chat_search_atoms_1.highlightRangesAtomFamily)(key)();
    };
    var value = (0, solid_js_1.createMemo)(function () { return ({
        query: query,
        isSearchActive: isSearchActive,
        getHighlightRanges: getHighlightRanges
    }); });
    return <SearchHighlightContext.Provider value={value()}>
      {props.children}
    </SearchHighlightContext.Provider>;
}
// ============================================================================
// HOOKS
// ============================================================================
/**
* Hook to access search highlight context
*/
function useSearchHighlightContext() {
    return (0, solid_js_1.useContext)(SearchHighlightContext);
}
/**
* Hook to get highlight ranges for a specific message part
* Returns empty array if search is not active or no matches
*/
function useSearchHighlight(messageId, partIndex, partType) {
    var context = (0, solid_js_1.useContext)(SearchHighlightContext);
    if (!context || !context.isSearchActive()) {
        return [];
    }
    return context.getHighlightRanges(messageId, partIndex, partType);
}
/**
* Hook to check if search is currently active
*/
function useIsSearchActive() {
    var _a;
    var context = (0, solid_js_1.useContext)(SearchHighlightContext);
    return (_a = context === null || context === void 0 ? void 0 : context.isSearchActive()) !== null && _a !== void 0 ? _a : false;
}
/**
* Hook to get the current search query
*/
function useSearchQuery() {
    var _a;
    var context = (0, solid_js_1.useContext)(SearchHighlightContext);
    return (_a = context === null || context === void 0 ? void 0 : context.query()) !== null && _a !== void 0 ? _a : "";
}
