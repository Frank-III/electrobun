"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsHeaderControls = AgentsHeaderControls;
var button_1 = require("../../../components/ui/button");
var lucide_solid_1 = require("lucide-solid");
var tooltip_1 = require("../../../components/ui/tooltip");
var kbd_1 = require("../../../components/ui/kbd");
var hotkeys_1 = require("../../../lib/hotkeys");
function AgentsHeaderControls(_a) {
    var isSidebarOpen = _a.isSidebarOpen, onToggleSidebar = _a.onToggleSidebar, _b = _a.hasUnseenChanges, hasUnseenChanges = _b === void 0 ? false : _b, _c = _a.isSubChatsSidebarOpen, isSubChatsSidebarOpen = _c === void 0 ? false : _c;
    var toggleSidebarHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-sidebar");
    // Only show open button when both sidebars are closed
    if (isSidebarOpen || isSubChatsSidebarOpen)
        return null;
    return <tooltip_1.TooltipProvider>
      <tooltip_1.Tooltip delayDuration={500}>
        <tooltip_1.TooltipTrigger asChild>
          <button_1.Button variant="ghost" size="icon" onClick={onToggleSidebar} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md relative" aria-label="Open sidebar">
            <lucide_solid_1.AlignJustify class="h-4 w-4"/>
            {/* Unseen changes indicator */}
            {hasUnseenChanges && <div class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#307BD0] ring-2 ring-background"/>}
          </button_1.Button>
        </tooltip_1.TooltipTrigger>
        <tooltip_1.TooltipContent>
          Open sidebar
          {toggleSidebarHotkey && <kbd_1.Kbd>{toggleSidebarHotkey}</kbd_1.Kbd>}
        </tooltip_1.TooltipContent>
      </tooltip_1.Tooltip>
    </tooltip_1.TooltipProvider>;
}
