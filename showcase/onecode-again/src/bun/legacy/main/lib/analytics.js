"use strict";
/**
 * PostHog analytics for 1Code Desktop - Main Process
 * Uses PostHog Node.js SDK for server-side tracking
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
exports.setOptOut = setOptOut;
exports.setSubscriptionPlan = setSubscriptionPlan;
exports.setConnectionMethod = setConnectionMethod;
exports.initAnalytics = initAnalytics;
exports.capture = capture;
exports.identify = identify;
exports.getCurrentUserId = getCurrentUserId;
exports.reset = reset;
exports.shutdown = shutdown;
exports.trackAppOpened = trackAppOpened;
exports.trackAuthCompleted = trackAuthCompleted;
exports.trackProjectOpened = trackProjectOpened;
exports.trackWorkspaceCreated = trackWorkspaceCreated;
exports.trackWorkspaceArchived = trackWorkspaceArchived;
exports.trackWorkspaceDeleted = trackWorkspaceDeleted;
exports.trackMessageSent = trackMessageSent;
exports.trackPRCreated = trackPRCreated;
exports.trackCommitCreated = trackCommitCreated;
exports.trackSubChatCreated = trackSubChatCreated;
var posthog_node_1 = require("posthog-node");
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
// PostHog configuration - hardcoded key for opensource users, env var override for internal builds
// This enables analytics for all users including those building from source
var POSTHOG_DESKTOP_KEY = import.meta.env.MAIN_VITE_POSTHOG_KEY || "phc_wM7gbrJhOLTvynyhnhPkrVGDc5mKRSXsLGQHqM3T3vq";
var POSTHOG_HOST = import.meta.env.MAIN_VITE_POSTHOG_HOST || "https://us.i.posthog.com";
var posthog = null;
var currentUserId = null;
var userOptedOut = false; // Synced from renderer
// track first launch using a marker file
var FIRST_LAUNCH_MARKER = ".first_launch_tracked";
function getFirstLaunchMarkerPath() {
    try {
        return path.join(electron_1.app.getPath("userData"), FIRST_LAUNCH_MARKER);
    }
    catch (_a) {
        // app not ready yet
        return "";
    }
}
function isFirstLaunch() {
    var markerPath = getFirstLaunchMarkerPath();
    if (!markerPath)
        return false;
    try {
        return !fs.existsSync(markerPath);
    }
    catch (_a) {
        return false;
    }
}
function markFirstLaunchTracked() {
    var markerPath = getFirstLaunchMarkerPath();
    if (!markerPath)
        return;
    try {
        fs.writeFileSync(markerPath, new Date().toISOString());
    }
    catch (_a) {
        // ignore errors writing marker
    }
}
// Cached user properties for analytics enrichment
var cachedSubscriptionPlan = null;
var cachedConnectionMethod = null;
// Check if we're in development mode
// Set FORCE_ANALYTICS=true to test analytics in development
// Use a function to check lazily after app is ready
function isDev() {
    try {
        return !electron_1.app.isPackaged && process.env.FORCE_ANALYTICS !== "true";
    }
    catch (_a) {
        // App not ready yet, assume dev mode
        return process.env.FORCE_ANALYTICS !== "true";
    }
}
/**
 * Get common properties for all events
 */
function getCommonProperties() {
    return {
        source: "desktop", // Unified source for desktop vs web analytics
        app_version: electron_1.app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electron_version: process.versions.electron,
        node_version: process.versions.node,
        // Analytics enrichment properties
        subscription_plan: cachedSubscriptionPlan,
        connection_method: cachedConnectionMethod,
    };
}
/**
 * Set opt-out status (called from renderer when user preference changes)
 */
function setOptOut(optedOut) {
    userOptedOut = optedOut;
}
/**
 * Set subscription plan (called after fetching from API)
 */
function setSubscriptionPlan(plan) {
    cachedSubscriptionPlan = plan;
}
/**
 * Set connection method (called from renderer via IPC)
 * Values: "claude-subscription" | "api-key" | "custom-model"
 */
function setConnectionMethod(method) {
    cachedConnectionMethod = method;
}
/**
 * Initialize PostHog for main process
 */
