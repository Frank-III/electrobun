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
exports.SHELL_CRASH_THRESHOLD_MS = exports.FALLBACK_SHELL = void 0;
exports.getDefaultShell = getDefaultShell;
exports.getLocale = getLocale;
exports.prewarmEnvCaches = prewarmEnvCaches;
exports.sanitizeEnv = sanitizeEnv;
exports.buildSafeEnv = buildSafeEnv;
exports.buildTerminalEnv = buildTerminalEnv;
var node_os_1 = require("node:os");
var platform_1 = require("../platform");
exports.FALLBACK_SHELL = platform_1.platform.platform === "win32" ? "cmd.exe" : "/bin/sh";
exports.SHELL_CRASH_THRESHOLD_MS = 1000;
// Global cache for shell detection (computed once per process lifetime)
var cachedDefaultShell = null;
var shellDetectionPromise = null;
// Global cache for locale detection
var cachedLocale = null;
var localeDetectionPromise = null;
/**
 * Get default shell (sync, uses cached value if available)
 * For hot paths - returns cached value or fast fallback
 */
function getDefaultShell() {
    // Use SHELL env var (most reliable on Unix)
    if (platform_1.platform.platform !== "win32" && process.env.SHELL) {
        return process.env.SHELL;
    }
    // Return cached value if available
    if (cachedDefaultShell) {
        return cachedDefaultShell;
    }
    // Start async detection in background (don't block)
    if (!shellDetectionPromise) {
        shellDetectionPromise = detectShellAsync();
        shellDetectionPromise.then(function (shell) {
            cachedDefaultShell = shell;
        });
    }
    // Return platform default as fast fallback
    return (0, platform_1.getDefaultShell)();
}
/**
 * Async shell detection (used to populate cache)
 */
function detectShellAsync() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, platform_1.detectShell)()];
        });
    });
}
/**
 * Get locale (sync, uses cached value if available)
 * For hot paths - returns cached value or fast fallback
 */
function getLocale(baseEnv) {
    var _a, _b;
    if ((_a = baseEnv.LANG) === null || _a === void 0 ? void 0 : _a.includes("UTF-8")) {
        return baseEnv.LANG;
    }
    if ((_b = baseEnv.LC_ALL) === null || _b === void 0 ? void 0 : _b.includes("UTF-8")) {
        return baseEnv.LC_ALL;
    }
    // Return cached value if available
    if (cachedLocale) {
        return cachedLocale;
    }
    // Start async detection in background (don't block)
    if (!localeDetectionPromise) {
        localeDetectionPromise = detectLocaleAsync();
        localeDetectionPromise.then(function (locale) {
            cachedLocale = locale;
        });
    }
    // Return fast fallback - detection will update cache for next call
    return "en_US.UTF-8";
}
/**
 * Async locale detection (used to populate cache)
 */
function detectLocaleAsync() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, platform_1.detectLocale)()];
        });
    });
}
/**
 * Pre-warm the shell and locale caches (call at startup)
 * Non-blocking - populates caches for later use
 */
function prewarmEnvCaches() {
    // Trigger async detection if not already started
    if (!shellDetectionPromise && !cachedDefaultShell) {
        shellDetectionPromise = detectShellAsync();
        shellDetectionPromise.then(function (shell) {
            cachedDefaultShell = shell;
        });
    }
    if (!localeDetectionPromise && !cachedLocale) {
        localeDetectionPromise = detectLocaleAsync();
        localeDetectionPromise.then(function (locale) {
            cachedLocale = locale;
        });
    }
}
function sanitizeEnv(env) {
    var sanitized = {};
    for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === "string") {
            sanitized[key] = value;
        }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
/**
 * Allowlist of environment variable names safe to pass to terminals.
 * Using an allowlist (vs denylist) ensures unknown vars (including secrets) are excluded by default.
 */
