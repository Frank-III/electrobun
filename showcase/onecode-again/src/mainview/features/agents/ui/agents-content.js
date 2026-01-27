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
exports.AgentsContent = AgentsContent;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
// import { useSearchParams, useRouter } from "next/navigation" // Desktop doesn't use next/navigation
// Desktop: mock Next.js navigation hooks
var useSearchParams = function () { return ({ get: function () { return null; } }); };
var useRouter = function () { return ({
    push: function () { },
    replace: function () { }
}); };
// Desktop: mock Clerk hooks
var useUser = function () { return ({ user: null }); };
var useClerk = function () { return ({ signOut: function () { } }); };
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
var new_chat_form_1 = require("../main/new-chat-form");
var kanban_1 = require("../../kanban");
var active_chat_1 = require("../main/active-chat");
var mock_api_1 = require("../../../lib/mock-api");
var trpc_1 = require("../../../lib/trpc");
var use_mobile_1 = require("../../../lib/hooks/use-mobile");
var agents_sidebar_1 = require("../../sidebar/agents-sidebar");
var agents_subchats_sidebar_1 = require("../../sidebar/agents-subchats-sidebar");
var agent_preview_1 = require("./agent-preview");
var agent_diff_view_1 = require("./agent-diff-view");
var terminal_1 = require("../../terminal");
var sub_chat_store_1 = require("../stores/sub-chat-store");
var shallow_1 = require("zustand/react/shallow");
// import { ResizableSidebar } from "@/app/(alpha)/canvas/[id]/{components}/resizable-sidebar"
var resizable_sidebar_1 = require("../../../components/ui/resizable-sidebar");
// import { useClerk, useUser } from "@clerk/nextjs"
// import { useCombinedAuth } from "@/lib/hooks/use-combined-auth"
var useCombinedAuth = function () { return ({ userId: null }); };
var agents_quick_switch_dialog_1 = require("../components/agents-quick-switch-dialog");
var subchats_quick_switch_dialog_1 = require("../components/subchats-quick-switch-dialog");
// Desktop mock
var useIsAdmin = function () { return false; };
// Main Component
function AgentsContent() {
    var _this = this;
    var _a, _b, _c, _d, _e;
    var _f = (0, jotai_1.useAtom)(atoms_1.selectedAgentChatIdAtom), selectedChatId = _f[0], setSelectedChatId = _f[1];
    var setSelectedChatIsRemote = (0, jotai_1.useSetAtom)(atoms_1.selectedChatIsRemoteAtom);
    var setChatSourceMode = (0, jotai_1.useSetAtom)(atoms_2.chatSourceModeAtom);
    var chatSourceMode = (0, jotai_1.useAtomValue)(atoms_2.chatSourceModeAtom);
    var selectedDraftId = (0, jotai_1.useAtomValue)(atoms_1.selectedDraftIdAtom);
    var showNewChatForm = (0, jotai_1.useAtomValue)(atoms_1.showNewChatFormAtom);
    var betaKanbanEnabled = (0, jotai_1.useAtomValue)(atoms_2.betaKanbanEnabledAtom);
    var selectedTeamId = (0, jotai_1.useAtom)(atoms_2.selectedTeamIdAtom)[0];
    var _g = (0, jotai_1.useAtom)(atoms_1.agentsSidebarOpenAtom), sidebarOpen = _g[0], setSidebarOpen = _g[1];
    var _h = (0, jotai_1.useAtom)(atoms_1.agentsPreviewSidebarOpenAtom), previewSidebarOpen = _h[0], setPreviewSidebarOpen = _h[1];
    var _j = (0, jotai_1.useAtom)(atoms_1.agentsMobileViewModeAtom), mobileViewMode = _j[0], setMobileViewMode = _j[1];
    var _k = (0, jotai_1.useAtom)(atoms_1.agentsSubChatsSidebarModeAtom), subChatsSidebarMode = _k[0], setSubChatsSidebarMode = _k[1];
    // Per-chat terminal sidebar state
    var terminalSidebarAtom = (0, solid_js_1.createMemo)(function () { return (0, terminal_1.terminalSidebarOpenAtomFamily)(selectedChatId || ""); });
    var setTerminalSidebarOpen = (0, jotai_1.useSetAtom)(terminalSidebarAtom);
    var _l = (0, solid_js_1.createSignal)(false), hasOpenedSubChatsSidebar = _l[0], setHasOpenedSubChatsSidebar = _l[1];
    var _m = (0, solid_js_1.createSignal)(false), wasSubChatsSidebarOpen = _m[0], setWasSubChatsSidebarOpen = _m[1];
    var _o = (0, solid_js_1.createSignal)(subChatsSidebarMode !== "sidebar"), shouldAnimateSubChatsSidebar = _o[0], setShouldAnimateSubChatsSidebar = _o[1];
    var searchParams = useSearchParams();
    var router = useRouter();
    var _p = (0, solid_js_1.createSignal)(false), isInitialized = _p[0], setIsInitialized = _p[1];
    var _q = (0, solid_js_1.createSignal)(true), isFirstRenderRef = _q[0], setIsFirstRenderRef = _q[1];
    var _r = (0, solid_js_1.createSignal)(false), isNavigatingRef = _r[0], setIsNavigatingRef = _r[1];
    var _s = (0, solid_js_1.createSignal)(0), newChatFormKeyRef = _s[0], setNewChatFormKeyRef = _s[1];
    var isMobile = (0, use_mobile_1.useIsMobile)();
    var _t = (0, solid_js_1.createSignal)(false), isHydrated = _t[0], setIsHydrated = _t[1];
    var userId = useCombinedAuth().userId;
    var user = useUser().user;
    var signOut = useClerk().signOut;
    var isAdmin = useIsAdmin();
    // Quick-switch dialog state - Agents (Opt+Ctrl+Tab)
    var _u = (0, jotai_1.useAtom)(atoms_2.agentsQuickSwitchOpenAtom), quickSwitchOpen = _u[0], setQuickSwitchOpen = _u[1];
    var _v = (0, jotai_1.useAtom)(atoms_2.agentsQuickSwitchSelectedIndexAtom), quickSwitchSelectedIndex = _v[0], setQuickSwitchSelectedIndex = _v[1];
    var _w = (0, solid_js_1.createSignal)(null), holdTimerRef = _w[0], setHoldTimerRef = _w[1];
    var _x = (0, solid_js_1.createSignal)(false), modifierKeysHeldRef = _x[0], setModifierKeysHeldRef = _x[1];
    var _y = (0, solid_js_1.createSignal)(false), wasShiftPressedRef = _y[0], setWasShiftPressedRef = _y[1];
    var _z = (0, solid_js_1.createSignal)(false), isQuickSwitchingRef = _z[0], setIsQuickSwitchingRef = _z[1];
    var _0 = (0, solid_js_1.createSignal)([]), frozenRecentChatsRef = _0[0], setFrozenRecentChatsRef = _0[1];
    // Ctrl+Tab target preference
    var ctrlTabTarget = (0, jotai_1.useAtomValue)(atoms_2.ctrlTabTargetAtom);
    // Quick-switch dialog state - Sub-chats (Ctrl+Tab)
    var _1 = (0, jotai_1.useAtom)(atoms_2.subChatsQuickSwitchOpenAtom), subChatQuickSwitchOpen = _1[0], setSubChatQuickSwitchOpen = _1[1];
    var _2 = (0, jotai_1.useAtom)(atoms_2.subChatsQuickSwitchSelectedIndexAtom), subChatQuickSwitchSelectedIndex = _2[0], setSubChatQuickSwitchSelectedIndex = _2[1];
    var _3 = (0, solid_js_1.createSignal)(null), subChatHoldTimerRef = _3[0], setSubChatHoldTimerRef = _3[1];
    var _4 = (0, solid_js_1.createSignal)(false), subChatModifierKeysHeldRef = _4[0], setSubChatModifierKeysHeldRef = _4[1];
    var _5 = (0, solid_js_1.createSignal)(false), subChatWasShiftPressedRef = _5[0], setSubChatWasShiftPressedRef = _5[1];
    var _6 = (0, solid_js_1.createSignal)([]), frozenSubChatsRef = _6[0], setFrozenSubChatsRef = _6[1];
    // Refs to avoid effect re-running when dialog state changes (prevents keyup event loss)
    var _7 = (0, solid_js_1.createSignal)(subChatQuickSwitchOpen), subChatQuickSwitchOpenRef = _7[0], setSubChatQuickSwitchOpenRef = _7[1];
    var _8 = (0, solid_js_1.createSignal)(subChatQuickSwitchSelectedIndex), subChatQuickSwitchSelectedIndexRef = _8[0], setSubChatQuickSwitchSelectedIndexRef = _8[1];
    subChatQuickSwitchOpenRef.current = subChatQuickSwitchOpen;
    subChatQuickSwitchSelectedIndexRef.current = subChatQuickSwitchSelectedIndex;
    // Get sub-chats from store with shallow comparison
    var _9 = (0, sub_chat_store_1.useAgentSubChatStore)((0, shallow_1.useShallow)(function (state) { return ({
        allSubChats: state.allSubChats,
        openSubChatIds: state.openSubChatIds,
        activeSubChatId: state.activeSubChatId,
        setActiveSubChat: state.setActiveSubChat
    }); })), allSubChats = _9.allSubChats, openSubChatIds = _9.openSubChatIds, activeSubChatId = _9.activeSubChatId, setActiveSubChat = _9.setActiveSubChat;
    // Update window title when active sub-chat changes
    var activeSubChatName = (0, solid_js_1.createMemo)(function () {
        var _a;
        if (!activeSubChatId)
            return null;
        var subChat = allSubChats.find(function (sc) { return sc.id === activeSubChatId; });
        return (_a = subChat === null || subChat === void 0 ? void 0 : subChat.name) !== null && _a !== void 0 ? _a : null;
    });
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (typeof window !== "undefined" && ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setWindowTitle)) {
            window.desktopApi.setWindowTitle(activeSubChatName || "");
        }
    });
    // Fetch teams for header
    var teams = mock_api_1.api.teams.getUserTeams.useQuery(undefined, { enabled: !!selectedTeamId }).data;
    var selectedTeam = teams === null || teams === void 0 ? void 0 : teams.find(function (t) { return t.id === selectedTeamId; });
    // Fetch agent chats for keyboard navigation and mobile view
    var agentChats = mock_api_1.api.agents.getAgentChats.useQuery({ teamId: selectedTeamId }, { enabled: !!selectedTeamId }).data;
    // Fetch all projects for git info (like sidebar does)
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    // Create map for quick project lookup by id
    var projectsMap = (0, solid_js_1.createMemo)(function () {
        if (!projects)
            return new Map();
        return new Map(projects.map(function (p) { return [p.id, p]; }));
    });
    // Fetch current chat data for preview info
    var chatData = mock_api_1.api.agents.getAgentChat.useQuery({ chatId: selectedChatId }, { enabled: !!selectedChatId }).data;
    // Track previous chat ID for navigation after archive
    var _10 = (0, jotai_1.useAtom)(atoms_1.previousAgentChatIdAtom), previousChatId = _10[0], setPreviousChatId = _10[1];
    var _11 = (0, solid_js_1.createSignal)(null), prevSelectedChatIdRef = _11[0], setPrevSelectedChatIdRef = _11[1];
    // Update previousChatId when selectedChatId changes
    (0, solid_js_1.createEffect)(function () {
        // Only update if we're switching from one chat to another
        if (prevSelectedChatIdRef.current && prevSelectedChatIdRef.current !== selectedChatId) {
            setPreviousChatId(prevSelectedChatIdRef.current);
        }
        prevSelectedChatIdRef.current = selectedChatId;
    });
    // Note: Archive mutations moved to AgentsSidebar to share undo stack with Cmd+Z
    // Track hydration
    (0, solid_js_1.createEffect)(function () {
        setIsHydrated(true);
    });
    // On mount: read URL → set atom
    (0, solid_js_1.createEffect)(function () {
        if (isInitialized.current)
            return;
        isInitialized.current = true;
        var chatIdFromUrl = searchParams.get("chat");
        if (chatIdFromUrl) {
            setSelectedChatId(chatIdFromUrl);
        }
    });
    // When atom changes: update URL and increment NewChatForm key when returning to new chat view
    (0, solid_js_1.createEffect)(function () {
        // Skip the first render - let the URL read effect set the initial value first
        // This prevents a race condition where this effect would clear the chat param
        // before the atom has been updated from the URL
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        var currentChatId = searchParams.get("chat");
        if (selectedChatId !== currentChatId) {
            var url = new URL(window.location.href);
            if (selectedChatId) {
                url.searchParams.set("chat", selectedChatId);
            }
            else {
                url.searchParams.delete("chat");
                // Increment key to force NewChatForm remount and trigger focus
                newChatFormKeyRef.current += 1;
            }
            router.replace(url.pathname + url.search, { scroll: false });
        }
    });
    // Auto-close sidebars on mobile devices
    (0, solid_js_1.createEffect)(function () {
        if (isMobile && isHydrated) {
            setSidebarOpen(false);
            setPreviewSidebarOpen(false);
        }
    });
    // On mobile: when chat is selected, switch to chat mode
    (0, solid_js_1.createEffect)(function () {
        if (isMobile && selectedChatId && mobileViewMode === "chats") {
            setMobileViewMode("chat");
        }
    });
    // On mobile: when in terminal mode, sync with terminal sidebar close
    var terminalSidebarOpen = (0, jotai_1.useAtomValue)(terminalSidebarAtom);
    (0, solid_js_1.createEffect)(function () {
        // If terminal sidebar closed while in terminal mode, go back to chat
        if (isMobile && mobileViewMode === "terminal" && !terminalSidebarOpen) {
            setMobileViewMode("chat");
        }
    });
    // On mobile: hide native traffic lights when not in "chats" mode
    // Traffic lights should only show in the agents list view
    (0, solid_js_1.createEffect)(function () {
        var _a;
        if (!isMobile)
            return;
        if (typeof window === "undefined" || !((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setTrafficLightVisibility))
            return;
        // Hide traffic lights when not in chats list mode
        if (mobileViewMode !== "chats") {
            window.desktopApi.setTrafficLightVisibility(false);
        }
    });
    // Get recent chats for quick-switch dialog
    // Order: current chat first (left), then previous chats by last updated
    // IMPORTANT: Only recalculate when dialog is closed to prevent flickering
    var sortedChats = agentChats ? __spreadArray([], agentChats, true).sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); }) : [];
    var recentChats = [];
    // Use frozen chats when dialog is open to prevent recalculation
    if (quickSwitchOpen && frozenRecentChatsRef.current && frozenRecentChatsRef.current.length > 0) {
        recentChats = (_a = frozenRecentChatsRef.current) !== null && _a !== void 0 ? _a : [];
    }
    else if (selectedChatId) {
        // Put current chat first, then take next 4
        var currentChat = sortedChats.find(function (c) { return c.id === selectedChatId; });
        var otherChats = sortedChats.filter(function (c) { return c.id !== selectedChatId; }).slice(0, 4);
        recentChats = currentChat ? __spreadArray([currentChat], otherChats, true) : otherChats;
    }
    else {
        recentChats = sortedChats.slice(0, 5);
    }
    // Keyboard navigation: Quick switch between workspaces
    // Shortcut depends on ctrlTabTarget preference:
    // - "workspaces" (default): Ctrl+Tab switches workspaces
    // - "agents": Opt+Ctrl+Tab switches workspaces
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var _a, _b, _c, _d;
            // Determine shortcut based on preference
            var isCtrlTabOnly = e.ctrlKey && e.key === "Tab" && !e.altKey && !e.metaKey;
            var isOptCtrlTab = e.altKey && e.ctrlKey && e.key === "Tab" && !e.metaKey;
            // Workspace switch: Ctrl+Tab by default, or Opt+Ctrl+Tab when ctrlTabTarget is "agents"
            var isWorkspaceSwitchShortcut = ctrlTabTarget === "workspaces" ? isCtrlTabOnly : isOptCtrlTab;
            if (isWorkspaceSwitchShortcut) {
                e.preventDefault();
                wasShiftPressedRef.current = e.shiftKey;
                if (recentChats.length === 0)
                    return;
                // If dialog is open, navigate through chats
                if (quickSwitchOpen) {
                    var nextIndex = void 0;
                    if (e.shiftKey) {
                        // Shift + Tab = Previous
                        nextIndex = quickSwitchSelectedIndex - 1;
                        if (nextIndex < 0) {
                            nextIndex = ((_b = (_a = frozenRecentChatsRef.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) - 1;
                        }
                    }
                    else {
                        // Tab = Next
                        nextIndex = (quickSwitchSelectedIndex + 1) % ((_d = (_c = frozenRecentChatsRef.current) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 1);
                    }
                    setQuickSwitchSelectedIndex(nextIndex);
                    return;
                }
                // If dialog is not open yet, start hold timer
                if (!quickSwitchOpen && !holdTimerRef.current) {
                    modifierKeysHeldRef.current = true;
                    // Freeze current recentChats snapshot for this dialog session
                    frozenRecentChatsRef.current = __spreadArray([], recentChats, true);
                    // Start timer to show dialog after 30ms (almost instant)
                    holdTimerRef.current = setTimeout(function () {
                        var _a, _b, _c, _d;
                        // Clear timer ref AFTER it fires - this is critical for close detection
                        holdTimerRef.current = null;
                        if (modifierKeysHeldRef.current) {
                            // Show dialog
                            setQuickSwitchOpen(true);
                            // Current chat is always at index 0 (left), select next chat (index 1)
                            // For Shift+Tab, select last chat
                            if (wasShiftPressedRef.current) {
                                // Shift: go to last chat
                                setQuickSwitchSelectedIndex(((_b = (_a = frozenRecentChatsRef.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) - 1);
                            }
                            else {
                                // Tab: go to next chat (index 1), or wrap to 0 if only one chat
                                setQuickSwitchSelectedIndex(((_d = (_c = frozenRecentChatsRef.current) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 1) > 1 ? 1 : 0);
                            }
                        }
                    }, 30);
                    return;
                }
            }
        };
        var handleKeyUp = function (e) {
            var _a;
            // ESC to close dialog without navigating
            if (e.key === "Escape" && quickSwitchOpen) {
                e.preventDefault();
                modifierKeysHeldRef.current = false;
                isQuickSwitchingRef.current = false;
                if (holdTimerRef.current) {
                    clearTimeout(holdTimerRef.current);
                    holdTimerRef.current = null;
                }
                setQuickSwitchOpen(false);
                setQuickSwitchSelectedIndex(0);
                return;
            }
            // When modifier key is released
            // For workspaces mode (Ctrl+Tab only): react to Control release
            // For agents mode (Opt+Ctrl+Tab): react to Alt or Control release
            var isRelevantKeyRelease = ctrlTabTarget === "workspaces" ? e.key === "Control" : e.key === "Alt" || e.key === "Control";
            if (isRelevantKeyRelease) {
                modifierKeysHeldRef.current = false;
                // If timer is still running (quick press - dialog not shown yet)
                if (holdTimerRef.current) {
                    clearTimeout(holdTimerRef.current);
                    holdTimerRef.current = null;
                    isQuickSwitchingRef.current = false;
                    // Do quick switch without showing dialog
                    if (!isNavigatingRef.current && agentChats && agentChats.length > 0) {
                        // Get sorted chat list
                        var sortedChats_1 = __spreadArray([], agentChats, true).sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); });
                        isNavigatingRef.current = true;
                        setTimeout(function () {
                            isNavigatingRef.current = false;
                        }, 300);
                        // If no chat selected, select first one
                        if (!selectedChatId) {
                            setSelectedChatId(sortedChats_1[0].id);
                            // agentChats are local chats only, so always set isRemote to false
                            setSelectedChatIsRemote(false);
                            setChatSourceMode("local");
                            return;
                        }
                        // Find current index
                        var currentIndex = sortedChats_1.findIndex(function (chat) { return chat.id === selectedChatId; });
                        if (currentIndex === -1) {
                            setSelectedChatId(sortedChats_1[0].id);
                            setSelectedChatIsRemote(false);
                            setChatSourceMode("local");
                            return;
                        }
                        // Navigate forward or backward
                        var nextIndex = void 0;
                        if (wasShiftPressedRef.current) {
                            nextIndex = currentIndex - 1;
                            if (nextIndex < 0) {
                                nextIndex = sortedChats_1.length - 1;
                            }
                        }
                        else {
                            nextIndex = currentIndex + 1;
                            if (nextIndex >= sortedChats_1.length) {
                                nextIndex = 0;
                            }
                        }
                        setSelectedChatId(sortedChats_1[nextIndex].id);
                        setSelectedChatIsRemote(false);
                        setChatSourceMode("local");
                    }
                    return;
                }
                // If dialog is open, navigate to selected chat and close
                if (quickSwitchOpen) {
                    var selectedChat = (_a = frozenRecentChatsRef.current) === null || _a === void 0 ? void 0 : _a[quickSwitchSelectedIndex];
                    if (selectedChat) {
                        setSelectedChatId(selectedChat.id);
                        // agentChats are local chats only
                        setSelectedChatIsRemote(false);
                        setChatSourceMode("local");
                    }
                    setQuickSwitchOpen(false);
                    setQuickSwitchSelectedIndex(0);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return function () {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (holdTimerRef.current) {
                clearTimeout(holdTimerRef.current);
            }
        };
    });
    // Get open sub-chats for quick-switch (only tabs that are open in the selector)
    // Sorted by position in openSubChatIds, with active first
    // Limited to 5 items for quick-switch dialog
    var recentSubChats = (0, solid_js_1.createMemo)(function () {
        if (!openSubChatIds || openSubChatIds.length === 0)
            return [];
        // Get sub-chat metadata for open tabs
        var openSubChats = openSubChatIds.map(function (id) { return allSubChats.find(function (c) { return c.id === id; }); }).filter(function (c) { return c !== undefined; });
        if (openSubChats.length === 0)
            return [];
        // Put active sub-chat first, keep rest in tab order, limit to 5
        if (activeSubChatId) {
            var activeChat = openSubChats.find(function (c) { return c.id === activeSubChatId; });
            var otherChats = openSubChats.filter(function (c) { return c.id !== activeSubChatId; }).slice(0, 4);
            return activeChat ? __spreadArray([activeChat], otherChats, true) : openSubChats.slice(0, 5);
        }
        return openSubChats.slice(0, 5);
    });
    // Keyboard navigation: Quick switch between agents (sub-chats within workspace)
    // Shortcut depends on ctrlTabTarget preference:
    // - "workspaces" (default): Opt+Ctrl+Tab switches agents
    // - "agents": Ctrl+Tab switches agents
    // Uses refs for dialog state to avoid effect re-running and losing keyup events
    (0, solid_js_1.createEffect)(function () {
        var handleKeyDown = function (e) {
            var _a, _b, _c, _d;
            // Determine shortcut based on preference
            var isCtrlTabOnly = e.ctrlKey && e.key === "Tab" && !e.altKey && !e.metaKey;
            var isOptCtrlTab = e.altKey && e.ctrlKey && e.key === "Tab" && !e.metaKey;
            // Agent switch: Opt+Ctrl+Tab by default, or Ctrl+Tab when ctrlTabTarget is "agents"
            var isAgentSwitchShortcut = ctrlTabTarget === "agents" ? isCtrlTabOnly : isOptCtrlTab;
            if (isAgentSwitchShortcut) {
                e.preventDefault();
                subChatWasShiftPressedRef.current = e.shiftKey;
                // If dialog is open, navigate through sub-chats
                if (subChatQuickSwitchOpenRef.current) {
                    var nextIndex = void 0;
                    if (e.shiftKey) {
                        nextIndex = subChatQuickSwitchSelectedIndexRef.current - 1;
                        if (nextIndex < 0) {
                            nextIndex = ((_b = (_a = frozenSubChatsRef.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) - 1;
                        }
                    }
                    else {
                        nextIndex = (subChatQuickSwitchSelectedIndexRef.current + 1) % ((_d = (_c = frozenSubChatsRef.current) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 1);
                    }
                    setSubChatQuickSwitchSelectedIndex(nextIndex);
                    return;
                }
                // If dialog is not open yet, start hold timer
                if (!subChatQuickSwitchOpenRef.current && !subChatHoldTimerRef.current) {
                    // Get fresh data from store for snapshot
                    var store = sub_chat_store_1.useAgentSubChatStore.getState();
                    var currentOpenIds = store.openSubChatIds;
                    var currentAllSubChats_1 = store.allSubChats;
                    var currentActiveId_1 = store.activeSubChatId;
                    if (currentOpenIds.length === 0)
                        return;
                    subChatModifierKeysHeldRef.current = true;
                    // Build frozen snapshot from current store state
                    var openSubChats = currentOpenIds.map(function (id) { return currentAllSubChats_1.find(function (c) { return c.id === id; }); }).filter(function (c) { return c !== undefined; });
                    if (openSubChats.length === 0)
                        return;
                    // Put active sub-chat first, limit to 5
                    if (currentActiveId_1) {
                        var activeChat = openSubChats.find(function (c) { return c.id === currentActiveId_1; });
                        var otherChats = openSubChats.filter(function (c) { return c.id !== currentActiveId_1; }).slice(0, 4);
                        frozenSubChatsRef.current = activeChat ? __spreadArray([activeChat], otherChats, true) : openSubChats.slice(0, 5);
                    }
                    else {
                        frozenSubChatsRef.current = openSubChats.slice(0, 5);
                    }
                    subChatHoldTimerRef.current = setTimeout(function () {
                        var _a, _b, _c, _d;
                        // Clear timer ref AFTER it fires - this is critical for close detection
                        subChatHoldTimerRef.current = null;
                        if (subChatModifierKeysHeldRef.current) {
                            // Update ref immediately so keyUp can detect dialog is open
                            // (before React re-renders and updates the ref from state)
                            subChatQuickSwitchOpenRef.current = true;
                            setSubChatQuickSwitchOpen(true);
                            if (subChatWasShiftPressedRef.current) {
                                setSubChatQuickSwitchSelectedIndex(((_b = (_a = frozenSubChatsRef.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) - 1);
                            }
                            else {
                                setSubChatQuickSwitchSelectedIndex(((_d = (_c = frozenSubChatsRef.current) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 1) > 1 ? 1 : 0);
                            }
                        }
                    }, 30);
                    return;
                }
            }
        };
        var handleKeyUp = function (e) {
            var _a;
            // ESC to close dialog without navigating
            if (e.key === "Escape" && subChatQuickSwitchOpenRef.current) {
                e.preventDefault();
                subChatModifierKeysHeldRef.current = false;
                if (subChatHoldTimerRef.current) {
                    clearTimeout(subChatHoldTimerRef.current);
                    subChatHoldTimerRef.current = null;
                }
                setSubChatQuickSwitchOpen(false);
                setSubChatQuickSwitchSelectedIndex(0);
                return;
            }
            // When modifier key is released
            // For agents mode (Ctrl+Tab): react to Control release
            // For workspaces mode (Opt+Ctrl+Tab): react to Alt or Control release
            var isRelevantKeyRelease = ctrlTabTarget === "agents" ? e.key === "Control" : e.key === "Alt" || e.key === "Control";
            if (isRelevantKeyRelease) {
                subChatModifierKeysHeldRef.current = false;
                // If timer is still running (quick press - dialog not shown yet)
                if (subChatHoldTimerRef.current) {
                    clearTimeout(subChatHoldTimerRef.current);
                    subChatHoldTimerRef.current = null;
                    // Do quick switch without showing dialog (only between open tabs)
                    var store = sub_chat_store_1.useAgentSubChatStore.getState();
                    var currentOpenIds = store.openSubChatIds;
                    var currentActiveId = store.activeSubChatId;
                    if (currentOpenIds && currentOpenIds.length > 1) {
                        if (!currentActiveId) {
                            store.setActiveSubChat(currentOpenIds[0]);
                            return;
                        }
                        var currentIndex = currentOpenIds.indexOf(currentActiveId);
                        if (currentIndex === -1) {
                            store.setActiveSubChat(currentOpenIds[0]);
                            return;
                        }
                        var nextIndex = void 0;
                        if (subChatWasShiftPressedRef.current) {
                            nextIndex = currentIndex - 1;
                            if (nextIndex < 0)
                                nextIndex = currentOpenIds.length - 1;
                        }
                        else {
                            nextIndex = currentIndex + 1;
                            if (nextIndex >= currentOpenIds.length)
                                nextIndex = 0;
                        }
                        store.setActiveSubChat(currentOpenIds[nextIndex]);
                    }
                    return;
                }
                // If dialog is open, navigate to selected sub-chat and close
                if (subChatQuickSwitchOpenRef.current) {
                    var selectedSubChat = (_a = frozenSubChatsRef.current) === null || _a === void 0 ? void 0 : _a[subChatQuickSwitchSelectedIndexRef.current];
                    if (selectedSubChat) {
                        sub_chat_store_1.useAgentSubChatStore.getState().setActiveSubChat(selectedSubChat.id);
                    }
                    setSubChatQuickSwitchOpen(false);
                    setSubChatQuickSwitchSelectedIndex(0);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return function () {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (subChatHoldTimerRef.current) {
                clearTimeout(subChatHoldTimerRef.current);
            }
        };
    });
    // Note: Cmd+E archive hotkey is handled in AgentsSidebar to share undo stack
    var handleSignOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof window !== "undefined" && window.desktopApi)) return [3 /*break*/, 2];
                    // Use desktop logout which clears the token and shows login page
                    return [4 /*yield*/, window.desktopApi.logout()];
                case 1:
                    // Use desktop logout which clears the token and shows login page
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: 
                // Web: use Clerk sign out
                return [4 /*yield*/, signOut({ redirectUrl: window.location.pathname })];
                case 3:
                    // Web: use Clerk sign out
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Check if sub-chats data is loaded (use separate selectors to avoid object creation)
    var subChatsStoreChatId = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.chatId; });
    var subChatsCount = (0, sub_chat_store_1.useAgentSubChatStore)(function (state) { return state.allSubChats.length; });
    // Check if sub-chats are still loading (store not yet initialized for this chat)
    var isLoadingSubChats = selectedChatId !== null && (subChatsStoreChatId !== selectedChatId || subChatsCount === 0);
    // Track sub-chats sidebar open state for animation control
    // Now renders even while loading to show spinner (mobile always uses tabs)
    var isSubChatsSidebarOpen = selectedChatId && subChatsSidebarMode === "sidebar" && !isMobile;
    (0, solid_js_1.createEffect)(function () {
        // When sidebar closes, reset for animation on next open
        if (!isSubChatsSidebarOpen && wasSubChatsSidebarOpen.current) {
            hasOpenedSubChatsSidebar.current = false;
            setShouldAnimateSubChatsSidebar(true);
        }
        wasSubChatsSidebarOpen.current = !!isSubChatsSidebarOpen;
        // Mark as opened after animation completes
        if (isSubChatsSidebarOpen && !hasOpenedSubChatsSidebar.current) {
            var timer_1 = setTimeout(function () {
                hasOpenedSubChatsSidebar.current = true;
                setShouldAnimateSubChatsSidebar(false);
            }, 150 + 50);
            return function () { return clearTimeout(timer_1); };
        }
        else if (isSubChatsSidebarOpen && hasOpenedSubChatsSidebar.current) {
            setShouldAnimateSubChatsSidebar(false);
        }
    });
    // Check if chat has sandbox with port for preview
    var chatMeta = chatData === null || chatData === void 0 ? void 0 : chatData.meta;
    var isQuickSetup = (chatMeta === null || chatMeta === void 0 ? void 0 : chatMeta.isQuickSetup) === true;
    var canShowPreview = !!((chatData === null || chatData === void 0 ? void 0 : chatData.sandbox_id) && !isQuickSetup && ((_b = chatMeta === null || chatMeta === void 0 ? void 0 : chatMeta.sandboxConfig) === null || _b === void 0 ? void 0 : _b.port));
    // Check if diff can be shown (sandbox exists)
    var canShowDiff = !!(chatData === null || chatData === void 0 ? void 0 : chatData.sandbox_id);
    // Check if terminal can be shown (worktree exists - desktop only)
    var worktreePath = chatData === null || chatData === void 0 ? void 0 : chatData.worktreePath;
    var canShowTerminal = !!worktreePath;
    // Mobile layout - completely different structure
    if (isMobile) {
        return <div class="flex h-full bg-background" data-agents-page data-mobile-view>
        {/* Mobile View Modes */}
        {mobileViewMode === "chats" ? <agents_sidebar_1.AgentsSidebar userId={userId} clerkUser={user} onSignOut={handleSignOut} onToggleSidebar={function () { }} isMobileFullscreen={true} onChatSelect={function () { return setMobileViewMode("chat"); }}/> : mobileViewMode === "preview" && selectedChatId && canShowPreview ? <agent_preview_1.AgentPreview chatId={selectedChatId} sandboxId={chatData.sandbox_id} port={(_c = chatMeta === null || chatMeta === void 0 ? void 0 : chatMeta.sandboxConfig) === null || _c === void 0 ? void 0 : _c.port} isMobile={true} onClose={function () { return setMobileViewMode("chat"); }}/> : mobileViewMode === "diff" && selectedChatId && canShowDiff ? <agent_diff_view_1.AgentDiffView chatId={selectedChatId} sandboxId={chatData.sandbox_id} worktreePath={worktreePath} repository={chatMeta === null || chatMeta === void 0 ? void 0 : chatMeta.repository} showFooter={true} isMobile={true} onClose={function () { return setMobileViewMode("chat"); }}/> : mobileViewMode === "terminal" && selectedChatId && canShowTerminal ? <terminal_1.TerminalSidebar chatId={selectedChatId} cwd={worktreePath} workspaceId={selectedChatId} isMobileFullscreen={true} onClose={function () { return setMobileViewMode("chat"); }}/> : <div class="h-full w-full flex flex-col overflow-hidden select-text" data-mobile-chat-mode>
            {selectedChatId ? <active_chat_1.ChatView key={"".concat(chatSourceMode, "-").concat(selectedChatId)} chatId={selectedChatId} isSidebarOpen={false} onToggleSidebar={function () { }} selectedTeamName={selectedTeam === null || selectedTeam === void 0 ? void 0 : selectedTeam.name} selectedTeamImageUrl={selectedTeam === null || selectedTeam === void 0 ? void 0 : selectedTeam.image_url} isMobileFullscreen={true} onBackToChats={function () {
                        setMobileViewMode("chats");
                        setSelectedChatId(null);
                    }} onOpenPreview={canShowPreview ? function () { return setMobileViewMode("preview"); } : undefined} onOpenDiff={canShowDiff ? function () { return setMobileViewMode("diff"); } : undefined} onOpenTerminal={canShowTerminal ? function () {
                        setTerminalSidebarOpen(true);
                        setMobileViewMode("terminal");
                    } : undefined}/> : <div class="h-full flex flex-col relative overflow-hidden">
                <new_chat_form_1.NewChatForm isMobileFullscreen={true} onBackToChats={function () { return setMobileViewMode("chats"); }}/>
              </div>}
          </div>}
      </div>;
    }
    // Desktop layout
    return <>
      <div class="flex h-full">
        {/* Sub-chats sidebar - only show in sidebar mode when viewing a chat */}
        <resizable_sidebar_1.ResizableSidebar isOpen={!!isSubChatsSidebarOpen} onClose={function () {
            setShouldAnimateSubChatsSidebar(true);
            setSubChatsSidebarMode("tabs");
        }} widthAtom={atoms_1.agentsSubChatsSidebarWidthAtom} minWidth={160} maxWidth={300} side="left" animationDuration={0} initialWidth={0} exitWidth={0} disableClickToClose={true}>
          <agents_subchats_sidebar_1.AgentsSubChatsSidebar onClose={function () {
            setShouldAnimateSubChatsSidebar(true);
            setSubChatsSidebarMode("tabs");
        }} isMobile={isMobile} isSidebarOpen={sidebarOpen} onBackToChats={function () { return setSidebarOpen(function (prev) { return !prev; }); }} isLoading={isLoadingSubChats} agentName={chatData === null || chatData === void 0 ? void 0 : chatData.name}/>
        </resizable_sidebar_1.ResizableSidebar>

        {/* Main content */}
        <div class="flex-1 min-w-0 overflow-hidden" style={{ minWidth: "350px" }}>
          {selectedChatId ? <div class="h-full flex flex-col relative overflow-hidden">
              <active_chat_1.ChatView key={"".concat(chatSourceMode, "-").concat(selectedChatId)} chatId={selectedChatId} isSidebarOpen={sidebarOpen} onToggleSidebar={function () { return setSidebarOpen(function (prev) { return !prev; }); }} selectedTeamName={selectedTeam === null || selectedTeam === void 0 ? void 0 : selectedTeam.name} selectedTeamImageUrl={selectedTeam === null || selectedTeam === void 0 ? void 0 : selectedTeam.image_url}/>
            </div> : selectedDraftId || showNewChatForm ? <div class="h-full flex flex-col relative overflow-hidden">
              <new_chat_form_1.NewChatForm key={"new-chat-".concat(newChatFormKeyRef.current)}/>
            </div> : betaKanbanEnabled ? <kanban_1.KanbanView /> : <div class="h-full flex flex-col relative overflow-hidden">
              <new_chat_form_1.NewChatForm key={"new-chat-".concat(newChatFormKeyRef.current)}/>
            </div>}
        </div>
      </div>

      {/* Quick-switch dialog - Agents (Opt+Ctrl+Tab) */}
      <agents_quick_switch_dialog_1.AgentsQuickSwitchDialog isOpen={quickSwitchOpen} chats={quickSwitchOpen ? (_d = frozenRecentChatsRef.current) !== null && _d !== void 0 ? _d : [] : recentChats} selectedIndex={quickSwitchSelectedIndex} projectsMap={projectsMap} onHover={setQuickSwitchSelectedIndex}/>

      {/* Quick-switch dialog - Sub-chats (Ctrl+Tab) */}
      <subchats_quick_switch_dialog_1.SubChatsQuickSwitchDialog isOpen={subChatQuickSwitchOpen} subChats={subChatQuickSwitchOpen ? (_e = frozenSubChatsRef.current) !== null && _e !== void 0 ? _e : [] : recentSubChats} selectedIndex={subChatQuickSwitchSelectedIndex} onHover={setSubChatQuickSwitchSelectedIndex}/>

      {/* Dev mode / Admin sandbox debugger */}
      {(process.env.NODE_ENV === "development" || isAdmin) && (chatData === null || chatData === void 0 ? void 0 : chatData.sandbox_id) && <a href={"https://codesandbox.io/p/devbox/".concat(chatData.sandbox_id)} target="_blank" rel="noopener noreferrer" class="fixed bottom-4 right-4 z-50 bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-mono opacity-70 hover:opacity-100 hover:bg-zinc-800 transition-all cursor-pointer">
            sandbox: {chatData.sandbox_id}
          </a>}
    </>;
}
