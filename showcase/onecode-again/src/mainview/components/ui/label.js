"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labelVariants = exports.Label = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var labelVariants = (0, class_variance_authority_1.cva)("text-[12px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
exports.labelVariants = labelVariants;
var Label = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, [
        "class",
        "ref",
        "children"
    ]), local = _a[0], others = _a[1];
    return <label ref={local.ref} class={(0, utils_1.cn)(labelVariants(), local.class)} {...others}>
      {local.children}
    </label>;
};
exports.Label = Label;
