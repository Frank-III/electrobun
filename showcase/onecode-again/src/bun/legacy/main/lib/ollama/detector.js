"use strict";
/**
 * Ollama detector and status checker
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
exports.checkOllamaStatus = checkOllamaStatus;
exports.getOllamaConfig = getOllamaConfig;
/**
 * Check if Ollama is running and get status
 */
function checkOllamaStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var controller_1, timeoutId, response, data, models_1, codingModels, recommendedModel, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    controller_1 = new AbortController();
                    timeoutId = setTimeout(function () { return controller_1.abort(); }, 2000);
                    return [4 /*yield*/, fetch('http://localhost:11434/api/tags', {
                            signal: controller_1.signal,
                        })];
                case 1:
                    response = _c.sent();
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        return [2 /*return*/, { available: false, models: [] }];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _c.sent();
                    models_1 = ((_b = data.models) === null || _b === void 0 ? void 0 : _b.map(function (m) { return m.name; })) || [];
                    codingModels = [
                        'qwen2.5-coder:7b',
                        'qwen2.5-coder:3b',
                        'qwen2.5-coder:1.5b',
                        'qwen3-coder:30b',
                        'qwen3-coder:14b',
                        'qwen3-coder:8b',
                        'qwen3-coder:4b',
                        'deepseek-coder:6.7b',
                        'deepseek-coder:33b',
                        'codestral:22b',
                    ];
                    recommendedModel = codingModels.find(function (m) { return models_1.includes(m); });
                    // If no exact match, try to find any qwen-coder, deepseek-coder, or codestral variant
                    if (!recommendedModel) {
                        recommendedModel = models_1.find(function (m) {
                            return m.includes('qwen') && m.includes('coder') ||
                                m.includes('deepseek') && m.includes('coder') ||
                                m.includes('codestral');
                        });
                    }
                    return [2 /*return*/, {
                            available: true,
                            models: models_1,
                            recommendedModel: recommendedModel || models_1[0], // Fallback to any model
                            version: data.version,
                        }];
                case 3:
                    _a = _c.sent();
                    // Ollama not available - no need to log, this is expected when offline mode is disabled
                    return [2 /*return*/, { available: false, models: [] }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get Ollama config for offline mode
 */
function getOllamaConfig(modelName) {
    return {
        model: modelName || 'qwen2.5-coder:7b',
        token: 'ollama',
        baseUrl: 'http://localhost:11434',
    };
}
