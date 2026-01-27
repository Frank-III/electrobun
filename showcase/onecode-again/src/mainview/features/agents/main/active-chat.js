"use client";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatView = ChatView;
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var button_1 = require("../../../components/ui/button");
var icons_1 = require("../../../components/ui/icons");
var kbd_1 = require("../../../components/ui/kbd");
var prompt_input_1 = require("../../../components/ui/prompt-input");
var resizable_sidebar_1 = require("../../../components/ui/resizable-sidebar");
var tooltip_1 = require("../../../components/ui/tooltip");
// e2b API routes are used instead of useSandboxManager for agents
// import { clearSubChatSelectionAtom, isSubChatMultiSelectModeAtom, selectedSubChatIdsAtom } from "@/lib/atoms/agent-subchat-selection"
var react_1 = require("@ai-sdk/react");
var solid_js_1 = require("solid-js");
var set_1 = require("@solid-primitives/set");
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var react_2 = require("motion/react");
var solid_js_2 = require("solid-js");
var web_1 = require("solid-js/web");
var solid_sonner_1 = require("solid-sonner");
var TRPCProvider_1 = require("../../../contexts/TRPCProvider");
var analytics_1 = require("../../../lib/analytics");
var api_fetch_1 = require("../../../lib/api-fetch");
var atoms_1 = require("../../../lib/atoms");
var use_remote_chats_1 = require("../../../lib/hooks/use-remote-chats");
var use_file_change_listener_1 = require("../../../lib/hooks/use-file-change-listener");
var jotai_store_1 = require("../../../lib/jotai-store");
var mock_api_1 = require("../../../lib/mock-api");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var commands_1 = require("../commands");
var platform_1 = require("../../../lib/utils/platform");
var hotkeys_1 = require("../../../lib/hotkeys");
var changes_1 = require("../../changes");
var diff_center_peek_dialog_1 = require("../../changes/components/diff-center-peek-dialog");
var diff_full_page_view_1 = require("../../changes/components/diff-full-page-view");
var diff_sidebar_header_1 = require("../../changes/components/diff-sidebar-header");
var status_1 = require("../../changes/utils/status");
var atoms_2 = require("../../terminal/atoms");
var terminal_sidebar_1 = require("../../terminal/terminal-sidebar");
var atoms_3 = require("../atoms");
var agent_send_button_1 = require("../components/agent-send-button");
var open_locally_dialog_1 = require("../components/open-locally-dialog");
var preview_setup_hover_card_1 = require("../components/preview-setup-hover-card");
var text_selection_context_1 = require("../context/text-selection-context");
var use_agents_file_upload_1 = require("../hooks/use-agents-file-upload");
var use_auto_import_1 = require("../hooks/use-auto-import");
var use_changed_files_tracking_1 = require("../hooks/use-changed-files-tracking");
var use_desktop_notifications_1 = require("../hooks/use-desktop-notifications");
var use_focus_input_on_enter_1 = require("../hooks/use-focus-input-on-enter");
var use_haptic_1 = require("../hooks/use-haptic");
var use_text_context_selection_1 = require("../hooks/use-text-context-selection");
var use_pasted_text_files_1 = require("../hooks/use-pasted-text-files");
var use_toggle_focus_on_cmd_esc_1 = require("../hooks/use-toggle-focus-on-cmd-esc");
var drafts_1 = require("../lib/drafts");
var ipc_chat_transport_1 = require("../lib/ipc-chat-transport");
var remote_chat_transport_1 = require("../lib/remote-chat-transport");
var queue_utils_1 = require("../lib/queue-utils");
var mentions_1 = require("../mentions");
var search_1 = require("../search");
var agent_chat_store_1 = require("../stores/agent-chat-store");
var message_queue_store_1 = require("../stores/message-queue-store");
var message_store_1 = require("../stores/message-store");
var streaming_status_store_1 = require("../stores/streaming-status-store");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var agent_diff_view_1 = require("../ui/agent-diff-view");
var agent_plan_sidebar_1 = require("../ui/agent-plan-sidebar");
var agent_preview_1 = require("../ui/agent-preview");
var agent_queue_indicator_1 = require("../ui/agent-queue-indicator");
var agent_tool_call_1 = require("../ui/agent-tool-call");
var agent_tool_registry_1 = require("../ui/agent-tool-registry");
var agent_tool_utils_1 = require("../ui/agent-tool-utils");
var agent_user_message_bubble_1 = require("../ui/agent-user-message-bubble");
var agent_user_question_1 = require("../ui/agent-user-question");
var agents_header_controls_1 = require("../ui/agents-header-controls");
var chat_title_editor_1 = require("../ui/chat-title-editor");
var mobile_chat_header_1 = require("../ui/mobile-chat-header");
var quick_comment_input_1 = require("../ui/quick-comment-input");
var sub_chat_selector_1 = require("../ui/sub-chat-selector");
var sub_chat_status_card_1 = require("../ui/sub-chat-status-card");
var text_selection_popover_1 = require("../ui/text-selection-popover");
var auto_rename_1 = require("../utils/auto-rename");
var pr_message_1 = require("../utils/pr-message");
var chat_input_area_1 = require("./chat-input-area");
var isolated_messages_section_1 = require("./isolated-messages-section");
var details_sidebar_1 = require("../../details-sidebar/details-sidebar");
var atoms_4 = require("../../details-sidebar/atoms");
var selectedSubChatIdsAtom = (0, solid_js_1.createSignal)(new set_1.ReactiveSet());
var isSubChatMultiSelectModeAtom = (0, solid_js_1.createMemo)(function () { return selectedSubChatIdsAtom[0]().size > 0; });
// import { selectedTeamIdAtom } from "@/lib/atoms/team"
var selectedTeamIdAtom = (0, solid_js_1.createSignal)(null);
// UTF-8 safe base64 encoding (btoa doesn't support Unicode)
function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binString = Array.from(bytes, function (byte) { return String.fromCodePoint(byte); }).join("");
    return btoa(binString);
}
// Exploring tools - these get grouped when 2+ consecutive
var EXPLORING_TOOLS = new Set([
    "tool-Read",
    "tool-Grep",
    "tool-Glob",
    "tool-WebSearch",
    "tool-WebFetch"
]);
// Group consecutive exploring tools into exploring-group
function groupExploringTools(parts, nestedToolIds) {
    var result = [];
    var currentGroup = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        // Skip nested tools - they shouldn't be grouped, they render inside parent
        var isNested = part.toolCallId && nestedToolIds.has(part.toolCallId);
        if (EXPLORING_TOOLS.has(part.type) && !isNested) {
            currentGroup.push(part);
        }
        else {
            // Flush group if 3+
            if (currentGroup.length >= 3) {
                result.push({
                    type: "exploring-group",
                    parts: currentGroup
                });
            }
            else {
                result.push.apply(result, currentGroup);
            }
            currentGroup = [];
            result.push(part);
        }
    }
    // Flush remaining
    if (currentGroup.length >= 3) {
        result.push({
            type: "exploring-group",
            parts: currentGroup
        });
    }
    else {
        result.push.apply(result, currentGroup);
    }
    return result;
}
// Get the ID of the first sub-chat by creation date
function getFirstSubChatId(subChats) {
    var _a, _b;
    if (!(subChats === null || subChats === void 0 ? void 0 : subChats.length))
        return null;
    var sorted = __spreadArray([], subChats, true).sort(function (a, b) { return (a.created_at ? new Date(a.created_at).getTime() : 0) - (b.created_at ? new Date(b.created_at).getTime() : 0); });
    return (_b = (_a = sorted[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null;
}
// Layout constants for chat header and sticky messages
var CHAT_LAYOUT = {
    paddingTopSidebarOpen: "pt-12",
    paddingTopSidebarClosed: "pt-4",
    paddingTopMobile: "pt-14",
    stickyTopSidebarOpen: "top-0",
    stickyTopSidebarClosed: "top-0",
    stickyTopMobile: "top-0",
    headerPaddingSidebarOpen: "pt-1.5 pb-12 px-3 pl-2",
    headerPaddingSidebarClosed: "p-2 pt-1.5"
};
// Codex icon (OpenAI style)
var CodexIcon = function (props) { return <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>; };
// Model options for Claude Code
var claudeModels = [
    {
        id: "opus",
        name: "Opus"
    },
    {
        id: "sonnet",
        name: "Sonnet"
    },
    {
        id: "haiku",
        name: "Haiku"
    }
];
// Agent providers
var agents = [
    {
        id: "claude-code",
        name: "Claude Code",
        hasModels: true
    },
    {
        id: "cursor",
        name: "Cursor CLI",
        disabled: true
    },
    {
        id: "codex",
        name: "OpenAI Codex",
        disabled: true
    }
];
// Helper function to get agent icon
var getAgentIcon = function (agentId, className) {
    switch (agentId) {
        case "claude-code": return <icons_1.ClaudeCodeIcon class={className}/>;
        case "cursor": return <icons_1.CursorIcon class={className}/>;
        case "codex": return <CodexIcon class={className}/>;
        default: return null;
    }
};
// Copy button component with tooltip feedback (matches project style)
function CopyButton(_a) {
    var onCopy = _a.onCopy, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(false), copied = _c[0], setCopied = _c[1];
    var triggerHaptic = (0, use_haptic_1.useHaptic)().trigger;
    var handleCopy = function () {
        onCopy();
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
}
var PLAYBACK_SPEEDS = [
    1,
    2,
    3
];
function PlayButton(_a) {
    var _this = this;
    var text = _a.text, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b, _c = _a.playbackRate, playbackRate = _c === void 0 ? 1 : _c, onPlaybackRateChange = _a.onPlaybackRateChange;
    var _d = (0, solid_js_1.createSignal)("idle"), state = _d[0], setState = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), audioRef = _e[0], setAudioRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), mediaSourceRef = _f[0], setMediaSourceRef = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), sourceBufferRef = _g[0], setSourceBufferRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), abortControllerRef = _h[0], setAbortControllerRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(0), chunkCountRef = _j[0], setChunkCountRef = _j[1];
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
    var playWithStreaming = function () { return __awaiter(_this, void 0, void 0, function () {
        var mediaSource, audio, hasStartedPlaying, sourceBuffer, fetchStartTime, response, reader, pendingChunks, isAppending, appendNextChunk, processStream;
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
                    fetchStartTime = Date.now();
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
    // Cleanup on unmount
    (0, solid_js_1.createEffect)(function () {
        return cleanup;
    });
    return <div class="relative flex items-center">
      <button onClick={handlePlay} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", state === "loading" && "cursor-wait")}>
        <div class="relative w-3.5 h-3.5">
          {state === "loading" ? <icons_1.IconSpinner class="w-3.5 h-3.5 text-muted-foreground animate-spin"/> : state === "playing" ? <icons_1.PauseIcon class="w-3.5 h-3.5 text-muted-foreground"/> : <icons_1.VolumeIcon class="w-3.5 h-3.5 text-muted-foreground"/>}
        </div>
      </button>

      {/* Speed selector - cyclic button with animation, only visible when playing */}
      {state === "playing" && <button onClick={function () {
                var currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
                var nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
                onPlaybackRateChange === null || onPlaybackRateChange === void 0 ? void 0 : onPlaybackRateChange(PLAYBACK_SPEEDS[nextIndex]);
            }} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", isMobile ? "opacity-100" : "opacity-0 group-hover/message:opacity-100")}>
          <div class="relative w-4 h-3.5 flex items-center justify-center">
            {PLAYBACK_SPEEDS.map(function (speed) { return <span key={speed} class={(0, utils_1.cn)("absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground transition-[opacity,transform] duration-200 ease-out", speed === playbackRate ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                {speed}x
              </span>; })}
          </div>
        </button>}
    </div>;
}
// Rollback button component for reverting to a previous message state
function RollbackButton(_a) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, onRollback = _a.onRollback, _c = _a.isRollingBack, isRollingBack = _c === void 0 ? false : _c;
    return <tooltip_1.Tooltip>
      <tooltip_1.TooltipTrigger asChild>
        <button onClick={onRollback} disabled={disabled || isRollingBack} tabIndex={-1} class={(0, utils_1.cn)("p-1.5 rounded-md transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.97]", isRollingBack && "opacity-50 cursor-not-allowed")}>
          <icons_1.IconTextUndo class="w-3.5 h-3.5 text-muted-foreground"/>
        </button>
      </tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent side="bottom">
        {isRollingBack ? "Rolling back..." : "Rollback to here"}
      </tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>;
}
// Isolated scroll-to-bottom button - uses own scroll listener to avoid re-renders of parent
var ScrollToBottomButton = memo(function ScrollToBottomButton(_a) {
    var containerRef = _a.containerRef, onScrollToBottom = _a.onScrollToBottom, _b = _a.hasStackedCards, hasStackedCards = _b === void 0 ? false : _b, subChatId = _a.subChatId, _c = _a.isActive, isActive = _c === void 0 ? true : _c;
    var _d = (0, solid_js_1.createSignal)(false), isVisible = _d[0], setIsVisible = _d[1];
    // Keep isActive in ref for scroll event handler
    var _e = (0, solid_js_1.createSignal)(isActive), isActiveRef = _e[0], setIsActiveRef = _e[1];
    isActiveRef.current = isActive;
    (0, solid_js_1.createEffect)(function () {
        // Skip scroll monitoring for inactive tabs (keep-alive)
        if (!isActive)
            return;
        var container = containerRef.current;
        if (!container)
            return;
        // RAF throttle to avoid setState on every scroll event
        var rafId = null;
        var lastAtBottom = null;
        var checkVisibility = function () {
            // Skip if not active or RAF already pending
            if (!isActiveRef.current || rafId !== null)
                return;
            rafId = requestAnimationFrame(function () {
                rafId = null;
                // Double-check active state in RAF callback
                if (!isActiveRef.current)
                    return;
                var threshold = 50;
                var atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
                // Only update state if value actually changed
                if (lastAtBottom !== atBottom) {
                    lastAtBottom = atBottom;
                    setIsVisible(!atBottom);
                }
            });
        };
        // Check initial state after a short delay to allow scroll position to be set
        // This handles the case when entering a sub-chat that's scrolled to a specific position
        var timeoutId = setTimeout(function () {
            // Skip if not active
            if (!isActiveRef.current)
                return;
            // Direct check for initial state (no RAF needed)
            var threshold = 50;
            var atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
            lastAtBottom = atBottom;
            setIsVisible(!atBottom);
        }, 50);
        container.addEventListener("scroll", checkVisibility, { passive: true });
        return function () {
            clearTimeout(timeoutId);
            if (rafId !== null)
                cancelAnimationFrame(rafId);
            container.removeEventListener("scroll", checkVisibility);
        };
    });
    return <react_2.AnimatePresence>
      {isVisible && <tooltip_1.Tooltip delayDuration={300}>
          <tooltip_1.TooltipTrigger asChild>
            <react_2.motion.button initial={{
                opacity: 0,
                scale: .96,
                y: 8
            }} animate={{
                opacity: 1,
                scale: 1,
                y: 0
            }} exit={{
                opacity: 0,
                scale: .96,
                y: 8
            }} transition={{
                duration: .2,
                ease: [
                    .23,
                    1,
                    .32,
                    1
                ]
            }} onClick={onScrollToBottom} class={(0, utils_1.cn)("absolute right-4 p-2 rounded-full bg-background border border-border shadow-md hover:bg-accent active:scale-[0.97] transition-colors z-20", hasStackedCards ? "bottom-44 sm:bottom-36" : "bottom-32 sm:bottom-24")} aria-label="Scroll to bottom">
              <lucide_solid_1.ArrowDown class="h-4 w-4 text-muted-foreground"/>
            </react_2.motion.button>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent side="top">
            Scroll to bottom
            <span class="inline-flex items-center gap-0.5">
              <kbd_1.Kbd>⌘</kbd_1.Kbd>
              <kbd_1.Kbd>
                <lucide_solid_1.ArrowDown class="h-3 w-3"/>
              </kbd_1.Kbd>
            </span>
          </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>}
    </react_2.AnimatePresence>;
});
function MessageGroup(_a) {
    var children = _a.children, isLastGroup = _a.isLastGroup;
    var _b = (0, solid_js_1.createSignal)(null), groupRef = _b[0], setGroupRef = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), userMessageRef = _c[0], setUserMessageRef = _c[1];
    (0, solid_js_1.createEffect)(function () {
        var groupEl = groupRef.current;
        if (!groupEl)
            return;
        // Find the actual bubble element (not the wrapper which includes gradient)
        var bubbleEl = groupEl.querySelector("[data-user-bubble]");
        if (!bubbleEl)
            return;
        userMessageRef.current = bubbleEl;
        var updateHeight = function () {
            var height = bubbleEl.offsetHeight;
            // Set CSS variable directly on DOM - no React state, no re-renders
            groupEl.style.setProperty("--user-message-height", "".concat(height, "px"));
        };
        updateHeight();
        var observer = new ResizeObserver(updateHeight);
        observer.observe(bubbleEl);
        return function () { return observer.disconnect(); };
    });
    return <div ref={groupRef} class="relative" style={__assign({ contentVisibility: "auto", containIntrinsicSize: "auto 200px" }, isLastGroup && { minHeight: "calc(var(--chat-container-height) - 32px)" })} data-last-group={isLastGroup || undefined}>
      {children}
    </div>;
}
function CollapsibleSteps(_a) {
    var stepsCount = _a.stepsCount, children = _a.children, _b = _a.defaultExpanded, defaultExpanded = _b === void 0 ? false : _b;
    var _c = (0, solid_js_1.createSignal)(defaultExpanded), isExpanded = _c[0], setIsExpanded = _c[1];
    if (stepsCount === 0)
        return null;
    return <div class="mb-2" data-collapsible-steps="true">
      {/* Header row - styled like AgentToolCall with expand icon on right */}
      <div class="flex items-center justify-between rounded-md py-0.5 px-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={function () { return setIsExpanded(!isExpanded); }}>
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <lucide_solid_1.ListTree class="w-3.5 h-3.5 flex-shrink-0"/>
          <span class="font-medium whitespace-nowrap">
            {stepsCount} {stepsCount === 1 ? "step" : "steps"}
          </span>
        </div>
        <button class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95" onClick={function (e) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }}>
          <div class="relative w-4 h-4">
            <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
            <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
          </div>
        </button>
      </div>
      {isExpanded && <div class="mt-1 space-y-1.5">{children}</div>}
    </div>;
}
var DiffStateContext = (0, solid_js_2.createContext)(null);
function useDiffState() {
    var ctx = (0, solid_js_2.useContext)(DiffStateContext);
    if (!ctx)
        throw new Error("useDiffState must be used within DiffStateProvider");
    return ctx;
}
// Memoized commit file item for History tab
var CommitFileItem = memo(function CommitFileItem(_a) {
    var file = _a.file, onClick = _a.onClick;
    var fileName = file.path.split("/").pop() || file.path;
    var dirPath = file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";
    return <div class={(0, utils_1.cn)("flex items-center gap-2 px-2 py-1 cursor-pointer transition-colors", "hover:bg-muted/80")} onClick={onClick}>
      <div class="flex-1 min-w-0 flex items-center overflow-hidden">
        {dirPath && <span class="text-xs text-muted-foreground truncate flex-shrink min-w-0">
            {dirPath}/
          </span>}
        <span class="text-xs font-medium flex-shrink-0 whitespace-nowrap">
          {fileName}
        </span>
      </div>
      <div class="shrink-0">
        {(0, status_1.getStatusIndicator)(file.status)}
      </div>
    </div>;
});
var DiffSidebarContent = memo(function DiffSidebarContent(_a) {
    var _b, _c, _d, _e;
    var worktreePath = _a.worktreePath, chatId = _a.chatId, sandboxId = _a.sandboxId, repository = _a.repository, diffStats = _a.diffStats, setDiffStats = _a.setDiffStats, diffContent = _a.diffContent, parsedFileDiffs = _a.parsedFileDiffs, prefetchedFileContents = _a.prefetchedFileContents, setDiffCollapseState = _a.setDiffCollapseState, diffViewRef = _a.diffViewRef, agentChat = _a.agentChat, sidebarWidth = _a.sidebarWidth, onCommitWithAI = _a.onCommitWithAI, _f = _a.isCommittingWithAI, isCommittingWithAI = _f === void 0 ? false : _f, diffMode = _a.diffMode, setDiffMode = _a.setDiffMode, onCreatePr = _a.onCreatePr, _g = _a.subChats, subChats = _g === void 0 ? [] : _g;
    // Get values from context instead of props
    var _h = useDiffState(), selectedFilePath = _h.selectedFilePath, filteredSubChatId = _h.filteredSubChatId, handleDiffFileSelect = _h.handleDiffFileSelect, handleSelectNextFile = _h.handleSelectNextFile, handleCommitSuccess = _h.handleCommitSuccess, handleViewedCountChange = _h.handleViewedCountChange, resetActiveTabRef = _h.resetActiveTabRef;
    // Compute initial selected file synchronously for first render
    // This prevents AgentDiffView from rendering all files before filter kicks in
    var initialSelectedFile = (0, solid_js_1.createMemo)(function () {
        if (selectedFilePath)
            return selectedFilePath;
        if (parsedFileDiffs && parsedFileDiffs.length > 0) {
            var firstFile = parsedFileDiffs[0];
            var filePath = firstFile.newPath !== "/dev/null" ? firstFile.newPath : firstFile.oldPath;
            if (filePath && filePath !== "/dev/null") {
                return filePath;
            }
        }
        return null;
    });
    var _j = (0, jotai_1.useAtom)(atoms_3.agentsChangesPanelWidthAtom), changesPanelWidth = _j[0], setChangesPanelWidth = _j[1];
    var _k = (0, jotai_1.useAtom)(atoms_3.agentsChangesPanelCollapsedAtom), isChangesPanelCollapsed = _k[0], setIsChangesPanelCollapsed = _k[1];
    var _l = (0, solid_js_1.createSignal)(false), isResizing = _l[0], setIsResizing = _l[1];
    // Active tab state (Changes/History)
    var _m = (0, solid_js_1.createSignal)("changes"), activeTab = _m[0], setActiveTab = _m[1];
    // Register the reset function so handleCloseDiff can reset to "changes" tab before closing
    // This prevents React 19 ref cleanup issues with HistoryView's ContextMenu components
    (0, solid_js_1.createEffect)(function () {
        resetActiveTabRef.current = function () { return setActiveTab("changes"); };
        return function () {
            resetActiveTabRef.current = null;
        };
    });
    // Selected commit for History tab
    var _o = (0, jotai_1.useAtom)(atoms_3.selectedCommitAtom), selectedCommit = _o[0], setSelectedCommit = _o[1];
    // When sidebar is narrow (< 500px), use vertical layout
    var isNarrow = sidebarWidth < 500;
    // Get diff stats for collapsed header display
    var diffStatus = trpc_1.trpc.changes.getStatus.useQuery({ worktreePath: worktreePath || "" }, { enabled: !!worktreePath && isNarrow }).data;
    // Handle resize drag
    var handleResizePointerDown = function (event) {
        var _a;
        if (event.button !== 0)
            return;
        event.preventDefault();
        event.stopPropagation();
        var startX = event.clientX;
        var startWidth = changesPanelWidth;
        var pointerId = event.pointerId;
        var handleElement = event.currentTarget;
        var minWidth = 200;
        var maxWidth = 450;
        var clampWidth = function (width) { return Math.max(minWidth, Math.min(maxWidth, width)); };
        (_a = handleElement.setPointerCapture) === null || _a === void 0 ? void 0 : _a.call(handleElement, pointerId);
        setIsResizing(true);
        var handlePointerMove = function (e) {
            var delta = e.clientX - startX;
            var newWidth = clampWidth(startWidth + delta);
            setChangesPanelWidth(newWidth);
        };
        var handlePointerUp = function () {
            var _a;
            if ((_a = handleElement.hasPointerCapture) === null || _a === void 0 ? void 0 : _a.call(handleElement, pointerId)) {
                handleElement.releasePointerCapture(pointerId);
            }
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            setIsResizing(false);
        };
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp, { once: true });
    };
    // Handle commit selection in History tab
    var handleCommitSelect = function (commit) {
        setSelectedCommit(commit);
        // Reset file selection when changing commits
        // The HistoryView will auto-select first file
    };
    // Handle file selection in commit (History tab)
    var handleCommitFileSelect = function (file, commitHash) {
        // Set selected file path for highlighting
        handleDiffFileSelect(file, "");
    };
    // Fetch commit files when a commit is selected
    var commitFiles = trpc_1.trpc.changes.getCommitFiles.useQuery({
        worktreePath: worktreePath || "",
        commitHash: (selectedCommit === null || selectedCommit === void 0 ? void 0 : selectedCommit.hash) || ""
    }, {
        enabled: !!worktreePath && !!selectedCommit,
        staleTime: 6e4
    }).data;
    // Fetch commit file diff when a commit is selected
    var commitFileDiff = trpc_1.trpc.changes.getCommitFileDiff.useQuery({
        worktreePath: worktreePath || "",
        commitHash: (selectedCommit === null || selectedCommit === void 0 ? void 0 : selectedCommit.hash) || "",
        filePath: selectedFilePath || ""
    }, {
        enabled: !!worktreePath && !!selectedCommit && !!selectedFilePath,
        staleTime: 6e4
    }).data;
    // Use commit diff or regular diff based on selection
    // Only use commit data when in History tab, otherwise always use regular diff
    var shouldUseCommitDiff = activeTab === "history" && selectedCommit;
    var effectiveDiff = shouldUseCommitDiff && commitFileDiff ? commitFileDiff : diffContent;
    var effectiveParsedFiles = shouldUseCommitDiff ? null : parsedFileDiffs;
    var effectivePrefetchedContents = shouldUseCommitDiff ? {} : prefetchedFileContents;
    if (isNarrow) {
        // Count changed files for collapsed header
        var changedFilesCount = diffStatus ? (((_b = diffStatus.staged) === null || _b === void 0 ? void 0 : _b.length) || 0) + (((_c = diffStatus.unstaged) === null || _c === void 0 ? void 0 : _c.length) || 0) + (((_d = diffStatus.untracked) === null || _d === void 0 ? void 0 : _d.length) || 0) : 0;
        var stagedCount = ((_e = diffStatus === null || diffStatus === void 0 ? void 0 : diffStatus.staged) === null || _e === void 0 ? void 0 : _e.length) || 0;
        // Vertical layout: ChangesPanel on top, diff/file list below
        return <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Top: ChangesPanel (file list + commit) */}
        {worktreePath && <div class={(0, utils_1.cn)("flex-shrink-0 overflow-hidden flex flex-col", "h-[45%] min-h-[200px] border-b border-border/50")}>
            <changes_1.ChangesPanel worktreePath={worktreePath} selectedFilePath={selectedFilePath} onFileSelect={handleDiffFileSelect} onFileOpenPinned={function () { }} onCreatePr={onCreatePr} onCommitSuccess={handleCommitSuccess} subChats={subChats} initialSubChatFilter={filteredSubChatId} chatId={chatId} selectedCommitHash={selectedCommit === null || selectedCommit === void 0 ? void 0 : selectedCommit.hash} onCommitSelect={handleCommitSelect} onCommitFileSelect={handleCommitFileSelect} onActiveTabChange={setActiveTab} pushCount={diffStatus === null || diffStatus === void 0 ? void 0 : diffStatus.pushCount}/>
          </div>}
        {/* Bottom: File list (when History tab + commit selected) or AgentDiffView (diff) */}
        {/* Both views are always mounted but hidden via CSS to prevent expensive re-mounts */}
        <div class="flex-1 overflow-hidden flex flex-col relative">
          {/* History view - files in commit */}
          <div class={(0, utils_1.cn)("absolute inset-0 overflow-y-auto", activeTab === "history" && selectedCommit ? "z-10" : "z-0 invisible")}>
            {selectedCommit && (!commitFiles ? <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Loading files...
                </div> : commitFiles.length === 0 ? <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No files changed in this commit
                </div> : <>
                  {/* Commit message and description */}
                  <div class="px-3 py-2 border-b border-border/50">
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <div class="text-sm font-medium text-foreground flex-1">
                        {selectedCommit.message}
                      </div>
                      <button onClick={function () {
                    navigator.clipboard.writeText(selectedCommit.hash);
                    solid_sonner_1.toast.success("Copied SHA to clipboard");
                }} class="text-xs font-mono text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0">
                        {selectedCommit.shortHash}
                      </button>
                    </div>
                    {selectedCommit.description && <div class="text-xs text-foreground/80 mb-2 whitespace-pre-wrap">
                        {selectedCommit.description}
                      </div>}
                    <div class="text-xs text-muted-foreground">
                      {selectedCommit.author} • {selectedCommit.date ? new Date(selectedCommit.date).toLocaleString() : "Unknown date"}
                    </div>
                  </div>

                  <div class="px-2 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b border-border/50">
                    Files in commit ({commitFiles.length})
                  </div>
                  {commitFiles.map(function (file) { return <CommitFileItem key={file.path} file={file} onClick={function () { }}/>; })}
                </>)}
          </div>
          {/* Diff view - always mounted to prevent expensive re-initialization */}
          <div class={(0, utils_1.cn)("absolute inset-0 overflow-hidden", activeTab === "history" && selectedCommit ? "z-0 invisible" : "z-10")}>
            <agent_diff_view_1.AgentDiffView ref={diffViewRef} chatId={chatId} sandboxId={sandboxId} worktreePath={worktreePath || undefined} repository={repository} onStatsChange={setDiffStats} initialDiff={effectiveDiff} initialParsedFiles={effectiveParsedFiles} prefetchedFileContents={effectivePrefetchedContents} showFooter={false} onCollapsedStateChange={setDiffCollapseState} onSelectNextFile={handleSelectNextFile} onViewedCountChange={handleViewedCountChange} initialSelectedFile={initialSelectedFile}/>
          </div>
        </div>
      </div>;
    }
    // Horizontal layout: files on left, diff on right
    return <div class="flex flex-1 min-h-0 overflow-hidden">
      {/* Left: ChangesPanel (file list + commit) with resize handle */}
      {worktreePath && <div class="h-full flex-shrink-0 relative" style={{ width: changesPanelWidth }}>
          <changes_1.ChangesPanel worktreePath={worktreePath} selectedFilePath={selectedFilePath} onFileSelect={handleDiffFileSelect} onFileOpenPinned={function () { }} onCreatePr={onCreatePr} onCommitSuccess={handleCommitSuccess} subChats={subChats} initialSubChatFilter={filteredSubChatId} chatId={chatId} selectedCommitHash={selectedCommit === null || selectedCommit === void 0 ? void 0 : selectedCommit.hash} onCommitSelect={handleCommitSelect} onCommitFileSelect={handleCommitFileSelect} onActiveTabChange={setActiveTab} pushCount={diffStatus === null || diffStatus === void 0 ? void 0 : diffStatus.pushCount}/>
          {/* Resize handle - styled like ResizableSidebar */}
          <div onPointerDown={handleResizePointerDown} class="absolute top-0 bottom-0 cursor-col-resize z-10" style={{
                right: 0,
                width: "4px",
                marginRight: "-2px"
            }}/>
        </div>}
      {/* Right: File list (when History tab) or AgentDiffView (when Changes tab) */}
      {/* Both views are always mounted but hidden via CSS to prevent expensive re-mounts */}
      <div class={(0, utils_1.cn)("flex-1 h-full min-w-0 overflow-hidden relative", "border-l border-border/50")}>
        {/* History view - files in commit */}
        <div class={(0, utils_1.cn)("absolute inset-0 overflow-y-auto", activeTab === "history" && selectedCommit ? "z-10" : "z-0 invisible")}>
          {selectedCommit && (!commitFiles ? <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Loading files...
              </div> : commitFiles.length === 0 ? <div class="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No files changed in this commit
              </div> : <>
                {/* Commit message and description */}
                <div class="px-3 py-2 border-b border-border/50">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <div class="text-sm font-medium text-foreground flex-1">
                      {selectedCommit.message}
                    </div>
                    <button onClick={function () {
                navigator.clipboard.writeText(selectedCommit.hash);
                solid_sonner_1.toast.success("Copied SHA to clipboard");
            }} class="text-xs font-mono text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0">
                      {selectedCommit.shortHash}
                    </button>
                  </div>
                  {selectedCommit.description && <div class="text-xs text-foreground/80 mb-2 whitespace-pre-wrap">
                      {selectedCommit.description}
                    </div>}
                  <div class="text-xs text-muted-foreground">
                    {selectedCommit.author} • {selectedCommit.date ? new Date(selectedCommit.date).toLocaleString() : "Unknown date"}
                  </div>
                </div>

                <div class="px-2 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b border-border/50">
                  Files in commit ({commitFiles.length})
                </div>
                {commitFiles.map(function (file) { return <CommitFileItem key={file.path} file={file} onClick={function () { }}/>; })}
              </>)}
        </div>
        {/* Diff view - always mounted to prevent expensive re-initialization */}
        <div class={(0, utils_1.cn)("absolute inset-0 overflow-hidden", activeTab === "history" && selectedCommit ? "z-0 invisible" : "z-10")}>
          <agent_diff_view_1.AgentDiffView ref={diffViewRef} chatId={chatId} sandboxId={sandboxId} worktreePath={worktreePath || undefined} repository={repository} onStatsChange={setDiffStats} initialDiff={effectiveDiff} initialParsedFiles={effectiveParsedFiles} prefetchedFileContents={effectivePrefetchedContents} showFooter={true} onCollapsedStateChange={setDiffCollapseState} onSelectNextFile={handleSelectNextFile} onViewedCountChange={handleViewedCountChange} initialSelectedFile={initialSelectedFile}/>
        </div>
      </div>
    </div>;
});
var DiffStateProvider = memo(function DiffStateProvider(_a) {
    var isDiffSidebarOpen = _a.isDiffSidebarOpen, parsedFileDiffs = _a.parsedFileDiffs, isDiffSidebarNarrow = _a.isDiffSidebarNarrow, setIsDiffSidebarOpen = _a.setIsDiffSidebarOpen, setDiffStats = _a.setDiffStats, setDiffContent = _a.setDiffContent, setParsedFileDiffs = _a.setParsedFileDiffs, setPrefetchedFileContents = _a.setPrefetchedFileContents, fetchDiffStats = _a.fetchDiffStats, children = _a.children;
    // Viewed count state - kept here to avoid re-rendering ChatView
    var _b = (0, solid_js_1.createSignal)(0), viewedCount = _b[0], setViewedCount = _b[1];
    // Ref for resetting activeTab to "changes" before closing
    // This prevents React 19 ref cleanup issues with HistoryView's ContextMenu components
    var _c = (0, solid_js_1.createSignal)(null), resetActiveTabRef = _c[0], setResetActiveTabRef = _c[1];
    // All diff-related atoms are read HERE, not in ChatView
    var _d = (0, jotai_1.useAtom)(atoms_3.selectedDiffFilePathAtom), selectedFilePath = _d[0], setSelectedFilePath = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_3.filteredDiffFilesAtom), setFilteredDiffFiles = _e[1];
    var _f = (0, jotai_1.useAtom)(atoms_3.filteredSubChatIdAtom), filteredSubChatId = _f[0], setFilteredSubChatId = _f[1];
    var isChangesPanelCollapsed = (0, jotai_1.useAtomValue)(atoms_3.agentsChangesPanelCollapsedAtom);
    // Auto-select first file when diff sidebar opens - use useLayoutEffect for synchronous update
    // This prevents the initial render from showing all 11 files before filter kicks in
    (0, solid_js_1.createEffect)(function () {
        if (!isDiffSidebarOpen) {
            setSelectedFilePath(null);
            setFilteredDiffFiles(null);
            return;
        }
        // Determine which file to select
        var fileToSelect = selectedFilePath;
        if (!fileToSelect && parsedFileDiffs && parsedFileDiffs.length > 0) {
            var firstFile = parsedFileDiffs[0];
            fileToSelect = firstFile.newPath !== "/dev/null" ? firstFile.newPath : firstFile.oldPath;
            if (fileToSelect && fileToSelect !== "/dev/null") {
                setSelectedFilePath(fileToSelect);
            }
        }
        // Filter logic based on layout mode
        var shouldShowAllFiles = isDiffSidebarNarrow && isChangesPanelCollapsed;
        if (shouldShowAllFiles) {
            setFilteredDiffFiles(null);
        }
        else if (fileToSelect) {
            setFilteredDiffFiles([fileToSelect]);
        }
        else {
            setFilteredDiffFiles(null);
        }
    });
    // Stable callbacks
    var handleDiffFileSelect = function (file, _category) {
        setSelectedFilePath(file.path);
        setFilteredDiffFiles([file.path]);
    };
    var handleSelectNextFile = function (filePath) {
        setSelectedFilePath(filePath);
        setFilteredDiffFiles([filePath]);
    };
    var handleCommitSuccess = function () {
        setSelectedFilePath(null);
        setFilteredDiffFiles(null);
        setParsedFileDiffs(null);
        setDiffContent(null);
        setPrefetchedFileContents({});
        setDiffStats({
            fileCount: 0,
            additions: 0,
            deletions: 0,
            isLoading: true,
            hasChanges: false
        });
        setTimeout(function () {
            fetchDiffStats();
        }, 500);
    };
    var handleCloseDiff = function () {
        // Use flushSync to reset activeTab synchronously before closing.
        // This unmounts HistoryView's ContextMenu components in a single commit,
        // preventing React 19 ref cleanup "Maximum update depth exceeded" error.
        (0, web_1.flushSync)(function () {
            var _a;
            (_a = resetActiveTabRef.current) === null || _a === void 0 ? void 0 : _a.call(resetActiveTabRef);
        });
        setIsDiffSidebarOpen(false);
        setFilteredSubChatId(null);
    };
    var handleViewedCountChange = function (count) {
        setViewedCount(count);
    };
    var contextValue = (0, solid_js_1.createMemo)(function () { return ({
        selectedFilePath: selectedFilePath,
        filteredSubChatId: filteredSubChatId,
        viewedCount: viewedCount,
        handleDiffFileSelect: handleDiffFileSelect,
        handleSelectNextFile: handleSelectNextFile,
        handleCommitSuccess: handleCommitSuccess,
        handleCloseDiff: handleCloseDiff,
        handleViewedCountChange: handleViewedCountChange,
        resetActiveTabRef: resetActiveTabRef
    }); });
    return <DiffStateContext.Provider value={contextValue}>
      {children}
    </DiffStateContext.Provider>;
});
var DiffSidebarRenderer = memo(function DiffSidebarRenderer(_a) {
    var _b, _c, _d, _e, _f, _g;
    var worktreePath = _a.worktreePath, chatId = _a.chatId, sandboxId = _a.sandboxId, repository = _a.repository, diffStats = _a.diffStats, diffContent = _a.diffContent, parsedFileDiffs = _a.parsedFileDiffs, prefetchedFileContents = _a.prefetchedFileContents, setDiffCollapseState = _a.setDiffCollapseState, diffViewRef = _a.diffViewRef, diffSidebarRef = _a.diffSidebarRef, agentChat = _a.agentChat, branchData = _a.branchData, gitStatus = _a.gitStatus, isGitStatusLoading = _a.isGitStatusLoading, isDiffSidebarOpen = _a.isDiffSidebarOpen, diffDisplayMode = _a.diffDisplayMode, diffSidebarWidth = _a.diffSidebarWidth, handleReview = _a.handleReview, isReviewing = _a.isReviewing, handleCreatePr = _a.handleCreatePr, isCreatingPr = _a.isCreatingPr, handleMergePr = _a.handleMergePr, mergePrMutation = _a.mergePrMutation, handleRefreshGitStatus = _a.handleRefreshGitStatus, hasPrNumber = _a.hasPrNumber, isPrOpen = _a.isPrOpen, hasMergeConflicts = _a.hasMergeConflicts, handleFixConflicts = _a.handleFixConflicts, handleExpandAll = _a.handleExpandAll, handleCollapseAll = _a.handleCollapseAll, diffMode = _a.diffMode, setDiffMode = _a.setDiffMode, handleMarkAllViewed = _a.handleMarkAllViewed, handleMarkAllUnviewed = _a.handleMarkAllUnviewed, isDesktop = _a.isDesktop, isFullscreen = _a.isFullscreen, setDiffDisplayMode = _a.setDiffDisplayMode, handleCommitToPr = _a.handleCommitToPr, isCommittingToPr = _a.isCommittingToPr, subChatsWithFiles = _a.subChatsWithFiles, setDiffStats = _a.setDiffStats;
    // Get callbacks and state from context
    var _h = useDiffState(), handleCloseDiff = _h.handleCloseDiff, viewedCount = _h.viewedCount, handleViewedCountChange = _h.handleViewedCountChange;
    // Width for responsive layouts - use stored width for sidebar, fixed for dialog/fullpage
    var effectiveWidth = diffDisplayMode === "side-peek" ? diffSidebarWidth : diffDisplayMode === "center-peek" ? 1200 : typeof window !== "undefined" ? window.innerWidth : 1200;
    var diffViewContent = <div ref={diffSidebarRef} class="flex flex-col h-full min-w-0 overflow-hidden">
      {/* Unified Header - branch selector, fetch, review, PR actions, close */}
      {worktreePath ? <diff_sidebar_header_1.DiffSidebarHeader worktreePath={worktreePath} currentBranch={(_b = branchData === null || branchData === void 0 ? void 0 : branchData.current) !== null && _b !== void 0 ? _b : ""} diffStats={diffStats} sidebarWidth={effectiveWidth} pushCount={(_c = gitStatus === null || gitStatus === void 0 ? void 0 : gitStatus.pushCount) !== null && _c !== void 0 ? _c : 0} pullCount={(_d = gitStatus === null || gitStatus === void 0 ? void 0 : gitStatus.pullCount) !== null && _d !== void 0 ? _d : 0} hasUpstream={(_e = gitStatus === null || gitStatus === void 0 ? void 0 : gitStatus.hasUpstream) !== null && _e !== void 0 ? _e : true} isSyncStatusLoading={isGitStatusLoading} aheadOfDefault={(_f = gitStatus === null || gitStatus === void 0 ? void 0 : gitStatus.ahead) !== null && _f !== void 0 ? _f : 0} behindDefault={(_g = gitStatus === null || gitStatus === void 0 ? void 0 : gitStatus.behind) !== null && _g !== void 0 ? _g : 0} onReview={handleReview} isReviewing={isReviewing} onCreatePr={handleCreatePr} isCreatingPr={isCreatingPr} onCreatePrWithAI={handleCreatePr} isCreatingPrWithAI={isCreatingPr} onMergePr={handleMergePr} isMergingPr={mergePrMutation.isPending} onClose={handleCloseDiff} onRefresh={handleRefreshGitStatus} hasPrNumber={hasPrNumber} isPrOpen={isPrOpen} hasMergeConflicts={hasMergeConflicts} onFixConflicts={handleFixConflicts} onExpandAll={handleExpandAll} onCollapseAll={handleCollapseAll} viewMode={diffMode} onViewModeChange={setDiffMode} viewedCount={viewedCount} onMarkAllViewed={handleMarkAllViewed} onMarkAllUnviewed={handleMarkAllUnviewed} isDesktop={isDesktop} isFullscreen={isFullscreen} displayMode={diffDisplayMode} onDisplayModeChange={setDiffDisplayMode}/> : sandboxId ? <div class="flex items-center h-10 px-2 border-b border-border/50 bg-background flex-shrink-0">
          <button_1.Button variant="ghost" size="sm" class="h-6 w-6 p-0 flex-shrink-0 hover:bg-foreground/10" onClick={handleCloseDiff}>
            <icons_1.IconCloseSidebarRight class="size-4 text-muted-foreground"/>
          </button_1.Button>
          <span class="text-sm text-muted-foreground ml-2">Changes</span>
        </div> : null}

      {/* Content: file list + diff view - vertical when narrow */}
      <DiffSidebarContent worktreePath={worktreePath} chatId={chatId} sandboxId={sandboxId} repository={repository} diffStats={diffStats} setDiffStats={setDiffStats} diffContent={diffContent} parsedFileDiffs={parsedFileDiffs} prefetchedFileContents={prefetchedFileContents} setDiffCollapseState={setDiffCollapseState} diffViewRef={diffViewRef} agentChat={agentChat} sidebarWidth={effectiveWidth} onCommitWithAI={handleCommitToPr} isCommittingWithAI={isCommittingToPr} diffMode={diffMode} setDiffMode={setDiffMode} onCreatePr={handleCreatePr} subChats={subChatsWithFiles}/>
    </div>;
    // Render based on display mode
    if (diffDisplayMode === "side-peek") {
        return <resizable_sidebar_1.ResizableSidebar isOpen={isDiffSidebarOpen} onClose={handleCloseDiff} widthAtom={atoms_3.agentsDiffSidebarWidthAtom} minWidth={320} side="right" animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-background border-l" style={{
                borderLeftWidth: "0.5px",
                overflow: "hidden"
            }}>
        {diffViewContent}
      </resizable_sidebar_1.ResizableSidebar>;
    }
    if (diffDisplayMode === "center-peek") {
        return <diff_center_peek_dialog_1.DiffCenterPeekDialog isOpen={isDiffSidebarOpen} onClose={handleCloseDiff}>
        {diffViewContent}
      </diff_center_peek_dialog_1.DiffCenterPeekDialog>;
    }
    if (diffDisplayMode === "full-page") {
        return <diff_full_page_view_1.DiffFullPageView isOpen={isDiffSidebarOpen} onClose={handleCloseDiff}>
        {diffViewContent}
      </diff_full_page_view_1.DiffFullPageView>;
    }
    return null;
});
// Inner chat component - only rendered when chat object is ready
// Memoized to prevent re-renders when parent state changes (e.g., selectedFilePath)
var ChatViewInner = memo(function ChatViewInner(_a) {
    var _this = this;
    var _b, _c;
    var chat = _a.chat, subChatId = _a.subChatId, parentChatId = _a.parentChatId, isFirstSubChat = _a.isFirstSubChat, onAutoRename = _a.onAutoRename, onCreateNewSubChat = _a.onCreateNewSubChat, refreshDiff = _a.refreshDiff, teamId = _a.teamId, repository = _a.repository, streamId = _a.streamId, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d, _e = _a.sandboxSetupStatus, sandboxSetupStatus = _e === void 0 ? "ready" : _e, sandboxSetupError = _a.sandboxSetupError, onRetrySetup = _a.onRetrySetup, _f = _a.isSubChatsSidebarOpen, isSubChatsSidebarOpen = _f === void 0 ? false : _f, sandboxId = _a.sandboxId, projectPath = _a.projectPath, _g = _a.isArchived, isArchived = _g === void 0 ? false : _g, onRestoreWorkspace = _a.onRestoreWorkspace, existingPrUrl = _a.existingPrUrl, _h = _a.isActive, isActive = _h === void 0 ? true : _h;
    var _j = (0, solid_js_1.createSignal)(false), hasTriggeredRenameRef = _j[0], setHasTriggeredRenameRef = _j[1];
    var _k = (0, solid_js_1.createSignal)(false), hasTriggeredAutoGenerateRef = _k[0], setHasTriggeredAutoGenerateRef = _k[1];
    // Keep isActive in ref for use in callbacks (avoid stale closures)
    var _l = (0, solid_js_1.createSignal)(isActive), isActiveRef = _l[0], setIsActiveRef = _l[1];
    isActiveRef.current = isActive;
    // Scroll management state (like canvas chat)
    // Using only ref to avoid re-renders on scroll
    var _m = (0, solid_js_1.createSignal)(true), shouldAutoScrollRef = _m[0], setShouldAutoScrollRef = _m[1];
    var _o = (0, solid_js_1.createSignal)(false), isAutoScrollingRef = _o[0], setIsAutoScrollingRef = _o[1];
    var _p = (0, solid_js_1.createSignal)(false), isInitializingScrollRef = _p[0], setIsInitializingScrollRef = _p[1];
    var _q = (0, solid_js_1.createSignal)(false), hasUnapprovedPlanRef = _q[0], setHasUnapprovedPlanRef = _q[1];
    var _r = (0, solid_js_1.createSignal)(null), chatContainerRef = _r[0], setChatContainerRef = _r[1];
    // Cleanup isAutoScrollingRef on unmount to prevent stuck state
    (0, solid_js_1.createEffect)(function () {
        return function () {
            isAutoScrollingRef.current = false;
        };
    });
    // Track chat container height via CSS custom property (no re-renders)
    var _s = (0, solid_js_1.createSignal)(null), chatContainerObserverRef = _s[0], setChatContainerObserverRef = _s[1];
    var _t = (0, solid_js_1.createSignal)(null), editorRef = _t[0], setEditorRef = _t[1];
    var _u = (0, solid_js_1.createSignal)(null), fileInputRef = _u[0], setFileInputRef = _u[1];
    var _v = (0, solid_js_1.createSignal)(null), questionRef = _v[0], setQuestionRef = _v[1];
    var _w = (0, solid_js_1.createSignal)(null), prevChatKeyRef = _w[0], setPrevChatKeyRef = _w[1];
    var _x = (0, solid_js_1.createSignal)(null), prevSubChatIdRef = _x[0], setPrevSubChatIdRef = _x[1];
    // TTS playback rate state (persists across messages and sessions via localStorage)
    var _y = (0, solid_js_1.createSignal)(function () {
        if (typeof window !== "undefined") {
            var saved = localStorage.getItem("tts-playback-rate");
            if (saved && PLAYBACK_SPEEDS.includes(Number(saved))) {
                return Number(saved);
            }
        }
        return 1;
    }), ttsPlaybackRate = _y[0], setTtsPlaybackRate = _y[1];
    // Save playback rate to localStorage when it changes
    var handlePlaybackRateChange = function (rate) {
        setTtsPlaybackRate(rate);
        localStorage.setItem("tts-playback-rate", String(rate));
    };
    // PR creation loading state - from atom to allow resetting after message sent
    var setIsCreatingPr = (0, jotai_1.useSetAtom)(atoms_3.isCreatingPrAtom);
    // Rollback state
    var _z = (0, solid_js_1.createSignal)(false), isRollingBack = _z[0], setIsRollingBack = _z[1];
    // Check if user is at bottom of chat (like canvas)
    var isAtBottom = function () {
        var container = chatContainerRef.current;
        if (!container)
            return true;
        var threshold = 50;
        return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    };
    // Track previous scroll position to detect scroll direction
    var _0 = (0, solid_js_1.createSignal)(0), prevScrollTopRef = _0[0], setPrevScrollTopRef = _0[1];
    // Handle scroll events to detect user scrolling
    // Updates shouldAutoScrollRef based on scroll direction
    // Using refs only to avoid re-renders on scroll
    var handleScroll = function () {
        // Skip scroll handling for inactive tabs (keep-alive)
        if (!isActiveRef.current)
            return;
        var container = chatContainerRef.current;
        if (!container)
            return;
        var currentScrollTop = container.scrollTop;
        var prevScrollTop = prevScrollTopRef.current;
        prevScrollTopRef.current = currentScrollTop;
        // Ignore scroll events during initialization (content loading)
        if (isInitializingScrollRef.current)
            return;
        // If user scrolls UP - disable auto-scroll immediately
        // This works even during auto-scroll animation (user intent takes priority)
        if (currentScrollTop < prevScrollTop) {
            shouldAutoScrollRef.current = false;
            return;
        }
        // Ignore other scroll direction checks during auto-scroll animation
        if (isAutoScrollingRef.current)
            return;
        // If user scrolls DOWN and reaches bottom - enable auto-scroll
        shouldAutoScrollRef.current = isAtBottom();
    };
    // Scroll to bottom handler with ease-in-out animation
    var scrollToBottom = function () {
        var container = chatContainerRef.current;
        if (!container)
            return;
        isAutoScrollingRef.current = true;
        shouldAutoScrollRef.current = true;
        var start = container.scrollTop;
        var duration = 300;
        var startTime = performance.now();
        // Ease-in-out cubic function
        var easeInOutCubic = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
        var animateScroll = function (currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var easedProgress = easeInOutCubic(progress);
            // Calculate end on each frame to handle dynamic content
            var end = container.scrollHeight - container.clientHeight;
            container.scrollTop = start + (end - start) * easedProgress;
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
            else {
                // Ensure we're at the absolute bottom
                container.scrollTop = container.scrollHeight;
                isAutoScrollingRef.current = false;
            }
        };
        requestAnimationFrame(animateScroll);
    };
    // tRPC utils for cache invalidation
    var utils = mock_api_1.api.useUtils();
    // Get sub-chat name from store
    var subChatName = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { var _a; return ((_a = state.allSubChats.find(function (sc) { return sc.id === subChatId; })) === null || _a === void 0 ? void 0 : _a.name) || ""; });
    // Mutation for renaming sub-chat
    var renameSubChatMutation = mock_api_1.api.agents.renameSubChat.useMutation({ onError: function (error) {
            var _a;
            if (((_a = error.data) === null || _a === void 0 ? void 0 : _a.code) === "NOT_FOUND") {
                solid_sonner_1.toast.error("Send a message first before renaming this chat");
            }
            else {
                solid_sonner_1.toast.error("Failed to rename chat");
            }
        } });
    // Handler for renaming sub-chat
    // Using ref for mutation to avoid callback recreation
    var _1 = (0, solid_js_1.createSignal)(renameSubChatMutation), renameSubChatMutationRef = _1[0], setRenameSubChatMutationRef = _1[1];
    renameSubChatMutationRef.current = renameSubChatMutation;
    var _2 = (0, solid_js_1.createSignal)(subChatName), subChatNameRef = _2[0], setSubChatNameRef = _2[1];
    subChatNameRef.current = subChatName;
    var handleRenameSubChat = function (newName) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Optimistic update in store
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChatId, newName);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, renameSubChatMutationRef.current.mutateAsync({
                            subChatId: subChatId,
                            name: newName
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    // Revert on error (toast shown by mutation onError)
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChatId, subChatNameRef.current || "New Chat");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Plan mode state (per-subChat using atomFamily)
    var _3 = (0, jotai_1.useAtom)((0, atoms_3.subChatModeAtomFamily)(subChatId)), subChatMode = _3[0], setSubChatMode = _3[1];
    // Mutation for updating sub-chat mode in database
    var updateSubChatModeMutation = mock_api_1.api.agents.updateSubChatMode.useMutation({
        onSuccess: function () {
            // Invalidate to refetch with new mode from DB
            utils.agents.getAgentChat.invalidate({ chatId: parentChatId });
        },
        onError: function (error, variables) {
            // Don't revert if sub-chat not found in DB - it may not be persisted yet
            // This is expected for new sub-chats that haven't been saved to DB
            if (error.message === "Sub-chat not found") {
                console.warn("Sub-chat not found in DB, keeping local mode state");
                return;
            }
            // Revert local state on error to maintain sync with database
            var revertedMode = variables.mode === "plan" ? "agent" : "plan";
            setSubChatMode(revertedMode);
            // Also update store for consistency
            sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatMode(variables.subChatId, revertedMode);
            console.error("Failed to update sub-chat mode:", error.message);
        }
    });
    // Sync atomFamily mode to Zustand store on mount/subChatId change
    // This ensures the sidebar shows the correct mode icon
    (0, solid_js_1.createEffect)(function () {
        if (subChatId) {
            // Read mode directly from atomFamily to ensure we get the correct value
            var mode = jotai_store_1.appStore.get((0, atoms_3.subChatModeAtomFamily)(subChatId));
            sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatMode(subChatId, mode);
        }
    });
    // NOTE: We no longer clear caches on deactivation.
    // With proper subChatId isolation, each chat's caches are separate.
    // Caches are only cleared on unmount (when tab is evicted from keep-alive pool).
    // Cleanup message caches on unmount (when tab is evicted from keep-alive)
    // CRITICAL: Use a delayed cleanup to avoid clearing caches during temporary unmount/remount
    // (e.g., React StrictMode, HMR, or parent re-render causing component remount)
    (0, solid_js_1.createEffect)(function () {
        var currentSubChatId = subChatId;
        return function () {
            // Delay cache clearing to allow remount to happen first
            // If the component remounts with the same subChatId, the sync will repopulate the atoms
            // If it truly unmounts, the timeout will clear the caches
            var timeoutId = setTimeout(function () {
                (0, message_store_1.clearSubChatCaches)(currentSubChatId);
            }, 100);
            window.__pendingCacheCleanups = window.__pendingCacheCleanups || new Map();
            window.__pendingCacheCleanups.set(currentSubChatId, timeoutId);
        };
    });
    // Cancel pending cleanup if we remount with the same subChatId
    (0, solid_js_1.createEffect)(function () {
        var pendingCleanups = window.__pendingCacheCleanups;
        if (pendingCleanups === null || pendingCleanups === void 0 ? void 0 : pendingCleanups.has(subChatId)) {
            clearTimeout(pendingCleanups.get(subChatId));
            pendingCleanups.delete(subChatId);
        }
    });
    // Handle mode changes - updates atomFamily, store, and database together
    // No effect needed - this is called directly when user toggles mode
    var handleModeChange = function (newMode) {
        // Update atomFamily (source of truth for UI)
        setSubChatMode(newMode);
        // Update Zustand store (for other components that read from store)
        sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatMode(subChatId, newMode);
        // Save to database (skip temp IDs that haven't been persisted yet)
        if (!subChatId.startsWith("temp-")) {
            updateSubChatModeMutation.mutate({
                subChatId: subChatId,
                mode: newMode
            });
        }
    };
    // File/image upload hook
    var _4 = (0, use_agents_file_upload_1.useAgentsFileUpload)(), images = _4.images, files = _4.files, handleAddAttachments = _4.handleAddAttachments, removeImage = _4.removeImage, removeFile = _4.removeFile, clearAll = _4.clearAll, isUploading = _4.isUploading, setImagesFromDraft = _4.setImagesFromDraft, setFilesFromDraft = _4.setFilesFromDraft;
    // Text context selection hook (for selecting text from assistant messages and diff)
    var _5 = (0, use_text_context_selection_1.useTextContextSelection)(), textContexts = _5.textContexts, diffTextContexts = _5.diffTextContexts, addTextContextOriginal = _5.addTextContext, addDiffTextContext = _5.addDiffTextContext, removeTextContext = _5.removeTextContext, removeDiffTextContext = _5.removeDiffTextContext, clearTextContexts = _5.clearTextContexts, clearDiffTextContexts = _5.clearDiffTextContexts, textContextsRef = _5.textContextsRef, diffTextContextsRef = _5.diffTextContextsRef, setTextContextsFromDraft = _5.setTextContextsFromDraft, setDiffTextContextsFromDraft = _5.setDiffTextContextsFromDraft;
    // Pasted text files (large pasted text saved as files)
    var _6 = (0, use_pasted_text_files_1.usePastedTextFiles)(subChatId), pastedTexts = _6.pastedTexts, addPastedText = _6.addPastedText, removePastedText = _6.removePastedText, clearPastedTexts = _6.clearPastedTexts, pastedTextsRef = _6.pastedTextsRef;
    // File contents cache - stores content for file mentions (keyed by mentionId)
    // This content gets added to the prompt when sending, without showing a separate card
    var _7 = (0, solid_js_1.createSignal)(new Map()), fileContentsRef = _7[0], setFileContentsRef = _7[1];
    var cacheFileContent = function (mentionId, content) {
        fileContentsRef.current.set(mentionId, content);
    };
    var clearFileContents = function () {
        fileContentsRef.current.clear();
    };
    // Clear file contents cache when switching subChats to prevent stale data
    (0, solid_js_1.createEffect)(function () {
        fileContentsRef.current.clear();
    });
    // Quick comment state
    var _8 = (0, solid_js_1.createSignal)(null), quickCommentState = _8[0], setQuickCommentState = _8[1];
    // Message queue for sending messages while streaming
    var queue = (0, message_queue_store_1.useMessageQueueStore)(function (s) { var _a; return (_a = s.queues[subChatId]) !== null && _a !== void 0 ? _a : message_queue_store_1.EMPTY_QUEUE; });
    var addToQueue = (0, message_queue_store_1.useMessageQueueStore)(function (s) { return s.addToQueue; });
    var removeFromQueue = (0, message_queue_store_1.useMessageQueueStore)(function (s) { return s.removeFromQueue; });
    var popItemFromQueue = (0, message_queue_store_1.useMessageQueueStore)(function (s) { return s.popItem; });
    // Plan approval pending state (for tool approval loading)
    var _9 = (0, solid_js_1.createSignal)({}), planApprovalPending = _9[0], setPlanApprovalPending = _9[1];
    // Track chat changes for rename trigger reset
    var _10 = (0, solid_js_1.createSignal)(null), chatRef = _10[0], setChatRef = _10[1];
    if (prevSubChatIdRef.current !== subChatId) {
        hasTriggeredRenameRef.current = false;
        hasTriggeredAutoGenerateRef.current = false;
        prevSubChatIdRef.current = subChatId;
    }
    chatRef.current = chat;
    // Restore draft when subChatId changes (switching between sub-chats)
    var _11 = (0, solid_js_1.createSignal)(null), prevSubChatIdForDraftRef = _11[0], setPrevSubChatIdForDraftRef = _11[1];
    (0, solid_js_1.createEffect)(function () {
        var _a, _b, _c;
        // Restore full draft (text + attachments + text contexts) for new sub-chat
        var savedDraft = parentChatId ? (0, drafts_1.getSubChatDraftFull)(parentChatId, subChatId) : null;
        if (savedDraft) {
            // Restore text
            if (savedDraft.text) {
                (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.setValue(savedDraft.text);
            }
            else {
                (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.clear();
            }
            // Restore images
            if (savedDraft.images.length > 0) {
                setImagesFromDraft(savedDraft.images);
            }
            else {
                clearAll();
            }
            // Restore files
            if (savedDraft.files.length > 0) {
                setFilesFromDraft(savedDraft.files);
            }
            // Restore text contexts
            if (savedDraft.textContexts.length > 0) {
                setTextContextsFromDraft(savedDraft.textContexts);
            }
            else {
                clearTextContexts();
            }
        }
        else if (prevSubChatIdForDraftRef.current && prevSubChatIdForDraftRef.current !== subChatId) {
            // Clear everything when switching to a sub-chat with no draft
            (_c = editorRef.current) === null || _c === void 0 ? void 0 : _c.clear();
            clearAll();
            clearTextContexts();
        }
        prevSubChatIdForDraftRef.current = subChatId;
    });
    // Use subChatId as stable key to prevent HMR-induced duplicate resume requests
    // resume: !!streamId to reconnect to active streams (background streaming support)
    var _12 = (0, react_1.useChat)({
        id: subChatId,
        chat: chat,
        resume: !!streamId,
        experimental_throttle: 50
    }), messages = _12.messages, sendMessage = _12.sendMessage, status = _12.status, stop = _12.stop, regenerate = _12.regenerate, setMessages = _12.setMessages;
    // Refs for useChat functions to keep callbacks stable across renders
    var _13 = (0, solid_js_1.createSignal)(sendMessage), sendMessageRef = _13[0], setSendMessageRef = _13[1];
    sendMessageRef.current = sendMessage;
    var _14 = (0, solid_js_1.createSignal)(stop), stopRef = _14[0], setStopRef = _14[1];
    stopRef.current = stop;
    var isStreaming = status === "streaming" || status === "submitted";
    // Ref for isStreaming to use in callbacks/effects that need fresh value
    var _15 = (0, solid_js_1.createSignal)(isStreaming), isStreamingRef = _15[0], setIsStreamingRef = _15[1];
    isStreamingRef.current = isStreaming;
    // Track compacting status from SDK
    var compactingSubChats = (0, jotai_1.useAtomValue)(atoms_3.compactingSubChatsAtom);
    var isCompacting = compactingSubChats.has(subChatId);
    // Desktop/fullscreen state for window drag region
    var isDesktop = (0, jotai_1.useAtomValue)(atoms_1.isDesktopAtom);
    var isFullscreen = (0, jotai_1.useAtomValue)(atoms_1.isFullscreenAtom);
    // Handler to trigger manual context compaction
    var handleCompact = function () {
        if (isStreamingRef.current)
            return;
        sendMessageRef.current({
            role: "user",
            parts: [{
                    type: "text",
                    text: "/compact"
                }]
        });
    };
    // Handler to stop streaming - memoized to prevent ChatInputArea re-renders
    var handleStop = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mark as manually aborted to prevent completion sound
                    agent_chat_store_1.agentChatStore.setManuallyAborted(subChatId, true);
                    return [4 /*yield*/, stopRef.current()];
                case 1:
                    _a.sent();
                    // Call DELETE endpoint to cancel server-side stream
                    return [4 /*yield*/, fetch("/api/agents/chat?id=".concat(encodeURIComponent(subChatId)), {
                            method: "DELETE",
                            credentials: "include"
                        })];
                case 2:
                    // Call DELETE endpoint to cancel server-side stream
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // Wrapper for addTextContext that handles TextSelectionSource
    var addTextContext = function (text, source) {
        if (source.type === "assistant-message") {
            addTextContextOriginal(text, source.messageId);
        }
        else if (source.type === "diff") {
            addDiffTextContext(text, source.filePath, source.lineNumber, source.lineType);
        }
        else if (source.type === "tool-edit") {
            // Tool edit selections are treated as code selections (similar to diff)
            addDiffTextContext(text, source.filePath);
        }
        else if (source.type === "plan") {
            // Plan selections are treated as code selections (similar to diff)
            addDiffTextContext(text, source.planPath);
        }
    };
    // Focus handler for text selection popover - focus chat input after adding to context
    var handleFocusInput = function () {
        var _a;
        (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    // Handler for quick comment trigger from popover
    var handleQuickComment = function (text, source, rect) {
        setQuickCommentState({
            selectedText: text,
            source: source,
            rect: rect
        });
    };
    // Handler for quick comment submission
    var handleQuickCommentSubmit = function (comment, selectedText, source) {
        var _a;
        // Format message with mention token + comment
        var preview = selectedText.slice(0, 50).replace(/[:\[\]]/g, "");
        var encodedText = utf8ToBase64(selectedText);
        var mentionToken;
        if (source.type === "diff") {
            var lineNum = source.lineNumber || 0;
            mentionToken = "@[".concat(mentions_1.MENTION_PREFIXES.DIFF).concat(source.filePath, ":").concat(lineNum, ":").concat(preview, ":").concat(encodedText, "]");
        }
        else if (source.type === "tool-edit") {
            // Tool edit is treated as code/diff context
            mentionToken = "@[".concat(mentions_1.MENTION_PREFIXES.DIFF).concat(source.filePath, ":0:").concat(preview, ":").concat(encodedText, "]");
        }
        else {
            mentionToken = "@[".concat(mentions_1.MENTION_PREFIXES.QUOTE).concat(preview, ":").concat(encodedText, "]");
        }
        var message = "".concat(mentionToken, " ").concat(comment);
        // If streaming, add to queue
        if (isStreamingRef.current) {
            var item = (0, queue_utils_1.createQueueItem)((0, queue_utils_1.generateQueueId)(), message);
            addToQueue(subChatId, item);
            solid_sonner_1.toast.success("Reply queued", { description: "Will be sent when current response completes" });
        }
        else {
            // Send directly
            sendMessageRef.current({
                role: "user",
                parts: [{
                        type: "text",
                        text: message
                    }]
            });
            solid_sonner_1.toast.success("Reply sent");
        }
        // Clear state and selection
        setQuickCommentState(null);
        (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
    };
    // Handler for quick comment cancel
    var handleQuickCommentCancel = function () {
        setQuickCommentState(null);
    };
    // Sync loading status to atom for UI indicators
    // When streaming starts, set loading. When it stops, clear loading.
    // Unseen changes, sound notification, and sidebar refresh are handled in onFinish callback
    var setLoadingSubChats = (0, jotai_1.useSetAtom)(atoms_3.loadingSubChatsAtom);
    (0, solid_js_1.createEffect)(function () {
        var storedParentChatId = agent_chat_store_1.agentChatStore.getParentChatId(subChatId);
        if (!storedParentChatId)
            return;
        if (isStreaming) {
            (0, atoms_3.setLoading)(setLoadingSubChats, subChatId, storedParentChatId);
        }
        else {
            (0, atoms_3.clearLoading)(setLoadingSubChats, subChatId);
        }
    });
    // Watch for pending PR message and send it
    var _16 = (0, jotai_1.useAtom)(atoms_3.pendingPrMessageAtom), pendingPrMessage = _16[0], setPendingPrMessage = _16[1];
    (0, solid_js_1.createEffect)(function () {
        if (pendingPrMessage && !isStreaming) {
            // Clear the pending message immediately to prevent double-sending
            setPendingPrMessage(null);
            // Send the message to Claude
            sendMessage({
                role: "user",
                parts: [{
                        type: "text",
                        text: pendingPrMessage
                    }]
            });
            // Reset creating PR state after message is sent
            setIsCreatingPr(false);
        }
    });
    // Watch for pending Review message and send it
    var _17 = (0, jotai_1.useAtom)(atoms_3.pendingReviewMessageAtom), pendingReviewMessage = _17[0], setPendingReviewMessage = _17[1];
    (0, solid_js_1.createEffect)(function () {
        if (pendingReviewMessage && !isStreaming) {
            // Clear the pending message immediately to prevent double-sending
            setPendingReviewMessage(null);
            // Send the message to Claude
            sendMessage({
                role: "user",
                parts: [{
                        type: "text",
                        text: pendingReviewMessage
                    }]
            });
        }
    });
    // Watch for pending conflict resolution message and send it
    var _18 = (0, jotai_1.useAtom)(atoms_3.pendingConflictResolutionMessageAtom), pendingConflictMessage = _18[0], setPendingConflictMessage = _18[1];
    (0, solid_js_1.createEffect)(function () {
        if (pendingConflictMessage && !isStreaming) {
            // Clear the pending message immediately to prevent double-sending
            setPendingConflictMessage(null);
            // Send the message to Claude
            sendMessage({
                role: "user",
                parts: [{
                        type: "text",
                        text: pendingConflictMessage
                    }]
            });
        }
    });
    // Handle pending "Build plan" from sidebar (atom - effect is defined after handleApprovePlan)
    var _19 = (0, jotai_1.useAtom)(atoms_3.pendingBuildPlanSubChatIdAtom), pendingBuildPlanSubChatId = _19[0], setPendingBuildPlanSubChatId = _19[1];
    // Pending user questions from AskUserQuestion tool
    var _20 = (0, jotai_1.useAtom)(atoms_3.pendingUserQuestionsAtom), pendingQuestionsMap = _20[0], setPendingQuestionsMap = _20[1];
    // Get pending questions for this specific subChat
    var pendingQuestions = (_b = pendingQuestionsMap.get(subChatId)) !== null && _b !== void 0 ? _b : null;
    // Track whether chat input has content (for custom text with questions)
    var _21 = (0, solid_js_1.createSignal)(false), inputHasContent = _21[0], setInputHasContent = _21[1];
    // Memoize the last assistant message to avoid unnecessary recalculations
    var lastAssistantMessage = (0, solid_js_1.createMemo)(function () { return messages.findLast(function (m) { return m.role === "assistant"; }); });
    // Pre-compute token data for ChatInputArea to avoid passing unstable messages array
    // This prevents ChatInputArea from re-rendering on every streaming chunk
    var messageTokenData = (0, solid_js_1.createMemo)(function () {
        var totalInputTokens = 0;
        var totalOutputTokens = 0;
        var totalCostUsd = 0;
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var msg = messages_1[_i];
            if (msg.metadata) {
                totalInputTokens += msg.metadata.inputTokens || 0;
                totalOutputTokens += msg.metadata.outputTokens || 0;
                totalCostUsd += msg.metadata.totalCostUsd || 0;
            }
        }
        return {
            totalInputTokens: totalInputTokens,
            totalOutputTokens: totalOutputTokens,
            totalCostUsd: totalCostUsd,
            messageCount: messages.length
        };
    });
    // Track previous streaming state to detect stream stop
    var _22 = (0, solid_js_1.createSignal)(isStreaming), prevIsStreamingRef = _22[0], setPrevIsStreamingRef = _22[1];
    // Track if we recently stopped streaming (to prevent sync effect from restoring)
    var _23 = (0, solid_js_1.createSignal)(false), recentlyStoppedStreamRef = _23[0], setRecentlyStoppedStreamRef = _23[1];
    // Clear pending questions when streaming is aborted
    // This effect runs when isStreaming transitions from true to false
    (0, solid_js_1.createEffect)(function () {
        var wasStreaming = prevIsStreamingRef.current;
        prevIsStreamingRef.current = isStreaming;
        // Detect streaming stop transition
        if (wasStreaming && !isStreaming) {
            // Mark that we recently stopped streaming
            recentlyStoppedStreamRef.current = true;
            // Clear the flag after a delay
            var flagTimeout_1 = setTimeout(function () {
                recentlyStoppedStreamRef.current = false;
            }, 500);
            // Streaming just stopped - if there's a pending question for this chat,
            // clear it after a brief delay (backend already handled the abort)
            if (pendingQuestions) {
                var timeout_1 = setTimeout(function () {
                    // Re-check if still showing the same question (might have been cleared by other means)
                    setPendingQuestionsMap(function (current) {
                        if (current.has(subChatId)) {
                            var newMap = new Map(current);
                            newMap.delete(subChatId);
                            return newMap;
                        }
                        return current;
                    });
                }, 150);
                return function () {
                    clearTimeout(timeout_1);
                    clearTimeout(flagTimeout_1);
                };
            }
            return function () { return clearTimeout(flagTimeout_1); };
        }
    });
    // Sync pending questions with messages state
    // This handles: 1) restoring on chat switch, 2) clearing when question is answered/timed out
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        // Check if there's a pending AskUserQuestion in the last assistant message
        var pendingQuestionPart = (_a = lastAssistantMessage === null || lastAssistantMessage === void 0 ? void 0 : lastAssistantMessage.parts) === null || _a === void 0 ? void 0 : _a.find(function (part) { var _a; return part.type === "tool-AskUserQuestion" && part.state !== "output-available" && part.state !== "output-error" && part.state !== "result" && ((_a = part.input) === null || _a === void 0 ? void 0 : _a.questions); });
        // Helper to clear pending question for this subChat
        var clearPendingQuestion = function () {
            setPendingQuestionsMap(function (current) {
                if (current.has(subChatId)) {
                    var newMap = new Map(current);
                    newMap.delete(subChatId);
                    return newMap;
                }
                return current;
            });
        };
        // If streaming and we already have a pending question for this chat, keep it
        // (transport will manage it via chunks)
        if (isStreaming && pendingQuestions) {
            // But if the question in messages is already answered, clear the atom
            if (!pendingQuestionPart) {
                // Check if the specific toolUseId is now answered
                var answeredPart = (_b = lastAssistantMessage === null || lastAssistantMessage === void 0 ? void 0 : lastAssistantMessage.parts) === null || _b === void 0 ? void 0 : _b.find(function (part) { return part.type === "tool-AskUserQuestion" && part.toolCallId === pendingQuestions.toolUseId && (part.state === "output-available" || part.state === "output-error" || part.state === "result"); });
                if (answeredPart) {
                    clearPendingQuestion();
                }
            }
            return;
        }
        // Not streaming - DON'T restore pending questions from messages
        // If stream is not active, the question is either:
        // 1. Already answered (state would be "output-available")
        // 2. Interrupted/aborted (should not show dialog)
        // 3. Timed out (should not show dialog)
        // We only show the question dialog during active streaming when
        // the backend is waiting for user response.
        if (pendingQuestionPart) {
            // Don't restore - if there's an existing pending question for this chat, clear it
            if (pendingQuestions) {
                clearPendingQuestion();
            }
        }
        else {
            // No pending question - clear if belongs to this sub-chat
            if (pendingQuestions) {
                clearPendingQuestion();
            }
        }
    });
    // Helper to clear pending question for this subChat (used in callbacks)
    var clearPendingQuestionCallback = function () {
        setPendingQuestionsMap(function (current) {
            if (current.has(subChatId)) {
                var newMap = new Map(current);
                newMap.delete(subChatId);
                return newMap;
            }
            return current;
        });
    };
    // Handle answering questions
    var handleQuestionsAnswer = function (answers) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pendingQuestions)
                        return [2 /*return*/];
                    return [4 /*yield*/, trpc_1.trpcClient.claude.respondToolApproval.mutate({
                            toolUseId: pendingQuestions.toolUseId,
                            approved: true,
                            updatedInput: {
                                questions: pendingQuestions.questions,
                                answers: answers
                            }
                        })];
                case 1:
                    _a.sent();
                    clearPendingQuestionCallback();
                    return [2 /*return*/];
            }
        });
    }); };
    // Handle skipping questions
    var handleQuestionsSkip = function () { return __awaiter(_this, void 0, void 0, function () {
        var toolUseId, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!pendingQuestions)
                        return [2 /*return*/];
                    toolUseId = pendingQuestions.toolUseId;
                    // Clear UI immediately - don't wait for backend
                    // This ensures dialog closes even if stream was already aborted
                    clearPendingQuestionCallback();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, trpc_1.trpcClient.claude.respondToolApproval.mutate({
                            toolUseId: toolUseId,
                            approved: false,
                            message: atoms_3.QUESTIONS_SKIPPED_MESSAGE
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Ref to prevent double submit of question answer
    var _24 = (0, solid_js_1.createSignal)(false), isSubmittingQuestionAnswerRef = _24[0], setIsSubmittingQuestionAnswerRef = _24[1];
    // Handle answering questions with custom text from input (called on Enter in input)
    var handleSubmitWithQuestionAnswer = function () { return __awaiter(_this, void 0, void 0, function () {
        var customText, selectedAnswers, formattedAnswers, lastQuestion, existingAnswer;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!pendingQuestions)
                        return [2 /*return*/];
                    if (isSubmittingQuestionAnswerRef.current)
                        return [2 /*return*/];
                    isSubmittingQuestionAnswerRef.current = true;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, , 7, 8]);
                    customText = ((_b = (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                    if (!customText) {
                        isSubmittingQuestionAnswerRef.current = false;
                        return [2 /*return*/];
                    }
                    selectedAnswers = ((_c = questionRef.current) === null || _c === void 0 ? void 0 : _c.getAnswers()) || {};
                    formattedAnswers = __assign({}, selectedAnswers);
                    lastQuestion = pendingQuestions.questions[pendingQuestions.questions.length - 1];
                    if (lastQuestion) {
                        existingAnswer = formattedAnswers[lastQuestion.question];
                        if (existingAnswer) {
                            // Append to existing answer
                            formattedAnswers[lastQuestion.question] = "".concat(existingAnswer, ", Other: ").concat(customText);
                        }
                        else {
                            formattedAnswers[lastQuestion.question] = "Other: ".concat(customText);
                        }
                    }
                    // 4. Submit tool response with all answers
                    return [4 /*yield*/, trpc_1.trpcClient.claude.respondToolApproval.mutate({
                            toolUseId: pendingQuestions.toolUseId,
                            approved: true,
                            updatedInput: {
                                questions: pendingQuestions.questions,
                                answers: formattedAnswers
                            }
                        })];
                case 2:
                    // 4. Submit tool response with all answers
                    _e.sent();
                    clearPendingQuestionCallback();
                    if (!isStreamingRef.current) return [3 /*break*/, 5];
                    agent_chat_store_1.agentChatStore.setManuallyAborted(subChatId, true);
                    return [4 /*yield*/, stopRef.current()];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5:
                    // 6. Clear input
                    (_d = editorRef.current) === null || _d === void 0 ? void 0 : _d.clear();
                    if (parentChatId) {
                        (0, drafts_1.clearSubChatDraft)(parentChatId, subChatId);
                    }
                    // 7. Send custom text as a new user message
                    shouldAutoScrollRef.current = true;
                    return [4 /*yield*/, sendMessageRef.current({
                            role: "user",
                            parts: [{
                                    type: "text",
                                    text: customText
                                }]
                        })];
                case 6:
                    _e.sent();
                    return [3 /*break*/, 8];
                case 7:
                    isSubmittingQuestionAnswerRef.current = false;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Memoize the callback to prevent ChatInputArea re-renders
    // Only provide callback when there's a pending question for this subChat
    var submitWithQuestionAnswerCallback = (0, solid_js_1.createMemo)(function () { return pendingQuestions ? handleSubmitWithQuestionAnswer : undefined; });
    // Watch for pending auth retry message (after successful OAuth flow)
    var _25 = (0, jotai_1.useAtom)(atoms_3.pendingAuthRetryMessageAtom), pendingAuthRetry = _25[0], setPendingAuthRetry = _25[1];
    (0, solid_js_1.createEffect)(function () {
        // Only retry when:
        // 1. There's a pending message
        // 2. readyToRetry is true (set by modal on OAuth success)
        // 3. We're in the correct chat
        // 4. Not currently streaming
        if (pendingAuthRetry && pendingAuthRetry.readyToRetry && pendingAuthRetry.subChatId === subChatId && !isStreaming) {
            // Clear the pending message immediately to prevent double-sending
            setPendingAuthRetry(null);
            // Build message parts
            var parts = [{
                    type: "text",
                    text: pendingAuthRetry.prompt
                }];
            // Add images if present
            if (pendingAuthRetry.images && pendingAuthRetry.images.length > 0) {
                for (var _i = 0, _a = pendingAuthRetry.images; _i < _a.length; _i++) {
                    var img = _a[_i];
                    parts.push({
                        type: "data-image",
                        data: {
                            base64Data: img.base64Data,
                            mediaType: img.mediaType,
                            filename: img.filename
                        }
                    });
                }
            }
            // Send the message to Claude
            sendMessage({
                role: "user",
                parts: parts
            });
        }
    });
    var handlePlanApproval = function (toolUseId, approved) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!toolUseId)
                        return [2 /*return*/];
                    setPlanApprovalPending(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[toolUseId] = true, _a)));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, trpc_1.trpcClient.claude.respondToolApproval.mutate({
                            toolUseId: toolUseId,
                            approved: approved
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("[plan-approval] Failed to respond:", error_2);
                    solid_sonner_1.toast.error("Failed to send plan approval. Please try again.");
                    return [3 /*break*/, 5];
                case 4:
                    setPlanApprovalPending(function (prev) {
                        var next = __assign({}, prev);
                        delete next[toolUseId];
                        return next;
                    });
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle plan approval - sends "Build plan" message and switches to agent mode
    var handleApprovePlan = function () {
        // Update store mode synchronously BEFORE sending (transport reads from store)
        sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatMode(subChatId, "agent");
        // Sync mode to database for sidebar indicator (getPendingPlanApprovals)
        if (!subChatId.startsWith("temp-")) {
            updateSubChatModeMutation.mutate({
                subChatId: subChatId,
                mode: "agent"
            });
        }
        // Update atomFamily state (for UI) - this also syncs to store via effect
        setSubChatMode("agent");
        // Enable auto-scroll and immediately scroll to bottom
        shouldAutoScrollRef.current = true;
        scrollToBottom();
        // Send "Build plan" message (now in agent mode)
        sendMessageRef.current({
            role: "user",
            parts: [{
                    type: "text",
                    text: "Build plan"
                }]
        });
    };
    // Handle pending "Build plan" from sidebar
    (0, solid_js_1.createEffect)(function () {
        // Only trigger if this is the target sub-chat and we're active
        if (pendingBuildPlanSubChatId === subChatId && isActive) {
            setPendingBuildPlanSubChatId(null);
            handleApprovePlan();
        }
    });
    // Detect PR URLs in assistant messages and store them
    // Initialize with existing PR URL to prevent duplicate toast on re-mount
    var _26 = (0, solid_js_1.createSignal)(existingPrUrl !== null && existingPrUrl !== void 0 ? existingPrUrl : null), detectedPrUrlRef = _26[0], setDetectedPrUrlRef = _26[1];
    (0, solid_js_1.createEffect)(function () {
        var _a;
        // Only check after streaming ends
        if (isStreaming)
            return;
        // Look through messages for PR URLs
        for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
            var msg = messages_2[_i];
            if (msg.role !== "assistant")
                continue;
            // Extract text content from message
            var textContent = ((_a = msg.parts) === null || _a === void 0 ? void 0 : _a.filter(function (p) { return p.type === "text"; }).map(function (p) { return p.text; }).join(" ")) || "";
            // Match GitHub PR URL pattern
            var prUrlMatch = textContent.match(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/(\d+)/);
            if (prUrlMatch && prUrlMatch[0] !== detectedPrUrlRef.current) {
                var prUrl = prUrlMatch[0];
                var prNumber = parseInt(prUrlMatch[1], 10);
                // Store to prevent duplicate calls
                detectedPrUrlRef.current = prUrl;
                // Update database
                trpc_1.trpcClient.chats.updatePrInfo.mutate({
                    chatId: parentChatId,
                    prUrl: prUrl,
                    prNumber: prNumber
                }).then(function () {
                    // Invalidate the agentChat query to refetch with new PR info
                    utils.agents.getAgentChat.invalidate({ chatId: parentChatId });
                });
                break;
            }
        }
    });
    // Track plan Edit completions to trigger sidebar refetch
    var triggerPlanEditRefetch = (0, jotai_1.useSetAtom)((0, solid_js_1.createMemo)(function () { return (0, atoms_3.planEditRefetchTriggerAtomFamily)(subChatId); }));
    var _27 = (0, solid_js_1.createSignal)(0), lastPlanEditCountRef = _27[0], setLastPlanEditCountRef = _27[1];
    (0, solid_js_1.createEffect)(function () {
        var _a;
        // Count completed plan Edits
        var completedPlanEdits = 0;
        for (var _i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
            var msg = messages_3[_i];
            if (msg.role !== "assistant" || !msg.parts)
                continue;
            for (var _b = 0, _c = msg.parts; _b < _c.length; _b++) {
                var part = _c[_b];
                if (part.type === "tool-Edit" && part.state !== "input-streaming" && part.state !== "pending" && (0, agent_tool_utils_1.isPlanFile)(((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "")) {
                    completedPlanEdits++;
                }
            }
        }
        // Trigger refetch if count increased (new Edit completed)
        if (completedPlanEdits > lastPlanEditCountRef.current) {
            lastPlanEditCountRef.current = completedPlanEdits;
            triggerPlanEditRefetch();
        }
    });
    var _28 = (0, use_changed_files_tracking_1.useChangedFilesTracking)(messages, subChatId, isStreaming, parentChatId), changedFilesForSubChat = _28.changedFiles, recomputeChangedFiles = _28.recomputeChangedFiles;
    // Rollback handler - truncates messages to the clicked assistant message and restores git state
    // The SDK UUID from the last assistant message will be used for resumeSessionAt on next send
    var handleRollback = function (assistantMsg) { return __awaiter(_this, void 0, void 0, function () {
        var sdkUuid, result, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (isRollingBack) {
                        solid_sonner_1.toast.error("Rollback already in progress");
                        return [2 /*return*/];
                    }
                    if (isStreaming) {
                        solid_sonner_1.toast.error("Cannot rollback while streaming");
                        return [2 /*return*/];
                    }
                    sdkUuid = (_a = assistantMsg.metadata) === null || _a === void 0 ? void 0 : _a.sdkMessageUuid;
                    if (!sdkUuid) {
                        solid_sonner_1.toast.error("Cannot rollback: message has no SDK UUID");
                        return [2 /*return*/];
                    }
                    setIsRollingBack(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, trpc_1.trpcClient.chats.rollbackToMessage.mutate({
                            subChatId: subChatId,
                            sdkMessageUuid: sdkUuid
                        })];
                case 2:
                    result = _b.sent();
                    if (!result.success) {
                        solid_sonner_1.toast.error("Failed to rollback: ".concat(result.error));
                        setIsRollingBack(false);
                        return [2 /*return*/];
                    }
                    // Update local state with truncated messages from server
                    setMessages(result.messages);
                    recomputeChangedFiles(result.messages);
                    refreshDiff === null || refreshDiff === void 0 ? void 0 : refreshDiff();
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _b.sent();
                    console.error("[handleRollback] Error:", error_3);
                    solid_sonner_1.toast.error("Failed to rollback");
                    return [3 /*break*/, 5];
                case 4:
                    setIsRollingBack(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Expose rollback handler/state via atoms for message action bar
    var setRollbackHandler = (0, jotai_1.useSetAtom)(message_store_1.rollbackHandlerAtom);
    (0, solid_js_1.createEffect)(function () {
        setRollbackHandler(function () { return handleRollback; });
        return function () { return setRollbackHandler(null); };
    });
    var setIsRollingBackAtom = (0, jotai_1.useSetAtom)(message_store_1.isRollingBackAtom);
    (0, solid_js_1.createEffect)(function () {
        setIsRollingBackAtom(isRollingBack);
    });
    // ESC, Ctrl+C and Cmd+Shift+Backspace handler for stopping stream
    (0, solid_js_1.createEffect)(function () {
        // Skip keyboard handlers for inactive tabs (keep-alive)
        if (!isActive)
            return;
        var handleKeyDown = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var shouldStop, shouldSkipQuestions, target, isInsideOverlay, hasOpenDialog, selection, hasSelection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldStop = false;
                        shouldSkipQuestions = false;
                        // Check for Escape key without modifiers (works even from input fields, like terminal Ctrl+C)
                        // Ignore if Cmd/Ctrl is pressed (reserved for Cmd+Esc to focus input)
                        if (e.key === "Escape" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && isStreaming) {
                            target = e.target;
                            isInsideOverlay = target.closest("[role=\"dialog\"], [role=\"alertdialog\"], [role=\"menu\"], [role=\"listbox\"], [data-radix-popper-content-wrapper], [data-state=\"open\"]");
                            hasOpenDialog = document.querySelector("[role=\"dialog\"][aria-modal=\"true\"], [data-modal=\"agents-settings\"]");
                            if (!isInsideOverlay && !hasOpenDialog) {
                                // If there are pending questions for this chat, skip them instead of stopping stream
                                if (pendingQuestions) {
                                    shouldSkipQuestions = true;
                                }
                                else {
                                    shouldStop = true;
                                }
                            }
                        }
                        // Check for Ctrl+C (only Ctrl, not Cmd on Mac)
                        if (e.ctrlKey && !e.metaKey && e.code === "KeyC") {
                            if (!isStreaming)
                                return [2 /*return*/];
                            selection = window.getSelection();
                            hasSelection = selection && selection.toString().length > 0;
                            // If there's a text selection, let browser handle copy
                            if (hasSelection)
                                return [2 /*return*/];
                            shouldStop = true;
                        }
                        // Check for Cmd+Shift+Backspace (Mac) or Ctrl+Shift+Backspace (Windows/Linux)
                        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Backspace" && isStreaming) {
                            shouldStop = true;
                        }
                        if (!shouldSkipQuestions) return [3 /*break*/, 2];
                        e.preventDefault();
                        return [4 /*yield*/, handleQuestionsSkip()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!shouldStop) return [3 /*break*/, 5];
                        e.preventDefault();
                        // Mark as manually aborted to prevent completion sound
                        agent_chat_store_1.agentChatStore.setManuallyAborted(subChatId, true);
                        return [4 /*yield*/, stop()];
                    case 3:
                        _a.sent();
                        // Call DELETE endpoint to cancel server-side stream
                        return [4 /*yield*/, fetch("/api/agents/chat?id=".concat(encodeURIComponent(subChatId)), {
                                method: "DELETE",
                                credentials: "include"
                            })];
                    case 4:
                        // Call DELETE endpoint to cancel server-side stream
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Keyboard shortcut: Enter to focus input when not already focused
    (0, use_focus_input_on_enter_1.useFocusInputOnEnter)(editorRef);
    // Keyboard shortcut: Cmd+Esc to toggle focus/blur (without stopping generation)
    (0, use_toggle_focus_on_cmd_esc_1.useToggleFocusOnCmdEsc)(editorRef);
    // Auto-trigger AI response when we have initial message but no response yet
    // Also trigger auto-rename for initial sub-chat with pre-populated message
    // IMPORTANT: Skip if there's an active streamId (prevents double-generation on resume)
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (messages.length === 1 && status === "ready" && !streamId && !hasTriggeredAutoGenerateRef.current) {
            hasTriggeredAutoGenerateRef.current = true;
            // Trigger rename for pre-populated initial message (from createAgentChat)
            if (!hasTriggeredRenameRef.current && isFirstSubChat) {
                var firstMsg = messages[0];
                if ((firstMsg === null || firstMsg === void 0 ? void 0 : firstMsg.role) === "user") {
                    var textPart = (_a = firstMsg.parts) === null || _a === void 0 ? void 0 : _a.find(function (p) { return p.type === "text"; });
                    if (textPart && "text" in textPart) {
                        hasTriggeredRenameRef.current = true;
                        onAutoRename(textPart.text, subChatId);
                    }
                }
            }
            regenerate();
        }
    });
    // Ref to track if initial scroll has been set for this sub-chat
    var _29 = (0, solid_js_1.createSignal)(false), scrollInitializedRef = _29[0], setScrollInitializedRef = _29[1];
    // Track if this tab has been initialized (for keep-alive)
    var _30 = (0, solid_js_1.createSignal)(false), hasInitializedRef = _30[0], setHasInitializedRef = _30[1];
    // Initialize scroll position on mount (only once per tab with keep-alive)
    // Strategy: wait for content to stabilize, then scroll to bottom ONCE
    // No jumping around - just wait and scroll when ready
    (0, solid_js_1.createEffect)(function () {
        // Skip if not active (keep-alive: hidden tabs don't need scroll init)
        if (!isActive)
            return;
        var container = chatContainerRef.current;
        if (!container)
            return;
        // With keep-alive, only initialize once per tab mount
        if (hasInitializedRef.current)
            return;
        hasInitializedRef.current = true;
        // Reset on sub-chat change
        scrollInitializedRef.current = false;
        isInitializingScrollRef.current = true;
        // IMMEDIATE scroll to bottom - no waiting
        container.scrollTop = container.scrollHeight;
        shouldAutoScrollRef.current = true;
        // Mark as initialized IMMEDIATELY
        scrollInitializedRef.current = true;
        isInitializingScrollRef.current = false;
        // MutationObserver for async content (images, code blocks loading after initial render)
        var observer = new MutationObserver(function (mutations) {
            // Skip if not active (keep-alive: don't scroll hidden tabs)
            if (!isActive)
                return;
            if (!shouldAutoScrollRef.current)
                return;
            // Check if content was added
            var hasAddedContent = mutations.some(function (m) { return m.type === "childList" && m.addedNodes.length > 0; });
            if (hasAddedContent) {
                requestAnimationFrame(function () {
                    isAutoScrollingRef.current = true;
                    container.scrollTop = container.scrollHeight;
                    requestAnimationFrame(function () {
                        isAutoScrollingRef.current = false;
                    });
                });
            }
        });
        observer.observe(container, {
            childList: true,
            subtree: true
        });
        return function () {
            observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });
    // Attach scroll listener (separate effect)
    (0, solid_js_1.createEffect)(function () {
        var container = chatContainerRef.current;
        if (!container)
            return;
        container.addEventListener("scroll", handleScroll, { passive: true });
        return function () {
            container.removeEventListener("scroll", handleScroll);
        };
    });
    // Auto scroll to bottom when messages change during streaming
    // Only kicks in after content fills the viewport (overflow behavior)
    (0, solid_js_1.createEffect)(function () {
        // Skip if not active (keep-alive: don't scroll hidden tabs)
        if (!isActive)
            return;
        // Skip if scroll not yet initialized
        if (!scrollInitializedRef.current)
            return;
        // Auto-scroll during streaming if user hasn't scrolled up
        if (shouldAutoScrollRef.current && status === "streaming") {
            var container_1 = chatContainerRef.current;
            if (container_1) {
                // Always scroll during streaming if auto-scroll is enabled
                // (user can disable by scrolling up)
                requestAnimationFrame(function () {
                    isAutoScrollingRef.current = true;
                    container_1.scrollTop = container_1.scrollHeight;
                    requestAnimationFrame(function () {
                        isAutoScrollingRef.current = false;
                    });
                });
            }
        }
    });
    // Auto-focus input when switching to this chat (any sub-chat change)
    // Skip on mobile to prevent keyboard from opening automatically
    (0, solid_js_1.createEffect)(function () {
        // Skip if not active (keep-alive: don't focus hidden tabs)
        if (!isActive)
            return;
        if (isMobile)
            return;
        // Use requestAnimationFrame to ensure DOM is ready after render
        requestAnimationFrame(function () {
            var _a;
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        });
    });
    // Refs for handleSend to avoid recreating callback on every messages change
    var _31 = (0, solid_js_1.createSignal)(messages.length), messagesLengthRef = _31[0], setMessagesLengthRef = _31[1];
    messagesLengthRef.current = messages.length;
    var _32 = (0, solid_js_1.createSignal)(subChatMode), subChatModeRef = _32[0], setSubChatModeRef = _32[1];
    subChatModeRef.current = subChatMode;
    var _33 = (0, solid_js_1.createSignal)(images), imagesRef = _33[0], setImagesRef = _33[1];
    imagesRef.current = images;
    var _34 = (0, solid_js_1.createSignal)(files), filesRef = _34[0], setFilesRef = _34[1];
    filesRef.current = files;
    var handleSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var inputValue, hasText, currentImages, currentFiles, currentTextContexts, currentPastedTexts, hasImages, hasTextContexts, hasPastedTexts, queuedImages, queuedFiles, queuedTextContexts, item, text, finalText, slashMatch, commandName_1, args, builtinNames, commands, cmd, content, error_4, parts, currentDiffTextContexts, mentionPrefix, quoteMentions, diffMentions, pastedTextMentions, _i, _a, _b, mentionId, content, filePath, now_1, queryClient, now_2, queries, chatsListQuery;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    // Block sending while sandbox is still being set up
                    if (sandboxSetupStatus !== "ready") {
                        return [2 /*return*/];
                    }
                    inputValue = ((_c = editorRef.current) === null || _c === void 0 ? void 0 : _c.getValue()) || "";
                    hasText = inputValue.trim().length > 0;
                    currentImages = imagesRef.current;
                    currentFiles = filesRef.current;
                    currentTextContexts = textContextsRef.current;
                    currentPastedTexts = pastedTextsRef.current;
                    hasImages = currentImages.filter(function (img) { return !img.isLoading && img.url; }).length > 0;
                    hasTextContexts = currentTextContexts.length > 0;
                    hasPastedTexts = currentPastedTexts.length > 0;
                    if (!hasText && !hasImages && !hasTextContexts && !hasPastedTexts)
                        return [2 /*return*/];
                    // If streaming, add to queue instead of sending directly
                    if (isStreamingRef.current) {
                        queuedImages = currentImages.filter(function (img) { return !img.isLoading && img.url; }).map(queue_utils_1.toQueuedImage);
                        queuedFiles = currentFiles.filter(function (f) { return !f.isLoading && f.url; }).map(queue_utils_1.toQueuedFile);
                        queuedTextContexts = currentTextContexts.map(queue_utils_1.toQueuedTextContext);
                        item = (0, queue_utils_1.createQueueItem)((0, queue_utils_1.generateQueueId)(), inputValue.trim(), queuedImages.length > 0 ? queuedImages : undefined, queuedFiles.length > 0 ? queuedFiles : undefined, queuedTextContexts.length > 0 ? queuedTextContexts : undefined);
                        addToQueue(subChatId, item);
                        // Clear input and attachments
                        (_d = editorRef.current) === null || _d === void 0 ? void 0 : _d.clear();
                        if (parentChatId) {
                            (0, drafts_1.clearSubChatDraft)(parentChatId, subChatId);
                        }
                        clearAll();
                        clearTextContexts();
                        return [2 /*return*/];
                    }
                    // Auto-restore archived workspace when sending a message
                    if (isArchived && onRestoreWorkspace) {
                        onRestoreWorkspace();
                    }
                    text = inputValue.trim();
                    finalText = text;
                    slashMatch = text.match(/^\/(\S+)\s*(.*)$/s);
                    if (!slashMatch) return [3 /*break*/, 6];
                    commandName_1 = slashMatch[1], args = slashMatch[2];
                    builtinNames = new Set(commands_1.BUILTIN_SLASH_COMMANDS.map(function (cmd) { return cmd.name; }));
                    if (!!builtinNames.has(commandName_1)) return [3 /*break*/, 6];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, trpc_1.trpcClient.commands.list.query({ projectPath: projectPath })];
                case 2:
                    commands = _f.sent();
                    cmd = commands.find(function (c) { return c.name.toLowerCase() === commandName_1.toLowerCase(); });
                    if (!cmd) return [3 /*break*/, 4];
                    return [4 /*yield*/, trpc_1.trpcClient.commands.getContent.query({ path: cmd.path })];
                case 3:
                    content = (_f.sent()).content;
                    finalText = content.replace(/\$ARGUMENTS/g, args.trim());
                    _f.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_4 = _f.sent();
                    console.error("Failed to expand custom slash command:", error_4);
                    return [3 /*break*/, 6];
                case 6:
                    // Clear editor and draft from localStorage
                    (_e = editorRef.current) === null || _e === void 0 ? void 0 : _e.clear();
                    if (parentChatId) {
                        (0, drafts_1.clearSubChatDraft)(parentChatId, subChatId);
                    }
                    // Track message sent
                    (0, analytics_1.trackMessageSent)({
                        workspaceId: subChatId,
                        messageLength: finalText.length,
                        mode: subChatModeRef.current
                    });
                    // Trigger auto-rename on first message in a new sub-chat
                    if (messagesLengthRef.current === 0 && !hasTriggeredRenameRef.current) {
                        hasTriggeredRenameRef.current = true;
                        onAutoRename(finalText || "Image message", subChatId);
                    }
                    parts = __spreadArray(__spreadArray([], currentImages.filter(function (img) { return !img.isLoading && img.url; }).map(function (img) { return ({
                        type: "data-image",
                        data: {
                            url: img.url,
                            mediaType: img.mediaType,
                            filename: img.filename,
                            base64Data: img.base64Data
                        }
                    }); }), true), currentFiles.filter(function (f) { return !f.isLoading && f.url; }).map(function (f) { return ({
                        type: "data-file",
                        data: {
                            url: f.url,
                            mediaType: f.mediaType,
                            filename: f.filename,
                            size: f.size
                        }
                    }); }), true);
                    currentDiffTextContexts = diffTextContextsRef.current;
                    mentionPrefix = "";
                    if (currentTextContexts.length > 0 || currentDiffTextContexts.length > 0 || currentPastedTexts.length > 0) {
                        quoteMentions = currentTextContexts.map(function (tc) {
                            var preview = tc.preview.replace(/[:\[\]]/g, "");
                            var encodedText = utf8ToBase64(tc.text);
                            return "@[".concat(mentions_1.MENTION_PREFIXES.QUOTE).concat(preview, ":").concat(encodedText, "]");
                        });
                        diffMentions = currentDiffTextContexts.map(function (dtc) {
                            var preview = dtc.preview.replace(/[:\[\]]/g, "");
                            var encodedText = utf8ToBase64(dtc.text);
                            var lineNum = dtc.lineNumber || 0;
                            return "@[".concat(mentions_1.MENTION_PREFIXES.DIFF).concat(dtc.filePath, ":").concat(lineNum, ":").concat(preview, ":").concat(encodedText, "]");
                        });
                        pastedTextMentions = currentPastedTexts.map(function (pt) {
                            // Sanitize preview to remove special characters that break mention parsing
                            var sanitizedPreview = pt.preview.replace(/[:\[\]|]/g, "");
                            return "@[".concat(mentions_1.MENTION_PREFIXES.PASTED).concat(pt.size, ":").concat(sanitizedPreview, "|").concat(pt.filePath, "]");
                        });
                        mentionPrefix = __spreadArray(__spreadArray(__spreadArray([], quoteMentions, true), diffMentions, true), pastedTextMentions, true).join(" ") + " ";
                    }
                    if (finalText || mentionPrefix) {
                        parts.push({
                            type: "text",
                            text: mentionPrefix + (finalText || "")
                        });
                    }
                    // Add cached file contents as hidden parts (sent to agent but not displayed in UI)
                    // These are from dropped text files - content is embedded so agent sees it immediately
                    if (fileContentsRef.current.size > 0) {
                        for (_i = 0, _a = fileContentsRef.current.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], mentionId = _b[0], content = _b[1];
                            filePath = mentionId.replace(/^file:(local|external):/, "");
                            parts.push({
                                type: "file-content",
                                filePath: filePath,
                                content: content
                            });
                        }
                    }
                    clearAll();
                    clearTextContexts();
                    clearDiffTextContexts();
                    clearPastedTexts();
                    clearFileContents();
                    // Optimistic update: immediately update chat's updated_at and resort array for instant sidebar resorting
                    if (teamId) {
                        now_1 = new Date();
                        utils.agents.getAgentChats.setData({ teamId: teamId }, function (old) {
                            if (!old)
                                return old;
                            // Update the timestamp and sort by updated_at descending
                            var updated = old.map(function (c) { return c.id === parentChatId ? __assign(__assign({}, c), { updated_at: now_1 }) : c; });
                            return updated.sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); });
                        });
                    }
                    queryClient = (0, TRPCProvider_1.getQueryClient)();
                    if (queryClient) {
                        now_2 = new Date();
                        queries = queryClient.getQueryCache().getAll();
                        chatsListQuery = queries.find(function (q) { return Array.isArray(q.queryKey) && Array.isArray(q.queryKey[0]) && q.queryKey[0][0] === "chats" && q.queryKey[0][1] === "list"; });
                        if (chatsListQuery) {
                            queryClient.setQueryData(chatsListQuery.queryKey, function (old) {
                                if (!old)
                                    return old;
                                // Update the timestamp and sort by updatedAt descending
                                var updated = old.map(function (c) { return c.id === parentChatId ? __assign(__assign({}, c), { updatedAt: now_2 }) : c; });
                                return updated.sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); });
                            });
                        }
                    }
                    // Optimistically update sub-chat timestamp to move it to top
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatTimestamp(subChatId);
                    // Enable auto-scroll and immediately scroll to bottom
                    shouldAutoScrollRef.current = true;
                    scrollToBottom();
                    return [4 /*yield*/, sendMessageRef.current({
                            role: "user",
                            parts: parts
                        })];
                case 7:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // Queue handlers for sending queued messages
    var handleSendFromQueue = function (itemId) { return __awaiter(_this, void 0, void 0, function () {
        var item, maxWait, pollInterval_1, waited, parts, mentionPrefix, quoteMentions, diffMentions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    item = popItemFromQueue(subChatId, itemId);
                    if (!item)
                        return [2 /*return*/];
                    if (!isStreamingRef.current) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleStop()];
                case 1:
                    _a.sent();
                    maxWait = 2e3;
                    pollInterval_1 = 50;
                    waited = 0;
                    _a.label = 2;
                case 2:
                    if (!(isStreamingRef.current && waited < maxWait)) return [3 /*break*/, 4];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollInterval_1); })];
                case 3:
                    _a.sent();
                    waited += pollInterval_1;
                    return [3 /*break*/, 2];
                case 4:
                    parts = __spreadArray(__spreadArray([], (item.images || []).map(function (img) { return ({
                        type: "data-image",
                        data: {
                            url: img.url,
                            mediaType: img.mediaType,
                            filename: img.filename,
                            base64Data: img.base64Data
                        }
                    }); }), true), (item.files || []).map(function (f) { return ({
                        type: "data-file",
                        data: {
                            url: f.url,
                            mediaType: f.mediaType,
                            filename: f.filename,
                            size: f.size
                        }
                    }); }), true);
                    mentionPrefix = "";
                    if (item.textContexts && item.textContexts.length > 0) {
                        quoteMentions = item.textContexts.map(function (tc) {
                            var preview = tc.text.slice(0, 50).replace(/[:\[\]]/g, "");
                            var encodedText = utf8ToBase64(tc.text);
                            return "@[".concat(mentions_1.MENTION_PREFIXES.QUOTE).concat(preview, ":").concat(encodedText, "]");
                        });
                        mentionPrefix = quoteMentions.join(" ") + " ";
                    }
                    // Add diff text contexts as mention tokens
                    if (item.diffTextContexts && item.diffTextContexts.length > 0) {
                        diffMentions = item.diffTextContexts.map(function (dtc) {
                            var preview = dtc.text.slice(0, 50).replace(/[:\[\]]/g, "");
                            var encodedText = utf8ToBase64(dtc.text);
                            var lineNum = dtc.lineNumber || 0;
                            return "@[".concat(mentions_1.MENTION_PREFIXES.DIFF).concat(dtc.filePath, ":").concat(lineNum, ":").concat(preview, ":").concat(encodedText, "]");
                        });
                        mentionPrefix += diffMentions.join(" ") + " ";
                    }
                    if (item.message || mentionPrefix) {
                        parts.push({
                            type: "text",
                            text: mentionPrefix + (item.message || "")
                        });
                    }
                    // Track message sent
                    (0, analytics_1.trackMessageSent)({
                        workspaceId: subChatId,
                        messageLength: item.message.length,
                        mode: subChatModeRef.current
                    });
                    // Update timestamps
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatTimestamp(subChatId);
                    // Enable auto-scroll and immediately scroll to bottom
                    shouldAutoScrollRef.current = true;
                    scrollToBottom();
                    return [4 /*yield*/, sendMessageRef.current({
                            role: "user",
                            parts: parts
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveFromQueue = function (itemId) {
        removeFromQueue(subChatId, itemId);
    };
    // Force send - stop stream and send immediately, bypassing queue (Opt+Enter)
    var handleForceSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var inputValue, hasText, currentImages, currentFiles, hasImages, maxWait, pollInterval_2, waited, text, finalText, slashMatch, commandName_2, args, builtinNames, commands, cmd, content, error_5, parts;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Block sending while sandbox is still being set up
                    if (sandboxSetupStatus !== "ready") {
                        return [2 /*return*/];
                    }
                    inputValue = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                    hasText = inputValue.trim().length > 0;
                    currentImages = imagesRef.current;
                    currentFiles = filesRef.current;
                    hasImages = currentImages.filter(function (img) { return !img.isLoading && img.url; }).length > 0;
                    if (!hasText && !hasImages)
                        return [2 /*return*/];
                    if (!isStreamingRef.current) return [3 /*break*/, 4];
                    return [4 /*yield*/, handleStop()];
                case 1:
                    _c.sent();
                    maxWait = 2e3;
                    pollInterval_2 = 50;
                    waited = 0;
                    _c.label = 2;
                case 2:
                    if (!(isStreamingRef.current && waited < maxWait)) return [3 /*break*/, 4];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollInterval_2); })];
                case 3:
                    _c.sent();
                    waited += pollInterval_2;
                    return [3 /*break*/, 2];
                case 4:
                    // Auto-restore archived workspace when sending a message
                    if (isArchived && onRestoreWorkspace) {
                        onRestoreWorkspace();
                    }
                    text = inputValue.trim();
                    finalText = text;
                    slashMatch = text.match(/^\/(\S+)\s*(.*)$/s);
                    if (!slashMatch) return [3 /*break*/, 10];
                    commandName_2 = slashMatch[1], args = slashMatch[2];
                    builtinNames = new Set(commands_1.BUILTIN_SLASH_COMMANDS.map(function (cmd) { return cmd.name; }));
                    if (!!builtinNames.has(commandName_2)) return [3 /*break*/, 10];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, trpc_1.trpcClient.commands.list.query({ projectPath: projectPath })];
                case 6:
                    commands = _c.sent();
                    cmd = commands.find(function (c) { return c.name.toLowerCase() === commandName_2.toLowerCase(); });
                    if (!cmd) return [3 /*break*/, 8];
                    return [4 /*yield*/, trpc_1.trpcClient.commands.getContent.query({ path: cmd.path })];
                case 7:
                    content = (_c.sent()).content;
                    finalText = content.replace(/\$ARGUMENTS/g, args.trim());
                    _c.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_5 = _c.sent();
                    console.error("Failed to expand custom slash command:", error_5);
                    return [3 /*break*/, 10];
                case 10:
                    // Clear editor and draft from localStorage
                    (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.clear();
                    if (parentChatId) {
                        (0, drafts_1.clearSubChatDraft)(parentChatId, subChatId);
                    }
                    // Track message sent
                    (0, analytics_1.trackMessageSent)({
                        workspaceId: subChatId,
                        messageLength: finalText.length,
                        mode: subChatModeRef.current
                    });
                    parts = __spreadArray(__spreadArray([], currentImages.filter(function (img) { return !img.isLoading && img.url; }).map(function (img) { return ({
                        type: "data-image",
                        data: {
                            url: img.url,
                            mediaType: img.mediaType,
                            filename: img.filename,
                            base64Data: img.base64Data
                        }
                    }); }), true), currentFiles.filter(function (f) { return !f.isLoading && f.url; }).map(function (f) { return ({
                        type: "data-file",
                        data: {
                            url: f.url,
                            mediaType: f.mediaType,
                            filename: f.filename,
                            size: f.size
                        }
                    }); }), true);
                    if (finalText) {
                        parts.push({
                            type: "text",
                            text: finalText
                        });
                    }
                    // Clear attachments
                    clearAll();
                    // Update timestamps
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatTimestamp(subChatId);
                    // Force scroll to bottom
                    shouldAutoScrollRef.current = true;
                    scrollToBottom();
                    return [4 /*yield*/, sendMessageRef.current({
                            role: "user",
                            parts: parts
                        })];
                case 11:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // NOTE: Auto-processing of queue is now handled globally by QueueProcessor
    // component in agents-layout.tsx. This ensures queues continue processing
    // even when user navigates to different sub-chats or workspaces.
    // Helper to get message text content
    var getMessageTextContent = function (msg) {
        var _a;
        return ((_a = msg.parts) === null || _a === void 0 ? void 0 : _a.filter(function (p) { return p.type === "text"; }).map(function (p) { return p.text; }).join("\n")) || "";
    };
    // Helper to copy message content
    var copyMessageContent = function (msg) {
        var textContent = getMessageTextContent(msg);
        if (textContent) {
            navigator.clipboard.writeText((0, chat_markdown_renderer_1.stripEmojis)(textContent));
        }
    };
    // Check if there's an unapproved plan (in plan mode with completed ExitPlanMode)
    var hasUnapprovedPlan = (0, solid_js_1.createMemo)(function () {
        // If already in agent mode, plan is approved (mode is the source of truth)
        if (subChatMode !== "plan")
            return false;
        // Look for completed ExitPlanMode in messages
        for (var i = messages.length - 1; i >= 0; i--) {
            var msg = messages[i];
            // If assistant message with completed ExitPlanMode, we found an unapproved plan
            if (msg.role === "assistant" && msg.parts) {
                var exitPlanPart = msg.parts.find(function (p) { return p.type === "tool-ExitPlanMode"; });
                // Check if ExitPlanMode is completed (has output, even if empty)
                if (exitPlanPart && exitPlanPart.output !== undefined) {
                    return true;
                }
            }
        }
        return false;
    });
    // Keep ref in sync for use in initializeScroll (which runs in useLayoutEffect)
    hasUnapprovedPlanRef.current = hasUnapprovedPlan;
    // Update pending plan approvals atom for sidebar indicators
    var setPendingPlanApprovals = (0, jotai_1.useSetAtom)(atoms_3.pendingPlanApprovalsAtom);
    (0, solid_js_1.createEffect)(function () {
        setPendingPlanApprovals(function (prev) {
            var newMap = new Map(prev);
            if (hasUnapprovedPlan) {
                newMap.set(subChatId, parentChatId);
            }
            else {
                newMap.delete(subChatId);
            }
            // Only return new map if it changed
            if (newMap.size !== prev.size || !__spreadArray([], newMap.keys(), true).every(function (id) { return prev.has(id); })) {
                return newMap;
            }
            return prev;
        });
    });
    // Keyboard shortcut: Cmd+Enter to approve plan
    (0, solid_js_1.createEffect)(function () {
        if (!isActive)
            return;
        var handleKeyDown = function (e) {
            if (e.key === "Enter" && e.metaKey && !e.shiftKey && hasUnapprovedPlan && !isStreaming) {
                e.preventDefault();
                handleApprovePlan();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Cmd/Ctrl + Arrow Down to scroll to bottom (works even when focused in input)
    // But don't intercept if input has content - let native cursor navigation work
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var _a;
            if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
                // Don't intercept if input has content - let native cursor navigation work
                var inputValue = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                if (inputValue.trim().length > 0) {
                    return;
                }
                e.preventDefault();
                scrollToBottom();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Clean up pending plan approval when unmounting
    (0, solid_js_1.createEffect)(function () {
        return function () {
            setPendingPlanApprovals(function (prev) {
                if (prev.has(subChatId)) {
                    var newMap = new Map(prev);
                    newMap.delete(subChatId);
                    return newMap;
                }
                return prev;
            });
        };
    });
    // Compute sticky top class for user messages
    var stickyTopClass = isMobile ? CHAT_LAYOUT.stickyTopMobile : isSubChatsSidebarOpen ? CHAT_LAYOUT.stickyTopSidebarOpen : CHAT_LAYOUT.stickyTopSidebarClosed;
    // Sync messages to Jotai store for isolated rendering
    // CRITICAL: Only sync from the ACTIVE tab to prevent overwriting global atoms
    // Each tab has its own useChat() instance, but global atoms (messageIdsAtom, etc.) are shared.
    // Only the active tab should update these global atoms.
    var syncMessages = (0, jotai_1.useSetAtom)(message_store_1.syncMessagesWithStatusAtom);
    (0, solid_js_1.createEffect)(function () {
        // Skip syncing for inactive tabs - they shouldn't update global atoms
        if (!isActive)
            return;
        syncMessages({
            messages: messages,
            status: status,
            subChatId: subChatId
        });
    });
    // Sync status to global streaming status store for queue processing
    var setStreamingStatus = (0, streaming_status_store_1.useStreamingStatusStore)(function (s) { return s.setStatus; });
    (0, solid_js_1.createEffect)(function () {
        setStreamingStatus(subChatId, status);
    });
    // Chat search - scroll to current match
    // Use ref to track scroll lock and prevent race conditions
    var _35 = (0, solid_js_1.createSignal)(0), searchScrollLockRef = _35[0], setSearchScrollLockRef = _35[1];
    var currentSearchMatch = (0, jotai_1.useAtomValue)(search_1.chatSearchCurrentMatchAtom);
    (0, solid_js_1.createEffect)(function () {
        if (!currentSearchMatch)
            return;
        var container = chatContainerRef.current;
        if (!container)
            return;
        // Increment lock to cancel any pending scroll operations
        var currentLock = ++searchScrollLockRef.current;
        // Use double requestAnimationFrame + small delay to ensure DOM has updated with new highlights
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                setTimeout(function () {
                    // Check if this scroll operation is still valid (not superseded by newer one)
                    if (searchScrollLockRef.current !== currentLock)
                        return;
                    // First try to find the highlight mark
                    var targetElement = container.querySelector(".search-highlight-current");
                    // If no highlight mark, find the message element with matching data attributes
                    if (!targetElement) {
                        var selector = "[data-message-id=\"".concat(currentSearchMatch.messageId, "\"][data-part-index=\"").concat(currentSearchMatch.partIndex, "\"]");
                        targetElement = container.querySelector(selector);
                    }
                    if (targetElement) {
                        // Check if this is inside a sticky user message container
                        var stickyParent = targetElement.closest("[data-user-message-id]");
                        if (stickyParent) {
                            var messageGroupWrapper = stickyParent.parentElement;
                            if (messageGroupWrapper) {
                                messageGroupWrapper.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });
                                return;
                            }
                        }
                        targetElement.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }
                }, 50);
            });
        });
    });
    // Calculate top offset for search bar based on sub-chat selector
    var searchBarTopOffset = isSubChatsSidebarOpen ? "52px" : undefined;
    return <search_1.SearchHighlightProvider>
      <div class="flex flex-col flex-1 min-h-0 relative">
        {/* Text selection popover for adding text to context */}
        <text_selection_popover_1.TextSelectionPopover onAddToContext={addTextContext} onQuickComment={handleQuickComment} onFocusInput={handleFocusInput}/>

        {/* Quick comment input */}
        {quickCommentState && <quick_comment_input_1.QuickCommentInput selectedText={quickCommentState.selectedText} source={quickCommentState.source} rect={quickCommentState.rect} onSubmit={handleQuickCommentSubmit} onCancel={handleQuickCommentCancel}/>}

        {/* Chat search bar */}
        <search_1.ChatSearchBar messages={messages} topOffset={searchBarTopOffset}/>

        {/* Chat title - flex above scroll area (desktop only) */}
        {!isMobile && <div class={(0, utils_1.cn)("flex-shrink-0 pb-2", isSubChatsSidebarOpen ? "pt-[52px]" : "pt-2")}>
          <chat_title_editor_1.ChatTitleEditor name={subChatName} placeholder="New Chat" onSave={handleRenameSubChat} isMobile={false} chatId={subChatId} hasMessages={messages.length > 0}/>
        </div>}

      {/* Messages */}
      <div ref={function (el) {
            // Cleanup previous observer
            if (chatContainerObserverRef.current) {
                chatContainerObserverRef.current.disconnect();
                chatContainerObserverRef.current = null;
            }
            chatContainerRef.current = el;
            // Setup ResizeObserver for --chat-container-height CSS variable
            if (el) {
                var observer = new ResizeObserver(function (entries) {
                    var _a, _b;
                    var height = (_b = (_a = entries[0]) === null || _a === void 0 ? void 0 : _a.contentRect.height) !== null && _b !== void 0 ? _b : 0;
                    el.style.setProperty("--chat-container-height", "".concat(height, "px"));
                });
                observer.observe(el);
                chatContainerObserverRef.current = observer;
            }
        }} class="flex-1 overflow-y-auto w-full relative allow-text-selection outline-none" tabIndex={-1} data-chat-container>
        <div class="px-2 max-w-2xl mx-auto -mb-4 space-y-4" style={{ paddingBottom: "32px" }}>
          <div>
            {/* ISOLATED: Messages rendered via Jotai atom subscription
Each component subscribes to specific atoms and only re-renders when those change
KEY: Force remount on subChatId change to ensure fresh atom reads after syncMessages */}
            <isolated_messages_section_1.IsolatedMessagesSection key={subChatId} subChatId={subChatId} chatId={parentChatId} isMobile={isMobile} sandboxSetupStatus={sandboxSetupStatus} stickyTopClass={stickyTopClass} sandboxSetupError={sandboxSetupError} onRetrySetup={onRetrySetup} UserBubbleComponent={agent_user_message_bubble_1.AgentUserMessageBubble} ToolCallComponent={agent_tool_call_1.AgentToolCall} MessageGroupWrapper={MessageGroup} toolRegistry={agent_tool_registry_1.AgentToolRegistry}/>
          </div>
        </div>
      </div>

      {/* User questions panel - shows when AskUserQuestion tool is called */}
      {/* Only show if the pending question belongs to THIS sub-chat */}
      {pendingQuestions && <div class="px-4 relative z-20">
          <div class="w-full px-2 max-w-2xl mx-auto">
            <agent_user_question_1.AgentUserQuestion ref={questionRef} pendingQuestions={pendingQuestions} onAnswer={handleQuestionsAnswer} onSkip={handleQuestionsSkip} hasCustomText={inputHasContent}/>
          </div>
        </div>}

      {/* Stacked cards container - queue + status */}
      {!pendingQuestions && (queue.length > 0 || changedFilesForSubChat.length > 0) && <div class="px-2 -mb-6 relative z-10">
            <div class="w-full max-w-2xl mx-auto px-2">
              {/* Queue indicator card - top card */}
              {queue.length > 0 && <agent_queue_indicator_1.AgentQueueIndicator queue={queue} onRemoveItem={handleRemoveFromQueue} onSendNow={handleSendFromQueue} isStreaming={isStreaming} hasStatusCardBelow={changedFilesForSubChat.length > 0}/>}
              {/* Status card - bottom card, only when there are changed files */}
              {changedFilesForSubChat.length > 0 && <sub_chat_status_card_1.SubChatStatusCard chatId={parentChatId} subChatId={subChatId} isStreaming={isStreaming} isCompacting={isCompacting} changedFiles={changedFilesForSubChat} worktreePath={projectPath} onStop={handleStop} hasQueueCardAbove={queue.length > 0}/>}
            </div>
          </div>}

      {/* Input - isolated component to prevent re-renders */}
      <chat_input_area_1.ChatInputArea editorRef={editorRef} fileInputRef={fileInputRef} onSend={handleSend} onForceSend={handleForceSend} onStop={handleStop} onCompact={handleCompact} onCreateNewSubChat={onCreateNewSubChat} isStreaming={isStreaming} isCompacting={isCompacting} images={images} files={files} onAddAttachments={handleAddAttachments} onRemoveImage={removeImage} onRemoveFile={removeFile} isUploading={isUploading} textContexts={textContexts} onRemoveTextContext={removeTextContext} diffTextContexts={diffTextContexts} onRemoveDiffTextContext={removeDiffTextContext} pastedTexts={pastedTexts} onAddPastedText={addPastedText} onRemovePastedText={removePastedText} onCacheFileContent={cacheFileContent} messageTokenData={messageTokenData} subChatId={subChatId} parentChatId={parentChatId} teamId={teamId} repository={repository} sandboxId={sandboxId} projectPath={projectPath} changedFiles={changedFilesForSubChat} isMobile={isMobile} queueLength={queue.length} onSendFromQueue={handleSendFromQueue} firstQueueItemId={(_c = queue[0]) === null || _c === void 0 ? void 0 : _c.id} onInputContentChange={setInputHasContent} onSubmitWithQuestionAnswer={submitWithQuestionAnswerCallback}/>

        {/* Scroll to bottom button - isolated component to avoid re-renders during streaming */}
        <ScrollToBottomButton containerRef={chatContainerRef} onScrollToBottom={scrollToBottom} hasStackedCards={!pendingQuestions && (queue.length > 0 || changedFilesForSubChat.length > 0)} subChatId={subChatId} isActive={isActive}/>
      </div>
    </search_1.SearchHighlightProvider>;
});
// Chat View wrapper - handles loading and creates chat object
function ChatView(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var chatId = _a.chatId, isSidebarOpen = _a.isSidebarOpen, onToggleSidebar = _a.onToggleSidebar, selectedTeamName = _a.selectedTeamName, selectedTeamImageUrl = _a.selectedTeamImageUrl, _k = _a.isMobileFullscreen, isMobileFullscreen = _k === void 0 ? false : _k, onBackToChats = _a.onBackToChats, onOpenPreview = _a.onOpenPreview, onOpenDiff = _a.onOpenDiff, onOpenTerminal = _a.onOpenTerminal;
    var selectedTeamId = (0, jotai_1.useAtom)(selectedTeamIdAtom)[0];
    var selectedModelId = (0, jotai_1.useAtom)(atoms_3.lastSelectedModelIdAtom)[0];
    // Get active sub-chat ID from store for mode tracking (reactive)
    var activeSubChatIdForMode = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.activeSubChatId; });
    // Use per-subChat mode atom - falls back to "agent" if no active sub-chat
    var subChatModeAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.subChatModeAtomFamily)(activeSubChatIdForMode || ""); });
    var subChatMode = (0, jotai_1.useAtom)(subChatModeAtom)[0];
    // Current mode - use subChatMode when there's an active sub-chat, otherwise default to "agent"
    var currentMode = activeSubChatIdForMode ? subChatMode : "agent";
    // Default mode for new sub-chats
    var defaultAgentMode = (0, jotai_1.useAtomValue)(atoms_1.defaultAgentModeAtom);
    var isDesktop = (0, jotai_1.useAtomValue)(atoms_1.isDesktopAtom);
    var isFullscreen = (0, jotai_1.useAtomValue)(atoms_1.isFullscreenAtom);
    var customClaudeConfig = (0, jotai_1.useAtomValue)(atoms_1.customClaudeConfigAtom);
    var selectedOllamaModel = (0, jotai_1.useAtomValue)(atoms_1.selectedOllamaModelAtom);
    var normalizedCustomClaudeConfig = (0, atoms_1.normalizeCustomClaudeConfig)(customClaudeConfig);
    var hasCustomClaudeConfig = Boolean(normalizedCustomClaudeConfig);
    var setLoadingSubChats = (0, jotai_1.useSetAtom)(atoms_3.loadingSubChatsAtom);
    var unseenChanges = (0, jotai_1.useAtomValue)(atoms_3.agentsUnseenChangesAtom);
    var subChatUnseenChanges = (0, jotai_1.useAtomValue)(atoms_3.agentsSubChatUnseenChangesAtom);
    var justCreatedIds = (0, jotai_1.useAtomValue)(atoms_3.justCreatedIdsAtom);
    var selectedChatId = (0, jotai_1.useAtomValue)(atoms_3.selectedAgentChatIdAtom);
    var setUndoStack = (0, jotai_1.useSetAtom)(atoms_3.undoStackAtom);
    var setSelectedFilePath = (0, jotai_1.useSetAtom)(atoms_3.selectedDiffFilePathAtom);
    var setFilteredDiffFiles = (0, jotai_1.useSetAtom)(atoms_3.filteredDiffFilesAtom);
    var notifyAgentComplete = (0, use_desktop_notifications_1.useDesktopNotifications)().notifyAgentComplete;
    // Check if any chat has unseen changes
    var hasAnyUnseenChanges = unseenChanges().size > 0;
    var _l = (0, solid_js_1.createSignal)({}), forceUpdate = _l[1];
    var _m = (0, jotai_1.useAtom)(atoms_3.agentsPreviewSidebarOpenAtom), isPreviewSidebarOpen = _m[0], setIsPreviewSidebarOpen = _m[1];
    // Per-chat diff sidebar state - each chat remembers its own open/close state
    var diffSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.diffSidebarOpenAtomFamily)(chatId); });
    var _o = (0, jotai_1.useAtom)(diffSidebarAtom), isDiffSidebarOpen = _o[0], setIsDiffSidebarOpen = _o[1];
    // Subscribe to activeSubChatId for plan sidebar (needs to update when switching sub-chats)
    var activeSubChatIdForPlan = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.activeSubChatId; });
    // Per-subChat plan sidebar state - each sub-chat remembers its own open/close state
    var planSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.planSidebarOpenAtomFamily)(activeSubChatIdForPlan || ""); });
    var _p = (0, jotai_1.useAtom)(planSidebarAtom), isPlanSidebarOpen = _p[0], setIsPlanSidebarOpen = _p[1];
    var currentPlanPathAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.currentPlanPathAtomFamily)(activeSubChatIdForPlan || ""); });
    var _q = (0, jotai_1.useAtom)(currentPlanPathAtom), currentPlanPath = _q[0], setCurrentPlanPath = _q[1];
    // Details sidebar state (unified sidebar that combines all right sidebars)
    var isUnifiedSidebarEnabled = (0, jotai_1.useAtomValue)(atoms_4.unifiedSidebarEnabledAtom);
    var _r = (0, jotai_1.useAtom)(atoms_4.detailsSidebarOpenAtom), isDetailsSidebarOpen = _r[0], setIsDetailsSidebarOpen = _r[1];
    // Resolved hotkeys for tooltips
    var toggleDetailsHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-details");
    var toggleTerminalHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-terminal");
    // Close plan sidebar when switching to a sub-chat that has no plan
    var _s = (0, solid_js_1.createSignal)(activeSubChatIdForPlan), prevSubChatIdRef = _s[0], setPrevSubChatIdRef = _s[1];
    (0, solid_js_1.createEffect)(function () {
        if (prevSubChatIdRef.current !== activeSubChatIdForPlan) {
            // Sub-chat changed - if new one has no plan path, close sidebar
            if (!currentPlanPath) {
                setIsPlanSidebarOpen(false);
            }
            prevSubChatIdRef.current = activeSubChatIdForPlan;
        }
    });
    var setPendingBuildPlanSubChatId = (0, jotai_1.useSetAtom)(atoms_3.pendingBuildPlanSubChatIdAtom);
    // Read plan edit refetch trigger from atom (set by ChatViewInner when Edit completes)
    var planEditRefetchTriggerAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.planEditRefetchTriggerAtomFamily)(activeSubChatIdForPlan || ""); });
    var planEditRefetchTrigger = (0, jotai_1.useAtomValue)(planEditRefetchTriggerAtom);
    // Handler for plan sidebar "Build plan" button
    // Uses getState() to get fresh activeSubChatId (avoids stale closure)
    var handleApprovePlanFromSidebar = function () {
        var activeSubChatId = sub_chat_store_1.useAgentSubChatStore.getState().activeSubChatId;
        if (activeSubChatId) {
            setPendingBuildPlanSubChatId(activeSubChatId);
        }
    };
    // Per-chat terminal sidebar state - each chat remembers its own open/close state
    var terminalSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_2.terminalSidebarOpenAtomFamily)(chatId); });
    var _t = (0, jotai_1.useAtom)(terminalSidebarAtom), isTerminalSidebarOpen = _t[0], setIsTerminalSidebarOpen = _t[1];
    // Mutual exclusion: Details sidebar vs Plan/Terminal/Diff(side-peek) sidebars
    // When one opens, close the conflicting ones and remember for restoration
    // Track what was auto-closed and by whom for restoration
    var _u = (0, solid_js_1.createSignal)({
        detailsClosedBy: null,
        planClosedByDetails: false,
        terminalClosedByDetails: false,
        diffClosedByDetails: false
    }), autoClosedStateRef = _u[0], setAutoClosedStateRef = _u[1];
    // Track previous states to detect opens/closes
    var _v = (0, solid_js_1.createSignal)({
        details: isDetailsSidebarOpen,
        plan: isPlanSidebarOpen && !!currentPlanPath,
        terminal: isTerminalSidebarOpen
    }), prevSidebarStatesRef = _v[0], setPrevSidebarStatesRef = _v[1];
    (0, solid_js_1.createEffect)(function () {
        var prev = prevSidebarStatesRef.current;
        var auto = autoClosedStateRef.current;
        var isPlanOpen = isPlanSidebarOpen && !!currentPlanPath;
        // Detect state changes
        var detailsJustOpened = isDetailsSidebarOpen && !prev.details;
        var detailsJustClosed = !isDetailsSidebarOpen && prev.details;
        var planJustOpened = isPlanOpen && !prev.plan;
        var planJustClosed = !isPlanOpen && prev.plan;
        var terminalJustOpened = isTerminalSidebarOpen && !prev.terminal;
        var terminalJustClosed = !isTerminalSidebarOpen && prev.terminal;
        // Details opened → close conflicting sidebars and remember
        if (detailsJustOpened) {
            if (isPlanOpen) {
                auto.planClosedByDetails = true;
                setIsPlanSidebarOpen(false);
            }
            if (isTerminalSidebarOpen) {
                auto.terminalClosedByDetails = true;
                setIsTerminalSidebarOpen(false);
            }
        }
        else if (detailsJustClosed) {
            if (auto.planClosedByDetails) {
                auto.planClosedByDetails = false;
                setIsPlanSidebarOpen(true);
            }
            if (auto.terminalClosedByDetails) {
                auto.terminalClosedByDetails = false;
                setIsTerminalSidebarOpen(true);
            }
        }
        else if (planJustOpened && isDetailsSidebarOpen) {
            auto.detailsClosedBy = "plan";
            setIsDetailsSidebarOpen(false);
        }
        else if (planJustClosed && auto.detailsClosedBy === "plan") {
            auto.detailsClosedBy = null;
            setIsDetailsSidebarOpen(true);
        }
        else if (terminalJustOpened && isDetailsSidebarOpen) {
            auto.detailsClosedBy = "terminal";
            setIsDetailsSidebarOpen(false);
        }
        else if (terminalJustClosed && auto.detailsClosedBy === "terminal") {
            auto.detailsClosedBy = null;
            setIsDetailsSidebarOpen(true);
        }
        prevSidebarStatesRef.current = {
            details: isDetailsSidebarOpen,
            plan: isPlanOpen,
            terminal: isTerminalSidebarOpen
        };
    });
    // Diff data cache - stored in atoms to persist across workspace switches
    var diffCacheAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_3.workspaceDiffCacheAtomFamily)(chatId); });
    var _w = (0, jotai_1.useAtom)(diffCacheAtom), diffCache = _w[0], setDiffCache = _w[1];
    // Extract diff data from cache
    var diffStats = diffCache.diffStats;
    var parsedFileDiffs = diffCache.parsedFileDiffs;
    var prefetchedFileContents = diffCache.prefetchedFileContents;
    var diffContent = diffCache.diffContent;
    // Smart setters that update the cache
    var setDiffStats = function (val) {
        setDiffCache(function (prev) {
            var newVal = typeof val === "function" ? val(prev.diffStats) : val;
            // Only update if something changed
            if (prev.diffStats.fileCount === newVal.fileCount && prev.diffStats.additions === newVal.additions && prev.diffStats.deletions === newVal.deletions && prev.diffStats.isLoading === newVal.isLoading && prev.diffStats.hasChanges === newVal.hasChanges) {
                return prev;
            }
            return __assign(__assign({}, prev), { diffStats: newVal });
        });
    };
    var setParsedFileDiffs = function (files) {
        setDiffCache(function (prev) { return (__assign(__assign({}, prev), { parsedFileDiffs: files })); });
    };
    var setPrefetchedFileContents = function (contents) {
        setDiffCache(function (prev) { return (__assign(__assign({}, prev), { prefetchedFileContents: contents })); });
    };
    var setDiffContent = function (content) {
        setDiffCache(function (prev) { return (__assign(__assign({}, prev), { diffContent: content })); });
    };
    var _x = (0, jotai_1.useAtom)(agent_diff_view_1.diffViewModeAtom), diffMode = _x[0], setDiffMode = _x[1];
    var _y = (0, jotai_1.useAtom)(atoms_3.diffViewDisplayModeAtom), diffDisplayMode = _y[0], setDiffDisplayMode = _y[1];
    var subChatsSidebarMode = (0, jotai_1.useAtomValue)(atoms_3.agentsSubChatsSidebarModeAtom);
    // Force narrow width when switching to side-peek mode (from dialog/fullscreen)
    (0, solid_js_1.createEffect)(function () {
        if (diffDisplayMode === "side-peek") {
            // Set to narrow width (400px) to ensure correct layout
            jotai_store_1.appStore.set(atoms_3.agentsDiffSidebarWidthAtom, 400);
        }
    });
    // Handle Diff + Details sidebar conflict (side-peek mode only)
    // - If Diff opens in side-peek while Details is open: switch Diff to center-peek (dialog) mode
    // - If user manually switches Diff to side-peek while Details is open: close Details and remember
    // - If Details opens while Diff is in side-peek mode: close Diff and remember
    var _z = (0, solid_js_1.createSignal)({
        isOpen: isDiffSidebarOpen,
        mode: diffDisplayMode,
        detailsOpen: isDetailsSidebarOpen
    }), prevDiffStateRef = _z[0], setPrevDiffStateRef = _z[1];
    // Flag to skip center-peek switch when restoring Diff after Details closes
    var _0 = (0, solid_js_1.createSignal)(false), isRestoringDiffRef = _0[0], setIsRestoringDiffRef = _0[1];
    (0, solid_js_1.createEffect)(function () {
        var prev = prevDiffStateRef.current;
        var auto = autoClosedStateRef.current;
        var isNowSidePeek = isDiffSidebarOpen && diffDisplayMode === "side-peek";
        var wasSidePeek = prev.isOpen && prev.mode === "side-peek";
        var detailsJustOpened = isDetailsSidebarOpen && !prev.detailsOpen;
        var detailsJustClosed = !isDetailsSidebarOpen && prev.detailsOpen;
        var diffSidePeekJustClosed = wasSidePeek && !isNowSidePeek;
        if (isNowSidePeek && isDetailsSidebarOpen) {
            // Details just opened while Diff is in side-peek → close Diff and remember
            if (detailsJustOpened) {
                auto.diffClosedByDetails = true;
                setIsDiffSidebarOpen(false);
            }
            else if (!prev.isOpen && !isRestoringDiffRef.current) {
                setDiffDisplayMode("center-peek");
            }
            else if (prev.isOpen && prev.mode !== "side-peek") {
                auto.detailsClosedBy = "diff";
                setIsDetailsSidebarOpen(false);
            }
        }
        else if (diffSidePeekJustClosed && auto.detailsClosedBy === "diff") {
            auto.detailsClosedBy = null;
            setIsDetailsSidebarOpen(true);
        }
        else if (detailsJustClosed && auto.diffClosedByDetails) {
            auto.diffClosedByDetails = false;
            isRestoringDiffRef.current = true;
            setIsDiffSidebarOpen(true);
            // Reset flag after state update
            requestAnimationFrame(function () {
                isRestoringDiffRef.current = false;
            });
        }
        prevDiffStateRef.current = {
            isOpen: isDiffSidebarOpen,
            mode: diffDisplayMode,
            detailsOpen: isDetailsSidebarOpen
        };
    });
    // Hide traffic lights when full-page diff is open (they would overlap with content)
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isDesktop || isFullscreen)
            return;
        if (typeof window === "undefined" || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setTrafficLightVisibility))
            return;
        if (isDiffSidebarOpen && diffDisplayMode === "full-page") {
            window.desktopApi.setTrafficLightVisibility(false);
        }
    });
    // Track diff sidebar width for responsive header
    var storedDiffSidebarWidth = (0, jotai_1.useAtomValue)(atoms_3.agentsDiffSidebarWidthAtom);
    var _1 = (0, solid_js_1.createSignal)(null), diffSidebarRef = _1[0], setDiffSidebarRef = _1[1];
    var _2 = (0, solid_js_1.createSignal)(null), diffViewRef = _2[0], setDiffViewRef = _2[1];
    var _3 = (0, solid_js_1.createSignal)(storedDiffSidebarWidth), diffSidebarWidth = _3[0], setDiffSidebarWidth = _3[1];
    // Track if all diff files are collapsed/expanded for button disabled states
    var _4 = (0, solid_js_1.createSignal)({
        allCollapsed: false,
        allExpanded: true
    }), diffCollapseState = _4[0], setDiffCollapseState = _4[1];
    // Compute isNarrow for filtering logic (same threshold as DiffSidebarContent)
    var isDiffSidebarNarrow = diffSidebarWidth < 500;
    // ResizeObserver to track diff sidebar width in real-time (atom only updates after resize ends)
    (0, solid_js_1.createEffect)(function () {
        if (!isDiffSidebarOpen) {
            return;
        }
        var observer = null;
        var rafId = null;
        var checkRef = function () {
            var element = diffSidebarRef.current;
            if (!element) {
                // Retry if ref not ready yet
                rafId = requestAnimationFrame(checkRef);
                return;
            }
            // Set initial width
            setDiffSidebarWidth(element.offsetWidth || storedDiffSidebarWidth);
            observer = new ResizeObserver(function (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    var width = entry.contentRect.width;
                    if (width > 0) {
                        setDiffSidebarWidth(width);
                    }
                }
            });
            observer.observe(element);
        };
        checkRef();
        return function () {
            if (rafId !== null)
                cancelAnimationFrame(rafId);
            if (observer)
                observer.disconnect();
        };
    });
    // Track changed files across all sub-chats for throttled diff refresh
    var subChatFiles = (0, jotai_1.useAtomValue)(atoms_3.subChatFilesAtom);
    // Initialize to Date.now() to prevent double-fetch on mount
    // (the "mount" effect already fetches, throttle should wait)
    var _5 = (0, solid_js_1.createSignal)(Date.now()), lastDiffFetchTimeRef = _5[0], setLastDiffFetchTimeRef = _5[1];
    var DIFF_THROTTLE_MS = 2e3;
    // Clear "unseen changes" when chat is opened
    (0, solid_js_1.createEffect)(function () {
        var set = unseenChanges();
        if (set.has(chatId)) {
            set.delete(chatId);
        }
    });
    // Get sub-chat state from store (using getState() to avoid re-renders on state changes)
    var activeSubChatId = sub_chat_store_1.useAgentSubChatStore.getState().activeSubChatId;
    var openSubChatIds = sub_chat_store_1.useAgentSubChatStore.getState().openSubChatIds;
    var pinnedSubChatIds = sub_chat_store_1.useAgentSubChatStore.getState().pinnedSubChatIds;
    // Clear sub-chat "unseen changes" indicator when sub-chat becomes active
    (0, solid_js_1.createEffect)(function () {
        if (!activeSubChatId)
            return;
        var set = subChatUnseenChanges();
        if (set.has(activeSubChatId)) {
            set.delete(activeSubChatId);
        }
    });
    var allSubChats = sub_chat_store_1.useAgentSubChatStore.getState().allSubChats;
    // tRPC utils for optimistic cache updates
    var utils = mock_api_1.api.useUtils();
    // tRPC mutations for renaming
    var renameSubChatMutation = mock_api_1.api.agents.renameSubChat.useMutation();
    var renameChatMutation = mock_api_1.api.agents.renameChat.useMutation();
    var generateSubChatNameMutation = mock_api_1.api.agents.generateSubChatName.useMutation();
    // PR creation loading state - using atom to allow ChatViewInner to reset it
    var _6 = (0, jotai_1.useAtom)(atoms_3.isCreatingPrAtom), isCreatingPr = _6[0], setIsCreatingPr = _6[1];
    // Review loading state
    var _7 = (0, solid_js_1.createSignal)(false), isReviewing = _7[0], setIsReviewing = _7[1];
    // Subchat filter setter - used by handleReview to filter by active subchat
    var setFilteredSubChatId = (0, jotai_1.useSetAtom)(atoms_3.filteredSubChatIdAtom);
    // Determine if we're in sandbox mode
    var chatSourceMode = (0, jotai_1.useAtomValue)(atoms_1.chatSourceModeAtom);
    // Fetch chat data from local or remote based on mode
    var _8 = mock_api_1.api.agents.getAgentChat.useQuery({ chatId: chatId }, { enabled: !!chatId && chatSourceMode === "local" }), localAgentChat = _8.data, isLocalLoading = _8.isLoading;
    var _9 = (0, use_remote_chats_1.useRemoteChat)(chatSourceMode === "sandbox" ? chatId : null), remoteAgentChat = _9.data, isRemoteLoading = _9.isLoading;
    // Use the appropriate data source
    // IMPORTANT: Must memoize to prevent infinite re-render loop
    // The inline object spread creates a new reference on every render,
    // which triggers the useEffect that calls setAllSubChats(), causing re-renders
    var agentChat = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
        if (chatSourceMode === "sandbox") {
            if (!remoteAgentChat)
                return null;
            return __assign(__assign({}, remoteAgentChat), { createdAt: new Date(remoteAgentChat.created_at), updatedAt: new Date(remoteAgentChat.updated_at), archivedAt: null, projectId: null, worktreePath: null, branch: null, baseBranch: null, prUrl: null, prNumber: null, sandbox_id: remoteAgentChat.sandbox_id, sandboxId: remoteAgentChat.sandbox_id, isRemote: true, remoteStats: remoteAgentChat.stats, subChats: (_b = (_a = remoteAgentChat.subChats) === null || _a === void 0 ? void 0 : _a.map(function (sc) { return (__assign(__assign({}, sc), { created_at: new Date(sc.created_at), updated_at: new Date(sc.updated_at) })); })) !== null && _b !== void 0 ? _b : [] });
        }
        return localAgentChat;
    });
    var isLoading = chatSourceMode === "sandbox" ? isRemoteLoading : isLocalLoading;
    // Compute if we're waiting for local chat data (used as loading gate)
    var isLocalChatLoading = chatSourceMode === "local" && isLocalLoading;
    // Projects query for "Open Locally" functionality
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    // Open Locally dialog state
    var _10 = (0, solid_js_1.createSignal)(false), openLocallyDialogOpen = _10[0], setOpenLocallyDialogOpen = _10[1];
    // Auto-import hook for "Open Locally"
    var _11 = (0, use_auto_import_1.useAutoImport)(), getMatchingProjects = _11.getMatchingProjects, autoImport = _11.autoImport, isImporting = _11.isImporting;
    // Handler for "Open Locally" button in header
    var handleOpenLocally = function () {
        if (!remoteAgentChat)
            return;
        var matchingProjects = getMatchingProjects(projects !== null && projects !== void 0 ? projects : [], remoteAgentChat);
        if (matchingProjects.length === 1) {
            // Auto-import: single match found
            autoImport(remoteAgentChat, matchingProjects[0]);
        }
        else {
            // Show dialog: 0 or 2+ matches
            setOpenLocallyDialogOpen(true);
        }
    };
    // Determine if "Open Locally" button should show
    var showOpenLocally = chatSourceMode === "sandbox" && !!remoteAgentChat;
    // Get matching projects for dialog (only computed when needed)
    var openLocallyMatchingProjects = (0, solid_js_1.createMemo)(function () {
        if (!remoteAgentChat)
            return [];
        return getMatchingProjects(projects !== null && projects !== void 0 ? projects : [], remoteAgentChat);
    });
    var agentSubChats = ((_b = agentChat === null || agentChat === void 0 ? void 0 : agentChat.subChats) !== null && _b !== void 0 ? _b : []);
    // Workspace isolation: limit mounted tabs to prevent memory growth
    // CRITICAL: Filter by workspace to prevent rendering sub-chats from other workspaces
    // Always render: active + pinned, then fill with recent up to limit
    var MAX_MOUNTED_TABS = 5;
    var tabsToRender = (0, solid_js_1.createMemo)(function () {
        if (!activeSubChatId)
            return [];
        // Use agentSubChats from server (tRPC/remote API) as the authoritative source for validation.
        // This fixes the race condition where:
        // 1. setChatId resets allSubChats to [] but loads activeSubChatId from localStorage
        // 2. tabsToRender was checking activeSubChatId against empty allSubChats → always failing
        //
        // agentSubChats comes from the server and is the "truth" about which sub-chats exist.
        // allSubChats in Zustand is only populated AFTER the init useEffect runs.
        //
        // For optimistic updates when creating new sub-chats, we fall back to allSubChats
        // since the new sub-chat won't be in agentSubChats yet (tRPC query is stale).
        var sourceForValidation = agentSubChats.length > 0 ? agentSubChats : allSubChats;
        var validSubChatIds = new Set(sourceForValidation.map(function (sc) { return sc.id; }));
        // If active sub-chat doesn't belong to this workspace → return []
        // This prevents rendering sub-chats from another workspace during race condition
        if (!validSubChatIds.has(activeSubChatId)) {
            return [];
        }
        // Filter openSubChatIds and pinnedSubChatIds to only valid IDs for this workspace
        var validOpenIds = openSubChatIds.filter(function (id) { return validSubChatIds.has(id); });
        var validPinnedIds = pinnedSubChatIds.filter(function (id) { return validSubChatIds.has(id); });
        // Start with active (must always be mounted)
        var mustRender = new Set([activeSubChatId]);
        // Add pinned tabs (only valid ones)
        for (var _i = 0, validPinnedIds_1 = validPinnedIds; _i < validPinnedIds_1.length; _i++) {
            var id = validPinnedIds_1[_i];
            mustRender.add(id);
        }
        // If we have room, add recent tabs from openSubChatIds (only valid ones)
        if (mustRender.size < MAX_MOUNTED_TABS) {
            var remaining = MAX_MOUNTED_TABS - mustRender.size;
            var recentTabs = validOpenIds.filter(function (id) { return !mustRender.has(id); }).slice(-remaining);
            for (var _a = 0, recentTabs_1 = recentTabs; _a < recentTabs_1.length; _a++) {
                var id = recentTabs_1[_a];
                mustRender.add(id);
            }
        }
        // Return tabs to render
        // Always include activeSubChatId even if not in validOpenIds (handles race condition
        // where openSubChatIds from localStorage doesn't include the active tab yet)
        var result = validOpenIds.filter(function (id) { return mustRender.has(id); });
        if (!result.includes(activeSubChatId)) {
            result.unshift(activeSubChatId);
        }
        return result;
    });
    // Get PR status when PR exists (for checking if it's open/merged/closed)
    var hasPrNumber = !!(agentChat === null || agentChat === void 0 ? void 0 : agentChat.prNumber);
    var _12 = trpc_1.trpc.chats.getPrStatus.useQuery({ chatId: chatId }, {
        enabled: hasPrNumber,
        refetchInterval: 3e4
    }), prStatusData = _12.data, isPrStatusLoading = _12.isLoading;
    var prState = (_c = prStatusData === null || prStatusData === void 0 ? void 0 : prStatusData.pr) === null || _c === void 0 ? void 0 : _c.state;
    var prMergeable = (_d = prStatusData === null || prStatusData === void 0 ? void 0 : prStatusData.pr) === null || _d === void 0 ? void 0 : _d.mergeable;
    var hasMergeConflicts = prMergeable === "CONFLICTING";
    // PR is open if state is explicitly "open" or "draft"
    // When PR status is still loading, assume open to avoid showing wrong button
    var isPrOpen = hasPrNumber && (isPrStatusLoading || prState === "open" || prState === "draft");
    // Merge PR mutation
    var trpcUtils = trpc_1.trpc.useUtils();
    // Sync from main mutation (for resolving merge conflicts)
    var mergeFromDefaultMutation = trpc_1.trpc.changes.mergeFromDefault.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Branch synced with main. You can now merge the PR.", { position: "top-center" });
            // Invalidate PR status to refresh mergeability
            trpcUtils.chats.getPrStatus.invalidate({ chatId: chatId });
        },
        onError: function (error) {
            solid_sonner_1.toast.error(error.message || "Failed to sync with main", { position: "top-center" });
        }
    });
    var mergePrMutation = trpc_1.trpc.chats.mergePr.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("PR merged successfully!", { position: "top-center" });
            // Invalidate PR status to update button state
            trpcUtils.chats.getPrStatus.invalidate({ chatId: chatId });
        },
        onError: function (error) {
            var errorMsg = error.message || "Failed to merge PR";
            // Check if it's a merge conflict error
            if (errorMsg.includes("MERGE_CONFLICT")) {
                solid_sonner_1.toast.error("PR has merge conflicts. Sync with main to resolve.", {
                    position: "top-center",
                    duration: 8e3,
                    action: worktreePath ? {
                        label: "Sync with Main",
                        onClick: function () {
                            mergeFromDefaultMutation.mutate({
                                worktreePath: worktreePath,
                                useRebase: false
                            });
                        }
                    } : undefined
                });
            }
            else {
                solid_sonner_1.toast.error(errorMsg, { position: "top-center" });
            }
        }
    });
    var handleMergePr = function () {
        mergePrMutation.mutate({
            chatId: chatId,
            method: "squash"
        });
    };
    // Restore archived workspace mutation (silent - no toast)
    var restoreWorkspaceMutation = trpc_1.trpc.chats.restore.useMutation({ onSuccess: function (restoredChat) {
            if (restoredChat) {
                // Update the main chat list cache
                trpcUtils.chats.list.setData({}, function (oldData) {
                    if (!oldData)
                        return [restoredChat];
                    if (oldData.some(function (c) { return c.id === restoredChat.id; }))
                        return oldData;
                    return __spreadArray([restoredChat], oldData, true);
                });
            }
            // Invalidate both lists to refresh
            trpcUtils.chats.list.invalidate();
            trpcUtils.chats.listArchived.invalidate();
            // Invalidate this chat's data to update isArchived state
            utils.agents.getAgentChat.invalidate({ chatId: chatId });
        } });
    var handleRestoreWorkspace = function () {
        restoreWorkspaceMutation.mutate({ id: chatId });
    };
    // Check if this workspace is archived
    var isArchived = !!(agentChat === null || agentChat === void 0 ? void 0 : agentChat.archivedAt);
    // Get user usage data for credit checks
    var usageData = mock_api_1.api.usage.getUserUsage.useQuery().data;
    // Desktop: use worktreePath instead of sandbox
    var worktreePath = agentChat === null || agentChat === void 0 ? void 0 : agentChat.worktreePath;
    // Desktop: original project path for MCP config lookup
    var originalProjectPath = (_e = agentChat === null || agentChat === void 0 ? void 0 : agentChat.project) === null || _e === void 0 ? void 0 : _e.path;
    // Fallback for web: use sandbox_id
    var sandboxId = agentChat === null || agentChat === void 0 ? void 0 : agentChat.sandbox_id;
    var sandboxUrl = sandboxId ? "https://3003-".concat(sandboxId, ".e2b.app") : null;
    // Desktop uses worktreePath, web uses sandboxUrl
    var chatWorkingDir = worktreePath || sandboxUrl;
    // Listen for file changes from Claude Write/Edit tools and invalidate git status
    (0, use_file_change_listener_1.useFileChangeListener)(worktreePath);
    // Subscribe to GitWatcher for real-time file system monitoring (chokidar on main process)
    (0, use_file_change_listener_1.useGitWatcher)(worktreePath);
    // Extract port, repository, and quick setup flag from meta
    var meta = agentChat === null || agentChat === void 0 ? void 0 : agentChat.meta;
    var repository = meta === null || meta === void 0 ? void 0 : meta.repository;
    // Remote info for Details sidebar (when worktreePath is null but sandboxId exists)
    var remoteInfo = (0, solid_js_1.createMemo)(function () {
        if (worktreePath || !sandboxId)
            return null;
        return {
            repository: meta === null || meta === void 0 ? void 0 : meta.repository,
            branch: meta === null || meta === void 0 ? void 0 : meta.branch,
            sandboxId: sandboxId
        };
    });
    // Track if we've already triggered sandbox setup for this chat
    // Check if this is a quick setup (no preview available)
    var isQuickSetup = (meta === null || meta === void 0 ? void 0 : meta.isQuickSetup) || !((_f = meta === null || meta === void 0 ? void 0 : meta.sandboxConfig) === null || _f === void 0 ? void 0 : _f.port);
    var previewPort = (_h = (_g = meta === null || meta === void 0 ? void 0 : meta.sandboxConfig) === null || _g === void 0 ? void 0 : _g.port) !== null && _h !== void 0 ? _h : 3e3;
    // Check if preview can be opened (sandbox with port exists and not quick setup)
    var canOpenPreview = !!(sandboxId && !isQuickSetup && ((_j = meta === null || meta === void 0 ? void 0 : meta.sandboxConfig) === null || _j === void 0 ? void 0 : _j.port));
    // Check if diff button can be shown (stats available)
    // This shows the Changes button with stats in header
    var canShowDiffButton = !!worktreePath || !!sandboxId;
    // Check if diff sidebar can be opened (actual diff content available)
    // Desktop remote chats (sandboxId without worktree) cannot open diff sidebar - only stats in header
    var canOpenDiff = !!worktreePath || !!sandboxId && !(0, platform_1.isDesktopApp)();
    // Create list of subchats with changed files for filtering
    // Only include subchats that have uncommitted changes, sorted by most recent first
    var subChatsWithFiles = (0, solid_js_1.createMemo)(function () {
        var result = [];
        // Only include subchats that have files (uncommitted changes)
        for (var _i = 0, allSubChats_1 = allSubChats; _i < allSubChats_1.length; _i++) {
            var subChat = allSubChats_1[_i];
            var files = subChatFiles.get(subChat.id) || [];
            if (files.length > 0) {
                result.push({
                    id: subChat.id,
                    name: subChat.name || "New Chat",
                    filePaths: files.map(function (f) { return f.filePath; }),
                    fileCount: files.length,
                    updatedAt: subChat.updated_at || subChat.created_at || ""
                });
            }
        }
        // Sort by most recent first
        result.sort(function (a, b) {
            if (!a.updatedAt && !b.updatedAt)
                return 0;
            if (!a.updatedAt)
                return 1;
            if (!b.updatedAt)
                return -1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return result;
    });
    // Close preview sidebar if preview becomes unavailable
    (0, solid_js_1.createEffect)(function () {
        if (!canOpenPreview && isPreviewSidebarOpen) {
            setIsPreviewSidebarOpen(false);
        }
    });
    // Note: We no longer forcibly close diff sidebar when canOpenDiff is false.
    // The sidebar render is guarded by canOpenDiff, so it naturally hides.
    // Per-chat state (diffSidebarOpenAtomFamily) preserves each chat's preference.
    // Fetch diff stats - extracted as callback for reuse in onFinish
    var _13 = (0, solid_js_1.createSignal)(null), fetchDiffStatsDebounceRef = _13[0], setFetchDiffStatsDebounceRef = _13[1];
    var _14 = (0, solid_js_1.createSignal)(false), isFetchingDiffRef = _14[0], setIsFetchingDiffRef = _14[1];
    var fetchDiffStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, remoteStats, rawDiff, response, data, parsedFiles, additions, deletions, _i, parsedFiles_1, file, error_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("[fetchDiffStats] Called with:", {
                        worktreePath: worktreePath,
                        sandboxId: sandboxId,
                        chatId: chatId,
                        isDesktop: (0, platform_1.isDesktopApp)()
                    });
                    // Desktop uses worktreePath, web uses sandboxId
                    // Don't reset stats if worktreePath is temporarily undefined - just skip the fetch
                    // This prevents the button from becoming disabled when component re-renders
                    if (!worktreePath && !sandboxId) {
                        console.log("[fetchDiffStats] Skipping - no worktreePath or sandboxId");
                        return [2 /*return*/];
                    }
                    // Prevent duplicate parallel fetches
                    if (isFetchingDiffRef.current) {
                        console.log("[fetchDiffStats] Skipping - already fetching");
                        return [2 /*return*/];
                    }
                    isFetchingDiffRef.current = true;
                    console.log("[fetchDiffStats] Starting fetch...");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    if (!(worktreePath && chatId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, trpc_1.trpcClient.chats.getParsedDiff.query({ chatId: chatId })];
                case 2:
                    result = _b.sent();
                    if (result.files.length > 0) {
                        // Store parsed files directly (already parsed on server)
                        setParsedFileDiffs(result.files);
                        // Store prefetched file contents
                        setPrefetchedFileContents(result.fileContents);
                        // Set diff content to null since we have parsed files
                        // (AgentDiffView will use parsedFileDiffs when available)
                        setDiffContent(null);
                        setDiffStats({
                            fileCount: result.files.length,
                            additions: result.totalAdditions,
                            deletions: result.totalDeletions,
                            isLoading: false,
                            hasChanges: result.files.length > 0
                        });
                    }
                    else {
                        setDiffStats({
                            fileCount: 0,
                            additions: 0,
                            deletions: 0,
                            isLoading: false,
                            hasChanges: false
                        });
                        // Use empty array instead of null to signal "no changes" vs "still loading"
                        setParsedFileDiffs([]);
                        setPrefetchedFileContents({});
                        setDiffContent(null);
                    }
                    return [2 /*return*/];
                case 3:
                    // Desktop without chat (viewing main repo directly)
                    if (worktreePath && !chatId) {
                        // TODO: Need to add endpoint that accepts worktreePath directly
                        return [2 /*return*/];
                    }
                    if (!sandboxId) return [3 /*break*/, 6];
                    console.log("[fetchDiffStats] Sandbox mode - sandboxId:", sandboxId);
                    // Desktop app: use stats already provided in chat data
                    // The diff sidebar won't work for remote chats (no worktree), but stats will show
                    if ((0, platform_1.isDesktopApp)()) {
                        remoteStats = agentChat === null || agentChat === void 0 ? void 0 : agentChat.remoteStats;
                        console.log("[fetchDiffStats] Desktop remote chat - using remoteStats:", remoteStats);
                        if (remoteStats) {
                            setDiffStats({
                                fileCount: remoteStats.fileCount,
                                additions: remoteStats.additions,
                                deletions: remoteStats.deletions,
                                isLoading: false,
                                hasChanges: remoteStats.fileCount > 0
                            });
                        }
                        else {
                            setDiffStats({
                                fileCount: 0,
                                additions: 0,
                                deletions: 0,
                                isLoading: false,
                                hasChanges: false
                            });
                        }
                        // No parsed files for remote chats - diff view not available
                        setParsedFileDiffs([]);
                        setPrefetchedFileContents({});
                        setDiffContent(null);
                        return [2 /*return*/];
                    }
                    rawDiff = null;
                    return [4 /*yield*/, fetch("/api/agents/sandbox/".concat(sandboxId, "/diff"))];
                case 4:
                    response = _b.sent();
                    if (!response.ok) {
                        setDiffStats(function (prev) { return (__assign(__assign({}, prev), { isLoading: false })); });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _b.sent();
                    rawDiff = data.diff || null;
                    // Store raw diff for AgentDiffView
                    console.log("[fetchDiffStats] Setting diff content, length:", (_a = rawDiff === null || rawDiff === void 0 ? void 0 : rawDiff.length) !== null && _a !== void 0 ? _a : 0);
                    setDiffContent(rawDiff);
                    if (rawDiff && rawDiff.trim()) {
                        // Parse diff to get file list and stats (client-side for web)
                        console.log("[fetchDiffStats] Parsing diff...");
                        parsedFiles = (0, agent_diff_view_1.splitUnifiedDiffByFile)(rawDiff);
                        console.log("[fetchDiffStats] Parsed files:", parsedFiles.length, "files");
                        setParsedFileDiffs(parsedFiles);
                        additions = 0;
                        deletions = 0;
                        for (_i = 0, parsedFiles_1 = parsedFiles; _i < parsedFiles_1.length; _i++) {
                            file = parsedFiles_1[_i];
                            additions += file.additions;
                            deletions += file.deletions;
                        }
                        console.log("[fetchDiffStats] Setting stats:", {
                            fileCount: parsedFiles.length,
                            additions: additions,
                            deletions: deletions
                        });
                        setDiffStats({
                            fileCount: parsedFiles.length,
                            additions: additions,
                            deletions: deletions,
                            isLoading: false,
                            hasChanges: parsedFiles.length > 0
                        });
                    }
                    else {
                        console.log("[fetchDiffStats] No diff content, setting empty stats");
                        setDiffStats({
                            fileCount: 0,
                            additions: 0,
                            deletions: 0,
                            isLoading: false,
                            hasChanges: false
                        });
                        // Use empty array instead of null to signal "no changes" vs "still loading"
                        setParsedFileDiffs([]);
                        setPrefetchedFileContents({});
                    }
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_6 = _b.sent();
                    console.error("[fetchDiffStats] Error:", error_6);
                    setDiffStats(function (prev) { return (__assign(__assign({}, prev), { isLoading: false })); });
                    return [3 /*break*/, 9];
                case 8:
                    console.log("[fetchDiffStats] Done");
                    isFetchingDiffRef.current = false;
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Debounced version for calling after stream ends
    var fetchDiffStatsDebounced = function () {
        if (fetchDiffStatsDebounceRef.current) {
            clearTimeout(fetchDiffStatsDebounceRef.current);
        }
        fetchDiffStatsDebounceRef.current = setTimeout(function () {
            fetchDiffStats();
        }, 500);
    };
    // Ref to hold the latest fetchDiffStatsDebounced for use in onFinish callbacks
    var _15 = (0, solid_js_1.createSignal)(fetchDiffStatsDebounced), fetchDiffStatsRef = _15[0], setFetchDiffStatsRef = _15[1];
    (0, solid_js_1.createEffect)(function () {
        fetchDiffStatsRef.current = fetchDiffStatsDebounced;
    });
    // Fetch diff stats on mount and when worktreePath/sandboxId changes
    (0, solid_js_1.createEffect)(function () {
        fetchDiffStats();
    });
    // Refresh diff stats when diff sidebar opens (background refresh - don't block UI)
    // Keep existing data visible while fetching, only update if data changed
    (0, solid_js_1.createEffect)(function () {
        if (isDiffSidebarOpen) {
            // Fetch in background - existing parsedFileDiffs will be shown immediately
            fetchDiffStats();
        }
    });
    // Calculate total file count across all sub-chats for change detection
    var totalSubChatFileCount = (0, solid_js_1.createMemo)(function () {
        var count = 0;
        subChatFiles.forEach(function (files) {
            count += files.length;
        });
        return count;
    });
    // Throttled refetch when sub-chat files change (agent edits/writes files)
    // This keeps the top-right diff sidebar in sync with the bottom "Generated X files" bar
    (0, solid_js_1.createEffect)(function () {
        // Skip if no files tracked yet (initial state)
        if (totalSubChatFileCount === 0)
            return;
        var now = Date.now();
        var timeSinceLastFetch = now - lastDiffFetchTimeRef.current;
        if (timeSinceLastFetch >= DIFF_THROTTLE_MS) {
            // Enough time passed, fetch immediately
            lastDiffFetchTimeRef.current = now;
            fetchDiffStats();
        }
        else {
            // Schedule fetch for when throttle window ends
            var delay = DIFF_THROTTLE_MS - timeSinceLastFetch;
            var timer_1 = setTimeout(function () {
                lastDiffFetchTimeRef.current = Date.now();
                fetchDiffStats();
            }, delay);
            return function () { return clearTimeout(timer_1); };
        }
    });
    // Handle Create PR - sends a message to Claude to create the PR
    var setPendingPrMessage = (0, jotai_1.useSetAtom)(atoms_3.pendingPrMessageAtom);
    var handleCreatePr = function () { return __awaiter(_this, void 0, void 0, function () {
        var context, message, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId) {
                        solid_sonner_1.toast.error("Chat ID is required", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    setIsCreatingPr(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, trpc_1.trpcClient.chats.getPrContext.query({ chatId: chatId })];
                case 2:
                    context = _a.sent();
                    if (!context) {
                        solid_sonner_1.toast.error("Could not get git context", { position: "top-center" });
                        setIsCreatingPr(false);
                        return [2 /*return*/];
                    }
                    message = (0, pr_message_1.generatePrMessage)(context);
                    setPendingPrMessage(message);
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    solid_sonner_1.toast.error(error_7 instanceof Error ? error_7.message : "Failed to prepare PR request", { position: "top-center" });
                    setIsCreatingPr(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle Commit to existing PR - sends a message to Claude to commit and push
    // selectedPaths parameter is optional - if provided, only those files will be mentioned
    var _16 = (0, solid_js_1.createSignal)(false), isCommittingToPr = _16[0], setIsCommittingToPr = _16[1];
    var handleCommitToPr = function (_selectedPaths) { return __awaiter(_this, void 0, void 0, function () {
        var context, message, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId) {
                        solid_sonner_1.toast.error("Chat ID is required", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsCommittingToPr(true);
                    return [4 /*yield*/, trpc_1.trpcClient.chats.getPrContext.query({ chatId: chatId })];
                case 2:
                    context = _a.sent();
                    if (!context) {
                        solid_sonner_1.toast.error("Could not get git context", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    message = (0, pr_message_1.generateCommitToPrMessage)(context);
                    setPendingPrMessage(message);
                    return [3 /*break*/, 5];
                case 3:
                    error_8 = _a.sent();
                    solid_sonner_1.toast.error(error_8 instanceof Error ? error_8.message : "Failed to prepare commit request", { position: "top-center" });
                    return [3 /*break*/, 5];
                case 4:
                    setIsCommittingToPr(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle Review - sends a message to Claude to review the diff
    var setPendingReviewMessage = (0, jotai_1.useSetAtom)(atoms_3.pendingReviewMessageAtom);
    var handleReview = function () { return __awaiter(_this, void 0, void 0, function () {
        var context, message, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!chatId) {
                        solid_sonner_1.toast.error("Chat ID is required", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    setIsReviewing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, trpc_1.trpcClient.chats.getPrContext.query({ chatId: chatId })];
                case 2:
                    context = _a.sent();
                    if (!context) {
                        solid_sonner_1.toast.error("Could not get git context", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    // Set filter to show only files from the active subchat
                    if (activeSubChatId) {
                        setFilteredSubChatId(activeSubChatId);
                    }
                    message = (0, pr_message_1.generateReviewMessage)(context);
                    setPendingReviewMessage(message);
                    return [3 /*break*/, 5];
                case 3:
                    error_9 = _a.sent();
                    solid_sonner_1.toast.error(error_9 instanceof Error ? error_9.message : "Failed to start review", { position: "top-center" });
                    return [3 /*break*/, 5];
                case 4:
                    setIsReviewing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle Fix Conflicts - sends a message to Claude to sync with main and fix merge conflicts
    var setPendingConflictResolutionMessage = (0, jotai_1.useSetAtom)(atoms_3.pendingConflictResolutionMessageAtom);
    var handleFixConflicts = function () {
        var message = "This PR has merge conflicts with the main branch. Please:\n\n1. First, fetch and merge the latest changes from main branch using git commands\n2. If there are any merge conflicts, resolve them carefully by keeping the correct code from both branches\n3. After resolving conflicts, commit the merge\n4. Push the changes to update the PR\n\nMake sure to preserve all functionality from both branches when resolving conflicts.";
        setPendingConflictResolutionMessage(message);
    };
    // Fetch branch data for diff sidebar header
    var branchData = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath || "" }, { enabled: !!worktreePath }).data;
    // Fetch git status for sync counts (pushCount, pullCount, hasUpstream)
    var _17 = trpc_1.trpc.changes.getStatus.useQuery({ worktreePath: worktreePath || "" }, {
        enabled: !!worktreePath && isDiffSidebarOpen,
        staleTime: 3e4
    }), gitStatus = _17.data, refetchGitStatus = _17.refetch, isGitStatusLoading = _17.isLoading;
    // Refetch git status and diff stats when window gains focus
    (0, solid_js_1.createEffect)(function () {
        if (!worktreePath || !isDiffSidebarOpen)
            return;
        var handleWindowFocus = function () {
            // Refetch git status
            refetchGitStatus();
            // Refetch diff stats to get latest changes
            fetchDiffStats();
        };
        window.addEventListener("focus", handleWindowFocus);
        return function () { return window.removeEventListener("focus", handleWindowFocus); };
    });
    // Sync parsedFileDiffs with git status - clear diff data when all files are committed
    // This fixes the issue where diff sidebar shows stale files after external git commit
    (0, solid_js_1.createEffect)(function () {
        var _a, _b, _c, _d, _e, _f;
        if (!gitStatus || isGitStatusLoading)
            return;
        // Check if git status shows no uncommitted changes
        var hasUncommittedChanges = ((_b = (_a = gitStatus.staged) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 || ((_d = (_c = gitStatus.unstaged) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 || ((_f = (_e = gitStatus.untracked) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) > 0;
        // If git shows no changes but we still have parsedFileDiffs, clear them
        if (!hasUncommittedChanges && parsedFileDiffs && parsedFileDiffs.length > 0) {
            console.log("[active-chat] Git status empty but parsedFileDiffs has files, refreshing diff data");
            setParsedFileDiffs([]);
            setPrefetchedFileContents({});
            setDiffContent(null);
            setDiffStats({
                fileCount: 0,
                additions: 0,
                deletions: 0,
                isLoading: false,
                hasChanges: false
            });
        }
    });
    // Stable callbacks for DiffSidebarHeader to prevent re-renders
    var handleRefreshGitStatus = function () {
        refetchGitStatus();
    };
    var handleExpandAll = function () {
        var _a;
        (_a = diffViewRef.current) === null || _a === void 0 ? void 0 : _a.expandAll();
    };
    var handleCollapseAll = function () {
        var _a;
        (_a = diffViewRef.current) === null || _a === void 0 ? void 0 : _a.collapseAll();
    };
    var handleMarkAllViewed = function () {
        var _a;
        (_a = diffViewRef.current) === null || _a === void 0 ? void 0 : _a.markAllViewed();
    };
    var handleMarkAllUnviewed = function () {
        var _a;
        (_a = diffViewRef.current) === null || _a === void 0 ? void 0 : _a.markAllUnviewed();
    };
    // Initialize store when chat data loads
    (0, solid_js_1.createEffect)(function () {
        if (!agentChat)
            return;
        var store = sub_chat_store_1.useAgentSubChatStore.getState();
        // Only initialize if chatId changed
        if (store.chatId !== chatId) {
            store.setChatId(chatId);
        }
        // Re-get fresh state after setChatId may have loaded from localStorage
        var freshState = sub_chat_store_1.useAgentSubChatStore.getState();
        // Get sub-chats from DB (like Canvas - no isPersistedInDb flag)
        // Build a map of existing local sub-chats to preserve their created_at if DB doesn't have it
        var existingSubChatsMap = new Map(freshState.allSubChats.map(function (sc) { return [sc.id, sc]; }));
        var dbSubChats = agentSubChats.map(function (sc) {
            var _a, _b, _c;
            var existingLocal = existingSubChatsMap.get(sc.id);
            var createdAt = typeof sc.created_at === "string" ? sc.created_at : (_a = sc.created_at) === null || _a === void 0 ? void 0 : _a.toISOString();
            var updatedAt = typeof sc.updated_at === "string" ? sc.updated_at : (_b = sc.updated_at) === null || _b === void 0 ? void 0 : _b.toISOString();
            return {
                id: sc.id,
                name: sc.name || "New Chat",
                created_at: (_c = createdAt !== null && createdAt !== void 0 ? createdAt : existingLocal === null || existingLocal === void 0 ? void 0 : existingLocal.created_at) !== null && _c !== void 0 ? _c : new Date().toISOString(),
                updated_at: updatedAt !== null && updatedAt !== void 0 ? updatedAt : existingLocal === null || existingLocal === void 0 ? void 0 : existingLocal.updated_at,
                mode: sc.mode || (existingLocal === null || existingLocal === void 0 ? void 0 : existingLocal.mode) || "agent"
            };
        });
        var dbSubChatIds = new Set(dbSubChats.map(function (sc) { return sc.id; }));
        // Start with DB sub-chats
        var allSubChats = __spreadArray([], dbSubChats, true);
        // For each open tab ID that's NOT in DB, add placeholder (like Canvas)
        // This prevents losing tabs during race conditions
        var currentOpenIds = freshState.openSubChatIds;
        currentOpenIds.forEach(function (id) {
            if (!dbSubChatIds.has(id)) {
                allSubChats.push({
                    id: id,
                    name: "New Chat",
                    created_at: new Date().toISOString()
                });
            }
        });
        freshState.setAllSubChats(allSubChats);
        // Initialize atomFamily mode for each sub-chat from database
        // This ensures new chats with mode="plan" use the correct mode
        for (var _i = 0, dbSubChats_1 = dbSubChats; _i < dbSubChats_1.length; _i++) {
            var sc = dbSubChats_1[_i];
            if (sc.mode) {
                jotai_store_1.appStore.set((0, atoms_3.subChatModeAtomFamily)(sc.id), sc.mode);
            }
        }
        // All open tabs are now valid (we created placeholders for non-DB ones)
        var validOpenIds = currentOpenIds;
        if (validOpenIds.length === 0 && allSubChats.length > 0) {
            // No valid open tabs, open the first sub-chat
            freshState.addToOpenSubChats(allSubChats[0].id);
            freshState.setActiveSubChat(allSubChats[0].id);
        }
        else if (validOpenIds.length > 0) {
            // Validate active tab is in open tabs
            var currentActive = freshState.activeSubChatId;
            if (!currentActive || !validOpenIds.includes(currentActive)) {
                freshState.setActiveSubChat(validOpenIds[0]);
            }
        }
    });
    // Auto-detect plan path from ACTIVE sub-chat messages when sub-chat changes
    // This ensures the plan sidebar shows the correct plan for the active sub-chat only
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!agentSubChats || agentSubChats.length === 0 || !activeSubChatIdForPlan) {
            setCurrentPlanPath(null);
            return;
        }
        // Find the active sub-chat
        var activeSubChat = agentSubChats.find(function (sc) { return sc.id === activeSubChatIdForPlan; });
        if (!activeSubChat) {
            setCurrentPlanPath(null);
            return;
        }
        // Find last plan file path from active sub-chat only
        var lastPlanPath = null;
        var messages = activeSubChat.messages || [];
        for (var _i = 0, messages_4 = messages; _i < messages_4.length; _i++) {
            var msg = messages_4[_i];
            if (msg.role !== "assistant")
                continue;
            var parts = msg.parts || [];
            for (var _b = 0, parts_2 = parts; _b < parts_2.length; _b++) {
                var part = parts_2[_b];
                if (part.type === "tool-Write" && (0, agent_tool_utils_1.isPlanFile)(((_a = part.input) === null || _a === void 0 ? void 0 : _a.file_path) || "")) {
                    lastPlanPath = part.input.file_path;
                }
            }
        }
        setCurrentPlanPath(lastPlanPath);
    });
    // Create or get Chat instance for a sub-chat
    var getOrCreateChat = function (subChatId) {
        var _a;
        // Desktop uses worktreePath, web uses sandboxUrl
        if (!chatWorkingDir || !agentChat) {
            return null;
        }
        // Return existing chat if we have it
        var existing = agent_chat_store_1.agentChatStore.get(subChatId);
        if (existing) {
            return existing;
        }
        // Find sub-chat data
        var subChat = agentSubChats.find(function (sc) { return sc.id === subChatId; });
        var messages = (subChat === null || subChat === void 0 ? void 0 : subChat.messages) || [];
        // Get mode from store metadata (falls back to currentMode)
        var subChatMeta = sub_chat_store_1.useAgentSubChatStore.getState().allSubChats.find(function (sc) { return sc.id === subChatId; });
        var subChatMode = (subChatMeta === null || subChatMeta === void 0 ? void 0 : subChatMeta.mode) || currentMode;
        // Create transport based on chat type (local worktree vs remote sandbox)
        // Note: Extended thinking setting is read dynamically inside the transport
        // projectPath: original project path for MCP config lookup (worktreePath is the cwd)
        var projectPath = (_a = agentChat === null || agentChat === void 0 ? void 0 : agentChat.project) === null || _a === void 0 ? void 0 : _a.path;
        var chatSandboxId = (agentChat === null || agentChat === void 0 ? void 0 : agentChat.sandboxId) || (agentChat === null || agentChat === void 0 ? void 0 : agentChat.sandbox_id);
        var chatSandboxUrl = chatSandboxId ? "https://3003-".concat(chatSandboxId, ".e2b.app") : null;
        var isRemoteChat = !!(agentChat === null || agentChat === void 0 ? void 0 : agentChat.isRemote) || !!chatSandboxId;
        console.log("[getOrCreateChat] Transport selection", {
            subChatId: subChatId.slice(-8),
            isRemoteChat: isRemoteChat,
            chatSandboxId: chatSandboxId,
            chatSandboxUrl: chatSandboxUrl,
            worktreePath: worktreePath ? "exists" : "none"
        });
        var transport = null;
        if (isRemoteChat && chatSandboxUrl) {
            // Remote sandbox chat: use HTTP SSE transport
            var subChatName = (subChat === null || subChat === void 0 ? void 0 : subChat.name) || "Chat";
            var modelString = atoms_3.MODEL_ID_MAP[selectedModelId];
            console.log("[getOrCreateChat] Using RemoteChatTransport", {
                sandboxUrl: chatSandboxUrl,
                model: modelString
            });
            transport = new remote_chat_transport_1.RemoteChatTransport({
                chatId: chatId,
                subChatId: subChatId,
                subChatName: subChatName,
                sandboxUrl: chatSandboxUrl,
                mode: subChatMode,
                model: modelString
            });
        }
        else if (worktreePath) {
            // Local worktree chat: use IPC transport
            transport = new ipc_chat_transport_1.IPCChatTransport({
                chatId: chatId,
                subChatId: subChatId,
                cwd: worktreePath,
                projectPath: projectPath,
                mode: subChatMode
            });
        }
        if (!transport) {
            console.error("[getOrCreateChat] No transport available");
            return null;
        }
        var newChat = new react_1.Chat({
            id: subChatId,
            messages: messages,
            transport: transport,
            onError: function () {
                // Sync status to global store on error (allows queue to continue)
                streaming_status_store_1.useStreamingStatusStore.getState().setStatus(subChatId, "ready");
            },
            onFinish: function () {
                (0, atoms_3.clearLoading)(setLoadingSubChats, subChatId);
                // Sync status to global store for queue processing (even when component unmounted)
                streaming_status_store_1.useStreamingStatusStore.getState().setStatus(subChatId, "ready");
                // Check if this was a manual abort (ESC/Ctrl+C) - skip sound if so
                var wasManuallyAborted = agent_chat_store_1.agentChatStore.wasManuallyAborted(subChatId);
                agent_chat_store_1.agentChatStore.clearManuallyAborted(subChatId);
                // Get CURRENT values at runtime (not stale closure values)
                var currentActiveSubChatId = sub_chat_store_1.useAgentSubChatStore.getState().activeSubChatId;
                var currentSelectedChatId = jotai_store_1.appStore.get(atoms_3.selectedAgentChatIdAtom);
                var isViewingThisSubChat = currentActiveSubChatId === subChatId;
                var isViewingThisChat = currentSelectedChatId === chatId;
                if (!isViewingThisSubChat) {
                    subChatUnseenChanges().add(subChatId);
                }
                // Also mark parent chat as unseen if user is not viewing it
                if (!isViewingThisChat) {
                    unseenChanges().add(chatId);
                    // Play completion sound only if NOT manually aborted and sound is enabled
                    if (!wasManuallyAborted) {
                        var isSoundEnabled = jotai_store_1.appStore.get(atoms_1.soundNotificationsEnabledAtom);
                        if (isSoundEnabled) {
                            try {
                                var audio = new Audio("./sound.mp3");
                                audio.volume = 1;
                                audio.play().catch(function () { });
                            }
                            catch (_a) { }
                        }
                        // Show native notification (desktop app, when window not focused)
                        notifyAgentComplete((agentChat === null || agentChat === void 0 ? void 0 : agentChat.name) || "Agent");
                    }
                }
                // Refresh diff stats after agent finishes making changes
                fetchDiffStatsRef.current();
                // Note: sidebar timestamp update is handled via optimistic update in handleSend
                // No need to refetch here as it would overwrite the optimistic update with stale data
            }
        });
        agent_chat_store_1.agentChatStore.set(subChatId, newChat, chatId);
        // Store streamId at creation time to prevent resume during active streaming
        // tRPC refetch would update stream_id in DB, but store stays stable
        agent_chat_store_1.agentChatStore.setStreamId(subChatId, (subChat === null || subChat === void 0 ? void 0 : subChat.stream_id) || null);
        forceUpdate({});
        return newChat;
    };
    // Handle creating a new sub-chat
    var handleCreateNewSubChat = function () { return __awaiter(_this, void 0, void 0, function () {
        var store, newSubChatMode, isRemoteChat, newId, newSubChat, projectPath, newSubChatSandboxId, newSubChatSandboxUrl, isNewSubChatRemote, newSubChatTransport, modelString, transport, newChat;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    store = sub_chat_store_1.useAgentSubChatStore.getState();
                    newSubChatMode = defaultAgentMode;
                    isRemoteChat = !!(agentChat === null || agentChat === void 0 ? void 0 : agentChat.isRemote);
                    if (!isRemoteChat) return [3 /*break*/, 1];
                    // Sandbox mode: lazy creation (web app pattern)
                    // Sub-chat will be persisted on first message via RemoteChatTransport UPSERT
                    newId = crypto.randomUUID();
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, trpc_1.trpcClient.chats.createSubChat.mutate({
                        chatId: chatId,
                        name: "New Chat",
                        mode: newSubChatMode
                    })];
                case 2:
                    newSubChat = _b.sent();
                    newId = newSubChat.id;
                    utils.agents.getAgentChat.invalidate({ chatId: chatId });
                    // Optimistic update: add new sub-chat to React Query cache immediately
                    // This is CRITICAL for workspace isolation - without this, the new sub-chat
                    // won't be in validSubChatIds and will be filtered out by tabsToRender
                    utils.agents.getAgentChat.setData({ chatId: chatId }, function (old) {
                        if (!old)
                            return old;
                        return __assign(__assign({}, old), { subChats: __spreadArray(__spreadArray([], old.subChats || [], true), [{
                                    id: newId,
                                    name: "New Chat",
                                    mode: newSubChatMode,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                    messages: null,
                                    stream_id: null
                                }], false) });
                    });
                    _b.label = 3;
                case 3:
                    // Track this subchat as just created for typewriter effect
                    justCreatedIds().add(newId);
                    // Add to allSubChats with placeholder name
                    store.addToAllSubChats({
                        id: newId,
                        name: "New Chat",
                        created_at: new Date().toISOString(),
                        mode: newSubChatMode
                    });
                    // Add to open tabs and set as active
                    store.addToOpenSubChats(newId);
                    store.setActiveSubChat(newId);
                    projectPath = (_a = agentChat === null || agentChat === void 0 ? void 0 : agentChat.project) === null || _a === void 0 ? void 0 : _a.path;
                    newSubChatSandboxId = (agentChat === null || agentChat === void 0 ? void 0 : agentChat.sandboxId) || (agentChat === null || agentChat === void 0 ? void 0 : agentChat.sandbox_id);
                    newSubChatSandboxUrl = newSubChatSandboxId ? "https://3003-".concat(newSubChatSandboxId, ".e2b.app") : null;
                    isNewSubChatRemote = !!(agentChat === null || agentChat === void 0 ? void 0 : agentChat.isRemote) || !!newSubChatSandboxId;
                    console.log("[createNewSubChat] Transport selection", {
                        newId: newId.slice(-8),
                        isNewSubChatRemote: isNewSubChatRemote,
                        newSubChatSandboxId: newSubChatSandboxId,
                        newSubChatSandboxUrl: newSubChatSandboxUrl
                    });
                    newSubChatTransport = null;
                    if (isNewSubChatRemote && newSubChatSandboxUrl) {
                        modelString = atoms_3.MODEL_ID_MAP[selectedModelId];
                        console.log("[createNewSubChat] Using RemoteChatTransport", { model: modelString });
                        newSubChatTransport = new remote_chat_transport_1.RemoteChatTransport({
                            chatId: chatId,
                            subChatId: newId,
                            subChatName: "New Chat",
                            sandboxUrl: newSubChatSandboxUrl,
                            mode: subChatMode,
                            model: modelString
                        });
                    }
                    else if (worktreePath) {
                        // Local worktree chat: use IPC transport
                        newSubChatTransport = new ipc_chat_transport_1.IPCChatTransport({
                            chatId: chatId,
                            subChatId: newId,
                            cwd: worktreePath,
                            projectPath: projectPath,
                            mode: newSubChatMode
                        });
                    }
                    if (newSubChatTransport) {
                        transport = newSubChatTransport;
                        newChat = new react_1.Chat({
                            id: newId,
                            messages: [],
                            transport: transport,
                            onError: function () {
                                // Sync status to global store on error (allows queue to continue)
                                streaming_status_store_1.useStreamingStatusStore.getState().setStatus(newId, "ready");
                            },
                            onFinish: function () {
                                (0, atoms_3.clearLoading)(setLoadingSubChats, newId);
                                // Sync status to global store for queue processing (even when component unmounted)
                                streaming_status_store_1.useStreamingStatusStore.getState().setStatus(newId, "ready");
                                // Check if this was a manual abort (ESC/Ctrl+C) - skip sound if so
                                var wasManuallyAborted = agent_chat_store_1.agentChatStore.wasManuallyAborted(newId);
                                agent_chat_store_1.agentChatStore.clearManuallyAborted(newId);
                                // Get CURRENT values at runtime (not stale closure values)
                                var currentActiveSubChatId = sub_chat_store_1.useAgentSubChatStore.getState().activeSubChatId;
                                var currentSelectedChatId = jotai_store_1.appStore.get(atoms_3.selectedAgentChatIdAtom);
                                var isViewingThisSubChat = currentActiveSubChatId === newId;
                                var isViewingThisChat = currentSelectedChatId === chatId;
                                if (!isViewingThisSubChat) {
                                    subChatUnseenChanges().add(newId);
                                }
                                // Also mark parent chat as unseen if user is not viewing it
                                if (!isViewingThisChat) {
                                    unseenChanges().add(chatId);
                                    // Play completion sound only if NOT manually aborted and sound is enabled
                                    if (!wasManuallyAborted) {
                                        var isSoundEnabled = jotai_store_1.appStore.get(atoms_1.soundNotificationsEnabledAtom);
                                        if (isSoundEnabled) {
                                            try {
                                                var audio = new Audio("./sound.mp3");
                                                audio.volume = 1;
                                                audio.play().catch(function () { });
                                            }
                                            catch (_a) { }
                                        }
                                        // Show native notification (desktop app, when window not focused)
                                        notifyAgentComplete((agentChat === null || agentChat === void 0 ? void 0 : agentChat.name) || "Agent");
                                    }
                                }
                                // Refresh diff stats after agent finishes making changes
                                fetchDiffStatsRef.current();
                                // Note: sidebar timestamp update is handled via optimistic update in handleSend
                                // No need to refetch here as it would overwrite the optimistic update with stale data
                            }
                        });
                        agent_chat_store_1.agentChatStore.set(newId, newChat, chatId);
                        agent_chat_store_1.agentChatStore.setStreamId(newId, null);
                        forceUpdate({});
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Keyboard shortcut: New sub-chat
    // Web: Opt+Cmd+T (browser uses Cmd+T for new tab)
    // Desktop: Cmd+T
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var isDesktop = (0, platform_1.isDesktopApp)();
            // Desktop: Cmd+T (without Alt)
            if (isDesktop && e.metaKey && e.code === "KeyT" && !e.altKey) {
                e.preventDefault();
                handleCreateNewSubChat();
                return;
            }
            // Web: Opt+Cmd+T (with Alt)
            if (e.altKey && e.metaKey && e.code === "KeyT") {
                e.preventDefault();
                handleCreateNewSubChat();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // NOTE: Desktop notifications for pending questions are now triggered directly
    // in ipc-chat-transport.ts when the ask-user-question chunk arrives.
    // This prevents duplicate notifications from multiple ChatView instances.
    // Multi-select state for sub-chats (for Cmd+W bulk close)
    var selectedSubChatIds = selectedSubChatIdsAtom[0];
    var isSubChatMultiSelectMode = isSubChatMultiSelectModeAtom;
    var clearSubChatSelection = function () { return selectedSubChatIdsAtom[1](new set_1.ReactiveSet()); };
    // Helper to add sub-chat to undo stack
    var addSubChatToUndoStack = function (subChatId) {
        var timeoutId = setTimeout(function () {
            setUndoStack(function (prev) { return prev.filter(function (item) { return !(item.type === "subchat" && item.subChatId === subChatId); }); });
        }, 1e4);
        setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{
                type: "subchat",
                subChatId: subChatId,
                chatId: chatId,
                timeoutId: timeoutId
            }], false); });
    };
    // Keyboard shortcut: Close active sub-chat (or bulk close if multi-select mode)
    // Web: Opt+Cmd+W (browser uses Cmd+W to close tab)
    // Desktop: Cmd+W
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var isDesktop = (0, platform_1.isDesktopApp)();
            // Desktop: Cmd+W (without Alt)
            var isDesktopShortcut = isDesktop && e.metaKey && e.code === "KeyW" && !e.altKey && !e.shiftKey && !e.ctrlKey;
            // Web: Opt+Cmd+W (with Alt)
            var isWebShortcut = e.altKey && e.metaKey && e.code === "KeyW";
            if (isDesktopShortcut || isWebShortcut) {
                e.preventDefault();
                var store_1 = sub_chat_store_1.useAgentSubChatStore.getState();
                // If multi-select mode, bulk close selected sub-chats
                if (isSubChatMultiSelectMode && selectedSubChatIds.size > 0) {
                    var idsToClose_1 = Array.from(selectedSubChatIds);
                    var remainingOpenIds = store_1.openSubChatIds.filter(function (id) { return !idsToClose_1.includes(id); });
                    // Don't close all tabs via hotkey - user should use sidebar dialog for last tab
                    if (remainingOpenIds.length > 0) {
                        idsToClose_1.forEach(function (id) {
                            store_1.removeFromOpenSubChats(id);
                            addSubChatToUndoStack(id);
                        });
                    }
                    clearSubChatSelection();
                    return;
                }
                // Otherwise close active sub-chat
                var activeId = store_1.activeSubChatId;
                var openIds = store_1.openSubChatIds;
                // Only close if we have more than one tab open and there's an active tab
                // removeFromOpenSubChats automatically switches to the last remaining tab
                if (activeId && openIds.length > 1) {
                    store_1.removeFromOpenSubChats(activeId);
                    addSubChatToUndoStack(activeId);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Keyboard shortcut: Navigate between sub-chats
    // Web: Opt+Cmd+[ and Opt+Cmd+] (browser uses Cmd+[ for back)
    // Desktop: Cmd+[ and Cmd+]
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var isDesktop = (0, platform_1.isDesktopApp)();
            // Check for previous sub-chat shortcut ([ key)
            var isPrevDesktop = isDesktop && e.metaKey && e.code === "BracketLeft" && !e.altKey && !e.shiftKey && !e.ctrlKey;
            var isPrevWeb = e.altKey && e.metaKey && e.code === "BracketLeft";
            if (isPrevDesktop || isPrevWeb) {
                e.preventDefault();
                var store = sub_chat_store_1.useAgentSubChatStore.getState();
                var activeId = store.activeSubChatId;
                var openIds = store.openSubChatIds;
                // Only navigate if we have multiple tabs
                if (openIds.length <= 1)
                    return;
                // If no active tab, select first one
                if (!activeId) {
                    store.setActiveSubChat(openIds[0]);
                    return;
                }
                // Find current index
                var currentIndex = openIds.indexOf(activeId);
                if (currentIndex === -1) {
                    // Current tab not found, select first
                    store.setActiveSubChat(openIds[0]);
                    return;
                }
                // Navigate to previous tab (cycle to end if at start)
                var nextIndex = currentIndex - 1 < 0 ? openIds.length - 1 : currentIndex - 1;
                var nextId = openIds[nextIndex];
                if (nextId) {
                    store.setActiveSubChat(nextId);
                }
            }
            // Check for next sub-chat shortcut (] key)
            var isNextDesktop = isDesktop && e.metaKey && e.code === "BracketRight" && !e.altKey && !e.shiftKey && !e.ctrlKey;
            var isNextWeb = e.altKey && e.metaKey && e.code === "BracketRight";
            if (isNextDesktop || isNextWeb) {
                e.preventDefault();
                var store = sub_chat_store_1.useAgentSubChatStore.getState();
                var activeId = store.activeSubChatId;
                var openIds = store.openSubChatIds;
                // Only navigate if we have multiple tabs
                if (openIds.length <= 1)
                    return;
                // If no active tab, select first one
                if (!activeId) {
                    store.setActiveSubChat(openIds[0]);
                    return;
                }
                // Find current index
                var currentIndex = openIds.indexOf(activeId);
                if (currentIndex === -1) {
                    // Current tab not found, select first
                    store.setActiveSubChat(openIds[0]);
                    return;
                }
                // Navigate to next tab (cycle to start if at end)
                var nextIndex = (currentIndex + 1) % openIds.length;
                var nextId = openIds[nextIndex];
                if (nextId) {
                    store.setActiveSubChat(nextId);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    // Keyboard shortcut: Cmd + D to toggle diff sidebar
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            // Check for Cmd (Meta) + D (without Alt/Shift)
            if (e.metaKey && !e.altKey && !e.shiftKey && !e.ctrlKey && e.code === "KeyD") {
                e.preventDefault();
                e.stopPropagation();
                // Toggle diff sidebar
                setIsDiffSidebarOpen(!isDiffSidebarOpen);
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Keyboard shortcut: Create PR (preview)
    // Web: Opt+Cmd+P (browser uses Cmd+P for print)
    // Desktop: Cmd+P
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var isDesktop = (0, platform_1.isDesktopApp)();
            // Desktop: Cmd+P (without Alt)
            var isDesktopShortcut = isDesktop && e.metaKey && e.code === "KeyP" && !e.altKey && !e.shiftKey && !e.ctrlKey;
            // Web: Opt+Cmd+P (with Alt)
            var isWebShortcut = e.altKey && e.metaKey && e.code === "KeyP";
            if (isDesktopShortcut || isWebShortcut) {
                e.preventDefault();
                e.stopPropagation();
                // Only create PR if there are changes and not already creating
                if (diffStats.hasChanges && !isCreatingPr) {
                    handleCreatePr();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Keyboard shortcut: Cmd + Shift + E to restore archived workspace
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.metaKey && e.shiftKey && !e.altKey && !e.ctrlKey && e.code === "KeyE") {
                if (isArchived && !restoreWorkspaceMutation.isPending) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRestoreWorkspace();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Handle auto-rename for sub-chat and parent chat
    // Receives subChatId as param to avoid stale closure issues
    var handleAutoRename = function (userMessage, subChatId) {
        // Check if this is the first sub-chat using agentSubChats directly
        // to avoid race condition with store initialization
        var firstSubChatId = getFirstSubChatId(agentSubChats);
        var isFirst = firstSubChatId === subChatId;
        (0, auto_rename_1.autoRenameAgentChat)({
            subChatId: subChatId,
            parentChatId: chatId,
            userMessage: userMessage,
            isFirstSubChat: isFirst,
            generateName: function (msg) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, generateSubChatNameMutation.mutateAsync({
                            userMessage: msg,
                            ollamaModel: selectedOllamaModel
                        })];
                });
            }); },
            renameSubChat: function (input) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, renameSubChatMutation.mutateAsync(input)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); },
            renameChat: function (input) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, renameChatMutation.mutateAsync(input)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); },
            updateSubChatName: function (subChatIdToUpdate, name) {
                // Update local store
                sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChatIdToUpdate, name);
                // Also update query cache so init effect doesn't overwrite
                utils.agents.getAgentChat.setData({ chatId: chatId }, function (old) {
                    if (!old)
                        return old;
                    var existsInCache = old.subChats.some(function (sc) { return sc.id === subChatIdToUpdate; });
                    if (!existsInCache) {
                        // Sub-chat not in cache yet (DB save still in flight) - add it
                        return __assign(__assign({}, old), { subChats: __spreadArray(__spreadArray([], old.subChats, true), [{
                                    id: subChatIdToUpdate,
                                    name: name,
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    messages: [],
                                    mode: "agent",
                                    stream_id: null,
                                    chat_id: chatId
                                }], false) });
                    }
                    return __assign(__assign({}, old), { subChats: old.subChats.map(function (sc) { return sc.id === subChatIdToUpdate ? __assign(__assign({}, sc), { name: name }) : sc; }) });
                });
            },
            updateChatName: function (chatIdToUpdate, name) {
                // Optimistic update for sidebar (list query)
                // On desktop, selectedTeamId is always null, so we update unconditionally
                utils.agents.getAgentChats.setData({ teamId: selectedTeamId }, function (old) {
                    if (!old)
                        return old;
                    return old.map(function (c) { return c.id === chatIdToUpdate ? __assign(__assign({}, c), { name: name }) : c; });
                });
                // Optimistic update for header (single chat query)
                utils.agents.getAgentChat.setData({ chatId: chatIdToUpdate }, function (old) {
                    if (!old)
                        return old;
                    return __assign(__assign({}, old), { name: name });
                });
            }
        });
    };
    // Get or create Chat instance for active sub-chat
    var activeChat = (0, solid_js_1.createMemo)(function () {
        if (!activeSubChatId || !agentChat) {
            return null;
        }
        return getOrCreateChat(activeSubChatId);
    });
    // Check if active sub-chat is the first one (for renaming parent chat)
    // Use agentSubChats directly to avoid race condition with store initialization
    var isFirstSubChatActive = (0, solid_js_1.createMemo)(function () {
        if (!activeSubChatId)
            return false;
        return getFirstSubChatId(agentSubChats) === activeSubChatId;
    });
    // Determine if chat header should be hidden
    var shouldHideChatHeader = subChatsSidebarMode === "sidebar" && isPreviewSidebarOpen && isDiffSidebarOpen && !isMobileFullscreen;
    // No early return - let the UI render with loading state handled by activeChat check below
    return <text_selection_context_1.TextSelectionProvider>
    <div class="flex h-full flex-col">
      {/* Main content */}
      <div class="flex-1 overflow-hidden flex">
        {/* Chat Panel */}
        <div class="flex-1 flex flex-col overflow-hidden relative" style={{ minWidth: "350px" }}>
          {/* SubChatSelector header - absolute when sidebar open (desktop only), regular div otherwise */}
          {!shouldHideChatHeader && <div class={(0, utils_1.cn)("relative z-20 pointer-events-none", 
            // Mobile: always flex; Desktop: absolute when sidebar open, flex when closed
            !isMobileFullscreen && subChatsSidebarMode === "sidebar" ? "absolute top-0 left-0 right-0 ".concat(CHAT_LAYOUT.headerPaddingSidebarOpen) : "flex-shrink-0 ".concat(CHAT_LAYOUT.headerPaddingSidebarClosed))}>
              {/* Gradient background - only when not absolute */}
              {(isMobileFullscreen || subChatsSidebarMode !== "sidebar") && <div class="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent"/>}
              <div class="pointer-events-auto flex items-center justify-between relative">
                <div class="flex-1 min-w-0 flex items-center gap-2">
                  {/* Mobile header - simplified with chat name as trigger */}
                  {isMobileFullscreen ? <mobile_chat_header_1.MobileChatHeader onCreateNew={handleCreateNewSubChat} onBackToChats={onBackToChats} onOpenPreview={onOpenPreview} canOpenPreview={canOpenPreview} onOpenDiff={onOpenDiff} canOpenDiff={canShowDiffButton} diffStats={diffStats} onOpenTerminal={onOpenTerminal} canOpenTerminal={!!worktreePath} isArchived={isArchived} onRestore={handleRestoreWorkspace} onOpenLocally={handleOpenLocally} showOpenLocally={showOpenLocally}/> : <>
                      {/* Header controls - desktop only */}
                      <agents_header_controls_1.AgentsHeaderControls isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} hasUnseenChanges={hasAnyUnseenChanges} isSubChatsSidebarOpen={subChatsSidebarMode === "sidebar"}/>
                      <sub_chat_selector_1.SubChatSelector onCreateNew={handleCreateNewSubChat} isMobile={false} onBackToChats={onBackToChats} onOpenPreview={onOpenPreview} canOpenPreview={canOpenPreview} onOpenDiff={canOpenDiff ? function () { return setIsDiffSidebarOpen(true); } : undefined} canOpenDiff={canShowDiffButton} isDiffSidebarOpen={isDiffSidebarOpen} diffStats={diffStats} onOpenTerminal={function () { return setIsTerminalSidebarOpen(true); }} canOpenTerminal={!!worktreePath} chatId={chatId}/>
                      {/* Open Locally button - desktop only, sandbox mode */}
                      {showOpenLocally && <tooltip_1.Tooltip delayDuration={500}>
                          <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant="default" size="sm" onClick={handleOpenLocally} disabled={isImporting} class="h-6 px-2 gap-1.5 text-xs font-medium ml-2">
                              {isImporting ? <icons_1.IconSpinner class="h-3 w-3 animate-spin"/> : <lucide_solid_1.GitFork class="h-3 w-3"/>}
                              Fork Locally
                            </button_1.Button>
                          </tooltip_1.TooltipTrigger>
                          <tooltip_1.TooltipContent side="bottom">
                            Continue this session on your local machine
                          </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>}
                    </>}
                </div>
                {/* Open Preview Button - shows when preview is closed (desktop only, local mode only) */}
                {!isMobileFullscreen && !isPreviewSidebarOpen && sandboxId && chatSourceMode === "local" && (canOpenPreview ? <tooltip_1.Tooltip delayDuration={500}>
                      <tooltip_1.TooltipTrigger asChild>
                        <button_1.Button variant="ghost" size="icon" onClick={function () { return setIsPreviewSidebarOpen(true); }} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="Open preview">
                          <icons_1.IconOpenSidebarRight class="h-4 w-4"/>
                        </button_1.Button>
                      </tooltip_1.TooltipTrigger>
                      <tooltip_1.TooltipContent>Open preview</tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip> : <preview_setup_hover_card_1.PreviewSetupHoverCard>
                      <span class="inline-flex ml-2">
                        <button_1.Button variant="ghost" size="icon" disabled class="h-6 w-6 p-0 text-muted-foreground flex-shrink-0 rounded-md cursor-not-allowed pointer-events-none" aria-label="Preview not available">
                          <icons_1.IconOpenSidebarRight class="h-4 w-4"/>
                        </button_1.Button>
                      </span>
                    </preview_setup_hover_card_1.PreviewSetupHoverCard>)}
                {/* Overview/Terminal Button - shows when sidebar is closed and worktree/sandbox exists (desktop only) */}
                {!isMobileFullscreen && (worktreePath || sandboxId) && (isUnifiedSidebarEnabled ? !isDetailsSidebarOpen && <tooltip_1.Tooltip delayDuration={500}>
                          <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant="ghost" size="icon" onClick={function () { return setIsDetailsSidebarOpen(true); }} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="View details">
                              <icons_1.IconOpenSidebarRight class="h-4 w-4"/>
                            </button_1.Button>
                          </tooltip_1.TooltipTrigger>
                          <tooltip_1.TooltipContent side="bottom">
                            View details
                            {toggleDetailsHotkey && <kbd_1.Kbd>{toggleDetailsHotkey}</kbd_1.Kbd>}
                          </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip> : !isTerminalSidebarOpen && <tooltip_1.Tooltip delayDuration={500}>
                          <tooltip_1.TooltipTrigger asChild>
                            <button_1.Button variant="ghost" size="icon" onClick={function () { return setIsTerminalSidebarOpen(true); }} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2" aria-label="Open terminal">
                              <lucide_solid_1.TerminalSquare class="h-4 w-4"/>
                            </button_1.Button>
                          </tooltip_1.TooltipTrigger>
                          <tooltip_1.TooltipContent side="bottom">
                            Open terminal
                            {toggleTerminalHotkey && <kbd_1.Kbd>{toggleTerminalHotkey}</kbd_1.Kbd>}
                          </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>)}
                {/* Restore Button - shows when viewing archived workspace (desktop only) */}
                {!isMobileFullscreen && isArchived && <tooltip_1.Tooltip delayDuration={500}>
                    <tooltip_1.TooltipTrigger asChild>
                      <button_1.Button variant="ghost" onClick={handleRestoreWorkspace} disabled={restoreWorkspaceMutation.isPending} class="h-6 px-2 gap-1.5 hover:bg-foreground/10 transition-colors text-foreground flex-shrink-0 rounded-md ml-2 flex items-center" aria-label="Restore workspace">
                        <icons_1.IconTextUndo class="h-4 w-4"/>
                        <span class="text-xs">Restore</span>
                      </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="bottom">
                      Restore workspace
                      <kbd_1.Kbd>⇧⌘E</kbd_1.Kbd>
                    </tooltip_1.TooltipContent>
                  </tooltip_1.Tooltip>}
              </div>
            </div>}

          {/* Chat Content - Keep-alive: render all open tabs, hide inactive with CSS */}
          {tabsToRender.length > 0 && agentChat ? <div class="relative flex-1 min-h-0">
              {/* Loading gate: prevent getOrCreateChat() from caching empty messages before data is ready */}
              {isLocalChatLoading ? <div class="flex items-center justify-center h-full">
                  <icons_1.IconSpinner class="h-6 w-6 animate-spin"/>
                </div> : tabsToRender.map(function (subChatId) {
                var chat = getOrCreateChat(subChatId);
                var isActive = subChatId === activeSubChatId;
                var isFirstSubChat = getFirstSubChatId(agentSubChats) === subChatId;
                // Defense in depth: double-check workspace ownership
                // Use agentSubChats (server data) as primary source, fall back to allSubChats for optimistic updates
                // This fixes the race condition where allSubChats is empty after setChatId but before setAllSubChats
                var belongsToWorkspace = agentSubChats.some(function (sc) { return sc.id === subChatId; }) || allSubChats.some(function (sc) { return sc.id === subChatId; });
                if (!chat || !belongsToWorkspace)
                    return null;
                return <div key={subChatId} class="absolute inset-0 flex flex-col" style={{
                        transform: isActive ? "translateZ(0)" : "translateZ(0) scale(0.98)",
                        opacity: isActive ? 1 : 0,
                        pointerEvents: isActive ? "auto" : "none",
                        willChange: "transform, opacity",
                        contain: "layout style paint"
                    }} aria-hidden={!isActive}>
                    <ChatViewInner chat={chat} subChatId={subChatId} parentChatId={chatId} isFirstSubChat={isFirstSubChat} onAutoRename={handleAutoRename} onCreateNewSubChat={handleCreateNewSubChat} teamId={selectedTeamId || undefined} repository={repository} streamId={agent_chat_store_1.agentChatStore.getStreamId(subChatId)} isMobile={isMobileFullscreen} isSubChatsSidebarOpen={subChatsSidebarMode === "sidebar"} sandboxId={sandboxId || undefined} projectPath={worktreePath || undefined} isArchived={isArchived} onRestoreWorkspace={handleRestoreWorkspace} existingPrUrl={agentChat === null || agentChat === void 0 ? void 0 : agentChat.prUrl} isActive={isActive}/>
                  </div>;
            })}
            </div> : <>
              {/* Empty chat area - no loading indicator */}
              <div class="flex-1"/>

              {/* Disabled input while loading */}
              <div class="px-2 pb-2">
                <div class="w-full max-w-2xl mx-auto">
                  <div class="relative w-full">
                    <prompt_input_1.PromptInput class="border bg-input-background relative z-10 p-2 rounded-xl opacity-50 pointer-events-none" maxHeight={200}>
                      <div class="p-1 text-muted-foreground text-sm">
                        Plan, @ for context, / for commands
                      </div>
                      <prompt_input_1.PromptInputActions class="w-full">
                        <div class="flex items-center gap-0.5 flex-1 min-w-0">
                          {/* Mode selector placeholder */}
                          <button disabled class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground rounded-md cursor-not-allowed">
                            <icons_1.AgentIcon class="h-3.5 w-3.5"/>
                            <span>Agent</span>
                            <lucide_solid_1.ChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                          </button>

                          {/* Model selector placeholder */}
                          <button disabled class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground rounded-md cursor-not-allowed">
                            <icons_1.ClaudeCodeIcon class="h-3.5 w-3.5"/>
                            <span>
                              {hasCustomClaudeConfig ? "Custom Model" : <>
                                  Sonnet{" "}
                                  <span class="text-muted-foreground">
                                    4.5
                                  </span>
                                </>}
                            </span>
                            <lucide_solid_1.ChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                          </button>
                        </div>
                        <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                          {/* Attach button placeholder */}
                          <button_1.Button variant="ghost" size="icon" disabled class="h-7 w-7 rounded-sm cursor-not-allowed">
                            <icons_1.AttachIcon class="h-4 w-4"/>
                          </button_1.Button>

                          {/* Send button */}
                          <div class="ml-1">
                            <agent_send_button_1.AgentSendButton disabled={true} onClick={function () { }}/>
                          </div>
                        </div>
                      </prompt_input_1.PromptInputActions>
                    </prompt_input_1.PromptInput>
                  </div>
                </div>
              </div>
            </>}
        </div>

        {/* Plan Sidebar - shows plan files on the right (leftmost right sidebar) */}
        {/* Only show when we have an active sub-chat with a plan */}
        {!isMobileFullscreen && activeSubChatIdForPlan && <resizable_sidebar_1.ResizableSidebar isOpen={isPlanSidebarOpen && !!currentPlanPath} onClose={function () { return setIsPlanSidebarOpen(false); }} widthAtom={atoms_3.agentsPlanSidebarWidthAtom} minWidth={400} maxWidth={800} side="right" animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{ borderLeftWidth: "0.5px" }}>
            <agent_plan_sidebar_1.AgentPlanSidebar chatId={activeSubChatIdForPlan} planPath={currentPlanPath} onClose={function () { return setIsPlanSidebarOpen(false); }} onBuildPlan={handleApprovePlanFromSidebar} refetchTrigger={planEditRefetchTrigger} mode={currentMode}/>
          </resizable_sidebar_1.ResizableSidebar>}

        {/* Diff View - hidden on mobile fullscreen and when diff is not available */}
        {/* Supports three display modes: side-peek (sidebar), center-peek (dialog), full-page */}
        {/* Wrapped in DiffStateProvider to isolate diff state and prevent ChatView re-renders */}
        {canOpenDiff && !isMobileFullscreen && <DiffStateProvider isDiffSidebarOpen={isDiffSidebarOpen} parsedFileDiffs={parsedFileDiffs} isDiffSidebarNarrow={isDiffSidebarNarrow} setIsDiffSidebarOpen={setIsDiffSidebarOpen} setDiffStats={setDiffStats} setDiffContent={setDiffContent} setParsedFileDiffs={setParsedFileDiffs} setPrefetchedFileContents={setPrefetchedFileContents} fetchDiffStats={fetchDiffStats}>
            <DiffSidebarRenderer worktreePath={worktreePath} chatId={chatId} sandboxId={sandboxId} repository={repository} diffStats={diffStats} diffContent={diffContent} parsedFileDiffs={parsedFileDiffs} prefetchedFileContents={prefetchedFileContents} setDiffCollapseState={setDiffCollapseState} diffViewRef={diffViewRef} diffSidebarRef={diffSidebarRef} agentChat={agentChat} branchData={branchData} gitStatus={gitStatus} isGitStatusLoading={isGitStatusLoading} isDiffSidebarOpen={isDiffSidebarOpen} diffDisplayMode={diffDisplayMode} diffSidebarWidth={diffSidebarWidth} handleReview={handleReview} isReviewing={isReviewing} handleCreatePr={handleCreatePr} isCreatingPr={isCreatingPr} handleMergePr={handleMergePr} mergePrMutation={mergePrMutation} handleRefreshGitStatus={handleRefreshGitStatus} hasPrNumber={hasPrNumber} isPrOpen={isPrOpen} hasMergeConflicts={hasMergeConflicts} handleFixConflicts={handleFixConflicts} handleExpandAll={handleExpandAll} handleCollapseAll={handleCollapseAll} diffMode={diffMode} setDiffMode={setDiffMode} handleMarkAllViewed={handleMarkAllViewed} handleMarkAllUnviewed={handleMarkAllUnviewed} isDesktop={isDesktop} isFullscreen={isFullscreen} setDiffDisplayMode={setDiffDisplayMode} handleCommitToPr={handleCommitToPr} isCommittingToPr={isCommittingToPr} subChatsWithFiles={subChatsWithFiles} setDiffStats={setDiffStats}/>
          </DiffStateProvider>}

        {/* Preview Sidebar - hidden on mobile fullscreen and when preview is not available */}
        {canOpenPreview && !isMobileFullscreen && <resizable_sidebar_1.ResizableSidebar isOpen={isPreviewSidebarOpen} onClose={function () { return setIsPreviewSidebarOpen(false); }} widthAtom={atoms_3.agentsPreviewSidebarWidthAtom} minWidth={350} side="right" animationDuration={0} initialWidth={0} exitWidth={0} showResizeTooltip={true} class="bg-tl-background border-l" style={{ borderLeftWidth: "0.5px" }}>
            {isQuickSetup ? <div class="flex flex-col h-full">
                {/* Header with close button */}
                <div class="flex items-center justify-end px-3 h-10 bg-tl-background flex-shrink-0 border-b border-border/50">
                  <button_1.Button variant="ghost" class="h-7 w-7 p-0 hover:bg-muted transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md" onClick={function () { return setIsPreviewSidebarOpen(false); }}>
                    <icons_1.IconCloseSidebarRight class="h-4 w-4 text-muted-foreground"/>
                  </button_1.Button>
                </div>
                {/* Content */}
                <div class="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <div class="text-muted-foreground mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" class="opacity-50">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <p class="text-sm text-muted-foreground mb-2">
                    Preview not available
                  </p>
                  <p class="text-xs text-muted-foreground/70 max-w-[200px]">
                    Set up this repository to enable live preview
                  </p>
                </div>
              </div> : <agent_preview_1.AgentPreview chatId={chatId} sandboxId={sandboxId} port={previewPort} repository={repository} hideHeader={false} onClose={function () { return setIsPreviewSidebarOpen(false); }}/>}
          </resizable_sidebar_1.ResizableSidebar>}

        {/* Terminal Sidebar - shows when worktree exists (desktop only) */}
        {worktreePath && <terminal_sidebar_1.TerminalSidebar chatId={chatId} cwd={worktreePath} workspaceId={chatId}/>}

        {/* Open Locally Dialog - for importing sandbox chats to local */}
        <open_locally_dialog_1.OpenLocallyDialog isOpen={openLocallyDialogOpen} onClose={function () { return setOpenLocallyDialogOpen(false); }} remoteChat={remoteAgentChat !== null && remoteAgentChat !== void 0 ? remoteAgentChat : null} matchingProjects={openLocallyMatchingProjects} allProjects={projects !== null && projects !== void 0 ? projects : []} remoteSubChatId={activeSubChatId}/>

        {/* Unified Details Sidebar - combines all right sidebars into one (rightmost) */}
        {/* Show for both local (worktreePath) and remote (sandboxId) chats */}
        {isUnifiedSidebarEnabled && !isMobileFullscreen && (worktreePath || sandboxId) && <details_sidebar_1.DetailsSidebar chatId={chatId} worktreePath={worktreePath} planPath={currentPlanPath} mode={currentMode} onBuildPlan={handleApprovePlanFromSidebar} planRefetchTrigger={planEditRefetchTrigger} activeSubChatId={activeSubChatIdForPlan} isPlanSidebarOpen={isPlanSidebarOpen && !!currentPlanPath} isTerminalSidebarOpen={isTerminalSidebarOpen} isDiffSidebarOpen={isDiffSidebarOpen} diffDisplayMode={diffDisplayMode} canOpenDiff={canOpenDiff} setIsDiffSidebarOpen={setIsDiffSidebarOpen} diffStats={diffStats} parsedFileDiffs={parsedFileDiffs} onCommit={handleCommitToPr} isCommitting={isCommittingToPr} onExpandTerminal={function () { return setIsTerminalSidebarOpen(true); }} onExpandPlan={function () { return setIsPlanSidebarOpen(true); }} onExpandDiff={function () { return setIsDiffSidebarOpen(true); }} onFileSelect={function (filePath) {
                // Set the selected file path
                setSelectedFilePath(filePath);
                // Set filtered files to just this file
                setFilteredDiffFiles([filePath]);
                // Open the diff sidebar
                setIsDiffSidebarOpen(true);
            }} remoteInfo={remoteInfo} isRemoteChat={!!remoteInfo}/>}
      </div>
    </div>
    </text_selection_context_1.TextSelectionProvider>;
}
