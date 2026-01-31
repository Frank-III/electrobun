import { createSignal, createEffect, onCleanup, Show, createMemo } from "solid-js";
import { cn } from "../../../lib/utils";
import { TypewriterText } from "../../../components/ui/typewriter-text";
import { justCreatedIdsAtom } from "../atoms";
interface ChatTitleEditorProps {
	name: string;
	placeholder?: string;
	onSave: (newName: string) => Promise<void>;
	isMobile?: boolean;
	disabled?: boolean;
	chatId?: string;
	hasMessages?: boolean;
}
export function ChatTitleEditor(props: ChatTitleEditorProps) {
	const placeholder = () => props.placeholder ?? "New Chat";
	const isMobile = () => props.isMobile ?? false;
	const disabled = () => props.disabled ?? false;
	const hasMessages = () => props.hasMessages ?? false;
	
	const [isEditing, setIsEditing] = createSignal(false);
	const [editValue, setEditValue] = createSignal(props.name);
	const [isSaving, setIsSaving] = createSignal(false);
	let inputRef: HTMLInputElement | undefined;
	let containerRef: HTMLDivElement | undefined;
	const justCreatedIds = justCreatedIdsAtom[0];
	createEffect(() => {
		if (!isEditing()) {
			setEditValue(props.name);
		}
	});
	createEffect(() => {
		if (isEditing() && inputRef) {
			const timeoutId = setTimeout(() => {
				if (inputRef) {
					inputRef.focus();
					inputRef.select();
				}
			}, 0);
			onCleanup(() => clearTimeout(timeoutId));
		}
	});
	const handleSave = async () => {
		const trimmedValue = editValue().trim();
		if (!trimmedValue || trimmedValue === props.name) {
			setEditValue(props.name);
			setIsEditing(false);
			return;
		}
		setIsSaving(true);
		try {
			await props.onSave(trimmedValue);
			setIsEditing(false);
		} catch {
			setEditValue(props.name);
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};
	const handleCancel = () => {
		setEditValue(props.name);
		setIsEditing(false);
	};
	createEffect(() => {
		if (!isEditing()) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef && !containerRef.contains(event.target as Node)) {
				handleSave();
			}
		};
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);
		onCleanup(() => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		});
	});
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			handleCancel();
		}
	};
	const isJustCreated = createMemo(() => props.chatId ? justCreatedIds().has(props.chatId) : false);
	const hasRealName = createMemo(() => props.name && props.name !== placeholder());
	const handleClick = () => {
		if (!disabled() && !isEditing() && hasRealName()) {
			setIsEditing(true);
		}
	};
	const heightClass = isMobile() ? "h-7" : "h-7";
	return <div ref={(el) => containerRef = el} class={cn("max-w-2xl mx-auto px-4", heightClass)}>
		<Show when={isEditing()} fallback={
			<div onClick={handleClick} class={cn("text-left w-full h-full", isMobile() ? "text-base" : "text-lg", "font-medium", hasRealName() ? "text-foreground cursor-pointer" : "cursor-default")}>
				<span class="block truncate">
					<TypewriterText text={props.name} placeholder={placeholder()} id={props.chatId} isJustCreated={isJustCreated()} showPlaceholder={hasMessages()} />
				</span>
			</div>
		}>
			<input ref={(el) => inputRef = el} type="text" value={editValue()} onInput={(e) => setEditValue(e.currentTarget.value)} onKeyDown={handleKeyDown} disabled={isSaving()} placeholder={placeholder()} class={cn("w-full h-full bg-transparent border-0 outline-none", isMobile() ? "text-base" : "text-lg", "font-medium text-foreground")} />
		</Show>
	</div>;
}
