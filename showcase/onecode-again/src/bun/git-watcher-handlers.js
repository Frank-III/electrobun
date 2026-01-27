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
exports.createGitWatcherHandlers = createGitWatcherHandlers;
var git_watcher_1 = require("./git-watcher");
var activeSubscriptions = new Map();
function createGitWatcherHandlers(sendStatusChanged) {
    var _this = this;
    return {
        gitWatcherSubscribe: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var unsubscribe;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!worktreePath)
                            return [2 /*return*/, { success: false }];
                        if (activeSubscriptions.has(worktreePath))
                            return [2 /*return*/, { success: true }];
                        return [4 /*yield*/, git_watcher_1.gitWatcherRegistry.subscribe(worktreePath, function (event) {
                                sendStatusChanged(event);
                            })];
                    case 1:
                        unsubscribe = _c.sent();
                        activeSubscriptions.set(worktreePath, { unsubscribe: unsubscribe });
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
        gitWatcherUnsubscribe: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var subscription;
            var worktreePath = _b.worktreePath;
            return __generator(this, function (_c) {
                subscription = activeSubscriptions.get(worktreePath);
                if (subscription) {
                    subscription.unsubscribe();
                    activeSubscriptions.delete(worktreePath);
                }
                return [2 /*return*/, { success: true }];
            });
        }); },
        gitWatcherDisposeAll: function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, subscription;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        for (_i = 0, _a = activeSubscriptions.values(); _i < _a.length; _i++) {
                            subscription = _a[_i];
                            subscription.unsubscribe();
                        }
                        activeSubscriptions.clear();
                        return [4 /*yield*/, git_watcher_1.gitWatcherRegistry.disposeAll()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        }); },
    };
}
