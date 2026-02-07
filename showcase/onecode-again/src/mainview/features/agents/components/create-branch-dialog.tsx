import { createSignal, createEffect, createMemo, For, Show } from "solid-js";
import { toast } from "solid-sonner";
import { GitBranch, ChevronDown, Check } from "lucide-solid";
import { Dialog, CanvasDialogContent, CanvasDialogHeader, CanvasDialogBody, CanvasDialogFooter, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Popover as PopoverPrimitive } from "@kobalte/core/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../../../components/ui/command";
import { IconSpinner } from "../../../components/ui/icons";
import { useMutation } from "@tanstack/solid-query";
import { getQueryClient } from "../../../contexts/QueryProvider";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { cn } from "../../../lib/utils";
import { formatTimeAgo } from "../utils/format-time-ago";

interface CreateBranchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectPath: string;
	branches: Array<{
		name: string;
		isDefault: boolean;
		committedAt: string | null;
		protected?: boolean;
	}>;
	defaultBranch: string;
	onBranchCreated: (branchName: string) => void;
}
export function CreateBranchDialog(props: CreateBranchDialogProps) {
	const [branchName, setBranchName] = createSignal("");
	const [baseBranch, setBaseBranch] = createSignal(props.defaultBranch);
	const [baseBranchOpen, setBaseBranchOpen] = createSignal(false);
	const [baseBranchSearch, setBaseBranchSearch] = createSignal("");
	// Reset baseBranch when defaultBranch changes
	createEffect(() => {
		setBaseBranch(props.defaultBranch);
	});
	createEffect(() => {
		if (!baseBranchOpen()) {
			setBaseBranchSearch("");
		}
	});
	const filteredBaseBranches = createMemo(() => {
		let filtered = props.branches;
		if (baseBranchSearch().trim()) {
			const search = baseBranchSearch().toLowerCase();
			filtered = props.branches.filter((b) => b.name.toLowerCase().includes(search));
		}
		return filtered.slice(0, 50);
	});

	const queryClient = getQueryClient();
	const createBranchMutation = useMutation(() => ({
		mutationFn: (input: { projectPath: string; branchName: string; baseBranch: string }) =>
			desktopRpc.changes.createBranch.mutate(input),
		onSuccess: (data) => {
			toast.success(`Branch '${data.branchName}' created successfully`);
			queryClient?.invalidateQueries({ queryKey: ["changes", "getBranches", props.projectPath] });
			props.onBranchCreated(data.branchName);
			props.onOpenChange(false);
			setBranchName("");
			setBaseBranch(props.defaultBranch);
		},
		onError: (error) => {
			toast.error(`Failed to create branch: ${error.message}`);
		},
	}));
	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const name = branchName().trim();
		const base = baseBranch();
		if (!name) {
			toast.error("Branch name is required");
			return;
		}
		if (!/^[a-zA-Z0-9._/-]+$/.test(name)) {
			toast.error("Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes");
			return;
		}
		createBranchMutation.mutate({
			projectPath: props.projectPath,
			branchName: name,
			baseBranch: base,
		});
	};
	return <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <CanvasDialogContent class="sm:max-w-[350px] overflow-visible">
        <CanvasDialogHeader>
          <DialogTitle>Create a Branch</DialogTitle>
        </CanvasDialogHeader>

        <CanvasDialogBody class="space-y-4">
          {	/* Branch Name Input */}
          <div class="space-y-2">
            <Label for="branch-name" class="text-sm">
              Name
            </Label>
            <Input id="branch-name" placeholder="feature/my-new-feature" value={branchName()} onInput={(e) => setBranchName(e.currentTarget.value)} onKeyDown={(e) => {
 if (e.key === "Enter" && branchName().trim() && !createBranchMutation.isPending) {
			e.preventDefault();
			handleSubmit(e);
		}
	}} autofocus disabled={createBranchMutation.isPending} class="h-9" />
          </div>

          {	/* Base Branch Selection with Search */}
          <div class="space-y-2">
            <Label class="text-sm">Create branch based on...</Label>
            { /* Using Popover WITHOUT Portal so it renders inside Dialog's DOM tree */}
            <PopoverPrimitive open={baseBranchOpen()} onOpenChange={setBaseBranchOpen} gutter={4}>
              <PopoverPrimitive.Trigger
                class={cn("flex h-9 w-full items-center justify-between gap-2 rounded-[10px] border border-input bg-background px-3 py-2 text-sm shadow-sm", "hover:bg-accent hover:text-accent-foreground", "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", "disabled:cursor-not-allowed disabled:opacity-50")}
                disabled={createBranchMutation.isPending}
              >
                  <span class="truncate">{baseBranch()}</span>
                  <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
              </PopoverPrimitive.Trigger>
              { /* NO Portal wrapper - content renders inside Dialog */}
              <PopoverPrimitive.Content class="z-50 w-full rounded-[10px] bg-popover p-0 text-sm text-popover-foreground shadow-lg border border-border outline-none dark data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95">
                <Command>
                  <CommandInput placeholder="Search branches..." value={baseBranchSearch()} onValueChange={setBaseBranchSearch} />
                  <CommandList class="max-h-[200px]">
                    <Show when={filteredBaseBranches().length === 0} fallback={<CommandGroup>
                      <For each={filteredBaseBranches()}>{(branch) => <CommandItem value={branch.name} onSelect={() => {
                        setBaseBranch(branch.name);
                        setBaseBranchOpen(false);
                      }} class="gap-2 cursor-pointer">
                        <GitBranch class="h-4 w-4 text-muted-foreground shrink-0" />
                        <span class="truncate flex-1">{branch.name}</span>
                        <Show when={branch.committedAt}>
                          <span class="text-xs text-muted-foreground/70 shrink-0">
                            {formatTimeAgo(branch.committedAt ?? undefined)}
                          </span>
                        </Show>
                        <Show when={baseBranch() === branch.name}>
                          <Check class="h-4 w-4 shrink-0" />
                        </Show>
                      </CommandItem>}</For>
                    </CommandGroup>}>
                      <CommandEmpty>No branches found.</CommandEmpty>
                    </Show>
                  </CommandList>
                </Command>
              </PopoverPrimitive.Content>
            </PopoverPrimitive>
          </div>
        </CanvasDialogBody>

        <CanvasDialogFooter>
          <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={createBranchMutation.isPending} class="transition-transform duration-150 active:scale-[0.97] rounded-md">
            Cancel
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e)} disabled={!branchName().trim() || createBranchMutation.isPending} class="transition-transform duration-150 active:scale-[0.97] rounded-md">
            <Show when={createBranchMutation.isPending} fallback="Create Branch">
              <>
                <IconSpinner class="w-4 h-4 mr-2" />
                Creating...
              </>
            </Show>
          </Button>
        </CanvasDialogFooter>
      </CanvasDialogContent>
    </Dialog>;
}
