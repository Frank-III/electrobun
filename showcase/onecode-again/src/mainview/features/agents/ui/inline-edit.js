"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineEdit = InlineEdit;
var input_1 = require("../../../components/ui/input");
var solid_js_1 = require("solid-js");
function InlineEdit(_a) {
    var value = _a.value, onChange = _a.onChange, onSave = _a.onSave, onCancel = _a.onCancel, isEditing = _a.isEditing, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.placeholder, placeholder = _d === void 0 ? "" : _d;
    var _e = (0, solid_js_1.createSignal)(null), inputRef = _e[0], setInputRef = _e[1];
    // Use refs to avoid stale closures and effect re-runs
    var _f = (0, solid_js_1.createSignal)(onSave), onSaveRef = _f[0], setOnSaveRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(onCancel), onCancelRef = _g[0], setOnCancelRef = _g[1];
    // Keep refs up to date
    (0, solid_js_1.createEffect)(function () {
        onSaveRef.current = onSave;
        onCancelRef.current = onCancel;
    });
    // Auto-focus and select text when editing starts
    (0, solid_js_1.createEffect)(function () {
        if (isEditing && inputRef.current) {
            // Use setTimeout to ensure the input is rendered first
            var timeoutId_1 = setTimeout(function () {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 0);
            return function () { return clearTimeout(timeoutId_1); };
        }
    });
    // Handle clicks outside to save and exit editing mode
    (0, solid_js_1.createEffect)(function () {
        if (!isEditing)
            return;
        var handleClickOutside = function (event) {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                onSaveRef.current();
            }
        };
        // Add delay to avoid immediate trigger
        var timeoutId = setTimeout(function () {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);
        return function () {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });
    var handleKeyDown = function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onSaveRef.current();
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onCancelRef.current();
        }
    };
    if (!isEditing) {
        return null;
    }
    return <input_1.Input ref={inputRef} value={value} onChange={function (e) { return onChange(e.target.value); }} class={"ring-1 ring-[#3182ED] focus-visible:ring-1 focus-visible:ring-[#3182ED] focus-visible:ring-offset-0 rounded-[2px] shadow-none min-w-0 text-foreground border-0 h-auto px-1 py-0 leading-4 inline-flex ".concat(className)} onKeyDown={handleKeyDown} disabled={disabled} placeholder={placeholder}/>;
}
