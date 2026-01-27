import type { ComponentProps, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { Switch as SwitchPrimitive } from "@kobalte/core/switch";
import { cn } from "../../lib/utils";

export type SwitchProps = ComponentProps<typeof SwitchPrimitive>;

export function Switch(props: SwitchProps) {
	const [local, rest] = splitProps(props, ["class"]);

	return (
		<SwitchPrimitive
			data-slot="switch"
			class={cn("group inline-flex items-center", local.class)}
			{...rest}
		>
			<SwitchPrimitive.Input class="peer" />
			<SwitchPrimitive.Control
				class={cn(
					"peer inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"data-[checked]:bg-primary bg-muted-foreground/20"
				)}
			>
				<SwitchPrimitive.Thumb
					data-slot="switch-thumb"
					class={cn(
						"pointer-events-none block h-4 w-[26px] rounded-full bg-background shadow-md ring-0 transition-all duration-200",
						"data-[checked]:bg-white data-[checked]:translate-x-[14px] translate-x-0",
						"group-active:w-[32px] group-active:transition-[transform,width] group-active:duration-150",
						"group-active:data-[checked]:translate-x-[8px]"
					)}
				/>
			</SwitchPrimitive.Control>
		</SwitchPrimitive>
	);
}
