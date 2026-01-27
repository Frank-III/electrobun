import type { ComponentProps, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { AlertDialog as AlertDialogPrimitive } from "@kobalte/core/alert-dialog";
import { X } from "lucide-solid";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export const AlertDialog = AlertDialogPrimitive;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps = ComponentProps<typeof AlertDialogPrimitive.Overlay>;

export function AlertDialogOverlay(props: AlertDialogOverlayProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<AlertDialogPrimitive.Overlay
			class={cn(
				"fixed inset-0 z-50 bg-black/50",
				"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
				local.class
			)}
			{...rest}
		/>
	);
}

type AlertDialogContentProps = ComponentProps<typeof AlertDialogPrimitive.Content> & {
	showCloseButton?: boolean;
};

export function AlertDialogContent(props: AlertDialogContentProps) {
	const [local, rest] = splitProps(props, ["class", "children", "showCloseButton"]);
	const showClose = local.showCloseButton ?? false;

	return (
		<AlertDialogPrimitive.Portal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				class={cn(
					"fixed left-[50%] top-[50%] z-50 w-[420px] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-tl-background border border-border shadow-2xl overflow-hidden ring-4 ring-neutral-200/50 dark:ring-neutral-800/50",
					"duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%]",
					local.class
				)}
				{...rest}
			>
				{local.children}
				<Show when={showClose}>
					<AlertDialogPrimitive.CloseButton class="absolute right-3 top-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10">
						<X class="h-3.5 w-3.5" />
						<span class="sr-only">Close</span>
					</AlertDialogPrimitive.CloseButton>
				</Show>
			</AlertDialogPrimitive.Content>
		</AlertDialogPrimitive.Portal>
	);
}

type AlertDialogHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

export function AlertDialogHeader(props: AlertDialogHeaderProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("px-5 py-4", local.class)} {...rest} />;
}

type AlertDialogBodyProps = JSX.HTMLAttributes<HTMLDivElement>;

export function AlertDialogBody(props: AlertDialogBodyProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("px-5 pb-5", local.class)} {...rest} />;
}

type AlertDialogFooterProps = JSX.HTMLAttributes<HTMLDivElement>;

export function AlertDialogFooter(props: AlertDialogFooterProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("bg-muted p-4 flex justify-end gap-2 border-t border-border rounded-b-xl", local.class)} {...rest} />;
}

type AlertDialogTitleProps = ComponentProps<typeof AlertDialogPrimitive.Title>;

export function AlertDialogTitle(props: AlertDialogTitleProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <AlertDialogPrimitive.Title class={cn("text-lg font-semibold leading-none tracking-tight", local.class)} {...rest} />;
}

type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogPrimitive.Description>;

export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <AlertDialogPrimitive.Description class={cn("text-sm text-muted-foreground", local.class)} {...rest} />;
}

type AlertDialogActionProps = ComponentProps<typeof AlertDialogPrimitive.CloseButton>;

export function AlertDialogAction(props: AlertDialogActionProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <AlertDialogPrimitive.CloseButton class={cn(buttonVariants(), local.class)} {...rest} />;
}

type AlertDialogCancelProps = ComponentProps<typeof AlertDialogPrimitive.CloseButton>;

export function AlertDialogCancel(props: AlertDialogCancelProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <AlertDialogPrimitive.CloseButton class={cn(buttonVariants({ variant: "outline" }), local.class)} {...rest} />;
}
