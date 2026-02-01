import { createSignal, createEffect, onCleanup, Show, type Accessor } from "solid-js";
import { useQuery, useMutation } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { getQueryClient } from "../../../contexts/QueryProvider";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { toast } from "solid-sonner";
import { Copy, FolderOpen, RefreshCw, Terminal, Check, Scan, WifiOff } from "lucide-solid";

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
// React Scan state management (only available in dev mode)
const REACT_SCAN_SCRIPT_ID = "react-scan-script";
const REACT_SCAN_STORAGE_KEY = "react-scan-enabled";
function loadReactScan(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.getElementById(REACT_SCAN_SCRIPT_ID)) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.id = REACT_SCAN_SCRIPT_ID;
		script.src = "https://unpkg.com/react-scan/dist/auto.global.js";
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load React Scan"));
		document.head.appendChild(script);
	});
}
function unloadReactScan(): void {
	const script = document.getElementById(REACT_SCAN_SCRIPT_ID);
	if (script) {
		script.remove();
	}
	// React Scan adds a toolbar element, try to remove it
	const toolbar = document.querySelector("[data-react-scan]");
	if (toolbar) {
		toolbar.remove();
	}
}
export function AgentsDebugTab() {
	const [copiedPath, setCopiedPath] = createSignal(false);
	const [copiedInfo, setCopiedInfo] = createSignal(false);
	const [reactScanEnabled, setReactScanEnabled] = createSignal(false);
	const [reactScanLoading, setReactScanLoading] = createSignal(false);
	const isNarrowScreen = useIsNarrowScreen();
	// Check if we're in dev mode (only show React Scan in dev)
	const isDev = import.meta.env.DEV;
	const queryClient = getQueryClient();
	// Fetch system info
	const systemInfoQuery = useQuery(() => ({
		queryKey: ["debug", "getSystemInfo"],
		queryFn: () => desktopRpc.debug.getSystemInfo(),
	}));
	const systemInfo = () => systemInfoQuery.data;
	const isLoadingSystem = () => systemInfoQuery.isLoading;
	// Offline simulation state
	const offlineSimulationQuery = useQuery(() => ({
		queryKey: ["debug", "getOfflineSimulation"],
		queryFn: () => desktopRpc.debug.getOfflineSimulation(),
	}));
	const offlineSimulation = () => offlineSimulationQuery.data;
	const refetchOfflineSimulation = () => offlineSimulationQuery.refetch();
	const setOfflineSimulationMutation = useMutation(() => ({
		mutationFn: (input: { enabled: boolean }) =>
			desktopRpc.debug.setOfflineSimulation.mutate(input),
		onSuccess: (data) => {
			queryClient?.invalidateQueries({ queryKey: ["debug", "getOfflineSimulation"] });
			toast.success(data.enabled ? "Offline simulation enabled" : "Offline simulation disabled", { description: data.enabled ? "App will behave as if offline" : "Network detection restored to normal" });
		},
		onError: (error: Error) => toast.error(error.message),
	}));
	// Fetch DB stats
	const dbStatsQuery = useQuery(() => ({
		queryKey: ["debug", "getDbStats"],
		queryFn: () => desktopRpc.debug.getDbStats(),
	}));
	const dbStats = () => dbStatsQuery.data;
	const isLoadingDb = () => dbStatsQuery.isLoading;
	const refetchDb = () => dbStatsQuery.refetch();
	// Mutations
	const clearChatsMutation = useMutation(() => ({
		mutationFn: () => desktopRpc.debug.clearChats.mutate(undefined as never),
		onSuccess: () => {
			queryClient?.invalidateQueries({ queryKey: ["debug", "getDbStats"] });
			toast.success("All chats cleared");
			refetchDb();
		},
		onError: (error: Error) => toast.error(error.message),
	}));
	const clearAllDataMutation = useMutation(() => ({
		mutationFn: () => desktopRpc.debug.clearAllData.mutate(undefined as never),
		onSuccess: () => {
			toast.success("All data cleared. Reloading...");
			setTimeout(() => window.location.reload(), 500);
		},
		onError: (error: Error) => toast.error(error.message),
	}));
	const logoutMutation = useMutation(() => ({
		mutationFn: () => desktopRpc.debug.logout.mutate(undefined as never),
		onSuccess: () => {
			toast.success("Logged out. Reloading...");
			setTimeout(() => window.location.reload(), 500);
		},
		onError: (error: Error) => toast.error(error.message),
	}));
	const openFolderMutation = useMutation(() => ({
		mutationFn: () => desktopRpc.debug.openUserDataFolder.mutate(undefined as never),
		onError: (error: Error) => toast.error(error.message),
	}));
	const handleCopyPath = async () => {
		if (systemInfo()?.userDataPath) {
			await navigator.clipboard.writeText(systemInfo()!.userDataPath);
			setCopiedPath(true);
			setTimeout(() => setCopiedPath(false), 2e3);
		}
	};
	const handleCopyDebugInfo = async () => {
		const info = {
			...systemInfo(),
			dbStats: dbStats(),
			timestamp: new Date().toISOString()
		};
		await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
		setCopiedInfo(true);
		toast.success("Debug info copied to clipboard");
		setTimeout(() => setCopiedInfo(false), 2e3);
	};
	const handleOpenDevTools = () => {
		// TODO: Not available in Electrobun yet;
	};
	const handleReactScanToggle = async (enabled: boolean) => {
		if (!isDev) return;
		setReactScanLoading(true);
		try {
			if (enabled) {
				await loadReactScan();
				localStorage.setItem(REACT_SCAN_STORAGE_KEY, "true");
				setReactScanEnabled(true);
				toast.success("React Scan enabled", { description: "Reload the page to see re-render highlights" });
			} else {
				unloadReactScan();
				localStorage.removeItem(REACT_SCAN_STORAGE_KEY);
				setReactScanEnabled(false);
				toast.success("React Scan disabled", { description: "Reload the page to fully remove it" });
			}
		} catch (error) {
			toast.error("Failed to toggle React Scan");
			console.error(error);
		} finally {
			setReactScanLoading(false);
		}
	};
	// Initialize React Scan state from localStorage (dev only)
	createEffect(() => {
		if (isDev && localStorage.getItem(REACT_SCAN_STORAGE_KEY) === "true") {
			loadReactScan().then(() => setReactScanEnabled(true)).catch(console.error);
		}
	});
	const isLoading = () => isLoadingSystem() || isLoadingDb();
    return <div class="p-6 space-y-6">
      {	/* Header - hidden on narrow screens since it's in the navigation bar */}
      <Show when={!isNarrowScreen()}>
        <div>
          <h3 class="text-lg font-semibold mb-1">Debug</h3>
          <p class="text-sm text-muted-foreground">
            System information and developer tools
          </p>
        </div>
      </Show>

      { /* System Info */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          System Info
        </h4>
        <div class="rounded-lg border bg-muted/30 divide-y">
          <InfoRow label="Version" value={systemInfo()?.version} isLoading={isLoading()} />
          <InfoRow label="Platform" value={systemInfo() ? `${systemInfo()!.platform} (${systemInfo()!.arch})` : undefined} isLoading={isLoading()} />
          <InfoRow label="Dev Mode" value={systemInfo()?.isDev ? "Yes" : "No"} isLoading={isLoading()} />
          <InfoRow label="Protocol" value={systemInfo()?.protocolRegistered ? "Registered" : "Not registered"} isLoading={isLoading()} status={systemInfo()?.protocolRegistered ? "success" : "warning"} />
          <div class="flex items-center justify-between p-3">
            <span class="text-sm text-muted-foreground">userData</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-mono truncate max-w-[200px]">
                {isLoading() ? "..." : systemInfo()?.userDataPath}
              </span>
              <Button variant="ghost" size="icon" class="h-6 w-6" onClick={handleCopyPath} disabled={!systemInfo()?.userDataPath}>
                <Show when={copiedPath()} fallback={<Copy class="h-3 w-3" />}>
                  <Check class="h-3 w-3 text-green-500" />
                </Show>
              </Button>
            </div>
          </div>
        </div>
      </div>

      { /* DB Stats */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Database
        </h4>
        <div class="rounded-lg border bg-muted/30 divide-y">
          <InfoRow label="Projects" value={dbStats()?.projects?.toString()} isLoading={isLoading()} />
          <InfoRow label="Chats" value={dbStats()?.chats?.toString()} isLoading={isLoading()} />
          <InfoRow label="Sub-chats" value={dbStats()?.subChats?.toString()} isLoading={isLoading()} />
        </div>
      </div>

      { /* Developer Tools (dev mode only) */}
      <Show when={isDev}>
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Developer Tools
          </h4>
          <div class="rounded-lg border bg-muted/30 divide-y">
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center gap-2">
                <Scan class="h-4 w-4 text-muted-foreground" />
                <div>
                  <span class="text-sm">React Scan</span>
                  <p class="text-xs text-muted-foreground">
                    Highlight component re-renders
                  </p>
                </div>
              </div>
              <Switch checked={reactScanEnabled()} onCheckedChange={handleReactScanToggle} disabled={reactScanLoading()} />
            </div>
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center gap-2">
                <WifiOff class="h-4 w-4 text-muted-foreground" />
                <div>
                  <span class="text-sm">Simulate Offline</span>
                  <p class="text-xs text-muted-foreground">
                    Test offline mode without disconnecting
                  </p>
                </div>
              </div>
              <Switch checked={offlineSimulation()?.enabled ?? false} onCheckedChange={(enabled) => setOfflineSimulationMutation.mutate({ enabled })} disabled={setOfflineSimulationMutation.isPending} />
            </div>
          </div>
        </div>
      </Show>

      { /* Quick Actions */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => openFolderMutation.mutate(undefined as never)} disabled={openFolderMutation.isPending}>
            <FolderOpen class="h-4 w-4 mr-2" />
            Open userData
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenDevTools}>
            <Terminal class="h-4 w-4 mr-2" />
            DevTools
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw class="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyDebugInfo} disabled={isLoading()}>
            <Show when={copiedInfo()} fallback={<Copy class="h-4 w-4 mr-2" />}>
              <Check class="h-4 w-4 mr-2 text-green-500" />
            </Show>
            Copy Info
          </Button>
        </div>
      </div>

      { /* Toast Testing */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Toast Testing
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Cancelation sent", {
 description: "Sent to John Smith",
		action: {
			label: "Undo",
			onClick: () => toast("Undone!")
		}
	})}>
            Info + Undo
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Success!", { description: "Operation completed" })}>
            Success
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.error("Error", { description: "Something went wrong" })}>
            Error
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast("Default toast", { description: "This is a description" })}>
            Default
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
		const id = toast.loading("Loading...", { description: "Please wait" });
		setTimeout(() => toast.dismiss(id), 3e3);
	}}>
            Loading
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
		const id = toast.loading("Processing...");
		setTimeout(() => {
			toast.success("Done!", { id });
		}, 2e3);
	}}>
            Promise
          </Button>
        </div>
      </div>

      {	/* Data Management */}
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Data Management
        </h4>
        <div class="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => {
 if (confirm("Clear all chats? Projects will be kept.")) {
			clearChatsMutation.mutate();
		}
	}} disabled={clearChatsMutation.isPending}>
            {clearChatsMutation.isPending ? "..." : "Clear Chats"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
		if (confirm("Logout? You will need to sign in again.")) {
			logoutMutation.mutate();
		}
	}} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "..." : "Logout"}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
		if (confirm("Reset everything? This will clear all data and log you out.")) {
			clearAllDataMutation.mutate();
		}
	}} disabled={clearAllDataMutation.isPending}>
            {clearAllDataMutation.isPending ? "..." : "Reset All"}
          </Button>
        </div>
      </div>
    </div>;
}
// Helper component for info rows
interface InfoRowProps {
	label: string;
	value?: string;
	isLoading?: boolean;
	status?: "success" | "warning" | "error";
}
function InfoRow(props: InfoRowProps) {
	return <div class="flex items-center justify-between p-3">
      <span class="text-sm text-muted-foreground">{props.label}</span>
      <span class={`text-sm font-medium ${props.status === "success" ? "text-green-500" : props.status === "warning" ? "text-yellow-500" : props.status === "error" ? "text-red-500" : ""}`}>
        {props.isLoading ? "..." : props.value ?? "-"}
      </span>
    </div>;
}
