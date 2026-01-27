"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogClose = exports.DialogPortal = exports.DialogTrigger = exports.Dialog = void 0;
exports.DialogOverlay = DialogOverlay;
exports.DialogContent = DialogContent;
exports.DialogHeader = DialogHeader;
exports.DialogFooter = DialogFooter;
exports.CanvasDialogContent = CanvasDialogContent;
exports.CanvasDialogHeader = CanvasDialogHeader;
exports.CanvasDialogBody = CanvasDialogBody;
exports.CanvasDialogFooter = CanvasDialogFooter;
exports.DialogTitle = DialogTitle;
exports.DialogDescription = DialogDescription;
var solid_js_1 = require("solid-js");
var dialog_1 = require("@kobalte/core/dialog");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../lib/utils");
exports.Dialog = dialog_1.Dialog;
exports.DialogTrigger = dialog_1.Dialog.Trigger;
exports.DialogPortal = dialog_1.Dialog.Portal;
exports.DialogClose = dialog_1.Dialog.CloseButton;
function DialogOverlay(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<dialog_1.Dialog.Overlay class={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/20", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0", local.class)} {...rest}/>);
}
function DialogContent(props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "children", "showCloseButton", "onOverlayClick"]), local = _b[0], rest = _b[1];
    var showClose = (_a = local.showCloseButton) !== null && _a !== void 0 ? _a : true;
    return (<dialog_1.Dialog.Portal>
			<dialog_1.Dialog.Overlay class={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/20", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0")} onClick={local.onOverlayClick}/>
			<dialog_1.Dialog.Content data-canvas-dialog class={(0, utils_1.cn)("fixed left-[50%] top-[50%] z-50 grid w-[600px] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-200", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95", "rounded-[16px] mx-auto", local.class)} {...rest}>
				{local.children}
				<solid_js_1.Show when={showClose}>
					<dialog_1.Dialog.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
						<lucide_solid_1.X class="h-4 w-4"/>
						<span class="sr-only">Close</span>
					</dialog_1.Dialog.CloseButton>
				</solid_js_1.Show>
			</dialog_1.Dialog.Content>
		</dialog_1.Dialog.Portal>);
}
function DialogHeader(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("flex flex-col space-y-1.5 text-center sm:text-left", local.class)} {...rest}/>;
}
function DialogFooter(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", local.class)} {...rest}/>;
}
function CanvasDialogContent(props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "children", "showCloseButton"]), local = _b[0], rest = _b[1];
    var showClose = (_a = local.showCloseButton) !== null && _a !== void 0 ? _a : true;
    return (<dialog_1.Dialog.Portal>
			<dialog_1.Dialog.Overlay class={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/50", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0")}/>
			<dialog_1.Dialog.Content data-canvas-dialog class={(0, utils_1.cn)("fixed left-[50%] top-[50%] z-50 w-[420px] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-tl-background border border-border shadow-2xl overflow-hidden", "duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95", local.class)} {...rest}>
				{local.children}
				<solid_js_1.Show when={showClose}>
					<dialog_1.Dialog.CloseButton class="absolute right-3 top-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10">
						<lucide_solid_1.X class="h-3.5 w-3.5"/>
						<span class="sr-only">Close</span>
					</dialog_1.Dialog.CloseButton>
				</solid_js_1.Show>
			</dialog_1.Dialog.Content>
		</dialog_1.Dialog.Portal>);
}
function CanvasDialogHeader(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("px-5 py-4", local.class)} {...rest}/>;
}
function CanvasDialogBody(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("px-5 pb-5", local.class)} {...rest}/>;
}
function CanvasDialogFooter(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("bg-muted p-4 flex justify-end gap-2 border-t border-border rounded-b-xl", local.class)} {...rest}/>;
}
function DialogTitle(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <dialog_1.Dialog.Title class={(0, utils_1.cn)("text-lg font-semibold leading-none tracking-tight", local.class)} {...rest}/>;
}
function DialogDescription(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <dialog_1.Dialog.Description class={(0, utils_1.cn)("text-sm text-muted-foreground", local.class)} {...rest}/>;
}
