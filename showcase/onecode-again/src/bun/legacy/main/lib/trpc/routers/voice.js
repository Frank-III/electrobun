"use strict";
/**
 * Voice TRPC router
 * Provides voice-to-text transcription using OpenAI Whisper API
 *
 * For authenticated users (with subscription): uses 21st.dev backend
 * For open-source users: requires OPENAI_API_KEY in environment
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
exports.voiceRouter = void 0;
exports.setUserOpenAIKey = setUserOpenAIKey;
exports.clearPlanCache = clearPlanCache;
exports.clearOpenAIKeyCache = clearOpenAIKeyCache;
var node_child_process_1 = require("node:child_process");
var node_os_1 = require("node:os");
var zod_1 = require("zod");
var index_1 = require("../index");
var config_1 = require("../../config");
var auth_manager_1 = require("../../../auth-manager");
// Max audio size: 25MB (Whisper API limit)
var MAX_AUDIO_SIZE = 25 * 1024 * 1024;
// API request timeout: 30 seconds
var API_TIMEOUT_MS = 30000;
/**
 * Clean up transcribed text
 * - Remove leading/trailing whitespace
 * - Collapse multiple spaces/newlines into single space
 * - Remove any weird unicode whitespace characters
 * - Remove zero-width characters and other invisible unicode
 */
function cleanTranscribedText(text) {
    return (text
        // Remove zero-width and invisible characters
        .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "")
        // Normalize unicode whitespace to regular space
        .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
        // Replace all types of newlines and line breaks with space
        .replace(/[\r\n\u2028\u2029]+/g, " ")
        // Replace tabs with space
        .replace(/\t+/g, " ")
        // Collapse multiple spaces into one
        .replace(/ +/g, " ")
        // Trim leading/trailing whitespace
        .trim());
}
// Cache for OpenAI API key
var cachedOpenAIKey = undefined;
// User-configured OpenAI API key (from settings, set via IPC)
var userConfiguredOpenAIKey = null;
/**
 * Set OpenAI API key from user settings
 * Called from renderer via tRPC
 */
function setUserOpenAIKey(key) {
    userConfiguredOpenAIKey = (key === null || key === void 0 ? void 0 : key.trim()) || null;
    // Clear env cache so next call re-evaluates
    cachedOpenAIKey = undefined;
}
// Cache for user plan (to avoid repeated API calls)
var cachedUserPlan = null;
var PLAN_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
/**
 * Fetch and cache user's subscription plan
 */
