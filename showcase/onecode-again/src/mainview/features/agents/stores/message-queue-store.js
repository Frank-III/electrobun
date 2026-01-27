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
exports.useMessageQueueStore = exports.EMPTY_QUEUE = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
var queue_utils_1 = require("../lib/queue-utils");
// Empty array constant to avoid creating new arrays on each call
// Exported for use in selectors to maintain stable reference
exports.EMPTY_QUEUE = [];
exports.useMessageQueueStore = (0, zustand_1.create)()((0, middleware_1.subscribeWithSelector)(function (set, get) { return ({
    queues: {},
    addToQueue: function (subChatId, item) {
        set(function (state) {
            var _a;
            return ({
                queues: __assign(__assign({}, state.queues), (_a = {}, _a[subChatId] = __spreadArray(__spreadArray([], (state.queues[subChatId] || []), true), [item], false), _a)),
            });
        });
    },
    removeFromQueue: function (subChatId, itemId) {
        set(function (state) {
            var _a;
            var currentQueue = state.queues[subChatId] || [];
            return {
                queues: __assign(__assign({}, state.queues), (_a = {}, _a[subChatId] = (0, queue_utils_1.removeQueueItem)(currentQueue, itemId), _a)),
            };
        });
    },
    getQueue: function (subChatId) {
        var _a;
        return (_a = get().queues[subChatId]) !== null && _a !== void 0 ? _a : exports.EMPTY_QUEUE;
    },
    getNextItem: function (subChatId) {
        var queue = get().queues[subChatId] || [];
        return queue.find(function (item) { return item.status === "pending"; }) || null;
    },
    clearQueue: function (subChatId) {
        set(function (state) {
            var _a;
            return ({
                queues: __assign(__assign({}, state.queues), (_a = {}, _a[subChatId] = [], _a)),
            });
        });
    },
    // Atomic pop: find and remove in single set() call to prevent race conditions
    popItem: function (subChatId, itemId) {
        var foundItem = null;
        set(function (state) {
            var _a;
            var currentQueue = state.queues[subChatId] || [];
            foundItem = currentQueue.find(function (i) { return i.id === itemId; }) || null;
            if (!foundItem)
                return state;
            return {
                queues: __assign(__assign({}, state.queues), (_a = {}, _a[subChatId] = currentQueue.filter(function (i) { return i.id !== itemId; }), _a)),
            };
        });
        return foundItem;
    },
    // Add item to front of queue (used for error recovery - requeue failed items)
    prependItem: function (subChatId, item) {
        set(function (state) {
            var _a;
            return ({
                queues: __assign(__assign({}, state.queues), (_a = {}, _a[subChatId] = __spreadArray([item], (state.queues[subChatId] || []), true), _a)),
            });
        });
    },
}); }));
