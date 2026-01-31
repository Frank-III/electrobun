import { createEffect, onCleanup } from "solid-js";
import { toast } from "solid-sonner";
import { getMessageQueueState, useMessageQueueStore } from "../stores/message-queue-store";
import { getStreamingStatusState, useStreamingStatusStore } from "../stores/streaming-status-store";
import { useAgentSubChatStore } from "../stores/sub-chat-store";
import { agentChatStore } from "../stores/agent-chat-store";
import { appStore } from "../../../lib/app-store";
import { loadingSubChatsAtom, setLoading, clearLoading } from "../atoms";
import type { AgentQueueItem } from "../lib/queue-utils";
// Delay between processing queue items (ms)
const QUEUE_PROCESS_DELAY = 1e3;
/**
* Global queue processor component.
*
* This component runs at the app level (AgentsLayout) and processes
* message queues for ALL sub-chats, regardless of which one is currently active.
*
* Key insight: Unlike the previous local useEffect in ChatViewInner which only
* processed the currently active sub-chat's queue, this component listens to
* ALL queues and streaming statuses globally.
*/
export function QueueProcessor() {
	// Track which sub-chats are currently being processed to avoid double-sends
	// Using raw variables since these are mutable collections used in closures
	let processing = new Set<string>();
	// Track timers for cleanup
	let timers = new Map<string, NodeJS.Timeout>();
	createEffect(() => {
		// Function to process queue for a specific sub-chat
		const processQueue = async (subChatId: string) => {
			// Check if already processing this sub-chat
			if (processing.has(subChatId)) {
				return;
			}
			// Check streaming status
			const status = useStreamingStatusStore.getState().getStatus(subChatId);
			if (status !== "ready") {
				return;
			}
			// Get queue for this sub-chat
			const queue = useMessageQueueStore.getState().queues[subChatId] || [];
			if (queue.length === 0) {
				return;
			}
			// Get the Chat object from agentChatStore
			const chat = agentChatStore.get(subChatId);
			if (!chat) {
				return;
			}
			// Mark as processing
			processing.add(subChatId);
			// Pop the first item from queue (atomic operation)
			const item = useMessageQueueStore.getState().popItem(subChatId, queue[0].id);
			if (!item) {
				processing.delete(subChatId);
				return;
			}
			try {
				// Build message parts from queued item
				const parts: any[] = [...(item.images || []).map((img) => ({
					type: "data-image" as const,
					data: {
						url: img.url,
						mediaType: img.mediaType,
						filename: img.filename,
						base64Data: img.base64Data
					}
				})), ...(item.files || []).map((f) => ({
					type: "data-file" as const,
					data: {
						url: f.url,
						mediaType: f.mediaType,
						filename: f.filename,
						size: f.size
					}
				}))];
				if (item.message) {
					parts.push({
						type: "text",
						text: item.message
					});
				}
				// Update timestamps
				useAgentSubChatStore.getState().updateSubChatTimestamp(subChatId);
				// Set loading state for sidebar indicator
				const parentChatId = agentChatStore.getParentChatId(subChatId);
				if (parentChatId) {
					setLoading((fn) => appStore.set(loadingSubChatsAtom, fn(appStore.get(loadingSubChatsAtom))), subChatId, parentChatId);
				}
				// Send message using Chat's sendMessage method
				await chat.sendMessage({
					role: "user",
					parts
				});
			} catch (error) {
				console.error(`[QueueProcessor] Error processing queue:`, error);
				// Requeue the item at the front so it can be retried
				useMessageQueueStore.getState().prependItem(subChatId, item);
				// Set error status (will be cleared on next successful send or manual retry)
				useStreamingStatusStore.getState().setStatus(subChatId, "error");
				// Clear loading state since send failed
				clearLoading((fn) => appStore.set(loadingSubChatsAtom, fn(appStore.get(loadingSubChatsAtom))), subChatId);
				// Notify user
				toast.error("Failed to send queued message. It will be retried.");
			} finally {
				processing.delete(subChatId);
			}
		};
		// Schedule processing for a sub-chat with delay
		const scheduleProcessing = (subChatId: string) => {
			// Clear any existing timer for this sub-chat
			const existingTimer = timers.get(subChatId);
			if (existingTimer) {
				clearTimeout(existingTimer);
			}
			// Schedule new processing
			const timer = setTimeout(() => {
				timers.delete(subChatId);
				processQueue(subChatId);
			}, QUEUE_PROCESS_DELAY);
			timers.set(subChatId, timer);
		};
		// Check all queues and schedule processing for ready sub-chats
		const checkAllQueues = () => {
			const queueState = useMessageQueueStore.getState();
			const queues = queueState.queues;
			for (const subChatId of Object.keys(queues)) {
				const queue = queues[subChatId];
				if (!queue || queue.length === 0) continue;
				const status = useStreamingStatusStore.getState().getStatus(subChatId);
				// Process when ready, or retry on error status
				if ((status === "ready" || status === "error") && !processing.has(subChatId)) {
					// If error status, clear it before retrying
					if (status === "error") {
						useStreamingStatusStore.getState().setStatus(subChatId, "ready");
					}
					scheduleProcessing(subChatId);
				}
			}
		};
		// React to queue and status changes via Solid store reactivity (effect re-runs when these change)
		const queueState = getMessageQueueState();
		const statusState = getStreamingStatusState();
		void queueState.queues;
		void statusState.statuses;
		checkAllQueues();
		// Cleanup
		onCleanup(() => {
			for (const timer of timers.values()) {
				clearTimeout(timer);
			}
			timers.clear();
		});
	});
	// This component doesn't render anything
	return null;
}
