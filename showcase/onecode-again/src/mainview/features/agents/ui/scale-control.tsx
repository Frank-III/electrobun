import { cn } from "../../../lib/utils";
import { createSignal, createEffect } from "solid-js";
import { Popover, PopoverAnchor, PopoverContent } from "../../../components/ui/popover";
import { AGENTS_PREVIEW_CONSTANTS } from "../constants";
interface ScaleControlProps {
	value: number;
	onChange: (scale: number) => void;
	presets?: readonly number[];
	class?: string;
}
export function ScaleControl({ value, onChange, presets = AGENTS_PREVIEW_CONSTANTS.SCALE_PRESETS, class: cls }: ScaleControlProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	const [inputValue, setInputValue] = createSignal(String(value));
	const [inputRef, setInputRef] = createSignal<HTMLInputElement>(null);
	// Sync input value when value prop changes
	createEffect(() => {
		setInputValue(String(value));
	});
	const handleInputChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		const raw = e.currentTarget.value.replace(/[^0-9]/g, "");
		setInputValue(raw);
		const num = parseInt(raw);
		if (!isNaN(num) && num >= AGENTS_PREVIEW_CONSTANTS.MIN_SCALE && num <= AGENTS_PREVIEW_CONSTANTS.MAX_SCALE) {
			onChange(num);
		}
	};
	const handleCommit = () => {
		const num = parseInt(inputValue);
		if (!isNaN(num) && num >= AGENTS_PREVIEW_CONSTANTS.MIN_SCALE && num <= AGENTS_PREVIEW_CONSTANTS.MAX_SCALE) {
			onChange(num);
			setInputValue(String(num));
		} else {
			setInputValue(String(value));
		}
	};
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleCommit();
			setIsOpen(false);
			inputRef()?.blur();
		}
		if (e.key === "Escape") {
			setInputValue(String(value));
			setIsOpen(false);
			inputRef()?.blur();
		}
	};
	return <Popover open={isOpen} onOpenChange={(open) => {
		if (!open) {
			handleCommit();
			setIsOpen(false);
		}
	}}>
      <PopoverAnchor asChild>
        <div class={cn("flex items-center h-7 px-1.5 ml-1 rounded-md cursor-text transition-colors", "hover:bg-muted", isOpen() && "bg-muted",cls)} onClick={(e) => {
		// If click is not on input, focus input
		if (e.target !== inputRef()) {
			inputRef()?.focus();
		}
	}}>
          <input ref={inputRef} type="text" value={inputValue} onInput={handleInputChange} onFocus={(e) => {
		e.target.select();
		if (!isOpen) {
			setIsOpen(true);
		}
	}} onKeyDown={handleKeyDown} class="w-[3ch] text-xs text-muted-foreground bg-transparent border-none outline-none text-right tabular-nums" />
          <span class="text-xs text-muted-foreground">%</span>
        </div>
      </PopoverAnchor>
      <PopoverContent class="w-[var(--radix-popover-trigger-width)] min-w-[60px] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={(e) => e.preventDefault()}>
        {presets.map((preset) => <button key={preset} onClick={() => {
		onChange(preset);
		setInputValue(String(preset));
		setIsOpen(false);
	}} class={cn("flex items-center justify-center w-[calc(100%-8px)] mx-1 first:mt-1 last:mb-1 min-h-[32px] text-sm rounded-md transition-colors", "dark:hover:bg-neutral-800 hover:bg-accent", value === preset && "dark:bg-neutral-800 bg-accent font-medium")}>
            {preset}%
          </button>)}
      </PopoverContent>
    </Popover>;
}
