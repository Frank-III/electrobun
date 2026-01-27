"use strict";
/**
 * Base Platform Provider
 * Contains shared logic for all platforms
 */
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
exports.BasePlatformProvider = void 0;
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var os = require("node:os");
var path = require("node:path");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
var BasePlatformProvider = /** @class */ (function () {
    function BasePlatformProvider() {
    }
    /**
     * Get home directory (cross-platform)
     */
    BasePlatformProvider.prototype.getHome = function () {
        return os.homedir();
    };
    /**
     * Get username (cross-platform)
     */
    BasePlatformProvider.prototype.getUsername = function () {
        return os.userInfo().username;
    };
    BasePlatformProvider.prototype.buildExtendedPath = function (currentPath) {
        var config = this.getPathConfig();
        var existingPaths = currentPath
            ? currentPath.split(config.separator).filter(Boolean)
            : [];
        var allPaths = __spreadArray(__spreadArray(__spreadArray([], config.commonPaths, true), [
            config.localBin
        ], false), config.packageManagerPaths, true);
        // Add paths that aren't already present (case-insensitive on Windows)
        var isWindows = this.platform === "win32";
        var normalizedExisting = new Set(existingPaths.map(function (p) {
            return isWindows ? path.normalize(p).toLowerCase() : path.normalize(p);
        }));
        var newPaths = [];
        for (var _i = 0, allPaths_1 = allPaths; _i < allPaths_1.length; _i++) {
            var p = allPaths_1[_i];
            var normalized = isWindows
                ? path.normalize(p).toLowerCase()
                : path.normalize(p);
            if (!normalizedExisting.has(normalized)) {
                newPaths.push(path.normalize(p));
                normalizedExisting.add(normalized);
            }
        }
        return __spreadArray(__spreadArray([], newPaths, true), existingPaths, true).join(config.separator);
    };
    BasePlatformProvider.prototype.getDefaultShell = function () {
        var config = this.getShellConfig();
        return config.executable;
    };
    BasePlatformProvider.prototype.detectShell = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Default implementation returns configured shell
                // Platforms can override for more sophisticated detection
                return [2 /*return*/, this.getDefaultShell()];
            });
        });
    };
    BasePlatformProvider.prototype.detectLocale = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Default: check environment or return fallback
                return [2 /*return*/, process.env.LANG || "en_US.UTF-8"];
            });
        });
    };
    BasePlatformProvider.prototype.buildEnvironment = function (baseEnv) {
        var envConfig = this.getEnvironmentConfig();
        var pathConfig = this.getPathConfig();
        var home = this.getHome();
        var user = this.getUsername();
        var env = __assign({}, baseEnv);
        // Set home directory
        env[envConfig.homeVar] = home;
        if (!env.HOME)
            env.HOME = home;
        // Set user
        env[envConfig.userVar] = user;
        if (!env.USER)
            env.USER = user;
        // Set additional platform-specific vars
        for (var _i = 0, _a = Object.entries(envConfig.additionalVars); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (!env[key]) {
                // Resolve special placeholders
                env[key] = value
                    .replace("${HOME}", home)
                    .replace("${USER}", user);
            }
        }
        // Build extended PATH
        env.PATH = this.buildExtendedPath(env.PATH || process.env.PATH);
        // Set TERM if not present
        if (!env.TERM) {
            env.TERM = "xterm-256color";
        }
        // Set SHELL
        if (!env.SHELL) {
            env.SHELL = this.getDefaultShell();
        }
        return env;
    };
    /**
     * Execute a command safely using execFile (no shell interpolation).
     *
     * This is the preferred method for simple command execution as it:
     * - Avoids shell injection vulnerabilities
     * - Has predictable argument handling
     *
     * For complex shell commands (pipes, redirects, osascript with quotes),
     * implementations may use exec/execSync directly as needed.
     */
    BasePlatformProvider.prototype.execCommand = function (command, args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, stdout, stderr;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, execFileAsync(command, args, {
                            timeout: (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : 5000,
                            env: options === null || options === void 0 ? void 0 : options.env,
                            encoding: "utf8",
                        })];
                    case 1:
                        _a = _c.sent(), stdout = _a.stdout, stderr = _a.stderr;
                        return [2 /*return*/, { stdout: stdout, stderr: stderr }];
                }
            });
        });
    };
    return BasePlatformProvider;
}());
exports.BasePlatformProvider = BasePlatformProvider;
