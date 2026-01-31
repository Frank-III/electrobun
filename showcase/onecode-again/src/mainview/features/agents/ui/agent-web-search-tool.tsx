import { createSignal, createMemo } from "solid-js";
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
export function AgentWebSearchTool({ part, chatStatus }: AgentWebSearchToolProps) {
	const [isExpanded, setIsExpanded] = createSignal(false);
	const { isPending, isError, isInterrupted } = getToolStatus(part, chatStatus);
	const query = part.input?.query || "";
	const truncatedQuery = query.length > 40 ? query.slice(0, 37) + "..." : query;
	// Parse results from output
	const results = createMemo(() => {
		if (!part.output?.results) return [];
		// Results can be nested in content array
		const rawResults = part.output.results;
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
	const resultCount = results.length;
	const hasResults = resultCount > 0;
	// Show interrupted state if search was interrupted without completing
	if (isInterrupted && !hasResults) {
		return <AgentToolInterrupted toolName="Search" subtitle={truncatedQuery} />;
	}
	return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {	/* Header - clickable to toggle expand */}
      <div onClick={() => hasResults && !isPending && setIsExpanded(!isExpanded)} class={cn("flex items-center justify-between px-2.5 h-7", hasResults && !isPending && "cursor-pointer hover:bg-muted/50 transition-colors duration-150")}>
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <SearchIcon class="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          
          {isPending ? <TextShimmer as="span" duration={1.2} class="text-xs text-muted-foreground">
              Searching
            </TextShimmer> : <span class="text-xs text-muted-foreground">Searched</span>}
          
          <span class="truncate text-foreground">
            {truncatedQuery}
          </span>
        </div>

        { /* Status and expand button */}
        <div class="flex items-center gap-2 flex-shrink-0 ml-2">
          <div class="flex items-center gap-1.5 text-xs">
            {isPending ? <IconSpinner class="w-3 h-3" /> : isError ? <span class="text-destructive">Failed</span> : <span class="text-muted-foreground">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </span>}
          </div>

          { /* Expand/Collapse icon */}
          {hasResults && !isPending && <div class="relative w-4 h-4">
              <ExpandIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
              <CollapseIcon class={cn("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
            </div>}
        </div>
      </div>

      { /* Results list - expandable */}
      {hasResults && isExpanded() && <div class="border-t border-border max-h-[200px] overflow-y-auto">
          {results.map((result, idx) => <a key={idx} href={result.url} target="_blank" rel="noopener noreferrer" class="flex items-start gap-2 px-2.5 py-1.5 hover:bg-muted/50 transition-colors group">
              <ExternalLinkIcon class="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
              <div class="min-w-0 flex-1">
                <div class="text-xs text-foreground truncate">
                  {result.title}
                </div>
                <div class="text-[10px] text-muted-foreground truncate">
                  {result.url}
                </div>
              </div>
            </a>)}
        </div>}
    </div>;
}
