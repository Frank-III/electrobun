import { createEffect, createSignal, createMemo, onCleanup } from "solid-js";
import type { Terminal as XTerm } from "xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type { SearchAddon } from "@xterm/addon-search";
import type { SerializeAddon } from "@xterm/addon-serialize";
import { useTheme } from "../../lib/hooks/use-theme";
import { useSetAtom, useAtomValue } from "../../lib/state/jotai";
import { toast } from "solid-sonner";
import { trpc } from "@/lib/trpc";
import { terminalCwdAtom } from "./atoms";
import { fullThemeDataAtom } from "@/lib/atoms";
import { createTerminalInstance, getDefaultTerminalBg, setupClickToMoveCursor, setupContextMenuHandler, setupFocusListener, setupKeyboardHandler, setupPasteHandler, setupResizeHandlers } from "./helpers";
import { getTerminalTheme, getTerminalThemeFromVSCode } from "./config";
import { parseCwd } from "./parseCwd";
import { sanitizeForTitle } from "./commandBuffer";
import { shellEscapePaths } from "./utils";
import { TerminalSearch } from "./TerminalSearch";
import type { TerminalProps, TerminalStreamEvent } from "./types";
import "xterm/css/xterm.css";
export function Terminal({ paneId, cwd, workspaceId, tabId, initialCommands, initialCwd }: TerminalProps) {
	let containerRef: HTMLDivElement | undefined;
	let xtermRef: XTerm | undefined;
	let fitAddonRef: FitAddon | undefined;
	let searchAddonRef: SearchAddon | undefined;
	let serializeAddonRef: SerializeAddon | undefined;
	let isExitedRef = false;
	let commandBufferRef = "";
	const [isSearchOpen, setIsSearchOpen] = createSignal(false);
	const [terminalCwd, setTerminalCwd] = createSignal(initialCwd || cwd);
	const setGlobalCwds = useSetAtom(terminalCwdAtom);
	// Theme detection
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme() === "dark";
	// VS Code theme data (if a full theme is selected)
	const fullThemeData = useAtomValue(fullThemeDataAtom);
	// Mutations
	const createOrAttachMutation = trpc.terminal.createOrAttach.useMutation();
	const writeMutation = trpc.terminal.write.useMutation();
	const resizeMutation = trpc.terminal.resize.useMutation();
	const detachMutation = trpc.terminal.detach.useMutation();
	const clearScrollbackMutation = trpc.terminal.clearScrollback.useMutation();
	// Parse terminal data for cwd (OSC 7 sequences)
	const updateCwdFromData = (data: string) => {
		const parsedCwd = parseCwd(data);
		if (parsedCwd !== null) {
			console.log("[Terminal] Parsed cwd from OSC-7:", parsedCwd);
			setTerminalCwd(parsedCwd);
			// Also update global atom for the tabs to show
			setGlobalCwds((prev) => ({
				...prev,
				[paneId]: parsedCwd
			}));
		}
	};
	// Handle stream data
	const handleStreamData = (event: TerminalStreamEvent) => {
		if (!xtermRef) return;
		if (event.type === "data" && event.data) {
			xtermRef.write(event.data);
			updateCwdFromData(event.data);
		} else if (event.type === "exit") {
			isExitedRef = true;
			xtermRef.writeln(`\r\n\r\n[Process exited with code ${event.exitCode}]`);
			xtermRef.writeln("[Press any key to restart]");
		}
	};
	// Subscribe to terminal output
	trpc.terminal.stream.useSubscription(paneId, {
		onData: handleStreamData,
		onError: (err) => {
			console.error("[Terminal] Stream error:", err);
			xtermRef?.write(`\r\n\x1b[31m[Connection error: ${err.message}]\x1b[0m\r\n`);
		},
		enabled: true
	});
	// Initialize terminal
	createEffect(() => {
		const container = containerRef;
		if (!container) return;
		console.log("[Terminal:useEffect] MOUNT - paneId:", paneId);
		console.log("[Terminal:useEffect] Container rect:", container.getBoundingClientRect());
		let isUnmounted = false;
		// Create xterm instance
		console.log("[Terminal:useEffect] Creating terminal instance...", { isDark });
		const { xterm, fitAddon, serializeAddon, cleanup } = createTerminalInstance(container, {
			cwd: terminalCwd() || cwd,
			isDark,
			onFileLinkClick: (path, line, column) => {
				console.log("[Terminal] File link clicked:", path, line, column);
				// TODO: Open file in editor
			},
			onUrlClick: (url) => {
				console.log("[Terminal] URL clicked:", url);
				window.desktopApi.openExternal(url);
			}
		});
		xtermRef = xterm;
		fitAddonRef = fitAddon;
		serializeAddonRef = serializeAddon;
		isExitedRef = false;
		// Lazy load search addon
		import("@xterm/addon-search").then(({ SearchAddon }) => {
			if (isUnmounted || !xtermRef) return;
			const searchAddon = new SearchAddon();
			xtermRef.loadAddon(searchAddon);
			searchAddonRef = searchAddon;
		});
		// Apply serialized state from server
		const applySerializedState = (serializedState: string) => {
			if (serializedState) {
				xterm.write(serializedState);
			}
		};
		// Restart terminal after exit
		const restartTerminal = () => {
			isExitedRef = false;
			xterm.clear();
			createOrAttachMutation.mutate({
				paneId,
				tabId,
				workspaceId,
				cols: xterm.cols,
				rows: xterm.rows,
				cwd: terminalCwd() || cwd
			}, { onSuccess: (result) => {
				applySerializedState(result.serializedState);
			} });
		};
		// Input handler
		const handleTerminalInput = (data: string) => {
			if (isExitedRef) {
				restartTerminal();
				return;
			}
			writeMutation.mutate({
				paneId,
				data
			});
		};
		// Key handler for command buffer (tab title)
		const handleKeyPress = (event: {
			key: string;
			domEvent: KeyboardEvent;
		}) => {
			const { domEvent } = event;
			if (domEvent.key === "Enter") {
				const title = sanitizeForTitle(commandBufferRef);
				if (title) {}
				commandBufferRef = "";
			} else if (domEvent.key === "Backspace") {
				commandBufferRef = commandBufferRef.slice(0, -1);
			} else if (domEvent.key === "c" && domEvent.ctrlKey) {
				commandBufferRef = "";
			} else if (domEvent.key.length === 1 && !domEvent.ctrlKey && !domEvent.metaKey) {
				commandBufferRef += domEvent.key;
			}
		};
		// Create or attach to session
		createOrAttachMutation.mutate({
			paneId,
			tabId,
			workspaceId,
			cols: xterm.cols,
			rows: xterm.rows,
			cwd: initialCwd || cwd,
			initialCommands
		}, {
			onSuccess: (result) => {
				applySerializedState(result.serializedState);
				xterm.focus();
			},
			onError: (err) => {
				xterm.write(`\x1b[31m[Failed to start terminal: ${err.message}]\x1b[0m\r\n`);
			}
		});
		// Set up handlers
		const inputDisposable = xterm.onData(handleTerminalInput);
		const keyDisposable = xterm.onKey(handleKeyPress);
		const handleClear = () => {
			xterm.clear();
			clearScrollbackMutation.mutate({ paneId });
		};
		const handleWrite = (data: string) => {
			if (!isExitedRef) {
				writeMutation.mutate({
					paneId,
					data
				});
			}
		};
		const cleanupKeyboard = setupKeyboardHandler(xterm, {
			onShiftEnter: () => handleWrite("\x1B\r"),
			onClear: handleClear
		});
		const cleanupClickToMove = setupClickToMoveCursor(xterm, { onWrite: handleWrite });
		const cleanupFocus = setupFocusListener(xterm, () => {
			// TODO: Set focused pane
		});
		const cleanupResize = setupResizeHandlers(container, xterm, fitAddon, (cols, rows) => {
			resizeMutation.mutate({
				paneId,
				cols,
				rows
			});
		});
		const cleanupPaste = setupPasteHandler(xterm, { onPaste: (text) => {
			commandBufferRef += text;
		} });
		const cleanupContextMenu = setupContextMenuHandler(xterm, {
			onCopy: () => {
				toast.success("Copied to clipboard");
			},
			onPaste: (text) => {
				commandBufferRef += text;
			},
			onCopyError: () => {
				toast.error("Failed to copy to clipboard");
			},
			onPasteError: () => {
				toast.error("Failed to paste from clipboard");
			}
		});
		// Cleanup on unmount
		onCleanup(() => {
			console.log("[Terminal:useEffect] UNMOUNT - paneId:", paneId);
			isUnmounted = true;
			inputDisposable.dispose();
			keyDisposable.dispose();
			cleanupKeyboard();
			cleanupClickToMove();
			cleanupFocus?.();
			cleanupResize();
			cleanupPaste();
			cleanupContextMenu();
			cleanup();
			// Serialize terminal state before detaching
			console.log("[Terminal:useEffect] Serializing state before detach...");
			const serializedState = serializeAddon.serialize();
			// Detach instead of kill - keeps session alive for reattach
			detachMutation.mutate({
				paneId,
				serializedState
			});
			console.log("[Terminal:useEffect] Disposing xterm...");
			xterm.dispose();
			xtermRef = undefined;
			fitAddonRef = undefined;
			searchAddonRef = undefined;
			serializeAddonRef = undefined;
			console.log("[Terminal:useEffect] UNMOUNT complete");
		});
	});
	// Update theme when isDark changes or VS Code theme changes (without recreating terminal)
	createEffect(() => {
		if (xtermRef) {
			const themeData = fullThemeData();
			const newTheme = getTerminalThemeFromVSCode(themeData?.colors, isDark);
			xtermRef.options.theme = newTheme;
		}
	});
	// Keyboard shortcut for search
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "f" && e.metaKey && !e.shiftKey) {
				e.preventDefault();
				setIsSearchOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});
	// Drag and drop files
	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = "copy";
		}
	};
	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		const files = Array.from(event.dataTransfer?.files || []);
		if (files.length === 0) return;
		// Get file paths (Electron exposes webUtils)
		const paths = files.map((file) => {
			// @ts-expect-error - Electron's webUtils API
			return window.webUtils?.getPathForFile?.(file) || file.name;
		});
		const text = shellEscapePaths(paths);
		if (!isExitedRef) {
			writeMutation.mutate({
				paneId,
				data: text
			});
		}
	};
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
	return <div role="application" class="relative h-full w-full overflow-hidden" style={{ "background-color": terminalBg() }} onDragOver={handleDragOver} onDrop={handleDrop}>
      <TerminalSearch searchAddon={searchAddonRef} isOpen={isSearchOpen()} onClose={() => setIsSearchOpen(false)} />
      <div ref={el => containerRef = el} class="h-full w-full" style={{ padding: "8px" }} />
    </div>;
}
