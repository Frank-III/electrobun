"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalTabs = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var icons_1 = require("@/components/ui/icons");
var tooltip_1 = require("@/components/ui/tooltip");
var context_menu_1 = require("@/components/ui/context-menu");
/**
* Get the shortened path (last folder name) from a full path
*/
function getShortPath(fullPath) {
    if (!fullPath)
        return null;
    var parts = fullPath.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
}
var TerminalTab = memo(forwardRef(function TerminalTab(_a, ref) {
    var terminal = _a.terminal, isActive = _a.isActive, isOnly = _a.isOnly, isTruncated = _a.isTruncated, cwd = _a.cwd, initialCwd = _a.initialCwd, isEditing = _a.isEditing, hasTabsToRight = _a.hasTabsToRight, canCloseOthers = _a.canCloseOthers, small = _a.small, onSelect = _a.onSelect, onClose = _a.onClose, onCloseOthers = _a.onCloseOthers, onCloseToRight = _a.onCloseToRight, onRename = _a.onRename, onEditingChange = _a.onEditingChange, onStartRename = _a.onStartRename, textRef = _a.textRef;
    // Only show path if it's different from initial cwd
    var isDifferentFromInitial = cwd && cwd !== initialCwd;
    var shortPath = isDifferentFromInitial ? getShortPath(cwd) : null;
    var _b = (0, solid_js_1.createSignal)(terminal.name), editValue = _b[0], setEditValue = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), inputRef = _c[0], setInputRef = _c[1];
    var handleClick = function () {
        if (!isEditing) {
            onSelect(terminal.id);
        }
    };
    var handleDoubleClick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        onStartRename();
    };
    var handleCloseClick = function (e) {
        e.stopPropagation();
        onClose(terminal.id);
    };
    var handleSave = function () {
        var trimmed = editValue.trim();
        if (trimmed && trimmed !== terminal.name) {
            onRename(terminal.id, trimmed);
        }
        onEditingChange(false);
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            setEditValue(terminal.name);
            onEditingChange(false);
        }
    };
    var handleBlur = function () {
        handleSave();
    };
    // Focus input when editing starts
    (0, solid_js_1.createEffect)(function () {
        if (isEditing && inputRef.current) {
            setEditValue(terminal.name);
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(function () {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            });
        }
    });
    return <context_menu_1.ContextMenu>
        <context_menu_1.ContextMenuTrigger asChild>
          <button ref={ref} onClick={handleClick} onDoubleClick={handleDoubleClick} class={(0, utils_1.cn)("group relative flex items-center rounded-md transition-colors h-6 flex-shrink-0 select-none", small ? "text-xs" : "text-sm", !isOnly ? "cursor-pointer" : "cursor-default", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", "overflow-hidden px-1.5 py-0.5 whitespace-nowrap min-w-[50px] gap-1.5", isActive ? "bg-muted text-foreground max-w-[180px]" : "hover:bg-muted/80 max-w-[150px]")}>
            {/* Terminal icon */}
            <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
              <icons_1.CustomTerminalIcon class="w-3.5 h-3.5 text-muted-foreground"/>
            </div>

            {/* Terminal name or input */}
            {isEditing ? <input ref={inputRef} type="text" value={editValue} onChange={function (e) { return setEditValue(e.target.value); }} onKeyDown={handleKeyDown} onBlur={handleBlur} onClick={function (e) { return e.stopPropagation(); }} class={(0, utils_1.cn)("relative z-0 text-left flex-1 min-w-0 pr-1 bg-transparent outline-none border-none", small ? "text-xs" : "text-sm")}/> : <span ref={textRef} class="relative z-0 text-left flex-1 min-w-0 pr-1 overflow-hidden flex items-center gap-1.5 whitespace-nowrap select-none cursor-[inherit]">
                <span>{terminal.name}</span>
                {shortPath && <span class="text-muted-foreground">{shortPath}</span>}
              </span>}

            {/* Gradient fade on the right when text is truncated */}
            {isTruncated && !isEditing && <div class={(0, utils_1.cn)("absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-[1] rounded-r-md opacity-100 group-hover:opacity-0 transition-opacity duration-200", isActive ? "bg-gradient-to-l from-muted to-transparent" : "bg-gradient-to-l from-background to-transparent")}/>}

            {/* Close button - only show when hovered and multiple tabs */}
            {!isOnly && !isEditing && <div class="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div class={(0, utils_1.cn)("absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center rounded-r-md", isActive ? "bg-[linear-gradient(to_left,hsl(var(--muted))_0%,hsl(var(--muted))_60%,transparent_100%)]" : "bg-[linear-gradient(to_left,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_0%,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_60%,transparent_100%)]")}/>
                <button type="button" onClick={handleCloseClick} class="relative z-20 hover:text-foreground rounded p-0.5 transition-[color,transform] duration-150 ease-out active:scale-[0.97]" aria-label="Close terminal">
                  <lucide_solid_1.X class="h-3 w-3"/>
                </button>
              </div>}
          </button>
        </context_menu_1.ContextMenuTrigger>
        <context_menu_1.ContextMenuContent class="w-48">
          <context_menu_1.ContextMenuItem onClick={onStartRename}>
            Rename terminal
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuSeparator />
          <context_menu_1.ContextMenuItem onClick={function () { return onClose(terminal.id); }} disabled={isOnly}>
            Close terminal
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={onCloseOthers} disabled={!canCloseOthers}>
            Close other terminals
          </context_menu_1.ContextMenuItem>
          <context_menu_1.ContextMenuItem onClick={onCloseToRight} disabled={!hasTabsToRight}>
            Close terminals to the right
          </context_menu_1.ContextMenuItem>
        </context_menu_1.ContextMenuContent>
      </context_menu_1.ContextMenu>;
}));
exports.TerminalTabs = memo(function TerminalTabs(_a) {
    var terminals = _a.terminals, activeTerminalId = _a.activeTerminalId, cwds = _a.cwds, initialCwd = _a.initialCwd, terminalBg = _a.terminalBg, _b = _a.hidePlusButton, hidePlusButton = _b === void 0 ? false : _b, _c = _a.small, small = _c === void 0 ? false : _c, onSelectTerminal = _a.onSelectTerminal, onCloseTerminal = _a.onCloseTerminal, onCloseOtherTerminals = _a.onCloseOtherTerminals, onCloseTerminalsToRight = _a.onCloseTerminalsToRight, onCreateTerminal = _a.onCreateTerminal, onRenameTerminal = _a.onRenameTerminal;
    var _d = (0, solid_js_1.createSignal)(null), tabsContainerRef = _d[0], setTabsContainerRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(new Map()), tabRefs = _e[0], setTabRefs = _e[1];
    var _f = (0, solid_js_1.createSignal)(new Map()), textRefs = _f[0], setTextRefs = _f[1];
    var _g = (0, solid_js_1.createSignal)(new Set()), truncatedTabs = _g[0], setTruncatedTabs = _g[1];
    var _h = (0, solid_js_1.createSignal)(false), showLeftGradient = _h[0], setShowLeftGradient = _h[1];
    var _j = (0, solid_js_1.createSignal)(false), showRightGradient = _j[0], setShowRightGradient = _j[1];
    var _k = (0, solid_js_1.createSignal)(null), editingTerminalId = _k[0], setEditingTerminalId = _k[1];
    var isOnly = terminals.length === 1;
    var handleStartRename = function (terminalId) {
        setEditingTerminalId(terminalId);
    };
    var handleEditingChange = function (terminalId, isEditing) {
        setEditingTerminalId(isEditing ? terminalId : null);
    };
    // Check scroll position for gradients
    var checkScrollPosition = function () {
        var container = tabsContainerRef.current;
        if (!container)
            return;
        var scrollLeft = container.scrollLeft, scrollWidth = container.scrollWidth, clientWidth = container.clientWidth;
        var isScrollable = scrollWidth > clientWidth;
        setShowLeftGradient(isScrollable && scrollLeft > 0);
        setShowRightGradient(isScrollable && scrollLeft < scrollWidth - clientWidth - 1);
    };
    // Update gradients on scroll
    (0, solid_js_1.createEffect)(function () {
        var container = tabsContainerRef.current;
        if (!container)
            return;
        checkScrollPosition();
        container.addEventListener("scroll", checkScrollPosition, { passive: true });
        return function () { return container.removeEventListener("scroll", checkScrollPosition); };
    });
    // Update gradients when tabs change
    (0, solid_js_1.createEffect)(function () {
        checkScrollPosition();
    });
    // Update gradients on window resize
    (0, solid_js_1.createEffect)(function () {
        var handleResize = function () { return checkScrollPosition(); };
        window.addEventListener("resize", handleResize);
        return function () { return window.removeEventListener("resize", handleResize); };
    });
    // Scroll to active tab when it changes
    (0, solid_js_1.createEffect)(function () {
        if (!activeTerminalId || !tabsContainerRef.current)
            return;
        var container = tabsContainerRef.current;
        var activeTabElement = tabRefs.current.get(activeTerminalId);
        if (activeTabElement) {
            setTimeout(function () {
                var containerRect = container.getBoundingClientRect();
                var tabRect = activeTabElement.getBoundingClientRect();
                var isTabLeftOfView = tabRect.left < containerRect.left;
                var isTabRightOfView = tabRect.right > containerRect.right;
                if (isTabLeftOfView || isTabRightOfView) {
                    var tabCenter = activeTabElement.offsetLeft + activeTabElement.offsetWidth / 2;
                    var containerCenter = container.offsetWidth / 2;
                    var targetScroll = tabCenter - containerCenter;
                    var maxScroll = container.scrollWidth - container.offsetWidth;
                    var clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
                    container.scrollTo({
                        left: clampedScroll,
                        behavior: "smooth"
                    });
                }
            }, 0);
        }
    });
    // Check if text is truncated for each tab
    (0, solid_js_1.createEffect)(function () {
        var checkTruncation = function () {
            var newTruncated = new Set();
            textRefs.current.forEach(function (el, terminalId) {
                if (el && el.scrollWidth > el.clientWidth) {
                    newTruncated.add(terminalId);
                }
            });
            setTruncatedTabs(newTruncated);
        };
        checkTruncation();
        var resizeObserver = new ResizeObserver(function () { return checkTruncation(); });
        textRefs.current.forEach(function (el) { return el && resizeObserver.observe(el); });
        return function () { return resizeObserver.disconnect(); };
    });
    // Cleanup refs for closed tabs to prevent memory leaks
    (0, solid_js_1.createEffect)(function () {
        var openIds = new Set(terminals.map(function (t) { return t.id; }));
        tabRefs.current.forEach(function (_, id) {
            if (!openIds.has(id)) {
                tabRefs.current.delete(id);
                textRefs.current.delete(id);
            }
        });
    });
    return <div class="relative flex-1 min-w-0 flex items-center h-7">
      {/* Left gradient */}
      {showLeftGradient && <div class="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-30" style={{ background: terminalBg ? "linear-gradient(to right, ".concat(terminalBg, ", transparent)") : undefined }}/>}

      {/* Scrollable tabs container - with padding-right for plus button */}
      <div ref={tabsContainerRef} class={(0, utils_1.cn)("flex items-center px-1 py-1 -my-1 gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide", !hidePlusButton && "pr-12")} style={{ WebkitAppRegion: "no-drag" }}>
        {terminals.map(function (terminal, index) {
            var hasTabsToRight = index < terminals.length - 1;
            var canCloseOthers = terminals.length > 1;
            return <TerminalTab key={terminal.id} ref={function (el) {
                    if (el) {
                        tabRefs.current.set(terminal.id, el);
                    }
                    else {
                        tabRefs.current.delete(terminal.id);
                    }
                }} terminal={terminal} isActive={terminal.id === activeTerminalId} isOnly={isOnly} isTruncated={truncatedTabs.has(terminal.id)} cwd={cwds[terminal.paneId]} initialCwd={initialCwd} isEditing={editingTerminalId === terminal.id} hasTabsToRight={hasTabsToRight} canCloseOthers={canCloseOthers} small={small} onSelect={onSelectTerminal} onClose={onCloseTerminal} onCloseOthers={function () { return onCloseOtherTerminals(terminal.id); }} onCloseToRight={function () { return onCloseTerminalsToRight(terminal.id); }} onRename={onRenameTerminal} onEditingChange={function (isEditing) { return handleEditingChange(terminal.id, isEditing); }} onStartRename={function () { return handleStartRename(terminal.id); }} textRef={function (el) {
                    if (el) {
                        textRefs.current.set(terminal.id, el);
                    }
                    else {
                        textRefs.current.delete(terminal.id);
                    }
                }}/>;
        })}
      </div>

      {/* Plus button - absolute positioned on right with gradient cover */}
      {!hidePlusButton && <div class="absolute right-0 top-0 bottom-0 flex items-center z-20" style={{ WebkitAppRegion: "no-drag" }}>
          {/* Gradient to cover content peeking from the left */}
          <div class="w-6 h-full" style={{ background: terminalBg ? "linear-gradient(to right, transparent, ".concat(terminalBg, ")") : undefined }}/>
          <div class="h-full flex items-center pr-1" style={{ backgroundColor: terminalBg }}>
            <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button variant="ghost" size="icon" onClick={onCreateTerminal} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" aria-label="New terminal">
                  <icons_1.PlusIcon class="h-3.5 w-3.5"/>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="bottom">New terminal</tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
          </div>
        </div>}
    </div>;
});
