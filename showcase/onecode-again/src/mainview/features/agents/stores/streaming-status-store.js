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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStreamingStatusStore = void 0;
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
exports.useStreamingStatusStore = (0, zustand_1.create)()((0, middleware_1.subscribeWithSelector)(function (set, get) { return ({
    statuses: {},
    setStatus: function (subChatId, status) {
        set(function (state) {
            var _a;
            return ({
                statuses: __assign(__assign({}, state.statuses), (_a = {}, _a[subChatId] = status, _a)),
            });
        });
    },
    getStatus: function (subChatId) {
        var _a;
        return (_a = get().statuses[subChatId]) !== null && _a !== void 0 ? _a : "ready";
    },
    isStreaming: function (subChatId) {
        var _a;
        var status = (_a = get().statuses[subChatId]) !== null && _a !== void 0 ? _a : "ready";
        return status === "streaming" || status === "submitted";
    },
    clearStatus: function (subChatId) {
        set(function (state) {
            var newStatuses = __assign({}, state.statuses);
            delete newStatuses[subChatId];
            return { statuses: newStatuses };
        });
    },
    getReadySubChats: function () {
        var statuses = get().statuses;
        return Object.entries(statuses)
            .filter(function (_a) {
            var _ = _a[0], status = _a[1];
            return status === "ready";
        })
            .map(function (_a) {
            var subChatId = _a[0];
            return subChatId;
        });
    },
}); }));
