export type FileStatus = "added" | "modified" | "deleted" | "renamed" | "copied" | "untracked";

export type ChangeCategory = "against-base" | "committed" | "staged" | "unstaged";

export type DiffViewMode = "side-by-side" | "inline";

export interface ChangedFile {
  path: string;
  oldPath?: string;
  status: FileStatus;
  additions: number;
  deletions: number;
}

export interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  description?: string;
  author: string;
  email?: string;
  date: Date | string | number;
  files: ChangedFile[];
}

export interface GitChangesStatus {
  branch: string;
  defaultBranch: string;
  againstBase: ChangedFile[];
  commits: CommitInfo[];
  staged: ChangedFile[];
  unstaged: ChangedFile[];
  untracked: ChangedFile[];
  ahead: number;
  behind: number;
  pushCount: number;
  pullCount: number;
  hasUpstream: boolean;
}

export type FileContents =
  | { ok: true; content: string }
  | { ok: false; error: string; reason?: string };
