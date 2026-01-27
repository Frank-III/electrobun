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
exports.ProjectSelector = ProjectSelector;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var atoms_1 = require("../../../lib/atoms");
var popover_1 = require("../../../components/ui/popover");
var command_1 = require("../../../components/ui/command");
var dialog_1 = require("../../../components/ui/dialog");
var input_1 = require("../../../components/ui/input");
var button_1 = require("../../../components/ui/button");
var icons_1 = require("../../../components/ui/icons");
var trpc_1 = require("../../../lib/trpc");
var atoms_2 = require("../atoms");
// Helper component to render project icon (avatar or folder)
function ProjectIcon(_a) {
    var gitOwner = _a.gitOwner, gitProvider = _a.gitProvider, _b = _a.className, className = _b === void 0 ? "h-4 w-4" : _b, _c = _a.isOffline, isOffline = _c === void 0 ? false : _c;
    var _d = (0, solid_js_1.createSignal)(false), isLoaded = _d[0], setIsLoaded = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), hasError = _e[0], setHasError = _e[1];
    var handleLoad = function () { return setIsLoaded(true); };
    var handleError = function () { return setHasError(true); };
    // In offline mode or on error, don't try to load remote images
    if (isOffline || hasError || !gitOwner || gitProvider !== "github") {
        return <lucide_solid_1.FolderOpen class={"".concat(className, " text-muted-foreground flex-shrink-0")}/>;
    }
    return <div class={"".concat(className, " relative flex-shrink-0")}>
      {/* Placeholder background while loading */}
      {!isLoaded && <div class="absolute inset-0 rounded-sm bg-muted"/>}
      <img src={"https://github.com/".concat(gitOwner, ".png?size=64")} alt={gitOwner} class={"".concat(className, " rounded-sm flex-shrink-0 ").concat(isLoaded ? "opacity-100" : "opacity-0")} onLoad={handleLoad} onError={handleError}/>
    </div>;
}
function ProjectSelector() {
    var _this = this;
    var _a = (0, jotai_1.useAtom)(atoms_2.selectedProjectAtom), selectedProject = _a[0], setSelectedProject = _a[1];
    var _b = (0, solid_js_1.createSignal)(false), open = _b[0], setOpen = _b[1];
    var _c = (0, solid_js_1.createSignal)(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), githubDialogOpen = _d[0], setGithubDialogOpen = _d[1];
    var _e = (0, solid_js_1.createSignal)(""), githubUrl = _e[0], setGithubUrl = _e[1];
    // Check if offline mode is enabled and if we're actually offline
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_1.showOfflineModeFeaturesAtom);
    var ollamaStatus = trpc_1.trpc.ollama.getStatus.useQuery(undefined, { enabled: showOfflineFeatures }).data;
    var isOffline = showOfflineFeatures && ollamaStatus ? !ollamaStatus.internet.online : false;
    // Fetch projects from DB
    var _f = trpc_1.trpc.projects.list.useQuery(), projects = _f.data, isLoadingProjects = _f.isLoading;
    // Filter projects by search query
    var filteredProjects = (0, solid_js_1.createMemo)(function () {
        if (!projects)
            return [];
        if (!searchQuery.trim())
            return projects;
        var query = searchQuery.toLowerCase();
        return projects.filter(function (p) { return p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query); });
    });
    // Get tRPC utils for cache management
    var utils = trpc_1.trpc.useUtils();
    // Open folder mutation
    var openFolder = trpc_1.trpc.projects.openFolder.useMutation({ onSuccess: function (project) {
            if (project) {
                // Optimistically update the projects list cache to prevent validation failures
                utils.projects.list.setData(undefined, function (oldData) {
                    if (!oldData)
                        return [project];
                    var exists = oldData.some(function (p) { return p.id === project.id; });
                    if (exists) {
                        return oldData.map(function (p) { return p.id === project.id ? __assign(__assign({}, p), { updatedAt: project.updatedAt }) : p; });
                    }
                    return __spreadArray([project], oldData, true);
                });
                setSelectedProject({
                    id: project.id,
                    name: project.name,
                    path: project.path,
                    gitRemoteUrl: project.gitRemoteUrl,
                    gitProvider: project.gitProvider,
                    gitOwner: project.gitOwner,
                    gitRepo: project.gitRepo
                });
            }
        } });
    // Clone from GitHub mutation
    var cloneFromGitHub = trpc_1.trpc.projects.cloneFromGitHub.useMutation({ onSuccess: function (project) {
            if (project) {
                utils.projects.list.setData(undefined, function (oldData) {
                    if (!oldData)
                        return [project];
                    var exists = oldData.some(function (p) { return p.id === project.id; });
                    if (exists) {
                        return oldData.map(function (p) { return p.id === project.id ? __assign(__assign({}, p), { updatedAt: project.updatedAt }) : p; });
                    }
                    return __spreadArray([project], oldData, true);
                });
                setSelectedProject({
                    id: project.id,
                    name: project.name,
                    path: project.path,
                    gitRemoteUrl: project.gitRemoteUrl,
                    gitProvider: project.gitProvider,
                    gitOwner: project.gitOwner,
                    gitRepo: project.gitRepo
                });
                setGithubDialogOpen(false);
                setGithubUrl("");
            }
        } });
    var handleOpenFolder = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setOpen(false);
                    return [4 /*yield*/, openFolder.mutateAsync()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleCloneFromGitHub = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!githubUrl.trim())
                        return [2 /*return*/];
                    return [4 /*yield*/, cloneFromGitHub.mutateAsync({ repoUrl: githubUrl.trim() })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSelectProject = function (projectId) {
        var project = projects === null || projects === void 0 ? void 0 : projects.find(function (p) { return p.id === projectId; });
        if (project) {
            setSelectedProject({
                id: project.id,
                name: project.name,
                path: project.path,
                gitRemoteUrl: project.gitRemoteUrl,
                gitProvider: project.gitProvider,
                gitOwner: project.gitOwner,
                gitRepo: project.gitRepo
            });
            setOpen(false);
        }
    };
    // Validate selected project still exists
    // While loading, trust localStorage value to prevent showing "Select repo" on app restart
    var validSelection = (0, solid_js_1.createMemo)(function () {
        if (!selectedProject)
            return null;
        // While loading, trust localStorage value
        if (isLoadingProjects)
            return selectedProject;
        // After loading, validate against DB
        if (!projects)
            return null;
        var exists = projects.some(function (p) { return p.id === selectedProject.id; });
        return exists ? selectedProject : null;
    });
    // If no projects exist and none selected - show direct "Add repository" button
    if (!validSelection && (!projects || projects.length === 0) && !isLoadingProjects) {
        return <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70">
        <icons_1.FolderPlusIcon class="h-3.5 w-3.5"/>
        <span>{openFolder.isPending ? "Adding..." : "Add repository"}</span>
      </button>;
    }
    return <>
    <popover_1.Popover open={open} onOpenChange={function (isOpen) {
            setOpen(isOpen);
            if (!isOpen)
                setSearchQuery("");
        }}>
      <popover_1.PopoverTrigger asChild>
        <button class="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-[background-color,color] duration-150 ease-out rounded-md hover:bg-muted/50 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70" type="button">
          <ProjectIcon gitOwner={validSelection === null || validSelection === void 0 ? void 0 : validSelection.gitOwner} gitProvider={validSelection === null || validSelection === void 0 ? void 0 : validSelection.gitProvider} isOffline={isOffline}/>
          <span class="truncate max-w-[120px]">
            {(validSelection === null || validSelection === void 0 ? void 0 : validSelection.name) || "Select repo"}
          </span>
          <icons_1.IconChevronDown class="h-3 w-3 shrink-0 opacity-50"/>
        </button>
      </popover_1.PopoverTrigger>
      <popover_1.PopoverContent class="w-64 p-0" align="start">
        <command_1.Command shouldFilter={false}>
          <command_1.CommandInput placeholder="Search repos..." value={searchQuery} onValueChange={setSearchQuery}/>
          <command_1.CommandList class="max-h-[300px] overflow-y-auto">
            {isLoadingProjects ? <div class="px-2.5 py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div> : filteredProjects.length > 0 ? <command_1.CommandGroup>
                {filteredProjects.map(function (project) {
                var isSelected = (validSelection === null || validSelection === void 0 ? void 0 : validSelection.id) === project.id;
                return <command_1.CommandItem key={project.id} value={"".concat(project.name, " ").concat(project.path)} onSelect={function () { return handleSelectProject(project.id); }} class="gap-2">
                      <ProjectIcon gitOwner={project.gitOwner} gitProvider={project.gitProvider} isOffline={isOffline}/>
                      <span class="truncate flex-1">{project.name}</span>
                      {isSelected && <icons_1.CheckIcon class="h-4 w-4 shrink-0"/>}
                    </command_1.CommandItem>;
            })}
              </command_1.CommandGroup> : <command_1.CommandEmpty>No projects found.</command_1.CommandEmpty>}
          </command_1.CommandList>
          <div class="border-t border-border/50 py-1">
            <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 w-[calc(100%-8px)] rounded-md text-sm cursor-default select-none outline-none dark:hover:bg-neutral-800 hover:text-foreground transition-colors">
              <icons_1.FolderPlusIcon class="h-4 w-4 text-muted-foreground"/>
              <span>{openFolder.isPending ? "Adding..." : "Add repository"}</span>
            </button>
            <button onClick={function () {
            setOpen(false);
            setGithubDialogOpen(true);
        }} class="flex items-center gap-1.5 min-h-[32px] py-[5px] px-1.5 mx-1 w-[calc(100%-8px)] rounded-md text-sm cursor-default select-none outline-none dark:hover:bg-neutral-800 hover:text-foreground transition-colors">
              <icons_1.GitHubIcon class="h-4 w-4 text-muted-foreground"/>
              <span>Add from GitHub</span>
            </button>
          </div>
        </command_1.Command>
      </popover_1.PopoverContent>
    </popover_1.Popover>

    <dialog_1.Dialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen}>
      <dialog_1.DialogContent class="w-[400px] p-0 gap-0 overflow-hidden">
        <form onSubmit={function (e) {
            e.preventDefault();
            handleCloneFromGitHub();
        }}>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">
              Clone from GitHub
            </h2>
            <input_1.Input placeholder="owner/repo or https://github.com/..." value={githubUrl} onChange={function (e) { return setGithubUrl(e.target.value); }} class="w-full h-11 text-sm" autoFocus/>
          </div>
          <div class="bg-muted p-4 flex justify-between border-t border-border">
            <button_1.Button type="button" onClick={function () { return setGithubDialogOpen(false); }} variant="ghost" class="rounded-md">
              Cancel
            </button_1.Button>
            <button_1.Button type="submit" disabled={!githubUrl.trim() || cloneFromGitHub.isPending} variant="default" class="rounded-md">
              {cloneFromGitHub.isPending ? "Cloning..." : "Clone"}
            </button_1.Button>
          </div>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
    </>;
}
