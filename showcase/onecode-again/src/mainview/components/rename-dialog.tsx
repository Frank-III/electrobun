import { createEffect, createSignal, Show, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface RenameDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string) => Promise<void>;
	currentName: string;
	isLoading?: boolean;
	title?: string;
	placeholder?: string;
}

const INTERACTION_DELAY_MS = 250;

export function RenameDialog(props: RenameDialogProps) {
	const [name, setName] = createSignal(props.currentName);
	const [isSaving, setIsSaving] = createSignal(false);
	const [openAtRef, setOpenAtRef] = createSignal<number>(0);
	let inputRef: HTMLInputElement | undefined;

	createEffect(() => {
		if (props.isOpen) {
			setOpenAtRef(performance.now());
			setName(props.currentName);
			setTimeout(() => {
				inputRef?.focus();
				inputRef?.select();
			}, 200);
		}
	});

	createEffect(() => {
		if (!props.isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				handleClose();
			}
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleSave();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
	});

	const handleClose = () => {
		const canInteract = performance.now() - openAtRef() > INTERACTION_DELAY_MS;
		if (!canInteract || isSaving()) return;
		props.onClose();
	};

	const handleSave = async () => {
		const trimmedName = name().trim();
		if (!trimmedName || trimmedName === props.currentName) {
			handleClose();
			return;
		}

		setIsSaving(true);
		try {
			await props.onSave(trimmedName);
			handleClose();
		} catch {} finally {
			setIsSaving(false);
		}
	};

	const isLoading = () => props.isLoading ?? false;

	return (
		<Show when={props.isOpen}>
			<Portal>
				{/* Overlay */}
				<div
					class="fixed inset-0 z-[45] bg-black/25 animate-fade-in"
					onClick={handleClose}
					style={{ "pointer-events": "auto" }}
					data-modal="rename-dialog"
				/>

				{/* Main Dialog */}
				<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46]">
					<div
						class="w-[90vw] max-w-[400px] animate-scale-in"
						onClick={(e: MouseEvent) => e.stopPropagation()}
					>
						<div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
							<div class="p-6">
								<h2 class="text-xl font-semibold mb-4">
									{props.title ?? "Rename"}
								</h2>

								{/* Input */}
								<Input
									ref={inputRef}
									value={name()}
									onInput={(e: InputEvent) => setName((e.target as HTMLInputElement).value)}
									placeholder={props.placeholder ?? "Name"}
									class="w-full h-11 text-sm"
									disabled={isSaving() || isLoading()}
								/>
							</div>

							{/* Footer with buttons */}
							<div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
								<Button
									onClick={handleClose}
									variant="ghost"
									disabled={isSaving() || isLoading()}
									class="rounded-md"
								>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									variant="default"
									disabled={!name().trim() || name().trim() === props.currentName || isSaving() || isLoading()}
									class="rounded-md"
								>
									{isSaving() || isLoading() ? "Saving..." : "Save"}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
