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
exports.createSkillsHandlers = createSkillsHandlers;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
function parseFrontmatter(content) {
    var trimmed = content.trimStart();
    if (!trimmed.startsWith("---")) {
        return {};
    }
    var endIndex = trimmed.indexOf("\n---", 3);
    if (endIndex === -1) {
        return {};
    }
    var frontmatter = trimmed.slice(3, endIndex).trim();
    var data = {};
    for (var _i = 0, _a = frontmatter.split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        var separatorIndex = line.indexOf(":");
        if (separatorIndex === -1)
            continue;
        var key = line.slice(0, separatorIndex).trim();
        var value = line.slice(separatorIndex + 1).trim();
        if (key === "name") {
            data.name = value;
        }
        else if (key === "description") {
            data.description = value;
        }
    }
    return data;
}
function isValidEntryName(name) {
    return !name.includes("..") && !name.includes("/") && !name.includes("\\");
}
function scanSkillsDirectory(dir, source, basePath) {
    return __awaiter(this, void 0, void 0, function () {
        var skills, _a, entries, _i, entries_1, entry, skillMdPath, content, parsed, displayPath, homeDir, _b, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    skills = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 14, , 15]);
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.access)(dir)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [2 /*return*/, skills];
                case 5: return [4 /*yield*/, (0, promises_1.readdir)(dir, { withFileTypes: true })];
                case 6:
                    entries = _c.sent();
                    _i = 0, entries_1 = entries;
                    _c.label = 7;
                case 7:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 13];
                    entry = entries_1[_i];
                    if (!entry.isDirectory())
                        return [3 /*break*/, 12];
                    if (!isValidEntryName(entry.name)) {
                        console.warn("[skills] Skipping invalid directory name: ".concat(entry.name));
                        return [3 /*break*/, 12];
                    }
                    skillMdPath = (0, path_1.join)(dir, entry.name, "SKILL.md");
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.access)(skillMdPath)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, Bun.file(skillMdPath).text()];
                case 10:
                    content = _c.sent();
                    parsed = parseFrontmatter(content);
                    displayPath = void 0;
                    if (source === "project" && basePath) {
                        displayPath = (0, path_1.relative)(basePath, skillMdPath);
                    }
                    else {
                        homeDir = (0, os_1.homedir)();
                        displayPath = skillMdPath.startsWith(homeDir)
                            ? "~" + skillMdPath.slice(homeDir.length)
                            : skillMdPath;
                    }
                    skills.push({
                        name: parsed.name || entry.name,
                        description: parsed.description || "",
                        source: source,
                        path: displayPath,
                    });
                    return [3 /*break*/, 12];
                case 11:
                    _b = _c.sent();
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 7];
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_1 = _c.sent();
                    console.error("[skills] Failed to scan directory ".concat(dir, ":"), err_1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/, skills];
            }
        });
    });
}
function createSkillsHandlers() {
    var _this = this;
    var listSkills = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (_a) {
            var userSkillsDir, userSkillsPromise, projectSkillsPromise, projectSkillsDir, _b, userSkills, projectSkills;
            var _c = _a === void 0 ? {} : _a, cwd = _c.cwd;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        userSkillsDir = (0, path_1.join)((0, os_1.homedir)(), ".claude", "skills");
                        userSkillsPromise = scanSkillsDirectory(userSkillsDir, "user");
                        projectSkillsPromise = Promise.resolve([]);
                        if (cwd) {
                            projectSkillsDir = (0, path_1.join)(cwd, ".claude", "skills");
                            projectSkillsPromise = scanSkillsDirectory(projectSkillsDir, "project", cwd);
                        }
                        return [4 /*yield*/, Promise.all([
                                userSkillsPromise,
                                projectSkillsPromise,
                            ])];
                    case 1:
                        _b = _d.sent(), userSkills = _b[0], projectSkills = _b[1];
                        return [2 /*return*/, __spreadArray(__spreadArray([], projectSkills, true), userSkills, true)];
                }
            });
        });
    };
    return {
        skillsList: listSkills,
        skillsListEnabled: listSkills,
    };
}
