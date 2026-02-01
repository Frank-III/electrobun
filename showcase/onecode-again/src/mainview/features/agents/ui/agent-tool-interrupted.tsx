import { Show, splitProps } from "solid-js";
interface AgentToolInterruptedProps {
	toolName: string;
	subtitle?: string;
}
export function AgentToolInterrupted(props: AgentToolInterruptedProps) {
	const [local] = splitProps(props, ["toolName", "subtitle"]);
	return <div class="flex items-center gap-1.5 rounded-md py-0.5 px-2">
	      <span class="text-xs text-muted-foreground">
	        {local.toolName} interrupted
	      </span>
	      <Show when={local.subtitle}>
	        <span class="text-xs text-muted-foreground/60 truncate">
	          {local.subtitle}
	        </span>
	      </Show>
	    </div>;
}
