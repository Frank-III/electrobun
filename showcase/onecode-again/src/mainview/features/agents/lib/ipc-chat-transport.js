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
exports.IPCChatTransport = void 0;
var Sentry = require("@sentry/electron/renderer");
var solid_sonner_1 = require("solid-sonner");
var atoms_1 = require("../../../lib/atoms");
var jotai_store_1 = require("../../../lib/jotai-store");
var trpc_1 = require("../../../lib/trpc");
var atoms_2 = require("../atoms");
var sub_chat_store_1 = require("../stores/sub-chat-store");
// Error categories and their user-friendly messages
var ERROR_TOAST_CONFIG = {
    AUTH_FAILED_SDK: {
        title: "Not logged in",
        description: "Run 'claude login' in your terminal to authenticate",
        action: {
            label: "Copy command",
            onClick: function () { return navigator.clipboard.writeText("claude login"); },
        },
    },
    INVALID_API_KEY_SDK: {
        title: "Invalid API key",
        description: "Your Claude API key is invalid. Check your CLI configuration.",
    },
    INVALID_API_KEY: {
        title: "Invalid API key",
        description: "Your Claude API key is invalid. Check your CLI configuration.",
    },
    RATE_LIMIT_SDK: {
        title: "Session limit reached",
        description: "You've hit the Claude Code usage limit.",
        action: {
            label: "View usage",
            onClick: function () {
                return trpc_1.trpcClient.external.openExternal.mutate("https://claude.ai/settings/usage");
            },
        },
    },
    RATE_LIMIT: {
        title: "Session limit reached",
        description: "You've hit the Claude Code usage limit.",
        action: {
            label: "View usage",
            onClick: function () {
                return trpc_1.trpcClient.external.openExternal.mutate("https://claude.ai/settings/usage");
            },
        },
    },
    OVERLOADED_SDK: {
        title: "Claude is busy",
        description: "The service is overloaded. Please try again in a few moments.",
    },
    PROCESS_CRASH: {
        title: "Claude crashed",
        description: "The Claude process exited unexpectedly. Try sending your message again or rollback.",
    },
    SESSION_EXPIRED: {
        title: "Session expired",
        description: "Your previous chat session expired. Send your message again to start fresh.",
    },
    EXECUTABLE_NOT_FOUND: {
        title: "Claude CLI not found",
        description: "Install Claude Code CLI: npm install -g @anthropic-ai/claude-code",
        action: {
            label: "Copy command",
            onClick: function () {
                return navigator.clipboard.writeText("npm install -g @anthropic-ai/claude-code");
            },
        },
    },
    NETWORK_ERROR: {
        title: "Network error",
        description: "Check your internet connection and try again.",
    },
    AUTH_FAILURE: {
        title: "Authentication failed",
        description: "Your session may have expired. Try logging in again.",
    },
    USAGE_POLICY_VIOLATION: {
        title: "Request declined",
        // description will be set from chunk.errorText which contains the full API error message
        description: "",
    },
    // SDK_ERROR and other unknown errors use chunk.errorText for description
};
var IPCChatTransport = /** @class */ (function () {
    function IPCChatTransport(config) {
        this.config = config;
    }
    IPCChatTransport.prototype.sendMessages = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var lastUser, prompt, images, lastAssistant, sessionId, thinkingEnabled, maxThinkingTokens, historyEnabled, selectedModelId, modelString, storedCustomConfig, customConfig, selectedOllamaModel, showOfflineFeatures, autoOfflineMode, offlineModeEnabled, currentMode, subId, chunkCount, lastChunkType;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                lastUser = __spreadArray([], options.messages, true).reverse()
                    .find(function (m) { return m.role === "user"; });
                prompt = this.extractText(lastUser);
                images = this.extractImages(lastUser);
                lastAssistant = __spreadArray([], options.messages, true).reverse()
                    .find(function (m) { return m.role === "assistant"; });
                sessionId = (_a = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.metadata) === null || _a === void 0 ? void 0 : _a.sessionId;
                thinkingEnabled = jotai_store_1.appStore.get(atoms_1.extendedThinkingEnabledAtom);
                maxThinkingTokens = thinkingEnabled ? 32000 : undefined;
                historyEnabled = jotai_store_1.appStore.get(atoms_1.historyEnabledAtom);
                selectedModelId = jotai_store_1.appStore.get(atoms_2.lastSelectedModelIdAtom);
                modelString = atoms_2.MODEL_ID_MAP[selectedModelId];
                storedCustomConfig = jotai_store_1.appStore.get(atoms_1.customClaudeConfigAtom);
                customConfig = (0, atoms_1.normalizeCustomClaudeConfig)(storedCustomConfig);
                selectedOllamaModel = jotai_store_1.appStore.get(atoms_1.selectedOllamaModelAtom);
                showOfflineFeatures = jotai_store_1.appStore.get(atoms_1.showOfflineModeFeaturesAtom);
                autoOfflineMode = jotai_store_1.appStore.get(atoms_1.autoOfflineModeAtom);
                offlineModeEnabled = showOfflineFeatures && autoOfflineMode;
                currentMode = ((_b = sub_chat_store_1.useAgentSubChatStore
                    .getState()
                    .allSubChats.find(function (subChat) { return subChat.id === _this.config.subChatId; })) === null || _b === void 0 ? void 0 : _b.mode) || this.config.mode;
                subId = this.config.subChatId.slice(-8);
                chunkCount = 0;
                lastChunkType = "";
                console.log("[SD] R:START sub=".concat(subId, " cwd=").concat(this.config.cwd, " projectPath=").concat(this.config.projectPath || "(not set)", " customConfig=").concat(customConfig ? "set" : "not set"));
                return [2 /*return*/, new ReadableStream({
                        start: function (controller) {
                            var _a;
                            var sub = trpc_1.trpcClient.claude.chat.subscribe(__assign(__assign(__assign(__assign(__assign(__assign({ subChatId: _this.config.subChatId, chatId: _this.config.chatId, prompt: prompt, cwd: _this.config.cwd, projectPath: _this.config.projectPath, mode: currentMode, sessionId: sessionId }, (maxThinkingTokens && { maxThinkingTokens: maxThinkingTokens })), (modelString && { model: modelString })), (customConfig && { customConfig: customConfig })), (selectedOllamaModel && { selectedOllamaModel: selectedOllamaModel })), { historyEnabled: historyEnabled, offlineModeEnabled: offlineModeEnabled }), (images.length > 0 && { images: images })), {
                                onData: function (chunk) {
                                    var _a, _b, _c;
                                    chunkCount++;
                                    lastChunkType = chunk.type;
                                    // Handle AskUserQuestion - show question UI
                                    if (chunk.type === "ask-user-question") {
                                        var currentMap = jotai_store_1.appStore.get(atoms_2.pendingUserQuestionsAtom);
                                        var newMap = new Map(currentMap);
                                        newMap.set(_this.config.subChatId, {
                                            subChatId: _this.config.subChatId,
                                            parentChatId: _this.config.chatId,
                                            toolUseId: chunk.toolUseId,
                                            questions: chunk.questions,
                                        });
                                        jotai_store_1.appStore.set(atoms_2.pendingUserQuestionsAtom, newMap);
                                    }
                                    // Handle AskUserQuestion timeout - clear pending question immediately
                                    if (chunk.type === "ask-user-question-timeout") {
                                        var currentMap = jotai_store_1.appStore.get(atoms_2.pendingUserQuestionsAtom);
                                        var pending = currentMap.get(_this.config.subChatId);
                                        if (pending && pending.toolUseId === chunk.toolUseId) {
                                            var newMap = new Map(currentMap);
                                            newMap.delete(_this.config.subChatId);
                                            jotai_store_1.appStore.set(atoms_2.pendingUserQuestionsAtom, newMap);
                                        }
                                    }
                                    // Handle AskUserQuestion result - store for real-time updates
                                    if (chunk.type === "ask-user-question-result") {
                                        var currentResults = jotai_store_1.appStore.get(atoms_2.askUserQuestionResultsAtom);
                                        var newResults = new Map(currentResults);
                                        newResults.set(chunk.toolUseId, chunk.result);
                                        jotai_store_1.appStore.set(atoms_2.askUserQuestionResultsAtom, newResults);
                                    }
                                    // Handle compacting status - track in atom for UI display
                                    if (chunk.type === "system-Compact") {
                                        var compacting = jotai_store_1.appStore.get(atoms_2.compactingSubChatsAtom);
                                        var newCompacting = new Set(compacting);
                                        if (chunk.state === "input-streaming") {
                                            // Compacting started
                                            newCompacting.add(_this.config.subChatId);
                                        }
                                        else {
                                            // Compacting finished (output-available)
                                            newCompacting.delete(_this.config.subChatId);
                                        }
                                        jotai_store_1.appStore.set(atoms_2.compactingSubChatsAtom, newCompacting);
                                    }
                                    // Handle session init - store MCP servers, plugins, tools info
                                    if (chunk.type === "session-init") {
                                        console.log("[MCP] Received session-init:", {
                                            tools: (_a = chunk.tools) === null || _a === void 0 ? void 0 : _a.length,
                                            mcpServers: chunk.mcpServers,
                                            plugins: chunk.plugins,
                                            skills: (_b = chunk.skills) === null || _b === void 0 ? void 0 : _b.length,
                                            // Debug: show all tools to check for MCP tools (format: mcp__servername__toolname)
                                            allTools: chunk.tools,
                                        });
                                        jotai_store_1.appStore.set(atoms_1.sessionInfoAtom, {
                                            tools: chunk.tools,
                                            mcpServers: chunk.mcpServers,
                                            plugins: chunk.plugins,
                                            skills: chunk.skills,
                                        });
                                    }
                                    // Clear pending questions ONLY when agent has moved on
                                    // Don't clear on tool-input-* chunks (still building the question input)
                                    // Clear when we get tool-output-* (answer received) or text-delta (agent moved on)
                                    var shouldClearOnChunk = chunk.type !== "ask-user-question" &&
                                        chunk.type !== "ask-user-question-timeout" &&
                                        chunk.type !== "ask-user-question-result" &&
                                        !chunk.type.startsWith("tool-input") && // Don't clear while input is being built
                                        chunk.type !== "start" &&
                                        chunk.type !== "start-step";
                                    if (shouldClearOnChunk) {
                                        var currentMap = jotai_store_1.appStore.get(atoms_2.pendingUserQuestionsAtom);
                                        if (currentMap.has(_this.config.subChatId)) {
                                            var newMap = new Map(currentMap);
                                            newMap.delete(_this.config.subChatId);
                                            jotai_store_1.appStore.set(atoms_2.pendingUserQuestionsAtom, newMap);
                                        }
                                    }
                                    // Handle authentication errors - show Claude login modal
                                    if (chunk.type === "auth-error") {
                                        // Store the failed message for retry after successful auth
                                        // readyToRetry=false prevents immediate retry - modal sets it to true on OAuth success
                                        jotai_store_1.appStore.set(atoms_2.pendingAuthRetryMessageAtom, __assign(__assign({ subChatId: _this.config.subChatId, prompt: prompt }, (images.length > 0 && { images: images })), { readyToRetry: false }));
                                        // Show the Claude Code login modal
                                        jotai_store_1.appStore.set(atoms_1.agentsLoginModalOpenAtom, true);
                                        // Use controller.error() instead of controller.close() so that
                                        // the SDK Chat properly resets status from "streaming" to "ready"
                                        // This allows user to retry sending messages after failed auth
                                        console.log("[SD] R:AUTH_ERR sub=".concat(subId));
                                        controller.error(new Error("Authentication required"));
                                        return;
                                    }
                                    // Handle errors - show toast to user FIRST before anything else
                                    if (chunk.type === "error") {
                                        var category = ((_c = chunk.debugInfo) === null || _c === void 0 ? void 0 : _c.category) || "UNKNOWN";
                                        // Detailed SDK error logging for debugging
                                        console.error("[SDK ERROR] ========================================");
                                        console.error("[SDK ERROR] Category: ".concat(category));
                                        console.error("[SDK ERROR] Error text: ".concat(chunk.errorText));
                                        console.error("[SDK ERROR] Chat ID: ".concat(_this.config.chatId));
                                        console.error("[SDK ERROR] SubChat ID: ".concat(_this.config.subChatId));
                                        console.error("[SDK ERROR] CWD: ".concat(_this.config.cwd));
                                        console.error("[SDK ERROR] Mode: ".concat(currentMode));
                                        if (chunk.debugInfo) {
                                            console.error("[SDK ERROR] Debug info:", JSON.stringify(chunk.debugInfo, null, 2));
                                        }
                                        console.error("[SDK ERROR] Full chunk:", JSON.stringify(chunk, null, 2));
                                        console.error("[SDK ERROR] ========================================");
                                        // Track error in Sentry
                                        Sentry.captureException(new Error(chunk.errorText || "Claude transport error"), {
                                            tags: {
                                                errorCategory: category,
                                                mode: currentMode,
                                            },
                                            extra: {
                                                debugInfo: chunk.debugInfo,
                                                cwd: _this.config.cwd,
                                                chatId: _this.config.chatId,
                                                subChatId: _this.config.subChatId,
                                            },
                                        });
                                        // Build detailed error string for copying (available for ALL errors)
                                        var errorDetails_1 = [
                                            "Error: ".concat(chunk.errorText || "Unknown error"),
                                            "Category: ".concat(category),
                                            "Chat ID: ".concat(_this.config.chatId),
                                            "SubChat ID: ".concat(_this.config.subChatId),
                                            "CWD: ".concat(_this.config.cwd),
                                            "Mode: ".concat(currentMode),
                                            "Timestamp: ".concat(new Date().toISOString()),
                                            chunk.debugInfo ? "Debug Info: ".concat(JSON.stringify(chunk.debugInfo, null, 2)) : null,
                                        ].filter(Boolean).join("\n");
                                        // Show toast based on error category
                                        var config = ERROR_TOAST_CONFIG[category];
                                        var title = (config === null || config === void 0 ? void 0 : config.title) || "Claude error";
                                        // Use config description if set, otherwise fall back to errorText
                                        var rawDescription = (config === null || config === void 0 ? void 0 : config.description) || chunk.errorText || "An unexpected error occurred";
                                        // Truncate long descriptions for toast (keep first 300 chars)
                                        var description = rawDescription.length > 300
                                            ? rawDescription.slice(0, 300) + "..."
                                            : rawDescription;
                                        solid_sonner_1.toast.error(title, {
                                            description: description,
                                            duration: 12000,
                                            action: {
                                                label: "Copy Error",
                                                onClick: function () {
                                                    navigator.clipboard.writeText(errorDetails_1);
                                                    solid_sonner_1.toast.success("Error details copied to clipboard");
                                                },
                                            },
                                        });
                                    }
                                    // Try to enqueue, but don't crash if stream is already closed
                                    try {
                                        controller.enqueue(chunk);
                                    }
                                    catch (e) {
                                        // CRITICAL: Log when enqueue fails - this could explain missing chunks!
                                        console.log("[SD] R:ENQUEUE_ERR sub=".concat(subId, " type=").concat(chunk.type, " n=").concat(chunkCount, " err=").concat(e));
                                    }
                                    if (chunk.type === "finish") {
                                        console.log("[SD] R:FINISH sub=".concat(subId, " n=").concat(chunkCount));
                                        try {
                                            controller.close();
                                        }
                                        catch (_d) {
                                            // Already closed
                                        }
                                    }
                                },
                                onError: function (err) {
                                    console.log("[SD] R:ERROR sub=".concat(subId, " n=").concat(chunkCount, " last=").concat(lastChunkType, " err=").concat(err.message));
                                    // Track transport errors in Sentry
                                    Sentry.captureException(err, {
                                        tags: {
                                            errorCategory: "TRANSPORT_ERROR",
                                            mode: currentMode,
                                        },
                                        extra: {
                                            cwd: _this.config.cwd,
                                            chatId: _this.config.chatId,
                                            subChatId: _this.config.subChatId,
                                        },
                                    });
                                    controller.error(err);
                                },
                                onComplete: function () {
                                    console.log("[SD] R:COMPLETE sub=".concat(subId, " n=").concat(chunkCount, " last=").concat(lastChunkType));
                                    // Note: Don't clear pending questions here - let active-chat.tsx handle it
                                    // via the stream stop detection effect. Clearing here causes race conditions
                                    // where sync effect immediately restores from messages.
                                    try {
                                        controller.close();
                                    }
                                    catch (_a) {
                                        // Already closed
                                    }
                                },
                            });
                            // Handle abort
                            (_a = options.abortSignal) === null || _a === void 0 ? void 0 : _a.addEventListener("abort", function () {
                                console.log("[SD] R:ABORT sub=".concat(subId, " n=").concat(chunkCount, " last=").concat(lastChunkType));
                                sub.unsubscribe();
                                trpc_1.trpcClient.claude.cancel.mutate({ subChatId: _this.config.subChatId });
                                try {
                                    controller.close();
                                }
                                catch (_a) {
                                    // Already closed
                                }
                            });
                        },
                    })];
            });
        });
    };
    IPCChatTransport.prototype.reconnectToStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null]; // Not needed for local app
            });
        });
    };
    IPCChatTransport.prototype.extractText = function (msg) {
        var _a;
        if (!msg)
            return "";
        if (msg.parts) {
            var textParts = [];
            var fileContents = [];
            for (var _i = 0, _b = msg.parts; _i < _b.length; _i++) {
                var p = _b[_i];
                var partType = p.type;
                if (partType === "text" && p.text) {
                    textParts.push(p.text);
                }
                else if (partType === "file-content") {
                    // Hidden file content - add to prompt but not displayed in UI
                    var fc = p;
                    var fileName = ((_a = fc.filePath) === null || _a === void 0 ? void 0 : _a.split("/").pop()) || fc.filePath || "file";
                    fileContents.push("\n--- ".concat(fileName, " ---\n").concat(fc.content));
                }
            }
            // Combine text and file contents
            return textParts.join("\n") + fileContents.join("");
        }
        return "";
    };
    /**
     * Extract images from message parts
     * Looks for parts with type "data-image" that have base64Data
     */
    IPCChatTransport.prototype.extractImages = function (msg) {
        if (!msg || !msg.parts)
            return [];
        var images = [];
        for (var _i = 0, _a = msg.parts; _i < _a.length; _i++) {
            var part = _a[_i];
            // Check for data-image parts with base64 data
            if (part.type === "data-image" && part.data) {
                var data = part.data;
                if (data.base64Data && data.mediaType) {
                    images.push({
                        base64Data: data.base64Data,
                        mediaType: data.mediaType,
                        filename: data.filename,
                    });
                }
            }
        }
        return images;
    };
    return IPCChatTransport;
}());
exports.IPCChatTransport = IPCChatTransport;
