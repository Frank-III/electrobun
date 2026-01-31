import { Show, mergeProps, splitProps } from "solid-js";
import { Button } from "../../../components/ui/button";
import { AlignJustify } from "lucide-solid";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../components/ui/tooltip";
import { Kbd } from "../../../components/ui/kbd";
import { useResolvedHotkeyDisplay } from "../../../lib/hotkeys";
interface AgentsHeaderControlsProps {
	isSidebarOpen: boolean;
	onToggleSidebar: () => void;
	hasUnseenChanges?: boolean;
	isSubChatsSidebarOpen?: boolean;
}
export function AgentsHeaderControls(props: AgentsHeaderControlsProps) {
	const merged = mergeProps({
		hasUnseenChanges: false,
		isSubChatsSidebarOpen: false,
	}, props);
	const [local] = splitProps(merged, ["isSidebarOpen", "onToggleSidebar", "hasUnseenChanges", "isSubChatsSidebarOpen"]);
	const toggleSidebarHotkey = useResolvedHotkeyDisplay("toggle-sidebar");
	// Only show open button when both sidebars are closed (Show for reactivity)
	return (
		<Show when={!local.isSidebarOpen && !local.isSubChatsSidebarOpen} fallback={null}>
			<TooltipProvider>
	      <Tooltip delayDuration={500}>
	        <TooltipTrigger asChild>
	          <Button variant="ghost" size="icon" onClick={local.onToggleSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md relative" aria-label="Open sidebar">
	            <AlignJustify class="h-4 w-4" />
	            {	/* Unseen changes indicator */}
	            <Show when={local.hasUnseenChanges}>
	              <div class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#307BD0] ring-2 ring-background" />
	            </Show>
	          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Open sidebar
          <Show when={toggleSidebarHotkey}>
            <Kbd>{toggleSidebarHotkey}</Kbd>
          </Show>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
		</Show>
	);
 }
