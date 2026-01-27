import type { ComponentProps, ValidComponent, JSX } from "solid-js";
import { Show, splitProps } from "solid-js";
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { X } from "lucide-solid";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.CloseButton;

type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

export function DialogOverlay(props: DialogOverlayProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DialogPrimitive.Overlay
			class={cn(
				"fixed inset-0 z-50 bg-black/20",
				"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
				local.class
			)}
			{...rest}
		/>
	);
}

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	onOverlayClick?: () => void;
};

export function DialogContent(props: DialogContentProps) {
	const [local, rest] = splitProps(props, ["class", "children", "showCloseButton", "onOverlayClick"]);
	const showClose = local.showCloseButton ?? true;

	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay
				class={cn(
					"fixed inset-0 z-50 bg-black/20",
					"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0"
				)}
				onClick={local.onOverlayClick}
			/>
			<DialogPrimitive.Content
				data-canvas-dialog
				class={cn(
					"fixed left-[50%] top-[50%] z-50 grid w-[600px] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-200",
					"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
					"rounded-[16px] mx-auto",
					local.class
				)}
				{...rest}
			>
				{local.children}
				<Show when={showClose}>
					<DialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
						<X class="h-4 w-4" />
						<span class="sr-only">Close</span>
					</DialogPrimitive.CloseButton>
				</Show>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

type DialogHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

export function DialogHeader(props: DialogHeaderProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("flex flex-col space-y-1.5 text-center sm:text-left", local.class)} {...rest} />;
}

type DialogFooterProps = JSX.HTMLAttributes<HTMLDivElement>;

export function DialogFooter(props: DialogFooterProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", local.class)} {...rest} />;
}

type CanvasDialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
};

export function CanvasDialogContent(props: CanvasDialogContentProps) {
	const [local, rest] = splitProps(props, ["class", "children", "showCloseButton"]);
	const showClose = local.showCloseButton ?? true;

	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay
				class={cn(
					"fixed inset-0 z-50 bg-black/50",
					"data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0"
				)}
			/>
			<DialogPrimitive.Content
				data-canvas-dialog
				class={cn(
					"fixed left-[50%] top-[50%] z-50 w-[420px] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-tl-background border border-border shadow-2xl overflow-hidden",
					"duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95",
					local.class
				)}
				{...rest}
			>
				{local.children}
				<Show when={showClose}>
					<DialogPrimitive.CloseButton class="absolute right-3 top-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10">
						<X class="h-3.5 w-3.5" />
						<span class="sr-only">Close</span>
					</DialogPrimitive.CloseButton>
				</Show>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

export function CanvasDialogHeader(props: DialogHeaderProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("px-5 py-4", local.class)} {...rest} />;
}

export function CanvasDialogBody(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("px-5 pb-5", local.class)} {...rest} />;
}

export function CanvasDialogFooter(props: DialogFooterProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cn("bg-muted p-4 flex justify-end gap-2 border-t border-border rounded-b-xl", local.class)} {...rest} />;
}

type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

export function DialogTitle(props: DialogTitleProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <DialogPrimitive.Title class={cn("text-lg font-semibold leading-none tracking-tight", local.class)} {...rest} />;
}

type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;

export function DialogDescription(props: DialogDescriptionProps) {
	const [local, rest] = splitProps(props, ["class"]);
	return <DialogPrimitive.Description class={cn("text-sm text-muted-foreground", local.class)} {...rest} />;
}
