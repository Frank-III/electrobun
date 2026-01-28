"use client";
import { createSignal } from "solid-js";
import { GlobeIcon, IconSpinner, ExpandIcon, CollapseIcon } from "../../../components/ui/icons";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { getToolStatus } from "./agent-tool-registry";
import { AgentToolInterrupted } from "./agent-tool-interrupted";
import { cn } from "../../../lib/utils";
interface AgentWebFetchToolProps {
	part: any;
	chatStatus?: string;
}
export function AgentWebFetchTool({ part, chatStatus }: AgentWebFetchToolProps) {
	const [isExpanded, setIsExpanded] = createSignal(false);
	const { isPending, isError, isInterrupted } = getToolStatus(part, chatStatus);
	const url = part.input?.url || "";
	const result = part.output?.result || "";
	const bytes = part.output?.bytes || 0;
	const statusCode = part.output?.code;
	const isSuccess = statusCode === 200;
	// Extract hostname for display
	let hostname = "";
	try {
		hostname = new URL(url).hostname.replace("www.", "");
	} catch {
		hostname = url.slice(0, 30);
	}
	// Format bytes
	const formatBytes = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};
	const hasContent = result.length > 0;
	// Show interrupted state if fetch was interrupted without completing
	if (isInterrupted && !result) {
		return <AgentToolInterrupted toolName="Fetch" subtitle={hostname} />;
	}
	return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {	/* Header - clickable to toggle expand */}
      <div onClick={() => hasContent && !isPending && setIsExpanded(!isExpanded)} class={cn("flex items-center justify-between px-2.5 h-7", hasContent && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <GlobeIcon class="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          
          {isPending ? <TextShimmer as="span" duration={1.2} class="text-xs text-muted-foreground">
              Fetching
            </TextShimmer> : <span class="text-xs text-muted-foreground">Fetched</span>}
          
          <span class="truncate text-foreground">{hostname}</span>
        </div>

        { /* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <div class="flex items-center gap-1.5 text-xs">
            {isPending ? <IconSpinner class="w-3 h-3" /> : isError || !isSuccess ? <span class="text-destructive">
                {statusCode ? `Error ${statusCode}` : "Failed"}
              </span> : <span class="text-muted-foreground">
                {formatBytes(bytes)}
              </span>}
          </div>

          { /* Expand/Collapse icon */}
          {hasContent && !isPending && <div class="relative w-4 h-4">
              <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
              <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
            </div>}
        </div>
      </div>

      { /* Content - expandable */}
      {hasContent && isExpanded && <div class="border-t border-border max-h-[300px] overflow-y-auto">
          <pre class="px-2.5 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-mono">
            {result}
          </pre>
        </div>}
    </div>;
}
