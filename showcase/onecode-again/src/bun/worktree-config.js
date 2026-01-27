"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectWorktreeConfig = detectWorktreeConfig;
exports.getAvailableConfigPaths = getAvailableConfigPaths;
exports.saveWorktreeConfig = saveWorktreeConfig;
exports.getSetupCommands = getSetupCommands;
exports.executeWorktreeSetup = executeWorktreeSetup;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var CURSOR_CONFIG_PATH = ".cursor/worktrees.json";
var ONECODE_CONFIG_PATH = ".1code/worktree.json";
function fileExists(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.access)(filePath)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function readJsonFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Bun.file(filePath).text()];
                case 1:
                    content = _b.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function detectWorktreeConfig(projectPath, customPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fullPath, config, cursorPath, config, onecodePath, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!customPath) return [3 /*break*/, 2];
                    fullPath = (0, path_1.isAbsolute)(customPath)
                        ? customPath
                        : (0, path_1.join)(projectPath, customPath);
                    return [4 /*yield*/, readJsonFile(fullPath)];
                case 1:
                    config = _a.sent();
                    if (config) {
                        return [2 /*return*/, { config: config, path: fullPath, source: "custom" }];
                    }
                    _a.label = 2;
                case 2:
                    cursorPath = (0, path_1.join)(projectPath, CURSOR_CONFIG_PATH);
                    return [4 /*yield*/, fileExists(cursorPath)];
                case 3:
                    if (!_a.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, readJsonFile(cursorPath)];
                case 4:
                    config = _a.sent();
                    if (config) {
                        return [2 /*return*/, { config: config, path: cursorPath, source: "cursor" }];
                    }
                    _a.label = 5;
                case 5:
                    onecodePath = (0, path_1.join)(projectPath, ONECODE_CONFIG_PATH);
                    return [4 /*yield*/, fileExists(onecodePath)];
                case 6:
                    if (!_a.sent()) return [3 /*break*/, 8];
                    return [4 /*yield*/, readJsonFile(onecodePath)];
                case 7:
                    config = _a.sent();
                    if (config) {
                        return [2 /*return*/, { config: config, path: onecodePath, source: "1code" }];
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/, { config: null, path: null, source: null }];
            }
        });
    });
}
function getAvailableConfigPaths(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cursorPath, onecodePath;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    cursorPath = (0, path_1.join)(projectPath, CURSOR_CONFIG_PATH);
                    onecodePath = (0, path_1.join)(projectPath, ONECODE_CONFIG_PATH);
                    _a = {};
                    _b = {};
                    return [4 /*yield*/, fileExists(cursorPath)];
                case 1:
                    _a.cursor = (_b.exists = _d.sent(),
                        _b.path = cursorPath,
                        _b);
                    _c = {};
                    return [4 /*yield*/, fileExists(onecodePath)];
                case 2: return [2 /*return*/, (_a.onecode = (_c.exists = _d.sent(),
                        _c.path = onecodePath,
                        _c),
                        _a)];
            }
        });
    });
}
function saveWorktreeConfig(projectPath_1, config_1) {
    return __awaiter(this, arguments, void 0, function (projectPath, config, target) {
        var targetPath, content, error_1;
        if (target === void 0) { target = "1code"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (target === "cursor") {
                        targetPath = (0, path_1.join)(projectPath, CURSOR_CONFIG_PATH);
                    }
                    else if (target === "1code") {
                        targetPath = (0, path_1.join)(projectPath, ONECODE_CONFIG_PATH);
                    }
                    else {
                        targetPath = (0, path_1.isAbsolute)(target) ? target : (0, path_1.join)(projectPath, target);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(targetPath), { recursive: true })];
                case 2:
                    _a.sent();
                    content = JSON.stringify(config, null, 2);
                    return [4 /*yield*/, Bun.write(targetPath, content)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, { success: true, path: targetPath }];
                case 4:
                    error_1 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            path: targetPath,
                            error: error_1 instanceof Error ? error_1.message : "Unknown error",
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getSetupCommands(config) {
    var _a, _b;
    if (config["setup-worktree"]) {
        return config["setup-worktree"];
    }
    if (process.platform === "win32") {
        return (_a = config["setup-worktree-windows"]) !== null && _a !== void 0 ? _a : null;
    }
    return (_b = config["setup-worktree-unix"]) !== null && _b !== void 0 ? _b : null;
}
function getShellCommand(command) {
    if (process.platform === "win32") {
        var shell_1 = process.env.COMSPEC || "cmd.exe";
        return { cmd: shell_1, args: ["/c", command] };
    }
    var shell = process.env.SHELL || "/bin/bash";
    return { cmd: shell, args: ["-lc", command] };
}
function executeWorktreeSetup(worktreePath, mainRepoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var result, detected, commands, commandList, _i, commandList_1, cmd, shellCmd, proc, stdout, _a, stderr, _b, error_2, errorMsg;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    result = {
                        success: true,
                        commandsRun: 0,
                        output: [],
                        errors: [],
                    };
                    return [4 /*yield*/, detectWorktreeConfig(mainRepoPath)];
                case 1:
                    detected = _c.sent();
                    if (!detected.config) {
                        result.output.push("No worktree config found, skipping setup");
                        return [2 /*return*/, result];
                    }
                    commands = getSetupCommands(detected.config);
                    if (!commands) {
                        result.output.push("No commands for current platform");
                        return [2 /*return*/, result];
                    }
                    commandList = Array.isArray(commands) ? commands : [commands];
                    if (commandList.length === 0) {
                        result.output.push("Empty command list");
                        return [2 /*return*/, result];
                    }
                    _i = 0, commandList_1 = commandList;
                    _c.label = 2;
                case 2:
                    if (!(_i < commandList_1.length)) return [3 /*break*/, 13];
                    cmd = commandList_1[_i];
                    if (!cmd.trim())
                        return [3 /*break*/, 12];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 11, , 12]);
                    result.output.push("$ ".concat(cmd));
                    shellCmd = getShellCommand(cmd);
                    proc = Bun.spawn(__spreadArray([shellCmd.cmd], shellCmd.args, true), {
                        cwd: worktreePath,
                        env: __assign(__assign({}, process.env), { ROOT_WORKTREE_PATH: mainRepoPath }),
                        stdout: "pipe",
                        stderr: "pipe",
                    });
                    if (!proc.stdout) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Response(proc.stdout).text()];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = "";
                    _c.label = 6;
                case 6:
                    stdout = _a;
                    if (!proc.stderr) return [3 /*break*/, 8];
                    return [4 /*yield*/, new Response(proc.stderr).text()];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _b = "";
                    _c.label = 9;
                case 9:
                    stderr = _b;
                    return [4 /*yield*/, proc.exited];
                case 10:
                    _c.sent();
                    if (stdout.trim()) {
                        result.output.push(stdout.trim());
                    }
                    if (stderr.trim()) {
                        result.output.push("[stderr] ".concat(stderr.trim()));
                    }
                    result.commandsRun += 1;
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _c.sent();
                    errorMsg = error_2 instanceof Error ? error_2.message : String(error_2);
                    result.errors.push("Command failed: ".concat(cmd, "\\n").concat(errorMsg));
                    result.output.push("[error] ".concat(errorMsg));
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 2];
                case 13:
                    result.success = result.errors.length === 0;
                    return [2 /*return*/, result];
            }
        });
    });
}
