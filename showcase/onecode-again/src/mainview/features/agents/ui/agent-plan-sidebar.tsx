import { createEffect, createMemo, Show, mergeProps, splitProps } from "solid-js";
import { Button } from "../../../components/ui/button";
import { IconDoubleChevronRight, IconSpinner, PlanIcon } from "../../../components/ui/icons";
import { Kbd } from "../../../components/ui/kbd";
import { ChatMarkdownRenderer } from "../../../components/chat-markdown-renderer";
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import type { AgentMode } from "../atoms";
interface AgentPlanSidebarProps {
	chatId: string;
	planPath: string | null;
	onClose: () => void;
	onBuildPlan?: () => void;
	/** Timestamp that triggers refetch when changed (e.g., after plan Edit completes) */
	refetchTrigger?: number;
	/** Current agent mode (plan or agent) */
	mode?: AgentMode;
}
export function AgentPlanSidebar(props: AgentPlanSidebarProps) {
	const merged = mergeProps({ mode: "agent" }, props);
	const [local] = splitProps(merged, ["chatId", "planPath", "onClose", "onBuildPlan", "refetchTrigger", "mode"]);
	// Fetch plan file content
	const planFileQuery = useQuery(() => ({
		queryKey: ["files", "readFile", local.planPath, local.refetchTrigger],
		queryFn: () => desktopRpc.files.readFile({ filePath: local.planPath! }),
		enabled: !!local.planPath,
	}));
	const planContent = () => planFileQuery.data;
	const isLoading = () => planFileQuery.isLoading;
	const error = () => planFileQuery.error;
	const refetch = () => planFileQuery.refetch();
	// Refetch when trigger changes
	createEffect(() => {
		if (local.refetchTrigger && local.planPath) {
			refetch();
		}
	});
	// Extract plan title from markdown (first H1)
	const planTitle = createMemo(() => {
		const content = planContent();
		if (!content) return "Plan";
		const match = content.match(/^#\s+(.+)$/m);
		return match ? match[1] : "Plan";
	});
	return <div class="flex flex-col h-full bg-tl-background">
      {	/* Header */}
	      <div class="flex items-center justify-between px-2 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
	        <div class="flex items-center gap-2 min-w-0 flex-1">
	          <Button variant="ghost" size="icon" onClick={local.onClose} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close plan">
	            <IconDoubleChevronRight class="h-4 w-4" />
	          </Button>
	          <span class="text-sm font-medium truncate">{planTitle()}</span>
	        </div>
	        <div class="flex items-center gap-1 flex-shrink-0">
	          { /* Approve Plan button - only show in plan mode */}
	          <Show when={local.mode === "plan" && local.onBuildPlan}>
	            <Button size="sm" class="h-6 px-3 text-xs font-medium rounded-md transition-transform duration-150 active:scale-[0.97]" onClick={local.onBuildPlan}>
	              Approve
	              <Kbd class="ml-1.5 text-primary-foreground/70">⌘↵</Kbd>
	            </Button>
	          </Show>
	        </div>
	      </div>

      { /* Content */}
	      <div class="flex-1 overflow-y-auto">
	        <Show when={isLoading()} fallback={<Show when={error()} fallback={<Show when={!local.planPath} fallback={<div class="px-4 py-3 allow-text-selection" data-plan-path={local.planPath}>
	          <ChatMarkdownRenderer content={planContent() || ""} size="sm" />
	        </div>}>
          <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="text-muted-foreground mb-4">
              <PlanIcon class="h-12 w-12 opacity-50" />
            </div>
            <p class="text-sm text-muted-foreground mb-2">
              No plan selected
            </p>
            <p class="text-xs text-muted-foreground/70 max-w-[250px]">
              Click "View plan" on a plan file to preview it here
            </p>
          </div>
        </Show>}>
          <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <div class="text-muted-foreground mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-50">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground mb-2">
              Failed to load plan
            </p>
            <p class="text-xs text-muted-foreground/70 max-w-[300px]">
              {error()?.message || "The plan file could not be read"}
            </p>
          </div>
        </Show>}>
          <div class="flex flex-col items-center justify-center h-full p-6 text-center">
            <IconSpinner class="h-8 w-8 text-muted-foreground mb-3" />
            <p class="text-sm text-muted-foreground">Loading plan...</p>
          </div>
        </Show>
      </div>
    </div>;
 }
