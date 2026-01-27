"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kbd = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var icons_1 = require("./icons");
/** Parse shortcut string and replace modifier symbols with icons */
function renderShortcut(children) {
    if (typeof children !== "string")
        return children;
    // Map of symbols to icons (3 = 12px to match text-xs visually)
    var symbolMap = {
        "⌘": function () { return <icons_1.CmdIcon class="h-3 w-3"/>; },
        "⌥": function () { return <icons_1.OptionIcon class="h-3 w-3"/>; },
        "⇧": function () { return <icons_1.ShiftIcon class="h-3 w-3"/>; },
        "⌃": function () { return <span>⌃</span>; },
        "↵": function () { return <icons_1.EnterIcon class="h-3 w-3"/>; }
    };
    // Split by symbols and replace with icons
    var regex = /([⌘⌥⇧⌃↵])/g;
    var tokens = children.split(regex).filter(Boolean);
    return <solid_js_1.For each={tokens}>
      {function (token) {
            var _a;
            return <solid_js_1.Show when={symbolMap[token]} fallback={<span>{token}</span>}>
          {(_a = symbolMap[token]) === null || _a === void 0 ? void 0 : _a.call(symbolMap)}
        </solid_js_1.Show>;
        }}
    </solid_js_1.For>;
}
var Kbd = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, [
        "class",
        "children",
        "ref"
    ]), local = _a[0], others = _a[1];
    return <kbd ref={local.ref} class={(0, utils_1.cn)("pointer-events-none inline-flex items-center gap-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/60", local.class)} {...others}>
      {renderShortcut(local.children)}
    </kbd>;
};
exports.Kbd = Kbd;
