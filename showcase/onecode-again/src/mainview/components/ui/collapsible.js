"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collapsible = Collapsible;
exports.CollapsibleTrigger = CollapsibleTrigger;
exports.CollapsibleContent = CollapsibleContent;
var solid_js_1 = require("solid-js");
var collapsible_1 = require("@kobalte/core/collapsible");
var utils_1 = require("../../lib/utils");
function Collapsible(props) {
    return <collapsible_1.Collapsible data-slot="collapsible" {...props}/>;
}
function CollapsibleTrigger(props) {
    return <collapsible_1.Collapsible.Trigger data-slot="collapsible-trigger" {...props}/>;
}
function CollapsibleContent(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<collapsible_1.Collapsible.Content data-slot="collapsible-content" class={(0, utils_1.cn)("data-[closed]:animate-collapsible-up data-[expanded]:animate-collapsible-down overflow-hidden", local.class)} {...rest}/>);
}
