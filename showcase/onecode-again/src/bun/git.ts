import { basename } from "path";

export type GitProvider = "github" | "gitlab" | "bitbucket" | null;

export interface GitRemoteInfo {
  remoteUrl: string | null;
  provider: GitProvider;
  owner: string | null;
  repo: string | null;
}

async function runGit(args: string[], cwd: string): Promise<{ code: number; stdout: string }> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "ignore",
  });
  const stdout = proc.stdout ? await new Response(proc.stdout).text() : "";
  const code = await proc.exited;
  return { code: code ?? 0, stdout };
}

async function isGitRepo(path: string): Promise<boolean> {
  const result = await runGit(["rev-parse", "--git-dir"], path);
  return result.code === 0;
}

function parseGitRemoteUrl(url: string): Omit<GitRemoteInfo, "remoteUrl"> {
  let normalized = url.trim();
  if (normalized.endsWith(".git")) {
    normalized = normalized.slice(0, -4);
  }

  let provider: GitProvider = null;
  let owner: string | null = null;
  let repo: string | null = null;

  const httpsMatch = normalized.match(
    /https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/([^/]+)\/([^/]+)/,
  );
  if (httpsMatch) {
    const [, host, ownerPart, repoPart] = httpsMatch;
    provider =
      host === "github.com"
        ? "github"
        : host === "gitlab.com"
          ? "gitlab"
          : host === "bitbucket.org"
            ? "bitbucket"
            : null;
    owner = ownerPart || null;
    repo = repoPart || null;
    return { provider, owner, repo };
  }

  const sshMatch = normalized.match(
    /git@(github\.com|gitlab\.com|bitbucket\.org):([^/]+)\/(.+)/,
  );
  if (sshMatch) {
    const [, host, ownerPart, repoPart] = sshMatch;
    provider =
      host === "github.com"
        ? "github"
        : host === "gitlab.com"
          ? "gitlab"
          : host === "bitbucket.org"
            ? "bitbucket"
            : null;
    owner = ownerPart || null;
    repo = repoPart || null;
    return { provider, owner, repo: repoPart || null };
  }

  return { provider: null, owner: null, repo: null };
}

export async function getGitRemoteInfo(projectPath: string): Promise<GitRemoteInfo> {
  const emptyResult: GitRemoteInfo = {
    remoteUrl: null,
    provider: null,
    owner: null,
    repo: null,
  };

  const isRepo = await isGitRepo(projectPath);
  if (!isRepo) {
    return emptyResult;
  }

  const result = await runGit(["remote", "get-url", "origin"], projectPath);
  if (result.code !== 0) {
    return emptyResult;
  }

  const remoteUrl = result.stdout.trim();
  if (!remoteUrl) {
    return emptyResult;
  }

  const parsed = parseGitRemoteUrl(remoteUrl);

  return {
    remoteUrl,
    ...parsed,
  };
}

export function getRepoNameFromPath(path: string): string {
  return basename(path);
}
