import { createContext, createMemo, Show, useContext, type ParentProps } from "solid-js";
import { chatSearchOpenAtom, chatSearchQueryAtom, highlightRangesAtomFamily, type HighlightRange } from "./chat-search-atoms";
// ============================================================================
// CONTEXT TYPES
// ============================================================================
interface SearchHighlightContextValue {
	query: () => string;
	isSearchActive: () => boolean;
	getHighlightRanges: (messageId: string, partIndex: number, partType: string) => HighlightRange[];
}
const SearchHighlightContext = createContext<SearchHighlightContextValue | null>(null);
// ============================================================================
// PROVIDER
// ============================================================================
// Empty context value when search is closed - stable reference to avoid re-renders
const EMPTY_HIGHLIGHT_RANGES: HighlightRange[] = [];
const emptyGetHighlightRanges = () => EMPTY_HIGHLIGHT_RANGES;
const CLOSED_SEARCH_VALUE: SearchHighlightContextValue = {
	query: () => "",
	isSearchActive: () => false,
	getHighlightRanges: emptyGetHighlightRanges
};
export function SearchHighlightProvider(props: ParentProps) {
	// Only subscribe to isOpen first - this is the gate
	const [isOpen] = chatSearchOpenAtom;
	// Use Show for proper SolidJS reactivity (if/return doesn't re-run)
	return <Show when={isOpen()} fallback={
		<SearchHighlightContext.Provider value={CLOSED_SEARCH_VALUE}>
			{props.children}
		</SearchHighlightContext.Provider>
	}>
		<SearchHighlightProviderActive>
			{props.children}
		</SearchHighlightProviderActive>
	</Show>;
}
// Separate component for when search is active
// This isolates the subscriptions to query/matches/currentMatch
function SearchHighlightProviderActive(props: ParentProps) {
	const [query] = chatSearchQueryAtom;
	const isSearchActive = createMemo(() => query().trim().length > 0);
	const getHighlightRanges = (messageId: string, partIndex: number, partType: string): HighlightRange[] => {
		if (!isSearchActive()) return EMPTY_HIGHLIGHT_RANGES;
		const key = `${messageId}:${partIndex}:${partType}`;
		return highlightRangesAtomFamily(key)();
	};
	const value = createMemo(() => ({
		query,
		isSearchActive,
		getHighlightRanges
	}));
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
export function useSearchHighlightContext() {
	return useContext(SearchHighlightContext);
}
/**
* Hook to get highlight ranges for a specific message part
* Returns empty array if search is not active or no matches
*/
export function useSearchHighlight(messageId: string, partIndex: number, partType: string): HighlightRange[] {
	const context = useContext(SearchHighlightContext);
	if (!context || !context.isSearchActive()) {
		return [];
	}
	return context.getHighlightRanges(messageId, partIndex, partType);
}
/**
* Hook to check if search is currently active
*/
export function useIsSearchActive(): boolean {
	const context = useContext(SearchHighlightContext);
	return context?.isSearchActive() ?? false;
}
/**
* Hook to get the current search query
*/
export function useSearchQuery(): string {
	const context = useContext(SearchHighlightContext);
	return context?.query() ?? "";
}
