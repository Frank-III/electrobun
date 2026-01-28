"use client";
import { AnimatePresence, motion } from "motion/react";
import { createEffect } from "solid-js";
interface DiffFullPageViewProps {
	isOpen: boolean;
	onClose: () => void;
	children: JSX.Element;
}
export function DiffFullPageView({ isOpen, onClose, children }: DiffFullPageViewProps) {
	// Close on Escape key
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			onClose();
		}
	};
	createEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	});
	return <AnimatePresence>
      {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
		duration: .15,
		ease: [
			.4,
			0,
			.2,
			1
		]
	}} class="fixed inset-0 z-50 bg-background flex flex-col">
          {children}
        </motion.div>}
    </AnimatePresence>;
}
