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
exports.AgentsModelsTab = AgentsModelsTab;
var jotai_1 = require("../../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var solid_sonner_1 = require("solid-sonner");
var atoms_1 = require("../../../lib/atoms");
var trpc_1 = require("../../../lib/trpc");
var badge_1 = require("../../ui/badge");
var button_1 = require("../../ui/button");
var dropdown_menu_1 = require("../../ui/dropdown-menu");
var input_1 = require("../../ui/input");
var label_1 = require("../../ui/label");
// Hook to detect narrow screen
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
var EMPTY_CONFIG = {
    model: "",
    token: "",
    baseUrl: ""
};
// Account row component
function AccountRow(_a) {
    var account = _a.account, isActive = _a.isActive, onSetActive = _a.onSetActive, onRename = _a.onRename, onRemove = _a.onRemove, isLoading = _a.isLoading;
    return <div class="flex items-center justify-between p-3 hover:bg-muted/50">
      <div class="flex items-center gap-3">
        <div>
          <div class="text-sm font-medium">
            {account.displayName || "Anthropic Account"}
          </div>
          {account.email && <div class="text-xs text-muted-foreground">{account.email}</div>}
          {!account.email && account.connectedAt && <div class="text-xs text-muted-foreground">
              Connected{" "}
              {new Date(account.connectedAt).toLocaleDateString(undefined, { dateStyle: "short" })}
            </div>}
        </div>
      </div>

      <div class="flex items-center gap-2">
        {!isActive && <button_1.Button size="sm" variant="ghost" onClick={onSetActive} disabled={isLoading}>
            Switch
          </button_1.Button>}
        {isActive && <badge_1.Badge variant="secondary" class="text-xs">
            Active
          </badge_1.Badge>}
        <dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button size="icon" variant="ghost" class="h-7 w-7">
              <lucide_solid_1.MoreHorizontal class="h-4 w-4"/>
            </button_1.Button>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end">
            <dropdown_menu_1.DropdownMenuItem onClick={onRename}>Rename</dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400" onClick={onRemove}>
              Remove
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>
      </div>
    </div>;
}
// Anthropic accounts section component
function AnthropicAccountsSection() {
    var _this = this;
    var _a = trpc_1.trpc.anthropicAccounts.list.useQuery(undefined, {
        refetchOnMount: true,
        staleTime: 0
    }), accounts = _a.data, isAccountsLoading = _a.isLoading, refetchList = _a.refetch;
    var _b = trpc_1.trpc.anthropicAccounts.getActive.useQuery(undefined, {
        refetchOnMount: true,
        staleTime: 0
    }), activeAccount = _b.data, refetchActive = _b.refetch;
    var claudeCodeIntegration = trpc_1.trpc.claudeCode.getIntegration.useQuery().data;
    var trpcUtils = trpc_1.trpc.useUtils();
    // Auto-migrate legacy account if needed
    var migrateLegacy = trpc_1.trpc.anthropicAccounts.migrateLegacy.useMutation({ onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, refetchList()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refetchActive()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); } });
    // Trigger migration if: no accounts, not loading, has legacy connection, not already migrating
    (0, solid_js_1.createEffect)(function () {
        if (!isAccountsLoading && (accounts === null || accounts === void 0 ? void 0 : accounts.length) === 0 && (claudeCodeIntegration === null || claudeCodeIntegration === void 0 ? void 0 : claudeCodeIntegration.isConnected) && !migrateLegacy.isPending && !migrateLegacy.isSuccess) {
            migrateLegacy.mutate();
        }
    });
    var setActiveMutation = trpc_1.trpc.anthropicAccounts.setActive.useMutation({
        onSuccess: function () {
            trpcUtils.anthropicAccounts.list.invalidate();
            trpcUtils.anthropicAccounts.getActive.invalidate();
            trpcUtils.claudeCode.getIntegration.invalidate();
            solid_sonner_1.toast.success("Account switched");
        },
        onError: function (err) {
            solid_sonner_1.toast.error("Failed to switch account: ".concat(err.message));
        }
    });
    var renameMutation = trpc_1.trpc.anthropicAccounts.rename.useMutation({
        onSuccess: function () {
            trpcUtils.anthropicAccounts.list.invalidate();
            trpcUtils.anthropicAccounts.getActive.invalidate();
            solid_sonner_1.toast.success("Account renamed");
        },
        onError: function (err) {
            solid_sonner_1.toast.error("Failed to rename account: ".concat(err.message));
        }
    });
    var removeMutation = trpc_1.trpc.anthropicAccounts.remove.useMutation({
        onSuccess: function () {
            trpcUtils.anthropicAccounts.list.invalidate();
            trpcUtils.anthropicAccounts.getActive.invalidate();
            trpcUtils.claudeCode.getIntegration.invalidate();
            solid_sonner_1.toast.success("Account removed");
        },
        onError: function (err) {
            solid_sonner_1.toast.error("Failed to remove account: ".concat(err.message));
        }
    });
    var handleRename = function (accountId, currentName) {
        var newName = window.prompt("Enter new name for this account:", currentName || "Anthropic Account");
        if (newName && newName.trim()) {
            renameMutation.mutate({
                accountId: accountId,
                displayName: newName.trim()
            });
        }
    };
    var handleRemove = function (accountId, displayName) {
        var confirmed = window.confirm("Are you sure you want to remove \"".concat(displayName || "this account", "\"? You will need to re-authenticate to use it again."));
        if (confirmed) {
            removeMutation.mutate({ accountId: accountId });
        }
    };
    var isLoading = setActiveMutation.isPending || renameMutation.isPending || removeMutation.isPending;
    // Don't show section if no accounts
    if (!isAccountsLoading && (!accounts || accounts.length === 0)) {
        return null;
    }
    return <div class="bg-background rounded-lg border border-border overflow-hidden divide-y divide-border">
        {isAccountsLoading ? <div class="p-4 text-center text-sm text-muted-foreground">
            Loading accounts...
          </div> : accounts === null || accounts === void 0 ? void 0 : accounts.map(function (account) { return <AccountRow key={account.id} account={account} isActive={(activeAccount === null || activeAccount === void 0 ? void 0 : activeAccount.id) === account.id} onSetActive={function () { return setActiveMutation.mutate({ accountId: account.id }); }} onRename={function () { return handleRename(account.id, account.displayName); }} onRemove={function () { return handleRemove(account.id, account.displayName); }} isLoading={isLoading}/>; })}
    </div>;
}
function AgentsModelsTab() {
    var _this = this;
    var _a = (0, jotai_1.useAtom)(atoms_1.customClaudeConfigAtom), storedConfig = _a[0], setStoredConfig = _a[1];
    var _b = (0, solid_js_1.createSignal)(storedConfig.model), model = _b[0], setModel = _b[1];
    var _c = (0, solid_js_1.createSignal)(storedConfig.baseUrl), baseUrl = _c[0], setBaseUrl = _c[1];
    var _d = (0, solid_js_1.createSignal)(storedConfig.token), token = _d[0], setToken = _d[1];
    var setAnthropicOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_1.anthropicOnboardingCompletedAtom);
    var setSettingsOpen = (0, jotai_1.useSetAtom)(atoms_1.agentsSettingsDialogOpenAtom);
    var isNarrowScreen = useIsNarrowScreen();
    var disconnectClaudeCode = trpc_1.trpc.claudeCode.disconnect.useMutation();
    var _e = trpc_1.trpc.claudeCode.getIntegration.useQuery(), claudeCodeIntegration = _e.data, isClaudeCodeLoading = _e.isLoading;
    var isClaudeCodeConnected = claudeCodeIntegration === null || claudeCodeIntegration === void 0 ? void 0 : claudeCodeIntegration.isConnected;
    // OpenAI API key state
    var _f = (0, jotai_1.useAtom)(atoms_1.openaiApiKeyAtom), storedOpenAIKey = _f[0], setStoredOpenAIKey = _f[1];
    var _g = (0, solid_js_1.createSignal)(storedOpenAIKey), openaiKey = _g[0], setOpenaiKey = _g[1];
    var setOpenAIKeyMutation = trpc_1.trpc.voice.setOpenAIKey.useMutation();
    var trpcUtils = trpc_1.trpc.useUtils();
    (0, solid_js_1.createEffect)(function () {
        setModel(storedConfig.model);
        setBaseUrl(storedConfig.baseUrl);
        setToken(storedConfig.token);
    });
    (0, solid_js_1.createEffect)(function () {
        setOpenaiKey(storedOpenAIKey);
    });
    var trimmedModel = model.trim();
    var trimmedBaseUrl = baseUrl.trim();
    var trimmedToken = token.trim();
    var canSave = Boolean(trimmedModel && trimmedBaseUrl && trimmedToken);
    var canReset = Boolean(trimmedModel || trimmedBaseUrl || trimmedToken);
    var handleSave = function () {
        if (!canSave) {
            solid_sonner_1.toast.error("Fill model, token, and base URL to save");
            return;
        }
        var nextConfig = {
            model: trimmedModel,
            token: trimmedToken,
            baseUrl: trimmedBaseUrl
        };
        setStoredConfig(nextConfig);
        solid_sonner_1.toast.success("Model settings saved");
    };
    var handleReset = function () {
        setStoredConfig(EMPTY_CONFIG);
        setModel("");
        setBaseUrl("");
        setToken("");
        solid_sonner_1.toast.success("Model settings reset");
    };
    var handleClaudeCodeSetup = function () {
        disconnectClaudeCode.mutate();
        setSettingsOpen(false);
        setAnthropicOnboardingCompleted(false);
    };
    // OpenAI key handlers
    var trimmedOpenAIKey = openaiKey.trim();
    var canSaveOpenAI = trimmedOpenAIKey !== storedOpenAIKey;
    var canResetOpenAI = !!trimmedOpenAIKey;
    var handleSaveOpenAI = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (trimmedOpenAIKey && !trimmedOpenAIKey.startsWith("sk-")) {
                        solid_sonner_1.toast.error("Invalid OpenAI API key format. Key should start with 'sk-'");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, setOpenAIKeyMutation.mutateAsync({ key: trimmedOpenAIKey })];
                case 2:
                    _a.sent();
                    setStoredOpenAIKey(trimmedOpenAIKey);
                    // Invalidate voice availability check
                    return [4 /*yield*/, trpcUtils.voice.isAvailable.invalidate()];
                case 3:
                    // Invalidate voice availability check
                    _a.sent();
                    solid_sonner_1.toast.success("OpenAI API key saved");
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    solid_sonner_1.toast.error("Failed to save OpenAI API key");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleResetOpenAI = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, setOpenAIKeyMutation.mutateAsync({ key: "" })];
                case 1:
                    _a.sent();
                    setStoredOpenAIKey("");
                    setOpenaiKey("");
                    return [4 /*yield*/, trpcUtils.voice.isAvailable.invalidate()];
                case 2:
                    _a.sent();
                    solid_sonner_1.toast.success("OpenAI API key removed");
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    solid_sonner_1.toast.error("Failed to remove OpenAI API key");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return <div class="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Models</h3>
          <p class="text-xs text-muted-foreground">
            Configure model overrides and Claude Code authentication
          </p>
        </div>}

      {/* Anthropic Accounts Section */}
      <div class="space-y-2">
        <div class="pb-2 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-foreground">
              Anthropic Accounts
            </h4>
            <p class="text-xs text-muted-foreground">
              Manage your Claude API accounts
            </p>
          </div>
          <button_1.Button size="sm" variant="outline" onClick={handleClaudeCodeSetup} disabled={disconnectClaudeCode.isPending || isClaudeCodeLoading}>
            <lucide_solid_1.Plus class="h-3 w-3 mr-1"/>
            {isClaudeCodeConnected ? "Add" : "Connect"}
          </button_1.Button>
        </div>

        <AnthropicAccountsSection />
      </div>

      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">
            Override Model
          </h4>
        </div>
        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 space-y-6">

          <div class="flex items-center justify-between gap-6">
            <div class="flex-1">
              <label_1.Label class="text-sm font-medium">Model name</label_1.Label>
              <p class="text-xs text-muted-foreground">
                Model identifier to use for requests
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <input_1.Input value={model} onChange={function (e) { return setModel(e.target.value); }} class="w-full" placeholder="claude-3-7-sonnet-20250219"/>
            </div>
          </div>

          <div class="flex items-center justify-between gap-6">
            <div class="flex-1">
              <label_1.Label class="text-sm font-medium">API token</label_1.Label>
              <p class="text-xs text-muted-foreground">
                ANTHROPIC_AUTH_TOKEN env
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <input_1.Input type="password" value={token} onChange={function (e) {
            setToken(e.target.value);
        }} class="w-full" placeholder="sk-ant-..."/>
            </div>
          </div>

          <div class="flex items-center justify-between gap-6">
            <div class="flex-1">
              <label_1.Label class="text-sm font-medium">Base URL</label_1.Label>
              <p class="text-xs text-muted-foreground">
                ANTHROPIC_BASE_URL env
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <input_1.Input value={baseUrl} onChange={function (e) { return setBaseUrl(e.target.value); }} class="w-full" placeholder="https://api.anthropic.com"/>
            </div>
          </div>
        </div>

        <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-2 border-t">
          <button_1.Button variant="ghost" size="sm" onClick={handleReset} disabled={!canReset} class="hover:bg-red-500/10 hover:text-red-600">
            Reset
          </button_1.Button>
          <button_1.Button size="sm" onClick={handleSave} disabled={!canSave}>
            Save
          </button_1.Button>
        </div>
        </div>
      </div>

      {/* OpenAI API Key for Voice Input */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Voice Input</h4>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 space-y-4">
            <div class="flex items-center justify-between gap-6">
              <div class="flex-1">
                <label_1.Label class="text-sm font-medium">OpenAI API Key</label_1.Label>
                <p class="text-xs text-muted-foreground">
                  Required for voice transcription (Whisper API). Free users need their own key.
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <input_1.Input type="password" value={openaiKey} onChange={function (e) { return setOpenaiKey(e.target.value); }} class="w-full" placeholder="sk-..."/>
              </div>
            </div>
          </div>

          <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-2 border-t">
            <button_1.Button variant="ghost" size="sm" onClick={handleResetOpenAI} disabled={!canResetOpenAI || setOpenAIKeyMutation.isPending} class="hover:bg-red-500/10 hover:text-red-600">
              Remove
            </button_1.Button>
            <button_1.Button size="sm" onClick={handleSaveOpenAI} disabled={!canSaveOpenAI || setOpenAIKeyMutation.isPending}>
              Save
            </button_1.Button>
          </div>
        </div>
      </div>
    </div>;
}
