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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformer = createTransformer;
function createTransformer(options) {
    var emitSdkMessageUuid = (options === null || options === void 0 ? void 0 : options.emitSdkMessageUuid) === true;
    var isUsingOllama = (options === null || options === void 0 ? void 0 : options.isUsingOllama) === true;
    var textId = null;
    var textStarted = false;
    var started = false;
    var startTime = null;
    // Track streaming tool calls
    var currentToolCallId = null;
    var currentToolName = null;
    var accumulatedToolInput = "";
    // Track already emitted tool IDs to avoid duplicates
    // (tools can come via streaming AND in the final assistant message)
    var emittedToolIds = new Set();
    // Track the last text block ID for final response marking
    // This is used to identify when there's a "final text" response after tools
    var lastTextId = null;
    // Track parent tool context for nested tools (e.g., Explore agent)
    var currentParentToolUseId = null;
    // Map original toolCallId -> composite toolCallId (for tool-result matching)
    var toolIdMapping = new Map();
    // Track compacting system tool for matching status->boundary events
    var lastCompactId = null;
    var compactCounter = 0;
    // Track streaming thinking for Extended Thinking
    var currentThinkingId = null;
    var accumulatedThinking = "";
    var inThinkingBlock = false; // Track if we're currently in a thinking block
    // Helper to create composite toolCallId: "parentId:childId" or just "childId"
    var makeCompositeId = function (originalId, parentId) {
        if (parentId)
            return "".concat(parentId, ":").concat(originalId);
        return originalId;
    };
    var genId = function () { return "text-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 7)); };
    // Helper to end current text block
    function endTextBlock() {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(textStarted && textId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, { type: "text-end", id: textId }
                        // Track the last text ID for final response marking
                    ];
                case 1:
                    _a.sent();
                    // Track the last text ID for final response marking
                    lastTextId = textId;
                    textStarted = false;
                    textId = null;
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }
    // Helper to end current tool input
    function endToolInput() {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentToolCallId) return [3 /*break*/, 2];
                    // Track this tool ID to avoid duplicates from assistant message
                    emittedToolIds.add(currentToolCallId);
                    // Emit complete tool call with accumulated input
                    return [4 /*yield*/, {
                            type: "tool-input-available",
                            toolCallId: currentToolCallId,
                            toolName: currentToolName || "unknown",
                            input: accumulatedToolInput ? JSON.parse(accumulatedToolInput) : {},
                        }];
                case 1:
                    // Emit complete tool call with accumulated input
                    _a.sent();
                    currentToolCallId = null;
                    currentToolName = null;
                    accumulatedToolInput = "";
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }
    return function transform(msg) {
        var event_1, originalId, partialJson, thinkingText, _i, _a, block, wasStreamed, thinkingId, compositeId, _b, _c, block, compositeId, output, parsed, mcpServers, inputTokens, outputTokens, metadata;
        var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        return __generator(this, function (_6) {
            switch (_6.label) {
                case 0:
                    // Debug: log ALL message types to understand what SDK sends
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] MSG:", msg.type, msg.subtype || "", ((_d = msg.event) === null || _d === void 0 ? void 0 : _d.type) || "");
                        if (msg.type === "system") {
                            console.log("[Ollama Transform] SYSTEM message full:", JSON.stringify(msg, null, 2));
                        }
                        if (msg.type === "stream_event") {
                            console.log("[Ollama Transform] STREAM_EVENT:", (_e = msg.event) === null || _e === void 0 ? void 0 : _e.type, "content_block:", (_g = (_f = msg.event) === null || _f === void 0 ? void 0 : _f.content_block) === null || _g === void 0 ? void 0 : _g.type);
                        }
                        if (msg.type === "assistant") {
                            console.log("[Ollama Transform] ASSISTANT message, content blocks:", ((_j = (_h = msg.message) === null || _h === void 0 ? void 0 : _h.content) === null || _j === void 0 ? void 0 : _j.length) || 0);
                        }
                    }
                    else {
                        console.log("[transform] MSG:", msg.type, msg.subtype || "", ((_k = msg.event) === null || _k === void 0 ? void 0 : _k.type) || "");
                        if (msg.type === "system") {
                            console.log("[transform] SYSTEM message:", msg.subtype, msg);
                        }
                    }
                    // Track parent_tool_use_id for nested tools
                    // Only update when explicitly present (don't reset on messages without it)
                    if (msg.parent_tool_use_id !== undefined) {
                        currentParentToolUseId = msg.parent_tool_use_id;
                    }
                    if (!!started) return [3 /*break*/, 3];
                    started = true;
                    startTime = Date.now();
                    return [4 /*yield*/, { type: "start" }];
                case 1:
                    _6.sent();
                    return [4 /*yield*/, { type: "start-step" }];
                case 2:
                    _6.sent();
                    _6.label = 3;
                case 3:
                    // Reset thinking state on new message start to prevent memory leaks
                    if (msg.type === "stream_event" && ((_l = msg.event) === null || _l === void 0 ? void 0 : _l.type) === "message_start") {
                        currentThinkingId = null;
                        accumulatedThinking = "";
                        inThinkingBlock = false;
                    }
                    if (!(msg.type === "stream_event")) return [3 /*break*/, 29];
                    event_1 = msg.event;
                    console.log("[transform] stream_event:", event_1 === null || event_1 === void 0 ? void 0 : event_1.type, "delta:", (_m = event_1 === null || event_1 === void 0 ? void 0 : event_1.delta) === null || _m === void 0 ? void 0 : _m.type, "content_block_type:", (_o = event_1 === null || event_1 === void 0 ? void 0 : event_1.content_block) === null || _o === void 0 ? void 0 : _o.type);
                    // Debug: log full event when content_block_start but no type
                    if ((event_1 === null || event_1 === void 0 ? void 0 : event_1.type) === "content_block_start" && !((_p = event_1 === null || event_1 === void 0 ? void 0 : event_1.content_block) === null || _p === void 0 ? void 0 : _p.type)) {
                        console.log("[transform] WARNING: content_block_start with no type, full event:", JSON.stringify(event_1));
                    }
                    if (!event_1)
                        return [2 /*return*/];
                    if (!(event_1.type === "content_block_start" && ((_q = event_1.content_block) === null || _q === void 0 ? void 0 : _q.type) === "text")) return [3 /*break*/, 7];
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] ✓ TEXT BLOCK START - Model is generating text!");
                    }
                    else {
                        console.log("[transform] TEXT BLOCK START");
                    }
                    return [5 /*yield**/, __values(endTextBlock())];
                case 4:
                    _6.sent();
                    return [5 /*yield**/, __values(endToolInput())];
                case 5:
                    _6.sent();
                    textId = genId();
                    return [4 /*yield*/, { type: "text-start", id: textId }];
                case 6:
                    _6.sent();
                    textStarted = true;
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] textStarted set to TRUE, textId:", textId);
                    }
                    else {
                        console.log("[transform] textStarted set to TRUE, textId:", textId);
                    }
                    _6.label = 7;
                case 7:
                    if (!(event_1.type === "content_block_delta" && ((_r = event_1.delta) === null || _r === void 0 ? void 0 : _r.type) === "text_delta")) return [3 /*break*/, 12];
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] ✓ TEXT DELTA received, length:", (_s = event_1.delta.text) === null || _s === void 0 ? void 0 : _s.length, "preview:", (_t = event_1.delta.text) === null || _t === void 0 ? void 0 : _t.slice(0, 50));
                    }
                    else {
                        console.log("[transform] TEXT DELTA, textStarted:", textStarted, "delta:", (_u = event_1.delta.text) === null || _u === void 0 ? void 0 : _u.slice(0, 20));
                    }
                    if (!!textStarted) return [3 /*break*/, 10];
                    return [5 /*yield**/, __values(endToolInput())];
                case 8:
                    _6.sent();
                    textId = genId();
                    return [4 /*yield*/, { type: "text-start", id: textId }];
                case 9:
                    _6.sent();
                    textStarted = true;
                    _6.label = 10;
                case 10: return [4 /*yield*/, { type: "text-delta", id: textId, delta: event_1.delta.text || "" }];
                case 11:
                    _6.sent();
                    _6.label = 12;
                case 12:
                    if (!(event_1.type === "content_block_stop")) return [3 /*break*/, 16];
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] CONTENT BLOCK STOP, textStarted:", textStarted);
                    }
                    else {
                        console.log("[transform] CONTENT BLOCK STOP, textStarted:", textStarted);
                    }
                    if (!textStarted) return [3 /*break*/, 14];
                    return [5 /*yield**/, __values(endTextBlock())];
                case 13:
                    _6.sent();
                    if (isUsingOllama) {
                        console.log("[Ollama Transform] Text block ended, textStarted now:", textStarted);
                    }
                    else {
                        console.log("[transform] after endTextBlock, textStarted:", textStarted);
                    }
                    _6.label = 14;
                case 14:
                    if (!currentToolCallId) return [3 /*break*/, 16];
                    return [5 /*yield**/, __values(endToolInput())];
                case 15:
                    _6.sent();
                    _6.label = 16;
                case 16:
                    if (!(event_1.type === "content_block_start" && ((_v = event_1.content_block) === null || _v === void 0 ? void 0 : _v.type) === "tool_use")) return [3 /*break*/, 20];
                    return [5 /*yield**/, __values(endTextBlock())];
                case 17:
                    _6.sent();
                    return [5 /*yield**/, __values(endToolInput())];
                case 18:
                    _6.sent();
                    originalId = event_1.content_block.id || genId();
                    currentToolCallId = makeCompositeId(originalId, currentParentToolUseId);
                    currentToolName = event_1.content_block.name || "unknown";
                    accumulatedToolInput = "";
                    // Store mapping for tool-result lookup
                    toolIdMapping.set(originalId, currentToolCallId);
                    // Emit tool-input-start for progressive UI
                    return [4 /*yield*/, {
                            type: "tool-input-start",
                            toolCallId: currentToolCallId,
                            toolName: currentToolName,
                        }];
                case 19:
                    // Emit tool-input-start for progressive UI
                    _6.sent();
                    _6.label = 20;
                case 20:
                    if (!(((_w = event_1.delta) === null || _w === void 0 ? void 0 : _w.type) === "input_json_delta" && currentToolCallId)) return [3 /*break*/, 22];
                    partialJson = event_1.delta.partial_json || "";
                    accumulatedToolInput += partialJson;
                    // Emit tool-input-delta for progressive UI
                    return [4 /*yield*/, {
                            type: "tool-input-delta",
                            toolCallId: currentToolCallId,
                            inputTextDelta: partialJson,
                        }];
                case 21:
                    // Emit tool-input-delta for progressive UI
                    _6.sent();
                    _6.label = 22;
                case 22:
                    if (!(event_1.type === "content_block_start" && ((_x = event_1.content_block) === null || _x === void 0 ? void 0 : _x.type) === "thinking")) return [3 /*break*/, 24];
                    currentThinkingId = "thinking-".concat(Date.now());
                    accumulatedThinking = "";
                    inThinkingBlock = true;
                    return [4 /*yield*/, {
                            type: "tool-input-start",
                            toolCallId: currentThinkingId,
                            toolName: "Thinking",
                        }];
                case 23:
                    _6.sent();
                    _6.label = 24;
                case 24:
                    if (!(((_y = event_1.delta) === null || _y === void 0 ? void 0 : _y.type) === "thinking_delta" && currentThinkingId && inThinkingBlock)) return [3 /*break*/, 26];
                    thinkingText = String(event_1.delta.thinking || "");
                    // Accumulate and emit delta
                    accumulatedThinking += thinkingText;
                    return [4 /*yield*/, {
                            type: "tool-input-delta",
                            toolCallId: currentThinkingId,
                            inputTextDelta: thinkingText,
                        }];
                case 25:
                    _6.sent();
                    _6.label = 26;
                case 26:
                    if (!(event_1.type === "content_block_stop" && inThinkingBlock && currentThinkingId)) return [3 /*break*/, 29];
                    // Emit the complete thinking tool
                    return [4 /*yield*/, {
                            type: "tool-input-available",
                            toolCallId: currentThinkingId,
                            toolName: "Thinking",
                            input: { text: accumulatedThinking },
                        }];
                case 27:
                    // Emit the complete thinking tool
                    _6.sent();
                    return [4 /*yield*/, {
                            type: "tool-output-available",
                            toolCallId: currentThinkingId,
                            output: { completed: true },
                        }
                        // Track as emitted to skip duplicate from assistant message
                    ];
                case 28:
                    _6.sent();
                    // Track as emitted to skip duplicate from assistant message
                    emittedToolIds.add(currentThinkingId);
                    emittedToolIds.add("thinking-streamed"); // Flag to skip complete block
                    currentThinkingId = null;
                    accumulatedThinking = "";
                    inThinkingBlock = false;
                    _6.label = 29;
                case 29:
                    if (!(msg.type === "assistant" && ((_z = msg.message) === null || _z === void 0 ? void 0 : _z.content))) return [3 /*break*/, 44];
                    _i = 0, _a = msg.message.content;
                    _6.label = 30;
                case 30:
                    if (!(_i < _a.length)) return [3 /*break*/, 44];
                    block = _a[_i];
                    if (!(block.type === "thinking" && block.thinking)) return [3 /*break*/, 33];
                    wasStreamed = emittedToolIds.has("thinking-streamed");
                    if (wasStreamed) {
                        return [3 /*break*/, 43];
                    }
                    thinkingId = genId();
                    return [4 /*yield*/, {
                            type: "tool-input-available",
                            toolCallId: thinkingId,
                            toolName: "Thinking",
                            input: { text: block.thinking },
                        }
                        // Immediately mark as complete
                    ];
                case 31:
                    _6.sent();
                    // Immediately mark as complete
                    return [4 /*yield*/, {
                            type: "tool-output-available",
                            toolCallId: thinkingId,
                            output: { completed: true },
                        }];
                case 32:
                    // Immediately mark as complete
                    _6.sent();
                    _6.label = 33;
                case 33:
                    if (!(block.type === "text")) return [3 /*break*/, 39];
                    console.log("[transform] ASSISTANT TEXT block, textStarted:", textStarted, "text length:", (_0 = block.text) === null || _0 === void 0 ? void 0 : _0.length);
                    return [5 /*yield**/, __values(endToolInput())
                        // Only emit text if we're NOT already streaming (textStarted = false)
                        // When includePartialMessages is true, text comes via stream_event
                    ];
                case 34:
                    _6.sent();
                    if (!!textStarted) return [3 /*break*/, 38];
                    console.log("[transform] EMITTING assistant text (textStarted was false)");
                    textId = genId();
                    return [4 /*yield*/, { type: "text-start", id: textId }];
                case 35:
                    _6.sent();
                    return [4 /*yield*/, { type: "text-delta", id: textId, delta: block.text }];
                case 36:
                    _6.sent();
                    return [4 /*yield*/, { type: "text-end", id: textId }
                        // Track the last text ID for final response marking
                    ];
                case 37:
                    _6.sent();
                    // Track the last text ID for final response marking
                    lastTextId = textId;
                    textId = null;
                    return [3 /*break*/, 39];
                case 38:
                    console.log("[transform] SKIPPING assistant text (textStarted is true)");
                    _6.label = 39;
                case 39:
                    if (!(block.type === "tool_use")) return [3 /*break*/, 43];
                    return [5 /*yield**/, __values(endTextBlock())];
                case 40:
                    _6.sent();
                    return [5 /*yield**/, __values(endToolInput())
                        // Skip if already emitted via streaming
                    ];
                case 41:
                    _6.sent();
                    // Skip if already emitted via streaming
                    if (emittedToolIds.has(block.id)) {
                        console.log("[transform] SKIPPING duplicate tool_use (already emitted via streaming):", block.id);
                        return [3 /*break*/, 43];
                    }
                    emittedToolIds.add(block.id);
                    compositeId = makeCompositeId(block.id, currentParentToolUseId);
                    // Store mapping for tool-result lookup
                    toolIdMapping.set(block.id, compositeId);
                    return [4 /*yield*/, {
                            type: "tool-input-available",
                            toolCallId: compositeId,
                            toolName: block.name,
                            input: block.input,
                        }];
                case 42:
                    _6.sent();
                    _6.label = 43;
                case 43:
                    _i++;
                    return [3 /*break*/, 30];
                case 44:
                    if (!(msg.type === "user" && ((_1 = msg.message) === null || _1 === void 0 ? void 0 : _1.content))) return [3 /*break*/, 50];
                    // DEBUG: Log the message structure to understand tool_use_result
                    console.log("[Transform DEBUG] User message:", {
                        tool_use_result: msg.tool_use_result,
                        tool_use_result_type: typeof msg.tool_use_result,
                        content_length: msg.message.content.length,
                        blocks: msg.message.content.map(function (b) { return ({
                            type: b.type,
                            tool_use_id: b.tool_use_id,
                            content_preview: typeof b.content === 'string' ? b.content.slice(0, 100) : typeof b.content,
                        }); }),
                    });
                    _b = 0, _c = msg.message.content;
                    _6.label = 45;
                case 45:
                    if (!(_b < _c.length)) return [3 /*break*/, 50];
                    block = _c[_b];
                    if (!(block.type === "tool_result")) return [3 /*break*/, 49];
                    compositeId = toolIdMapping.get(block.tool_use_id) || block.tool_use_id;
                    if (!block.is_error) return [3 /*break*/, 47];
                    return [4 /*yield*/, {
                            type: "tool-output-error",
                            toolCallId: compositeId,
                            errorText: String(block.content),
                        }];
                case 46:
                    _6.sent();
                    return [3 /*break*/, 49];
                case 47:
                    output = msg.tool_use_result;
                    if (!output && typeof block.content === 'string') {
                        try {
                            parsed = JSON.parse(block.content);
                            if (parsed && typeof parsed === 'object') {
                                output = parsed;
                            }
                        }
                        catch (_7) {
                            // Not JSON, use raw content
                        }
                    }
                    output = output || block.content;
                    console.log("[Transform DEBUG] Tool output:", {
                        tool_use_id: block.tool_use_id,
                        compositeId: compositeId,
                        output_type: typeof output,
                        output_keys: output && typeof output === 'object' ? Object.keys(output) : null,
                        numFiles: output === null || output === void 0 ? void 0 : output.numFiles,
                    });
                    return [4 /*yield*/, {
                            type: "tool-output-available",
                            toolCallId: compositeId,
                            output: output,
                        }];
                case 48:
                    _6.sent();
                    _6.label = 49;
                case 49:
                    _b++;
                    return [3 /*break*/, 45];
                case 50:
                    if (!(msg.type === "system")) return [3 /*break*/, 56];
                    if (!(msg.subtype === "init")) return [3 /*break*/, 52];
                    console.log("[MCP Transform] Received SDK init message:", {
                        tools: (_2 = msg.tools) === null || _2 === void 0 ? void 0 : _2.length,
                        mcp_servers: msg.mcp_servers,
                        plugins: msg.plugins,
                        skills: (_3 = msg.skills) === null || _3 === void 0 ? void 0 : _3.length,
                    });
                    mcpServers = (msg.mcp_servers || []).map(function (s) { return (__assign(__assign({ name: s.name, status: (["connected", "failed", "pending", "needs-auth"].includes(s.status)
                            ? s.status
                            : "pending") }, (s.serverInfo && { serverInfo: s.serverInfo })), (s.error && { error: s.error }))); });
                    return [4 /*yield*/, {
                            type: "session-init",
                            tools: msg.tools || [],
                            mcpServers: mcpServers,
                            plugins: msg.plugins || [],
                            skills: msg.skills || [],
                        }];
                case 51:
                    _6.sent();
                    _6.label = 52;
                case 52:
                    if (!(msg.subtype === "status" && msg.status === "compacting")) return [3 /*break*/, 54];
                    // Create unique ID and save for matching with boundary event
                    lastCompactId = "compact-".concat(Date.now(), "-").concat(compactCounter++);
                    return [4 /*yield*/, {
                            type: "system-Compact",
                            toolCallId: lastCompactId,
                            state: "input-streaming",
                        }];
                case 53:
                    _6.sent();
                    _6.label = 54;
                case 54:
                    if (!(msg.subtype === "compact_boundary" && lastCompactId)) return [3 /*break*/, 56];
                    return [4 /*yield*/, {
                            type: "system-Compact",
                            toolCallId: lastCompactId,
                            state: "output-available",
                        }];
                case 55:
                    _6.sent();
                    lastCompactId = null; // Clear for next compacting cycle
                    _6.label = 56;
                case 56:
                    if (!(msg.type === "result")) return [3 /*break*/, 62];
                    console.log("[transform] RESULT message, textStarted:", textStarted, "lastTextId:", lastTextId);
                    return [5 /*yield**/, __values(endTextBlock())];
                case 57:
                    _6.sent();
                    return [5 /*yield**/, __values(endToolInput())];
                case 58:
                    _6.sent();
                    inputTokens = (_4 = msg.usage) === null || _4 === void 0 ? void 0 : _4.input_tokens;
                    outputTokens = (_5 = msg.usage) === null || _5 === void 0 ? void 0 : _5.output_tokens;
                    metadata = {
                        sessionId: msg.session_id,
                        inputTokens: inputTokens,
                        outputTokens: outputTokens,
                        totalTokens: inputTokens && outputTokens ? inputTokens + outputTokens : undefined,
                        totalCostUsd: msg.total_cost_usd,
                        durationMs: startTime ? Date.now() - startTime : undefined,
                        resultSubtype: msg.subtype || "success",
                        // Include finalTextId for collapsing tools when there's a final response
                        finalTextId: lastTextId || undefined,
                    };
                    return [4 /*yield*/, { type: "message-metadata", messageMetadata: metadata }];
                case 59:
                    _6.sent();
                    return [4 /*yield*/, { type: "finish-step" }];
                case 60:
                    _6.sent();
                    console.log("[transform] YIELDING FINISH from result message");
                    return [4 /*yield*/, { type: "finish", messageMetadata: metadata }];
                case 61:
                    _6.sent();
                    _6.label = 62;
                case 62: return [2 /*return*/];
            }
        });
    };
}
