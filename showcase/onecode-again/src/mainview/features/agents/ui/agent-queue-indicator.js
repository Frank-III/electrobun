"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentQueueIndicator = void 0;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var tooltip_1 = require("../../../components/ui/tooltip");
var utils_1 = require("../../../lib/utils");
var render_file_mentions_1 = require("../mentions/render-file-mentions");
var WindowContext_1 = require("../../../contexts/WindowContext");
// Window-scoped key so each window has its own queue expanded state
var getQueueExpandedKey = function () { return "".concat((0, WindowContext_1.getWindowId)(), ":agent-queue-expanded"); };
// Queue item row component
var QueueItemRow = memo(function QueueItemRow(_a) {
    var _b, _c, _d, _e;
    var item = _a.item, onRemove = _a.onRemove, onSendNow = _a.onSendNow;
    var handleRemove = function (e) {
        e.stopPropagation();
        onRemove === null || onRemove === void 0 ? void 0 : onRemove(item.id);
    };
    var handleSendNow = function (e) {
        e.stopPropagation();
        onSendNow === null || onSendNow === void 0 ? void 0 : onSendNow(item.id);
    };
    // Get display text - truncate message and show attachment count
    var hasAttachments = item.images && item.images.length > 0 || item.files && item.files.length > 0 || item.textContexts && item.textContexts.length > 0 || item.diffTextContexts && item.diffTextContexts.length > 0;
    var attachmentCount = (((_b = item.images) === null || _b === void 0 ? void 0 : _b.length) || 0) + (((_c = item.files) === null || _c === void 0 ? void 0 : _c.length) || 0) + (((_d = item.textContexts) === null || _d === void 0 ? void 0 : _d.length) || 0) + (((_e = item.diffTextContexts) === null || _e === void 0 ? void 0 : _e.length) || 0);
    return <div class="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors cursor-default">
      <span class="truncate flex-1 text-foreground">
          <render_file_mentions_1.RenderFileMentions text={item.message}/>
        </span>
      {hasAttachments && <span class="flex-shrink-0 text-muted-foreground text-[10px]">
          +{attachmentCount} {attachmentCount === 1 ? "file" : "files"}
        </span>}
      <div class="flex items-center gap-1">
        {onSendNow && <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button onClick={handleSendNow} class="flex-shrink-0 p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-all">
                <lucide_solid_1.ArrowUp class="w-3.5 h-3.5"/>
              </button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="top">Send now</tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>}
        {onRemove && <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <button onClick={handleRemove} class="flex-shrink-0 p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-all">
                <lucide_solid_1.X class="w-3.5 h-3.5"/>
              </button>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="top">Remove</tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>}
      </div>
    </div>;
});
exports.AgentQueueIndicator = memo(function AgentQueueIndicator(_a) {
    var queue = _a.queue, onRemoveItem = _a.onRemoveItem, onSendNow = _a.onSendNow, _b = _a.isStreaming, isStreaming = _b === void 0 ? false : _b, _c = _a.hasStatusCardBelow, hasStatusCardBelow = _c === void 0 ? false : _c;
    // Load expanded state from localStorage (window-scoped)
    var _d = (0, solid_js_1.createSignal)(function () {
        if (typeof window === "undefined")
            return true;
        var saved = localStorage.getItem(getQueueExpandedKey());
        return saved !== null ? saved === "true" : true;
    }), isExpanded = _d[0], setIsExpanded = _d[1];
    // Save expanded state to localStorage (window-scoped)
    (0, solid_js_1.createEffect)(function () {
        localStorage.setItem(getQueueExpandedKey(), String(isExpanded));
    });
    if (queue.length === 0) {
        return null;
    }
    return <div class={(0, utils_1.cn)("border border-border bg-muted/30 overflow-hidden flex flex-col rounded-t-xl", 
        // If status card below - no bottom border/radius, no padding
        // If no status card - need pb-6 for input overlap
        hasStatusCardBelow ? "border-b-0" : "border-b-0 pb-6")}>
      {/* Header - at top */}
      <div role="button" tabIndex={0} onClick={function () { return setIsExpanded(!isExpanded); }} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsExpanded(!isExpanded);
            }
        }} aria-expanded={isExpanded} aria-label={"".concat(isExpanded ? "Collapse" : "Expand", " queue")} class="flex items-center justify-between pr-1 pl-3 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none rounded-sm">
        <div class="flex items-center gap-2 text-xs flex-1 min-w-0">
          <lucide_solid_1.ChevronDown class={(0, utils_1.cn)("w-4 h-4 text-muted-foreground transition-transform duration-200", !isExpanded && "-rotate-90")}/>
          <span class="text-xs text-muted-foreground">
            {queue.length} in queue
          </span>
        </div>

      </div>

      {/* Expanded content - queue items */}
      <react_1.AnimatePresence initial={false}>
        {isExpanded && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{
                duration: .2,
                ease: [
                    .23,
                    1,
                    .32,
                    1
                ]
            }} class="overflow-hidden">
            <div class="border-t border-border max-h-[200px] overflow-y-auto">
              {queue.map(function (item) { return <QueueItemRow key={item.id} item={item} onRemove={onRemoveItem} onSendNow={onSendNow}/>; })}
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
});
