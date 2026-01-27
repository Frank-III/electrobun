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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShellEnvironment = getShellEnvironment;
exports.checkGitLfsAvailable = checkGitLfsAvailable;
exports.clearShellEnvCache = clearShellEnvCache;
exports.execWithShellEnv = execWithShellEnv;
var node_child_process_1 = require("node:child_process");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var node_util_1 = require("node:util");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
// Cache the shell environment to avoid repeated shell spawns
var cachedEnv = null;
var cacheTime = 0;
var isFallbackCache = false;
var CACHE_TTL_MS = 60000; // 1 minute cache
var FALLBACK_CACHE_TTL_MS = 10000; // 10 second cache for fallback (retry sooner)
// Track PATH fix state for macOS GUI app PATH fix
var pathFixAttempted = false;
var pathFixSucceeded = false;
/**
 * Build Windows PATH by combining process.env.PATH with common install locations.
 * This ensures packaged apps on Windows can find user-installed tools.
 */
function buildWindowsPath() {
    var paths = [];
    var pathSeparator = ";";
    // Start with existing PATH from process.env
    if (process.env.PATH) {
        paths.push.apply(paths, process.env.PATH.split(pathSeparator).filter(Boolean));
    }
    // Add Windows-specific common paths
    var commonPaths = [
        // User-local installations (where tools like Claude CLI, git-lfs are often installed)
        node_path_1.default.join(node_os_1.default.homedir(), ".local", "bin"),
        // Git for Windows default location
        "C:\\Program Files\\Git\\cmd",
        "C:\\Program Files\\Git\\bin",
        // System paths (usually already in PATH, but ensure they're present)
        node_path_1.default.join(process.env.SystemRoot || "C:\\Windows", "System32"),
        node_path_1.default.join(process.env.SystemRoot || "C:\\Windows"),
    ];
    var _loop_1 = function (commonPath) {
        var normalizedPath = node_path_1.default.normalize(commonPath);
        // Case-insensitive check for Windows
        var normalizedLower = normalizedPath.toLowerCase();
        var alreadyExists = paths.some(function (p) { return node_path_1.default.normalize(p).toLowerCase() === normalizedLower; });
        if (!alreadyExists) {
            paths.push(normalizedPath);
        }
    };
    // Add common paths that aren't already in PATH
    for (var _i = 0, commonPaths_1 = commonPaths; _i < commonPaths_1.length; _i++) {
        var commonPath = commonPaths_1[_i];
        _loop_1(commonPath);
    }
    return paths.join(pathSeparator);
}
/**
 * Gets the full shell environment with proper PATH for all platforms.
 *
 * - **Windows**: Derives PATH from process.env + common install locations (no shell spawn)
 * - **macOS/Linux**: Spawns login shell to capture PATH from shell profiles
 *
 * This captures PATH and other environment variables needed to find user-installed tools
 * like git-lfs (homebrew on macOS) or Claude CLI (user-local on Windows).
 *
 * Results are cached for 1 minute to avoid repeated operations.
 */
