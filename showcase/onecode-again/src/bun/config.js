"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiUrl = getApiUrl;
function getApiUrl() {
    var override = process.env.MAIN_VITE_API_URL || process.env.API_URL;
    return override || "https://21st.dev";
}
