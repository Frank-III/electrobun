import { ChevronDown, ChevronUp, X } from "lucide-solid";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { leading, debounce } from "@solid-primitives/scheduled";
import { cn } from "../../../lib/utils";
import { chatSearchCountInfoAtom, chatSearchInputAtom, chatSearchMatchesAtom, chatSearchOpenAtom, chatSearchQueryAtom, chatSearchCurrentIndexAtom, closeSearchAtom, goToNextMatchAtom, goToPrevMatchAtom } from "./chat-search-atoms";
import { extractSearchableText, findMatches } from "./chat-search-utils";
import type { Message } from "../stores/message-store";
interface ChatSearchBarProps {
	messages: Message[];
	class?: string;
	topOffset?: string;
}
export function ChatSearchBar(props: ChatSearchBarProps) {
	const [isOpen] = chatSearchOpenAtom;
	const [inputValue, setInputValue] = chatSearchInputAtom;
	const [, setSearchQuery] = chatSearchQueryAtom;
	const [, setMatches] = chatSearchMatchesAtom;
	const [, setCurrentIndex] = chatSearchCurrentIndexAtom;
	const countInfo = chatSearchCountInfoAtom;
	let inputRef: HTMLInputElement | undefined;
	// Track if search has completed (to avoid showing "No results" while typing)
	const [searchCompleted, setSearchCompleted] = createSignal(false);
	// Focus input when search opens
	createEffect(() => {
		if (isOpen() && inputRef) {
			inputRef.focus();
			inputRef.select();
		}
	});
	// Handle select all event (when Cmd+F is pressed while search is already open)
	onMount(() => {
		const handleSelectAll = () => {
			if (inputRef) {
				inputRef.focus();
				inputRef.select();
			}
		};
		window.addEventListener("chat-search-select-all", handleSelectAll);
		onCleanup(() => window.removeEventListener("chat-search-select-all", handleSelectAll));
	});
	// Debounced search - use createMemo with debounced setter for reactive debouncing
	const performSearch = debounce((value: string) => {
		setSearchQuery(value);
		if (!value.trim()) {
			setMatches([]);
			setCurrentIndex(0);
			setSearchCompleted(true);
			return;
		}
		// Extract and search
		const extracted = extractSearchableText(props.messages);
		const matches = findMatches(extracted, value);
		setMatches(matches);
		setCurrentIndex(0);
		setSearchCompleted(true);
	}, 200);

	// Track input changes and trigger debounced search
	createEffect(() => {
		const value = inputValue();
		// Mark search as not completed when input changes
		setSearchCompleted(false);
		performSearch(value);
		// Cleanup pending debounce on effect re-run or unmount
		onCleanup(() => performSearch.clear());
	});
	// Keyboard navigation
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			e.preventDefault();
			closeSearchAtom();
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (e.shiftKey) {
				goToPrevMatchAtom();
			} else {
				goToNextMatchAtom();
			}
		} else if (e.key === "ArrowDown" || e.key === "g" && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			goToNextMatchAtom();
		} else if (e.key === "ArrowUp" || e.key === "g" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			goToPrevMatchAtom();
		}
	};
	// Focus input when clicking on container (but not on buttons)
	const handleContainerClick = (e: MouseEvent) => {
		// Only focus if clicking directly on container or non-interactive elements
		const target = e.target as HTMLElement;
		if (!target.closest("button")) {
			inputRef?.focus();
		}
	};
	return <Show when={isOpen()}>
    <div class={cn("absolute right-3 left-3 z-50", "flex items-center gap-1 px-2 py-1.5", "bg-popover border border-border rounded-lg shadow-lg", "animate-in fade-in-0 slide-in-from-top-2 duration-150", "max-w-[340px] ml-auto cursor-text", props.class)} style={{ top: props.topOffset ? props.topOffset : "0px" }} onClick={handleContainerClick}>
      {	/* Search input - grows to fill space, shrinks on narrow screens */}
      <input ref={(el) => inputRef = el} type="text" value={inputValue()} onInput={(e) => setInputValue((e.currentTarget as HTMLInputElement).value)} onKeyDown={handleKeyDown} placeholder="Search..." class={cn("flex-1 min-w-[80px] h-7 px-2 text-sm bg-transparent", "border-none outline-none", "placeholder:text-muted-foreground/60")} autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck={false} />

      { /* Results area - fixed width: shows counter+arrows OR "No results" */}
      <div class="w-[128px] flex items-center justify-end shrink-0">
        <Show
          when={countInfo().total > 0}
          fallback={
            <Show when={inputValue().trim() && searchCompleted()}>
              <span class="text-xs text-muted-foreground">No results</span>
            </Show>
          }
        >
          <span class="text-xs text-muted-foreground mr-1">
            {`${countInfo().current} of ${countInfo().total}`}
          </span>
          <button type="button" class="h-6 w-6 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={() => {
            goToPrevMatchAtom();
            inputRef?.focus();
          }} title="Previous match (Shift+Enter)">
            <ChevronUp class="h-4 w-4" />
          </button>
          <button type="button" class="h-6 w-6 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={() => {
            goToNextMatchAtom();
            inputRef?.focus();
          }} title="Next match (Enter)">
            <ChevronDown class="h-4 w-4" />
          </button>
        </Show>
      </div>

      {	/* Close button - fixed width */}
      <button type="button" class="h-6 w-6 shrink-0 flex items-center justify-center rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-150 ease-out" onClick={() => closeSearchAtom()} title="Close (Esc)">
        <X class="h-4 w-4" />
      </button>
    </div>
    </Show>;
 }
