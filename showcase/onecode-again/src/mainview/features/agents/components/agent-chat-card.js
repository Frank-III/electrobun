"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChatCard = AgentChatCard;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
var canvas_icons_1 = require("../../../components/ui/canvas-icons");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
// GitHub avatar with loading placeholder
function GitHubAvatar(_a) {
    var gitOwner = _a.gitOwner, _b = _a.className, className = _b === void 0 ? "h-4 w-4" : _b;
    var _c = (0, solid_js_1.createSignal)(false), isLoaded = _c[0], setIsLoaded = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), hasError = _d[0], setHasError = _d[1];
    var handleLoad = function () { return setIsLoaded(true); };
    var handleError = function () { return setHasError(true); };
    if (hasError) {
        return <canvas_icons_1.GitHubLogo class={(0, utils_1.cn)(className, "text-muted-foreground flex-shrink-0")}/>;
    }
    return <div class={(0, utils_1.cn)(className, "relative flex-shrink-0")}>
      {/* Placeholder background while loading */}
      {!isLoaded && <div class="absolute inset-0 rounded-sm bg-muted"/>}
      <img src={"https://github.com/".concat(gitOwner, ".png?size=64")} alt={gitOwner} class={(0, utils_1.cn)(className, "rounded-sm flex-shrink-0", isLoaded ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError}/>
    </div>;
}
// Chat icon with status badge
function ChatIconWithBadge(_a) {
    var isLoading = _a.isLoading, hasUnseenChanges = _a.hasUnseenChanges, lastMode = _a.lastMode, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, gitOwner = _a.gitOwner, gitProvider = _a.gitProvider;
    // Show GitHub avatar if available, otherwise blank project icon
    var renderMainIcon = function () {
        if (gitOwner && gitProvider === "github") {
            return <GitHubAvatar gitOwner={gitOwner}/>;
        }
        return <canvas_icons_1.GitHubLogo class="h-4 w-4 flex-shrink-0 text-muted-foreground"/>;
    };
    return <div class="relative flex-shrink-0 h-4 w-4">
      {renderMainIcon()}
      {/* Badge in bottom-right corner */}
      <div class={(0, utils_1.cn)("absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center", isSelected ? "bg-primary" : "bg-background")}>
        {isLoading ? <canvas_icons_1.IconSpinner class={(0, utils_1.cn)("w-2.5 h-2.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/> : hasUnseenChanges ? <div class="w-2 h-2 rounded-full bg-[#307BD0]"/> : lastMode === "plan" ? <canvas_icons_1.PlanIcon class={(0, utils_1.cn)("w-2.5 h-2.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/> : <canvas_icons_1.AgentIcon class={(0, utils_1.cn)("w-2.5 h-2.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}/>}
      </div>
    </div>;
}
function AgentChatCard(_a) {
    var chat = _a.chat, isSelected = _a.isSelected, isLoading = _a.isLoading, onClick = _a.onClick, onMouseEnter = _a.onMouseEnter, _b = _a.variant, variant = _b === void 0 ? "sidebar" : _b, gitOwner = _a.gitOwner, gitProvider = _a.gitProvider, repoName = _a.repoName;
    // Get status atoms
    var unseenChanges = (0, jotai_1.useAtomValue)(atoms_1.agentsUnseenChangesAtom);
    var lastChatModes = (0, jotai_1.useAtomValue)(atoms_1.lastChatModesAtom);
    var hasUnseenChanges = unseenChanges().has(chat.id);
    var lastMode = lastChatModes().get(chat.id) || "agent";
    // isLoading is already derived from loadingSubChatsAtom (local tracking)
    var actualIsLoading = isLoading;
    if (variant === "quick-switch") {
        // Desktop: use branch from chat and repo name from project
        var branch = chat.branch;
        var displayRepoName = repoName || "Local project";
        var displayText = branch ? "".concat(displayRepoName, " \u2022 ").concat(branch) : displayRepoName;
        return <div onClick={onClick} onMouseEnter={onMouseEnter} class={(0, utils_1.cn)("relative rounded-2xl overflow-hidden min-w-[160px] max-w-[180px] p-2 cursor-pointer", isSelected ? "bg-primary shadow-lg" : "bg-transparent")}>
        <div class="flex items-start gap-2.5">
          <div class="pt-0.5">
            <ChatIconWithBadge isLoading={actualIsLoading} hasUnseenChanges={hasUnseenChanges} lastMode={lastMode} isSelected={isSelected} gitOwner={gitOwner} gitProvider={gitProvider}/>
          </div>
          <div class="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Chat name */}
            <span class={(0, utils_1.cn)("truncate block text-sm leading-tight", isSelected ? "text-primary-foreground" : "text-foreground")}>
              {chat.name || "Untitled Chat"}
            </span>
            {/* Branch/Repository info */}
            <span class={(0, utils_1.cn)("text-[11px] truncate", isSelected ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
              {displayText}
            </span>
          </div>
        </div>
      </div>;
    }
    // Sidebar variant (default)
    return <div onClick={onClick} class={(0, utils_1.cn)("w-full text-left pl-2 pr-2 py-1.5 rounded-md transition-colors duration-150 cursor-pointer group relative", "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70", isSelected ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")}>
      <div class="flex items-start gap-2.5">
        <div class="pt-0.5">
          <ChatIconWithBadge isLoading={actualIsLoading} hasUnseenChanges={hasUnseenChanges} lastMode={lastMode} isSelected={isSelected} gitOwner={gitOwner} gitProvider={gitProvider}/>
        </div>
        <div class="flex-1 min-w-0">
          <span class="truncate block text-sm leading-tight">
            {chat.name || "Untitled Chat"}
          </span>
        </div>
      </div>
    </div>;
}
