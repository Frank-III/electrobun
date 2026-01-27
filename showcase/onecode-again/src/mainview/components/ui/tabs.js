"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = Tabs;
exports.TabsList = TabsList;
exports.TabsTrigger = TabsTrigger;
exports.TabsContent = TabsContent;
var solid_js_1 = require("solid-js");
var tabs_1 = require("@kobalte/core/tabs");
var utils_1 = require("../../lib/utils");
function Tabs(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<tabs_1.Tabs data-slot="tabs" class={(0, utils_1.cn)("flex flex-col gap-2", local.class)} {...rest}/>);
}
function TabsList(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<tabs_1.Tabs.List data-slot="tabs-list" class={(0, utils_1.cn)("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", local.class)} {...rest}/>);
}
function TabsTrigger(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<tabs_1.Tabs.Trigger data-slot="tabs-trigger" class={(0, utils_1.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm", local.class)} {...rest}/>);
}
function TabsContent(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<tabs_1.Tabs.Content data-slot="tabs-content" class={(0, utils_1.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2", local.class)} {...rest}/>);
}
