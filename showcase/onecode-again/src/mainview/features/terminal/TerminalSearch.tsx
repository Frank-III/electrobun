import { createSignal, createEffect, Show } from "solid-js";
import type { SearchAddon } from "@xterm/addon-search";
import { X, ChevronUp, ChevronDown } from "lucide-solid";
interface TerminalSearchProps {
	searchAddon: SearchAddon | undefined;
	isOpen: boolean;
	onClose: () => void;
}
export function TerminalSearch(props: TerminalSearchProps) {
	const [query, setQuery] = createSignal("");
	const [matchCount, setMatchCount] = createSignal<number | null>(null);
	let inputRef: HTMLInputElement | undefined;
	// Focus input when opened
	createEffect(() => {
		if (props.isOpen && inputRef) {
			inputRef.focus();
			inputRef.select();
		}
	});
	// Handle search
	const handleSearch = (direction: "next" | "prev") => {
		if (!props.searchAddon || !query()) return;
		if (direction === "next") {
			props.searchAddon.findNext(query(), {
				caseSensitive: false,
				regex: false
			});
		} else {
			props.searchAddon.findPrevious(query(), {
				caseSensitive: false,
				regex: false
			});
		}
	};
	// Search on query change
	createEffect(() => {
		if (!props.searchAddon || !query()) {
			setMatchCount(null);
			return;
		}
		// Trigger search
		props.searchAddon.findNext(query(), {
			caseSensitive: false,
			regex: false
		});
	});
	// Handle keyboard shortcuts
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			props.onClose();
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
		if (!props.isOpen && props.searchAddon) {
			props.searchAddon.clearDecorations();
		}
	});
	return <Show when={props.isOpen}>
      <div class="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background p-1.5 shadow-lg">
        <input ref={el => inputRef = el} type="text" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} onKeyDown={handleKeyDown} placeholder="Find..." class="w-40 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" />
        <Show when={matchCount() !== null}>
          <span class="px-1 text-xs text-muted-foreground">
            {matchCount()} matches
          </span>
        </Show>
        <button onClick={() => handleSearch("prev")} class="rounded p-1 hover:bg-muted" title="Previous match (Shift+Enter)">
          <ChevronUp class="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={() => handleSearch("next")} class="rounded p-1 hover:bg-muted" title="Next match (Enter)">
          <ChevronDown class="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={props.onClose} class="rounded p-1 hover:bg-muted" title="Close (Escape)">
          <X class="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </Show>;
}
