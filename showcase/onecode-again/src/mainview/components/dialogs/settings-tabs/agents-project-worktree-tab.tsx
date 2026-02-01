import { createSignal, createEffect, onCleanup, Show, For, createResource } from "solid-js";
import { useSetAtom } from "../../../lib/state/store";
import { getRpc } from "../../../lib/rpc";
import { Button, buttonVariants } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Plus, Trash2, ChevronDown } from "lucide-solid";
import { AIPenIcon } from "../../ui/icons";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/alert-dialog";
import { toast } from "solid-sonner";
import { COMMAND_PROMPTS } from "../../../features/agents/commands";
import { agentsSettingsDialogOpenAtom, selectedAgentChatIdAtom, selectedProjectAtom, agentsSettingsDialogActiveTabAtom } from "../../../lib/atoms";

function useIsNarrowScreen(): () => boolean {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		onCleanup(() => window.removeEventListener("resize", checkWidth));
	});
	return isNarrow;
}

interface AgentsProjectWorktreeTabProps {
	projectId: string;
}

export function AgentsProjectWorktreeTab(props: AgentsProjectWorktreeTabProps) {
	const rpc = getRpc();
	const isNarrowScreen = useIsNarrowScreen();

	// Get config for selected project
	const [configData, { refetch: refetchConfig }] = createResource(
		() => props.projectId,
		async (id) => {
			if (!id) return null;
			return rpc.worktreeConfigGet({ projectId: id });
		}
	);

	// Get project info
	const [project] = createResource(
		() => props.projectId,
		async (id) => {
			if (!id) return null;
			return rpc.projectsGet({ id });
		}
	);

	// Mutation states
	const [isSaving, setIsSaving] = createSignal(false);
	const [isCreatingChat, setIsCreatingChat] = createSignal(false);
	const [isDeleting, setIsDeleting] = createSignal(false);

	// For "Fill with AI" - create chat and close settings
	const setSettingsDialogOpen = useSetAtom(agentsSettingsDialogOpenAtom);
	const setSelectedChatId = useSetAtom(selectedAgentChatIdAtom);
	const setSelectedProject = useSetAtom(selectedProjectAtom);
	const setSettingsActiveTab = useSetAtom(agentsSettingsDialogActiveTabAtom);

	const [showDeleteDialog, setShowDeleteDialog] = createSignal(false);

	// Local state
	const [saveTarget, setSaveTarget] = createSignal("1code");
	const [commands, setCommands] = createSignal([""]);
	const [unixCommands, setUnixCommands] = createSignal<string[]>([]);
	const [windowsCommands, setWindowsCommands] = createSignal<string[]>([]);
	const [showPlatformSpecific, setShowPlatformSpecific] = createSignal(false);

	// Sync from server data
	createEffect(() => {
		const data = configData();
		if (data) {
			if (data.source === "cursor") {
				setSaveTarget("cursor");
			} else {
				setSaveTarget("1code");
			}
			if (data.config) {
				// Generic commands
				const generic = data.config["setup-worktree"];
				setCommands(Array.isArray(generic) ? [...generic, ""] : generic ? [generic, ""] : [""]);
				// Platform-specific
				const unix = data.config["setup-worktree-unix"];
				const win = data.config["setup-worktree-windows"];
				setUnixCommands(Array.isArray(unix) ? unix : unix ? [unix] : []);
				setWindowsCommands(Array.isArray(win) ? win : win ? [win] : []);
				// Show platform section if any platform-specific commands exist
				if (unix || win) {
					setShowPlatformSpecific(true);
				}
			} else {
				setCommands([""]);
				setUnixCommands([]);
				setWindowsCommands([]);
			}
		}
	});

	const handleSave = async () => {
		if (!props.projectId) return;
		setIsSaving(true);
		try {
			const config: Record<string, string[]> = {};
			const filteredCommands = commands().filter((c) => c.trim());
			const filteredUnix = unixCommands().filter((c) => c.trim());
			const filteredWin = windowsCommands().filter((c) => c.trim());
			if (filteredCommands.length > 0) {
				config["setup-worktree"] = filteredCommands;
			}
			if (filteredUnix.length > 0) {
				config["setup-worktree-unix"] = filteredUnix;
			}
			if (filteredWin.length > 0) {
				config["setup-worktree-windows"] = filteredWin;
			}
			await rpc.worktreeConfigSave({
				projectId: props.projectId,
				config,
				target: saveTarget()
			});
			toast.success("Worktree config saved");
			refetchConfig();
		} catch (err) {
			toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCreateChat = async () => {
		const prompt = COMMAND_PROMPTS["worktree-setup"];
		if (!prompt || !props.projectId) return;
		setIsCreatingChat(true);
		try {
			const data = await rpc.chatsCreate({
				projectId: props.projectId,
				name: "Worktree Setup",
				initialMessageParts: [{
					type: "text",
					text: prompt
				}],
				useWorktree: false,
				mode: "agent"
			});
			setSettingsDialogOpen(false);
			setSelectedChatId(data.id);
		} catch (err) {
			toast.error(`Failed to create chat: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsCreatingChat(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await rpc.projectsDelete({ id: props.projectId });
			toast.success("Project removed from list");
			// Clear selected project if it's the one being deleted
			setSelectedProject((current) => {
				if (current?.id === props.projectId) {
					return null;
				}
				return current;
			});
			// Switch to account tab
			setSettingsActiveTab("account");
		} catch (err) {
			toast.error(`Failed to delete project: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsDeleting(false);
		}
	};

	const updateCommand = (index: number, value: string, list: string[], setter: (v: string[]) => void) => {
		const newList = [...list];
		newList[index] = value;
		setter(newList);
	};

	const removeCommand = (index: number, list: string[], setter: (v: string[]) => void) => {
		if (list.length <= 1) return;
		setter(list.filter((_, i) => i !== index));
	};

	const addCommand = (list: string[], setter: (v: string[]) => void) => {
		setter([...list, ""]);
	};

	const cursorExists = () => configData()?.available?.cursor?.exists ?? false;

	return (
		<div class="p-6 space-y-6">
			{/* Header */}
			<Show when={!isNarrowScreen()}>
				<div class="flex items-start justify-between gap-4">
					<div class="flex flex-col space-y-1.5 text-center sm:text-left">
						<h3 class="text-sm font-semibold text-foreground">Worktree Setup</h3>
						<p class="text-xs text-muted-foreground">
							Configure setup commands that run when a new worktree is created
						</p>
					</div>
					<AlertDialog open={showDeleteDialog()} onOpenChange={setShowDeleteDialog}>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" size="sm" class="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
								<Trash2 class="h-3.5 w-3.5" />
								Remove Project
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Remove Project?</AlertDialogTitle>
								<AlertDialogDescription>
									This will remove "{project()?.name}" from your project list. Your files will not be deleted.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleDelete} disabled={isDeleting()} class={buttonVariants({ variant: "destructive" })}>
									{isDeleting() ? "Removing..." : "Remove"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</Show>

			{/* Config Location */}
			<div class="space-y-2">
				<div class="pb-2">
					<h4 class="text-sm font-medium text-foreground">
						Config Location
					</h4>
					<Show when={configData()?.path}>
						<p class="text-xs text-muted-foreground mt-1">
							Using: {configData()?.path}
						</p>
					</Show>
				</div>

				<div class="bg-background rounded-lg border border-border overflow-hidden">
					<div class="p-4 flex items-center justify-between gap-6">
						<div class="flex-1">
							<Label class="text-sm font-medium">Save to</Label>
							<p class="text-xs text-muted-foreground">
								Where to save the configuration file
							</p>
						</div>
						<div class="flex-shrink-0 w-auto min-w-56 max-w-80">
							<Select value={saveTarget()} onValueChange={(v) => setSaveTarget(v as "cursor" | "1code")}>
								<SelectTrigger class="w-full">
									<span class="text-sm font-mono truncate">
										{saveTarget() === "cursor" ? ".cursor/worktrees.json" : ".1code/worktree.json"}
									</span>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1code">
										.1code/worktree.json
									</SelectItem>
									<Show when={cursorExists()}>
										<SelectItem value="cursor">
											.cursor/worktrees.json
										</SelectItem>
									</Show>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			{/* Setup Commands - Main */}
			<div class="space-y-2">
				<div class="pb-2 flex items-center justify-between">
					<div>
						<h4 class="text-sm font-medium text-foreground">
							Setup Commands
						</h4>
						<p class="text-xs text-muted-foreground mt-1">
							Commands run in the worktree after creation
						</p>
					</div>
					<Button variant="ghost" size="sm" class="gap-1.5" onClick={handleCreateChat} disabled={!props.projectId || isCreatingChat()}>
						<AIPenIcon class="h-3.5 w-3.5" />
						Fill with AI
					</Button>
				</div>

				<div class="bg-background rounded-lg border border-border overflow-hidden">
					<div class="p-4 space-y-3">
						<div class="flex items-center justify-between">
							<Label class="text-sm font-medium">All Platforms</Label>
							<span class="text-xs text-muted-foreground">
								use <code class="font-mono bg-muted px-1 py-0.5 rounded">$ROOT_WORKTREE_PATH</code> for main repo path
							</span>
						</div>
						<div class="space-y-2">
							<For each={commands()}>
								{(cmd, i) => (
									<div class="flex items-center gap-2">
										<Input value={cmd} onInput={(e) => updateCommand(i(), e.currentTarget.value, commands(), setCommands)} placeholder="bun install && cp $ROOT_WORKTREE_PATH/.env .env" class="flex-1 font-mono text-sm" />
										<Show when={commands().length > 1}>
											<Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i(), commands(), setCommands)}>
												<Trash2 class="h-4 w-4" />
											</Button>
										</Show>
									</div>
								)}
							</For>
						</div>
						<Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground" onClick={() => addCommand(commands(), setCommands)}>
							<Plus class="h-3.5 w-3.5" />
							Add command
						</Button>
					</div>

					{/* Platform-specific toggle */}
					<div class="border-t">
						<button type="button" class="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setShowPlatformSpecific(!showPlatformSpecific())}>
							<span>Platform-specific overrides</span>
							<ChevronDown class={`h-4 w-4 transition-transform ${showPlatformSpecific() ? "rotate-180" : ""}`} />
						</button>

						<Show when={showPlatformSpecific()}>
							<div class="p-4 pt-0 space-y-4">
								{/* Unix Commands */}
								<div class="space-y-2">
									<span class="text-xs font-medium text-muted-foreground">
										macOS / Linux
									</span>
									<Show when={unixCommands().length > 0} fallback={
										<p class="text-xs text-muted-foreground/60 italic">
											Falls back to "All Platforms"
										</p>
									}>
										<div class="space-y-2">
											<For each={unixCommands()}>
												{(cmd, i) => (
													<div class="flex items-center gap-2">
														<Input value={cmd} onInput={(e) => updateCommand(i(), e.currentTarget.value, unixCommands(), setUnixCommands)} placeholder="bun install" class="flex-1 font-mono text-sm" />
														<Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i(), unixCommands(), setUnixCommands)}>
															<Trash2 class="h-4 w-4" />
														</Button>
													</div>
												)}
											</For>
										</div>
									</Show>
									<Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={() => addCommand(unixCommands(), setUnixCommands)}>
										<Plus class="h-3 w-3" />
										Add
									</Button>
								</div>

								{/* Windows Commands */}
								<div class="space-y-2">
									<span class="text-xs font-medium text-muted-foreground">
										Windows
									</span>
									<Show when={windowsCommands().length > 0} fallback={
										<p class="text-xs text-muted-foreground/60 italic">
											Falls back to "All Platforms"
										</p>
									}>
										<div class="space-y-2">
											<For each={windowsCommands()}>
												{(cmd, i) => (
													<div class="flex items-center gap-2">
														<Input value={cmd} onInput={(e) => updateCommand(i(), e.currentTarget.value, windowsCommands(), setWindowsCommands)} placeholder="npm ci" class="flex-1 font-mono text-sm" />
														<Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i(), windowsCommands(), setWindowsCommands)}>
															<Trash2 class="h-4 w-4" />
														</Button>
													</div>
												)}
											</For>
										</div>
									</Show>
									<Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={() => addCommand(windowsCommands(), setWindowsCommands)}>
										<Plus class="h-3 w-3" />
										Add
									</Button>
								</div>
							</div>
						</Show>
					</div>

					<div class="bg-muted p-3 flex justify-end gap-2 border-t">
						<Button size="sm" onClick={handleSave} disabled={isSaving()}>
							{isSaving() ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
