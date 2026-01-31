import { Motion, Presence } from "solid-motionone";
import { createEffect, onCleanup, Show } from "solid-js";

interface DiffFullPageViewProps {
	isOpen: boolean;
	onClose: () => void;
	children: JSX.Element;
}

export function DiffFullPageView(props: DiffFullPageViewProps) {
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
				<Motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15, easing: [0.4, 0, 0.2, 1] }}
					class="fixed inset-0 z-50 bg-background flex flex-col"
				>
					{props.children}
				</Motion.div>
			</Show>
		</Presence>
	);
}
