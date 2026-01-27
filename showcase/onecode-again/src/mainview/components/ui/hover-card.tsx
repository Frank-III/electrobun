import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { HoverCard as HoverCardPrimitive } from "@kobalte/core/hover-card";
import { cn } from "../../lib/utils";

export const HoverCard = HoverCardPrimitive;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

type HoverCardContentProps = ComponentProps<typeof HoverCardPrimitive.Content>;

export function HoverCardContent(props: HoverCardContentProps) {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<HoverCardPrimitive.Portal>
			<HoverCardPrimitive.Content
				class={cn(
					"z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
					"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
					"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					local.class
				)}
				{...rest}
			/>
		</HoverCardPrimitive.Portal>
	);
}
