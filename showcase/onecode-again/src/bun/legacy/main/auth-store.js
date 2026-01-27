"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStore = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var electron_1 = require("electron");
/**
 * Storage for desktop authentication tokens
 * Uses Electron's safeStorage API to encrypt sensitive data using OS keychain
 * Falls back to plaintext only if encryption is unavailable (rare edge case)
 */
var AuthStore = /** @class */ (function () {
    function AuthStore(userDataPath) {
        this.filePath = (0, path_1.join)(userDataPath, "auth.dat"); // .dat for encrypted data
    }
    /**
     * Check if encryption is available on this system
     */
    AuthStore.prototype.isEncryptionAvailable = function () {
        return electron_1.safeStorage.isEncryptionAvailable();
    };
    /**
     * Save authentication data (encrypted if possible)
     */
    AuthStore.prototype.save = function (data) {
        try {
            var dir = (0, path_1.dirname)(this.filePath);
            if (!(0, fs_1.existsSync)(dir)) {
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            }
            var jsonData = JSON.stringify(data);
            if (this.isEncryptionAvailable()) {
                // Encrypt using OS keychain (macOS Keychain, Windows DPAPI, Linux Secret Service)
                var encrypted = electron_1.safeStorage.encryptString(jsonData);
                (0, fs_1.writeFileSync)(this.filePath, encrypted);
            }
            else {
                // Fallback: store with warning (should rarely happen)
                console.warn("safeStorage not available - storing auth data without encryption");
                (0, fs_1.writeFileSync)(this.filePath + ".json", jsonData, "utf-8");
            }
        }
        catch (error) {
            console.error("Failed to save auth data:", error);
            throw error;
        }
    };
    /**
     * Load authentication data (decrypts if encrypted)
     */
    AuthStore.prototype.load = function () {
        try {
            // Try encrypted file first
            if ((0, fs_1.existsSync)(this.filePath) && this.isEncryptionAvailable()) {
                var encrypted = (0, fs_1.readFileSync)(this.filePath);
                var decrypted = electron_1.safeStorage.decryptString(encrypted);
                return JSON.parse(decrypted);
            }
            // Fallback: try unencrypted file (for migration or when encryption unavailable)
            var fallbackPath = this.filePath + ".json";
            if ((0, fs_1.existsSync)(fallbackPath)) {
                var content = (0, fs_1.readFileSync)(fallbackPath, "utf-8");
                var data = JSON.parse(content);
                // Migrate to encrypted storage if now available
                if (this.isEncryptionAvailable()) {
                    this.save(data);
                    (0, fs_1.unlinkSync)(fallbackPath); // Remove unencrypted file after migration
                }
                return data;
            }
            // Legacy: check for old auth.json file and migrate
            var legacyPath = (0, path_1.join)((0, path_1.dirname)(this.filePath), "auth.json");
            if ((0, fs_1.existsSync)(legacyPath)) {
                var content = (0, fs_1.readFileSync)(legacyPath, "utf-8");
                var data = JSON.parse(content);
                // Migrate to encrypted storage
                this.save(data);
                (0, fs_1.unlinkSync)(legacyPath); // Remove legacy unencrypted file
                console.log("Migrated auth data from plaintext to encrypted storage");
                return data;
            }
            return null;
        }
        catch (_a) {
            console.error("Failed to load auth data");
            return null;
        }
    };
    /**
     * Clear all stored authentication data (both encrypted and fallback files)
     */
    AuthStore.prototype.clear = function () {
        try {
            // Remove encrypted file
            if ((0, fs_1.existsSync)(this.filePath)) {
                (0, fs_1.unlinkSync)(this.filePath);
            }
            // Remove fallback unencrypted file if exists
            var fallbackPath = this.filePath + ".json";
            if ((0, fs_1.existsSync)(fallbackPath)) {
                (0, fs_1.unlinkSync)(fallbackPath);
            }
            // Remove legacy file if exists
            var legacyPath = (0, path_1.join)((0, path_1.dirname)(this.filePath), "auth.json");
            if ((0, fs_1.existsSync)(legacyPath)) {
                (0, fs_1.unlinkSync)(legacyPath);
            }
        }
        catch (error) {
            console.error("Failed to clear auth data:", error);
        }
    };
    /**
     * Check if user is authenticated
     */
    AuthStore.prototype.isAuthenticated = function () {
        var data = this.load();
        if (!data)
            return false;
        // Check if token is expired
        var expiresAt = new Date(data.expiresAt).getTime();
        return expiresAt > Date.now();
    };
    /**
     * Get current user if authenticated
     */
    AuthStore.prototype.getUser = function () {
        var _a;
        var data = this.load();
        return (_a = data === null || data === void 0 ? void 0 : data.user) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * Get current token if valid
     */
    AuthStore.prototype.getToken = function () {
        var data = this.load();
        if (!data)
            return null;
        var expiresAt = new Date(data.expiresAt).getTime();
        if (expiresAt <= Date.now())
            return null;
        return data.token;
    };
    /**
     * Get refresh token
     */
    AuthStore.prototype.getRefreshToken = function () {
        var _a;
        var data = this.load();
        return (_a = data === null || data === void 0 ? void 0 : data.refreshToken) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * Check if token needs refresh (expires in less than 5 minutes)
     */
    AuthStore.prototype.needsRefresh = function () {
        var data = this.load();
        if (!data)
            return false;
        var expiresAt = new Date(data.expiresAt).getTime();
        var fiveMinutes = 5 * 60 * 1000;
        return expiresAt - Date.now() < fiveMinutes;
    };
    /**
     * Update user data (e.g., after profile update)
     */
    AuthStore.prototype.updateUser = function (updates) {
        var data = this.load();
        if (!data)
            return null;
        data.user = __assign(__assign({}, data.user), updates);
        this.save(data);
        return data.user;
    };
    return AuthStore;
}());
exports.AuthStore = AuthStore;
