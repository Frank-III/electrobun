"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchQuery = exports.useIsSearchActive = exports.useSearchHighlight = exports.useSearchHighlightContext = exports.SearchHighlightProvider = exports.ChatSearchBar = exports.debounce = exports.splitTextByHighlights = exports.findMatches = exports.extractSearchableText = exports.toggleSearchAtom = exports.openSearchAtom = exports.closeSearchAtom = exports.goToPrevMatchAtom = exports.goToNextMatchAtom = exports.highlightRangesAtomFamily = exports.chatSearchCountInfoAtom = exports.chatSearchCurrentMatchAtom = exports.chatSearchCurrentIndexAtom = exports.chatSearchMatchesAtom = exports.chatSearchQueryAtom = exports.chatSearchInputAtom = exports.chatSearchOpenAtom = void 0;
// Atoms
var chat_search_atoms_1 = require("./chat-search-atoms");
Object.defineProperty(exports, "chatSearchOpenAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchOpenAtom; } });
Object.defineProperty(exports, "chatSearchInputAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchInputAtom; } });
Object.defineProperty(exports, "chatSearchQueryAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchQueryAtom; } });
Object.defineProperty(exports, "chatSearchMatchesAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchMatchesAtom; } });
Object.defineProperty(exports, "chatSearchCurrentIndexAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchCurrentIndexAtom; } });
Object.defineProperty(exports, "chatSearchCurrentMatchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchCurrentMatchAtom; } });
Object.defineProperty(exports, "chatSearchCountInfoAtom", { enumerable: true, get: function () { return chat_search_atoms_1.chatSearchCountInfoAtom; } });
Object.defineProperty(exports, "highlightRangesAtomFamily", { enumerable: true, get: function () { return chat_search_atoms_1.highlightRangesAtomFamily; } });
Object.defineProperty(exports, "goToNextMatchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.goToNextMatchAtom; } });
Object.defineProperty(exports, "goToPrevMatchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.goToPrevMatchAtom; } });
Object.defineProperty(exports, "closeSearchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.closeSearchAtom; } });
Object.defineProperty(exports, "openSearchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.openSearchAtom; } });
Object.defineProperty(exports, "toggleSearchAtom", { enumerable: true, get: function () { return chat_search_atoms_1.toggleSearchAtom; } });
// Utils
var chat_search_utils_1 = require("./chat-search-utils");
Object.defineProperty(exports, "extractSearchableText", { enumerable: true, get: function () { return chat_search_utils_1.extractSearchableText; } });
Object.defineProperty(exports, "findMatches", { enumerable: true, get: function () { return chat_search_utils_1.findMatches; } });
Object.defineProperty(exports, "splitTextByHighlights", { enumerable: true, get: function () { return chat_search_utils_1.splitTextByHighlights; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return chat_search_utils_1.debounce; } });
// Components
var chat_search_bar_1 = require("./chat-search-bar");
Object.defineProperty(exports, "ChatSearchBar", { enumerable: true, get: function () { return chat_search_bar_1.ChatSearchBar; } });
// Context
var search_highlight_context_1 = require("./search-highlight-context");
Object.defineProperty(exports, "SearchHighlightProvider", { enumerable: true, get: function () { return search_highlight_context_1.SearchHighlightProvider; } });
Object.defineProperty(exports, "useSearchHighlightContext", { enumerable: true, get: function () { return search_highlight_context_1.useSearchHighlightContext; } });
Object.defineProperty(exports, "useSearchHighlight", { enumerable: true, get: function () { return search_highlight_context_1.useSearchHighlight; } });
Object.defineProperty(exports, "useIsSearchActive", { enumerable: true, get: function () { return search_highlight_context_1.useIsSearchActive; } });
Object.defineProperty(exports, "useSearchQuery", { enumerable: true, get: function () { return search_highlight_context_1.useSearchQuery; } });
