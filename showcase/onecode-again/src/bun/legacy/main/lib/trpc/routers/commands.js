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
exports.commandsRouter = void 0;
var zod_1 = require("zod");
var index_1 = require("../index");
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var gray_matter_1 = require("gray-matter");
/**
 * Parse command .md frontmatter to extract description and argument-hint
 */
function parseCommandMd(content) {
    try {
        var data = (0, gray_matter_1.default)(content).data;
        return {
            description: typeof data.description === "string" ? data.description : undefined,
            argumentHint: typeof data["argument-hint"] === "string"
                ? data["argument-hint"]
                : undefined,
        };
    }
    catch (err) {
        console.error("[commands] Failed to parse frontmatter:", err);
        return {};
    }
}
/**
 * Validate entry name for security (prevent path traversal)
 */
function isValidEntryName(name) {
    return !name.includes("..") && !name.includes("/") && !name.includes("\\");
}
/**
 * Recursively scan a directory for .md command files
 * Supports namespaces via nested folders: git/commit.md → git:commit
 */
function scanCommandsDirectory(dir_1, source_1) {
    return __awaiter(this, arguments, void 0, function (dir, source, prefix) {
        var commands, _a, entries, _i, entries_1, entry, fullPath, nestedCommands, baseName, commandName, content, parsed, err_1, err_2;
        if (prefix === void 0) { prefix = ""; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commands = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 15, , 16]);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.access(dir)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, commands];
                case 5: return [4 /*yield*/, fs.readdir(dir, { withFileTypes: true })];
                case 6:
                    entries = _b.sent();
                    _i = 0, entries_1 = entries;
                    _b.label = 7;
                case 7:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 14];
                    entry = entries_1[_i];
                    if (!isValidEntryName(entry.name)) {
                        console.warn("[commands] Skipping invalid entry name: ".concat(entry.name));
                        return [3 /*break*/, 13];
                    }
                    fullPath = path.join(dir, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 9];
                    return [4 /*yield*/, scanCommandsDirectory(fullPath, source, prefix ? "".concat(prefix, ":").concat(entry.name) : entry.name)];
                case 8:
                    nestedCommands = _b.sent();
                    commands.push.apply(commands, nestedCommands);
                    return [3 /*break*/, 13];
                case 9:
                    if (!(entry.isFile() && entry.name.endsWith(".md"))) return [3 /*break*/, 13];
                    baseName = entry.name.replace(/\.md$/, "");
                    commandName = prefix ? "".concat(prefix, ":").concat(baseName) : baseName;
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, fs.readFile(fullPath, "utf-8")];
                case 11:
                    content = _b.sent();
                    parsed = parseCommandMd(content);
                    commands.push({
                        name: commandName,
                        description: parsed.description || "",
                        argumentHint: parsed.argumentHint,
                        source: source,
                        path: fullPath,
                    });
                    return [3 /*break*/, 13];
                case 12:
                    err_1 = _b.sent();
                    console.warn("[commands] Failed to read ".concat(fullPath, ":"), err_1);
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 7];
                case 14: return [3 /*break*/, 16];
                case 15:
                    err_2 = _b.sent();
                    console.error("[commands] Failed to scan directory ".concat(dir, ":"), err_2);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/, commands];
            }
        });
    });
}
exports.commandsRouter = (0, index_1.router)({
    /**
     * List all commands from filesystem
     * - User commands: ~/.claude/commands/
     * - Project commands: .claude/commands/ (relative to projectPath)
     */
    list: index_1.publicProcedure
        .input(zod_1.z
        .object({
        projectPath: zod_1.z.string().optional(),
    })
        .optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userCommandsDir, userCommandsPromise, projectCommandsPromise, projectCommandsDir, _c, userCommands, projectCommands;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    userCommandsDir = path.join(os.homedir(), ".claude", "commands");
                    userCommandsPromise = scanCommandsDirectory(userCommandsDir, "user");
                    projectCommandsPromise = Promise.resolve([]);
                    if (input === null || input === void 0 ? void 0 : input.projectPath) {
                        projectCommandsDir = path.join(input.projectPath, ".claude", "commands");
                        projectCommandsPromise = scanCommandsDirectory(projectCommandsDir, "project");
                    }
                    return [4 /*yield*/, Promise.all([
                            userCommandsPromise,
                            projectCommandsPromise,
                        ])
                        // Project commands first (more specific), then user commands
                    ];
                case 1:
                    _c = _d.sent(), userCommands = _c[0], projectCommands = _c[1];
                    // Project commands first (more specific), then user commands
                    return [2 /*return*/, __spreadArray(__spreadArray([], projectCommands, true), userCommands, true)];
            }
        });
    }); }),
    /**
     * Get content of a specific command file (without frontmatter)
     */
    getContent: index_1.publicProcedure
        .input(zod_1.z.object({ path: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var content, body, err_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Security: prevent path traversal
                    if (input.path.includes("..")) {
                        throw new Error("Invalid path");
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(input.path, "utf-8")];
                case 2:
                    content = _c.sent();
                    body = (0, gray_matter_1.default)(content).content;
                    return [2 /*return*/, { content: body.trim() }];
                case 3:
                    err_3 = _c.sent();
                    console.error("[commands] Failed to read command content:", err_3);
                    return [2 /*return*/, { content: "" }];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
