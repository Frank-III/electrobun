import { createSignal, createEffect } from "solid-js";
import type { SearchAddon } from "@xterm/addon-search";
import { X, ChevronUp, ChevronDown } from "lucide-solid";
interface TerminalSearchProps {
	searchAddon: SearchAddon | null;
	isOpen: boolean;
	onClose: () => void;
}
export function TerminalSearch({ searchAddon, isOpen, onClose }: TerminalSearchProps) {
	const [query, setQuery] = createSignal("");
	const [matchCount, setMatchCount] = createSignal(null);
	const [inputRef, setInputRef] = createSignal<HTMLInputElement>(null);
	// Focus input when opened
	createEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	});
	// Handle search
	const handleSearch = (direction: "next" | "prev") => {
		if (!searchAddon || !query) return;
		if (direction === "next") {
			searchAddon.findNext(query, {
				caseSensitive: false,
				regex: false
			});
		} else {
			searchAddon.findPrevious(query, {
				caseSensitive: false,
				regex: false
			});
		}
	};
	// Search on query change
	createEffect(() => {
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
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose();
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (e.shiftKey) {
				handleSearch("prev");
			} else {
				handleSearch("next");
			}
		}
	};
	// Clear search when closed
	createEffect(() => {
		if (!isOpen && searchAddon) {
			searchAddon.clearDecorations();
		}
	});
	if (!isOpen) return null;
	return <div class="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background p-1.5 shadow-lg">
      <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Find..." class="w-40 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" />
      {matchCount !== null && <span class="px-1 text-xs text-muted-foreground">
          {matchCount} matches
        </span>}
      <button onClick={() => handleSearch("prev")} class="rounded p-1 hover:bg-muted" title="Previous match (Shift+Enter)">
        <ChevronUp class="h-4 w-4 text-muted-foreground" />
      </button>
      <button onClick={() => handleSearch("next")} class="rounded p-1 hover:bg-muted" title="Next match (Enter)">
        <ChevronDown class="h-4 w-4 text-muted-foreground" />
      </button>
      <button onClick={onClose} class="rounded p-1 hover:bg-muted" title="Close (Escape)">
        <X class="h-4 w-4 text-muted-foreground" />
      </button>
    </div>;
}
