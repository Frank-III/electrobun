"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Textarea = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var Textarea = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class", "ref"]), local = _a[0], others = _a[1];
    return <textarea class={(0, utils_1.cn)("flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50", local.class)} ref={local.ref} {...others}/>;
};
exports.Textarea = Textarea;
