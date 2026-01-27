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
exports.SubChatSelector = SubChatSelector;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../details-sidebar/atoms");
var atoms_3 = require("../../../lib/atoms");
var trpc_1 = require("../../../lib/trpc");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
var button_1 = require("../../../components/ui/button");
var utils_1 = require("../../../lib/utils");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var shallow_1 = require("zustand/react/shallow");
var popover_1 = require("../../../components/ui/popover");
var tooltip_1 = require("../../../components/ui/tooltip");
var kbd_1 = require("../../../components/ui/kbd");
var hotkeys_1 = require("../../../lib/hotkeys");
var context_menu_1 = require("../../../components/ui/context-menu");
var inline_edit_1 = require("./inline-edit");
var mock_api_1 = require("../../../lib/mock-api");
var solid_sonner_1 = require("solid-sonner");
var search_combobox_1 = require("../../../components/ui/search-combobox");
var sub_chat_context_menu_1 = require("./sub-chat-context-menu");
var format_time_ago_1 = require("../utils/format-time-ago");
var SearchHistoryPopover = memo(forwardRef(function SearchHistoryPopover(_a, ref) {
    var sortedSubChats = _a.sortedSubChats, loadingSubChats = _a.loadingSubChats, subChatUnseenChanges = _a.subChatUnseenChanges, pendingQuestionsMap = _a.pendingQuestionsMap, pendingPlanApprovals = _a.pendingPlanApprovals, allSubChatsLength = _a.allSubChatsLength, onSelect = _a.onSelect;
    var _b = (0, solid_js_1.createSignal)(false), isHistoryOpen = _b[0], setIsHistoryOpen = _b[1];
    // Expose open function to parent
    useImperativeHandle(ref, function () { return ({ open: function () { return setIsHistoryOpen(true); } }); }, []);
    var renderItem = function (subChat) {
        var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
        var isLoading = loadingSubChats.has(subChat.id);
        var hasUnseen = subChatUnseenChanges.has(subChat.id);
        var mode = subChat.mode || "agent";
        var hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
        var hasPendingPlan = pendingPlanApprovals.has(subChat.id);
        return <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
          {hasPendingQuestion ? <icons_1.QuestionIcon class="w-4 h-4 text-blue-500"/> : isLoading ? <icons_1.IconSpinner class="w-4 h-4 text-muted-foreground"/> : mode === "plan" ? <icons_1.PlanIcon class="w-4 h-4 text-muted-foreground"/> : <icons_1.AgentIcon class="w-4 h-4 text-muted-foreground"/>}
          {(hasPendingPlan || hasUnseen) && !isLoading && !hasPendingQuestion && <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-popover flex items-center justify-center">
              <div class={(0, utils_1.cn)("w-1.5 h-1.5 rounded-full", hasPendingPlan ? "bg-amber-500" : "bg-[#307BD0]")}/>
            </div>}
        </div>
        <span class="text-sm truncate flex-1">
          {subChat.name || "New Chat"}
        </span>
        <span class="text-sm text-muted-foreground whitespace-nowrap">
          {timeAgo}
        </span>
      </div>;
    };
    return <search_combobox_1.SearchCombobox isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} items={sortedSubChats} onSelect={onSelect} placeholder="Search chats..." emptyMessage="No results" getItemValue={function (subChat) { return "".concat(subChat.name || "New Chat", " ").concat(subChat.id); }} renderItem={renderItem} trigger={<tooltip_1.Tooltip>
          <tooltip_1.TooltipTrigger asChild>
            <popover_1.PopoverTrigger asChild>
              <button_1.Button variant="ghost" size="icon" class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md flex items-center justify-center" disabled={allSubChatsLength === 0}>
                <icons_1.ClockIcon class="h-4 w-4"/>
              </button_1.Button>
            </popover_1.PopoverTrigger>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent side="bottom">
            Search chats
            <kbd_1.Kbd>/</kbd_1.Kbd>
          </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>}/>;
}));
function SubChatSelector(_a) {
    var _this = this;
    var onCreateNew = _a.onCreateNew, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b, onBackToChats = _a.onBackToChats, onOpenPreview = _a.onOpenPreview, _c = _a.canOpenPreview, canOpenPreview = _c === void 0 ? false : _c, onOpenDiff = _a.onOpenDiff, _d = _a.canOpenDiff, canOpenDiff = _d === void 0 ? false : _d, _e = _a.isDiffSidebarOpen, isDiffSidebarOpen = _e === void 0 ? false : _e, diffStats = _a.diffStats, onOpenTerminal = _a.onOpenTerminal, _f = _a.canOpenTerminal, canOpenTerminal = _f === void 0 ? false : _f, chatId = _a.chatId;
    // Use shallow comparison to prevent re-renders when arrays have same content
    var _g = (0, sub_chat_store_1.useAgentSubChatStore)((0, shallow_1.useShallow)(function (state) { return ({
        activeSubChatId: state.activeSubChatId,
        openSubChatIds: state.openSubChatIds,
        pinnedSubChatIds: state.pinnedSubChatIds,
        allSubChats: state.allSubChats,
        parentChatId: state.chatId,
        togglePinSubChat: state.togglePinSubChat
    }); })), activeSubChatId = _g.activeSubChatId, openSubChatIds = _g.openSubChatIds, pinnedSubChatIds = _g.pinnedSubChatIds, allSubChats = _g.allSubChats, parentChatId = _g.parentChatId, togglePinSubChat = _g.togglePinSubChat;
    var loadingSubChats = (0, jotai_1.useAtom)(atoms_1.loadingSubChatsAtom)[0];
    var subChatUnseenChanges = (0, jotai_1.useAtomValue)(atoms_1.agentsSubChatUnseenChangesAtom);
    var _h = (0, jotai_1.useAtom)(atoms_1.agentsSubChatsSidebarModeAtom), subChatsSidebarMode = _h[0], setSubChatsSidebarMode = _h[1];
    var pendingQuestionsMap = (0, jotai_1.useAtomValue)(atoms_1.pendingUserQuestionsAtom);
    // Overview sidebar state - to check if widgets are visible
    var isUnifiedSidebarEnabled = (0, jotai_1.useAtomValue)(atoms_2.unifiedSidebarEnabledAtom);
    var chatSourceMode = (0, jotai_1.useAtomValue)(atoms_3.chatSourceModeAtom);
    var widgetVisibilityAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_2.widgetVisibilityAtomFamily)(chatId || ""); });
    var widgetVisibility = (0, jotai_1.useAtomValue)(widgetVisibilityAtom);
    // Show standalone buttons when:
    // 1. Unified sidebar is disabled (use legacy sidebars), OR
    // 2. Unified sidebar is enabled but the widget is hidden by user, OR
    // 3. Sandbox mode (DetailsSidebar doesn't render without worktreePath)
    var showDiffButton = !isUnifiedSidebarEnabled || !widgetVisibility.includes("diff") || chatSourceMode === "sandbox";
    var showTerminalButton = !isUnifiedSidebarEnabled || !widgetVisibility.includes("terminal");
    // Resolved hotkeys for tooltips
    var openDiffHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("open-diff");
    var toggleTerminalHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("toggle-terminal");
    var archiveAgentHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("archive-agent");
    var newAgentHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("new-agent");
    // Pending plan approvals from DB - only for open sub-chats
    var pendingPlanApprovalsData = trpc_1.trpc.chats.getPendingPlanApprovals.useQuery({ openSubChatIds: openSubChatIds }, {
        refetchInterval: 5e3,
        enabled: openSubChatIds.length > 0,
        placeholderData: function (prev) { return prev; }
    }).data;
    var pendingPlanApprovals = (0, solid_js_1.createMemo)(function () {
        var set = new Set();
        if (pendingPlanApprovalsData) {
            for (var _i = 0, pendingPlanApprovalsData_1 = pendingPlanApprovalsData; _i < pendingPlanApprovalsData_1.length; _i++) {
                var subChatId = pendingPlanApprovalsData_1[_i].subChatId;
                set.add(subChatId);
            }
        }
        return set;
    });
    var _j = (0, solid_js_1.createSignal)(null), tabsContainerRef = _j[0], setTabsContainerRef = _j[1];
    var _k = (0, solid_js_1.createSignal)(new Map()), tabRefs = _k[0], setTabRefs = _k[1];
    var _l = (0, solid_js_1.createSignal)(new Map()), textRefs = _l[0], setTextRefs = _l[1];
    // Using refs instead of state for gradients and truncation to avoid re-renders
    var _m = (0, solid_js_1.createSignal)(null), leftGradientRef = _m[0], setLeftGradientRef = _m[1];
    var _o = (0, solid_js_1.createSignal)(null), rightGradientRef = _o[0], setRightGradientRef = _o[1];
    var _p = (0, solid_js_1.createSignal)(new Set()), truncatedTabsRef = _p[0], setTruncatedTabsRef = _p[1];
    var _q = (0, solid_js_1.createSignal)(null), searchHistoryPopoverRef = _q[0], setSearchHistoryPopoverRef = _q[1];
    // Map open IDs to metadata and sort: pinned first, then preserve user's tab order
    var openSubChats = (0, solid_js_1.createMemo)(function () {
        var pinnedChats = [];
        var unpinnedChats = [];
        // Separate pinned and unpinned while preserving order
        openSubChatIds.forEach(function (id) {
            var chat = allSubChats.find(function (sc) { return sc.id === id; });
            if (!chat)
                return;
            if (pinnedSubChatIds.includes(id)) {
                pinnedChats.push(chat);
            }
            else {
                unpinnedChats.push(chat);
            }
        });
        // Sort pinned by recency (most recent first)
        pinnedChats.sort(function (a, b) {
            var aT = new Date(a.updated_at || a.created_at || "0").getTime();
            var bT = new Date(b.updated_at || b.created_at || "0").getTime();
            return bT - aT;
        });
        // Unpinned maintain their order from openSubChatIds (user's tab order)
        return __spreadArray(__spreadArray([], pinnedChats, true), unpinnedChats, true);
    });
    var onSwitch = function (subChatId) {
        var store = sub_chat_store_1.useAgentSubChatStore.getState();
        store.setActiveSubChat(subChatId);
        // Clear unseen indicator for this sub-chat
        var unseen = subChatUnseenChanges();
        if (unseen.has(subChatId)) {
            unseen.delete(subChatId);
        }
    };
    var onSwitchFromHistory = function (subChatId) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var isAlreadyOpen = state.openSubChatIds.includes(subChatId);
        if (!isAlreadyOpen) {
            state.addToOpenSubChats(subChatId);
        }
        state.setActiveSubChat(subChatId);
    };
    var onCloseTab = function (subChatId) {
        sub_chat_store_1.useAgentSubChatStore.getState().removeFromOpenSubChats(subChatId);
    };
    var onCloseOtherTabs = function (subChatId) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var idsToClose = state.openSubChatIds.filter(function (id) { return id !== subChatId; });
        idsToClose.forEach(function (id) { return state.removeFromOpenSubChats(id); });
        state.setActiveSubChat(subChatId);
    };
    var onCloseTabsToRight = function (subChatId, visualIndex) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        // Use visual order from sorted openSubChats, not storage order
        var idsToClose = openSubChats.slice(visualIndex + 1).map(function (sc) { return sc.id; });
        idsToClose.forEach(function (id) { return state.removeFromOpenSubChats(id); });
    };
    var _r = (0, solid_js_1.createSignal)(null), editingSubChatId = _r[0], setEditingSubChatId = _r[1];
    var _s = (0, solid_js_1.createSignal)(""), editName = _s[0], setEditName = _s[1];
    var _t = (0, solid_js_1.createSignal)(false), editLoading = _t[0], setEditLoading = _t[1];
    var renameMutation = mock_api_1.api.agents.renameSubChat.useMutation({
        onSuccess: function (_, variables) {
            // Update local store
            sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(variables.subChatId, variables.name);
        },
        onError: function (error) {
            var _a;
            // Show helpful error message (like Canvas)
            if (((_a = error.data) === null || _a === void 0 ? void 0 : _a.code) === "NOT_FOUND") {
                solid_sonner_1.toast.error("Send a message first before renaming this chat");
            }
            else {
                solid_sonner_1.toast.error("Failed to rename chat");
            }
        }
    });
    var handleRenameClick = function (subChat) {
        // Allow rename attempt, will show toast if not in DB yet (like Canvas)
        setEditingSubChatId(subChat.id);
        setEditName(subChat.name || "");
    };
    var handleEditSave = function (subChat) { return __awaiter(_this, void 0, void 0, function () {
        var trimmedName, oldName, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmedName = editName.trim();
                    // If name hasn't changed, just exit editing mode
                    if (trimmedName === subChat.name) {
                        setEditingSubChatId(null);
                        return [2 /*return*/];
                    }
                    if (!trimmedName) {
                        // Reset to original name if empty
                        setEditName(subChat.name || "");
                        setEditingSubChatId(null);
                        return [2 /*return*/];
                    }
                    oldName = subChat.name;
                    // Optimistic update
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChat.id, trimmedName);
                    setEditLoading(true);
                    setEditingSubChatId(null);
                    setEditName("");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, renameMutation.mutateAsync({
                            subChatId: subChat.id,
                            name: trimmedName
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    // Revert on error (like Canvas)
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChat.id, oldName || "New Chat");
                    return [3 /*break*/, 5];
                case 4:
                    setEditLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleEditCancel = function (subChat) {
        setEditName(subChat.name || "");
        setEditingSubChatId(null);
    };
    var handleSelectFromHistory = function (subChat) {
        onSwitchFromHistory(subChat.id);
    };
    // Hotkey: / to open history popover when sidebar is closed (tabs mode)
    (0, solid_js_1.createEffect)(function () {
        var handleHistoryHotkey = function (e) {
            var _a;
            // Only in tabs mode (sidebar closed)
            if (subChatsSidebarMode !== "tabs")
                return;
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                // Don't trigger if already focused on an input/textarea
                var activeEl = document.activeElement;
                if ((activeEl === null || activeEl === void 0 ? void 0 : activeEl.tagName) === "INPUT" || (activeEl === null || activeEl === void 0 ? void 0 : activeEl.tagName) === "TEXTAREA" || (activeEl === null || activeEl === void 0 ? void 0 : activeEl.hasAttribute("contenteditable"))) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                (_a = searchHistoryPopoverRef.current) === null || _a === void 0 ? void 0 : _a.open();
            }
        };
        window.addEventListener("keydown", handleHistoryHotkey, true);
        return function () { return window.removeEventListener("keydown", handleHistoryHotkey, true); };
    });
    // Keyboard shortcut: Cmd+Shift+T / Ctrl+Shift+T for new sub-chat
    // Scroll to active tab when it changes
    (0, solid_js_1.createEffect)(function () {
        if (!activeSubChatId || !tabsContainerRef.current)
            return;
        var container = tabsContainerRef.current;
        var activeTabElement = tabRefs.current.get(activeSubChatId);
        if (activeTabElement) {
            setTimeout(function () {
                var containerRect = container.getBoundingClientRect();
                var tabRect = activeTabElement.getBoundingClientRect();
                var isTabLeftOfView = tabRect.left < containerRect.left;
                var isTabRightOfView = tabRect.right > containerRect.right;
                if (isTabLeftOfView || isTabRightOfView) {
                    var tabCenter = activeTabElement.offsetLeft + activeTabElement.offsetWidth / 2;
                    var containerCenter = container.offsetWidth / 2;
                    var targetScroll = tabCenter - containerCenter;
                    var maxScroll = container.scrollWidth - container.offsetWidth;
                    var clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
                    container.scrollTo({
                        left: clampedScroll,
                        behavior: "smooth"
                    });
                }
            }, 0);
        }
    });
    // Check if text is truncated for each tab - updates ref and DOM directly
    (0, solid_js_1.createEffect)(function () {
        var checkTruncation = function () {
            var newTruncated = new Set();
            textRefs.current.forEach(function (el, subChatId) {
                if (el && el.scrollWidth > el.clientWidth) {
                    newTruncated.add(subChatId);
                }
            });
            truncatedTabsRef.current = newTruncated;
            // Update gradient visibility for each tab via DOM
            tabRefs.current.forEach(function (tabEl, subChatId) {
                var gradientEl = tabEl.querySelector("[data-truncate-gradient]");
                if (gradientEl) {
                    gradientEl.style.display = newTruncated.has(subChatId) ? "block" : "none";
                }
            });
        };
        checkTruncation();
        var resizeObserver = new ResizeObserver(function () { return checkTruncation(); });
        textRefs.current.forEach(function (el) { return el && resizeObserver.observe(el); });
        return function () { return resizeObserver.disconnect(); };
    });
    // Sort sub-chats by most recent first for history
    var sortedSubChats = (0, solid_js_1.createMemo)(function () { return __spreadArray([], allSubChats, true).sort(function (a, b) {
        var aT = new Date(a.updated_at || a.created_at || "0").getTime();
        var bT = new Date(b.updated_at || b.created_at || "0").getTime();
        return bT - aT;
    }); });
    var hasNoChats = openSubChats.length === 0;
    var hasSingleChat = openSubChats.length === 1;
    // Check scroll position for gradients - uses direct DOM manipulation
    var checkScrollPosition = function () {
        var container = tabsContainerRef.current;
        if (!container)
            return;
        var scrollLeft = container.scrollLeft, scrollWidth = container.scrollWidth, clientWidth = container.clientWidth;
        var isScrollable = scrollWidth > clientWidth;
        var showLeft = isScrollable && scrollLeft > 0;
        var showRight = isScrollable && scrollLeft < scrollWidth - clientWidth - 1;
        if (leftGradientRef.current) {
            leftGradientRef.current.style.display = showLeft ? "block" : "none";
        }
        if (rightGradientRef.current) {
            rightGradientRef.current.style.display = showRight ? "block" : "none";
        }
    };
    // Update gradients on scroll
    (0, solid_js_1.createEffect)(function () {
        var container = tabsContainerRef.current;
        if (!container)
            return;
        checkScrollPosition();
        container.addEventListener("scroll", checkScrollPosition, { passive: true });
        return function () { return container.removeEventListener("scroll", checkScrollPosition); };
    });
    // Update gradients when tabs change
    (0, solid_js_1.createEffect)(function () {
        checkScrollPosition();
    });
    // Update gradients on window resize
    (0, solid_js_1.createEffect)(function () {
        var handleResize = function () { return checkScrollPosition(); };
        window.addEventListener("resize", handleResize);
        return function () { return window.removeEventListener("resize", handleResize); };
    });
    // Cleanup refs for closed tabs to prevent memory leaks
    (0, solid_js_1.createEffect)(function () {
        var openIds = new Set(openSubChatIds);
        // Remove refs for tabs that are no longer open
        tabRefs.current.forEach(function (_, id) {
            if (!openIds.has(id)) {
                tabRefs.current.delete(id);
                textRefs.current.delete(id);
            }
        });
    });
    return <div class="flex items-center gap-1 h-7 w-full" style={{ WebkitAppRegion: "drag" }}>
      {/* Burger button - hidden when sub-chats sidebar is open (it moves into sidebar) */}
      {onBackToChats && subChatsSidebarMode === "tabs" && <button_1.Button variant="ghost" size="icon" onClick={onBackToChats} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label="Back to chats" style={{ WebkitAppRegion: "no-drag" }}>
          <lucide_solid_1.AlignJustify class="h-4 w-4"/>
          <span class="sr-only">Back to chats</span>
        </button_1.Button>}

      {/* Open sidebar button - only on desktop when in tabs mode */}
      {!isMobile && subChatsSidebarMode === "tabs" && <tooltip_1.Tooltip>
          <tooltip_1.TooltipTrigger asChild>
            <button_1.Button variant="ghost" size="icon" onClick={function () { return setSubChatsSidebarMode("sidebar"); }} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md flex items-center justify-center" style={{ WebkitAppRegion: "no-drag" }}>
              <icons_1.IconOpenSidebarRight class="h-4 w-4 scale-x-[-1]"/>
            </button_1.Button>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent side="bottom">Open chats pane</tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>}

      <div class="relative flex-1 min-w-0 flex items-center" style={{ WebkitAppRegion: "no-drag" }}>
        {/* Left gradient - visibility controlled via ref */}
        <div ref={leftGradientRef} class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-30" style={{ display: "none" }}/>

        {/* Scrollable tabs container - with padding-right for plus button */}
        <div ref={tabsContainerRef} class={(0, utils_1.cn)("flex items-center px-1 py-1 -my-1 gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide pr-12", 
        // Hide tabs when sidebar is open (desktop) or when only one chat exists
        subChatsSidebarMode === "sidebar" && !isMobile && "hidden", hasSingleChat && "hidden")}>
          {hasNoChats ? null : openSubChats.map(function (subChat, index) {
            var isActive = activeSubChatId === subChat.id;
            var isLoading = loadingSubChats.has(subChat.id);
            var hasUnseen = subChatUnseenChanges.has(subChat.id);
            var hasTabsToRight = index < openSubChats.length - 1;
            var isPinned = pinnedSubChatIds.includes(subChat.id);
            // Get mode from sub-chat itself (defaults to "agent")
            var mode = subChat.mode || "agent";
            // Check if this chat is waiting for user answer
            var hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
            // Check if this chat has a pending plan approval
            var hasPendingPlan = pendingPlanApprovals.has(subChat.id);
            return <context_menu_1.ContextMenu key={subChat.id}>
                    <context_menu_1.ContextMenuTrigger asChild>
                      <button ref={function (el) {
                    if (el) {
                        tabRefs.current.set(subChat.id, el);
                    }
                    else {
                        tabRefs.current.delete(subChat.id);
                    }
                }} onClick={function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (editingSubChatId !== subChat.id) {
                        onSwitch(subChat.id);
                    }
                }} onMouseDown={function (e) {
                    // Middle-click to close tab (like Chrome)
                    if (e.button === 1 && openSubChats.length > 1) {
                        e.preventDefault();
                        e.stopPropagation();
                        onCloseTab(subChat.id);
                    }
                }} onAuxClick={function (e) {
                    // Prevent context menu on middle-click
                    if (e.button === 1) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }} onDoubleClick={function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (editingSubChatId !== subChat.id) {
                        handleRenameClick(subChat);
                    }
                }} class={(0, utils_1.cn)("group relative flex items-center text-sm rounded-md transition-colors duration-75 cursor-pointer h-6 flex-shrink-0", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", editingSubChatId === subChat.id ? "overflow-visible px-0" : "overflow-hidden px-1.5 py-0.5 whitespace-nowrap min-w-[50px] gap-1.5", isActive ? "bg-muted text-foreground max-w-[180px]" : "hover:bg-muted/80 max-w-[150px]")}>
                        {/* Icon: question icon (priority) OR loading spinner OR mode icon with badge (hide when editing) */}
                        {editingSubChatId !== subChat.id && <div class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center relative">
                            {hasPendingQuestion ? <icons_1.QuestionIcon class="w-3.5 h-3.5 text-blue-500"/> : isLoading ? <icons_1.IconSpinner class="w-3.5 h-3.5 text-muted-foreground"/> : <>
                                {/* Main mode icon */}
                                {mode === "plan" ? <icons_1.PlanIcon class="w-3.5 h-3.5 text-muted-foreground"/> : <icons_1.AgentIcon class="w-3.5 h-3.5 text-muted-foreground"/>}
                                {/* Badge in bottom-right corner: amber dot (plan) > unseen dot > pin icon */}
                                {(hasPendingPlan || hasUnseen || isPinned) && <div class={(0, utils_1.cn)("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center", isActive ? "bg-muted" : "bg-background")}>
                                    {hasPendingPlan ? <div class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : hasUnseen ? <div class="w-1.5 h-1.5 rounded-full bg-[#307BD0]"/> : isPinned ? <icons_1.PinFilledIcon class="w-2 h-2 text-muted-foreground"/> : null}
                                  </div>}
                              </>}
                          </div>}

                        {editingSubChatId === subChat.id ? <inline_edit_1.InlineEdit value={editName} onChange={setEditName} onSave={function () { return handleEditSave(subChat); }} onCancel={function () { return handleEditCancel(subChat); }} isEditing={true} disabled={editLoading} class="text-sm !px-1 !py-0 !h-6 min-w-[100px] border border-input rounded-md !ring-0 !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!border-input"/> : <span ref={function (el) {
                        if (el) {
                            textRefs.current.set(subChat.id, el);
                        }
                        else {
                            textRefs.current.delete(subChat.id);
                        }
                    }} class="relative z-0 text-left flex-1 min-w-0 pr-1 overflow-hidden block whitespace-nowrap">
                            {subChat.name || "New Chat"}
                          </span>}

                        {/* Gradient fade on the right when text is truncated and not editing - visibility controlled via DOM */}
                        {editingSubChatId !== subChat.id && <div data-truncate-gradient class={(0, utils_1.cn)("absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-[1] rounded-r-md opacity-100 group-hover:opacity-0 transition-opacity duration-200", isActive ? "bg-gradient-to-l from-muted to-transparent" : "bg-gradient-to-l from-background to-transparent")} style={{ display: truncatedTabsRef.current.has(subChat.id) ? "block" : "none" }}/>}

                        {/* Close button - only show when hovered and multiple tabs and not editing */}
                        {openSubChats.length > 1 && editingSubChatId !== subChat.id && <div class="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <div class={(0, utils_1.cn)("absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center rounded-r-md", isActive ? "bg-[linear-gradient(to_left,hsl(var(--muted))_0%,hsl(var(--muted))_60%,transparent_100%)]" : "bg-[linear-gradient(to_left,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_0%,color-mix(in_srgb,hsl(var(--muted))_80%,hsl(var(--background)))_60%,transparent_100%)]")}/>
                              <span role="button" tabIndex={-1} onClick={function (e) {
                        e.stopPropagation();
                        onCloseTab(subChat.id);
                    }} class="relative z-20 hover:text-foreground rounded p-0.5 transition-[color,transform] duration-150 ease-out active:scale-[0.97] cursor-pointer" title={isActive && archiveAgentHotkey ? "Close tab (".concat(archiveAgentHotkey, ")") : "Close tab"}>
                                <lucide_solid_1.X class="h-3 w-3"/>
                              </span>
                            </div>}
                      </button>
                    </context_menu_1.ContextMenuTrigger>
                    <sub_chat_context_menu_1.SubChatContextMenu subChat={subChat} isPinned={isPinned} onTogglePin={togglePinSubChat} onRename={handleRenameClick} onArchive={onCloseTab} onArchiveOthers={onCloseOtherTabs} isOnlyChat={openSubChats.length === 1} showCloseTabOptions={true} onCloseTab={onCloseTab} onCloseOtherTabs={onCloseOtherTabs} onCloseTabsToRight={onCloseTabsToRight} visualIndex={index} hasTabsToRight={hasTabsToRight} canCloseOtherTabs={openSubChats.length > 2} chatId={parentChatId}/>
                  </context_menu_1.ContextMenu>;
        })}
        </div>

        {/* Plus button - absolute positioned on right with gradient cover */}
        {(isMobile || !isMobile && subChatsSidebarMode === "tabs") && <div class="absolute right-0 top-0 bottom-0 flex items-center z-20">
            {/* Gradient to cover content peeking from the left */}
            <div class="w-6 h-full bg-gradient-to-r from-transparent to-background"/>
            <div class="h-full flex items-center bg-background pr-1">
              <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                  <button_1.Button variant="ghost" size="icon" onClick={onCreateNew} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] rounded-md">
                    <lucide_solid_1.Plus class="h-4 w-4"/>
                  </button_1.Button>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent side="bottom">
                  New chat
                  {newAgentHotkey && <kbd_1.Kbd>{newAgentHotkey}</kbd_1.Kbd>}
                </tooltip_1.TooltipContent>
              </tooltip_1.Tooltip>
            </div>
          </div>}
      </div>

      {/* Action buttons - always visible on mobile, on desktop only in tabs mode */}
      {(isMobile || !isMobile && subChatsSidebarMode === "tabs") && <div class="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" }}>
          <SearchHistoryPopover ref={searchHistoryPopoverRef} sortedSubChats={sortedSubChats} loadingSubChats={loadingSubChats} subChatUnseenChanges={subChatUnseenChanges} pendingQuestionsMap={pendingQuestionsMap} pendingPlanApprovals={pendingPlanApprovals} allSubChatsLength={allSubChats.length} onSelect={handleSelectFromHistory}/>
        </div>}

      {/* Diff button - visible on desktop when unified sidebar is disabled OR diff widget is hidden */}
      {/* Only show if onOpenDiff is provided (clickable action available) */}
      {!isMobile && canOpenDiff && showDiffButton && onOpenDiff && <div class="rounded-md bg-background/10 backdrop-blur-[10px] flex items-center justify-center" style={{ WebkitAppRegion: "no-drag" }}>
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button variant="ghost" size="icon" onClick={function () { return onOpenDiff === null || onOpenDiff === void 0 ? void 0 : onOpenDiff(); }} class="h-6 w-6 p-0 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md flex items-center justify-center hover:bg-foreground/10">
                <icons_1.DiffIcon class="h-4 w-4"/>
                <span class="sr-only">Open diff</span>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="bottom">
              <span>View changes</span>
              {openDiffHotkey && <kbd_1.Kbd>{openDiffHotkey}</kbd_1.Kbd>}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>}

      {/* Terminal button - visible on desktop when unified sidebar is disabled OR terminal widget is hidden */}
      {!isMobile && canOpenTerminal && showTerminalButton && <div class="rounded-md bg-background/10 backdrop-blur-[10px] flex items-center justify-center" style={{ WebkitAppRegion: "no-drag" }}>
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button_1.Button variant="ghost" size="icon" onClick={function () { return onOpenTerminal === null || onOpenTerminal === void 0 ? void 0 : onOpenTerminal(); }} class="h-6 w-6 p-0 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md flex items-center justify-center hover:bg-foreground/10">
                <lucide_solid_1.TerminalSquare class="h-4 w-4"/>
                <span class="sr-only">Open terminal</span>
              </button_1.Button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="bottom">
              <span>Open terminal</span>
              {toggleTerminalHotkey && <kbd_1.Kbd>{toggleTerminalHotkey}</kbd_1.Kbd>}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </div>}

      {/* Diff button - only on mobile when diff is available */}
      {isMobile && onOpenDiff && canOpenDiff && <div class="rounded-md bg-background/10 backdrop-blur-[10px] flex items-center justify-center" style={{ WebkitAppRegion: "no-drag" }}>
          <button_1.Button variant="ghost" size="icon" onClick={onOpenDiff} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 flex items-center justify-center">
            <icons_1.DiffIcon class="h-4 w-4"/>
            <span class="sr-only">Open diff</span>
          </button_1.Button>
        </div>}

      {/* Play button - only on mobile when preview is available */}
      {isMobile && onOpenPreview && canOpenPreview && <div class="rounded-md bg-background/10 backdrop-blur-[10px] flex items-center justify-center" style={{ WebkitAppRegion: "no-drag" }}>
          <button_1.Button variant="ghost" size="icon" onClick={onOpenPreview} class="h-7 w-7 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 flex items-center justify-center">
            <lucide_solid_1.Play class="h-4 w-4"/>
            <span class="sr-only">Open preview</span>
          </button_1.Button>
        </div>}

    </div>;
}
