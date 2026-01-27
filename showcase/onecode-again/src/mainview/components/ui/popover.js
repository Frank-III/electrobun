"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverPortal = exports.PopoverClose = exports.PopoverAnchor = exports.PopoverTrigger = void 0;
exports.Popover = Popover;
exports.PopoverContent = PopoverContent;
var solid_js_1 = require("solid-js");
var popover_1 = require("@kobalte/core/popover");
var utils_1 = require("../../lib/utils");
var overlay_styles_1 = require("../../lib/overlay-styles");
function Popover(props) {
    var merged = (0, solid_js_1.mergeProps)({ gutter: 4 }, props);
    return <popover_1.Popover {...merged}/>;
}
exports.PopoverTrigger = popover_1.Popover.Trigger;
exports.PopoverAnchor = popover_1.Popover.Anchor;
exports.PopoverClose = popover_1.Popover.CloseButton;
exports.PopoverPortal = popover_1.Popover.Portal;
function PopoverContent(props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "forceDark"]), local = _b[0], rest = _b[1];
    var forceDark = (_a = local.forceDark) !== null && _a !== void 0 ? _a : true;
    return (<popover_1.Popover.Portal>
			<popover_1.Popover.Content data-popover="true" class={(0, utils_1.cn)(overlay_styles_1.overlayContentBase, overlay_styles_1.overlayMaxHeight, overlay_styles_1.overlayAnimation, overlay_styles_1.overlaySlideIn, "min-w-[200px] py-1", "origin-(--kb-popover-content-transform-origin)", forceDark && "dark", local.class)} {...rest}/>
		</popover_1.Popover.Portal>);
}
