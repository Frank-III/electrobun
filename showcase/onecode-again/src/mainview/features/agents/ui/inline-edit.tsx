import { Input } from "../../../components/ui/input";
import { createEffect, onCleanup, Show } from "solid-js";
interface InlineEditProps {
	value: string;
	onChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isEditing: boolean;
	disabled?: boolean;
	class?: string;
	placeholder?: string;
}
export function InlineEdit(props: InlineEditProps) {
	let inputRef: HTMLInputElement | undefined;
	let currentOnSave = props.onSave;
	let currentOnCancel = props.onCancel;
	createEffect(() => {
		currentOnSave = props.onSave;
		currentOnCancel = props.onCancel;
	});
	createEffect(() => {
		if (props.isEditing && inputRef) {
			const timeoutId = setTimeout(() => {
				if (inputRef) {
					inputRef.focus();
					inputRef.select();
				}
			}, 0);
			onCleanup(() => clearTimeout(timeoutId));
		}
	});
	createEffect(() => {
		if (!props.isEditing) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (inputRef && !inputRef.contains(event.target as Node)) {
				currentOnSave();
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
			currentOnSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			currentOnCancel();
		}
	};
	return <Show when={props.isEditing}>
		<Input ref={(el) => inputRef = el} value={props.value} onInput={(e) => props.onChange(e.currentTarget.value)} class={`ring-1 ring-[#3182ED] focus-visible:ring-1 focus-visible:ring-[#3182ED] focus-visible:ring-offset-0 rounded-[2px] shadow-none min-w-0 text-foreground border-0 h-auto px-1 py-0 leading-4 inline-flex ${props.class || ""}`} onKeyDown={handleKeyDown} disabled={props.disabled} placeholder={props.placeholder} />
	</Show>;
}
