import { cn } from "../../../lib/utils";
import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { createEffect, createMemo, createSignal, onCleanup, For, Show } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { Portal } from "solid-js/web";
import { IconSpinner } from "../../../components/ui/icons";
import type { SlashCommandOption, SlashTriggerPayload } from "./types";
import { filterBuiltinCommands, BUILTIN_SLASH_COMMANDS } from "./builtin-commands";
import type { AgentMode } from "../atoms";

interface AgentsSlashCommandProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (command: SlashCommandOption) => void;
	searchText: string;
	position: {
		top: number;
		left: number;
	};
	projectPath?: string;
	mode?: AgentMode;
	disabledCommands?: string[];
}
// Memoized to prevent re-renders when parent re-renders
export function AgentsSlashCommand({ isOpen, onClose, onSelect, searchText, position, projectPath, mode, disabledCommands }: AgentsSlashCommandProps) {
	let dropdownRef: HTMLDivElement | undefined;
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [debouncedSearchText, setDebouncedSearchText] = createSignal(searchText);
	// Debounce search text (300ms to match file mention)
	const updateDebouncedSearch = debounce((text: string) => setDebouncedSearchText(text), 300);
	createEffect(() => {
		updateDebouncedSearch(searchText);
		onCleanup(() => updateDebouncedSearch.clear());
	});
	// Fetch custom commands from filesystem
	const fileCommandsQuery = useQuery(() => ({
		queryKey: ["commands", "list", projectPath],
		queryFn: () => desktopRpc.commands.list({ projectPath }),
		enabled: isOpen,
		staleTime: 3e4,
		refetchOnWindowFocus: false,
	}));
	const fileCommands = () => fileCommandsQuery.data ?? [];
	const isLoading = () => fileCommandsQuery.isLoading;
	// Transform FileCommand to SlashCommandOption
	const customCommands = createMemo(() => {
		return (fileCommands() ?? []).map((cmd) => ({
			id: `custom:${cmd.source}:${cmd.name}`,
			name: cmd.name,
			command: `/${cmd.name}`,
			description: cmd.description || `Custom command from ${cmd.source}`,
			category: "repository" as const,
			path: cmd.path,
			argumentHint: cmd.argumentHint
		}));
	});
	// State for loading command content
	const [isLoadingContent, setIsLoadingContent] = createSignal(false);
	const queryClient = useQueryClient();
	// Handle command selection - fetch content for custom commands
	const handleSelect = async (option: SlashCommandOption) => {
		// For builtin commands, call onSelect directly
		if (option.category === "builtin") {
			onSelect(option);
			return;
		}
		// For custom commands, fetch the prompt content from filesystem
		if (option.path) {
			setIsLoadingContent(true);
			try {
				const result = await queryClient.fetchQuery({
					queryKey: ["commands", "getContent", option.path],
					queryFn: () => desktopRpc.commands.getContent({ path: option.path! }),
				});
				// Call onSelect with the fetched prompt
				onSelect({
					...option,
					prompt: result.content
				});
			} catch (error) {
				console.error("Failed to fetch slash command content:", error);
				// Still close the dropdown even on error
				onClose();
			} finally {
				setIsLoadingContent(false);
			}
		} else {
			// Fallback - just call onSelect without prompt
			onSelect(option);
		}
	};
	// Combine builtin and repository commands, filtered by search
	const options = createMemo(() => {
		let builtinFiltered = filterBuiltinCommands(debouncedSearchText());
		// Hide /plan when already in Plan mode, hide /agent when already in Agent mode
		if (mode !== undefined) {
			builtinFiltered = builtinFiltered.filter((cmd) => {
				if (mode === "plan" && cmd.name === "plan") return false;
				if (mode === "agent" && cmd.name === "agent") return false;
				return true;
			});
		}
		// Filter out disabled commands
		if (disabledCommands?.length) {
			builtinFiltered = builtinFiltered.filter((cmd) => !disabledCommands.includes(cmd.name));
		}
		// Filter custom commands by search
		const searchText = debouncedSearchText();
		let customFiltered = customCommands();
		if (searchText) {
			const query = searchText.toLowerCase();
			customFiltered = customFiltered.filter((cmd) => cmd.name.toLowerCase().includes(query) || cmd.command.toLowerCase().includes(query));
		}
		// Sort all commands by name length (shorter = closer match), then alphabetically for stability
		return [...customFiltered, ...builtinFiltered].sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
	});
	// Track previous values for smarter selection reset
	let prevIsOpenRef = isOpen;
	let prevSearchRef = debouncedSearchText();
	let placementValue: "above" | "below" | null = null;
	// CONSOLIDATED: Single useLayoutEffect for selection management
	createEffect(() => {
		const didJustOpen = isOpen && !prevIsOpenRef;
		const didSearchChange = debouncedSearchText() !== prevSearchRef;
		// Reset to 0 when opening or search changes
		if (didJustOpen || didSearchChange) {
			setSelectedIndex(0);
		} else if (options().length > 0 && selectedIndex() >= options().length) {
			setSelectedIndex(Math.max(0, options().length - 1));
		}
		// Update refs
		prevIsOpenRef = isOpen;
		prevSearchRef = debouncedSearchText();
	});
	// Reset placement when closed
	createEffect(() => {
		if (!isOpen) {
			placementValue = null;
		}
	});
	// Keyboard navigation
	createEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					// Guard against modulo by zero when no options
					if (options().length > 0) {
						setSelectedIndex((prev) => (prev + 1) % options().length);
					}
					break;
				case "ArrowUp":
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					// Guard against modulo by zero when no options
					if (options().length > 0) {
						setSelectedIndex((prev) => (prev - 1 + options().length) % options().length);
					}
					break;
				case "Enter":
					if (e.shiftKey) return;
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					if (options()[selectedIndex()]) {
						handleSelect(options()[selectedIndex()]);
					}
					break;
				case "Escape":
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					onClose();
					break;
				case "Tab":
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					if (options()[selectedIndex()]) {
						handleSelect(options()[selectedIndex()]);
					}
					break;
			}
		};
		window.addEventListener("keydown", handleKeyDown, { capture: true });
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown, { capture: true }));
	});
	// Auto-scroll selected item into view
	createEffect(() => {
		if (!isOpen || !dropdownRef) return;
		if (selectedIndex() === 0) {
			dropdownRef.scrollTo({
				top: 0,
				behavior: "auto"
			});
			return;
		}
		const elements = dropdownRef.querySelectorAll("[data-option-index]");
		const selectedElement = elements[selectedIndex()] as HTMLElement;
		if (selectedElement) {
			selectedElement.scrollIntoView({ block: "nearest" });
		}
	});
	// Click outside
	createEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
	});
	// Calculate dropdown dimensions (matching file mention style)
	const dropdownWidth = 320;
	const itemHeight = 28;
	const headerHeight = 24;
	// Single "Commands" header for all options
	const opts = options();
	const headersCount = opts.length > 0 ? 1 : 0;
	const requestedHeight = Math.min(opts.length * itemHeight + headersCount * headerHeight + 8, 200);
	const gap = 8;
	// Decide placement like Radix Popover (auto-flip top/bottom)
	const safeMargin = 10;
	const caretOffsetBelow = 20;
	const availableBelow = window.innerHeight - (position.top + caretOffsetBelow) - safeMargin;
	const availableAbove = position.top - safeMargin;
	// Compute desired placement, but lock it for the duration of the open state
	if (placementValue === null) {
		const condition1 = availableAbove >= requestedHeight && availableBelow < requestedHeight;
		const condition2 = availableAbove > availableBelow && availableAbove >= requestedHeight;
		const shouldPlaceAbove = condition1 || condition2;
		placementValue = shouldPlaceAbove ? "above" : "below";
	}
	const placeAbove = placementValue === "above";
	// Compute final top based on placement
	let finalTop = placeAbove ? position.top - gap : position.top + gap + caretOffsetBelow;
	// Slight left bias to better align with '/'
	const leftOffset = -4;
	let finalLeft = position.left + leftOffset;
	// Adjust horizontal overflow
	if (finalLeft + dropdownWidth > window.innerWidth - safeMargin) {
		finalLeft = window.innerWidth - dropdownWidth - safeMargin;
	}
	if (finalLeft < safeMargin) {
		finalLeft = safeMargin;
	}
	// Compute actual maxHeight based on available space on the chosen side
	const computedMaxHeight = Math.max(80, Math.min(requestedHeight, placeAbove ? availableAbove - gap : availableBelow - gap));
	const transformY = placeAbove ? "translateY(-100%)" : "translateY(0)";
	return (
		<Show when={isOpen} fallback={null}>
		<Portal mount={document.body}>
			<div
				ref={el => dropdownRef = el}
				class="fixed z-[99999] overflow-y-auto rounded-[10px] border border-border bg-popover py-1 text-xs text-popover-foreground shadow-lg dark [&::-webkit-scrollbar]:hidden"
				style={{
					top: `${finalTop}px`,
					left: `${finalLeft}px`,
					width: `${dropdownWidth}px`,
					"max-height": `${computedMaxHeight}px`,
					transform: transformY,
					"scrollbar-width": "none"
				}}
			>
				{/* All commands in one section - custom first, then builtin */}
				<Show when={opts.length > 0}>
					<div class="px-2.5 py-1.5 mx-1 text-xs font-medium text-muted-foreground">
						Commands
					</div>
					<For each={opts}>
						{(option, index) => {
							const isSelected = () => selectedIndex() === index();
							return (
								<div
									data-option-index={index()}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleSelect(option);
									}}
									onMouseEnter={() => setSelectedIndex(index())}
									class={cn(
										"group inline-flex w-[calc(100%-8px)] mx-1 items-center whitespace-nowrap outline-none",
										"h-7 px-1.5 justify-start text-xs rounded-md",
										"transition-colors cursor-pointer select-none",
										isSelected() ? "dark:bg-neutral-800 bg-accent text-foreground" : "text-muted-foreground dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground"
									)}
								>
									<span class="flex items-center gap-1 w-full min-w-0">
										<span class="shrink-0 whitespace-nowrap font-medium">{option.command}</span>
										<span class="text-muted-foreground flex-1 min-w-0 ml-2 overflow-hidden text-[10px] truncate">{option.description}</span>
									</span>
								</div>
							);
						}}
					</For>
				</Show>

				{/* Loading state for repository commands */}
				<Show when={isLoading()}>
					<div class="flex items-center gap-1.5 h-7 px-1.5 mx-1 text-xs text-muted-foreground">
						<IconSpinner class="h-3.5 w-3.5" />
						<span>Loading commands...</span>
					</div>
				</Show>

				{/* Empty state */}
				<Show when={!isLoading() && opts.length === 0}>
					<div class="h-7 px-1.5 mx-1 flex items-center text-xs text-muted-foreground">
						{debouncedSearchText() ? `No commands matching "${debouncedSearchText()}"` : "No commands available"}
					</div>
				</Show>
			</div>
		</Portal>
		</Show>
	);
}
