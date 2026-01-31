import { createSignal, createEffect, createMemo, onCleanup } from "solid-js";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { PlanIcon, ExpandIcon, CollapseIcon, IconSpinner } from "@/components/ui/icons";
import { ChatMarkdownRenderer } from "@/components/chat-markdown-renderer";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "@/lib/desktop-rpc";
import { planContentCacheAtomFamily } from "../atoms";
import type { AgentMode } from "../../agents/atoms";
interface PlanWidgetProps {
	/** Chat ID for cache */
	chatId: string;
	/** Active sub-chat ID for plan fetching */
	activeSubChatId?: string | null;
	/** Path to the plan file */
	planPath: string | null;
	/** Plan refetch trigger */
	refetchTrigger?: number;
	/** Current agent mode (plan or agent) */
	mode?: AgentMode;
	/** Callback when "Approve" is clicked */
	onApprovePlan?: () => void;
	/** Callback when "View plan" is clicked - opens plan sidebar */
	onExpandPlan?: () => void;
}
/**
* Plan Widget for Details Sidebar
* Shows plan content with expand/collapse functionality
* Keeps original header buttons (View plan, Approve) and adds expand/collapse icon
* Memoized to prevent re-renders when parent updates
*/
export function PlanWidget({ chatId, activeSubChatId, planPath, refetchTrigger, mode = "agent", onApprovePlan, onExpandPlan }: PlanWidgetProps) {
	// Use activeSubChatId for fetching if available
	const effectiveChatId = activeSubChatId || chatId;
	// Expanded/collapsed state
	const [isExpanded, setIsExpanded] = createSignal(false);
	// Refs for scroll gradients
	const [contentRef, setContentRef] = createSignal<HTMLDivElement>(null);
	const [bottomGradientRef, setBottomGradientRef] = createSignal<HTMLDivElement>(null);
	// Plan content cache to avoid flashing loading state
	const [planCache, setPlanCache] = planContentCacheAtomFamily(effectiveChatId);
	// Fetch plan file content via desktop RPC
	const planQuery = useQuery(() => ({
		queryKey: ["files", "readFile", planPath] as const,
		queryFn: () => desktopRpc.files.readFile({ filePath: planPath! }),
		enabled: !!planPath,
	}));
	const planContent = () => planQuery.data;
	const refetch = () => planQuery.refetch();
	// Update cache when content loads successfully
	createEffect(() => {
		const content = planContent();
		if (content && planPath) {
			setPlanCache({
				content,
				planPath,
				isReady: true,
			});
		}
	});
	// Refetch when trigger changes
	createEffect(() => {
		if (refetchTrigger && planPath) {
			refetch();
		}
	});
	// Use cached content while loading new content to prevent flashing
	const displayContent = createMemo(() => {
		const content = planContent();
		if (content) return content;
		const cache = planCache;
		if (cache?.isReady && cache.planPath === planPath) {
			return cache.content;
		}
		return null;
	});
	// Only show loading if we have no content to display
	const showLoading = () => planQuery.isLoading && !displayContent();
	// Only show error if we have no content to display
	const showError = () => !!planQuery.error && !displayContent();
	// Toggle expand state
	const handleToggleExpand = (e: MouseEvent) => {
		e.stopPropagation();
		setIsExpanded((prev) => !prev);
	};
	// Update scroll gradient via DOM (no state, no re-renders)
	const updateScrollGradient = () => {
		const content = contentRef();
		const bottomGradient = bottomGradientRef();
		if (!content || !bottomGradient) return;
		const { scrollTop, scrollHeight, clientHeight } = content;
		const isScrollable = scrollHeight > clientHeight;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
		bottomGradient.style.opacity = isScrollable && !isAtBottom ? "1" : "0";
	};
	// Update gradient on scroll and content changes
	createEffect(() => {
		const content = contentRef();
		if (!content) return;
		content.addEventListener("scroll", updateScrollGradient);
		updateScrollGradient();
		onCleanup(() => content.removeEventListener("scroll", updateScrollGradient));
	});
	createEffect(() => {
		updateScrollGradient();
	});
	// No plan path - don't render anything
	if (!planPath) {
		return null;
	}
	return <div class="mx-2 mb-2">
      <div class="rounded-lg border border-border/50 overflow-hidden">
        {	/* Header - same as original WidgetCard but with expand button added */}
        <div class="flex items-center gap-2 px-2 h-8 select-none group bg-muted/30">
          <PlanIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span class="text-xs font-medium text-foreground flex-1">Plan</span>

          { /* Original buttons: View plan + Approve */}
          <div class="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => {
 e.stopPropagation();
		onExpandPlan?.();
	}} class="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground">
              View plan
            </Button>
            <Show when={mode === "plan" && onApprovePlan}>
              <Button size="sm" onClick={(e) => {
                e.stopPropagation();
                onApprovePlan();
              }} class="h-5 px-2 text-[10px] font-medium rounded transition-transform duration-150 active:scale-[0.97]">
                Approve
                <Kbd class="ml-1 text-primary-foreground/70">⌘↵</Kbd>
              </Button>
            </Show>
          </div>

          {	/* Expand/Collapse button */}
          <Button variant="ghost" size="icon" onClick={handleToggleExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label={isExpanded() ? "Collapse plan" : "Expand plan"}>
            <div class="relative w-3.5 h-3.5">
              <ExpandIcon class={cn("absolute inset-0 w-3.5 h-3.5 transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-0 scale-75" : "opacity-100 scale-100")} />
              <CollapseIcon class={cn("absolute inset-0 w-3.5 h-3.5 transition-[opacity,transform] duration-200 ease-out", isExpanded() ? "opacity-100 scale-100" : "opacity-0 scale-75")} />
            </div>
          </Button>
        </div>

        { /* Content */}
        <div>
          {showLoading() ? <div class="flex items-center justify-center py-8">
              <IconSpinner class="h-5 w-5 text-muted-foreground" />
            </div> : showError() ? <div class="px-3 py-4 text-center">
              <p class="text-xs text-muted-foreground">Failed to load plan</p>
            </div> : !displayContent() ? <div class="px-3 py-4 text-center">
              <p class="text-xs text-muted-foreground">No plan content</p>
            </div> : <div class="relative">
              <div ref={contentRef} class={cn("px-2 py-2 allow-text-selection", isExpanded() ? "" : "max-h-64 overflow-hidden")}>
                <ChatMarkdownRenderer content={displayContent()!} size="sm" />
              </div>

              { /* Bottom scroll gradient */}
              <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
 opacity: 1,
		background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)"
	}} />
            </div>}
        </div>
      </div>
    </div>;
}
