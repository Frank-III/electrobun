"use client";
import { Motion, Presence } from "solid-motionone";
import { Show } from "solid-js";
import { createEffect, createSignal, onCleanup, For } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "../../../components/ui/button";
import { trpc } from "../../../lib/trpc";
import { toast } from "solid-sonner";
import { useSetAtom } from "../../../lib/state/jotai";
import { selectedAgentChatIdAtom } from "../atoms";
import { chatSourceModeAtom } from "../../../lib/atoms";
import type { RemoteChat } from "../../../lib/remote-api";
import { Folder, Download, Check } from "lucide-solid";
import { agentChatStore } from "../stores/agent-chat-store";
interface Project {
	id: string;
	name: string;
	path: string;
	gitOwner: string | null;
	gitRepo: string | null;
}
interface OpenLocallyDialogProps {
	isOpen: boolean;
	onClose: () => void;
	remoteChat: RemoteChat | null;
	matchingProjects: Project[];
	allProjects: Project[];
	remoteSubChatId: string | null;
}
const EASING_CURVE = [
	.55,
	.055,
	.675,
	.19
] as const;
const INTERACTION_DELAY_MS = 250;
export function OpenLocallyDialog({ isOpen, onClose, remoteChat, matchingProjects, allProjects, remoteSubChatId }: OpenLocallyDialogProps) {
	const [mounted, setMounted] = createSignal(false);
	let openAtRef = 0;
	const setSelectedChatId = useSetAtom(selectedAgentChatIdAtom);
	const setChatSourceMode = useSetAtom(chatSourceModeAtom);
	const utils = trpc.useUtils();
	// For multiple projects view
	const [selectedProjectId, setSelectedProjectId] = createSignal(null);
	// Mutations
	const locateMutation = trpc.projects.locateAndAddProject.useMutation();
	const importMutation = trpc.sandboxImport.importSandboxChat.useMutation({
		onSuccess: async (result) => {
			toast.success("Opened locally");
			// 1. Clear stale Chat instances from cache
			agentChatStore.clear();
			// 2. Invalidate list queries
			utils.chats.list.invalidate();
			utils.projects.list.invalidate();
			// 3. Prefetch: Wait for chat data to be in cache before switching
			await utils.chats.get.fetch({ id: result.chatId });
			// 4. Now safe to switch - data is ready
			setChatSourceMode("local");
			setSelectedChatId(result.chatId);
			onClose();
		},
		onError: (error) => {
			toast.error(`Import failed: ${error.message}`);
		}
	});
	const pickDestMutation = trpc.projects.pickCloneDestination.useMutation();
	const cloneMutation = trpc.sandboxImport.cloneFromSandbox.useMutation({
		onSuccess: async (result) => {
			toast.success("Cloned and opened locally");
			// 1. Clear stale Chat instances from cache
			agentChatStore.clear();
			// 2. Invalidate list queries
			utils.projects.list.invalidate();
			utils.chats.list.invalidate();
			// 3. Prefetch: Wait for chat data to be in cache before switching
			await utils.chats.get.fetch({ id: result.chatId });
			// 4. Now safe to switch - data is ready
			setChatSourceMode("local");
			setSelectedChatId(result.chatId);
			onClose();
		},
		onError: (error) => {
			toast.error(`Clone failed: ${error.message}`);
		}
	});
	const isAnyLoading = importMutation.isPending || locateMutation.isPending || pickDestMutation.isPending || cloneMutation.isPending;
	createEffect(() => {
		setMounted(true);
	});
	createEffect(() => {
		if (isOpen) {
			openAtRef = performance.now();
			setSelectedProjectId(null);
		}
	});
	// Keyboard support
	createEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				const canInteract = performance.now() - openAtRef > INTERACTION_DELAY_MS;
				if (canInteract && !isAnyLoading) {
					onClose();
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});
	const handleClose = () => {
		const canInteract = performance.now() - openAtRef > INTERACTION_DELAY_MS;
		if (!canInteract || isAnyLoading) return;
		onClose();
	};
	// Handler: Locate existing project
	const handleLocateProject = async () => {
		if (!remoteChat?.meta?.repository) return;
		const [owner, repo] = remoteChat.meta.repository.split("/");
		if (!owner || !repo) return;
		const result = await locateMutation.mutateAsync({
			expectedOwner: owner,
			expectedRepo: repo
		});
		if (result.success && result.project) {
			// Now import into this project
			importMutation.mutate({
				sandboxId: remoteChat.sandbox_id!,
				remoteChatId: remoteChat.id,
				remoteSubChatId: remoteSubChatId ?? undefined,
				projectId: result.project.id,
				chatName: remoteChat.name
			});
		} else if (result.reason === "wrong-repo") {
			toast.error(`That folder is ${result.found}, not ${owner}/${repo}`);
		}
		// canceled = do nothing
	};
	// Handler: Clone from sandbox
	const handleCloneFromSandbox = async () => {
		if (!remoteChat?.meta?.repository || !remoteChat.sandbox_id) return;
		const [, repo] = remoteChat.meta.repository.split("/");
		if (!repo) return;
		// Pick destination
		const destResult = await pickDestMutation.mutateAsync({ suggestedName: repo });
		if (!destResult.success || !destResult.targetPath) return;
		// Clone
		toast.info("Cloning repository... this may take a while");
		cloneMutation.mutate({
			sandboxId: remoteChat.sandbox_id,
			remoteChatId: remoteChat.id,
			remoteSubChatId: remoteSubChatId ?? undefined,
			chatName: remoteChat.name,
			targetPath: destResult.targetPath
		});
	};
	// Handler: Select project from list
	const handleSelectProject = () => {
		if (!selectedProjectId || !remoteChat?.sandbox_id) return;
		importMutation.mutate({
			sandboxId: remoteChat.sandbox_id,
			remoteChatId: remoteChat.id,
			remoteSubChatId: remoteSubChatId ?? undefined,
			projectId: selectedProjectId,
			chatName: remoteChat.name
		});
	};
	if (!mounted()) return null;
	if (typeof document === "undefined") return null;
	const mode = matchingProjects.length === 0 ? "no-projects" : "multiple-projects";
	const repository = remoteChat?.meta?.repository;
	return (
		<Portal mount={document.body}>
			<Presence exitBeforeEnter>
				<Show when={isOpen && remoteChat}>
					{/* Overlay */}
					<Motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18, easing: EASING_CURVE }}
						class="fixed inset-0 z-[45] bg-black/25"
						onClick={handleClose}
						style={{ "pointer-events": "auto" }}
						data-modal="open-locally"
					/>

					{/* Main Dialog */}
					<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
						<Motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							transition={{ duration: 0.2, easing: EASING_CURVE }}
							class="w-[90vw] max-w-[400px] pointer-events-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
								<Show
									when={mode === "no-projects"}
									fallback={
										<>
											<div class="p-6">
												<h2 class="text-lg font-semibold mb-2">Multiple copies found</h2>
												<p class="text-sm text-muted-foreground mb-5">
													You have{" "}
													<code class="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs">{repository}</code>{" "}
													in multiple locations. Which one should we use?
												</p>

												<div class="space-y-2">
													<For each={matchingProjects}>
														{(project) => (
															<button
																type="button"
																class={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedProjectId() === project.id ? "bg-muted ring-1 ring-primary" : "bg-muted/50 hover:bg-muted"}`}
																onClick={() => setSelectedProjectId(project.id)}
															>
																<div class={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedProjectId() === project.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
																	<Show when={selectedProjectId() === project.id}>
																		<Check class="w-2.5 h-2.5 text-primary-foreground" />
																	</Show>
																</div>
																<div class="flex-1 min-w-0">
																	<div class="text-sm font-medium">{project.name}</div>
																	<div class="text-xs text-muted-foreground font-mono truncate">{project.path}</div>
																</div>
															</button>
														)}
													</For>
												</div>
											</div>

											<div class="bg-muted/50 px-6 py-4 flex justify-between border-t border-border">
												<Button variant="ghost" size="sm" onClick={handleClose} disabled={isAnyLoading}>
													Cancel
												</Button>
												<Button size="sm" onClick={handleSelectProject} disabled={!selectedProjectId() || isAnyLoading}>
													{importMutation.isPending ? "Opening..." : "Open Locally"}
												</Button>
											</div>
										</>
									}
								>
									<div class="p-6">
										<h2 class="text-lg font-semibold mb-2">Project not found locally</h2>
										<p class="text-sm text-muted-foreground mb-5">
											This sandbox is working on{" "}
											<code class="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs">{repository}</code>
											, but we couldn't find it on your machine.
										</p>

										<div class="space-y-2">
											{/* Option 1: Locate existing clone */}
											<button onClick={handleLocateProject} disabled={isAnyLoading} class="w-full p-3 rounded-lg text-left bg-muted/50 hover:bg-muted transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
												<div class="flex items-center gap-3">
													<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-background border">
														<Folder class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
													</div>
													<div class="flex-1 min-w-0">
														<div class="text-sm font-medium">I have it cloned</div>
														<div class="text-xs text-muted-foreground">Point us to your local copy</div>
													</div>
												</div>
											</button>

											{/* Option 2: Clone from sandbox */}
											<button onClick={handleCloneFromSandbox} disabled={isAnyLoading} class="w-full p-3 rounded-lg text-left bg-muted/50 hover:bg-muted transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
												<div class="flex items-center gap-3">
													<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-background border">
														<Download class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
													</div>
													<div class="flex-1 min-w-0">
														<div class="text-sm font-medium">Clone from sandbox</div>
														<div class="text-xs text-muted-foreground">Download the repository (may take a while)</div>
													</div>
												</div>
											</button>
										</div>

										{/* Loading indicator */}
										<Show when={isAnyLoading}>
											<div class="mt-4 text-xs text-muted-foreground text-center">
												{locateMutation.isPending && "Opening folder picker..."}
												{pickDestMutation.isPending && "Opening folder picker..."}
												{importMutation.isPending && "Importing..."}
												{cloneMutation.isPending && "Cloning repository..."}
											</div>
										</Show>
									</div>

									{/* Footer with Cancel */}
									<div class="bg-muted/50 px-6 py-4 flex justify-end border-t border-border">
										<Button variant="ghost" size="sm" onClick={handleClose} disabled={isAnyLoading}>
											Cancel
										</Button>
									</div>
								</Show>
							</div>
						</Motion.div>
					</div>
				</Show>
			</Presence>
		</Portal>
	);
}
