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
exports.terminalRouter = void 0;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var zod_1 = require("zod");
var index_1 = require("../index");
var observable_1 = require("@trpc/server/observable");
var manager_1 = require("../../terminal/manager");
var server_1 = require("@trpc/server");
exports.terminalRouter = (0, index_1.router)({
    /**
     * Create or attach to an existing terminal session.
     * Returns serializedState for recovery if reattaching.
     */
    createOrAttach: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
        tabId: zod_1.z.string().optional(),
        workspaceId: zod_1.z.string().optional(),
        cols: zod_1.z.number().int().positive().optional(),
        rows: zod_1.z.number().int().positive().optional(),
        cwd: zod_1.z.string().optional(),
        initialCommands: zod_1.z.array(zod_1.z.string()).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var result, err_1;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, manager_1.terminalManager.createOrAttach(input)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, {
                            paneId: input.paneId,
                            isNew: result.isNew,
                            serializedState: result.serializedState,
                        }];
                case 2:
                    err_1 = _c.sent();
                    console.error("[TerminalRouter] createOrAttach error:", err_1);
                    throw new server_1.TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: err_1 instanceof Error ? err_1.message : "Failed to create terminal",
                    });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    write: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
        data: zod_1.z.string(),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        manager_1.terminalManager.write(input);
    }),
    resize: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
        cols: zod_1.z.number().int().positive(),
        rows: zod_1.z.number().int().positive(),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        manager_1.terminalManager.resize(input);
    }),
    /**
     * Send a signal to the terminal process.
     */
    signal: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
        signal: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        manager_1.terminalManager.signal(input);
    }),
    /**
     * Kill terminal session - actually terminate it.
     */
    kill: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, manager_1.terminalManager.kill(input)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Detach from terminal - keep session alive.
     * Called on component unmount. Stores serialized state for recovery.
     */
    detach: index_1.publicProcedure
        .input(zod_1.z.object({
        paneId: zod_1.z.string().min(1),
        serializedState: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) {
        var input = _a.input;
        manager_1.terminalManager.detach(input);
    }),
    /**
     * Clear scrollback buffer for terminal (used by Cmd+K / clear command)
     */
    clearScrollback: index_1.publicProcedure
        .input(zod_1.z.object({ paneId: zod_1.z.string().min(1) }))
        .mutation(function (_a) {
        var input = _a.input;
        manager_1.terminalManager.clearScrollback(input);
    }),
    getSession: index_1.publicProcedure
        .input(zod_1.z.string().min(1))
        .query(function (_a) {
        var paneId = _a.input;
        return manager_1.terminalManager.getSession(paneId);
    }),
    /**
     * Get count of active terminal sessions for a workspace
     */
    getActiveSessionCount: index_1.publicProcedure
        .input(zod_1.z.object({ workspaceId: zod_1.z.string() }))
        .query(function (_a) {
        var input = _a.input;
        return manager_1.terminalManager.getSessionCountByWorkspaceId(input.workspaceId);
    }),
    /**
     * Get workspace cwd for terminal initialization
     */
    getWorkspaceCwd: index_1.publicProcedure.input(zod_1.z.string()).query(function (_a) {
        var input = _a.input;
        // For now, just return null - the workspace path comes from the chat/project
        // In the future this could look up the workspace's root directory
        return null;
    }),
    /**
     * List directory contents for navigation
     */
    listDirectory: index_1.publicProcedure
        .input(zod_1.z.object({ dirPath: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var dirPath, entries, items, parentPath, hasParent, _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    dirPath = input.dirPath;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promises_1.default.readdir(dirPath, { withFileTypes: true })];
                case 2:
                    entries = _d.sent();
                    items = entries
                        .filter(function (entry) { return !entry.name.startsWith("."); })
                        .map(function (entry) { return ({
                        name: entry.name,
                        path: node_path_1.default.join(dirPath, entry.name),
                        isDirectory: entry.isDirectory(),
                    }); })
                        .sort(function (a, b) {
                        // Directories first, then alphabetical
                        if (a.isDirectory && !b.isDirectory)
                            return -1;
                        if (!a.isDirectory && b.isDirectory)
                            return 1;
                        return a.name.localeCompare(b.name);
                    });
                    parentPath = node_path_1.default.dirname(dirPath);
                    hasParent = parentPath !== dirPath;
                    return [2 /*return*/, {
                            currentPath: dirPath,
                            parentPath: hasParent ? parentPath : null,
                            items: items,
                        }];
                case 3:
                    _c = _d.sent();
                    return [2 /*return*/, {
                            currentPath: dirPath,
                            parentPath: null,
                            items: [],
                            error: "Unable to read directory",
                        }];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    stream: index_1.publicProcedure
        .input(zod_1.z.string().min(1))
        .subscription(function (_a) {
        var paneId = _a.input;
        return (0, observable_1.observable)(function (emit) {
            var onData = function (data) {
                emit.next({ type: "data", data: data });
            };
            var onExit = function (exitCode, signal) {
                emit.next({ type: "exit", exitCode: exitCode, signal: signal });
                emit.complete();
            };
            manager_1.terminalManager.on("data:".concat(paneId), onData);
            manager_1.terminalManager.on("exit:".concat(paneId), onExit);
            return function () {
                manager_1.terminalManager.off("data:".concat(paneId), onData);
                manager_1.terminalManager.off("exit:".concat(paneId), onExit);
            };
        });
    }),
});
