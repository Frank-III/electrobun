"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverCardTrigger = exports.HoverCard = void 0;
exports.HoverCardContent = HoverCardContent;
var solid_js_1 = require("solid-js");
var hover_card_1 = require("@kobalte/core/hover-card");
var utils_1 = require("../../lib/utils");
exports.HoverCard = hover_card_1.HoverCard;
exports.HoverCardTrigger = hover_card_1.HoverCard.Trigger;
function HoverCardContent(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<hover_card_1.HoverCard.Portal>
			<hover_card_1.HoverCard.Content class={(0, utils_1.cn)("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95", "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", local.class)} {...rest}/>
		</hover_card_1.HoverCard.Portal>);
}
