"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = Switch;
var solid_js_1 = require("solid-js");
var switch_1 = require("@kobalte/core/switch");
var utils_1 = require("../../lib/utils");
function Switch(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<switch_1.Switch data-slot="switch" class={(0, utils_1.cn)("group inline-flex items-center", local.class)} {...rest}>
			<switch_1.Switch.Input class="peer"/>
			<switch_1.Switch.Control class={(0, utils_1.cn)("peer inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", "disabled:cursor-not-allowed disabled:opacity-50", "data-[checked]:bg-primary bg-muted-foreground/20")}>
				<switch_1.Switch.Thumb data-slot="switch-thumb" class={(0, utils_1.cn)("pointer-events-none block h-4 w-[26px] rounded-full bg-background shadow-md ring-0 transition-all duration-200", "data-[checked]:bg-white data-[checked]:translate-x-[14px] translate-x-0", "group-active:w-[32px] group-active:transition-[transform,width] group-active:duration-150", "group-active:data-[checked]:translate-x-[8px]")}/>
			</switch_1.Switch.Control>
		</switch_1.Switch>);
}
