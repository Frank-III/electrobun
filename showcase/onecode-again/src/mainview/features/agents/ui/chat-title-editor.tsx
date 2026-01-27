"use client";
import { createSignal, createEffect } from "solid-js";
import { useAtomValue } from "../../../lib/state/jotai";
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
// Custom comparison to prevent re-renders during streaming
function areTitlePropsEqual(prev: ChatTitleEditorProps, next: ChatTitleEditorProps): boolean {
	return prev.name === next.name && prev.placeholder === next.placeholder && prev.isMobile === next.isMobile && prev.disabled === next.disabled && prev.chatId === next.chatId && prev.hasMessages === next.hasMessages;
}
export const ChatTitleEditor = memo(function ChatTitleEditor({ name, placeholder = "New Chat", onSave, isMobile = false, disabled = false, chatId, hasMessages = false }: ChatTitleEditorProps) {
	const [isEditing, setIsEditing] = createSignal(false);
	const [editValue, setEditValue] = createSignal(name);
	const [isSaving, setIsSaving] = createSignal(false);
	const [inputRef, setInputRef] = createSignal<HTMLInputElement>(null);
	const [containerRef, setContainerRef] = createSignal<HTMLDivElement>(null);
	const justCreatedIds = useAtomValue(justCreatedIdsAtom);
	// Sync editValue when name changes externally
	createEffect(() => {
		if (!isEditing) {
			setEditValue(name);
		}
	});
	// Auto-focus and select text when editing starts
	createEffect(() => {
		if (isEditing && inputRef.current) {
			const timeoutId = setTimeout(() => {
				if (inputRef.current) {
					inputRef.current.focus();
					inputRef.current.select();
				}
			}, 0);
			return () => clearTimeout(timeoutId);
		}
	});
	const handleSave = async () => {
		const trimmedValue = editValue.trim();
		// If empty or unchanged, just cancel
		if (!trimmedValue || trimmedValue === name) {
			setEditValue(name);
			setIsEditing(false);
			return;
		}
		setIsSaving(true);
		try {
			await onSave(trimmedValue);
			setIsEditing(false);
		} catch {
			// On error, revert to original name
			setEditValue(name);
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};
	const handleCancel = () => {
		setEditValue(name);
		setIsEditing(false);
	};
	// Handle clicks outside to save
	createEffect(() => {
		if (!isEditing) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				handleSave();
			}
		};
		// Add delay to avoid immediate trigger
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 100);
		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	});
	const handleKeyDown = (e: React.KeyboardEvent) => {
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
	const isJustCreated = chatId ? justCreatedIds().has(chatId) : false;
	const hasRealName = name && name !== placeholder;
	const handleClick = () => {
		// Don't allow editing if disabled or if it's a placeholder (not saved to DB yet)
		if (!disabled && !isEditing && hasRealName) {
			setIsEditing(true);
		}
	};
	// Fixed height to prevent layout shift when switching between view/edit modes
	const heightClass = isMobile ? "h-7" : "h-7";
	return <div ref={containerRef} class={cn("max-w-2xl mx-auto px-4", heightClass)}>
      {isEditing ? <input ref={inputRef} type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown} disabled={isSaving} placeholder={placeholder} class={cn("w-full h-full bg-transparent border-0 outline-none", isMobile ? "text-base" : "text-lg", "font-medium text-foreground")} /> : <div onClick={handleClick} class={cn("text-left w-full h-full", isMobile ? "text-base" : "text-lg", "font-medium", hasRealName ? "text-foreground cursor-pointer" : "cursor-default")}>
          <span class="block truncate">
            <TypewriterText text={name} placeholder={placeholder} id={chatId} isJustCreated={isJustCreated} showPlaceholder={hasMessages} />
          </span>
        </div>}
    </div>;
}, areTitlePropsEqual);
