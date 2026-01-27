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
exports.AgentsSubChatsSidebar = AgentsSubChatsSidebar;
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var jotai_1 = require("../../lib/state/jotai");
var react_1 = require("motion/react");
var button_1 = require("../../components/ui/button");
var input_1 = require("../../components/ui/input");
var utils_1 = require("../../lib/utils");
var atoms_1 = require("../agents/atoms");
var atoms_2 = require("../../lib/atoms");
var trpc_1 = require("../../lib/trpc");
var jotai_store_1 = require("../../lib/jotai-store");
var sub_chat_store_1 = require("../agents/stores/sub-chat-store");
var shallow_1 = require("zustand/react/shallow");
var icons_1 = require("../../components/ui/icons");
var tooltip_1 = require("../../components/ui/tooltip");
var kbd_1 = require("../../components/ui/kbd");
var hotkeys_1 = require("../../lib/hotkeys");
var traffic_light_spacer_1 = require("../agents/components/traffic-light-spacer");
var popover_1 = require("../../components/ui/popover");
var lucide_solid_1 = require("lucide-solid");
var context_menu_1 = require("../../components/ui/context-menu");
var alert_dialog_1 = require("../../components/ui/alert-dialog");
var mock_api_1 = require("../../lib/mock-api");
var trpc_2 = require("../../lib/trpc");
var solid_sonner_1 = require("solid-sonner");
var agents_rename_subchat_dialog_1 = require("../agents/components/agents-rename-subchat-dialog");
var search_combobox_1 = require("../../components/ui/search-combobox");
var sub_chat_context_menu_1 = require("../agents/ui/sub-chat-context-menu");
var format_time_ago_1 = require("../agents/utils/format-time-ago");
var pluralize_1 = require("../agents/utils/pluralize");
var react_hotkeys_hook_1 = require("react-hotkeys-hook");
var drafts_1 = require("../agents/lib/drafts");
var checkbox_1 = require("../../components/ui/checkbox");
var typewriter_text_1 = require("../../components/ui/typewriter-text");
var SidebarSearchHistoryPopover = (0, solid_js_1.memo)(function SidebarSearchHistoryPopover(_a) {
    var sortedSubChats = _a.sortedSubChats, loadingSubChats = _a.loadingSubChats, subChatUnseenChanges = _a.subChatUnseenChanges, pendingQuestionsMap = _a.pendingQuestionsMap, allSubChatsLength = _a.allSubChatsLength, onSelect = _a.onSelect;
    var _b = (0, solid_js_1.createSignal)(false), isHistoryOpen = _b[0], setIsHistoryOpen = _b[1];
    var renderItem = function (subChat) {
        var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
        var isLoading = loadingSubChats.has(subChat.id);
        var hasUnseen = subChatUnseenChanges().has(subChat.id);
        var mode = subChat.mode || "agent";
        var hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
        return <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
          {hasPendingQuestion ? <icons_1.QuestionIcon class="w-4 h-4 text-blue-500"/> : isLoading ? <icons_1.IconSpinner class="w-4 h-4 text-muted-foreground"/> : mode === "plan" ? <icons_1.PlanIcon class="w-4 h-4 text-muted-foreground"/> : <icons_1.AgentIcon class="w-4 h-4 text-muted-foreground"/>}
          {hasUnseen && !isLoading && !hasPendingQuestion && <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-popover flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-[#307BD0]"/>
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
    return <search_combobox_1.SearchCombobox isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} items={sortedSubChats} onSelect={onSelect} placeholder="Search chats..." emptyMessage="No results" getItemValue={function (subChat) { return "".concat(subChat.name || "New Chat", " ").concat(subChat.id); }} renderItem={renderItem} side="bottom" align="end" sideOffset={4} collisionPadding={16} trigger={<tooltip_1.Tooltip delayDuration={500}>
          <tooltip_1.TooltipTrigger asChild>
            <popover_1.PopoverTrigger asChild>
              <button_1.Button variant="ghost" size="icon" class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" disabled={allSubChatsLength === 0}>
                <icons_1.ClockIcon class="h-4 w-4"/>
              </button_1.Button>
            </popover_1.PopoverTrigger>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent side="bottom">Chat history</tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>}/>;
});
function AgentsSubChatsSidebar(_a) {
    var _this = this;
    var onClose = _a.onClose, _b = _a.isMobile, isMobile = _b === void 0 ? false : _b, onBackToChats = _a.onBackToChats, _c = _a.isSidebarOpen, isSidebarOpen = _c === void 0 ? false : _c, _d = _a.isLoading, isLoading = _d === void 0 ? false : _d, agentName = _a.agentName;
    // Use shallow comparison to prevent re-renders when arrays have same content
    var _e = (0, sub_chat_store_1.useAgentSubChatStore)((0, shallow_1.useShallow)(function (state) { return ({
        activeSubChatId: state.activeSubChatId,
        openSubChatIds: state.openSubChatIds,
        pinnedSubChatIds: state.pinnedSubChatIds,
        allSubChats: state.allSubChats,
        parentChatId: state.chatId,
        togglePinSubChat: state.togglePinSubChat
    }); })), activeSubChatId = _e.activeSubChatId, openSubChatIds = _e.openSubChatIds, pinnedSubChatIds = _e.pinnedSubChatIds, allSubChats = _e.allSubChats, parentChatId = _e.parentChatId, togglePinSubChat = _e.togglePinSubChat;
    var loadingSubChats = (0, jotai_1.useAtom)(atoms_1.loadingSubChatsAtom)[0];
    var subChatFiles = (0, jotai_1.useAtomValue)(atoms_1.subChatFilesAtom);
    var selectedTeamId = (0, jotai_1.useAtomValue)(atoms_2.selectedTeamIdAtom);
    var _f = (0, jotai_1.useAtom)(atoms_1.selectedAgentChatIdAtom), selectedChatId = _f[0], setSelectedChatId = _f[1];
    var previousChatId = (0, jotai_1.useAtomValue)(atoms_1.previousAgentChatIdAtom);
    // Fetch agent chats for navigation after archive
    var agentChats = mock_api_1.api.agents.getAgentChats.useQuery({ teamId: selectedTeamId }, { enabled: !!selectedTeamId }).data;
    var utils = trpc_1.trpc.useUtils();
    // SubChat name tooltip - using refs instead of state to avoid re-renders on hover
    // Declared here so they can be used in archive mutation's onSuccess
    var _g = (0, solid_js_1.createSignal)(new Map()), subChatNameRefs = _g[0], setSubChatNameRefs = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), subChatTooltipTimerRef = _h[0], setSubChatTooltipTimerRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), tooltipRef = _j[0], setTooltipRef = _j[1];
    // Archive parent chat mutation
    var archiveChatMutation = trpc_1.trpc.chats.archive.useMutation({ onSuccess: function (_, variables) {
            // Hide tooltip if visible (element may be removed from DOM before mouseLeave fires)
            if (subChatTooltipTimerRef.current) {
                clearTimeout(subChatTooltipTimerRef.current);
                subChatTooltipTimerRef.current = null;
            }
            if (tooltipRef.current) {
                tooltipRef.current.style.display = "none";
            }
            utils.chats.list.invalidate();
            utils.chats.listArchived.invalidate();
            // Navigate to previous chat or new workspace
            if (selectedChatId === variables.id) {
                var isPreviousAvailable = previousChatId && (agentChats === null || agentChats === void 0 ? void 0 : agentChats.some(function (c) { return c.id === previousChatId; }));
                if (isPreviousAvailable) {
                    setSelectedChatId(previousChatId);
                }
                else {
                    setSelectedChatId(null);
                }
            }
        } });
    var subChatUnseenChanges = (0, jotai_1.useAtomValue)(atoms_1.agentsSubChatUnseenChangesAtom);
    // Resolved hotkey for tooltip
    var newAgentHotkey = (0, hotkeys_1.useResolvedHotkeyDisplay)("new-agent");
    var justCreatedIds = (0, jotai_1.useAtomValue)(atoms_1.justCreatedIdsAtom);
    var pendingQuestionsMap = (0, jotai_1.useAtomValue)(atoms_1.pendingUserQuestionsAtom);
    var defaultAgentMode = (0, jotai_1.useAtomValue)(atoms_2.defaultAgentModeAtom);
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
    // Unified undo stack for Cmd+Z support
    var setUndoStack = (0, jotai_1.useSetAtom)(atoms_1.undoStackAtom);
    var _k = (0, solid_js_1.createSignal)(""), searchQuery = _k[0], setSearchQuery = _k[1];
    var _l = (0, solid_js_1.createSignal)(-1), focusedChatIndex = _l[0], setFocusedChatIndex = _l[1];
    var _m = (0, solid_js_1.createSignal)(null), searchInputRef = _m[0], setSearchInputRef = _m[1];
    var _o = (0, solid_js_1.createSignal)(null), scrollContainerRef = _o[0], setScrollContainerRef = _o[1];
    var _p = (0, solid_js_1.createSignal)(false), renameDialogOpen = _p[0], setRenameDialogOpen = _p[1];
    var _q = (0, solid_js_1.createSignal)(null), renamingSubChat = _q[0], setRenamingSubChat = _q[1];
    var _r = (0, solid_js_1.createSignal)(false), renameLoading = _r[0], setRenameLoading = _r[1];
    var _s = (0, solid_js_1.createSignal)(false), showTopGradient = _s[0], setShowTopGradient = _s[1];
    var _t = (0, solid_js_1.createSignal)(false), showBottomGradient = _t[0], setShowBottomGradient = _t[1];
    // Using ref instead of state to avoid re-renders on hover
    var _u = (0, solid_js_1.createSignal)(-1), hoveredChatIndexRef = _u[0], setHoveredChatIndexRef = _u[1];
    var _v = (0, solid_js_1.createSignal)(false), archiveAgentDialogOpen = _v[0], setArchiveAgentDialogOpen = _v[1];
    var _w = (0, solid_js_1.createSignal)(null), subChatToArchive = _w[0], setSubChatToArchive = _w[1];
    // Multi-select state
    var _x = (0, jotai_1.useAtom)(atoms_2.selectedSubChatIdsAtom), selectedSubChatIds = _x[0], setSelectedSubChatIds = _x[1];
    var isMultiSelectMode = (0, jotai_1.useAtomValue)(atoms_2.isSubChatMultiSelectModeAtom);
    var selectedSubChatsCount = (0, jotai_1.useAtomValue)(atoms_2.selectedSubChatsCountAtom);
    var toggleSubChatSelection = (0, jotai_1.useSetAtom)(atoms_2.toggleSubChatSelectionAtom);
    var selectAllSubChats = (0, jotai_1.useSetAtom)(atoms_2.selectAllSubChatsAtom);
    var clearSubChatSelection = (0, jotai_1.useSetAtom)(atoms_2.clearSubChatSelectionAtom);
    // Global desktop/fullscreen state from atoms (initialized in AgentsLayout)
    var isDesktop = (0, jotai_1.useAtomValue)(atoms_2.isDesktopAtom);
    var isFullscreen = (0, jotai_1.useAtomValue)(atoms_2.isFullscreenAtom);
    // Chat source mode: "local" or "sandbox"
    var chatSourceMode = (0, jotai_1.useAtomValue)(atoms_2.chatSourceModeAtom);
    // Map open IDs to metadata and sort by updated_at (most recent first)
    var openSubChats = (0, solid_js_1.createMemo)(function () {
        var chats = openSubChatIds.map(function (id) { return allSubChats.find(function (sc) { return sc.id === id; }); }).filter(function (sc) { return !!sc; }).sort(function (a, b) {
            var aT = new Date(a.updated_at || a.created_at || "0").getTime();
            var bT = new Date(b.updated_at || b.created_at || "0").getTime();
            return bT - aT;
        });
        return chats;
    });
    // Filter and separate pinned/unpinned sub-chats
    var _y = (0, solid_js_1.createMemo)(function () {
        var filtered = searchQuery.trim() ? openSubChats.filter(function (chat) { return chat.name.toLowerCase().includes(searchQuery.toLowerCase()); }) : openSubChats;
        var pinned = filtered.filter(function (chat) { return pinnedSubChatIds.includes(chat.id); });
        var unpinned = filtered.filter(function (chat) { return !pinnedSubChatIds.includes(chat.id); });
        return {
            pinnedChats: pinned,
            unpinnedChats: unpinned
        };
    }), pinnedChats = _y.pinnedChats, unpinnedChats = _y.unpinnedChats;
    var filteredSubChats = (0, solid_js_1.createMemo)(function () {
        return __spreadArray(__spreadArray([], pinnedChats, true), unpinnedChats, true);
    });
    // Reset focused index when search query changes
    solid_js_1.default.useEffect(function () {
        setFocusedChatIndex(-1);
    }, [searchQuery, filteredSubChats.length]);
    // Scroll focused item into view
    solid_js_1.default.useEffect(function () {
        var _a;
        if (focusedChatIndex >= 0 && filteredSubChats.length > 0) {
            var focusedElement = (_a = scrollContainerRef.current) === null || _a === void 0 ? void 0 : _a.querySelector("[data-subchat-index=\"".concat(focusedChatIndex, "\"]"));
            if (focusedElement) {
                focusedElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth"
                });
            }
        }
    }, [focusedChatIndex, filteredSubChats.length]);
    // Unified scroll handler for gradients (works with both event and direct calls)
    var updateScrollGradients = function (element) {
        var container = element || scrollContainerRef.current;
        if (!container)
            return;
        var scrollTop = container.scrollTop, scrollHeight = container.scrollHeight, clientHeight = container.clientHeight;
        var isScrollable = scrollHeight > clientHeight;
        if (!isScrollable) {
            setShowBottomGradient(false);
            setShowTopGradient(false);
            return;
        }
        var threshold = 5;
        var isAtTop = scrollTop <= threshold;
        var isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        setShowTopGradient(!isAtTop);
        setShowBottomGradient(!isAtBottom);
    };
    // Handler for React onScroll event
    var handleScroll = function (e) {
        updateScrollGradients(e.currentTarget);
    };
    // Initialize gradients on mount and observe container size changes
    solid_js_1.default.useEffect(function () {
        var container = scrollContainerRef.current;
        if (!container)
            return;
        updateScrollGradients();
        var resizeObserver = new ResizeObserver(function () { return updateScrollGradients(); });
        resizeObserver.observe(container);
        return function () { return resizeObserver.disconnect(); };
    }, [filteredSubChats, updateScrollGradients]);
    // Hotkey: / to focus search input (only when sidebar is visible and input not focused)
    solid_js_1.default.useEffect(function () {
        var handleSearchHotkey = function (e) {
            var _a, _b;
            // Only trigger if / is pressed without Cmd/Ctrl/Alt
            // Note: e.key automatically handles keyboard layouts (Shift is not checked, allowing international layouts)
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
                // Don't trigger if already focused on an input/textarea
                var activeEl = document.activeElement;
                if ((activeEl === null || activeEl === void 0 ? void 0 : activeEl.tagName) === "INPUT" || (activeEl === null || activeEl === void 0 ? void 0 : activeEl.tagName) === "TEXTAREA" || (activeEl === null || activeEl === void 0 ? void 0 : activeEl.hasAttribute("contenteditable"))) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                (_b = searchInputRef.current) === null || _b === void 0 ? void 0 : _b.select();
            }
        };
        // Use capture phase to intercept before other handlers (e.g., prompt input)
        // Cleanup is guaranteed on unmount to prevent memory leaks
        window.addEventListener("keydown", handleSearchHotkey, { capture: true });
        return function () { return window.removeEventListener("keydown", handleSearchHotkey, { capture: true }); };
        // Empty deps: handler is stable and uses only ref which doesn't need tracking
    }, []);
    // Derive which sub-chats are loading (keys = subChatIds)
    var loadingChatIds = (0, solid_js_1.createMemo)(function () { return new Set(__spreadArray([], loadingSubChats.keys(), true)); });
    var handleSubChatClick = function (subChatId) {
        var store = sub_chat_store_1.useAgentSubChatStore.getState();
        store.setActiveSubChat(subChatId);
        // Clear unseen indicator for this sub-chat
        subChatUnseenChanges().delete(subChatId);
    };
    var handleArchiveSubChat = function (subChatId) {
        // If this is the last open subchat, show confirmation dialog
        if (openSubChats.length === 1) {
            var subChat = allSubChats.find(function (sc) { return sc.id === subChatId; });
            if (subChat) {
                setSubChatToArchive(subChat);
                setArchiveAgentDialogOpen(true);
            }
            return;
        }
        // Archive = remove from open tabs (but keep in allSubChats for history)
        sub_chat_store_1.useAgentSubChatStore.getState().removeFromOpenSubChats(subChatId);
        // Add to unified undo stack for Cmd+Z
        if (parentChatId) {
            var timeoutId_1 = setTimeout(function () {
                setUndoStack(function (prev) { return prev.filter(function (item) { return !(item.type === "subchat" && item.subChatId === subChatId); }); });
            }, 1e4);
            setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), [{
                    type: "subchat",
                    subChatId: subChatId,
                    chatId: parentChatId,
                    timeoutId: timeoutId_1
                }], false); });
        }
    };
    var handleConfirmArchiveAgent = function () {
        if (parentChatId) {
            // Archive the parent agent chat
            archiveChatMutation.mutate({ id: parentChatId });
        }
        setArchiveAgentDialogOpen(false);
        setSubChatToArchive(null);
    };
    // Handle sub-chat card hover for truncated name tooltip (1s delay)
    // Uses direct DOM manipulation instead of state to avoid re-renders
    var handleSubChatMouseEnter = function (subChatId, name, cardElement) {
        // Clear any existing timer
        if (subChatTooltipTimerRef.current) {
            clearTimeout(subChatTooltipTimerRef.current);
        }
        var nameEl = subChatNameRefs.current.get(subChatId);
        if (!nameEl)
            return;
        // Check if name is truncated
        var isTruncated = nameEl.scrollWidth > nameEl.clientWidth;
        if (!isTruncated)
            return;
        // Show tooltip after 1 second delay via DOM manipulation (no state update)
        subChatTooltipTimerRef.current = setTimeout(function () {
            var tooltip = tooltipRef.current;
            if (!tooltip)
                return;
            var rect = cardElement.getBoundingClientRect();
            tooltip.style.display = "block";
            tooltip.style.top = "".concat(rect.top + rect.height / 2, "px");
            tooltip.style.left = "".concat(rect.right + 8, "px");
            tooltip.textContent = name;
        }, 1e3);
    };
    var handleSubChatMouseLeave = function () {
        // Clear timer if hovering ends before delay
        if (subChatTooltipTimerRef.current) {
            clearTimeout(subChatTooltipTimerRef.current);
            subChatTooltipTimerRef.current = null;
        }
        // Hide tooltip via DOM - no state update, no re-render
        var tooltip = tooltipRef.current;
        if (tooltip) {
            tooltip.style.display = "none";
        }
    };
    var handleArchiveAllBelow = function (subChatId) {
        var currentIndex = filteredSubChats.findIndex(function (c) { return c.id === subChatId; });
        if (currentIndex === -1 || currentIndex === filteredSubChats.length - 1)
            return;
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var idsToClose = filteredSubChats.slice(currentIndex + 1).map(function (c) { return c.id; });
        idsToClose.forEach(function (id) { return state.removeFromOpenSubChats(id); });
        // Add each to unified undo stack for Cmd+Z
        if (parentChatId) {
            var newItems_1 = idsToClose.map(function (id) {
                var timeoutId = setTimeout(function () {
                    setUndoStack(function (prev) { return prev.filter(function (item) { return !(item.type === "subchat" && item.subChatId === id); }); });
                }, 1e4);
                return {
                    type: "subchat",
                    subChatId: id,
                    chatId: parentChatId,
                    timeoutId: timeoutId
                };
            });
            setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems_1, true); });
        }
    };
    var onCloseOtherChats = function (subChatId) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var idsToClose = state.openSubChatIds.filter(function (id) { return id !== subChatId; });
        idsToClose.forEach(function (id) { return state.removeFromOpenSubChats(id); });
        state.setActiveSubChat(subChatId);
        // Add each to unified undo stack for Cmd+Z
        if (parentChatId) {
            var newItems_2 = idsToClose.map(function (id) {
                var timeoutId = setTimeout(function () {
                    setUndoStack(function (prev) { return prev.filter(function (item) { return !(item.type === "subchat" && item.subChatId === id); }); });
                }, 1e4);
                return {
                    type: "subchat",
                    subChatId: id,
                    chatId: parentChatId,
                    timeoutId: timeoutId
                };
            });
            setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems_2, true); });
        }
    };
    var renameMutation = mock_api_1.api.agents.renameSubChat.useMutation({ onError: function (error) {
            var _a;
            if (((_a = error.data) === null || _a === void 0 ? void 0 : _a.code) === "NOT_FOUND") {
                solid_sonner_1.toast.error("Send a message first before renaming this chat");
            }
            else {
                solid_sonner_1.toast.error("Failed to rename chat");
            }
        } });
    var handleRenameClick = function (subChat) {
        setRenamingSubChat(subChat);
        setRenameDialogOpen(true);
    };
    var handleRenameSave = function (newName) { return __awaiter(_this, void 0, void 0, function () {
        var subChatId, oldName, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!renamingSubChat)
                        return [2 /*return*/];
                    subChatId = renamingSubChat.id;
                    oldName = renamingSubChat.name;
                    // Optimistically update store
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChatId, newName);
                    // Remove from justCreatedIds to prevent typewriter animation on manual rename
                    justCreatedIds().delete(subChatId);
                    setRenameLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, renameMutation.mutateAsync({
                            subChatId: subChatId,
                            name: newName
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    // Rollback on error
                    sub_chat_store_1.useAgentSubChatStore.getState().updateSubChatName(subChatId, oldName || "New Chat");
                    return [3 /*break*/, 5];
                case 4:
                    setRenameLoading(false);
                    setRenamingSubChat(null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateNew = function () { return __awaiter(_this, void 0, void 0, function () {
        var store, newId, newSubChat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!parentChatId)
                        return [2 /*return*/];
                    store = sub_chat_store_1.useAgentSubChatStore.getState();
                    if (!(chatSourceMode === "sandbox")) return [3 /*break*/, 1];
                    // Sandbox mode: lazy creation (web app pattern)
                    // Sub-chat will be persisted on first message via RemoteChatTransport UPSERT
                    newId = crypto.randomUUID();
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, trpc_2.trpcClient.chats.createSubChat.mutate({
                        chatId: parentChatId,
                        name: "New Chat",
                        mode: defaultAgentMode
                    })];
                case 2:
                    newSubChat = _a.sent();
                    newId = newSubChat.id;
                    _a.label = 3;
                case 3:
                    // Track this subchat as just created for typewriter effect
                    justCreatedIds().add(newId);
                    // Initialize atomFamily mode for the new sub-chat
                    jotai_store_1.appStore.set((0, atoms_1.subChatModeAtomFamily)(newId), defaultAgentMode);
                    // Add to allSubChats with placeholder name
                    store.addToAllSubChats({
                        id: newId,
                        name: "New Chat",
                        created_at: new Date().toISOString(),
                        mode: defaultAgentMode
                    });
                    // Add to open tabs and set as active
                    store.addToOpenSubChats(newId);
                    store.setActiveSubChat(newId);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSelectFromHistory = function (subChat) {
        var state = sub_chat_store_1.useAgentSubChatStore.getState();
        var isAlreadyOpen = state.openSubChatIds.includes(subChat.id);
        if (!isAlreadyOpen) {
            state.addToOpenSubChats(subChat.id);
        }
        state.setActiveSubChat(subChat.id);
        setIsHistoryOpen(false);
    };
    // Sort sub-chats by most recent first for history
    var sortedSubChats = (0, solid_js_1.createMemo)(function () { return __spreadArray([], allSubChats, true).sort(function (a, b) {
        var aT = new Date(a.updated_at || a.created_at || "0").getTime();
        var bT = new Date(b.updated_at || b.created_at || "0").getTime();
        return bT - aT;
    }); });
    // Update gradients when filtered chats change or on resize
    (0, solid_js_1.createEffect)(function () {
        updateScrollGradients();
    });
    // Update gradients on window resize
    (0, solid_js_1.createEffect)(function () {
        var handleResize = function () { return updateScrollGradients(); };
        window.addEventListener("resize", handleResize, { passive: true });
        return function () { return window.removeEventListener("resize", handleResize); };
    });
    // Check if all selected sub-chats are pinned
    var areAllSelectedPinned = (0, solid_js_1.createMemo)(function () {
        if (selectedSubChatIds.size === 0)
            return false;
        return Array.from(selectedSubChatIds).every(function (id) { return pinnedSubChatIds.includes(id); });
    });
    // Check if all selected sub-chats are unpinned
    var areAllSelectedUnpinned = (0, solid_js_1.createMemo)(function () {
        if (selectedSubChatIds.size === 0)
            return false;
        return Array.from(selectedSubChatIds).every(function (id) { return !pinnedSubChatIds.includes(id); });
    });
    // Show pin option only if all selected have same pin state
    var canShowPinOption = areAllSelectedPinned || areAllSelectedUnpinned;
    // Handle bulk pin of selected sub-chats
    var handleBulkPin = function () {
        var idsToPin = Array.from(selectedSubChatIds);
        if (idsToPin.length > 0) {
            idsToPin.forEach(function (id) {
                if (!pinnedSubChatIds.includes(id)) {
                    togglePinSubChat(id);
                }
            });
            clearSubChatSelection();
        }
    };
    // Handle bulk unpin of selected sub-chats
    var handleBulkUnpin = function () {
        var idsToUnpin = Array.from(selectedSubChatIds);
        if (idsToUnpin.length > 0) {
            idsToUnpin.forEach(function (id) {
                if (pinnedSubChatIds.includes(id)) {
                    togglePinSubChat(id);
                }
            });
            clearSubChatSelection();
        }
    };
    // Handle bulk archive of selected sub-chats
    var handleBulkArchive = function () {
        var idsToArchive = Array.from(selectedSubChatIds);
        if (idsToArchive.length > 0) {
            // Check if closing all open tabs
            var remainingOpenIds = openSubChatIds.filter(function (id) { return !idsToArchive.includes(id); });
            if (remainingOpenIds.length === 0) {
                // Closing all tabs - show archive agent confirmation
                var firstSubChat = allSubChats.find(function (sc) { return idsToArchive.includes(sc.id); });
                if (firstSubChat) {
                    setSubChatToArchive(firstSubChat);
                    setArchiveAgentDialogOpen(true);
                    clearSubChatSelection();
                }
            }
            else {
                // Some tabs remain - just close selected ones
                var state_1 = sub_chat_store_1.useAgentSubChatStore.getState();
                idsToArchive.forEach(function (id) { return state_1.removeFromOpenSubChats(id); });
                clearSubChatSelection();
                // Add each to unified undo stack for Cmd+Z
                if (parentChatId) {
                    var newItems_3 = idsToArchive.map(function (id) {
                        var timeoutId = setTimeout(function () {
                            setUndoStack(function (prev) { return prev.filter(function (item) { return !(item.type === "subchat" && item.subChatId === id); }); });
                        }, 1e4);
                        return {
                            type: "subchat",
                            subChatId: id,
                            chatId: parentChatId,
                            timeoutId: timeoutId
                        };
                    });
                    setUndoStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), newItems_3, true); });
                }
            }
        }
    };
    // Handle checkbox click
    var handleCheckboxClick = function (e, subChatId) {
        e.stopPropagation();
        toggleSubChatSelection(subChatId);
    };
    // Handle sub-chat item click with shift support
    var handleSubChatItemClick = function (subChatId, e, globalIndex) {
        // Shift+click for range selection
        if (e === null || e === void 0 ? void 0 : e.shiftKey) {
            e.preventDefault();
            var clickedIndex = globalIndex !== null && globalIndex !== void 0 ? globalIndex : filteredSubChats.findIndex(function (c) { return c.id === subChatId; });
            if (clickedIndex === -1)
                return;
            // Find the anchor: use active sub-chat
            var anchorIndex = -1;
            if (activeSubChatId) {
                anchorIndex = filteredSubChats.findIndex(function (c) { return c.id === activeSubChatId; });
            }
            // If no active sub-chat, try to use the first selected item
            if (anchorIndex === -1 && selectedSubChatIds.size > 0) {
                for (var i = 0; i < filteredSubChats.length; i++) {
                    if (selectedSubChatIds.has(filteredSubChats[i].id)) {
                        anchorIndex = i;
                        break;
                    }
                }
            }
            // If still no anchor, just select the clicked item
            if (anchorIndex === -1) {
                if (!selectedSubChatIds.has(subChatId)) {
                    toggleSubChatSelection(subChatId);
                }
                return;
            }
            // Select range from anchor to clicked item
            var startIndex = Math.min(anchorIndex, clickedIndex);
            var endIndex = Math.max(anchorIndex, clickedIndex);
            var newSelection = new Set(selectedSubChatIds);
            for (var i = startIndex; i <= endIndex; i++) {
                var chat = filteredSubChats[i];
                if (chat) {
                    newSelection.add(chat.id);
                }
            }
            setSelectedSubChatIds(newSelection);
            return;
        }
        // Normal click - navigate to sub-chat
        handleSubChatClick(subChatId);
    };
    // Multi-select hotkeys
    // X to toggle selection of hovered or focused chat
    (0, react_hotkeys_hook_1.useHotkeys)("x", function () {
        if (!filteredSubChats || filteredSubChats.length === 0)
            return;
        // Prefer hovered (via ref), then focused
        var targetIndex = hoveredChatIndexRef.current >= 0 ? hoveredChatIndexRef.current : focusedChatIndex >= 0 ? focusedChatIndex : -1;
        if (targetIndex >= 0 && targetIndex < filteredSubChats.length) {
            var subChatId = filteredSubChats[targetIndex].id;
            toggleSubChatSelection(subChatId);
        }
    }, [
        filteredSubChats,
        focusedChatIndex,
        toggleSubChatSelection
    ]);
    // Cmd+A / Ctrl+A to select all sub-chats (only when at least one is already selected)
    (0, react_hotkeys_hook_1.useHotkeys)("mod+a", function (e) {
        if (isMultiSelectMode && filteredSubChats.length > 0) {
            e.preventDefault();
            selectAllSubChats(filteredSubChats.map(function (c) { return c.id; }));
        }
    }, [
        filteredSubChats,
        selectAllSubChats,
        isMultiSelectMode
    ]);
    // Escape to clear selection (but not when dialogs are open)
    (0, react_hotkeys_hook_1.useHotkeys)("escape", function () {
        if (archiveAgentDialogOpen || renameDialogOpen)
            return;
        if (isMultiSelectMode) {
            clearSubChatSelection();
            setFocusedChatIndex(-1);
        }
    }, [
        isMultiSelectMode,
        clearSubChatSelection,
        archiveAgentDialogOpen,
        renameDialogOpen
    ]);
    // Clear selection when parent chat changes
    (0, solid_js_1.createEffect)(function () {
        clearSubChatSelection();
    });
    // Drafts cache - uses event-based sync instead of polling
    var draftsCache = (0, drafts_1.useSubChatDraftsCache)();
    // Get draft for a sub-chat
    var getDraftText = function (subChatId) {
        if (!parentChatId)
            return null;
        var key = (0, drafts_1.getSubChatDraftKey)(parentChatId, subChatId);
        return draftsCache[key] || null;
    };
    // History and Close buttons - reusable element
    var headerButtons = onClose && <div class="flex items-center gap-1">
      <SidebarSearchHistoryPopover sortedSubChats={sortedSubChats} loadingSubChats={loadingSubChats} subChatUnseenChanges={subChatUnseenChanges} pendingQuestionsMap={pendingQuestionsMap} allSubChatsLength={allSubChats.length} onSelect={handleSelectFromHistory}/>
      <tooltip_1.Tooltip delayDuration={500}>
        <tooltip_1.TooltipTrigger asChild>
          <button_1.Button variant="ghost" size="icon" onClick={onClose} tabIndex={-1} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground flex-shrink-0 rounded-md" aria-label="Close sidebar">
            <icons_1.IconDoubleChevronLeft class="h-4 w-4"/>
          </button_1.Button>
        </tooltip_1.TooltipTrigger>
        <tooltip_1.TooltipContent side="bottom">Close chats pane</tooltip_1.TooltipContent>
      </tooltip_1.Tooltip>
    </div>;
    return <div class="flex flex-col h-full bg-background border-r overflow-hidden relative" style={{ borderRightWidth: "0.5px" }}>
      {/* Draggable area for window movement - background layer (hidden in fullscreen) */}
      {isDesktop && !isFullscreen && <div class="absolute inset-0 z-0" style={{ WebkitAppRegion: "drag" }}/>}

      {/* Spacer for macOS traffic lights - only when agents sidebar is open */}
      {isSidebarOpen && <traffic_light_spacer_1.TrafficLightSpacer isDesktop={isDesktop} isFullscreen={isFullscreen}/>}

      {/* Header buttons - absolutely positioned when agents sidebar is open */}
      {isSidebarOpen && <div class="absolute right-2 top-2 z-20" style={{ WebkitAppRegion: "no-drag" }}>
          {headerButtons}
        </div>}

      {/* Header */}
      <div class="p-2 pb-3 flex-shrink-0 relative z-10">
        <div class="space-y-2">
          {/* Top row - different layout based on agents sidebar state */}
          {isSidebarOpen ? <div class="h-6"/> : <div class="flex items-center justify-between gap-1 mb-1">
              {onBackToChats && <tooltip_1.Tooltip delayDuration={500}>
                  <tooltip_1.TooltipTrigger asChild>
                    <button_1.Button variant="ghost" size="icon" onClick={onBackToChats} tabIndex={-1} class="h-6 w-6 p-0 hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0 rounded-md" aria-label="Toggle agents sidebar" style={{ WebkitAppRegion: "no-drag" }}>
                      <lucide_solid_1.AlignJustify class="h-4 w-4"/>
                    </button_1.Button>
                  </tooltip_1.TooltipTrigger>
                  <tooltip_1.TooltipContent>Open chats sidebar</tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>}
              <div class="flex-1"/>
              <div style={{ WebkitAppRegion: "no-drag" }}>
                {headerButtons}
              </div>
            </div>}
          {/* Search Input */}
          <div class="relative" style={{ WebkitAppRegion: "no-drag" }}>
            <input_1.Input ref={searchInputRef} placeholder="Search chats..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} onKeyDown={function (e) {
            var _a, _b;
            if (e.key === "Escape") {
                e.preventDefault();
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                setFocusedChatIndex(-1);
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedChatIndex(function (prev) {
                    if (prev === -1)
                        return 0;
                    return prev < filteredSubChats.length - 1 ? prev + 1 : prev;
                });
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedChatIndex(function (prev) {
                    if (prev === -1)
                        return filteredSubChats.length - 1;
                    return prev > 0 ? prev - 1 : prev;
                });
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                if (focusedChatIndex >= 0) {
                    var focusedChat = filteredSubChats[focusedChatIndex];
                    if (focusedChat) {
                        handleSubChatClick(focusedChat.id);
                        (_b = searchInputRef.current) === null || _b === void 0 ? void 0 : _b.blur();
                        setFocusedChatIndex(-1);
                    }
                }
                return;
            }
        }} class="h-7 w-full rounded-lg text-sm bg-muted border border-input placeholder:text-muted-foreground/40"/>
          </div>
          {/* New Chat Button */}
          <div style={{ WebkitAppRegion: "no-drag" }}>
            <tooltip_1.Tooltip delayDuration={500}>
              <tooltip_1.TooltipTrigger asChild>
                <button_1.Button onClick={handleCreateNew} variant="outline" size="sm" class="h-7 px-2 w-full hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground rounded-lg">
                  <span class="text-sm font-medium">New Chat</span>
                </button_1.Button>
              </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="right">
              Create a new chat
              {newAgentHotkey && <kbd_1.Kbd>{newAgentHotkey}</kbd_1.Kbd>}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
          </div>
        </div>
      </div>

      {/* Scrollable Sub-Chats List */}
      <div class="flex-1 min-h-0 relative z-10" style={{ WebkitAppRegion: "no-drag" }}>
        {/* Loading state - centered spinner */}
        {isLoading ? <div class="flex items-center justify-center h-full">
            <icons_1.IconSpinner class="w-4 h-4 text-muted-foreground"/>
          </div> : <>
            {/* Top gradient */}
            {showTopGradient && <div class="absolute left-0 right-0 top-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10"/>}

            {/* Bottom gradient */}
            {showBottomGradient && <div class="absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"/>}

            <div ref={scrollContainerRef} onScroll={handleScroll} class={(0, utils_1.cn)("h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent", isMultiSelectMode ? "px-0" : "px-2")}>
              {filteredSubChats.length > 0 ? <div class={(0, utils_1.cn)("mb-4", isMultiSelectMode ? "px-0" : "-mx-1")}>
                  {/* Pinned section */}
                  {pinnedChats.length > 0 && <>
                      <div class={(0, utils_1.cn)("flex items-center h-4 mb-1", isMultiSelectMode ? "pl-3" : "pl-2")}>
                        <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Pinned Chats
                        </h3>
                      </div>
                      <div class="list-none p-0 m-0 mb-3">
                        {pinnedChats.map(function (subChat, index) {
                        var isSubChatLoading = loadingChatIds.has(subChat.id);
                        var isActive = activeSubChatId === subChat.id;
                        var isPinned = pinnedSubChatIds.includes(subChat.id);
                        var globalIndex = filteredSubChats.findIndex(function (c) { return c.id === subChat.id; });
                        var isFocused = focusedChatIndex === globalIndex && focusedChatIndex >= 0;
                        var hasUnseen = subChatUnseenChanges().has(subChat.id);
                        var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
                        var mode = subChat.mode || "agent";
                        var isChecked = selectedSubChatIds.has(subChat.id);
                        var draftText = getDraftText(subChat.id);
                        var hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
                        var hasPendingPlan = pendingPlanApprovals.has(subChat.id);
                        var fileChanges = subChatFiles.get(subChat.id) || [];
                        var stats = fileChanges.length > 0 ? fileChanges.reduce(function (acc, f) { return ({
                            fileCount: acc.fileCount + 1,
                            additions: acc.additions + f.additions,
                            deletions: acc.deletions + f.deletions
                        }); }, {
                            fileCount: 0,
                            additions: 0,
                            deletions: 0
                        }) : null;
                        return <context_menu_1.ContextMenu key={subChat.id}>
                              <context_menu_1.ContextMenuTrigger asChild>
                                <div data-subchat-index={globalIndex} onClick={function (e) { return handleSubChatItemClick(subChat.id, e, globalIndex); }} tabIndex={0} onKeyDown={function (e) {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSubChatItemClick(subChat.id, undefined, globalIndex);
                                }
                            }} onMouseEnter={function (e) {
                                hoveredChatIndexRef.current = globalIndex;
                                handleSubChatMouseEnter(subChat.id, subChat.name || "New Chat", e.currentTarget);
                            }} onMouseLeave={function () {
                                hoveredChatIndexRef.current = -1;
                                handleSubChatMouseLeave();
                            }} class={(0, utils_1.cn)("w-full text-left py-1.5 transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isMultiSelectMode ? "px-3" : "pl-2 pr-2", isMultiSelectMode ? "" : "rounded-md", isActive ? "bg-foreground/5 text-foreground" : isChecked ? "bg-foreground/5 text-foreground" : isFocused ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                                  <div class="flex items-start gap-2.5">
                                    {/* Icon/Checkbox container */}
                                    <div class="pt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                                      {/* Checkbox - shown in multi-select mode */}
                                      <div class={(0, utils_1.cn)("absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")} onClick={function (e) { return handleCheckboxClick(e, subChat.id); }}>
                                        <checkbox_1.Checkbox checked={isChecked} class="cursor-pointer h-4 w-4" tabIndex={isMultiSelectMode ? 0 : -1}/>
                                      </div>
                                      {/* Mode icon or Question icon - hidden in multi-select mode */}
                                      <div class={(0, utils_1.cn)("transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>
                                        {hasPendingQuestion ? <icons_1.QuestionIcon class="w-4 h-4 text-blue-500"/> : mode === "plan" ? <icons_1.PlanIcon class="w-4 h-4 text-muted-foreground"/> : <icons_1.AgentIcon class="w-4 h-4 text-muted-foreground"/>}
                                      </div>
                                      {/* Badge in bottom-right corner - hidden in multi-select mode and when pending question */}
                                      {(isSubChatLoading || hasUnseen || hasPendingPlan) && !isMultiSelectMode && !hasPendingQuestion && <div class={(0, utils_1.cn)("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isActive ? "bg-[#E8E8E8] dark:bg-[#1B1B1B]" : "bg-[#F4F4F4] group-hover:bg-[#E8E8E8] dark:bg-[#101010] dark:group-hover:bg-[#1B1B1B]")}>
                                            {/* Priority: loader > amber dot (pending plan) > blue dot (unseen) */}
                                            {isSubChatLoading ? <icons_1.LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground"/> : hasPendingPlan ? <div class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : <icons_1.LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground"/>}
                                          </div>}
                                    </div>
                                    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <div class="flex items-center gap-1">
                                        <span ref={function (el) {
                                if (el)
                                    subChatNameRefs.current.set(subChat.id, el);
                            }} class="truncate block text-sm leading-tight flex-1">
                                          <typewriter_text_1.TypewriterText text={subChat.name || ""} placeholder="New Chat" id={subChat.id} isJustCreated={justCreatedIds().has(subChat.id)} showPlaceholder={true}/>
                                        </span>
                                        {!isMultiSelectMode && <button onClick={function (e) {
                                    e.stopPropagation();
                                    handleArchiveSubChat(subChat.id);
                                }} tabIndex={-1} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive agent">
                                            <icons_1.ArchiveIcon class="h-3.5 w-3.5"/>
                                          </button>}
                                      </div>
                                      <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 min-w-0">
                                        {draftText ? <span class="truncate flex-1 min-w-0">
                                            <span class="text-blue-500">Draft:</span>{" "}
                                            {draftText}
                                          </span> : <span class="truncate flex-1 min-w-0">
                                            {stats ? <>
                                                {stats.fileCount}{" "}
                                                {stats.fileCount === 1 ? "file" : "files"}
                                              </> : null}
                                          </span>}
                                        <div class="flex items-center gap-1.5 flex-shrink-0">
                                          {!draftText && stats && (stats.additions > 0 || stats.deletions > 0) && <>
                                              <span class="text-green-600 dark:text-green-400">
                                                +{stats.additions}
                                              </span>
                                              <span class="text-red-600 dark:text-red-400">
                                                -{stats.deletions}
                                              </span>
                                            </>}
                                          <span>{timeAgo}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </context_menu_1.ContextMenuTrigger>
                              {/* Multi-select context menu */}
                              {isMultiSelectMode && selectedSubChatIds.has(subChat.id) ? <context_menu_1.ContextMenuContent class="w-48">
                                  {canShowPinOption && <>
                                      <context_menu_1.ContextMenuItem onClick={areAllSelectedPinned ? handleBulkUnpin : handleBulkPin}>
                                        {areAllSelectedPinned ? "Unpin ".concat(selectedSubChatIds.size, " ").concat((0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat")) : "Pin ".concat(selectedSubChatIds.size, " ").concat((0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat"))}
                                      </context_menu_1.ContextMenuItem>
                                      <context_menu_1.ContextMenuSeparator />
                                    </>}
                                  <context_menu_1.ContextMenuItem onClick={handleBulkArchive}>
                                    Archive {selectedSubChatIds.size}{" "}
                                    {(0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat")}
                                  </context_menu_1.ContextMenuItem>
                                </context_menu_1.ContextMenuContent> : <sub_chat_context_menu_1.SubChatContextMenu subChat={subChat} isPinned={isPinned} onTogglePin={togglePinSubChat} onRename={handleRenameClick} onArchive={handleArchiveSubChat} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={onCloseOtherChats} isOnlyChat={openSubChats.length === 1} currentIndex={globalIndex} totalCount={filteredSubChats.length} chatId={parentChatId}/>}
                            </context_menu_1.ContextMenu>;
                    })}
                      </div>
                    </>}

                  {/* Unpinned section */}
                  {unpinnedChats.length > 0 && <>
                      <div class={(0, utils_1.cn)("flex items-center h-4 mb-1", isMultiSelectMode ? "pl-3" : "pl-2")}>
                        <h3 class="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {pinnedChats.length > 0 ? "Recent chats" : "Chats"}
                        </h3>
                      </div>
                      <div class="list-none p-0 m-0">
                        {unpinnedChats.map(function (subChat, index) {
                        var isSubChatLoading = loadingChatIds.has(subChat.id);
                        var isActive = activeSubChatId === subChat.id;
                        var isPinned = pinnedSubChatIds.includes(subChat.id);
                        var globalIndex = filteredSubChats.findIndex(function (c) { return c.id === subChat.id; });
                        var isFocused = focusedChatIndex === globalIndex && focusedChatIndex >= 0;
                        var hasUnseen = subChatUnseenChanges().has(subChat.id);
                        var timeAgo = (0, format_time_ago_1.formatTimeAgo)(subChat.updated_at || subChat.created_at);
                        var mode = subChat.mode || "agent";
                        var isChecked = selectedSubChatIds.has(subChat.id);
                        var draftText = getDraftText(subChat.id);
                        var hasPendingQuestion = pendingQuestionsMap.has(subChat.id);
                        var hasPendingPlan = pendingPlanApprovals.has(subChat.id);
                        var fileChanges = subChatFiles.get(subChat.id) || [];
                        var stats = fileChanges.length > 0 ? fileChanges.reduce(function (acc, f) { return ({
                            fileCount: acc.fileCount + 1,
                            additions: acc.additions + f.additions,
                            deletions: acc.deletions + f.deletions
                        }); }, {
                            fileCount: 0,
                            additions: 0,
                            deletions: 0
                        }) : null;
                        return <context_menu_1.ContextMenu key={subChat.id}>
                              <context_menu_1.ContextMenuTrigger asChild>
                                <div data-subchat-index={globalIndex} onClick={function (e) { return handleSubChatItemClick(subChat.id, e, globalIndex); }} tabIndex={0} onKeyDown={function (e) {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSubChatItemClick(subChat.id, undefined, globalIndex);
                                }
                            }} onMouseEnter={function (e) {
                                hoveredChatIndexRef.current = globalIndex;
                                handleSubChatMouseEnter(subChat.id, subChat.name || "New Chat", e.currentTarget);
                            }} onMouseLeave={function () {
                                hoveredChatIndexRef.current = -1;
                                handleSubChatMouseLeave();
                            }} class={(0, utils_1.cn)("w-full text-left py-1.5 transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isMultiSelectMode ? "px-3" : "pl-2 pr-2", isMultiSelectMode ? "" : "rounded-md", isActive ? "bg-foreground/5 text-foreground" : isChecked ? "bg-foreground/5 text-foreground" : isFocused ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
                                  <div class="flex items-start gap-2.5">
                                    {/* Icon/Checkbox container */}
                                    <div class="pt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                                      {/* Checkbox - shown in multi-select mode */}
                                      <div class={(0, utils_1.cn)("absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")} onClick={function (e) { return handleCheckboxClick(e, subChat.id); }}>
                                        <checkbox_1.Checkbox checked={isChecked} class="cursor-pointer h-4 w-4" tabIndex={isMultiSelectMode ? 0 : -1}/>
                                      </div>
                                      {/* Mode icon or Question icon - hidden in multi-select mode */}
                                      <div class={(0, utils_1.cn)("transition-[opacity,transform] duration-150 ease-out", isMultiSelectMode ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>
                                        {hasPendingQuestion ? <icons_1.QuestionIcon class="w-4 h-4 text-blue-500"/> : mode === "plan" ? <icons_1.PlanIcon class="w-4 h-4 text-muted-foreground"/> : <icons_1.AgentIcon class="w-4 h-4 text-muted-foreground"/>}
                                      </div>
                                      {/* Badge - hidden in multi-select mode and when pending question */}
                                      {(isSubChatLoading || hasUnseen || hasPendingPlan) && !isMultiSelectMode && !hasPendingQuestion && <div class={(0, utils_1.cn)("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isActive ? "bg-[#E8E8E8] dark:bg-[#1B1B1B]" : "bg-[#F4F4F4] group-hover:bg-[#E8E8E8] dark:bg-[#101010] dark:group-hover:bg-[#1B1B1B]")}>
                                            {/* Priority: loader > amber dot (pending plan) > blue dot (unseen) */}
                                            {isSubChatLoading ? <icons_1.LoadingDot isLoading={true} class="w-2.5 h-2.5 text-muted-foreground"/> : hasPendingPlan ? <div class="w-1.5 h-1.5 rounded-full bg-amber-500"/> : <icons_1.LoadingDot isLoading={false} class="w-2.5 h-2.5 text-muted-foreground"/>}
                                          </div>}
                                    </div>
                                    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                      <div class="flex items-center gap-1">
                                        <span ref={function (el) {
                                if (el)
                                    subChatNameRefs.current.set(subChat.id, el);
                            }} class="truncate block text-sm leading-tight flex-1">
                                          <typewriter_text_1.TypewriterText text={subChat.name || ""} placeholder="New Chat" id={subChat.id} isJustCreated={justCreatedIds().has(subChat.id)} showPlaceholder={true}/>
                                        </span>
                                        {!isMultiSelectMode && <button onClick={function (e) {
                                    e.stopPropagation();
                                    handleArchiveSubChat(subChat.id);
                                }} tabIndex={-1} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[opacity,transform,color] duration-150 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto active:scale-[0.97]" aria-label="Archive agent">
                                            <icons_1.ArchiveIcon class="h-3.5 w-3.5"/>
                                          </button>}
                                      </div>
                                      <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 min-w-0">
                                        {draftText ? <span class="truncate flex-1 min-w-0">
                                            <span class="text-blue-500">Draft:</span>{" "}
                                            {draftText}
                                          </span> : <span class="truncate flex-1 min-w-0">
                                            {stats ? <>
                                                {stats.fileCount}{" "}
                                                {stats.fileCount === 1 ? "file" : "files"}
                                              </> : null}
                                          </span>}
                                        <div class="flex items-center gap-1.5 flex-shrink-0">
                                          {!draftText && stats && (stats.additions > 0 || stats.deletions > 0) && <>
                                              <span class="text-green-600 dark:text-green-400">
                                                +{stats.additions}
                                              </span>
                                              <span class="text-red-600 dark:text-red-400">
                                                -{stats.deletions}
                                              </span>
                                            </>}
                                          <span>{timeAgo}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </context_menu_1.ContextMenuTrigger>
                              {/* Multi-select context menu */}
                              {isMultiSelectMode && selectedSubChatIds.has(subChat.id) ? <context_menu_1.ContextMenuContent class="w-48">
                                  {canShowPinOption && <>
                                      <context_menu_1.ContextMenuItem onClick={areAllSelectedPinned ? handleBulkUnpin : handleBulkPin}>
                                        {areAllSelectedPinned ? "Unpin ".concat(selectedSubChatIds.size, " ").concat((0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat")) : "Pin ".concat(selectedSubChatIds.size, " ").concat((0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat"))}
                                      </context_menu_1.ContextMenuItem>
                                      <context_menu_1.ContextMenuSeparator />
                                    </>}
                                  <context_menu_1.ContextMenuItem onClick={handleBulkArchive}>
                                    Archive {selectedSubChatIds.size}{" "}
                                    {(0, pluralize_1.pluralize)(selectedSubChatIds.size, "chat")}
                                  </context_menu_1.ContextMenuItem>
                                </context_menu_1.ContextMenuContent> : <sub_chat_context_menu_1.SubChatContextMenu subChat={subChat} isPinned={isPinned} onTogglePin={togglePinSubChat} onRename={handleRenameClick} onArchive={handleArchiveSubChat} onArchiveAllBelow={handleArchiveAllBelow} onArchiveOthers={onCloseOtherChats} isOnlyChat={openSubChats.length === 1} currentIndex={globalIndex} totalCount={filteredSubChats.length} chatId={parentChatId}/>}
                            </context_menu_1.ContextMenu>;
                    })}
                      </div>
                    </>}
                </div> : searchQuery.trim() ? <div class="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                  <div>
                    <p class="mb-1">No results</p>
                    <p class="text-xs text-muted-foreground/60">
                      Try a different search term
                    </p>
                  </div>
                </div> : null}
            </div>
          </>}
      </div>

      {/* Multi-select Footer Toolbar */}
      <react_1.AnimatePresence mode="wait">
        {isMultiSelectMode && <react_1.motion.div key="multiselect-footer" initial={{
                opacity: 0,
                y: 8
            }} animate={{
                opacity: 1,
                y: 0
            }} exit={{
                opacity: 0,
                y: 8
            }} transition={{ duration: 0 }} class="flex-shrink-0 p-2 bg-background space-y-2 relative z-10" style={{ WebkitAppRegion: "no-drag" }}>
            <div class="flex items-center justify-between px-1">
              <span class="text-xs text-muted-foreground">
                {selectedSubChatsCount} selected
              </span>
              <button onClick={clearSubChatSelection} class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>

            <div class="flex items-center gap-1.5">
              <button_1.Button variant="outline" size="sm" onClick={handleBulkArchive} class="flex-1 h-8 gap-1.5 text-xs rounded-lg">
                <icons_1.ArchiveIcon class="h-3.5 w-3.5"/>
                Archive
              </button_1.Button>
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>

      {/* Rename Dialog */}
      <agents_rename_subchat_dialog_1.AgentsRenameSubChatDialog isOpen={renameDialogOpen} onClose={function () {
            setRenameDialogOpen(false);
            setRenamingSubChat(null);
        }} onSave={handleRenameSave} currentName={(renamingSubChat === null || renamingSubChat === void 0 ? void 0 : renamingSubChat.name) || ""} isLoading={renameLoading}/>

      {/* Archive Agent Confirmation Dialog */}
      <alert_dialog_1.AlertDialog open={archiveAgentDialogOpen} onOpenChange={function (open) {
            setArchiveAgentDialogOpen(open);
            if (!open) {
                setSubChatToArchive(null);
            }
        }}>
        <alert_dialog_1.AlertDialogContent>
          <alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogTitle>Archive agent</alert_dialog_1.AlertDialogTitle>
          </alert_dialog_1.AlertDialogHeader>
          <alert_dialog_1.AlertDialogDescription class="px-5 pb-5">
            Do you want to archive agent{" "}
            <span class="font-medium text-foreground">
              {agentName || (subChatToArchive === null || subChatToArchive === void 0 ? void 0 : subChatToArchive.name) || "this agent"}
            </span>
            ? You can restore it from history later.
          </alert_dialog_1.AlertDialogDescription>
          <alert_dialog_1.AlertDialogFooter>
            <alert_dialog_1.AlertDialogCancel>Cancel</alert_dialog_1.AlertDialogCancel>
            <alert_dialog_1.AlertDialogAction onClick={handleConfirmArchiveAgent} autoFocus>
              Archive
            </alert_dialog_1.AlertDialogAction>
          </alert_dialog_1.AlertDialogFooter>
        </alert_dialog_1.AlertDialogContent>
      </alert_dialog_1.AlertDialog>

      {/* SubChat name tooltip portal - always rendered, visibility controlled via ref */}
      {typeof document !== "undefined" && (0, web_1.createPortal)(<div ref={tooltipRef} class="fixed z-[100000] max-w-xs px-2 py-1 text-xs bg-popover border border-border rounded-md shadow-lg pointer-events-none text-foreground/90 whitespace-nowrap" style={{
                display: "none",
                transform: "translateY(-50%)"
            }}/>, document.body)}
    </div>;
}
