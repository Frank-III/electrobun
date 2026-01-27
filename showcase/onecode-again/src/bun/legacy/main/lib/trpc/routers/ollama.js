"use strict";
/**
 * Ollama TRPC router
 * Provides offline mode status and configuration
 */
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
exports.ollamaRouter = void 0;
var zod_1 = require("zod");
var ollama_1 = require("../../ollama");
var index_1 = require("../index");
/**
 * Generate text using local Ollama model
 * Used for chat title generation and commit messages in offline mode
 * @param prompt - The prompt to send to Ollama
 * @param model - Optional model to use (if not provided, uses recommended or first available)
 */
function generateWithOllama(prompt, model) {
    return __awaiter(this, void 0, void 0, function () {
        var ollamaStatus, modelToUse, response, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 1:
                    ollamaStatus = _b.sent();
                    if (!ollamaStatus.available) {
                        return [2 /*return*/, null];
                    }
                    modelToUse = model || ollamaStatus.recommendedModel || ollamaStatus.models[0];
                    if (!modelToUse) {
                        console.error("[Ollama] No model available");
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, fetch("http://localhost:11434/api/generate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                model: modelToUse,
                                prompt: prompt,
                                stream: false,
                                options: {
                                    temperature: 0.3,
                                    num_predict: 50, // Short responses for titles
                                },
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        console.error("[Ollama] Generate failed:", response.status);
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    return [2 /*return*/, ((_a = data.response) === null || _a === void 0 ? void 0 : _a.trim()) || null];
                case 4:
                    error_1 = _b.sent();
                    console.error("[Ollama] Generate error:", error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.ollamaRouter = (0, index_1.router)({
    /**
     * Get Ollama and network status
     */
    getStatus: index_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ollamaStatus, hasInternet;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        (0, ollama_1.checkOllamaStatus)(),
                        (0, ollama_1.checkInternetConnection)(),
                    ])];
                case 1:
                    _a = _b.sent(), ollamaStatus = _a[0], hasInternet = _a[1];
                    return [2 /*return*/, {
                            ollama: ollamaStatus,
                            internet: {
                                online: hasInternet,
                                checked: Date.now(),
                            },
                        }];
            }
        });
    }); }),
    /**
     * Check if offline mode is available
     */
    isOfflineModeAvailable: index_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var ollamaStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 1:
                    ollamaStatus = _a.sent();
                    return [2 /*return*/, {
                            available: ollamaStatus.available && !!ollamaStatus.recommendedModel,
                            model: ollamaStatus.recommendedModel,
                        }];
            }
        });
    }); }),
    /**
     * Get list of installed models
     */
    getModels: index_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var ollamaStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 1:
                    ollamaStatus = _a.sent();
                    return [2 /*return*/, {
                            available: ollamaStatus.available,
                            models: ollamaStatus.models,
                            recommendedModel: ollamaStatus.recommendedModel,
                        }];
            }
        });
    }); }),
    /**
     * Generate a chat name using local Ollama model
     * Used in offline mode for sub-chat title generation
     */
    generateChatName: index_1.publicProcedure
        .input(zod_1.z.object({ userMessage: zod_1.z.string(), model: zod_1.z.string().optional() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var prompt, result, cleaned;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prompt = "Generate a very short (2-5 words) title for a coding chat that starts with this message. Only output the title, nothing else. No quotes, no explanations.\n\nUser message: \"".concat(input.userMessage.slice(0, 500), "\"\n\nTitle:");
                    return [4 /*yield*/, generateWithOllama(prompt, input.model)];
                case 1:
                    result = _c.sent();
                    if (result) {
                        cleaned = result
                            .replace(/^["']|["']$/g, "")
                            .replace(/^title:\s*/i, "")
                            .trim()
                            .slice(0, 50);
                        if (cleaned.length > 0) {
                            return [2 /*return*/, { name: cleaned }];
                        }
                    }
                    return [2 /*return*/, { name: null }];
            }
        });
    }); }),
    /**
     * Generate a commit message using local Ollama model
     * Used in offline mode for commit message generation
     */
    generateCommitMessage: index_1.publicProcedure
        .input(zod_1.z.object({
        diff: zod_1.z.string(),
        fileCount: zod_1.z.number(),
        additions: zod_1.z.number(),
        deletions: zod_1.z.number(),
        model: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var prompt, result, firstLine;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    prompt = "Generate a conventional commit message for these changes. Use format: type: short description\n\nTypes: feat (new feature), fix (bug fix), docs, style, refactor, test, chore\n\nChanges: ".concat(input.fileCount, " files, +").concat(input.additions, "/-").concat(input.deletions, " lines\n\nDiff (truncated):\n").concat(input.diff.slice(0, 3000), "\n\nCommit message:");
                    return [4 /*yield*/, generateWithOllama(prompt, input.model)];
                case 1:
                    result = _d.sent();
                    if (result) {
                        firstLine = (_c = result.split("\n")[0]) === null || _c === void 0 ? void 0 : _c.trim();
                        if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
                            return [2 /*return*/, { message: firstLine }];
                        }
                    }
                    return [2 /*return*/, { message: null }];
            }
        });
    }); }),
});
