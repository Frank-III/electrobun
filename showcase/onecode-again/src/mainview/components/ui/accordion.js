"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccordionContent = exports.AccordionTrigger = exports.AccordionItem = exports.Accordion = void 0;
var solid_js_1 = require("solid-js");
var accordion_1 = require("@kobalte/core/accordion");
var utils_1 = require("../../lib/utils");
var Accordion = accordion_1.Accordion;
exports.Accordion = Accordion;
var AccordionItem = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <accordion_1.Accordion.Item class={(0, utils_1.cn)("border-b", local.class)} {...rest}/>;
};
exports.AccordionItem = AccordionItem;
var AccordionTrigger = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<accordion_1.Accordion.Header class="flex">
			<accordion_1.Accordion.Trigger class={(0, utils_1.cn)("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-expanded]>svg]:rotate-180", local.class)} {...rest}>
				{local.children}
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 transition-transform duration-200">
					<path d="m6 9 6 6 6-6"/>
				</svg>
			</accordion_1.Accordion.Trigger>
		</accordion_1.Accordion.Header>);
};
exports.AccordionTrigger = AccordionTrigger;
var AccordionContent = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "children"]), local = _a[0], rest = _a[1];
    return (<accordion_1.Accordion.Content class="text-sm transition-all data-[closed]:animate-accordion-up data-[expanded]:animate-accordion-down" {...rest}>
			<div class={(0, utils_1.cn)("pb-4 pt-0", local.class)}>{local.children}</div>
		</accordion_1.Accordion.Content>);
};
exports.AccordionContent = AccordionContent;
