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
exports.getProcessTree = getProcessTree;
exports.getListeningPortsForPids = getListeningPortsForPids;
exports.getProcessName = getProcessName;
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var node_os_1 = require("node:os");
var pidtree_1 = require("pidtree");
var execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
// Cache for port lookups to avoid repeated expensive calls
var portCache = new Map();
var PORT_CACHE_TTL = 2000; // 2 seconds - ports don't change that fast
// Cache for process names
var processNameCache = new Map();
var PROCESS_NAME_CACHE_TTL = 10000; // 10 seconds
/**
 * Get all child PIDs of a process (including the process itself)
 */
function getProcessTree(pid) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pidtree_1.default)(pid, { root: true })];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    // Process may have exited
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get listening TCP ports for a set of PIDs (async, cached)
 * Cross-platform implementation using lsof (macOS/Linux) or netstat (Windows)
 */
function getListeningPortsForPids(pids) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, platform, ports;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (pids.length === 0)
                        return [2 /*return*/, []
                            // Check cache first
                        ];
                    cacheKey = pids.sort().join(",");
                    cached = portCache.get(cacheKey);
                    if (cached && Date.now() - cached.timestamp < PORT_CACHE_TTL) {
                        return [2 /*return*/, cached.ports];
                    }
                    platform = node_os_1.default.platform();
                    ports = [];
                    if (!(platform === "darwin" || platform === "linux")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getListeningPortsLsof(pids)];
                case 1:
                    ports = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(platform === "win32")) return [3 /*break*/, 4];
                    return [4 /*yield*/, getListeningPortsWindows(pids)];
                case 3:
                    ports = _a.sent();
                    _a.label = 4;
                case 4:
                    // Update cache
                    portCache.set(cacheKey, { ports: ports, timestamp: Date.now() });
                    return [2 /*return*/, ports];
            }
        });
    });
}
/**
 * macOS/Linux implementation using lsof (async)
 */
