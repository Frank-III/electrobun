import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import { useTheme } from "../../lib/hooks/use-theme";
import { fullThemeDataAtom } from "@/lib/atoms";
import { ResizableSidebar } from "@/components/ui/resizable-sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconDoubleChevronRight, CustomTerminalIcon } from "@/components/ui/icons";
import { AlignJustify } from "lucide-solid";
import { Kbd } from "@/components/ui/kbd";
import { useResolvedHotkeyDisplay } from "@/lib/hotkeys";
import { Terminal } from "./terminal";
import { TerminalTabs } from "./terminal-tabs";
import { getDefaultTerminalBg } from "./helpers";
import type { SignalPair } from "@/lib/state/signal-map";
import { useTerminalStore } from "./terminal-store-context";
import { desktopRpc } from "@/lib/desktop-rpc";
import type { TerminalInstance } from "./types";
// Animation constants - keep in sync with ResizableSidebar animationDuration
const SIDEBAR_ANIMATION_DURATION_SECONDS = 0;
const SIDEBAR_ANIMATION_DURATION_MS = 0;
const ANIMATION_BUFFER_MS = 0;
interface TerminalSidebarProps {
	/** Chat ID - used to scope terminals to this chat */
	chatId: string;
	cwd: string;
	/** Mobile fullscreen mode - skip ResizableSidebar wrapper */
	isMobileFullscreen?: boolean;
	/** Callback when closing in mobile mode */
	onClose?: () => void;
}
/**
* Generate a unique terminal ID
*/
function generateTerminalId(): string {
	return crypto.randomUUID().slice(0, 8);
}
/**
* Generate a paneId for TerminalManager
*/
function generatePaneId(chatId: string, terminalId: string): string {
	return `${chatId}:term:${terminalId}`;
}
/**
* Get the next terminal name based on existing terminals
*/
function getNextTerminalName(terminals: TerminalInstance[]): string {
	const existingNumbers = terminals.map((t) => {
		const match = t.name.match(/^Terminal (\d+)$/);
		return match ? parseInt(match[1], 10) : 0;
	}).filter((n) => n > 0);
	const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
	return `Terminal ${maxNumber + 1}`;
}
export function TerminalSidebar({ chatId, cwd, isMobileFullscreen = false, onClose }: TerminalSidebarProps) {
	const [store, setStore] = useTerminalStore();
	const isOpen = () => store.sidebarOpenByChatId[chatId] ?? false;
	const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
		const next = typeof value === "function" ? value(isOpen()) : value;
		setStore("sidebarOpenByChatId", chatId, next);
	};
	const terminalCwds = () => store.cwdByPaneId;
	const widthAtom: SignalPair<number> = [
		() => store.sidebarWidth,
		(v: number | ((prev: number) => number)) => {
			const next = typeof v === "function" ? v(store.sidebarWidth) : v;
			setStore("sidebarWidth", next);
		},
	];
	// Theme detection for terminal background
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	// Resolved hotkey for tooltip
	const toggleTerminalHotkey = useResolvedHotkeyDisplay("toggle-terminal");
	const [fullThemeData] = fullThemeDataAtom;
	const terminalBg = createMemo(() => {
		const themeData = fullThemeData();
		// Use VS Code theme terminal background if available
		if (themeData?.colors?.["terminal.background"]) {
			return themeData.colors["terminal.background"];
		}
		if (themeData?.colors?.["editor.background"]) {
			return themeData.colors["editor.background"];
		}
		return getDefaultTerminalBg(isDark);
	});
	// Get terminals for this chat
	const terminals = createMemo(() => store.terminalsByChatId[chatId] || []);
	// Get active terminal ID for this chat
	const activeTerminalId = createMemo(() => store.activeTerminalIdByChatId[chatId] ?? null);
	// Get the active terminal instance
	const activeTerminal = createMemo(() => terminals().find((t) => t.id === activeTerminalId()) || null);
	// Kill terminal session on backend
	const killTerminal = (paneId: string) => desktopRpc.terminal.kill.mutate({ paneId });
	// Create a new terminal - stable callback
	const createTerminal = () => {
		const currentChatId = chatId;
		const currentTerminals = terminals();
		const id = generateTerminalId();
		const paneId = generatePaneId(currentChatId, id);
		const name = getNextTerminalName(currentTerminals);
		const newTerminal: TerminalInstance = {
			id,
			paneId,
			name,
			createdAt: Date.now()
		};
		setStore("terminalsByChatId", currentChatId, [...currentTerminals, newTerminal]);
		setStore("activeTerminalIdByChatId", currentChatId, id);
	};
	// Select a terminal - stable callback
	const selectTerminal = (id: string) => {
		setStore("activeTerminalIdByChatId", chatId, id);
	};
	// Close a terminal - stable callback
	const closeTerminal = (id: string) => {
		const currentTerminals = terminals();
		const currentActiveId = activeTerminalId();
		const terminal = currentTerminals.find((t) => t.id === id);
		if (!terminal) return;
		killTerminal(terminal.paneId);
		const newTerminals = currentTerminals.filter((t) => t.id !== id);
		setStore("terminalsByChatId", chatId, newTerminals);
		if (currentActiveId === id) {
			setStore("activeTerminalIdByChatId", chatId, newTerminals[newTerminals.length - 1]?.id ?? null);
		}
	};
	// Rename a terminal - stable callback
	const renameTerminal = (id: string, name: string) => {
		const current = store.terminalsByChatId[chatId] || [];
		setStore(
			"terminalsByChatId",
			chatId,
			current.map((t) => (t.id === id ? { ...t, name } : t))
		);
	};
	// Close other terminals - stable callback
	const closeOtherTerminals = (id: string) => {
		const currentTerminals = terminals();
		currentTerminals.forEach((terminal) => {
			if (terminal.id !== id) killTerminal(terminal.paneId);
		});
		const remainingTerminal = currentTerminals.find((t) => t.id === id);
		setStore("terminalsByChatId", chatId, remainingTerminal ? [remainingTerminal] : []);
		setStore("activeTerminalIdByChatId", chatId, id);
	};
	// Close terminals to the right - stable callback
	const closeTerminalsToRight = (id: string) => {
		const currentTerminals = terminals();
		const index = currentTerminals.findIndex((t) => t.id === id);
		if (index === -1) return;
		currentTerminals.slice(index + 1).forEach((terminal) => killTerminal(terminal.paneId));
		const remainingTerminals = currentTerminals.slice(0, index + 1);
		setStore("terminalsByChatId", chatId, remainingTerminals);
		const currentActiveId = activeTerminalId();
		if (currentActiveId && !remainingTerminals.find((t) => t.id === currentActiveId)) {
			setStore("activeTerminalIdByChatId", chatId, remainingTerminals[remainingTerminals.length - 1]?.id ?? null);
		}
	};
	// Close sidebar callback - stable
	const closeSidebar = () => {
		setIsOpen(false);
	};
	// Delay terminal rendering until animation completes to avoid xterm.js sizing issues
	const [canRenderTerminal, setCanRenderTerminal] = createSignal(false);
	let wasOpenRef = false;
	createEffect(() => {
		if (isOpen() && !wasOpenRef) {
			// Sidebar just opened - delay terminal render until animation completes
			setCanRenderTerminal(false);
			const timer = setTimeout(() => {
				setCanRenderTerminal(true);
			}, SIDEBAR_ANIMATION_DURATION_MS + ANIMATION_BUFFER_MS);
			wasOpenRef = true;
			onCleanup(() => clearTimeout(timer));
		} else if (!isOpen()) {
			// Sidebar closed - reset state
			wasOpenRef = false;
			setCanRenderTerminal(false);
		}
	});
	// Auto-create first terminal when sidebar opens and no terminals exist
	createEffect(() => {
		if (isOpen() && terminals().length === 0) {
			createTerminal();
		}
	});
	// Keyboard shortcut: Cmd+J to toggle terminal sidebar
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey && e.code === "KeyJ") {
				e.preventDefault();
				e.stopPropagation();
				setIsOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, true));
	});
	// Handle mobile close - also close the sidebar atom to prevent re-opening as desktop sidebar
	const handleMobileClose = () => {
		setIsOpen(false);
		onClose?.();
	};
	// Mobile fullscreen layout
	if (isMobileFullscreen) {
		return <div class="flex flex-col h-full w-full bg-background">
        {		/* Mobile header with back button and tabs */}
        <div class="flex items-center gap-1.5 px-2 py-2 flex-shrink-0 border-b" style={{
 "background-color": terminalBg(),
			"-webkit-app-region": "drag",
			"border-bottom-width": "0.5px"
		}}>
          {		/* Back button */}
          <Button variant="ghost" size="icon" onClick={handleMobileClose} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="Back to chat" style={{ "-webkit-app-region": "no-drag" }}>
            <AlignJustify class="h-4 w-4" />
          </Button>

          { /* Terminal Tabs - directly after back button, inherits drag from parent */}
          <div class="flex items-center gap-1 flex-1 min-w-0">
            <Show when={terminals().length > 0}>
              <TerminalTabs terminals={terminals()} activeTerminalId={activeTerminalId()} cwds={terminalCwds()} initialCwd={cwd} terminalBg={terminalBg()} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} />
            </Show>
          </div>
        </div>

        { /* Terminal Content */}
        <div class="flex-1 min-h-0 min-w-0 overflow-hidden" style={{ "background-color": terminalBg() }}>
          <Show when={activeTerminal() && canRenderTerminal()} fallback={<div class="flex items-center justify-center h-full text-muted-foreground text-sm">
              {!canRenderTerminal() ? "" : "No terminal open"}
            </div>}>
            <div class="h-full">
              <Terminal paneId={activeTerminal()!.paneId} cwd={cwd} initialCwd={cwd} />
            </div>
          </Show>
        </div>
      </div>;
	}
	// Desktop sidebar layout
	return <ResizableSidebar isOpen={isOpen()} onClose={closeSidebar} widthAtom={widthAtom} side="right" minWidth={300} maxWidth={800} animationDuration={SIDEBAR_ANIMATION_DURATION_SECONDS} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-background border-l" style={{
		"border-left-width": "0.5px",
		overflow: "hidden"
	}}>
      <div class="flex flex-col h-full min-w-0 overflow-hidden">
        {	/* Header with tabs */}
        <div class="flex items-center gap-1 pl-1 pr-2 py-1.5 flex-shrink-0" style={{ "background-color": terminalBg() }}>
          { /* Close button - on the left */}
          <div class="flex items-center flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={closeSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close terminal">
                  <IconDoubleChevronRight class="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Close terminal
                <Show when={toggleTerminalHotkey}><Kbd>{toggleTerminalHotkey}</Kbd></Show>
              </TooltipContent>
            </Tooltip>
          </div>

          { /* Terminal Tabs */}
          <Show when={terminals().length > 0}>
            <TerminalTabs terminals={terminals()} activeTerminalId={activeTerminalId()} cwds={terminalCwds()} initialCwd={cwd} terminalBg={terminalBg()} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} />
          </Show>
        </div>

        { /* Terminal Content */}
        <div class="flex-1 min-h-0 min-w-0 overflow-hidden" style={{ "background-color": terminalBg() }}>
          <Show when={activeTerminal() && canRenderTerminal()} fallback={<div class="flex items-center justify-center h-full text-muted-foreground text-sm">
              {!canRenderTerminal() ? "" : "No terminal open"}
            </div>}>
            <div class="h-full">
              <Terminal paneId={activeTerminal()!.paneId} cwd={cwd} initialCwd={cwd} />
            </div>
          </Show>
        </div>
      </div>
    </ResizableSidebar>;
}
