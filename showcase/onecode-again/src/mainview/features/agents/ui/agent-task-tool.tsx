"use client";
import { createSignal, createEffect, onCleanup } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { AgentToolRegistry, getToolStatus } from "./agent-tool-registry";
import { AgentToolCall } from "./agent-tool-call";
import { AgentToolInterrupted } from "./agent-tool-interrupted";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { cn } from "../../../lib/utils";
interface AgentTaskToolProps {
	part: any;
	nestedTools: any[];
	chatStatus?: string;
}
// Constants for rendering
const MAX_VISIBLE_TOOLS = 5;
const TOOL_HEIGHT_PX = 24;
// Format elapsed time in a human-readable format
function formatElapsedTime(ms: number): string {
	if (ms < 1e3) return "";
	const seconds = Math.floor(ms / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (remainingSeconds === 0) return `${minutes}m`;
	return `${minutes}m ${remainingSeconds}s`;
}
export function AgentTaskTool({ part, nestedTools, chatStatus }: AgentTaskToolProps) {
	const { isPending, isInterrupted } = getToolStatus(part, chatStatus);
	// Default: collapsed
	const [isExpanded, setIsExpanded] = createSignal(false);
	const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>(null);
	// Track elapsed time for running tasks
	const [elapsedMs, setElapsedMs] = createSignal(0);
	const description = part.input?.description || "";
	// Use startedAt from backend for persistent timing across re-renders
	const startedAt = part.startedAt as number | undefined;
	// Track elapsed time while task is running using backend timestamp
	createEffect(() => {
		if (isPending && startedAt) {
			// Set initial elapsed time immediately
			setElapsedMs(Date.now() - startedAt);
			const interval = setInterval(() => {
				setElapsedMs(Date.now() - startedAt);
			}, 1e3);
			onCleanup(() => clearInterval(interval));
		}
	});
	// Use output duration from Claude Code if available, otherwise use our tracked time
	const outputDuration = part.output?.duration || part.output?.duration_ms;
	const displayMs = !isPending && outputDuration ? outputDuration : elapsedMs;
	const elapsedTimeDisplay = formatElapsedTime(displayMs);
	// Auto-scroll to bottom when streaming and new nested tools added
	createEffect(() => {
		if (isPending && isExpanded && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	});
	const hasNestedTools = nestedTools.length > 0;
	// Build subtitle - always show description
	const getSubtitle = () => {
		if (description) {
			const truncated = description.length > 60 ? description.slice(0, 57) + "..." : description;
			return truncated;
		}
		return "";
	};
	const subtitle = getSubtitle();
	// Get title text based on status
	const getTitle = () => {
		return isPending ? "Running Task" : "Completed Task";
	};
	// Show interrupted state if task was interrupted without completing
	if (isInterrupted && !part.output) {
		return <AgentToolInterrupted toolName="Task" subtitle={subtitle} />;
	}
	return <div>
      {	/* Header - clickable to toggle, same style as AgentExploringGroup */}
      <div onClick={() => setIsExpanded(!isExpanded)} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            { /* Title with shimmer effect when running */}
            {isPending ? <TextShimmer as="span" duration={1.2} class="font-medium whitespace-nowrap flex-shrink-0">
                {getTitle()}
              </TextShimmer> : <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
                {getTitle()}
              </span>}
            {subtitle && <span class="text-muted-foreground/60 truncate">
                {subtitle}
              </span>}
            { /* Show elapsed time while running or final time when done */}
            {elapsedTimeDisplay && <span class="text-muted-foreground/50 tabular-nums flex-shrink-0">
                {elapsedTimeDisplay}
              </span>}
            { /* Chevron right after text - rotates when expanded */}
            <ChevronRight class={cn("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0", isExpanded && "rotate-90", !isExpanded && "opacity-0 group-hover:opacity-100")} />
          </div>
        </div>
      </div>

      { /* Nested tools - only show when expanded */}
      {hasNestedTools && isExpanded && <div class="relative mt-1">
          { /* Top gradient fade when streaming and has many items */}
          <div class={cn("absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200", isPending && nestedTools.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0")} />

          { /* Scrollable container - auto-scrolls to bottom when streaming */}
          <div ref={scrollRef} class={cn("space-y-1.5", isPending && nestedTools.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")} style={isPending && nestedTools.length > MAX_VISIBLE_TOOLS ? { maxHeight: `${MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX}px` } : undefined}>
            {nestedTools.map((nestedPart, idx) => {
 const nestedMeta = AgentToolRegistry[nestedPart.type];
		if (!nestedMeta) {
			return <div key={idx} class="text-xs text-muted-foreground py-0.5 px-2">
                    {nestedPart.type?.replace("tool-", "")}
                  </div>;
		}
		const { isPending: nestedIsPending, isError: nestedIsError } = getToolStatus(nestedPart, chatStatus);
		return <AgentToolCall key={idx} icon={nestedMeta.icon} title={nestedMeta.title(nestedPart)} subtitle={nestedMeta.subtitle?.(nestedPart)} isPending={nestedIsPending} isError={nestedIsError} />;
	})}
          </div>
        </div>}
    </div>;
}
