"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMessageUsage = void 0;
var solid_js_1 = require("solid-js");
var hover_card_1 = require("../../../components/ui/hover-card");
var utils_1 = require("../../../lib/utils");
function formatTokens(tokens) {
    if (tokens >= 1e3) {
        return "".concat((tokens / 1e3).toFixed(1), "k");
    }
    return tokens.toString();
}
function formatDuration(ms) {
    if (ms < 1e3) {
        return "".concat(ms, "ms");
    }
    var seconds = ms / 1e3;
    if (seconds < 60) {
        return "".concat(seconds.toFixed(1), "s");
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.round(seconds % 60);
    return "".concat(minutes, "m ").concat(remainingSeconds, "s");
}
exports.AgentMessageUsage = (0, solid_js_1.memo)(function AgentMessageUsage(_a) {
    var metadata = _a.metadata, _b = _a.isStreaming, isStreaming = _b === void 0 ? false : _b, _c = _a.isMobile, isMobile = _c === void 0 ? false : _c;
    if (!metadata || isStreaming)
        return null;
    var _d = metadata.inputTokens, inputTokens = _d === void 0 ? 0 : _d, _e = metadata.outputTokens, outputTokens = _e === void 0 ? 0 : _e, _f = metadata.totalTokens, totalTokens = _f === void 0 ? 0 : _f, durationMs = metadata.durationMs, resultSubtype = metadata.resultSubtype;
    var hasUsage = inputTokens > 0 || outputTokens > 0;
    if (!hasUsage)
        return null;
    var displayTokens = totalTokens || inputTokens + outputTokens;
    return <hover_card_1.HoverCard openDelay={400} closeDelay={100}>
      <hover_card_1.HoverCardTrigger asChild>
        <button tabIndex={-1} class={(0, utils_1.cn)("h-5 px-1.5 flex items-center text-[10px] rounded-md", "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50", "transition-[background-color,transform] duration-150 ease-out")}>
          <span class="font-mono">{formatTokens(displayTokens)}</span>
        </button>
      </hover_card_1.HoverCardTrigger>
      <hover_card_1.HoverCardContent sideOffset={4} align="end" class="w-auto pt-2 px-2 pb-0 shadow-sm rounded-lg border-border/50 overflow-hidden">
        <div class="space-y-1.5 pb-2">
          {/* Status & Duration group */}
          {(resultSubtype || durationMs !== undefined && durationMs > 0) && <div class="space-y-1">
              {resultSubtype && <div class="flex justify-between text-xs gap-4">
                  <span class="text-muted-foreground">Status:</span>
                  <span class="font-mono text-foreground">
                    {resultSubtype === "success" ? "Success" : "Failed"}
                  </span>
                </div>}

              {durationMs !== undefined && durationMs > 0 && <div class="flex justify-between text-xs gap-4">
                  <span class="text-muted-foreground">Duration:</span>
                  <span class="font-mono text-foreground">
                    {formatDuration(durationMs)}
                  </span>
                </div>}
            </div>}

          {/* Tokens group */}
          {displayTokens > 0 && <div class="flex justify-between text-xs gap-4 pt-1.5 mt-1 border-t border-border/50">
              <span class="text-muted-foreground">Tokens:</span>
              <span class="font-mono font-medium text-foreground">
                {displayTokens.toLocaleString()}
              </span>
            </div>}
        </div>
      </hover_card_1.HoverCardContent>
    </hover_card_1.HoverCard>;
});
