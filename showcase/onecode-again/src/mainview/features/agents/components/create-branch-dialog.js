"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBranchDialog = CreateBranchDialog;
var solid_js_1 = require("solid-js");
var solid_sonner_1 = require("solid-sonner");
var lucide_solid_1 = require("lucide-solid");
var dialog_1 = require("../../../components/ui/dialog");
var button_1 = require("../../../components/ui/button");
var input_1 = require("../../../components/ui/input");
var label_1 = require("../../../components/ui/label");
var popover_1 = require("@kobalte/core/popover");
var command_1 = require("../../../components/ui/command");
var icons_1 = require("../../../components/ui/icons");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var format_time_ago_1 = require("../utils/format-time-ago");
function CreateBranchDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, projectPath = _a.projectPath, branches = _a.branches, defaultBranch = _a.defaultBranch, onBranchCreated = _a.onBranchCreated;
    var _b = (0, solid_js_1.createSignal)(""), branchName = _b[0], setBranchName = _b[1];
    var _c = (0, solid_js_1.createSignal)(defaultBranch), baseBranch = _c[0], setBaseBranch = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), baseBranchOpen = _d[0], setBaseBranchOpen = _d[1];
    var _e = (0, solid_js_1.createSignal)(""), baseBranchSearch = _e[0], setBaseBranchSearch = _e[1];
    // Reset baseBranch when defaultBranch changes
    (0, solid_js_1.createEffect)(function () {
        setBaseBranch(defaultBranch);
    });
    // Reset search when popover closes
    (0, solid_js_1.createEffect)(function () {
        if (!baseBranchOpen) {
            setBaseBranchSearch("");
        }
    });
    // Filter branches based on search (limit to 50 for performance)
    var filteredBaseBranches = (0, solid_js_1.createMemo)(function () {
        var filtered = branches;
        if (baseBranchSearch.trim()) {
            var search_1 = baseBranchSearch.toLowerCase();
            filtered = branches.filter(function (b) { return b.name.toLowerCase().includes(search_1); });
        }
        return filtered.slice(0, 50);
    });
    var utils = trpc_1.trpc.useUtils();
    var createBranchMutation = trpc_1.trpc.changes.createBranch.useMutation({
        onSuccess: function (data) {
            solid_sonner_1.toast.success("Branch '".concat(data.branchName, "' created successfully"));
            // Invalidate branches query to refresh the list
            utils.changes.getBranches.invalidate({ worktreePath: projectPath });
            onBranchCreated(data.branchName);
            onOpenChange(false);
            setBranchName("");
            setBaseBranch(defaultBranch);
        },
        onError: function (error) {
            solid_sonner_1.toast.error("Failed to create branch: ".concat(error.message));
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!branchName.trim()) {
            solid_sonner_1.toast.error("Branch name is required");
            return;
        }
        // Basic validation for branch name
        if (!/^[a-zA-Z0-9._/-]+$/.test(branchName)) {
            solid_sonner_1.toast.error("Branch name can only contain letters, numbers, dots, hyphens, underscores, and slashes");
            return;
        }
        createBranchMutation.mutate({
            projectPath: projectPath,
            branchName: branchName.trim(),
            baseBranch: baseBranch
        });
    };
    return <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.CanvasDialogContent class="sm:max-w-[350px] overflow-visible">
        <dialog_1.CanvasDialogHeader>
          <dialog_1.DialogTitle>Create a Branch</dialog_1.DialogTitle>
        </dialog_1.CanvasDialogHeader>

        <dialog_1.CanvasDialogBody class="space-y-4">
          {/* Branch Name Input */}
          <div class="space-y-2">
            <label_1.Label for="branch-name" class="text-sm">
              Name
            </label_1.Label>
            <input_1.Input id="branch-name" placeholder="feature/my-new-feature" value={branchName} onChange={function (e) { return setBranchName(e.target.value); }} onKeyDown={function (e) {
            if (e.key === "Enter" && branchName.trim() && !createBranchMutation.isPending) {
                e.preventDefault();
                handleSubmit(e);
            }
        }} autoFocus disabled={createBranchMutation.isPending} class="h-9"/>
          </div>

          {/* Base Branch Selection with Search */}
          <div class="space-y-2">
            <label_1.Label class="text-sm">Create branch based on...</label_1.Label>
            {/* Using Popover WITHOUT Portal so it renders inside Dialog's DOM tree */}
            <popover_1.Popover open={baseBranchOpen()} onOpenChange={setBaseBranchOpen} gutter={4}>
              <popover_1.Popover.Trigger class={(0, utils_1.cn)("flex h-9 w-full items-center justify-between gap-2 rounded-[10px] border border-input bg-background px-3 py-2 text-sm shadow-sm", "hover:bg-accent hover:text-accent-foreground", "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", "disabled:cursor-not-allowed disabled:opacity-50")} disabled={createBranchMutation.isPending}>
                  <span class="truncate">{baseBranch()}</span>
                  <lucide_solid_1.ChevronDown class="h-4 w-4 shrink-0 opacity-50"/>
              </popover_1.Popover.Trigger>
              {/* NO Portal wrapper - content renders inside Dialog */}
              <popover_1.Popover.Content class="z-50 w-full rounded-[10px] bg-popover p-0 text-sm text-popover-foreground shadow-lg border border-border outline-none dark data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95">
                <command_1.Command>
                  <command_1.CommandInput placeholder="Search branches..." value={baseBranchSearch} onValueChange={setBaseBranchSearch}/>
                  <command_1.CommandList class="max-h-[200px]">
                    {filteredBaseBranches.length === 0 ? <command_1.CommandEmpty>No branches found.</command_1.CommandEmpty> : <command_1.CommandGroup>
                        {filteredBaseBranches.map(function (branch) { return <command_1.CommandItem key={branch.name} value={branch.name} onSelect={function () {
                    setBaseBranch(branch.name);
                    setBaseBranchOpen(false);
                }} class="gap-2 cursor-pointer">
                            <lucide_solid_1.GitBranch class="h-4 w-4 text-muted-foreground shrink-0"/>
                            <span class="truncate flex-1">{branch.name}</span>
                            {branch.committedAt && <span class="text-xs text-muted-foreground/70 shrink-0">
                                {(0, format_time_ago_1.formatTimeAgo)(branch.committedAt)}
                              </span>}
                            {baseBranch === branch.name && <lucide_solid_1.Check class="h-4 w-4 shrink-0"/>}
                          </command_1.CommandItem>; })}
                      </command_1.CommandGroup>}
                  </command_1.CommandList>
                </command_1.Command>
              </popover_1.Popover.Content>
            </popover_1.Popover>
          </div>
        </dialog_1.CanvasDialogBody>

        <dialog_1.CanvasDialogFooter>
          <button_1.Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }} disabled={createBranchMutation.isPending} class="transition-transform duration-150 active:scale-[0.97] rounded-md">
            Cancel
          </button_1.Button>
          <button_1.Button type="button" onClick={function (e) { return handleSubmit(e); }} disabled={!branchName.trim() || createBranchMutation.isPending} class="transition-transform duration-150 active:scale-[0.97] rounded-md">
            {createBranchMutation.isPending ? <>
                <icons_1.IconSpinner class="w-4 h-4 mr-2"/>
                Creating...
              </> : "Create Branch"}
          </button_1.Button>
        </dialog_1.CanvasDialogFooter>
      </dialog_1.CanvasDialogContent>
    </dialog_1.Dialog>;
}
