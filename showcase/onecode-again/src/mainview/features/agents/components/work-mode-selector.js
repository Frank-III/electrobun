"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkModeSelector = WorkModeSelector;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var popover_1 = require("../../../components/ui/popover");
var icons_1 = require("../../../components/ui/icons");
var utils_1 = require("../../../lib/utils");
var workModeOptions = [
    {
        id: "local",
        label: "Local",
        icon: icons_1.LaptopIcon
    },
    {
        id: "worktree",
        label: "Worktree",
        icon: lucide_solid_1.GitBranch
    },
    {
        id: "sandbox",
        label: "Background",
        icon: icons_1.CloudIcon,
        disabled: true,
        soon: true
    }
];
function WorkModeSelector(_a) {
    var value = _a.value, onChange = _a.onChange, disabled = _a.disabled;
    var _b = (0, solid_js_1.createSignal)(false), open = _b[0], setOpen = _b[1];
    var selectedOption = workModeOptions.find(function (opt) { return opt.id === value; }) || workModeOptions[1];
    var Icon = selectedOption.icon;
    return <popover_1.Popover open={open} onOpenChange={setOpen}>
      <popover_1.PopoverTrigger asChild>
        <button type="button" class={(0, utils_1.cn)("flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", disabled && "opacity-50 pointer-events-none")} disabled={disabled}>
          <Icon class="w-4 h-4"/>
          <span>{selectedOption.label}</span>
          <icons_1.IconChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
        </button>
      </popover_1.PopoverTrigger>
      <popover_1.PopoverContent class="w-[160px] min-w-[160px]" align="start">
        {workModeOptions.map(function (option) {
            var OptionIcon = option.icon;
            var isSelected = value === option.id;
            var isDisabled = "disabled" in option && option.disabled;
            var isSoon = "soon" in option && option.soon;
            return <button key={option.id} onClick={function () {
                    if (isDisabled)
                        return;
                    onChange(option.id);
                    setOpen(false);
                }} disabled={isDisabled} class={(0, utils_1.cn)("flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 w-[calc(100%-8px)] text-sm text-left rounded-md cursor-default select-none outline-none transition-colors", isDisabled ? "opacity-50 cursor-not-allowed" : isSelected ? "dark:bg-neutral-800 text-foreground" : "dark:hover:bg-neutral-800 hover:text-foreground")}>
              <OptionIcon class="h-4 w-4 text-muted-foreground shrink-0"/>
              <span class="flex-1">{option.label}</span>
              {isSoon && <span class="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  Soon
                </span>}
              {isSelected && !isDisabled && <icons_1.CheckIcon class="h-4 w-4 shrink-0"/>}
            </button>;
        })}
      </popover_1.PopoverContent>
    </popover_1.Popover>;
}
