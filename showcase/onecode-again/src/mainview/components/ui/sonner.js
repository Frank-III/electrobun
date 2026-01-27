"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toaster = void 0;
var solid_sonner_1 = require("solid-sonner");
var Toaster = function (props) {
    return <solid_sonner_1.Toaster class="toaster group" toastOptions={{ classes: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
            } }} {...props}/>;
};
exports.Toaster = Toaster;
