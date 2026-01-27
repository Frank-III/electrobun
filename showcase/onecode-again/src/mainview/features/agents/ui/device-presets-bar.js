"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePresetsBar = DevicePresetsBar;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var select_1 = require("../../../components/ui/select");
var input_1 = require("../../../components/ui/input");
var constants_1 = require("../constants");
function DevicePresetsBar(_a) {
    var selectedPreset = _a.selectedPreset, width = _a.width, height = _a.height, onPresetChange = _a.onPresetChange, onWidthChange = _a.onWidthChange, maxWidth = _a.maxWidth, className = _a.className;
    var _b = (0, solid_js_1.createSignal)(String(width)), widthInputValue = _b[0], setWidthInputValue = _b[1];
    // Sync input value when width prop changes
    (0, solid_js_1.createEffect)(function () {
        setWidthInputValue(String(width));
    });
    var handleWidthInputChange = function (e) {
        setWidthInputValue(e.target.value);
    };
    var handleWidthBlur = function () {
        var value = parseInt(widthInputValue);
        // Apply any valid positive number, clamp to reasonable bounds
        if (!isNaN(value) && value > 0) {
            var clampedValue = Math.max(constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH, Math.min(maxWidth, value));
            setWidthInputValue(String(clampedValue));
            onWidthChange(clampedValue);
        }
        else {
            // Invalid input - reset to current width
            setWidthInputValue(String(width));
        }
    };
    return <react_1.motion.div key="device-presets-above" initial={{
            opacity: 0,
            height: 0
        }} animate={{
            opacity: 1,
            height: "auto"
        }} exit={{
            opacity: 0,
            height: 0
        }} transition={{
            opacity: {
                duration: .15,
                ease: "easeInOut"
            },
            height: {
                duration: .2,
                ease: "easeInOut"
            }
        }} class={className}>
      <div class="flex items-center justify-center gap-2 px-4 py-2">
        <select_1.Select value={selectedPreset} onValueChange={onPresetChange}>
          <select_1.SelectTrigger class="h-7 text-xs px-2 w-auto">
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent class="!w-36">
            {constants_1.DEVICE_PRESETS.map(function (preset) { return <select_1.SelectItem key={preset.name} value={preset.name} class="whitespace-nowrap">
                {preset.name}
              </select_1.SelectItem>; })}
          </select_1.SelectContent>
        </select_1.Select>

        <div class="flex items-center gap-1">
          <span class="text-xs text-muted-foreground font-medium">W</span>
          <input_1.Input type="number" value={widthInputValue} onChange={handleWidthInputChange} onBlur={handleWidthBlur} onKeyDown={function (e) {
            if (e.key === "Enter") {
                e.currentTarget.blur();
            }
        }} class="h-7 w-auto min-w-9 text-xs px-1.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" style={{ width: "".concat(Math.max(widthInputValue.length || 1, 3) + 2, "ch") }} min={constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_WIDTH} max={maxWidth}/>
        </div>

        <div class="flex items-center gap-1">
          <span class="text-xs text-muted-foreground font-medium">H</span>
          <input_1.Input type="number" value={height} disabled class="h-7 w-auto min-w-[3ch] text-xs px-1.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" style={{ width: "".concat(String(height).length + 2, "ch") }} min={constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_HEIGHT} max={constants_1.AGENTS_PREVIEW_CONSTANTS.MAX_HEIGHT}/>
        </div>
      </div>
    </react_1.motion.div>;
}
