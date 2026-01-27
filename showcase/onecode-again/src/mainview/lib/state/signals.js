"use strict";
/**
 * Pure SolidJS signals state management
 *
 * This module replaces the Jotai-compatible layer with pure SolidJS patterns.
 * Instead of useAtomValue/useSetAtom, we export signals directly.
 *
 * Usage:
 *   // Before (Jotai-like)
 *   const count = useAtomValue(countAtom)
 *   const setCount = useSetAtom(countAtom)
 *
 *   // After (SolidJS)
 *   const [count, setCount] = useCount()
 *   // or with direct imports:
 *   import { count } from "./state/atoms"
 *   // In JSX: {count()}
 *   // To update: setCount(5)
 */
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
exports.produce = exports.batch = void 0;
exports.createState = createState;
exports.createStoredState = createStoredState;
exports.createWindowState = createWindowState;
exports.createAppStore = createAppStore;
exports.createStoredAppStore = createStoredAppStore;
exports.createDerived = createDerived;
exports.createToggle = createToggle;
exports.createCounter = createCounter;
exports.createKeyedStateFamily = createKeyedStateFamily;
exports.createStoredKeyedStateFamily = createStoredKeyedStateFamily;
var solid_js_1 = require("solid-js");
Object.defineProperty(exports, "batch", { enumerable: true, get: function () { return solid_js_1.batch; } });
var store_1 = require("solid-js/store");
Object.defineProperty(exports, "produce", { enumerable: true, get: function () { return store_1.produce; } });
// ============================================
// Signal Factory Functions
// ============================================
/**
 * Create a simple signal with optional default value
 */
function createState(initialValue) {
    return (0, solid_js_1.createSignal)(initialValue);
}
/**
 * Create a stored signal that persists to localStorage
 */
function createStoredState(key, initialValue, options) {
    var _a = options || {}, _b = _a.serialize, serialize = _b === void 0 ? JSON.stringify : _b, _c = _a.deserialize, deserialize = _c === void 0 ? JSON.parse : _c, _d = _a.storage, storage = _d === void 0 ? typeof window !== "undefined" ? localStorage : undefined : _d, _e = _a.getOnInit, getOnInit = _e === void 0 ? true : _e;
    // Initialize from storage or default
    var getInitial = function () {
        if (!getOnInit || !storage)
            return initialValue;
        try {
            var stored = storage.getItem(key);
            if (stored !== null) {
                return deserialize(stored);
            }
        }
        catch (e) {
            console.warn("[createStoredState] Failed to read ".concat(key, ":"), e);
        }
        return initialValue;
    };
    var _f = (0, solid_js_1.createSignal)(getInitial()), value = _f[0], setValue = _f[1];
    // Wrap setter to persist to storage
    var setStoredValue = function (newValue) {
        var resolved = typeof newValue === "function"
            ? newValue(value())
            : newValue;
        setValue(function () { return resolved; });
        if (storage) {
            try {
                storage.setItem(key, serialize(resolved));
            }
            catch (e) {
                console.warn("[createStoredState] Failed to write ".concat(key, ":"), e);
            }
        }
    };
    return [value, setStoredValue];
}
/**
 * Create a window-scoped stored signal (for multi-window apps)
 * Each window gets its own isolated state
 */
function createWindowState(key, initialValue, options) {
    // Use sessionStorage for window-scoped state
    return createStoredState(key, initialValue, __assign(__assign({}, options), { storage: typeof window !== "undefined" ? sessionStorage : undefined }));
}
// ============================================
// Store Factory Functions
// ============================================
/**
 * Create a reactive store for complex/nested state
 */
function createAppStore(initialValue) {
    return (0, store_1.createStore)(initialValue);
}
/**
 * Create a stored store that persists to localStorage
 */
function createStoredAppStore(key, initialValue, options) {
    var _a = options || {}, _b = _a.serialize, serialize = _b === void 0 ? JSON.stringify : _b, _c = _a.deserialize, deserialize = _c === void 0 ? JSON.parse : _c, _d = _a.storage, storage = _d === void 0 ? typeof window !== "undefined" ? localStorage : undefined : _d, _e = _a.getOnInit, getOnInit = _e === void 0 ? true : _e;
    // Initialize from storage
    var getInitial = function () {
        if (!getOnInit || !storage)
            return initialValue;
        try {
            var stored = storage.getItem(key);
            if (stored !== null) {
                return deserialize(stored);
            }
        }
        catch (e) {
            console.warn("[createStoredAppStore] Failed to read ".concat(key, ":"), e);
        }
        return initialValue;
    };
    var _f = (0, store_1.createStore)(getInitial()), store = _f[0], setStore = _f[1];
    // Wrap setter to persist changes
    var setStoredStore = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Apply the store update
        setStore.apply(void 0, args);
        // Persist to storage
        if (storage) {
            try {
                storage.setItem(key, serialize(store));
            }
            catch (e) {
                console.warn("[createStoredAppStore] Failed to write ".concat(key, ":"), e);
            }
        }
    };
    return [store, setStoredStore];
}
// ============================================
// Derived State Helpers
// ============================================
/**
 * Create a memoized derived value from signals
 */
function createDerived(fn) {
    return (0, solid_js_1.createMemo)(fn);
}
// ============================================
// Helper Hooks/Functions
// ============================================
/**
 * Toggle a boolean signal
 */
function createToggle(initial) {
    if (initial === void 0) { initial = false; }
    var _a = (0, solid_js_1.createSignal)(initial), value = _a[0], setValue = _a[1];
    var toggle = function () { return setValue(function (v) { return !v; }); };
    return [value, setValue, toggle];
}
/**
 * Create a counter signal
 */
function createCounter(initial) {
    if (initial === void 0) { initial = 0; }
    var _a = (0, solid_js_1.createSignal)(initial), value = _a[0], setValue = _a[1];
    var increment = function () { return setValue(function (v) { return v + 1; }); };
    var decrement = function () { return setValue(function (v) { return v - 1; }); };
    return [value, setValue, increment, decrement];
}
// ============================================
// Keyed State Families
// ============================================
/**
 * Create a family of signals keyed by an identifier
 * Useful for per-entity state (e.g., state per chatId)
 */
function createKeyedStateFamily(defaultValue) {
    var signals = new Map();
    var get = function (key) {
        if (!signals.has(key)) {
            signals.set(key, (0, solid_js_1.createSignal)(defaultValue));
        }
        return signals.get(key);
    };
    var getValue = function (key) { return get(key)[0]; };
    var setValue = function (key, value) {
        var _a = get(key), setter = _a[1];
        setter(value);
    };
    var remove = function (key) {
        signals.delete(key);
    };
    return { get: get, getValue: getValue, setValue: setValue, remove: remove };
}
/**
 * Create a family of stored signals keyed by an identifier
 */
function createStoredKeyedStateFamily(baseKey, defaultValue, options) {
    var signals = new Map();
    var get = function (key) {
        if (!signals.has(key)) {
            var storageKey = "".concat(baseKey, ":").concat(key);
            signals.set(key, createStoredState(storageKey, defaultValue, options));
        }
        return signals.get(key);
    };
    var getValue = function (key) { return get(key)[0]; };
    var setValue = function (key, value) {
        var _a = get(key), setter = _a[1];
        setter(value);
    };
    var remove = function (key) {
        signals.delete(key);
    };
    return { get: get, getValue: getValue, setValue: setValue, remove: remove };
}
