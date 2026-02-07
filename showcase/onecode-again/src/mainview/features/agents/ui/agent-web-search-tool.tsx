import { createSignal, createMemo, For, Show, splitProps } from "solid-js";
import { SearchIcon, IconSpinner, ExpandIcon, CollapseIcon, ExternalLinkIcon } from "../../../components/ui/icons";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { getToolStatus } from "./agent-tool-registry";
import { AgentToolInterrupted } from "./agent-tool-interrupted";
import { cn } from "../../../lib/utils";
interface AgentWebSearchToolProps {
	part: any;
	chatStatus?: string;
}
interface SearchResult {
	title: string;
	url: string;
}
export function AgentWebSearchTool(props: AgentWebSearchToolProps) {
	const [local] = splitProps(props, ["part", "chatStatus"]);
	const [isExpanded, setIsExpanded] = createSignal(false);
	const { isPending, isError, isInterrupted } = getToolStatus(local.part, local.chatStatus);
	const query = local.part.input?.query || "";
	const truncatedQuery = query.length > 40 ? query.slice(0, 37) + "..." : query;
	// Parse results from output
	const results = createMemo(() => {
		if (!local.part.output?.results) return [];
		// Results can be nested in content array
		const rawResults = local.part.output.results;
		const allResults: SearchResult[] = [];
		for (const result of rawResults) {
			if (result.content && Array.isArray(result.content)) {
				for (const item of result.content) {
					if (item.title && item.url) {
						allResults.push({
							title: item.title,
							url: item.url
						});
					}
				}
			} else if (result.title && result.url) {
				allResults.push({
					title: result.title,
					url: result.url
				});
			}
		}
		return allResults;
	});
	const resultCount = createMemo(() => results().length);
	const hasResults = createMemo(() => resultCount() > 0);
	// Show interrupted state if search was interrupted without completing
	return <Show when={!(isInterrupted && !hasResults())} fallback={<AgentToolInterrupted toolName="Search" subtitle={truncatedQuery} />}>
	<div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {	/* Header - clickable to toggle expand */}
		<div onClick={() => hasResults() && !isPending && setIsExpanded((prev) => !prev)} class={cn("flex items-center justify-between px-2.5 h-7", hasResults() && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <SearchIcon class="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          
          <Show when={isPending} fallback={<span class="text-xs text-muted-foreground">Searched</span>}>
            <TextShimmer as="span" duration={1.2} class="text-xs text-muted-foreground">
              Searching
            </TextShimmer>
          </Show>
          
          <span class="truncate text-foreground">
            {truncatedQuery}
          </span>
        </div>

        { /* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <div class="flex items-center gap-1.5 text-xs">
            <Show when={isPending} fallback={<Show when={isError} fallback={<span class="text-muted-foreground">
					{resultCount()} {resultCount() === 1 ? "result" : "results"}
            </span>}>
              <span class="text-destructive">Failed</span>
            </Show>}>
              <IconSpinner class="w-3 h-3" />
            </Show>
          </div>

          { /* Expand/Collapse icon */}
			<Show when={hasResults() && !isPending}>
            <div class="relative w-4 h-4">
              <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
              <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
            </div>
          </Show>
        </div>
      </div>

      { /* Results list - expandable */}
		<Show when={hasResults() && isExpanded()}>
        <div class="border-t border-border max-h-[200px] overflow-y-auto">
          <For each={results()}>{(result) => <a href={result.url} target="_blank" rel="noopener noreferrer" class="flex items-start gap-2 px-2.5 py-1.5 hover:bg-muted/50 transition-colors group">
            <ExternalLinkIcon class="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
            <div class="min-w-0 flex-1">
              <div class="text-xs text-foreground truncate">
                {result.title}
              </div>
              <div class="text-[10px] text-muted-foreground truncate">
                {result.url}
              </div>
            </div>
          </a>}</For>
        </div>
      </Show>
    </div>
	</Show>;
}
