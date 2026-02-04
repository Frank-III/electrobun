import { createEffect, createMemo, createSignal, onCleanup, Show, type JSX } from "solid-js";
import { For } from "solid-js";
import { useTheme } from "../../../lib/hooks/use-theme";
import { fullThemeDataAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-solid";
import { Terminal } from "@/features/terminal/terminal";
import { TerminalTabs } from "@/features/terminal/terminal-tabs";
import { getDefaultTerminalBg } from "@/features/terminal/helpers";
import { useTerminalStore } from "@/features/terminal/terminal-store-context";
import { useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "@/lib/desktop-rpc";
import type { TerminalInstance } from "@/features/terminal/types";
interface TerminalSectionProps {
	chatId: string;
	cwd: string;
	isExpanded?: boolean;
	/** Render header with tabs separately (for widget card integration) */
	renderHeader?: (header: JSX.Element) => void;
	/** Background color for terminal */
	onTerminalBgChange?: (bg: string) => void;
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
export function TerminalSection(props: TerminalSectionProps) {
	const [store, setStore] = useTerminalStore();
	const chatId = () => props.chatId;
	const cwd = () => props.cwd;
	const terminalCwds = () => store.cwdByPaneId;
	// Theme detection for terminal background
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	const [fullThemeData] = fullThemeDataAtom;
	const terminalBg = createMemo(() => {
		const themeData = fullThemeData();
		if (themeData?.colors?.["terminal.background"]) {
			return themeData.colors["terminal.background"];
		}
		if (themeData?.colors?.["editor.background"]) {
			return themeData.colors["editor.background"];
		}
		return getDefaultTerminalBg(isDark);
	});
	// Notify parent about terminal background color
	createEffect(() => {
		props.onTerminalBgChange?.(terminalBg());
	});
	const terminals = createMemo(() => store.terminalsByChatId[chatId()] || []);
	const activeTerminalId = createMemo(() => store.activeTerminalIdByChatId[chatId()] ?? null);
	const activeTerminal = createMemo(() => terminals().find((t) => t.id === activeTerminalId()) || null);
	const killMutation = useMutation(() => ({
		mutationFn: (input: { paneId: string }) => desktopRpc.ghosttyTabs.close.mutate({ tabId: input.paneId }),
	}));
	const createTerminal = () => {
		const currentTerminals = terminals();
		const id = generateTerminalId();
		const paneId = generatePaneId(chatId(), id);
		const name = getNextTerminalName(currentTerminals);
		const newTerminal: TerminalInstance = { id, paneId, name, createdAt: Date.now() };
		setStore("terminalsByChatId", chatId(), [...currentTerminals, newTerminal]);
		setStore("activeTerminalIdByChatId", chatId(), id);
	};
	const selectTerminal = (id: string) => setStore("activeTerminalIdByChatId", chatId(), id);
	const closeTerminal = (id: string) => {
		const currentTerminals = terminals();
		const currentActiveId = activeTerminalId();
		const terminal = currentTerminals.find((t) => t.id === id);
		if (!terminal) return;
		killMutation.mutate({ paneId: terminal.paneId });
		const newTerminals = currentTerminals.filter((t) => t.id !== id);
		setStore("terminalsByChatId", chatId(), newTerminals);
		if (currentActiveId === id) {
			setStore("activeTerminalIdByChatId", chatId(), newTerminals[newTerminals.length - 1]?.id ?? null);
		}
	};
	const renameTerminal = (id: string, name: string) => {
		const current = store.terminalsByChatId[chatId()] || [];
		setStore("terminalsByChatId", chatId(), current.map((t) => (t.id === id ? { ...t, name } : t)));
	};
	const closeOtherTerminals = (id: string) => {
		const currentTerminals = terminals();
		currentTerminals.forEach((terminal) => {
			if (terminal.id !== id) killMutation.mutate({ paneId: terminal.paneId });
		});
		const remainingTerminal = currentTerminals.find((t) => t.id === id);
		setStore("terminalsByChatId", chatId(), remainingTerminal ? [remainingTerminal] : []);
		setStore("activeTerminalIdByChatId", chatId(), id);
	};
	const closeTerminalsToRight = (id: string) => {
		const currentTerminals = terminals();
		const index = currentTerminals.findIndex((t) => t.id === id);
		if (index === -1) return;
		currentTerminals.slice(index + 1).forEach((terminal) => killMutation.mutate({ paneId: terminal.paneId }));
		const remainingTerminals = currentTerminals.slice(0, index + 1);
		setStore("terminalsByChatId", chatId(), remainingTerminals);
		const currentActiveId = activeTerminalId();
		if (currentActiveId && !remainingTerminals.find((t) => t.id === currentActiveId)) {
			setStore("activeTerminalIdByChatId", chatId(), remainingTerminals[remainingTerminals.length - 1]?.id ?? null);
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
	// Tabs component for header
	const tabsHeader = () => <Show when={terminals().length > 0}><TerminalTabs terminals={terminals()} activeTerminalId={activeTerminalId()} cwds={terminalCwds()} initialCwd={cwd()} terminalBg={terminalBg()} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} /></Show>;
	// Call renderHeader if provided (for widget card integration)
	createEffect(() => {
		props.renderHeader?.(tabsHeader());
	});
	// If renderHeader is provided, only render content (header is handled by parent)
	if (props.renderHeader) {
	return <div class="min-h-0 overflow-hidden" style={{
			"background-color": terminalBg(),
			height: "200px"
		}}>
			<Show when={activeTerminal() && canRenderTerminal()} fallback={
				<div class="flex items-center justify-center h-full text-muted-foreground text-sm">
					{!canRenderTerminal() ? "" : "No terminal open"}
				</div>
			}>
				<div class="h-full relative">
					<For each={terminals()}>{(terminal) => {
						const isActive = () => terminal.id === activeTerminalId();
						return (
							<div class="absolute inset-0" classList={{ "opacity-0 pointer-events-none": !isActive(), "opacity-100": isActive() }}>
								<Terminal paneId={terminal.paneId} cwd={cwd()} initialCwd={cwd()} isActive={isActive()} />
							</div>
						);
					}}</For>
				</div>
			</Show>
	      </div>;
	}
	const isExpanded = () => props.isExpanded ?? false;
	// Standard render with tabs inside
	return <div class="flex flex-col" style={{
		"min-height": isExpanded() ? "400px" : "200px",
		height: isExpanded() ? "100%" : undefined
	}}>
      {	/* Tabs */}
	      <div class="flex items-center gap-1 px-1 py-1 flex-shrink-0" style={{ "background-color": terminalBg() }}>
        {tabsHeader()}
      </div>

      { /* Terminal Content */}
	      <div class="flex-1 min-h-0 overflow-hidden" style={{
 "background-color": terminalBg(),
		height: isExpanded() ? "100%" : "200px"
	}}>
		<Show when={activeTerminal() && canRenderTerminal()} fallback={
			<div class="flex items-center justify-center h-full text-muted-foreground text-sm">
				{!canRenderTerminal() ? "" : "No terminal open"}
			</div>
		}>
			<div class="h-full relative">
				<For each={terminals()}>{(terminal) => {
					const isActive = () => terminal.id === activeTerminalId();
					return (
						<div class="absolute inset-0" classList={{ "opacity-0 pointer-events-none": !isActive(), "opacity-100": isActive() }}>
							<Terminal paneId={terminal.paneId} cwd={cwd()} initialCwd={cwd()} isActive={isActive()} />
						</div>
					);
				}}</For>
			</div>
		</Show>
	      </div>
    </div>;
}
