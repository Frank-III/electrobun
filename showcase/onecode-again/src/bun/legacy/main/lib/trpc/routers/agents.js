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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentsRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var agent_utils_1 = require("./agent-utils");
// Shared procedure for listing agents
var listAgentsProcedure = index_1.publicProcedure
    .input(zod_1.z
    .object({
    cwd: zod_1.z.string().optional(),
})
    .optional())
    .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var userAgentsDir, userAgentsPromise, projectAgentsPromise, projectAgentsDir, _c, userAgents, projectAgents;
    var input = _b.input;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                userAgentsDir = path.join(os.homedir(), ".claude", "agents");
                userAgentsPromise = (0, agent_utils_1.scanAgentsDirectory)(userAgentsDir, "user");
                projectAgentsPromise = Promise.resolve([]);
                if (input === null || input === void 0 ? void 0 : input.cwd) {
                    projectAgentsDir = path.join(input.cwd, ".claude", "agents");
                    projectAgentsPromise = (0, agent_utils_1.scanAgentsDirectory)(projectAgentsDir, "project", input.cwd);
                }
                return [4 /*yield*/, Promise.all([
                        userAgentsPromise,
                        projectAgentsPromise,
                    ])];
            case 1:
                _c = _d.sent(), userAgents = _c[0], projectAgents = _c[1];
                return [2 /*return*/, __spreadArray(__spreadArray([], projectAgents, true), userAgents, true)];
        }
    });
}); });
exports.agentsRouter = (0, index_1.router)({
    /**
     * List all agents from filesystem
     * - User agents: ~/.claude/agents/
     * - Project agents: .claude/agents/ (relative to cwd)
     */
    list: listAgentsProcedure,
    /**
     * Alias for list - used by @ mention
     */
    listEnabled: listAgentsProcedure,
    /**
     * Get single agent by name
     */
    get: index_1.publicProcedure
        .input(zod_1.z.object({ name: zod_1.z.string(), cwd: zod_1.z.string().optional() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var locations, _i, locations_1, _c, dir, source, agentPath, content, parsed, _d;
        var input = _b.input;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    locations = __spreadArray([
                        {
                            dir: path.join(os.homedir(), ".claude", "agents"),
                            source: "user",
                        }
                    ], (input.cwd
                        ? [
                            {
                                dir: path.join(input.cwd, ".claude", "agents"),
                                source: "project",
                            },
                        ]
                        : []), true);
                    _i = 0, locations_1 = locations;
                    _e.label = 1;
                case 1:
                    if (!(_i < locations_1.length)) return [3 /*break*/, 6];
                    _c = locations_1[_i], dir = _c.dir, source = _c.source;
                    agentPath = path.join(dir, "".concat(input.name, ".md"));
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(agentPath, "utf-8")];
                case 3:
                    content = _e.sent();
                    parsed = (0, agent_utils_1.parseAgentMd)(content, "".concat(input.name, ".md"));
                    return [2 /*return*/, __assign(__assign({}, parsed), { source: source, path: agentPath })];
                case 4:
                    _d = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, null];
            }
        });
    }); }),
    /**
     * Create a new agent
     */
    create: index_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        prompt: zod_1.z.string(),
        tools: zod_1.z.array(zod_1.z.string()).optional(),
        disallowedTools: zod_1.z.array(zod_1.z.string()).optional(),
        model: zod_1.z.enum(agent_utils_1.VALID_AGENT_MODELS).optional(),
        source: zod_1.z.enum(["user", "project"]),
        cwd: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var safeName, targetDir, agentPath, err_1, content;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    safeName = input.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    if (!safeName || safeName.includes("..")) {
                        throw new Error("Invalid agent name");
                    }
                    if (input.source === "project") {
                        if (!input.cwd) {
                            throw new Error("Project path (cwd) required for project agents");
                        }
                        targetDir = path.join(input.cwd, ".claude", "agents");
                    }
                    else {
                        targetDir = path.join(os.homedir(), ".claude", "agents");
                    }
                    // Ensure directory exists
                    return [4 /*yield*/, fs.mkdir(targetDir, { recursive: true })];
                case 1:
                    // Ensure directory exists
                    _c.sent();
                    agentPath = path.join(targetDir, "".concat(safeName, ".md"));
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.access(agentPath)];
                case 3:
                    _c.sent();
                    throw new Error("Agent \"".concat(safeName, "\" already exists"));
                case 4:
                    err_1 = _c.sent();
                    if (err_1.code !== "ENOENT") {
                        throw err_1;
                    }
                    return [3 /*break*/, 5];
                case 5:
                    content = (0, agent_utils_1.generateAgentMd)({
                        name: safeName,
                        description: input.description,
                        prompt: input.prompt,
                        tools: input.tools,
                        disallowedTools: input.disallowedTools,
                        model: input.model,
                    });
                    return [4 /*yield*/, fs.writeFile(agentPath, content, "utf-8")];
                case 6:
                    _c.sent();
                    return [2 /*return*/, {
                            name: safeName,
                            path: agentPath,
                            source: input.source,
                        }];
            }
        });
    }); }),
    /**
     * Update an existing agent
     */
    update: index_1.publicProcedure
        .input(zod_1.z.object({
        originalName: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        prompt: zod_1.z.string(),
        tools: zod_1.z.array(zod_1.z.string()).optional(),
        disallowedTools: zod_1.z.array(zod_1.z.string()).optional(),
        model: zod_1.z.enum(agent_utils_1.VALID_AGENT_MODELS).optional(),
        source: zod_1.z.enum(["user", "project"]),
        cwd: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var safeOriginalName, safeName, targetDir, originalPath, newPath, _c, err_2, content;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    safeOriginalName = input.originalName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    safeName = input.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    if (!safeOriginalName || !safeName || safeName.includes("..")) {
                        throw new Error("Invalid agent name");
                    }
                    if (input.source === "project") {
                        if (!input.cwd) {
                            throw new Error("Project path (cwd) required for project agents");
                        }
                        targetDir = path.join(input.cwd, ".claude", "agents");
                    }
                    else {
                        targetDir = path.join(os.homedir(), ".claude", "agents");
                    }
                    originalPath = path.join(targetDir, "".concat(safeOriginalName, ".md"));
                    newPath = path.join(targetDir, "".concat(safeName, ".md"));
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.access(originalPath)];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    throw new Error("Agent \"".concat(safeOriginalName, "\" not found"));
                case 4:
                    if (!(safeOriginalName !== safeName)) return [3 /*break*/, 8];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fs.access(newPath)];
                case 6:
                    _d.sent();
                    throw new Error("Agent \"".concat(safeName, "\" already exists"));
                case 7:
                    err_2 = _d.sent();
                    if (err_2.code !== "ENOENT") {
                        throw err_2;
                    }
                    return [3 /*break*/, 8];
                case 8:
                    content = (0, agent_utils_1.generateAgentMd)({
                        name: safeName,
                        description: input.description,
                        prompt: input.prompt,
                        tools: input.tools,
                        disallowedTools: input.disallowedTools,
                        model: input.model,
                    });
                    if (!(safeOriginalName !== safeName)) return [3 /*break*/, 10];
                    return [4 /*yield*/, fs.unlink(originalPath)];
                case 9:
                    _d.sent();
                    _d.label = 10;
                case 10: return [4 /*yield*/, fs.writeFile(newPath, content, "utf-8")];
                case 11:
                    _d.sent();
                    return [2 /*return*/, {
                            name: safeName,
                            path: newPath,
                            source: input.source,
                        }];
            }
        });
    }); }),
    /**
     * Delete an agent
     */
    delete: index_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        source: zod_1.z.enum(["user", "project"]),
        cwd: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var safeName, targetDir, agentPath;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    safeName = input.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    if (!safeName || safeName.includes("..")) {
                        throw new Error("Invalid agent name");
                    }
                    if (input.source === "project") {
                        if (!input.cwd) {
                            throw new Error("Project path (cwd) required for project agents");
                        }
                        targetDir = path.join(input.cwd, ".claude", "agents");
                    }
                    else {
                        targetDir = path.join(os.homedir(), ".claude", "agents");
                    }
                    agentPath = path.join(targetDir, "".concat(safeName, ".md"));
                    return [4 /*yield*/, fs.unlink(agentPath)];
                case 1:
                    _c.sent();
                    return [2 /*return*/, { deleted: true }];
            }
        });
    }); }),
});
