"use strict";
/**
 * Desktop notifications hook - provides native OS notifications for agent events.
 * Uses Electron's Notification API via the IPC bridge in desktopApi.
 */
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
exports.useDesktopNotifications = useDesktopNotifications;
var react_1 = require("react");
var jotai_1 = require("../../../lib/state/jotai");
var platform_1 = require("../../../lib/utils/platform");
var atoms_1 = require("../../../lib/atoms");
// throttle interval to prevent notification spam (ms)
var NOTIFICATION_THROTTLE_MS = 3000;
// priority levels for notifications (higher = more important)
var NOTIFICATION_PRIORITY = {
    error: 3,
    input: 2,
    plan: 1,
    complete: 0,
};
function useDesktopNotifications() {
    var _this = this;
    var notificationsEnabled = (0, jotai_1.useAtomValue)(atoms_1.desktopNotificationsEnabledAtom);
    // track last notification time to throttle rapid-fire notifications
    var lastNotificationTime = (0, react_1.useRef)(0);
    var pendingNotification = (0, react_1.useRef)(null);
    var throttleTimer = (0, react_1.useRef)(null);
    // Cleanup timer on unmount to prevent memory leak
    (0, react_1.useEffect)(function () {
        return function () {
            if (throttleTimer.current) {
                clearTimeout(throttleTimer.current);
                throttleTimer.current = null;
            }
        };
    }, []);
    var showNotification = (0, react_1.useCallback)(function (title, body, options) {
        var _a, _b;
        // Check if notifications are enabled
        if (!notificationsEnabled) {
            return;
        }
        if (!(0, platform_1.isDesktopApp)()) {
            // fallback for web - use browser Notification API if available
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(title, { body: body, silent: options === null || options === void 0 ? void 0 : options.silent });
            }
            return;
        }
        var now = Date.now();
        var timeSinceLastNotification = now - lastNotificationTime.current;
        var currentPriority = (options === null || options === void 0 ? void 0 : options.priority) ? NOTIFICATION_PRIORITY[options.priority] : 0;
        // if we're within throttle window, check priority
        if (timeSinceLastNotification < NOTIFICATION_THROTTLE_MS) {
            var pendingPriority = ((_a = pendingNotification.current) === null || _a === void 0 ? void 0 : _a.priority)
                ? NOTIFICATION_PRIORITY[pendingNotification.current.priority]
                : 0;
            // Only queue if higher or equal priority than pending
            if (currentPriority >= pendingPriority) {
                pendingNotification.current = { title: title, body: body, silent: options === null || options === void 0 ? void 0 : options.silent, priority: options === null || options === void 0 ? void 0 : options.priority };
            }
            // set up a timer to show the pending notification after throttle period
            if (!throttleTimer.current) {
                throttleTimer.current = setTimeout(function () {
                    var _a;
                    throttleTimer.current = null;
                    if (pendingNotification.current) {
                        var pending = pendingNotification.current;
                        pendingNotification.current = null;
                        // Directly send notification without recursive call to avoid re-throttling
                        lastNotificationTime.current = Date.now();
                        (_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.showNotification({ title: pending.title, body: pending.body });
                    }
                }, NOTIFICATION_THROTTLE_MS - timeSinceLastNotification);
            }
            return;
        }
        lastNotificationTime.current = now;
        // use the IPC bridge to show native notification
        (_b = window.desktopApi) === null || _b === void 0 ? void 0 : _b.showNotification({ title: title, body: body });
    }, [notificationsEnabled]);
    var notifyAgentComplete = (0, react_1.useCallback)(function (chatName) {
        // don't notify if window is focused - user is already watching
        if (document.hasFocus()) {
            return;
        }
        var title = "Agent Complete";
        var body = chatName ? "Finished working on \"".concat(chatName, "\"") : "Agent has completed its task";
        showNotification(title, body, { priority: "complete" });
    }, [showNotification]);
    var notifyAgentError = (0, react_1.useCallback)(function (errorMessage) {
        // always notify on errors, even if window is focused
        var title = "Agent Error";
        var body = errorMessage.length > 100 ? errorMessage.slice(0, 100) + "..." : errorMessage;
        showNotification(title, body, { priority: "error" });
    }, [showNotification]);
    var notifyAgentNeedsInput = (0, react_1.useCallback)(function (chatName) {
        // don't notify if window is focused
        if (document.hasFocus()) {
            return;
        }
        var title = "Input Required";
        var body = chatName ? "\"".concat(chatName, "\" is waiting for your input") : "Agent is waiting for your input";
        showNotification(title, body, { priority: "input" });
    }, [showNotification]);
    var notifyPlanReady = (0, react_1.useCallback)(function (chatName) {
        // don't notify if window is focused
        if (document.hasFocus()) {
            return;
        }
        var title = "Plan Ready";
        var body = chatName ? "\"".concat(chatName, "\" has a plan ready for approval") : "A plan is ready for your approval";
        showNotification(title, body, { priority: "plan" });
    }, [showNotification]);
    var requestPermission = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, platform_1.isDesktopApp)()) {
                        // desktop apps don't need explicit permission for notifications
                        return [2 /*return*/, "granted"];
                    }
                    if (!("Notification" in window)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Notification.requestPermission()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, "denied"];
            }
        });
    }); }, []);
    return {
        showNotification: showNotification,
        notifyAgentComplete: notifyAgentComplete,
        notifyAgentError: notifyAgentError,
        notifyAgentNeedsInput: notifyAgentNeedsInput,
        notifyPlanReady: notifyPlanReady,
        requestPermission: requestPermission,
    };
}
