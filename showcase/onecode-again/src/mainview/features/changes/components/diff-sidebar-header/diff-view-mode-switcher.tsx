"use client";
import { Check } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconSidePeek, IconCenterPeek, IconFullPage } from "@/components/ui/icons";
import type { DiffViewDisplayMode } from "@/features/agents/atoms";
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
export function DiffViewModeSwitcher({ mode, onModeChange }: DiffViewModeSwitcherProps) {
	const currentMode = MODES.find((m) => m.value === mode) ?? MODES[0];
	const CurrentIcon = currentMode.Icon;
	return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10">
          <CurrentIcon class="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="min-w-[140px]">
        {MODES.map(({ value, label, Icon }) => <DropdownMenuItem key={value} onClick={() => onModeChange(value)} class="flex items-center gap-2">
            <Icon class="size-4 text-muted-foreground" />
            <span class="flex-1">{label}</span>
            {mode === value && <Check class="size-4 text-muted-foreground ml-auto" />}
          </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>;
}
