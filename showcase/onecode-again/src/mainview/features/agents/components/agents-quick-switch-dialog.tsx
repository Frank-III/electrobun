import { createMemo, For, Show } from "solid-js";
import { Presence } from "solid-motionone";
import { Portal } from "solid-js/web";
import { loadingSubChatsAtom } from "../atoms";
import { AgentChatCard } from "./agent-chat-card";
interface AgentsQuickSwitchDialogProps {
	isOpen: boolean;
	chats: Array<{
		id: string;
		name: string;
		meta: any;
		sandbox_id: string | null;
		updated_at: Date;
		projectId: string;
	}>;
	selectedIndex: number;
	projectsMap: Map<string, {
		gitOwner?: string | null;
		gitProvider?: string | null;
		gitRepo?: string | null;
		name: string;
	}>;
	onHover?: (index: number) => void;
}
export function AgentsQuickSwitchDialog(props: AgentsQuickSwitchDialogProps) {
	if (typeof window === "undefined") return null;
	// Derive loading parent chat IDs from loadingSubChats Map
	const [loadingSubChats] = loadingSubChatsAtom;
	const loadingChatIds = createMemo(() => new Set([...loadingSubChats().values()]));
	return (
		<Portal>
			<Presence>
				<Show when={props.isOpen}>
					{/* Backdrop */}
					<div class="fixed inset-0 z-[10000]" />

					{/* Dialog */}
					<div class="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
						<div class="pointer-events-auto">
							<div class="max-w-5xl mx-auto">
								{/* Chat List or Empty State */}
								<Show
									when={props.chats.length > 0}
									fallback={
										<div class="px-4 py-12 text-center bg-background rounded-xl border-[0.5px]">
											<p class="text-sm text-muted-foreground">
												No recent agents
											</p>
										</div>
									}
								>
									<div class="flex gap-3 overflow-x-auto p-3 bg-background rounded-3xl border-[0.5px]" style={{ "box-shadow": "0 8px 32px 0 rgba(0,0,0,0.07), 0 0px 16px 0 rgba(0,0,0,0.04), 0 -8px 24px 0 rgba(0,0,0,0.03)" }}>
										<For each={props.chats}>
												{(chat, index) => {
													const isSelected = () => index() === props.selectedIndex;
													const isLoading = () => loadingChatIds().has(chat.id);
													const project = () => props.projectsMap.get(chat.projectId);
													return <AgentChatCard chat={chat} isSelected={isSelected()} isLoading={isLoading()} variant="quick-switch" gitOwner={project()?.gitOwner} gitProvider={project()?.gitProvider} repoName={project()?.gitRepo || project()?.name} onMouseEnter={() => props.onHover?.(index())} />;
												}}
											</For>
									</div>
								</Show>
							</div>
						</div>
					</div>
				</Show>
			</Presence>
		</Portal>
	);
}
