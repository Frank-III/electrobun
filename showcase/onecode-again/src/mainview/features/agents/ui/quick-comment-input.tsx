"use client";
import { createSignal, createEffect, onCleanup, createMemo, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { type TextSelectionSource } from "../context/text-selection-context";
import { cn } from "../../../lib/utils";
interface QuickCommentInputProps {
	selectedText: string;
	source: TextSelectionSource;
	rect: DOMRect;
	onSubmit: (comment: string, selectedText: string, source: TextSelectionSource) => void;
	onCancel: () => void;
}
export function QuickCommentInput(props: QuickCommentInputProps) {
	const [comment, setComment] = createSignal("");
	let inputRef: HTMLInputElement | undefined;
	let containerRef: HTMLDivElement | undefined;
	createEffect(() => {
		const timer = setTimeout(() => {
			inputRef?.focus();
		}, 10);
		onCleanup(() => clearTimeout(timer));
	});
	createEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef && !containerRef.contains(e.target as Node)) {
				props.onCancel();
			}
		};
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);
		onCleanup(() => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		});
	});
	const handleSubmit = () => {
		const trimmed = comment().trim();
		if (trimmed) {
			props.onSubmit(trimmed, props.selectedText, props.source);
		}
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			props.onCancel();
		}
	};
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const inputWidth = 320;
	const inputHeight = 90;
	const position = createMemo(() => {
		let left = props.rect.left + props.rect.width / 2;
		left = Math.max(inputWidth / 2 + 16, Math.min(left, viewportWidth - inputWidth / 2 - 16));
		const centeredLeft = left - inputWidth / 2;
		const spaceBelow = viewportHeight - props.rect.bottom;
		const showBelow = spaceBelow > inputHeight + 8;
		const top = showBelow ? props.rect.bottom + 4 : props.rect.top - inputHeight - 4;
		return { top, left: centeredLeft, showBelow };
	});
	const style = (): JSX.CSSProperties => ({
		position: "fixed",
		top: `${position().top}px`,
		left: `${position().left}px`,
		width: `${inputWidth}px`,
		"z-index": 100001
	});
	const preview = createMemo(() => props.selectedText.length > 60 ? props.selectedText.slice(0, 60) + "..." : props.selectedText);
	const sourceLabel = createMemo(() => props.source.type === "diff" || props.source.type === "tool-edit" ? `${props.source.filePath.split("/").pop()}${props.source.type === "diff" && props.source.lineNumber ? `:${props.source.lineNumber}` : ""}` : "from chat");
	const animationClass = createMemo(() => position().showBelow ? "animate-in fade-in-0 zoom-in-95 origin-top duration-100" : "animate-in fade-in-0 zoom-in-95 origin-bottom duration-100");
	return <Portal>
		<div ref={(el) => containerRef = el} style={style()} class={animationClass()}>
			<div class="rounded-md bg-popover border border-border shadow-lg overflow-hidden">
				<div class="px-2.5 py-1.5 border-b border-border bg-muted/30">
					<div class="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
						<span>Replying to</span>
						<span class="font-medium text-foreground/70">{sourceLabel()}</span>
					</div>
					<div class="text-xs text-muted-foreground font-mono line-clamp-2">
						{preview()}
					</div>
				</div>
				<div class="p-1.5">
					<div class="flex items-center gap-1.5">
						<input ref={(el) => inputRef = el} type="text" value={comment()} onInput={(e) => setComment(e.currentTarget.value)} onKeyDown={handleKeyDown} placeholder="Add your reply..." class="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground px-1" />
						<button onClick={handleSubmit} disabled={!comment().trim()} class={cn("shrink-0 px-2 py-0.5 text-xs font-medium rounded transition-colors", comment().trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	</Portal>;
}
