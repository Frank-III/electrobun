"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJSONStorage = createJSONStorage;
exports.atomFamily = atomFamily;
function createJSONStorage(getStorage) {
    return {
        getItem: function (key) {
            try {
                var raw = getStorage().getItem(key);
                return raw ? JSON.parse(raw) : null;
            }
            catch (_a) {
                return null;
            }
        },
        setItem: function (key, value) {
            try {
                getStorage().setItem(key, JSON.stringify(value));
            }
            catch (_a) { }
        },
        removeItem: function (key) {
            try {
                getStorage().removeItem(key);
            }
            catch (_a) { }
        },
    };
}
function atomFamily(init) {
    var map = new Map();
    return function (param) {
        if (!map.has(param))
            map.set(param, init(param));
        return map.get(param);
    };
}
