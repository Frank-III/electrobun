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
exports.getExistingClaudeCredentials = getExistingClaudeCredentials;
exports.getExistingClaudeToken = getExistingClaudeToken;
exports.refreshClaudeToken = refreshClaudeToken;
exports.isTokenExpired = isTokenExpired;
exports.isClaudeCliInstalled = isClaudeCliInstalled;
exports.runClaudeSetupToken = runClaudeSetupToken;
var node_child_process_1 = require("node:child_process");
var node_fs_1 = require("node:fs");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var platform_1 = require("./platform");
/**
 * Read Claude OAuth credentials from system credential store
 * Dispatches to platform-specific implementation
 */
function readFromKeychain() {
    if (process.platform === 'darwin') {
        return readFromMacOSKeychain();
    }
    else if (process.platform === 'win32') {
        return readFromWindowsCredentialManager();
    }
    else if (process.platform === 'linux') {
        return readFromLinuxSecretService();
    }
    return null;
}
/**
 * Read Claude OAuth credentials from macOS Keychain
 */
function readFromMacOSKeychain() {
    try {
        var result = (0, node_child_process_1.execSync)('security find-generic-password -s "Claude Code-credentials" -w', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        if (result) {
            var credentials = JSON.parse(result);
            if (credentials.claudeAiOauth) {
                return {
                    accessToken: credentials.claudeAiOauth.accessToken,
                    refreshToken: credentials.claudeAiOauth.refreshToken,
                    expiresAt: credentials.claudeAiOauth.expiresAt,
                    scopes: credentials.claudeAiOauth.scopes,
                };
            }
        }
    }
    catch (_a) {
        // Keychain entry not found or parse error
    }
    return null;
}
/**
 * Read Claude OAuth credentials from Windows Credential Manager
 * Falls back to credentials file which Claude Code uses on Windows
 */
function readFromWindowsCredentialManager() {
    try {
        // Read from the credentials file location that Claude Code uses on Windows
        var credentialsPath = (0, node_path_1.join)((0, node_os_1.homedir)(), '.claude', '.credentials.json');
        if ((0, node_fs_1.existsSync)(credentialsPath)) {
            var content = (0, node_fs_1.readFileSync)(credentialsPath, 'utf-8');
            var credentials = JSON.parse(content);
            if (credentials.claudeAiOauth) {
                return {
                    accessToken: credentials.claudeAiOauth.accessToken,
                    refreshToken: credentials.claudeAiOauth.refreshToken,
                    expiresAt: credentials.claudeAiOauth.expiresAt,
                    scopes: credentials.claudeAiOauth.scopes,
                };
            }
        }
    }
    catch (_a) {
        // Credential Manager read failed
    }
    return null;
}
/**
 * Read Claude OAuth credentials from Linux Secret Service (libsecret)
 * Uses secret-tool CLI which interfaces with GNOME Keyring or KDE Wallet
 */
function readFromLinuxSecretService() {
    try {
        // Try secret-tool (works with GNOME Keyring, KDE Wallet via libsecret)
        var result = (0, node_child_process_1.execSync)('secret-tool lookup service "Claude Code" account "credentials" 2>/dev/null', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        if (result) {
            var credentials = JSON.parse(result);
            if (credentials.claudeAiOauth) {
                return {
                    accessToken: credentials.claudeAiOauth.accessToken,
                    refreshToken: credentials.claudeAiOauth.refreshToken,
                    expiresAt: credentials.claudeAiOauth.expiresAt,
                    scopes: credentials.claudeAiOauth.scopes,
                };
            }
        }
    }
    catch (_a) {
        // secret-tool not available or entry not found
    }
    // Fallback: try pass (password-store)
    try {
        var result = (0, node_child_process_1.execSync)('pass show claude-code/credentials 2>/dev/null', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        if (result) {
            var credentials = JSON.parse(result);
            if (credentials.claudeAiOauth) {
                return {
                    accessToken: credentials.claudeAiOauth.accessToken,
                    refreshToken: credentials.claudeAiOauth.refreshToken,
                    expiresAt: credentials.claudeAiOauth.expiresAt,
                    scopes: credentials.claudeAiOauth.scopes,
                };
            }
        }
    }
    catch (_b) {
        // pass not available or entry not found
    }
    return null;
}
/**
 * Read Claude OAuth credentials from credentials file (Linux/fallback)
 */
function readFromCredentialsFile() {
    var credentialsPath = (0, node_path_1.join)((0, node_os_1.homedir)(), '.claude', '.credentials.json');
    try {
        if ((0, node_fs_1.existsSync)(credentialsPath)) {
            var content = (0, node_fs_1.readFileSync)(credentialsPath, 'utf-8');
            var credentials = JSON.parse(content);
            if (credentials.claudeAiOauth) {
                return {
                    accessToken: credentials.claudeAiOauth.accessToken,
                    refreshToken: credentials.claudeAiOauth.refreshToken,
                    expiresAt: credentials.claudeAiOauth.expiresAt,
                    scopes: credentials.claudeAiOauth.scopes,
                };
            }
        }
    }
    catch (_a) {
        // File not found or parse error
    }
    return null;
}
/**
 * Get existing Claude OAuth credentials from keychain or credentials file
 */
function getExistingClaudeCredentials() {
    // Try keychain first (macOS, Windows, Linux)
    var keychainCreds = readFromKeychain();
    if (keychainCreds) {
        return keychainCreds;
    }
    // Fall back to credentials file
    return readFromCredentialsFile();
}
/**
 * Get existing Claude OAuth token from keychain or credentials file
 * @deprecated Use getExistingClaudeCredentials() to get full credentials with refresh token
 */
function getExistingClaudeToken() {
    var creds = getExistingClaudeCredentials();
    return (creds === null || creds === void 0 ? void 0 : creds.accessToken) || null;
}
/**
 * Refresh Claude OAuth token using refresh token
 * Uses the Anthropic API token endpoint
 */
function refreshClaudeToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function () {
        var params, response, error, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: 'claude-desktop',
                    });
                    return [4 /*yield*/, fetch('https://api.anthropic.com/v1/oauth/token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: params.toString(),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    error = _a.sent();
                    throw new Error("Failed to refresh Claude token: ".concat(error));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    return [2 /*return*/, {
                            accessToken: data.access_token,
                            refreshToken: data.refresh_token || refreshToken,
                            expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
                        }];
            }
        });
    });
}
/**
 * Check if a token is expired or will expire soon (within 5 minutes)
 */
