import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import { useTheme } from "../../../lib/hooks/use-theme";
import { fullThemeDataAtom } from "@/lib/atoms";
import { ArrowUpRight } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { useResolvedHotkeyDisplay } from "@/lib/hotkeys";
import { Terminal } from "@/features/terminal/terminal";
import { TerminalTabs } from "@/features/terminal/terminal-tabs";
import { getDefaultTerminalBg } from "@/features/terminal/helpers";
import { useTerminalStore } from "@/features/terminal/terminal-store-context";
import { useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "@/lib/desktop-rpc";
import type { TerminalInstance } from "@/features/terminal/types";
import { cn } from "@/lib/utils";
interface TerminalWidgetProps {
	chatId: string;
	cwd: string;
	onExpand?: () => void;
}
function generateTerminalId(): string {
	return crypto.randomUUID().slice(0, 8);
}
function generatePaneId(chatId: string, terminalId: string): string {
	return `${chatId}:term:${terminalId}`;
}
function getNextTerminalName(terminals: TerminalInstance[]): string {
	const existingNumbers = terminals.map((t) => {
		const match = t.name.match(/^Terminal (\d+)$/);
		return match ? parseInt(match[1], 10) : 0;
	}).filter((n) => n > 0);
	const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
	return `Terminal ${maxNumber + 1}`;
}
/**
* Terminal Widget for Overview Sidebar
* Combines WidgetCard header with terminal tabs and content
* Memoized to prevent re-renders when parent updates
*/
export function TerminalWidget({ chatId, cwd, onExpand }: TerminalWidgetProps) {
	const [store, setStore] = useTerminalStore();
	const terminalCwds = () => store.cwdByPaneId;
	// Theme detection for terminal background
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	const [fullThemeData] = fullThemeDataAtom;
	// Resolved hotkey for tooltip
	const toggleTerminalHotkey = useResolvedHotkeyDisplay("toggle-terminal");
	const terminalBg = createMemo(() => {
		if (fullThemeData?.colors?.["terminal.background"]) {
			return fullThemeData.colors["terminal.background"];
		}
		if (fullThemeData?.colors?.["editor.background"]) {
			return fullThemeData.colors["editor.background"];
		}
		return getDefaultTerminalBg(isDark);
	});
	const terminals = createMemo(() => store.terminalsByChatId[chatId] || []);
	const activeTerminalId = createMemo(() => store.activeTerminalIdByChatId[chatId] ?? null);
	const activeTerminal = createMemo(() => terminals().find((t) => t.id === activeTerminalId()) || null);
	const killMutation = useMutation(() => ({
		mutationFn: (input: { paneId: string }) => desktopRpc.terminal.kill.mutate(input),
	}));
	// Callback functions - read props/derived values directly
	const createTerminal = () => {
		const currentTerminals = terminals();
		const id = generateTerminalId();
		const paneId = generatePaneId(chatId, id);
		const name = getNextTerminalName(currentTerminals);
		const newTerminal: TerminalInstance = { id, paneId, name, createdAt: Date.now() };
		setStore("terminalsByChatId", chatId, [...currentTerminals, newTerminal]);
		setStore("activeTerminalIdByChatId", chatId, id);
	};
	const selectTerminal = (id: string) => setStore("activeTerminalIdByChatId", chatId, id);
	const closeTerminal = (id: string) => {
		const currentTerminals = terminals();
		const currentActiveId = activeTerminalId();
		const terminal = currentTerminals.find((t) => t.id === id);
		if (!terminal) return;
		killMutation.mutate({ paneId: terminal.paneId });
		const newTerminals = currentTerminals.filter((t) => t.id !== id);
		setStore("terminalsByChatId", chatId, newTerminals);
		if (currentActiveId === id) {
			setStore("activeTerminalIdByChatId", chatId, newTerminals[newTerminals.length - 1]?.id ?? null);
		}
	};
	const renameTerminal = (id: string, name: string) => {
		const current = store.terminalsByChatId[chatId] || [];
		setStore("terminalsByChatId", chatId, current.map((t) => (t.id === id ? { ...t, name } : t)));
	};
	const closeOtherTerminals = (id: string) => {
		const currentTerminals = terminals();
		currentTerminals.forEach((terminal) => {
			if (terminal.id !== id) killMutation.mutate({ paneId: terminal.paneId });
		});
		const remainingTerminal = currentTerminals.find((t) => t.id === id);
		setStore("terminalsByChatId", chatId, remainingTerminal ? [remainingTerminal] : []);
		setStore("activeTerminalIdByChatId", chatId, id);
	};
	const closeTerminalsToRight = (id: string) => {
		const currentTerminals = terminals();
		const index = currentTerminals.findIndex((t) => t.id === id);
		if (index === -1) return;
		currentTerminals.slice(index + 1).forEach((terminal) => killMutation.mutate({ paneId: terminal.paneId }));
		const remainingTerminals = currentTerminals.slice(0, index + 1);
		setStore("terminalsByChatId", chatId, remainingTerminals);
		const currentActiveId = activeTerminalId();
		if (currentActiveId && !remainingTerminals.find((t) => t.id === currentActiveId)) {
			setStore("activeTerminalIdByChatId", chatId, remainingTerminals[remainingTerminals.length - 1]?.id ?? null);
		}
	};
	// Auto-create first terminal when section is rendered and no terminals exist
	createEffect(() => {
		if (terminals().length === 0) {
			createTerminal();
		}
	});
	// Delay terminal rendering slightly
	const [canRenderTerminal, setCanRenderTerminal] = createSignal(false);
	createEffect(() => {
		const timer = setTimeout(() => {
			setCanRenderTerminal(true);
		}, 50);
		onCleanup(() => clearTimeout(timer));
	});
	return <div class="mx-2 mb-2">
      <div class={cn("rounded-lg border border-border/50 overflow-hidden")}>
        {	/* Widget Header with Tabs - like terminal-sidebar.tsx */}
	      <div class="flex items-center gap-1 pl-1 pr-2 py-1.5 select-none group" style={{ "background-color": terminalBg() }}>
          { /* Terminal Tabs - directly without wrapper, like in terminal-sidebar.tsx */}
	        <Show when={terminals().length > 0}>
	          <TerminalTabs terminals={terminals()} activeTerminalId={activeTerminalId()} cwds={terminalCwds()} initialCwd={cwd} terminalBg={terminalBg()} hidePlusButton small onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} />
	        </Show>

          { /* Plus button after tabs */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={createTerminal} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md flex-shrink-0" aria-label="New terminal">
                <PlusIcon class="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New terminal</TooltipContent>
          </Tooltip>

          { /* Expand to sidebar button */}
          <Show when={onExpand}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label="Expand terminal">
                    <ArrowUpRight class="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Expand to sidebar
                  <Show when={toggleTerminalHotkey}><Kbd>{toggleTerminalHotkey}</Kbd></Show>
                </TooltipContent>
              </Tooltip>
            </Show>
        </div>

        { /* Terminal Content */}
	      <div class="min-h-0 overflow-hidden" style={{
 "background-color": terminalBg(),
		height: "200px"
	}}>
	        <Show when={activeTerminal() && canRenderTerminal()} fallback={
	            <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
	              {!canRenderTerminal() ? "" : "No terminal open"}
	            </div>
	          }>
	            <div class="h-full">
	              <Terminal paneId={activeTerminal()!.paneId} cwd={cwd} initialCwd={cwd} />
	            </div>
	          </Show>
	      </div>
      </div>
    </div>;
}
