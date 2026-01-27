"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportToggle = ViewportToggle;
var utils_1 = require("../../../lib/utils");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
function ViewportToggle(_a) {
    var value = _a.value, onChange = _a.onChange, className = _a.className;
    return <react_1.motion.div layout class={(0, utils_1.cn)("flex items-center", className)} transition={{ layout: {
                duration: .15,
                ease: "easeInOut"
            } }}>
      <react_1.motion.div layout class="relative bg-muted rounded-lg h-7 p-0.5 flex">
        {/* Animated selector */}
        <react_1.motion.div class="absolute inset-y-0.5 rounded-md bg-background shadow transition-all duration-200 ease-in-out" animate={{
            width: "calc(50% - 2px)",
            left: value === "desktop" ? "2px" : "calc(50%)"
        }} transition={{
            duration: .2,
            ease: "easeInOut"
        }}/>
        <button onClick={function (e) {
            e.preventDefault();
            e.stopPropagation();
            onChange("desktop");
        }} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange("desktop");
            }
        }} aria-label="Desktop viewport" aria-pressed={value === "desktop"} class={(0, utils_1.cn)("relative z-[2] px-2 flex-1 flex items-center justify-center transition-colors duration-200 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground")}>
          <lucide_solid_1.Monitor class="h-3.5 w-3.5"/>
        </button>
        <button onClick={function (e) {
            e.preventDefault();
            e.stopPropagation();
            onChange("mobile");
        }} onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange("mobile");
            }
        }} aria-label="Mobile viewport" aria-pressed={value === "mobile"} class={(0, utils_1.cn)("relative z-[2] px-2 flex-1 flex items-center justify-center transition-colors duration-200 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 text-muted-foreground")}>
          <lucide_solid_1.Smartphone class="h-3.5 w-3.5"/>
        </button>
      </react_1.motion.div>
    </react_1.motion.div>;
}
