"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_SERVER_PORT = exports.IS_DEV = void 0;
exports.IS_DEV = process.env.NODE_ENV !== "production";
exports.AUTH_SERVER_PORT = exports.IS_DEV ? 21322 : 21321;
