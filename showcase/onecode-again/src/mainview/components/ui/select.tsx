import { type Component, type ComponentProps, type JSX, splitProps, Show, For } from "solid-js";
import { Select as SelectPrimitive } from "@kobalte/core/select";
import { cn } from "../../lib/utils";
import {
	overlayContentBase,
	overlayMaxHeight,
	overlayAnimation,
	overlaySlideIn,
	overlayItemBase,
	overlayItemHover,
	overlayItemFocus,
	overlayItemDisabled,
	overlayItemTransition,
	overlayItemIndicator,
	overlayLabel,
	overlaySeparator,
} from "../../lib/overlay-styles";

// Kobalte Select wrapper - requires options prop
// Usage: <Select options={["a", "b"]} value={val()} onChange={setVal} optionTextValue={(v) => labels[v]}>
type SelectOption = string | { value: string; label: string; disabled?: boolean };

type SelectProps<T extends SelectOption = string> = {
	value?: string;
	onChange?: (value: string) => void;
	onValueChange?: (value: string) => void;
	options?: T[];
	optionValue?: (option: T) => string;
	optionTextValue?: (option: T) => string;
	optionDisabled?: (option: T) => boolean;
	children?: JSX.Element;
	class?: string;
	disabled?: boolean;
	placeholder?: string;
};

function Select<T extends SelectOption = string>(props: SelectProps<T>) {
	const [local, rest] = splitProps(props, ["value", "onChange", "onValueChange", "options", "optionValue", "optionTextValue", "optionDisabled", "children"]);
	
	// If no options provided, use empty array (component won't be functional but won't crash)
	const options = () => local.options ?? ([] as T[]);
	
	const getOptionValue = (opt: T): string => {
		if (local.optionValue) return local.optionValue(opt);
		if (typeof opt === "string") return opt;
		return (opt as { value: string }).value;
	};
	
	const getOptionLabel = (opt: T): string => {
		if (local.optionTextValue) return local.optionTextValue(opt);
		if (typeof opt === "string") return opt;
		return (opt as { value: string; label: string }).label || (opt as { value: string }).value;
	};
	
	const getOptionDisabled = (opt: T): boolean => {
		if (local.optionDisabled) return local.optionDisabled(opt);
		if (typeof opt === "object" && "disabled" in opt) return opt.disabled ?? false;
		return false;
	};

	const handleChange = (value: string | null) => {
		if (value !== null) {
			local.onChange?.(value);
			local.onValueChange?.(value);
		}
	};

	return (
		<SelectPrimitive
			value={local.value}
			onChange={handleChange}
			options={options()}
			optionValue={getOptionValue}
			optionTextValue={getOptionLabel}
			optionDisabled={getOptionDisabled}
			itemComponent={(itemProps) => (
				<SelectItemInternal value={getOptionValue(itemProps.item.rawValue)} disabled={getOptionDisabled(itemProps.item.rawValue)}>
					{getOptionLabel(itemProps.item.rawValue)}
				</SelectItemInternal>
			)}
			{...rest}
		>
			{local.children}
		</SelectPrimitive>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any  
const SelectValue: any = SelectPrimitive.Value;
const SelectDescription = SelectPrimitive.Description;
const SelectErrorMessage = SelectPrimitive.ErrorMessage;
const SelectHiddenSelect = SelectPrimitive.HiddenSelect;

const SelectTrigger: Component<ComponentProps<typeof SelectPrimitive.Trigger>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<SelectPrimitive.Trigger
			class={cn(
				"flex h-9 w-full items-center justify-between gap-2 rounded-[10px] border border-input bg-background px-3 py-2 text-start text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground/70 [&>span]:min-w-0",
				local.class
			)}
			{...rest}
		>
			{local.children}
			<SelectPrimitive.Icon>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="shrink-0 text-muted-foreground/80"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
};

type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content> & {
	position?: "popper" | "item-aligned";
};

const SelectContent: Component<SelectContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "position"]);
	const position = () => local.position ?? "popper";
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				class={cn(
					overlayContentBase,
					overlayMaxHeight,
					overlayAnimation,
					overlaySlideIn,
					"dark relative",
					position() === "popper" &&
						"min-w-[var(--kb-popper-anchor-width)] data-[expanded]:translate-y-1",
					local.class
				)}
				{...rest}
			>
				<SelectPrimitive.Listbox class={cn("py-1 max-h-[inherit] overflow-y-auto")} />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
};

const SelectLabel: Component<ComponentProps<typeof SelectPrimitive.Label>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <SelectPrimitive.Label class={cn(overlayLabel, local.class)} {...rest} />;
};

type SelectItemProps = {
	class?: string;
	children?: JSX.Element;
	hasDescription?: boolean;
	value?: string;
	item?: any;
	disabled?: boolean;
};

// Internal item component used by the Select wrapper's itemComponent
const SelectItemInternal: Component<SelectItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "hasDescription"]);
	return (
		<SelectPrimitive.Item
			class={cn(
				overlayItemBase,
				overlayItemHover,
				overlayItemFocus,
				overlayItemDisabled,
				overlayItemTransition,
				"pl-7 pr-1.5",
				local.hasDescription ? "min-h-auto py-2 items-start" : "items-center",
				local.class
			)}
			{...rest}
		>
			<span class={cn(overlayItemIndicator, local.hasDescription && "mt-0.5")}>
				<SelectPrimitive.ItemIndicator>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="shrink-0 text-muted-foreground/80"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemLabel class="flex flex-col gap-0.5">
				{local.children}
			</SelectPrimitive.ItemLabel>
		</SelectPrimitive.Item>
	);
};

// Deprecated: SelectItem is kept for backwards compatibility but is now handled internally
// With Kobalte, items are rendered via the itemComponent prop on Select
const SelectItem: Component<SelectItemProps> = SelectItemInternal;

const SelectItemDescription = SelectPrimitive.ItemDescription;

const SelectSection: Component<ComponentProps<typeof SelectPrimitive.Section>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <SelectPrimitive.Section class={cn("", local.class)} {...rest} />;
};

const SelectSeparator: Component<ComponentProps<"hr">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <hr class={cn(overlaySeparator, local.class)} {...rest} />;
};

export {
	Select,
	SelectContent,
	SelectDescription,
	SelectErrorMessage,
	SelectHiddenSelect,
	SelectItem,
	SelectItemDescription,
	SelectLabel,
	SelectSection,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
