"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSearchBar = ChatSearchBar;
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
var chat_search_atoms_1 = require("./chat-search-atoms");
var chat_search_utils_1 = require("./chat-search-utils");
function ChatSearchBar(_a) {
    var messages = _a.messages, className = _a.className, topOffset = _a.topOffset;
    var isOpen = chat_search_atoms_1.chatSearchOpenAtom[0];
    var inputValue = chat_search_atoms_1.chatSearchInputAtom[0], setInputValue = chat_search_atoms_1.chatSearchInputAtom[1];
    var setSearchQuery = chat_search_atoms_1.chatSearchQueryAtom[1];
    var setMatches = chat_search_atoms_1.chatSearchMatchesAtom[1];
    var setCurrentIndex = chat_search_atoms_1.chatSearchCurrentIndexAtom[1];
    var countInfo = chat_search_atoms_1.chatSearchCountInfoAtom;
    var inputRef;
    // Track if search has completed (to avoid showing "No results" while typing)
    var _b = (0, solid_js_1.createSignal)(false), searchCompleted = _b[0], setSearchCompleted = _b[1];
    // Focus input when search opens
    (0, solid_js_1.createEffect)(function () {
        if (isOpen() && inputRef) {
            inputRef.focus();
            inputRef.select();
        }
    });
    // Handle select all event (when Cmd+F is pressed while search is already open)
    (0, solid_js_1.onMount)(function () {
        var handleSelectAll = function () {
            if (inputRef) {
                inputRef.focus();
                inputRef.select();
            }
        };
        window.addEventListener("chat-search-select-all", handleSelectAll);
        (0, solid_js_1.onCleanup)(function () { return window.removeEventListener("chat-search-select-all", handleSelectAll); });
    });
    // Debounced search
    (0, solid_js_1.createEffect)(function () {
        // Mark search as not completed when input changes
        setSearchCompleted(false);
        var timeout = setTimeout(function () {
            var value = inputValue();
            setSearchQuery(value);
            if (!value.trim()) {
                setMatches([]);
                setCurrentIndex(0);
                setSearchCompleted(true);
                return;
            }
            // Extract and search
            var extracted = (0, chat_search_utils_1.extractSearchableText)(messages);
            var matches = (0, chat_search_utils_1.findMatches)(extracted, value);
            setMatches(matches);
            setCurrentIndex(0);
            setSearchCompleted(true);
        }, 200);
        (0, solid_js_1.onCleanup)(function () { return clearTimeout(timeout); });
    });
    // Keyboard navigation
    var handleKeyDown = function (e) {
        if (e.key === "Escape") {
            e.preventDefault();
            (0, chat_search_atoms_1.closeSearchAtom)();
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            if (e.shiftKey) {
                (0, chat_search_atoms_1.goToPrevMatchAtom)();
            }
            else {
                (0, chat_search_atoms_1.goToNextMatchAtom)();
            }
        }
        else if (e.key === "ArrowDown" || e.key === "g" && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            (0, chat_search_atoms_1.goToNextMatchAtom)();
        }
        else if (e.key === "ArrowUp" || e.key === "g" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            (0, chat_search_atoms_1.goToPrevMatchAtom)();
        }
    };
    // Focus input when clicking on container (but not on buttons)
    var handleContainerClick = function (e) {
        // Only focus if clicking directly on container or non-interactive elements
        var target = e.target;
        if (!target.closest("button")) {
            inputRef === null || inputRef === void 0 ? void 0 : inputRef.focus();
        }
    };
    return <solid_js_1.Show when={isOpen()}>
    <div class={(0, utils_1.cn)("absolute right-3 left-3 z-50", "flex items-center gap-1 px-2 py-1.5", "bg-popover border border-border rounded-lg shadow-lg", "animate-in fade-in-0 slide-in-from-top-2 duration-150", "max-w-[340px] ml-auto cursor-text", className)} style={{ top: topOffset ? topOffset : "0px" }} onClick={handleContainerClick}>
      {/* Search input - grows to fill space, shrinks on narrow screens */}
      <input ref={function (el) { return inputRef = el; }} type="text" value={inputValue()} onInput={function (e) { return setInputValue(e.currentTarget.value); }} onKeyDown={handleKeyDown} placeholder="Search..." class={(0, utils_1.cn)("flex-1 min-w-[80px] h-7 px-2 text-sm bg-transparent", "border-none outline-none", "placeholder:text-muted-foreground/60")} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}/>

      {/* Results area - fixed width: shows counter+arrows OR "No results" */}
      <div class="w-[128px] flex items-center justify-end shrink-0">
        {countInfo().total > 0 ? <>
            <span class="text-xs text-muted-foreground mr-1">
              {"".concat(countInfo().current, " of ").concat(countInfo().total)}
            </span>
            <button type="button" class="h-6 w-6 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={function () {
                (0, chat_search_atoms_1.goToPrevMatchAtom)();
                inputRef === null || inputRef === void 0 ? void 0 : inputRef.focus();
            }} title="Previous match (Shift+Enter)">
              <lucide_solid_1.ChevronUp class="h-4 w-4"/>
            </button>
            <button type="button" class="h-6 w-6 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={function () {
                (0, chat_search_atoms_1.goToNextMatchAtom)();
                inputRef === null || inputRef === void 0 ? void 0 : inputRef.focus();
            }} title="Next match (Enter)">
              <lucide_solid_1.ChevronDown class="h-4 w-4"/>
            </button>
          </> : inputValue().trim() && searchCompleted() && <span class="text-xs text-muted-foreground">No results</span>}
      </div>

      {/* Close button - fixed width */}
      <button type="button" class="h-6 w-6 shrink-0 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={function () { return (0, chat_search_atoms_1.closeSearchAtom)(); }} title="Close (Esc)">
        <lucide_solid_1.X class="h-4 w-4"/>
      </button>
    </div>
    </solid_js_1.Show>;
}
