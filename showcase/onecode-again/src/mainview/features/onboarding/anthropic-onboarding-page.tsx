/**
 * Anthropic Onboarding Page - SolidJS Version
 *
 * Handles OAuth authentication for Claude Code subscription.
 * For now, simplified to import existing token or instruct users to run 'claude login'.
 */
import { ChevronLeft } from "lucide-solid";
import { createSignal, createEffect, Show, type JSX } from "solid-js";
import { ClaudeCodeIcon, IconSpinner } from "../../components/ui/icons";
import { Logo } from "../../components/ui/logo";
import { anthropicOnboardingCompletedAtom, billingMethodAtom } from "../../lib/atoms";
import { cn } from "../../lib/utils";
import { desktopRpc } from "../../lib/desktop-rpc";

type AuthFlowState =
  | { step: "idle" }
  | { step: "checking" }
  | { step: "has_token"; tokenPreview: string }
  | { step: "no_token" }
  | { step: "importing" }
  | { step: "error"; message: string };

export function AnthropicOnboardingPage() {
  const [flowState, setFlowState] = createSignal<AuthFlowState>({ step: "idle" });
  const [, setAnthropicOnboardingCompleted] = anthropicOnboardingCompletedAtom;
  const [, setBillingMethod] = billingMethodAtom;

  const handleBack = () => {
    setBillingMethod(null);
  };

  const formatTokenPreview = (token: string) => {
    const trimmed = token.trim();
    if (trimmed.length <= 16) return trimmed;
    return `${trimmed.slice(0, 19)}...${trimmed.slice(-6)}`;
  };

  // Check for existing token on mount
  createEffect(() => {
    if (flowState().step === "idle") {
      setFlowState({ step: "checking" });
      desktopRpc.claudeCode.getSystemToken().then((result) => {
        if (result.token) {
          setFlowState({
            step: "has_token",
            tokenPreview: formatTokenPreview(result.token),
          });
        } else {
          setFlowState({ step: "no_token" });
        }
      }).catch((err) => {
        setFlowState({
          step: "error",
          message: err instanceof Error ? err.message : "Failed to check for token",
        });
      });
    }
  });

  const handleUseExistingToken = async () => {
    setFlowState({ step: "importing" });
    try {
      await desktopRpc.claudeCode.importSystemToken.mutate({});
      setAnthropicOnboardingCompleted(true);
    } catch (err) {
      setFlowState({
        step: "error",
        message: err instanceof Error ? err.message : "Failed to import token",
      });
    }
  };

  const handleRetry = () => {
    setFlowState({ step: "idle" });
  };

  const isImporting = () => flowState().step === "importing";
  const isChecking = () => flowState().step === "checking";

  return (
    <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" } as JSX.CSSProperties} />

      {/* Back button */}
      <button
        onClick={handleBack}
        class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>

      <div class="w-full max-w-[440px] space-y-8 px-4">
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
            <h1 class="text-base font-semibold tracking-tight">
              Connect Claude Code
            </h1>
            <p class="text-sm text-muted-foreground">
              Connect your Claude Code subscription to get started
            </p>
          </div>
        </div>

        {/* Content */}
        <div class="space-y-6 flex flex-col items-center">
          {/* Loading state */}
          <Show when={isChecking()}>
            <div class="flex items-center gap-2 text-muted-foreground">
              <IconSpinner class="h-4 w-4" />
              <span class="text-sm">Checking for existing credentials...</span>
            </div>
          </Show>

          {/* Has existing token */}
          <Show when={flowState().step === "has_token"}>
            <div class="space-y-4 w-full">
              <div class="p-4 bg-muted/50 border border-border rounded-lg">
                <p class="text-sm font-medium">
                  Existing Claude Code credentials found
                </p>
                <pre class="mt-2 px-2.5 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-mono bg-background/60 rounded border border-border/60">
                  {(flowState() as { step: "has_token"; tokenPreview: string }).tokenPreview}
                </pre>
              </div>
              <button
                onClick={handleUseExistingToken}
                disabled={isImporting()}
                class={cn("w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center", isImporting() && "opacity-50 cursor-not-allowed")}
              >
                <Show when={isImporting()} fallback="Use existing token">
                  <IconSpinner class="h-4 w-4" />
                </Show>
              </button>
            </div>
          </Show>

          {/* No token found */}
          <Show when={flowState().step === "no_token"}>
            <div class="space-y-4 w-full">
              <div class="p-4 bg-muted/50 border border-border rounded-lg">
                <p class="text-sm font-medium">
                  No existing credentials found
                </p>
                <p class="text-xs text-muted-foreground mt-2">
                  Please run the following command in your terminal to authenticate:
                </p>
                <pre class="mt-2 px-2.5 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-mono bg-background/60 rounded border border-border/60">
                  claude login
                </pre>
                <p class="text-xs text-muted-foreground mt-2">
                  After completing the authentication, click "Retry" to import your credentials.
                </p>
              </div>
              <button
                onClick={handleRetry}
                class="w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center"
              >
                Retry
              </button>
            </div>
          </Show>

          {/* Error state */}
          <Show when={flowState().step === "error"}>
            <div class="space-y-4 w-full">
              <div class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p class="text-sm text-destructive">
                  {(flowState() as { step: "error"; message: string }).message}
                </p>
              </div>
              <button
                onClick={handleRetry}
                class="w-full h-8 px-3 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] flex items-center justify-center"
              >
                Try Again
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
