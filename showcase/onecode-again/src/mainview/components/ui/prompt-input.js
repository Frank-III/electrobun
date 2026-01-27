"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptInputTextarea = void 0;
exports.PromptInput = PromptInput;
exports.PromptInputActions = PromptInputActions;
exports.PromptInputAction = PromptInputAction;
exports.PromptInputContextItems = PromptInputContextItems;
exports.PromptInputVariantContext = PromptInputVariantContext;
var textarea_1 = require("./textarea");
var tooltip_1 = require("./tooltip");
var utils_1 = require("../../lib/utils");
var solid_js_1 = require("solid-js");
var PromptInputContext = (0, solid_js_1.createContext)({
    isLoading: false,
    value: "",
    setValue: function () { },
    maxHeight: 240,
    onSubmit: undefined,
    disabled: false,
    selectedVariant: null,
    contextItems: null
});
function usePromptInput() {
    var context = (0, solid_js_1.useContext)(PromptInputContext);
    if (!context) {
        throw new Error("usePromptInput must be used within a PromptInput");
    }
    return context;
}
function PromptInput(_a) {
    var className = _a.className, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b, _c = _a.maxHeight, maxHeight = _c === void 0 ? 240 : _c, value = _a.value, onValueChange = _a.onValueChange, onSubmit = _a.onSubmit, children = _a.children, selectedVariant = _a.selectedVariant, contextItems = _a.contextItems;
    var _d = (0, solid_js_1.createSignal)(value || ""), internalValue = _d[0], setInternalValue = _d[1];
    var handleChange = function (newValue) {
        setInternalValue(newValue);
        onValueChange === null || onValueChange === void 0 ? void 0 : onValueChange(newValue);
    };
    return <PromptInputContext.Provider value={{
            isLoading: isLoading,
            value: value !== null && value !== void 0 ? value : internalValue,
            setValue: onValueChange !== null && onValueChange !== void 0 ? onValueChange : handleChange,
            maxHeight: maxHeight,
            onSubmit: onSubmit,
            selectedVariant: selectedVariant,
            contextItems: contextItems
        }}>
      <div class={(0, utils_1.cn)("flex flex-col gap-2", className)}>{children}</div>
    </PromptInputContext.Provider>;
}
var PromptInputTextareaInner = function (_a, forwardedRef) {
    var className = _a.className, onKeyDown = _a.onKeyDown, _b = _a.disableAutosize, disableAutosize = _b === void 0 ? false : _b, props = __rest(_a, ["className", "onKeyDown", "disableAutosize"]);
    var _c = usePromptInput(), value = _c.value, setValue = _c.setValue, maxHeight = _c.maxHeight, onSubmit = _c.onSubmit, disabled = _c.disabled;
    var _d = (0, solid_js_1.createSignal)(null), textareaRef = _d[0], setTextareaRef = _d[1];
    // Expose internal ref
    (0, solid_js_1.createEffect)(function () {
        if (!forwardedRef)
            return;
        if (typeof forwardedRef === "function") {
            forwardedRef(textareaRef.current);
        }
        else if (forwardedRef) {
            ;
            forwardedRef.current = textareaRef.current;
        }
    });
    (0, solid_js_1.createEffect)(function () {
        if (disableAutosize || !textareaRef.current)
            return;
        var textarea = textareaRef.current;
        // Reset height to auto to measure correctly
        textarea.style.height = "auto";
        var scrollHeight = textarea.scrollHeight;
        var maxHeightPx = typeof maxHeight === "number" ? maxHeight : parseInt(maxHeight, 10) || 240;
        var newHeight = Math.min(scrollHeight, maxHeightPx);
        textarea.style.height = "".concat(newHeight, "px");
        textarea.style.overflowY = scrollHeight > maxHeightPx ? "auto" : "hidden";
    });
    var handleKeyDown = function (e) {
        // Prevent submission during IME composition (e.g., Chinese/Japanese/Korean input)
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit();
        }
        onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
    };
    var maxHeightStyle = typeof maxHeight === "number" ? "".concat(maxHeight, "px") : maxHeight;
    return <textarea_1.Textarea ref={textareaRef} value={value} onChange={function (e) { return setValue(e.target.value); }} onKeyDown={handleKeyDown} class={(0, utils_1.cn)("min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0", className)} style={{
            maxHeight: maxHeightStyle,
            overflowY: "hidden"
        }} rows={1} disabled={disabled} {...props}/>;
};
var PromptInputTextarea = (0, solid_js_1.forwardRef)(PromptInputTextareaInner);
exports.PromptInputTextarea = PromptInputTextarea;
PromptInputTextarea.displayName = "PromptInputTextarea";
function PromptInputActions(_a) {
    var children = _a.children, className = _a.className, props = __rest(_a, ["children", "className"]);
    return <div class={(0, utils_1.cn)("flex items-center gap-2", className)} {...props}>
      {children}
    </div>;
}
function PromptInputAction(_a) {
    var tooltip = _a.tooltip, children = _a.children, className = _a.className, _b = _a.side, side = _b === void 0 ? "top" : _b, props = __rest(_a, ["tooltip", "children", "className", "side"]);
    var disabled = usePromptInput().disabled;
    return <tooltip_1.Tooltip {...props}>
      <tooltip_1.TooltipTrigger asChild disabled={disabled}>
        {children}
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent side={side} class={className}>
        {tooltip}
      </tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
}
// Used for displaying context items (components, shapes, etc.) that are added to the chat context
function PromptInputContextItems() {
    var contextItems = usePromptInput().contextItems;
    if (!contextItems)
        return null;
    return <>{contextItems}</>;
}
// Used for displaying the selected variant context
function PromptInputVariantContext() {
    var selectedVariant = usePromptInput().selectedVariant;
    if (!selectedVariant)
        return null;
    return <div class="mx-2 mt-1">
      <div class="inline-flex items-center gap-1 px-1.5 py-1 bg-muted text-foreground rounded-md">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
          <path d="M5.58953 0.937438C5.26408 0.612 4.73645 0.612 4.41099 0.937438L3.54193 1.80652C3.21649 2.13195 3.21649 2.65959 3.54193 2.98502L4.41099 3.8541C4.73645 4.17954 5.26408 4.17954 5.58953 3.8541L6.45862 2.98502C6.78403 2.65959 6.78403 2.13195 6.45858 1.80652L5.58953 0.937438Z" fill="currentColor" fillOpacity="0.8"/>
          <path d="M2.98502 3.54156C2.65959 3.21613 2.13195 3.21613 1.80652 3.54156L0.937438 4.41063C0.612 4.73608 0.612 5.26371 0.937438 5.58917L1.80652 6.45825C2.13195 6.78367 2.65959 6.78367 2.98502 6.45821L3.8541 5.58917C4.17954 5.26371 4.17954 4.73608 3.8541 4.41063L2.98502 3.54156Z" fill="currentColor" fillOpacity="0.8"/>
          <path d="M8.19306 3.54156C7.8676 3.21613 7.33997 3.21613 7.01451 3.54156L6.14543 4.41063C5.82001 4.73608 5.82001 5.26371 6.14543 5.58917L7.01451 6.45825C7.33997 6.78367 7.8676 6.78367 8.19306 6.45821L9.06214 5.58917C9.38756 5.26371 9.38755 4.73608 9.0621 4.41063L8.19306 3.54156Z" fill="currentColor" fillOpacity="0.8"/>
          <path d="M5.58953 6.1458C5.26408 5.82038 4.73645 5.82038 4.41099 6.1458L3.54193 7.01488C3.21649 7.34034 3.21649 7.86796 3.54193 8.19342L4.41099 9.0625C4.73645 9.38792 5.26408 9.38792 5.58953 9.06246L6.45862 8.19342C6.78403 7.86796 6.78403 7.34034 6.45858 7.01488L5.58953 6.1458Z" fill="currentColor" fillOpacity="0.8"/>
        </svg>
        <span class="truncate text-[10px]">{selectedVariant.name}</span>
      </div>
    </div>;
}
