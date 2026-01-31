import type { JSX } from "solid-js";
import { createSignal } from "solid-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { KeyboardIcon } from "../../../components/ui/icons";
import { DiscordIcon } from "../../../icons";
import { agentsSettingsDialogOpenAtom, agentsSettingsDialogActiveTabAtom } from "../../../lib/atoms";
interface AgentsHelpPopoverProps {
	children: JSX.Element;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	isMobile?: boolean;
}
export function AgentsHelpPopover({ children, open: controlledOpen, onOpenChange: controlledOnOpenChange, isMobile = false }: AgentsHelpPopoverProps) {
	const [internalOpen, setInternalOpen] = createSignal(false);
	const setSettingsDialogOpen = agentsSettingsDialogOpenAtom[1];
	const setSettingsActiveTab = agentsSettingsDialogActiveTabAtom[1];
	// Use controlled state if provided, otherwise use internal state
	const open = controlledOpen ?? internalOpen;
	const setOpen = controlledOnOpenChange ?? setInternalOpen;
	const handleCommunityClick = () => {
		window.open("https://discord.gg/8ektTZGnj4", "_blank");
	};
	const handleKeyboardShortcutsClick = () => {
		setOpen(false);
		setSettingsActiveTab("keyboard");
		setSettingsDialogOpen(true);
	};
	return <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" class="w-36">
        <DropdownMenuItem onClick={handleCommunityClick} class="gap-2">
          <DiscordIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span class="flex-1">Discord</span>
        </DropdownMenuItem>

        {!isMobile && <DropdownMenuItem onClick={handleKeyboardShortcutsClick} class="gap-2">
            <KeyboardIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span class="flex-1">Shortcuts</span>
          </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>;
}
