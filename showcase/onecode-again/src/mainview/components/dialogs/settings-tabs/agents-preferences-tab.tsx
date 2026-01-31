import { createEffect, createSignal, onCleanup, Show, type Accessor } from "solid-js";
import { analyticsOptOutAtom, autoAdvanceTargetAtom, ctrlTabTargetAtom, defaultAgentModeAtom, desktopNotificationsEnabledAtom, extendedThinkingEnabledAtom, soundNotificationsEnabledAtom, type AgentMode, type AutoAdvanceTarget, type CtrlTabTarget } from "../../../lib/atoms";
import { Kbd } from "../../ui/kbd";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../ui/select";
import { Switch } from "../../ui/switch";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";

function useIsNarrowScreen(): Accessor<boolean> {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		onCleanup(() => window.removeEventListener("resize", checkWidth));
	});
	return isNarrow;
}
export function AgentsPreferencesTab() {
	const [thinkingEnabled, setThinkingEnabled] = extendedThinkingEnabledAtom;
	const [soundEnabled, setSoundEnabled] = soundNotificationsEnabledAtom;
	const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = desktopNotificationsEnabledAtom;
	const [analyticsOptOut, setAnalyticsOptOut] = analyticsOptOutAtom;
	const [ctrlTabTarget, setCtrlTabTarget] = ctrlTabTargetAtom;
	const [autoAdvanceTarget, setAutoAdvanceTarget] = autoAdvanceTargetAtom;
	const [defaultAgentMode, setDefaultAgentMode] = defaultAgentModeAtom;
	const isNarrowScreen = useIsNarrowScreen();

	const coAuthoredByQuery = useQuery(() => ({
		queryKey: ["claudeSettings", "getIncludeCoAuthoredBy"] as const,
		queryFn: () => desktopRpc.claudeSettings.getIncludeCoAuthoredBy(),
	}));
	const includeCoAuthoredBy = () => coAuthoredByQuery.data;

	const setCoAuthoredByMutation = useMutation(() => ({
		mutationFn: (input: { enabled: boolean }) =>
			desktopRpc.claudeSettings.setIncludeCoAuthoredBy.mutate(input),
		onSuccess: () => {
			coAuthoredByQuery.refetch();
		},
	}));
	const handleCoAuthoredByToggle = (enabled: boolean) => {
		setCoAuthoredByMutation.mutate({ enabled });
	};
	// Sync opt-out status to main process
	const handleAnalyticsToggle = async (optedOut: boolean) => {
		setAnalyticsOptOut(optedOut);
		// Notify main process
		try {
			await window.desktopApi?.setAnalyticsOptOut(optedOut);
		} catch (error) {
			console.error("Failed to sync analytics opt-out to main process:", error);
		}
	};
    return <div class="p-6 space-y-6">
      {	/* Header - hidden on narrow screens since it's in the navigation bar */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Preferences</h3>
          <p class="text-xs text-muted-foreground">
            Configure Claude's behavior and features
          </p>
        </div>
      </Show>

      { /* Features Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="p-4 space-y-6">
          { /* Extended Thinking Toggle */}
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
            <Switch checked={thinkingEnabled()} onCheckedChange={setThinkingEnabled} />
          </div>

          { /* Desktop Notifications Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Desktop Notifications
              </span>
              <span class="text-xs text-muted-foreground">
                Show system notifications when agent needs input or completes work
              </span>
            </div>
            <Switch checked={desktopNotificationsEnabled()} onCheckedChange={setDesktopNotificationsEnabled} />
          </div>

          { /* Sound Notifications Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Sound Notifications
              </span>
              <span class="text-xs text-muted-foreground">
                Play a sound when agent completes work while you're away
              </span>
            </div>
            <Switch checked={soundEnabled()} onCheckedChange={setSoundEnabled} />
          </div>

          { /* Co-Authored-By Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Include Co-Authored-By
              </span>
              <span class="text-xs text-muted-foreground">
                Add "Co-authored-by: Claude" to git commits made by Claude
              </span>
            </div>
            <Switch checked={includeCoAuthoredBy() ?? true} onCheckedChange={handleCoAuthoredByToggle} disabled={setCoAuthoredByMutation.isPending} />
          </div>

          { /* Quick Switch */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Quick Switch
              </span>
              <span class="text-xs text-muted-foreground">
                What <Kbd>⌃Tab</Kbd> switches between
              </span>
            </div>
            <Select value={ctrlTabTarget()} onChange={(value: CtrlTabTarget) => setCtrlTabTarget(value)}>
              <SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {ctrlTabTarget() === "workspaces" ? "Workspaces" : "Agents"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workspaces">Workspaces</SelectItem>
                <SelectItem value="agents">Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          { /* Auto-advance */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Auto-advance
              </span>
              <span class="text-xs text-muted-foreground">
                Where to go after archiving a workspace
              </span>
            </div>
            <Select value={autoAdvanceTarget()} onChange={(value: AutoAdvanceTarget) => setAutoAdvanceTarget(value)}>
              <SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {autoAdvanceTarget() === "next" ? "Go to next workspace" : autoAdvanceTarget() === "previous" ? "Go to previous workspace" : "Close workspace"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Go to next workspace</SelectItem>
                <SelectItem value="previous">Go to previous workspace</SelectItem>
                <SelectItem value="close">Close workspace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          { /* Default Mode */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Default Mode
              </span>
              <span class="text-xs text-muted-foreground">
                Mode for new agents (Plan = read-only, Agent = can edit)
              </span>
            </div>
            <Select value={defaultAgentMode()} onChange={(value: AgentMode) => setDefaultAgentMode(value)}>
              <SelectTrigger class="w-auto px-2">
                <span class="text-xs">
                  {defaultAgentMode() === "agent" ? "Agent" : "Plan"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="plan">Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      { /* Privacy Section */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Privacy</h4>
          <p class="text-xs text-muted-foreground mt-1">
            Control what data you share with us
          </p>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4">
            { /* Share Usage Analytics */}
            <div class="flex items-start justify-between">
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-foreground">
                  Share Usage Analytics
                </span>
                <span class="text-xs text-muted-foreground">
                  Help us improve Agents by sharing anonymous usage data. We only track feature usage and app performance–never your code, prompts, or messages. No AI training on your data.
                </span>
              </div>
              <Switch checked={!analyticsOptOut()} onCheckedChange={(enabled) => handleAnalyticsToggle(!enabled)} />
            </div>
          </div>
        </div>
      </div>
    </div>;
 }
