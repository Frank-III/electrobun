import { type Component, type ComponentProps, splitProps } from "solid-js";
import { Accordion as AccordionPrimitive } from "@kobalte/core/accordion";
import { cn } from "../../lib/utils";

const Accordion = AccordionPrimitive;

const AccordionItem: Component<ComponentProps<typeof AccordionPrimitive.Item>> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <AccordionPrimitive.Item class={cn("border-b", local.class)} {...rest} />;
};

const AccordionTrigger: Component<ComponentProps<typeof AccordionPrimitive.Trigger>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<AccordionPrimitive.Header class="flex">
			<AccordionPrimitive.Trigger
				class={cn(
					"flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-expanded]>svg]:rotate-180",
					local.class
				)}
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
					class="h-4 w-4 shrink-0 transition-transform duration-200"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
};

const AccordionContent: Component<ComponentProps<typeof AccordionPrimitive.Content>> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);
	return (
		<AccordionPrimitive.Content
			class="text-sm transition-all data-[closed]:animate-accordion-up data-[expanded]:animate-accordion-down"
			{...rest}
		>
			<div class={cn("pb-4 pt-0", local.class)}>{local.children}</div>
		</AccordionPrimitive.Content>
	);
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
