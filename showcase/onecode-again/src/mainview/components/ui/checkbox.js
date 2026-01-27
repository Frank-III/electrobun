"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = Checkbox;
var solid_js_1 = require("solid-js");
var checkbox_1 = require("@kobalte/core/checkbox");
var utils_1 = require("../../lib/utils");
function Checkbox(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<checkbox_1.Checkbox class={(0, utils_1.cn)("peer size-4 shrink-0 rounded border border-input shadow-sm shadow-black/5 outline-offset-2", "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70", "disabled:cursor-not-allowed disabled:opacity-50", "data-[checked]:border-primary data-[indeterminate]:border-primary", "data-[checked]:bg-primary data-[indeterminate]:bg-primary", "data-[checked]:text-primary-foreground data-[indeterminate]:text-primary-foreground", local.class)} {...rest}>
			<checkbox_1.Checkbox.Input class="peer"/>
			<checkbox_1.Checkbox.Control class="flex items-center justify-center text-current size-full">
				<checkbox_1.Checkbox.Indicator>
					<svg width="9" height="9" viewBox="0 0 9 9" fill="currentcolor" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.53547 0.62293C8.88226 0.849446 8.97976 1.3142 8.75325 1.66099L4.5083 8.1599C4.38833 8.34356 4.19397 8.4655 3.9764 8.49358C3.75883 8.52167 3.53987 8.45309 3.3772 8.30591L0.616113 5.80777C0.308959 5.52987 0.285246 5.05559 0.563148 4.74844C0.84105 4.44128 1.31533 4.41757 1.62249 4.69547L3.73256 6.60459L7.49741 0.840706C7.72393 0.493916 8.18868 0.396414 8.53547 0.62293Z"/>
					</svg>
				</checkbox_1.Checkbox.Indicator>
			</checkbox_1.Checkbox.Control>
		</checkbox_1.Checkbox>);
}
