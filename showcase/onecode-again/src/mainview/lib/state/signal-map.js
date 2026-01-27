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
exports.createSignalMap = createSignalMap;
exports.createKeyedSignalFamily = createKeyedSignalFamily;
var map_1 = require("@solid-primitives/map");
function createSignalMap(init) {
    var map = new map_1.ReactiveMap();
    var family = (function (key) {
        var existing = map.get(key);
        if (existing)
            return existing;
        var created = init(key);
        map.set(key, created);
        return created;
    });
    family.delete = function (key) {
        map.delete(key);
    };
    return family;
}
function createKeyedSignalFamily(storage, fallback) {
    return createSignalMap(function (id) {
        var get = function () { var _a; return (_a = storage[0]()[id]) !== null && _a !== void 0 ? _a : fallback; };
        var set = function (value) {
            var _a;
            var _b;
            var current = storage[0]();
            var prev = (_b = current[id]) !== null && _b !== void 0 ? _b : fallback;
            var next = typeof value === "function" ? value(prev) : value;
            storage[1](__assign(__assign({}, current), (_a = {}, _a[id] = next, _a)));
        };
        return [get, set];
    });
}
