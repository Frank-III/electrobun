"use client";
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonGroup = void 0;
var React = require("solid-js");
var utils_1 = require("../../lib/utils");
var ButtonGroup = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return <div ref={ref} class={(0, utils_1.cn)("inline-flex rounded-md shadow-sm", "[&>button]:rounded-none", "[&>button:first-child]:rounded-l-md", "[&>button:last-child]:rounded-r-md", "[&>button:not(:first-child)]:-ml-px", className)} {...props}>
        {children}
      </div>;
});
exports.ButtonGroup = ButtonGroup;
ButtonGroup.displayName = "ButtonGroup";
