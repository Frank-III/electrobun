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
exports.createAgentsHandlers = createAgentsHandlers;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
exports.VALID_AGENT_MODELS = ["sonnet", "opus", "haiku", "inherit"];
function parseFrontmatterValue(value) {
    var trimmed = value.trim();
    if (!trimmed)
        return "";
    if (trimmed.includes(",")) {
        return trimmed
            .split(",")
            .map(function (item) { return item.trim(); })
            .filter(Boolean);
    }
    return trimmed;
}
function parseFrontmatter(content) {
    var _a, _b;
    var trimmed = content.trimStart();
    if (!trimmed.startsWith("---")) {
        return {};
    }
    var endIndex = trimmed.indexOf("\n---", 3);
    if (endIndex === -1) {
        return {};
    }
    var lines = trimmed.slice(3, endIndex).trim().split("\n");
    var data = {};
    for (var i = 0; i < lines.length; i += 1) {
        var line = (_a = lines[i]) === null || _a === void 0 ? void 0 : _a.trim();
        if (!line)
            continue;
        var separatorIndex = line.indexOf(":");
        if (separatorIndex === -1)
            continue;
        var key = line.slice(0, separatorIndex).trim();
        var rawValue = line.slice(separatorIndex + 1).trim();
        if (rawValue.length === 0) {
            var values = [];
            var j = i + 1;
            for (; j < lines.length; j += 1) {
                var nextLine = (_b = lines[j]) === null || _b === void 0 ? void 0 : _b.trim();
                if (!nextLine)
                    continue;
                if (!nextLine.startsWith("-"))
                    break;
                values.push(nextLine.replace(/^-/, "").trim());
            }
            i = j - 1;
            if (key === "tools")
                data.tools = values;
            if (key === "disallowedTools")
                data.disallowedTools = values;
            continue;
        }
        var value = parseFrontmatterValue(rawValue);
        if (key === "name" && typeof value === "string") {
            data.name = value;
        }
        else if (key === "description" && typeof value === "string") {
            data.description = value;
        }
        else if (key === "tools") {
            data.tools = Array.isArray(value) ? value : value ? [value] : [];
        }
        else if (key === "disallowedTools") {
            data.disallowedTools = Array.isArray(value) ? value : value ? [value] : [];
        }
        else if (key === "model" && typeof value === "string" && exports.VALID_AGENT_MODELS.includes(value)) {
            data.model = value;
        }
    }
    return data;
}
function stripFrontmatter(content) {
    var trimmed = content.trimStart();
    if (!trimmed.startsWith("---")) {
        return content.trim();
    }
    var endIndex = trimmed.indexOf("\n---", 3);
    if (endIndex === -1) {
        return content.trim();
    }
    return trimmed.slice(endIndex + 4).trim();
}
function isValidEntryName(name) {
    return !name.includes("..") && !name.includes("/") && !name.includes("\\");
}
function normalizeAgentName(name) {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}
function buildAgentMarkdown(agent) {
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
function scanAgentsDirectory(dir, source, basePath) {
    return __awaiter(this, void 0, void 0, function () {
        var agents, entries, _i, entries_1, entry, agentPath, content, parsed, prompt_1, displayPath, homeDir, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    agents = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.access)(dir)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.readdir)(dir, { withFileTypes: true })];
                case 3:
                    entries = _a.sent();
                    _i = 0, entries_1 = entries;
                    _a.label = 4;
                case 4:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 9];
                    entry = entries_1[_i];
                    if (entry.name.includes("..") ||
                        entry.name.includes("/") ||
                        entry.name.includes("\\")) {
                        return [3 /*break*/, 8];
                    }
                    if (!(entry.isFile() && entry.name.endsWith(".md"))) return [3 /*break*/, 8];
                    agentPath = (0, path_1.join)(dir, entry.name);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, Bun.file(agentPath).text()];
                case 6:
                    content = _a.sent();
                    parsed = parseFrontmatter(content);
                    prompt_1 = stripFrontmatter(content);
                    if (parsed.description && prompt_1) {
                        displayPath = void 0;
                        if (source === "project" && basePath) {
                            displayPath = (0, path_1.relative)(basePath, agentPath);
                        }
                        else {
                            homeDir = (0, os_1.homedir)();
                            displayPath = agentPath.startsWith(homeDir)
                                ? "~" + agentPath.slice(homeDir.length)
                                : agentPath;
                        }
                        agents.push({
                            name: parsed.name || entry.name.replace(".md", ""),
                            description: parsed.description,
                            prompt: prompt_1,
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
                    if (err_2.code !== "ENOENT") {
                        console.warn("[agents] Could not scan directory ".concat(dir, ":"), err_2);
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, agents];
            }
        });
    });
}
function createAgentsHandlers() {
    var _this = this;
    var listAgents = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (_a) {
            var userAgentsDir, userAgentsPromise, projectAgentsPromise, projectAgentsDir, _b, userAgents, projectAgents;
            var _c = _a === void 0 ? {} : _a, cwd = _c.cwd;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        userAgentsDir = (0, path_1.join)((0, os_1.homedir)(), ".claude", "agents");
                        userAgentsPromise = scanAgentsDirectory(userAgentsDir, "user");
                        projectAgentsPromise = Promise.resolve([]);
                        if (cwd) {
                            projectAgentsDir = (0, path_1.join)(cwd, ".claude", "agents");
                            projectAgentsPromise = scanAgentsDirectory(projectAgentsDir, "project", cwd);
                        }
                        return [4 /*yield*/, Promise.all([
                                userAgentsPromise,
                                projectAgentsPromise,
                            ])];
                    case 1:
                        _b = _d.sent(), userAgents = _b[0], projectAgents = _b[1];
                        return [2 /*return*/, __spreadArray(__spreadArray([], projectAgents, true), userAgents, true)];
                }
            });
        });
    };
    return {
        agentsList: listAgents,
        agentsListEnabled: listAgents,
        agentsGet: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var locations, _i, locations_1, _c, dir, source, agentPath, content, parsed, prompt_2, _d;
            var name = _b.name, cwd = _b.cwd;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        locations = __spreadArray([
                            { dir: (0, path_1.join)((0, os_1.homedir)(), ".claude", "agents"), source: "user" }
                        ], (cwd ? [{ dir: (0, path_1.join)(cwd, ".claude", "agents"), source: "project" }] : []), true);
                        _i = 0, locations_1 = locations;
                        _e.label = 1;
                    case 1:
                        if (!(_i < locations_1.length)) return [3 /*break*/, 6];
                        _c = locations_1[_i], dir = _c.dir, source = _c.source;
                        agentPath = (0, path_1.join)(dir, "".concat(name, ".md"));
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, Bun.file(agentPath).text()];
                    case 3:
                        content = _e.sent();
                        parsed = parseFrontmatter(content);
                        prompt_2 = stripFrontmatter(content);
                        return [2 /*return*/, {
                                name: parsed.name || name,
                                description: parsed.description || "",
                                prompt: prompt_2,
                                tools: parsed.tools,
                                disallowedTools: parsed.disallowedTools,
                                model: parsed.model,
                                source: source,
                                path: agentPath,
                            }];
                    case 4:
                        _d = _e.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, null];
                }
            });
        }); },
        agentsCreate: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var safeName, targetDir, agentPath, err_3, content;
            var name = _b.name, description = _b.description, prompt = _b.prompt, tools = _b.tools, disallowedTools = _b.disallowedTools, model = _b.model, source = _b.source, cwd = _b.cwd;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        safeName = normalizeAgentName(name);
                        if (!safeName || safeName.includes("..")) {
                            throw new Error("Invalid agent name");
                        }
                        if (source === "project") {
                            if (!cwd) {
                                throw new Error("Project path (cwd) required for project agents");
                            }
                            targetDir = (0, path_1.join)(cwd, ".claude", "agents");
                        }
                        else {
                            targetDir = (0, path_1.join)((0, os_1.homedir)(), ".claude", "agents");
                        }
                        return [4 /*yield*/, (0, promises_1.mkdir)(targetDir, { recursive: true })];
                    case 1:
                        _c.sent();
                        agentPath = (0, path_1.join)(targetDir, "".concat(safeName, ".md"));
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, promises_1.access)(agentPath)];
                    case 3:
                        _c.sent();
                        throw new Error("Agent \"".concat(safeName, "\" already exists"));
                    case 4:
                        err_3 = _c.sent();
                        if (err_3.code !== "ENOENT") {
                            throw err_3;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        content = buildAgentMarkdown({
                            name: safeName,
                            description: description,
                            prompt: prompt,
                            tools: tools,
                            disallowedTools: disallowedTools,
                            model: model,
                        });
                        return [4 /*yield*/, Bun.write(agentPath, content)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/, { name: safeName, path: agentPath, source: source }];
                }
            });
        }); },
        agentsUpdate: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var safeOriginalName, safeName, targetDir, originalPath, newPath, _c, err_4, content;
            var originalName = _b.originalName, name = _b.name, description = _b.description, prompt = _b.prompt, tools = _b.tools, disallowedTools = _b.disallowedTools, model = _b.model, source = _b.source, cwd = _b.cwd;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        safeOriginalName = normalizeAgentName(originalName);
                        safeName = normalizeAgentName(name);
                        if (!safeOriginalName || !safeName || safeName.includes("..")) {
                            throw new Error("Invalid agent name");
                        }
                        if (source === "project") {
                            if (!cwd) {
                                throw new Error("Project path (cwd) required for project agents");
                            }
                            targetDir = (0, path_1.join)(cwd, ".claude", "agents");
                        }
                        else {
                            targetDir = (0, path_1.join)((0, os_1.homedir)(), ".claude", "agents");
                        }
                        originalPath = (0, path_1.join)(targetDir, "".concat(safeOriginalName, ".md"));
                        newPath = (0, path_1.join)(targetDir, "".concat(safeName, ".md"));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, promises_1.access)(originalPath)];
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
                        return [4 /*yield*/, (0, promises_1.access)(newPath)];
                    case 6:
                        _d.sent();
                        throw new Error("Agent \"".concat(safeName, "\" already exists"));
                    case 7:
                        err_4 = _d.sent();
                        if (err_4.code !== "ENOENT") {
                            throw err_4;
                        }
                        return [3 /*break*/, 8];
                    case 8:
                        content = buildAgentMarkdown({
                            name: safeName,
                            description: description,
                            prompt: prompt,
                            tools: tools,
                            disallowedTools: disallowedTools,
                            model: model,
                        });
                        if (!(safeOriginalName !== safeName)) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, promises_1.unlink)(originalPath)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [4 /*yield*/, Bun.write(newPath, content)];
                    case 11:
                        _d.sent();
                        return [2 /*return*/, { name: safeName, path: newPath, source: source }];
                }
            });
        }); },
        agentsDelete: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var safeName, targetDir, agentPath;
            var name = _b.name, source = _b.source, cwd = _b.cwd;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        safeName = normalizeAgentName(name);
                        if (!safeName || safeName.includes("..")) {
                            throw new Error("Invalid agent name");
                        }
                        if (source === "project") {
                            if (!cwd) {
                                throw new Error("Project path (cwd) required for project agents");
                            }
                            targetDir = (0, path_1.join)(cwd, ".claude", "agents");
                        }
                        else {
                            targetDir = (0, path_1.join)((0, os_1.homedir)(), ".claude", "agents");
                        }
                        agentPath = (0, path_1.join)(targetDir, "".concat(safeName, ".md"));
                        return [4 /*yield*/, (0, promises_1.unlink)(agentPath)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { deleted: true }];
                }
            });
        }); },
    };
}
