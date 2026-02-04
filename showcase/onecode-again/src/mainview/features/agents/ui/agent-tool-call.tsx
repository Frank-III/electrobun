import { splitProps, Show, type Component } from "solid-js";
import { TextShimmer } from "../../../components/ui/text-shimmer";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
interface AgentToolCallProps {
	icon: Component<{
		class?: string;
	}>;
	title: string;
	subtitle?: string;
	tooltipContent?: string;
	isPending: boolean;
	isError: boolean;
	isNested?: boolean;
}
export function AgentToolCall(props: AgentToolCallProps) {
	const [local] = splitProps(props, ["icon", "title", "subtitle", "tooltipContent", "isPending", "isError", "isNested"]);
	// Ensure title and subtitle are strings (copied from canvas)
	const titleStr = String(local.title);
	const subtitleStr = local.subtitle ? String(local.subtitle) : undefined;
	// Render subtitle with optional tooltip
	const subtitleElement = (
		<Show when={subtitleStr}>
			<Show when={local.tooltipContent} fallback={
				<span class="text-muted-foreground/60 font-normal truncate min-w-0" innerHTML={subtitleStr!} />
			}>
				<Tooltip>
					<TooltipTrigger asChild>
						<span class="text-muted-foreground/60 font-normal truncate min-w-0" innerHTML={subtitleStr!} />
					</TooltipTrigger>
					<TooltipContent side="top" class="px-2 py-1.5 max-w-none flex items-center justify-center">
						<span class="font-mono text-[10px] text-muted-foreground whitespace-nowrap leading-none">
							{local.tooltipContent}
						</span>
					</TooltipContent>
				</Tooltip>
			</Show>
		</Show>
	);
	return <div class={`flex items-start gap-1.5 py-0.5 ${local.isNested ? "px-2.5" : "rounded-md px-2"}`}>
        {	/* Icon container - commented out like canvas, uncomment to show icons */}
        { /* <div class="flex-shrink-0 flex text-muted-foreground items-start pt-[1px]">
	<_Icon class="w-3.5 h-3.5" />
	</div> */}

        { /* Content container - matches canvas exactly */}
        <div class="flex-1 min-w-0 flex items-center gap-1.5">
          <div class="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
	          <span class="font-medium whitespace-nowrap flex-shrink-0">
	            <Show when={local.isPending} fallback={titleStr}>
	              <TextShimmer as="span" duration={1.2} class="inline-flex items-center text-xs leading-none h-4 m-0">
	              	{titleStr}
	              </TextShimmer>
	            </Show>
            </span>
            {subtitleElement}
          </div>
        </div>
      </div>;
}
