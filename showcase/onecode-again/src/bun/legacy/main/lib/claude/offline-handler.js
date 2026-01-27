"use strict";
/**
 * Offline mode handler - auto-fallback to Ollama when internet is unavailable
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
exports.checkOfflineFallback = checkOfflineFallback;
var ollama_1 = require("../ollama");
/**
 * Check if we should use Ollama as fallback
 * Priority:
 * 1. If customConfig provided → use it
 * 2. If offline mode enabled AND no internet → use Ollama
 * 3. If online + auth → use Claude API
 *
 * @param customConfig - Custom config from user settings
 * @param claudeCodeToken - Claude Code auth token
 * @param selectedOllamaModel - User-selected Ollama model (optional)
 * @param offlineModeEnabled - Whether offline mode is enabled in settings
 */
function checkOfflineFallback(customConfig_1, claudeCodeToken_1, selectedOllamaModel_1) {
    return __awaiter(this, arguments, void 0, function (customConfig, claudeCodeToken, selectedOllamaModel, offlineModeEnabled) {
        var isUsingOllama, hasInternet, ollamaStatus, modelToUse, config;
        if (offlineModeEnabled === void 0) { offlineModeEnabled = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If custom config is provided, use it (highest priority)
                    if (customConfig) {
                        isUsingOllama = customConfig.baseUrl.includes('localhost:11434');
                        return [2 /*return*/, {
                                config: customConfig,
                                isUsingOllama: isUsingOllama,
                            }];
                    }
                    // If offline mode is disabled in settings, skip all Ollama checks
                    // and just use Claude API (will fail with auth error if no token)
                    if (!offlineModeEnabled) {
                        return [2 /*return*/, {
                                config: undefined,
                                isUsingOllama: false,
                            }];
                    }
                    // Check internet FIRST - if offline, use Ollama regardless of auth
                    console.log('[Offline] Checking internet connectivity...');
                    return [4 /*yield*/, (0, ollama_1.checkInternetConnection)()];
                case 1:
                    hasInternet = _a.sent();
                    console.log("[Offline] Internet check result: ".concat(hasInternet ? 'ONLINE' : 'OFFLINE'));
                    if (!!hasInternet) return [3 /*break*/, 3];
                    // No internet - try Ollama
                    console.log('[Offline] No internet connection, checking Ollama...');
                    return [4 /*yield*/, (0, ollama_1.checkOllamaStatus)()];
                case 2:
                    ollamaStatus = _a.sent();
                    if (!ollamaStatus.available) {
                        return [2 /*return*/, {
                                config: undefined,
                                isUsingOllama: false,
                                error: 'No internet connection and Ollama is not available. Please install Ollama or connect to internet.',
                            }];
                    }
                    if (!ollamaStatus.recommendedModel) {
                        return [2 /*return*/, {
                                config: undefined,
                                isUsingOllama: false,
                                error: 'Ollama is running but no suitable model found. Please install a coding model like qwen2.5-coder:7b',
                            }];
                    }
                    // Use Ollama with selected model or recommended model
                    console.log("[Offline] selectedOllamaModel param: ".concat(selectedOllamaModel || "(null/undefined)", ", recommendedModel: ").concat(ollamaStatus.recommendedModel));
                    modelToUse = selectedOllamaModel || ollamaStatus.recommendedModel;
                    config = (0, ollama_1.getOllamaConfig)(modelToUse);
                    console.log("[Offline] Switching to Ollama (model: ".concat(modelToUse, ")"));
                    return [2 /*return*/, {
                            config: config,
                            isUsingOllama: true,
                        }];
                case 3:
                    // Internet is available - use Claude API with auth
                    if (claudeCodeToken) {
                        console.log('[Offline] Online with Claude auth - using Claude API');
                        return [2 /*return*/, {
                                config: undefined,
                                isUsingOllama: false,
                            }];
                    }
                    // Internet available but no auth - let it fail with auth error
                    console.log('[Offline] Online but no Claude auth found');
                    return [2 /*return*/, {
                            config: undefined,
                            isUsingOllama: false,
                        }];
            }
        });
    });
}
