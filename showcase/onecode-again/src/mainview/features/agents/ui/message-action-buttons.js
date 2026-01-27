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
exports.PlayButton = exports.CopyButton = void 0;
exports.getMessageTextContent = getMessageTextContent;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var icons_1 = require("../../../components/ui/icons");
var utils_1 = require("../../../lib/utils");
var api_fetch_1 = require("../../../lib/api-fetch");
var use_haptic_1 = require("../hooks/use-haptic");
var message_store_1 = require("../stores/message-store");
exports.CopyButton = memo(function CopyButton(_a) {
    var text = _a.text, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(false), copied = _c[0], setCopied = _c[1];
    var triggerHaptic = (0, use_haptic_1.useHaptic)().trigger;
    var handleCopy = function () {
        navigator.clipboard.writeText(text);
        triggerHaptic("medium");
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2e3);
    };
    return <button onClick={handleCopy} tabIndex={-1} class="p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]">
      <div class="relative w-3.5 h-3.5">
        <icons_1.CopyIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-0 scale-50" : "opacity-100 scale-100")}/>
        <icons_1.CheckIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied ? "opacity-100 scale-100" : "opacity-0 scale-50")}/>
      </div>
    </button>;
});
exports.PlayButton = memo(function PlayButton(_a) {
    var _this = this;
    var text = _a.text, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)("idle"), state = _c[0], setState = _c[1];
    var playbackRate = (0, jotai_1.useAtom)(message_store_1.ttsPlaybackRateAtom)[0];
    var setPlaybackRate = (0, jotai_1.useSetAtom)(message_store_1.setTtsPlaybackRateAtom);
    var _d = (0, solid_js_1.createSignal)(null), audioRef = _d[0], setAudioRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), mediaSourceRef = _e[0], setMediaSourceRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), sourceBufferRef = _f[0], setSourceBufferRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), abortControllerRef = _g[0], setAbortControllerRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(0), chunkCountRef = _h[0], setChunkCountRef = _h[1];
    // Update playback rate when it changes
    (0, solid_js_1.createEffect)(function () {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    });
    var cleanup = function () {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            if (audioRef.current.src) {
                URL.revokeObjectURL(audioRef.current.src);
            }
        }
        if (mediaSourceRef.current && mediaSourceRef.current.readyState === "open") {
            try {
                mediaSourceRef.current.endOfStream();
            }
            catch (_a) { }
        }
        audioRef.current = null;
        mediaSourceRef.current = null;
        sourceBufferRef.current = null;
        chunkCountRef.current = 0;
    };
    var playWithStreaming = function () { return __awaiter(_this, void 0, void 0, function () {
        var mediaSource, audio, hasStartedPlaying, sourceBuffer, response, reader, pendingChunks, isAppending, appendNextChunk, processStream;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mediaSource = new MediaSource();
                    mediaSourceRef.current = mediaSource;
                    audio = new Audio();
                    audioRef.current = audio;
                    audio.src = URL.createObjectURL(mediaSource);
                    audio.onended = function () {
                        cleanup();
                        setState("idle");
                    };
                    audio.onerror = function () {
                        cleanup();
                        setState("idle");
                    };
                    hasStartedPlaying = false;
                    // Start playback when browser has enough data (canplay event)
                    audio.oncanplay = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (hasStartedPlaying)
                                        return [2 /*return*/];
                                    hasStartedPlaying = true;
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, audio.play()];
                                case 2:
                                    _b.sent();
                                    audio.playbackRate = playbackRate;
                                    setState("playing");
                                    return [3 /*break*/, 4];
                                case 3:
                                    _a = _b.sent();
                                    cleanup();
                                    setState("idle");
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Wait for MediaSource to open
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            mediaSource.addEventListener("sourceopen", function () { return resolve(); }, { once: true });
                            mediaSource.addEventListener("error", function () { return reject(new Error("MediaSource error")); }, { once: true });
                        })];
                case 1:
                    // Wait for MediaSource to open
                    _a.sent();
                    sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
                    sourceBufferRef.current = sourceBuffer;
                    // Create abort controller for this request
                    abortControllerRef.current = new AbortController();
                    return [4 /*yield*/, (0, api_fetch_1.apiFetch)("/api/tts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: text }),
                            signal: abortControllerRef.current.signal
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("TTS request failed");
                    }
                    if (!response.body) {
                        throw new Error("No response body");
                    }
                    reader = response.body.getReader();
                    pendingChunks = [];
                    isAppending = false;
                    appendNextChunk = function () {
                        if (isAppending || pendingChunks.length === 0 || !sourceBufferRef.current || sourceBufferRef.current.updating) {
                            return;
                        }
                        isAppending = true;
                        var chunk = pendingChunks.shift();
                        try {
                            // Use ArrayBuffer.isView to ensure TypeScript knows this is a valid BufferSource
                            var buffer = new Uint8Array(chunk.buffer.slice(0));
                            sourceBufferRef.current.appendBuffer(buffer);
                        }
                        catch (_a) {
                            // Buffer might be full or source closed
                            isAppending = false;
                        }
                    };
                    sourceBuffer.addEventListener("updateend", function () {
                        isAppending = false;
                        appendNextChunk();
                    });
                    processStream = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, done, value;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!true) return [3 /*break*/, 6];
                                    return [4 /*yield*/, reader.read()];
                                case 1:
                                    _a = _b.sent(), done = _a.done, value = _a.value;
                                    if (!done) return [3 /*break*/, 5];
                                    _b.label = 2;
                                case 2:
                                    if (!(pendingChunks.length > 0 || sourceBuffer.updating)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                                case 3:
                                    _b.sent();
                                    return [3 /*break*/, 2];
                                case 4:
                                    if (mediaSource.readyState === "open") {
                                        try {
                                            mediaSource.endOfStream();
                                        }
                                        catch (_c) { }
                                    }
                                    return [3 /*break*/, 6];
                                case 5:
                                    if (value) {
                                        chunkCountRef.current++;
                                        pendingChunks.push(value);
                                        appendNextChunk();
                                    }
                                    return [3 /*break*/, 0];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Start processing stream - playback will start via canplay event
                    processStream();
                    return [2 /*return*/];
            }
        });
    }); };
    var playWithFallback = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, audioBlob, audioUrl, audio;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    abortControllerRef.current = new AbortController();
                    return [4 /*yield*/, (0, api_fetch_1.apiFetch)("/api/tts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: text }),
                            signal: abortControllerRef.current.signal
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("TTS request failed");
                    }
                    return [4 /*yield*/, response.blob()];
                case 2:
                    audioBlob = _a.sent();
                    audioUrl = URL.createObjectURL(audioBlob);
                    audio = new Audio(audioUrl);
                    audioRef.current = audio;
                    audio.onended = function () {
                        cleanup();
                        setState("idle");
                    };
                    audio.onerror = function () {
                        cleanup();
                        setState("idle");
                    };
                    return [4 /*yield*/, audio.play()];
                case 3:
                    _a.sent();
                    // Set playback rate AFTER play() - browser resets it when setting src
                    audio.playbackRate = playbackRate;
                    setState("playing");
                    return [2 /*return*/];
            }
        });
    }); };
    var handlePlay = function () { return __awaiter(_this, void 0, void 0, function () {
        var supportsMediaSource, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If playing, stop the audio
                    if (state === "playing") {
                        cleanup();
                        setState("idle");
                        return [2 /*return*/];
                    }
                    // If loading, cancel and reset
                    if (state === "loading") {
                        cleanup();
                        setState("idle");
                        return [2 /*return*/];
                    }
                    // Start loading
                    setState("loading");
                    chunkCountRef.current = 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    supportsMediaSource = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg");
                    if (!supportsMediaSource) return [3 /*break*/, 3];
                    // Use streaming approach with MediaSource API
                    return [4 /*yield*/, playWithStreaming()];
                case 2:
                    // Use streaming approach with MediaSource API
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: 
                // Fallback: wait for full response (Safari, older browsers)
                return [4 /*yield*/, playWithFallback()];
                case 4:
                    // Fallback: wait for full response (Safari, older browsers)
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    if (error_1.name !== "AbortError") {
                        console.error("[PlayButton] TTS error:", error_1);
                    }
                    cleanup();
                    setState("idle");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Cleanup on unmount
    (0, solid_js_1.createEffect)(function () {
        return cleanup;
    });
    var handleSpeedChange = function () {
        var currentIndex = message_store_1.PLAYBACK_SPEEDS.indexOf(playbackRate);
        var nextIndex = (currentIndex + 1) % message_store_1.PLAYBACK_SPEEDS.length;
        setPlaybackRate(message_store_1.PLAYBACK_SPEEDS[nextIndex]);
    };
    return <div class="relative flex items-center">
      <button onClick={handlePlay} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", state === "loading" && "cursor-wait")}>
        <div class="relative w-3.5 h-3.5">
          {state === "loading" ? <icons_1.IconSpinner class="w-3.5 h-3.5 text-muted-foreground animate-spin"/> : state === "playing" ? <icons_1.PauseIcon class="w-3.5 h-3.5 text-muted-foreground"/> : <icons_1.VolumeIcon class="w-3.5 h-3.5 text-muted-foreground"/>}
        </div>
      </button>

      {/* Speed selector - cyclic button with animation, only visible when playing */}
      {state === "playing" && <button onClick={handleSpeedChange} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", isMobile ? "opacity-100" : "opacity-0 group-hover/message:opacity-100")}>
          <div class="relative w-4 h-3.5 flex items-center justify-center">
            {message_store_1.PLAYBACK_SPEEDS.map(function (speed) { return <span key={speed} class={(0, utils_1.cn)("absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground transition-[opacity,transform] duration-200 ease-out", speed === playbackRate ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                {speed}x
              </span>; })}
          </div>
        </button>}
    </div>;
});
// ============================================================================
// HELPER - Get text content from message
// ============================================================================
function getMessageTextContent(msg) {
    if (!(msg === null || msg === void 0 ? void 0 : msg.parts))
        return "";
    return msg.parts.filter(function (p) { return p.type === "text"; }).map(function (p) { return p.text || ""; }).join("\n");
}
