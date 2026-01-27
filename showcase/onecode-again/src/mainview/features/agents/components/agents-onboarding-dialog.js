"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsOnboardingDialog = AgentsOnboardingDialog;
var solid_js_1 = require("solid-js");
var react_1 = require("motion/react");
var web_1 = require("solid-js/web");
// Desktop: stub for next/image
var Image = function (_a) {
    var src = _a.src, alt = _a.alt, width = _a.width, height = _a.height, className = _a.className;
    return <img src={src} alt={alt} width={width} height={height} class={className}/>;
};
var use_theme_1 = require("../../../lib/hooks/use-theme");
var lucide_solid_1 = require("lucide-solid");
var jotai_1 = require("../../../lib/state/jotai");
var button_1 = require("../../../components/ui/button");
var atoms_1 = require("../atoms");
var EASING_CURVE = [
    .55,
    .055,
    .675,
    .19
];
var ONBOARDING_STORAGE_KEY = "agents-onboarding-seen";
// Self-contained onboarding dialog that checks localStorage
// Shows only the welcome screen - full onboarding is at /agents/onboarding
function AgentsOnboardingDialog() {
    var _a = (0, solid_js_1.createSignal)(false), mounted = _a[0], setMounted = _a[1];
    var _b = (0, solid_js_1.createSignal)(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = (0, solid_js_1.createSignal)(0), openAtRef = _c[0], setOpenAtRef = _c[1];
    var resolvedTheme = (0, use_theme_1.useTheme)().resolvedTheme;
    var _d = (0, jotai_1.useAtom)(atoms_1.agentsDebugModeAtom), debugMode = _d[0], setDebugMode = _d[1];
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
        // Check if debug mode wants to reset onboarding
        if (debugMode.enabled && debugMode.resetOnboarding) {
            localStorage.removeItem(ONBOARDING_STORAGE_KEY);
            // Reset the flag to prevent infinite loops
            setDebugMode(function (prev) { return (__assign(__assign({}, prev), { resetOnboarding: false })); });
        }
        // Check localStorage on mount
        var hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    });
    (0, solid_js_1.createEffect)(function () {
        if (isOpen) {
            openAtRef.current = performance.now();
        }
    });
    var handleClose = function () {
        var canInteract = performance.now() - openAtRef.current > 250;
        if (!canInteract)
            return;
        // Mark onboarding as seen
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
        setIsOpen(false);
    };
    // Handle ESC key to close dialog
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (e) {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
            else if (e.key === "Enter") {
                e.preventDefault();
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    });
    if (!mounted)
        return null;
    var portalTarget = typeof document !== "undefined" ? document.body : null;
    if (!portalTarget)
        return null;
    return (0, web_1.createPortal)(<react_1.AnimatePresence mode="wait" initial={false}>
      {isOpen && <>
          {/* Overlay */}
          <react_1.motion.div initial={{ opacity: 0 }} animate={{
                opacity: 1,
                transition: {
                    duration: .18,
                    ease: EASING_CURVE
                }
            }} exit={{
                opacity: 0,
                pointerEvents: "none",
                transition: {
                    duration: .15,
                    ease: EASING_CURVE
                }
            }} class="fixed inset-0 z-[45] bg-black/40" onClick={handleClose} style={{ pointerEvents: "auto" }} data-modal="agents-onboarding"/>

          {/* Main Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[46] pointer-events-none">
            <react_1.motion.div initial={{
                scale: .95,
                opacity: 0
            }} animate={{
                scale: 1,
                opacity: 1
            }} exit={{
                scale: .95,
                opacity: 0
            }} transition={{
                duration: .2,
                ease: EASING_CURVE
            }} class="w-[90vw] max-w-[384px] pointer-events-auto relative" onClick={function (e) { return e.stopPropagation(); }}>
              <div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
                {/* Close Button */}
                <button type="button" onClick={handleClose} class="absolute appearance-none outline-none select-none top-4 right-4 rounded-full cursor-pointer flex items-center justify-center ring-offset-background focus:ring-ring bg-secondary h-8 w-8 text-foreground/70 hover:text-foreground focus:outline-hidden disabled:pointer-events-none active:scale-95 transition-all duration-200 ease-in-out z-[60] focus:outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2">
                  <lucide_solid_1.X class="h-4 w-4"/>
                  <span class="sr-only">Close</span>
                </button>

                  <div class="flex flex-col">
                    {/* Images Section */}
                    <div class="bg-primary px-5 pt-10 flex items-start justify-center">
                      <div class="relative w-full flex items-start justify-center pt-4">
                        {/* Container showing only top 70% of image (16/7 aspect ratio = 70% of 16/10) */}
                        <div class="relative w-full overflow-hidden rounded-t-lg border" style={{
                aspectRatio: "16/7",
                maxHeight: "126px"
            }}>
                          <div class="absolute inset-0" style={{
                height: "142.86%",
                top: 0
            }}>
                            <Image src={resolvedTheme() === "dark" ? "/agents-onboarding-dark.webp" : "/agents-onboarding-light.webp"} alt="Agents interface" fill class="object-cover" style={{ objectPosition: "top" }}/>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div class="p-5 space-y-2">
                      <h2 class="text-base font-semibold">
                        Welcome to Agents
                      </h2>
                      <p class="text-[13px] text-muted-foreground leading-relaxed">
                      This tool makes you significantly more productive in your
                      daily routine.
                      </p>

                      {/* Button - bottom right */}
                      <div class="flex justify-end pt-1">
                        <button_1.Button size="sm" onClick={handleClose} class="h-7 text-xs rounded-md">
                          Let's go
                        </button_1.Button>
                      </div>
                    </div>
                  </div>
              </div>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
