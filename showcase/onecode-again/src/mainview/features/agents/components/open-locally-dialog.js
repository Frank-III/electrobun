"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenLocallyDialog = OpenLocallyDialog;
var react_1 = require("motion/react");
var solid_js_1 = require("solid-js");
var web_1 = require("solid-js/web");
var button_1 = require("../../../components/ui/button");
var trpc_1 = require("../../../lib/trpc");
var solid_sonner_1 = require("solid-sonner");
var jotai_1 = require("../../../lib/state/jotai");
var atoms_1 = require("../atoms");
var atoms_2 = require("../../../lib/atoms");
var lucide_solid_1 = require("lucide-solid");
var agent_chat_store_1 = require("../stores/agent-chat-store");
var EASING_CURVE = [
    .55,
    .055,
    .675,
    .19
];
var INTERACTION_DELAY_MS = 250;
function OpenLocallyDialog(_a) {
    var _this = this;
    var _b;
    var isOpen = _a.isOpen, onClose = _a.onClose, remoteChat = _a.remoteChat, matchingProjects = _a.matchingProjects, allProjects = _a.allProjects, remoteSubChatId = _a.remoteSubChatId;
    var _c = (0, solid_js_1.createSignal)(false), mounted = _c[0], setMounted = _c[1];
    var _d = (0, solid_js_1.createSignal)(0), openAtRef = _d[0], setOpenAtRef = _d[1];
    var setSelectedChatId = (0, jotai_1.useSetAtom)(atoms_1.selectedAgentChatIdAtom);
    var setChatSourceMode = (0, jotai_1.useSetAtom)(atoms_2.chatSourceModeAtom);
    var utils = trpc_1.trpc.useUtils();
    // For multiple projects view
    var _e = (0, solid_js_1.createSignal)(null), selectedProjectId = _e[0], setSelectedProjectId = _e[1];
    // Mutations
    var locateMutation = trpc_1.trpc.projects.locateAndAddProject.useMutation();
    var importMutation = trpc_1.trpc.sandboxImport.importSandboxChat.useMutation({
        onSuccess: function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        solid_sonner_1.toast.success("Opened locally");
                        // 1. Clear stale Chat instances from cache
                        agent_chat_store_1.agentChatStore.clear();
                        // 2. Invalidate list queries
                        utils.chats.list.invalidate();
                        utils.projects.list.invalidate();
                        // 3. Prefetch: Wait for chat data to be in cache before switching
                        return [4 /*yield*/, utils.chats.get.fetch({ id: result.chatId })];
                    case 1:
                        // 3. Prefetch: Wait for chat data to be in cache before switching
                        _a.sent();
                        // 4. Now safe to switch - data is ready
                        setChatSourceMode("local");
                        setSelectedChatId(result.chatId);
                        onClose();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            solid_sonner_1.toast.error("Import failed: ".concat(error.message));
        }
    });
    var pickDestMutation = trpc_1.trpc.projects.pickCloneDestination.useMutation();
    var cloneMutation = trpc_1.trpc.sandboxImport.cloneFromSandbox.useMutation({
        onSuccess: function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        solid_sonner_1.toast.success("Cloned and opened locally");
                        // 1. Clear stale Chat instances from cache
                        agent_chat_store_1.agentChatStore.clear();
                        // 2. Invalidate list queries
                        utils.projects.list.invalidate();
                        utils.chats.list.invalidate();
                        // 3. Prefetch: Wait for chat data to be in cache before switching
                        return [4 /*yield*/, utils.chats.get.fetch({ id: result.chatId })];
                    case 1:
                        // 3. Prefetch: Wait for chat data to be in cache before switching
                        _a.sent();
                        // 4. Now safe to switch - data is ready
                        setChatSourceMode("local");
                        setSelectedChatId(result.chatId);
                        onClose();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            solid_sonner_1.toast.error("Clone failed: ".concat(error.message));
        }
    });
    var isAnyLoading = importMutation.isPending || locateMutation.isPending || pickDestMutation.isPending || cloneMutation.isPending;
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
    });
    (0, solid_js_1.createEffect)(function () {
        if (isOpen) {
            openAtRef.current = performance.now();
            setSelectedProjectId(null);
        }
    });
    // Keyboard support
    (0, solid_js_1.createEffect)(function () {
        if (!isOpen)
            return;
        var handleKeyDown = function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                var canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
                if (canInteract && !isAnyLoading) {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    var handleClose = function () {
        var canInteract = performance.now() - openAtRef.current > INTERACTION_DELAY_MS;
        if (!canInteract || isAnyLoading)
            return;
        onClose();
    };
    // Handler: Locate existing project
    var handleLocateProject = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, owner, repo, result;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = remoteChat === null || remoteChat === void 0 ? void 0 : remoteChat.meta) === null || _b === void 0 ? void 0 : _b.repository))
                        return [2 /*return*/];
                    _a = remoteChat.meta.repository.split("/"), owner = _a[0], repo = _a[1];
                    if (!owner || !repo)
                        return [2 /*return*/];
                    return [4 /*yield*/, locateMutation.mutateAsync({
                            expectedOwner: owner,
                            expectedRepo: repo
                        })];
                case 1:
                    result = _c.sent();
                    if (result.success && result.project) {
                        // Now import into this project
                        importMutation.mutate({
                            sandboxId: remoteChat.sandbox_id,
                            remoteChatId: remoteChat.id,
                            remoteSubChatId: remoteSubChatId !== null && remoteSubChatId !== void 0 ? remoteSubChatId : undefined,
                            projectId: result.project.id,
                            chatName: remoteChat.name
                        });
                    }
                    else if (result.reason === "wrong-repo") {
                        solid_sonner_1.toast.error("That folder is ".concat(result.found, ", not ").concat(owner, "/").concat(repo));
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // Handler: Clone from sandbox
    var handleCloneFromSandbox = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, repo, destResult;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = remoteChat === null || remoteChat === void 0 ? void 0 : remoteChat.meta) === null || _b === void 0 ? void 0 : _b.repository) || !remoteChat.sandbox_id)
                        return [2 /*return*/];
                    _a = remoteChat.meta.repository.split("/"), repo = _a[1];
                    if (!repo)
                        return [2 /*return*/];
                    return [4 /*yield*/, pickDestMutation.mutateAsync({ suggestedName: repo })];
                case 1:
                    destResult = _c.sent();
                    if (!destResult.success || !destResult.targetPath)
                        return [2 /*return*/];
                    // Clone
                    solid_sonner_1.toast.info("Cloning repository... this may take a while");
                    cloneMutation.mutate({
                        sandboxId: remoteChat.sandbox_id,
                        remoteChatId: remoteChat.id,
                        remoteSubChatId: remoteSubChatId !== null && remoteSubChatId !== void 0 ? remoteSubChatId : undefined,
                        chatName: remoteChat.name,
                        targetPath: destResult.targetPath
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    // Handler: Select project from list
    var handleSelectProject = function () {
        if (!selectedProjectId || !(remoteChat === null || remoteChat === void 0 ? void 0 : remoteChat.sandbox_id))
            return;
        importMutation.mutate({
            sandboxId: remoteChat.sandbox_id,
            remoteChatId: remoteChat.id,
            remoteSubChatId: remoteSubChatId !== null && remoteSubChatId !== void 0 ? remoteSubChatId : undefined,
            projectId: selectedProjectId,
            chatName: remoteChat.name
        });
    };
    if (!mounted)
        return null;
    var portalTarget = typeof document !== "undefined" ? document.body : null;
    if (!portalTarget)
        return null;
    var mode = matchingProjects.length === 0 ? "no-projects" : "multiple-projects";
    var repository = (_b = remoteChat === null || remoteChat === void 0 ? void 0 : remoteChat.meta) === null || _b === void 0 ? void 0 : _b.repository;
    return (0, web_1.createPortal)(<react_1.AnimatePresence mode="wait" initial={false}>
      {isOpen && remoteChat && <>
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
            }} class="fixed inset-0 z-[45] bg-black/25" onClick={handleClose} style={{ pointerEvents: "auto" }} data-modal="open-locally"/>

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
            }} class="w-[90vw] max-w-[400px] pointer-events-auto" onClick={function (e) { return e.stopPropagation(); }}>
              <div class="bg-background rounded-2xl border shadow-2xl overflow-hidden" data-canvas-dialog>
                {mode === "no-projects" ? <>
                    <div class="p-6">
                      <h2 class="text-lg font-semibold mb-2">Project not found locally</h2>
                      <p class="text-sm text-muted-foreground mb-5">
                        This sandbox is working on{" "}
                        <code class="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs">
                          {repository}
                        </code>
                        , but we couldn't find it on your machine.
                      </p>

                      <div class="space-y-2">
                        {/* Option 1: Locate existing clone */}
                        <button onClick={handleLocateProject} disabled={isAnyLoading} class="w-full p-3 rounded-lg text-left bg-muted/50 hover:bg-muted transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
                          <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-background border">
                              <lucide_solid_1.Folder class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"/>
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="text-sm font-medium">I have it cloned</div>
                              <div class="text-xs text-muted-foreground">
                                Point us to your local copy
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Option 2: Clone from sandbox */}
                        <button onClick={handleCloneFromSandbox} disabled={isAnyLoading} class="w-full p-3 rounded-lg text-left bg-muted/50 hover:bg-muted transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
                          <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-background border">
                              <lucide_solid_1.Download class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"/>
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="text-sm font-medium">Clone from sandbox</div>
                              <div class="text-xs text-muted-foreground">
                                Download the repository (may take a while)
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Loading indicator */}
                      {isAnyLoading && <div class="mt-4 text-xs text-muted-foreground text-center">
                          {locateMutation.isPending && "Opening folder picker..."}
                          {pickDestMutation.isPending && "Opening folder picker..."}
                          {importMutation.isPending && "Importing..."}
                          {cloneMutation.isPending && "Cloning repository..."}
                        </div>}
                    </div>

                    {/* Footer with Cancel */}
                    <div class="bg-muted/50 px-6 py-4 flex justify-end border-t border-border">
                      <button_1.Button variant="ghost" size="sm" onClick={handleClose} disabled={isAnyLoading}>
                        Cancel
                      </button_1.Button>
                    </div>
                  </> : <>
                    <div class="p-6">
                      <h2 class="text-lg font-semibold mb-2">Multiple copies found</h2>
                      <p class="text-sm text-muted-foreground mb-5">
                        You have{" "}
                        <code class="px-1.5 py-0.5 bg-muted rounded text-foreground text-xs">
                          {repository}
                        </code>{" "}
                        in multiple locations. Which one should we use?
                      </p>

                      <div class="space-y-2">
                        {matchingProjects.map(function (project) { return <button key={project.id} type="button" class={"w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ".concat(selectedProjectId === project.id ? "bg-muted ring-1 ring-primary" : "bg-muted/50 hover:bg-muted")} onClick={function () { return setSelectedProjectId(project.id); }}>
                            <div class={"w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ".concat(selectedProjectId === project.id ? "border-primary bg-primary" : "border-muted-foreground/30")}>
                              {selectedProjectId === project.id && <lucide_solid_1.Check class="w-2.5 h-2.5 text-primary-foreground"/>}
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="text-sm font-medium">{project.name}</div>
                              <div class="text-xs text-muted-foreground font-mono truncate">
                                {project.path}
                              </div>
                            </div>
                          </button>; })}
                      </div>
                    </div>

                    <div class="bg-muted/50 px-6 py-4 flex justify-between border-t border-border">
                      <button_1.Button variant="ghost" size="sm" onClick={handleClose} disabled={isAnyLoading}>
                        Cancel
                      </button_1.Button>
                      <button_1.Button size="sm" onClick={handleSelectProject} disabled={!selectedProjectId || isAnyLoading}>
                        {importMutation.isPending ? "Opening..." : "Open Locally"}
                      </button_1.Button>
                    </div>
                  </>}
              </div>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
