"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffViewModeSwitcher = DiffViewModeSwitcher;
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var icons_1 = require("@/components/ui/icons");
var MODES = [
    {
        value: "side-peek",
        label: "Sidebar",
        Icon: icons_1.IconSidePeek
    },
    {
        value: "center-peek",
        label: "Dialog",
        Icon: icons_1.IconCenterPeek
    },
    {
        value: "full-page",
        label: "Fullscreen",
        Icon: icons_1.IconFullPage
    }
];
function DiffViewModeSwitcher(_a) {
    var _b;
    var mode = _a.mode, onModeChange = _a.onModeChange;
    var currentMode = (_b = MODES.find(function (m) { return m.value === mode; })) !== null && _b !== void 0 ? _b : MODES[0];
    var CurrentIcon = currentMode.Icon;
    return <dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10">
          <CurrentIcon class="size-4 text-muted-foreground"/>
        </button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent align="start" class="min-w-[140px]">
        {MODES.map(function (_a) {
            var value = _a.value, label = _a.label, Icon = _a.Icon;
            return <dropdown_menu_1.DropdownMenuItem key={value} onClick={function () { return onModeChange(value); }} class="flex items-center gap-2">
            <Icon class="size-4 text-muted-foreground"/>
            <span class="flex-1">{label}</span>
            {mode === value && <lucide_solid_1.Check class="size-4 text-muted-foreground ml-auto"/>}
          </dropdown_menu_1.DropdownMenuItem>;
        })}
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>;
}
