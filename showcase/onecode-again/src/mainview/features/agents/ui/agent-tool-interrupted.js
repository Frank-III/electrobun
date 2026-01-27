"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolInterrupted = void 0;
var solid_js_1 = require("solid-js");
exports.AgentToolInterrupted = (0, solid_js_1.memo)(function AgentToolInterrupted(_a) {
    var toolName = _a.toolName, subtitle = _a.subtitle;
    return <div class="flex items-center gap-1.5 rounded-md py-0.5 px-2">
      <span class="text-xs text-muted-foreground">
        {toolName} interrupted
      </span>
      {subtitle && <span class="text-xs text-muted-foreground/60 truncate">
          {subtitle}
        </span>}
    </div>;
});
