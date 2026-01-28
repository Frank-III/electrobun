"use client";
import { createEffect, createMemo, createSignal } from "solid-js";
import { useAtom, useAtomValue } from "../../../lib/state/jotai";
import { useTheme } from "../../../lib/hooks/use-theme";
import { fullThemeDataAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-solid";
import { Terminal } from "@/features/terminal/terminal";
import { TerminalTabs } from "@/features/terminal/terminal-tabs";
import { getDefaultTerminalBg } from "@/features/terminal/helpers";
import { terminalSidebarOpenAtomFamily, terminalsAtom, activeTerminalIdAtom, terminalCwdAtom } from "@/features/terminal/atoms";
import { trpc } from "@/lib/trpc";
import type { TerminalInstance } from "@/features/terminal/types";
interface TerminalSectionProps {
	chatId: string;
	cwd: string;
	workspaceId: string;
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
export function TerminalSection({ chatId, cwd, workspaceId, isExpanded = false, renderHeader, onTerminalBgChange }: TerminalSectionProps) {
	// Terminal state - reuse existing atoms
	const [allTerminals, setAllTerminals] = useAtom(terminalsAtom);
	const [allActiveIds, setAllActiveIds] = useAtom(activeTerminalIdAtom);
	const terminalCwds = useAtomValue(terminalCwdAtom);
	// Theme detection for terminal background
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	const fullThemeData = useAtomValue(fullThemeDataAtom);
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
		onTerminalBgChange?.(terminalBg);
	});
	// Get terminals for this chat
	const terminals = createMemo(() => allTerminals[chatId] || []);
	const activeTerminalId = createMemo(() => allActiveIds[chatId] || null);
	const activeTerminal = createMemo(() => terminals.find((t) => t.id === activeTerminalId) || null);
	const killMutation = trpc.terminal.kill.useMutation();
	// Refs for stable callbacks
	const [chatIdRef, setChatIdRef] = createSignal(chatId);
	chatIdRef.current = chatId;
	const [terminalsRef, setTerminalsRef] = createSignal(terminals);
	terminalsRef.current = terminals;
	const [activeTerminalIdRef, setActiveTerminalIdRef] = createSignal(activeTerminalId);
	activeTerminalIdRef.current = activeTerminalId;
	const createTerminal = () => {
		const currentChatId = chatIdRef.current;
		const currentTerminals = terminalsRef.current;
		const id = generateTerminalId();
		const paneId = generatePaneId(currentChatId, id);
		const name = getNextTerminalName(currentTerminals);
		const newTerminal: TerminalInstance = {
			id,
			paneId,
			name,
			createdAt: Date.now()
		};
		setAllTerminals((prev) => ({
			...prev,
			[currentChatId]: [...prev[currentChatId] || [], newTerminal]
		}));
		setAllActiveIds((prev) => ({
			...prev,
			[currentChatId]: id
		}));
	};
	const selectTerminal = (id: string) => {
		const currentChatId = chatIdRef.current;
		setAllActiveIds((prev) => ({
			...prev,
			[currentChatId]: id
		}));
	};
	const closeTerminal = (id: string) => {
		const currentChatId = chatIdRef.current;
		const currentTerminals = terminalsRef.current;
		const currentActiveId = activeTerminalIdRef.current;
		const terminal = currentTerminals.find((t) => t.id === id);
		if (!terminal) return;
		killMutation.mutate({ paneId: terminal.paneId });
		const newTerminals = currentTerminals.filter((t) => t.id !== id);
		setAllTerminals((prev) => ({
			...prev,
			[currentChatId]: newTerminals
		}));
		if (currentActiveId === id) {
			const newActive = newTerminals[newTerminals.length - 1]?.id || null;
			setAllActiveIds((prev) => ({
				...prev,
				[currentChatId]: newActive
			}));
		}
	};
	const renameTerminal = (id: string, name: string) => {
		const currentChatId = chatIdRef.current;
		setAllTerminals((prev) => ({
			...prev,
			[currentChatId]: (prev[currentChatId] || []).map((t) => t.id === id ? {
				...t,
				name
			} : t)
		}));
	};
	const closeOtherTerminals = (id: string) => {
		const currentChatId = chatIdRef.current;
		const currentTerminals = terminalsRef.current;
		currentTerminals.forEach((terminal) => {
			if (terminal.id !== id) {
				killMutation.mutate({ paneId: terminal.paneId });
			}
		});
		const remainingTerminal = currentTerminals.find((t) => t.id === id);
		setAllTerminals((prev) => ({
			...prev,
			[currentChatId]: remainingTerminal ? [remainingTerminal] : []
		}));
		setAllActiveIds((prev) => ({
			...prev,
			[currentChatId]: id
		}));
	};
	const closeTerminalsToRight = (id: string) => {
		const currentChatId = chatIdRef.current;
		const currentTerminals = terminalsRef.current;
		const index = currentTerminals.findIndex((t) => t.id === id);
		if (index === -1) return;
		const terminalsToClose = currentTerminals.slice(index + 1);
		terminalsToClose.forEach((terminal) => {
			killMutation.mutate({ paneId: terminal.paneId });
		});
		const remainingTerminals = currentTerminals.slice(0, index + 1);
		setAllTerminals((prev) => ({
			...prev,
			[currentChatId]: remainingTerminals
		}));
		const currentActiveId = activeTerminalIdRef.current;
		if (currentActiveId && !remainingTerminals.find((t) => t.id === currentActiveId)) {
			setAllActiveIds((prev) => ({
				...prev,
				[currentChatId]: remainingTerminals[remainingTerminals.length - 1]?.id || null
			}));
		}
	};
	// Auto-create first terminal when section is rendered and no terminals exist
	createEffect(() => {
		if (terminals.length === 0) {
			createTerminal();
		}
	});
	// Delay terminal rendering slightly
	const [canRenderTerminal, setCanRenderTerminal] = createSignal(false);
	createEffect(() => {
		const timer = setTimeout(() => {
			setCanRenderTerminal(true);
		}, 50);
		return () => clearTimeout(timer);
	});
	// Tabs component for header
	const tabsHeader = terminals.length > 0 ? <TerminalTabs terminals={terminals} activeTerminalId={activeTerminalId} cwds={terminalCwds} initialCwd={cwd} terminalBg={terminalBg} onSelectTerminal={selectTerminal} onCloseTerminal={closeTerminal} onCloseOtherTerminals={closeOtherTerminals} onCloseTerminalsToRight={closeTerminalsToRight} onCreateTerminal={createTerminal} onRenameTerminal={renameTerminal} /> : null;
	// Call renderHeader if provided (for widget card integration)
	createEffect(() => {
		renderHeader?.(tabsHeader);
	});
	// If renderHeader is provided, only render content (header is handled by parent)
	if (renderHeader) {
		return <div class="min-h-0 overflow-hidden" style={{
			"background-color": terminalBg,
			height: "200px"
		}}>
        {activeTerminal && canRenderTerminal ? <div class="h-full">
            <Terminal paneId={activeTerminal.paneId} cwd={cwd} workspaceId={workspaceId} initialCwd={cwd} />
          </div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
            {!canRenderTerminal ? "" : "No terminal open"}
          </div>}
      </div>;
	}
	// Standard render with tabs inside
	return <div class="flex flex-col" style={{
		"min-height": isExpanded ? "400px" : "200px",
		height: isExpanded ? "100%" : undefined
	}}>
      {	/* Tabs */}
      <div class="flex items-center gap-1 px-1 py-1 flex-shrink-0" style={{ "background-color": terminalBg }}>
        {tabsHeader}
      </div>

      { /* Terminal Content */}
      <div class="flex-1 min-h-0 overflow-hidden" style={{
 "background-color": terminalBg,
		height: isExpanded ? "100%" : "200px"
	}}>
        {activeTerminal && canRenderTerminal ? <div class="h-full">
            <Terminal paneId={activeTerminal.paneId} cwd={cwd} workspaceId={workspaceId} initialCwd={cwd} />
          </div> : <div class="flex items-center justify-center h-full text-muted-foreground text-sm">
            {!canRenderTerminal ? "" : "No terminal open"}
          </div>}
      </div>
    </div>;
}
