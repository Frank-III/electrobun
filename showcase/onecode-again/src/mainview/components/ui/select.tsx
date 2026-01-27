import { type Component, type ComponentProps, type JSX, splitProps, Show } from "solid-js";
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

const Select = SelectPrimitive;
const SelectValue = SelectPrimitive.Value;
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

type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item> & {
	hasDescription?: boolean;
};

const SelectItem: Component<SelectItemProps> = (props) => {
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
