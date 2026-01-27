"use client";
import { useAtom, useSetAtom } from "../../lib/state/jotai";
import { X } from "lucide-solid";
import { createEffect, createSignal, Show } from "solid-js";
import { pendingAuthRetryMessageAtom } from "../../features/agents/atoms";
import { agentsLoginModalOpenAtom, agentsSettingsDialogActiveTabAtom, agentsSettingsDialogOpenAtom, type SettingsTab } from "../../lib/atoms";
import { appStore } from "../../lib/jotai-store";
import { trpc } from "../../lib/trpc";
import { AlertDialog, AlertDialogCancel, AlertDialogContent } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { ClaudeCodeIcon, IconSpinner } from "../ui/icons";
import { Input } from "../ui/input";
import { Logo } from "../ui/logo";

type AuthFlowState = {
	step: "idle";
} | {
	step: "starting";
} | {
	step: "waiting_url";
	sandboxId: string;
	sandboxUrl: string;
	sessionId: string;
} | {
	step: "has_url";
	sandboxId: string;
	oauthUrl: string;
	sandboxUrl: string;
	sessionId: string;
} | {
	step: "submitting";
} | {
	step: "error";
	message: string;
};

export function ClaudeLoginModal() {
	const [open, setOpen] = useAtom(agentsLoginModalOpenAtom);
	const setSettingsOpen = useSetAtom(agentsSettingsDialogOpenAtom);
	const setSettingsActiveTab = useSetAtom(agentsSettingsDialogActiveTabAtom);
	const [flowState, setFlowState] = createSignal<AuthFlowState>({ step: "idle" });
	const [authCode, setAuthCode] = createSignal("");
	const [userClickedConnect, setUserClickedConnect] = createSignal(false);
	const [urlOpened, setUrlOpened] = createSignal(false);
	const [savedOauthUrl, setSavedOauthUrl] = createSignal<string | null>(null);

	// Use a simple variable for the ref - SolidJS doesn't need ref objects
	let urlOpenedRef = false;

	// tRPC mutations
	const startAuthMutation = trpc.claudeCode.startAuth.useMutation();
	const submitCodeMutation = trpc.claudeCode.submitCode.useMutation();
	const openOAuthUrlMutation = trpc.claudeCode.openOAuthUrl.useMutation();

	// Poll for OAuth URL
	const pollStatusQuery = trpc.claudeCode.pollStatus.useQuery(() => {
		const state = flowState();
		return {
			sandboxUrl: state.step === "waiting_url" ? state.sandboxUrl : "",
			sessionId: state.step === "waiting_url" ? state.sessionId : ""
		};
	}, () => ({
		enabled: flowState().step === "waiting_url",
		refetchInterval: 1500
	}));

	// Update flow state when we get the OAuth URL
	createEffect(() => {
		const state = flowState();
		if (state.step === "waiting_url" && pollStatusQuery.data?.oauthUrl) {
			setSavedOauthUrl(pollStatusQuery.data.oauthUrl);
			setFlowState({
				step: "has_url",
				sandboxId: state.sandboxId,
				oauthUrl: pollStatusQuery.data.oauthUrl,
				sandboxUrl: state.sandboxUrl,
				sessionId: state.sessionId
			});
		} else if (state.step === "waiting_url" && pollStatusQuery.data?.state === "error") {
			setFlowState({
				step: "error",
				message: pollStatusQuery.data.error || "Failed to get OAuth URL"
			});
		}
	});

	// Open URL in browser when ready (after user clicked Connect)
	createEffect(() => {
		const state = flowState();
		if (state.step === "has_url" && userClickedConnect() && !urlOpenedRef) {
			urlOpenedRef = true;
			setUrlOpened(true);
			openOAuthUrlMutation.mutate(state.oauthUrl);
		}
	});

	// Reset state when modal closes
	createEffect(() => {
		if (!open()) {
			setFlowState({ step: "idle" });
			setAuthCode("");
			setUserClickedConnect(false);
			setUrlOpened(false);
			setSavedOauthUrl(null);
			urlOpenedRef = false;
		}
	});

	// Helper to trigger retry after successful OAuth
	const triggerAuthRetry = () => {
		const pending = appStore.get(pendingAuthRetryMessageAtom);
		if (pending) {
			console.log("[ClaudeLoginModal] OAuth success - triggering retry for subChatId:", pending.subChatId);
			appStore.set(pendingAuthRetryMessageAtom, {
				...pending,
				readyToRetry: true
			});
		}
	};

	// Helper to clear pending retry (on cancel/close without success)
	const clearPendingRetry = () => {
		const pending = appStore.get(pendingAuthRetryMessageAtom);
		if (pending && !pending.readyToRetry) {
			console.log("[ClaudeLoginModal] Modal closed without success - clearing pending retry");
			appStore.set(pendingAuthRetryMessageAtom, null);
		}
	};

	// Check if the code looks like a valid Claude auth code (format: XXX#YYY)
	const isValidCodeFormat = (code: string) => {
		const trimmed = code.trim();
		return trimmed.length > 50 && trimmed.includes("#");
	};

	const handleConnectClick = async () => {
		setUserClickedConnect(true);
		const state = flowState();
		if (state.step === "has_url") {
			// URL is ready, open it immediately
			urlOpenedRef = true;
			setUrlOpened(true);
			openOAuthUrlMutation.mutate(state.oauthUrl);
		} else if (state.step === "error") {
			// Retry on error
			urlOpenedRef = false;
			setUrlOpened(false);
			setFlowState({ step: "starting" });
			try {
				const result = await startAuthMutation.mutateAsync();
				setFlowState({
					step: "waiting_url",
					sandboxId: result.sandboxId,
					sandboxUrl: result.sandboxUrl,
					sessionId: result.sessionId
				});
			} catch (err) {
				setFlowState({
					step: "error",
					message: err instanceof Error ? err.message : "Failed to start authentication"
				});
			}
		} else if (state.step === "idle") {
			// Start auth
			setFlowState({ step: "starting" });
			try {
				const result = await startAuthMutation.mutateAsync();
				setFlowState({
					step: "waiting_url",
					sandboxId: result.sandboxId,
					sandboxUrl: result.sandboxUrl,
					sessionId: result.sessionId
				});
			} catch (err) {
				setFlowState({
					step: "error",
					message: err instanceof Error ? err.message : "Failed to start authentication"
				});
			}
		}
	};

	const handleSubmitCode = async () => {
		const state = flowState();
		if (!authCode().trim() || state.step !== "has_url") return;
		const { sandboxUrl, sessionId } = state;
		setFlowState({ step: "submitting" });
		try {
			await submitCodeMutation.mutateAsync({
				sandboxUrl,
				sessionId,
				code: authCode().trim()
			});
			// Success - trigger retry and close modal
			triggerAuthRetry();
			setOpen(false);
		} catch (err) {
			setFlowState({
				step: "error",
				message: err instanceof Error ? err.message : "Failed to submit code"
			});
		}
	};

	const handleCodeChange = (e: Event & { currentTarget: HTMLInputElement }) => {
		const value = e.currentTarget.value;
		setAuthCode(value);
		// Auto-submit if the pasted value looks like a valid auth code
		const state = flowState();
		if (isValidCodeFormat(value) && state.step === "has_url") {
			const { sandboxUrl, sessionId } = state;
			setTimeout(async () => {
				setFlowState({ step: "submitting" });
				try {
					await submitCodeMutation.mutateAsync({
						sandboxUrl,
						sessionId,
						code: value.trim()
					});
					// Success - trigger retry and close modal
					triggerAuthRetry();
					setOpen(false);
				} catch (err) {
					setFlowState({
						step: "error",
						message: err instanceof Error ? err.message : "Failed to submit code"
					});
				}
			}, 100);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && authCode().trim()) {
			handleSubmitCode();
		}
	};

	const handleOpenFallbackUrl = () => {
		const url = savedOauthUrl();
		if (url) {
			openOAuthUrlMutation.mutate(url);
		}
	};

	const handleOpenModelsSettings = () => {
		clearPendingRetry();
		setSettingsActiveTab("models" as SettingsTab);
		setSettingsOpen(true);
		setOpen(false);
	};

	const isLoadingAuth = () => {
		const s = flowState().step;
		return s === "starting" || s === "waiting_url";
	};
	const isSubmitting = () => flowState().step === "submitting";

	// Handle modal open/close - clear pending retry if closing without success
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			clearPendingRetry();
		}
		setOpen(newOpen);
	};

	return (
		<AlertDialog open={open()} onOpenChange={handleOpenChange}>
			<AlertDialogContent class="w-[380px] p-6">
				{/* Close button */}
				<AlertDialogCancel class="absolute right-4 top-4 h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted rounded-sm opacity-70 hover:opacity-100">
					<X class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</AlertDialogCancel>

				<div class="space-y-8">
					{/* Header with dual icons */}
					<div class="text-center space-y-4">
						<div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
							<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
								<Logo class="w-5 h-5" fill="white" />
							</div>
							<div class="w-10 h-10 rounded-full bg-[#D97757] flex items-center justify-center">
								<ClaudeCodeIcon class="w-6 h-6 text-white" />
							</div>
						</div>
						<div class="space-y-1">
							<h1 class="text-base font-semibold tracking-tight">Claude Code</h1>
							<p class="text-sm text-muted-foreground">Connect your Claude Code subscription</p>
						</div>
					</div>

					{/* Content */}
					<div class="space-y-6">
						{/* Connect Button - shows loader only if user clicked AND loading */}
						<Show when={!urlOpened() && flowState().step !== "has_url" && flowState().step !== "error"}>
							<Button onClick={handleConnectClick} class="w-full" disabled={userClickedConnect() && isLoadingAuth()}>
								<Show when={userClickedConnect() && isLoadingAuth()} fallback="Connect">
									<IconSpinner class="h-4 w-4" />
								</Show>
							</Button>
						</Show>

						{/* Code Input - Show after URL is opened or if has_url */}
						<Show when={urlOpened() || flowState().step === "has_url" || flowState().step === "submitting"}>
							<div class="space-y-4">
								<Input
									value={authCode()}
									onInput={handleCodeChange}
									onKeyDown={handleKeyDown}
									placeholder="Paste your authentication code here..."
									class="font-mono text-center"
									autofocus
									disabled={isSubmitting()}
								/>
								<Button onClick={handleSubmitCode} class="w-full" disabled={!authCode().trim() || isSubmitting()}>
									<Show when={isSubmitting()} fallback="Continue">
										<IconSpinner class="h-4 w-4" />
									</Show>
								</Button>
								<p class="text-xs text-muted-foreground text-center">
									A new tab has opened for authentication.
									<Show when={savedOauthUrl()}>
										{" "}
										<button onClick={handleOpenFallbackUrl} class="text-primary hover:underline">
											Didn't open? Click here
										</button>
									</Show>
								</p>
							</div>
						</Show>

						{/* Error State */}
						<Show when={flowState().step === "error"}>
							<div class="space-y-4">
								<div class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
									<p class="text-sm text-destructive">{(flowState() as { step: "error"; message: string }).message}</p>
								</div>
								<Button variant="secondary" onClick={handleConnectClick} class="w-full">
									Try Again
								</Button>
							</div>
						</Show>

						<div class="text-center !mt-2">
							<button
								type="button"
								onClick={handleOpenModelsSettings}
								class="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
							>
								Set a custom model in Settings
							</button>
						</div>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
