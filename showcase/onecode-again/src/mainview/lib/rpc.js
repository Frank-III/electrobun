"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRpc = getRpc;
function getRpc() {
    var _a;
    var rpc = (_a = window === null || window === void 0 ? void 0 : window.rpc) === null || _a === void 0 ? void 0 : _a.request;
    if (!rpc) {
        throw new Error("RPC is not available in this window");
    }
    return rpc;
}
