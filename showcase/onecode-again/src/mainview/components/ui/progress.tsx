import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { Progress as ProgressPrimitive } from "@kobalte/core/progress";
import { cn } from "../../lib/utils";

type ProgressProps = ComponentProps<typeof ProgressPrimitive> & {
	value?: number;
};

export function Progress(props: ProgressProps) {
	const [local, rest] = splitProps(props, ["class", "value"]);

	return (
		<ProgressPrimitive value={local.value ?? 0} {...rest}>
			<ProgressPrimitive.Track class={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", local.class)}>
				<ProgressPrimitive.Fill
					class="h-full w-full flex-1 bg-primary transition-all"
					style={{ transform: `translateX(-${100 - (local.value || 0)}%)` }}
				/>
			</ProgressPrimitive.Track>
		</ProgressPrimitive>
	);
}
