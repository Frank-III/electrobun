"use client";
import { Motion, Presence } from "solid-motionone";
import { createEffect, onCleanup, Show } from "solid-js";

interface DiffCenterPeekDialogProps {
	isOpen: boolean;
	onClose: () => void;
	children: JSX.Element;
}

export function DiffCenterPeekDialog(props: DiffCenterPeekDialogProps) {
	// Close on Escape key
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			props.onClose();
		}
	};

	createEffect(() => {
		if (props.isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
		}
	});

	return (
		<Presence>
			<Show when={props.isOpen}>
				{/* Backdrop */}
				<Motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					class="fixed inset-0 bg-black/50 z-50"
					onClick={props.onClose}
				/>

				{/* Dialog */}
				<Motion.div
					role="dialog"
					aria-modal="true"
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.98 }}
					transition={{ duration: 0.15, easing: [0.4, 0, 0.2, 1] }}
					class="fixed z-50 flex flex-col bg-background border border-border/50 overflow-hidden"
					style={{
						top: "72px",
						left: "72px",
						right: "72px",
						height: "calc(100% - 144px)",
						"max-width": "1200px",
						"margin-inline": "auto",
						"border-radius": "12px",
						"box-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
					}}
				>
					{props.children}
				</Motion.div>
			</Show>
		</Presence>
	);
}
