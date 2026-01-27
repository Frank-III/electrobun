"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDialog = AgentDialog;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var web_1 = require("solid-js/web");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var tool_selector_1 = require("./tool-selector");
function AgentDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, agent = _a.agent, onSuccess = _a.onSuccess;
    var _b = (0, solid_js_1.createSignal)(false), mounted = _b[0], setMounted = _b[1];
    var _c = (0, solid_js_1.createSignal)(null), portalTarget = _c[0], setPortalTarget = _c[1];
    // Form state
    var _d = (0, solid_js_1.createSignal)(""), name = _d[0], setName = _d[1];
    var _e = (0, solid_js_1.createSignal)(""), description = _e[0], setDescription = _e[1];
    var _f = (0, solid_js_1.createSignal)(""), prompt = _f[0], setPrompt = _f[1];
    var _g = (0, solid_js_1.createSignal)("inherit"), model = _g[0], setModel = _g[1];
    var _h = (0, solid_js_1.createSignal)("user"), source = _h[0], setSource = _h[1];
    var _j = (0, solid_js_1.createSignal)("all"), toolMode = _j[0], setToolMode = _j[1];
    var _k = (0, solid_js_1.createSignal)([]), selectedTools = _k[0], setSelectedTools = _k[1];
    var createMutation = trpc_1.trpc.agents.create.useMutation({ onSuccess: function () {
            onSuccess();
            resetForm();
        } });
    var updateMutation = trpc_1.trpc.agents.update.useMutation({ onSuccess: function () {
            onSuccess();
            resetForm();
        } });
    var isEditing = agent !== null;
    var isLoading = createMutation.isPending || updateMutation.isPending;
    // Initialize form when editing
    (0, solid_js_1.createEffect)(function () {
        if (agent) {
            setName(agent.name);
            setDescription(agent.description);
            setPrompt(agent.prompt);
            setModel(agent.model || "inherit");
            setSource(agent.source);
            if (agent.tools && agent.tools.length > 0) {
                setToolMode("allowlist");
                setSelectedTools(agent.tools);
            }
            else if (agent.disallowedTools && agent.disallowedTools.length > 0) {
                setToolMode("denylist");
                setSelectedTools(agent.disallowedTools);
            }
            else {
                setToolMode("all");
                setSelectedTools([]);
            }
        }
        else {
            resetForm();
        }
    });
    // Ensure portal target only accessed on client
    (0, solid_js_1.createEffect)(function () {
        setMounted(true);
        if (typeof document !== "undefined") {
            setPortalTarget(document.body);
        }
    });
    // Handle escape key
    (0, solid_js_1.createEffect)(function () {
        if (!open)
            return;
        var handleKeyDown = function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return function () { return document.removeEventListener("keydown", handleKeyDown); };
    });
    var resetForm = function () {
        setName("");
        setDescription("");
        setPrompt("");
        setModel("inherit");
        setSource("user");
        setToolMode("all");
        setSelectedTools([]);
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        var tools = toolMode === "allowlist" ? selectedTools : undefined;
        var disallowedTools = toolMode === "denylist" ? selectedTools : undefined;
        if (isEditing) {
            updateMutation.mutate({
                originalName: agent.name,
                name: name.toLowerCase().replace(/\s+/g, "-"),
                description: description,
                prompt: prompt,
                tools: tools,
                disallowedTools: disallowedTools,
                model: model,
                source: agent.source
            });
        }
        else {
            createMutation.mutate({
                name: name.toLowerCase().replace(/\s+/g, "-"),
                description: description,
                prompt: prompt,
                tools: tools,
                disallowedTools: disallowedTools,
                model: model,
                source: source
            });
        }
    };
    var isValid = name.trim() && description.trim() && prompt.trim();
    if (!mounted || !portalTarget || !open)
        return null;
    return (0, web_1.createPortal)(<react_1.AnimatePresence mode="wait">
      {open && <>
          {/* Overlay */}
          <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} class="fixed inset-0 z-[60] bg-black/50" onClick={function () { return onOpenChange(false); }}/>

          {/* Dialog */}
          <div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[65]">
            <react_1.motion.div initial={{
                scale: .95,
                opacity: 0
            }} animate={{
                scale: 1,
                opacity: 1
            }} exit={{
                scale: .95,
                opacity: 0
            }} transition={{ duration: .2 }} class="w-[90vw] max-w-[600px] max-h-[85vh] flex flex-col rounded-xl bg-background border border-border shadow-2xl overflow-hidden" role="dialog" aria-modal="true">
              {/* Header */}
              <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 class="text-lg font-semibold text-foreground">
                  {isEditing ? "Edit Agent" : "Create Agent"}
                </h2>
                <button onClick={function () { return onOpenChange(false); }} class="flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
                  <lucide_solid_1.X class="h-4 w-4"/>
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Name */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    Name <span class="text-red-500">*</span>
                  </label>
                  <input type="text" value={name} onChange={function (e) { return setName(e.target.value); }} placeholder="code-reviewer" class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
                  <p class="text-xs text-muted-foreground">
                    Will be converted to kebab-case (e.g., "code-reviewer")
                  </p>
                </div>

                {/* Description */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    Description <span class="text-red-500">*</span>
                  </label>
                  <input type="text" value={description} onChange={function (e) { return setDescription(e.target.value); }} placeholder="Reviews code for quality and best practices" class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
                  <p class="text-xs text-muted-foreground">
                    Tells Claude when to use this agent
                  </p>
                </div>

                {/* Prompt */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">
                    System Prompt <span class="text-red-500">*</span>
                  </label>
                  <textarea value={prompt} onChange={function (e) { return setPrompt(e.target.value); }} placeholder="You are an expert code reviewer. When invoked:

1. Analyze the code structure
2. Check for security issues
3. Suggest improvements" rows={8} class="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"/>
                  <p class="text-xs text-muted-foreground">
                    Instructions for the agent when it's invoked
                  </p>
                </div>

                {/* Model */}
                <div class="space-y-1.5">
                  <label class="text-sm font-medium text-foreground">Model</label>
                  <div class="flex flex-wrap gap-2">
                    {[
                "inherit",
                "sonnet",
                "opus",
                "haiku"
            ].map(function (m) { return <button key={m} type="button" onClick={function () { return setModel(m); }} class={(0, utils_1.cn)("px-3 py-1.5 text-sm rounded-md border transition-colors", model === m ? "border-foreground/30 bg-foreground/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/20")}>
                        {m === "inherit" ? "Inherit (default)" : m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>; })}
                  </div>
                </div>

                {/* Tools */}
                <div class="space-y-3">
                  <label class="text-sm font-medium text-foreground">Tools</label>
                  <div class="flex flex-wrap gap-2">
                    {[
                "all",
                "allowlist",
                "denylist"
            ].map(function (mode) { return <button key={mode} type="button" onClick={function () {
                    setToolMode(mode);
                    if (mode === "all")
                        setSelectedTools([]);
                }} class={(0, utils_1.cn)("px-3 py-1.5 text-sm rounded-md border transition-colors", toolMode === mode ? "border-foreground/30 bg-foreground/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/20")}>
                        {mode === "all" && "All Tools"}
                        {mode === "allowlist" && "Only Selected"}
                        {mode === "denylist" && "Except Selected"}
                      </button>; })}
                  </div>

                  {toolMode !== "all" && <tool_selector_1.ToolSelector selectedTools={selectedTools} onChange={setSelectedTools} mode={toolMode}/>}
                </div>

                {/* Source (only for new agents) */}
                {!isEditing && <div class="space-y-1.5">
                    <label class="text-sm font-medium text-foreground">Location</label>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" onClick={function () { return setSource("user"); }} class={(0, utils_1.cn)("px-3 py-1.5 text-sm rounded-md border transition-colors", source === "user" ? "border-foreground/30 bg-foreground/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/20")}>
                        User (~/.claude/agents/)
                      </button>
                      <button type="button" onClick={function () { return setSource("project"); }} class={(0, utils_1.cn)("px-3 py-1.5 text-sm rounded-md border transition-colors", source === "project" ? "border-foreground/30 bg-foreground/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/20")}>
                        Project (.claude/agents/)
                      </button>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      User agents are available globally, project agents only in the current project
                    </p>
                  </div>}
              </form>

              {/* Footer */}
              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button type="button" onClick={function () { return onOpenChange(false); }} class="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background text-foreground hover:bg-foreground/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!isValid || isLoading} class={(0, utils_1.cn)("px-4 py-2 text-sm font-medium rounded-md transition-colors", isValid && !isLoading ? "bg-foreground text-background hover:bg-foreground/90" : "bg-foreground/50 text-background/70 cursor-not-allowed")}>
                  {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Agent"}
                </button>
              </div>
            </react_1.motion.div>
          </div>
        </>}
    </react_1.AnimatePresence>, portalTarget);
}
