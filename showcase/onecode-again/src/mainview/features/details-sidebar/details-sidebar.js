"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailsSidebar = DetailsSidebar;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var resizable_sidebar_1 = require("@/components/ui/resizable-sidebar");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var icons_1 = require("@/components/ui/icons");
var kbd_1 = require("@/components/ui/kbd");
var utils_1 = require("@/lib/utils");
var hotkeys_1 = require("@/lib/hotkeys");
var atoms_1 = require("./atoms");
var widget_settings_popup_1 = require("./widget-settings-popup");
var info_section_1 = require("./sections/info-section");
var todo_widget_1 = require("./sections/todo-widget");
var plan_widget_1 = require("./sections/plan-widget");
var terminal_widget_1 = require("./sections/terminal-widget");
var changes_widget_1 = require("./sections/changes-widget");
function DetailsSidebar(_a) {
    var chatId = _a.chatId, worktreePath = _a.worktreePath, planPath = _a.planPath, mode = _a.mode, onBuildPlan = _a.onBuildPlan, planRefetchTrigger = _a.planRefetchTrigger, activeSubChatId = _a.activeSubChatId, isPlanSidebarOpen = _a.isPlanSidebarOpen, isTerminalSidebarOpen = _a.isTerminalSidebarOpen, isDiffSidebarOpen = _a.isDiffSidebarOpen, diffDisplayMode = _a.diffDisplayMode, canOpenDiff = _a.canOpenDiff, setIsDiffSidebarOpen = _a.setIsDiffSidebarOpen, diffStats = _a.diffStats, parsedFileDiffs = _a.parsedFileDiffs, onCommit = _a.onCommit, isCommitting = _a.isCommitting, onExpandTerminal = _a.onExpandTerminal, onExpandPlan = _a.onExpandPlan, onExpandDiff = _a.onExpandDiff, onFileSelect = _a.onFileSelect, remoteInfo = _a.remoteInfo, _b = _a.isRemoteChat, isRemoteChat = _b === void 0 ? false : _b;
    // Global sidebar open state
    var _c = (0, jotai_1.useAtom)(atoms_1.detailsSidebarOpenAtom), isOpen = _c[0], setIsOpen = _c[1];
    // Per-workspace widget visibility
    var widgetVisibilityAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.widgetVisibilityAtomFamily)(chatId); });
    var visibleWidgets = (0, jotai_1.useAtomValue)(widgetVisibilityAtom);
    // Per-workspace widget order
    var widgetOrderAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.widgetOrderAtomFamily)(chatId); });
    var widgetOrder = (0, jotai_1.useAtomValue)(widgetOrderAtom);
    // Close sidebar callback
    var closeSidebar = function () {
        setIsOpen(false);
    };
    // Resolved hotkey for tooltip
    var toggleDetailsHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-details");
    // Expand widget to legacy sidebar
    var handleExpandWidget = function (widgetId) {
        switch (widgetId) {
            case "terminal":
                onExpandTerminal === null || onExpandTerminal === void 0 ? void 0 : onExpandTerminal();
                break;
            case "plan":
                onExpandPlan === null || onExpandPlan === void 0 ? void 0 : onExpandPlan();
                break;
            case "diff":
                onExpandDiff === null || onExpandDiff === void 0 ? void 0 : onExpandDiff();
                break;
        }
    };
    // Check if a widget should be shown
    var isWidgetVisible = function (widgetId) { return visibleWidgets.includes(widgetId); };
    // Check if a widget can be expanded
    var canWidgetExpand = function (widgetId) {
        var _a;
        var config = atoms_1.WIDGET_REGISTRY.find(function (w) { return w.id === widgetId; });
        return (_a = config === null || config === void 0 ? void 0 : config.canExpand) !== null && _a !== void 0 ? _a : false;
    };
    // Keyboard shortcut: Cmd+Shift+\ to toggle details sidebar
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey && e.code === "Backslash") {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Get icon for widget
    var getWidgetIcon = function (widgetId) {
        switch (widgetId) {
            case "info": return lucide_solid_1.Box;
            case "todo": return lucide_solid_1.ListTodo;
            case "plan": return icons_1.PlanIcon;
            case "terminal": return lucide_solid_1.TerminalSquare;
            case "diff": return icons_1.DiffIcon;
            default: return lucide_solid_1.Box;
        }
    };
    // Widget Card Component - always expanded, no collapse functionality
    var WidgetCard = function (_a) {
        var widgetId = _a.widgetId, title = _a.title, badge = _a.badge, children = _a.children, customHeader = _a.customHeader, headerBg = _a.headerBg, hideExpand = _a.hideExpand;
        var Icon = getWidgetIcon(widgetId);
        var canExpand = canWidgetExpand(widgetId) && !hideExpand;
        return <div class="mx-2 mb-2">
          <div class={(0, utils_1.cn)("rounded-lg border border-border/50 overflow-hidden")}>
            {/* Widget Header - fixed height h-8 for consistency */}
            <div class={(0, utils_1.cn)("flex items-center gap-2 px-2 h-8 select-none group", !headerBg && "bg-muted/30")} style={headerBg ? { backgroundColor: headerBg } : undefined}>
              {customHeader ? <div class="flex-1 min-w-0 flex items-center gap-1">
                  {customHeader}
                </div> : <>
                  <Icon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                  <span class="text-xs font-medium text-foreground flex-1">
                    {title}
                  </span>
                  {badge}
                </>}

              {/* Expand to sidebar button */}
              {canExpand && <tooltip_1.Tooltip>
                  <tooltip_1.TooltipTrigger asChild>
                    <button_1.Button variant="ghost" size="icon" onClick={function () { return handleExpandWidget(widgetId); }} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label={"Expand ".concat(widgetId)}>
                      <lucide_solid_1.ArrowUpRight class="h-3 w-3"/>
                    </button_1.Button>
                  </tooltip_1.TooltipTrigger>
                  <tooltip_1.TooltipContent side="left">Expand to sidebar</tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>}
            </div>

            {/* Widget Content - always visible */}
            <div>{children}</div>
          </div>
        </div>;
    };
    return <resizable_sidebar_1.ResizableSidebar isOpen={isOpen} onClose={closeSidebar} widthAtom={atoms_1.detailsSidebarWidthAtom} side="right" minWidth={350} maxWidth={700} animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{
            borderLeftWidth: "0.5px",
            overflow: "hidden"
        }}>
      <div class="flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between px-2 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
          <div class="flex items-center gap-2">
            <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button variant="ghost" size="icon" onClick={closeSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close details">
                  <icons_1.IconDoubleChevronRight class="h-4 w-4"/>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="bottom">
                Close details
                {toggleDetailsHotkey && <kbd_1.Kbd>{toggleDetailsHotkey}</kbd_1.Kbd>}
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
            <span class="text-sm font-medium">Details</span>
          </div>
          <widget_settings_popup_1.WidgetSettingsPopup workspaceId={chatId} isRemoteChat={isRemoteChat}/>
        </div>

        {/* Widget Cards - rendered in user-defined order */}
        <div class="flex-1 overflow-y-auto py-2">
          {widgetOrder.map(function (widgetId) {
            // Skip if widget is not visible
            if (!isWidgetVisible(widgetId))
                return null;
            switch (widgetId) {
                case "info": return <WidgetCard key="info" widgetId="info" title="Workspace">
                    <info_section_1.InfoSection chatId={chatId} worktreePath={worktreePath} remoteInfo={remoteInfo}/>
                  </WidgetCard>;
                case "todo": return <todo_widget_1.TodoWidget key="todo" subChatId={activeSubChatId || null}/>;
                case "plan":
                    // Hidden when Plan sidebar is open
                    if (!planPath || isPlanSidebarOpen)
                        return null;
                    return <plan_widget_1.PlanWidget key="plan" chatId={chatId} activeSubChatId={activeSubChatId} planPath={planPath} refetchTrigger={planRefetchTrigger} mode={mode} onApprovePlan={onBuildPlan} onExpandPlan={onExpandPlan}/>;
                case "terminal":
                    // Hidden when Terminal sidebar is open
                    if (!worktreePath || isTerminalSidebarOpen)
                        return null;
                    return <terminal_widget_1.TerminalWidget key="terminal" chatId={chatId} cwd={worktreePath} workspaceId={chatId} onExpand={onExpandTerminal}/>;
                case "diff":
                    // Show widget if we have diff stats (local or remote)
                    // Hide only when Diff sidebar is open in side-peek mode
                    var hasDiffStats = !!diffStats && (diffStats.fileCount > 0 || diffStats.additions > 0 || diffStats.deletions > 0);
                    var canShowDiffWidget = canOpenDiff || isRemoteChat && hasDiffStats;
                    if (!canShowDiffWidget || isDiffSidebarOpen && diffDisplayMode === "side-peek")
                        return null;
                    return <changes_widget_1.ChangesWidget key="diff" chatId={chatId} worktreePath={worktreePath} diffStats={diffStats} parsedFileDiffs={parsedFileDiffs} onCommit={onCommit} isCommitting={isCommitting} onExpand={canOpenDiff ? onExpandDiff : undefined} onFileSelect={canOpenDiff ? onFileSelect : undefined} diffDisplayMode={diffDisplayMode}/>;
                default: return null;
            }
        })}
        </div>
      </div>
    </resizable_sidebar_1.ResizableSidebar>;
}
