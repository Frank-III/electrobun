import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { Tabs as TabsPrimitive } from "@kobalte/core/tabs";
import { cn } from "../../lib/utils";

export type TabsProps = ComponentProps<typeof TabsPrimitive>;

export function Tabs(props: TabsProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive
			data-slot="tabs"
			class={cn("flex flex-col gap-2", local.class)}
			{...rest}
		/>
	);
}

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List>;

export function TabsList(props: TabsListProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			class={cn(
				"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
				local.class
			)}
			{...rest}
		/>
	);
}

export type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger>;

export function TabsTrigger(props: TabsTriggerProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			class={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				"disabled:pointer-events-none disabled:opacity-50",
				"data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm",
				local.class
			)}
			{...rest}
		/>
	);
}

export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

export function TabsContent(props: TabsContentProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			class={cn(
				"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				local.class
			)}
			{...rest}
		/>
	);
}
