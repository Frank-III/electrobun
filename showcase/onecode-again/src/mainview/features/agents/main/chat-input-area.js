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
exports.ChatInputArea = void 0;
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var button_1 = require("../../../components/ui/button");
var dropdown_menu_1 = require("../../../components/ui/dropdown-menu");
var icons_1 = require("../../../components/ui/icons");
var prompt_input_1 = require("../../../components/ui/prompt-input");
var switch_1 = require("../../../components/ui/switch");
var atoms_1 = require("../../../lib/atoms");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var atoms_2 = require("../atoms");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var commands_1 = require("../commands");
var agent_send_button_1 = require("../components/agent-send-button");
var drafts_1 = require("../lib/drafts");
var models_1 = require("../lib/models");
var mentions_1 = require("../mentions");
var agent_context_indicator_1 = require("../ui/agent-context-indicator");
var agent_diff_text_context_item_1 = require("../ui/agent-diff-text-context-item");
var agent_file_item_1 = require("../ui/agent-file-item");
var agent_image_item_1 = require("../ui/agent-image-item");
var agent_pasted_text_item_1 = require("../ui/agent-pasted-text-item");
var agent_text_context_item_1 = require("../ui/agent-text-context-item");
var voice_wave_indicator_1 = require("../ui/voice-wave-indicator");
var paste_text_1 = require("../utils/paste-text");
var use_voice_recording_1 = require("../../../lib/hooks/use-voice-recording");
var hotkeys_1 = require("../../../lib/hotkeys");
var atoms_3 = require("../../../lib/atoms");
// Hook to get available models (including offline models if Ollama is available and debug enabled)
function useAvailableModels() {
    var _a, _b;
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_1.showOfflineModeFeaturesAtom);
    var ollamaStatus = trpc_1.trpc.ollama.getStatus.useQuery(undefined, {
        refetchInterval: showOfflineFeatures ? 3e4 : false,
        enabled: showOfflineFeatures
    }).data;
    var baseModels = models_1.CLAUDE_MODELS;
    var isOffline = ollamaStatus ? !ollamaStatus.internet.online : false;
    var hasOllama = (ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.available) && ((_b = (_a = ollamaStatus.ollama.models) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    var ollamaModels = (ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.models) || [];
    var recommendedModel = ollamaStatus === null || ollamaStatus === void 0 ? void 0 : ollamaStatus.ollama.recommendedModel;
    // Only show offline models if:
    // 1. Debug flag is enabled (showOfflineFeatures)
    // 2. Ollama is available with models
    // 3. User is actually offline
    if (showOfflineFeatures && hasOllama && isOffline) {
        return {
            models: baseModels,
            ollamaModels: ollamaModels,
            recommendedModel: recommendedModel,
            isOffline: isOffline,
            hasOllama: true
        };
    }
    return {
        models: baseModels,
        ollamaModels: [],
        recommendedModel: undefined,
        isOffline: isOffline,
        hasOllama: false
    };
}
/**
* Custom comparison for memo to prevent re-renders from unstable array references.
* Compares messages by length and last message id, changedFiles by length and paths.
*/
function arePropsEqual(prevProps, nextProps) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    // Compare primitives and stable references first (fast path)
    if (prevProps.isStreaming !== nextProps.isStreaming || prevProps.isCompacting !== nextProps.isCompacting || prevProps.isUploading !== nextProps.isUploading || prevProps.subChatId !== nextProps.subChatId || prevProps.parentChatId !== nextProps.parentChatId || prevProps.teamId !== nextProps.teamId || prevProps.repository !== nextProps.repository || prevProps.sandboxId !== nextProps.sandboxId || prevProps.projectPath !== nextProps.projectPath || prevProps.isMobile !== nextProps.isMobile) {
        return false;
    }
    // Compare refs by identity (they should be stable)
    if (prevProps.editorRef !== nextProps.editorRef || prevProps.fileInputRef !== nextProps.fileInputRef) {
        return false;
    }
    // Compare callbacks by identity (they should be memoized in parent)
    if (prevProps.onSend !== nextProps.onSend || prevProps.onForceSend !== nextProps.onForceSend || prevProps.onStop !== nextProps.onStop || prevProps.onCompact !== nextProps.onCompact || prevProps.onCreateNewSubChat !== nextProps.onCreateNewSubChat || prevProps.onAddAttachments !== nextProps.onAddAttachments || prevProps.onRemoveImage !== nextProps.onRemoveImage || prevProps.onRemoveFile !== nextProps.onRemoveFile || prevProps.onRemoveTextContext !== nextProps.onRemoveTextContext || prevProps.onAddPastedText !== nextProps.onAddPastedText || prevProps.onRemovePastedText !== nextProps.onRemovePastedText || prevProps.onCacheFileContent !== nextProps.onCacheFileContent || prevProps.onInputContentChange !== nextProps.onInputContentChange || prevProps.onSubmitWithQuestionAnswer !== nextProps.onSubmitWithQuestionAnswer) {
        return false;
    }
    // Compare textContexts array - by length and ids
    if (!prevProps.textContexts || !nextProps.textContexts) {
        return prevProps.textContexts === nextProps.textContexts;
    }
    if (prevProps.textContexts.length !== nextProps.textContexts.length) {
        return false;
    }
    for (var i = 0; i < prevProps.textContexts.length; i++) {
        if (((_a = prevProps.textContexts[i]) === null || _a === void 0 ? void 0 : _a.id) !== ((_b = nextProps.textContexts[i]) === null || _b === void 0 ? void 0 : _b.id)) {
            return false;
        }
    }
    // Compare diffTextContexts array - by length and ids
    var prevDiff = prevProps.diffTextContexts || [];
    var nextDiff = nextProps.diffTextContexts || [];
    if (prevDiff.length !== nextDiff.length) {
        return false;
    }
    for (var i = 0; i < prevDiff.length; i++) {
        if (((_c = prevDiff[i]) === null || _c === void 0 ? void 0 : _c.id) !== ((_d = nextDiff[i]) === null || _d === void 0 ? void 0 : _d.id)) {
            return false;
        }
    }
    // Compare images array - by length and ids
    if (!prevProps.images || !nextProps.images) {
        return prevProps.images === nextProps.images;
    }
    if (prevProps.images.length !== nextProps.images.length) {
        return false;
    }
    for (var i = 0; i < prevProps.images.length; i++) {
        if (((_e = prevProps.images[i]) === null || _e === void 0 ? void 0 : _e.id) !== ((_f = nextProps.images[i]) === null || _f === void 0 ? void 0 : _f.id)) {
            return false;
        }
    }
    // Compare files array - by length and ids
    if (!prevProps.files || !nextProps.files) {
        return prevProps.files === nextProps.files;
    }
    if (prevProps.files.length !== nextProps.files.length) {
        return false;
    }
    for (var i = 0; i < prevProps.files.length; i++) {
        if (((_g = prevProps.files[i]) === null || _g === void 0 ? void 0 : _g.id) !== ((_h = nextProps.files[i]) === null || _h === void 0 ? void 0 : _h.id)) {
            return false;
        }
    }
    // Compare pastedTexts array - by length and ids
    var prevPasted = prevProps.pastedTexts || [];
    var nextPasted = nextProps.pastedTexts || [];
    if (prevPasted.length !== nextPasted.length) {
        return false;
    }
    for (var i = 0; i < prevPasted.length; i++) {
        if (((_j = prevPasted[i]) === null || _j === void 0 ? void 0 : _j.id) !== ((_k = nextPasted[i]) === null || _k === void 0 ? void 0 : _k.id)) {
            return false;
        }
    }
    // Compare messageTokenData - only re-render when token counts actually change
    // This is much more stable than comparing messages array reference
    if (prevProps.messageTokenData.totalInputTokens !== nextProps.messageTokenData.totalInputTokens || prevProps.messageTokenData.totalOutputTokens !== nextProps.messageTokenData.totalOutputTokens || prevProps.messageTokenData.messageCount !== nextProps.messageTokenData.messageCount) {
        return false;
    }
    // Compare changedFiles - by length and filePaths
    if (!prevProps.changedFiles || !nextProps.changedFiles) {
        return prevProps.changedFiles === nextProps.changedFiles;
    }
    if (prevProps.changedFiles.length !== nextProps.changedFiles.length) {
        return false;
    }
    for (var i = 0; i < prevProps.changedFiles.length; i++) {
        if (((_l = prevProps.changedFiles[i]) === null || _l === void 0 ? void 0 : _l.filePath) !== ((_m = nextProps.changedFiles[i]) === null || _m === void 0 ? void 0 : _m.filePath)) {
            return false;
        }
    }
    return true;
}
/**
* ChatInputArea - Isolated input component to prevent re-renders of parent
*
* This component manages its own state for:
* - hasContent (whether input has text)
* - isFocused (editor focus state)
* - isDragOver (drag/drop state)
* - Mention dropdown state (showMentionDropdown, mentionSearchText, etc.)
* - Slash command dropdown state
* - Mode dropdown state
* - Model dropdown state
*
* When user types, only this component re-renders, not the entire ChatViewInner.
*/
exports.ChatInputArea = memo(function ChatInputArea(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var editorRef = _a.editorRef, fileInputRef = _a.fileInputRef, onSend = _a.onSend, onForceSend = _a.onForceSend, onStop = _a.onStop, onCompact = _a.onCompact, onCreateNewSubChat = _a.onCreateNewSubChat, isStreaming = _a.isStreaming, isCompacting = _a.isCompacting, images = _a.images, files = _a.files, onAddAttachments = _a.onAddAttachments, onRemoveImage = _a.onRemoveImage, onRemoveFile = _a.onRemoveFile, isUploading = _a.isUploading, textContexts = _a.textContexts, onRemoveTextContext = _a.onRemoveTextContext, diffTextContexts = _a.diffTextContexts, onRemoveDiffTextContext = _a.onRemoveDiffTextContext, _f = _a.pastedTexts, pastedTexts = _f === void 0 ? [] : _f, onAddPastedText = _a.onAddPastedText, onRemovePastedText = _a.onRemovePastedText, onCacheFileContent = _a.onCacheFileContent, messageTokenData = _a.messageTokenData, subChatId = _a.subChatId, parentChatId = _a.parentChatId, teamId = _a.teamId, repository = _a.repository, sandboxId = _a.sandboxId, projectPath = _a.projectPath, changedFiles = _a.changedFiles, _g = _a.isMobile, isMobile = _g === void 0 ? false : _g, _h = _a.queueLength, queueLength = _h === void 0 ? 0 : _h, onSendFromQueue = _a.onSendFromQueue, firstQueueItemId = _a.firstQueueItemId, onInputContentChange = _a.onInputContentChange, onSubmitWithQuestionAnswer = _a.onSubmitWithQuestionAnswer;
    // Local state - changes here don't re-render parent
    var _j = (0, solid_js_1.createSignal)(false), hasContent = _j[0], setHasContent = _j[1];
    var _k = (0, solid_js_1.createSignal)(false), isFocused = _k[0], setIsFocused = _k[1];
    var _l = (0, solid_js_1.createSignal)(false), isDragOver = _l[0], setIsDragOver = _l[1];
    // Mention dropdown state
    var _m = (0, solid_js_1.createSignal)(false), showMentionDropdown = _m[0], setShowMentionDropdown = _m[1];
    var _o = (0, solid_js_1.createSignal)(""), mentionSearchText = _o[0], setMentionSearchText = _o[1];
    var _p = (0, solid_js_1.createSignal)({
        top: 0,
        left: 0
    }), mentionPosition = _p[0], setMentionPosition = _p[1];
    // Mention dropdown subpage navigation state
    var _q = (0, solid_js_1.createSignal)(false), showingFilesList = _q[0], setShowingFilesList = _q[1];
    var _r = (0, solid_js_1.createSignal)(false), showingSkillsList = _r[0], setShowingSkillsList = _r[1];
    var _s = (0, solid_js_1.createSignal)(false), showingAgentsList = _s[0], setShowingAgentsList = _s[1];
    var _t = (0, solid_js_1.createSignal)(false), showingToolsList = _t[0], setShowingToolsList = _t[1];
    // Slash command dropdown state
    var _u = (0, solid_js_1.createSignal)(false), showSlashDropdown = _u[0], setShowSlashDropdown = _u[1];
    var _v = (0, solid_js_1.createSignal)(""), slashSearchText = _v[0], setSlashSearchText = _v[1];
    var _w = (0, solid_js_1.createSignal)({
        top: 0,
        left: 0
    }), slashPosition = _w[0], setSlashPosition = _w[1];
    // Mode dropdown state
    var _x = (0, solid_js_1.createSignal)(false), modeDropdownOpen = _x[0], setModeDropdownOpen = _x[1];
    var _y = (0, solid_js_1.createSignal)(null), modeTooltip = _y[0], setModeTooltip = _y[1];
    var _z = (0, solid_js_1.createSignal)(null), tooltipTimeoutRef = _z[0], setTooltipTimeoutRef = _z[1];
    var _0 = (0, solid_js_1.createSignal)(false), hasShownTooltipRef = _0[0], setHasShownTooltipRef = _0[1];
    // Model dropdown state
    var _1 = (0, solid_js_1.createSignal)(false), isModelDropdownOpen = _1[0], setIsModelDropdownOpen = _1[1];
    var _2 = (0, jotai_1.useAtom)(atoms_2.lastSelectedModelIdAtom), lastSelectedModelId = _2[0], setLastSelectedModelId = _2[1];
    var _3 = (0, jotai_1.useAtom)(atoms_1.selectedOllamaModelAtom), selectedOllamaModel = _3[0], setSelectedOllamaModel = _3[1];
    var availableModels = useAvailableModels();
    var autoOfflineMode = (0, jotai_1.useAtomValue)(atoms_1.autoOfflineModeAtom);
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_1.showOfflineModeFeaturesAtom);
    var _4 = (0, solid_js_1.createSignal)(function () { return availableModels.models.find(function (m) { return m.id === lastSelectedModelId; }) || availableModels.models[1]; }), selectedModel = _4[0], setSelectedModel = _4[1];
    var customClaudeConfig = (0, jotai_1.useAtomValue)(atoms_1.customClaudeConfigAtom);
    var normalizedCustomClaudeConfig = (0, atoms_1.normalizeCustomClaudeConfig)(customClaudeConfig);
    var hasCustomClaudeConfig = Boolean(normalizedCustomClaudeConfig);
    // Determine current Ollama model (selected or recommended)
    var currentOllamaModel = selectedOllamaModel || availableModels.recommendedModel || availableModels.ollamaModels[0];
    // Debug: log selected Ollama model
    (0, solid_js_1.createEffect)(function () {
        if (availableModels.isOffline) {
            console.log("[Ollama UI] selectedOllamaModel atom value: ".concat(selectedOllamaModel || "(null)", ", currentOllamaModel: ").concat(currentOllamaModel));
        }
    });
    // Extended thinking (reasoning) toggle
    var _5 = (0, jotai_1.useAtom)(atoms_1.extendedThinkingEnabledAtom), thinkingEnabled = _5[0], setThinkingEnabled = _5[1];
    // Auto-switch model based on network status (only if offline features enabled)
    // Note: When offline, we show Ollama models selector instead of Claude models
    // The selectedOllamaModel atom is used to track which Ollama model is selected
    // Plan mode - per-subChat using atomFamily
    var subChatModeAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_2.subChatModeAtomFamily)(subChatId); });
    var _6 = (0, jotai_1.useAtom)(subChatModeAtom), subChatMode = _6[0], setSubChatMode = _6[1];
    // Helper to update mode (atomFamily + Zustand store sync)
    var updateMode = function (newMode) {
        setSubChatMode(newMode);
        sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatMode(subChatId, newMode);
    };
    // Toggle mode helper
    var toggleMode = function () {
        updateMode((0, atoms_2.getNextMode)(subChatMode));
    };
    // Voice input state
    var _7 = (0, use_voice_recording_1.useVoiceRecording)(), isVoiceRecording = _7.isRecording, voiceAudioLevel = _7.audioLevel, startVoiceRecording = _7.startRecording, stopVoiceRecording = _7.stopRecording, cancelVoiceRecording = _7.cancelRecording;
    var _8 = (0, solid_js_1.createSignal)(false), isTranscribing = _8[0], setIsTranscribing = _8[1];
    var _9 = (0, solid_js_1.createSignal)(true), voiceMountedRef = _9[0], setVoiceMountedRef = _9[1];
    (0, solid_js_1.createEffect)(function () {
        voiceMountedRef.current = true;
        return function () {
            voiceMountedRef.current = false;
        };
    });
    var transcribeMutation = trpc_1.trpc.voice.transcribe.useMutation();
    // Check if voice input is available (authenticated OR has OPENAI_API_KEY)
    var voiceAvailability = trpc_1.trpc.voice.isAvailable.useQuery().data;
    var isVoiceAvailable = (_b = voiceAvailability === null || voiceAvailability === void 0 ? void 0 : voiceAvailability.available) !== null && _b !== void 0 ? _b : false;
    // Get resolved voice input hotkey
    var customHotkeys = (0, jotai_1.useAtomValue)(atoms_3.customHotkeysAtom);
    var voiceInputHotkey = (0, hotkeys_1.getResolvedHotkey)("voice-input", customHotkeys);
    // Refs for draft saving
    var _10 = (0, solid_js_1.createSignal)(subChatId), currentSubChatIdRef = _10[0], setCurrentSubChatIdRef = _10[1];
    var _11 = (0, solid_js_1.createSignal)(parentChatId), currentChatIdRef = _11[0], setCurrentChatIdRef = _11[1];
    var _12 = (0, solid_js_1.createSignal)(""), currentDraftTextRef = _12[0], setCurrentDraftTextRef = _12[1];
    currentSubChatIdRef.current = subChatId;
    currentChatIdRef.current = parentChatId;
    // Keyboard shortcut: Cmd+/ to open model selector
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            if (e.metaKey && e.key === "/") {
                e.preventDefault();
                e.stopPropagation();
                if (!hasCustomClaudeConfig) {
                    setIsModelDropdownOpen(true);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        return function () { return window.removeEventListener("keydown", handleKeyDown, true); };
    });
    // Voice input handlers
    var handleVoiceMouseDown = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isStreaming || isTranscribing || isVoiceRecording)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, startVoiceRecording()];
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
    var handleVoiceMouseUp = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, base64, format, result, currentRaw, current, transcribed, needsSpace, newValue, err_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!isVoiceRecording)
                        return [2 /*return*/];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, stopVoiceRecording()];
                case 2:
                    blob = _d.sent();
                    // Don't transcribe very short recordings (likely accidental clicks)
                    if (blob.size < 1e3) {
                        console.log("[VoiceInput] Recording too short, ignoring");
                        return [2 /*return*/];
                    }
                    if (!voiceMountedRef.current)
                        return [2 /*return*/];
                    setIsTranscribing(true);
                    return [4 /*yield*/, (0, use_voice_recording_1.blobToBase64)(blob)];
                case 3:
                    base64 = _d.sent();
                    format = (0, use_voice_recording_1.getAudioFormat)(blob.type);
                    return [4 /*yield*/, transcribeMutation.mutateAsync({
                            audio: base64,
                            format: format
                        })];
                case 4:
                    result = _d.sent();
                    if (!voiceMountedRef.current)
                        return [2 /*return*/];
                    if (result.text && result.text.trim()) {
                        currentRaw = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                        current = currentRaw.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
                        transcribed = result.text.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
                        needsSpace = current.length > 0 && !/\s$/.test(current);
                        newValue = current + (needsSpace ? " " : "") + transcribed;
                        (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.setValue(newValue);
                        (_c = editorRef.current) === null || _c === void 0 ? void 0 : _c.focus();
                    }
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _d.sent();
                    console.error("[VoiceInput] Transcription failed:", err_2);
                    return [3 /*break*/, 7];
                case 6:
                    if (voiceMountedRef.current) {
                        setIsTranscribing(false);
                    }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleVoiceMouseLeave = function () {
        if (isVoiceRecording) {
            // Cancel instead of transcribing when leaving button area
            cancelVoiceRecording();
        }
    };
    // Keyboard shortcut: Voice input hotkey (push-to-talk: hold to record, release to transcribe)
    (0, solid_js_1.createEffect)(function () {
        if (!voiceInputHotkey)
            return;
        // Parse hotkey once
        var parts = voiceInputHotkey.split("+").map(function (p) { return p.toLowerCase(); });
        var modifiers = parts.filter(function (p) { return [
            "cmd",
            "meta",
            "ctrl",
            "opt",
            "alt",
            "shift"
        ].includes(p); });
        var mainKey = parts.find(function (p) { return ![
            "cmd",
            "meta",
            "ctrl",
            "opt",
            "alt",
            "shift"
        ].includes(p); });
        var needsCmd = modifiers.includes("cmd") || modifiers.includes("meta");
        var needsShift = modifiers.includes("shift");
        var needsCtrl = modifiers.includes("ctrl");
        var needsAlt = modifiers.includes("alt") || modifiers.includes("opt");
        // For modifier-only hotkeys (like ctrl+opt), we track when all modifiers are pressed
        var isModifierOnlyHotkey = !mainKey;
        var modifiersMatch = function (e) {
            return e.metaKey === needsCmd && e.shiftKey === needsShift && e.ctrlKey === needsCtrl && e.altKey === needsAlt;
        };
        var matchesHotkey = function (e) {
            if (isModifierOnlyHotkey) {
                // For modifier-only: just check if all required modifiers are pressed
                return modifiersMatch(e);
            }
            // For regular hotkey with main key
            var keyMatches = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === mainKey || e.code.toLowerCase() === "key".concat(mainKey) || mainKey === "space" && e.code === "Space";
            return keyMatches && modifiersMatch(e);
        };
        // Check if any modifier key is released
        var isModifierRelease = function (e) {
            var key = e.key.toLowerCase();
            return key === "control" || key === "alt" || key === "meta" || key === "shift";
        };
        // Check if the released key is the main key (not a modifier)
        var isMainKeyRelease = function (e) {
            if (isModifierOnlyHotkey) {
                return isModifierRelease(e);
            }
            var eventKey = e.key.toLowerCase();
            return eventKey === mainKey || e.code.toLowerCase() === mainKey || e.code.toLowerCase() === "key".concat(mainKey) || mainKey === "space" && e.code === "Space";
        };
        var handleKeyDown = function (e) {
            if (!matchesHotkey(e))
                return;
            if (e.repeat)
                return;
            e.preventDefault();
            e.stopPropagation();
            // Start recording on keydown
            if (!isVoiceRecording && !isTranscribing && !isStreaming) {
                handleVoiceMouseDown();
            }
        };
        var handleKeyUp = function (e) {
            // Stop recording when the main key (or any modifier for modifier-only hotkeys) is released
            if (!isMainKeyRelease(e))
                return;
            // Only stop if we're currently recording
            if (isVoiceRecording) {
                e.preventDefault();
                e.stopPropagation();
                handleVoiceMouseUp();
            }
        };
        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("keyup", handleKeyUp, true);
        return function () {
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keyup", handleKeyUp, true);
        };
    });
    // Save draft on blur (with attachments and text contexts)
    var handleEditorBlur = function () { return __awaiter(_this, void 0, void 0, function () {
        var draft, chatId, subChatIdValue, hasContent;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsFocused(false);
                    draft = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                    chatId = currentChatIdRef.current;
                    subChatIdValue = currentSubChatIdRef.current;
                    // Update ref for unmount save
                    currentDraftTextRef.current = draft;
                    if (!chatId)
                        return [2 /*return*/];
                    hasContent = draft.trim() || images.length > 0 || files.length > 0 || textContexts.length > 0 || ((_b = diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.length) !== null && _b !== void 0 ? _b : 0) > 0;
                    if (!hasContent) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, drafts_1.saveSubChatDraftWithAttachments)(chatId, subChatIdValue, draft, {
                            images: images,
                            files: files,
                            textContexts: textContexts
                        })];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    (0, drafts_1.clearSubChatDraft)(chatId, subChatIdValue);
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Content change handler
    var handleContentChange = function (newHasContent) {
        var _a;
        setHasContent(newHasContent);
        onInputContentChange === null || onInputContentChange === void 0 ? void 0 : onInputContentChange(newHasContent);
        // Sync the draft text ref for unmount save
        var draft = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
        currentDraftTextRef.current = draft;
    };
    // Editor submit handler - handles Enter key with queue logic
    // If input is empty and queue has items, stop stream and send first from queue
    var handleEditorSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var inputValue, hasText, hasAttachments;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    inputValue = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                    hasText = inputValue.trim().length > 0;
                    hasAttachments = images.length > 0 || files.length > 0 || textContexts.length > 0 || ((_b = diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.length) !== null && _b !== void 0 ? _b : 0) > 0;
                    if (!(!hasText && !hasAttachments && queueLength > 0 && onSendFromQueue && firstQueueItemId)) return [3 /*break*/, 2];
                    // Input empty, queue has items - stop stream and send from queue
                    return [4 /*yield*/, onStop()];
                case 1:
                    // Input empty, queue has items - stop stream and send from queue
                    _c.sent();
                    onSendFromQueue(firstQueueItemId);
                    return [3 /*break*/, 3];
                case 2:
                    onSend();
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Mention select handler
    var handleMentionSelect = function (mention) {
        var _a;
        // Category navigation - enter subpage instead of inserting mention
        if (mention.type === "category") {
            if (mention.id === "files") {
                setShowingFilesList(true);
                return;
            }
            if (mention.id === "skills") {
                setShowingSkillsList(true);
                return;
            }
            if (mention.id === "agents") {
                setShowingAgentsList(true);
                return;
            }
            if (mention.id === "tools") {
                setShowingToolsList(true);
                return;
            }
        }
        // Otherwise: insert mention as normal
        (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.insertMention(mention);
        setShowMentionDropdown(false);
        // Reset subpage state
        setShowingFilesList(false);
        setShowingSkillsList(false);
        setShowingAgentsList(false);
        setShowingToolsList(false);
    };
    // Slash command handlers
    var handleSlashTrigger = function (_a) {
        var searchText = _a.searchText, rect = _a.rect;
        setSlashSearchText(searchText);
        setSlashPosition({
            top: rect.top,
            left: rect.left
        });
        setShowSlashDropdown(true);
    };
    var handleCloseSlashTrigger = function () {
        setShowSlashDropdown(false);
    };
    var handleSlashSelect = function (command) {
        var _a, _b;
        // Clear the slash command text from editor
        (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.clearSlashCommand();
        setShowSlashDropdown(false);
        // Handle builtin commands that change app state (no text input needed)
        if (command.category === "builtin") {
            switch (command.name) {
                case "clear":
                    // Create a new sub-chat (fresh conversation)
                    if (onCreateNewSubChat) {
                        onCreateNewSubChat();
                    }
                    return;
                case "plan":
                    if (subChatMode !== "plan") {
                        updateMode("plan");
                    }
                    return;
                case "agent":
                    if (subChatMode === "plan") {
                        updateMode("agent");
                    }
                    return;
                case "compact":
                    // Trigger context compaction
                    onCompact();
                    return;
            }
        }
        // For all other commands (builtin prompts and custom):
        // insert the command and let user add arguments or press Enter to send
        (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.setValue("/".concat(command.name, " "));
    };
    // Paste handler for images, plain text, and large text (saved as files)
    var handlePaste = function (e) { return (0, paste_text_1.handlePasteEvent)(e, onAddAttachments, onAddPastedText); };
    // Drag/drop handlers
    var handleDragOver = function (e) {
        e.preventDefault();
        setIsDragOver(true);
    };
    var handleDragLeave = function (e) {
        e.preventDefault();
        setIsDragOver(false);
    };
    // Text file extensions that should have content read and attached
    var TEXT_FILE_EXTENSIONS = new Set([
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".py",
        ".rb",
        ".go",
        ".rs",
        ".java",
        ".kt",
        ".swift",
        ".c",
        ".cpp",
        ".h",
        ".hpp",
        ".cs",
        ".php",
        ".lua",
        ".r",
        ".m",
        ".mm",
        ".scala",
        ".clj",
        ".ex",
        ".exs",
        ".hs",
        ".elm",
        ".erl",
        ".fs",
        ".fsx",
        ".ml",
        ".v",
        ".vhdl",
        ".zig",
        ".json",
        ".yaml",
        ".yml",
        ".toml",
        ".xml",
        ".ini",
        ".env",
        ".conf",
        ".cfg",
        ".properties",
        ".plist",
        ".html",
        ".htm",
        ".css",
        ".scss",
        ".sass",
        ".less",
        ".vue",
        ".svelte",
        ".astro",
        ".md",
        ".mdx",
        ".rst",
        ".txt",
        ".text",
        ".svg",
        ".sh",
        ".bash",
        ".zsh",
        ".fish",
        ".ps1",
        ".bat",
        ".cmd",
        ".sql",
        ".graphql",
        ".gql",
        ".prisma",
        ".dockerfile",
        ".makefile",
        ".gitignore",
        ".gitattributes",
        ".editorconfig",
        ".eslintrc",
        ".prettierrc"
    ]);
    var MAX_FILE_SIZE_FOR_CONTENT = 100 * 1024;
    // Image extensions that should be handled as attachments (base64)
    var IMAGE_EXTENSIONS = new Set([
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".bmp"
    ]);
    var trpcUtils = trpc_1.trpc.useUtils();
    var handleDrop = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var droppedFiles, imageFiles, otherFiles, _i, droppedFiles_1, file, ext, _a, otherFiles_1, file, filePath, mentionId, mentionPath, relativePath, fileName, ext, hasExtension, isTextFile, isSmallEnough, content, err_3;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    e.preventDefault();
                    setIsDragOver(false);
                    droppedFiles = Array.from(e.dataTransfer.files);
                    imageFiles = [];
                    otherFiles = [];
                    for (_i = 0, droppedFiles_1 = droppedFiles; _i < droppedFiles_1.length; _i++) {
                        file = droppedFiles_1[_i];
                        ext = file.name.includes(".") ? "." + ((_b = file.name.split(".").pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase()) : "";
                        if (IMAGE_EXTENSIONS.has(ext)) {
                            imageFiles.push(file);
                        }
                        else {
                            otherFiles.push(file);
                        }
                    }
                    // Handle images via existing attachment system (base64)
                    if (imageFiles.length > 0) {
                        onAddAttachments(imageFiles);
                    }
                    _a = 0, otherFiles_1 = otherFiles;
                    _h.label = 1;
                case 1:
                    if (!(_a < otherFiles_1.length)) return [3 /*break*/, 8];
                    file = otherFiles_1[_a];
                    filePath = ((_d = (_c = window.webUtils) === null || _c === void 0 ? void 0 : _c.getPathForFile) === null || _d === void 0 ? void 0 : _d.call(_c, file)) || file.path;
                    mentionId = void 0;
                    mentionPath = void 0;
                    if (projectPath && filePath && filePath.startsWith(projectPath)) {
                        relativePath = filePath.slice(projectPath.length).replace(/^\//, "");
                        mentionId = "file:local:".concat(relativePath);
                        mentionPath = relativePath;
                    }
                    else if (filePath) {
                        // External file - use absolute path
                        mentionId = "file:external:".concat(filePath);
                        mentionPath = filePath;
                    }
                    else {
                        // No path available (shouldn't happen in Electron) - use filename
                        mentionId = "file:external:".concat(file.name);
                        mentionPath = file.name;
                    }
                    fileName = file.name;
                    ext = fileName.includes(".") ? "." + ((_e = fileName.split(".").pop()) === null || _e === void 0 ? void 0 : _e.toLowerCase()) : "";
                    hasExtension = ext !== "";
                    isTextFile = hasExtension && TEXT_FILE_EXTENSIONS.has(ext);
                    isSmallEnough = file.size <= MAX_FILE_SIZE_FOR_CONTENT;
                    if (!(isTextFile && isSmallEnough && filePath)) return [3 /*break*/, 6];
                    // Add file chip for visual representation
                    (_f = editorRef.current) === null || _f === void 0 ? void 0 : _f.insertMention({
                        id: mentionId,
                        label: fileName,
                        path: mentionPath,
                        repository: "local",
                        type: "file"
                    });
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, trpcUtils.files.readFile.fetch({ filePath: filePath })];
                case 3:
                    content = _h.sent();
                    onCacheFileContent === null || onCacheFileContent === void 0 ? void 0 : onCacheFileContent(mentionId, content);
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _h.sent();
                    // If reading fails, chip is still there - agent can try to read via path
                    console.error("[handleDrop] Failed to read file content ".concat(filePath, ":"), err_3);
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    // For binary files, large files - add as mention only
                    // mentionPath contains full absolute path for external files
                    (_g = editorRef.current) === null || _g === void 0 ? void 0 : _g.insertMention({
                        id: mentionId,
                        label: fileName,
                        path: mentionPath,
                        repository: "local",
                        type: "file"
                    });
                    _h.label = 7;
                case 7:
                    _a++;
                    return [3 /*break*/, 1];
                case 8:
                    // Focus after state update - use double rAF to wait for React render
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            var _a;
                            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    return <div class="px-2 pb-2 shadow-sm shadow-background relative z-10">
      <div class="w-full max-w-2xl mx-auto">
        <div class="relative w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div class="relative w-full cursor-text" onClick={function () { var _a; return (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }}>
            <prompt_input_1.PromptInput class={(0, utils_1.cn)("border bg-input-background relative z-10 p-2 rounded-xl transition-[border-color,box-shadow] duration-150", isDragOver && "ring-2 ring-primary/50 border-primary/50", isFocused && !isDragOver && "ring-2 ring-primary/50")} maxHeight={200} onSubmit={onSend} contextItems={images.length > 0 || files.length > 0 || textContexts.length > 0 || ((_c = diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.length) !== null && _c !== void 0 ? _c : 0) > 0 || pastedTexts.length > 0 ? <div class="flex flex-wrap gap-[6px]">
                    {(function () {
                // Build allImages array for gallery navigation
                var allImages = images.filter(function (img) { return !!img.url && !img.isLoading; }).map(function (img) { return ({
                    id: img.id,
                    filename: img.filename,
                    url: img.url
                }); });
                return images.map(function (img, idx) { return <agent_image_item_1.AgentImageItem key={img.id} id={img.id} filename={img.filename} url={img.url || ""} isLoading={img.isLoading} onRemove={function () { return onRemoveImage(img.id); }} allImages={allImages} imageIndex={idx}/>; });
            })()}
                    {files.map(function (f) { return <agent_file_item_1.AgentFileItem key={f.id} id={f.id} filename={f.filename} url={f.url || ""} size={f.size} isLoading={f.isLoading} onRemove={function () { return onRemoveFile(f.id); }}/>; })}
                    {textContexts.map(function (tc) { return <agent_text_context_item_1.AgentTextContextItem key={tc.id} text={tc.text} preview={tc.preview} onRemove={function () { return onRemoveTextContext(tc.id); }}/>; })}
                    {diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.map(function (dtc) { return <agent_diff_text_context_item_1.AgentDiffTextContextItem key={dtc.id} text={dtc.text} preview={dtc.preview} filePath={dtc.filePath} lineNumber={dtc.lineNumber} lineType={dtc.lineType} onRemove={onRemoveDiffTextContext ? function () { return onRemoveDiffTextContext(dtc.id); } : undefined}/>; })}
                    {pastedTexts.map(function (pt) { return <agent_pasted_text_item_1.AgentPastedTextItem key={pt.id} filePath={pt.filePath} filename={pt.filename} size={pt.size} preview={pt.preview} onRemove={onRemovePastedText ? function () { return onRemovePastedText(pt.id); } : undefined}/>; })}
                  </div> : null}>
              <prompt_input_1.PromptInputContextItems />
              <div class="relative">
                <mentions_1.AgentsMentionsEditor ref={editorRef} onTrigger={function (_a) {
            var searchText = _a.searchText, rect = _a.rect;
            // Desktop: use projectPath for local file search
            if (projectPath || repository) {
                setMentionSearchText(searchText);
                setMentionPosition({
                    top: rect.top,
                    left: rect.left
                });
                setShowMentionDropdown(true);
            }
        }} onCloseTrigger={function () {
            setShowMentionDropdown(false);
            // Reset subpage state when closing
            setShowingFilesList(false);
            setShowingSkillsList(false);
            setShowingAgentsList(false);
            setShowingToolsList(false);
        }} onSlashTrigger={handleSlashTrigger} onCloseSlashTrigger={handleCloseSlashTrigger} onContentChange={handleContentChange} onSubmit={onSubmitWithQuestionAnswer || handleEditorSubmit} onForceSubmit={onForceSend} onShiftTab={toggleMode} placeholder={isStreaming ? "Add to the queue" : "Plan, @ for context, / for commands"} class={(0, utils_1.cn)("bg-transparent max-h-[200px] overflow-y-auto p-1", isMobile && "min-h-[56px]")} onPaste={handlePaste} onFocus={function () { return setIsFocused(true); }} onBlur={handleEditorBlur}/>
              </div>
              <prompt_input_1.PromptInputActions class="w-full">
                <div class="flex items-center gap-0.5 flex-1 min-w-0">
                  {/* Mode toggle (Agent/Plan) */}
                  <dropdown_menu_1.DropdownMenu open={modeDropdownOpen} onOpenChange={function (open) {
            setModeDropdownOpen(open);
            if (!open) {
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                }
                setModeTooltip(null);
                hasShownTooltipRef.current = false;
            }
        }}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                      <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
                        {subChatMode === "plan" ? <icons_1.PlanIcon class="h-3.5 w-3.5 shrink-0"/> : <icons_1.AgentIcon class="h-3.5 w-3.5 shrink-0"/>}
                        <span class="truncate">{subChatMode === "plan" ? "Plan" : "Agent"}</span>
                        <lucide_solid_1.ChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                      </button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="start" sideOffset={6} class="!min-w-[116px] !w-[116px]" onCloseAutoFocus={function (e) { return e.preventDefault(); }}>
                      <dropdown_menu_1.DropdownMenuItem onClick={function () {
            // Clear tooltip before closing dropdown (onMouseLeave won't fire)
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            setModeTooltip(null);
            updateMode("agent");
            setModeDropdownOpen(false);
        }} class="justify-between gap-2" onMouseEnter={function (e) {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            var rect = e.currentTarget.getBoundingClientRect();
            var showTooltip = function () {
                setModeTooltip({
                    visible: true,
                    position: {
                        top: rect.top,
                        left: rect.right + 8
                    },
                    mode: "agent"
                });
                hasShownTooltipRef.current = true;
                tooltipTimeoutRef.current = null;
            };
            if (hasShownTooltipRef.current) {
                showTooltip();
            }
            else {
                tooltipTimeoutRef.current = setTimeout(showTooltip, 1e3);
            }
        }} onMouseLeave={function () {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            setModeTooltip(null);
        }}>
                        <div class="flex items-center gap-2">
                          <icons_1.AgentIcon class="w-4 h-4 text-muted-foreground"/>
                          <span>Agent</span>
                        </div>
                        {subChatMode !== "plan" && <icons_1.CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0"/>}
                      </dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuItem onClick={function () {
            // Clear tooltip before closing dropdown (onMouseLeave won't fire)
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            setModeTooltip(null);
            updateMode("plan");
            setModeDropdownOpen(false);
        }} class="justify-between gap-2" onMouseEnter={function (e) {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            var rect = e.currentTarget.getBoundingClientRect();
            var showTooltip = function () {
                setModeTooltip({
                    visible: true,
                    position: {
                        top: rect.top,
                        left: rect.right + 8
                    },
                    mode: "plan"
                });
                hasShownTooltipRef.current = true;
                tooltipTimeoutRef.current = null;
            };
            if (hasShownTooltipRef.current) {
                showTooltip();
            }
            else {
                tooltipTimeoutRef.current = setTimeout(showTooltip, 1e3);
            }
        }} onMouseLeave={function () {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
            setModeTooltip(null);
        }}>
                        <div class="flex items-center gap-2">
                          <icons_1.PlanIcon class="w-4 h-4 text-muted-foreground"/>
                          <span>Plan</span>
                        </div>
                        {subChatMode === "plan" && <icons_1.CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0"/>}
                      </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                    {(modeTooltip === null || modeTooltip === void 0 ? void 0 : modeTooltip.visible) && (0, web_1.createPortal)(<div class="fixed z-[100000]" style={{
                top: modeTooltip.position.top + 14,
                left: modeTooltip.position.left,
                transform: "translateY(-50%)"
            }}>
                          <div data-tooltip="true" class="relative rounded-[12px] bg-popover px-2.5 py-1.5 text-xs text-popover-foreground dark max-w-[150px]">
                            <span>
                              {modeTooltip.mode === "agent" ? "Apply changes directly without a plan" : "Create a plan before making changes"}
                            </span>
                          </div>
                        </div>, document.body)}
                  </dropdown_menu_1.DropdownMenu>

                  {/* Model selector - shows Ollama models when offline, Claude models when online */}
                  {availableModels.isOffline && availableModels.hasOllama ? <dropdown_menu_1.DropdownMenu open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 border border-border">
                          <lucide_solid_1.Zap class="h-4 w-4 shrink-0"/>
                          <span class="truncate">{currentOllamaModel || "Select model"}</span>
                          <lucide_solid_1.ChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                        </button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="start" class="w-[240px]">
                        {availableModels.ollamaModels.map(function (model) {
                var isSelected = model === currentOllamaModel;
                var isRecommended = model === availableModels.recommendedModel;
                return <dropdown_menu_1.DropdownMenuItem key={model} onClick={function () {
                        console.log("[Ollama UI] Setting selected model: ".concat(model));
                        setSelectedOllamaModel(model);
                    }} class="gap-2 justify-between">
                              <div class="flex items-center gap-1.5">
                                <lucide_solid_1.Zap class="h-4 w-4 text-muted-foreground shrink-0"/>
                                <span>
                                  {model}
                                  {isRecommended && <span class="text-muted-foreground ml-1">(recommended)</span>}
                                </span>
                              </div>
                              {isSelected && <icons_1.CheckIcon class="h-3.5 w-3.5 shrink-0"/>}
                            </dropdown_menu_1.DropdownMenuItem>;
            })}
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu> : <dropdown_menu_1.DropdownMenu open={hasCustomClaudeConfig ? false : isModelDropdownOpen} onOpenChange={function (open) {
                if (!hasCustomClaudeConfig) {
                    setIsModelDropdownOpen(open);
                }
            }}>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button disabled={hasCustomClaudeConfig} class={(0, utils_1.cn)("flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground transition-colors rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", hasCustomClaudeConfig ? "opacity-70 cursor-not-allowed" : "hover:text-foreground hover:bg-muted/50")}>
                          <icons_1.ClaudeCodeIcon class="h-3.5 w-3.5 shrink-0"/>
                          <span class="truncate">
                            {hasCustomClaudeConfig ? "Custom Model" : <>
                                {selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.name}{" "}
                                <span class="text-muted-foreground">4.5</span>
                              </>}
                          </span>
                          <lucide_solid_1.ChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                        </button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="start" class="w-[200px]">
                        {availableModels.models.map(function (model) {
                var isSelected = (selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.id) === model.id;
                return <dropdown_menu_1.DropdownMenuItem key={model.id} onClick={function () {
                        setSelectedModel(model);
                        setLastSelectedModelId(model.id);
                    }} class="gap-2 justify-between">
                              <div class="flex items-center gap-1.5">
                                <icons_1.ClaudeCodeIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                                <span>
                                  {model.name}{" "}
                                  <span class="text-muted-foreground">4.5</span>
                                </span>
                              </div>
                              {isSelected && <icons_1.CheckIcon class="h-3.5 w-3.5 shrink-0"/>}
                            </dropdown_menu_1.DropdownMenuItem>;
            })}
                        <dropdown_menu_1.DropdownMenuSeparator />
                        <div class="flex items-center justify-between px-1.5 py-1.5 mx-1" onClick={function (e) { return e.stopPropagation(); }}>
                          <div class="flex items-center gap-1.5">
                            <icons_1.ThinkingIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                            <span class="text-sm">Thinking</span>
                          </div>
                          <switch_1.Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} class="scale-75"/>
                        </div>
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>}
                </div>

                <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                  {/* Hidden file input - accepts images and text/code files */}
                  <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,.txt,.md,.markdown,.json,.yaml,.yml,.xml,.csv,.tsv,.log,.ini,.cfg,.conf,.js,.ts,.jsx,.tsx,.py,.rb,.go,.rs,.java,.kt,.swift,.c,.cpp,.h,.hpp,.cs,.php,.html,.css,.scss,.sass,.less,.sql,.sh,.bash,.zsh,.ps1,.bat,.env,.gitignore,.dockerignore,.editorconfig,.prettierrc,.eslintrc,.babelrc,.nvmrc,.pdf" multiple onChange={function (e) {
            var inputFiles = Array.from(e.target.files || []);
            onAddAttachments(inputFiles);
            e.target.value = "";
        }}/>

                  {/* Voice wave indicator - shown during recording */}
                  {isVoiceRecording ? <voice_wave_indicator_1.VoiceWaveIndicator isRecording={isVoiceRecording} audioLevel={voiceAudioLevel}/> : <>
                      {/* Context window indicator - click to compact */}
                      <agent_context_indicator_1.AgentContextIndicator tokenData={messageTokenData} onCompact={onCompact} isCompacting={isCompacting} disabled={isStreaming}/>

                      {/* Attachment button */}
                      <button_1.Button variant="ghost" size="icon" class="h-7 w-7 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={images.length >= 5 && files.length >= 10}>
                        <icons_1.AttachIcon class="h-4 w-4"/>
                      </button_1.Button>
                    </>}

                  {/* Send/Stop/Voice button */}
                  <div class="ml-1">
                    <agent_send_button_1.AgentSendButton isStreaming={isStreaming} isSubmitting={false} disabled={!hasContent && images.length === 0 && files.length === 0 && textContexts.length === 0 && ((_d = diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.length) !== null && _d !== void 0 ? _d : 0) === 0 && queueLength === 0 || isUploading} hasContent={hasContent || images.length > 0 || files.length > 0 || textContexts.length > 0 || ((_e = diffTextContexts === null || diffTextContexts === void 0 ? void 0 : diffTextContexts.length) !== null && _e !== void 0 ? _e : 0) > 0} onClick={function () {
            // If input is empty and queue has items, send first queue item
            if (!hasContent && images.length === 0 && files.length === 0 && queueLength > 0 && onSendFromQueue && firstQueueItemId) {
                onSendFromQueue(firstQueueItemId);
            }
            else {
                onSend();
            }
        }} onStop={onStop} mode={subChatMode} showVoiceInput={isVoiceAvailable} isRecording={isVoiceRecording} isTranscribing={isTranscribing} onVoiceMouseDown={handleVoiceMouseDown} onVoiceMouseUp={handleVoiceMouseUp} onVoiceMouseLeave={handleVoiceMouseLeave}/>
                  </div>
                </div>
              </prompt_input_1.PromptInputActions>
            </prompt_input_1.PromptInput>
          </div>
        </div>
      </div>

      {/* File mention dropdown */}
      {/* Desktop: use projectPath for local file search */}
      <mentions_1.AgentsFileMention isOpen={showMentionDropdown && (!!projectPath || !!repository || !!sandboxId)} onClose={function () {
            setShowMentionDropdown(false);
            // Reset subpage state when closing
            setShowingFilesList(false);
            setShowingSkillsList(false);
            setShowingAgentsList(false);
            setShowingToolsList(false);
        }} onSelect={handleMentionSelect} searchText={mentionSearchText} position={mentionPosition} teamId={teamId} repository={repository} sandboxId={sandboxId} projectPath={projectPath} changedFiles={changedFiles} showingFilesList={showingFilesList} showingSkillsList={showingSkillsList} showingAgentsList={showingAgentsList} showingToolsList={showingToolsList}/>

      {/* Slash command dropdown */}
      <commands_1.AgentsSlashCommand isOpen={showSlashDropdown} onClose={handleCloseSlashTrigger} onSelect={handleSlashSelect} searchText={slashSearchText} position={slashPosition} projectPath={projectPath} mode={subChatMode}/>
    </div>;
}, arePropsEqual);
