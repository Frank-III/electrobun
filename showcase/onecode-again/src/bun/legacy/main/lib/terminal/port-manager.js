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
exports.portManager = void 0;
var node_events_1 = require("node:events");
var port_scanner_1 = require("./port-scanner");
// How often to poll for port changes (in ms)
var SCAN_INTERVAL_MS = 2500;
// Ports to ignore (common system ports that are usually not dev servers)
var IGNORED_PORTS = new Set([22, 80, 443, 5432, 3306, 6379, 27017]);
var PortManager = /** @class */ (function (_super) {
    __extends(PortManager, _super);
    function PortManager() {
        var _this = _super.call(this) || this;
        _this.ports = new Map();
        _this.sessions = new Map();
        _this.scanInterval = null;
        _this.pendingHintScans = new Map();
        _this.isScanning = false;
        _this.startPeriodicScan();
        return _this;
    }
    /**
     * Register a terminal session for port scanning
     */
    PortManager.prototype.registerSession = function (session, workspaceId) {
        this.sessions.set(session.paneId, { session: session, workspaceId: workspaceId });
    };
    /**
     * Unregister a terminal session and remove its ports
     */
    PortManager.prototype.unregisterSession = function (paneId) {
        this.sessions.delete(paneId);
        this.removePortsForPane(paneId);
        // Cancel any pending hint scan for this pane
        var pendingTimeout = this.pendingHintScans.get(paneId);
        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            this.pendingHintScans.delete(paneId);
        }
    };
    /**
     * Start periodic scanning of all registered sessions
     */
    PortManager.prototype.startPeriodicScan = function () {
        var _this = this;
        if (this.scanInterval)
            return;
        this.scanInterval = setInterval(function () {
            _this.scanAllSessions().catch(function (error) {
                console.error("[PortManager] Scan error:", error);
            });
        }, SCAN_INTERVAL_MS);
        // Don't prevent Node from exiting
        this.scanInterval.unref();
    };
    /**
     * Stop periodic scanning
     */
    PortManager.prototype.stopPeriodicScan = function () {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        for (var _i = 0, _a = this.pendingHintScans.values(); _i < _a.length; _i++) {
            var timeout = _a[_i];
            clearTimeout(timeout);
        }
        this.pendingHintScans.clear();
    };
    /**
     * Scan all registered sessions for ports
     */
    PortManager.prototype.scanAllSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var panePortMap, _i, _a, _b, paneId, _c, session, workspaceId, pid, pids, _d, _e, panePortMap_1, _f, paneId, _g, workspaceId, pids, portInfos, _h, _j, _k, key, port;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (this.isScanning)
                            return [2 /*return*/];
                        this.isScanning = true;
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, , 12, 13]);
                        panePortMap = new Map();
                        _i = 0, _a = this.sessions;
                        _l.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], paneId = _b[0], _c = _b[1], session = _c.session, workspaceId = _c.workspaceId;
                        if (!session.isAlive)
                            return [3 /*break*/, 6];
                        _l.label = 3;
                    case 3:
                        _l.trys.push([3, 5, , 6]);
                        pid = session.pty.pid;
                        return [4 /*yield*/, (0, port_scanner_1.getProcessTree)(pid)];
                    case 4:
                        pids = _l.sent();
                        if (pids.length > 0) {
                            panePortMap.set(paneId, { workspaceId: workspaceId, pids: pids });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        _d = _l.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        _e = 0, panePortMap_1 = panePortMap;
                        _l.label = 8;
                    case 8:
                        if (!(_e < panePortMap_1.length)) return [3 /*break*/, 11];
                        _f = panePortMap_1[_e], paneId = _f[0], _g = _f[1], workspaceId = _g.workspaceId, pids = _g.pids;
                        return [4 /*yield*/, (0, port_scanner_1.getListeningPortsForPids)(pids)];
                    case 9:
                        portInfos = _l.sent();
                        this.updatePortsForPane(paneId, workspaceId, portInfos);
                        _l.label = 10;
                    case 10:
                        _e++;
                        return [3 /*break*/, 8];
                    case 11:
                        for (_h = 0, _j = this.ports; _h < _j.length; _h++) {
                            _k = _j[_h], key = _k[0], port = _k[1];
                            if (!this.sessions.has(port.paneId)) {
                                this.ports.delete(key);
                                this.emit("port:remove", port);
                            }
                        }
                        return [3 /*break*/, 13];
                    case 12:
                        this.isScanning = false;
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update ports for a specific pane, emitting add/remove events as needed
     */
    PortManager.prototype.updatePortsForPane = function (paneId, workspaceId, portInfos) {
        var now = Date.now();
        var validPortInfos = portInfos.filter(function (info) { return !IGNORED_PORTS.has(info.port); });
        var seenKeys = new Set();
        for (var _i = 0, validPortInfos_1 = validPortInfos; _i < validPortInfos_1.length; _i++) {
            var info = validPortInfos_1[_i];
            var key = this.makeKey(paneId, info.port);
            seenKeys.add(key);
            var existing = this.ports.get(key);
            if (!existing) {
                var detectedPort = {
                    port: info.port,
                    pid: info.pid,
                    processName: info.processName,
                    paneId: paneId,
                    workspaceId: workspaceId,
                    detectedAt: now,
                    address: info.address,
                };
                this.ports.set(key, detectedPort);
                this.emit("port:add", detectedPort);
            }
            else if (existing.pid !== info.pid ||
                existing.processName !== info.processName) {
                var updatedPort = __assign(__assign({}, existing), { pid: info.pid, processName: info.processName, address: info.address });
                this.ports.set(key, updatedPort);
                this.emit("port:remove", existing);
                this.emit("port:add", updatedPort);
            }
        }
        for (var _a = 0, _b = this.ports; _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], port = _c[1];
            if (port.paneId === paneId && !seenKeys.has(key)) {
                this.ports.delete(key);
                this.emit("port:remove", port);
            }
        }
    };
    PortManager.prototype.makeKey = function (paneId, port) {
        return "".concat(paneId, ":").concat(port);
    };
    /**
     * Remove all ports for a specific pane
     */
    PortManager.prototype.removePortsForPane = function (paneId) {
        var portsToRemove = [];
        for (var _i = 0, _a = this.ports; _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], port = _b[1];
            if (port.paneId === paneId) {
                portsToRemove.push(port);
                this.ports.delete(key);
            }
        }
        for (var _c = 0, portsToRemove_1 = portsToRemove; _c < portsToRemove_1.length; _c++) {
            var port = portsToRemove_1[_c];
            this.emit("port:remove", port);
        }
    };
    /**
     * Get all detected ports
     */
    PortManager.prototype.getAllPorts = function () {
        return Array.from(this.ports.values()).sort(function (a, b) { return b.detectedAt - a.detectedAt; });
    };
    /**
     * Get ports for a specific workspace
     */
    PortManager.prototype.getPortsByWorkspace = function (workspaceId) {
        return this.getAllPorts().filter(function (p) { return p.workspaceId === workspaceId; });
    };
    /**
     * Force an immediate scan of all sessions
     * Useful for testing or when you know ports have changed
     */
    PortManager.prototype.forceScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.scanAllSessions()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return PortManager;
}(node_events_1.EventEmitter));
exports.portManager = new PortManager();
