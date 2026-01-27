"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoredSignal = createStoredSignal;
var solid_js_1 = require("solid-js");
var storage_1 = require("@solid-primitives/storage");
function createStoredSignal(key, initialValue, storage) {
    if (storage === void 0) { storage = localStorage; }
    var signal;
    (0, solid_js_1.createRoot)(function () {
        var _a = (0, solid_js_1.createSignal)(initialValue), value = _a[0], setValue = _a[1];
        (0, storage_1.makePersisted)([value, setValue], {
            name: key,
            storage: storage,
            serialize: function (data) { return JSON.stringify(data); },
            deserialize: function (data) { return JSON.parse(data); },
        });
        signal = [value, setValue];
    });
    return signal;
}
