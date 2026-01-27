"use client";
import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../../lib/utils";

interface ButtonGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

const ButtonGroup: ParentComponent<ButtonGroupProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "ref"]);
	return (
		<div
			ref={local.ref}
			class={cn(
				"inline-flex rounded-md shadow-sm",
				"[&>button]:rounded-none",
				"[&>button:first-child]:rounded-l-md",
				"[&>button:last-child]:rounded-r-md",
				"[&>button:not(:first-child)]:-ml-px",
				local.class
			)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

export { ButtonGroup };
