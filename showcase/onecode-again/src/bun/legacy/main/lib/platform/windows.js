"use strict";
/**
 * Windows Platform Provider
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
exports.WindowsPlatformProvider = void 0;
var node_fs_1 = require("node:fs");
var promises_1 = require("node:fs/promises");
var path = require("node:path");
var base_1 = require("./base");
var WindowsPlatformProvider = /** @class */ (function (_super) {
    __extends(WindowsPlatformProvider, _super);
    function WindowsPlatformProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.platform = "win32";
        _this.displayName = "Windows";
        return _this;
    }
    WindowsPlatformProvider.prototype.getShellConfig = function () {
        var powershellPath = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
        var cmdPath = process.env.COMSPEC || "C:\\Windows\\System32\\cmd.exe";
        return {
            executable: process.env.COMSPEC || powershellPath,
            loginArgs: [], // Windows shells don't have login mode like Unix
            execArgs: function (command) { return ["/c", command]; },
        };
    };
    WindowsPlatformProvider.prototype.getPathConfig = function () {
        var home = this.getHome();
        var systemRoot = process.env.SystemRoot || "C:\\Windows";
        return {
            separator: ";",
            commonPaths: [
                // Git for Windows
                "C:\\Program Files\\Git\\cmd",
                "C:\\Program Files\\Git\\bin",
                "C:\\Program Files\\Git\\usr\\bin",
                // Node.js
                "C:\\Program Files\\nodejs",
                // System
                path.join(systemRoot, "System32"),
                systemRoot,
            ],
            localBin: path.join(home, ".local", "bin"),
            packageManagerPaths: [
                path.join(home, "AppData", "Roaming", "npm"),
                path.join(home, ".bun", "bin"),
                path.join(home, ".cargo", "bin"),
                path.join(home, "scoop", "shims"),
                path.join(home, "AppData", "Local", "pnpm"),
            ],
        };
    };
    WindowsPlatformProvider.prototype.getCliConfig = function () {
        // Install to ~/.local/bin which is already included in buildExtendedPath()
        // This avoids needing to modify the system PATH
        var home = this.getHome();
        return {
            installPath: path.join(home, ".local", "bin", "1code.cmd"),
            scriptName: "1code.cmd",
            requiresAdmin: false, // Install to user directory, no admin needed
        };
    };
    WindowsPlatformProvider.prototype.getEnvironmentConfig = function () {
        var home = this.getHome();
        return {
            homeVar: "USERPROFILE",
            userVar: "USERNAME",
            additionalVars: {
                USERPROFILE: home,
                HOME: home,
                APPDATA: path.join(home, "AppData", "Roaming"),
                LOCALAPPDATA: path.join(home, "AppData", "Local"),
                TEMP: process.env.TEMP || path.join(home, "AppData", "Local", "Temp"),
                TMP: process.env.TMP || path.join(home, "AppData", "Local", "Temp"),
            },
        };
    };
    WindowsPlatformProvider.prototype.getDefaultShell = function () {
        // Prefer PowerShell, fall back to cmd.exe
        return (process.env.COMSPEC ||
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe");
    };
    WindowsPlatformProvider.prototype.detectShell = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Windows doesn't have a per-user shell preference like Unix
                // Just return the default
                return [2 /*return*/, this.getDefaultShell()];
            });
        });
    };
    WindowsPlatformProvider.prototype.detectLocale = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Windows uses different locale mechanism
                // Try environment first
                if (process.env.LANG) {
                    return [2 /*return*/, process.env.LANG];
                }
                // Could query Windows locale via PowerShell, but for simplicity use default
                return [2 /*return*/, "en_US.UTF-8"];
            });
        });
    };
    WindowsPlatformProvider.prototype.installCli = function (sourcePath) {
        return __awaiter(this, void 0, void 0, function () {
            var cliConfig, installPath, installDir, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cliConfig = this.getCliConfig();
                        installPath = cliConfig.installPath;
                        installDir = path.dirname(installPath);
                        if (!(0, node_fs_1.existsSync)(sourcePath)) {
                            return [2 /*return*/, { success: false, error: "CLI script not found in app bundle" }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Create directory and copy file
                        return [4 /*yield*/, (0, promises_1.mkdir)(installDir, { recursive: true })];
                    case 2:
                        // Create directory and copy file
                        _a.sent();
                        return [4 /*yield*/, (0, promises_1.copyFile)(sourcePath, installPath)
                            // Note: We intentionally do NOT use `setx PATH` here because:
                            // 1. setx has a 1024 character limit that silently truncates PATH
                            // 2. It can corrupt the user's PATH environment variable
                            // Instead, the install directory is included in buildExtendedPath()
                            // which ensures the CLI is found when running from the app.
                            //
                            // For terminal usage, users can manually add to PATH:
                            // $env:Path += ";${installDir}"
                        ];
                    case 3:
                        _a.sent();
                        // Note: We intentionally do NOT use `setx PATH` here because:
                        // 1. setx has a 1024 character limit that silently truncates PATH
                        // 2. It can corrupt the user's PATH environment variable
                        // Instead, the install directory is included in buildExtendedPath()
                        // which ensures the CLI is found when running from the app.
                        //
                        // For terminal usage, users can manually add to PATH:
                        // $env:Path += ";${installDir}"
                        console.log("[CLI] Installed 1code command to", installPath);
                        console.log("[CLI] To use from terminal, add to PATH:", "$env:Path += \";".concat(installDir, "\""));
                        return [2 /*return*/, {
                                success: true,
                                pathHint: "To use 1code from terminal, add to your PATH: ".concat(installDir),
                            }];
                    case 4:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : "Installation failed";
                        console.error("[CLI] Failed to install:", error_1);
                        return [2 /*return*/, { success: false, error: errorMessage }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    WindowsPlatformProvider.prototype.uninstallCli = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cliConfig, installPath, _a, error_2, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cliConfig = this.getCliConfig();
                        installPath = cliConfig.installPath;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        if (!(0, node_fs_1.existsSync)(installPath)) {
                            console.log("[CLI] CLI command not installed, nothing to uninstall");
                            return [2 /*return*/, { success: true }];
                        }
                        return [4 /*yield*/, (0, promises_1.unlink)(installPath)
                            // Try to remove directory if empty
                        ];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, promises_1.rmdir)(path.dirname(installPath))];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        console.log("[CLI] Uninstalled 1code command");
                        return [2 /*return*/, { success: true }];
                    case 7:
                        error_2 = _b.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : "Uninstallation failed";
                        console.error("[CLI] Failed to uninstall:", error_2);
                        return [2 /*return*/, { success: false, error: errorMessage }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    WindowsPlatformProvider.prototype.isCliInstalled = function (sourcePath) {
        var cliConfig = this.getCliConfig();
        try {
            // Windows: just check if the file exists
            return (0, node_fs_1.existsSync)(cliConfig.installPath);
        }
        catch (_a) {
            return false;
        }
    };
    return WindowsPlatformProvider;
}(base_1.BasePlatformProvider));
exports.WindowsPlatformProvider = WindowsPlatformProvider;
