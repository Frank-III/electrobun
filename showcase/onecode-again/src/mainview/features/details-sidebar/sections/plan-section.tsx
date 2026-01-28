"use client";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { useAtom } from "../../../lib/state/jotai";
import { IconSpinner, PlanIcon } from "@/components/ui/icons";
import { ChatMarkdownRenderer } from "@/components/chat-markdown-renderer";
import { trpc } from "@/lib/trpc";
import { planContentCacheAtomFamily } from "../atoms";
interface PlanSectionProps {
	chatId: string;
	planPath: string | null;
	refetchTrigger?: number;
	isExpanded?: boolean;
}
/**
* Plan Section for Details Sidebar
* Memoized to prevent re-renders when parent updates
* Uses caching to show content instantly when switching workspaces
*/
export function PlanSection({ chatId, planPath, refetchTrigger, isExpanded = false }: PlanSectionProps) {
	// Refs for scroll gradients (avoid re-renders)
	const [contentRef, setContentRef] = createSignal<HTMLDivElement>(null);
	const [topGradientRef, setTopGradientRef] = createSignal<HTMLDivElement>(null);
	const [bottomGradientRef, setBottomGradientRef] = createSignal<HTMLDivElement>(null);
	// Plan content cache to avoid flashing loading state
	const [planCache, setPlanCache] = useAtom(planContentCacheAtomFamily(chatId));
	// Fetch plan file content using tRPC
	const { data: planContent, isLoading, error, refetch } = trpc.files.readFile.useQuery({ filePath: planPath! }, { enabled: !!planPath });
	// Update cache when content loads successfully
	createEffect(() => {
		if (planContent && planPath) {
			setPlanCache({
				content: planContent,
				planPath,
				isReady: true
			});
		}
	});
	// Clear cache when plan path changes to a different file
	createEffect(() => {
		if (planPath && planCache && planCache.planPath !== planPath) {}
	});
	// Refetch when trigger changes
	createEffect(() => {
		if (refetchTrigger && planPath) {
			refetch();
		}
	});
	// Update scroll gradients via DOM (no state, no re-renders)
	const updateScrollGradients = () => {
		const content = contentRef.current;
		const topGradient = topGradientRef.current;
		const bottomGradient = bottomGradientRef.current;
		if (!content || !topGradient || !bottomGradient) return;
		const { scrollTop, scrollHeight, clientHeight } = content;
		const isScrollable = scrollHeight > clientHeight;
		const isAtTop = scrollTop <= 1;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
		// Show top gradient when scrolled down
		topGradient.style.opacity = isScrollable && !isAtTop ? "1" : "0";
		// Show bottom gradient when not at bottom
		bottomGradient.style.opacity = isScrollable && !isAtBottom ? "1" : "0";
	};
	// Update gradients on scroll
	createEffect(() => {
		const content = contentRef.current;
		if (!content) return;
		content.addEventListener("scroll", updateScrollGradients);
		// Initial check
		updateScrollGradients();
		onCleanup(() => content.removeEventListener("scroll", updateScrollGradients));
	});
	// Also update gradients when content changes
	createEffect(() => {
		updateScrollGradients();
	});
	// Use cached content while loading new content to prevent flashing
	// Show cached content if: loading new content OR error occurred but we have cache
	const displayContent = createMemo(() => {
		// If we have fresh content, use it
		if (planContent) return planContent;
		// If loading or error, use cached content (same plan path)
		if (planCache?.isReady && planCache.planPath === planPath) {
			return planCache.content;
		}
		return null;
	});
	// Only show loading if we have no content to display at all
	const showLoading = isLoading && !displayContent;
	// Only show error if we have no content to display at all
	const showError = error && !displayContent;
	// Extract plan title from markdown (first H1)
	const planTitle = createMemo(() => {
		if (!displayContent) return "Plan";
		const match = displayContent.match(/^#\s+(.+)$/m);
		return match ? match[1] : "Plan";
	});
	// No plan path - don't render anything (parent should hide the widget)
	if (!planPath) {
		return null;
	}
	// Show loading only if we have no cached content
	if (showLoading) {
		return <div class="flex items-center justify-center py-8">
        <IconSpinner class="h-5 w-5 text-muted-foreground" />
      </div>;
	}
	// Show error only if we have no cached content
	if (showError) {
		return <div class="px-3 py-4 text-center">
        <p class="text-xs text-muted-foreground">
          Failed to load plan
        </p>
      </div>;
	}
	// No content at all (shouldn't happen if planPath is set)
	if (!displayContent) {
		return null;
	}
	return <div class="flex flex-col">
      {	/* Plan content with scroll gradients */}
      <div class="relative">
        { /* Top scroll gradient - matches header bg (muted/30) */}
        <div ref={topGradientRef} class="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
 opacity: 0,
		background: "linear-gradient(to bottom, color-mix(in srgb, hsl(var(--muted)) 30%, hsl(var(--background))) 0%, transparent 100%)"
	}} />

        <div ref={contentRef} class={`px-2 py-2 overflow-y-auto allow-text-selection ${isExpanded ? "" : "max-h-64"}`} data-plan-path={planPath}>
          <ChatMarkdownRenderer content={displayContent} size="sm" />
        </div>

        {	/* Bottom scroll gradient */}
        <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
 opacity: 1,
		background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)"
	}} />
      </div>
    </div>;
}
