import type { ComponentProps, ValidComponent } from "solid-js";
import { mergeProps, splitProps, Show } from "solid-js";
import { Tooltip as TooltipPrimitive } from "@kobalte/core/tooltip";
import { cn } from "../../lib/utils";

export type TooltipProps = ComponentProps<typeof TooltipPrimitive>;

export function Tooltip(props: TooltipProps) {
	const merged = mergeProps(
		{ closeDelay: 0, openDelay: 0, placement: "top" as const },
		props
	);
	return <TooltipPrimitive {...merged} />;
}

export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

export type TooltipContentProps<T extends ValidComponent = "div"> = ComponentProps<typeof TooltipPrimitive.Content<T>> & {
	showArrow?: boolean;
};

export function TooltipContent<T extends ValidComponent = "div">(props: TooltipContentProps<T>) {
	const [local, rest] = splitProps(props as TooltipContentProps, ["class", "children", "showArrow"]);

	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-tooltip="true"
				class={cn(
					"relative z-50 max-w-[280px] flex flex-col items-start gap-0.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg",
					"animate-in fade-in-0 zoom-in-95",
					"data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95",
					"origin-(--kb-tooltip-content-transform-origin)",
					local.class
				)}
				{...rest}
			>
				{local.children}
				<Show when={local.showArrow}>
					<TooltipPrimitive.Arrow class="-my-px fill-popover drop-shadow-[0_1px_0_hsl(var(--border))]" />
				</Show>
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

// For backward compatibility - Kobalte doesn't need a provider wrapper
export function TooltipProvider(props: { children: any }) {
	return props.children;
}
