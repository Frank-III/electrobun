"use strict";
/**
 * PostHog analytics for 1Code Desktop - Renderer Process
 * Uses PostHog JS SDK for client-side tracking
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAnalytics = initAnalytics;
exports.capture = capture;
exports.identify = identify;
exports.getCurrentUserId = getCurrentUserId;
exports.reset = reset;
exports.shutdown = shutdown;
exports.trackMessageSent = trackMessageSent;
var posthog_js_1 = require("posthog-js");
// PostHog configuration from environment
var POSTHOG_DESKTOP_KEY = import.meta.env.VITE_POSTHOG_KEY;
var POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
var initialized = false;
var currentUserId = null;
var appVersion = null;
var appPlatform = null;
var appArch = null;
// Check if we're in development mode
// Renderer can't access env vars directly, so we check a global flag
var isDev = typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    !window.__FORCE_ANALYTICS__;
/**
 * Check if user has opted out of analytics
 * Reads directly from localStorage to avoid circular dependencies
 */
function isOptedOut() {
    try {
        var optOut = localStorage.getItem("preferences:analytics-opt-out");
        return optOut === "true";
    }
    catch (_a) {
        return false;
    }
}
/**
 * Get common properties for all events
 */
function getCommonProperties() {
    return {
        app_version: appVersion,
        platform: appPlatform,
        arch: appArch,
        source: "desktop_renderer",
    };
}
/**
 * Initialize PostHog for renderer process
 */
function initAnalytics() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Skip in development mode
                    if (isDev)
                        return [2 /*return*/];
                    if (initialized)
                        return [2 /*return*/];
                    // Skip if no PostHog key configured
                    if (!POSTHOG_DESKTOP_KEY) {
                        console.log("[Analytics] Skipping PostHog initialization (no key configured)");
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getVersion)) return [3 /*break*/, 3];
                    return [4 /*yield*/, window.desktopApi.getVersion()];
                case 2:
                    appVersion = _d.sent();
                    _d.label = 3;
                case 3:
                    if ((_b = window.desktopApi) === null || _b === void 0 ? void 0 : _b.platform) {
                        appPlatform = window.desktopApi.platform;
                    }
                    if ((_c = window.desktopApi) === null || _c === void 0 ? void 0 : _c.arch) {
                        appArch = window.desktopApi.arch;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.warn("[Analytics] Failed to get app info:", error_1);
                    return [3 /*break*/, 5];
                case 5:
                    posthog_js_1.default.init(POSTHOG_DESKTOP_KEY, {
                        api_host: POSTHOG_HOST,
                        // Disable automatic tracking - we track manually
                        autocapture: false,
                        capture_pageview: false,
                        capture_pageleave: false,
                        disable_session_recording: true,
                        // Privacy settings
                        person_profiles: "identified_only",
                        persistence: "localStorage",
                    });
                    initialized = true;
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Capture an analytics event
 */
function capture(eventName, properties) {
    // Skip in development mode
    if (isDev)
        return;
    // Skip if user opted out
    if (isOptedOut())
        return;
    if (!initialized)
        return;
    posthog_js_1.default.capture(eventName, __assign(__assign({}, getCommonProperties()), properties));
}
/**
 * Identify a user
 */
function identify(userId, traits) {
    currentUserId = userId;
    // Skip in development mode
    if (isDev)
        return;
    // Skip if user opted out
    if (isOptedOut())
        return;
    if (!initialized)
        return;
    posthog_js_1.default.identify(userId, __assign(__assign({}, getCommonProperties()), traits));
}
/**
 * Get current user ID
 */
function getCurrentUserId() {
    return currentUserId;
}
/**
 * Reset user identification (on logout)
 */
function reset() {
    currentUserId = null;
    if (initialized) {
        posthog_js_1.default.reset();
    }
}
/**
 * Shutdown PostHog
 */
function shutdown() {
    if (initialized) {
        posthog_js_1.default.reset();
        initialized = false;
    }
}
// ============================================================================
// Specific event helpers (for renderer-specific events)
// ============================================================================
/**
 * Track message sent from UI
 */
function trackMessageSent(data) {
    capture("message_sent", {
        workspace_id: data.workspaceId,
        message_length: data.messageLength,
        mode: data.mode,
    });
}
