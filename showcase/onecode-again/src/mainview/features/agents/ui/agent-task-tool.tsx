import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
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
export function AgentTaskTool(props: AgentTaskToolProps) {
	const { isPending, isInterrupted } = getToolStatus(props.part, props.chatStatus);
	// Default: collapsed
	const [isExpanded, setIsExpanded] = createSignal(false);
	const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>(null);
	// Track elapsed time for running tasks
	const [elapsedMs, setElapsedMs] = createSignal(0);
	const description = props.part.input?.description || "";
	// Use startedAt from backend for persistent timing across re-renders
	const startedAt = props.part.startedAt as number | undefined;
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
	const outputDuration = props.part.output?.duration || props.part.output?.duration_ms;
	const displayMs = !isPending && outputDuration ? outputDuration : elapsedMs;
	const elapsedTimeDisplay = formatElapsedTime(displayMs);
	// Auto-scroll to bottom when streaming and new nested tools added
	createEffect(() => {
		const el = scrollRef();
		if (isPending && isExpanded() && el) {
			el.scrollTop = el.scrollHeight;
		}
	});
	const hasNestedTools = props.nestedTools.length > 0;
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
	if (isInterrupted && !props.part.output) {
		return <AgentToolInterrupted toolName="Task" subtitle={subtitle} />;
	}
	return <div>
      {	/* Header - clickable to toggle, same style as AgentExploringGroup */}
      <div onClick={() => setIsExpanded((prev) => !prev)} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
        <div class="flex-1 min-w-0 flex items-center gap-1">
          <div class="text-xs flex items-center gap-1.5 min-w-0">
            { /* Title with shimmer effect when running */}
            <Show when={isPending} fallback={
              <span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
                {getTitle()}
              </span>
            }>
              <TextShimmer as="span" duration={1.2} class="font-medium whitespace-nowrap flex-shrink-0">
                {getTitle()}
              </TextShimmer>
            </Show>
            <Show when={subtitle}>
              <span class="text-muted-foreground/60 truncate">
                {subtitle}
              </span>
            </Show>
            { /* Show elapsed time while running or final time when done */}
            <Show when={elapsedTimeDisplay}>
              <span class="text-muted-foreground/50 tabular-nums flex-shrink-0">
                {elapsedTimeDisplay}
              </span>
            </Show>
            { /* Chevron right after text - rotates when expanded */}
            <ChevronRight class={cn("w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0", isExpanded() && "rotate-90", !isExpanded() && "opacity-0 group-hover:opacity-100")} />
          </div>
        </div>
      </div>

      { /* Nested tools - only show when expanded */}
      <Show when={hasNestedTools && isExpanded()}>
        <div class="relative mt-1">
          { /* Top gradient fade when streaming and has many items */}
          <div class={cn("absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200", isPending && props.nestedTools.length > MAX_VISIBLE_TOOLS ? "opacity-100" : "opacity-0")} />

          {/* Scrollable container - auto-scrolls to bottom when streaming */}
          <div ref={setScrollRef} class={cn("space-y-1.5", isPending && props.nestedTools.length > MAX_VISIBLE_TOOLS && "overflow-y-auto scrollbar-hide")} style={isPending && props.nestedTools.length > MAX_VISIBLE_TOOLS ? { maxHeight: `${MAX_VISIBLE_TOOLS * TOOL_HEIGHT_PX}px` } : undefined}>
            <For each={props.nestedTools}>{(nestedPart, idx) => {
 const nestedMeta = AgentToolRegistry[nestedPart.type];
		if (!nestedMeta) {
			return <div class="text-xs text-muted-foreground py-0.5 px-2">
                    {nestedPart.type?.replace("tool-", "")}
                  </div>;
		}
		const { isPending: nestedIsPending, isError: nestedIsError } = getToolStatus(nestedPart, props.chatStatus);
		return <AgentToolCall icon={nestedMeta.icon} title={nestedMeta.title(nestedPart)} subtitle={nestedMeta.subtitle?.(nestedPart)} isPending={nestedIsPending} isError={nestedIsError} />;
	}}</For>
          </div>
        </div>
      </Show>
    </div>;
}
