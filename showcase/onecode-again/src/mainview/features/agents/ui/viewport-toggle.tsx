import { cn } from "../../../lib/utils";
import { Monitor, Smartphone } from "lucide-solid";
import { Motion } from "solid-motionone";

interface ViewportToggleProps {
	value: "desktop" | "mobile";
	onChange: (mode: "desktop" | "mobile") => void;
	class?: string;
}

export function ViewportToggle(props: ViewportToggleProps) {
	return (
		<div class={cn("flex items-center", props.class)}>
			<div class="relative bg-muted rounded-lg h-7 p-0.5 flex">
				{/* Animated selector */}
				<Motion.div
					class="absolute inset-y-0.5 rounded-md bg-background shadow transition-all duration-200 ease-in-out"
					animate={{
						width: "calc(50% - 2px)",
						left: props.value === "desktop" ? "2px" : "calc(50%)"
					}}
					transition={{ duration: 0.2, easing: "ease-in-out" }}
				/>
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						props.onChange("desktop");
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							props.onChange("desktop");
						}
					}}
					aria-label="Desktop viewport"
					aria-pressed={props.value === "desktop"}
					class={cn(
						"relative z-[2] px-2 flex-1 flex items-center justify-center transition-colors duration-200 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground"
					)}
				>
					<Monitor class="h-3.5 w-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						props.onChange("mobile");
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							props.onChange("mobile");
						}
					}}
					aria-label="Mobile viewport"
					aria-pressed={props.value === "mobile"}
					class={cn(
						"relative z-[2] px-2 flex-1 flex items-center justify-center transition-colors duration-200 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground"
					)}
				>
					<Smartphone class="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
