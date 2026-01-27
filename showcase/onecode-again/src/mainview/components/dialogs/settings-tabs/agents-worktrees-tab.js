"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsWorktreesTab = AgentsWorktreesTab;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var trpc_1 = require("../../../lib/trpc");
var button_1 = require("../../ui/button");
var input_1 = require("../../ui/input");
var label_1 = require("../../ui/label");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../ui/icons");
var select_1 = require("../../ui/select");
var solid_sonner_1 = require("solid-sonner");
var commands_1 = require("../../../features/agents/commands");
var atoms_1 = require("../../../lib/atoms");
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
function AgentsWorktreesTab() {
    var _a, _b, _c, _d;
    var isNarrowScreen = useIsNarrowScreen();
    // Get projects list
    var projects = trpc_1.trpc.projects.list.useQuery().data;
    var _e = (0, solid_js_1.createSignal)(null), selectedProjectId = _e[0], setSelectedProjectId = _e[1];
    // Get config for selected project
    var _f = trpc_1.trpc.worktreeConfig.get.useQuery({ projectId: selectedProjectId }, { enabled: !!selectedProjectId }), configData = _f.data, refetchConfig = _f.refetch;
    // Save mutation
    var saveMutation = trpc_1.trpc.worktreeConfig.save.useMutation({
        onSuccess: function () {
            solid_sonner_1.toast.success("Worktree config saved");
            refetchConfig();
        },
        onError: function (err) {
            solid_sonner_1.toast.error("Failed to save: ".concat(err.message));
        }
    });
    // For "Fill with AI" - create chat and close settings
    var setSettingsDialogOpen = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogOpenAtom);
    var setSelectedChatId = (0, jotai_1.useSetAtom)(atoms_1.selectedAgentChatIdAtom);
    var createChatMutation = trpc_1.trpc.chats.create.useMutation({ onSuccess: function (data) {
            setSettingsDialogOpen(false);
            setSelectedChatId(data.id);
        } });
    // Local state
    var _g = (0, solid_js_1.createSignal)("1code"), saveTarget = _g[0], setSaveTarget = _g[1];
    var _h = (0, solid_js_1.createSignal)([""]), commands = _h[0], setCommands = _h[1];
    var _j = (0, solid_js_1.createSignal)([]), unixCommands = _j[0], setUnixCommands = _j[1];
    var _k = (0, solid_js_1.createSignal)([]), windowsCommands = _k[0], setWindowsCommands = _k[1];
    var _l = (0, solid_js_1.createSignal)(false), showPlatformSpecific = _l[0], setShowPlatformSpecific = _l[1];
    // Auto-select first project
    (0, solid_js_1.createEffect)(function () {
        if (projects && projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    });
    // Sync from server data
    (0, solid_js_1.createEffect)(function () {
        if (configData) {
            if (configData.source === "cursor") {
                setSaveTarget("cursor");
            }
            else {
                setSaveTarget("1code");
            }
            if (configData.config) {
                // Generic commands
                var generic = configData.config["setup-worktree"];
                setCommands(Array.isArray(generic) ? __spreadArray(__spreadArray([], generic, true), [""], false) : generic ? [generic, ""] : [""]);
                // Platform-specific
                var unix = configData.config["setup-worktree-unix"];
                var win = configData.config["setup-worktree-windows"];
                setUnixCommands(Array.isArray(unix) ? unix : unix ? [unix] : []);
                setWindowsCommands(Array.isArray(win) ? win : win ? [win] : []);
                // Show platform section if any platform-specific commands exist
                if (unix || win) {
                    setShowPlatformSpecific(true);
                }
            }
            else {
                setCommands([""]);
                setUnixCommands([]);
                setWindowsCommands([]);
            }
        }
    });
    var handleSave = function () {
        if (!selectedProjectId)
            return;
        var config = {};
        var filteredCommands = commands.filter(function (c) { return c.trim(); });
        var filteredUnix = unixCommands.filter(function (c) { return c.trim(); });
        var filteredWin = windowsCommands.filter(function (c) { return c.trim(); });
        if (filteredCommands.length > 0) {
            config["setup-worktree"] = filteredCommands;
        }
        if (filteredUnix.length > 0) {
            config["setup-worktree-unix"] = filteredUnix;
        }
        if (filteredWin.length > 0) {
            config["setup-worktree-windows"] = filteredWin;
        }
        saveMutation.mutate({
            projectId: selectedProjectId,
            config: config,
            target: saveTarget
        });
    };
    var updateCommand = function (index, value, list, setter) {
        var newList = __spreadArray([], list, true);
        newList[index] = value;
        setter(newList);
    };
    var removeCommand = function (index, list, setter) {
        if (list.length <= 1)
            return;
        setter(list.filter(function (_, i) { return i !== index; }));
    };
    var addCommand = function (list, setter) {
        setter(__spreadArray(__spreadArray([], list, true), [""], false));
    };
    var selectedProject = projects === null || projects === void 0 ? void 0 : projects.find(function (p) { return p.id === selectedProjectId; });
    var cursorExists = (_c = (_b = (_a = configData === null || configData === void 0 ? void 0 : configData.available) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.exists) !== null && _c !== void 0 ? _c : false;
    return <div class="p-6 space-y-6">
      {/* Header */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Worktrees</h3>
          <p class="text-xs text-muted-foreground">
            Configure setup commands that run when a new worktree is created
          </p>
        </div>}

      {/* Project Selection */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Project</h4>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 flex items-center justify-between gap-6">
            <div class="flex-1">
              <label_1.Label class="text-sm font-medium">Select project</label_1.Label>
              <p class="text-xs text-muted-foreground">
                Choose which project to configure
              </p>
            </div>
            <div class="flex-shrink-0 w-64">
              <select_1.Select value={selectedProjectId !== null && selectedProjectId !== void 0 ? selectedProjectId : ""} onValueChange={setSelectedProjectId}>
                <select_1.SelectTrigger class="w-full">
                  <span class="text-sm truncate">
                    {(_d = selectedProject === null || selectedProject === void 0 ? void 0 : selectedProject.name) !== null && _d !== void 0 ? _d : "Select..."}
                  </span>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {projects === null || projects === void 0 ? void 0 : projects.map(function (p) { return <select_1.SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </select_1.SelectItem>; })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </div>
      </div>

      {selectedProjectId && <>
          {/* Config Location */}
          <div class="space-y-2">
            <div class="pb-2">
              <h4 class="text-sm font-medium text-foreground">
                Config Location
              </h4>
              {(configData === null || configData === void 0 ? void 0 : configData.path) && <p class="text-xs text-muted-foreground mt-1">
                  Using: {configData.path}
                </p>}
            </div>

            <div class="bg-background rounded-lg border border-border overflow-hidden">
              <div class="p-4 flex items-center justify-between gap-6">
                <div class="flex-1">
                  <label_1.Label class="text-sm font-medium">Save to</label_1.Label>
                  <p class="text-xs text-muted-foreground">
                    Where to save the configuration file
                  </p>
                </div>
                <div class="flex-shrink-0 w-auto min-w-56 max-w-80">
                  <select_1.Select value={saveTarget} onValueChange={function (v) { return setSaveTarget(v); }}>
                    <select_1.SelectTrigger class="w-full">
                      <span class="text-sm font-mono truncate">
                        {saveTarget === "cursor" ? ".cursor/worktrees.json" : ".1code/worktree.json"}
                      </span>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="1code">
                        .1code/worktree.json
                      </select_1.SelectItem>
                      {cursorExists && <select_1.SelectItem value="cursor">
                          .cursor/worktrees.json
                        </select_1.SelectItem>}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Commands - Main */}
          <div class="space-y-2">
            <div class="pb-2 flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-foreground">
                  Setup Commands
                </h4>
                <p class="text-xs text-muted-foreground mt-1">
                  Commands run in the worktree after creation
                </p>
              </div>
              <button_1.Button variant="ghost" size="sm" class="gap-1.5" onClick={function () {
                var prompt = commands_1.COMMAND_PROMPTS["worktree-setup"];
                if (prompt && selectedProjectId) {
                    createChatMutation.mutate({
                        projectId: selectedProjectId,
                        name: "Worktree Setup",
                        initialMessageParts: [{
                                type: "text",
                                text: prompt
                            }],
                        useWorktree: false,
                        mode: "agent"
                    });
                }
            }} disabled={!selectedProjectId || createChatMutation.isPending}>
                <icons_1.AIPenIcon class="h-3.5 w-3.5"/>
                Fill with AI
              </button_1.Button>
            </div>

            <div class="bg-background rounded-lg border border-border overflow-hidden">
              <div class="p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <label_1.Label class="text-sm font-medium">All Platforms</label_1.Label>
                  <span class="text-xs text-muted-foreground">
                    use <code class="font-mono bg-muted px-1 py-0.5 rounded">$ROOT_WORKTREE_PATH</code> for main repo path
                  </span>
                </div>
                <div class="space-y-2">
                  {commands.map(function (cmd, i) { return <div key={i} class="flex items-center gap-2">
                      <input_1.Input value={cmd} onChange={function (e) { return updateCommand(i, e.target.value, commands, setCommands); }} placeholder="bun install && cp $ROOT_WORKTREE_PATH/.env .env" class="flex-1 font-mono text-sm"/>
                      {commands.length > 1 && <button_1.Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={function () { return removeCommand(i, commands, setCommands); }}>
                          <lucide_solid_1.Trash2 class="h-4 w-4"/>
                        </button_1.Button>}
                    </div>; })}
                </div>
                <button_1.Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground" onClick={function () { return addCommand(commands, setCommands); }}>
                  <lucide_solid_1.Plus class="h-3.5 w-3.5"/>
                  Add command
                </button_1.Button>
              </div>

              {/* Platform-specific toggle */}
              <div class="border-t">
                <button type="button" class="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={function () { return setShowPlatformSpecific(!showPlatformSpecific); }}>
                  <span>Platform-specific overrides</span>
                  <lucide_solid_1.ChevronDown class={"h-4 w-4 transition-transform ".concat(showPlatformSpecific ? "rotate-180" : "")}/>
                </button>

                {showPlatformSpecific && <div class="p-4 pt-0 space-y-4">
                    {/* Unix Commands */}
                    <div class="space-y-2">
                      <span class="text-xs font-medium text-muted-foreground">
                        macOS / Linux
                      </span>
                      {unixCommands.length === 0 ? <p class="text-xs text-muted-foreground/60 italic">
                          Falls back to "All Platforms"
                        </p> : <div class="space-y-2">
                          {unixCommands.map(function (cmd, i) { return <div key={i} class="flex items-center gap-2">
                              <input_1.Input value={cmd} onChange={function (e) { return updateCommand(i, e.target.value, unixCommands, setUnixCommands); }} placeholder="bun install" class="flex-1 font-mono text-sm"/>
                              <button_1.Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={function () { return removeCommand(i, unixCommands, setUnixCommands); }}>
                                <lucide_solid_1.Trash2 class="h-4 w-4"/>
                              </button_1.Button>
                            </div>; })}
                        </div>}
                      <button_1.Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={function () { return addCommand(unixCommands, setUnixCommands); }}>
                        <lucide_solid_1.Plus class="h-3 w-3"/>
                        Add
                      </button_1.Button>
                    </div>

                    {/* Windows Commands */}
                    <div class="space-y-2">
                      <span class="text-xs font-medium text-muted-foreground">
                        Windows
                      </span>
                      {windowsCommands.length === 0 ? <p class="text-xs text-muted-foreground/60 italic">
                          Falls back to "All Platforms"
                        </p> : <div class="space-y-2">
                          {windowsCommands.map(function (cmd, i) { return <div key={i} class="flex items-center gap-2">
                              <input_1.Input value={cmd} onChange={function (e) { return updateCommand(i, e.target.value, windowsCommands, setWindowsCommands); }} placeholder="npm ci" class="flex-1 font-mono text-sm"/>
                              <button_1.Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={function () { return removeCommand(i, windowsCommands, setWindowsCommands); }}>
                                <lucide_solid_1.Trash2 class="h-4 w-4"/>
                              </button_1.Button>
                            </div>; })}
                        </div>}
                      <button_1.Button variant="ghost" size="sm" class="gap-1.5 text-muted-foreground h-7 text-xs" onClick={function () { return addCommand(windowsCommands, setWindowsCommands); }}>
                        <lucide_solid_1.Plus class="h-3 w-3"/>
                        Add
                      </button_1.Button>
                    </div>
                  </div>}
              </div>

              <div class="bg-muted p-3 flex justify-end gap-2 border-t">
                <button_1.Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </button_1.Button>
              </div>
            </div>
          </div>
        </>}
    </div>;
}
