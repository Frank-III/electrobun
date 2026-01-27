"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiUrl = getApiUrl;
exports.isDev = isDev;
/**
 * Shared configuration for the desktop app
 */
var electron_1 = require("electron");
var IS_DEV = !!process.env.ELECTRON_RENDERER_URL;
/**
 * Get the API base URL
 * In packaged app, ALWAYS use production URL to prevent localhost leaking into releases
 * In dev mode, allow override via MAIN_VITE_API_URL env variable
 */
function getApiUrl() {
    if (electron_1.app.isPackaged) {
        return "https://21st.dev";
    }
    return import.meta.env.MAIN_VITE_API_URL || "https://21st.dev";
}
/**
 * Check if running in development mode
 */
function isDev() {
    return IS_DEV;
}
