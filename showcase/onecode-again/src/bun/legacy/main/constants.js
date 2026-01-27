"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_SERVER_PORT = exports.IS_DEV = void 0;
// Dev mode detection
exports.IS_DEV = !!process.env.ELECTRON_RENDERER_URL;
// Auth server port - use different port in dev to allow running alongside production
exports.AUTH_SERVER_PORT = exports.IS_DEV ? 21322 : 21321;
