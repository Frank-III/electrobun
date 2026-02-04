// GitHubStatus type inferred from desktop RPC
interface GitHubStatus {
	pr: {
		number: number;
		title: string;
		url: string;
		state: string;
		reviewDecision?: string;
	} | null;
	repoUrl: string | null;
	branchExistsOnRemote: boolean;
}
import { useQuery } from "@tanstack/solid-query";
import { desktopRpc } from "../../lib/desktop-rpc";

interface UsePRStatusOptions {
	worktreePath: string | undefined;
	enabled?: boolean;
	refetchInterval?: number;
}

interface UsePRStatusResult {
	pr: () => GitHubStatus["pr"] | null;
	repoUrl: () => string | null;
	branchExistsOnRemote: () => boolean;
	isLoading: () => boolean;
	refetch: () => void;
}

/**
 * Hook to fetch and manage GitHub PR status for a worktree.
 * Returns PR info, loading state, and refetch function.
 */
export function usePRStatus({
	worktreePath,
	enabled = true,
	refetchInterval = 10000,
}: UsePRStatusOptions): UsePRStatusResult {
	const query = useQuery(() => ({
		queryKey: ["changes", "getGitHubStatus", worktreePath],
		queryFn: () => desktopRpc.changes.getGitHubStatus({ worktreePath: worktreePath! }),
		enabled: enabled && !!worktreePath,
		refetchInterval,
	}));

	const githubStatus = () => query.data;

	return {
		pr: () => githubStatus()?.pr ?? null,
		repoUrl: () => githubStatus()?.repoUrl ?? null,
		branchExistsOnRemote: () => githubStatus()?.branchExistsOnRemote ?? false,
		isLoading: () => query.isLoading,
		refetch: () => query.refetch(),
	};
}
