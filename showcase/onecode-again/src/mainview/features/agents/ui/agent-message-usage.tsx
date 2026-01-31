import { Show } from "solid-js";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../components/ui/hover-card";
import { cn } from "../../../lib/utils";
export interface AgentMessageMetadata {
	sessionId?: string;
	totalCostUsd?: number;
	inputTokens?: number;
	outputTokens?: number;
	totalTokens?: number;
	finalTextId?: string;
	durationMs?: number;
	resultSubtype?: string;
}
interface AgentMessageUsageProps {
	metadata?: AgentMessageMetadata;
	isStreaming?: boolean;
	isMobile?: boolean;
}
function formatTokens(tokens: number): string {
	if (tokens >= 1e3) {
		return `${(tokens / 1e3).toFixed(1)}k`;
	}
	return tokens.toString();
}
function formatDuration(ms: number): string {
	if (ms < 1e3) {
		return `${ms}ms`;
	}
	const seconds = ms / 1e3;
	if (seconds < 60) {
		return `${seconds.toFixed(1)}s`;
	}
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.round(seconds % 60);
	return `${minutes}m ${remainingSeconds}s`;
}
export function AgentMessageUsage(props: AgentMessageUsageProps) {
	const metadata = () => props.metadata;
	const isStreaming = () => props.isStreaming ?? false;
	const isMobile = () => props.isMobile ?? false;
	const hasUsage = () => {
		const m = metadata();
		if (!m) return false;
		const { inputTokens = 0, outputTokens = 0, totalTokens = 0 } = m;
		return inputTokens > 0 || outputTokens > 0 || totalTokens > 0;
	};
	const displayTokens = () => {
		const m = metadata();
		if (!m) return 0;
		const { inputTokens = 0, outputTokens = 0, totalTokens = 0 } = m;
		return totalTokens || inputTokens + outputTokens;
	};
	return (
		<Show when={metadata() && !isStreaming() && hasUsage()} fallback={null}>
			<HoverCard openDelay={400} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button tabIndex={-1} class={cn("h-5 px-1.5 flex items-center text-[10px] rounded-md", "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50", "transition-[background-color,transform] duration-150 ease-out")}>
          <span class="font-mono">{formatTokens(displayTokens())}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent sideOffset={4} align="end" class="w-auto pt-2 px-2 pb-0 shadow-sm rounded-lg border-border/50 overflow-hidden">
        <div class="space-y-1.5 pb-2">
          {/* Status & Duration group */}
          {(() => {
            const m = metadata();
            const resultSubtype = m?.resultSubtype;
            const durationMs = m?.durationMs;
            return <Show when={resultSubtype || (durationMs !== undefined && durationMs > 0)}>
              <div class="space-y-1">
                <Show when={resultSubtype}>
                  <div class="flex justify-between text-xs gap-4">
                    <span class="text-muted-foreground">Status:</span>
                    <span class="font-mono text-foreground">
                      {resultSubtype === "success" ? "Success" : "Failed"}
                    </span>
                  </div>
                </Show>
                <Show when={durationMs !== undefined && durationMs > 0}>
                  <div class="flex justify-between text-xs gap-4">
                    <span class="text-muted-foreground">Duration:</span>
                    <span class="font-mono text-foreground">
                      {formatDuration(durationMs!)}
                    </span>
                  </div>
                </Show>
              </div>
            </Show>;
          })()}

          { /* Tokens group */}
          <Show when={displayTokens() > 0}>
            <div class="flex justify-between text-xs gap-4 pt-1.5 mt-1 border-t border-border/50">
              <span class="text-muted-foreground">Tokens:</span>
              <span class="font-mono font-medium text-foreground">
                {displayTokens().toLocaleString()}
              </span>
            </div>
          </Show>
        </div>
      </HoverCardContent>
    </HoverCard>
		</Show>
	);
}
