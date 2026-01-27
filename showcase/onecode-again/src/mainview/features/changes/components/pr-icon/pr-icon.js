"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIcon = PRIcon;
var utils_1 = require("../../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
var stateStyles = {
    open: "text-emerald-500",
    merged: "text-violet-500",
    closed: "text-red-500",
    draft: "text-muted-foreground"
};
/**
* Renders a PR icon with color based on state.
* - open: green pull request icon
* - merged: purple/violet merge icon
* - closed: red dot icon
* - draft: muted pull request icon
*/
function PRIcon(_a) {
    var state = _a.state, className = _a.className;
    var baseClass = (0, utils_1.cn)(stateStyles[state], className);
    if (state === "merged") {
        return <lucide_solid_1.GitMerge class={baseClass}/>;
    }
    if (state === "closed") {
        return <lucide_solid_1.CircleDot class={baseClass}/>;
    }
    // open or draft
    return <lucide_solid_1.GitPullRequest class={baseClass}/>;
}
