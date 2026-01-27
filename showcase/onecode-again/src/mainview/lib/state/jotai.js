"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atom = atom;
exports.getAtomValue = getAtomValue;
exports.setAtomValue = setAtomValue;
exports.useAtom = useAtom;
exports.useAtomValue = useAtomValue;
exports.useSetAtom = useSetAtom;
exports.createStore = createStore;
exports.Provider = Provider;
var solid_js_1 = require("solid-js");
var atomState = new WeakMap();
function isSignalPair(value) {
    return Array.isArray(value) && value.length >= 2 && typeof value[0] === "function";
}
function ensureState(atom) {
    var existing = atomState.get(atom);
    if (existing)
        return existing;
    var state = {};
    if (!atom.read) {
        state.signal = (0, solid_js_1.createSignal)(atom.init);
    }
    atomState.set(atom, state);
    return state;
}
function atom(initOrRead, write) {
    if (typeof initOrRead === "function") {
        return { read: initOrRead, write: write };
    }
    return { init: initOrRead };
}
function getAtomValue(atomRef) {
    if (isSignalPair(atomRef)) {
        return atomRef[0]();
    }
    var state = ensureState(atomRef);
    if (atomRef.read) {
        if (!state.memo) {
            state.memo = (0, solid_js_1.createMemo)(function () { return atomRef.read(getAtomValue); });
        }
        return state.memo();
    }
    return state.signal[0]();
}
function setAtomValue(atomRef, value) {
    if (isSignalPair(atomRef)) {
        var setter_1 = atomRef[1];
        if (typeof value === "function") {
            setter_1(value);
        }
        else {
            setter_1(value);
        }
        return;
    }
    var state = ensureState(atomRef);
    if (atomRef.write) {
        return atomRef.write(getAtomValue, setAtomValue, value);
    }
    var setter = state.signal[1];
    if (typeof value === "function") {
        setter(value);
    }
    else {
        setter(value);
    }
}
function useAtom(atomRef) {
    if (isSignalPair(atomRef)) {
        return [atomRef[0], atomRef[1]];
    }
    return [function () { return getAtomValue(atomRef); }, function (value) { return setAtomValue(atomRef, value); }];
}
function useAtomValue(atomRef) {
    if (isSignalPair(atomRef)) {
        return atomRef[0];
    }
    return function () { return getAtomValue(atomRef); };
}
function useSetAtom(atomRef) {
    if (isSignalPair(atomRef)) {
        return atomRef[1];
    }
    return function (value) { return setAtomValue(atomRef, value); };
}
function createStore() {
    return {
        get: getAtomValue,
        set: setAtomValue,
        sub: function (atomRef, callback) {
            var dispose;
            (0, solid_js_1.createRoot)(function (d) {
                dispose = d;
                (0, solid_js_1.createEffect)(function () {
                    getAtomValue(atomRef);
                    callback();
                });
            });
            return function () { return dispose === null || dispose === void 0 ? void 0 : dispose(); };
        },
    };
}
function Provider(props) {
    return props.children;
}
