import { type Component, type ComponentProps, type JSX, mergeProps, splitProps } from "solid-js";
import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core/dropdown-menu";
import { cn } from "../../lib/utils";
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

const DropdownMenu: Component<ComponentProps<typeof DropdownMenuPrimitive>> = (props) => {
	const merged = mergeProps({ modal: false }, props);
	return <DropdownMenuPrimitive {...merged} />;
};
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

type DropdownMenuSubTriggerProps = ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
};

const DropdownMenuSubTrigger: Component<DropdownMenuSubTriggerProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset", "children"]);
	return (
		<DropdownMenuPrimitive.SubTrigger
			class={cn(overlaySubTrigger, local.inset && "pl-8", local.class)}
			{...rest}
		>
			{local.children}
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
				class={overlayChevron}
			>
				<path d="m9 18 6-6-6-6" />
			</svg>
		</DropdownMenuPrimitive.SubTrigger>
	);
};

const DropdownMenuSubContent: Component<ComponentProps<typeof DropdownMenuPrimitive.SubContent>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DropdownMenuPrimitive.SubContent
			class={cn(overlayContent, "min-w-[8rem] py-1 dark", local.class)}
			{...rest}
		/>
	);
};

type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content> & {
	sideOffset?: number;
};

const DropdownMenuContent: Component<DropdownMenuContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "sideOffset"]);
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				gutter={local.sideOffset ?? 4}
				class={cn(overlayContent, "min-w-[8rem] py-1 dark", local.class)}
				data-dropdown="true"
				{...rest}
			/>
		</DropdownMenuPrimitive.Portal>
	);
};

type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
};

const DropdownMenuItem: Component<DropdownMenuItemProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset"]);
	return (
		<DropdownMenuPrimitive.Item
			class={cn(overlayItemWithIcon, local.inset && "pl-8", local.class)}
			{...rest}
		/>
	);
};

const DropdownMenuCheckboxItem: Component<ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<DropdownMenuPrimitive.CheckboxItem class={cn(overlayCheckableItem, local.class)} {...rest}>
			<span class={overlayItemIndicator}>
				<DropdownMenuPrimitive.ItemIndicator>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
};

const DropdownMenuRadioItem: Component<ComponentProps<typeof DropdownMenuPrimitive.RadioItem>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<DropdownMenuPrimitive.RadioItem class={cn(overlayCheckableItem, local.class)} {...rest}>
			<span class={overlayItemIndicator}>
				<DropdownMenuPrimitive.ItemIndicator>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="8"
						height="8"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-2 w-2 fill-current"
					>
						<circle cx="12" cy="12" r="10" />
					</svg>
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{local.children}
		</DropdownMenuPrimitive.RadioItem>
	);
};

type DropdownMenuLabelProps = ComponentProps<typeof DropdownMenuPrimitive.GroupLabel> & {
	inset?: boolean;
};

const DropdownMenuLabel: Component<DropdownMenuLabelProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "inset"]);
	return (
		<DropdownMenuPrimitive.GroupLabel
			class={cn(overlayLabel, local.inset && "pl-8", local.class)}
			{...rest}
		/>
	);
};

const DropdownMenuSeparator: Component<ComponentProps<typeof DropdownMenuPrimitive.Separator>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <DropdownMenuPrimitive.Separator class={cn(overlaySeparator, local.class)} {...rest} />;
};

const DropdownMenuShortcut: Component<JSX.HTMLAttributes<HTMLSpanElement>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <span class={cn(overlayShortcut, local.class)} {...rest} />;
};

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuRadioGroup,
};
