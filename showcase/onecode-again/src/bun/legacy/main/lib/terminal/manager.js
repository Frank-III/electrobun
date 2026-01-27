"use strict";
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
exports.terminalManager = exports.TerminalManager = void 0;
var node_events_1 = require("node:events");
var env_1 = require("./env");
var port_manager_1 = require("./port-manager");
var session_1 = require("./session");
var TerminalManager = /** @class */ (function (_super) {
    __extends(TerminalManager, _super);
    function TerminalManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessions = new Map();
        _this.pendingSessions = new Map();
        return _this;
    }
    TerminalManager.prototype.createOrAttach = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var paneId, cols, rows, pending, existing, creationPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paneId = params.paneId, cols = params.cols, rows = params.rows;
                        pending = this.pendingSessions.get(paneId);
                        if (pending) {
                            return [2 /*return*/, pending];
                        }
                        existing = this.sessions.get(paneId);
                        if (existing === null || existing === void 0 ? void 0 : existing.isAlive) {
                            existing.lastActive = Date.now();
                            if (cols !== undefined && rows !== undefined) {
                                this.resize({ paneId: paneId, cols: cols, rows: rows });
                            }
                            return [2 /*return*/, {
                                    isNew: false,
                                    serializedState: existing.serializedState || "",
                                }];
                        }
                        creationPromise = this.doCreateSession(params);
                        this.pendingSessions.set(paneId, creationPromise);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, creationPromise];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        this.pendingSessions.delete(paneId);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TerminalManager.prototype.doCreateSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var paneId, workspaceId, initialCommands, session;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paneId = params.paneId, workspaceId = params.workspaceId, initialCommands = params.initialCommands;
                        return [4 /*yield*/, (0, session_1.createSession)(params, function (id, data) {
                                _this.emit("data:".concat(id), data);
                            })
                            // Set up initial commands (only for new sessions)
                        ];
                    case 1:
                        session = _a.sent();
                        // Set up initial commands (only for new sessions)
                        (0, session_1.setupInitialCommands)(session, initialCommands);
                        // Set up exit handler with fallback logic
                        this.setupExitHandler(session, params);
                        this.sessions.set(paneId, session);
                        port_manager_1.portManager.registerSession(session, workspaceId || "");
                        return [2 /*return*/, {
                                isNew: true,
                                serializedState: "",
                            }];
                }
            });
        });
    };
    TerminalManager.prototype.setupExitHandler = function (session, params) {
        var _this = this;
        var paneId = params.paneId;
        session.pty.onExit(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var sessionDuration, crashedQuickly, fallbackError_1, timeout;
            var _this = this;
            var exitCode = _b.exitCode, signal = _b.signal;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        session.isAlive = false;
                        sessionDuration = Date.now() - session.startTime;
                        crashedQuickly = sessionDuration < env_1.SHELL_CRASH_THRESHOLD_MS && exitCode !== 0;
                        if (!(crashedQuickly && !session.usedFallback)) return [3 /*break*/, 4];
                        console.warn("[TerminalManager] Shell \"".concat(session.shell, "\" exited with code ").concat(exitCode, " after ").concat(sessionDuration, "ms, retrying with fallback shell \"").concat(env_1.FALLBACK_SHELL, "\""));
                        this.sessions.delete(paneId);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.doCreateSession(__assign(__assign({}, params), { useFallbackShell: true }))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/]; // Recovered - don't emit exit
                    case 3:
                        fallbackError_1 = _c.sent();
                        console.error("[TerminalManager] Fallback shell also failed:", fallbackError_1);
                        return [3 /*break*/, 4];
                    case 4:
                        // Unregister from port manager (also removes detected ports)
                        port_manager_1.portManager.unregisterSession(paneId);
                        this.emit("exit:".concat(paneId), exitCode, signal);
                        timeout = setTimeout(function () {
                            _this.sessions.delete(paneId);
                        }, 5000);
                        timeout.unref();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    TerminalManager.prototype.write = function (params) {
        var paneId = params.paneId, data = params.data;
        var session = this.sessions.get(paneId);
        if (!session || !session.isAlive) {
            throw new Error("Terminal session ".concat(paneId, " not found or not alive"));
        }
        session.pty.write(data);
        session.lastActive = Date.now();
    };
    TerminalManager.prototype.resize = function (params) {
        var paneId = params.paneId, cols = params.cols, rows = params.rows;
        // Validate geometry: cols and rows must be positive integers
        if (!Number.isInteger(cols) ||
            !Number.isInteger(rows) ||
            cols <= 0 ||
            rows <= 0) {
            console.warn("[TerminalManager] Invalid resize geometry for ".concat(paneId, ": cols=").concat(cols, ", rows=").concat(rows, ". Must be positive integers."));
            return;
        }
        var session = this.sessions.get(paneId);
        if (!session || !session.isAlive) {
            console.warn("Cannot resize terminal ".concat(paneId, ": session not found or not alive"));
            return;
        }
        try {
            session.pty.resize(cols, rows);
            session.cols = cols;
            session.rows = rows;
            session.lastActive = Date.now();
        }
        catch (error) {
            console.error("[TerminalManager] Failed to resize terminal ".concat(paneId, " (cols=").concat(cols, ", rows=").concat(rows, "):"), error);
        }
    };
    TerminalManager.prototype.signal = function (params) {
        var paneId = params.paneId, _a = params.signal, signal = _a === void 0 ? "SIGTERM" : _a;
        var session = this.sessions.get(paneId);
        if (!session || !session.isAlive) {
            console.warn("Cannot signal terminal ".concat(paneId, ": session not found or not alive"));
            return;
        }
        session.pty.kill(signal);
        session.lastActive = Date.now();
    };
    TerminalManager.prototype.kill = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var paneId, session;
            return __generator(this, function (_a) {
                paneId = params.paneId;
                session = this.sessions.get(paneId);
                if (!session) {
                    console.warn("Cannot kill terminal ".concat(paneId, ": session not found"));
                    return [2 /*return*/];
                }
                if (session.isAlive) {
                    session.pty.kill();
                }
                else {
                    this.sessions.delete(paneId);
                }
                return [2 /*return*/];
            });
        });
    };
    TerminalManager.prototype.detach = function (params) {
        var paneId = params.paneId, serializedState = params.serializedState;
        var session = this.sessions.get(paneId);
        if (!session) {
            console.warn("Cannot detach terminal ".concat(paneId, ": session not found"));
            return;
        }
        if (serializedState) {
            session.serializedState = serializedState;
        }
        session.lastActive = Date.now();
    };
    TerminalManager.prototype.clearScrollback = function (params) {
        var paneId = params.paneId;
        var session = this.sessions.get(paneId);
        if (!session) {
            console.warn("Cannot clear scrollback for terminal ".concat(paneId, ": session not found"));
            return;
        }
        session.serializedState = "";
        session.lastActive = Date.now();
    };
    TerminalManager.prototype.getSession = function (paneId) {
        var session = this.sessions.get(paneId);
        if (!session) {
            return null;
        }
        return {
            isAlive: session.isAlive,
            cwd: session.cwd,
            lastActive: session.lastActive,
        };
    };
    TerminalManager.prototype.killByWorkspaceId = function (workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionsToKill, results, killed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionsToKill = Array.from(this.sessions.entries()).filter(function (_a) {
                            var session = _a[1];
                            return session.workspaceId === workspaceId;
                        });
                        if (sessionsToKill.length === 0) {
                            return [2 /*return*/, { killed: 0, failed: 0 }];
                        }
                        return [4 /*yield*/, Promise.all(sessionsToKill.map(function (_a) {
                                var paneId = _a[0], session = _a[1];
                                return _this.killSessionWithTimeout(paneId, session);
                            }))];
                    case 1:
                        results = _a.sent();
                        killed = results.filter(Boolean).length;
                        return [2 /*return*/, { killed: killed, failed: results.length - killed }];
                }
            });
        });
    };
    TerminalManager.prototype.killSessionWithTimeout = function (paneId, session) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!session.isAlive) {
                    this.sessions.delete(paneId);
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, new Promise(function (resolve) {
                        var resolved = false;
                        var sigtermTimeout;
                        var sigkillTimeout;
                        var cleanup = function (success) {
                            if (resolved)
                                return;
                            resolved = true;
                            _this.off("exit:".concat(paneId), exitHandler);
                            if (sigtermTimeout)
                                clearTimeout(sigtermTimeout);
                            if (sigkillTimeout)
                                clearTimeout(sigkillTimeout);
                            resolve(success);
                        };
                        var exitHandler = function () { return cleanup(true); };
                        _this.once("exit:".concat(paneId), exitHandler);
                        // Escalate to SIGKILL after 2s
                        sigtermTimeout = setTimeout(function () {
                            if (resolved || !session.isAlive)
                                return;
                            try {
                                session.pty.kill("SIGKILL");
                            }
                            catch (error) {
                                console.error("Failed to send SIGKILL to terminal ".concat(paneId, ":"), error);
                            }
                            // Force cleanup after another 500ms
                            sigkillTimeout = setTimeout(function () {
                                if (resolved)
                                    return;
                                if (session.isAlive) {
                                    console.error("Terminal ".concat(paneId, " did not exit after SIGKILL, forcing cleanup"));
                                    session.isAlive = false;
                                    _this.sessions.delete(paneId);
                                }
                                cleanup(false);
                            }, 500);
                            sigkillTimeout.unref();
                        }, 2000);
                        sigtermTimeout.unref();
                        // Send SIGTERM
                        try {
                            session.pty.kill();
                        }
                        catch (error) {
                            console.error("Failed to send SIGTERM to terminal ".concat(paneId, ":"), error);
                            session.isAlive = false;
                            _this.sessions.delete(paneId);
                            cleanup(false);
                        }
                    })];
            });
        });
    };
    TerminalManager.prototype.getSessionCountByWorkspaceId = function (workspaceId) {
        return Array.from(this.sessions.values()).filter(function (session) { return session.workspaceId === workspaceId && session.isAlive; }).length;
    };
    /**
     * Send a newline to all terminals in a workspace to refresh their prompts.
     * Useful after switching branches to update the branch name in prompts.
     */
    TerminalManager.prototype.refreshPromptsForWorkspace = function (workspaceId) {
        for (var _i = 0, _a = this.sessions.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], paneId = _b[0], session = _b[1];
            if (session.workspaceId === workspaceId && session.isAlive) {
                try {
                    session.pty.write("\n");
                }
                catch (error) {
                    console.warn("[TerminalManager] Failed to refresh prompt for pane ".concat(paneId, ":"), error);
                }
            }
        }
    };
    TerminalManager.prototype.detachAllListeners = function () {
        for (var _i = 0, _a = this.eventNames(); _i < _a.length; _i++) {
            var event_1 = _a[_i];
            var name_1 = String(event_1);
            if (name_1.startsWith("data:") || name_1.startsWith("exit:")) {
                this.removeAllListeners(event_1);
            }
        }
    };
    TerminalManager.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exitPromises, _loop_1, _i, _a, _b, paneId, session;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        exitPromises = [];
                        _loop_1 = function (paneId, session) {
                            if (session.isAlive) {
                                var exitPromise = new Promise(function (resolve) {
                                    var timeoutId;
                                    var exitHandler = function () {
                                        _this.off("exit:".concat(paneId), exitHandler);
                                        if (timeoutId !== undefined) {
                                            clearTimeout(timeoutId);
                                        }
                                        resolve();
                                    };
                                    _this.once("exit:".concat(paneId), exitHandler);
                                    timeoutId = setTimeout(function () {
                                        _this.off("exit:".concat(paneId), exitHandler);
                                        resolve();
                                    }, 2000);
                                    timeoutId.unref();
                                });
                                exitPromises.push(exitPromise);
                                session.pty.kill();
                            }
                        };
                        for (_i = 0, _a = this.sessions.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], paneId = _b[0], session = _b[1];
                            _loop_1(paneId, session);
                        }
                        return [4 /*yield*/, Promise.all(exitPromises)];
                    case 1:
                        _c.sent();
                        this.sessions.clear();
                        this.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TerminalManager;
}(node_events_1.EventEmitter));
exports.TerminalManager = TerminalManager;
/** Singleton terminal manager instance */
exports.terminalManager = new TerminalManager();
