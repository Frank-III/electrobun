"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownMenuRadioGroup = exports.DropdownMenuSubTrigger = exports.DropdownMenuSubContent = exports.DropdownMenuSub = exports.DropdownMenuPortal = exports.DropdownMenuGroup = exports.DropdownMenuShortcut = exports.DropdownMenuSeparator = exports.DropdownMenuLabel = exports.DropdownMenuRadioItem = exports.DropdownMenuCheckboxItem = exports.DropdownMenuItem = exports.DropdownMenuContent = exports.DropdownMenuTrigger = exports.DropdownMenu = void 0;
var solid_js_1 = require("solid-js");
var dropdown_menu_1 = require("@kobalte/core/dropdown-menu");
var utils_1 = require("../../lib/utils");
var overlay_styles_1 = require("../../lib/overlay-styles");
var DropdownMenu = dropdown_menu_1.DropdownMenu;
exports.DropdownMenu = DropdownMenu;
var DropdownMenuTrigger = dropdown_menu_1.DropdownMenu.Trigger;
exports.DropdownMenuTrigger = DropdownMenuTrigger;
var DropdownMenuGroup = dropdown_menu_1.DropdownMenu.Group;
exports.DropdownMenuGroup = DropdownMenuGroup;
var DropdownMenuPortal = dropdown_menu_1.DropdownMenu.Portal;
exports.DropdownMenuPortal = DropdownMenuPortal;
var DropdownMenuSub = dropdown_menu_1.DropdownMenu.Sub;
exports.DropdownMenuSub = DropdownMenuSub;
var DropdownMenuRadioGroup = dropdown_menu_1.DropdownMenu.RadioGroup;
exports.DropdownMenuRadioGroup = DropdownMenuRadioGroup;
var DropdownMenuSubTrigger = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset", "children"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.SubTrigger class={(0, utils_1.cn)(overlay_styles_1.overlaySubTrigger, local.inset && "pl-8", local.class)} {...rest}>
			{local.children}
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={overlay_styles_1.overlayChevron}>
				<path d="m9 18 6-6-6-6"/>
			</svg>
		</dropdown_menu_1.DropdownMenu.SubTrigger>);
};
exports.DropdownMenuSubTrigger = DropdownMenuSubTrigger;
var DropdownMenuSubContent = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.SubContent class={(0, utils_1.cn)(overlay_styles_1.overlayContent, "min-w-[8rem] py-1 dark", local.class)} {...rest}/>);
};
exports.DropdownMenuSubContent = DropdownMenuSubContent;
var DropdownMenuContent = function (props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "sideOffset"]), local = _b[0], rest = _b[1];
    return (<dropdown_menu_1.DropdownMenu.Portal>
			<dropdown_menu_1.DropdownMenu.Content gutter={(_a = local.sideOffset) !== null && _a !== void 0 ? _a : 4} class={(0, utils_1.cn)(overlay_styles_1.overlayContent, "min-w-[8rem] py-1 dark", local.class)} data-dropdown="true" {...rest}/>
		</dropdown_menu_1.DropdownMenu.Portal>);
};
exports.DropdownMenuContent = DropdownMenuContent;
var DropdownMenuItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.Item class={(0, utils_1.cn)(overlay_styles_1.overlayItemWithIcon, local.inset && "pl-8", local.class)} {...rest}/>);
};
exports.DropdownMenuItem = DropdownMenuItem;
var DropdownMenuCheckboxItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.CheckboxItem class={(0, utils_1.cn)(overlay_styles_1.overlayCheckableItem, local.class)} {...rest}>
			<span class={overlay_styles_1.overlayItemIndicator}>
				<dropdown_menu_1.DropdownMenu.ItemIndicator>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
						<path d="M20 6 9 17l-5-5"/>
					</svg>
				</dropdown_menu_1.DropdownMenu.ItemIndicator>
			</span>
			{local.children}
		</dropdown_menu_1.DropdownMenu.CheckboxItem>);
};
exports.DropdownMenuCheckboxItem = DropdownMenuCheckboxItem;
var DropdownMenuRadioItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.RadioItem class={(0, utils_1.cn)(overlay_styles_1.overlayCheckableItem, local.class)} {...rest}>
			<span class={overlay_styles_1.overlayItemIndicator}>
				<dropdown_menu_1.DropdownMenu.ItemIndicator>
					<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" class="h-2 w-2 fill-current">
						<circle cx="12" cy="12" r="10"/>
					</svg>
				</dropdown_menu_1.DropdownMenu.ItemIndicator>
			</span>
			{local.children}
		</dropdown_menu_1.DropdownMenu.RadioItem>);
};
exports.DropdownMenuRadioItem = DropdownMenuRadioItem;
var DropdownMenuLabel = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset"]), local = _a[0], rest = _a[1];
    return (<dropdown_menu_1.DropdownMenu.GroupLabel class={(0, utils_1.cn)(overlay_styles_1.overlayLabel, local.inset && "pl-8", local.class)} {...rest}/>);
};
exports.DropdownMenuLabel = DropdownMenuLabel;
var DropdownMenuSeparator = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <dropdown_menu_1.DropdownMenu.Separator class={(0, utils_1.cn)(overlay_styles_1.overlaySeparator, local.class)} {...rest}/>;
};
exports.DropdownMenuSeparator = DropdownMenuSeparator;
var DropdownMenuShortcut = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <span class={(0, utils_1.cn)(overlay_styles_1.overlayShortcut, local.class)} {...rest}/>;
};
exports.DropdownMenuShortcut = DropdownMenuShortcut;