function isTokenExpired(expiresAt) {
    if (!expiresAt) {
        // If no expiry, assume token is still valid
        return false;
    }
    // Consider expired if less than 5 minutes remaining
    var bufferMs = 5 * 60 * 1000;
    return Date.now() + bufferMs >= expiresAt;
}
/**
 * Build extended PATH with common installation locations
 * This is necessary because when running from Finder/Dock (macOS) or
 * Start Menu (Windows), the PATH may not include directories where
 * claude CLI is installed
 *
 * Delegates to platform provider for cross-platform support.
 */
function getExtendedPath() {
    return (0, platform_1.buildExtendedPath)(process.env.PATH);
}
/**
 * Check if Claude CLI is installed (cross-platform)
 * Uses extended PATH to find claude even when running from Finder/Dock
 */
function isClaudeCliInstalled() {
    try {
        // Use 'where' on Windows, 'which' on Unix-like systems
        var command = (0, platform_1.isWindows)() ? 'where claude' : 'which claude';
        var fullPath = getExtendedPath();
        (0, node_child_process_1.execSync)(command, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            env: __assign(__assign({}, process.env), { PATH: fullPath })
        });
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Run `claude setup-token` to authenticate with Claude
 * Returns a promise that resolves when the process completes
 *
 * Note: Uses pipe for stdio instead of inherit to prevent hanging in non-TTY
 * environments (like Electron apps launched from Finder/Dock)
 */
function runClaudeSetupToken(onStatus) {
    return new Promise(function (resolve) {
        var _a, _b;
        onStatus('Starting Claude setup-token...');
        var fullPath = getExtendedPath();
        var child = (0, node_child_process_1.spawn)('claude', ['setup-token'], {
            // Don't use 'inherit' - it causes hang in non-TTY environments
            // Use 'ignore' for stdin and 'pipe' for stdout/stderr
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
            env: __assign(__assign({}, process.env), { PATH: fullPath }),
        });
        var stdout = '';
        var stderr = '';
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            var text = data.toString();
            stdout += text;
            onStatus(text.trim());
        });
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
            stderr += data.toString();
        });
        // Timeout after 2 minutes to prevent indefinite hang
        var timeout = setTimeout(function () {
            child.kill();
            resolve({
                success: false,
                error: 'Authentication timed out after 2 minutes. Please try again.',
            });
        }, 120000);
        child.on('error', function (err) {
            clearTimeout(timeout);
            resolve({
                success: false,
                error: "Failed to start claude setup-token: ".concat(err.message),
            });
        });
        child.on('close', function (code) {
            clearTimeout(timeout);
            if (code === 0) {
                // Wait a moment for the token to be written to keychain
                setTimeout(function () {
                    var token = getExistingClaudeToken();
                    if (token) {
                        resolve({ success: true, token: token });
                    }
                    else {
                        resolve({
                            success: false,
                            error: 'Token not found after setup. The authentication may have failed.',
                        });
                    }
                }, 500);
            }
            else {
                var errorDetail = stderr.trim() || "Process exited with code ".concat(code);
                resolve({
                    success: false,
                    error: errorDetail,
                });
            }
        });
    });
}