function getUserPlan() {
    return __awaiter(this, void 0, void 0, function () {
        var authManager, planData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authManager = (0, auth_manager_1.getAuthManager)();
                    if (!(authManager === null || authManager === void 0 ? void 0 : authManager.isAuthenticated())) {
                        return [2 /*return*/, null];
                    }
                    // Return cached plan if still fresh
                    if (cachedUserPlan && Date.now() - cachedUserPlan.fetchedAt < PLAN_CACHE_TTL_MS) {
                        return [2 /*return*/, { plan: cachedUserPlan.plan, status: cachedUserPlan.status }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, authManager.fetchUserPlan()];
                case 2:
                    planData = _a.sent();
                    if (planData) {
                        cachedUserPlan = {
                            plan: planData.plan,
                            status: planData.status,
                            fetchedAt: Date.now(),
                        };
                        return [2 /*return*/, { plan: planData.plan, status: planData.status }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("[Voice] Failed to fetch user plan:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Check if user has paid subscription (onecode_pro or onecode_max with active status)
 */
function hasPaidSubscription() {
    return __awaiter(this, void 0, void 0, function () {
        var planData, paidPlans;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUserPlan()];
                case 1:
                    planData = _a.sent();
                    if (!planData)
                        return [2 /*return*/, false];
                    paidPlans = ["onecode_pro", "onecode_max"];
                    return [2 /*return*/, paidPlans.includes(planData.plan) && planData.status === "active"];
            }
        });
    });
}
/**
 * Clear plan cache (for testing or when subscription changes)
 */
function clearPlanCache() {
    cachedUserPlan = null;
}
/**
 * Get OpenAI API key from multiple sources (priority order):
 * 1. User-configured key from settings
 * 2. Vite env vars (.env.local files)
 * 3. process.env
 * 4. Shell environment
 */
function getOpenAIApiKey() {
    // First check user-configured key (highest priority, not cached)
    if (userConfiguredOpenAIKey && userConfiguredOpenAIKey.startsWith("sk-")) {
        return userConfiguredOpenAIKey;
    }
    // Return cached value if already fetched from env
    if (cachedOpenAIKey !== undefined) {
        return cachedOpenAIKey;
    }
    // Check Vite env vars (works with .env.local files)
    var viteKey = import.meta.env
        .MAIN_VITE_OPENAI_API_KEY;
    if (viteKey) {
        cachedOpenAIKey = viteKey;
        console.log("[Voice] Using OPENAI_API_KEY from Vite env (MAIN_VITE_OPENAI_API_KEY)");
        return cachedOpenAIKey;
    }
    // Check process.env (works in dev mode)
    if (process.env.OPENAI_API_KEY) {
        cachedOpenAIKey = process.env.OPENAI_API_KEY;
        console.log("[Voice] Using OPENAI_API_KEY from process.env");
        return cachedOpenAIKey;
    }
    // Try to get from shell environment (for production builds)
    try {
        var shell = process.env.SHELL || "/bin/zsh";
        var result = (0, node_child_process_1.execSync)("".concat(shell, " -ilc 'echo $OPENAI_API_KEY'"), {
            encoding: "utf8",
            timeout: 5000,
            env: {
                HOME: node_os_1.default.homedir(),
                USER: node_os_1.default.userInfo().username,
                SHELL: shell,
            },
        });
        var key = result.trim();
        if (key && key !== "$OPENAI_API_KEY" && key.startsWith("sk-")) {
            cachedOpenAIKey = key;
            console.log("[Voice] Using OPENAI_API_KEY from shell environment");
            return cachedOpenAIKey;
        }
    }
    catch (err) {
        console.error("[Voice] Failed to read OPENAI_API_KEY from shell:", err);
    }
    cachedOpenAIKey = null;
    return null;
}
/**
 * Clear cached API key (for testing)
 */
function clearOpenAIKeyCache() {
    cachedOpenAIKey = undefined;
}
/**
 * Transcribe audio using 21st.dev backend (for authenticated users)
 */
function transcribeViaBackend(audioBuffer, format, language) {
    return __awaiter(this, void 0, void 0, function () {
        var authManager, token, apiUrl, formData, uint8Array, blob, controller, timeoutId, response, errorText, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authManager = (0, auth_manager_1.getAuthManager)();
                    if (!authManager) {
                        throw new Error("Auth manager not initialized");
                    }
                    return [4 /*yield*/, authManager.getValidToken()];
                case 1:
                    token = _a.sent();
                    if (!token) {
                        throw new Error("Not authenticated");
                    }
                    apiUrl = (0, config_1.getApiUrl)();
                    formData = new FormData();
                    uint8Array = new Uint8Array(audioBuffer);
                    blob = new Blob([uint8Array], { type: "audio/".concat(format) });
                    formData.append("file", blob, "audio.".concat(format));
                    if (language) {
                        formData.append("language", language);
                    }
                    controller = new AbortController();
                    timeoutId = setTimeout(function () { return controller.abort(); }, API_TIMEOUT_MS);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, 8, 9]);
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/api/voice/transcribe"), {
                            method: "POST",
                            headers: {
                                "X-Desktop-Token": token,
                            },
                            body: formData,
                            signal: controller.signal,
                        })];
                case 3:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.text()];
                case 4:
                    errorText = _a.sent();
                    console.error("[Voice] Backend API error:", response.status, errorText);
                    if (response.status === 401) {
                        throw new Error("Authentication expired. Please sign in again.");
                    }
                    else if (response.status === 403) {
                        throw new Error("Voice transcription requires a paid subscription.");
                    }
                    else if (response.status === 429) {
                        throw new Error("Rate limit exceeded. Please try again later.");
                    }
                    else if (response.status >= 500) {
                        throw new Error("Service temporarily unavailable");
                    }
                    throw new Error("Transcription failed (".concat(response.status, ")"));
                case 5: return [4 /*yield*/, response.json()];
                case 6:
                    data = _a.sent();
                    return [2 /*return*/, cleanTranscribedText(data.text || "")];
                case 7:
                    err_2 = _a.sent();
                    if (err_2 instanceof Error && err_2.name === "AbortError") {
                        throw new Error("Transcription timed out. Please try again.");
                    }
                    throw err_2;
                case 8:
                    clearTimeout(timeoutId);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Transcribe audio using OpenAI Whisper API directly (for open-source users)
 */
