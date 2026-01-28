"use client";
import { createEffect, createMemo, onCleanup } from "solid-js";
import { useAtom } from "../../lib/state/jotai";
import { X } from "lucide-solid";
import { ResizableSidebar } from "@/components/ui/resizable-sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { expandedWidgetAtomFamily, expandedWidgetSidebarWidthAtom, WIDGET_REGISTRY, type WidgetId } from "./atoms";
import { InfoSection } from "./sections/info-section";
import { PlanSection } from "./sections/plan-section";
import { TerminalSection } from "./sections/terminal-section";
import { DiffSection } from "./sections/diff-section";
interface ExpandedWidgetSidebarProps {
	/** Workspace/chat ID */
	chatId: string;
	/** Worktree path for terminal */
	worktreePath: string | null;
	/** Plan path for plan section */
	planPath: string | null;
	/** Plan refetch trigger */
	planRefetchTrigger?: number;
	/** Active sub-chat ID for plan */
	activeSubChatId?: string | null;
	/** Diff-related props */
	canOpenDiff: boolean;
	isDiffSidebarOpen: boolean;
	setIsDiffSidebarOpen: (open: boolean) => void;
	diffStats?: {
		additions: number;
		deletions: number;
		fileCount: number;
	} | null;
}
export function ExpandedWidgetSidebar({ chatId, worktreePath, planPath, planRefetchTrigger, activeSubChatId, canOpenDiff, isDiffSidebarOpen, setIsDiffSidebarOpen, diffStats }: ExpandedWidgetSidebarProps) {
	// Per-workspace expanded widget state
	const expandedWidgetAtom = createMemo(() => expandedWidgetAtomFamily(chatId));
	const [expandedWidget, setExpandedWidget] = useAtom(expandedWidgetAtom);
	// Get widget config
	const widgetConfig = createMemo(() => WIDGET_REGISTRY.find((w) => w.id === expandedWidget));
	// Close sidebar callback
	const closeSidebar = () => {
		setExpandedWidget(null);
	};
	// Keyboard shortcut: Escape to close expanded sidebar
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Escape" && expandedWidget) {
				e.preventDefault();
				e.stopPropagation();
				closeSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Render the appropriate widget content based on expandedWidget
	const renderWidgetContent = () => {
		switch (expandedWidget) {
			case "info": return <InfoSection chatId={chatId} worktreePath={worktreePath} isExpanded />;
			case "plan": return <PlanSection chatId={activeSubChatId || chatId} planPath={planPath} refetchTrigger={planRefetchTrigger} isExpanded />;
			case "terminal": return worktreePath ? <TerminalSection chatId={chatId} cwd={worktreePath} workspaceId={chatId} isExpanded /> : null;
			case "diff": return <DiffSection chatId={chatId} isDiffSidebarOpen={isDiffSidebarOpen} setIsDiffSidebarOpen={setIsDiffSidebarOpen} diffStats={diffStats} isExpanded />;
			default: return null;
		}
	};
	return <ResizableSidebar isOpen={expandedWidget !== null} onClose={closeSidebar} widthAtom={expandedWidgetSidebarWidthAtom} side="right" minWidth={400} maxWidth={800} animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{
		"border-left-width": "0.5px",
		overflow: "hidden"
	}}>
      <div class="flex flex-col h-full min-w-0 overflow-hidden">
        {	/* Header */}
        <div class="flex items-center justify-between pl-3 pr-1.5 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
          <div class="flex items-center gap-2">
            {widgetConfig && <>
                <widgetConfig.icon class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">{widgetConfig.label}</span>
              </>}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={closeSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-muted-foreground hover:text-foreground flex-shrink-0 rounded-md" aria-label="Close">
                <X class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Close
              <Kbd>Esc</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        { /* Content */}
        <div class="flex-1 overflow-y-auto">
          {renderWidgetContent()}
        </div>
      </div>
    </ResizableSidebar>;
 }