function getListeningPortsLsof(pids) {
    return __awaiter(this, void 0, void 0, function () {
        var pidArg, pidSet, output, ports, lines, _i, lines_1, line, columns, processName, pid, name_1, match, address, port, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    pidArg = pids.join(",");
                    pidSet = new Set(pids);
                    return [4 /*yield*/, execFileAsync("sh", ["-c", "lsof -p ".concat(pidArg, " -iTCP -sTCP:LISTEN -P -n 2>/dev/null || true")], { maxBuffer: 10 * 1024 * 1024, timeout: 5000 })];
                case 1:
                    output = (_b.sent()).stdout;
                    if (!output.trim())
                        return [2 /*return*/, []];
                    ports = [];
                    lines = output.trim().split("\n").slice(1);
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (!line.trim())
                            continue;
                        columns = line.split(/\s+/);
                        if (columns.length < 10)
                            continue;
                        processName = columns[0];
                        pid = Number.parseInt(columns[1], 10);
                        // CRITICAL: Verify the PID is in our requested set
                        // lsof ignores -p filter when PIDs don't exist, returning all TCP listeners
                        if (!pidSet.has(pid))
                            continue;
                        name_1 = columns[columns.length - 2] // NAME column (e.g., *:3000), before (LISTEN)
                        ;
                        match = name_1.match(/^(?:\[([^\]]+)\]|([^:]+)):(\d+)$/);
                        if (match) {
                            address = match[1] || match[2] || "*";
                            port = Number.parseInt(match[3], 10);
                            if (port < 1 || port > 65535)
                                continue;
                            ports.push({
                                port: port,
                                pid: pid,
                                address: address === "*" ? "0.0.0.0" : address,
                                processName: processName,
                            });
                        }
                    }
                    return [2 /*return*/, ports];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Windows implementation using netstat (async)
 */
function getListeningPortsWindows(pids) {
    return __awaiter(this, void 0, void 0, function () {
        var output, pidSet, ports, processNames_1, uniquePids, parsedLines, _i, _a, line, columns, pid, localAddr, match, address, port, _b, parsedLines_1, _c, pid, address, port, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, execFileAsync("netstat", ["-ano"], {
                            maxBuffer: 10 * 1024 * 1024,
                            timeout: 5000,
                        })];
                case 1:
                    output = (_e.sent()).stdout;
                    pidSet = new Set(pids);
                    ports = [];
                    processNames_1 = new Map();
                    uniquePids = new Set();
                    parsedLines = [];
                    for (_i = 0, _a = output.split("\n"); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line.includes("LISTENING"))
                            continue;
                        columns = line.trim().split(/\s+/);
                        if (columns.length < 5)
                            continue;
                        pid = Number.parseInt(columns[columns.length - 1], 10);
                        if (!pidSet.has(pid))
                            continue;
                        localAddr = columns[1];
                        match = localAddr.match(/^(?:\[([^\]]+)\]|([^:]+)):(\d+)$/);
                        if (match) {
                            address = match[1] || match[2] || "0.0.0.0";
                            port = Number.parseInt(match[3], 10);
                            if (port < 1 || port > 65535)
                                continue;
                            uniquePids.add(pid);
                            parsedLines.push({ pid: pid, address: address, port: port });
                        }
                    }
                    // Fetch process names in parallel
                    return [4 /*yield*/, Promise.all(Array.from(uniquePids).map(function (pid) { return __awaiter(_this, void 0, void 0, function () {
                            var name;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getProcessNameWindowsAsync(pid)];
                                    case 1:
                                        name = _a.sent();
                                        processNames_1.set(pid, name);
                                        return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Build final result
                    ];
                case 2:
                    // Fetch process names in parallel
                    _e.sent();
                    // Build final result
                    for (_b = 0, parsedLines_1 = parsedLines; _b < parsedLines_1.length; _b++) {
                        _c = parsedLines_1[_b], pid = _c.pid, address = _c.address, port = _c.port;
                        ports.push({
                            port: port,
                            pid: pid,
                            address: address,
                            processName: processNames_1.get(pid) || "unknown",
                        });
                    }
                    return [2 /*return*/, ports];
                case 3:
                    _d = _e.sent();
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get process name for a PID on Windows (async with cache)
 */
function getProcessNameWindowsAsync(pid) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, name, output, lines, parsedName, _a, output, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cached = processNameCache.get(pid);
                    if (cached && Date.now() - cached.timestamp < PROCESS_NAME_CACHE_TTL) {
                        return [2 /*return*/, cached.name];
                    }
                    name = "unknown";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 8]);
                    return [4 /*yield*/, execFileAsync("wmic", ["process", "where", "processid=".concat(pid), "get", "name"], { timeout: 2000 })];
                case 2:
                    output = (_c.sent()).stdout;
                    lines = output.trim().split("\n");
                    if (lines.length >= 2) {
                        parsedName = lines[1].trim();
                        name = parsedName.replace(/\.exe$/i, "") || "unknown";
                    }
                    return [3 /*break*/, 8];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, execFileAsync("powershell", ["-Command", "(Get-Process -Id ".concat(pid, ").ProcessName")], { timeout: 2000 })];
                case 5:
                    output = (_c.sent()).stdout;
                    name = output.trim() || "unknown";
                    return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 8];
                case 8:
                    // Update cache
                    processNameCache.set(pid, { name: name, timestamp: Date.now() });
                    return [2 /*return*/, name];
            }
        });
    });
}
/**
 * Get process name for a PID (cross-platform, async with cache)
 */
function getProcessName(pid) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, platform, name, output, parsedName, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cached = processNameCache.get(pid);
                    if (cached && Date.now() - cached.timestamp < PROCESS_NAME_CACHE_TTL) {
                        return [2 /*return*/, cached.name];
                    }
                    platform = node_os_1.default.platform();
                    name = "unknown";
                    if (!(platform === "win32")) return [3 /*break*/, 2];
                    return [4 /*yield*/, getProcessNameWindowsAsync(pid)];
                case 1:
                    name = _b.sent();
                    return [3 /*break*/, 5];
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, execFileAsync("sh", ["-c", "ps -p ".concat(pid, " -o comm= 2>/dev/null || true")], { timeout: 2000 })];
                case 3:
                    output = (_b.sent()).stdout;
                    parsedName = output.trim();
                    // On macOS, comm may be truncated. The full path can be gotten with -o command=
                    // but comm is usually sufficient for display purposes
                    name = parsedName || "unknown";
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    name = "unknown";
                    return [3 /*break*/, 5];
                case 5:
                    // Update cache
                    processNameCache.set(pid, { name: name, timestamp: Date.now() });
                    return [2 /*return*/, name];
            }
        });
    });
}
