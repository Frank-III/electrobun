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
exports.cleanupOldLogs = cleanupOldLogs;
exports.logRawClaudeMessage = logRawClaudeMessage;
exports.getLogsDirectory = getLogsDirectory;
var electron_1 = require("electron");
var path_1 = require("path");
var promises_1 = require("fs/promises");
// Check if logging is enabled (lazy check after app is ready)
function isEnabled() {
    try {
        return process.env.CLAUDE_RAW_LOG === "1" || !electron_1.app.isPackaged;
    }
    catch (_a) {
        // App not ready yet, check env var only
        return process.env.CLAUDE_RAW_LOG === "1";
    }
}
var MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB per file
var LOG_RETENTION_DAYS = 7; // Keep logs for 7 days
var logsDir = null;
var currentLogFile = null;
var currentSessionId = null;
function ensureLogsDir() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!logsDir) return [3 /*break*/, 2];
                    logsDir = (0, path_1.join)(electron_1.app.getPath("userData"), "logs", "claude");
                    return [4 /*yield*/, (0, promises_1.mkdir)(logsDir, { recursive: true })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, logsDir];
            }
        });
    });
}
/**
 * Check if current log file should be rotated based on size
 */
function shouldRotateLog(file) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(file)];
                case 1:
                    stats = _b.sent();
                    return [2 /*return*/, stats.size > MAX_LOG_SIZE];
                case 2:
                    _a = _b.sent();
                    // File doesn't exist or can't be accessed - no need to rotate
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up old log files (older than LOG_RETENTION_DAYS)
 * Called periodically to prevent disk space issues
 */
function cleanupOldLogs() {
    return __awaiter(this, void 0, void 0, function () {
        var dir, files, now, maxAge, _i, files_1, file, filePath, stats, age, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isEnabled())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, ensureLogsDir()];
                case 2:
                    dir = _a.sent();
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 3:
                    files = _a.sent();
                    now = Date.now();
                    maxAge = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
                    _i = 0, files_1 = files;
                    _a.label = 4;
                case 4:
                    if (!(_i < files_1.length)) return [3 /*break*/, 11];
                    file = files_1[_i];
                    // Only process .jsonl files
                    if (!file.endsWith(".jsonl"))
                        return [3 /*break*/, 10];
                    filePath = (0, path_1.join)(dir, file);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 6:
                    stats = _a.sent();
                    age = now - stats.mtime.getTime();
                    if (!(age > maxAge)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                case 7:
                    _a.sent();
                    console.log("[raw-logger] Cleaned up old log: ".concat(file));
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    err_1 = _a.sent();
                    // Skip files we can't access
                    console.warn("[raw-logger] Failed to check file ".concat(file, ":"), err_1);
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11: return [3 /*break*/, 13];
                case 12:
                    err_2 = _a.sent();
                    console.error("[raw-logger] Failed to cleanup old logs:", err_2);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log a raw Claude message to JSONL file for debugging
 * Includes automatic log rotation and cleanup
 */
function logRawClaudeMessage(sessionId, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, needsNewFile, _a, _b, timestamp, suffix, entry, err_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!isEnabled())
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, ensureLogsDir()
                        // Create new file for new session OR rotate if current file is too large
                    ];
                case 2:
                    dir = _c.sent();
                    _a = sessionId !== currentSessionId;
                    if (_a) return [3 /*break*/, 5];
                    _b = currentLogFile;
                    if (!_b) return [3 /*break*/, 4];
                    return [4 /*yield*/, shouldRotateLog(currentLogFile)];
                case 3:
                    _b = (_c.sent());
                    _c.label = 4;
                case 4:
                    _a = (_b);
                    _c.label = 5;
                case 5:
                    needsNewFile = _a;
                    if (needsNewFile) {
                        currentSessionId = sessionId;
                        timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                        suffix = currentLogFile ? "-".concat(Date.now()) : "";
                        currentLogFile = (0, path_1.join)(dir, "".concat(sessionId, "_").concat(timestamp).concat(suffix, ".jsonl"));
                        // Run cleanup periodically (on new session start)
                        if (sessionId !== currentSessionId) {
                            // Run cleanup in background, don't wait for it
                            cleanupOldLogs().catch(function (err) {
                                return console.error("[raw-logger] Background cleanup failed:", err);
                            });
                        }
                    }
                    entry = {
                        timestamp: new Date().toISOString(),
                        data: msg,
                    };
                    return [4 /*yield*/, (0, promises_1.appendFile)(currentLogFile, JSON.stringify(entry) + "\n")];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_3 = _c.sent();
                    // Don't let logging errors break the main flow
                    console.error("[raw-logger] Failed to log:", err_3);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the directory where Claude logs are stored
 * Useful for UI to show "Open Logs" button
 */
function getLogsDirectory() {
    return (0, path_1.join)(electron_1.app.getPath("userData"), "logs", "claude");
}
