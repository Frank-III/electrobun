import { createEffect, createSignal, onCleanup, Show, splitProps, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { useTextSelection, type TextSelectionSource } from "../context/text-selection-context";
interface TextSelectionPopoverProps {
	onAddToContext: (text: string, source: TextSelectionSource) => void;
	onQuickComment?: (text: string, source: TextSelectionSource, rect: DOMRect) => void;
	onFocusInput?: () => void;
}
export function TextSelectionPopover(props: TextSelectionPopoverProps) {
	const [local] = splitProps(props, ["onAddToContext", "onQuickComment", "onFocusInput"]);
	const { selectedText, source, selectionRect, clearSelection } = useTextSelection();
	const [isVisible, setIsVisible] = createSignal(false);
	const [isMouseDown, setIsMouseDown] = createSignal(false);
	let popoverRef: HTMLDivElement | undefined;
	const handleAddToContext = () => {
		if (selectedText && source) {
			local.onAddToContext(selectedText, source);
			clearSelection();
			setIsVisible(false);
			// Focus the chat input after adding to context
			requestAnimationFrame(() => {
				local.onFocusInput?.();
			});
		}
	};
	const handleQuickComment = () => {
		if (selectedText && source && selectionRect && local.onQuickComment) {
			local.onQuickComment(selectedText, source, selectionRect);
			setIsVisible(false);
		}
	};
	// Track mouse down/up to know when selection is complete
	createEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			// Ignore clicks on the popover itself
			if (popoverRef?.contains(e.target as Node)) {
				return;
			}
			setIsMouseDown(true);
			setIsVisible(false);
		};
		const handleMouseUp = (e: MouseEvent) => {
			// Ignore clicks on the popover itself
			if (popoverRef?.contains(e.target as Node)) {
				return;
			}
			setIsMouseDown(false);
		};
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);
		onCleanup(() => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);
		});
	});
	// Show popover only when mouse is up and we have a valid selection
	createEffect(() => {
		if (!isMouseDown && selectedText && source && selectionRect) {
			setIsVisible(true);
		} else if (!selectedText || !source || !selectionRect) {
			setIsVisible(false);
		}
	});
	const popoverWidth = 120;
	const popoverHeight = 28;

	const computedPosition = () => {
		if (!selectionRect) return { top: 0, left: 0, showAbove: true };
		const viewportWidth = window.innerWidth;
		let left = selectionRect.left + selectionRect.width / 2;
		left = Math.max(popoverWidth / 2 + 8, Math.min(left, viewportWidth - popoverWidth / 2 - 8));
		const popoverWidthEstimate = local.onQuickComment && (source?.type === "diff" || source?.type === "tool-edit") ? 160 : 100;
		const centeredLeft = left - popoverWidthEstimate / 2;
		const spaceAbove = selectionRect.top;
		const showAbove = spaceAbove > popoverHeight + 8;
		const top = showAbove ? selectionRect.top - popoverHeight - 4 : selectionRect.bottom + 4;
		return { top, left: centeredLeft, showAbove };
	};

	const style = (): JSX.CSSProperties => ({
		position: "fixed",
		top: `${computedPosition().top}px`,
		left: `${computedPosition().left}px`,
		"z-index": 100000
	});

	const animationClass = () => computedPosition().showAbove
		? "animate-in fade-in-0 zoom-in-95 origin-bottom duration-100"
		: "animate-in fade-in-0 zoom-in-95 origin-top duration-100";

	return (
		<Show when={isVisible() && selectedText && source && selectionRect}>
			<Portal mount={document.body}>
				<div ref={el => popoverRef = el} style={style()} class={animationClass()}>
					<div class="flex items-center gap-0.5 rounded-md border border-border bg-popover px-0.5 py-0.5 shadow-lg">
						<button onClick={handleAddToContext} class="rounded px-1.5 py-0.5 text-xs text-popover-foreground hover:bg-white/15 transition-colors duration-100 active:scale-[0.97]">
							Add to context
						</button>
						<Show when={local.onQuickComment && (source!.type === "diff" || source!.type === "tool-edit")}>
							<div class="w-px h-3 bg-border" />
							<button onClick={handleQuickComment} class="rounded px-1.5 py-0.5 text-xs text-popover-foreground hover:bg-white/15 transition-colors duration-100 active:scale-[0.97]">
								Reply
							</button>
						</Show>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
