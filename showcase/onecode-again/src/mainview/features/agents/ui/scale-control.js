"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleControl = ScaleControl;
var utils_1 = require("../../../lib/utils");
var solid_js_1 = require("solid-js");
var popover_1 = require("../../../components/ui/popover");
var constants_1 = require("../constants");
function ScaleControl(_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.presets, presets = _b === void 0 ? constants_1.AGENTS_PREVIEW_CONSTANTS.SCALE_PRESETS : _b, className = _a.className;
    var _c = (0, solid_js_1.createSignal)(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = (0, solid_js_1.createSignal)(String(value)), inputValue = _d[0], setInputValue = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), inputRef = _e[0], setInputRef = _e[1];
    // Sync input value when value prop changes
    (0, solid_js_1.createEffect)(function () {
        setInputValue(String(value));
    });
    var handleInputChange = function (e) {
        var raw = e.target.value.replace(/[^0-9]/g, "");
        setInputValue(raw);
        var num = parseInt(raw);
        if (!isNaN(num) && num >= constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_SCALE && num <= constants_1.AGENTS_PREVIEW_CONSTANTS.MAX_SCALE) {
            onChange(num);
        }
    };
    var handleCommit = function () {
        var num = parseInt(inputValue);
        if (!isNaN(num) && num >= constants_1.AGENTS_PREVIEW_CONSTANTS.MIN_SCALE && num <= constants_1.AGENTS_PREVIEW_CONSTANTS.MAX_SCALE) {
            onChange(num);
            setInputValue(String(num));
        }
        else {
            setInputValue(String(value));
        }
    };
    var handleKeyDown = function (e) {
        var _a, _b;
        if (e.key === "Enter") {
            handleCommit();
            setIsOpen(false);
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        if (e.key === "Escape") {
            setInputValue(String(value));
            setIsOpen(false);
            (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.blur();
        }
    };
    return <popover_1.Popover open={isOpen} onOpenChange={function (open) {
            if (!open) {
                handleCommit();
                setIsOpen(false);
            }
        }}>
      <popover_1.PopoverAnchor asChild>
        <div class={(0, utils_1.cn)("flex items-center h-7 px-1.5 ml-1 rounded-md cursor-text transition-colors", "hover:bg-muted", isOpen && "bg-muted", className)} onClick={function (e) {
            var _a;
            // If click is not on input, focus input
            if (e.target !== inputRef.current) {
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }}>
          <input ref={inputRef} type="text" value={inputValue} onChange={handleInputChange} onFocus={function (e) {
            e.target.select();
            if (!isOpen) {
                setIsOpen(true);
            }
        }} onKeyDown={handleKeyDown} class="w-[3ch] text-xs text-muted-foreground bg-transparent border-none outline-none text-right tabular-nums"/>
          <span class="text-xs text-muted-foreground">%</span>
        </div>
      </popover_1.PopoverAnchor>
      <popover_1.PopoverContent class="w-[var(--radix-popover-trigger-width)] min-w-[60px] p-0" align="start" side="bottom" sideOffset={4} onOpenAutoFocus={function (e) { return e.preventDefault(); }}>
        {presets.map(function (preset) { return <button key={preset} onClick={function () {
                onChange(preset);
                setInputValue(String(preset));
                setIsOpen(false);
            }} class={(0, utils_1.cn)("flex items-center justify-center w-[calc(100%-8px)] mx-1 first:mt-1 last:mb-1 min-h-[32px] text-sm rounded-md transition-colors", "dark:hover:bg-neutral-800 hover:bg-accent", value === preset && "dark:bg-neutral-800 bg-accent font-medium")}>
            {preset}%
          </button>; })}
      </popover_1.PopoverContent>
    </popover_1.Popover>;
}
