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
exports.KanbanView = KanbanView;
var solid_js_1 = require("solid-js");
var solid_sonner_1 = require("solid-sonner");
var trpc_1 = require("../../lib/trpc");
var WindowContext_1 = require("../../contexts/WindowContext");
var atoms_1 = require("../agents/atoms");
var atoms_2 = require("../../lib/atoms");
var kanban_board_1 = require("./components/kanban-board");
var derive_status_1 = require("./lib/derive-status");
var drafts_1 = require("../agents/lib/drafts");
var export_chat_1 = require("../agents/lib/export-chat");
var agents_rename_subchat_dialog_1 = require("../agents/components/agents-rename-subchat-dialog");
var confirm_archive_dialog_1 = require("../../components/confirm-archive-dialog");
var agents_header_controls_1 = require("../agents/ui/agents-header-controls");
// Event for open sub-chats changes
var OPEN_SUB_CHATS_CHANGE_EVENT = "open-sub-chats-change";
function KanbanView() {
    var _this = this;
    var setSelectedChatId = atoms_1.selectedAgentChatIdAtom[1];
    var setSelectedDraftId = atoms_1.selectedDraftIdAtom[1];
    var setShowNewChatForm = atoms_1.showNewChatFormAtom[1];
    // Sidebar state for header controls
    var sidebarOpen = atoms_1.agentsSidebarOpenAtom[0];
    var setSidebarOpen = atoms_1.agentsSidebarOpenAtom[1];
    // Multi-select state
    var selectedChatIds = atoms_2.selectedAgentChatIdsAtom[0];
    var isMultiSelectMode = atoms_2.isAgentMultiSelectModeAtom[0];
    var toggleChatSelection = atoms_2.toggleAgentChatSelectionAtom[1];
    // Status atoms
    var loadingSubChats = atoms_1.loadingSubChatsAtom[0];
    var pendingQuestions = atoms_1.pendingUserQuestionsAtom[0];
    var pendingPlanApprovals = atoms_1.pendingPlanApprovalsAtom[0];
    var unseenChanges = atoms_1.agentsUnseenChangesAtom[0];
    // Project for pinned chats storage
    var selectedProject = atoms_1.selectedProjectAtom[0];
    // Pinned chats (stored in localStorage per project)
    var _a = (0, solid_js_1.createSignal)(new Set()), pinnedChatIds = _a[0], setPinnedChatIds = _a[1];
    // Rename dialog state
    var _b = (0, solid_js_1.createSignal)(false), renameDialogOpen = _b[0], setRenameDialogOpen = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), renamingChat = _c[0], setRenamingChat = _c[1];
    // Archive confirmation dialog state
    var _d = (0, solid_js_1.createSignal)(false), confirmArchiveDialogOpen = _d[0], setConfirmArchiveDialogOpen = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), archivingChatId = _e[0], setArchivingChatId = _e[1];
    var _f = (0, solid_js_1.createSignal)(0), activeProcessCount = _f[0], setActiveProcessCount = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), hasWorktree = _g[0], setHasWorktree = _g[1];
    var _h = (0, solid_js_1.createSignal)(0), uncommittedCount = _h[0], setUncommittedCount = _h[1];
    // tRPC utils
    var utils = trpc_1.trpc.useUtils();
    // Load pinned IDs from localStorage when project changes
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!((_a = selectedProject()) === null || _a === void 0 ? void 0 : _a.id)) {
            setPinnedChatIds(new Set());
            return;
        }
        try {
            var windowId = (0, WindowContext_1.getWindowId)();
            var stored = localStorage.getItem("".concat(windowId, ":agent-pinned-chats-").concat(selectedProject().id));
            setPinnedChatIds(stored ? new Set(JSON.parse(stored)) : new Set());
        }
        catch (_b) {
            setPinnedChatIds(new Set());
        }
    });
    // Save pinned IDs to localStorage when they change
    var _j = (0, solid_js_1.createSignal)(new Set()), prevPinnedRef = _j[0], setPrevPinnedRef = _j[1];
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!((_a = selectedProject()) === null || _a === void 0 ? void 0 : _a.id))
            return;
        if (pinnedChatIds !== prevPinnedRef.current && pinnedChatIds.size > 0 || prevPinnedRef.current.size > 0) {
            var windowId = (0, WindowContext_1.getWindowId)();
            localStorage.setItem("".concat(windowId, ":agent-pinned-chats-").concat(selectedProject().id), JSON.stringify(__spreadArray([], pinnedChatIds, true)));
        }
        prevPinnedRef.current = pinnedChatIds;
    });
    // Toggle pin handler
    var handleTogglePin = function (chatId) {
        setPinnedChatIds(function (prev) {
            var next = new Set(prev);
            if (next.has(chatId)) {
                next.delete(chatId);
            }
            else {
                next.add(chatId);
            }
            return next;
        });
    };
    // Drafts from localStorage
    var drafts = (0, drafts_1.useNewChatDrafts)();
    // Fetch all chats (workspaces)
    var chats = trpc_1.trpc.chats.list.useQuery({}).data;
    // Fetch projects for metadata
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    var projectsMap = (0, solid_js_1.createMemo)(function () {
        if (!projects)
            return new Map();
        return new Map(projects.map(function (p) { return [p.id, p]; }));
    });
    // Track open sub-chat changes for reactivity
    var _k = (0, solid_js_1.createSignal)(0), openSubChatsVersion = _k[0], setOpenSubChatsVersion = _k[1];
    (0, solid_js_1.createEffect)(function () {
        var handleChange = function () { return setOpenSubChatsVersion(function (v) { return v + 1; }); };
        window.addEventListener(OPEN_SUB_CHATS_CHANGE_EVENT, handleChange);
        return function () { return window.removeEventListener(OPEN_SUB_CHATS_CHANGE_EVENT, handleChange); };
    });
    // Store previous value to avoid unnecessary React Query refetches
    var _l = (0, solid_js_1.createSignal)([]), prevOpenSubChatIdsRef = _l[0], setPrevOpenSubChatIdsRef = _l[1];
    // Collect all open sub-chat IDs from localStorage for all workspaces
    var allOpenSubChatIds = (0, solid_js_1.createMemo)(function () {
        void openSubChatsVersion;
        if (!chats)
            return prevOpenSubChatIdsRef.current;
        var windowId = (0, WindowContext_1.getWindowId)();
        var allIds = [];
        for (var _i = 0, chats_1 = chats; _i < chats_1.length; _i++) {
            var chat = chats_1[_i];
            try {
                var stored = localStorage.getItem("".concat(windowId, ":agent-open-sub-chats-").concat(chat.id));
                if (stored) {
                    var ids = JSON.parse(stored);
                    allIds.push.apply(allIds, ids);
                }
            }
            catch (_a) { }
        }
        var prev = prevOpenSubChatIdsRef.current;
        var sorted = __spreadArray([], allIds, true).sort();
        var prevSorted = __spreadArray([], prev, true).sort();
        if (sorted.length === prevSorted.length && sorted.every(function (id, i) { return id === prevSorted[i]; })) {
            return prev;
        }
        prevOpenSubChatIdsRef.current = allIds;
        return allIds;
    });
    // Pending plan approvals from DB
    var pendingPlanApprovalsData = trpc_1.trpc.chats.getPendingPlanApprovals.useQuery({ openSubChatIds: allOpenSubChatIds }, {
        refetchInterval: 5e3,
        enabled: allOpenSubChatIds.length > 0,
        placeholderData: function (prev) { return prev; }
    }).data;
    // File stats from DB
    var fileStatsData = trpc_1.trpc.chats.getFileStats.useQuery({ openSubChatIds: allOpenSubChatIds }, {
        refetchInterval: 5e3,
        enabled: allOpenSubChatIds.length > 0,
        placeholderData: function (prev) { return prev; }
    }).data;
    // Build set of chatIds with pending plan approvals from DB
    var workspacesWithPendingApprovalsFromDb = (0, solid_js_1.createMemo)(function () {
        var set = new Set();
        if (pendingPlanApprovalsData) {
            for (var _i = 0, pendingPlanApprovalsData_1 = pendingPlanApprovalsData; _i < pendingPlanApprovalsData_1.length; _i++) {
                var item = pendingPlanApprovalsData_1[_i];
                set.add(item.chatId);
            }
        }
        return set;
    });
    // Build set of chatIds with pending plan approvals from runtime atom
    var workspacesWithPendingApprovals = (0, solid_js_1.createMemo)(function () {
        var set = new Set(workspacesWithPendingApprovalsFromDb);
        // Add from runtime atom (parentChatId is the workspace id)
        pendingPlanApprovals.forEach(function (parentChatId) {
            set.add(parentChatId);
        });
        return set;
    });
    // Build file stats map (chatId -> stats)
    var workspaceFileStats = (0, solid_js_1.createMemo)(function () {
        var statsMap = new Map();
        if (fileStatsData) {
            for (var _i = 0, fileStatsData_1 = fileStatsData; _i < fileStatsData_1.length; _i++) {
                var stat = fileStatsData_1[_i];
                statsMap.set(stat.chatId, {
                    fileCount: stat.fileCount,
                    additions: stat.additions,
                    deletions: stat.deletions
                });
            }
        }
        return statsMap;
    });
    // Build set of chatIds with pending questions
    var workspacesWithPendingQuestions = (0, solid_js_1.createMemo)(function () {
        var set = new Set();
        pendingQuestions.forEach(function (q) {
            set.add(q.parentChatId);
        });
        return set;
    });
    // Build set of chatIds (workspace IDs) that are loading
    // loadingSubChats is Map<subChatId, parentChatId>, we need the VALUES (parentChatId)
    var workspacesLoading = (0, solid_js_1.createMemo)(function () { return new Set(__spreadArray([], loadingSubChats.values(), true)); });
    // Build kanban cards from workspaces (chats) + drafts
    var cards = (0, solid_js_1.createMemo)(function () {
        var _a, _b;
        var result = [];
        // Add drafts first (they go to "draft" column)
        for (var _i = 0, drafts_2 = drafts; _i < drafts_2.length; _i++) {
            var draft = drafts_2[_i];
            result.push({
                id: draft.id,
                name: draft.text.slice(0, 50) + (draft.text.length > 50 ? "..." : ""),
                chatId: draft.id,
                chatName: null,
                projectName: ((_a = draft.project) === null || _a === void 0 ? void 0 : _a.gitRepo) || ((_b = draft.project) === null || _b === void 0 ? void 0 : _b.name) || null,
                branch: null,
                mode: "agent",
                status: "draft",
                hasUnseenChanges: false,
                hasPendingPlan: false,
                hasPendingQuestion: false,
                createdAt: new Date(draft.updatedAt),
                updatedAt: new Date(draft.updatedAt),
                isDraft: true,
                isPinned: false,
                isSelected: false
            });
        }
        // Add workspaces
        if (chats) {
            for (var _c = 0, chats_2 = chats; _c < chats_2.length; _c++) {
                var chat = chats_2[_c];
                var project = projectsMap.get(chat.projectId);
                var status_1 = (0, derive_status_1.deriveWorkspaceStatus)(chat.id, {
                    workspacesLoading: workspacesLoading,
                    workspacesWithPendingQuestions: workspacesWithPendingQuestions,
                    workspacesWithPendingApprovals: workspacesWithPendingApprovals
                });
                result.push({
                    id: chat.id,
                    name: chat.name,
                    chatId: chat.id,
                    chatName: chat.name,
                    projectName: (project === null || project === void 0 ? void 0 : project.gitRepo) || (project === null || project === void 0 ? void 0 : project.name) || null,
                    branch: chat.branch,
                    mode: "agent",
                    status: status_1,
                    hasUnseenChanges: unseenChanges().has(chat.id),
                    hasPendingPlan: workspacesWithPendingApprovals.has(chat.id),
                    hasPendingQuestion: workspacesWithPendingQuestions.has(chat.id),
                    createdAt: new Date(chat.createdAt || Date.now()),
                    updatedAt: chat.updatedAt ? new Date(chat.updatedAt) : null,
                    isDraft: false,
                    stats: workspaceFileStats.get(chat.id),
                    isPinned: pinnedChatIds.has(chat.id),
                    isSelected: selectedChatIds().has(chat.id)
                });
            }
        }
        return result;
    });
    // Navigation on card click
    var handleCardClick = function (card, e) {
        // In multi-select mode with shift/cmd, toggle selection instead of navigating
        if (isMultiSelectMode() || (e === null || e === void 0 ? void 0 : e.shiftKey) || (e === null || e === void 0 ? void 0 : e.metaKey)) {
            if (!card.isDraft) {
                toggleChatSelection(card.chatId);
            }
            return;
        }
        if (card.isDraft) {
            // Navigate to NewChatForm with this draft selected
            setSelectedChatId(null);
            setSelectedDraftId(card.id);
            setShowNewChatForm(false);
        }
        else {
            // Navigate to workspace
            setSelectedChatId(card.chatId);
            setShowNewChatForm(false);
        }
    };
    // Checkbox click handler for multi-select
    var handleCheckboxClick = function (e, chatId) {
        e.stopPropagation();
        toggleChatSelection(chatId);
    };
    // Rename mutation
    var renameChatMutation = trpc_1.trpc.chats.rename.useMutation({
        onSuccess: function () {
            utils.chats.list.invalidate();
        },
        onError: function () {
            solid_sonner_1.toast.error("Failed to rename workspace");
        }
    });
    // Rename handler
    var handleRenameClick = function (chat) {
        setRenamingChat(chat);
        setRenameDialogOpen(true);
    };
    var handleRenameSave = function (newName) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!renamingChat)
                        return [2 /*return*/];
                    return [4 /*yield*/, renameChatMutation.mutateAsync({
                            id: renamingChat.id,
                            name: newName
                        })];
                case 1:
                    _a.sent();
                    setRenameDialogOpen(false);
                    setRenamingChat(null);
                    return [2 /*return*/];
            }
        });
    }); };
    // Archive mutation
    var archiveChatMutation = trpc_1.trpc.chats.archive.useMutation({
        onSuccess: function () {
            utils.chats.list.invalidate();
            solid_sonner_1.toast.success("Workspace archived");
        },
        onError: function () {
            solid_sonner_1.toast.error("Failed to archive workspace");
        }
    });
    // Archive handler with confirmation for active processes
    var handleArchive = function (chatId) { return __awaiter(_this, void 0, void 0, function () {
        var _a, sessionCount, worktreeStatus, needsConfirmation;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([utils.terminal.getActiveSessionCount.fetch({ workspaceId: chatId }), utils.chats.getWorktreeStatus.fetch({ chatId: chatId })])];
                case 1:
                    _a = _b.sent(), sessionCount = _a[0], worktreeStatus = _a[1];
                    needsConfirmation = sessionCount > 0 || worktreeStatus.hasWorktree;
                    if (!needsConfirmation) return [3 /*break*/, 2];
                    setArchivingChatId(chatId);
                    setActiveProcessCount(sessionCount);
                    setHasWorktree(worktreeStatus.hasWorktree);
                    setUncommittedCount(worktreeStatus.uncommittedCount);
                    setConfirmArchiveDialogOpen(true);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, archiveChatMutation.mutateAsync({ id: chatId })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleConfirmArchive = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!archivingChatId)
                        return [2 /*return*/];
                    return [4 /*yield*/, archiveChatMutation.mutateAsync({ id: archivingChatId })];
                case 1:
                    _a.sent();
                    setConfirmArchiveDialogOpen(false);
                    setArchivingChatId(null);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleCancelArchive = function () {
        setConfirmArchiveDialogOpen(false);
        setArchivingChatId(null);
    };
    // Copy branch name to clipboard
    var handleCopyBranch = function (branch) {
        navigator.clipboard.writeText(branch);
        solid_sonner_1.toast.success("Branch name copied", { description: branch });
    };
    // Export chat handler
    var handleExportChat = function (params) {
        (0, export_chat_1.exportChat)(params);
    };
    // Copy chat handler
    var handleCopyChat = function (params) {
        (0, export_chat_1.copyChat)(params);
    };
    return <div class="flex flex-col h-full w-full bg-background">
      {/* Header with sidebar toggle */}
      <div class="flex-shrink-0 flex items-center p-1.5">
        <agents_header_controls_1.AgentsHeaderControls isSidebarOpen={sidebarOpen} onToggleSidebar={function () { return setSidebarOpen(function (prev) { return !prev; }); }}/>
      </div>

      {/* Board */}
      <div class="flex-1 overflow-hidden">
        <kanban_board_1.KanbanBoard cards={cards} pinnedChatIds={pinnedChatIds} isMultiSelectMode={isMultiSelectMode} selectedChatIds={selectedChatIds} onCardClick={handleCardClick} onCheckboxClick={handleCheckboxClick} onTogglePin={handleTogglePin} onRename={handleRenameClick} onArchive={handleArchive} onCopyBranch={handleCopyBranch} onExportChat={handleExportChat} onCopyChat={handleCopyChat}/>
      </div>

      {/* Rename Dialog */}
      <agents_rename_subchat_dialog_1.AgentsRenameSubChatDialog isOpen={renameDialogOpen} onClose={function () { return setRenameDialogOpen(false); }} currentName={(renamingChat === null || renamingChat === void 0 ? void 0 : renamingChat.name) || ""} onSave={handleRenameSave}/>

      {/* Archive Confirmation Dialog */}
      <confirm_archive_dialog_1.ConfirmArchiveDialog isOpen={confirmArchiveDialogOpen} onClose={handleCancelArchive} onConfirm={handleConfirmArchive} activeProcessCount={activeProcessCount} hasWorktree={hasWorktree} uncommittedCount={uncommittedCount}/>
    </div>;
}
