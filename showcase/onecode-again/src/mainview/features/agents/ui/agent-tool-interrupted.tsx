"use client";
import { memo } from "solid-js";
interface AgentToolInterruptedProps {
	toolName: string;
	subtitle?: string;
}
export const AgentToolInterrupted = memo(function AgentToolInterrupted({ toolName, subtitle }: AgentToolInterruptedProps) {
	return <div class="flex items-center gap-1.5 rounded-md py-0.5 px-2">
      <span class="text-xs text-muted-foreground">
        {toolName} interrupted
      </span>
      {subtitle && <span class="text-xs text-muted-foreground/60 truncate">
          {subtitle}
        </span>}
    </div>;
});
