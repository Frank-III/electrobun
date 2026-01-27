"use strict";
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
exports.AuthManager = void 0;
exports.initAuthManager = initAuthManager;
exports.getAuthManager = getAuthManager;
var auth_store_1 = require("./auth-store");
var electron_1 = require("electron");
var constants_1 = require("./constants");
// Get API URL - in packaged app always use production, in dev allow override
function getApiBaseUrl() {
    if (electron_1.app.isPackaged) {
        return "https://21st.dev";
    }
    return import.meta.env.MAIN_VITE_API_URL || "https://21st.dev";
}
var AuthManager = /** @class */ (function () {
    function AuthManager(isDev) {
        if (isDev === void 0) { isDev = false; }
        this.store = new auth_store_1.AuthStore(electron_1.app.getPath("userData"));
        this.isDev = isDev;
        // Schedule refresh if already authenticated
        if (this.store.isAuthenticated()) {
            this.scheduleRefresh();
        }
    }
    /**
     * Set callback to be called when token is refreshed
     * This allows the main process to update cookies when tokens change
     */
    AuthManager.prototype.setOnTokenRefresh = function (callback) {
        this.onTokenRefresh = callback;
    };
    AuthManager.prototype.getApiUrl = function () {
        return getApiBaseUrl();
    };
    /**
     * Exchange auth code for session tokens
     * Called after receiving code via deep link
     */
    AuthManager.prototype.exchangeCode = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error, data, authData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.getApiUrl(), "/api/auth/desktop/exchange"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                code: code,
                                deviceInfo: this.getDeviceInfo(),
                            }),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({ error: "Unknown error" }); })];
                    case 2:
                        error = _a.sent();
                        throw new Error(error.error || "Exchange failed: ".concat(response.status));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        authData = {
                            token: data.token,
                            refreshToken: data.refreshToken,
                            expiresAt: data.expiresAt,
                            user: data.user,
                        };
                        this.store.save(authData);
                        this.scheduleRefresh();
                        return [2 /*return*/, authData];
                }
            });
        });
    };
    /**
     * Get device info for session tracking
     */
    AuthManager.prototype.getDeviceInfo = function () {
        var platform = process.platform;
        var arch = process.arch;
        var version = electron_1.app.getVersion();
        return "21st Desktop ".concat(version, " (").concat(platform, " ").concat(arch, ")");
    };
    /**
     * Get a valid token, refreshing if necessary
     */
    AuthManager.prototype.getValidToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.store.isAuthenticated()) {
                            return [2 /*return*/, null];
                        }
                        if (!this.store.needsRefresh()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refresh()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.store.getToken()];
                }
            });
        });
    };
    /**
     * Refresh the current session
     */
    AuthManager.prototype.refresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, response, data, authData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        refreshToken = this.store.getRefreshToken();
                        if (!refreshToken) {
                            console.warn("No refresh token available");
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.getApiUrl(), "/api/auth/desktop/refresh"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ refreshToken: refreshToken }),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            console.error("Refresh failed:", response.status);
                            // If refresh fails, clear auth and require re-login
                            if (response.status === 401) {
                                this.logout();
                            }
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        authData = {
                            token: data.token,
                            refreshToken: data.refreshToken,
                            expiresAt: data.expiresAt,
                            user: data.user,
                        };
                        this.store.save(authData);
                        this.scheduleRefresh();
                        // Notify callback about token refresh (so cookie can be updated)
                        if (this.onTokenRefresh) {
                            this.onTokenRefresh(authData);
                        }
                        return [2 /*return*/, true];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Refresh error:", error_1);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule token refresh before expiration
     */
    AuthManager.prototype.scheduleRefresh = function () {
        var _this = this;
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        var authData = this.store.load();
        if (!authData)
            return;
        var expiresAt = new Date(authData.expiresAt).getTime();
        var now = Date.now();
        // Refresh 5 minutes before expiration
        var refreshIn = Math.max(0, expiresAt - now - 5 * 60 * 1000);
        this.refreshTimer = setTimeout(function () {
            _this.refresh();
        }, refreshIn);
        console.log("Scheduled token refresh in ".concat(Math.round(refreshIn / 1000 / 60), " minutes"));
    };
    /**
     * Check if user is authenticated
     */
    AuthManager.prototype.isAuthenticated = function () {
        return this.store.isAuthenticated();
    };
    /**
     * Get current user
     */
    AuthManager.prototype.getUser = function () {
        return this.store.getUser();
    };
    /**
     * Get current auth data
     */
    AuthManager.prototype.getAuth = function () {
        return this.store.load();
    };
    /**
     * Logout and clear stored credentials
     */
    AuthManager.prototype.logout = function () {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        this.store.clear();
    };
    /**
     * Start auth flow by opening browser
     */
    AuthManager.prototype.startAuthFlow = function (mainWindow) {
        var shell = require("electron").shell;
        var authUrl = "".concat(this.getApiUrl(), "/auth/desktop?auto=true");
        // In dev mode, use localhost callback (we run HTTP server on AUTH_SERVER_PORT)
        // Also pass the protocol so web knows which deep link to use as fallback
        if (this.isDev) {
            authUrl += "&callback=".concat(encodeURIComponent("http://localhost:".concat(constants_1.AUTH_SERVER_PORT, "/auth/callback")));
            // Pass dev protocol so production web can use correct deep link if callback fails
            authUrl += "&protocol=twentyfirst-agents-dev";
        }
        shell.openExternal(authUrl);
    };
    /**
     * Update user profile on server and locally
     */
    AuthManager.prototype.updateUser = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, error;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getValidToken()];
                    case 1:
                        token = _b.sent();
                        if (!token) {
                            throw new Error("Not authenticated");
                        }
                        return [4 /*yield*/, fetch("".concat(this.getApiUrl(), "/api/user/profile"), {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-Desktop-Token": token,
                                },
                                body: JSON.stringify({
                                    display_name: updates.name,
                                }),
                            })];
                    case 2:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json().catch(function () { return ({ error: "Unknown error" }); })];
                    case 3:
                        error = _b.sent();
                        throw new Error(error.error || "Update failed: ".concat(response.status));
                    case 4: 
                    // Update locally
                    return [2 /*return*/, this.store.updateUser({ name: (_a = updates.name) !== null && _a !== void 0 ? _a : null })];
                }
            });
        });
    };
    /**
     * Fetch user's subscription plan from web backend
     * Used for PostHog analytics enrichment
     */
    AuthManager.prototype.fetchUserPlan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getValidToken()];
                    case 1:
                        token = _a.sent();
                        if (!token)
                            return [2 /*return*/, null];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.getApiUrl(), "/api/desktop/user/plan"), {
                                headers: { "X-Desktop-Token": token },
                            })];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) {
                            console.error("[AuthManager] Failed to fetch user plan:", response.status);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, response.json()];
                    case 4:
                        error_2 = _a.sent();
                        console.error("[AuthManager] Failed to fetch user plan:", error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AuthManager;
}());
exports.AuthManager = AuthManager;
// Global singleton instance
var authManagerInstance = null;
/**
 * Initialize the global auth manager instance
 * Must be called once from main process initialization
 */
function initAuthManager(isDev) {
    if (isDev === void 0) { isDev = false; }
    if (!authManagerInstance) {
        authManagerInstance = new AuthManager(isDev);
    }
    return authManagerInstance;
}
/**
 * Get the global auth manager instance
 * Returns null if not initialized
 */
function getAuthManager() {
    return authManagerInstance;
}
