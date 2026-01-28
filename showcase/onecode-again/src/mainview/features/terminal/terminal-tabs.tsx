import { createEffect, createSignal, onCleanup, For } from "solid-js";
import { X } from "lucide-solid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, CustomTerminalIcon } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import type { TerminalInstance } from "./types";
/**
* Get the shortened path (last folder name) from a full path
*/
function getShortPath(fullPath: string | undefined): string | null {
	if (!fullPath) return null;
	const parts = fullPath.split("/").filter(Boolean);
	return parts[parts.length - 1] || null;
}
interface TerminalTabProps {
	terminal: TerminalInstance;
	isActive: boolean;
	isOnly: boolean;
	isTruncated: boolean;
	cwd: string | undefined;
	initialCwd: string;
	isEditing: boolean;
	hasTabsToRight: boolean;
	canCloseOthers: boolean;
	/** Use smaller text size for widget mode */
	small?: boolean;
	onSelect: (id: string) => void;
	onClose: (id: string) => void;
	onCloseOthers: () => void;
	onCloseToRight: () => void;
	onRename: (id: string, name: string) => void;
	onEditingChange: (isEditing: boolean) => void;
	onStartRename: () => void;
	textRef: (el: HTMLSpanElement | null) => void;
	ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}
function TerminalTab(props: TerminalTabProps) {
	// Only show path if it's different from initial cwd
	const isDifferentFromInitial = () => props.cwd && props.cwd !== props.initialCwd;
	const shortPath = () => isDifferentFromInitial() ? getShortPath(props.cwd) : null;
	const [editValue, setEditValue] = createSignal(props.terminal.name);
	let inputRef: HTMLInputElement | undefined;
	const handleClick = () => {
		if (!props.isEditing) {
			props.onSelect(props.terminal.id);
		}
	};
	const handleDoubleClick = (e: MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		props.onStartRename();
	};
	const handleCloseClick = (e: MouseEvent) => {
		e.stopPropagation();
		props.onClose(props.terminal.id);
	};
	const handleSave = () => {
		const trimmed = editValue().trim();
		if (trimmed && trimmed !== props.terminal.name) {
			props.onRename(props.terminal.id, trimmed);
		}
		props.onEditingChange(false);
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			setEditValue(props.terminal.name);
			props.onEditingChange(false);
		}
	};
	const handleBlur = () => {
		handleSave();
	};
	// Focus input when editing starts
	createEffect(() => {
		if (props.isEditing && inputRef) {
			setEditValue(props.terminal.name);
			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				if (inputRef) {
					inputRef.focus();
					inputRef.select();
				}
			});
		}
	});
	return <ContextMenu>
        <ContextMenuTrigger asChild>
          <button ref={el => { if (typeof props.ref === 'function') props.ref(el); }} onClick={handleClick} onDblClick={handleDoubleClick} class={cn("group relative flex items-center rounded-md transition-colors h-6 flex-shrink-0 select-none", props.small ? "text-xs" : "text-sm", !props.isOnly ? "cursor-pointer" : "cursor-default", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", "overflow-hidden px-1.5 py-0.5 whitespace-nowrap min-w-[50px] gap-1.5", props.isActive ? "bg-muted text-foreground max-w-[180px]" : "hover:bg-muted/80 max-w-[150px]")}>
            {	/* Terminal icon */}
            <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
              <CustomTerminalIcon class="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            { /* Terminal name or input */}
            {props.isEditing ? <input ref={el => inputRef = el} type="text" value={editValue()} onInput={(e) => setEditValue(e.currentTarget.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} onClick={(e) => e.stopPropagation()} class={cn("relative z-0 text-left flex-1 min-w-0 pr-1 bg-transparent outline-none border-none", props.small ? "text-xs" : "text-sm")} /> : <span ref={props.textRef} class="relative z-0 text-left flex-1 min-w-0 pr-1 overflow-hidden flex items-center gap-1.5 whitespace-nowrap select-none cursor-[inherit]">
                <span>{props.terminal.name}</span>
                {shortPath() && <span class="text-muted-foreground">{shortPath()}</span>}
              </span>}

            { /* Gradient fade on the right when text is truncated */}
            {props.isTruncated && !props.isEditing && <div class={cn("absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-[1] rounded-r-md opacity-100 group-hover:opacity-0 transition-opacity duration-200", props.isActive ? "bg-gradient-to-l from-muted to-transparent" : "bg-gradient-to-l from-background to-transparent")} />}

            { /* Close button - only show when hovered and multiple tabs */}
            {!props.isOnly && !props.isEditing && <div class="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div class={cn("absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center rounded-r-md", props.isActive ? "bg-[linear-gradient(to_left,hsl(var(--muted))_0%,hsl(var(--muted))_60%,transparent_100%)]" : "bg-[linear-gradient(to_left,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_0%,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_60%,transparent_100%)]")} />
                <button type="button" onClick={handleCloseClick} class="relative z-20 hover:text-foreground rounded p-0.5 transition-[color,transform] duration-150 ease-out active:scale-[0.97]" aria-label="Close terminal">
                  <X class="h-3 w-3" />
                </button>
              </div>}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent class="w-48">
          <ContextMenuItem onClick={props.onStartRename}>
            Rename terminal
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => props.onClose(props.terminal.id)} disabled={props.isOnly}>
            Close terminal
          </ContextMenuItem>
          <ContextMenuItem onClick={props.onCloseOthers} disabled={!props.canCloseOthers}>
            Close other terminals
          </ContextMenuItem>
          <ContextMenuItem onClick={props.onCloseToRight} disabled={!props.hasTabsToRight}>
            Close terminals to the right
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>;
}
interface TerminalTabsProps {
	terminals: TerminalInstance[];
	activeTerminalId: string | null;
	cwds: Record<string, string>;
	initialCwd: string;
	/** Background color for gradients - should match terminal background */
	terminalBg?: string;
	/** Hide the plus button (when it's rendered externally) */
	hidePlusButton?: boolean;
	/** Use smaller text size for widget mode */
	small?: boolean;
	onSelectTerminal: (id: string) => void;
	onCloseTerminal: (id: string) => void;
	onCloseOtherTerminals: (id: string) => void;
	onCloseTerminalsToRight: (id: string) => void;
	onCreateTerminal: () => void;
	onRenameTerminal: (id: string, name: string) => void;
}
export function TerminalTabs(props: TerminalTabsProps) {
	let tabsContainerRef: HTMLDivElement | undefined;
	const tabRefs = new Map<string, HTMLButtonElement>();
	const textRefs = new Map<string, HTMLSpanElement>();
	const [truncatedTabs, setTruncatedTabs] = createSignal<Set<string>>(new Set());
	const [showLeftGradient, setShowLeftGradient] = createSignal(false);
	const [showRightGradient, setShowRightGradient] = createSignal(false);
	const [editingTerminalId, setEditingTerminalId] = createSignal<string | null>(null);
	const isOnly = () => props.terminals.length === 1;
	const handleStartRename = (terminalId: string) => {
		setEditingTerminalId(terminalId);
	};
	const handleEditingChange = (terminalId: string, isEditing: boolean) => {
		setEditingTerminalId(isEditing ? terminalId : null);
	};
	// Check scroll position for gradients
	const checkScrollPosition = () => {
		const container = tabsContainerRef;
		if (!container) return;
		const { scrollLeft, scrollWidth, clientWidth } = container;
		const isScrollable = scrollWidth > clientWidth;
		setShowLeftGradient(isScrollable && scrollLeft > 0);
		setShowRightGradient(isScrollable && scrollLeft < scrollWidth - clientWidth - 1);
	};
	// Update gradients on scroll
	createEffect(() => {
		const container = tabsContainerRef;
		if (!container) return;
		checkScrollPosition();
		container.addEventListener("scroll", checkScrollPosition, { passive: true });
		onCleanup(() => container.removeEventListener("scroll", checkScrollPosition));
	});
	// Update gradients when tabs change
	createEffect(() => {
		checkScrollPosition();
	});
	// Update gradients on window resize
	createEffect(() => {
		const handleResize = () => checkScrollPosition();
		window.addEventListener("resize", handleResize);
		onCleanup(() => window.removeEventListener("resize", handleResize));
	});
	// Scroll to active tab when it changes
	createEffect(() => {
		if (!props.activeTerminalId || !tabsContainerRef) return;
		const container = tabsContainerRef;
		const activeTabElement = tabRefs.get(props.activeTerminalId);
		if (activeTabElement) {
			setTimeout(() => {
				const containerRect = container.getBoundingClientRect();
				const tabRect = activeTabElement.getBoundingClientRect();
				const isTabLeftOfView = tabRect.left < containerRect.left;
				const isTabRightOfView = tabRect.right > containerRect.right;
				if (isTabLeftOfView || isTabRightOfView) {
					const tabCenter = activeTabElement.offsetLeft + activeTabElement.offsetWidth / 2;
					const containerCenter = container.offsetWidth / 2;
					const targetScroll = tabCenter - containerCenter;
					const maxScroll = container.scrollWidth - container.offsetWidth;
					const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
					container.scrollTo({
						left: clampedScroll,
						behavior: "smooth"
					});
				}
			}, 0);
		}
	});
	// Check if text is truncated for each tab
	createEffect(() => {
		const checkTruncation = () => {
			const newTruncated = new Set<string>();
			textRefs.forEach((el, terminalId) => {
				if (el && el.scrollWidth > el.clientWidth) {
					newTruncated.add(terminalId);
				}
			});
			setTruncatedTabs(newTruncated);
		};
		checkTruncation();
		const resizeObserver = new ResizeObserver(() => checkTruncation());
		textRefs.forEach((el) => el && resizeObserver.observe(el));
		onCleanup(() => resizeObserver.disconnect());
	});
	// Cleanup refs for closed tabs to prevent memory leaks
	createEffect(() => {
		const openIds = new Set(props.terminals.map((t) => t.id));
		tabRefs.forEach((_, id) => {
			if (!openIds.has(id)) {
				tabRefs.delete(id);
				textRefs.delete(id);
			}
		});
	});
	return <div class="relative flex-1 min-w-0 flex items-center h-7">
      {	/* Left gradient */}
      {showLeftGradient() && <div class="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-30" style={{ background: props.terminalBg ? `linear-gradient(to right, ${props.terminalBg}, transparent)` : undefined }} />}

      { /* Scrollable tabs container - with padding-right for plus button */}
      <div ref={el => tabsContainerRef = el} class={cn("flex items-center px-1 py-1 -my-1 gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide", !props.hidePlusButton && "pr-12")} style={{ "-webkit-app-region": "no-drag" }}>
        <For each={props.terminals}>{(terminal, index) => {
			const hasTabsToRight = () => index() < props.terminals.length - 1;
			const canCloseOthers = () => props.terminals.length > 1;
			return <TerminalTab ref={(el) => {
				if (el) {
					tabRefs.set(terminal.id, el);
				} else {
					tabRefs.delete(terminal.id);
				}
			}} terminal={terminal} isActive={terminal.id === props.activeTerminalId} isOnly={isOnly()} isTruncated={truncatedTabs().has(terminal.id)} cwd={props.cwds[terminal.paneId]} initialCwd={props.initialCwd} isEditing={editingTerminalId() === terminal.id} hasTabsToRight={hasTabsToRight()} canCloseOthers={canCloseOthers()} small={props.small} onSelect={props.onSelectTerminal} onClose={props.onCloseTerminal} onCloseOthers={() => props.onCloseOtherTerminals(terminal.id)} onCloseToRight={() => props.onCloseTerminalsToRight(terminal.id)} onRename={props.onRenameTerminal} onEditingChange={(isEditing) => handleEditingChange(terminal.id, isEditing)} onStartRename={() => handleStartRename(terminal.id)} textRef={(el) => {
				if (el) {
					textRefs.set(terminal.id, el);
				} else {
					textRefs.delete(terminal.id);
				}
			}} />;
		}}</For>
      </div>

      {	/* Plus button - absolute positioned on right with gradient cover */}
      {!props.hidePlusButton && <div class="absolute right-0 top-0 bottom-0 flex items-center z-20" style={{ "-webkit-app-region": "no-drag" }}>
          { /* Gradient to cover content peeking from the left */}
          <div class="w-6 h-full" style={{ background: props.terminalBg ? `linear-gradient(to right, transparent, ${props.terminalBg})` : undefined }} />
          <div class="h-full flex items-center pr-1" style={{ "background-color": props.terminalBg }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={props.onCreateTerminal} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" aria-label="New terminal">
                  <PlusIcon class="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">New terminal</TooltipContent>
            </Tooltip>
          </div>
        </div>}
    </div>;
}
