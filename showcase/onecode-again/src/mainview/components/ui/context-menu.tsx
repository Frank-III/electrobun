import { type Component, type ComponentProps, type JSX, splitProps } from "solid-js";
import { ContextMenu as ContextMenuPrimitive } from "@kobalte/core/context-menu";
import { cn } from "../../lib/utils";
import { CaretRightIcon } from "./icons";
import {
	overlayContent,
	overlayItemWithIcon,
	overlaySubTrigger,
	overlayCheckableItem,
	overlayItemIndicator,
	overlaySeparator,
	overlayLabel,
	overlayShortcut,
	overlayChevron,
} from "../../lib/overlay-styles";

const ContextMenu = ContextMenuPrimitive;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

type ContextMenuSubTriggerProps = ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
	inset?: boolean;
};

const ContextMenuSubTrigger: Component<ContextMenuSubTriggerProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset", "children"]);
	return (
		<ContextMenuPrimitive.SubTrigger
			class={cn(overlaySubTrigger, local.inset && "pl-8", local.class)}
			{...rest}
		>
			<span class="flex-1 inline-flex items-center gap-1.5">{local.children}</span>
			<CaretRightIcon class={overlayChevron} />
		</ContextMenuPrimitive.SubTrigger>
	);
};

const ContextMenuSubContent: Component<ComponentProps<typeof ContextMenuPrimitive.SubContent>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<ContextMenuPrimitive.SubContent
			class={cn(overlayContent, "min-w-[200px] py-1 dark", local.class)}
			{...rest}
		/>
	);
};

const ContextMenuContent: Component<ComponentProps<typeof ContextMenuPrimitive.Content>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				class={cn(overlayContent, "min-w-[200px] py-1 dark", local.class)}
				{...rest}
			/>
		</ContextMenuPrimitive.Portal>
	);
};

type ContextMenuItemProps = ComponentProps<typeof ContextMenuPrimitive.Item> & {
	inset?: boolean;
};

const ContextMenuItem: Component<ContextMenuItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset"]);
	return (
		<ContextMenuPrimitive.Item
			class={cn(overlayItemWithIcon, local.inset && "pl-8", local.class)}
			{...rest}
		/>
	);
};

const ContextMenuCheckboxItem: Component<ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<ContextMenuPrimitive.CheckboxItem class={cn(overlayCheckableItem, local.class)} {...rest}>
			<span class={overlayItemIndicator}>
				<ContextMenuPrimitive.ItemIndicator>
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
						class="h-4 w-4"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</ContextMenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</ContextMenuPrimitive.CheckboxItem>
	);
};

const ContextMenuRadioItem: Component<ComponentProps<typeof ContextMenuPrimitive.RadioItem>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<ContextMenuPrimitive.RadioItem class={cn(overlayCheckableItem, local.class)} {...rest}>
			<span class={overlayItemIndicator}>
				<ContextMenuPrimitive.ItemIndicator>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="8"
						height="8"
						viewBox="0 0 15 15"
						fill="currentColor"
						class="h-2 w-2 fill-current"
					>
						<circle cx="7.5" cy="7.5" r="7.5" />
					</svg>
				</ContextMenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</ContextMenuPrimitive.RadioItem>
	);
};

type ContextMenuLabelProps = ComponentProps<typeof ContextMenuPrimitive.GroupLabel> & {
	inset?: boolean;
};

const ContextMenuLabel: Component<ContextMenuLabelProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset"]);
	return (
		<ContextMenuPrimitive.GroupLabel
			class={cn(overlayLabel, "font-semibold", local.inset && "pl-8", local.class)}
			{...rest}
		/>
	);
};

const ContextMenuSeparator: Component<ComponentProps<typeof ContextMenuPrimitive.Separator>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <ContextMenuPrimitive.Separator class={cn(overlaySeparator, local.class)} {...rest} />;
};

const ContextMenuShortcut: Component<JSX.HTMLAttributes<HTMLSpanElement>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <span class={cn(overlayShortcut, local.class)} {...rest} />;
};

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
};
