"use client";
import { createSignal, createEffect } from "solid-js";
import { ChevronDown, ArrowUp, X } from "lucide-solid";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { cn } from "../../../lib/utils";
import type { AgentQueueItem } from "../lib/queue-utils";
import { RenderFileMentions } from "../mentions/render-file-mentions";
import { getWindowId } from "../../../contexts/WindowContext";
// Window-scoped key so each window has its own queue expanded state
const getQueueExpandedKey = () => `${getWindowId()}:agent-queue-expanded`;
// Queue item row component
const QueueItemRow = memo(function QueueItemRow({ item, onRemove, onSendNow }: {
	item: AgentQueueItem;
	onRemove?: (itemId: string) => void;
	onSendNow?: (itemId: string) => void;
}) {
	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRemove?.(item.id);
	};
	const handleSendNow = (e: React.MouseEvent) => {
		e.stopPropagation();
		onSendNow?.(item.id);
	};
	// Get display text - truncate message and show attachment count
	const hasAttachments = item.images && item.images.length > 0 || item.files && item.files.length > 0 || item.textContexts && item.textContexts.length > 0 || item.diffTextContexts && item.diffTextContexts.length > 0;
	const attachmentCount = (item.images?.length || 0) + (item.files?.length || 0) + (item.textContexts?.length || 0) + (item.diffTextContexts?.length || 0);
	return <div class="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors cursor-default">
      <span class="truncate flex-1 text-foreground">
          <RenderFileMentions text={item.message} />
        </span>
      {hasAttachments && <span class="flex-shrink-0 text-muted-foreground text-[10px]">
          +{attachmentCount} {attachmentCount === 1 ? "file" : "files"}
        </span>}
      <div class="flex items-center gap-1">
        {onSendNow && <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleSendNow} class="flex-shrink-0 p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-all">
                <ArrowUp class="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Send now</TooltipContent>
          </Tooltip>}
        {onRemove && <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleRemove} class="flex-shrink-0 p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground transition-all">
                <X class="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Remove</TooltipContent>
          </Tooltip>}
      </div>
    </div>;
});
interface AgentQueueIndicatorProps {
	queue: AgentQueueItem[];
	onRemoveItem?: (itemId: string) => void;
	onSendNow?: (itemId: string) => void;
	isStreaming?: boolean;
	/** Whether there's a status card below this one - affects border radius */
	hasStatusCardBelow?: boolean;
}
export const AgentQueueIndicator = memo(function AgentQueueIndicator({ queue, onRemoveItem, onSendNow, isStreaming = false, hasStatusCardBelow = false }: AgentQueueIndicatorProps) {
	// Load expanded state from localStorage (window-scoped)
	const [isExpanded, setIsExpanded] = createSignal(() => {
		if (typeof window === "undefined") return true;
		const saved = localStorage.getItem(getQueueExpandedKey());
		return saved !== null ? saved === "true" : true;
	});
	// Save expanded state to localStorage (window-scoped)
	createEffect(() => {
		localStorage.setItem(getQueueExpandedKey(), String(isExpanded));
	});
	if (queue.length === 0) {
		return null;
	}
	return <div class={cn(
		"border border-border bg-muted/30 overflow-hidden flex flex-col rounded-t-xl",
		// If status card below - no bottom border/radius, no padding
		// If no status card - need pb-6 for input overlap
		hasStatusCardBelow ? "border-b-0" : "border-b-0 pb-6"
	)}>
      {	/* Header - at top */}
      <div role="button" tabIndex={0} onClick={() => setIsExpanded(!isExpanded)} onKeyDown={(e) => {
 if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setIsExpanded(!isExpanded);
		}
	}} aria-expanded={isExpanded} aria-label={`${isExpanded ? "Collapse" : "Expand"} queue`} class="flex items-center justify-between pr-1 pl-3 h-8 cursor-pointer hover:bg-muted/50 transition-colors duration-150 focus:outline-none rounded-sm">
        <div class="flex items-center gap-2 text-xs flex-1 min-w-0">
          <ChevronDown class={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", !isExpanded && "-rotate-90")} />
          <span class="text-xs text-muted-foreground">
            {queue.length} in queue
          </span>
        </div>

      </div>

      {	/* Expanded content - queue items */}
      <AnimatePresence initial={false}>
        {isExpanded && <motion.div initial={{
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
              {queue.map((item) => <QueueItemRow key={item.id} item={item} onRemove={onRemoveItem} onSendNow={onSendNow} />)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
});
