"use client";
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
exports.WindowsTitleBar = WindowsTitleBar;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var button_1 = require("./ui/button");
/**
* Windows title bar component for frameless windows
* Provides window controls (minimize, maximize, close) and drag region
*
* Only shown on Windows when using frameless window (useNativeFrame = false)
*/
function WindowsTitleBar() {
    var _this = this;
    var _a;
    var _b = (0, solid_js_1.createSignal)(false), isMaximized = _b[0], setIsMaximized = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), hasNativeFrame = _c[0], setHasNativeFrame = _c[1];
    var isWindows = typeof window !== "undefined" && ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.platform) === "win32";
    // Check actual window frame state
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isWindows || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getWindowFrameState))
            return;
        var checkFrameState = function () { return __awaiter(_this, void 0, void 0, function () {
            var hasFrame, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, window.desktopApi.getWindowFrameState()];
                    case 1:
                        hasFrame = _b.sent();
                        setHasNativeFrame(hasFrame);
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        setHasNativeFrame(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        checkFrameState();
    });
    // Check window maximized state
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isWindows || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowIsMaximized))
            return;
        var checkMaximized = function () { return __awaiter(_this, void 0, void 0, function () {
            var maximized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window.desktopApi.windowIsMaximized()];
                    case 1:
                        maximized = _a.sent();
                        setIsMaximized(maximized);
                        return [2 /*return*/];
                }
            });
        }); };
        checkMaximized();
        var handleFocus = function () { return checkMaximized(); };
        window.addEventListener("focus", handleFocus);
        return function () { return window.removeEventListener("focus", handleFocus); };
    });
    // Don't render on non-Windows or when using native frame
    if (!isWindows || hasNativeFrame)
        return null;
    var handleMinimize = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowMinimize())];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleMaximize = function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowMaximize())];
                case 1:
                    _b.sent();
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var maximized;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowIsMaximized())];
                                case 1:
                                    maximized = _b.sent();
                                    setIsMaximized(maximized !== null && maximized !== void 0 ? maximized : false);
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleClose = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.windowClose())];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return <div class="h-8 flex-shrink-0 flex items-center justify-between bg-background border-b border-border/50" style={{ WebkitAppRegion: "drag" }}>
      {/* Left side - App title (draggable) */}
      <div class="flex items-center gap-2 px-3 h-full">
        <span class="text-xs font-medium text-foreground/70">1Code</span>
      </div>

      {/* Right side - Window controls (non-draggable) */}
      <div class="flex items-center h-full" style={{ WebkitAppRegion: "no-drag" }}>
        <button_1.Button variant="ghost" size="icon" onClick={handleMinimize} class="h-full w-10 rounded-none hover:bg-foreground/10" aria-label="Minimize">
          <lucide_solid_1.Minus class="h-4 w-4"/>
        </button_1.Button>
        <button_1.Button variant="ghost" size="icon" onClick={handleMaximize} class="h-full w-10 rounded-none hover:bg-foreground/10" aria-label={isMaximized ? "Restore" : "Maximize"}>
          <lucide_solid_1.Square class="h-3.5 w-3.5"/>
        </button_1.Button>
        <button_1.Button variant="ghost" size="icon" onClick={handleClose} class="h-full w-10 rounded-none hover:bg-red-500/20 hover:text-red-500" aria-label="Close">
          <lucide_solid_1.X class="h-4 w-4"/>
        </button_1.Button>
      </div>
    </div>;
}
