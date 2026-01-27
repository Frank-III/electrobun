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
exports.HistoryReader = exports.HistoryWriter = void 0;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var electron_1 = require("electron");
var MAX_SCROLLBACK_CHARS = 500000;
/**
 * Get the directory for terminal history files.
 */
function getHistoryDir() {
    return node_path_1.default.join(electron_1.app.getPath("userData"), "terminal-history");
}
/**
 * Get the path for a specific terminal's history file.
 */
function getHistoryPath(workspaceId, paneId) {
    // Sanitize IDs to prevent path traversal
    var safeWorkspaceId = workspaceId.replace(/[^a-zA-Z0-9-_]/g, "_");
    var safePaneId = paneId.replace(/[^a-zA-Z0-9-_]/g, "_");
    return node_path_1.default.join(getHistoryDir(), safeWorkspaceId, "".concat(safePaneId, ".txt"));
}
/**
 * Writes terminal output to disk for persistence across app restarts.
 */
var HistoryWriter = /** @class */ (function () {
    function HistoryWriter(workspaceId, paneId, cwd, cols, rows) {
        this.buffer = "";
        this.flushTimeout = null;
        this.isInitialized = false;
        this.workspaceId = workspaceId;
        this.paneId = paneId;
        this.cwd = cwd;
        this.cols = cols;
        this.rows = rows;
        this.filePath = getHistoryPath(workspaceId, paneId);
    }
    /**
     * Initialize the history file with optional existing scrollback.
     */
    HistoryWriter.prototype.init = function (existingScrollback) {
        return __awaiter(this, void 0, void 0, function () {
            var header, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        // Ensure directory exists
                        return [4 /*yield*/, promises_1.default.mkdir(node_path_1.default.dirname(this.filePath), { recursive: true })
                            // Write header and existing scrollback
                        ];
                    case 1:
                        // Ensure directory exists
                        _a.sent();
                        header = "# Terminal History\n# Workspace: ".concat(this.workspaceId, "\n# Pane: ").concat(this.paneId, "\n# CWD: ").concat(this.cwd, "\n# Size: ").concat(this.cols, "x").concat(this.rows, "\n# Created: ").concat(new Date().toISOString(), "\n---\n");
                        if (!existingScrollback) return [3 /*break*/, 3];
                        return [4 /*yield*/, promises_1.default.writeFile(this.filePath, header + existingScrollback, "utf-8")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, promises_1.default.writeFile(this.filePath, header, "utf-8")];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        this.isInitialized = true;
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        console.error("[HistoryWriter] Failed to init:", err_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Write data to the history buffer. Flushes to disk periodically.
     */
    HistoryWriter.prototype.write = function (data) {
        var _this = this;
        if (!this.isInitialized)
            return;
        this.buffer += data;
        // Schedule flush if not already scheduled
        if (this.flushTimeout === null) {
            this.flushTimeout = setTimeout(function () { return _this.flush(); }, 1000);
        }
    };
    /**
     * Flush buffer to disk.
     */
    HistoryWriter.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataToWrite, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.flushTimeout !== null) {
                            clearTimeout(this.flushTimeout);
                            this.flushTimeout = null;
                        }
                        if (!this.buffer || !this.isInitialized)
                            return [2 /*return*/];
                        dataToWrite = this.buffer;
                        this.buffer = "";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, promises_1.default.appendFile(this.filePath, dataToWrite, "utf-8")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        console.error("[HistoryWriter] Failed to flush:", err_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the history writer, flushing any remaining data.
     */
    HistoryWriter.prototype.close = function (exitCode) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.flush()];
                    case 1:
                        _b.sent();
                        if (!(exitCode !== undefined)) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, promises_1.default.appendFile(this.filePath, "\n---\n# Exited: ".concat(new Date().toISOString(), "\n# Exit code: ").concat(exitCode, "\n"), "utf-8")];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        this.isInitialized = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    return HistoryWriter;
}());
exports.HistoryWriter = HistoryWriter;
/**
 * Reads terminal history from disk.
 */
var HistoryReader = /** @class */ (function () {
    function HistoryReader(workspaceId, paneId) {
        this.workspaceId = workspaceId;
        this.paneId = paneId;
        this.filePath = getHistoryPath(workspaceId, paneId);
    }
    /**
     * Read the scrollback history from disk.
     */
    HistoryReader.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, headerEnd, scrollback, exitFooterStart, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promises_1.default.readFile(this.filePath, "utf-8")
                            // Remove header (everything before ---\n)
                        ];
                    case 1:
                        content = _a.sent();
                        headerEnd = content.indexOf("---\n");
                        if (headerEnd === -1) {
                            return [2 /*return*/, { scrollback: "" }];
                        }
                        scrollback = content.slice(headerEnd + 4);
                        exitFooterStart = scrollback.lastIndexOf("\n---\n# Exited:");
                        if (exitFooterStart !== -1) {
                            scrollback = scrollback.slice(0, exitFooterStart);
                        }
                        // Limit scrollback size
                        if (scrollback.length > MAX_SCROLLBACK_CHARS) {
                            scrollback = scrollback.slice(-MAX_SCROLLBACK_CHARS);
                        }
                        return [2 /*return*/, { scrollback: scrollback }];
                    case 2:
                        err_3 = _a.sent();
                        // File doesn't exist or can't be read
                        return [2 /*return*/, { scrollback: "" }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete the history file.
     */
    HistoryReader.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promises_1.default.unlink(this.filePath)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HistoryReader;
}());
exports.HistoryReader = HistoryReader;
