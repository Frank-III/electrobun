import { createSignal, createEffect, For, Index, Show, onCleanup } from "solid-js";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Plus, Trash2, ChevronDown } from "lucide-solid";
import { AIPenIcon } from "../../ui/icons";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../ui/select";
import { toast } from "solid-sonner";
import { COMMAND_PROMPTS } from "../../../features/agents/commands";
import { agentsSettingsDialogOpenAtom, selectedAgentChatIdAtom } from "../../../lib/atoms";

function useIsNarrowScreen() {
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
export function AgentsWorktreesTab() {
	const isNarrowScreen = useIsNarrowScreen();
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(),
	}));
	const projects = () => projectsQuery.data;
	const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);

	const configDataQuery = useQuery(() => ({
		queryKey: ["worktreeConfig", "get", selectedProjectId()!] as const,
		queryFn: () => desktopRpc.worktreeConfig.get({ projectId: selectedProjectId()! }),
		enabled: !!selectedProjectId(),
	}));
	const configData = () => configDataQuery.data;
	const refetchConfig = () => configDataQuery.refetch();

	const saveMutation = useMutation(() => ({
		mutationFn: (input: { projectId: string; config: import("../../../../shared/rpc-schema").WorktreeConfig; target?: string }) =>
			desktopRpc.worktreeConfig.save.mutate(input),
		onSuccess: () => {
			toast.success("Worktree config saved");
			refetchConfig();
		},
		onError: (err) => toast.error(`Failed to save: ${err.message}`),
	}));
	const setSettingsDialogOpen = agentsSettingsDialogOpenAtom[1];
	const setSelectedChatId = selectedAgentChatIdAtom[1];
	const createChatMutation = useMutation(() => ({
		mutationFn: (input: Parameters<typeof desktopRpc.chats.create.mutate>[0]) =>
			desktopRpc.chats.create.mutate(input),
		onSuccess: (data) => {
			setSettingsDialogOpen(false);
			setSelectedChatId(data.id);
		},
	}));
	// Local state
	const [saveTarget, setSaveTarget] = createSignal("1code");
	const [commands, setCommands] = createSignal([""]);
	const [unixCommands, setUnixCommands] = createSignal<string[]>([]);
	const [windowsCommands, setWindowsCommands] = createSignal<string[]>([]);
	const [showPlatformSpecific, setShowPlatformSpecific] = createSignal(false);
	createEffect(() => {
		const p = projects();
		if (p && p.length > 0 && !selectedProjectId()) {
			setSelectedProjectId(p[0].id);
		}
	});
	createEffect(() => {
		const c = configData();
		if (c) {
			if (c.source === "cursor") {
				setSaveTarget("cursor");
			} else {
				setSaveTarget("1code");
			}
			if (c.config) {
				const generic = c.config["setup-worktree"];
				setCommands(Array.isArray(generic) ? [...generic, ""] : generic ? [generic, ""] : [""]);
				// Platform-specific
				const unix = c.config["setup-worktree-unix"];
				const win = c.config["setup-worktree-windows"];
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
		const pid = selectedProjectId();
		if (!pid) return;
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
		saveMutation.mutate({
			projectId: pid,
			config,
			target: saveTarget(),
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
	const selectedProject = () => projects()?.find((p) => p.id === selectedProjectId());
	const cursorExists = () => configData()?.available?.cursor?.exists ?? false;
    return <div class="p-6 space-y-6">
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Worktrees</h3>
          <p class="text-xs text-muted-foreground">
            Configure setup commands that run when a new worktree is created
          </p>
        </div>
      </Show>

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
              <Select value={selectedProjectId() ?? ""} onChange={(v: string) => setSelectedProjectId(v || null)}>
                <SelectTrigger class="w-full">
                  <span class="text-sm truncate">
                    {selectedProject()?.name ?? "Select..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <For each={projects() ?? []}>
                    {(p) => <SelectItem value={p.id}>{p.name}</SelectItem>}
                  </For>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Show>
    </div>;
 }
