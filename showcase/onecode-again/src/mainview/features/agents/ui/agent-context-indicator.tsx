import { mergeProps, Show, splitProps } from "solid-js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { cn } from "../../../lib/utils";
// Claude model context windows
const CONTEXT_WINDOWS = {
	opus: 2e5,
	sonnet: 2e5,
	haiku: 2e5
} as const;
type ModelId = keyof typeof CONTEXT_WINDOWS;
// Pre-computed token data to avoid re-computing on every render
export interface MessageTokenData {
	totalInputTokens: number;
	totalOutputTokens: number;
	totalCostUsd: number;
	messageCount: number;
}
interface AgentContextIndicatorProps {
	tokenData: MessageTokenData;
	modelId?: ModelId;
	class?: string;
	onCompact?: () => void;
	isCompacting?: boolean;
	disabled?: boolean;
}
function formatTokens(tokens: number): string {
	if (tokens >= 1e6) {
		return `${(tokens / 1e6).toFixed(1)}M`;
	}
	if (tokens >= 1e3) {
		return `${(tokens / 1e3).toFixed(1)}K`;
	}
	return tokens.toString();
}
// Circular progress component
function CircularProgress(props: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	class?: string;
}) {
	const merged = mergeProps({ size: 18, strokeWidth: 2 }, props);
	const [local] = splitProps(merged, ["percent", "size", "strokeWidth", "class"]);
	const radius = (local.size - local.strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - local.percent / 100 * circumference;
	return <svg width={local.size} height={local.size} class={cn("transform -rotate-90",local.class)}>
      {	/* Background circle */}
		<circle cx={local.size / 2} cy={local.size / 2} r={radius} fill="none" stroke="currentColor" stroke-width={local.strokeWidth} class="text-muted-foreground/20" />
      { /* Progress circle */}
		<circle cx={local.size / 2} cy={local.size / 2} r={radius} fill="none" stroke="currentColor" stroke-width={local.strokeWidth} stroke-dasharray={circumference} stroke-dashoffset={offset} stroke-linecap="round" class="transition-all duration-300 text-muted-foreground/60" />
    </svg>;
 }
export function AgentContextIndicator(props: AgentContextIndicatorProps) {
	const merged = mergeProps({ modelId: "sonnet" }, props);
	const [local] = splitProps(merged, ["tokenData", "modelId", "class", "onCompact", "isCompacting", "disabled"]);
	const totalTokens = local.tokenData.totalInputTokens + local.tokenData.totalOutputTokens;
	const contextWindow = CONTEXT_WINDOWS[local.modelId];
	const percentUsed = Math.min(100, totalTokens / contextWindow * 100);
	const isEmpty = totalTokens === 0;
	const isClickable = local.onCompact && !local.disabled && !local.isCompacting;
	return <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
		<div onClick={isClickable ? local.onCompact : undefined} class={cn("h-4 w-4 flex items-center justify-center", isClickable ? "cursor-pointer hover:opacity-70 transition-opacity" : "cursor-default", local.disabled && "opacity-50",local.class)}>
			<CircularProgress percent={percentUsed} size={14} stroke-width={2.5} class={local.isCompacting ? "animate-pulse" : undefined} />
		</div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p class="text-xs">
          <Show when={!isEmpty} fallback={
              <span class="text-muted-foreground">
                Context: 0 / {formatTokens(contextWindow)}
              </span>
            }>
              <span class="font-mono font-medium text-foreground">
                {percentUsed.toFixed(1)}%
              </span>
              <span class="text-muted-foreground mx-1">·</span>
              <span class="text-muted-foreground">
                {formatTokens(totalTokens)} /{" "}
                {formatTokens(contextWindow)} context
              </span>
            </Show>
        </p>
      </TooltipContent>
    </Tooltip>;
}
