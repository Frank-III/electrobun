"use client";
import { createSignal, createEffect, Show, For } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { AgentToolRegistry, getToolStatus } from "./agent-tool-registry";
import { AgentToolCall } from "./agent-tool-call";
import { cn } from "../../../lib/utils";

interface AgentExploringGroupProps {
	parts: any[];
	chatStatus?: string;
	isStreaming: boolean;
}

const MAX_VISIBLE_TOOLS = 5;
const TOOL_HEIGHT_PX = 24;

export function AgentExploringGroup(props: AgentExploringGroupProps) {
	const [isExpanded, setIsExpanded] = createSignal(props.isStreaming);
	let scrollRef: HTMLDivElement | undefined;
	let wasStreamingRef = props.isStreaming;
	
	createEffect(() => {
		if (wasStreamingRef && !props.isStreaming) {
			setIsExpanded(false);
		}
		wasStreamingRef = props.isStreaming;
	});
	
	createEffect(() => {
		if (props.isStreaming && isExpanded() && scrollRef) {
			scrollRef.scrollTop = scrollRef.scrollHeight;
		}
	});
	const fileCount = () => props.parts.filter((p) => [
		"tool-Read",
		"tool-Grep",
		"tool-Glob"
	].includes(p.type)).length;
	const searchCount = () => props.parts.filter((p) => ["tool-WebSearch", "tool-WebFetch"].includes(p.type)).length;
	
	const subtitle = () => {
		const subtitleParts: string[] = [];
		if (fileCount() > 0) {
			subtitleParts.push(`${fileCount()} ${fileCount() === 1 ? "file" : "files"}`);
		}
		if (searchCount() > 0) {
			subtitleParts.push(`${searchCount()} ${searchCount() === 1 ? "search" : "searches"}`);
		}
		return subtitleParts.join(" ");
	};
	
	return (
		<div>
			<div onClick={() => setIsExpanded(!isExpanded())} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
				<div class="flex-1 min-w-0 flex items-center gap-1">
					<div class="text-xs flex items-center gap-1.5 min-w-0">
						<span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
							{props.isStreaming ? "Exploring" : "Explored"}
						</span>
						<span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
							{subtitle()}
						</span>
						<ChevronRight class={cn(
							"w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out",
							isExpanded() && "rotate-90",
							!isExpanded() && "opacity-0 group-hover:opacity-100"
						)} />
					</div>
				</div>
			</div>
			<Show when={isExpanded()}>
				<div class="relative mt-1">
					<div class={cn(
						"absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
						props.isStreaming && props.parts.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0"
					)} />
					<div
						ref={el => scrollRef = el}
						class={cn("space-y-1.5", props.parts.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")}
						style={props.parts.length > MAX_VISIBLE_TOOLS ? { "max-height": `${MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX}px` } : undefined}
					>
						<For each={props.parts}>
							{(part, idx) => {
								const meta = AgentToolRegistry[part.type];
								if (!meta) {
									return (
										<div class="text-xs text-muted-foreground py-0.5 px-2">
											{part.type?.replace("tool-", "")}
										</div>
									);
								}
								const { isPending, isError } = getToolStatus(part, props.chatStatus);
								return (
									<AgentToolCall
										icon={meta.icon}
										title={meta.title(part)}
										subtitle={meta.subtitle?.(part)}
										tooltipContent={meta.tooltipContent?.(part)}
										isPending={isPending}
										isError={isError}
									/>
								);
							}}
						</For>
					</div>
				</div>
			</Show>
		</div>
	);
}
