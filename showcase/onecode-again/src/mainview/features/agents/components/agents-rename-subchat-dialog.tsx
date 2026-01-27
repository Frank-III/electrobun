"use client";
import { AnimatePresence, motion } from "motion/react";
import { createEffect, createSignal } from "solid-js";
import { createPortal } from "solid-js/web";
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
export function AgentsRenameSubChatDialog({ isOpen, onClose, onSave, currentName, isLoading = false }: AgentsRenameSubChatDialogProps) {
	const [mounted, setMounted] = createSignal(false);
	const [name, setName] = createSignal(currentName);
	const [isSaving, setIsSaving] = createSignal(false);
	const [openAtRef, setOpenAtRef] = createSignal<number>(0);
	const [inputRef, setInputRef] = createSignal<HTMLInputElement>(null);
	createEffect(() => {
		setMounted(true);
	});
	createEffect(() => {
		if (isOpen) {
			openAtRef.current = performance.now();
			setName(currentName);
		}
	});
	const handleAnimationComplete = () => {
		// Focus and select input after animation completes (only if still open)
		if (isOpen) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	};
	createEffect(() => {
		if (!isOpen) return;
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
		return () => document.removeEventListener("keydown", handleKeyDown);
	});
	const handleClose = () => {
		const canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
		if (!canInteract || isSaving) return;
		onClose();
	};
	const handleSave = async () => {
		const trimmedName = name.trim();
		if (!trimmedName || trimmedName === currentName) {
			handleClose();
			return;
		}
		setIsSaving(true);
		try {
			await onSave(trimmedName);
			handleClose();
		} catch {} finally {
			setIsSaving(false);
		}
	};
	if (!mounted) return null;
	const portalTarget = typeof document !== "undefined" ? document.body : null;
	if (!portalTarget) return null;
	return createPortal(<AnimatePresence mode="wait" initial={false}>
      {isOpen && <>
          {	/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{
 opacity: 1,
		transition: {
			duration: .18,
			ease: EASING_CURVE
		}
	}} exit={{
		opacity: 0,
		pointerEvents: "none" as const,
		transition: {
			duration: .15,
			ease: EASING_CURVE
		}
	}} class="fixed inset-0 z-[45] bg-black/25" onClick={handleClose} style={{ pointerEvents: "auto" }} data-modal="agents-rename-subchat" />

          {	/* Main Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
            <motion.div initial={{
 scale: .95,
		opacity: 0
	}} animate={{
		scale: 1,
		opacity: 1
	}} exit={{
		scale: .95,
		opacity: 0
	}} transition={{
		duration: .2,
		ease: EASING_CURVE
	}} onAnimationComplete={handleAnimationComplete} class="w-[90vw] max-w-[400px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
                <div class="p-6">
                  <h2 class="text-xl font-semibold mb-4">
                    Rename agent
                  </h2>

                  {	/* Input */}
                  <Input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Chat name" class="w-full h-11 text-sm" disabled={isSaving || isLoading} />
                </div>

                { /* Footer with buttons */}
                <div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
                  <Button onClick={handleClose} variant="ghost" disabled={isSaving || isLoading} class="rounded-md">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} variant="default" disabled={!name.trim() || name.trim() === currentName || isSaving || isLoading} class="rounded-md">
                    {isSaving || isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>, portalTarget);
 }
