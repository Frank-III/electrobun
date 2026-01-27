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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBundledClaudeBinaryPath = getBundledClaudeBinaryPath;
exports.getClaudeShellEnvironment = getClaudeShellEnvironment;
exports.buildClaudeEnv = buildClaudeEnv;
exports.clearClaudeEnvCache = clearClaudeEnvCache;
exports.logClaudeEnv = logClaudeEnv;
var node_child_process_1 = require("node:child_process");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var node_os_1 = require("node:os");
var electron_1 = require("electron");
var node_util_1 = require("node:util");
var platform_1 = require("../platform");
// Cache the shell environment
var cachedShellEnv = null;
// Delimiter for parsing env output
var DELIMITER = "_CLAUDE_ENV_DELIMITER_";
// Keys to strip (prevent interference from unrelated providers)
// NOTE: We intentionally keep ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL
// so users can use their existing Claude Code CLI configuration (API proxy, etc.)
// Based on PR #29 by @sa4hnd
var STRIPPED_ENV_KEYS = [
    "OPENAI_API_KEY",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
];
// Cache the bundled binary path (only compute once)
var cachedBinaryPath = null;
var binaryPathComputed = false;
/**
 * Get path to the bundled Claude binary.
 * Returns the path to the native Claude executable bundled with the app.
 * CACHED - only computes path once and logs verbose info on first call.
 */
function getBundledClaudeBinaryPath() {
    // Return cached path if already computed
    if (binaryPathComputed) {
        return cachedBinaryPath;
    }
    var isDev = !electron_1.app.isPackaged;
    var currentPlatform = process.platform;
    var arch = process.arch;
    // Only log verbose info on first call
    if (process.env.DEBUG_CLAUDE_BINARY) {
        console.log("[claude-binary] ========== BUNDLED BINARY PATH ==========");
        console.log("[claude-binary] isDev:", isDev);
        console.log("[claude-binary] platform:", currentPlatform);
        console.log("[claude-binary] arch:", arch);
        console.log("[claude-binary] appPath:", electron_1.app.getAppPath());
    }
    // In dev: apps/desktop/resources/bin/{platform}-{arch}/claude
    // In production: {resourcesPath}/bin/claude
    var resourcesPath = isDev
        ? node_path_1.default.join(electron_1.app.getAppPath(), "resources/bin", "".concat(currentPlatform, "-").concat(arch))
        : node_path_1.default.join(process.resourcesPath, "bin");
    if (process.env.DEBUG_CLAUDE_BINARY) {
        console.log("[claude-binary] resourcesPath:", resourcesPath);
    }
    var binaryName = currentPlatform === "win32" ? "claude.exe" : "claude";
    var binaryPath = node_path_1.default.join(resourcesPath, binaryName);
    if (process.env.DEBUG_CLAUDE_BINARY) {
        console.log("[claude-binary] binaryPath:", binaryPath);
    }
    // Check if binary exists
    var exists = node_fs_1.default.existsSync(binaryPath);
    // Always log if binary doesn't exist (critical error)
    if (!exists) {
        console.error("[claude-binary] WARNING: Binary not found at path:", binaryPath);
        console.error("[claude-binary] Run 'bun run claude:download' to download it");
    }
    else if (process.env.DEBUG_CLAUDE_BINARY) {
        var stats = node_fs_1.default.statSync(binaryPath);
        var sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        var isExecutable = (stats.mode & node_fs_1.default.constants.X_OK) !== 0;
        console.log("[claude-binary] exists:", exists);
        console.log("[claude-binary] size:", sizeMB, "MB");
        console.log("[claude-binary] isExecutable:", isExecutable);
        console.log("[claude-binary] ===========================================");
    }
    // Cache the result
    cachedBinaryPath = binaryPath;
    binaryPathComputed = true;
    return binaryPath;
}
/**
 * Parse environment variables from shell output
 */
function parseEnvOutput(output) {
    var envSection = output.split(DELIMITER)[1];
    if (!envSection)
        return {};
    var env = {};
    for (var _i = 0, _a = (0, node_util_1.stripVTControlCharacters)(envSection)
        .split("\n")
        .filter(Boolean); _i < _a.length; _i++) {
        var line = _a[_i];
        var separatorIndex = line.indexOf("=");
        if (separatorIndex > 0) {
            var key = line.substring(0, separatorIndex);
            var value = line.substring(separatorIndex + 1);
            env[key] = value;
        }
    }
    return env;
}
/**
 * Strip sensitive keys from environment
 */
function stripSensitiveKeys(env) {
    for (var _i = 0, STRIPPED_ENV_KEYS_1 = STRIPPED_ENV_KEYS; _i < STRIPPED_ENV_KEYS_1.length; _i++) {
        var key = STRIPPED_ENV_KEYS_1[_i];
        if (key in env) {
            console.log("[claude-env] Stripped ".concat(key, " from shell environment"));
            delete env[key];
        }
    }
}
/**
 * Load full shell environment.
 * - Windows: Derives PATH from process.env + common install locations (no shell spawn)
 * - macOS/Linux: Spawns interactive login shell to capture PATH from shell profiles
 * Results are cached for the lifetime of the process.
 */
