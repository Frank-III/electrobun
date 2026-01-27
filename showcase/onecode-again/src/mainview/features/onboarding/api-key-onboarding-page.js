"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyOnboardingPage = ApiKeyOnboardingPage;
var jotai_1 = require("../../lib/state/jotai");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../components/ui/icons");
var input_1 = require("../../components/ui/input");
var label_1 = require("../../components/ui/label");
var logo_1 = require("../../components/ui/logo");
var atoms_1 = require("../../lib/atoms");
var utils_1 = require("../../lib/utils");
// Check if the key looks like a valid Anthropic API key
var isValidApiKey = function (key) {
    var trimmed = key.trim();
    return trimmed.startsWith("sk-ant-") && trimmed.length > 20;
};
function ApiKeyOnboardingPage() {
    var _a = (0, jotai_1.useAtom)(atoms_1.customClaudeConfigAtom), storedConfig = _a[0], setStoredConfig = _a[1];
    var billingMethod = (0, jotai_1.useAtomValue)(atoms_1.billingMethodAtom);
    var setBillingMethod = (0, jotai_1.useSetAtom)(atoms_1.billingMethodAtom);
    var setApiKeyOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_1.apiKeyOnboardingCompletedAtom);
    var isCustomModel = billingMethod === "custom-model";
    // Default values for API key mode (not custom model)
    var defaultModel = "claude-sonnet-4-20250514";
    var defaultBaseUrl = "https://api.anthropic.com";
    var _b = (0, solid_js_1.createSignal)(storedConfig.token), apiKey = _b[0], setApiKey = _b[1];
    var _c = (0, solid_js_1.createSignal)(storedConfig.model || ""), model = _c[0], setModel = _c[1];
    var _d = (0, solid_js_1.createSignal)(storedConfig.token), token = _d[0], setToken = _d[1];
    var _e = (0, solid_js_1.createSignal)(storedConfig.baseUrl || ""), baseUrl = _e[0], setBaseUrl = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), isSubmitting = _f[0], setIsSubmitting = _f[1];
    // Sync from stored config on mount
    (0, solid_js_1.createEffect)(function () {
        if (storedConfig.token) {
            setApiKey(storedConfig.token);
            setToken(storedConfig.token);
        }
        if (storedConfig.model)
            setModel(storedConfig.model);
        if (storedConfig.baseUrl)
            setBaseUrl(storedConfig.baseUrl);
    });
    var handleBack = function () {
        setBillingMethod(null);
    };
    // Submit for API key mode (simple - just the key)
    var submitApiKey = function (key) {
        if (!isValidApiKey(key))
            return;
        setIsSubmitting(true);
        var config = {
            model: defaultModel,
            token: key.trim(),
            baseUrl: defaultBaseUrl
        };
        setStoredConfig(config);
        setApiKeyOnboardingCompleted(true);
        setIsSubmitting(false);
    };
    // Submit for custom model mode (all three fields)
    var submitCustomModel = function () {
        var trimmedModel = model.trim();
        var trimmedToken = token.trim();
        var trimmedBaseUrl = baseUrl.trim();
        if (!trimmedModel || !trimmedToken || !trimmedBaseUrl)
            return;
        setIsSubmitting(true);
        var config = {
            model: trimmedModel,
            token: trimmedToken,
            baseUrl: trimmedBaseUrl
        };
        setStoredConfig(config);
        setApiKeyOnboardingCompleted(true);
        setIsSubmitting(false);
    };
    var handleApiKeyChange = function (e) {
        var value = e.target.value;
        setApiKey(value);
        // Auto-submit if valid API key is pasted
        if (isValidApiKey(value)) {
            setTimeout(function () { return submitApiKey(value); }, 100);
        }
    };
    var handleApiKeyKeyDown = function (e) {
        if (e.key === "Enter" && apiKey.trim()) {
            submitApiKey(apiKey);
        }
    };
    var canSubmitCustomModel = Boolean(model.trim() && token.trim() && baseUrl.trim());
    // Simple API key input mode
    if (!isCustomModel) {
        return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        {/* Draggable title bar area */}
        <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

        {/* Back button - fixed in top left corner below traffic lights */}
        <button onClick={handleBack} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
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
                <icons_1.KeyFilledIcon class="w-5 h-5 text-background"/>
              </div>
            </div>
            <div class="space-y-1">
              <h1 class="text-base font-semibold tracking-tight">
                Enter API Key
              </h1>
              <p class="text-sm text-muted-foreground">
                Get your API key from{" "}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" class="text-foreground hover:underline">
                  console.anthropic.com
                </a>
              </p>
            </div>
          </div>

          {/* API Key Input */}
          <div class="space-y-4">
            <div class="relative">
              <input_1.Input value={apiKey} onChange={handleApiKeyChange} onKeyDown={handleApiKeyKeyDown} placeholder="sk-ant-..." class="font-mono text-center pr-10" autoFocus disabled={isSubmitting}/>
              {isSubmitting && <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <icons_1.IconSpinner class="h-4 w-4"/>
                </div>}
            </div>
            <p class="text-xs text-muted-foreground text-center">
              Your API key starts with sk-ant-
            </p>
          </div>
        </div>
      </div>;
    }
    // Custom model mode with all fields
    return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

      {/* Back button - fixed in top left corner below traffic lights */}
      <button onClick={handleBack} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
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
              <icons_1.SettingsFilledIcon class="w-5 h-5 text-background"/>
            </div>
          </div>
          <div class="space-y-1">
            <h1 class="text-base font-semibold tracking-tight">
              Configure Custom Model
            </h1>
            <p class="text-sm text-muted-foreground">
              Enter your custom model configuration
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div class="space-y-4">
          {/* Model Name */}
          <div class="space-y-2">
            <label_1.Label class="text-sm font-medium">Model name</label_1.Label>
            <input_1.Input value={model} onChange={function (e) { return setModel(e.target.value); }} placeholder="claude-sonnet-4-20250514" class="w-full"/>
            <p class="text-xs text-muted-foreground">
              Model identifier for API requests
            </p>
          </div>

          {/* API Token */}
          <div class="space-y-2">
            <label_1.Label class="text-sm font-medium">API token</label_1.Label>
            <input_1.Input type="password" value={token} onChange={function (e) { return setToken(e.target.value); }} placeholder="sk-ant-..." class="w-full"/>
            <p class="text-xs text-muted-foreground">
              Your API key or token
            </p>
          </div>

          {/* Base URL */}
          <div class="space-y-2">
            <label_1.Label class="text-sm font-medium">Base URL</label_1.Label>
            <input_1.Input value={baseUrl} onChange={function (e) { return setBaseUrl(e.target.value); }} placeholder="https://api.anthropic.com" class="w-full"/>
            <p class="text-xs text-muted-foreground">API endpoint URL</p>
          </div>
        </div>

        {/* Continue Button */}
        <button onClick={submitCustomModel} disabled={!canSubmitCustomModel || isSubmitting} class={(0, utils_1.cn)("w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center", (!canSubmitCustomModel || isSubmitting) && "opacity-50 cursor-not-allowed")}>
          {isSubmitting ? <icons_1.IconSpinner class="h-4 w-4"/> : "Continue"}
        </button>
      </div>
    </div>;
}
