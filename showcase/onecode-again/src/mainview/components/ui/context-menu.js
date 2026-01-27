"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenuRadioGroup = exports.ContextMenuSubTrigger = exports.ContextMenuSubContent = exports.ContextMenuSub = exports.ContextMenuPortal = exports.ContextMenuGroup = exports.ContextMenuShortcut = exports.ContextMenuSeparator = exports.ContextMenuLabel = exports.ContextMenuRadioItem = exports.ContextMenuCheckboxItem = exports.ContextMenuItem = exports.ContextMenuContent = exports.ContextMenuTrigger = exports.ContextMenu = void 0;
var solid_js_1 = require("solid-js");
var context_menu_1 = require("@kobalte/core/context-menu");
var utils_1 = require("../../lib/utils");
var icons_1 = require("./icons");
var overlay_styles_1 = require("../../lib/overlay-styles");
var ContextMenu = context_menu_1.ContextMenu;
exports.ContextMenu = ContextMenu;
var ContextMenuTrigger = context_menu_1.ContextMenu.Trigger;
exports.ContextMenuTrigger = ContextMenuTrigger;
var ContextMenuGroup = context_menu_1.ContextMenu.Group;
exports.ContextMenuGroup = ContextMenuGroup;
var ContextMenuPortal = context_menu_1.ContextMenu.Portal;
exports.ContextMenuPortal = ContextMenuPortal;
var ContextMenuSub = context_menu_1.ContextMenu.Sub;
exports.ContextMenuSub = ContextMenuSub;
var ContextMenuRadioGroup = context_menu_1.ContextMenu.RadioGroup;
exports.ContextMenuRadioGroup = ContextMenuRadioGroup;
var ContextMenuSubTrigger = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset", "children"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.SubTrigger class={(0, utils_1.cn)(overlay_styles_1.overlaySubTrigger, local.inset && "pl-8", local.class)} {...rest}>
			<span class="flex-1 inline-flex items-center gap-1.5">{local.children}</span>
			<icons_1.CaretRightIcon class={overlay_styles_1.overlayChevron}/>
		</context_menu_1.ContextMenu.SubTrigger>);
};
exports.ContextMenuSubTrigger = ContextMenuSubTrigger;
var ContextMenuSubContent = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.SubContent class={(0, utils_1.cn)(overlay_styles_1.overlayContent, "min-w-[200px] py-1 dark", local.class)} {...rest}/>);
};
exports.ContextMenuSubContent = ContextMenuSubContent;
var ContextMenuContent = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.Portal>
			<context_menu_1.ContextMenu.Content class={(0, utils_1.cn)(overlay_styles_1.overlayContent, "min-w-[200px] py-1 dark", local.class)} {...rest}/>
		</context_menu_1.ContextMenu.Portal>);
};
exports.ContextMenuContent = ContextMenuContent;
var ContextMenuItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.Item class={(0, utils_1.cn)(overlay_styles_1.overlayItemWithIcon, local.inset && "pl-8", local.class)} {...rest}/>);
};
exports.ContextMenuItem = ContextMenuItem;
var ContextMenuCheckboxItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.CheckboxItem class={(0, utils_1.cn)(overlay_styles_1.overlayCheckableItem, local.class)} {...rest}>
			<span class={overlay_styles_1.overlayItemIndicator}>
				<context_menu_1.ContextMenu.ItemIndicator>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
						<path d="M20 6 9 17l-5-5"/>
					</svg>
				</context_menu_1.ContextMenu.ItemIndicator>
			</span>
			{local.children}
		</context_menu_1.ContextMenu.CheckboxItem>);
};
exports.ContextMenuCheckboxItem = ContextMenuCheckboxItem;
var ContextMenuRadioItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.RadioItem class={(0, utils_1.cn)(overlay_styles_1.overlayCheckableItem, local.class)} {...rest}>
			<span class={overlay_styles_1.overlayItemIndicator}>
				<context_menu_1.ContextMenu.ItemIndicator>
					<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 15 15" fill="currentColor" class="h-2 w-2 fill-current">
						<circle cx="7.5" cy="7.5" r="7.5"/>
					</svg>
				</context_menu_1.ContextMenu.ItemIndicator>
			</span>
			{local.children}
		</context_menu_1.ContextMenu.RadioItem>);
};
exports.ContextMenuRadioItem = ContextMenuRadioItem;
var ContextMenuLabel = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "inset"]), local = _a[0], rest = _a[1];
    return (<context_menu_1.ContextMenu.GroupLabel class={(0, utils_1.cn)(overlay_styles_1.overlayLabel, "font-semibold", local.inset && "pl-8", local.class)} {...rest}/>);
};
exports.ContextMenuLabel = ContextMenuLabel;
var ContextMenuSeparator = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <context_menu_1.ContextMenu.Separator class={(0, utils_1.cn)(overlay_styles_1.overlaySeparator, local.class)} {...rest}/>;
};
exports.ContextMenuSeparator = ContextMenuSeparator;
var ContextMenuShortcut = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <span class={(0, utils_1.cn)(overlay_styles_1.overlayShortcut, local.class)} {...rest}/>;
};
exports.ContextMenuShortcut = ContextMenuShortcut;