function initAnalytics() {
    // Skip in development mode
    if (isDev())
        return;
    if (posthog)
        return;
    // Skip if no PostHog key configured
    if (!POSTHOG_DESKTOP_KEY) {
        console.log("[Analytics] Skipping PostHog initialization (no key configured)");
        return;
    }
    posthog = new posthog_node_1.PostHog(POSTHOG_DESKTOP_KEY, {
        host: POSTHOG_HOST,
        // Flush events every 30 seconds or when 20 events are queued
        flushAt: 20,
        flushInterval: 30000,
    });
}
/**
 * Capture an analytics event
 */
function capture(eventName, properties) {
    // Skip in development mode
    if (isDev())
        return;
    // Skip if user opted out
    if (userOptedOut)
        return;
    if (!posthog)
        return;
    var distinctId = currentUserId || "anonymous";
    posthog.capture({
        distinctId: distinctId,
        event: eventName,
        properties: __assign(__assign({}, getCommonProperties()), properties),
    });
}
/**
 * Identify a user
 */
function identify(userId, traits) {
    currentUserId = userId;
    // Skip in development mode
    if (isDev())
        return;
    // Skip if user opted out
    if (userOptedOut)
        return;
    if (!posthog)
        return;
    posthog.identify({
        distinctId: userId,
        properties: __assign(__assign({}, getCommonProperties()), traits),
    });
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
    // Reset cached analytics properties
    cachedSubscriptionPlan = null;
    cachedConnectionMethod = null;
    // PostHog Node.js SDK doesn't have a reset method
    // Events will be sent as anonymous until next identify
}
/**
 * Shutdown PostHog and flush pending events
 */
function shutdown() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!posthog) return [3 /*break*/, 2];
                    return [4 /*yield*/, posthog.shutdown()];
                case 1:
                    _a.sent();
                    posthog = null;
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Specific event helpers
// ============================================================================
/**
 * Track app opened event
 */
function trackAppOpened() {
    var firstLaunch = isFirstLaunch();
    capture("desktop_opened", {
        first_launch: firstLaunch,
    });
    if (firstLaunch) {
        // mark as tracked so subsequent opens don't count as first launch
        markFirstLaunchTracked();
        // also fire a separate first_launch event for funnel analysis
        capture("first_launch", {
            app_version: electron_1.app.getVersion(),
            platform: process.platform,
        });
    }
}
/**
 * Track successful authentication
 */
function trackAuthCompleted(userId, email) {
    identify(userId, email ? { email: email } : undefined);
    capture("auth_completed", {
        user_id: userId,
    });
}
/**
 * Track project opened
 */
function trackProjectOpened(project) {
    capture("project_opened", {
        project_id: project.id,
        has_git_remote: project.hasGitRemote,
    });
}
/**
 * Track workspace/chat created
 */
function trackWorkspaceCreated(workspace) {
    capture("workspace_created", {
        workspace_id: workspace.id,
        project_id: workspace.projectId,
        use_worktree: workspace.useWorktree,
        repository: workspace.repository,
    });
}
/**
 * Track workspace archived
 */
function trackWorkspaceArchived(workspaceId) {
    capture("workspace_archived", {
        workspace_id: workspaceId,
    });
}
/**
 * Track workspace deleted
 */
function trackWorkspaceDeleted(workspaceId) {
    capture("workspace_deleted", {
        workspace_id: workspaceId,
    });
}
/**
 * Track message sent
 */
function trackMessageSent(data) {
    capture("message_sent", {
        workspace_id: data.workspaceId,
        sub_chat_id: data.subChatId,
        mode: data.mode,
    });
}
/**
 * Track PR created
 */
function trackPRCreated(data) {
    capture("pr_created", {
        workspace_id: data.workspaceId,
        pr_number: data.prNumber,
        repository: data.repository,
        mode: data.mode,
    });
}
/**
 * Track commit created
 */
function trackCommitCreated(data) {
    capture("commit_created", {
        workspace_id: data.workspaceId,
        files_changed: data.filesChanged,
        mode: data.mode,
    });
}
/**
 * Track sub-chat created
 */
function trackSubChatCreated(data) {
    capture("sub_chat_created", {
        workspace_id: data.workspaceId,
        sub_chat_id: data.subChatId,
    });
}
