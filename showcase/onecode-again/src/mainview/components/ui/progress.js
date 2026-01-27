"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = Progress;
var solid_js_1 = require("solid-js");
var progress_1 = require("@kobalte/core/progress");
var utils_1 = require("../../lib/utils");
function Progress(props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "value"]), local = _b[0], rest = _b[1];
    return (<progress_1.Progress value={(_a = local.value) !== null && _a !== void 0 ? _a : 0} {...rest}>
			<progress_1.Progress.Track class={(0, utils_1.cn)("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", local.class)}>
				<progress_1.Progress.Fill class="h-full w-full flex-1 bg-primary transition-all" style={{ transform: "translateX(-".concat(100 - (local.value || 0), "%)") }}/>
			</progress_1.Progress.Track>
		</progress_1.Progress>);
}
