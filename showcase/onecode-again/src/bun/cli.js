"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLaunchDirectory = getLaunchDirectory;
exports.parseLaunchDirectory = parseLaunchDirectory;
var fs_1 = require("fs");
var launchDirectory = null;
function getLaunchDirectory() {
    var dir = launchDirectory;
    launchDirectory = null;
    return dir;
}
function parseLaunchDirectory() {
    var args = process.argv.slice(1);
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        if (arg.startsWith("-") || arg.includes("://"))
            continue;
        if (!(0, fs_1.existsSync)(arg))
            continue;
        try {
            var stat = (0, fs_1.lstatSync)(arg);
            if (stat.isDirectory()) {
                launchDirectory = arg;
                return;
            }
        }
        catch (_a) {
            continue;
        }
    }
}
