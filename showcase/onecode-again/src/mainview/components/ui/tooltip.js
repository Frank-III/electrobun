"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipPortal = exports.TooltipTrigger = void 0;
exports.Tooltip = Tooltip;
exports.TooltipContent = TooltipContent;
exports.TooltipProvider = TooltipProvider;
var solid_js_1 = require("solid-js");
var tooltip_1 = require("@kobalte/core/tooltip");
var utils_1 = require("../../lib/utils");
function Tooltip(props) {
    var merged = (0, solid_js_1.mergeProps)({ closeDelay: 0, openDelay: 0, placement: "top" }, props);
    return <tooltip_1.Tooltip {...merged}/>;
}
exports.TooltipTrigger = tooltip_1.Tooltip.Trigger;
exports.TooltipPortal = tooltip_1.Tooltip.Portal;
function TooltipContent(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children", "showArrow"]), local = _a[0], rest = _a[1];
    return (<tooltip_1.Tooltip.Portal>
			<tooltip_1.Tooltip.Content data-tooltip="true" class={(0, utils_1.cn)("relative z-50 max-w-[280px] flex flex-col items-start gap-0.5 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-lg", "animate-in fade-in-0 zoom-in-95", "data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95", "origin-(--kb-tooltip-content-transform-origin)", local.class)} {...rest}>
				{local.children}
				{local.showArrow && <tooltip_1.Tooltip.Arrow class="-my-px fill-popover drop-shadow-[0_1px_0_hsl(var(--border))]"/>}
			</tooltip_1.Tooltip.Content>
		</tooltip_1.Tooltip.Portal>);
}
// For backward compatibility - Kobalte doesn't need a provider wrapper
function TooltipProvider(props) {
    return props.children;
}
