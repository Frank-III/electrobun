"use client";
import { createSignal, createEffect } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { AgentToolRegistry, getToolStatus } from "./agent-tool-registry";
import { AgentToolCall } from "./agent-tool-call";
import { areExploringGroupPropsEqual } from "./agent-tool-utils";
import { cn } from "../../../lib/utils";
interface AgentExploringGroupProps {
	parts: any[];
	chatStatus?: string;
	isStreaming: boolean;
}
// Constants for rendering
const MAX_VISIBLE_TOOLS = 5;
const TOOL_HEIGHT_PX = 24;
export const AgentExploringGroup = memo(function AgentExploringGroup({ parts, chatStatus, isStreaming }: AgentExploringGroupProps) {
	// Default: expanded while streaming, collapsed when done
	const [isExpanded, setIsExpanded] = createSignal(isStreaming);
	const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>(null);
	const [wasStreamingRef, setWasStreamingRef] = createSignal(isStreaming);
	// Auto-collapse when streaming ends (transition from true -> false)
	createEffect(() => {
		if (wasStreamingRef.current && !isStreaming) {
			setIsExpanded(false);
		}
		wasStreamingRef.current = isStreaming;
	});
	// Auto-scroll to bottom when streaming and new parts added
	createEffect(() => {
		if (isStreaming && isExpanded && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	});
	// Count files (Read, Grep, Glob) and searches (WebSearch, WebFetch)
	const fileCount = parts.filter((p) => [
		"tool-Read",
		"tool-Grep",
		"tool-Glob"
	].includes(p.type)).length;
	const searchCount = parts.filter((p) => ["tool-WebSearch", "tool-WebFetch"].includes(p.type)).length;
	// Build subtitle parts
	const subtitleParts: string[] = [];
	if (fileCount > 0) {
		subtitleParts.push(`${fileCount} ${fileCount === 1 ? "file" : "files"}`);
	}
	if (searchCount > 0) {
		subtitleParts.push(`${searchCount} ${searchCount === 1 ? "search" : "searches"}`);
	}
	const subtitle = subtitleParts.join(" ");
	return <div>
      {	/* Header - clickable to toggle */}
      <div onClick={() => setIsExpanded(!isExpanded)} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
              {isStreaming ? "Exploring" : "Explored"}
            </span>
            <span class="text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
              {subtitle}
            </span>
            { /* Chevron right after text - rotates when expanded */}
            <ChevronRight class={cn("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")} />
          </div>
        </div>
      </div>

      { /* Tools list - only show when expanded */}
      {isExpanded && <div class="relative mt-1">
          { /* Top gradient fade when streaming and has many items */}
          <div class={cn("absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200", isStreaming && parts.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0")} />

          { /* Scrollable container - auto-scrolls to bottom when streaming */}
          <div ref={scrollRef} class={cn("space-y-1.5", parts.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")} style={parts.length > MAX_VISIBLE_TOOLS ? { maxHeight: `${MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX}px` } : undefined}>
            {parts.map((part, idx) => {
 const meta = AgentToolRegistry[part.type];
		if (!meta) {
			return <div key={idx} class="text-xs text-muted-foreground py-0.5 px-2">
                    {part.type?.replace("tool-", "")}
                  </div>;
		}
		const { isPending, isError } = getToolStatus(part, chatStatus);
		return <AgentToolCall key={idx} icon={meta.icon} title={meta.title(part)} subtitle={meta.subtitle?.(part)} tooltipContent={meta.tooltipContent?.(part)} isPending={isPending} isError={isError} />;
	})}
          </div>
        </div>}
    </div>;
}, areExploringGroupPropsEqual);
