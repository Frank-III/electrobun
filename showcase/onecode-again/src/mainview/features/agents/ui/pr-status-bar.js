"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrStatusBar = PrStatusBar;
var trpc_1 = require("../../../lib/trpc");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../../components/ui/icons");
function getStatusLabel(state, reviewDecision) {
    if (state === "merged")
        return "Merged";
    if (state === "closed")
        return "Closed";
    if (state === "draft")
        return "Draft";
    if (reviewDecision === "approved")
        return "Ready to merge";
    if (reviewDecision === "changes_requested")
        return "Changes requested";
    return "Open";
}
function PrStatusBar(_a) {
    var chatId = _a.chatId, prUrl = _a.prUrl, prNumber = _a.prNumber;
    console.log("[PrStatusBar] Rendered with props:", {
        chatId: chatId,
        prUrl: prUrl,
        prNumber: prNumber
    });
    // Poll PR status every 30 seconds
    var _b = trpc_1.trpc.chats.getPrStatus.useQuery({ chatId: chatId }, { refetchInterval: 3e4 }), status = _b.data, isLoading = _b.isLoading;
    console.log("[PrStatusBar] Query state:", {
        isLoading: isLoading,
        status: status,
        pr: status === null || status === void 0 ? void 0 : status.pr
    });
    var pr = status === null || status === void 0 ? void 0 : status.pr;
    var handleOpenPr = function () {
        window.desktopApi.openExternal(prUrl);
    };
    return <div class="flex items-center gap-3 px-3 py-2 bg-muted/30 border-b border-border/50">
      {/* PR Link */}
      <button onClick={handleOpenPr} class="flex items-center gap-1.5 text-sm font-medium hover:underline text-foreground cursor-pointer">
        <lucide_solid_1.GitPullRequest class="h-4 w-4"/>
        <span>PR #{prNumber}</span>
      </button>

      {/* Status */}
      {isLoading ? <icons_1.IconSpinner class="h-3.5 w-3.5"/> : pr ? <span class="text-xs font-mono text-muted-foreground">
          {getStatusLabel(pr.state, pr.reviewDecision)}
        </span> : null}
    </div>;
}
