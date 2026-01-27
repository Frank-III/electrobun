"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectValue = exports.SelectTrigger = exports.SelectSeparator = exports.SelectSection = exports.SelectLabel = exports.SelectItemDescription = exports.SelectItem = exports.SelectHiddenSelect = exports.SelectErrorMessage = exports.SelectDescription = exports.SelectContent = exports.Select = void 0;
var solid_js_1 = require("solid-js");
var select_1 = require("@kobalte/core/select");
var utils_1 = require("../../lib/utils");
var overlay_styles_1 = require("../../lib/overlay-styles");
var Select = select_1.Select;
exports.Select = Select;
var SelectValue = select_1.Select.Value;
exports.SelectValue = SelectValue;
var SelectDescription = select_1.Select.Description;
exports.SelectDescription = SelectDescription;
var SelectErrorMessage = select_1.Select.ErrorMessage;
exports.SelectErrorMessage = SelectErrorMessage;
var SelectHiddenSelect = select_1.Select.HiddenSelect;
exports.SelectHiddenSelect = SelectHiddenSelect;
var SelectTrigger = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<select_1.Select.Trigger class={(0, utils_1.cn)("flex h-9 w-full items-center justify-between gap-2 rounded-[10px] border border-input bg-background px-3 py-2 text-start text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground/70 [&>span]:min-w-0", local.class)} {...rest}>
			{local.children}
			<select_1.Select.Icon>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground/80">
					<path d="m6 9 6 6 6-6"/>
				</svg>
			</select_1.Select.Icon>
		</select_1.Select.Trigger>);
};
exports.SelectTrigger = SelectTrigger;
var SelectContent = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "position"]), local = _a[0], rest = _a[1];
    var position = function () { var _a; return (_a = local.position) !== null && _a !== void 0 ? _a : "popper"; };
    return (<select_1.Select.Portal>
			<select_1.Select.Content class={(0, utils_1.cn)(overlay_styles_1.overlayContentBase, overlay_styles_1.overlayMaxHeight, overlay_styles_1.overlayAnimation, overlay_styles_1.overlaySlideIn, "dark relative", position() === "popper" &&
            "min-w-[var(--kb-popper-anchor-width)] data-[expanded]:translate-y-1", local.class)} {...rest}>
				<select_1.Select.Listbox class={(0, utils_1.cn)("py-1 max-h-[inherit] overflow-y-auto")}/>
			</select_1.Select.Content>
		</select_1.Select.Portal>);
};
exports.SelectContent = SelectContent;
var SelectLabel = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <select_1.Select.Label class={(0, utils_1.cn)(overlay_styles_1.overlayLabel, local.class)} {...rest}/>;
};
exports.SelectLabel = SelectLabel;
var SelectItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children", "hasDescription"]), local = _a[0], rest = _a[1];
    return (<select_1.Select.Item class={(0, utils_1.cn)(overlay_styles_1.overlayItemBase, overlay_styles_1.overlayItemHover, overlay_styles_1.overlayItemFocus, overlay_styles_1.overlayItemDisabled, overlay_styles_1.overlayItemTransition, "pl-7 pr-1.5", local.hasDescription ? "min-h-auto py-2 items-start" : "items-center", local.class)} {...rest}>
			<span class={(0, utils_1.cn)(overlay_styles_1.overlayItemIndicator, local.hasDescription && "mt-0.5")}>
				<select_1.Select.ItemIndicator>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground/80">
						<path d="M20 6 9 17l-5-5"/>
					</svg>
				</select_1.Select.ItemIndicator>
			</span>
			<select_1.Select.ItemLabel class="flex flex-col gap-0.5">
				{local.children}
			</select_1.Select.ItemLabel>
		</select_1.Select.Item>);
};
exports.SelectItem = SelectItem;
var SelectItemDescription = select_1.Select.ItemDescription;
exports.SelectItemDescription = SelectItemDescription;
var SelectSection = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <select_1.Select.Section class={(0, utils_1.cn)("", local.class)} {...rest}/>;
};
exports.SelectSection = SelectSection;
var SelectSeparator = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <hr class={(0, utils_1.cn)(overlay_styles_1.overlaySeparator, local.class)} {...rest}/>;
};
exports.SelectSeparator = SelectSeparator;
