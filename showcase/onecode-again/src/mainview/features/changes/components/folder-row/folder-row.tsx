import { Show, For } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "../../../../lib/utils";
import { CollapsibleRow } from "../collapsible-row";
interface FolderRowProps {
	name: string;
	isExpanded: boolean;
	onToggle: (expanded: boolean) => void;
	children: JSX.Element;
	/** Number of level indentations (for tree view) */
	level?: number;
	/** Show file count badge */
	fileCount?: number;
	/** Use compact styling (grouped view) or full styling (tree view) */
	variant?: "tree" | "grouped";
}
function LevelIndicators(props: {
	level: number;
}) {
	if (props.level === 0) return null;
	return <div class="flex self-stretch shrink-0">
			<For each={Array.from({ length: props.level })}>{(_, i) => <div class="w-3 self-stretch border-r border-border/50" />}</For>
		</div>;
}
function FolderRowHeader(props: {
	name: string;
	level: number;
	fileCount?: number;
	isGrouped: boolean;
}) {
	return <>
			<Show when={!props.isGrouped}>
				<LevelIndicators level={props.level} />
			</Show>
			<div class="flex items-center gap-1 flex-1 min-w-0">
				<span class={cn("truncate", props.isGrouped ? "w-0 grow text-left" : "flex-1 min-w-0 text-xs text-foreground")} dir={props.isGrouped ? "rtl" : undefined}>
					{props.name}
				</span>
				<Show when={props.fileCount !== undefined}>
					<span class="text-[10px] text-muted-foreground shrink-0 tabular-nums">
						{props.fileCount}
					</span>
				</Show>
			</div>
		</>;
}
export function FolderRow(props: FolderRowProps) {
	const level = () => props.level ?? 0;
	const variant = () => props.variant ?? "tree";
	const isGrouped = variant() === "grouped";
	return <CollapsibleRow isExpanded={props.isExpanded} onToggle={props.onToggle} showChevron={!isGrouped} class={cn(isGrouped && "overflow-hidden")} triggerClassName={cn("text-xs items-stretch py-0.5", isGrouped && "text-muted-foreground")} contentClassName={cn(isGrouped && "ml-1.5 border-l border-border pl-0.5")} header={<FolderRowHeader name={props.name} level={level()} fileCount={props.fileCount} isGrouped={isGrouped} />}>
			{props.children}
		</CollapsibleRow>;
}
