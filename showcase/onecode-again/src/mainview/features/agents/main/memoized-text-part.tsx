import { createEffect, createSignal, onCleanup } from "solid-js";
import { cn } from "../../../lib/utils";
import { MemoizedMarkdown } from "../../../components/chat-markdown-renderer";
import { useSearchQuery, useSearchHighlight } from "../search";
interface MemoizedTextPartProps {
	text: string;
	messageId: string;
	partIndex: number;
	isFinalText: boolean;
	visibleStepsCount: number;
	isStreaming?: boolean;
}
// Helper function to highlight text in DOM using TreeWalker
function highlightTextInDom(container: HTMLElement, searchText: string, currentMatchIndex: number | null = null) {
	// Remove existing highlights first
	const existingHighlights = container.querySelectorAll(".search-highlight");
	existingHighlights.forEach((el) => {
		const parent = el.parentNode;
		if (parent) {
			parent.replaceChild(document.createTextNode(el.textContent || ""), el);
			parent.normalize();
		}
	});
	if (!searchText) return;
	const lowerSearch = searchText.toLowerCase();
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
	const textNodes: Text[] = [];
	let node: Text | null;
	while (node = walker.nextNode() as Text | null) {
		if (node.nodeValue && node.nodeValue.toLowerCase().includes(lowerSearch)) {
			textNodes.push(node);
		}
	}
	let matchCounter = 0;
	for (const textNode of textNodes) {
		const text = textNode.nodeValue || "";
		const lowerText = text.toLowerCase();
		let lastIndex = 0;
		const fragments: (string | HTMLElement)[] = [];
		let searchIndex = 0;
		while ((searchIndex = lowerText.indexOf(lowerSearch, lastIndex)) !== -1) {
			if (searchIndex > lastIndex) {
				fragments.push(text.slice(lastIndex, searchIndex));
			}
			const mark = document.createElement("mark");
			mark.class = "search-highlight";
			mark.textContent = text.slice(searchIndex, searchIndex + searchText.length);
			if (currentMatchIndex !== null && matchCounter === currentMatchIndex) {
				mark.classList.add("search-highlight-current");
			}
			matchCounter++;
			fragments.push(mark);
			lastIndex = searchIndex + searchText.length;
		}
		if (lastIndex < text.length) {
			fragments.push(text.slice(lastIndex));
		}
		if (fragments.length > 0) {
			const parent = textNode.parentNode;
			if (parent) {
				fragments.forEach((frag) => {
					if (typeof frag === "string") {
						parent.insertBefore(document.createTextNode(frag), textNode);
					} else {
						parent.insertBefore(frag, textNode);
					}
				});
				parent.removeChild(textNode);
			}
		}
	}
}
// Inner component - pure render, no hooks that cause re-renders
// Only re-renders when props change (text, styling props)
function MemoizedTextPartInner({ text, messageId, partIndex, isFinalText, visibleStepsCount }: Omit<MemoizedTextPartProps, "isStreaming">) {
	if (!text?.trim()) return null;
	return <div class={cn("text-foreground px-2", isFinalText && visibleStepsCount > 0 && "pt-3 border-t border-border/50")} data-message-id={messageId} data-part-index={partIndex} data-part-type="text">
      {isFinalText && visibleStepsCount > 0 && <div class="text-[12px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-1">
          Response
        </div>}
      <MemoizedMarkdown content={text} id={`${messageId}-${partIndex}`} size="sm" />
    </div>;
}
// Outer component - handles search highlighting via DOM manipulation
// This may re-render when search changes, but the inner MemoizedTextPartInner won't
// because its props (text, etc.) haven't changed
export function MemoizedTextPart({ text, messageId, partIndex, isFinalText, visibleStepsCount, isStreaming = false }: MemoizedTextPartProps) {
	const [containerRef, setContainerRef] = createSignal<HTMLDivElement>(null);
	// Search hooks - when search is closed, these return empty/null values
	// and don't cause re-renders (SearchHighlightProvider returns static context)
	const searchQuery = useSearchQuery();
	const highlights = useSearchHighlight(messageId, partIndex, "text");
	const currentHighlight = highlights.find((h) => h.isCurrent);
	const currentMatchIndexInPart = currentHighlight?.indexInPart ?? null;
	// Apply DOM-based highlighting after render
	// Skip during streaming to avoid performance issues
	createEffect(() => {
		const el = containerRef();
		if (!el || isStreaming || !searchQuery) return;
		highlightTextInDom(el, searchQuery, currentMatchIndexInPart);
		onCleanup(() => {
			const currentEl = containerRef();
			if (currentEl) {
				const existingHighlights = currentEl.querySelectorAll(".search-highlight");
				existingHighlights.forEach((el) => {
					const parent = el.parentNode;
					if (parent) {
						parent.replaceChild(document.createTextNode(el.textContent || ""), el);
						parent.normalize();
					}
				});
			}
		});
	});
	if (!text?.trim()) return null;
	return <div ref={containerRef}>
      <MemoizedTextPartInner text={text} messageId={messageId} partIndex={partIndex} isFinalText={isFinalText} visibleStepsCount={visibleStepsCount} />
    </div>;
}
