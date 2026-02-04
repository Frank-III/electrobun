import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { cn } from "../../../lib/utils";
import { ToolSelector } from "./tool-selector";
import type { AgentModel } from "../../../../shared/rpc-schema";

interface FileAgent {
	name: string;
	description: string;
	prompt: string;
	tools?: string[];
	disallowedTools?: string[];
	model?: AgentModel;
	source: "user" | "project";
	path: string;
}

interface AgentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agent: FileAgent | null;
	onSuccess: () => void;
}

type ToolMode = "all" | "allowlist" | "denylist";

export function AgentDialog(props: AgentDialogProps) {
	const queryClient = useQueryClient();
	const [mounted, setMounted] = createSignal(false);
	// Form state
	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [prompt, setPrompt] = createSignal("");
	const [model, setModel] = createSignal<AgentModel>("inherit");
	const [source, setSource] = createSignal<"user" | "project">("user");
	const [toolMode, setToolMode] = createSignal<ToolMode>("all");
	const [selectedTools, setSelectedTools] = createSignal<string[]>([]);

	const createMutation = useMutation(() => ({
		mutationFn: (input: Parameters<typeof desktopRpc.agents.create.mutate>[0]) =>
			desktopRpc.agents.create.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", "list"] });
			props.onSuccess();
			resetForm();
		},
	}));
	const updateMutation = useMutation(() => ({
		mutationFn: (input: Parameters<typeof desktopRpc.agents.update.mutate>[0]) =>
			desktopRpc.agents.update.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", "list"] });
			props.onSuccess();
			resetForm();
		},
	}));

	const isEditing = () => props.agent !== null;
	const isLoading = () => createMutation.isPending || updateMutation.isPending;

	// Initialize form when editing
	createEffect(() => {
		if (props.agent) {
			setName(props.agent.name);
			setDescription(props.agent.description);
			setPrompt(props.agent.prompt);
			setModel(props.agent.model || "inherit");
			setSource(props.agent.source);
			if (props.agent.tools && props.agent.tools.length > 0) {
				setToolMode("allowlist");
				setSelectedTools(props.agent.tools);
			} else if (props.agent.disallowedTools && props.agent.disallowedTools.length > 0) {
				setToolMode("denylist");
				setSelectedTools(props.agent.disallowedTools);
			} else {
				setToolMode("all");
				setSelectedTools([]);
			}
		} else {
			resetForm();
		}
	});

	// Ensure portal target only accessed on client
	createEffect(() => {
		setMounted(true);
	});

	// Handle escape key
	createEffect(() => {
		if (!props.open) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				props.onOpenChange(false);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});

	const resetForm = () => {
		setName("");
		setDescription("");
		setPrompt("");
		setModel("inherit");
		setSource("user");
		setToolMode("all");
		setSelectedTools([]);
	};

	const handleSubmit = (e: Event & { currentTarget: HTMLFormElement }) => {
		e.preventDefault();
		const tools = toolMode() === "allowlist" ? selectedTools() : undefined;
		const disallowedTools = toolMode() === "denylist" ? selectedTools() : undefined;

		if (isEditing() && props.agent) {
			updateMutation.mutate({
				originalName: props.agent.name,
				name: name().toLowerCase().replace(/\s+/g, "-"),
				description: description(),
				prompt: prompt(),
				tools,
				disallowedTools,
				model: model(),
				source: props.agent.source
			});
		} else {
			createMutation.mutate({
				name: name().toLowerCase().replace(/\s+/g, "-"),
				description: description(),
				prompt: prompt(),
				tools,
				disallowedTools,
				model: model(),
				source: source()
			});
		}
	};

	const isValid = () => name().trim() && description().trim() && prompt().trim();

	return (
		<Show when={mounted() && props.open}>
			<Portal>
				{/* Overlay */}
				<div
					class="fixed inset-0 z-[60] bg-black/50 animate-fade-in"
					onClick={() => props.onOpenChange(false)}
				/>

				{/* Dialog */}
				<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[65]">
					<div
						class="w-[90vw] max-w-[600px] max-h-[85vh] flex flex-col rounded-xl bg-background border border-border shadow-2xl overflow-hidden animate-scale-in"
						role="dialog"
						aria-modal="true"
					>
						{/* Header */}
						<div class="flex items-center justify-between px-6 py-4 border-b border-border">
							<h2 class="text-lg font-semibold text-foreground">
								{isEditing() ? "Edit Agent" : "Create Agent"}
							</h2>
							<button
								onClick={() => props.onOpenChange(false)}
								class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors"
							>
								<X class="h-4 w-4" />
							</button>
						</div>

						{/* Content */}
						<form onSubmit={handleSubmit} class="flex-1 overflow-y-auto p-6 space-y-5">
							{/* Name */}
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-foreground">
									Name <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={name()}
									onInput={(e) => setName(e.currentTarget.value)}
									placeholder="code-reviewer"
									class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
								<p class="text-xs text-muted-foreground">
									Will be converted to kebab-case (e.g., "code-reviewer")
								</p>
							</div>

							{/* Description */}
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-foreground">
									Description <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={description()}
									onInput={(e) => setDescription(e.currentTarget.value)}
									placeholder="Reviews code for quality and best practices"
									class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
								<p class="text-xs text-muted-foreground">
									Tells Claude when to use this agent
								</p>
							</div>

							{/* Prompt */}
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-foreground">
									System Prompt <span class="text-red-500">*</span>
								</label>
								<textarea
									value={prompt()}
									onInput={(e) => setPrompt(e.currentTarget.value)}
									placeholder="You are an expert code reviewer. When invoked:

1. Analyze the code structure
2. Check for security issues
3. Suggest improvements"
									rows={8}
									class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
								/>
								<p class="text-xs text-muted-foreground">
									Instructions for the agent when it's invoked
								</p>
							</div>

							{/* Model */}
							<div class="space-y-1.5">
								<label class="text-sm font-medium text-foreground">Model</label>
								<div class="flex flex-wrap gap-2">
									<For each={["inherit", "sonnet", "opus", "haiku"] as const}>
										{(m) => (
											<button
												type="button"
												onClick={() => setModel(m)}
												class={cn(
													"px-3 py-1.5 text-sm rounded-md border transition-colors",
													model() === m
														? "border-foreground/30 bg-foreground/10 text-foreground"
														: "border-border bg-background text-muted-foreground hover:border-foreground/20"
												)}
											>
												{m === "inherit" ? "Inherit (default)" : m.charAt(0).toUpperCase() + m.slice(1)}
											</button>
										)}
									</For>
								</div>
							</div>

							{/* Tools */}
							<div class="space-y-3">
								<label class="text-sm font-medium text-foreground">Tools</label>
								<div class="flex flex-wrap gap-2">
									<For each={["all", "allowlist", "denylist"] as const}>
										{(mode) => (
											<button
												type="button"
												onClick={() => {
													setToolMode(mode);
													if (mode === "all") setSelectedTools([]);
												}}
												class={cn(
													"px-3 py-1.5 text-sm rounded-md border transition-colors",
													toolMode() === mode
														? "border-foreground/30 bg-foreground/10 text-foreground"
														: "border-border bg-background text-muted-foreground hover:border-foreground/20"
												)}
											>
												{mode === "all" && "All Tools"}
												{mode === "allowlist" && "Only Selected"}
												{mode === "denylist" && "Except Selected"}
											</button>
										)}
									</For>
								</div>

								<Show when={toolMode() !== "all"}>
									<ToolSelector
										selectedTools={selectedTools()}
										onChange={setSelectedTools}
										mode={toolMode() as "allowlist" | "denylist"}
									/>
								</Show>
							</div>

							{/* Source (only for new agents) */}
							<Show when={!isEditing()}>
								<div class="space-y-1.5">
									<label class="text-sm font-medium text-foreground">Location</label>
									<div class="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={() => setSource("user")}
											class={cn(
												"px-3 py-1.5 text-sm rounded-md border transition-colors",
												source() === "user"
													? "border-foreground/30 bg-foreground/10 text-foreground"
													: "border-border bg-background text-muted-foreground hover:border-foreground/20"
											)}
										>
											User (~/.claude/agents/)
										</button>
										<button
											type="button"
											onClick={() => setSource("project")}
											class={cn(
												"px-3 py-1.5 text-sm rounded-md border transition-colors",
												source() === "project"
													? "border-foreground/30 bg-foreground/10 text-foreground"
													: "border-border bg-background text-muted-foreground hover:border-foreground/20"
											)}
										>
											Project (.claude/agents/)
										</button>
									</div>
									<p class="text-xs text-muted-foreground">
										User agents are available globally, project agents only in the current project
									</p>
								</div>
							</Show>
						</form>

						{/* Footer */}
						<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
							<button
								type="button"
								onClick={() => props.onOpenChange(false)}
								class="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-foreground/5 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={(e) => handleSubmit(e as any)}
								disabled={!isValid() || isLoading()}
								class={cn(
									"px-4 py-2 text-sm font-medium rounded-md transition-colors",
									isValid() && !isLoading()
										? "bg-foreground text-background hover:bg-foreground/90"
										: "bg-foreground/50 text-background/70 cursor-not-allowed"
								)}
							>
								{isLoading() ? "Saving..." : isEditing() ? "Save Changes" : "Create Agent"}
							</button>
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
