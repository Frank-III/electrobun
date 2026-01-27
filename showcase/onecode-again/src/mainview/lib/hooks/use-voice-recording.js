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
exports.useVoiceRecording = useVoiceRecording;
exports.blobToBase64 = blobToBase64;
exports.getAudioFormat = getAudioFormat;
var react_1 = require("react");
/**
 * Hook for managing voice recording using MediaRecorder API
 *
 * Usage:
 * ```tsx
 * const { isRecording, startRecording, stopRecording, error } = useVoiceRecording()
 *
 * // Start recording (e.g., on mouse down)
 * await startRecording()
 *
 * // Stop recording and get audio blob (e.g., on mouse up)
 * const blob = await stopRecording()
 * ```
 */
function useVoiceRecording() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isRecording = _a[0], setIsRecording = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _c = (0, react_1.useState)(0), audioLevel = _c[0], setAudioLevel = _c[1];
    var mediaRecorderRef = (0, react_1.useRef)(null);
    var chunksRef = (0, react_1.useRef)([]);
    var streamRef = (0, react_1.useRef)(null);
    var isStartingRef = (0, react_1.useRef)(false); // Prevent race conditions
    // Audio analysis refs
    var audioContextRef = (0, react_1.useRef)(null);
    var analyserRef = (0, react_1.useRef)(null);
    var animationFrameRef = (0, react_1.useRef)(null);
    // Cleanup function to stop all tracks and reset state
    var cleanup = (0, react_1.useCallback)(function () {
        // Stop animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        // Clean up audio analysis
        if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close().catch(function () { });
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(function (track) { return track.stop(); });
            streamRef.current = null;
        }
        if (mediaRecorderRef.current) {
            if (mediaRecorderRef.current.state !== "inactive") {
                try {
                    mediaRecorderRef.current.stop();
                }
                catch (_a) {
                    // Ignore errors during cleanup
                }
            }
            mediaRecorderRef.current = null;
        }
        chunksRef.current = [];
        isStartingRef.current = false;
        setAudioLevel(0);
    }, []);
    // Cleanup on unmount
    (0, react_1.useEffect)(function () {
        return function () {
            cleanup();
            setIsRecording(false);
        };
    }, [cleanup]);
    // Cancel recording without returning a blob
    var cancelRecording = (0, react_1.useCallback)(function () {
        cleanup();
        setIsRecording(false);
    }, [cleanup]);
    var startRecording = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, audioContext, analyser, source, dataArray_1, updateLevel_1, mimeType, mediaRecorder, err_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Prevent multiple simultaneous starts
                    if (isStartingRef.current || mediaRecorderRef.current) {
                        console.warn("[VoiceRecording] Already recording or starting");
                        return [2 /*return*/];
                    }
                    isStartingRef.current = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setError(null);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                sampleRate: 16000, // Whisper works well with 16kHz
                            },
                        })];
                case 2:
                    stream = _a.sent();
                    streamRef.current = stream;
                    // Set up audio analysis for visualization
                    try {
                        audioContext = new AudioContext();
                        analyser = audioContext.createAnalyser();
                        analyser.fftSize = 256;
                        analyser.smoothingTimeConstant = 0.5;
                        source = audioContext.createMediaStreamSource(stream);
                        source.connect(analyser);
                        audioContextRef.current = audioContext;
                        analyserRef.current = analyser;
                        dataArray_1 = new Uint8Array(analyser.frequencyBinCount);
                        updateLevel_1 = function () {
                            var _a;
                            if (!analyserRef.current)
                                return;
                            analyserRef.current.getByteFrequencyData(dataArray_1);
                            // Calculate average amplitude from frequency data
                            var sum = 0;
                            for (var i = 0; i < dataArray_1.length; i++) {
                                sum += (_a = dataArray_1[i]) !== null && _a !== void 0 ? _a : 0;
                            }
                            var average = sum / dataArray_1.length;
                            // Normalize to 0-1 with stronger amplification for better visibility
                            // Using power curve to make quiet sounds more visible
                            var raw = average / 255;
                            var amplified = Math.pow(raw, 0.6) * 2.5; // Power curve + strong amplification
                            var normalized = Math.min(1, amplified);
                            setAudioLevel(normalized);
                            animationFrameRef.current = requestAnimationFrame(updateLevel_1);
                        };
                        updateLevel_1();
                    }
                    catch (err) {
                        console.warn("[VoiceRecording] Failed to set up audio analysis:", err);
                        // Continue without audio level - recording still works
                    }
                    mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                        ? "audio/webm;codecs=opus"
                        : MediaRecorder.isTypeSupported("audio/webm")
                            ? "audio/webm"
                            : "audio/mp4" // Fallback for Safari
                    ;
                    mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
                    chunksRef.current = [];
                    mediaRecorder.ondataavailable = function (event) {
                        if (event.data.size > 0) {
                            chunksRef.current.push(event.data);
                        }
                    };
                    mediaRecorderRef.current = mediaRecorder;
                    mediaRecorder.start(100); // Collect data every 100ms
                    setIsRecording(true);
                    isStartingRef.current = false;
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    isStartingRef.current = false;
                    cleanup();
                    if (err_1 instanceof Error) {
                        if (err_1.name === "NotAllowedError" || err_1.name === "PermissionDeniedError") {
                            error_1 = new Error("Microphone access denied. Please allow microphone access in System Preferences.");
                        }
                        else if (err_1.name === "NotFoundError" || err_1.name === "DevicesNotFoundError") {
                            error_1 = new Error("No microphone found. Please connect a microphone.");
                        }
                        else if (err_1.name === "NotReadableError" || err_1.name === "TrackStartError") {
                            error_1 = new Error("Microphone is in use by another application.");
                        }
                        else {
                            error_1 = err_1;
                        }
                    }
                    else {
                        error_1 = new Error("Failed to start recording");
                    }
                    setError(error_1);
                    console.error("[VoiceRecording] Start error:", error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [cleanup]);
    var stopRecording = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var mediaRecorder = mediaRecorderRef.current;
                    if (!mediaRecorder || mediaRecorder.state === "inactive") {
                        var error_2 = new Error("No active recording");
                        setError(error_2);
                        reject(error_2);
                        return;
                    }
                    // Store mimeType before stopping (some browsers clear it after stop)
                    var mimeType = mediaRecorder.mimeType || "audio/webm";
                    mediaRecorder.onstop = function () {
                        var blob = new Blob(chunksRef.current, { type: mimeType });
                        // Clean up
                        cleanup();
                        setIsRecording(false);
                        resolve(blob);
                    };
                    mediaRecorder.onerror = function () {
                        var error = new Error("Recording error");
                        setError(error);
                        cleanup();
                        setIsRecording(false);
                        reject(error);
                    };
                    mediaRecorder.stop();
                })];
        });
    }); }, [cleanup]);
    return {
        isRecording: isRecording,
        error: error,
        audioLevel: audioLevel,
        startRecording: startRecording,
        stopRecording: stopRecording,
        cancelRecording: cancelRecording,
    };
}
/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var result = reader.result;
                        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
                        var base64 = result.split(",")[1];
                        if (base64) {
                            resolve(base64);
                        }
                        else {
                            reject(new Error("Failed to convert blob to base64"));
                        }
                    };
                    reader.onerror = function () { return reject(new Error("Failed to read blob")); };
                    reader.readAsDataURL(blob);
                })];
        });
    });
}
/**
 * Get audio format from mime type
 */
function getAudioFormat(mimeType) {
    if (mimeType.includes("webm"))
        return "webm";
    if (mimeType.includes("mp3") || mimeType.includes("mpeg"))
        return "mp3";
    if (mimeType.includes("mp4") || mimeType.includes("m4a"))
        return "m4a";
    if (mimeType.includes("wav"))
        return "wav";
    if (mimeType.includes("ogg"))
        return "ogg";
    return "webm"; // Default
}
