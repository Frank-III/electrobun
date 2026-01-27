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
exports.VALID_AGENT_MODELS = void 0;
exports.parseAgentMd = parseAgentMd;
exports.generateAgentMd = generateAgentMd;
exports.loadAgent = loadAgent;
exports.scanAgentsDirectory = scanAgentsDirectory;
exports.clearAgentCache = clearAgentCache;
exports.buildAgentsOption = buildAgentsOption;
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var gray_matter_1 = require("gray-matter");
// Valid model values for agents
exports.VALID_AGENT_MODELS = ["sonnet", "opus", "haiku", "inherit"];
/**
 * Parse agent markdown file with YAML frontmatter
 * Format:
 * ---
 * name: code-reviewer
 * description: Reviews code for quality
 * tools: Read, Glob, Grep
 * model: sonnet
 * ---
 *
 * You are a code reviewer. When invoked...
 */
function parseAgentMd(content, filename) {
    try {
        var _a = (0, gray_matter_1.default)(content), data = _a.data, body = _a.content;
        // Parse tools - can be comma-separated string or array
        var tools = void 0;
        if (typeof data.tools === "string") {
            tools = data.tools
                .split(",")
                .map(function (t) { return t.trim(); })
                .filter(Boolean);
        }
        else if (Array.isArray(data.tools)) {
            tools = data.tools;
        }
        // Parse disallowedTools
        var disallowedTools = void 0;
        if (typeof data.disallowedTools === "string") {
            disallowedTools = data.disallowedTools
                .split(",")
                .map(function (t) { return t.trim(); })
                .filter(Boolean);
        }
        else if (Array.isArray(data.disallowedTools)) {
            disallowedTools = data.disallowedTools;
        }
        // Validate model
        var model = data.model && exports.VALID_AGENT_MODELS.includes(data.model)
            ? data.model
            : undefined;
        return {
            name: typeof data.name === "string" ? data.name : filename.replace(".md", ""),
            description: typeof data.description === "string" ? data.description : "",
            prompt: body.trim(),
            tools: tools,
            disallowedTools: disallowedTools,
            model: model,
        };
    }
    catch (err) {
        console.error("[agents] Failed to parse markdown:", err);
        return {};
    }
}
/**
 * Generate markdown content for agent file
 */
function generateAgentMd(agent) {
    var frontmatter = [];
    frontmatter.push("name: ".concat(agent.name));
    frontmatter.push("description: ".concat(agent.description));
    if (agent.tools && agent.tools.length > 0) {
        frontmatter.push("tools: ".concat(agent.tools.join(", ")));
    }
    if (agent.disallowedTools && agent.disallowedTools.length > 0) {
        frontmatter.push("disallowedTools: ".concat(agent.disallowedTools.join(", ")));
    }
    if (agent.model && agent.model !== "inherit") {
        frontmatter.push("model: ".concat(agent.model));
    }
    return "---\n".concat(frontmatter.join("\n"), "\n---\n\n").concat(agent.prompt);
}
/**
 * Load agent definition from filesystem by name
 * Searches in user (~/.claude/agents/) and project (.claude/agents/) directories
 */
