import { Button } from "../../../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { ChevronUp } from "lucide-solid";
import { IconSpinner } from "../../../../components/ui/icons";
import { cn } from "../../../../lib/utils";
interface CollapsedCommitBarProps {
	fileCount: number;
	stagedCount: number;
	currentBranch?: string;
	onToggle: () => void;
	onCommit: () => void;
	isCommitting?: boolean;
}
export function CollapsedCommitBar({ fileCount, stagedCount, currentBranch, onToggle, onCommit, isCommitting = false }: CollapsedCommitBarProps) {
	const canCommit = stagedCount > 0;
	const getCommitLabel = () => {
		if (stagedCount > 0 && currentBranch) {
			return `Commit ${stagedCount} to ${currentBranch}`;
		}
		if (currentBranch) {
			return `Commit to ${currentBranch}`;
		}
		return "Commit";
	};
	const getTooltip = () => {
		if (stagedCount === 0) return "No staged changes";
		if (isCommitting) return "AI is generating commit...";
		return "Commit staged changes with AI-generated message";
	};
	return <div class="flex flex-col border-t border-border/50 bg-background flex-shrink-0">
			{	/* Header trigger row - click to expand/collapse */}
			<button type="button" onClick={onToggle} class={cn("flex items-center gap-2 px-2 py-1.5 w-full", "hover:bg-muted/50 transition-colors", "text-left")}>
				<ChevronUp class="size-3.5 text-muted-foreground flex-shrink-0" />
				<span class="text-xs font-medium">Changes</span>
				<span class="text-xs text-muted-foreground">
					({fileCount} file{fileCount !== 1 ? "s" : ""})
				</span>
			</button>

			{ /* Full-width Commit button */}
			<div class="px-2 pb-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="default" size="sm" class="w-full h-7 text-xs gap-1.5" onClick={onCommit} disabled={!canCommit || isCommitting}>
							{isCommitting && <IconSpinner class="size-3.5" />}
							{getCommitLabel()}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="top">{getTooltip()}</TooltipContent>
				</Tooltip>
			</div>
		</div>;
 }
