import type { JSX } from "solid-js";
import { createContext, useContext, Switch, Match } from "solid-js";
import { Button } from "../../../components/ui/button";
import { ResizableSidebar } from "../../../components/ui/resizable-sidebar";
import { IconCloseSidebarRight } from "../../../components/ui/icons";
import { DiffSidebarHeader } from "../../changes/components/diff-sidebar-header";
import { DiffCenterPeekDialog } from "../../changes/components/diff-center-peek-dialog";
import { DiffFullPageView } from "../../changes/components/diff-full-page-view";
import { agentsDiffSidebarWidthAtom } from "../atoms";
import type { AgentDiffViewRef } from "../ui/agent-diff-view";
import type { DiffViewMode } from "../ui/agent-diff-view";

export type Ref<T> = (el: T) => void;

// DiffStateContext - isolates diff state management to prevent ChatView re-renders
export interface DiffStateContextValue {
	selectedFilePath: string | null;
	filteredSubChatId: string | null;
	viewedCount: number;
	handleDiffFileSelect: (file: { path: string }, category: string) => void;
	handleSelectNextFile: (filePath: string) => void;
	handleCommitSuccess: () => void;
	handleCloseDiff: () => void;
	handleViewedCountChange: (count: number) => void;
	resetActiveTabRef: (() => void) | null;
	setResetActiveTabRef: (fn: (() => void) | null) => void;
}

export const DiffStateContext = createContext<DiffStateContextValue | null>(null);

export function useDiffState() {
	const ctx = useContext(DiffStateContext);
	if (!ctx) throw new Error("useDiffState must be used within DiffStateProvider");
	return ctx;
}

export interface DiffSidebarRendererProps {
	worktreePath: string | null;
	chatId: string;
	sandboxId: string | null;
	repository: { owner: string; name: string } | null;
	diffStats: { isLoading: boolean; hasChanges: boolean; fileCount: number; additions: number; deletions: number };
	branchData: { current: string } | undefined;
	gitStatus: { pushCount?: number; pullCount?: number; hasUpstream?: boolean; ahead?: number; behind?: number } | undefined;
	isGitStatusLoading: boolean;
	isDiffSidebarOpen: boolean;
	diffDisplayMode: "side-peek" | "center-peek" | "full-page";
	diffSidebarWidth: number;
	diffViewRef: Ref<AgentDiffViewRef | null>;
	diffSidebarRef: Ref<HTMLDivElement | null>;
	handleReview: () => void;
	isReviewing: boolean;
	handleCreatePr: () => void;
	isCreatingPr: boolean;
	handleMergePr: () => void;
	mergePrMutation: { isPending: boolean };
	handleRefreshGitStatus: () => void;
	hasPrNumber: boolean;
	isPrOpen: boolean;
	hasMergeConflicts: boolean;
	handleFixConflicts: () => void;
	handleExpandAll: () => void;
	handleCollapseAll: () => void;
	diffMode: DiffViewMode;
	setDiffMode: (mode: DiffViewMode) => void;
	handleMarkAllViewed: () => void;
	handleMarkAllUnviewed: () => void;
	isDesktop: boolean;
	isFullscreen: boolean;
	setDiffDisplayMode: (mode: "side-peek" | "center-peek" | "full-page") => void;
	handleCommitToPr: (selectedPaths?: string[]) => void;
	isCommittingToPr: boolean;
	children: JSX.Element;
}

export function DiffSidebarRenderer(props: DiffSidebarRendererProps) {
	const { handleCloseDiff, viewedCount, handleViewedCountChange } = useDiffState();
	const effectiveWidth =
		props.diffDisplayMode === "side-peek"
			? props.diffSidebarWidth
			: props.diffDisplayMode === "center-peek"
				? 1200
				: typeof window !== "undefined"
					? window.innerWidth
					: 1200;
	const diffViewContent = (
		<div ref={props.diffSidebarRef} class="flex flex-col h-full min-w-0 overflow-hidden">
			<Switch>
				<Match when={props.worktreePath}>
					<DiffSidebarHeader
						worktreePath={props.worktreePath!}
						currentBranch={props.branchData?.current ?? ""}
						diffStats={props.diffStats}
						sidebarWidth={effectiveWidth}
						pushCount={props.gitStatus?.pushCount ?? 0}
						pullCount={props.gitStatus?.pullCount ?? 0}
						hasUpstream={props.gitStatus?.hasUpstream ?? true}
						isSyncStatusLoading={props.isGitStatusLoading}
						aheadOfDefault={props.gitStatus?.ahead ?? 0}
						behindDefault={props.gitStatus?.behind ?? 0}
						onReview={props.handleReview}
						isReviewing={props.isReviewing}
						onCreatePr={props.handleCreatePr}
						isCreatingPr={props.isCreatingPr}
						onCreatePrWithAI={props.handleCreatePr}
						isCreatingPrWithAI={props.isCreatingPr}
						onMergePr={props.handleMergePr}
						isMergingPr={props.mergePrMutation.isPending}
						onClose={handleCloseDiff}
						onRefresh={props.handleRefreshGitStatus}
						hasPrNumber={props.hasPrNumber}
						isPrOpen={props.isPrOpen}
						hasMergeConflicts={props.hasMergeConflicts}
						onFixConflicts={props.handleFixConflicts}
						onExpandAll={props.handleExpandAll}
						onCollapseAll={props.handleCollapseAll}
						viewMode={props.diffMode}
						onViewModeChange={props.setDiffMode}
						viewedCount={viewedCount}
						onMarkAllViewed={props.handleMarkAllViewed}
						onMarkAllUnviewed={props.handleMarkAllUnviewed}
						isDesktop={props.isDesktop}
						isFullscreen={props.isFullscreen}
						displayMode={props.diffDisplayMode}
						onDisplayModeChange={props.setDiffDisplayMode}
					/>
				</Match>
				<Match when={props.sandboxId}>
					<div class="flex items-center h-10 px-2 border-b border-border/50 bg-background flex-shrink-0">
						<Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10" onClick={handleCloseDiff}>
							<IconCloseSidebarRight class="size-4 text-muted-foreground" />
						</Button>
						<span class="text-sm text-muted-foreground ml-2">Changes</span>
					</div>
				</Match>
			</Switch>
			{props.children}
		</div>
	);
	if (props.diffDisplayMode === "side-peek") {
		return (
			<ResizableSidebar
				isOpen={props.isDiffSidebarOpen}
				onClose={handleCloseDiff}
				widthAtom={agentsDiffSidebarWidthAtom}
				minWidth={320}
				side="right"
				animationDuration={0}
				initialWidth={0}
				exitWidth={0}
				showResizeTooltip={true}
				class="bg-background border-l"
				style={{ "border-left-width": "0.5px", overflow: "hidden" } as Record<string, string>}
			>
				{diffViewContent}
			</ResizableSidebar>
		);
	}
	if (props.diffDisplayMode === "center-peek") {
		return <DiffCenterPeekDialog isOpen={props.isDiffSidebarOpen} onClose={handleCloseDiff}>{diffViewContent}</DiffCenterPeekDialog>;
	}
	if (props.diffDisplayMode === "full-page") {
		return <DiffFullPageView isOpen={props.isDiffSidebarOpen} onClose={handleCloseDiff}>{diffViewContent}</DiffFullPageView>;
	}
	return null;
}
