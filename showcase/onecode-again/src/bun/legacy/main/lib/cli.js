"use strict";
/**
 * CLI command support for 1code
 * Allows users to open 1code from terminal with: 1code . or 1code /path/to/project
 *
 * Based on PR #16 by @caffeinum (Aleksey Bykhun)
 * https://github.com/21st-dev/1code/pull/16
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLaunchDirectory = getLaunchDirectory;
exports.parseLaunchDirectory = parseLaunchDirectory;
exports.isCliInstalled = isCliInstalled;
exports.installCli = installCli;
exports.uninstallCli = uninstallCli;
var electron_1 = require("electron");
var path_1 = require("path");
var fs_1 = require("fs");
var platform_1 = require("./platform");
// Launch directory from CLI (e.g., `1code /path/to/project`)
var launchDirectory = null;
/**
 * Get the launch directory passed via CLI args (consumed once)
 */
function getLaunchDirectory() {
    var dir = launchDirectory;
    launchDirectory = null; // consume once
    return dir;
}
/**
 * Parse CLI arguments to find a directory argument
 * Called on app startup to handle `1code .` or `1code /path/to/project`
 */
function parseLaunchDirectory() {
    // Look for a directory argument in argv
    // Skip electron executable and script path
    var args = process.argv.slice(process.defaultApp ? 2 : 1);
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        // Skip flags and protocol URLs
        if (arg.startsWith("-") || arg.includes("://"))
            continue;
        // Check if it's a valid directory
        if ((0, fs_1.existsSync)(arg)) {
            try {
                var stat = (0, fs_1.lstatSync)(arg);
                if (stat.isDirectory()) {
                    console.log("[CLI] Launch directory:", arg);
                    launchDirectory = arg;
                    return;
                }
            }
            catch (_a) {
                // ignore
            }
        }
    }
}
/**
 * Get the CLI source path (where the CLI script is bundled)
 */
function getCliSourcePath() {
    var cliName = platform_1.platform.getCliConfig().scriptName;
    if (electron_1.app.isPackaged) {
        return (0, path_1.join)(process.resourcesPath, "cli", cliName);
    }
    return (0, path_1.join)(__dirname, "..", "..", "resources", "cli", cliName);
}
/**
 * Check if the CLI command is installed
 */
function isCliInstalled() {
    return platform_1.platform.isCliInstalled(getCliSourcePath());
}
/**
 * Install the CLI command
 * Platform-specific behavior is handled by the platform provider
 */
function installCli() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, platform_1.platform.installCli(getCliSourcePath())];
        });
    });
}
/**
 * Uninstall the CLI command
 * Platform-specific behavior is handled by the platform provider
 */
function uninstallCli() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, platform_1.platform.uninstallCli()];
        });
    });
}
