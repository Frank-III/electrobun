"use client";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { useTheme } from "../../../lib/hooks/use-theme";
import { fullThemeDataAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-solid";
import { Terminal } from "@/features/terminal/terminal";
import { TerminalTabs } from "@/features/terminal/terminal-tabs";
import { getDefaultTerminalBg } from "@/features/terminal/helpers";
import { terminalSidebarOpenAtomFamily, terminalsAtom, activeTerminalIdAtom, terminalCwdAtom } from "@/features/terminal/atoms";
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
export function TerminalSection({ chatId, cwd, isExpanded = false, renderHeader, onTerminalBgChange }: TerminalSectionProps) {
	// Terminal state - reuse existing atoms
	const [allTerminals, setAllTerminals] = terminalsAtom;
	const [allActiveIds, setAllActiveIds] = activeTerminalIdAtom;
	const [terminalCwds] = terminalCwdAtom;
	// Theme detection for terminal background
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	const [fullThemeData] = fullThemeDataAtom;
	const terminalBg = createMemo(() => {
		if (fullThemeData?.colors?.["terminal.background"]) {
			return fullThemeData.colors["terminal.background"];
		}
		if (fullThemeData?.colors?.["editor.background"]) {
			return fullThemeData.colors["editor.background"];
		}
		return getDefaultTerminalBg(isDark);
	});
	// Notify parent about terminal background color
	createEffect(() => {
		onTerminalBgChange?.(terminalBg());
	});
	// Get terminals for this chat
	const terminals = createMemo(() => allTerminals()[chatId] || []);
	const activeTerminalId = createMemo(() => allActiveIds()[chatId] || null);
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
		const newTerminal: TerminalInstance = {
			id,
			paneId,
			name,
			createdAt: Date.now()
		};
		setAllTerminals((prev) => ({
			...prev,
			[chatId]: [...prev[chatId] || [], newTerminal]
		}));
		setAllActiveIds((prev) => ({
			...prev,
			[chatId]: id
		}));
	};
	const selectTerminal = (id: string) => {
		setAllActiveIds((prev) => ({
			...prev,
			[chatId]: id
		}));
	};
	const closeTerminal = (id: string) => {
		const currentTerminals = terminals();
		const currentActiveId = activeTerminalId();
		const terminal = currentTerminals.find((t) => t.id === id);
		if (!terminal) return;
		killMutation.mutate({ paneId: terminal.paneId });
		const newTerminals = currentTerminals.filter((t) => t.id !== id);
		setAllTerminals((prev) => ({
			...prev,
			[chatId]: newTerminals
		}));
		if (currentActiveId === id) {
			const newActive = newTerminals[newTerminals.length - 1]?.id || null;
			setAllActiveIds((prev) => ({
				...prev,
				[chatId]: newActive
			}));
		}
	};
	const renameTerminal = (id: string, name: string) => {
		setAllTerminals((prev) => ({
			...prev,
			[chatId]: (prev[chatId] || []).map((t) => t.id === id ? {
				...t,
				name
			} : t)
		}));
	};
	const closeOtherTerminals = (id: string) => {
		const currentTerminals = terminals();
		currentTerminals.forEach((terminal) => {
			if (terminal.id !== id) {
				killMutation.mutate({ paneId: terminal.paneId });
			}
		});
		const remainingTerminal = currentTerminals.find((t) => t.id === id);
		setAllTerminals((prev) => ({
			...prev,
			[chatId]: remainingTerminal ? [remainingTerminal] : []
		}));
		setAllActiveIds((prev) => ({
			...prev,
			[chatId]: id
		}));
	};
	const closeTerminalsToRight = (id: string) => {
		const currentTerminals = terminals();
		const index = currentTerminals.findIndex((t) => t.id === id);
		if (index === -1) return;
		const terminalsToClose = currentTerminals.slice(index + 1);
		terminalsToClose.forEach((terminal) => {
			killMutation.mutate({ paneId: terminal.paneId });
		});
		const remainingTerminals = currentTerminals.slice(0, index + 1);
		setAllTerminals((prev) => ({
			...prev,
			[chatId]: remainingTerminals
		}));
		const currentActiveId = activeTerminalId();
		if (currentActiveId && !remainingTerminals.find((t) => t.id === currentActiveId)) {
			setAllActiveIds((prev) => ({
				...prev,
				[chatId]: remainingTerminals[remainingTerminals.length - 1]?.id || null
			}));
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
	const tabsHeader = terminals().length > 0 ? <TerminalTabs terminals={terminals()} activeTerminalId={activeTerminalId()} cwds={terminalCwds()} initialCwd={cwd} terminalBg={terminalBg()} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} /> : null;
	// Call renderHeader if provided (for widget card integration)
	createEffect(() => {
		renderHeader?.(tabsHeader);
	});
	// If renderHeader is provided, only render content (header is handled by parent)
	if (renderHeader) {
		return <div class="min-h-0 overflow-hidden" style={{
			"background-color": terminalBg(),
			height: "200px"
		}}>
	        {activeTerminal() && canRenderTerminal() ? <div class="h-full">
	            <Terminal paneId={activeTerminal()!.paneId} cwd={cwd} initialCwd={cwd} />
	          </div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
	            {!canRenderTerminal() ? "" : "No terminal open"}
	          </div>}
	      </div>;
	}
	// Standard render with tabs inside
	return <div class="flex flex-col" style={{
		"min-height": isExpanded ? "400px" : "200px",
		height: isExpanded ? "100%" : undefined
	}}>
      {	/* Tabs */}
	      <div class="flex items-center gap-1 px-1 py-1 flex-shrink-0" style={{ "background-color": terminalBg() }}>
        {tabsHeader}
      </div>

      { /* Terminal Content */}
	      <div class="flex-1 min-h-0 overflow-hidden" style={{
 "background-color": terminalBg(),
		height: isExpanded ? "100%" : "200px"
	}}>
	        {activeTerminal() && canRenderTerminal() ? <div class="h-full">
	            <Terminal paneId={activeTerminal()!.paneId} cwd={cwd} initialCwd={cwd} />
	          </div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
	            {!canRenderTerminal() ? "" : "No terminal open"}
	          </div>}
	      </div>
    </div>;
}
