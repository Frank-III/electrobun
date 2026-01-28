"use client";
import { cn } from "../../../lib/utils";
import { Motion } from "solid-motionone";

interface ResizeHandleProps {
	side: "left" | "right";
	onPointerDown: (e: PointerEvent) => void;
	isResizing?: boolean;
	className?: string;
}

export function ResizeHandle(props: ResizeHandleProps) {
	return (
		<Motion.div
			data-side={props.side}
			onPointerDown={props.onPointerDown}
			initial={{ width: 0, opacity: 0 }}
			animate={{ width: 12, opacity: 1 }}
			exit={{ width: 0, opacity: 0 }}
			transition={{ duration: 0.3, easing: "ease-in-out" }}
			class={cn(
				"h-16 bg-muted-foreground/20 rounded-full cursor-ew-resize hover:bg-muted-foreground/40 transition-colors flex-shrink-0 pointer-events-auto select-none touch-none",
				props.isResizing && "bg-muted-foreground/60",
				props.className
			)}
			style={{ "touch-action": "none" }}
		/>
	);
}