function loadAgent(name, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var locations, _i, locations_1, dir, agentPath, content, parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    locations = __spreadArray([
                        path.join(os.homedir(), ".claude", "agents")
                    ], (cwd ? [path.join(cwd, ".claude", "agents")] : []), true);
                    _i = 0, locations_1 = locations;
                    _b.label = 1;
                case 1:
                    if (!(_i < locations_1.length)) return [3 /*break*/, 6];
                    dir = locations_1[_i];
                    agentPath = path.join(dir, "".concat(name, ".md"));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(agentPath, "utf-8")];
                case 3:
                    content = _b.sent();
                    parsed = parseAgentMd(content, "".concat(name, ".md"));
                    if (parsed.description && parsed.prompt) {
                        return [2 /*return*/, {
                                name: parsed.name || name,
                                description: parsed.description,
                                prompt: parsed.prompt,
                                tools: parsed.tools,
                                disallowedTools: parsed.disallowedTools,
                                model: parsed.model,
                            }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Scan directory for agent .md files
 * Format: .claude/agents/agent-name.md
 */
function scanAgentsDirectory(dir, source, basePath // For project agents, the cwd to make paths relative to
) {
    return __awaiter(this, void 0, void 0, function () {
        var agents, entries, _i, entries_1, entry, agentPath, content, parsed, displayPath, homeDir, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    agents = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, fs.access(dir)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.readdir(dir, { withFileTypes: true })];
                case 3:
                    entries = _a.sent();
                    _i = 0, entries_1 = entries;
                    _a.label = 4;
                case 4:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 9];
                    entry = entries_1[_i];
                    // Validate entry name for security (prevent path traversal)
                    if (entry.name.includes("..") ||
                        entry.name.includes("/") ||
                        entry.name.includes("\\")) {
                        console.warn("[agents] Skipping invalid filename: ".concat(entry.name));
                        return [3 /*break*/, 8];
                    }
                    if (!(entry.isFile() && entry.name.endsWith(".md"))) return [3 /*break*/, 8];
                    agentPath = path.join(dir, entry.name);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fs.readFile(agentPath, "utf-8")];
                case 6:
                    content = _a.sent();
                    parsed = parseAgentMd(content, entry.name);
                    if (parsed.description && parsed.prompt) {
                        displayPath = void 0;
                        if (source === "project" && basePath) {
                            displayPath = path.relative(basePath, agentPath);
                        }
                        else {
                            homeDir = os.homedir();
                            displayPath = agentPath.startsWith(homeDir)
                                ? "~" + agentPath.slice(homeDir.length)
                                : agentPath;
                        }
                        agents.push({
                            name: parsed.name || entry.name.replace(".md", ""),
                            description: parsed.description,
                            prompt: parsed.prompt,
                            tools: parsed.tools,
                            disallowedTools: parsed.disallowedTools,
                            model: parsed.model,
                            source: source,
                            path: displayPath,
                        });
                    }
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    console.error("[agents] Failed to read agent ".concat(entry.name, ":"), err_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_2 = _a.sent();
                    // Directory doesn't exist or not accessible
                    if (err_2.code !== "ENOENT") {
                        console.warn("[agents] Could not scan directory ".concat(dir, ":"), err_2);
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, agents];
            }
        });
    });
}
// Cache for loaded agents to avoid re-reading from disk
var agentCache = new Map();
/**
 * Clear the agent cache (for testing/debugging)
 */
function clearAgentCache() {
    agentCache.clear();
    console.log("[agents] Cache cleared");
}
/**
 * Build agents Record for SDK Options
 * This properly registers agents with the SDK so Claude can invoke them via Task tool
 * OPTIMIZATION: Caches loaded agents to avoid re-reading from disk
 */
function buildAgentsOption(agentNames, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var agents, _i, agentNames_1, name_1, cacheKey, agent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (agentNames.length === 0)
                        return [2 /*return*/, {}];
                    agents = {};
                    _i = 0, agentNames_1 = agentNames;
                    _a.label = 1;
                case 1:
                    if (!(_i < agentNames_1.length)) return [3 /*break*/, 6];
                    name_1 = agentNames_1[_i];
                    cacheKey = cwd ? "".concat(name_1, ":").concat(cwd) : name_1;
                    agent = agentCache.get(cacheKey);
                    if (!(agent === undefined)) return [3 /*break*/, 3];
                    // Not in cache, load from disk
                    console.log("[agents] Cache MISS for ".concat(name_1, " - loading from disk"));
                    return [4 /*yield*/, loadAgent(name_1, cwd)];
                case 2:
                    agent = _a.sent();
                    agentCache.set(cacheKey, agent);
                    return [3 /*break*/, 4];
                case 3:
                    console.log("[agents] Cache HIT for ".concat(name_1));
                    _a.label = 4;
                case 4:
                    if (agent) {
                        agents[name_1] = __assign(__assign({ description: agent.description, prompt: agent.prompt }, (agent.tools && { tools: agent.tools })), (agent.model && { model: agent.model }));
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, agents];
            }
        });
    });
}
