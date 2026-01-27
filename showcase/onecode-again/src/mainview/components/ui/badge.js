"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeVariants = exports.Badge = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var badgeVariants = (0, class_variance_authority_1.cva)("inline-flex items-center rounded-full border px-2 py-[1px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", {
    variants: { variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground"
        } },
    defaultVariants: { variant: "default" }
});
exports.badgeVariants = badgeVariants;
var Badge = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, [
        "class",
        "variant",
        "children"
    ]), local = _a[0], others = _a[1];
    return <div class={(0, utils_1.cn)(badgeVariants({ variant: local.variant }), local.class)} {...others}>
      {local.children}
    </div>;
};
exports.Badge = Badge;
