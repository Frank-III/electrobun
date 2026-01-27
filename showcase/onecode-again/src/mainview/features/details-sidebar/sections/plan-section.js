"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSection = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var icons_1 = require("@/components/ui/icons");
var chat_markdown_renderer_1 = require("@/components/chat-markdown-renderer");
var trpc_1 = require("@/lib/trpc");
var atoms_1 = require("../atoms");
/**
* Plan Section for Details Sidebar
* Memoized to prevent re-renders when parent updates
* Uses caching to show content instantly when switching workspaces
*/
exports.PlanSection = memo(function PlanSection(_a) {
    var chatId = _a.chatId, planPath = _a.planPath, refetchTrigger = _a.refetchTrigger, _b = _a.isExpanded, isExpanded = _b === void 0 ? false : _b;
    // Refs for scroll gradients (avoid re-renders)
    var _c = (0, solid_js_1.createSignal)(null), contentRef = _c[0], setContentRef = _c[1];
    var _d = (0, solid_js_1.createSignal)(null), topGradientRef = _d[0], setTopGradientRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), bottomGradientRef = _e[0], setBottomGradientRef = _e[1];
    // Plan content cache to avoid flashing loading state
    var _f = (0, jotai_1.useAtom)((0, atoms_1.planContentCacheAtomFamily)(chatId)), planCache = _f[0], setPlanCache = _f[1];
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
    // Clear cache when plan path changes to a different file
    (0, solid_js_1.createEffect)(function () {
        if (planPath && planCache && planCache.planPath !== planPath) { }
    });
    // Refetch when trigger changes
    (0, solid_js_1.createEffect)(function () {
        if (refetchTrigger && planPath) {
            refetch();
        }
    });
    // Update scroll gradients via DOM (no state, no re-renders)
    var updateScrollGradients = function () {
        var content = contentRef.current;
        var topGradient = topGradientRef.current;
        var bottomGradient = bottomGradientRef.current;
        if (!content || !topGradient || !bottomGradient)
            return;
        var scrollTop = content.scrollTop, scrollHeight = content.scrollHeight, clientHeight = content.clientHeight;
        var isScrollable = scrollHeight > clientHeight;
        var isAtTop = scrollTop <= 1;
        var isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        // Show top gradient when scrolled down
        topGradient.style.opacity = isScrollable && !isAtTop ? "1" : "0";
        // Show bottom gradient when not at bottom
        bottomGradient.style.opacity = isScrollable && !isAtBottom ? "1" : "0";
    };
    // Update gradients on scroll
    (0, solid_js_1.createEffect)(function () {
        var content = contentRef.current;
        if (!content)
            return;
        content.addEventListener("scroll", updateScrollGradients);
        // Initial check
        updateScrollGradients();
        return function () { return content.removeEventListener("scroll", updateScrollGradients); };
    });
    // Also update gradients when content changes
    (0, solid_js_1.createEffect)(function () {
        updateScrollGradients();
    });
    // Use cached content while loading new content to prevent flashing
    // Show cached content if: loading new content OR error occurred but we have cache
    var displayContent = (0, solid_js_1.createMemo)(function () {
        // If we have fresh content, use it
        if (planContent)
            return planContent;
        // If loading or error, use cached content (same plan path)
        if ((planCache === null || planCache === void 0 ? void 0 : planCache.isReady) && planCache.planPath === planPath) {
            return planCache.content;
        }
        return null;
    });
    // Only show loading if we have no content to display at all
    var showLoading = isLoading && !displayContent;
    // Only show error if we have no content to display at all
    var showError = error && !displayContent;
    // Extract plan title from markdown (first H1)
    var planTitle = (0, solid_js_1.createMemo)(function () {
        if (!displayContent)
            return "Plan";
        var match = displayContent.match(/^#\s+(.+)$/m);
        return match ? match[1] : "Plan";
    });
    // No plan path - don't render anything (parent should hide the widget)
    if (!planPath) {
        return null;
    }
    // Show loading only if we have no cached content
    if (showLoading) {
        return <div class="flex items-center justify-center py-8">
        <icons_1.IconSpinner class="h-5 w-5 text-muted-foreground"/>
      </div>;
    }
    // Show error only if we have no cached content
    if (showError) {
        return <div class="px-3 py-4 text-center">
        <p class="text-xs text-muted-foreground">
          Failed to load plan
        </p>
      </div>;
    }
    // No content at all (shouldn't happen if planPath is set)
    if (!displayContent) {
        return null;
    }
    return <div class="flex flex-col">
      {/* Plan content with scroll gradients */}
      <div class="relative">
        {/* Top scroll gradient - matches header bg (muted/30) */}
        <div ref={topGradientRef} class="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
            opacity: 0,
            background: "linear-gradient(to bottom, color-mix(in srgb, hsl(var(--muted)) 30%, hsl(var(--background))) 0%, transparent 100%)"
        }}/>

        <div ref={contentRef} class={"px-2 py-2 overflow-y-auto allow-text-selection ".concat(isExpanded ? "" : "max-h-64")} data-plan-path={planPath}>
          <chat_markdown_renderer_1.ChatMarkdownRenderer content={displayContent} size="sm"/>
        </div>

        {/* Bottom scroll gradient */}
        <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
            opacity: 1,
            background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)"
        }}/>
      </div>
    </div>;
});
