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
exports.AgentsRenameSubChatDialog = AgentsRenameSubChatDialog;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var button_1 = require("../../../components/ui/button");
var input_1 = require("../../../components/ui/input");
var EASING_CURVE = [
    .55,
    .055,
    .675,
    .19
];
var INTERACTION_DELAY_MS = 250;
function AgentsRenameSubChatDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave, currentName = _a.currentName, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(false), mounted = _c[0], setMounted = _c[1];
    var _d = (0, solid_js_1.createSignal)(currentName), name = _d[0], setName = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), isSaving = _e[0], setIsSaving = _e[1];
    var _f = (0, solid_js_1.createSignal)(0), openAtRef = _f[0], setOpenAtRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), inputRef = _g[0], setInputRef = _g[1];
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
    });
    (0, solid_js_1.createEffect)(function () {
        if (isOpen) {
            openAtRef.current = performance.now();
            setName(currentName);
        }
    });
    var handleAnimationComplete = function () {
        var _a, _b;
        // Focus and select input after animation completes (only if still open)
        if (isOpen) {
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.select();
        }
    };
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                handleClose();
            }
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSave();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    var handleClose = function () {
        var canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
        if (!canInteract || isSaving)
            return;
        onClose();
    };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var trimmedName, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmedName = name.trim();
                    if (!trimmedName || trimmedName === currentName) {
                        handleClose();
                        return [2 /*return*/];
                    }
                    setIsSaving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSave(trimmedName)];
                case 2:
                    _b.sent();
                    handleClose();
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (!mounted)
        return null;
    var portalTarget = typeof document !== "undefined" ? document.body : null;
    if (!portalTarget)
        return null;
    return (0, web_1.createPortal)(<react_1.AnimatePresence mode="wait" initial={false}>
      {isOpen && <>
          {/* Overlay */}
          <react_1.motion.div initial={{ opacity: 0 }} animate={{
                opacity: 1,
                transition: {
                    duration: .18,
                    ease: EASING_CURVE
                }
            }} exit={{
                opacity: 0,
                pointerEvents: "none",
                transition: {
                    duration: .15,
                    ease: EASING_CURVE
                }
            }} class="fixed inset-0 z-[45] bg-black/25" onClick={handleClose} style={{ pointerEvents: "auto" }} data-modal="agents-rename-subchat"/>

          {/* Main Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
            <react_1.motion.div initial={{
                scale: .95,
                opacity: 0
            }} animate={{
                scale: 1,
                opacity: 1
            }} exit={{
                scale: .95,
                opacity: 0
            }} transition={{
                duration: .2,
                ease: EASING_CURVE
            }} onAnimationComplete={handleAnimationComplete} class="w-[90vw] max-w-[400px] pointer-events-auto" onClick={function (e) { return e.stopPropagation(); }}>
              <div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
                <div class="p-6">
                  <h2 class="text-xl font-semibold mb-4">
                    Rename agent
                  </h2>

                  {/* Input */}
                  <input_1.Input ref={inputRef} value={name} onChange={function (e) { return setName(e.target.value); }} placeholder="Chat name" class="w-full h-11 text-sm" disabled={isSaving || isLoading}/>
                </div>

                {/* Footer with buttons */}
                <div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
                  <button_1.Button onClick={handleClose} variant="ghost" disabled={isSaving || isLoading} class="rounded-md">
                    Cancel
                  </button_1.Button>
                  <button_1.Button onClick={handleSave} variant="default" disabled={!name.trim() || name.trim() === currentName || isSaving || isLoading} class="rounded-md">
                    {isSaving || isLoading ? "Saving..." : "Save"}
                  </button_1.Button>
                </div>
              </div>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
