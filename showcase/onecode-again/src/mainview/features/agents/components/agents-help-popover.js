"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsHelpPopover = AgentsHelpPopover;
var solid_js_1 = require("solid-js");
var dropdown_menu_1 = require("../../../components/ui/dropdown-menu");
var icons_1 = require("../../../components/ui/icons");
var icons_2 = require("../../../icons");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../../../lib/atoms");
function AgentsHelpPopover(_a) {
    var children = _a.children, controlledOpen = _a.open, controlledOnOpenChange = _a.onOpenChange, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(false), internalOpen = _c[0], setInternalOpen = _c[1];
    var setSettingsDialogOpen = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogOpenAtom);
    var setSettingsActiveTab = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogActiveTabAtom);
    // Use controlled state if provided, otherwise use internal state
    var open = controlledOpen !== null && controlledOpen !== void 0 ? controlledOpen : internalOpen;
    var setOpen = controlledOnOpenChange !== null && controlledOnOpenChange !== void 0 ? controlledOnOpenChange : setInternalOpen;
    var handleCommunityClick = function () {
        window.open("https://discord.gg/8ektTZGnj4", "_blank");
    };
    var handleKeyboardShortcutsClick = function () {
        setOpen(false);
        setSettingsActiveTab("keyboard");
        setSettingsDialogOpen(true);
    };
    return <dropdown_menu_1.DropdownMenu open={open} onOpenChange={setOpen}>
      <dropdown_menu_1.DropdownMenuTrigger asChild>{children}</dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent side="top" align="start" class="w-36">
        <dropdown_menu_1.DropdownMenuItem onClick={handleCommunityClick} class="gap-2">
          <icons_2.DiscordIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
          <span class="flex-1">Discord</span>
        </dropdown_menu_1.DropdownMenuItem>

        {!isMobile && <dropdown_menu_1.DropdownMenuItem onClick={handleKeyboardShortcutsClick} class="gap-2">
            <icons_1.KeyboardIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
            <span class="flex-1">Shortcuts</span>
          </dropdown_menu_1.DropdownMenuItem>}
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>;
}
