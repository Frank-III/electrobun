"use client";
import { createSignal, createEffect, createMemo, Show } from "solid-js";
import { ChevronRight } from "lucide-solid";
import { cn } from "../../../lib/utils";
import { ChatMarkdownRenderer } from "../../../components/chat-markdown-renderer";
import { AgentToolInterrupted } from "./agent-tool-interrupted";

interface ThinkingToolPart {
	type: string;
	state: string;
	input?: {
		text?: string;
	};
	output?: {
		completed?: boolean;
	};
}

interface AgentThinkingToolProps {
	part: ThinkingToolPart;
	chatStatus?: string;
}

const PREVIEW_LENGTH = 60;
const SCROLL_THRESHOLD = 500;

export function AgentThinkingTool(props: AgentThinkingToolProps) {
	const isPending = () => props.part.state !== "output-available" && props.part.state !== "output-error";
	const isActivelyStreaming = () => props.chatStatus === "streaming" || props.chatStatus === "submitted";
	const isStreaming = () => isPending() && isActivelyStreaming();
	const isInterrupted = () => isPending() && !isActivelyStreaming() && props.chatStatus !== undefined;
	
	const [isExpanded, setIsExpanded] = createSignal(isStreaming());
	let wasStreamingRef = isStreaming();
	let scrollRef: HTMLDivElement | undefined;
	
	createEffect(() => {
		const streaming = isStreaming();
		if (wasStreamingRef && !streaming) {
			setIsExpanded(false);
		}
		wasStreamingRef = streaming;
	});
	
	createEffect(() => {
		if (isStreaming() && isExpanded() && scrollRef) {
			scrollRef.scrollTop = scrollRef.scrollHeight;
		}
	});
	
	const thinkingText = createMemo(() => props.part.input?.text || "");
	const previewText = createMemo(() => thinkingText().slice(0, PREVIEW_LENGTH).replace(/\n/g, " "));
	
	return (
		<Show when={!(isInterrupted() && !thinkingText())} fallback={<AgentToolInterrupted toolName="Thinking" />}>
			<div>
				<div onClick={() => setIsExpanded(!isExpanded())} class="group flex items-start gap-1.5 py-0.5 px-2 cursor-pointer">
					<div class="flex-1 min-w-0 flex items-center gap-1">
						<div class="text-xs flex items-center gap-1.5 min-w-0">
							<span class="font-medium whitespace-nowrap flex-shrink-0 text-muted-foreground">
								{isStreaming() ? "Thinking" : "Thought"}
							</span>
							<Show when={!isExpanded() && previewText()}>
								<span class="text-muted-foreground/60 truncate">
									{previewText()}...
								</span>
							</Show>
							<ChevronRight class={cn(
								"w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ease-out flex-shrink-0",
								isExpanded() && "rotate-90",
								!isExpanded() && "opacity-0 group-hover:opacity-100"
							)} />
						</div>
					</div>
				</div>
				<Show when={isExpanded() && thinkingText()}>
					<div class="relative">
						<Show when={isStreaming() && thinkingText().length > SCROLL_THRESHOLD}>
							<div class="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-background/70 to-transparent z-10 pointer-events-none" />
						</Show>
						<div
							ref={el => scrollRef = el}
							class={cn("px-2", isStreaming() && thinkingText().length > SCROLL_THRESHOLD && "overflow-y-auto scrollbar-none max-h-24")}
						>
							<ChatMarkdownRenderer content={thinkingText()} size="sm" class="text-muted-foreground" />
							<Show when={isStreaming()}>
								<span class="inline-block w-1 h-3 bg-muted-foreground/50 ml-0.5 animate-pulse" />
							</Show>
						</div>
					</div>
				</Show>
			</div>
		</Show>
	);
}
