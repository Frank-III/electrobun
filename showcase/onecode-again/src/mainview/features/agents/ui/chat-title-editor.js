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
exports.ChatTitleEditor = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var utils_1 = require("../../../lib/utils");
var typewriter_text_1 = require("../../../components/ui/typewriter-text");
var atoms_1 = require("../atoms");
// Custom comparison to prevent re-renders during streaming
function areTitlePropsEqual(prev, next) {
    return prev.name === next.name && prev.placeholder === next.placeholder && prev.isMobile === next.isMobile && prev.disabled === next.disabled && prev.chatId === next.chatId && prev.hasMessages === next.hasMessages;
}
exports.ChatTitleEditor = memo(function ChatTitleEditor(_a) {
    var _this = this;
    var name = _a.name, _b = _a.placeholder, placeholder = _b === void 0 ? "New Chat" : _b, onSave = _a.onSave, _c = _a.isMobile, isMobile = _c === void 0 ? false : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, chatId = _a.chatId, _e = _a.hasMessages, hasMessages = _e === void 0 ? false : _e;
    var _f = (0, solid_js_1.createSignal)(false), isEditing = _f[0], setIsEditing = _f[1];
    var _g = (0, solid_js_1.createSignal)(name), editValue = _g[0], setEditValue = _g[1];
    var _h = (0, solid_js_1.createSignal)(false), isSaving = _h[0], setIsSaving = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), inputRef = _j[0], setInputRef = _j[1];
    var _k = (0, solid_js_1.createSignal)(null), containerRef = _k[0], setContainerRef = _k[1];
    var justCreatedIds = (0, jotai_1.useAtomValue)(atoms_1.justCreatedIdsAtom);
    // Sync editValue when name changes externally
    (0, solid_js_1.createEffect)(function () {
        if (!isEditing) {
            setEditValue(name);
        }
    });
    // Auto-focus and select text when editing starts
    (0, solid_js_1.createEffect)(function () {
        if (isEditing && inputRef.current) {
            var timeoutId_1 = setTimeout(function () {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 0);
            return function () { return clearTimeout(timeoutId_1); };
        }
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var trimmedValue, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmedValue = editValue.trim();
                    // If empty or unchanged, just cancel
                    if (!trimmedValue || trimmedValue === name) {
                        setEditValue(name);
                        setIsEditing(false);
                        return [2 /*return*/];
                    }
                    setIsSaving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSave(trimmedValue)];
                case 2:
                    _b.sent();
                    setIsEditing(false);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    // On error, revert to original name
                    setEditValue(name);
                    setIsEditing(false);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () {
        setEditValue(name);
        setIsEditing(false);
    };
    // Handle clicks outside to save
    (0, solid_js_1.createEffect)(function () {
        if (!isEditing)
            return;
        var handleClickOutside = function (event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                handleSave();
            }
        };
        // Add delay to avoid immediate trigger
        var timeoutId = setTimeout(function () {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);
        return function () {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });
    var handleKeyDown = function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            handleCancel();
        }
    };
    var isJustCreated = chatId ? justCreatedIds().has(chatId) : false;
    var hasRealName = name && name !== placeholder;
    var handleClick = function () {
        // Don't allow editing if disabled or if it's a placeholder (not saved to DB yet)
        if (!disabled && !isEditing && hasRealName) {
            setIsEditing(true);
        }
    };
    // Fixed height to prevent layout shift when switching between view/edit modes
    var heightClass = isMobile ? "h-7" : "h-7";
    return <div ref={containerRef} class={(0, utils_1.cn)("max-w-2xl mx-auto px-4", heightClass)}>
      {isEditing ? <input ref={inputRef} type="text" value={editValue} onChange={function (e) { return setEditValue(e.target.value); }} onKeyDown={handleKeyDown} disabled={isSaving} placeholder={placeholder} class={(0, utils_1.cn)("w-full h-full bg-transparent border-0 outline-none", isMobile ? "text-base" : "text-lg", "font-medium text-foreground")}/> : <div onClick={handleClick} class={(0, utils_1.cn)("text-left w-full h-full", isMobile ? "text-base" : "text-lg", "font-medium", hasRealName ? "text-foreground cursor-pointer" : "cursor-default")}>
          <span class="block truncate">
            <typewriter_text_1.TypewriterText text={name} placeholder={placeholder} id={chatId} isJustCreated={isJustCreated} showPlaceholder={hasMessages}/>
          </span>
        </div>}
    </div>;
}, areTitlePropsEqual);
