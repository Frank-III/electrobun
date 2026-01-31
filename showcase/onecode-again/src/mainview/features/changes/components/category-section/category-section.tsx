import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible";
import { cn } from "../../../../lib/utils";
import { Show, type JSX } from "solid-js";
import { ChevronRight } from "lucide-solid";
interface CategorySectionProps {
	title: string;
	count: number;
	isExpanded: boolean;
	onToggle: () => void;
	children: JSX.Element;
	actions?: JSX.Element;
}
export function CategorySection({ title, count, isExpanded, onToggle, children, actions }: CategorySectionProps) {
	if (count === 0) {
		return null;
	}
	return <Collapsible open={isExpanded} onOpenChange={onToggle} class="min-w-0 overflow-hidden">
			{	/* Section header */}
			<div class="flex items-center min-w-0">
				<CollapsibleTrigger class={cn("flex-1 flex items-center gap-1.5 px-2 py-1.5 text-left min-w-0", "hover:bg-accent/30 cursor-pointer transition-colors")}>
					<ChevronRight class={cn("size-3 text-muted-foreground shrink-0 transition-transform duration-150", isExpanded && "rotate-90")} />
					<span class="text-xs font-medium truncate">{title}</span>
					<span class="text-[10px] text-muted-foreground shrink-0">
						{count}
					</span>
				</CollapsibleTrigger>
				<Show when={actions}><div class="pr-1.5 shrink-0">{actions}</div></Show>
			</div>

			{ /* Section content */}
			<CollapsibleContent class="px-0.5 pb-1 min-w-0 overflow-hidden">
				{children}
			</CollapsibleContent>
		</Collapsible>;
 }
