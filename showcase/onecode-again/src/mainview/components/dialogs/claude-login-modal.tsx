/**
 * Claude Login Modal - Stub
 * TODO: Port full implementation from React to SolidJS
 *
 * This modal handles OAuth authentication for Claude Code.
 * For now, users should run 'claude login' in terminal first,
 * then use "Import existing token" in settings.
 */
import { X } from "lucide-solid";
import { createSignal, createEffect, Show, Switch, Match } from "solid-js";
import { agentsLoginModalOpenAtom } from "../../lib/atoms";
import { desktopRpc } from "../../lib/desktop-rpc";
import { cn } from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
} from "../ui/alert-dialog";
import { ClaudeCodeIcon, IconSpinner } from "../ui/icons";
import { Logo } from "../ui/logo";

export function ClaudeLoginModal() {
  const [open, setOpen] = agentsLoginModalOpenAtom;
  const [isImporting, setIsImporting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [hasSystemToken, setHasSystemToken] = createSignal(false);

  // Check for existing system token when modal opens
  createEffect(() => {
    if (open()) {
      desktopRpc.claudeCode.getSystemToken().then((result) => {
        setHasSystemToken(!!result.token);
      });
    }
  });

  const handleImportToken = async () => {
    setIsImporting(true);
    setError(null);
    try {
      await desktopRpc.claudeCode.importSystemToken.mutate();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import token");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <AlertDialog open={open()} onOpenChange={setOpen}>
      <AlertDialogContent class="w-[380px] p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          class="absolute right-4 top-4 h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted rounded-sm opacity-70 hover:opacity-100 flex items-center justify-center"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>

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
              <h1 class="text-base font-semibold tracking-tight">
                Claude Code
              </h1>
              <p class="text-sm text-muted-foreground">
                Connect your Claude Code subscription
              </p>
            </div>
          </div>

          {/* Content */}
          <div class="space-y-6">
            <Show when={hasSystemToken()}>
              <div class="p-4 bg-muted/50 border border-border rounded-lg">
                <p class="text-sm font-medium">
                  Existing Claude Code credentials found
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Click below to import your existing token from ~/.claude/
                </p>
              </div>
            </Show>

            <Show when={!hasSystemToken()}>
              <div class="p-4 bg-muted/50 border border-border rounded-lg">
                <p class="text-sm font-medium">
                  No existing credentials found
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Please run <code class="bg-muted px-1 py-0.5 rounded">claude login</code> in your terminal first,
                  then return here to import the token.
                </p>
              </div>
            </Show>

            <Show when={error()}>
              <div class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p class="text-sm text-destructive">{error()}</p>
              </div>
            </Show>

            <button
              onClick={handleImportToken}
              disabled={isImporting() || !hasSystemToken()}
              class={cn(
                "w-full h-8 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] flex items-center justify-center",
                (isImporting() || !hasSystemToken()) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Switch fallback="No token available">
                <Match when={isImporting()}>
                  <IconSpinner class="h-4 w-4" />
                </Match>
                <Match when={hasSystemToken()}>
                  Import existing token
                </Match>
              </Switch>
            </button>

            <p class="text-xs text-muted-foreground text-center">
              Full OAuth flow coming soon. For now, use the CLI to authenticate.
            </p>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
