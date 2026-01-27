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
exports.runCommand = runCommand;
exports.getShellEnvironment = getShellEnvironment;
exports.checkGitLfsAvailable = checkGitLfsAvailable;
exports.execWithShellEnv = execWithShellEnv;
var os_1 = require("os");
var path_1 = require("path");
var cachedEnv = null;
var cacheTime = 0;
var isFallbackCache = false;
var CACHE_TTL_MS = 60000;
var FALLBACK_CACHE_TTL_MS = 10000;
var pathFixAttempted = false;
var pathFixSucceeded = false;
function normalizeEnv(env) {
    var result = {};
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === "string") {
            result[key] = value;
        }
    }
    return result;
}
function buildWindowsPath() {
    var paths = [];
    var pathSeparator = ";";
    if (process.env.PATH) {
        paths.push.apply(paths, process.env.PATH.split(pathSeparator).filter(Boolean));
    }
    var commonPaths = [
        path_1.default.join(os_1.default.homedir(), ".local", "bin"),
        "C:\\Program Files\\Git\\cmd",
        "C:\\Program Files\\Git\\bin",
        path_1.default.join(process.env.SystemRoot || "C:\\Windows", "System32"),
        path_1.default.join(process.env.SystemRoot || "C:\\Windows"),
    ];
    var _loop_1 = function (commonPath) {
        var normalizedPath = path_1.default.normalize(commonPath);
        var normalizedLower = normalizedPath.toLowerCase();
        var alreadyExists = paths.some(function (p) { return path_1.default.normalize(p).toLowerCase() === normalizedLower; });
        if (!alreadyExists) {
            paths.push(normalizedPath);
        }
    };
    for (var _i = 0, commonPaths_1 = commonPaths; _i < commonPaths_1.length; _i++) {
        var commonPath = commonPaths_1[_i];
        _loop_1(commonPath);
    }
    return paths.join(pathSeparator);
}
function runCommand(cmd, args, options) {
    return __awaiter(this, void 0, void 0, function () {
        var proc, stdoutPromise, stderrPromise, _a, stdout, stderr, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    proc = Bun.spawn(__spreadArray([cmd], args, true), {
                        cwd: options === null || options === void 0 ? void 0 : options.cwd,
                        env: options === null || options === void 0 ? void 0 : options.env,
                        stdout: "pipe",
                        stderr: "pipe",
                    });
                    stdoutPromise = proc.stdout ? new Response(proc.stdout).text() : Promise.resolve("");
                    stderrPromise = proc.stderr ? new Response(proc.stderr).text() : Promise.resolve("");
                    return [4 /*yield*/, Promise.all([stdoutPromise, stderrPromise, proc.exited])];
                case 1:
                    _a = _b.sent(), stdout = _a[0], stderr = _a[1], code = _a[2];
                    return [2 /*return*/, {
                            code: code !== null && code !== void 0 ? code : 0,
                            stdout: stdout,
                            stderr: stderr,
                        }];
            }
        });
    });
}
function getShellEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var now, ttl, env, stringEnv, shell, stdout, env, _i, _a, line, idx, key, value, error_1, fallback;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = Date.now();
                    ttl = isFallbackCache ? FALLBACK_CACHE_TTL_MS : CACHE_TTL_MS;
                    if (cachedEnv && now - cacheTime < ttl) {
                        return [2 /*return*/, __assign({}, cachedEnv)];
                    }
                    if (process.platform === "win32") {
                        env = __assign(__assign({}, process.env), { PATH: buildWindowsPath(), HOME: os_1.default.homedir(), USER: os_1.default.userInfo().username, USERPROFILE: os_1.default.homedir() });
                        stringEnv = normalizeEnv(env);
                        cachedEnv = stringEnv;
                        cacheTime = now;
                        isFallbackCache = false;
                        return [2 /*return*/, __assign({}, stringEnv)];
                    }
                    shell = process.env.SHELL || (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, runCommand(shell, ["-lc", "env"], {
                            env: normalizeEnv(__assign(__assign({}, process.env), { HOME: os_1.default.homedir() })),
                        })];
                case 2:
                    stdout = (_b.sent()).stdout;
                    env = {};
                    for (_i = 0, _a = stdout.split("\n"); _i < _a.length; _i++) {
                        line = _a[_i];
                        idx = line.indexOf("=");
                        if (idx > 0) {
                            key = line.substring(0, idx);
                            value = line.substring(idx + 1);
                            env[key] = value;
                        }
                    }
                    cachedEnv = env;
                    cacheTime = now;
                    isFallbackCache = false;
                    return [2 /*return*/, __assign({}, env)];
                case 3:
                    error_1 = _b.sent();
                    fallback = normalizeEnv(process.env);
                    cachedEnv = fallback;
                    cacheTime = now;
                    isFallbackCache = true;
                    console.warn("[shell-env] Failed to derive shell environment: ".concat(error_1));
                    return [2 /*return*/, __assign({}, fallback)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function checkGitLfsAvailable(env) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, runCommand("git", ["lfs", "version"], { env: env })];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, result.code === 0];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function execWithShellEnv(cmd, args, options) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2, isDarwin, isEnoent, shellEnv, retryEnv, retryError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 8]);
                    return [4 /*yield*/, runCommand(cmd, args, {
                            cwd: options === null || options === void 0 ? void 0 : options.cwd,
                            env: options === null || options === void 0 ? void 0 : options.env,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    isDarwin = process.platform === "darwin";
                    isEnoent = error_2 && typeof error_2 === "object" && "code" in error_2 && error_2.code === "ENOENT";
                    if (!isDarwin || pathFixSucceeded || pathFixAttempted || !isEnoent) {
                        throw error_2;
                    }
                    pathFixAttempted = true;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, getShellEnvironment()];
                case 4:
                    shellEnv = _a.sent();
                    if (shellEnv.PATH) {
                        process.env.PATH = shellEnv.PATH;
                        pathFixSucceeded = true;
                    }
                    retryEnv = shellEnv.PATH
                        ? __assign(__assign(__assign({}, shellEnv), options === null || options === void 0 ? void 0 : options.env), { PATH: shellEnv.PATH }) : __assign(__assign({}, shellEnv), options === null || options === void 0 ? void 0 : options.env);
                    return [4 /*yield*/, runCommand(cmd, args, {
                            cwd: options === null || options === void 0 ? void 0 : options.cwd,
                            env: retryEnv,
                        })];
                case 5: return [2 /*return*/, _a.sent()];
                case 6:
                    retryError_1 = _a.sent();
                    pathFixAttempted = false;
                    throw retryError_1;
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
