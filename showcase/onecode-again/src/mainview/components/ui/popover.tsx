import type { ComponentProps, ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import { Popover as PopoverPrimitive } from "@kobalte/core/popover";
import { cn } from "../../lib/utils";
import { overlayContentBase, overlayMaxHeight, overlayAnimation, overlaySlideIn } from "../../lib/overlay-styles";

export type PopoverProps = ComponentProps<typeof PopoverPrimitive>;

export function Popover(props: PopoverProps) {
	const merged = mergeProps({ gutter: 4 }, props);
	return <PopoverPrimitive {...merged} />;
}

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.CloseButton;
export const PopoverPortal = PopoverPrimitive.Portal;

export type PopoverContentProps<T extends ValidComponent = "div"> = ComponentProps<typeof PopoverPrimitive.Content<T>> & {
	forceDark?: boolean;
};

export function PopoverContent<T extends ValidComponent = "div">(props: PopoverContentProps<T>) {
	const [local, rest] = splitProps(props as PopoverContentProps, ["class", "forceDark"]);
	const forceDark = local.forceDark ?? true;

	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-popover="true"
				class={cn(
					overlayContentBase,
					overlayMaxHeight,
					overlayAnimation,
					overlaySlideIn,
					"min-w-[200px] py-1",
					"origin-(--kb-popover-content-transform-origin)",
					forceDark && "dark",
					local.class
				)}
				{...rest}
			/>
		</PopoverPrimitive.Portal>
	);
}
