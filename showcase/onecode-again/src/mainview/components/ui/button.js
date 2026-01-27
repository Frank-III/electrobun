"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonVariants = exports.Button = void 0;
var class_variance_authority_1 = require("class-variance-authority");
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
// The outer border for the default button variant is always pure black (rgb(23,23,23)),
// and does not change in dark mode. The inner shadow remains theme-dependent.
var buttonVariants = (0, class_variance_authority_1.cva)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]",
            brand: "relative cursor-pointer space-x-2 font-regular dark:text-foreground ease-out duration-200 outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-gradient-to-b from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] hover:opacity-90 text-primary-foreground border-[hsl(var(--primary-gradient-start))] focus-visible:outline-[hsl(var(--primary-gradient-start))] data-[state=open]:opacity-90 data-[state=open]:outline-[hsl(var(--primary-gradient-start))] disabled:border-transparent",
            destructive: "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
            outline: "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground border border-input shadow-sm shadow-black/5 hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            sm: "h-7 rounded-md px-3",
            default: "h-7 rounded-md px-3",
            lg: "h-10 rounded-md px-8",
            icon: "h-7 w-7"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
exports.buttonVariants = buttonVariants;
var Button = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, [
        "class",
        "variant",
        "size",
        "ref",
        "children"
    ]), local = _a[0], others = _a[1];
    return <button class={(0, utils_1.cn)(buttonVariants({
            variant: local.variant,
            size: local.size,
            className: local.class
        }))} ref={local.ref} {...others}>
      {local.children}
    </button>;
};
exports.Button = Button;
