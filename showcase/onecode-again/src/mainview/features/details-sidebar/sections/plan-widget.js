"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanWidget = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var button_1 = require("@/components/ui/button");
var kbd_1 = require("@/components/ui/kbd");
var utils_1 = require("@/lib/utils");
var icons_1 = require("@/components/ui/icons");
var chat_markdown_renderer_1 = require("@/components/chat-markdown-renderer");
var trpc_1 = require("@/lib/trpc");
var atoms_1 = require("../atoms");
/**
* Plan Widget for Details Sidebar
* Shows plan content with expand/collapse functionality
* Keeps original header buttons (View plan, Approve) and adds expand/collapse icon
* Memoized to prevent re-renders when parent updates
*/
exports.PlanWidget = memo(function PlanWidget(_a) {
    var chatId = _a.chatId, activeSubChatId = _a.activeSubChatId, planPath = _a.planPath, refetchTrigger = _a.refetchTrigger, _b = _a.mode, mode = _b === void 0 ? "agent" : _b, onApprovePlan = _a.onApprovePlan, onExpandPlan = _a.onExpandPlan;
    // Use activeSubChatId for fetching if available
    var effectiveChatId = activeSubChatId || chatId;
    // Expanded/collapsed state
    var _c = (0, solid_js_1.createSignal)(false), isExpanded = _c[0], setIsExpanded = _c[1];
    // Refs for scroll gradients
    var _d = (0, solid_js_1.createSignal)(null), contentRef = _d[0], setContentRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), bottomGradientRef = _e[0], setBottomGradientRef = _e[1];
    // Plan content cache to avoid flashing loading state
    var _f = (0, jotai_1.useAtom)((0, atoms_1.planContentCacheAtomFamily)(effectiveChatId)), planCache = _f[0], setPlanCache = _f[1];
    // Fetch plan file content using tRPC
    var _g = trpc_1.trpc.files.readFile.useQuery({ filePath: planPath }, { enabled: !!planPath }), planContent = _g.data, isLoading = _g.isLoading, error = _g.error, refetch = _g.refetch;
    // Update cache when content loads successfully
    (0, solid_js_1.createEffect)(function () {
        if (planContent && planPath) {
            setPlanCache({
                content: planContent,
                planPath: planPath,
                isReady: true
            });
        }
    });
    // Refetch when trigger changes
    (0, solid_js_1.createEffect)(function () {
        if (refetchTrigger && planPath) {
            refetch();
        }
    });
    // Use cached content while loading new content to prevent flashing
    var displayContent = (0, solid_js_1.createMemo)(function () {
        if (planContent)
            return planContent;
        if ((planCache === null || planCache === void 0 ? void 0 : planCache.isReady) && planCache.planPath === planPath) {
            return planCache.content;
        }
        return null;
    });
    // Only show loading if we have no content to display
    var showLoading = isLoading && !displayContent;
    // Only show error if we have no content to display
    var showError = error && !displayContent;
    // Toggle expand state
    var handleToggleExpand = function (e) {
        e.stopPropagation();
        setIsExpanded(function (prev) { return !prev; });
    };
    // Update scroll gradient via DOM (no state, no re-renders)
    var updateScrollGradient = function () {
        var content = contentRef.current;
        var bottomGradient = bottomGradientRef.current;
        if (!content || !bottomGradient)
            return;
        var scrollTop = content.scrollTop, scrollHeight = content.scrollHeight, clientHeight = content.clientHeight;
        var isScrollable = scrollHeight > clientHeight;
        var isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        bottomGradient.style.opacity = isScrollable && !isAtBottom ? "1" : "0";
    };
    // Update gradient on scroll and content changes
    (0, solid_js_1.createEffect)(function () {
        var content = contentRef.current;
        if (!content)
            return;
        content.addEventListener("scroll", updateScrollGradient);
        updateScrollGradient();
        return function () { return content.removeEventListener("scroll", updateScrollGradient); };
    });
    (0, solid_js_1.createEffect)(function () {
        updateScrollGradient();
    });
    // No plan path - don't render anything
    if (!planPath) {
        return null;
    }
    return <div class="mx-2 mb-2">
      <div class="rounded-lg border border-border/50 overflow-hidden">
        {/* Header - same as original WidgetCard but with expand button added */}
        <div class="flex items-center gap-2 px-2 h-8 select-none group bg-muted/30">
          <icons_1.PlanIcon class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
          <span class="text-xs font-medium text-foreground flex-1">Plan</span>

          {/* Original buttons: View plan + Approve */}
          <div class="flex items-center gap-1">
            <button_1.Button variant="ghost" size="sm" onClick={function (e) {
            e.stopPropagation();
            onExpandPlan === null || onExpandPlan === void 0 ? void 0 : onExpandPlan();
        }} class="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground">
              View plan
            </button_1.Button>
            {mode === "plan" && onApprovePlan && <button_1.Button size="sm" onClick={function (e) {
                e.stopPropagation();
                onApprovePlan();
            }} class="h-5 px-2 text-[10px] font-medium rounded transition-transform duration-150 active:scale-[0.97]">
                Approve
                <kbd_1.Kbd class="ml-1 text-primary-foreground/70">⌘↵</kbd_1.Kbd>
              </button_1.Button>}
          </div>

          {/* Expand/Collapse button */}
          <button_1.Button variant="ghost" size="icon" onClick={handleToggleExpand} class="h-5 w-5 p-0 hover:bg-foreground/10 text-muted-foreground hover:text-foreground rounded-md transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] flex-shrink-0" aria-label={isExpanded ? "Collapse plan" : "Expand plan"}>
            <div class="relative w-3.5 h-3.5">
              <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
              <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-3.5 h-3.5 transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
            </div>
          </button_1.Button>
        </div>

        {/* Content */}
        <div>
          {showLoading ? <div class="flex items-center justify-center py-8">
              <icons_1.IconSpinner class="h-5 w-5 text-muted-foreground"/>
            </div> : showError ? <div class="px-3 py-4 text-center">
              <p class="text-xs text-muted-foreground">Failed to load plan</p>
            </div> : !displayContent ? <div class="px-3 py-4 text-center">
              <p class="text-xs text-muted-foreground">No plan content</p>
            </div> : <div class="relative">
              <div ref={contentRef} class={(0, utils_1.cn)("px-2 py-2 allow-text-selection", isExpanded ? "" : "max-h-64 overflow-hidden")}>
                <chat_markdown_renderer_1.ChatMarkdownRenderer content={displayContent} size="sm"/>
              </div>

              {/* Bottom scroll gradient */}
              <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
                opacity: 1,
                background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)"
            }}/>
            </div>}
        </div>
      </div>
    </div>;
});
