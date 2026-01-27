import { createSignal, createEffect } from "solid-js";
import { useSetAtom } from "../../../lib/state/jotai";
import { trpc } from "../../../lib/trpc";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Plus, Trash2, ChevronDown } from "lucide-solid";
import { AIPenIcon } from "../../ui/icons";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../ui/select";
import { toast } from "solid-sonner";
import { COMMAND_PROMPTS } from "../../../features/agents/commands";
import { agentsSettingsDialogOpenAtom, selectedAgentChatIdAtom } from "../../../lib/atoms";
function useIsNarrowScreen(): boolean {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	});
	return isNarrow;
}
export function AgentsWorktreesTab() {
	const isNarrowScreen = useIsNarrowScreen();
	// Get projects list
	const { data: projects } = trpc.projects.list.useQuery();
	const [selectedProjectId, setSelectedProjectId] = createSignal(null);
	// Get config for selected project
	const { data: configData, refetch: refetchConfig } = trpc.worktreeConfig.get.useQuery({ projectId: selectedProjectId! }, { enabled: !!selectedProjectId });
	// Save mutation
	const saveMutation = trpc.worktreeConfig.save.useMutation({
		onSuccess: () => {
			toast.success("Worktree config saved");
			refetchConfig();
		},
		onError: (err) => {
			toast.error(`Failed to save: ${err.message}`);
		}
	});
	// For "Fill with AI" - create chat and close settings
	const setSettingsDialogOpen = useSetAtom(agentsSettingsDialogOpenAtom);
	const setSelectedChatId = useSetAtom(selectedAgentChatIdAtom);
	const createChatMutation = trpc.chats.create.useMutation({ onSuccess: (data) => {
		setSettingsDialogOpen(false);
		setSelectedChatId(data.id);
	} });
	// Local state
	const [saveTarget, setSaveTarget] = createSignal("1code");
	const [commands, setCommands] = createSignal([""]);
	const [unixCommands, setUnixCommands] = createSignal([]);
	const [windowsCommands, setWindowsCommands] = createSignal([]);
	const [showPlatformSpecific, setShowPlatformSpecific] = createSignal(false);
	// Auto-select first project
	createEffect(() => {
		if (projects && projects.length > 0 && !selectedProjectId) {
			setSelectedProjectId(projects[0].id);
		}
	});
	// Sync from server data
	createEffect(() => {
		if (configData) {
			if (configData.source === "cursor") {
				setSaveTarget("cursor");
			} else {
				setSaveTarget("1code");
			}
			if (configData.config) {
				// Generic commands
				const generic = configData.config["setup-worktree"];
				setCommands(Array.isArray(generic) ? [...generic, ""] : generic ? [generic, ""] : [""]);
				// Platform-specific
				const unix = configData.config["setup-worktree-unix"];
				const win = configData.config["setup-worktree-windows"];
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
	const handleSave = () => {
		if (!selectedProjectId) return;
		const config: Record<string, string[]> = {};
		const filteredCommands = commands.filter((c) => c.trim());
		const filteredUnix = unixCommands.filter((c) => c.trim());
		const filteredWin = windowsCommands.filter((c) => c.trim());
		if (filteredCommands.length > 0) {
			config["setup-worktree"] = filteredCommands;
		}
		if (filteredUnix.length > 0) {
			config["setup-worktree-unix"] = filteredUnix;
		}
		if (filteredWin.length > 0) {
			config["setup-worktree-windows"] = filteredWin;
		}
		saveMutation.mutate({
			projectId: selectedProjectId,
			config,
			target: saveTarget
		});
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
	const selectedProject = projects?.find((p) => p.id === selectedProjectId);
	const cursorExists = configData?.available?.cursor?.exists ?? false;
	return <div class="p-6 space-y-6">
      {	/* Header */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Worktrees</h3>
          <p class="text-xs text-muted-foreground">
            Configure setup commands that run when a new worktree is created
          </p>
        </div>}

      { /* Project Selection */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Project</h4>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 flex items-center justify-between gap-6">
            <div class="flex-1">
              <Label class="text-sm font-medium">Select project</Label>
              <p class="text-xs text-muted-foreground">
                Choose which project to configure
              </p>
            </div>
            <div class="flex-shrink-0 w-64">
              <Select value={selectedProjectId ?? ""} onValueChange={setSelectedProjectId}>
                <SelectTrigger class="w-full">
                  <span class="text-sm truncate">
                    {selectedProject?.name ?? "Select..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {selectedProjectId && <>
          { /* Config Location */}
          <div class="space-y-2">
            <div class="pb-2">
              <h4 class="text-sm font-medium text-foreground">
                Config Location
              </h4>
              {configData?.path && <p class="text-xs text-muted-foreground mt-1">
                  Using: {configData.path}
                </p>}
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
                  <Select value={saveTarget} onValueChange={(v) => setSaveTarget(v as "cursor" | "1code")}>
                    <SelectTrigger class="w-full">
                      <span class="text-sm font-mono truncate">
                        {saveTarget === "cursor" ? ".cursor/worktrees.json" : ".1code/worktree.json"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1code">
                        .1code/worktree.json
                      </SelectItem>
                      {cursorExists && <SelectItem value="cursor">
                          .cursor/worktrees.json
                        </SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          { /* Setup Commands - Main */}
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
              <Button variant="ghost" size="sm" class="gap-1.5" onClick={() => {
 const prompt = COMMAND_PROMPTS["worktree-setup"];
		if (prompt && selectedProjectId) {
			createChatMutation.mutate({
				projectId: selectedProjectId,
				name: "Worktree Setup",
				initialMessageParts: [{
					type: "text",
					text: prompt
				}],
				useWorktree: false,
				mode: "agent"
			});
		}
	}} disabled={!selectedProjectId || createChatMutation.isPending}>
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
                  {commands.map((cmd, i) => <div key={i} class="flex items-center gap-2">
                      <Input value={cmd} onChange={(e) => updateCommand(i, e.target.value, commands, setCommands)} placeholder="bun install && cp $ROOT_WORKTREE_PATH/.env .env" class="flex-1 font-mono text-sm" />
                      {commands.length > 1 && <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i, commands, setCommands)}>
                          <Trash2 class="h-4 w-4" />
                        </Button>}
                    </div>)}
                </div>
                <Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground" onClick={() => addCommand(commands, setCommands)}>
                  <Plus class="h-3.5 w-3.5" />
                  Add command
                </Button>
              </div>

              {	/* Platform-specific toggle */}
              <div class="border-t">
                <button type="button" class="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setShowPlatformSpecific(!showPlatformSpecific)}>
                  <span>Platform-specific overrides</span>
                  <ChevronDown class={`h-4 w-4 transition-transform ${showPlatformSpecific ? "rotate-180" : ""}`} />
                </button>

                {showPlatformSpecific && <div class="p-4 pt-0 space-y-4">
                    { /* Unix Commands */}
                    <div class="space-y-2">
                      <span class="text-xs font-medium text-muted-foreground">
                        macOS / Linux
                      </span>
                      {unixCommands.length === 0 ? <p class="text-xs text-muted-foreground/60 italic">
                          Falls back to "All Platforms"
                        </p> : <div class="space-y-2">
                          {unixCommands.map((cmd, i) => <div key={i} class="flex items-center gap-2">
                              <Input value={cmd} onChange={(e) => updateCommand(i, e.target.value, unixCommands, setUnixCommands)} placeholder="bun install" class="flex-1 font-mono text-sm" />
                              <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i, unixCommands, setUnixCommands)}>
                                <Trash2 class="h-4 w-4" />
                              </Button>
                            </div>)}
                        </div>}
                      <Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={() => addCommand(unixCommands, setUnixCommands)}>
                        <Plus class="h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    { /* Windows Commands */}
                    <div class="space-y-2">
                      <span class="text-xs font-medium text-muted-foreground">
                        Windows
                      </span>
                      {windowsCommands.length === 0 ? <p class="text-xs text-muted-foreground/60 italic">
                          Falls back to "All Platforms"
                        </p> : <div class="space-y-2">
                          {windowsCommands.map((cmd, i) => <div key={i} class="flex items-center gap-2">
                              <Input value={cmd} onChange={(e) => updateCommand(i, e.target.value, windowsCommands, setWindowsCommands)} placeholder="npm ci" class="flex-1 font-mono text-sm" />
                              <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCommand(i, windowsCommands, setWindowsCommands)}>
                                <Trash2 class="h-4 w-4" />
                              </Button>
                            </div>)}
                        </div>}
                      <Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={() => addCommand(windowsCommands, setWindowsCommands)}>
                        <Plus class="h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  </div>}
              </div>

              <div class="bg-muted p-3 flex justify-end gap-2 border-t">
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </>}
    </div>;
 }
