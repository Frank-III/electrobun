"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var Input = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, [
        "class",
        "type",
        "ref"
    ]), local = _a[0], others = _a[1];
    return <input type={local.type} class={(0, utils_1.cn)("flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50", local.type === "search" && "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none", local.type === "file" && "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground", local.type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", local.class)} ref={local.ref} {...others}/>;
};
exports.Input = Input;
