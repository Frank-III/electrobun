import { Show, splitProps } from "solid-js";
import { Button } from "../../../../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { Folder, FolderTree } from "lucide-solid";
import type { ChangesViewMode } from "../../types";
interface ViewModeToggleProps {
	viewMode: ChangesViewMode;
	onViewModeChange: (mode: ChangesViewMode) => void;
}
export function ViewModeToggle(props: ViewModeToggleProps) {
	const [local] = splitProps(props, ["viewMode", "onViewModeChange"]);
	const handleToggle = () => {
		local.onViewModeChange(local.viewMode === "grouped" ? "tree" : "grouped");
	};
	return <Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon" onClick={handleToggle} class="size-6 p-0" aria-label={local.viewMode === "grouped" ? "Grouped view" : "Tree view"}>
					<Show when={local.viewMode === "grouped"} fallback={<FolderTree class="size-3.5" />}>
						<Folder class="size-3.5" />
					</Show>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom" showArrow={false}>
				<Show when={local.viewMode === "grouped"} fallback="Switch to grouped view">
					Switch to tree view
				</Show>
			</TooltipContent>
		</Tooltip>;
}