function transcribeWithWhisper(audioBuffer, format, language) {
    return __awaiter(this, void 0, void 0, function () {
        var key, formData, uint8Array, blob, controller, timeoutId, response, errorText, text, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = getOpenAIApiKey();
                    if (!key) {
                        throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY environment variable.");
                    }
                    // Check audio size limit
                    if (audioBuffer.length > MAX_AUDIO_SIZE) {
                        throw new Error("Audio too large (".concat(Math.round(audioBuffer.length / 1024 / 1024), "MB). Maximum is 25MB."));
                    }
                    formData = new FormData();
                    uint8Array = new Uint8Array(audioBuffer);
                    blob = new Blob([uint8Array], { type: "audio/".concat(format) });
                    formData.append("file", blob, "audio.".concat(format));
                    formData.append("model", "whisper-1");
                    formData.append("response_format", "text");
                    if (language) {
                        formData.append("language", language);
                    }
                    controller = new AbortController();
                    timeoutId = setTimeout(function () { return controller.abort(); }, API_TIMEOUT_MS);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("https://api.openai.com/v1/audio/transcriptions", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer ".concat(key),
                            },
                            body: formData,
                            signal: controller.signal,
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorText = _a.sent();
                    console.error("[Voice] Whisper API error:", response.status, errorText);
                    // Provide user-friendly error messages
                    if (response.status === 401) {
                        throw new Error("Invalid OpenAI API key");
                    }
                    else if (response.status === 429) {
                        throw new Error("Rate limit exceeded. Please try again later.");
                    }
                    else if (response.status >= 500) {
                        throw new Error("OpenAI service temporarily unavailable");
                    }
                    throw new Error("Transcription failed (".concat(response.status, ")"));
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    text = _a.sent();
                    return [2 /*return*/, cleanTranscribedText(text)];
                case 6:
                    err_3 = _a.sent();
                    if (err_3 instanceof Error && err_3.name === "AbortError") {
                        throw new Error("Transcription timed out. Please try again.");
                    }
                    throw err_3;
                case 7:
                    clearTimeout(timeoutId);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.voiceRouter = (0, index_1.router)({
    /**
     * Transcribe audio to text
     * Priority: local OPENAI_API_KEY first, then backend for authenticated users
     */
    transcribe: index_1.publicProcedure
        .input(zod_1.z.object({
        audio: zod_1.z.string(), // base64 encoded audio
        format: zod_1.z.enum(["webm", "wav", "mp3", "m4a", "ogg"]).default("webm"),
        language: zod_1.z.string().optional(), // ISO 639-1 code (e.g., "en", "ru")
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var audioBuffer, hasLocalKey, text, authManager, isAuthenticated, text;
        var _c;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    audioBuffer = Buffer.from(input.audio, "base64");
                    console.log("[Voice] Transcribing ".concat(audioBuffer.length, " bytes of ").concat(input.format, " audio"));
                    // Check audio size limit
                    if (audioBuffer.length > MAX_AUDIO_SIZE) {
                        throw new Error("Audio too large (".concat(Math.round(audioBuffer.length / 1024 / 1024), "MB). Maximum is 25MB."));
                    }
                    hasLocalKey = !!getOpenAIApiKey();
                    if (!hasLocalKey) return [3 /*break*/, 2];
                    return [4 /*yield*/, transcribeWithWhisper(audioBuffer, input.format, input.language)];
                case 1:
                    text = _d.sent();
                    console.log("[Voice] Local transcription result: \"".concat(text.slice(0, 100), "...\""));
                    return [2 /*return*/, { text: text }];
                case 2:
                    authManager = (0, auth_manager_1.getAuthManager)();
                    isAuthenticated = (_c = authManager === null || authManager === void 0 ? void 0 : authManager.isAuthenticated()) !== null && _c !== void 0 ? _c : false;
                    if (!isAuthenticated) return [3 /*break*/, 4];
                    return [4 /*yield*/, transcribeViaBackend(audioBuffer, input.format, input.language)];
                case 3:
                    text = _d.sent();
                    console.log("[Voice] Backend transcription result: \"".concat(text.slice(0, 100), "...\""));
                    return [2 /*return*/, { text: text }];
                case 4: 
                // No local key and not authenticated
                throw new Error("Voice input requires signing in or setting OPENAI_API_KEY environment variable");
            }
        });
    }); }),
    /**
     * Check if voice transcription is available
     * Available if: has local OPENAI_API_KEY OR user has paid subscription
     */
    isAvailable: index_1.publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var hasLocalKey, hasPaid, authManager, isAuthenticated;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    hasLocalKey = !!getOpenAIApiKey();
                    // Local API key always works
                    if (hasLocalKey) {
                        return [2 /*return*/, {
                                available: true,
                                method: "local",
                                reason: undefined,
                            }];
                    }
                    return [4 /*yield*/, hasPaidSubscription()];
                case 1:
                    hasPaid = _b.sent();
                    if (hasPaid) {
                        return [2 /*return*/, {
                                available: true,
                                method: "backend",
                                reason: undefined,
                            }];
                    }
                    authManager = (0, auth_manager_1.getAuthManager)();
                    isAuthenticated = (_a = authManager === null || authManager === void 0 ? void 0 : authManager.isAuthenticated()) !== null && _a !== void 0 ? _a : false;
                    if (isAuthenticated) {
                        return [2 /*return*/, {
                                available: false,
                                method: null,
                                reason: "Voice input requires a paid subscription or OpenAI API key",
                            }];
                    }
                    return [2 /*return*/, {
                            available: false,
                            method: null,
                            reason: "Add your OpenAI API key in Settings > Models, or sign in with a paid subscription",
                        }];
            }
        });
    }); }),
    /**
     * Set OpenAI API key from user settings
     * This allows users without a paid subscription to use their own API key
     */
    setOpenAIKey: index_1.publicProcedure
        .input(zod_1.z.object({ key: zod_1.z.string() }))
        .mutation(function (_a) {
        var input = _a.input;
        var key = input.key.trim();
        // Validate key format if provided
        if (key && !key.startsWith("sk-")) {
            throw new Error("Invalid OpenAI API key format. Key should start with 'sk-'");
        }
        setUserOpenAIKey(key || null);
        // Clear plan cache so isAvailable re-evaluates
        clearPlanCache();
        return { success: true };
    }),
    /**
     * Check if user has configured an OpenAI API key
     */
    hasOpenAIKey: index_1.publicProcedure.query(function () {
        return { hasKey: !!getOpenAIApiKey() };
    }),
});