function getShellEnvironment() {
    return __awaiter(this, void 0, void 0, function () {
        var now, ttl, env, stringEnv, _i, _a, _b, key, value, shell, stdout, env, _c, _d, line, idx, key, value, error_1, fallback, _e, _f, _g, key, value;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    now = Date.now();
                    ttl = isFallbackCache ? FALLBACK_CACHE_TTL_MS : CACHE_TTL_MS;
                    if (cachedEnv && now - cacheTime < ttl) {
                        // Return a copy to prevent caller mutations from corrupting cache
                        return [2 /*return*/, __assign({}, cachedEnv)];
                    }
                    // Windows: derive PATH without shell invocation
                    // Git Bash PATH doesn't include Windows user paths, so we build it manually
                    if (process.platform === "win32") {
                        console.log("[shell-env] Windows detected, deriving PATH without shell invocation");
                        env = __assign(__assign({}, process.env), { PATH: buildWindowsPath(), HOME: node_os_1.default.homedir(), USER: node_os_1.default.userInfo().username, USERPROFILE: node_os_1.default.homedir() });
                        stringEnv = {};
                        for (_i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (typeof value === "string") {
                                stringEnv[key] = value;
                            }
                        }
                        cachedEnv = stringEnv;
                        cacheTime = now;
                        isFallbackCache = false;
                        console.log("[shell-env] Built Windows environment with ".concat(Object.keys(stringEnv).length, " vars"));
                        return [2 /*return*/, __assign({}, stringEnv)];
                    }
                    shell = process.env.SHELL ||
                        (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash");
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, execFileAsync(shell, ["-lc", "env"], {
                            timeout: 10000,
                            env: __assign(__assign({}, process.env), { HOME: node_os_1.default.homedir() }),
                        })];
                case 2:
                    stdout = (_h.sent()).stdout;
                    env = {};
                    for (_c = 0, _d = stdout.split("\n"); _c < _d.length; _c++) {
                        line = _d[_c];
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
                    error_1 = _h.sent();
                    console.warn("[shell-env] Failed to get shell environment: ".concat(error_1, ". Falling back to process.env"));
                    fallback = {};
                    for (_e = 0, _f = Object.entries(process.env); _e < _f.length; _e++) {
                        _g = _f[_e], key = _g[0], value = _g[1];
                        if (typeof value === "string") {
                            fallback[key] = value;
                        }
                    }
                    cachedEnv = fallback;
                    cacheTime = now;
                    isFallbackCache = true;
                    return [2 /*return*/, __assign({}, fallback)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks if git-lfs is available in the given environment.
 */
function checkGitLfsAvailable(env) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execFileAsync("git", ["lfs", "version"], {
                            timeout: 5000,
                            env: env,
                        })];
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
/**
 * Clears the cached shell environment.
 * Useful for testing or when environment changes are expected.
 */
function clearShellEnvCache() {
    cachedEnv = null;
    cacheTime = 0;
    isFallbackCache = false;
}
/**
 * Execute a command, retrying once with shell environment if it fails with ENOENT.
 * On macOS, GUI apps launched from Finder/Dock get minimal PATH that excludes
 * homebrew and other user-installed tools. This lazily derives the user's
 * shell environment only when needed, then persists the fix to process.env.PATH.
 */
function execWithShellEnv(cmd, args, options) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2, shellEnv, retryEnv, retryError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 8]);
                    return [4 /*yield*/, execFileAsync(cmd, args, __assign(__assign({}, options), { encoding: "utf8" }))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    // Only retry on ENOENT (command not found), only on macOS
                    // Skip if we've already successfully fixed PATH, or if a fix attempt is in progress
                    if (process.platform !== "darwin" ||
                        pathFixSucceeded ||
                        pathFixAttempted ||
                        !(error_2 instanceof Error) ||
                        !("code" in error_2) ||
                        error_2.code !== "ENOENT") {
                        throw error_2;
                    }
                    pathFixAttempted = true;
                    console.log("[shell-env] Command not found, deriving shell environment");
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, getShellEnvironment()];
                case 4:
                    shellEnv = _a.sent();
                    // Persist the fix to process.env so all subsequent calls benefit
                    if (shellEnv.PATH) {
                        process.env.PATH = shellEnv.PATH;
                        pathFixSucceeded = true;
                        console.log("[shell-env] Fixed process.env.PATH for GUI app");
                    }
                    retryEnv = shellEnv.PATH
                        ? __assign(__assign(__assign({}, shellEnv), options === null || options === void 0 ? void 0 : options.env), { PATH: shellEnv.PATH }) : __assign(__assign({}, shellEnv), options === null || options === void 0 ? void 0 : options.env);
                    return [4 /*yield*/, execFileAsync(cmd, args, __assign(__assign({}, options), { encoding: "utf8", env: retryEnv }))];
                case 5: return [2 /*return*/, _a.sent()];
                case 6:
                    retryError_1 = _a.sent();
                    // Shell env derivation or retry failed - allow future retries
                    pathFixAttempted = false;
                    console.error("[shell-env] Retry failed:", retryError_1);
                    throw retryError_1;
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
