"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextShimmer = TextShimmer;
var solid_js_1 = require("solid-js");
var react_1 = require("motion/react");
var utils_1 = require("../../lib/utils");
function TextShimmer(props) {
    var _a, _b;
    var Component = (_a = props.as) !== null && _a !== void 0 ? _a : "p";
    var MotionComponent = (0, react_1.motion)(Component);
    var _c = (0, solid_js_1.createSignal)(props.delay === 0 || props.delay === undefined), shouldAnimate = _c[0], setShouldAnimate = _c[1];
    (0, solid_js_1.createEffect)(function () {
        var delay = props.delay;
        if (delay && delay > 0) {
            var timer_1 = setTimeout(function () {
                setShouldAnimate(true);
            }, delay * 1e3);
            return function () { return clearTimeout(timer_1); };
        }
    });
    var dynamicSpread = (0, solid_js_1.createMemo)(function () {
        var _a;
        var children = props.children;
        var spread = (_a = props.spread) !== null && _a !== void 0 ? _a : 2;
        if (typeof children === "string") {
            return children.length * spread;
        }
        return 50 * spread;
    });
    return (<MotionComponent class={(0, utils_1.cn)("relative inline-block bg-[length:250%_100%,auto] bg-clip-text", "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]", props.class)} initial={{ backgroundPosition: "100% center" }} animate={shouldAnimate() ? { backgroundPosition: "0% center" } : { backgroundPosition: "100% center" }} transition={{
            repeat: shouldAnimate() ? Infinity : 0,
            duration: (_b = props.duration) !== null && _b !== void 0 ? _b : 2,
            ease: "linear"
        }} style={{
            "--spread": "".concat(dynamicSpread(), "px"),
            "background-image": "var(--bg), linear-gradient(var(--base-color), var(--base-color))"
        }}>
			{props.children}
		</MotionComponent>);
}
