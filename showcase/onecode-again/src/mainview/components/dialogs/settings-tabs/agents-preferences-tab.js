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
exports.AgentsPreferencesTab = AgentsPreferencesTab;
var jotai_1 = require("../../../lib/state/jotai");
var solid_js_1 = require("solid-js");
var atoms_1 = require("../../../lib/atoms");
var kbd_1 = require("../../ui/kbd");
var select_1 = require("../../ui/select");
var switch_1 = require("../../ui/switch");
var trpc_1 = require("../../../lib/trpc");
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
function AgentsPreferencesTab() {
    var _this = this;
    var _a = (0, jotai_1.useAtom)(atoms_1.extendedThinkingEnabledAtom), thinkingEnabled = _a[0], setThinkingEnabled = _a[1];
    var _b = (0, jotai_1.useAtom)(atoms_1.soundNotificationsEnabledAtom), soundEnabled = _b[0], setSoundEnabled = _b[1];
    var _c = (0, jotai_1.useAtom)(atoms_1.desktopNotificationsEnabledAtom), desktopNotificationsEnabled = _c[0], setDesktopNotificationsEnabled = _c[1];
    var _d = (0, jotai_1.useAtom)(atoms_1.analyticsOptOutAtom), analyticsOptOut = _d[0], setAnalyticsOptOut = _d[1];
    var _e = (0, jotai_1.useAtom)(atoms_1.ctrlTabTargetAtom), ctrlTabTarget = _e[0], setCtrlTabTarget = _e[1];
    var _f = (0, jotai_1.useAtom)(atoms_1.autoAdvanceTargetAtom), autoAdvanceTarget = _f[0], setAutoAdvanceTarget = _f[1];
    var _g = (0, jotai_1.useAtom)(atoms_1.defaultAgentModeAtom), defaultAgentMode = _g[0], setDefaultAgentMode = _g[1];
    var isNarrowScreen = useIsNarrowScreen();
    // Co-authored-by setting from Claude settings.json
    var _h = trpc_1.trpc.claudeSettings.getIncludeCoAuthoredBy.useQuery(), includeCoAuthoredBy = _h.data, refetchCoAuthoredBy = _h.refetch;
    var setCoAuthoredByMutation = trpc_1.trpc.claudeSettings.setIncludeCoAuthoredBy.useMutation({ onSuccess: function () {
            refetchCoAuthoredBy();
        } });
    var handleCoAuthoredByToggle = function (enabled) {
        setCoAuthoredByMutation.mutate({ enabled: enabled });
    };
    // Sync opt-out status to main process
    var handleAnalyticsToggle = function (optedOut) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setAnalyticsOptOut(optedOut);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setAnalyticsOptOut(optedOut))];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error("Failed to sync analytics opt-out to main process:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return <div class="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Preferences</h3>
          <p class="text-xs text-muted-foreground">
            Configure Claude's behavior and features
          </p>
        </div>}

      {/* Features Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="p-4 space-y-6">
          {/* Extended Thinking Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Extended Thinking
              </span>
              <span class="text-xs text-muted-foreground">
                Enable deeper reasoning with more thinking tokens (uses more
                credits).{" "}
                <span class="text-foreground/70">Disables response streaming.</span>
              </span>
            </div>
            <switch_1.Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled}/>
          </div>

          {/* Desktop Notifications Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Desktop Notifications
              </span>
              <span class="text-xs text-muted-foreground">
                Show system notifications when agent needs input or completes work
              </span>
            </div>
            <switch_1.Switch checked={desktopNotificationsEnabled} onCheckedChange={setDesktopNotificationsEnabled}/>
          </div>

          {/* Sound Notifications Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Sound Notifications
              </span>
              <span class="text-xs text-muted-foreground">
                Play a sound when agent completes work while you're away
              </span>
            </div>
            <switch_1.Switch checked={soundEnabled} onCheckedChange={setSoundEnabled}/>
          </div>

          {/* Co-Authored-By Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Include Co-Authored-By
              </span>
              <span class="text-xs text-muted-foreground">
                Add "Co-authored-by: Claude" to git commits made by Claude
              </span>
            </div>
            <switch_1.Switch checked={includeCoAuthoredBy !== null && includeCoAuthoredBy !== void 0 ? includeCoAuthoredBy : true} onCheckedChange={handleCoAuthoredByToggle} disabled={setCoAuthoredByMutation.isPending}/>
          </div>

          {/* Quick Switch */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Quick Switch
              </span>
              <span class="text-xs text-muted-foreground">
                What <kbd_1.Kbd>⌃Tab</kbd_1.Kbd> switches between
              </span>
            </div>
            <select_1.Select value={ctrlTabTarget} onValueChange={function (value) { return setCtrlTabTarget(value); }}>
              <select_1.SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {ctrlTabTarget === "workspaces" ? "Workspaces" : "Agents"}
                </span>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="workspaces">Workspaces</select_1.SelectItem>
                <select_1.SelectItem value="agents">Agents</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Auto-advance */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Auto-advance
              </span>
              <span class="text-xs text-muted-foreground">
                Where to go after archiving a workspace
              </span>
            </div>
            <select_1.Select value={autoAdvanceTarget} onValueChange={function (value) { return setAutoAdvanceTarget(value); }}>
              <select_1.SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {autoAdvanceTarget === "next" ? "Go to next workspace" : autoAdvanceTarget === "previous" ? "Go to previous workspace" : "Close workspace"}
                </span>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="next">Go to next workspace</select_1.SelectItem>
                <select_1.SelectItem value="previous">Go to previous workspace</select_1.SelectItem>
                <select_1.SelectItem value="close">Close workspace</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Default Mode */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Default Mode
              </span>
              <span class="text-xs text-muted-foreground">
                Mode for new agents (Plan = read-only, Agent = can edit)
              </span>
            </div>
            <select_1.Select value={defaultAgentMode} onValueChange={function (value) { return setDefaultAgentMode(value); }}>
              <select_1.SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {defaultAgentMode === "agent" ? "Agent" : "Plan"}
                </span>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="agent">Agent</select_1.SelectItem>
                <select_1.SelectItem value="plan">Plan</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Privacy</h4>
          <p class="text-xs text-muted-foreground mt-1">
            Control what data you share with us
          </p>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4">
            {/* Share Usage Analytics */}
            <div class="flex items-start justify-between">
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-foreground">
                  Share Usage Analytics
                </span>
                <span class="text-xs text-muted-foreground">
                  Help us improve Agents by sharing anonymous usage data. We only track feature usage and app performance–never your code, prompts, or messages. No AI training on your data.
                </span>
              </div>
              <switch_1.Switch checked={!analyticsOptOut} onCheckedChange={function (enabled) { return handleAnalyticsToggle(!enabled); }}/>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
