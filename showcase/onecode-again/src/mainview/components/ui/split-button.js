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
exports.SplitButton = SplitButton;
var React = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("./button");
var dropdown_menu_1 = require("./dropdown-menu");
var utils_1 = require("../../lib/utils");
function SplitButton(_a) {
    var label = _a.label, icon = _a.icon, badge = _a.badge, onClick = _a.onClick, dropdownContent = _a.dropdownContent, _b = _a.showDropdown, showDropdown = _b === void 0 ? true : _b, disabled = _a.disabled, _c = _a.variant, variant = _c === void 0 ? "default" : _c, _d = _a.size, size = _d === void 0 ? "sm" : _d, className = _a.className, props = __rest(_a, ["label", "icon", "badge", "onClick", "dropdownContent", "showDropdown", "disabled", "variant", "size", "className"]);
    // If no dropdown content, render just the button
    if (!showDropdown || !dropdownContent) {
        return <button_1.Button variant={variant} size={size} onClick={onClick} disabled={disabled} class={(0, utils_1.cn)("gap-1.5", className)} {...props}>
				{icon}
				<span>{label}</span>
				{badge && <span class="text-[10px] opacity-80">{badge}</span>}
			</button_1.Button>;
    }
    return <div class="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5">
			{/* Main action button */}
			<button_1.Button variant={variant} size={size} onClick={onClick} disabled={disabled} class={(0, utils_1.cn)("gap-1.5 rounded-r-none focus:z-10", className)} {...props}>
				{icon}
				<span>{label}</span>
				{badge && <span class="text-[10px] opacity-80">{badge}</span>}
			</button_1.Button>

			{/* Dropdown trigger */}
			<dropdown_menu_1.DropdownMenu>
				<dropdown_menu_1.DropdownMenuTrigger asChild>
					<button_1.Button variant={variant} size="icon" disabled={disabled} class="rounded-l-none focus:z-10 h-7 w-7" aria-label="More options">
						<lucide_solid_1.ChevronDown class="size-3.5"/>
					</button_1.Button>
				</dropdown_menu_1.DropdownMenuTrigger>
				<dropdown_menu_1.DropdownMenuContent align="end" class="min-w-[160px]">
					{dropdownContent}
				</dropdown_menu_1.DropdownMenuContent>
			</dropdown_menu_1.DropdownMenu>
		</div>;
}
