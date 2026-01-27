import { useAtom, useAtomValue } from "../../../lib/state/jotai";
import { createSignal, createEffect, Show, For, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import { historyEnabledAtom, showOfflineModeFeaturesAtom, autoOfflineModeAtom, selectedOllamaModelAtom, betaKanbanEnabledAtom } from "../../../lib/atoms";
import { trpc } from "../../../lib/trpc";
import { Switch } from "../../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ExternalLinkIcon } from "../../ui/icons";
import { Copy, Check, RefreshCw } from "lucide-solid";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
// Hook to detect narrow screen
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
const MINIMUM_OLLAMA_VERSION = "0.14.2";
const RECOMMENDED_MODEL = "qwen3-coder:30b";
export function AgentsBetaTab() {
	const isNarrowScreen = useIsNarrowScreen();
	const [historyEnabled, setHistoryEnabled] = useAtom(historyEnabledAtom);
	const [showOfflineFeatures, setShowOfflineFeatures] = useAtom(showOfflineModeFeaturesAtom);
	const [autoOffline, setAutoOffline] = useAtom(autoOfflineModeAtom);
	const [selectedOllamaModel, setSelectedOllamaModel] = useAtom(selectedOllamaModelAtom);
	const [kanbanEnabled, setKanbanEnabled] = useAtom(betaKanbanEnabledAtom);
	const [copied, setCopied] = createSignal(false);
	const [updateStatus, setUpdateStatus] = createSignal("idle");
	const [updateVersion, setUpdateVersion] = createSignal(null);
	const [currentVersion, setCurrentVersion] = createSignal(null);
	// Get current version on mount
	createEffect(() => {
		(window as any).desktopApi?.getVersion().then(setCurrentVersion);
	});
	// Check for updates with force flag to bypass cache
	const handleCheckForUpdates = async () => {
		// Check if we're in dev mode
		const isPackaged = await (window as any).desktopApi?.isPackaged?.();
		if (!isPackaged) {
			setUpdateStatus("error");
			console.log("Update check skipped in dev mode");
			return;
		}
		setUpdateStatus("checking");
		setUpdateVersion(null);
		try {
			const result = await (window as any).desktopApi?.checkForUpdates(true);
			if (result) {
				setUpdateStatus("available");
				setUpdateVersion(result.version);
			} else {
				setUpdateStatus("not-available");
			}
		} catch (error) {
			console.error("Failed to check for updates:", error);
			setUpdateStatus("error");
		}
	};
	// Get Ollama status
	const { data: ollamaStatus } = trpc.ollama.getStatus.useQuery(undefined, {
		refetchInterval: showOfflineFeatures() ? 3e4 : false,
		enabled: showOfflineFeatures()
	});
	const handleCopy = () => {
		navigator.clipboard.writeText(`ollama pull ${RECOMMENDED_MODEL}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	return <div class="p-6 space-y-6">
      {	/* Header - hidden on narrow screens since it's in the navigation bar */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Beta Features</h3>
          <p class="text-xs text-muted-foreground">
            Enable experimental features. These may be unstable or change without notice.
          </p>
        </div>
      </Show>

      { /* Beta Features Section */}
      <div class="bg-background rounded-lg border border-border overflow-hidden">
        <div class="p-4 space-y-6">
          { /* Rollback Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Rollback
              </span>
              <span class="text-xs text-muted-foreground">
                Allow rolling back to previous messages and restoring files.
              </span>
            </div>
            <Switch checked={historyEnabled()} onCheckedChange={setHistoryEnabled} />
          </div>

          { /* Offline Mode Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Offline Mode
              </span>
              <span class="text-xs text-muted-foreground">
                Enable offline mode UI and Ollama integration.
              </span>
            </div>
            <Switch checked={showOfflineFeatures()} onCheckedChange={setShowOfflineFeatures} />
          </div>

          { /* Kanban Board Toggle */}
          <div class="flex items-start justify-between">
            <div class="flex flex-col space-y-1">
              <span class="text-sm font-medium text-foreground">
                Kanban Board
              </span>
              <span class="text-xs text-muted-foreground">
                View workspaces as a Kanban board organized by status.
              </span>
            </div>
            <Switch checked={kanbanEnabled()} onCheckedChange={setKanbanEnabled} />
          </div>
        </div>
      </div>

      { /* Offline Mode Settings - only show when feature is enabled */}
      <Show when={showOfflineFeatures()}>
        <div class="space-y-2">
          <div class="pb-2">
            <h4 class="text-sm font-medium text-foreground">Offline Mode Settings</h4>
          </div>

          <div class="bg-background rounded-lg border border-border overflow-hidden">
            <div class="p-4 space-y-4">
              { /* Status */}
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="text-sm font-medium text-foreground">
                    Ollama Status
                  </span>
                  <p class="text-xs text-muted-foreground">
                    {ollamaStatus?.ollama.available ? `Running - ${ollamaStatus.ollama.models.length} model${ollamaStatus.ollama.models.length !== 1 ? "s" : ""} installed` : "Not running or not installed"}
                  </p>
                </div>
                <div class="flex items-center gap-1.5">
                  <Show when={ollamaStatus?.ollama.available} fallback={<>
                      <span class="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      <span class="text-sm text-muted-foreground">Unavailable</span>
                    </>}>
                    <span class="h-2 w-2 rounded-full bg-emerald-500" />
                    <span class="text-sm text-emerald-500">Available</span>
                  </Show>
                </div>
              </div>

              { /* Model selector */}
              <Show when={ollamaStatus?.ollama.available && ollamaStatus.ollama.models.length > 0}>
                <div class="flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium text-foreground">
                      Model
                    </span>
                    <p class="text-xs text-muted-foreground">
                      Select which model to use for offline mode
                    </p>
                  </div>
                  <Select value={selectedOllamaModel() || ollamaStatus!.ollama.recommendedModel || ollamaStatus!.ollama.models[0]} onValueChange={(value) => setSelectedOllamaModel(value)}>
                    <SelectTrigger class="w-auto shrink-0">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <For each={ollamaStatus!.ollama.models}>
                        {(model) => {
                          const isRecommended = model === ollamaStatus!.ollama.recommendedModel;
                          return <SelectItem value={model}>
                            <span class="truncate">
                              {model}
                              <Show when={isRecommended}>
                                <span class="text-muted-foreground ml-1 text-xs">(recommended)</span>
                              </Show>
                            </span>
                          </SelectItem>;
                        }}
                      </For>
                    </SelectContent>
                  </Select>
                </div>
              </Show>

              {	/* Auto-fallback toggle */}
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="text-sm font-medium text-foreground">
                    Auto Offline Mode
                  </span>
                  <p class="text-xs text-muted-foreground">
                    Automatically use Ollama when internet is unavailable
                  </p>
                </div>
                <Switch checked={autoOffline()} onCheckedChange={setAutoOffline} />
              </div>

              { /* Installation instructions - always show */}
              <div class="text-xs text-muted-foreground bg-muted p-3 rounded space-y-2">
                <p class="font-medium">Setup Instructions:</p>
                <ol class="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    Install Ollama {MINIMUM_OLLAMA_VERSION}+ from{" "}
                    <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" class="underline inline-flex items-center gap-0.5">
                      ollama.com
                      <ExternalLinkIcon class="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Pull the recommended model:{" "}
                    <code class="relative inline-flex items-center gap-1 bg-background pl-1.5 pr-0.5 py-0.5 rounded-md">
                      <span>ollama pull {RECOMMENDED_MODEL}</span>
                      <button type="button" onClick={handleCopy} class="p-1 hover:bg-muted rounded transition-colors" title={copied() ? "Copied!" : "Copy command"}>
                        <div class="relative w-3 h-3">
                          <Copy class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out hover:text-foreground", copied() ? "opacity-0 scale-50" : "opacity-100 scale-100")} />
                          <Check class={cn("absolute inset-0 w-3 h-3 text-muted-foreground transition-[opacity,transform] duration-200 ease-out", copied() ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
                        </div>
                      </button>
                    </code>
                  </li>
                  <li>Ollama will run automatically in the background</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Show>

      { /* Updates Section */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Updates</h4>
          <p class="text-xs text-muted-foreground mt-1">
            Check for new versions manually (bypasses CDN cache)
          </p>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex flex-col space-y-1">
                <span class="text-sm font-medium text-foreground">
                  {currentVersion() ? `Current: v${currentVersion()}` : "Version"}
                </span>
                <span class="text-xs text-muted-foreground">
                  {updateStatus() === "checking" && "Checking for updates..."}
                  {updateStatus() === "available" && `Update available: v${updateVersion()}`}
                  {updateStatus() === "not-available" && "You're on the latest version"}
                  {updateStatus() === "error" && "Failed to check (dev mode?)"}
                  {updateStatus() === "idle" && "Click to check for updates"}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCheckForUpdates} disabled={updateStatus() === "checking"}>
                <RefreshCw class={cn("h-4 w-4 mr-2", updateStatus() === "checking" && "animate-spin")} />
                {updateStatus() === "checking" ? "Checking..." : "Check Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
 }
