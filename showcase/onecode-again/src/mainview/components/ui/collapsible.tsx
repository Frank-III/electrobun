import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { Collapsible as CollapsiblePrimitive } from "@kobalte/core/collapsible";
import { cn } from "../../lib/utils";

export type CollapsibleProps = ComponentProps<typeof CollapsiblePrimitive>;

export function Collapsible(props: CollapsibleProps) {
	return <CollapsiblePrimitive data-slot="collapsible" {...props} />;
}

export type CollapsibleTriggerProps = ComponentProps<typeof CollapsiblePrimitive.Trigger>;

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
	return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

export type CollapsibleContentProps = ComponentProps<typeof CollapsiblePrimitive.Content>;

export function CollapsibleContent(props: CollapsibleContentProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<CollapsiblePrimitive.Content
			data-slot="collapsible-content"
			class={cn(
				"data-[closed]:animate-collapsible-up data-[expanded]:animate-collapsible-down overflow-hidden",
				local.class
			)}
			{...rest}
		/>
	);
}
