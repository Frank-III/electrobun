"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingMethodPage = BillingMethodPage;
var jotai_1 = require("../../lib/state/jotai");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var icons_1 = require("../../components/ui/icons");
var atoms_1 = require("../../lib/atoms");
var utils_1 = require("../../lib/utils");
var billingOptions = [
    {
        id: "claude-subscription",
        title: "Claude Pro/Max",
        subtitle: "Use your Claude subscription for unlimited access.",
        recommended: true,
        icon: <icons_1.ClaudeCodeIcon class="w-5 h-5"/>
    },
    {
        id: "api-key",
        title: "Anthropic API Key",
        subtitle: "Pay-as-you-go with your own API key.",
        icon: <icons_1.KeyFilledIcon class="w-5 h-5"/>
    },
    {
        id: "custom-model",
        title: "Custom Model",
        subtitle: "Use a custom base URL and model.",
        icon: <icons_1.SettingsFilledIcon class="w-5 h-5"/>
    }
];
function BillingMethodPage() {
    var setBillingMethod = (0, jotai_1.useSetAtom)(atoms_1.billingMethodAtom);
    var _a = (0, solid_js_1.createSignal)("claude-subscription"), selectedOption = _a[0], setSelectedOption = _a[1];
    var handleContinue = function () {
        setBillingMethod(selectedOption);
    };
    return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

      <div class="w-full max-w-[440px] space-y-8 px-4">
        {/* Header */}
        <div class="text-center space-y-1">
          <h1 class="text-base font-semibold tracking-tight">
            Connect to Claude
          </h1>
          <p class="text-sm text-muted-foreground">
            Choose how you'd like to connect your AI provider.
          </p>
        </div>

        {/* Billing Options */}
        <div class="space-y-3">
          {billingOptions.map(function (option) { return <button key={option.id} onClick={function () { return setSelectedOption(option.id); }} class={(0, utils_1.cn)("relative w-full p-4 rounded-xl text-left transition-[transform,box-shadow] duration-150 ease-out", "shadow-[0_0_0_0.5px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.3)]", "hover:shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)]", "active:scale-[0.99]", selectedOption === option.id ? "bg-primary/5" : "bg-background")}>
              {/* Checkmark in top right corner */}
              {selectedOption === option.id && <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
                  <lucide_solid_1.Check class="w-3 h-3 text-primary-foreground"/>
                </div>}
              <div class="flex items-start gap-3">
                <div class={(0, utils_1.cn)("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", option.id === "claude-subscription" ? "bg-[#D97757] text-white" : selectedOption === option.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
                  {option.icon}
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{option.title}</span>
                    {option.recommended && <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Recommended
                      </span>}
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {option.subtitle}
                  </p>
                </div>
              </div>
            </button>; })}
        </div>

        {/* Continue Button */}
        <button onClick={handleContinue} class="w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center">
          Continue
        </button>
      </div>
    </div>;
}
