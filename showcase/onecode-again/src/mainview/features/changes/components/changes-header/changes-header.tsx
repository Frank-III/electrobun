import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { createSignal, For, Show, onCleanup } from "solid-js";
import { RefreshCw } from "lucide-solid";
import { IconSpinner } from "../../../../icons";
import { trpc } from "../../../../lib/trpc";
import { PRIcon } from "../pr-icon";
import { usePRStatus } from "../../../../hooks/usePRStatus";
import { useChangesStore } from "../../../../lib/stores/changes-store";
import type { ChangesViewMode } from "../../types";
import { ViewModeToggle } from "../view-mode-toggle";
interface ChangesHeaderProps {
	onRefresh: () => void;
	viewMode: ChangesViewMode;
	onViewModeChange: (mode: ChangesViewMode) => void;
	worktreePath: string;
}
export function ChangesHeader({ onRefresh, viewMode, onViewModeChange, worktreePath }: ChangesHeaderProps) {
	const [isManualRefresh, setIsManualRefresh] = createSignal(false);
	let timeoutRef: ReturnType<typeof setTimeout> | undefined;
	const handleRefresh = () => {
		setIsManualRefresh(true);
		onRefresh();
		// Clear any existing timeout
		if (timeoutRef) {
			clearTimeout(timeoutRef);
		}
		// Stop spinning after a short delay
		timeoutRef = setTimeout(() => {
			setIsManualRefresh(false);
		}, 600);
	};
	// Cleanup timeout on unmount
	onCleanup(() => {
		if (timeoutRef) {
			clearTimeout(timeoutRef);
		}
	});
	const { baseBranch, setBaseBranch } = useChangesStore();
	const { data: branchData, isLoading } = trpc.changes.getBranches.useQuery({ worktreePath }, { enabled: !!worktreePath });
	const { pr, isLoading: isPRLoading } = usePRStatus({
		worktreePath,
		refetchInterval: 1e4
	});
	const effectiveBaseBranch = baseBranch ?? branchData?.defaultBranch ?? "main";
	const availableBranches = branchData?.remote ?? [];
	const sortedBranches = [...availableBranches].sort((a, b) => {
		if (a === branchData?.defaultBranch) return -1;
		if (b === branchData?.defaultBranch) return 1;
		return a.localeCompare(b);
	});
	const handleChange = (value: string) => {
		if (value === branchData?.defaultBranch && baseBranch === null) {
			return;
		}
		setBaseBranch(value);
	};
	return <div class="flex items-center justify-between gap-1.5 px-2 py-1.5">
			<div class="flex items-center gap-1 min-w-0 flex-1">
				<span class="text-[10px] text-muted-foreground shrink-0">
					Base:
				</span>
				<Show when={!isLoading && branchData} fallback={<span class="px-1.5 py-0.5 rounded bg-muted/50 text-foreground text-[10px] font-medium truncate">{effectiveBaseBranch}</span>}>
					<Tooltip>
						<Select value={effectiveBaseBranch} onValueChange={handleChange}>
							<TooltipTrigger asChild>
								<SelectTrigger class="h-5 px-1.5 py-0 text-[10px] font-medium border-none bg-muted/50 hover:bg-muted text-foreground min-w-0 w-auto gap-0.5 rounded">
									<SelectValue />
								</SelectTrigger>
							</TooltipTrigger>
							<SelectContent align="start">
								<For each={sortedBranches.filter((branch) => branch)}>
									{(branch) => <SelectItem value={branch} class="text-xs">
										{branch}
										<Show when={branch === branchData?.defaultBranch}>
											<span class="ml-1 text-muted-foreground">(default)</span>
										</Show>
									</SelectItem>}
								</For>
							</SelectContent>
						</Select>
						<TooltipContent side="bottom" showArrow={false}>Change base branch</TooltipContent>
					</Tooltip>
				</Show>
			</div>
			<div class="flex items-center shrink-0">
				<ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isManualRefresh()} class="size-6 p-0">
							<RefreshCw class={`size-3.5 ${isManualRefresh() ? "animate-spin" : ""}`} />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom" showArrow={false}>Refresh changes</TooltipContent>
				</Tooltip>

				{	/* PR Status Icon */}
				<Show when={isPRLoading}>
					<IconSpinner class="w-4 h-4 text-muted-foreground shrink-0" />
				</Show>
				<Show when={!isPRLoading && pr}>
					{(prData) => <Tooltip>
						<TooltipTrigger asChild>
							<a href={prData().url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
								<PRIcon state={prData().state} class="w-4 h-4" />
								<span class="text-xs text-muted-foreground font-mono">#{prData().number}</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side="bottom" showArrow={false}>View PR on GitHub</TooltipContent>
					</Tooltip>}
				</Show>
			</div>
		</div>;
 }
