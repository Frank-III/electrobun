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
exports.skillsRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var gray_matter_1 = require("gray-matter");
/**
 * Parse SKILL.md frontmatter to extract name and description
 */
function parseSkillMd(content) {
    try {
        var data = (0, gray_matter_1.default)(content).data;
        return {
            name: typeof data.name === "string" ? data.name : undefined,
            description: typeof data.description === "string" ? data.description : undefined,
        };
    }
    catch (err) {
        console.error("[skills] Failed to parse frontmatter:", err);
        return {};
    }
}
/**
 * Scan a directory for SKILL.md files
 */
function scanSkillsDirectory(dir, source, basePath) {
    return __awaiter(this, void 0, void 0, function () {
        var skills, _a, entries, _i, entries_1, entry, skillMdPath, content, parsed, displayPath, homeDir, err_1, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    skills = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 14, , 15]);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.access(dir)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, skills];
                case 5: return [4 /*yield*/, fs.readdir(dir, { withFileTypes: true })];
                case 6:
                    entries = _b.sent();
                    _i = 0, entries_1 = entries;
                    _b.label = 7;
                case 7:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 13];
                    entry = entries_1[_i];
                    if (!entry.isDirectory())
                        return [3 /*break*/, 12];
                    // Validate entry name for security (prevent path traversal)
                    if (entry.name.includes("..") || entry.name.includes("/") || entry.name.includes("\\")) {
                        console.warn("[skills] Skipping invalid directory name: ".concat(entry.name));
                        return [3 /*break*/, 12];
                    }
                    skillMdPath = path.join(dir, entry.name, "SKILL.md");
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 11, , 12]);
                    return [4 /*yield*/, fs.access(skillMdPath)];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, fs.readFile(skillMdPath, "utf-8")];
                case 10:
                    content = _b.sent();
                    parsed = parseSkillMd(content);
                    displayPath = void 0;
                    if (source === "project" && basePath) {
                        displayPath = path.relative(basePath, skillMdPath);
                    }
                    else {
                        homeDir = os.homedir();
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
                    err_1 = _b.sent();
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 7];
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_2 = _b.sent();
                    console.error("[skills] Failed to scan directory ".concat(dir, ":"), err_2);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/, skills];
            }
        });
    });
}
// Shared procedure for listing skills
var listSkillsProcedure = index_1.publicProcedure
    .input(zod_1.z
    .object({
    cwd: zod_1.z.string().optional(),
})
    .optional())
    .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var userSkillsDir, userSkillsPromise, projectSkillsPromise, projectSkillsDir, _c, userSkills, projectSkills;
    var input = _b.input;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                userSkillsDir = path.join(os.homedir(), ".claude", "skills");
                userSkillsPromise = scanSkillsDirectory(userSkillsDir, "user");
                projectSkillsPromise = Promise.resolve([]);
                if (input === null || input === void 0 ? void 0 : input.cwd) {
                    projectSkillsDir = path.join(input.cwd, ".claude", "skills");
                    projectSkillsPromise = scanSkillsDirectory(projectSkillsDir, "project", input.cwd);
                }
                return [4 /*yield*/, Promise.all([
                        userSkillsPromise,
                        projectSkillsPromise,
                    ])];
            case 1:
                _c = _d.sent(), userSkills = _c[0], projectSkills = _c[1];
                return [2 /*return*/, __spreadArray(__spreadArray([], projectSkills, true), userSkills, true)];
        }
    });
}); });
exports.skillsRouter = (0, index_1.router)({
    /**
     * List all skills from filesystem
     * - User skills: ~/.claude/skills/
     * - Project skills: .claude/skills/ (relative to cwd)
     */
    list: listSkillsProcedure,
    /**
     * Alias for list - used by @ mention
     */
    listEnabled: listSkillsProcedure,
});
