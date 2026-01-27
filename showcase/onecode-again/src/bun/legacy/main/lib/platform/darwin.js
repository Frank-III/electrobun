"use strict";
/**
 * macOS Platform Provider
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.DarwinPlatformProvider = void 0;
var node_child_process_1 = require("node:child_process");
var node_fs_1 = require("node:fs");
var path = require("node:path");
var node_util_1 = require("node:util");
var base_1 = require("./base");
var execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
var DarwinPlatformProvider = /** @class */ (function (_super) {
    __extends(DarwinPlatformProvider, _super);
    function DarwinPlatformProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.platform = "darwin";
        _this.displayName = "macOS";
        return _this;
    }
    DarwinPlatformProvider.prototype.getShellConfig = function () {
        var shell = process.env.SHELL || "/bin/zsh";
        return {
            executable: shell,
            loginArgs: ["-l"],
            execArgs: function (command) { return ["-c", command]; },
        };
    };
    DarwinPlatformProvider.prototype.getPathConfig = function () {
        var home = this.getHome();
        return {
            separator: ":",
            commonPaths: [
                // Homebrew (Apple Silicon)
                "/opt/homebrew/bin",
                "/opt/homebrew/sbin",
                // Homebrew (Intel)
                "/usr/local/bin",
                "/usr/local/sbin",
                // System
                "/usr/bin",
                "/bin",
                "/usr/sbin",
                "/sbin",
                // MacPorts
                "/opt/local/bin",
                "/opt/local/sbin",
            ],
            localBin: path.join(home, ".local", "bin"),
            packageManagerPaths: [
                path.join(home, ".bun", "bin"),
                path.join(home, ".cargo", "bin"),
                path.join(home, ".deno", "bin"),
                // NVM managed Node.js (common pattern)
                path.join(home, ".nvm", "versions", "node", "*", "bin"),
            ],
        };
    };
    DarwinPlatformProvider.prototype.getCliConfig = function () {
        return {
            installPath: "/usr/local/bin/1code",
            scriptName: "1code",
            requiresAdmin: true, // /usr/local/bin requires admin on macOS
        };
    };
    DarwinPlatformProvider.prototype.getEnvironmentConfig = function () {
        var home = this.getHome();
        return {
            homeVar: "HOME",
            userVar: "USER",
            additionalVars: {
                TMPDIR: process.env.TMPDIR || "/tmp",
                __CF_USER_TEXT_ENCODING: process.env.__CF_USER_TEXT_ENCODING || "",
            },
        };
    };
    DarwinPlatformProvider.prototype.getDefaultShell = function () {
        return process.env.SHELL || "/bin/zsh";
    };
    DarwinPlatformProvider.prototype.detectShell = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, match, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Try SHELL env var first (most reliable)
                        if (process.env.SHELL) {
                            return [2 /*return*/, process.env.SHELL];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.execCommand("sh", [
                                "-c",
                                "dscl . -read /Users/$(whoami) UserShell 2>/dev/null",
                            ])];
                    case 2:
                        stdout = (_b.sent()).stdout;
                        match = stdout.match(/UserShell:\s*(.+)/);
                        if (match === null || match === void 0 ? void 0 : match[1]) {
                            return [2 /*return*/, match[1].trim()];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, "/bin/zsh"];
                }
            });
        });
    };
    DarwinPlatformProvider.prototype.detectLocale = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, trimmed, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // Check environment first
                        if ((_b = process.env.LANG) === null || _b === void 0 ? void 0 : _b.includes("UTF-8")) {
                            return [2 /*return*/, process.env.LANG];
                        }
                        if ((_c = process.env.LC_ALL) === null || _c === void 0 ? void 0 : _c.includes("UTF-8")) {
                            return [2 /*return*/, process.env.LC_ALL];
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.execCommand("sh", [
                                "-c",
                                "locale 2>/dev/null | grep LANG= | cut -d= -f2",
                            ])];
                    case 2:
                        stdout = (_d.sent()).stdout;
                        trimmed = stdout.trim();
                        if (trimmed === null || trimmed === void 0 ? void 0 : trimmed.includes("UTF-8")) {
                            return [2 /*return*/, trimmed];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _d.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, "en_US.UTF-8"];
                }
            });
        });
    };
    DarwinPlatformProvider.prototype.installCli = function (sourcePath) {
        return __awaiter(this, void 0, void 0, function () {
            var cliConfig, installPath, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cliConfig = this.getCliConfig();
                        installPath = cliConfig.installPath;
                        if (!(0, node_fs_1.existsSync)(sourcePath)) {
                            return [2 /*return*/, { success: false, error: "CLI script not found in app bundle" }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!(0, node_fs_1.existsSync)(installPath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, execAsync("osascript -e 'do shell script \"rm -f ".concat(installPath, "\" with administrator privileges'"))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // Create symlink with admin privileges
                    return [4 /*yield*/, execAsync("osascript -e 'do shell script \"ln -s \\\"".concat(sourcePath, "\\\" ").concat(installPath, "\" with administrator privileges'"))];
                    case 4:
                        // Create symlink with admin privileges
                        _a.sent();
                        console.log("[CLI] Installed 1code command to", installPath);
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : "Installation failed";
                        console.error("[CLI] Failed to install:", error_1);
                        return [2 /*return*/, { success: false, error: errorMessage }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DarwinPlatformProvider.prototype.uninstallCli = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cliConfig, installPath, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cliConfig = this.getCliConfig();
                        installPath = cliConfig.installPath;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!(0, node_fs_1.existsSync)(installPath)) {
                            console.log("[CLI] CLI command not installed, nothing to uninstall");
                            return [2 /*return*/, { success: true }];
                        }
                        return [4 /*yield*/, execAsync("osascript -e 'do shell script \"rm -f ".concat(installPath, "\" with administrator privileges'"))];
                    case 2:
                        _a.sent();
                        console.log("[CLI] Uninstalled 1code command");
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : "Uninstallation failed";
                        console.error("[CLI] Failed to uninstall:", error_2);
                        return [2 /*return*/, { success: false, error: errorMessage }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DarwinPlatformProvider.prototype.isCliInstalled = function (sourcePath) {
        var cliConfig = this.getCliConfig();
        try {
            if (!(0, node_fs_1.existsSync)(cliConfig.installPath))
                return false;
            var stat = (0, node_fs_1.lstatSync)(cliConfig.installPath);
            if (!stat.isSymbolicLink())
                return false;
            var target = (0, node_fs_1.readlinkSync)(cliConfig.installPath);
            return target === sourcePath;
        }
        catch (_a) {
            return false;
        }
    };
    return DarwinPlatformProvider;
}(base_1.BasePlatformProvider));
exports.DarwinPlatformProvider = DarwinPlatformProvider;
