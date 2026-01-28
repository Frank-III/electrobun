"use client";
import { createSignal } from "solid-js";
import { useAtom } from "../../lib/state/jotai";
import { ChevronLeft } from "lucide-solid";
import { IconSpinner, GitHubIcon } from "../../components/ui/icons";
import { Logo } from "../../components/ui/logo";
import { Input } from "../../components/ui/input";
import { trpc } from "../../lib/trpc";
import { selectedProjectAtom } from "../agents/atoms";
export function SelectRepoPage() {
	const [, setSelectedProject] = useAtom(selectedProjectAtom);
	const [showClonePage, setShowClonePage] = createSignal(false);
	const [githubUrl, setGithubUrl] = createSignal("");
	// Get tRPC utils for cache management
	const utils = trpc.useUtils();
	// Open folder mutation
	const openFolder = trpc.projects.openFolder.useMutation({ onSuccess: (project) => {
		if (project) {
			// Optimistically update the projects list cache
			utils.projects.list.setData(undefined, (oldData) => {
				if (!oldData) return [project];
				const exists = oldData.some((p) => p.id === project.id);
				if (exists) {
					return oldData.map((p) => p.id === project.id ? {
						...p,
						updatedAt: project.updatedAt
					} : p);
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
				gitRepo: project.gitRepo
			});
		}
	} });
	// Clone from GitHub mutation
	const cloneFromGitHub = trpc.projects.cloneFromGitHub.useMutation({ onSuccess: (project) => {
		if (project) {
			utils.projects.list.setData(undefined, (oldData) => {
				if (!oldData) return [project];
				const exists = oldData.some((p) => p.id === project.id);
				if (exists) {
					return oldData.map((p) => p.id === project.id ? {
						...p,
						updatedAt: project.updatedAt
					} : p);
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
				gitRepo: project.gitRepo
			});
			setShowClonePage(false);
			setGithubUrl("");
		}
	} });
	const handleOpenFolder = async () => {
		await openFolder.mutateAsync();
	};
	const handleCloneFromGitHub = async () => {
		if (!githubUrl.trim()) return;
		await cloneFromGitHub.mutateAsync({ repoUrl: githubUrl.trim() });
	};
	const handleBack = () => {
		if (cloneFromGitHub.isPending) return;
		setShowClonePage(false);
		setGithubUrl("");
	};
	// Clone from GitHub page
	if (showClonePage) {
		return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        {		/* Draggable title bar area */}
        <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" } as JSX.CSSProperties} />

        { /* Back button */}
        <button onClick={handleBack} disabled={cloneFromGitHub.isPending} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors disabled:opacity-50">
          <ChevronLeft class="h-5 w-5" />
        </button>

        <div class="w-full max-w-[440px] space-y-8 px-4">
          { /* Header with dual icons */}
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Logo class="w-5 h-5" fill="white" />
              </div>
              <div class="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                <GitHubIcon class="w-5 h-5 text-background" />
              </div>
            </div>
            <div class="space-y-1">
              <h1 class="text-base font-semibold tracking-tight">
                Clone from GitHub
              </h1>
              <p class="text-sm text-muted-foreground">
                Enter a repository URL or owner/repo
              </p>
            </div>
          </div>

          { /* Input */}
          <div class="space-y-4">
            <div class="relative">
              <Input value={githubUrl} onInput={(e) => setGithubUrl(e.currentTarget.value)} onKeyDown={(e) => {
 if (e.key === "Enter" && githubUrl.trim()) {
				handleCloneFromGitHub();
			}
		}} placeholder="owner/repo" class="text-center pr-10" autoFocus disabled={cloneFromGitHub.isPending} />
              {cloneFromGitHub.isPending && <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconSpinner class="h-4 w-4" />
                </div>}
            </div>
            <p class="text-xs text-muted-foreground text-center">
              Example: facebook/react or https://github.com/facebook/react
            </p>
          </div>
        </div>
      </div>;
	}
	// Main select repo page
	return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {	/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" } as JSX.CSSProperties} />

      <div class="w-full max-w-[440px] space-y-8 px-4">
        { /* Header */}
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mx-auto w-max">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Logo class="w-6 h-6" fill="white" />
            </div>
          </div>
          <div class="space-y-1">
            <h1 class="text-base font-semibold tracking-tight">
              Select a repository
            </h1>
            <p class="text-sm text-muted-foreground">
              Choose a local folder to start working with
            </p>
          </div>
        </div>

        { /* Content */}
        <div class="space-y-3">
          <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="w-full h-8 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {openFolder.isPending ? <IconSpinner class="h-4 w-4" /> : "Select folder"}
          </button>
          <button onClick={() => setShowClonePage(true)} disabled={cloneFromGitHub.isPending} class="w-full h-8 px-4 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {cloneFromGitHub.isPending ? <IconSpinner class="h-4 w-4" /> : "Clone from GitHub"}
          </button>
        </div>
      </div>
    </div>;
 }
