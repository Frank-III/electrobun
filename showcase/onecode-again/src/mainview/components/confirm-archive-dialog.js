"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmArchiveDialog = ConfirmArchiveDialog;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var button_1 = require("./ui/button");
var checkbox_1 = require("./ui/checkbox");
var EASING_CURVE = [
    .55,
    .055,
    .675,
    .19
];
var INTERACTION_DELAY_MS = 250;
function ConfirmArchiveDialog(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm, activeProcessCount = _a.activeProcessCount, hasWorktree = _a.hasWorktree, uncommittedCount = _a.uncommittedCount;
    var _b = (0, solid_js_1.createSignal)(false), mounted = _b[0], setMounted = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), deleteWorktree = _c[0], setDeleteWorktree = _c[1];
    var _d = (0, solid_js_1.createSignal)(0), openAtRef = _d[0], setOpenAtRef = _d[1];
    var _e = (0, solid_js_1.createSignal)(null), confirmButtonRef = _e[0], setConfirmButtonRef = _e[1];
    // Use ref to avoid re-registering keydown listener when checkbox changes
    var _f = (0, solid_js_1.createSignal)(deleteWorktree), deleteWorktreeRef = _f[0], setDeleteWorktreeRef = _f[1];
    deleteWorktreeRef.current = deleteWorktree;
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
    });
    (0, solid_js_1.createEffect)(function () {
        if (isOpen) {
            openAtRef.current = performance.now();
            // Reset checkbox when dialog opens
            setDeleteWorktree(false);
        }
    });
    var handleAnimationComplete = function () {
        var _a;
        if (isOpen) {
            (_a = confirmButtonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    var handleClose = function () {
        var canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
        if (!canInteract)
            return;
        onClose();
    };
    var handleConfirm = function () {
        var canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
        if (!canInteract)
            return;
        onConfirm(deleteWorktreeRef.current);
        onClose();
    };
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                handleClose();
            }
            if (event.key === "Enter") {
                event.preventDefault();
                handleConfirm();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    if (!mounted)
        return null;
    var portalTarget = typeof document !== "undefined" ? document.body : null;
    if (!portalTarget)
        return null;
    var hasProcesses = activeProcessCount > 0;
    var showWarning = deleteWorktree && uncommittedCount > 0;
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
            }} class="fixed inset-0 z-[45] bg-black/25" onClick={handleClose} style={{ pointerEvents: "auto" }} data-modal="confirm-archive-dialog"/>

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
            }} onAnimationComplete={handleAnimationComplete} class="w-[90vw] max-w-[400px] pointer-events-auto" onClick={function (e) { return e.stopPropagation(); }}>
              <div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
                <div class="p-6">
                  <h2 class="text-xl font-semibold mb-4">
                    Archive Workspace
                  </h2>

                  {/* Active processes warning */}
                  {hasProcesses && <p class="text-sm text-muted-foreground mb-4">
                      {activeProcessCount} running {activeProcessCount === 1 ? "process" : "processes"} will be stopped.
                    </p>}

                  {/* Worktree checkbox */}
                  {hasWorktree && <div class="space-y-2">
                      <label class="flex items-start gap-3 cursor-pointer">
                        <checkbox_1.Checkbox checked={deleteWorktree} onCheckedChange={function (checked) { return setDeleteWorktree(checked === true); }} class="mt-0.5"/>
                        <span class="text-sm select-none">
                          Delete worktree to free disk space
                        </span>
                      </label>

                      {/* Uncommitted changes warning */}
                      {showWarning && <p class="text-sm text-amber-600 dark:text-amber-500 ml-7">
                          {uncommittedCount} uncommitted {uncommittedCount === 1 ? "change" : "changes"} will be lost
                        </p>}
                    </div>}
                </div>

                {/* Footer with buttons */}
                <div class="bg-muted p-4 flex justify-between border-t border-border rounded-b-xl">
                  <button_1.Button onClick={handleClose} variant="ghost" class="rounded-md">
                    Cancel
                  </button_1.Button>
                  <button_1.Button ref={confirmButtonRef} onClick={handleConfirm} variant="default" class="rounded-md">
                    Archive
                  </button_1.Button>
                </div>
              </div>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
