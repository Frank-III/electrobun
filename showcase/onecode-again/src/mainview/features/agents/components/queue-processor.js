"use client";
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
exports.QueueProcessor = QueueProcessor;
var solid_js_1 = require("solid-js");
var solid_sonner_1 = require("solid-sonner");
var message_queue_store_1 = require("../stores/message-queue-store");
var streaming_status_store_1 = require("../stores/streaming-status-store");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var agent_chat_store_1 = require("../stores/agent-chat-store");
var analytics_1 = require("../../../lib/analytics");
var jotai_store_1 = require("../../../lib/jotai-store");
var atoms_1 = require("../atoms");
// Delay between processing queue items (ms)
var QUEUE_PROCESS_DELAY = 1e3;
/**
* Global queue processor component.
*
* This component runs at the app level (AgentsLayout) and processes
* message queues for ALL sub-chats, regardless of which one is currently active.
*
* Key insight: Unlike the previous local useEffect in ChatViewInner which only
* processed the currently active sub-chat's queue, this component listens to
* ALL queues and streaming statuses globally.
*/
function QueueProcessor() {
    var _this = this;
    // Track which sub-chats are currently being processed to avoid double-sends
    var _a = (0, solid_js_1.createSignal)(new Set()), processingRef = _a[0], setProcessingRef = _a[1];
    // Track timers for cleanup
    var _b = (0, solid_js_1.createSignal)(new Map()), timersRef = _b[0], setTimersRef = _b[1];
    (0, solid_js_1.createEffect)(function () {
        // Function to process queue for a specific sub-chat
        var processQueue = function (subChatId) { return __awaiter(_this, void 0, void 0, function () {
            var status, queue, chat, item, parts, subChatMeta, mode, parentChatId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check if already processing this sub-chat
                        if (processingRef.current.has(subChatId)) {
                            return [2 /*return*/];
                        }
                        status = streaming_status_store_1.useStreamingStatusStore.getState().getStatus(subChatId);
                        if (status !== "ready") {
                            return [2 /*return*/];
                        }
                        queue = message_queue_store_1.useMessageQueueStore.getState().queues[subChatId] || [];
                        if (queue.length === 0) {
                            return [2 /*return*/];
                        }
                        chat = agent_chat_store_1.agentChatStore.get(subChatId);
                        if (!chat) {
                            return [2 /*return*/];
                        }
                        // Mark as processing
                        processingRef.current.add(subChatId);
                        item = message_queue_store_1.useMessageQueueStore.getState().popItem(subChatId, queue[0].id);
                        if (!item) {
                            processingRef.current.delete(subChatId);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        parts = __spreadArray(__spreadArray([], (item.images || []).map(function (img) { return ({
                            type: "data-image",
                            data: {
                                url: img.url,
                                mediaType: img.mediaType,
                                filename: img.filename,
                                base64Data: img.base64Data
                            }
                        }); }), true), (item.files || []).map(function (f) { return ({
                            type: "data-file",
                            data: {
                                url: f.url,
                                mediaType: f.mediaType,
                                filename: f.filename,
                                size: f.size
                            }
                        }); }), true);
                        if (item.message) {
                            parts.push({
                                type: "text",
                                text: item.message
                            });
                        }
                        subChatMeta = sub_chat_store_1.useAgentSubChatStore.getState().allSubChats.find(function (sc) { return sc.id === subChatId; });
                        mode = (subChatMeta === null || subChatMeta === void 0 ? void 0 : subChatMeta.mode) || "agent";
                        // Track message sent
                        (0, analytics_1.trackMessageSent)({
                            workspaceId: subChatId,
                            messageLength: item.message.length,
                            mode: mode
                        });
                        // Update timestamps
                        sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatTimestamp(subChatId);
                        parentChatId = agent_chat_store_1.agentChatStore.getParentChatId(subChatId);
                        if (parentChatId) {
                            (0, atoms_1.setLoading)(function (fn) { return jotai_store_1.appStore.set(atoms_1.loadingSubChatsAtom, fn(jotai_store_1.appStore.get(atoms_1.loadingSubChatsAtom))); }, subChatId, parentChatId);
                        }
                        // Send message using Chat's sendMessage method
                        return [4 /*yield*/, chat.sendMessage({
                                role: "user",
                                parts: parts
                            })];
                    case 2:
                        // Send message using Chat's sendMessage method
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[QueueProcessor] Error processing queue:", error_1);
                        // Requeue the item at the front so it can be retried
                        message_queue_store_1.useMessageQueueStore.getState().prependItem(subChatId, item);
                        // Set error status (will be cleared on next successful send or manual retry)
                        streaming_status_store_1.useStreamingStatusStore.getState().setStatus(subChatId, "error");
                        // Clear loading state since send failed
                        (0, atoms_1.clearLoading)(function (fn) { return jotai_store_1.appStore.set(atoms_1.loadingSubChatsAtom, fn(jotai_store_1.appStore.get(atoms_1.loadingSubChatsAtom))); }, subChatId);
                        // Notify user
                        solid_sonner_1.toast.error("Failed to send queued message. It will be retried.");
                        return [3 /*break*/, 5];
                    case 4:
                        processingRef.current.delete(subChatId);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // Schedule processing for a sub-chat with delay
        var scheduleProcessing = function (subChatId) {
            // Clear any existing timer for this sub-chat
            var existingTimer = timersRef.current.get(subChatId);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            // Schedule new processing
            var timer = setTimeout(function () {
                timersRef.current.delete(subChatId);
                processQueue(subChatId);
            }, QUEUE_PROCESS_DELAY);
            timersRef.current.set(subChatId, timer);
        };
        // Check all queues and schedule processing for ready sub-chats
        var checkAllQueues = function () {
            var queues = message_queue_store_1.useMessageQueueStore.getState().queues;
            for (var _i = 0, _a = Object.keys(queues); _i < _a.length; _i++) {
                var subChatId = _a[_i];
                var queue = queues[subChatId];
                if (!queue || queue.length === 0)
                    continue;
                var status_1 = streaming_status_store_1.useStreamingStatusStore.getState().getStatus(subChatId);
                // Process when ready, or retry on error status
                if ((status_1 === "ready" || status_1 === "error") && !processingRef.current.has(subChatId)) {
                    // If error status, clear it before retrying
                    if (status_1 === "error") {
                        streaming_status_store_1.useStreamingStatusStore.getState().setStatus(subChatId, "ready");
                    }
                    scheduleProcessing(subChatId);
                }
            }
        };
        // Subscribe to queue changes with selector (requires subscribeWithSelector middleware)
        var unsubscribeQueue = message_queue_store_1.useMessageQueueStore.subscribe(function (state) { return state.queues; }, function () { return checkAllQueues(); });
        // Subscribe to streaming status changes with selector
        var unsubscribeStatus = streaming_status_store_1.useStreamingStatusStore.subscribe(function (state) { return state.statuses; }, function () { return checkAllQueues(); });
        // Initial check
        checkAllQueues();
        // Cleanup
        return function () {
            unsubscribeQueue();
            unsubscribeStatus();
            // Clear all timers
            for (var _i = 0, _a = timersRef.current.values(); _i < _a.length; _i++) {
                var timer = _a[_i];
                clearTimeout(timer);
            }
            timersRef.current.clear();
        };
    });
    // This component doesn't render anything
    return null;
}
