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
exports.SelectRepoPage = SelectRepoPage;
var solid_js_1 = require("solid-js");
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../components/ui/icons");
var logo_1 = require("../../components/ui/logo");
var input_1 = require("../../components/ui/input");
var trpc_1 = require("../../lib/trpc");
var atoms_1 = require("../agents/atoms");
function SelectRepoPage() {
    var _this = this;
    var _a = (0, jotai_1.useAtom)(atoms_1.selectedProjectAtom), setSelectedProject = _a[1];
    var _b = (0, solid_js_1.createSignal)(false), showClonePage = _b[0], setShowClonePage = _b[1];
    var _c = (0, solid_js_1.createSignal)(""), githubUrl = _c[0], setGithubUrl = _c[1];
    // Get tRPC utils for cache management
    var utils = trpc_1.trpc.useUtils();
    // Open folder mutation
    var openFolder = trpc_1.trpc.projects.openFolder.useMutation({ onSuccess: function (project) {
            if (project) {
                // Optimistically update the projects list cache
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
                setShowClonePage(false);
                setGithubUrl("");
            }
        } });
    var handleOpenFolder = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openFolder.mutateAsync()];
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
    var handleBack = function () {
        if (cloneFromGitHub.isPending)
            return;
        setShowClonePage(false);
        setGithubUrl("");
    };
    // Clone from GitHub page
    if (showClonePage) {
        return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        {/* Draggable title bar area */}
        <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

        {/* Back button */}
        <button onClick={handleBack} disabled={cloneFromGitHub.isPending} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors disabled:opacity-50">
          <lucide_solid_1.ChevronLeft class="h-5 w-5"/>
        </button>

        <div class="w-full max-w-[440px] space-y-8 px-4">
          {/* Header with dual icons */}
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <logo_1.Logo class="w-5 h-5" fill="white"/>
              </div>
              <div class="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                <icons_1.GitHubIcon class="w-5 h-5 text-background"/>
              </div>
            </div>
            <div class="space-y-1">
              <h1 class="text-base font-semibold tracking-tight">
                Clone from GitHub
              </h1>
              <p class="text-sm text-muted-foreground">
                Enter a repository URL or owner/repo
              </p>
            </div>
          </div>

          {/* Input */}
          <div class="space-y-4">
            <div class="relative">
              <input_1.Input value={githubUrl} onChange={function (e) { return setGithubUrl(e.target.value); }} onKeyDown={function (e) {
                if (e.key === "Enter" && githubUrl.trim()) {
                    handleCloneFromGitHub();
                }
            }} placeholder="owner/repo" class="text-center pr-10" autoFocus disabled={cloneFromGitHub.isPending}/>
              {cloneFromGitHub.isPending && <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <icons_1.IconSpinner class="h-4 w-4"/>
                </div>}
            </div>
            <p class="text-xs text-muted-foreground text-center">
              Example: facebook/react or https://github.com/facebook/react
            </p>
          </div>
        </div>
      </div>;
    }
    // Main select repo page
    return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

      <div class="w-full max-w-[440px] space-y-8 px-4">
        {/* Header */}
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mx-auto w-max">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <logo_1.Logo class="w-6 h-6" fill="white"/>
            </div>
          </div>
          <div class="space-y-1">
            <h1 class="text-base font-semibold tracking-tight">
              Select a repository
            </h1>
            <p class="text-sm text-muted-foreground">
              Choose a local folder to start working with
            </p>
          </div>
        </div>

        {/* Content */}
        <div class="space-y-3">
          <button onClick={handleOpenFolder} disabled={openFolder.isPending} class="w-full h-8 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {openFolder.isPending ? <icons_1.IconSpinner class="h-4 w-4"/> : "Select folder"}
          </button>
          <button onClick={function () { return setShowClonePage(true); }} disabled={cloneFromGitHub.isPending} class="w-full h-8 px-4 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {cloneFromGitHub.isPending ? <icons_1.IconSpinner class="h-4 w-4"/> : "Clone from GitHub"}
          </button>
        </div>
      </div>
    </div>;
}
