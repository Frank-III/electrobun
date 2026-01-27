"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceWaveIndicator = VoiceWaveIndicator;
var solid_js_1 = require("solid-js");
var utils_1 = require("../../../lib/utils");
/**
* Animated sound wave indicator that visualizes audio input
* Shows animated bars that respond to real audio levels
*/
function VoiceWaveIndicator(_a) {
    var isRecording = _a.isRecording, audioLevel = _a.audioLevel, className = _a.className;
    var _b = (0, solid_js_1.createSignal)([]), barsRef = _b[0], setBarsRef = _b[1];
    (0, solid_js_1.createEffect)(function () {
        if (!isRecording) {
            // Reset bar heights when not recording
            barsRef.current.forEach(function (bar) {
                if (bar)
                    bar.style.height = "15%";
            });
            return;
        }
        // Update bars based on audio level
        // Create a natural wave pattern with slight variations
        barsRef.current.forEach(function (bar, index) {
            if (!bar)
                return;
            // Create wave pattern - center bars are taller
            var centerFactor = 1 - Math.abs(index - 2) * .12;
            // Add slight randomness for organic feel
            var randomVariation = .9 + Math.random() * .2;
            // Calculate height: minimum 10%, scale up to 100% based on audio level
            var baseHeight = 10;
            var maxHeight = 100;
            var levelHeight = audioLevel * (maxHeight - baseHeight) * centerFactor * randomVariation;
            var finalHeight = baseHeight + levelHeight;
            bar.style.height = "".concat(finalHeight, "%");
        });
    });
    if (!isRecording)
        return null;
    return <div class={(0, utils_1.cn)("flex items-center justify-center gap-[3px] h-5 px-2", className)}>
      {[
            0,
            1,
            2,
            3,
            4
        ].map(function (i) { return <div key={i} ref={function (el) {
                if (el)
                    barsRef.current[i] = el;
            }} class="w-[3px] bg-foreground rounded-full transition-[height] duration-75 ease-out" style={{ height: "15%" }}/>; })}
    </div>;
}
