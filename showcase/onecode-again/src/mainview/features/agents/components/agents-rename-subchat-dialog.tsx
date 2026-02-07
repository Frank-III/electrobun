import { Motion, Presence } from "solid-motionone";
import { Show, mergeProps } from "solid-js";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
interface AgentsRenameSubChatDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string) => Promise<void>;
	currentName: string;
	isLoading?: boolean;
}
const EASING_CURVE = [
	.55,
	.055,
	.675,
	.19
] as const;
const INTERACTION_DELAY_MS = 250;
export function AgentsRenameSubChatDialog(rawProps: AgentsRenameSubChatDialogProps) {
	const props = mergeProps({ isLoading: false }, rawProps);
	const [name, setName] = createSignal(props.currentName);
	const [isSaving, setIsSaving] = createSignal(false);
	let openAtRef = 0;
	let inputRef: HTMLInputElement | undefined;
	createEffect(() => {
		if (props.isOpen) {
			openAtRef = performance.now();
			setName(props.currentName);
		}
	});
	createEffect(() => {
		if (props.isOpen) {
			inputRef?.focus();
			inputRef?.select();
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
		const canInteract = performance.now() - openAtRef > INTERACTION_DELAY_MS;
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
	return (
		<Portal mount={document.body}>
			<Presence exitBeforeEnter>
				<Show when={props.isOpen}>
					{/* Overlay */}
					<Motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18, easing: EASING_CURVE }}
						class="fixed inset-0 z-[45] bg-black/25"
						onClick={handleClose}
						style={{ "pointer-events": "auto" }}
						data-modal="agents-rename-subchat"
					/>

					{/* Main Dialog */}
					<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
						<Motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							transition={{ duration: 0.2, easing: EASING_CURVE }}
							class="w-[90vw] max-w-[400px] pointer-events-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
								<div class="p-6">
									<h2 class="text-xl font-semibold mb-4">Rename agent</h2>
									{/* Input */}
									<Input
										ref={el => inputRef = el}
										value={name()}
										onInput={(e) => setName(e.currentTarget.value)}
										placeholder="Chat name"
										class="w-full h-11 text-sm"
										disabled={isSaving() || props.isLoading}
									/>
								</div>

								{/* Footer with buttons */}
								<div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
									<Button onClick={handleClose} variant="ghost" disabled={isSaving() || props.isLoading} class="rounded-md">
										Cancel
									</Button>
									<Button
										onClick={handleSave}
										variant="default"
										disabled={!name().trim() || name().trim() === props.currentName || isSaving() || props.isLoading}
										class="rounded-md"
									>
										{isSaving() || props.isLoading ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						</Motion.div>
					</div>
				</Show>
			</Presence>
		</Portal>
	);
}
