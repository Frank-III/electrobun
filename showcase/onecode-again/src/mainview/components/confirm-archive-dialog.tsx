import { createEffect, createSignal, Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface ConfirmArchiveDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (deleteWorktree: boolean) => void;
	activeProcessCount: number;
	hasWorktree: boolean;
	uncommittedCount: number;
}

const INTERACTION_DELAY_MS = 250;

export function ConfirmArchiveDialog(props: ConfirmArchiveDialogProps) {
	const [deleteWorktree, setDeleteWorktree] = createSignal(false);
	let openAt = 0;
	let confirmButtonRef: HTMLButtonElement | undefined;

	createEffect(() => {
		if (props.isOpen) {
			openAt = performance.now();
			setDeleteWorktree(false);
			setTimeout(() => confirmButtonRef?.focus(), 50);
		}
	});

	const handleClose = () => {
		const canInteract = performance.now() - openAt > INTERACTION_DELAY_MS;
		if (!canInteract) return;
		props.onClose();
	};

	const handleConfirm = () => {
		const canInteract = performance.now() - openAt > INTERACTION_DELAY_MS;
		if (!canInteract) return;
		props.onConfirm(deleteWorktree());
		props.onClose();
	};

	createEffect(() => {
		if (!props.isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				handleClose();
			}
			if (event.key === "Enter") {
				event.preventDefault();
				handleConfirm();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});

	const hasProcesses = () => props.activeProcessCount > 0;
	const showWarning = () => deleteWorktree() && props.uncommittedCount > 0;

	return (
		<Show when={props.isOpen}>
			<Portal>
				{/* Overlay */}
				<div
					class="fixed inset-0 z-[45] bg-black/25 animate-in fade-in duration-150"
					onClick={handleClose}
					data-modal="confirm-archive-dialog"
				/>

				{/* Main Dialog */}
				<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46]">
					<div
						class="w-[90vw] max-w-[400px] animate-in zoom-in-95 fade-in duration-200"
						onClick={(e) => e.stopPropagation()}
					>
						<div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
							<div class="p-6">
								<h2 class="text-xl font-semibold mb-4">
									Archive Workspace
								</h2>

								{/* Active processes warning */}
								<Show when={hasProcesses()}>
									<p class="text-sm text-muted-foreground mb-4">
										{props.activeProcessCount} running {props.activeProcessCount === 1 ? "process" : "processes"} will be stopped.
									</p>
								</Show>

								{/* Worktree checkbox */}
								<Show when={props.hasWorktree}>
									<div class="space-y-2">
										<label class="flex items-start gap-3 cursor-pointer">
											<Checkbox
												checked={deleteWorktree()}
												onChange={(checked) => setDeleteWorktree(checked)}
												class="mt-0.5"
											/>
											<span class="text-sm select-none">
												Delete worktree to free disk space
											</span>
										</label>

										{/* Uncommitted changes warning */}
										<Show when={showWarning()}>
											<p class="text-sm text-amber-600 dark:text-amber-500 ml-7">
												{props.uncommittedCount} uncommitted {props.uncommittedCount === 1 ? "change" : "changes"} will be lost
											</p>
										</Show>
									</div>
								</Show>
							</div>

							{/* Footer with buttons */}
							<div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
								<Button onClick={handleClose} variant="ghost" class="rounded-md">
									Cancel
								</Button>
								<Button ref={confirmButtonRef} onClick={handleConfirm} variant="default" class="rounded-md">
									Archive
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
