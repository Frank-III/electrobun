import { Provider as StateProvider } from "./lib/state/store";
import { ColorModeProvider, ColorModeScript, useColorMode } from "@kobalte/core";
import { createEffect, createMemo, createSignal, onCleanup, Switch, Match, untrack } from "solid-js";
import { dbg } from "./lib/debug-effects";
import "./lib/electrobun-rpc";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryProvider } from "./contexts/QueryProvider";
import { WindowProvider, getInitialWindowParams } from "./contexts/WindowContext";
import { selectedProjectAtom, selectedAgentChatIdAtom } from "./lib/state/agents-store";
import { useAgentSubChatStore } from "./features/agents/stores/sub-chat-store";
import { AgentsLayout } from "./features/layout/agents-layout";
import { AnthropicOnboardingPage, ApiKeyOnboardingPage, BillingMethodPage, SelectRepoPage } from "./features/onboarding";
import { anthropicOnboardingCompletedAtom, apiKeyOnboardingCompletedAtom, billingMethodAtom } from "./lib/atoms";
import { appStore } from "./lib/app-store";
import { VSCodeThemeProvider } from "./lib/themes/theme-provider";
import { desktopRpc } from "./lib/desktop-rpc";
import { TerminalStoreProvider } from "./features/terminal/terminal-store-context";
import { useQuery } from "@tanstack/solid-query";
/**
* Custom Toaster that adapts to theme
*/
function ThemedToaster() {
	const { colorMode } = useColorMode();
	return <Toaster position="bottom-right" theme={colorMode()} closeButton />;
}
/**
* Main content router - decides which page to show based on onboarding state
*/
function AppContent() {
	const billingMethod = billingMethodAtom[0];
	const setBillingMethod = billingMethodAtom[1];
	const anthropicOnboardingCompleted = anthropicOnboardingCompletedAtom[0];
	const setAnthropicOnboardingCompleted = anthropicOnboardingCompletedAtom[1];
	const apiKeyOnboardingCompleted = apiKeyOnboardingCompletedAtom[0];
	const setApiKeyOnboardingCompleted = apiKeyOnboardingCompletedAtom[1];
	const selectedProject = selectedProjectAtom[0];
	const setSelectedChatId = selectedAgentChatIdAtom[1];
	const { setActiveSubChat, addToOpenSubChats, setChatId } = useAgentSubChatStore();
	// Apply initial window params (chatId/subChatId) when opening via "Open in new window"
	createEffect(() => {
		dbg("App:windowParams");
		const params = getInitialWindowParams();
		if (params.chatId) {
			console.log("[App] Opening chat from window params:", params.chatId, params.subChatId);
			setSelectedChatId(params.chatId);
			setChatId(params.chatId);
			if (params.subChatId) {
				addToOpenSubChats(params.subChatId);
				setActiveSubChat(params.subChatId);
			}
		}
	});
	// Check if user has existing CLI config (API key or proxy)
	// Based on PR #29 by @sa4hnd
	const [cliConfig, setCliConfig] = createSignal<{ hasConfig: boolean; hasApiKey: boolean; baseUrl: string | null } | null>(null);
	createEffect(() => {
		dbg("App:cliConfig");
		let cancelled = false;
		desktopRpc.claudeCode.hasExistingCliConfig()
			.then((data) => {
				if (!cancelled) setCliConfig(data);
			})
			.catch((err) => {
				console.error("[App] Failed to check CLI config:", err);
				if (!cancelled) setCliConfig({ hasConfig: false, hasApiKey: false, baseUrl: null });
			});
		onCleanup(() => {
			cancelled = true;
		});
	});
	// Migration: If user already completed Anthropic onboarding but has no billing method set,
	// automatically set it to "claude-subscription" (legacy users before billing method was added)
	createEffect(() => {
		dbg("App:migration");
		if (!billingMethod() && anthropicOnboardingCompleted()) {
			untrack(() => setBillingMethod("claude-subscription"));
		}
	});
	// Auto-skip onboarding if user has existing CLI config (API key or proxy)
	// This allows users with ANTHROPIC_API_KEY to use the app without OAuth
	createEffect(() => {
		dbg("App:autoSkip");
		const cfg = cliConfig();
		if (cfg?.hasConfig && !billingMethod()) {
			console.log("[App] Detected existing CLI config, auto-completing onboarding");
			untrack(() => {
				setBillingMethod("api-key");
				setApiKeyOnboardingCompleted(true);
			});
		}
	});

	const shouldLoadProjects = createMemo(() => {
		if (!billingMethod()) return false;
		if (billingMethod() === "claude-subscription" && !anthropicOnboardingCompleted()) return false;
		if ((billingMethod() === "api-key" || billingMethod() === "custom-model") && !apiKeyOnboardingCompleted()) return false;
		return true;
	});

	// Projects list (shared cache) — keeps App.tsx in sync with SelectRepoPage/NewChatForm
	// so selecting a folder doesn't cause route thrash / "not responsive" state.
	const projectsQuery = useQuery(() => ({
		queryKey: ["projects", "list"] as const,
		enabled: shouldLoadProjects(),
		queryFn: async () => {
			try {
				return await desktopRpc.projects.list.query();
			} catch (err) {
				console.error("[App] Failed to load projects:", err);
				return [];
			}
		},
	}));
	const projects = () => projectsQuery.data;
	const isLoadingProjects = () => projectsQuery.data === undefined;

	// Validated project - only valid if exists in DB
	const validatedProject = createMemo(() => {
		if (!selectedProject()) return null;
		// While loading, trust localStorage value to prevent flicker
		if (isLoadingProjects()) return selectedProject();
		// After loading, validate against DB
		const projs = projects();
		if (!projs) return null;
		const current = selectedProject();
		if (!current) return null;
		const exists = projs.some((p) => p.id === current.id);
		return exists ? current : null;
	});
	// Determine which page to show:
	// 1. No billing method selected -> BillingMethodPage
	// 2. Claude subscription selected but not completed -> AnthropicOnboardingPage
	// 3. API key or custom model selected but not completed -> ApiKeyOnboardingPage
	// 4. No valid project selected -> SelectRepoPage
	// 5. Otherwise -> AgentsLayout
	// Note: Using Switch/Match for proper SolidJS reactivity.
	// IMPORTANT: Do not mount AgentsLayout as a fallback. If the app is still resolving
	// onboarding/project state (auto-skip, migration, projects load), switching between
	// matches can cause AgentsLayout to mount/unmount rapidly.
	const isReadyToRoute = createMemo(() => {
		// Wait until billing method is chosen.
		if (!billingMethod()) return false;
		// Wait for onboarding completion flags relevant to the chosen billing method.
		if (billingMethod() === "claude-subscription" && !anthropicOnboardingCompleted()) return false;
		if ((billingMethod() === "api-key" || billingMethod() === "custom-model") && !apiKeyOnboardingCompleted()) return false;
		// If we should load projects, wait until they are loaded.
		if (shouldLoadProjects() && projectsQuery.data === undefined) return false;
		return true;
	});

	const LoadingGate = () => (
		<div class="h-screen w-screen flex items-center justify-center bg-background text-foreground select-none">
			<div class="text-sm text-muted-foreground">Loading…</div>
		</div>
	);

	return (
		<Switch fallback={<LoadingGate />}>
			<Match when={!billingMethod()}>
				<BillingMethodPage />
			</Match>
			<Match when={billingMethod() === "claude-subscription" && !anthropicOnboardingCompleted()}>
				<AnthropicOnboardingPage />
			</Match>
			<Match when={(billingMethod() === "api-key" || billingMethod() === "custom-model") && !apiKeyOnboardingCompleted()}>
				<ApiKeyOnboardingPage />
			</Match>
			<Match when={isReadyToRoute() && !validatedProject()}>
				<SelectRepoPage />
			</Match>
			<Match when={isReadyToRoute() && !!validatedProject()}>
				<AgentsLayout />
			</Match>
		</Switch>
	);
}
export function App() {
	return <WindowProvider>
      <ColorModeScript initialColorMode="system" />
      <ColorModeProvider initialColorMode="system">
        <TerminalStoreProvider>
        <StateProvider store={appStore}>
          <VSCodeThemeProvider>
            <TooltipProvider delayDuration={100}>
              <QueryProvider>
                <div data-agents-page class="h-screen w-screen bg-background text-foreground overflow-hidden">
                  <AppContent />
                </div>
                <ThemedToaster />
              </QueryProvider>
            </TooltipProvider>
          </VSCodeThemeProvider>
        </StateProvider>
        </TerminalStoreProvider>
      </ColorModeProvider>
    </WindowProvider>;
}
