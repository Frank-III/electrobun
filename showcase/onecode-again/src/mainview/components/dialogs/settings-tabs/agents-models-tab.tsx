import { MoreHorizontal, Plus } from "lucide-solid";
import { createEffect, createSignal, onCleanup, Show, type Accessor } from "solid-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { toast } from "solid-sonner";
import { agentsSettingsDialogOpenAtom, anthropicOnboardingCompletedAtom, customClaudeConfigAtom, openaiApiKeyAtom, type CustomClaudeConfig } from "../../../lib/atoms";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

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
const EMPTY_CONFIG: CustomClaudeConfig = {
	model: "",
	token: "",
	baseUrl: ""
};
// Account row component
function AccountRow({ account, isActive, onSetActive, onRename, onRemove, isLoading }: {
	account: {
		id: string;
		displayName: string | null;
		email: string | null;
		connectedAt: string | null;
	};
	isActive: boolean;
	onSetActive: () => void;
	onRename: () => void;
	onRemove: () => void;
	isLoading: boolean;
}) {
    return <div class="flex items-center justify-between p-3 hover:bg-muted/50">
      <div class="flex items-center gap-3">
        <div>
          <div class="text-sm font-medium">
            {account.displayName || "Anthropic Account"}
          </div>
          <Show when={account.email}>
            <div class="text-xs text-muted-foreground">{account.email}</div>
          </Show>
          <Show when={!account.email && account.connectedAt}>
            <div class="text-xs text-muted-foreground">
              Connected{" "}
              {new Date(account.connectedAt!).toLocaleDateString(undefined, { dateStyle: "short" })}
            </div>
          </Show>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Show when={!isActive}>
          <Button size="sm" variant="ghost" onClick={onSetActive} disabled={isLoading}>
            Switch
          </Button>
        </Show>
        <Show when={isActive}>
          <Badge variant="secondary" class="text-xs">
            Active
          </Badge>
        </Show>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" class="h-7 w-7">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400" onClick={onRemove}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>;
}
// Anthropic accounts section component
function AnthropicAccountsSection() {
	const queryClient = useQueryClient();
	const accountsQuery = useQuery(() => ({
		queryKey: ["anthropicAccounts", "list"],
		queryFn: () => desktopRpc.anthropicAccounts.list(),
		refetchOnMount: true,
		staleTime: 0,
	}));
	const accounts = () => accountsQuery.data;
	const isAccountsLoading = () => accountsQuery.isLoading;
	const refetchList = () => accountsQuery.refetch();
	const activeAccountQuery = useQuery(() => ({
		queryKey: ["anthropicAccounts", "getActive"],
		queryFn: () => desktopRpc.anthropicAccounts.getActive(),
		refetchOnMount: true,
		staleTime: 0,
	}));
	const activeAccount = () => activeAccountQuery.data;
	const refetchActive = () => activeAccountQuery.refetch();
	const claudeCodeIntegrationQuery = useQuery(() => ({
		queryKey: ["claudeCode", "getIntegration"],
		queryFn: () => desktopRpc.claudeCode.getIntegration(),
	}));
	const claudeCodeIntegration = () => claudeCodeIntegrationQuery.data;
	const migrateLegacy = useMutation(() => ({
		mutationFn: () => desktopRpc.anthropicAccounts.migrateLegacy.mutate(undefined as never),
		onSuccess: async () => {
			await refetchList();
			await refetchActive();
		},
	}));
	// Trigger migration if: no accounts, not loading, has legacy connection, not already migrating
	createEffect(() => {
		if (!isAccountsLoading() && (accounts()?.length === 0) && claudeCodeIntegration()?.isConnected && !migrateLegacy.isPending && !migrateLegacy.isSuccess) {
			migrateLegacy.mutate(undefined as never);
		}
	});
	const setActiveMutation = useMutation(() => ({
		mutationFn: (input: { accountId: string }) =>
			desktopRpc.anthropicAccounts.setActive.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "list"] });
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "getActive"] });
			queryClient.invalidateQueries({ queryKey: ["claudeCode", "getIntegration"] });
			toast.success("Account switched");
		},
		onError: (err: Error) => {
			toast.error(`Failed to switch account: ${err.message}`);
		},
	}));
	const renameMutation = useMutation(() => ({
		mutationFn: (input: { accountId: string; displayName: string }) =>
			desktopRpc.anthropicAccounts.rename.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "list"] });
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "getActive"] });
			toast.success("Account renamed");
		},
		onError: (err: Error) => {
			toast.error(`Failed to rename account: ${err.message}`);
		},
	}));
	const removeMutation = useMutation(() => ({
		mutationFn: (input: { accountId: string }) =>
			desktopRpc.anthropicAccounts.remove.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "list"] });
			queryClient.invalidateQueries({ queryKey: ["anthropicAccounts", "getActive"] });
			queryClient.invalidateQueries({ queryKey: ["claudeCode", "getIntegration"] });
			toast.success("Account removed");
		},
		onError: (err: Error) => {
			toast.error(`Failed to remove account: ${err.message}`);
		},
	}));
	const handleRename = (accountId: string, currentName: string | null) => {
		const newName = window.prompt("Enter new name for this account:", currentName || "Anthropic Account");
		if (newName && newName.trim()) {
			renameMutation.mutate({
				accountId,
				displayName: newName.trim()
			});
		}
	};
	const handleRemove = (accountId: string, displayName: string | null) => {
		const confirmed = window.confirm(`Are you sure you want to remove "${displayName || "this account"}"? You will need to re-authenticate to use it again.`);
		if (confirmed) {
			removeMutation.mutate({ accountId });
		}
	};
	const isLoading = () => setActiveMutation.isPending || renameMutation.isPending || removeMutation.isPending;
	// Don't show section if no accounts
	if (!isAccountsLoading() && (!accounts() || accounts()!.length === 0)) {
		return null;
	}
	return <div class="bg-background rounded-lg border border-border overflow-hidden divide-y divide-border">
        {isAccountsLoading() ? <div class="p-4 text-center text-sm text-muted-foreground">
            Loading accounts...
          </div> : accounts()?.map((account) => <AccountRow key={account.id} account={account} isActive={activeAccount()?.id === account.id} onSetActive={() => setActiveMutation.mutate({ accountId: account.id })} onRename={() => handleRename(account.id, account.displayName)} onRemove={() => handleRemove(account.id, account.displayName)} isLoading={isLoading()} />)}
    </div>;
}
export function AgentsModelsTab() {
	const [storedConfig, setStoredConfig] = customClaudeConfigAtom;
	const [model, setModel] = createSignal(storedConfig().model);
	const [baseUrl, setBaseUrl] = createSignal(storedConfig().baseUrl);
	const [token, setToken] = createSignal(storedConfig().token);
	const setAnthropicOnboardingCompleted = anthropicOnboardingCompletedAtom[1];
	const setSettingsOpen = agentsSettingsDialogOpenAtom[1];
	const isNarrowScreen = useIsNarrowScreen();

	const claudeCodeIntegrationQuery2 = useQuery(() => ({
		queryKey: ["claudeCode", "getIntegration"],
		queryFn: () => desktopRpc.claudeCode.getIntegration(),
	}));
	const claudeCodeIntegration2 = () => claudeCodeIntegrationQuery2.data;
	const isClaudeCodeLoading = () => claudeCodeIntegrationQuery2.isLoading;
	const isClaudeCodeConnected = () => claudeCodeIntegration2()?.isConnected;
	// OpenAI API key state
	const [storedOpenAIKey, setStoredOpenAIKey] = openaiApiKeyAtom;
	const [openaiKey, setOpenaiKey] = createSignal(storedOpenAIKey());
	const queryClient = useQueryClient();
	const setOpenAIKeyMutation = useMutation(() => ({
		mutationFn: (input: { key: string }) =>
			desktopRpc.voice.setOpenAIKey.mutate(input),
	}));
	createEffect(() => {
		setModel(storedConfig().model);
		setBaseUrl(storedConfig().baseUrl);
		setToken(storedConfig().token);
	});
	createEffect(() => {
		setOpenaiKey(storedOpenAIKey());
	});
	const trimmedModel = () => model().trim();
	const trimmedBaseUrl = () => baseUrl().trim();
	const trimmedToken = () => token().trim();
	const canSave = () => Boolean(trimmedModel() && trimmedBaseUrl() && trimmedToken());
	const canReset = () => Boolean(trimmedModel() || trimmedBaseUrl() || trimmedToken());
	const handleSave = () => {
		if (!canSave()) {
			toast.error("Fill model, token, and base URL to save");
			return;
		}
		const nextConfig: CustomClaudeConfig = {
			model: trimmedModel(),
			token: trimmedToken(),
			baseUrl: trimmedBaseUrl()
		};
		setStoredConfig(nextConfig);
		toast.success("Model settings saved");
	};
	const handleReset = () => {
		setStoredConfig(EMPTY_CONFIG);
		setModel("");
		setBaseUrl("");
		setToken("");
		toast.success("Model settings reset");
	};
	const handleClaudeCodeSetup = () => {
		// Don't disconnect - just open onboarding to add a new account
		// The previous code was calling disconnectClaudeCode.mutate() which
		// deleted the active account when users tried to add a new one
		setSettingsOpen(false);
		setAnthropicOnboardingCompleted(false);
	};
	// OpenAI key handlers
	const trimmedOpenAIKey = () => openaiKey().trim();
	const canSaveOpenAI = () => trimmedOpenAIKey() !== storedOpenAIKey();
	const canResetOpenAI = () => !!trimmedOpenAIKey();
	const handleSaveOpenAI = async () => {
		const key = trimmedOpenAIKey();
		if (key && !key.startsWith("sk-")) {
			toast.error("Invalid OpenAI API key format. Key should start with 'sk-'");
			return;
		}
		try {
			await setOpenAIKeyMutation.mutateAsync({ key });
			setStoredOpenAIKey(key);
			queryClient.invalidateQueries({ queryKey: ["voice", "isAvailable"] });
			toast.success("OpenAI API key saved");
		} catch (err) {
			toast.error("Failed to save OpenAI API key");
		}
	};
	const handleResetOpenAI = async () => {
		try {
			await setOpenAIKeyMutation.mutateAsync({ key: "" });
			setStoredOpenAIKey("");
			setOpenaiKey("");
			queryClient.invalidateQueries({ queryKey: ["voice", "isAvailable"] });
			toast.success("OpenAI API key removed");
		} catch (err) {
			toast.error("Failed to remove OpenAI API key");
		}
	};
    return <div class="p-6 space-y-6">
      {	/* Header - hidden on narrow screens since it's in the navigation bar */}
      <Show when={!isNarrowScreen()}>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 class="text-sm font-semibold text-foreground">Models</h3>
          <p class="text-xs text-muted-foreground">
            Configure model overrides and Claude Code authentication
          </p>
        </div>
      </Show>

      { /* Anthropic Accounts Section */}
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
          <Button size="sm" variant="outline" onClick={handleClaudeCodeSetup} disabled={isClaudeCodeLoading()}>
            <Plus class="h-3 w-3 mr-1" />
            {isClaudeCodeConnected() ? "Add" : "Connect"}
          </Button>
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
              <Label class="text-sm font-medium">Model name</Label>
              <p class="text-xs text-muted-foreground">
                Model identifier to use for requests
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <Input value={model()} onInput={(e) => setModel(e.currentTarget.value)} class="w-full" placeholder="claude-3-7-sonnet-20250219" />
            </div>
          </div>

          <div class="flex items-center justify-between gap-6">
            <div class="flex-1">
              <Label class="text-sm font-medium">API token</Label>
              <p class="text-xs text-muted-foreground">
                ANTHROPIC_AUTH_TOKEN env
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <Input type="password" value={token()} onInput={(e) => {
 setToken(e.currentTarget.value);
	}} class="w-full" placeholder="sk-ant-..." />
            </div>
          </div>

          <div class="flex items-center justify-between gap-6">
            <div class="flex-1">
              <Label class="text-sm font-medium">Base URL</Label>
              <p class="text-xs text-muted-foreground">
                ANTHROPIC_BASE_URL env
              </p>
            </div>
            <div class="flex-shrink-0 w-80">
              <Input value={baseUrl()} onInput={(e) => setBaseUrl(e.currentTarget.value)} class="w-full" placeholder="https://api.anthropic.com" />
            </div>
          </div>
        </div>

        <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={!canReset()} class="hover:bg-red-500/10 hover:text-red-600">
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave()}>
            Save
          </Button>
        </div>
        </div>
      </div>

      {	/* OpenAI API Key for Voice Input */}
      <div class="space-y-2">
        <div class="pb-2">
          <h4 class="text-sm font-medium text-foreground">Voice Input</h4>
        </div>

        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 space-y-4">
            <div class="flex items-center justify-between gap-6">
              <div class="flex-1">
                <Label class="text-sm font-medium">OpenAI API Key</Label>
                <p class="text-xs text-muted-foreground">
                  Required for voice transcription (Whisper API). Free users need their own key.
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <Input type="password" value={openaiKey()} onInput={(e) => setOpenaiKey(e.currentTarget.value)} class="w-full" placeholder="sk-..." />
              </div>
            </div>
          </div>

          <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleResetOpenAI} disabled={!canResetOpenAI() || setOpenAIKeyMutation.isPending} class="hover:bg-red-500/10 hover:text-red-600">
              Remove
            </Button>
            <Button size="sm" onClick={handleSaveOpenAI} disabled={!canSaveOpenAI() || setOpenAIKeyMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>;
 }
