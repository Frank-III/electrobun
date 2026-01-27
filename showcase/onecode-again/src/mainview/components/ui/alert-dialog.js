"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertDialogPortal = exports.AlertDialogTrigger = exports.AlertDialog = void 0;
exports.AlertDialogOverlay = AlertDialogOverlay;
exports.AlertDialogContent = AlertDialogContent;
exports.AlertDialogHeader = AlertDialogHeader;
exports.AlertDialogBody = AlertDialogBody;
exports.AlertDialogFooter = AlertDialogFooter;
exports.AlertDialogTitle = AlertDialogTitle;
exports.AlertDialogDescription = AlertDialogDescription;
exports.AlertDialogAction = AlertDialogAction;
exports.AlertDialogCancel = AlertDialogCancel;
var solid_js_1 = require("solid-js");
var alert_dialog_1 = require("@kobalte/core/alert-dialog");
var lucide_solid_1 = require("lucide-solid");
var utils_1 = require("../../lib/utils");
var button_1 = require("./button");
exports.AlertDialog = alert_dialog_1.AlertDialog;
exports.AlertDialogTrigger = alert_dialog_1.AlertDialog.Trigger;
exports.AlertDialogPortal = alert_dialog_1.AlertDialog.Portal;
function AlertDialogOverlay(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return (<alert_dialog_1.AlertDialog.Overlay class={(0, utils_1.cn)("fixed inset-0 z-50 bg-black/50", "data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0", local.class)} {...rest}/>);
}
function AlertDialogContent(props) {
    var _a;
    var _b = (0, solid_js_1.splitProps)(props, ["class", "children", "showCloseButton"]), local = _b[0], rest = _b[1];
    var showClose = (_a = local.showCloseButton) !== null && _a !== void 0 ? _a : false;
    return (<alert_dialog_1.AlertDialog.Portal>
			<AlertDialogOverlay />
			<alert_dialog_1.AlertDialog.Content class={(0, utils_1.cn)("fixed left-[50%] top-[50%] z-50 w-[420px] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-tl-background border border-border shadow-2xl overflow-hidden ring-4 ring-neutral-200/50 dark:ring-neutral-800/50", "duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%]", local.class)} {...rest}>
				{local.children}
				<solid_js_1.Show when={showClose}>
					<alert_dialog_1.AlertDialog.CloseButton class="absolute right-3 top-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10">
						<lucide_solid_1.X class="h-3.5 w-3.5"/>
						<span class="sr-only">Close</span>
					</alert_dialog_1.AlertDialog.CloseButton>
				</solid_js_1.Show>
			</alert_dialog_1.AlertDialog.Content>
		</alert_dialog_1.AlertDialog.Portal>);
}
function AlertDialogHeader(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("px-5 py-4", local.class)} {...rest}/>;
}
function AlertDialogBody(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("px-5 pb-5", local.class)} {...rest}/>;
}
function AlertDialogFooter(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <div class={(0, utils_1.cn)("bg-muted p-4 flex justify-end gap-2 border-t border-border rounded-b-xl", local.class)} {...rest}/>;
}
function AlertDialogTitle(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <alert_dialog_1.AlertDialog.Title class={(0, utils_1.cn)("text-lg font-semibold leading-none tracking-tight", local.class)} {...rest}/>;
}
function AlertDialogDescription(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <alert_dialog_1.AlertDialog.Description class={(0, utils_1.cn)("text-sm text-muted-foreground", local.class)} {...rest}/>;
}
function AlertDialogAction(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <alert_dialog_1.AlertDialog.CloseButton class={(0, utils_1.cn)((0, button_1.buttonVariants)(), local.class)} {...rest}/>;
}
function AlertDialogCancel(props) {
    var _a = (0, solid_js_1.splitProps)(props, ["class"]), local = _a[0], rest = _a[1];
    return <alert_dialog_1.AlertDialog.CloseButton class={(0, utils_1.cn)((0, button_1.buttonVariants)({ variant: "outline" }), local.class)} {...rest}/>;
}
