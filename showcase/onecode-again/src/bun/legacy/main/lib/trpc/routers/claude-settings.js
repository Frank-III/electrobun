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
exports.claudeSettingsRouter = void 0;
var fs = require("fs/promises");
var path = require("path");
var os = require("os");
var zod_1 = require("zod");
var index_1 = require("../index");
var CLAUDE_SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");
/**
 * Read Claude settings.json file
 * Returns empty object if file doesn't exist
 */
function readClaudeSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.readFile(CLAUDE_SETTINGS_PATH, "utf-8")];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 2:
                    error_1 = _a.sent();
                    // File doesn't exist or is invalid JSON
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write Claude settings.json file
 * Creates the .claude directory if it doesn't exist
 */
function writeClaudeSettings(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var dir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = path.dirname(CLAUDE_SETTINGS_PATH);
                    return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.claudeSettingsRouter = (0, index_1.router)({
    /**
     * Get the includeCoAuthoredBy setting
     * Returns true if setting is not explicitly set to false
     */
    getIncludeCoAuthoredBy: index_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readClaudeSettings()
                    // Default is true (include co-authored-by)
                    // Only return false if explicitly set to false
                ];
                case 1:
                    settings = _a.sent();
                    // Default is true (include co-authored-by)
                    // Only return false if explicitly set to false
                    return [2 /*return*/, settings.includeCoAuthoredBy !== false];
            }
        });
    }); }),
    /**
     * Set the includeCoAuthoredBy setting
     */
    setIncludeCoAuthoredBy: index_1.publicProcedure
        .input(zod_1.z.object({ enabled: zod_1.z.boolean() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var settings;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, readClaudeSettings()];
                case 1:
                    settings = _c.sent();
                    if (input.enabled) {
                        // Remove the setting to use default (true)
                        delete settings.includeCoAuthoredBy;
                    }
                    else {
                        // Explicitly set to false to disable
                        settings.includeCoAuthoredBy = false;
                    }
                    return [4 /*yield*/, writeClaudeSettings(settings)];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
