import { Show, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible";
import { cn } from "../../../../lib/utils";
import { ChevronRight } from "lucide-solid";
interface CollapsibleRowProps {
	isExpanded: boolean;
	onToggle: (expanded: boolean) => void;
	header: JSX.Element;
	children: JSX.Element;
	showChevron?: boolean;
	class?: string;
	triggerClassName?: string;
	contentClassName?: string;
}
export function CollapsibleRow(props: CollapsibleRowProps) {
	const merged = mergeProps({ showChevron: true }, props);
	const [local] = splitProps(merged, ["isExpanded", "onToggle", "header", "children", "showChevron", "class", "triggerClassName", "contentClassName"]);
	return <Collapsible open={local.isExpanded} onOpenChange={local.onToggle} class={cn("min-w-0",local.class)}>
			<CollapsibleTrigger class={cn("w-full flex items-center gap-1.5 px-1.5 py-1 text-left rounded-sm", "hover:bg-accent/50 cursor-pointer transition-colors", local.triggerClassName)}>
				<Show when={local.showChevron}>
					<ChevronRight class={cn("size-2.5 text-muted-foreground shrink-0 transition-transform duration-150", local.isExpanded && "rotate-90")} />
				</Show>
				{local.header}
			</CollapsibleTrigger>
			<CollapsibleContent class={cn("min-w-0", local.contentClassName)}>
				{local.children}
			</CollapsibleContent>
		</Collapsible>;
}
