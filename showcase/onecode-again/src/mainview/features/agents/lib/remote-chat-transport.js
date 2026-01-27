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
exports.RemoteChatTransport = void 0;
var solid_sonner_1 = require("solid-sonner");
// Cache the API base URL (fetched once from main process)
var cachedApiBase = null;
function getApiBase() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!cachedApiBase) return [3 /*break*/, 2];
                    return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getApiBaseUrl())];
                case 1:
                    // Uses MAIN_VITE_API_URL in dev, "https://21st.dev" in production
                    cachedApiBase = (_b.sent()) || "https://21st.dev";
                    _b.label = 2;
                case 2: return [2 /*return*/, cachedApiBase];
            }
        });
    });
}
/**
 * Generate a unique stream ID for IPC communication
 */
function generateStreamId() {
    return "stream_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 9));
}
/**
 * Remote chat transport for sandbox chats
 * Uses IPC streaming to communicate with the web backend (bypasses CORS)
 */
var RemoteChatTransport = /** @class */ (function () {
    function RemoteChatTransport(config) {
        this.config = config;
    }
    RemoteChatTransport.prototype.sendMessages = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var streamId, subId, headers, stream, apiBase, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.streamFetch)) {
                            console.error("[RemoteTransport] Desktop API not available");
                            solid_sonner_1.toast.error("Desktop API not available", {
                                description: "Please restart the application",
                            });
                            throw new Error("Desktop API not available");
                        }
                        streamId = generateStreamId();
                        subId = this.config.subChatId.slice(-8);
                        console.log("[RemoteTransport] START", {
                            streamId: streamId,
                            subId: subId,
                            chatId: this.config.chatId,
                            sandboxUrl: this.config.sandboxUrl,
                            mode: this.config.mode,
                            model: this.config.model || "default",
                            messageCount: options.messages.length,
                        });
                        headers = {
                            "sandbox-url": this.config.sandboxUrl,
                            "parent-chat-id": this.config.chatId,
                            "sub-chat-id": this.config.subChatId,
                            "sub-chat-name": encodeURIComponent(this.config.subChatName),
                            "sub-chat-mode": this.config.mode,
                        };
                        if (this.config.model) {
                            headers["x-model"] = this.config.model;
                        }
                        stream = this.createIPCStream(streamId, subId, options.abortSignal);
                        return [4 /*yield*/, getApiBase()
                            // Start the streaming fetch via IPC
                        ];
                    case 1:
                        apiBase = _b.sent();
                        return [4 /*yield*/, window.desktopApi.streamFetch(streamId, "".concat(apiBase, "/api/agents/chat"), {
                                method: "POST",
                                headers: headers,
                                body: JSON.stringify({
                                    id: this.config.subChatId,
                                    messages: options.messages,
                                }),
                            })];
                    case 2:
                        result = _b.sent();
                        console.log("[RemoteTransport] Stream fetch started", {
                            streamId: streamId,
                            subId: subId,
                            ok: result.ok,
                            status: result.status,
                        });
                        if (!result.ok) {
                            console.error("[RemoteTransport] ERROR", { subId: subId, status: result.status, error: result.error });
                            if (result.status === 401) {
                                solid_sonner_1.toast.error("Authentication failed", {
                                    description: "Please sign in again",
                                });
                                throw new Error("Authentication required");
                            }
                            if (result.status === 403) {
                                solid_sonner_1.toast.error("Usage limit reached", {
                                    description: "You've hit your sandbox usage limit",
                                });
                                throw new Error("Usage limit reached");
                            }
                            solid_sonner_1.toast.error("Request failed", {
                                description: result.error || "Server returned ".concat(result.status),
                            });
                            throw new Error("Remote chat failed: ".concat(result.status));
                        }
                        return [2 /*return*/, stream];
                }
            });
        });
    };
    /**
     * Create a ReadableStream that receives chunks from IPC events
     */
    RemoteChatTransport.prototype.createIPCStream = function (streamId, subId, abortSignal) {
        var _this = this;
        var decoder = new TextDecoder();
        var buffer = "";
        var chunkCount = 0;
        var cleanupChunk = null;
        var cleanupDone = null;
        var cleanupError = null;
        var resolveNext = null;
        var rejectNext = null;
        var pendingChunks = [];
        var streamDone = false;
        var streamError = null;
        // Process raw bytes into SSE chunks
        var processBytes = function (bytes) {
            buffer += decoder.decode(bytes, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                if (line.startsWith("data: ")) {
                    var data = line.slice(6).trim();
                    if (data === "[DONE]") {
                        console.log("[RemoteTransport] FINISH sub=".concat(subId, " chunks=").concat(chunkCount));
                        streamDone = true;
                        if (resolveNext) {
                            resolveNext({ done: true });
                            resolveNext = null;
                        }
                        return;
                    }
                    try {
                        var chunk = JSON.parse(data);
                        chunkCount++;
                        if (chunkCount <= 3) {
                            console.log("[RemoteTransport] Chunk #".concat(chunkCount), {
                                subId: subId,
                                type: chunk.type,
                                preview: JSON.stringify(chunk).slice(0, 200),
                            });
                        }
                        if (resolveNext) {
                            resolveNext({ done: false, chunk: chunk });
                            resolveNext = null;
                        }
                        else {
                            pendingChunks.push(chunk);
                        }
                    }
                    catch (parseErr) {
                        console.warn("[RemoteTransport] Failed to parse chunk", { subId: subId, data: data.slice(0, 100) });
                    }
                }
            }
        };
        // Set up IPC listeners
        cleanupChunk = window.desktopApi.onStreamChunk(streamId, processBytes);
        cleanupDone = window.desktopApi.onStreamDone(streamId, function () {
            console.log("[RemoteTransport] DONE sub=".concat(subId, " chunks=").concat(chunkCount));
            streamDone = true;
            if (resolveNext) {
                resolveNext({ done: true });
                resolveNext = null;
            }
        });
        cleanupError = window.desktopApi.onStreamError(streamId, function (error) {
            console.error("[RemoteTransport] Stream error sub=".concat(subId, ":"), error);
            streamError = new Error(error);
            if (rejectNext) {
                rejectNext(streamError);
                rejectNext = null;
            }
        });
        // Handle abort
        if (abortSignal) {
            abortSignal.addEventListener("abort", function () {
                console.log("[RemoteTransport] ABORT sub=".concat(subId, " chunks=").concat(chunkCount));
                streamDone = true;
                cleanup();
            });
        }
        var cleanup = function () {
            cleanupChunk === null || cleanupChunk === void 0 ? void 0 : cleanupChunk();
            cleanupDone === null || cleanupDone === void 0 ? void 0 : cleanupDone();
            cleanupError === null || cleanupError === void 0 ? void 0 : cleanupError();
        };
        return new ReadableStream({
            pull: function (controller) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Check if we have pending chunks
                            if (pendingChunks.length > 0) {
                                controller.enqueue(pendingChunks.shift());
                                return [2 /*return*/];
                            }
                            // Check if stream is done
                            if (streamDone) {
                                cleanup();
                                controller.close();
                                return [2 /*return*/];
                            }
                            // Check for error
                            if (streamError) {
                                cleanup();
                                controller.error(streamError);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    resolveNext = resolve;
                                    rejectNext = reject;
                                })];
                        case 1:
                            result = _a.sent();
                            if (result.done) {
                                cleanup();
                                controller.close();
                            }
                            else if (result.chunk) {
                                controller.enqueue(result.chunk);
                            }
                            return [2 /*return*/];
                    }
                });
            }); },
            cancel: function () {
                console.log("[RemoteTransport] CANCEL sub=".concat(subId, " chunks=").concat(chunkCount));
                cleanup();
            },
        });
    };
    RemoteChatTransport.prototype.reconnectToStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement stream reconnection using stream_id from sub-chat
                return [2 /*return*/, null];
            });
        });
    };
    return RemoteChatTransport;
}());
exports.RemoteChatTransport = RemoteChatTransport;
