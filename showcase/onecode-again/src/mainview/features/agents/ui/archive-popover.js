"use client";
"use strict";
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
exports.ArchivePopover = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var trpc_1 = require("../../../lib/trpc");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
var use_remote_chats_1 = require("../../../lib/hooks/use-remote-chats");
var input_1 = require("../../../components/ui/input");
var icons_1 = require("../../../components/ui/icons");
var popover_1 = require("../../../components/ui/popover");
var utils_1 = require("../../../lib/utils");
// GitHub avatar with loading placeholder
function GitHubAvatar(_a) {
    var gitOwner = _a.gitOwner, _b = _a.className, className = _b === void 0 ? "h-4 w-4" : _b;
    var _c = (0, solid_js_1.createSignal)(false), isLoaded = _c[0], setIsLoaded = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), hasError = _d[0], setHasError = _d[1];
    var handleLoad = function () { return setIsLoaded(true); };
    var handleError = function () { return setHasError(true); };
    if (hasError) {
        return <icons_1.GitHubLogo class={(0, utils_1.cn)(className, "text-muted-foreground flex-shrink-0")}/>;
    }
    return <div class={(0, utils_1.cn)(className, "relative flex-shrink-0")}>
      {/* Placeholder background while loading */}
      {!isLoaded && <div class="absolute inset-0 rounded-sm bg-muted"/>}
      <img src={"https://github.com/".concat(gitOwner, ".png?size=64")} alt={gitOwner} class={(0, utils_1.cn)(className, "rounded-sm flex-shrink-0", isLoaded ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError}/>
    </div>;
}
// Format relative time - moved outside component to avoid recreation
var formatTime = function (dateInput) {
    var date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffMins = Math.floor(diffMs / 6e4);
    var diffHours = Math.floor(diffMs / 36e5);
    var diffDays = Math.floor(diffMs / 864e5);
    if (diffMins < 1)
        return "now";
    if (diffMins < 60)
        return "".concat(diffMins, "m");
    if (diffHours < 24)
        return "".concat(diffHours, "h");
    if (diffDays < 7)
        return "".concat(diffDays, "d");
    if (diffDays < 30)
        return "".concat(Math.floor(diffDays / 7), "w");
    if (diffDays < 365)
        return "".concat(Math.floor(diffDays / 30), "mo");
    return "".concat(Math.floor(diffDays / 365), "y");
};
var ArchiveChatItem = (0, solid_js_1.memo)(function ArchiveChatItem(_a) {
    var _b;
    var chat = _a.chat, index = _a.index, isSelected = _a.isSelected, isCurrentChat = _a.isCurrentChat, showIcon = _a.showIcon, projectsMap = _a.projectsMap, stats = _a.stats, onSelect = _a.onSelect, onRestore = _a.onRestore, setRef = _a.setRef;
    var branch = chat.branch;
    // For local chats, use projectsMap; for remote chats, use chat properties directly
    var project = chat.projectId ? projectsMap.get(chat.projectId) : null;
    var gitOwner = chat.gitOwner || (project === null || project === void 0 ? void 0 : project.gitOwner);
    var gitRepo = chat.repository || (project === null || project === void 0 ? void 0 : project.gitRepo);
    var gitProvider = chat.gitProvider || (project === null || project === void 0 ? void 0 : project.gitProvider);
    var isGitHubRepo = gitProvider === "github" && !!gitOwner;
    var repoName = gitRepo || (project === null || project === void 0 ? void 0 : project.name);
    var displayText = branch ? repoName ? "".concat(repoName, " \u2022 ").concat(branch) : branch : repoName || "Local project";
    var handleClick = function () {
        onSelect(chat.id);
    };
    var handleRestore = function (e) {
        e.stopPropagation();
        onRestore(chat.id);
    };
    var handleRef = function (el) {
        setRef(index, el);
    };
    return <div ref={handleRef} onClick={handleClick} class={(0, utils_1.cn)("w-[calc(100%-8px)] mx-1 text-left min-h-[32px] py-[5px] px-1.5 rounded-md transition-colors duration-75 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isSelected || isCurrentChat ? "dark:bg-neutral-800 bg-accent text-foreground" : "text-muted-foreground dark:hover:bg-neutral-800 hover:bg-accent hover:text-foreground")}>
      <div class="flex items-start gap-2.5">
        {showIcon && <div class="pt-0.5">
            {isGitHubRepo && gitOwner ? <GitHubAvatar gitOwner={gitOwner}/> : <icons_1.GitHubLogo class={(0, utils_1.cn)("h-4 w-4 flex-shrink-0 transition-colors duration-75", isSelected ? "text-foreground" : "text-muted-foreground")}/>}
          </div>}
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <div class="flex items-center gap-1">
            <span class="truncate block text-sm leading-tight flex-1">
              {chat.name || <span class="text-muted-foreground/50">
                  New workspace
                </span>}
            </span>
            <button onClick={handleRestore} class="flex-shrink-0 text-muted-foreground hover:text-foreground active:text-foreground transition-[color,transform] duration-150 ease-out active:scale-[0.97]" aria-label="Restore chat">
              <icons_1.IconTextUndo class="h-3 w-3"/>
            </button>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1 text-[11px] text-muted-foreground/60 truncate min-w-0">
              {/* Cloud icon for remote chats */}
              {chat.isRemote && <icons_1.CloudIcon class="h-2.5 w-2.5 flex-shrink-0"/>}
              <span class="truncate">{displayText}</span>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0 text-[11px]">
              {stats && (stats.additions > 0 || stats.deletions > 0) && <>
                  <span class="text-green-600 dark:text-green-400">+{stats.additions}</span>
                  <span class="text-red-600 dark:text-red-400">-{stats.deletions}</span>
                </>}
              <span class="text-muted-foreground/60">
                {formatTime((_b = chat.updatedAt) !== null && _b !== void 0 ? _b : new Date())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
});
exports.ArchivePopover = (0, solid_js_1.memo)(function ArchivePopover(_a) {
    var trigger = _a.trigger;
    var _b = (0, jotai_1.useAtom)(atoms_1.archivePopoverOpenAtom), open = _b[0], setOpen = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_1.archiveSearchQueryAtom), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = (0, solid_js_1.createSignal)(0), selectedIndex = _d[0], setSelectedIndex = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), searchInputRef = _e[0], setSearchInputRef = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), popoverContentRef = _f[0], setPopoverContentRef = _f[1];
    var _g = (0, solid_js_1.createSignal)([]), chatItemRefs = _g[0], setChatItemRefs = _g[1];
    var _h = (0, jotai_1.useAtom)(atoms_1.selectedAgentChatIdAtom), selectedChatId = _h[0], setSelectedChatId = _h[1];
    var _j = (0, jotai_1.useAtom)(atoms_1.selectedChatIsRemoteAtom), selectedChatIsRemote = _j[0], setSelectedChatIsRemote = _j[1];
    var setChatSourceMode = (0, jotai_1.useSetAtom)(atoms_2.chatSourceModeAtom);
    var showWorkspaceIcon = (0, jotai_1.useAtomValue)(atoms_2.showWorkspaceIconAtom);
    // Get utils outside of callbacks - hooks must be called at top level
    var utils = trpc_1.trpc.useUtils();
    // Local archived chats (always fetch)
    var _k = trpc_1.trpc.chats.listArchived.useQuery({}, { enabled: open }), localArchivedChats = _k.data, isLocalLoading = _k.isLoading;
    // Remote archived chats (always fetch)
    var _l = (0, use_remote_chats_1.useRemoteArchivedChats)(), remoteArchivedChats = _l.data, isRemoteLoading = _l.isLoading;
    // Loading if either is loading
    var isLoading = isLocalLoading || isRemoteLoading;
    // Fetch all projects for git info (for local chats)
    var projects = trpc_1.trpc.projects.list.useQuery(undefined).data;
    // Collect chat IDs for file stats query (only local chats)
    var archivedChatIds = (0, solid_js_1.createMemo)(function () {
        if (!localArchivedChats)
            return [];
        return localArchivedChats.map(function (chat) { return chat.id; });
    });
    // Fetch file stats for archived local chats
    var fileStatsData = trpc_1.trpc.chats.getFileStats.useQuery({ chatIds: archivedChatIds }, { enabled: open && archivedChatIds.length > 0 }).data;
    // Create map for quick project lookup by id
    var projectsMap = (0, solid_js_1.createMemo)(function () {
        if (!projects)
            return new Map();
        return new Map(projects.map(function (p) { return [p.id, p]; }));
    });
    // Create map for quick file stats lookup by chat id
    var fileStatsMap = (0, solid_js_1.createMemo)(function () {
        if (!fileStatsData)
            return new Map();
        return new Map(fileStatsData.map(function (s) { return [s.chatId, {
                additions: s.additions,
                deletions: s.deletions
            }]; }));
    });
    // Local restore mutation
    var localRestoreMutation = trpc_1.trpc.chats.restore.useMutation({ onSuccess: function (restoredChat) {
            // Optimistically add restored chat to the main list cache
            if (restoredChat) {
                utils.chats.list.setData({}, function (oldData) {
                    if (!oldData)
                        return [restoredChat];
                    // Add to beginning if not already present
                    if (oldData.some(function (c) { return c.id === restoredChat.id; }))
                        return oldData;
                    return __spreadArray([restoredChat], oldData, true);
                });
            }
            // Invalidate both lists to refresh
            utils.chats.list.invalidate();
            utils.chats.listArchived.invalidate();
        } });
    // Remote restore mutation
    var remoteRestoreMutation = (0, use_remote_chats_1.useRestoreRemoteChat)();
    // Normalize and merge archived chats from both sources
    var normalizedChats = (0, solid_js_1.createMemo)(function () {
        var _a, _b, _c;
        var merged = [];
        // Add local chats
        if (localArchivedChats) {
            for (var _i = 0, localArchivedChats_1 = localArchivedChats; _i < localArchivedChats_1.length; _i++) {
                var chat = localArchivedChats_1[_i];
                merged.push({
                    id: chat.id,
                    name: chat.name,
                    branch: chat.branch,
                    projectId: chat.projectId,
                    repository: null,
                    gitOwner: null,
                    gitProvider: null,
                    updatedAt: chat.updatedAt,
                    archivedAt: chat.archivedAt,
                    isRemote: false
                });
            }
        }
        // Add remote chats with prefixed IDs
        if (remoteArchivedChats) {
            for (var _d = 0, remoteArchivedChats_1 = remoteArchivedChats; _d < remoteArchivedChats_1.length; _d++) {
                var chat = remoteArchivedChats_1[_d];
                var meta = chat.meta;
                var repository = meta === null || meta === void 0 ? void 0 : meta.repository;
                var gitOwner = (_a = repository === null || repository === void 0 ? void 0 : repository.split("/")[0]) !== null && _a !== void 0 ? _a : null;
                merged.push({
                    id: "remote_".concat(chat.id),
                    name: chat.name,
                    branch: (_b = meta === null || meta === void 0 ? void 0 : meta.branch) !== null && _b !== void 0 ? _b : null,
                    projectId: null,
                    repository: repository !== null && repository !== void 0 ? repository : null,
                    gitOwner: gitOwner,
                    gitProvider: repository ? "github" : null,
                    updatedAt: chat.updated_at,
                    archivedAt: (_c = chat.archived_at) !== null && _c !== void 0 ? _c : null,
                    isRemote: true
                });
            }
        }
        return merged;
    });
    // Filter and sort archived chats (always newest first)
    var filteredChats = (0, solid_js_1.createMemo)(function () {
        return normalizedChats.filter(function (chat) {
            var _a;
            // Search filter by name only
            if (searchQuery.trim() && !((_a = chat.name) !== null && _a !== void 0 ? _a : "").toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        }).sort(function (a, b) {
            var aTime = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
            var bTime = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
            return bTime - aTime;
        });
    });
    // Clear search query and sync selected index when popover opens
    (0, solid_js_1.createEffect)(function () {
        if (open) {
            setSearchQuery("");
            setTimeout(function () {
                var _a;
                (_a = searchInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }, 0);
        }
    });
    // Sync selected index with filtered chats
    (0, solid_js_1.createEffect)(function () {
        if (open && filteredChats.length > 0) {
            // Find index of currently selected chat, default to 0 if not found
            var currentIndex = filteredChats.findIndex(function (chat) { return chat.id === selectedChatId; });
            setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
    });
    // Keyboard navigation - memoized to prevent recreation
    var handleKeyDown = function (e) {
        if (filteredChats.length === 0)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(function (prev) { return (prev + 1) % filteredChats.length; });
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(function (prev) { return (prev - 1 + filteredChats.length) % filteredChats.length; });
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            var chat = filteredChats[selectedIndex];
            if (chat) {
                if (chat.isRemote) {
                    // Extract original ID from prefixed remote ID
                    var originalId_1 = chat.id.replace(/^remote_/, "");
                    remoteRestoreMutation.mutate(originalId_1, { onSuccess: function () {
                            setSelectedChatId(originalId_1);
                            setSelectedChatIsRemote(true);
                            setChatSourceMode("sandbox");
                        } });
                }
                else {
                    localRestoreMutation.mutate({ id: chat.id });
                    setSelectedChatId(chat.id);
                    setSelectedChatIsRemote(false);
                    setChatSourceMode("local");
                }
                setOpen(false);
            }
        }
    };
    // Reset selected index and clear refs when search changes
    (0, solid_js_1.createEffect)(function () {
        setSelectedIndex(0);
        chatItemRefs.current = [];
    });
    // Scroll selected item into view
    (0, solid_js_1.createEffect)(function () {
        var selectedElement = chatItemRefs.current[selectedIndex];
        if (selectedElement) {
            selectedElement.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            });
        }
    });
    // Auto-close popover when archive becomes empty
    (0, solid_js_1.createEffect)(function () {
        if (open && normalizedChats && normalizedChats.length === 0) {
            setOpen(false);
        }
    });
    // Memoized callbacks for chat items
    var handleSelectChat = function (id) {
        var isRemote = id.startsWith("remote_");
        var originalId = isRemote ? id.replace(/^remote_/, "") : id;
        setSelectedChatId(originalId);
        setSelectedChatIsRemote(isRemote);
        // Sync chatSourceMode for ChatView to load data from correct source
        setChatSourceMode(isRemote ? "sandbox" : "local");
    };
    var handleRestoreChat = function (id) {
        // Check if this is a remote chat by its prefixed ID
        var isRemote = id.startsWith("remote_");
        if (isRemote) {
            // Extract original ID from prefixed remote ID
            var originalId_2 = id.replace(/^remote_/, "");
            remoteRestoreMutation.mutate(originalId_2, { onSuccess: function () {
                    setSelectedChatId(originalId_2);
                    setSelectedChatIsRemote(true);
                    setChatSourceMode("sandbox");
                } });
        }
        else {
            localRestoreMutation.mutate({ id: id });
            setSelectedChatId(id);
            setSelectedChatIsRemote(false);
            setChatSourceMode("local");
        }
    };
    var handleSetRef = function (index, el) {
        chatItemRefs.current[index] = el;
    };
    // Memoized search input handler
    var handleSearchChange = function (e) {
        setSearchQuery(e.target.value);
    };
    return <popover_1.Popover open={open} onOpenChange={setOpen}>
      <popover_1.PopoverTrigger asChild>{trigger}</popover_1.PopoverTrigger>
      <popover_1.PopoverContent ref={popoverContentRef} side="right" align="end" sideOffset={8} forceDark={false} class="w-[250px] h-[400px] p-0 flex flex-col overflow-hidden" onKeyDown={handleKeyDown} tabIndex={-1}>
        {/* Search */}
        <div class="p-1 border-b">
          <div class="relative flex items-center gap-1.5 h-7 px-1.5 rounded-md bg-muted/50">
            <icons_1.SearchIcon class="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
            <input_1.Input ref={searchInputRef} placeholder="Search..." value={searchQuery} onChange={handleSearchChange} class="h-auto p-0 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"/>
          </div>
        </div>

        {/* Archived Chats List */}
        <div class="flex-1 overflow-y-auto py-1">
          {isLoading ? <div class="flex items-center justify-center p-8 text-muted-foreground text-sm">
              Loading...
            </div> : filteredChats.length === 0 ? <div class="flex flex-col items-center justify-center h-full text-center">
              <icons_1.ArchiveIcon class="h-6 w-6 mb-2 text-muted-foreground opacity-40"/>
              <p class="text-xs text-muted-foreground opacity-40 pb-10">
                No archived agents
              </p>
            </div> : filteredChats.map(function (chat, index) {
            // For remote chats, compare without prefix
            var chatOriginalId = chat.isRemote ? chat.id.replace(/^remote_/, "") : chat.id;
            var isCurrentChat = selectedChatId === chatOriginalId && selectedChatIsRemote === chat.isRemote;
            return <ArchiveChatItem key={chat.id} chat={chat} index={index} isSelected={index === selectedIndex} isCurrentChat={isCurrentChat} showIcon={showWorkspaceIcon} projectsMap={projectsMap} stats={fileStatsMap.get(chat.id)} onSelect={handleSelectChat} onRestore={handleRestoreChat} setRef={handleSetRef}/>;
        })}
        </div>
      </popover_1.PopoverContent>
    </popover_1.Popover>;
});
