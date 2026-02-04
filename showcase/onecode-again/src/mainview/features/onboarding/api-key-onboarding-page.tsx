import { createSignal, createEffect, Show, Switch, Match, type JSX } from "solid-js";
import { ChevronLeft } from "lucide-solid";
import { IconSpinner, KeyFilledIcon, SettingsFilledIcon } from "../../components/ui/icons";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Logo } from "../../components/ui/logo";
import { apiKeyOnboardingCompletedAtom, billingMethodAtom, customClaudeConfigAtom, type CustomClaudeConfig } from "../../lib/atoms";
import { cn } from "../../lib/utils";
// Check if the key looks like a valid Anthropic API key
const isValidApiKey = (key: string) => {
	const trimmed = key.trim();
	return trimmed.startsWith("sk-ant-") && trimmed.length > 20;
};
export function ApiKeyOnboardingPage() {
	const [storedConfig, setStoredConfig] = customClaudeConfigAtom;
	const billingMethod = billingMethodAtom[0];
	const setBillingMethod = billingMethodAtom[1];
	const setApiKeyOnboardingCompleted = apiKeyOnboardingCompletedAtom[1];
	// Make isCustomModel a function for reactivity
	const isCustomModel = () => billingMethod() === "custom-model";
	// Default values for API key mode (not custom model)
	const defaultModel = "claude-sonnet-4-20250514";
	const defaultBaseUrl = "https://api.anthropic.com";
	const [apiKey, setApiKey] = createSignal(storedConfig().token);
	const [model, setModel] = createSignal(storedConfig().model || "");
	const [token, setToken] = createSignal(storedConfig().token);
	const [baseUrl, setBaseUrl] = createSignal(storedConfig().baseUrl || "");
	const [isSubmitting, setIsSubmitting] = createSignal(false);
	// Sync from stored config on mount
	createEffect(() => {
		const config = storedConfig();
		if (config.token) {
			setApiKey(config.token);
			setToken(config.token);
		}
		if (config.model) setModel(config.model);
		if (config.baseUrl) setBaseUrl(config.baseUrl);
	});
	const handleBack = () => {
		setBillingMethod(null);
	};
	// Submit for API key mode (simple - just the key)
	const submitApiKey = (key: string) => {
		if (!isValidApiKey(key)) return;
		setIsSubmitting(true);
		const config: CustomClaudeConfig = {
			model: defaultModel,
			token: key.trim(),
			baseUrl: defaultBaseUrl
		};
		setStoredConfig(config);
		setApiKeyOnboardingCompleted(true);
		setIsSubmitting(false);
	};
	// Submit for custom model mode (all three fields)
	const submitCustomModel = () => {
		const trimmedModel = model().trim();
		const trimmedToken = token().trim();
		const trimmedBaseUrl = baseUrl().trim();
		if (!trimmedModel || !trimmedToken || !trimmedBaseUrl) return;
		setIsSubmitting(true);
		const config: CustomClaudeConfig = {
			model: trimmedModel,
			token: trimmedToken,
			baseUrl: trimmedBaseUrl
		};
		setStoredConfig(config);
		setApiKeyOnboardingCompleted(true);
		setIsSubmitting(false);
	};
	const handleApiKeyChange = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
		const value = e.currentTarget.value;
		setApiKey(value);
		// Auto-submit if valid API key is pasted
		if (isValidApiKey(value)) {
			setTimeout(() => submitApiKey(value), 100);
		}
	};
	const handleApiKeyKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && apiKey().trim()) {
			submitApiKey(apiKey());
		}
	};
	const canSubmitCustomModel = () => Boolean(model().trim() && token().trim() && baseUrl().trim());

	// Simple API key input mode component
	const ApiKeyPage = () => (
		<div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
			<div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" } as JSX.CSSProperties} />
			<button onClick={handleBack} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
				<ChevronLeft class="h-5 w-5" />
			</button>
			<div class="w-full max-w-[440px] space-y-8 px-4">
				<div class="text-center space-y-4">
					<div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
						<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<Logo class="w-5 h-5" fill="white" />
						</div>
						<div class="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
							<KeyFilledIcon class="w-5 h-5 text-background" />
						</div>
					</div>
					<div class="space-y-1">
						<h1 class="text-base font-semibold tracking-tight">Enter API Key</h1>
						<p class="text-sm text-muted-foreground">
							Get your API key from{" "}
							<a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" class="text-foreground hover:underline">
								console.anthropic.com
							</a>
						</p>
					</div>
				</div>
				<div class="space-y-4">
					<div class="relative">
						<Input value={apiKey()} onInput={handleApiKeyChange} onKeyDown={handleApiKeyKeyDown} placeholder="sk-ant-..." class="font-mono text-center pr-10" autofocus disabled={isSubmitting()} />
						<Show when={isSubmitting()}>
							<div class="absolute right-3 top-1/2 -translate-y-1/2">
								<IconSpinner class="h-4 w-4" />
							</div>
						</Show>
					</div>
					<p class="text-xs text-muted-foreground text-center">Your API key starts with sk-ant-</p>
				</div>
			</div>
		</div>
	);

	// Custom model mode component with all fields
	const CustomModelPage = () => (
		<div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
			<div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" } as JSX.CSSProperties} />
			<button onClick={handleBack} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
				<ChevronLeft class="h-5 w-5" />
			</button>
			<div class="w-full max-w-[440px] space-y-8 px-4">
				<div class="text-center space-y-4">
					<div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
						<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
							<Logo class="w-5 h-5" fill="white" />
						</div>
						<div class="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
							<SettingsFilledIcon class="w-5 h-5 text-background" />
						</div>
					</div>
					<div class="space-y-1">
						<h1 class="text-base font-semibold tracking-tight">Configure Custom Model</h1>
						<p class="text-sm text-muted-foreground">Enter your custom model configuration</p>
					</div>
				</div>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label class="text-sm font-medium">Model name</Label>
						<Input value={model()} onInput={(e) => setModel(e.currentTarget.value)} placeholder="claude-sonnet-4-20250514" class="w-full" />
						<p class="text-xs text-muted-foreground">Model identifier for API requests</p>
					</div>
					<div class="space-y-2">
						<Label class="text-sm font-medium">API token</Label>
						<Input type="password" value={token()} onInput={(e) => setToken(e.currentTarget.value)} placeholder="sk-ant-..." class="w-full" />
						<p class="text-xs text-muted-foreground">Your API key or token</p>
					</div>
					<div class="space-y-2">
						<Label class="text-sm font-medium">Base URL</Label>
						<Input value={baseUrl()} onInput={(e) => setBaseUrl(e.currentTarget.value)} placeholder="https://api.anthropic.com" class="w-full" />
						<p class="text-xs text-muted-foreground">API endpoint URL</p>
					</div>
				</div>
				<button onClick={submitCustomModel} disabled={!canSubmitCustomModel() || isSubmitting()} class={cn("w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center", (!canSubmitCustomModel() || isSubmitting()) && "opacity-50 cursor-not-allowed")}>
					<Show when={isSubmitting()} fallback={"Continue"}><IconSpinner class="h-4 w-4" /></Show>
				</button>
			</div>
		</div>
	);

	// Use Switch/Match for proper SolidJS reactivity (if/return doesn't re-run on signal changes)
	return (
		<Switch fallback={<ApiKeyPage />}>
			<Match when={isCustomModel()}>
				<CustomModelPage />
			</Match>
		</Switch>
	);
}
