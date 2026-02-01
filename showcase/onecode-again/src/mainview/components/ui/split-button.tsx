import type { JSX } from "solid-js";
import { Show, mergeProps, splitProps } from "solid-js";
import { ChevronDown } from "lucide-solid";
import { Button, type ButtonProps } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { cn } from "../../lib/utils";
export interface SplitButtonProps extends Omit<ButtonProps, "children"> {
	/** Main button label */
	label: string;
	/** Icon to show before label */
	icon?: JSX.Element;
	/** Badge to show after label (e.g., "↑3") */
	badge?: string;
	/** Handler for main button click */
	onClick: () => void;
	/** Dropdown menu content */
	dropdownContent?: JSX.Element;
	/** Whether to show the dropdown trigger */
	showDropdown?: boolean;
}
export function SplitButton(props: SplitButtonProps) {
	const merged = mergeProps({ showDropdown: true, variant: "default", size: "sm" }, props);
	const [local, rest] = splitProps(merged, ["label", "icon", "badge", "onClick", "dropdownContent", "showDropdown", "disabled", "variant", "size", "class"]);
	// If no dropdown content, render just the button
	if (!local.showDropdown || !local.dropdownContent) {
		return <Button variant={local.variant} size={local.size} onClick={local.onClick} disabled={local.disabled} class={cn("gap-1.5",local.class)} {...rest}>
				{local.icon}
				<span>{local.label}</span>
				<Show when={local.badge}>
					<span class="text-[10px] opacity-80">{local.badge}</span>
				</Show>
			</Button>;
	}
	return <div class="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5">
			{	/* Main action button */}
			<Button variant={local.variant} size={local.size} onClick={local.onClick} disabled={local.disabled} class={cn("gap-1.5 rounded-r-none focus:z-10",local.class)} {...rest}>
				{local.icon}
				<span>{local.label}</span>
				<Show when={local.badge}>
					<span class="text-[10px] opacity-80">{local.badge}</span>
				</Show>
			</Button>

			{ /* Dropdown trigger */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant={local.variant} size="icon" disabled={local.disabled} class="rounded-l-none focus:z-10 h-7 w-7" aria-label="More options">
						<ChevronDown class="size-3.5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="min-w-[160px]">
					{local.dropdownContent}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>;
	 }
