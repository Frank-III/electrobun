"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalSearch = TerminalSearch;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
function TerminalSearch(_a) {
    var searchAddon = _a.searchAddon, isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = (0, solid_js_1.createSignal)(""), query = _b[0], setQuery = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), matchCount = _c[0], setMatchCount = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), inputRef = _d[0], setInputRef = _d[1];
    // Focus input when opened
    (0, solid_js_1.createEffect)(function () {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    });
    // Handle search
    var handleSearch = function (direction) {
        if (!searchAddon || !query)
            return;
        if (direction === "next") {
            searchAddon.findNext(query, {
                caseSensitive: false,
                regex: false
            });
        }
        else {
            searchAddon.findPrevious(query, {
                caseSensitive: false,
                regex: false
            });
        }
    };
    // Search on query change
    (0, solid_js_1.createEffect)(function () {
        if (!searchAddon || !query) {
            setMatchCount(null);
            return;
        }
        // Trigger search
        searchAddon.findNext(query, {
            caseSensitive: false,
            regex: false
        });
    });
    // Handle keyboard shortcuts
    var handleKeyDown = function (e) {
        if (e.key === "Escape") {
            onClose();
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            if (e.shiftKey) {
                handleSearch("prev");
            }
            else {
                handleSearch("next");
            }
        }
    };
    // Clear search when closed
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen && searchAddon) {
            searchAddon.clearDecorations();
        }
    });
    if (!isOpen)
        return null;
    return <div class="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background p-1.5 shadow-lg">
      <input ref={inputRef} type="text" value={query} onChange={function (e) { return setQuery(e.target.value); }} onKeyDown={handleKeyDown} placeholder="Find..." class="w-40 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"/>
      {matchCount !== null && <span class="px-1 text-xs text-muted-foreground">
          {matchCount} matches
        </span>}
      <button onClick={function () { return handleSearch("prev"); }} class="rounded p-1 hover:bg-muted" title="Previous match (Shift+Enter)">
        <lucide_solid_1.ChevronUp class="h-4 w-4 text-muted-foreground"/>
      </button>
      <button onClick={function () { return handleSearch("next"); }} class="rounded p-1 hover:bg-muted" title="Next match (Enter)">
        <lucide_solid_1.ChevronDown class="h-4 w-4 text-muted-foreground"/>
      </button>
      <button onClick={onClose} class="rounded p-1 hover:bg-muted" title="Close (Escape)">
        <lucide_solid_1.X class="h-4 w-4 text-muted-foreground"/>
      </button>
    </div>;
}
