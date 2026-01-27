"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandedWidgetSidebar = ExpandedWidgetSidebar;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var resizable_sidebar_1 = require("@/components/ui/resizable-sidebar");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
var kbd_1 = require("@/components/ui/kbd");
var atoms_1 = require("./atoms");
var info_section_1 = require("./sections/info-section");
var plan_section_1 = require("./sections/plan-section");
var terminal_section_1 = require("./sections/terminal-section");
var diff_section_1 = require("./sections/diff-section");
function ExpandedWidgetSidebar(_a) {
    var chatId = _a.chatId, worktreePath = _a.worktreePath, planPath = _a.planPath, planRefetchTrigger = _a.planRefetchTrigger, activeSubChatId = _a.activeSubChatId, canOpenDiff = _a.canOpenDiff, isDiffSidebarOpen = _a.isDiffSidebarOpen, setIsDiffSidebarOpen = _a.setIsDiffSidebarOpen, diffStats = _a.diffStats;
    // Per-workspace expanded widget state
    var expandedWidgetAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.expandedWidgetAtomFamily)(chatId); });
    var _b = (0, jotai_1.useAtom)(expandedWidgetAtom), expandedWidget = _b[0], setExpandedWidget = _b[1];
    // Get widget config
    var widgetConfig = (0, solid_js_1.createMemo)(function () { return atoms_1.WIDGET_REGISTRY.find(function (w) { return w.id === expandedWidget; }); });
    // Close sidebar callback
    var closeSidebar = function () {
        setExpandedWidget(null);
    };
    // Keyboard shortcut: Escape to close expanded sidebar
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.code === "Escape" && expandedWidget) {
                e.preventDefault();
                e.stopPropagation();
                closeSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Render the appropriate widget content based on expandedWidget
    var renderWidgetContent = function () {
        switch (expandedWidget) {
            case "info": return <info_section_1.InfoSection chatId={chatId} worktreePath={worktreePath} isExpanded/>;
            case "plan": return <plan_section_1.PlanSection chatId={activeSubChatId || chatId} planPath={planPath} refetchTrigger={planRefetchTrigger} isExpanded/>;
            case "terminal": return worktreePath ? <terminal_section_1.TerminalSection chatId={chatId} cwd={worktreePath} workspaceId={chatId} isExpanded/> : null;
            case "diff": return <diff_section_1.DiffSection chatId={chatId} isDiffSidebarOpen={isDiffSidebarOpen} setIsDiffSidebarOpen={setIsDiffSidebarOpen} diffStats={diffStats} isExpanded/>;
            default: return null;
        }
    };
    return <resizable_sidebar_1.ResizableSidebar isOpen={expandedWidget !== null} onClose={closeSidebar} widthAtom={atoms_1.expandedWidgetSidebarWidthAtom} side="right" minWidth={400} maxWidth={800} animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{
            borderLeftWidth: "0.5px",
            overflow: "hidden"
        }}>
      <div class="flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between pl-3 pr-1.5 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
          <div class="flex items-center gap-2">
            {widgetConfig && <>
                <widgetConfig.icon class="h-4 w-4 text-muted-foreground"/>
                <span class="text-sm font-medium">{widgetConfig.label}</span>
              </>}
          </div>
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button variant="ghost" size="icon" onClick={closeSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-muted-foreground hover:text-foreground flex-shrink-0 rounded-md" aria-label="Close">
                <lucide_solid_1.X class="h-4 w-4"/>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="bottom">
              Close
              <kbd_1.Kbd>Esc</kbd_1.Kbd>
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto">
          {renderWidgetContent()}
        </div>
      </div>
    </resizable_sidebar_1.ResizableSidebar>;
}
