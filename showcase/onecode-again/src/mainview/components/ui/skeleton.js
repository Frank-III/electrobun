"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = void 0;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../lib/utils");
var Skeleton = function (props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], others = _a[1];
    return <div class={(0, utils_1.cn)("animate-pulse rounded-md bg-muted", local.class)} {...others}/>;
};
exports.Skeleton = Skeleton;
