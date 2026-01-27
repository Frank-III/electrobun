"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoSection = void 0;
var solid_js_1 = require("solid-js");
var icons_1 = require("@/components/ui/icons");
var tooltip_1 = require("@/components/ui/tooltip");
var trpc_1 = require("@/lib/trpc");
/** Property row component - Notion-style with icon, label, and value */
function PropertyRow(_a) {
    var Icon = _a.icon, label = _a.label, value = _a.value, title = _a.title, onClick = _a.onClick, copyable = _a.copyable, tooltip = _a.tooltip;
    var _b = (0, solid_js_1.createSignal)(false), showCopied = _b[0], setShowCopied = _b[1];
    var handleClick = function () {
        if (copyable) {
            navigator.clipboard.writeText(value);
            setShowCopied(true);
            setTimeout(function () { return setShowCopied(false); }, 1500);
        }
        else if (onClick) {
            onClick();
        }
    };
    var isClickable = onClick || copyable;
    var valueSpan = <span class={"text-xs text-foreground ".concat(isClickable ? "cursor-pointer hover:underline" : "")} title={!tooltip ? title : undefined} onClick={handleClick}>
      {value}
    </span>;
    return <div class="flex items-center min-h-[28px]">
      {/* Label column - fixed width */}
      <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
        <Icon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
        <span class="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      {/* Value column - flexible */}
      <div class="flex-1 min-w-0 pl-2 truncate">
        {copyable ? <tooltip_1.Tooltip open={showCopied ? true : undefined}>
            <tooltip_1.TooltipTrigger asChild>
              {valueSpan}
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="top" class="text-xs">
              {showCopied ? "Copied" : "Click to copy"}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip> : tooltip ? <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              {valueSpan}
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="top" class="text-xs">
              {tooltip}
            </tooltip_1.TooltipContent>
          </tooltip_1.Tooltip> : valueSpan}
      </div>
    </div>;
}
/**
* Info Section for Details Sidebar
* Shows workspace info: branch, PR, path
* Memoized to prevent re-renders when parent updates
*/
exports.InfoSection = memo(function InfoSection(_a) {
    var chatId = _a.chatId, worktreePath = _a.worktreePath, _b = _a.isExpanded, isExpanded = _b === void 0 ? false : _b, remoteInfo = _a.remoteInfo;
    // Extract folder name from path
    var folderName = (worktreePath === null || worktreePath === void 0 ? void 0 : worktreePath.split("/").pop()) || "Unknown";
    // Mutation to open folder in Finder
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    // Check if this is a remote sandbox chat (no local worktree)
    var isRemoteChat = !worktreePath && !!remoteInfo;
    // Fetch branch data directly (only for local chats)
    var _c = trpc_1.trpc.changes.getBranches.useQuery({ worktreePath: worktreePath || "" }, { enabled: !!worktreePath }), branchData = _c.data, isBranchLoading = _c.isLoading;
    // Get PR status for current branch (only for local chats)
    var prStatus = trpc_1.trpc.chats.getPrStatus.useQuery({ chatId: chatId }, {
        refetchInterval: 3e4,
        enabled: !!chatId && !!worktreePath
    }).data;
    // For local chats: use fetched branch data
    // For remote chats: use remoteInfo from props
    var branchName = isRemoteChat ? remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.branch : branchData === null || branchData === void 0 ? void 0 : branchData.current;
    var pr = prStatus === null || prStatus === void 0 ? void 0 : prStatus.pr;
    // Extract repo name from repository URL (e.g., "owner/repo" from "github.com/owner/repo")
    var repositoryName = (remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.repository) ? remoteInfo.repository.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "") : null;
    var handleOpenFolder = function () {
        if (worktreePath) {
            openInFinderMutation.mutate(worktreePath);
        }
    };
    var handleOpenPr = function () {
        if (pr === null || pr === void 0 ? void 0 : pr.url) {
            window.desktopApi.openExternal(pr.url);
        }
    };
    var handleOpenRepository = function () {
        if (remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.repository) {
            var repoUrl = remoteInfo.repository.startsWith("http") ? remoteInfo.repository : "https://github.com/".concat(remoteInfo.repository);
            window.desktopApi.openExternal(repoUrl);
        }
    };
    var handleOpenSandbox = function () {
        if (remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.sandboxId) {
            var sandboxUrl = "https://3003-".concat(remoteInfo.sandboxId, ".e2b.app");
            window.desktopApi.openExternal(sandboxUrl);
        }
    };
    // Show loading state while branch data is loading (only for local chats)
    if (!isRemoteChat && isBranchLoading) {
        return <div class="px-2 py-1.5 flex flex-col gap-0.5">
        <div class="flex items-center min-h-[28px]">
          <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
            <div class="h-3.5 w-3.5 rounded bg-muted animate-pulse"/>
            <div class="h-3 w-12 rounded bg-muted animate-pulse"/>
          </div>
          <div class="flex-1 min-w-0 pl-2">
            <div class="h-3 w-32 rounded bg-muted animate-pulse"/>
          </div>
        </div>
        <div class="flex items-center min-h-[28px]">
          <div class="flex items-center gap-1.5 w-[100px] flex-shrink-0">
            <div class="h-3.5 w-3.5 rounded bg-muted animate-pulse"/>
            <div class="h-3 w-8 rounded bg-muted animate-pulse"/>
          </div>
          <div class="flex-1 min-w-0 pl-2">
            <div class="h-3 w-24 rounded bg-muted animate-pulse"/>
          </div>
        </div>
      </div>;
    }
    var hasContent = branchName || worktreePath || repositoryName || (remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.sandboxId);
    if (!hasContent) {
        return <div class="px-2 py-2">
        <div class="text-xs text-muted-foreground">
          No workspace info available
        </div>
      </div>;
    }
    return <div class="px-2 py-1.5 flex flex-col gap-0.5">
      {/* Repository - only for remote chats */}
      {repositoryName && <PropertyRow icon={icons_1.FolderFilledIcon} label="Repository" value={repositoryName} title={remoteInfo === null || remoteInfo === void 0 ? void 0 : remoteInfo.repository} onClick={handleOpenRepository} tooltip="Open in GitHub"/>}
      {/* Branch - for both local and remote */}
      {branchName && <PropertyRow icon={icons_1.GitBranchFilledIcon} label="Branch" value={branchName} copyable/>}
      {/* PR - only for local chats */}
      {pr && <PropertyRow icon={icons_1.GitPullRequestFilledIcon} label="Pull Request" value={"#".concat(pr.number)} title={pr.title} onClick={handleOpenPr} tooltip="Open in GitHub"/>}
      {/* Path - only for local chats */}
      {worktreePath && <PropertyRow icon={icons_1.FolderFilledIcon} label="Path" value={folderName} title={worktreePath} onClick={handleOpenFolder} tooltip="Open in Finder"/>}
    </div>;
});
