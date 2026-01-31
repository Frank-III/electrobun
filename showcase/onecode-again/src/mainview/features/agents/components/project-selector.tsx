import { createSignal, createMemo, Show, For } from "solid-js";
import { FolderOpen } from "lucide-solid";
import { showOfflineModeFeaturesAtom } from "../../../lib/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { IconChevronDown, CheckIcon, FolderPlusIcon, GitHubIcon } from "../../../components/ui/icons";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { getQueryClient } from "../../../contexts/QueryProvider";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { selectedProjectAtom } from "../atoms";

// Helper component to render project icon (avatar or folder)
function ProjectIcon(props: {
	gitOwner?: string | null;
	gitProvider?: string | null;
	class?: string;
	isOffline?: boolean;
}) {
	const { gitOwner, gitProvider, isOffline = false } = props;
	const cls = props.class ?? "h-4 w-4";
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [hasError, setHasError] = createSignal(false);
	const handleLoad = () => setIsLoaded(true);
	const handleError = () => setHasError(true);
	// In offline mode or on error, don't try to load remote images
	if (isOffline || hasError() || !gitOwner || gitProvider !== "github") {
		return <FolderOpen class={`${cls} text-muted-foreground flex-shrink-0`} />;
	}
	return <div class={`${cls} relative flex-shrink-0`}>
      {	/* Placeholder background while loading */}
      <Show when={!isLoaded()}><div class="absolute inset-0 rounded-sm bg-muted" /></Show>
      <img src={`https://github.com/${gitOwner}.png?size=64`} alt={gitOwner} class={`${cls} rounded-sm flex-shrink-0 ${isLoaded() ? "opacity-100" : "opacity-0"}`} onLoad={handleLoad} onError={handleError} />
    </div>;
 }
