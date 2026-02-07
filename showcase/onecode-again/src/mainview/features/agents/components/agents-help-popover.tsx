import type { JSX } from "solid-js";
import { createSignal, createMemo, mergeProps, Show } from "solid-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { KeyboardIcon } from "../../../components/ui/icons";
import { DiscordIcon } from "../../../icons";
import { agentsSettingsDialogOpenAtom, agentsSettingsDialogActiveTabAtom } from "../../../lib/atoms";
import { desktopRpc } from "../../../lib/desktop-rpc";
interface AgentsHelpPopoverProps {
	children: JSX.Element;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	isMobile?: boolean;
}
export function AgentsHelpPopover(rawProps: AgentsHelpPopoverProps) {
	const props = mergeProps({ isMobile: false }, rawProps);
	const [internalOpen, setInternalOpen] = createSignal(false);
	const setSettingsDialogOpen = agentsSettingsDialogOpenAtom[1];
	const setSettingsActiveTab = agentsSettingsDialogActiveTabAtom[1];
	// Use controlled state if provided, otherwise use internal state
	const isOpen = createMemo(() => props.open ?? internalOpen());
	const setOpen = (open: boolean) => (props.onOpenChange ?? setInternalOpen)(open);
	const handleCommunityClick = () => {
		desktopRpc.external.openExternal.mutate({ url: "https://discord.gg/8ektTZGnj4" });
	};
	const handleKeyboardShortcutsClick = () => {
		setOpen(false);
		setSettingsActiveTab("keyboard");
		setSettingsDialogOpen(true);
	};
	return <DropdownMenu open={isOpen()} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" class="w-36">
        <DropdownMenuItem onClick={handleCommunityClick} class="gap-2">
          <DiscordIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span class="flex-1">Discord</span>
        </DropdownMenuItem>

        <Show when={!props.isMobile}>
          <DropdownMenuItem onClick={handleKeyboardShortcutsClick} class="gap-2">
            <KeyboardIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span class="flex-1">Shortcuts</span>
          </DropdownMenuItem>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>;
}
