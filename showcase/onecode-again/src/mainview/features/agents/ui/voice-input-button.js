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
exports.VoiceInputButton = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../../lib/utils");
var trpc_1 = require("../../../lib/trpc");
var use_voice_recording_1 = require("../../../lib/hooks/use-voice-recording");
/**
* Voice input button with hold-to-talk functionality
*
* Hold down the button to record, release to transcribe.
* Uses OpenAI Whisper API for transcription.
*/
exports.VoiceInputButton = memo(function VoiceInputButton(_a) {
    var _this = this;
    var onTranscript = _a.onTranscript, _b = _a.disabled, disabled = _b === void 0 ? false : _b, className = _a.className;
    var _c = (0, use_voice_recording_1.useVoiceRecording)(), isRecording = _c.isRecording, startRecording = _c.startRecording, stopRecording = _c.stopRecording, cancelRecording = _c.cancelRecording, error = _c.error;
    var _d = (0, solid_js_1.createSignal)(false), isTranscribing = _d[0], setIsTranscribing = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), transcribeError = _e[0], setTranscribeError = _e[1];
    // Track if we're using touch to prevent duplicate mouse events
    var _f = (0, solid_js_1.createSignal)(false), isTouchRef = _f[0], setIsTouchRef = _f[1];
    // Ref to track if component is mounted (for async operations)
    var _g = (0, solid_js_1.createSignal)(true), isMountedRef = _g[0], setIsMountedRef = _g[1];
    (0, solid_js_1.createEffect)(function () {
        isMountedRef.current = true;
        return function () {
            isMountedRef.current = false;
        };
    });
    var transcribeMutation = trpc_1.trpc.voice.transcribe.useMutation({ onError: function (err) {
            console.error("[VoiceInput] Transcription error:", err);
            if (isMountedRef.current) {
                setTranscribeError(err.message);
            }
        } });
    var handleStart = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (disabled || isTranscribing || isRecording)
                        return [2 /*return*/];
                    setTranscribeError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, startRecording()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("[VoiceInput] Failed to start recording:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEnd = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, base64, format, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isRecording)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, stopRecording()];
                case 2:
                    blob = _a.sent();
                    // Don't transcribe very short recordings (likely accidental clicks)
                    if (blob.size < 1e3) {
                        console.log("[VoiceInput] Recording too short, ignoring");
                        return [2 /*return*/];
                    }
                    if (!isMountedRef.current)
                        return [2 /*return*/];
                    setIsTranscribing(true);
                    return [4 /*yield*/, (0, use_voice_recording_1.blobToBase64)(blob)];
                case 3:
                    base64 = _a.sent();
                    format = (0, use_voice_recording_1.getAudioFormat)(blob.type);
                    return [4 /*yield*/, transcribeMutation.mutateAsync({
                            audio: base64,
                            format: format
                        })];
                case 4:
                    result = _a.sent();
                    if (!isMountedRef.current)
                        return [2 /*return*/];
                    if (result.text && result.text.trim()) {
                        onTranscript(result.text.trim());
                    }
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _a.sent();
                    console.error("[VoiceInput] Transcription failed:", err_2);
                    return [3 /*break*/, 7];
                case 6:
                    if (isMountedRef.current) {
                        setIsTranscribing(false);
                    }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Mouse handlers - skip if touch was used
    var handleMouseDown = function () {
        if (isTouchRef.current) {
            isTouchRef.current = false;
            return;
        }
        handleStart();
    };
    var handleMouseUp = function () {
        if (isTouchRef.current)
            return;
        handleEnd();
    };
    var handleMouseLeave = function () {
        if (isTouchRef.current)
            return;
        if (isRecording) {
            // Cancel instead of transcribing when leaving button area
            cancelRecording();
        }
    };
    // Touch handlers - set flag to prevent mouse events
    var handleTouchStart = function () {
        isTouchRef.current = true;
        handleStart();
    };
    var handleTouchEnd = function () {
        handleEnd();
    };
    var isLoading = isTranscribing || transcribeMutation.isPending;
    var hasError = !!error || !!transcribeError;
    return <button type="button" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} disabled={disabled || isLoading} title={hasError ? transcribeError || (error === null || error === void 0 ? void 0 : error.message) || "Voice input error" : isRecording ? "Release to transcribe" : "Hold to record"} class={(0, utils_1.cn)("relative p-1.5 rounded-md transition-all duration-150 ease-out", "hover:bg-accent active:scale-[0.97]", "disabled:opacity-50 disabled:cursor-not-allowed", isRecording && "bg-red-500/20 ring-2 ring-red-500", isLoading && "bg-yellow-500/20", hasError && "bg-red-500/10", className)}>
      <div class="relative w-4 h-4">
        {isLoading ? <lucide_solid_1.Loader2 class="w-4 h-4 text-muted-foreground animate-spin"/> : <lucide_solid_1.Mic class={(0, utils_1.cn)("w-4 h-4 transition-colors", isRecording ? "text-red-500 animate-pulse" : hasError ? "text-red-500/70" : "text-muted-foreground")}/>}
      </div>

      {/* Recording indicator dot */}
      {isRecording && <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
    </button>;
});