export function ProjectSelector() {
	const [selectedProject, setSelectedProject] = selectedProjectAtom;
	const [open, setOpen] = createSignal(false);
	const [searchQuery, setSearchQuery] = createSignal("");
	const [githubDialogOpen, setGithubDialogOpen] = createSignal(false);
	const [githubUrl, setGithubUrl] = createSignal("");
	const showOfflineFeatures = showOfflineModeFeaturesAtom[0];
	const queryClient = getQueryClient();

	const ollamaQuery = useQuery(() => ({
		queryKey: ["ollama", "getStatus"] as const,
		queryFn: () => desktopRpc.ollama.getStatus(),
		enabled: showOfflineFeatures(),
	}));
	const ollamaStatus = () => ollamaQuery.data;
	const isOffline = () => showOfflineFeatures() && ollamaStatus() ? !ollamaStatus()!.internet.online : false;

	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		queryFn: () => desktopRpc.projects.list.query(undefined),
	}));
	const projects = () => projectsQuery.data;
	const isLoadingProjects = () => projectsQuery.isLoading;

	const filteredProjects = createMemo(() => {
		const list = projects();
		if (!list) return [];
		if (!searchQuery().trim()) return list;
		const query = searchQuery().toLowerCase();
		return list.filter((p) => p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query));
	});

	const openFolder = useMutation(() => ({
		mutationFn: () => desktopRpc.projects.openFolder.mutate(undefined as never),
		onSuccess: (project) => {
			if (project && queryClient) {
				queryClient.setQueryData(["projects", "list"], (oldData: typeof project[] | undefined) => {
					if (!oldData) return [project];
					const exists = oldData.some((p) => p.id === project.id);
					if (exists) {
						return oldData.map((p) => (p.id === project.id ? { ...p, updatedAt: project.updatedAt } : p));
					}
					return [project, ...oldData];
				});
				setSelectedProject({
					id: project.id,
					name: project.name,
					path: project.path,
					gitRemoteUrl: project.gitRemoteUrl,
					gitProvider: project.gitProvider as "github" | "gitlab" | "bitbucket" | null,
					gitOwner: project.gitOwner,
					gitRepo: project.gitRepo,
				});
			}
		},
	}));

	const cloneFromGitHub = useMutation(() => ({
		mutationFn: (input: { repoUrl: string }) => desktopRpc.projects.cloneFromGitHub.mutate(input),
		onSuccess: (project) => {
			if (project && queryClient) {
				queryClient.setQueryData(["projects", "list"], (oldData: typeof project[] | undefined) => {
					if (!oldData) return [project];
					const exists = oldData.some((p) => p.id === project.id);
					if (exists) {
						return oldData.map((p) => (p.id === project.id ? { ...p, updatedAt: project.updatedAt } : p));
					}
					return [project, ...oldData];
				});
				setSelectedProject({
					id: project.id,
					name: project.name,
					path: project.path,
					gitRemoteUrl: project.gitRemoteUrl,
					gitProvider: project.gitProvider as "github" | "gitlab" | "bitbucket" | null,
					gitOwner: project.gitOwner,
					gitRepo: project.gitRepo,
				});
				setGithubDialogOpen(false);
				setGithubUrl("");
			}
		},
	}));
	const handleOpenFolder = async () => {
		setOpen(false);
		await openFolder.mutateAsync(undefined as never);
	};
	const handleCloneFromGitHub = async () => {
		if (!githubUrl().trim()) return;
		await cloneFromGitHub.mutateAsync({ repoUrl: githubUrl().trim() });
	};
	const handleSelectProject = (projectId: string) => {
		const project = projects()?.find((p) => p.id === projectId);
		if (project) {
			setSelectedProject({
				id: project.id,
				name: project.name,
				path: project.path,
				gitRemoteUrl: project.gitRemoteUrl,
				gitProvider: project.gitProvider as "github" | "gitlab" | "bitbucket" | null,
				gitOwner: project.gitOwner,
				gitRepo: project.gitRepo
			});
			setOpen(false);
		}
	};
	const validSelection = createMemo(() => {
		if (!selectedProject) return null;
		if (isLoadingProjects()) return selectedProject;
		const list = projects();
		if (!list) return null;
		const exists = list.some((p) => p.id === selectedProject.id);
		return exists ? selectedProject : null;
	});

	if (!validSelection() && (!projects() || projects()!.length === 0) && !isLoadingProjects()) {
		return (
			<button
				onClick={handleOpenFolder}
				disabled={openFolder.isPending}
				class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
			>
				<FolderPlusIcon class="h-3.5 w-3.5" />
				<span>{openFolder.isPending ? "Adding..." : "Add repository"}</span>
			</button>
		);
	}
	return <>
    <Popover open={open} onOpenChange={(isOpen) => {
		setOpen(isOpen);
		if (!isOpen) setSearchQuery("");
	}}>
      <PopoverTrigger asChild>
		<button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" type="button">
          <ProjectIcon gitOwner={validSelection()?.gitOwner} gitProvider={validSelection()?.gitProvider} isOffline={isOffline()} />
          <span class="truncate max-w-[120px]">
            {validSelection()?.name || "Select repo"}
          </span>
          <IconChevronDown class="h-3 w-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search repos..." value={searchQuery()} onValueChange={setSearchQuery} />
          <CommandList class="max-h-[300px] overflow-y-auto">
            {isLoadingProjects() ? <div class="px-2.5 py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div> : filteredProjects().length > 0 ? <CommandGroup>
                {filteredProjects().map((project) => {
		const isSelected = validSelection()?.id === project.id;
		return <CommandItem key={project.id} value={`${project.name} ${project.path}`} onSelect={() => handleSelectProject(project.id)} class="gap-2">
                      <ProjectIcon gitOwner={project.gitOwner} gitProvider={project.gitProvider} isOffline={isOffline()} />
                      <span class="truncate flex-1">{project.name}</span>
                      <Show when={isSelected}><CheckIcon class="h-4 w-4 shrink-0" /></Show>
                    </CommandItem>;
	})}
              </CommandGroup> : <CommandEmpty>No projects found.</CommandEmpty>}
          </CommandList>
          <div class="border-t border-border/50 py-1">
            <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 w-[calc(100%-8px)] rounded-md text-sm cursor-default select-none outline-none dark:hover:bg-neutral-800 hover:text-foreground transition-colors">
              <FolderPlusIcon class="h-4 w-4 text-muted-foreground" />
              <span>{openFolder.isPending ? "Adding..." : "Add repository"}</span>
            </button>
            <button onClick={() => {
		setOpen(false);
		setGithubDialogOpen(true);
	}} class="flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 w-[calc(100%-8px)] rounded-md text-sm cursor-default select-none outline-none dark:hover:bg-neutral-800 hover:text-foreground transition-colors">
              <GitHubIcon class="h-4 w-4 text-muted-foreground" />
              <span>Add from GitHub</span>
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>

    <Dialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen}>
      <DialogContent class="w-[400px] p-0 gap-0 overflow-hidden">
        <form onSubmit={(e) => {
		e.preventDefault();
		handleCloneFromGitHub();
	}}>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">
              Clone from GitHub
            </h2>
            <Input placeholder="owner/repo or https://github.com/..." value={githubUrl()} onInput={(e) => setGithubUrl(e.currentTarget.value)} class="w-full h-11 text-sm" autofocus />
          </div>
          <div class="bg-muted p-4 flex justify-between border-t border-border">
            <Button type="button" onClick={() => setGithubDialogOpen(false)} variant="ghost" class="rounded-md">
              Cancel
            </Button>
            <Button type="submit" disabled={!githubUrl().trim() || cloneFromGitHub.isPending} variant="default" class="rounded-md">
              {cloneFromGitHub.isPending ? "Cloning..." : "Clone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>;
}
