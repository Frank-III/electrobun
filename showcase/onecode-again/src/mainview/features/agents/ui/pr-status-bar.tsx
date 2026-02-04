import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../../lib/desktop-rpc";
import { GitPullRequest } from "lucide-solid";
import { IconSpinner } from "../../../components/ui/icons";
import { splitProps, Switch, Match } from "solid-js";
interface PrStatusBarProps {
	chatId: string;
	prUrl: string;
	prNumber: number;
}
type PrState = "open" | "draft" | "merged" | "closed";
type ReviewDecision = "approved" | "changes_requested" | "pending";
function getStatusLabel(state: PrState, reviewDecision?: ReviewDecision): string {
	if (state === "merged") return "Merged";
	if (state === "closed") return "Closed";
	if (state === "draft") return "Draft";
	if (reviewDecision === "approved") return "Ready to merge";
	if (reviewDecision === "changes_requested") return "Changes requested";
	return "Open";
}
export function PrStatusBar(props: PrStatusBarProps) {
	const [local] = splitProps(props, ["chatId", "prUrl", "prNumber"]);
	console.log("[PrStatusBar] Rendered with props:", {
		chatId: local.chatId,
		prUrl: local.prUrl,
		prNumber: local.prNumber
	});
	// Poll PR status every 30 seconds
	const prStatusQuery = useQuery(() => ({
		queryKey: ["chats", "getPrStatus", local.chatId],
		queryFn: () => desktopRpc.chats.getPrStatus({ chatId: local.chatId }),
		refetchInterval: 3e4,
	}));
	const status = () => prStatusQuery.data;
	const isLoading = () => prStatusQuery.isLoading;
	const pr = () => status()?.pr;
	const handleOpenPr = () => {
		window.desktopApi?.openExternal(local.prUrl);
	};
	return <div class="flex items-center gap-3 px-3 py-2 bg-muted/30 border-b border-border/50">
      {	/* PR Link */}
      <button onClick={handleOpenPr} class="flex items-center gap-1.5 text-sm font-medium hover:underline text-foreground cursor-pointer">
        <GitPullRequest class="h-4 w-4" />
	        <span>PR #{local.prNumber}</span>
      </button>

      { /* Status */}
      <Switch>
        <Match when={isLoading()}>
          <IconSpinner class="h-3.5 w-3.5" />
        </Match>
        <Match when={pr()}>
          <span class="text-xs font-mono text-muted-foreground">
            {getStatusLabel(pr()!.state as PrState, pr()!.reviewDecision as ReviewDecision)}
          </span>
        </Match>
      </Switch>
    </div>;
 }
