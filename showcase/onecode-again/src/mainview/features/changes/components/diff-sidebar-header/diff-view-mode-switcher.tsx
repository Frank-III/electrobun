import { For, Show, splitProps } from "solid-js";
import { Check } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconSidePeek, IconCenterPeek, IconFullPage } from "@/components/ui/icons";
import type { DiffViewDisplayMode } from "@/lib/state/agents-store";
interface DiffViewModeSwitcherProps {
	mode: DiffViewDisplayMode;
	onModeChange: (mode: DiffViewDisplayMode) => void;
}
const MODES = [
	{
		value: "side-peek" as const,
		label: "Sidebar",
		Icon: IconSidePeek
	},
	{
		value: "center-peek" as const,
		label: "Dialog",
		Icon: IconCenterPeek
	},
	{
		value: "full-page" as const,
		label: "Fullscreen",
		Icon: IconFullPage
	}
];
export function DiffViewModeSwitcher(props: DiffViewModeSwitcherProps) {
	const [local] = splitProps(props, ["mode", "onModeChange"]);
	const currentMode = MODES.find((m) => m.value === local.mode) ?? MODES[0];
	const CurrentIcon = currentMode.Icon;
	return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10">
          <CurrentIcon class="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
		<DropdownMenuContent align="start" class="min-w-[140px]">
			<For each={MODES}>
				{({ value, label, Icon }) => (
					<DropdownMenuItem onClick={() => local.onModeChange(value)} class="flex items-center gap-2">
						<Icon class="size-4 text-muted-foreground" />
						<span class="flex-1">{label}</span>
						<Show when={local.mode === value}><Check class="size-4 text-muted-foreground ml-auto" /></Show>
					</DropdownMenuItem>
				)}
			</For>
		</DropdownMenuContent>
	</DropdownMenu>;
}
