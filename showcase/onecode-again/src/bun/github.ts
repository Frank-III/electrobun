import { branchExistsOnRemote } from "./git-worktree";
import { execWithShellEnv } from "./shell-env";

export interface CheckItem {
  name: string;
  status: "success" | "failure" | "pending" | "skipped" | "cancelled";
  url?: string;
}

export type MergeableStatus = "MERGEABLE" | "CONFLICTING" | "UNKNOWN";

export interface GitHubStatus {
  pr: {
    number: number;
    title: string;
    url: string;
    state: "open" | "draft" | "merged" | "closed";
    mergedAt?: number;
    additions: number;
    deletions: number;
    reviewDecision: "approved" | "changes_requested" | "pending";
    checksStatus: "success" | "failure" | "pending" | "none";
    checks: CheckItem[];
    mergeable?: MergeableStatus;
  } | null;
  repoUrl: string;
  branchExistsOnRemote: boolean;
  lastRefreshed: number;
}

const cache = new Map<string, { data: GitHubStatus; timestamp: number }>();
const CACHE_TTL_MS = 10_000;

function parseChecks(rollup: any[]): CheckItem[] {
  if (!rollup || rollup.length === 0) {
    return [];
  }

  return rollup.map((ctx) => {
    const name = ctx?.name || ctx?.context || "Unknown check";
    const url = ctx?.detailsUrl || ctx?.targetUrl;
    const rawStatus = ctx?.state || ctx?.conclusion;

    let status: CheckItem["status"];
    if (rawStatus === "SUCCESS") {
      status = "success";
    } else if (
      rawStatus === "FAILURE" ||
      rawStatus === "ERROR" ||
      rawStatus === "TIMED_OUT"
    ) {
      status = "failure";
    } else if (rawStatus === "SKIPPED" || rawStatus === "NEUTRAL") {
      status = "skipped";
    } else if (rawStatus === "CANCELLED") {
      status = "cancelled";
    } else {
      status = "pending";
    }

    return { name, status, url };
  });
}

function computeChecksStatus(rollup: any[]): "success" | "failure" | "pending" | "none" {
  if (!rollup || rollup.length === 0) {
    return "none";
  }

  let hasFailure = false;
  let hasPending = false;

  for (const ctx of rollup) {
    const status = ctx?.state || ctx?.conclusion;
    if (status === "FAILURE" || status === "ERROR" || status === "TIMED_OUT") {
      hasFailure = true;
    } else if (status === "PENDING" || status === "" || status === null || status === undefined) {
      hasPending = true;
    }
  }

  if (hasFailure) return "failure";
  if (hasPending) return "pending";
  return "success";
}

function mapPRState(state: string, isDraft: boolean): "open" | "draft" | "merged" | "closed" {
  if (state === "MERGED") return "merged";
  if (state === "CLOSED") return "closed";
  if (isDraft) return "draft";
  return "open";
}

function mapReviewDecision(decision: string | null | undefined): "approved" | "changes_requested" | "pending" {
  if (decision === "APPROVED") return "approved";
  if (decision === "CHANGES_REQUESTED") return "changes_requested";
  return "pending";
}

async function getRepoUrl(worktreePath: string): Promise<string | null> {
  const result = await execWithShellEnv("gh", ["repo", "view", "--json", "url"], {
    cwd: worktreePath,
  });

  if (result.code !== 0) {
    return null;
  }

  try {
    const raw = JSON.parse(result.stdout);
    if (raw && typeof raw.url === "string") {
      return raw.url;
    }
  } catch {
    return null;
  }

  return null;
}

async function getPRForBranch(worktreePath: string, branch: string): Promise<GitHubStatus["pr"]> {
  const result = await execWithShellEnv(
    "gh",
    [
      "pr",
      "view",
      branch,
      "--json",
      "number,title,url,state,isDraft,mergedAt,additions,deletions,reviewDecision,statusCheckRollup,mergeable",
    ],
    { cwd: worktreePath },
  );

  if (result.code !== 0) {
    const errorText = `${result.stderr}\n${result.stdout}`.toLowerCase();
    if (errorText.includes("no pull requests found")) {
      return null;
    }
    throw new Error(result.stderr || result.stdout || "Failed to fetch PR data");
  }

  const raw = JSON.parse(result.stdout);
  if (!raw || typeof raw.number !== "number" || typeof raw.url !== "string") {
    throw new Error("Invalid PR response");
  }

  const checks = parseChecks(raw.statusCheckRollup || []);

  return {
    number: raw.number,
    title: raw.title || "",
    url: raw.url,
    state: mapPRState(raw.state, !!raw.isDraft),
    mergedAt: raw.mergedAt ? new Date(raw.mergedAt).getTime() : undefined,
    additions: typeof raw.additions === "number" ? raw.additions : 0,
    deletions: typeof raw.deletions === "number" ? raw.deletions : 0,
    reviewDecision: mapReviewDecision(raw.reviewDecision),
    checksStatus: computeChecksStatus(raw.statusCheckRollup || []),
    checks,
    mergeable: raw.mergeable,
  };
}

export async function fetchGitHubPRStatus(worktreePath: string): Promise<GitHubStatus | null> {
  const cached = cache.get(worktreePath);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const repoUrl = await getRepoUrl(worktreePath);
    if (!repoUrl) return null;

    const branchResult = await execWithShellEnv("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: worktreePath,
    });
    if (branchResult.code !== 0) return null;
    const branchName = branchResult.stdout.trim();

    const [branchCheck, prInfo] = await Promise.all([
      branchExistsOnRemote(worktreePath, branchName),
      getPRForBranch(worktreePath, branchName),
    ]);

    const existsOnRemote = branchCheck.status === "exists";

    const result: GitHubStatus = {
      pr: prInfo,
      repoUrl,
      branchExistsOnRemote: existsOnRemote,
      lastRefreshed: Date.now(),
    };

    cache.set(worktreePath, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    return null;
  }
}
