import { cn } from "../../../../lib/utils";
import { CircleDot, GitMerge, GitPullRequest } from "lucide-solid";
export type PRState = "open" | "merged" | "closed" | "draft";
interface PRIconProps {
	state: PRState;
	class?: string;
}
const stateStyles: Record<PRState, string> = {
	open: "text-emerald-500",
	merged: "text-violet-500",
	closed: "text-red-500",
	draft: "text-muted-foreground"
};
/**
* Renders a PR icon with color based on state.
* - open: green pull request icon
* - merged: purple/violet merge icon
* - closed: red dot icon
* - draft: muted pull request icon
*/
export function PRIcon({ state, class: cls }: PRIconProps) {
	const baseClass = cn(stateStyles[state],cls);
	if (state === "merged") {
		return <GitMerge class={baseClass} />;
	}
	if (state === "closed") {
		return <CircleDot class={baseClass} />;
	}
	// open or draft
	return <GitPullRequest class={baseClass} />;
}
