import { Button } from "../../../../components/ui/button";
import { toast } from "solid-sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";
import { createSignal, Show, splitProps } from "solid-js";
import { cn } from "../../../../lib/utils";
import { IconSpinner } from "../../../../components/ui/icons";
import { useMutation } from "@tanstack/solid-query";
import { selectedOllamaModelAtom } from "../../../../lib/atoms";
import { desktopRpc } from "../../../../lib/desktop-rpc";
import { getQueryClient } from "../../../../contexts/QueryProvider";
interface CommitInputProps {
	worktreePath: string;
	hasStagedChanges: boolean;
	onRefresh: () => void;
	/** Called after a successful commit to reset UI state */
	onCommitSuccess?: () => void;
	stagedCount?: number;
	currentBranch?: string;
	/** File paths selected for commit - will be staged before committing */
	selectedFilePaths?: string[];
	/** Chat ID for AI-generated commit messages */
	chatId?: string;
}
export function CommitInput(props: CommitInputProps) {
	const [local] = splitProps(props, [
		"worktreePath",
		"hasStagedChanges",
		"onRefresh",
		"onCommitSuccess",
		"stagedCount",
		"currentBranch",
		"selectedFilePaths",
		"chatId",
	]);
	const [summary, setSummary] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [isGenerating, setIsGenerating] = createSignal(false);
	const queryClient = getQueryClient();
	const selectedOllamaModel = selectedOllamaModelAtom[0];

	const generateCommitMutation = useMutation(() => ({
		mutationFn: (input: { chatId: string; filePaths?: string[]; ollamaModel?: string | null }) =>
			desktopRpc.chats.generateCommitMessage.mutate(input),
	}));
	const atomicCommitMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; filePaths: string[]; message: string }) =>
			desktopRpc.changes.atomicCommit.mutate(input),
		onSuccess: () => {
			setSummary("");
			setDescription("");
			queryClient?.invalidateQueries({ queryKey: ["changes", "getStatus"] });
			local.onRefresh();
			local.onCommitSuccess?.();
		},
		onError: (error) => toast.error(`Commit failed: ${error.message}`),
	}));
	const commitMutation = useMutation(() => ({
		mutationFn: (input: { worktreePath: string; message: string }) =>
			desktopRpc.changes.commit.mutate(input),
		onSuccess: () => {
			setSummary("");
			setDescription("");
			queryClient?.invalidateQueries({ queryKey: ["changes", "getStatus"] });
			local.onRefresh();
			local.onCommitSuccess?.();
		},
		onError: (error) => toast.error(`Commit failed: ${error.message}`),
	}));
	const isPending = () =>
		commitMutation.isPending || atomicCommitMutation.isPending || isGenerating();
	// Build full commit message from summary and description
	const getCommitMessage = () => {
		const trimmedSummary = summary().trim();
		const trimmedDescription = description().trim();
		if (trimmedDescription) {
			return `${trimmedSummary}\n\n${trimmedDescription}`;
		}
		return trimmedSummary;
	};
	// Can commit if files are selected (will auto-generate message if needed)
	const canCommit = local.hasStagedChanges;
	const handleCommit = async () => {
		if (!canCommit) return;
		try {
			// Get commit message - generate if empty
			let commitMessage = getCommitMessage();
			console.log("[CommitInput] handleCommit called, commitMessage:", commitMessage, "chatId:", local.chatId);
			if (!commitMessage && local.chatId) {
				console.log("[CommitInput] No message, generating with AI for files:", local.selectedFilePaths);
				setIsGenerating(true);
				try {
					const result = await generateCommitMutation.mutateAsync({
						chatId: local.chatId,
						filePaths: local.selectedFilePaths,
						ollamaModel: selectedOllamaModel(),
					});
					console.log("[CommitInput] AI generated message:", result?.message);
					commitMessage = result?.message ?? "";
					if (result?.message) setSummary(result.message);
				} catch (error) {
					console.error("[CommitInput] Failed to generate message:", error);
					toast.error("Failed to generate commit message");
					setIsGenerating(false);
					return;
				}
				setIsGenerating(false);
			}
			if (!commitMessage) {
				toast.error("Please enter a commit message");
				return;
			}
			// Use atomic commit when we have selected files (single operation, safer)
			if (local.selectedFilePaths && local.selectedFilePaths.length > 0) {
				atomicCommitMutation.mutate({
					worktreePath: local.worktreePath,
					filePaths: local.selectedFilePaths,
					message: commitMessage,
				});
			} else {
				commitMutation.mutate({
					worktreePath: local.worktreePath,
					message: commitMessage,
				});
			}
		} catch (error) {
			toast.error(`Failed to prepare commit: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	};
	// Build dynamic commit label
	const getCommitLabel = () => {
		if (local.stagedCount && local.stagedCount > 0 && local.currentBranch) {
			return `Commit ${local.stagedCount} to ${local.currentBranch}`;
		}
		if (local.currentBranch) {
			return `Commit to ${local.currentBranch}`;
		}
		return "Commit";
	};
	const getTooltip = () => {
		if (!local.hasStagedChanges) return "No staged changes";
		if (!summary().trim()) return "AI will generate commit message";
		return "Commit staged changes";
	};
	return <div class="flex flex-col gap-2 p-2 border-t border-border/50 bg-background">
			{	/* Summary input - single line */}
			<input type="text" placeholder="Summary (required)" value={summary()} onInput={(e) => setSummary(e.currentTarget.value)} class={cn("w-full px-2 py-1.5 text-xs rounded-md", "bg-background border border-input", "placeholder:text-muted-foreground", "focus:outline-none focus:ring-1 focus:ring-ring")} onKeyDown={(e) => {
 if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canCommit) {
			e.preventDefault();
			handleCommit();
		}
	}} />

			{	/* Description textarea - multiline */}
			<textarea placeholder="Description" value={description()} onInput={(e) => setDescription(e.currentTarget.value)} class={cn("w-full px-2 py-1.5 text-xs rounded-md resize-none", "bg-background border border-input", "placeholder:text-muted-foreground", "focus:outline-none focus:ring-1 focus:ring-ring", "min-h-[60px]")} onKeyDown={(e) => {
 if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canCommit) {
			e.preventDefault();
			handleCommit();
		}
	}} />

			{	/* Commit button - simple, no dropdown */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="default" size="sm" class="w-full h-7 text-xs overflow-hidden" onClick={handleCommit} disabled={!canCommit || isPending()}>
						<Show
							when={isPending()}
							fallback={<span class="truncate">{getCommitLabel()}</span>}
						>
							<IconSpinner class="h-3 w-3 mr-1.5 animate-spin" />
							<span class="truncate">
								<Show when={isGenerating()} fallback="Committing...">
									Generating...
								</Show>
							</span>
						</Show>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="top">{getTooltip()}</TooltipContent>
			</Tooltip>
		</div>;
 }
