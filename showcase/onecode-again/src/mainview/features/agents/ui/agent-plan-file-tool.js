"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPlanFileTool = void 0;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var button_1 = require("../../../components/ui/button");
var icons_1 = require("../../../components/ui/icons");
var kbd_1 = require("../../../components/ui/kbd");
var text_shimmer_1 = require("../../../components/ui/text-shimmer");
var chat_markdown_renderer_1 = require("../../../components/chat-markdown-renderer");
var utils_1 = require("../../../lib/utils");
var agent_tool_registry_1 = require("./agent-tool-registry");
var agent_tool_utils_1 = require("./agent-tool-utils");
var atoms_1 = require("../atoms");
var sub_chat_store_1 = require("../stores/sub-chat-store");
/**
* AgentPlanFileTool - Unified component for plan files.
* Shows plan content during streaming and after completion.
* Features: expand/collapse, View plan (sidebar), Build button.
*/
exports.AgentPlanFileTool = memo(function AgentPlanFileTool(_a) {
    var _b, _c, _d;
    var part = _a.part, chatStatus = _a.chatStatus, subChatId = _a.subChatId, _e = _a.isEdit, isEdit = _e === void 0 ? false : _e;
    var _f = (0, solid_js_1.createSignal)(false), isExpanded = _f[0], setIsExpanded = _f[1];
    var isPending = (0, agent_tool_registry_1.getToolStatus)(part, chatStatus).isPending;
    var isWrite = part.type === "tool-Write";
    // Get mode from per-subChat atomFamily
    var subChatModeAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.subChatModeAtomFamily)(subChatId); });
    var subChatMode = (0, jotai_1.useAtomValue)(subChatModeAtom);
    var setPendingBuildPlanSubChatId = (0, jotai_1.useSetAtom)(atoms_1.pendingBuildPlanSubChatIdAtom);
    // Refs for scroll gradients (avoid re-renders)
    var _g = (0, solid_js_1.createSignal)(null), contentRef = _g[0], setContentRef = _g[1];
    var _h = (0, solid_js_1.createSignal)(null), topGradientRef = _h[0], setTopGradientRef = _h[1];
    var _j = (0, solid_js_1.createSignal)(null), bottomGradientRef = _j[0], setBottomGradientRef = _j[1];
    // Plan sidebar atoms - per subChat
    var planSidebarOpenAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.planSidebarOpenAtomFamily)(subChatId); });
    var currentPlanPathAtom = (0, solid_js_1.createMemo)(function () { return (0, atoms_1.currentPlanPathAtomFamily)(subChatId); });
    var _k = (0, jotai_1.useAtom)(planSidebarOpenAtom), setIsPlanSidebarOpen = _k[1];
    var _l = (0, jotai_1.useAtom)(currentPlanPathAtom), setCurrentPlanPath = _l[1];
    // Only consider streaming if chat is actively streaming
    var isActivelyStreaming = chatStatus === "streaming" || chatStatus === "submitted";
    var isInputStreaming = part.state === "input-streaming" && isActivelyStreaming;
    // Get plan content - for Write mode it's in input.content, for Edit it's in new_string
    var planContent = isWrite ? ((_b = part.input) === null || _b === void 0 ? void 0 : _b.content) || "" : ((_c = part.input) === null || _c === void 0 ? void 0 : _c.new_string) || "";
    var filePath = ((_d = part.input) === null || _d === void 0 ? void 0 : _d.file_path) || "";
    // Show shimmer during streaming/pending
    var shouldShowShimmer = isPending || isInputStreaming;
    // View plan button enabled when there's content
    var viewPlanEnabled = planContent.length > 0;
    // Build button disabled during streaming
    var buildDisabled = shouldShowShimmer;
    // Check if we have content to show
    var hasVisibleContent = planContent.length > 0;
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
    // Update gradients on scroll and expand state change
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
    // Auto-set current plan path when plan file appears (so Details sidebar can show it immediately)
    (0, solid_js_1.createEffect)(function () {
        if (filePath && hasVisibleContent) {
            setCurrentPlanPath(filePath);
        }
    });
    // Handle expand/collapse
    var handleToggleExpand = function () {
        setIsExpanded(function (prev) { return !prev; });
    };
    // Handle opening plan sidebar
    var handleOpenSidebar = function () {
        if (filePath) {
            setCurrentPlanPath(filePath);
            setIsPlanSidebarOpen(true);
        }
    };
    // Handle build plan - triggers via atom, consumed by ChatViewInner
    var handleBuildPlan = function () {
        var activeSubChatId = sub_chat_store_1.useAgentSubChatStore.getState().activeSubChatId;
        if (activeSubChatId) {
            setPendingBuildPlanSubChatId(activeSubChatId);
        }
    };
    // If no content yet, show minimal view with shimmer (no icon during shimmer)
    if (!hasVisibleContent) {
        return <div class="flex items-center gap-1.5 px-2 py-0.5">
        {!shouldShowShimmer && <icons_1.PlanIcon class="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground"/>}
        <span class="text-xs text-muted-foreground">
          {shouldShowShimmer ? <text_shimmer_1.TextShimmer as="span" duration={1.2}>
              {isEdit ? "Updating plan..." : "Creating plan..."}
            </text_shimmer_1.TextShimmer> : "Plan"}
        </span>
      </div>;
    }
    return <div class="rounded-lg border border-border bg-muted/30 overflow-hidden mx-2">
      {/* Header - title + expand/collapse button */}
      <div onClick={handleToggleExpand} class="flex items-center justify-between pl-2.5 pr-0.5 h-7 cursor-pointer hover:bg-muted/50 transition-colors duration-150">
        <div class="flex items-center gap-1.5 text-xs truncate flex-1 min-w-0">
          <icons_1.PlanIcon class="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground"/>
          {shouldShowShimmer ? <text_shimmer_1.TextShimmer as="span" duration={1.2} class="truncate">
              {isEdit ? "Updating plan..." : "Creating plan..."}
            </text_shimmer_1.TextShimmer> : <span class="truncate text-foreground font-medium">Plan</span>}
        </div>

        <div class="flex items-center gap-1">
          {/* Expand/Collapse button */}
          <button onClick={function (e) {
            e.stopPropagation();
            handleToggleExpand();
        }} class="p-1 rounded-md hover:bg-accent transition-[background-color,transform] duration-150 ease-out active:scale-95">
            <div class="relative w-4 h-4">
              <icons_1.ExpandIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100")}/>
              <icons_1.CollapseIcon class={(0, utils_1.cn)("absolute inset-0 w-4 h-4 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75")}/>
            </div>
          </button>
        </div>
      </div>

      {/* Content - markdown preview with scroll gradients */}
      <div class="relative">
        {/* Top scroll gradient - matches card background (muted/30) */}
        <div ref={topGradientRef} class="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
            opacity: 0,
            background: "linear-gradient(to bottom, color-mix(in srgb, hsl(var(--muted)) 30%, hsl(var(--background))) 0%, transparent 100%)"
        }}/>

        <div ref={contentRef} onClick={function () { return !isExpanded && setIsExpanded(true); }} class={(0, utils_1.cn)("text-xs overflow-hidden transition-all duration-200", isExpanded ? "max-h-[300px] overflow-y-auto" : "h-[72px] cursor-pointer hover:bg-muted/50")}>
          <div class="px-3 py-2">
            <chat_markdown_renderer_1.ChatMarkdownRenderer content={planContent} size="sm"/>
          </div>
        </div>

        {/* Bottom scroll gradient - matches card background (muted/30) */}
        <div ref={bottomGradientRef} class="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-10 transition-opacity duration-150" style={{
            opacity: 1,
            background: "linear-gradient(to top, color-mix(in srgb, hsl(var(--muted)) 30%, hsl(var(--background))) 0%, transparent 100%)"
        }}/>
      </div>

      {/* Footer - action buttons */}
      <div class="flex items-center justify-between p-1.5">
        <button_1.Button variant="ghost" size="sm" onClick={handleOpenSidebar} disabled={!viewPlanEnabled} class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
          View plan
        </button_1.Button>

        {subChatMode === "plan" && <button_1.Button size="sm" onClick={handleBuildPlan} disabled={buildDisabled} class="h-6 px-3 text-xs font-medium rounded-md transition-transform duration-150 active:scale-[0.97] disabled:opacity-50">
            Approve
            <kbd_1.Kbd class="ml-1.5 text-primary-foreground/70">⌘↵</kbd_1.Kbd>
          </button_1.Button>}
      </div>
    </div>;
}, agent_tool_utils_1.areToolPropsEqual);
