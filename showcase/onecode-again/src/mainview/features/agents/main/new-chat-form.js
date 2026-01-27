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
exports.NewChatForm = NewChatForm;
var react_virtual_1 = require("@tanstack/react-virtual");
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var web_1 = require("solid-js/web");
var button_1 = require("../../../components/ui/button");
var dropdown_menu_1 = require("../../../components/ui/dropdown-menu");
var icons_1 = require("../../../components/ui/icons");
var popover_1 = require("../../../components/ui/popover");
var utils_1 = require("../../../lib/utils");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
var project_selector_1 = require("../components/project-selector");
var work_mode_selector_1 = require("../components/work-mode-selector");
var selectedTeamIdAtom = (0, solid_js_1.createSignal)(null);
var atoms_3 = require("../../../lib/atoms");
// Desktop uses real tRPC
var solid_sonner_1 = require("solid-sonner");
var trpc_1 = require("../../../lib/trpc");
var commands_1 = require("../commands");
var use_agents_file_upload_1 = require("../hooks/use-agents-file-upload");
var use_pasted_text_files_1 = require("../hooks/use-pasted-text-files");
var use_focus_input_on_enter_1 = require("../hooks/use-focus-input-on-enter");
var use_toggle_focus_on_cmd_esc_1 = require("../hooks/use-toggle-focus-on-cmd-esc");
var use_voice_recording_1 = require("../../../lib/hooks/use-voice-recording");
var hotkeys_1 = require("../../../lib/hotkeys");
var mentions_1 = require("../mentions");
var agent_image_item_1 = require("../ui/agent-image-item");
var agent_pasted_text_item_1 = require("../ui/agent-pasted-text-item");
var agents_header_controls_1 = require("../ui/agents-header-controls");
var voice_wave_indicator_1 = require("../ui/voice-wave-indicator");
// import { CreateBranchDialog } from "@/app/(alpha)/agents/{components}/create-branch-dialog"
var prompt_input_1 = require("../../../components/ui/prompt-input");
var atoms_4 = require("../atoms");
var agent_send_button_1 = require("../components/agent-send-button");
var create_branch_dialog_1 = require("../components/create-branch-dialog");
var format_time_ago_1 = require("../utils/format-time-ago");
var paste_text_1 = require("../utils/paste-text");
var drafts_1 = require("../lib/drafts");
var models_1 = require("../lib/models");
// Codex icon (OpenAI style)
var CodexIcon = function (props) { return <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>; };
// Hook to get available models (including offline models if Ollama is available and debug enabled)
function useAvailableModels() {
    var _a, _b;
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_3.showOfflineModeFeaturesAtom);
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
function NewChatForm(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f;
    var _g = _a === void 0 ? {} : _a, _h = _g.isMobileFullscreen, isMobileFullscreen = _h === void 0 ? false : _h, onBackToChats = _g.onBackToChats;
    // UNCONTROLLED: just track if editor has content for send button
    var _j = (0, solid_js_1.createSignal)(false), hasContent = _j[0], setHasContent = _j[1];
    var selectedTeamId = (0, jotai_1.useAtom)(selectedTeamIdAtom)[0];
    var _k = (0, jotai_1.useAtom)(atoms_1.selectedAgentChatIdAtom), selectedChatId = _k[0], setSelectedChatId = _k[1];
    var setSelectedChatIsRemote = (0, jotai_1.useSetAtom)(atoms_1.selectedChatIsRemoteAtom);
    var setChatSourceMode = (0, jotai_1.useSetAtom)(atoms_3.chatSourceModeAtom);
    var _l = (0, jotai_1.useAtom)(atoms_1.selectedDraftIdAtom), selectedDraftId = _l[0], setSelectedDraftId = _l[1];
    var _m = (0, jotai_1.useAtom)(atoms_4.agentsSidebarOpenAtom), sidebarOpen = _m[0], setSidebarOpen = _m[1];
    // Current draft ID being edited (generated when user starts typing in empty form)
    var _o = (0, solid_js_1.createSignal)(null), currentDraftIdRef = _o[0], setCurrentDraftIdRef = _o[1];
    var unseenChanges = (0, jotai_1.useAtomValue)(atoms_4.agentsUnseenChangesAtom);
    // Check if any chat has unseen changes
    var hasAnyUnseenChanges = unseenChanges().size > 0;
    var _p = (0, jotai_1.useAtom)(atoms_1.lastSelectedRepoAtom), lastSelectedRepo = _p[0], setLastSelectedRepo = _p[1];
    var _q = (0, jotai_1.useAtom)(atoms_1.selectedProjectAtom), selectedProject = _q[0], setSelectedProject = _q[1];
    // Fetch projects to validate selectedProject exists
    var _r = trpc_1.trpc.projects.list.useQuery(), projectsList = _r.data, isLoadingProjects = _r.isLoading;
    // Validate selected project exists in DB
    // While loading, trust the stored value to prevent flicker
    var validatedProject = (0, solid_js_1.createMemo)(function () {
        if (!selectedProject)
            return null;
        // While loading, trust localStorage value to prevent flicker
        if (isLoadingProjects)
            return selectedProject;
        // After loading, validate against DB
        if (!projectsList)
            return null;
        var exists = projectsList.some(function (p) { return p.id === selectedProject.id; });
        return exists ? selectedProject : null;
    });
    // Clear invalid project from storage
    (0, solid_js_1.createEffect)(function () {
        if (selectedProject && projectsList && !validatedProject) {
            setSelectedProject(null);
        }
    });
    var _s = (0, jotai_1.useAtom)(atoms_1.lastSelectedAgentIdAtom), lastSelectedAgentId = _s[0], setLastSelectedAgentId = _s[1];
    var _t = (0, jotai_1.useAtom)(atoms_1.lastSelectedModelIdAtom), lastSelectedModelId = _t[0], setLastSelectedModelId = _t[1];
    // Mode for new chat - uses user's default preference directly
    // Note: defaultAgentMode is initialized synchronously via atomWithStorage with getOnInit: true
    var defaultAgentMode = (0, jotai_1.useAtomValue)(atoms_2.defaultAgentModeAtom);
    var _u = (0, solid_js_1.createSignal)(function () { return defaultAgentMode; }), agentMode = _u[0], setAgentMode = _u[1];
    // Toggle mode helper
    var toggleMode = function () {
        setAgentMode(atoms_1.getNextMode);
    };
    var _v = (0, jotai_1.useAtom)(atoms_1.lastSelectedWorkModeAtom), workMode = _v[0], setWorkMode = _v[1];
    var debugMode = (0, jotai_1.useAtomValue)(atoms_1.agentsDebugModeAtom);
    var customClaudeConfig = (0, jotai_1.useAtomValue)(atoms_3.customClaudeConfigAtom);
    var normalizedCustomClaudeConfig = (0, atoms_3.normalizeCustomClaudeConfig)(customClaudeConfig);
    var hasCustomClaudeConfig = Boolean(normalizedCustomClaudeConfig);
    var setSettingsDialogOpen = (0, jotai_1.useSetAtom)(atoms_3.agentsSettingsDialogOpenAtom);
    var setSettingsActiveTab = (0, jotai_1.useSetAtom)(atoms_3.agentsSettingsDialogActiveTabAtom);
    var justCreatedIds = (0, jotai_1.useAtomValue)(atoms_1.justCreatedIdsAtom);
    var _w = (0, solid_js_1.createSignal)(""), repoSearchQuery = _w[0], setRepoSearchQuery = _w[1];
    var _x = (0, solid_js_1.createSignal)(false), createBranchDialogOpen = _x[0], setCreateBranchDialogOpen = _x[1];
    // Worktree config banner state
    var _y = (0, solid_js_1.createSignal)(function () {
        try {
            return localStorage.getItem("worktree-banner-dismissed") === "true";
        }
        catch (_a) {
            return false;
        }
    }), worktreeBannerDismissed = _y[0], setWorktreeBannerDismissed = _y[1];
    // Check if project has worktree config
    var worktreeConfigData = trpc_1.trpc.worktreeConfig.get.useQuery({ projectId: (_b = validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) !== null && _b !== void 0 ? _b : "" }, { enabled: !!(validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) && workMode === "worktree" && !worktreeBannerDismissed }).data;
    var showWorktreeBanner = workMode === "worktree" && validatedProject && !worktreeBannerDismissed && worktreeConfigData && !worktreeConfigData.config;
    var handleDismissWorktreeBanner = function () {
        setWorktreeBannerDismissed(true);
        try {
            localStorage.setItem("worktree-banner-dismissed", "true");
        }
        catch (_a) { }
    };
    var handleConfigureWorktree = function () {
        // Open the project-specific worktree settings tab
        if (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) {
            setSettingsActiveTab("project-".concat(validatedProject.id));
            setSettingsDialogOpen(true);
        }
    };
    // Parse owner/repo from GitHub URL
    var parseGitHubUrl = function (url) {
        var match = url.match(/(?:github\.com\/)?([^\/]+)\/([^\/\s#?]+)/);
        if (!match)
            return null;
        return "".concat(match[1], "/").concat(match[2].replace(/\.git$/, ""));
    };
    var _z = (0, solid_js_1.createSignal)(function () { return agents.find(function (a) { return a.id === lastSelectedAgentId; }) || agents[0]; }), selectedAgent = _z[0], setSelectedAgent = _z[1];
    // Get available models (with offline support)
    var availableModels = useAvailableModels();
    var _0 = (0, jotai_1.useAtom)(atoms_3.selectedOllamaModelAtom), selectedOllamaModel = _0[0], setSelectedOllamaModel = _0[1];
    var _1 = (0, solid_js_1.createSignal)(function () { return availableModels.models.find(function (m) { return m.id === lastSelectedModelId; }) || availableModels.models[1]; }), selectedModel = _1[0], setSelectedModel = _1[1];
    // Determine current Ollama model (selected or recommended)
    var currentOllamaModel = selectedOllamaModel || availableModels.recommendedModel || availableModels.ollamaModels[0];
    var _2 = (0, solid_js_1.createSignal)(false), repoPopoverOpen = _2[0], setRepoPopoverOpen = _2[1];
    var _3 = (0, solid_js_1.createSignal)(false), branchPopoverOpen = _3[0], setBranchPopoverOpen = _3[1];
    var _4 = (0, jotai_1.useAtom)(atoms_1.lastSelectedBranchesAtom), lastSelectedBranches = _4[0], setLastSelectedBranches = _4[1];
    var _5 = (0, solid_js_1.createSignal)(""), branchSearch = _5[0], setBranchSearch = _5[1];
    var _6 = (0, solid_js_1.createSignal)(undefined), selectedBranchType = _6[0], setSelectedBranchType = _6[1];
    // Get/set selected branch for current project (persisted per project)
    var selectedBranch = (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) ? ((_c = lastSelectedBranches[validatedProject.id]) === null || _c === void 0 ? void 0 : _c.name) || "" : "";
    var setSelectedBranch = function (branch, type) {
        if ((validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) && type) {
            setLastSelectedBranches(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[validatedProject.id] = {
                    name: branch,
                    type: type
                }, _a)));
            });
            setSelectedBranchType(type);
        }
    };
    var _7 = (0, solid_js_1.createSignal)(null), branchListRef = _7[0], setBranchListRef = _7[1];
    var _8 = (0, solid_js_1.createSignal)(null), editorRef = _8[0], setEditorRef = _8[1];
    var _9 = (0, solid_js_1.createSignal)(null), fileInputRef = _9[0], setFileInputRef = _9[1];
    // Restore selectedBranchType from persisted storage when project changes
    (0, solid_js_1.createEffect)(function () {
        if (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) {
            var stored = lastSelectedBranches[validatedProject.id];
            if (stored === null || stored === void 0 ? void 0 : stored.type) {
                setSelectedBranchType(stored.type);
            }
            else {
                setSelectedBranchType(undefined);
            }
        }
        else {
            setSelectedBranchType(undefined);
        }
    });
    // Image upload hook
    var _10 = (0, use_agents_file_upload_1.useAgentsFileUpload)(), images = _10.images, handleAddAttachments = _10.handleAddAttachments, removeImage = _10.removeImage, clearImages = _10.clearImages, isUploading = _10.isUploading;
    // Pasted text files - use a stable temp ID for new chat
    var _11 = (0, solid_js_1.createSignal)("new-chat-".concat(Date.now())), tempPastedIdRef = _11[0], setTempPastedIdRef = _11[1];
    var _12 = (0, use_pasted_text_files_1.usePastedTextFiles)(tempPastedIdRef.current), pastedTexts = _12.pastedTexts, addPastedText = _12.addPastedText, removePastedText = _12.removePastedText, clearPastedTexts = _12.clearPastedTexts;
    // File contents cache - stores content for file mentions (keyed by mentionId)
    // This content gets added to the prompt when sending, without showing a separate card
    var _13 = (0, solid_js_1.createSignal)(new Map()), fileContentsRef = _13[0], setFileContentsRef = _13[1];
    // Mention dropdown state
    var _14 = (0, solid_js_1.createSignal)(false), showMentionDropdown = _14[0], setShowMentionDropdown = _14[1];
    var _15 = (0, solid_js_1.createSignal)(""), mentionSearchText = _15[0], setMentionSearchText = _15[1];
    var _16 = (0, solid_js_1.createSignal)({
        top: 0,
        left: 0
    }), mentionPosition = _16[0], setMentionPosition = _16[1];
    // Mention subpage navigation state
    var _17 = (0, solid_js_1.createSignal)(false), showingFilesList = _17[0], setShowingFilesList = _17[1];
    var _18 = (0, solid_js_1.createSignal)(false), showingSkillsList = _18[0], setShowingSkillsList = _18[1];
    var _19 = (0, solid_js_1.createSignal)(false), showingAgentsList = _19[0], setShowingAgentsList = _19[1];
    var _20 = (0, solid_js_1.createSignal)(false), showingToolsList = _20[0], setShowingToolsList = _20[1];
    // Slash command dropdown state
    var _21 = (0, solid_js_1.createSignal)(false), showSlashDropdown = _21[0], setShowSlashDropdown = _21[1];
    var _22 = (0, solid_js_1.createSignal)(""), slashSearchText = _22[0], setSlashSearchText = _22[1];
    var _23 = (0, solid_js_1.createSignal)({
        top: 0,
        left: 0
    }), slashPosition = _23[0], setSlashPosition = _23[1];
    // Mode tooltip state (floating tooltip like canvas)
    var _24 = (0, solid_js_1.createSignal)(null), modeTooltip = _24[0], setModeTooltip = _24[1];
    var _25 = (0, solid_js_1.createSignal)(null), tooltipTimeoutRef = _25[0], setTooltipTimeoutRef = _25[1];
    var _26 = (0, solid_js_1.createSignal)(false), hasShownTooltipRef = _26[0], setHasShownTooltipRef = _26[1];
    var _27 = (0, solid_js_1.createSignal)(false), modeDropdownOpen = _27[0], setModeDropdownOpen = _27[1];
    var _28 = (0, solid_js_1.createSignal)(false), isModelDropdownOpen = _28[0], setIsModelDropdownOpen = _28[1];
    // Voice input state
    var customHotkeys = (0, jotai_1.useAtomValue)(atoms_3.customHotkeysAtom);
    var _29 = (0, use_voice_recording_1.useVoiceRecording)(), isVoiceRecording = _29.isRecording, voiceAudioLevel = _29.audioLevel, startRecording = _29.startRecording, stopRecording = _29.stopRecording, cancelRecording = _29.cancelRecording;
    var _30 = (0, solid_js_1.createSignal)(false), isTranscribing = _30[0], setIsTranscribing = _30[1];
    var transcribeMutation = trpc_1.trpc.voice.transcribe.useMutation();
    // Check if voice input is available (authenticated OR has OPENAI_API_KEY)
    var voiceAvailability = trpc_1.trpc.voice.isAvailable.useQuery().data;
    var isVoiceAvailable = (_d = voiceAvailability === null || voiceAvailability === void 0 ? void 0 : voiceAvailability.available) !== null && _d !== void 0 ? _d : false;
    // Voice input handlers
    var handleVoiceMouseDown = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isUploading || isTranscribing || isVoiceRecording)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, startRecording()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("[NewChatForm] Failed to start recording:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleVoiceMouseUp = function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, base64, format, result, currentValue, transcribed, needsSpace, newValue, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!isVoiceRecording)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, stopRecording()];
                case 2:
                    blob = _c.sent();
                    if (blob.size < 1e3) {
                        console.log("[NewChatForm] Recording too short, ignoring");
                        return [2 /*return*/];
                    }
                    setIsTranscribing(true);
                    return [4 /*yield*/, (0, use_voice_recording_1.blobToBase64)(blob)];
                case 3:
                    base64 = _c.sent();
                    format = (0, use_voice_recording_1.getAudioFormat)(blob.type);
                    return [4 /*yield*/, transcribeMutation.mutateAsync({
                            audio: base64,
                            format: format
                        })];
                case 4:
                    result = _c.sent();
                    if (result.text && result.text.trim()) {
                        currentValue = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
                        transcribed = result.text.replace(/[\r\n\t]+/g, " ").replace(/ +/g, " ").trim();
                        needsSpace = currentValue.length > 0 && !/\s$/.test(currentValue);
                        newValue = currentValue + (needsSpace ? " " : "") + transcribed;
                        (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.setValue(newValue);
                        setHasContent(true);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _c.sent();
                    console.error("[NewChatForm] Transcription failed:", err_2);
                    return [3 /*break*/, 7];
                case 6:
                    setIsTranscribing(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleVoiceMouseLeave = function () {
        if (isVoiceRecording) {
            cancelRecording();
        }
    };
    // Voice hotkey listener (push-to-talk: hold to record, release to transcribe)
    (0, solid_js_1.createEffect)(function () {
        var voiceHotkey = (0, hotkeys_1.getResolvedHotkey)("voice-input", customHotkeys);
        if (!voiceHotkey)
            return;
        // Parse hotkey once
        var parts = voiceHotkey.split("+").map(function (p) { return p.toLowerCase(); });
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
            if (!isVoiceRecording && !isTranscribing) {
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
    // Shift+Tab handler for mode switching (now handled inside input component via onShiftTab prop)
    // Keyboard shortcut: Enter to focus input when not already focused
    (0, use_focus_input_on_enter_1.useFocusInputOnEnter)(editorRef);
    // Keyboard shortcut: Cmd+Esc to toggle focus/blur
    (0, use_toggle_focus_on_cmd_esc_1.useToggleFocusOnCmdEsc)(editorRef);
    // Fetch repos from team
    // Desktop: no remote repos, we use local projects
    var reposData = { repositories: [] };
    var isLoadingRepos = false;
    // Memoize repos arrays to prevent useEffect from running on every keystroke
    // Apply debug mode simulations
    var repos = (0, solid_js_1.createMemo)(function () {
        if (debugMode.enabled && debugMode.simulateNoRepos) {
            return [];
        }
        return (reposData === null || reposData === void 0 ? void 0 : reposData.repositories) || [];
    });
    var readyRepos = (0, solid_js_1.createMemo)(function () {
        if (debugMode.enabled && debugMode.simulateNoReadyRepos) {
            return [];
        }
        return repos.filter(function (r) { return r.sandbox_status === "ready"; });
    });
    var notReadyRepos = (0, solid_js_1.createMemo)(function () { return repos.filter(function (r) { return r.sandbox_status !== "ready"; }); });
    // Use state to avoid hydration mismatch
    var _31 = (0, solid_js_1.createSignal)(null), resolvedRepo = _31[0], setResolvedRepo = _31[1];
    // Derive selected repo from saved or first available (client-side only)
    // Now includes all repos, not just ready ones
    (0, solid_js_1.createEffect)(function () {
        if (lastSelectedRepo) {
            // For public imports, use lastSelectedRepo directly (it won't be in repos list)
            if (lastSelectedRepo.isPublicImport) {
                setResolvedRepo({
                    id: lastSelectedRepo.id,
                    name: lastSelectedRepo.name,
                    full_name: lastSelectedRepo.full_name,
                    sandbox_status: lastSelectedRepo.sandbox_status || "not_setup"
                });
                return;
            }
            // Look in all repos by id or full_name
            // Only compare IDs when lastSelectedRepo.id is non-empty (old localStorage data might have empty id)
            var stillExists = repos.find(function (r) { return lastSelectedRepo.id && r.id === lastSelectedRepo.id || r.full_name === lastSelectedRepo.full_name; });
            if (stillExists) {
                setResolvedRepo(stillExists);
                return;
            }
        }
        if (repos.length === 0) {
            setResolvedRepo(null);
            return;
        }
        // Auto-save first repo if none saved (prefer ready repos, then any)
        if (!lastSelectedRepo && repos.length > 0) {
            var firstRepo = readyRepos[0] || repos[0];
            setLastSelectedRepo({
                id: firstRepo.id,
                name: firstRepo.name,
                full_name: firstRepo.full_name,
                sandbox_status: firstRepo.sandbox_status
            });
        }
        setResolvedRepo(readyRepos[0] || repos[0] || null);
    });
    // Desktop: fetch branches from local git repository
    var branchesQuery = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path) || "" }, {
        enabled: !!(validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path),
        staleTime: 3e4
    });
    var fetchRemoteMutation = trpc_1.trpc.changes.fetchRemote.useMutation();
    // Manual refresh branches
    var handleRefreshBranches = function () {
        if (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path) {
            fetchRemoteMutation.mutate({ worktreePath: validatedProject.path }, {
                onSuccess: function () {
                    branchesQuery.refetch();
                },
                onError: function (error) {
                    console.error("Failed to fetch remote branches:", error);
                }
            });
        }
    };
    // Transform branch data to match web app format
    var branches = (0, solid_js_1.createMemo)(function () {
        if (!branchesQuery.data)
            return [];
        var _a = branchesQuery.data, local = _a.local, remote = _a.remote, defaultBranch = _a.defaultBranch;
        var result = [];
        // Add local branches
        for (var _i = 0, local_1 = local; _i < local_1.length; _i++) {
            var _b = local_1[_i], branch = _b.branch, lastCommitDate = _b.lastCommitDate;
            result.push({
                name: branch,
                type: "local",
                protected: false,
                isDefault: branch === defaultBranch,
                committedAt: lastCommitDate ? new Date(lastCommitDate).toISOString() : null,
                authorName: null
            });
        }
        // Add remote branches
        for (var _c = 0, remote_1 = remote; _c < remote_1.length; _c++) {
            var name_1 = remote_1[_c];
            result.push({
                name: name_1,
                type: "remote",
                protected: false,
                isDefault: name_1 === defaultBranch,
                committedAt: null,
                authorName: null
            });
        }
        // Sort: default first, then local, then remote, alphabetically
        return result.sort(function (a, b) {
            if (a.isDefault && !b.isDefault)
                return -1;
            if (!a.isDefault && b.isDefault)
                return 1;
            if (a.type !== b.type)
                return a.type === "local" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    });
    // Filter branches based on search
    var filteredBranches = (0, solid_js_1.createMemo)(function () {
        if (!branchSearch.trim())
            return branches;
        var search = branchSearch.toLowerCase();
        return branches.filter(function (b) { return b.name.toLowerCase().includes(search); });
    });
    // Virtualizer for branch list - only active when popover is open
    var branchVirtualizer = (0, react_virtual_1.useVirtualizer)({
        count: filteredBranches.length,
        getScrollElement: function () { return branchListRef.current; },
        estimateSize: function () { return 28; },
        overscan: 5,
        enabled: branchPopoverOpen
    });
    // Force virtualizer to re-measure when popover opens
    (0, solid_js_1.createEffect)(function () {
        if (branchPopoverOpen) {
            // Small delay to ensure ref is attached
            var timer_1 = setTimeout(function () {
                branchVirtualizer.measure();
            }, 0);
            return function () { return clearTimeout(timer_1); };
        }
    });
    // Format relative time for branches (reuse shared utility)
    var formatRelativeTime = function (dateString) {
        if (!dateString)
            return "";
        return (0, format_time_ago_1.formatTimeAgo)(dateString);
    };
    // Set default branch when project/branches change (only if no saved branch for this project)
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (((_a = branchesQuery.data) === null || _a === void 0 ? void 0 : _a.defaultBranch) && (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.id) && !selectedBranch) {
            // Find the default branch in the branches list to get its type
            // Prefer local over remote if both exist
            var defaultBranchObj = branches.find(function (b) { return b.name === branchesQuery.data.defaultBranch && b.isDefault && b.type === "local"; }) || branches.find(function (b) { return b.name === branchesQuery.data.defaultBranch && b.isDefault && b.type === "remote"; });
            // Fallback to "local" if branch not found in list (shouldn't happen but prevents empty selector)
            var branchType = (defaultBranchObj === null || defaultBranchObj === void 0 ? void 0 : defaultBranchObj.type) || "local";
            setSelectedBranch(branchesQuery.data.defaultBranch, branchType);
        }
    });
    // Auto-focus input when NewChatForm is shown (when clicking "New Chat")
    // Skip on mobile to prevent keyboard from opening automatically
    (0, solid_js_1.createEffect)(function () {
        if (isMobileFullscreen)
            return;
        // Small delay to ensure DOM is ready and animations complete
        var timeoutId = setTimeout(function () {
            var _a;
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }, 150);
        return function () { return clearTimeout(timeoutId); };
    });
    // Track last saved text to avoid unnecessary updates
    var _32 = (0, solid_js_1.createSignal)(""), lastSavedTextRef = _32[0], setLastSavedTextRef = _32[1];
    // Track previous draft ID to detect when switching away from a draft
    var _33 = (0, solid_js_1.createSignal)(null), prevSelectedDraftIdRef = _33[0], setPrevSelectedDraftIdRef = _33[1];
    // Restore draft when a specific draft is selected from sidebar
    // Or clear editor when "New Workspace" is clicked (selectedDraftId becomes null)
    (0, solid_js_1.createEffect)(function () {
        var hadDraftBefore = prevSelectedDraftIdRef.current !== null;
        prevSelectedDraftIdRef.current = selectedDraftId;
        if (!selectedDraftId) {
            // No draft selected - only clear if we had a draft before (user clicked "New Workspace")
            // Don't clear if user is currently typing (currentDraftIdRef has a value)
            if (hadDraftBefore) {
                currentDraftIdRef.current = null;
                lastSavedTextRef.current = "";
                if (editorRef.current) {
                    editorRef.current.clear();
                    setHasContent(false);
                }
                // Fetch remote branches in background when starting new workspace
                if (validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path) {
                    handleRefreshBranches();
                }
            }
            return;
        }
        var globalDrafts = (0, drafts_1.loadGlobalDrafts)();
        var draft = globalDrafts[selectedDraftId];
        if (draft === null || draft === void 0 ? void 0 : draft.text) {
            currentDraftIdRef.current = selectedDraftId;
            lastSavedTextRef.current = draft.text;
            // Try to set value immediately if editor is ready
            if (editorRef.current) {
                editorRef.current.setValue(draft.text);
                setHasContent(true);
            }
            else {
                // Fallback: wait for editor to initialize (rare case)
                var timeoutId_1 = setTimeout(function () {
                    var _a;
                    (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.setValue(draft.text);
                    setHasContent(true);
                }, 50);
                return function () { return clearTimeout(timeoutId_1); };
            }
        }
    });
    // Mark draft as visible when component unmounts (user navigates away)
    // This ensures the draft only appears in the sidebar after leaving the form
    (0, solid_js_1.createEffect)(function () {
        return function () {
            // On unmount, mark current draft as visible so it appears in sidebar
            if (currentDraftIdRef.current) {
                (0, drafts_1.markDraftVisible)(currentDraftIdRef.current);
            }
        };
    });
    // Filter all repos by search (combined list) and sort by preview status
    var filteredRepos = repos.filter(function (repo) { return repo.name.toLowerCase().includes(repoSearchQuery.toLowerCase()) || repo.full_name.toLowerCase().includes(repoSearchQuery.toLowerCase()); }).sort(function (a, b) {
        // 1. Repos with preview (sandbox_status === "ready") come first
        var aHasPreview = a.sandbox_status === "ready";
        var bHasPreview = b.sandbox_status === "ready";
        if (aHasPreview && !bHasPreview)
            return -1;
        if (!aHasPreview && bHasPreview)
            return 1;
        // 2. Sort by last commit date (pushed_at) - most recent first
        var aDate = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        var bDate = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        return bDate - aDate;
    });
    // Create chat mutation (real tRPC)
    var utils = trpc_1.trpc.useUtils();
    var createChatMutation = trpc_1.trpc.chats.create.useMutation({
        onSuccess: function (data) {
            var _a, _b, _c;
            // Clear editor, images, pasted texts, and file contents cache only on success
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.clear();
            clearImages();
            clearPastedTexts();
            fileContentsRef.current.clear();
            clearCurrentDraft();
            utils.chats.list.invalidate();
            setSelectedChatId(data.id);
            // New chats are always local
            setSelectedChatIsRemote(false);
            setChatSourceMode("local");
            // Track this chat and its first subchat as just created for typewriter effect
            var ids = [data.id];
            if ((_c = (_b = data.subChats) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id) {
                ids.push(data.subChats[0].id);
            }
            var justCreated = justCreatedIds();
            ids.forEach(function (id) { return justCreated.add(id); });
        },
        onError: function (error) {
            solid_sonner_1.toast.error(error.message);
        }
    });
    // Open folder mutation for selecting a project
    var openFolder = trpc_1.trpc.projects.openFolder.useMutation({ onSuccess: function (project) {
            if (project) {
                // Optimistically update the projects list cache to prevent "Select repo" flash
                // This ensures validatedProject can find the new project immediately
                utils.projects.list.setData(undefined, function (oldData) {
                    if (!oldData)
                        return [project];
                    // Check if project already exists (reopened existing project)
                    var exists = oldData.some(function (p) { return p.id === project.id; });
                    if (exists) {
                        // Update existing project's timestamp
                        return oldData.map(function (p) { return p.id === project.id ? __assign(__assign({}, p), { updatedAt: project.updatedAt }) : p; });
                    }
                    // Add new project at the beginning
                    return __spreadArray([project], oldData, true);
                });
                setSelectedProject({
                    id: project.id,
                    name: project.name,
                    path: project.path,
                    gitRemoteUrl: project.gitRemoteUrl,
                    gitProvider: project.gitProvider,
                    gitOwner: project.gitOwner,
                    gitRepo: project.gitRepo
                });
            }
        } });
    var handleOpenFolder = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openFolder.mutateAsync()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var getAgentIcon = function (agentId, className) {
        switch (agentId) {
            case "claude-code": return <icons_1.ClaudeCodeIcon class={className}/>;
            case "cursor": return <icons_1.CursorIcon class={className}/>;
            case "codex": return <CodexIcon class={className}/>;
            default: return null;
        }
    };
    var trpcUtils = trpc_1.trpc.useUtils();
    var handleSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var message, hasText, hasImages, hasPastedTexts, slashMatch, commandName_1, args, builtinNames, commands, cmd, content, error_1, parts, finalMessage, pastedMentions, _i, _a, _b, mentionId, content, filePath;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    message = ((_c = editorRef.current) === null || _c === void 0 ? void 0 : _c.getValue()) || "";
                    hasText = message.trim().length > 0;
                    hasImages = images.filter(function (img) { return !img.isLoading && img.url; }).length > 0;
                    hasPastedTexts = pastedTexts.length > 0;
                    if (!hasText && !hasImages && !hasPastedTexts || !selectedProject) {
                        return [2 /*return*/];
                    }
                    slashMatch = message.match(/^\/(\S+)\s*(.*)$/s);
                    if (!slashMatch) return [3 /*break*/, 6];
                    commandName_1 = slashMatch[1], args = slashMatch[2];
                    builtinNames = new Set(commands_1.BUILTIN_SLASH_COMMANDS.map(function (cmd) { return cmd.name; }));
                    if (!!builtinNames.has(commandName_1)) return [3 /*break*/, 6];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, trpcUtils.commands.list.fetch({ projectPath: validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path })];
                case 2:
                    commands = _d.sent();
                    cmd = commands.find(function (c) { return c.name.toLowerCase() === commandName_1.toLowerCase(); });
                    if (!cmd) return [3 /*break*/, 4];
                    return [4 /*yield*/, trpcUtils.commands.getContent.fetch({ path: cmd.path })];
                case 3:
                    content = (_d.sent()).content;
                    // Replace $ARGUMENTS with the provided args
                    message = content.replace(/\$ARGUMENTS/g, args.trim());
                    _d.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error("Failed to process custom command:", error_1);
                    return [3 /*break*/, 6];
                case 6:
                    parts = images.filter(function (img) { return !img.isLoading && img.url; }).map(function (img) { return ({
                        type: "data-image",
                        data: {
                            url: img.url,
                            mediaType: img.mediaType,
                            filename: img.filename,
                            base64Data: img.base64Data
                        }
                    }); });
                    finalMessage = message.trim();
                    if (pastedTexts.length > 0) {
                        pastedMentions = pastedTexts.map(function (pt) {
                            // Sanitize preview to remove special characters that break mention parsing
                            var sanitizedPreview = pt.preview.replace(/[:\[\]|]/g, "");
                            return "@[".concat(mentions_1.MENTION_PREFIXES.PASTED).concat(pt.size, ":").concat(sanitizedPreview, "|").concat(pt.filePath, "]");
                        }).join(" ");
                        finalMessage = pastedMentions + (finalMessage ? " " + finalMessage : "");
                    }
                    if (finalMessage) {
                        parts.push({
                            type: "text",
                            text: finalMessage
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
                    // Create chat with selected project, branch, and initial message
                    createChatMutation.mutate({
                        projectId: selectedProject.id,
                        name: message.trim().slice(0, 50),
                        initialMessageParts: parts.length > 0 ? parts : undefined,
                        baseBranch: workMode === "worktree" ? selectedBranch || undefined : undefined,
                        branchType: workMode === "worktree" ? selectedBranchType : undefined,
                        useWorktree: workMode === "worktree",
                        mode: agentMode
                    });
                    return [2 /*return*/];
            }
        });
    }); };
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
    // Save draft to localStorage when content changes
    var handleContentChange = function (hasContent) {
        var _a;
        setHasContent(hasContent);
        var text = ((_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.getValue()) || "";
        // Skip if text hasn't changed
        if (text === lastSavedTextRef.current) {
            return;
        }
        lastSavedTextRef.current = text;
        var globalDrafts = (0, drafts_1.loadGlobalDrafts)();
        if (text.trim() && validatedProject) {
            // If no current draft ID, create a new one
            if (!currentDraftIdRef.current) {
                currentDraftIdRef.current = (0, drafts_1.generateDraftId)();
            }
            var key = currentDraftIdRef.current;
            globalDrafts[key] = {
                text: text,
                updatedAt: Date.now(),
                project: {
                    id: validatedProject.id,
                    name: validatedProject.name,
                    path: validatedProject.path,
                    gitOwner: validatedProject.gitOwner,
                    gitRepo: validatedProject.gitRepo,
                    gitProvider: validatedProject.gitProvider
                }
            };
            (0, drafts_1.saveGlobalDrafts)(globalDrafts);
        }
        else if (currentDraftIdRef.current) {
            // Text is empty - delete the current draft
            (0, drafts_1.deleteNewChatDraft)(currentDraftIdRef.current);
            currentDraftIdRef.current = null;
        }
    };
    // Clear current draft when chat is created
    var clearCurrentDraft = function () {
        if (!currentDraftIdRef.current)
            return;
        (0, drafts_1.deleteNewChatDraft)(currentDraftIdRef.current);
        currentDraftIdRef.current = null;
        setSelectedDraftId(null);
    };
    // Memoized callbacks to prevent re-renders
    var handleMentionTrigger = function (_a) {
        var searchText = _a.searchText, rect = _a.rect;
        if (validatedProject) {
            setMentionSearchText(searchText);
            setMentionPosition({
                top: rect.top,
                left: rect.left
            });
            // Reset subpage state when opening dropdown
            setShowingFilesList(false);
            setShowingSkillsList(false);
            setShowingAgentsList(false);
            setShowingToolsList(false);
            setShowMentionDropdown(true);
        }
    };
    var handleCloseTrigger = function () {
        setShowMentionDropdown(false);
        // Reset subpage state when closing
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
        var _a, _b, _c;
        // Clear the slash command text from editor
        (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.clearSlashCommand();
        setShowSlashDropdown(false);
        // Handle builtin commands that change app state (no text input needed)
        if (command.category === "builtin") {
            switch (command.name) {
                case "clear":
                    (_b = editorRef.current) === null || _b === void 0 ? void 0 : _b.clear();
                    return;
                case "plan":
                    if (agentMode !== "plan") {
                        setAgentMode("plan");
                    }
                    return;
                case "agent":
                    if (agentMode === "plan") {
                        setAgentMode("agent");
                    }
                    return;
            }
        }
        // For all other commands (builtin prompts and custom):
        // insert the command and let user add arguments or press Enter to send
        (_c = editorRef.current) === null || _c === void 0 ? void 0 : _c.setValue("/".concat(command.name, " "));
    };
    // Paste handler for images, plain text, and large text (saved as files)
    var handlePaste = function (e) { return (0, paste_text_1.handlePasteEvent)(e, handleAddAttachments, addPastedText); };
    // Drag and drop handlers
    var _34 = (0, solid_js_1.createSignal)(false), isDragOver = _34[0], setIsDragOver = _34[1];
    // Focus state for ring
    var _35 = (0, solid_js_1.createSignal)(false), isFocused = _35[0], setIsFocused = _35[1];
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
                        handleAddAttachments(imageFiles);
                    }
                    _a = 0, otherFiles_1 = otherFiles;
                    _h.label = 1;
                case 1:
                    if (!(_a < otherFiles_1.length)) return [3 /*break*/, 8];
                    file = otherFiles_1[_a];
                    filePath = ((_d = (_c = window.webUtils) === null || _c === void 0 ? void 0 : _c.getPathForFile) === null || _d === void 0 ? void 0 : _d.call(_c, file)) || file.path;
                    mentionId = void 0;
                    mentionPath = void 0;
                    // Check if file is inside the project
                    if ((validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path) && filePath && filePath.startsWith(validatedProject.path)) {
                        relativePath = filePath.slice(validatedProject.path.length).replace(/^\//, "");
                        mentionId = "file:local:".concat(relativePath);
                        mentionPath = relativePath;
                    }
                    else if (filePath) {
                        // External file: use absolute path with file:external: prefix
                        mentionId = "file:external:".concat(filePath);
                        mentionPath = filePath;
                    }
                    else {
                        // Fallback: use filename only
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
                    fileContentsRef.current.set(mentionId, content);
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
    // Context items for images and pasted text files
    var contextItems = images.length > 0 || pastedTexts.length > 0 ? <div class="flex flex-wrap gap-[6px]">
        {(function () {
            // Build allImages array for gallery navigation
            var allImages = images.filter(function (img) { return img.url && !img.isLoading; }).map(function (img) { return ({
                id: img.id,
                filename: img.filename,
                url: img.url
            }); });
            return images.map(function (img, idx) { return <agent_image_item_1.AgentImageItem key={img.id} id={img.id} filename={img.filename} url={img.url} isLoading={img.isLoading} onRemove={function () { return removeImage(img.id); }} allImages={allImages} imageIndex={idx}/>; });
        })()}
        {pastedTexts.map(function (pt) { return <agent_pasted_text_item_1.AgentPastedTextItem key={pt.id} filePath={pt.filePath} filename={pt.filename} size={pt.size} preview={pt.preview} onRemove={function () { return removePastedText(pt.id); }}/>; })}
      </div> : null;
    // Handle container click to focus editor
    var handleContainerClick = function (e) {
        var _a;
        if (e.target === e.currentTarget || !e.target.closest("button, [contenteditable]")) {
            (_a = editorRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    return <div class="flex h-full flex-col">
      {/* Header - Simple burger on mobile, AgentsHeaderControls on desktop */}
      <div class="flex-shrink-0 flex items-center justify-between bg-background p-1.5">
        <div class="flex-1 min-w-0 flex items-center gap-2">
          {isMobileFullscreen ? <button_1.Button variant="ghost" size="icon" onClick={onBackToChats} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="All projects">
              <lucide_solid_1.AlignJustify class="h-4 w-4"/>
            </button_1.Button> : <agents_header_controls_1.AgentsHeaderControls isSidebarOpen={sidebarOpen} onToggleSidebar={function () { return setSidebarOpen(function (prev) { return !prev; }); }} hasUnseenChanges={hasAnyUnseenChanges}/>}
        </div>
      </div>

      <div class="flex flex-1 items-center justify-center overflow-y-auto relative">
        <div class="w-full max-w-2xl space-y-4 md:space-y-6 relative z-10 px-4">
          {/* Title - only show when project is selected */}
          {validatedProject && <div class="text-center">
              <h1 class="text-2xl md:text-4xl font-medium tracking-tight">
                What do you want to get done?
              </h1>
            </div>}

          {/* Input Area or Select Repo State */}
          {!validatedProject ? <div class="flex justify-center">
              <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed">
                {openFolder.isPending ? "Opening..." : "Select repo"}
              </button>
            </div> : <div class="relative w-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <div class="relative w-full cursor-text" onClick={handleContainerClick}>
                <prompt_input_1.PromptInput class={(0, utils_1.cn)("border bg-input-background relative z-10 p-2 rounded-xl transition-[border-color,box-shadow] duration-150", isDragOver && "ring-2 ring-primary/50 border-primary/50", isFocused && !isDragOver && "ring-2 ring-primary/50")} maxHeight={240} onSubmit={handleSend} contextItems={contextItems}>
                  <prompt_input_1.PromptInputContextItems />
                  <div class="relative">
                    <mentions_1.AgentsMentionsEditor ref={editorRef} onTrigger={handleMentionTrigger} onCloseTrigger={handleCloseTrigger} onSlashTrigger={handleSlashTrigger} onCloseSlashTrigger={handleCloseSlashTrigger} onContentChange={handleContentChange} onSubmit={handleSend} onShiftTab={toggleMode} placeholder="Plan, @ for context, / for commands" class={(0, utils_1.cn)("bg-transparent max-h-[240px] overflow-y-auto p-1", isMobileFullscreen ? "min-h-[56px]" : "min-h-[44px]")} onPaste={handlePaste} disabled={createChatMutation.isPending} onFocus={function () { return setIsFocused(true); }} onBlur={function () { return setIsFocused(false); }}/>
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
                        <dropdown_menu_1.DropdownMenuTrigger class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
                          {agentMode === "plan" ? <icons_1.PlanIcon class="h-3.5 w-3.5"/> : <icons_1.AgentIcon class="h-3.5 w-3.5"/>}
                          <span>{agentMode === "plan" ? "Plan" : "Agent"}</span>
                          <icons_1.IconChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="start" sideOffset={6} class="!min-w-[116px] !w-[116px]" onCloseAutoFocus={function (e) { return e.preventDefault(); }}>
                          <dropdown_menu_1.DropdownMenuItem onClick={function () {
                // Clear tooltip before closing dropdown (onMouseLeave won't fire)
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                }
                setModeTooltip(null);
                setAgentMode("agent");
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
                            {agentMode !== "plan" && <icons_1.CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0"/>}
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem onClick={function () {
                // Clear tooltip before closing dropdown (onMouseLeave won't fire)
                if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                    tooltipTimeoutRef.current = null;
                }
                setModeTooltip(null);
                setAgentMode("plan");
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
                            {agentMode === "plan" && <icons_1.CheckIcon class="h-3.5 w-3.5 ml-auto shrink-0"/>}
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
                            <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 border border-border">
                              <lucide_solid_1.Zap class="h-4 w-4"/>
                              <span>{currentOllamaModel || "Select model"}</span>
                              <icons_1.IconChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
                            </button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="start" class="w-[240px]">
                            {availableModels.ollamaModels.map(function (model) {
                    var isSelected = model === currentOllamaModel;
                    var isRecommended = model === availableModels.recommendedModel;
                    return <dropdown_menu_1.DropdownMenuItem key={model} onClick={function () { return setSelectedOllamaModel(model); }} class="gap-2 justify-between">
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
                            <button disabled={hasCustomClaudeConfig} class={(0, utils_1.cn)("flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground transition-[background-color,color] duration-150 ease-out rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", hasCustomClaudeConfig ? "opacity-70 cursor-not-allowed" : "hover:text-foreground hover:bg-muted/50")}>
                              <icons_1.ClaudeCodeIcon class="h-3.5 w-3.5"/>
                              <span>
                                {hasCustomClaudeConfig ? "Custom Model" : <>
                                    {selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.name}{" "}
                                    <span class="text-muted-foreground">4.5</span>
                                  </>}
                              </span>
                              <icons_1.IconChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
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
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>}
                    </div>

                    <div class="flex items-center gap-0.5 ml-auto flex-shrink-0">
                      {/* Hidden file input */}
                      <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png" multiple onChange={function (e) {
                var files = Array.from(e.target.files || []);
                handleAddAttachments(files);
                e.target.value = "";
            }}/>
                      {/* Voice wave indicator or Attachment button */}
                      {isVoiceRecording ? <voice_wave_indicator_1.VoiceWaveIndicator isRecording={isVoiceRecording} audioLevel={voiceAudioLevel}/> : <button_1.Button variant="ghost" size="icon" class="h-7 w-7 rounded-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={images.length >= 5}>
                          <icons_1.AttachIcon class="h-4 w-4"/>
                        </button_1.Button>}
                      <div class="ml-1">
                        <agent_send_button_1.AgentSendButton isStreaming={false} isSubmitting={createChatMutation.isPending || isUploading} disabled={Boolean(!hasContent || !selectedProject || isUploading)} onClick={handleSend} mode={agentMode} hasContent={hasContent} showVoiceInput={isVoiceAvailable} isRecording={isVoiceRecording} isTranscribing={isTranscribing} onVoiceMouseDown={handleVoiceMouseDown} onVoiceMouseUp={handleVoiceMouseUp} onVoiceMouseLeave={handleVoiceMouseLeave}/>
                      </div>
                    </div>
                  </prompt_input_1.PromptInputActions>
                </prompt_input_1.PromptInput>

                {/* Project, Work Mode, and Branch selectors - directly under input */}
                <div class="mt-1.5 md:mt-2 ml-[5px] flex items-center gap-2">
                  <project_selector_1.ProjectSelector />

                  {/* Work mode selector - between project and branch */}
                  {validatedProject && <work_mode_selector_1.WorkModeSelector value={workMode} onChange={setWorkMode} disabled={createChatMutation.isPending}/>}

                  {/* Branch selector - only visible when worktree mode is selected */}
                  {validatedProject && workMode === "worktree" && <popover_1.Popover open={branchPopoverOpen} onOpenChange={function (open) {
                    if (!open) {
                        setBranchSearch("");
                    }
                    setBranchPopoverOpen(open);
                }}>
                      <popover_1.PopoverTrigger asChild>
                        <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" disabled={branchesQuery.isLoading}>
                          <icons_1.BranchIcon class="w-4 h-4"/>
                          <span class="truncate max-w-[100px]">
                            {selectedBranch || ((_e = branchesQuery.data) === null || _e === void 0 ? void 0 : _e.defaultBranch) || "main"}
                          </span>
                          <icons_1.IconChevronDown class="w-3 h-3 opacity-50"/>
                        </button>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent class="w-80 p-0" align="start">
                        {/* Search input with Create button */}
                        <div class="flex items-center gap-1.5 h-7 px-1.5 mx-1 my-1 rounded-md bg-muted/50">
                          <icons_1.SearchIcon class="h-4 w-4 shrink-0 text-muted-foreground"/>
                          <input type="text" placeholder="Search branches..." value={branchSearch} onChange={function (e) { return setBranchSearch(e.target.value); }} class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus/>
                          <button_1.Button size="sm" variant="ghost" class="h-6 px-1.5 flex items-center gap-1 text-xs shrink-0" onClick={function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    setCreateBranchDialogOpen(true);
                    setBranchPopoverOpen(false);
                }}>
                            <lucide_solid_1.Plus class="h-3 w-3"/>
                            Create
                          </button_1.Button>
                        </div>

                        {/* Virtualized branch list */}
                        {filteredBranches.length === 0 ? <div class="py-6 text-center text-sm text-muted-foreground">
                            No branches found.
                          </div> : <div ref={branchListRef} class="overflow-auto py-1 scrollbar-hide" style={{ height: Math.min(filteredBranches.length * 32 + 8, 300) }}>
                            <div style={{
                        height: "".concat(branchVirtualizer.getTotalSize(), "px"),
                        width: "100%",
                        position: "relative"
                    }}>
                              {branchVirtualizer.getVirtualItems().map(function (virtualItem) {
                        var branch = filteredBranches[virtualItem.index];
                        var isSelected = selectedBranch === branch.name && selectedBranchType === branch.type || !selectedBranch && branch.isDefault && branch.type === "local";
                        return <button key={"".concat(branch.type, "-").concat(branch.name)} onClick={function () {
                                setSelectedBranch(branch.name, branch.type);
                                setBranchPopoverOpen(false);
                                setBranchSearch("");
                            }} class={(0, utils_1.cn)("flex items-center gap-1.5 w-[calc(100%-8px)] mx-1 px-1.5 text-sm text-left absolute left-0 top-0 rounded-md cursor-default select-none outline-none transition-colors", isSelected ? "dark:bg-neutral-800 text-foreground" : "dark:hover:bg-neutral-800 hover:text-foreground")} style={{
                                height: "".concat(virtualItem.size, "px"),
                                transform: "translateY(".concat(virtualItem.start, "px)")
                            }}>
                                      <icons_1.BranchIcon class="h-4 w-4 text-muted-foreground shrink-0"/>
                                      <span class="truncate flex-1">
                                        {branch.name}
                                      </span>
                                      <span class={(0, utils_1.cn)("text-[10px] px-1.5 py-0.5 rounded shrink-0", branch.type === "local" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500")}>
                                        {branch.type}
                                      </span>
                                      {branch.committedAt && <span class="text-xs text-muted-foreground/70 shrink-0">
                                          {formatRelativeTime(branch.committedAt)}
                                        </span>}
                                      {branch.isDefault && <span class="text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded shrink-0">
                                          default
                                        </span>}
                                      {isSelected && <icons_1.CheckIcon class="h-4 w-4 shrink-0 ml-auto"/>}
                                    </button>;
                    })}
                            </div>
                          </div>}
                      </popover_1.PopoverContent>
                    </popover_1.Popover>}

                  {/* Create Branch Dialog */}
                  {validatedProject && <create_branch_dialog_1.CreateBranchDialog open={createBranchDialogOpen} onOpenChange={setCreateBranchDialogOpen} projectPath={validatedProject.path} branches={branches} defaultBranch={((_f = branchesQuery.data) === null || _f === void 0 ? void 0 : _f.defaultBranch) || "main"} onBranchCreated={function (branchName) {
                    setSelectedBranch(branchName, "local");
                }}/>}
                </div>

                {/* Worktree config banner - absolute positioned to avoid layout shift */}
                {showWorktreeBanner && <div class="absolute left-0 right-0 top-full mt-2 ml-[5px] mr-[5px] p-3 pb-4 bg-muted/50 rounded-lg border border-border space-y-3">
                    <p class="text-sm text-muted-foreground">
                      Configure a worktree setup script to install dependencies or copy environment variables.
                    </p>
                    <div class="flex items-center justify-end gap-2">
                      <button_1.Button variant="secondary" size="sm" onClick={handleConfigureWorktree}>
                        Settings
                      </button_1.Button>
                      <button_1.Button size="sm" onClick={function () {
                    var prompt = commands_1.COMMAND_PROMPTS["worktree-setup"];
                    if (prompt && validatedProject) {
                        createChatMutation.mutate({
                            projectId: validatedProject.id,
                            name: "Worktree Setup",
                            initialMessageParts: [{
                                    type: "text",
                                    text: prompt
                                }],
                            useWorktree: false,
                            mode: "agent"
                        });
                    }
                }}>
                        Fill with AI
                      </button_1.Button>
                    </div>
                  </div>}

                {/* File mention dropdown */}
                {/* Desktop: use projectPath for local file search */}
                <mentions_1.AgentsFileMention isOpen={showMentionDropdown && !!validatedProject} onClose={function () {
                setShowMentionDropdown(false);
                // Reset subpage state when dropdown closes
                setShowingFilesList(false);
                setShowingSkillsList(false);
                setShowingAgentsList(false);
                setShowingToolsList(false);
            }} onSelect={handleMentionSelect} searchText={mentionSearchText} position={mentionPosition} projectPath={validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path} showingFilesList={showingFilesList} showingSkillsList={showingSkillsList} showingAgentsList={showingAgentsList} showingToolsList={showingToolsList}/>

                {/* Slash command dropdown */}
                <commands_1.AgentsSlashCommand isOpen={showSlashDropdown} onClose={handleCloseSlashTrigger} onSelect={handleSlashSelect} searchText={slashSearchText} position={slashPosition} projectPath={validatedProject === null || validatedProject === void 0 ? void 0 : validatedProject.path} mode={agentMode} disabledCommands={["clear"]}/>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}