var ALLOWED_ENV_VARS = new Set([
    // Core shell environment
    "PATH",
    "HOME",
    "USER",
    "LOGNAME",
    "SHELL",
    "TERM",
    "TMPDIR",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "LC_MESSAGES",
    "LC_COLLATE",
    "LC_MONETARY",
    "LC_NUMERIC",
    "LC_TIME",
    "TZ",
    // Terminal/display
    "DISPLAY",
    "COLORTERM",
    "TERM_PROGRAM",
    "TERM_PROGRAM_VERSION",
    "COLUMNS",
    "LINES",
    // SSH (critical for git operations)
    "SSH_AUTH_SOCK",
    "SSH_AGENT_PID",
    // Proxy configuration
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "http_proxy",
    "https_proxy",
    "NO_PROXY",
    "no_proxy",
    "ALL_PROXY",
    "all_proxy",
    "FTP_PROXY",
    "ftp_proxy",
    // Language version managers
    "NVM_DIR",
    "NVM_BIN",
    "NVM_INC",
    "NVM_CD_FLAGS",
    "NVM_RC_VERSION",
    "PYENV_ROOT",
    "PYENV_SHELL",
    "PYENV_VERSION",
    "RBENV_ROOT",
    "RBENV_SHELL",
    "RBENV_VERSION",
    "GOPATH",
    "GOROOT",
    "GOBIN",
    "CARGO_HOME",
    "RUSTUP_HOME",
    "DENO_DIR",
    "DENO_INSTALL",
    "BUN_INSTALL",
    "PNPM_HOME",
    "VOLTA_HOME",
    "ASDF_DIR",
    "ASDF_DATA_DIR",
    "FNM_DIR",
    "FNM_MULTISHELL_PATH",
    "FNM_NODE_DIST_MIRROR",
    "SDKMAN_DIR",
    // Homebrew
    "HOMEBREW_PREFIX",
    "HOMEBREW_CELLAR",
    "HOMEBREW_REPOSITORY",
    // XDG directories
    "XDG_CONFIG_HOME",
    "XDG_DATA_HOME",
    "XDG_CACHE_HOME",
    "XDG_STATE_HOME",
    "XDG_RUNTIME_DIR",
    // Editor
    "EDITOR",
    "VISUAL",
    "PAGER",
    // macOS specific
    "__CF_USER_TEXT_ENCODING",
    "Apple_PubSub_Socket_Render",
    // Windows specific
    "COMSPEC",
    "USERPROFILE",
    "APPDATA",
    "LOCALAPPDATA",
    "PROGRAMFILES",
    "PROGRAMFILES(X86)",
    "SYSTEMROOT",
    "WINDIR",
    "TEMP",
    "TMP",
    "PATHEXT",
    // SSL/TLS configuration
    "SSL_CERT_FILE",
    "SSL_CERT_DIR",
    "NODE_EXTRA_CA_CERTS",
    "REQUESTS_CA_BUNDLE",
    // Git configuration (not credentials)
    "GIT_SSH_COMMAND",
    "GIT_AUTHOR_NAME",
    "GIT_AUTHOR_EMAIL",
    "GIT_COMMITTER_NAME",
    "GIT_COMMITTER_EMAIL",
    "GIT_EDITOR",
    "GIT_PAGER",
    // AWS configuration (profile selection, not credentials)
    "AWS_PROFILE",
    "AWS_DEFAULT_REGION",
    "AWS_REGION",
    "AWS_CONFIG_FILE",
    "AWS_SHARED_CREDENTIALS_FILE",
    // Docker configuration
    "DOCKER_HOST",
    "DOCKER_CONFIG",
    "DOCKER_CERT_PATH",
    "DOCKER_TLS_VERIFY",
    "COMPOSE_PROJECT_NAME",
    // Kubernetes configuration
    "KUBECONFIG",
    "KUBE_CONFIG_PATH",
    // Cloud CLI tools
    "CLOUDSDK_CONFIG",
    "AZURE_CONFIG_DIR",
    // SDK paths
    "JAVA_HOME",
    "ANDROID_HOME",
    "ANDROID_SDK_ROOT",
    "FLUTTER_ROOT",
    "DOTNET_ROOT",
]);
/**
 * Prefixes for environment variables that are safe to pass through.
 */
var ALLOWED_PREFIXES = [
    "AGENTS_", // Our own metadata vars
    "LC_", // Locale settings
];
/**
 * Check if a key is in the allowlist, handling Windows case-insensitivity.
 */
function isAllowedVar(key, isWindows) {
    if (isWindows) {
        return ALLOWED_ENV_VARS.has(key.toUpperCase());
    }
    return ALLOWED_ENV_VARS.has(key);
}
/**
 * Check if a key matches an allowed prefix.
 */
function hasAllowedPrefix(key, isWindows) {
    var keyToCheck = isWindows ? key.toUpperCase() : key;
    return ALLOWED_PREFIXES.some(function (prefix) { return keyToCheck.startsWith(prefix); });
}
/**
 * Build a safe environment by only including allowlisted variables.
 * This prevents app secrets and build-time config from leaking to terminals.
 */
function buildSafeEnv(env, options) {
    var _a;
    var currentPlatform = (_a = options === null || options === void 0 ? void 0 : options.platform) !== null && _a !== void 0 ? _a : node_os_1.default.platform();
    var isWindows = currentPlatform === "win32";
    var safe = {};
    for (var _i = 0, _b = Object.entries(env); _i < _b.length; _i++) {
        var _c = _b[_i], key = _c[0], value = _c[1];
        if (isAllowedVar(key, isWindows)) {
            safe[key] = value;
            continue;
        }
        if (hasAllowedPrefix(key, isWindows)) {
            safe[key] = value;
        }
    }
    return safe;
}
function buildTerminalEnv(params) {
    var shell = params.shell, paneId = params.paneId, tabId = params.tabId, workspaceId = params.workspaceId, workspaceName = params.workspaceName, workspacePath = params.workspacePath, rootPath = params.rootPath;
    // Get Electron's process.env and filter to only allowlisted safe vars
    var rawBaseEnv = sanitizeEnv(process.env) || {};
    var baseEnv = buildSafeEnv(rawBaseEnv);
    var locale = getLocale(rawBaseEnv);
    var env = __assign(__assign({}, baseEnv), { SHELL: shell, TERM: "xterm-256color", TERM_PROGRAM: "1Code", TERM_PROGRAM_VERSION: process.env.npm_package_version || "1.0.0", COLORTERM: "truecolor", LANG: locale, AGENTS_PANE_ID: paneId, AGENTS_TAB_ID: tabId || "", AGENTS_WORKSPACE_ID: workspaceId || "", AGENTS_WORKSPACE_NAME: workspaceName || "", AGENTS_WORKSPACE_PATH: workspacePath || "", AGENTS_ROOT_PATH: rootPath || "" });
    return env;
}
