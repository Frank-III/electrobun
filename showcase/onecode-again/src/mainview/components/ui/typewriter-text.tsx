"use client";
import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import { cn } from "../../lib/utils";

interface TypewriterTextProps {
	text: string;
	placeholder?: string;
	id?: string;
	class?: string;
	isJustCreated?: boolean;
	showPlaceholder?: boolean;
}

export function TypewriterText(props: TypewriterTextProps) {
	const {
		text,
		placeholder = "New workspace",
		id,
		class: className,
		isJustCreated = false,
		showPlaceholder = false
	} = props;

	const [isTyping, setIsTyping] = createSignal(false);
	const [typedLength, setTypedLength] = createSignal(0);
	const [hasAnimated, setHasAnimated] = createSignal(false);
	let prevId = id;
	let initialText = text;

	createEffect(() => {
		if (id !== prevId) {
			setIsTyping(false);
			setTypedLength(0);
			setHasAnimated(false);
			initialText = text;
			prevId = id;
		}
	});

	createEffect(() => {
		if (hasAnimated()) return;
		const textChanged = text !== initialText;
		if (isJustCreated && textChanged) {
			setIsTyping(true);
			setTypedLength(1);
			setHasAnimated(true);
		}
	});

	createEffect(() => {
		if (!isTyping() || !text) return;
		if (typedLength() < text.length) {
			const timeout = setTimeout(() => {
				setTypedLength((prev) => prev + 1);
			}, 30);
			onCleanup(() => clearTimeout(timeout));
		} else {
			setIsTyping(false);
		}
	});

	const hasRealName = () => text && text !== placeholder && text !== initialText;
	const isWaitingForName = () => isJustCreated && showPlaceholder && !hasAnimated() && !hasRealName();

	return (
		<Show
			when={text && text !== placeholder}
			fallback={
				<Show when={showPlaceholder || isWaitingForName()}>
					<span class={cn("text-muted-foreground/50", className)}>{placeholder}</span>
				</Show>
			}
		>
			<Show when={!isTyping()} fallback={<span class={className}>{text.slice(0, typedLength())}</span>}>
				<span class={className}>{text}</span>
			</Show>
		</Show>
	);
}
