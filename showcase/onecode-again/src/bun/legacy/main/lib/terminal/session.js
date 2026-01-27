"use strict";
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
exports.createSession = createSession;
exports.setupInitialCommands = setupInitialCommands;
var node_fs_1 = require("node:fs");
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var pty = require("node-pty");
var env_1 = require("./env");
var DEFAULT_COLS = 80;
var DEFAULT_ROWS = 24;
function getShellArgs(shell) {
    if (shell.includes("zsh")) {
        return ["-l"];
    }
    if (shell.includes("bash")) {
        return [];
    }
    return [];
}
/**
 * Validate and resolve cwd path (Windows compatibility)
 * Falls back to home directory if path doesn't exist
 */
function validateAndResolveCwd(cwd) {
    if (!node_fs_1.default.existsSync(cwd)) {
        var homeDir = node_os_1.default.homedir();
        console.warn("[Terminal] CWD does not exist: ".concat(cwd, ", using home directory: ").concat(homeDir));
        return homeDir;
    }
    try {
        var stat = node_fs_1.default.statSync(cwd);
        if (!stat.isDirectory()) {
            var homeDir = node_os_1.default.homedir();
            console.warn("[Terminal] CWD is not a directory: ".concat(cwd, ", using home directory: ").concat(homeDir));
            return homeDir;
        }
    }
    catch (_a) {
        var homeDir = node_os_1.default.homedir();
        console.warn("[Terminal] Error checking CWD: ".concat(cwd, ", using home directory: ").concat(homeDir));
        return homeDir;
    }
    try {
        return node_path_1.default.resolve(cwd);
    }
    catch (_b) {
        var homeDir = node_os_1.default.homedir();
        console.warn("[Terminal] Error resolving CWD: ".concat(cwd, ", using home directory: ").concat(homeDir));
        return homeDir;
    }
}
/**
 * Resolve shell path for Windows
 * Tries to find shell in common Windows locations
 */
function resolveShellPath(shell) {
    if (node_os_1.default.platform() !== "win32")
        return shell;
    // If shell already has a path, use it as-is
    if (shell.includes("\\") || shell.includes("/"))
        return shell;
    // Try common Windows shell locations
    var commonPaths = [
        process.env.COMSPEC || "",
        process.env.SystemRoot ? "".concat(process.env.SystemRoot, "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe") : "",
        process.env.SystemRoot ? "".concat(process.env.SystemRoot, "\\System32\\cmd.exe") : "",
    ].filter(Boolean);
    for (var _i = 0, commonPaths_1 = commonPaths; _i < commonPaths_1.length; _i++) {
        var shellPath = commonPaths_1[_i];
        if (node_fs_1.default.existsSync(shellPath)) {
            return shellPath;
        }
    }
    // Return as-is, let node-pty handle PATH resolution
    return shell;
}
function spawnPty(params) {
    var shell = params.shell, cols = params.cols, rows = params.rows, cwd = params.cwd, env = params.env;
    var shellArgs = getShellArgs(shell);
    var resolvedCwd = validateAndResolveCwd(cwd);
    var resolvedShell = resolveShellPath(shell);
    try {
        return pty.spawn(resolvedShell, shellArgs, {
            name: "xterm-256color",
            cols: cols,
            rows: rows,
            cwd: resolvedCwd,
            env: env,
        });
    }
    catch (error) {
        console.error("[Terminal] Failed to spawn PTY with ".concat(resolvedShell, ":"), error);
        // Try with fallback shell
        console.log("[Terminal] Retrying with fallback shell: ".concat(env_1.FALLBACK_SHELL));
        return pty.spawn(env_1.FALLBACK_SHELL, [], {
            name: "xterm-256color",
            cols: cols,
            rows: rows,
            cwd: resolvedCwd,
            env: env,
        });
    }
}
function createSession(params, onData) {
    return __awaiter(this, void 0, void 0, function () {
        var paneId, tabId, workspaceId, workspaceName, workspacePath, rootPath, cwd, cols, rows, _a, useFallbackShell, shell, workingDir, terminalCols, terminalRows, env, ptyProcess, session;
        return __generator(this, function (_b) {
            paneId = params.paneId, tabId = params.tabId, workspaceId = params.workspaceId, workspaceName = params.workspaceName, workspacePath = params.workspacePath, rootPath = params.rootPath, cwd = params.cwd, cols = params.cols, rows = params.rows, _a = params.useFallbackShell, useFallbackShell = _a === void 0 ? false : _a;
            shell = useFallbackShell ? env_1.FALLBACK_SHELL : (0, env_1.getDefaultShell)();
            workingDir = validateAndResolveCwd(cwd || node_os_1.default.homedir());
            terminalCols = cols || DEFAULT_COLS;
            terminalRows = rows || DEFAULT_ROWS;
            env = (0, env_1.buildTerminalEnv)({
                shell: shell,
                paneId: paneId,
                tabId: tabId,
                workspaceId: workspaceId,
                workspaceName: workspaceName,
                workspacePath: workspacePath,
                rootPath: rootPath,
            });
            ptyProcess = spawnPty({
                shell: shell,
                cols: terminalCols,
                rows: terminalRows,
                cwd: workingDir,
                env: env,
            });
            session = {
                pty: ptyProcess,
                paneId: paneId,
                workspaceId: workspaceId || "",
                cwd: workingDir,
                cols: terminalCols,
                rows: terminalRows,
                lastActive: Date.now(),
                isAlive: true,
                shell: shell,
                startTime: Date.now(),
                usedFallback: useFallbackShell,
            };
            ptyProcess.onData(function (data) {
                onData(paneId, data);
            });
            return [2 /*return*/, session];
        });
    });
}
/**
 * Set up initial commands to run after shell prompt is ready.
 * Commands are only sent for new sessions (not reattachments).
 */
function setupInitialCommands(session, initialCommands) {
    if (!initialCommands || initialCommands.length === 0) {
        return;
    }
    var initialCommandString = "".concat(initialCommands.join(" && "), "\n");
    var dataHandler = session.pty.onData(function () {
        dataHandler.dispose();
        setTimeout(function () {
            if (session.isAlive) {
                session.pty.write(initialCommandString);
            }
        }, 100);
    });
}