function getClaudeShellEnvironment() {
    if (cachedShellEnv !== null) {
        return __assign({}, cachedShellEnv);
    }
    // Windows: use platform provider to build environment
    if ((0, platform_1.isWindows)()) {
        console.log("[claude-env] Windows detected, deriving PATH without shell invocation");
        // Use platform provider to build environment
        var env = platform_1.platform.buildEnvironment();
        // Strip sensitive keys
        stripSensitiveKeys(env);
        console.log("[claude-env] Built Windows environment with ".concat(Object.keys(env).length, " vars"));
        cachedShellEnv = env;
        return __assign({}, env);
    }
    // macOS/Linux: spawn interactive login shell to get full environment
    var shell = (0, platform_1.getDefaultShell)();
    var command = "echo -n \"".concat(DELIMITER, "\"; env; echo -n \"").concat(DELIMITER, "\"; exit");
    try {
        var output = (0, node_child_process_1.execSync)("".concat(shell, " -ilc '").concat(command, "'"), {
            encoding: "utf8",
            timeout: 5000,
            env: {
                // Prevent Oh My Zsh from blocking with auto-update prompts
                DISABLE_AUTO_UPDATE: "true",
                // Minimal env to bootstrap the shell
                HOME: node_os_1.default.homedir(),
                USER: node_os_1.default.userInfo().username,
                SHELL: shell,
            },
        });
        var env = parseEnvOutput(output);
        stripSensitiveKeys(env);
        console.log("[claude-env] Loaded ".concat(Object.keys(env).length, " environment variables from shell"));
        cachedShellEnv = env;
        return __assign({}, env);
    }
    catch (error) {
        console.error("[claude-env] Failed to load shell environment:", error);
        // Fallback: use platform provider
        var env = platform_1.platform.buildEnvironment();
        stripSensitiveKeys(env);
        console.log("[claude-env] Using fallback environment from platform provider");
        cachedShellEnv = env;
        return __assign({}, env);
    }
}
/**
 * Build the complete environment for Claude SDK.
 * Merges shell environment, process.env, and custom overrides.
 */
function buildClaudeEnv(options) {
    var env = {};
    // 1. Start with shell environment (has HOME, full PATH, etc.)
    try {
        Object.assign(env, getClaudeShellEnvironment());
    }
    catch (error) {
        console.error("[claude-env] Shell env failed, using process.env");
    }
    // 2. Overlay current process.env (preserves Electron-set vars)
    // BUT: Don't overwrite PATH from shell env - Electron's PATH is minimal when launched from Finder
    var shellPath = env.PATH;
    for (var _i = 0, _a = Object.entries(process.env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value !== undefined) {
            env[key] = value;
        }
    }
    // Restore shell PATH if we had one (it contains nvm, homebrew, etc.)
    if (shellPath) {
        env.PATH = shellPath;
    }
    // 3. Ensure critical vars are present using platform provider
    var platformEnv = platform_1.platform.buildEnvironment();
    if (!env.HOME)
        env.HOME = platformEnv.HOME;
    if (!env.USER)
        env.USER = platformEnv.USER;
    if (!env.TERM)
        env.TERM = "xterm-256color";
    if (!env.SHELL)
        env.SHELL = (0, platform_1.getDefaultShell)();
    // Windows-specific: ensure USERPROFILE is set
    if ((0, platform_1.isWindows)() && !env.USERPROFILE) {
        env.USERPROFILE = node_os_1.default.homedir();
    }
    // 4. Add custom overrides
    if (options === null || options === void 0 ? void 0 : options.ghToken) {
        env.GH_TOKEN = options.ghToken;
    }
    if (options === null || options === void 0 ? void 0 : options.customEnv) {
        for (var _c = 0, _d = Object.entries(options.customEnv); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], value = _e[1];
            if (value === "") {
                delete env[key];
            }
            else {
                env[key] = value;
            }
        }
    }
    // 5. Mark as SDK entry
    env.CLAUDE_CODE_ENTRYPOINT = "sdk-ts";
    return env;
}
/**
 * Clear cached shell environment (useful for testing)
 */
function clearClaudeEnvCache() {
    cachedShellEnv = null;
}
/**
 * Debug: Log key environment variables
 */
function logClaudeEnv(env, prefix) {
    var _a, _b;
    if (prefix === void 0) { prefix = ""; }
    console.log("".concat(prefix, "[claude-env] HOME: ").concat(env.HOME));
    console.log("".concat(prefix, "[claude-env] USER: ").concat(env.USER));
    console.log("".concat(prefix, "[claude-env] PATH includes homebrew: ").concat((_a = env.PATH) === null || _a === void 0 ? void 0 : _a.includes("/opt/homebrew")));
    console.log("".concat(prefix, "[claude-env] PATH includes /usr/local/bin: ").concat((_b = env.PATH) === null || _b === void 0 ? void 0 : _b.includes("/usr/local/bin")));
    console.log("".concat(prefix, "[claude-env] ANTHROPIC_AUTH_TOKEN: ").concat(env.ANTHROPIC_AUTH_TOKEN ? "set" : "not set"));
}
