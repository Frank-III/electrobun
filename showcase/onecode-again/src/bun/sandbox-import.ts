import { mkdir, writeFile, unlink } from "fs/promises";
import { basename, dirname, join } from "path";
import { tmpdir } from "os";
import { eq } from "drizzle-orm";
import { Updater } from "electrobun/bun";
import { chats, getDatabase, projects, subChats } from "./db";
import { getApiUrl } from "./config";
import { createWorktreeForChat } from "./git-worktree";
import { getGitRemoteInfo } from "./git";
import { execWithShellEnv } from "./shell-env";

export interface ExportMeta {
  type: "meta";
  branch: string;
  baseCommit: string;
  headCommit: string;
  baseRef: string;
  isFullExport?: boolean;
  remoteUrl?: string;
}

export interface ExportBundle {
  type: "bundle";
  data: string | null;
}

export interface ExportPatch {
  type: "staged_patch" | "unstaged_patch";
  data: string | null;
}

export interface ExportUntracked {
  type: "untracked";
  path: string;
  data: string;
}

export interface ExportDone {
  type: "done";
}

export interface ExportError {
  type: "error";
  error: string;
}

export interface ExportClaudeSession {
  type: "claude_session";
  sessionId: string;
  data: string;
  metadata: {
    firstPrompt: string;
    messageCount: number;
    created: string;
    modified: string;
    gitBranch: string;
  };
}

export type ExportChunk =
  | ExportMeta
  | ExportBundle
  | ExportPatch
  | ExportUntracked
  | ExportClaudeSession
  | ExportDone
  | ExportError;

export interface SandboxExportData {
  meta: ExportMeta;
  bundle: Buffer | null;
  stagedPatch: string | null;
  unstagedPatch: string | null;
  untrackedFiles: Array<{ path: string; content: Buffer }>;
  claudeSessions: ExportClaudeSession[];
}

async function runGit(cwd: string, args: string[]) {
  return execWithShellEnv("git", args, { cwd });
}

export async function parseExportStream(stream: ReadableStream<Uint8Array>): Promise<SandboxExportData> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  const result: SandboxExportData = {
    meta: null as unknown as ExportMeta,
    bundle: null,
    stagedPatch: null,
    unstagedPatch: null,
    untrackedFiles: [],
    claudeSessions: [],
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = JSON.parse(line) as ExportChunk;

      switch (chunk.type) {
        case "meta":
          result.meta = chunk;
          break;
        case "bundle":
          result.bundle = chunk.data ? Buffer.from(chunk.data, "base64") : null;
          break;
        case "staged_patch":
          result.stagedPatch = chunk.data || null;
          break;
        case "unstaged_patch":
          result.unstagedPatch = chunk.data || null;
          break;
        case "untracked":
          result.untrackedFiles.push({
            path: chunk.path,
            content: Buffer.from(chunk.data, "base64"),
          });
          break;
        case "claude_session":
          result.claudeSessions.push(chunk);
          break;
        case "error":
          throw new Error(chunk.error);
        case "done":
          break;
      }
    }
  }

  if (!result.meta) {
    throw new Error("Sandbox export missing metadata");
  }

  return result;
}

export async function applySandboxGitState(
  worktreePath: string,
  exportData: SandboxExportData,
): Promise<{ success: boolean; error?: string }> {
  const isFullExport = exportData.meta.isFullExport ?? false;

  try {
    if (isFullExport && exportData.meta.remoteUrl) {
      await runGit(worktreePath, ["remote", "add", "origin", exportData.meta.remoteUrl]).catch(() => {});
    }

    if (!isFullExport) {
      const baseCommit = exportData.meta.baseCommit;
      const baseCheck = await runGit(worktreePath, ["cat-file", "-e", baseCommit]);
      if (baseCheck.code !== 0) {
        await runGit(worktreePath, ["fetch", "origin"]).catch(() => {});
      }
    }

    if (exportData.bundle) {
      const bundlePath = join(tmpdir(), `sandbox-import-${Date.now()}.bundle`);
      try {
        await writeFile(bundlePath, exportData.bundle);
        await runGit(worktreePath, ["bundle", "verify", bundlePath]);

        if (isFullExport) {
          await runGit(worktreePath, [
            "fetch",
            "--update-head-ok",
            bundlePath,
            "refs/heads/*:refs/heads/*",
          ]);
          await runGit(worktreePath, ["checkout", "-f", exportData.meta.branch]);
        } else {
          await runGit(worktreePath, ["fetch", bundlePath, "HEAD:sandbox-import-temp"]);
          await runGit(worktreePath, ["reset", "--hard", "sandbox-import-temp"]);
          await runGit(worktreePath, ["branch", "-D", "sandbox-import-temp"]).catch(() => {});
        }
      } finally {
        await unlink(bundlePath).catch(() => {});
      }
    }

    if (exportData.stagedPatch) {
      const stagedPatchPath = join(tmpdir(), `sandbox-staged-${Date.now()}.patch`);
      try {
        await writeFile(stagedPatchPath, exportData.stagedPatch);
        await runGit(worktreePath, ["apply", "--index", stagedPatchPath]);
      } finally {
        await unlink(stagedPatchPath).catch(() => {});
      }
    }

    if (exportData.unstagedPatch) {
      const unstagedPatchPath = join(tmpdir(), `sandbox-unstaged-${Date.now()}.patch`);
      try {
        await writeFile(unstagedPatchPath, exportData.unstagedPatch);
        await runGit(worktreePath, ["apply", unstagedPatchPath]);
      } finally {
        await unlink(unstagedPatchPath).catch(() => {});
      }
    }

    if (exportData.untrackedFiles.length > 0) {
      for (const file of exportData.untrackedFiles) {
        const filePath = join(worktreePath, file.path);
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, file.content);
      }
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[sandbox-import] applySandboxGitState failed:", message);
    return { success: false, error: message };
  }
}

export async function importSandboxToWorktree(
  worktreePath: string,
  apiUrl: string,
  sandboxId: string,
  fullExport = false,
  sessionId?: string,
): Promise<{ success: boolean; error?: string; claudeSessions?: ExportClaudeSession[] }> {
  try {
    const query = new URLSearchParams();
    if (fullExport) query.set("full", "true");
    if (sessionId) query.set("sessionId", sessionId);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    const exportUrl = `${apiUrl}/api/agents/sandbox/${sandboxId}/export${queryString}`;
    const response = await fetch(exportUrl, {
      method: "GET",
    });

    if (!response.ok || !response.body) {
      return { success: false, error: `Export failed: ${response.status} ${response.statusText}` };
    }

    const exportData = await parseExportStream(response.body);
    const applyResult = await applySandboxGitState(worktreePath, exportData);

    return {
      success: applyResult.success,
      error: applyResult.error,
      claudeSessions: exportData.claudeSessions,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[sandbox-import] importSandboxToWorktree failed:", message);
    return { success: false, error: message };
  }
}

type RemoteSubChat = {
  id: string;
  name: string;
  mode: string;
  messages: any;
  createdAt: string;
  updatedAt: string;
};

type RemoteChat = {
  id: string;
  name: string | null;
  sandboxId: string | null;
  meta?: { repository?: string; branch?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  subChats: RemoteSubChat[];
};

function normalizeRemoteChat(data: any): RemoteChat {
  const subChats = Array.isArray(data?.subChats) ? data.subChats : [];
  return {
    id: String(data?.id ?? ""),
    name: data?.name ?? null,
    sandboxId: data?.sandboxId ?? null,
    meta: data?.meta ?? null,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    updatedAt: data?.updatedAt ?? new Date().toISOString(),
    subChats,
  };
}

async function resolveUserDataDir() {
  try {
    const appDataFolder = await Updater.appDataFolder();
    if (appDataFolder) return appDataFolder;
  } catch {
    // ignore
  }

  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();

  if (platform === "win32") {
    const base = process.env.LOCALAPPDATA || join(home, "AppData", "Local");
    return join(base, "dev.onecode.again", "onecode-again");
  }

  if (platform === "darwin") {
    return join(home, "Library", "Application Support", "dev.onecode.again", "onecode-again");
  }

  const base = process.env.XDG_DATA_HOME || join(home, ".local", "share");
  return join(base, "dev.onecode.again", "onecode-again");
}

async function writeClaudeSession(
  subChatId: string,
  localProjectPath: string,
  session: ExportClaudeSession,
): Promise<void> {
  const userDataDir = await resolveUserDataDir();
  const isolatedConfigDir = join(userDataDir, "claude-sessions", subChatId);
  const sanitizedPath = localProjectPath.replace(/[/.]/g, "-");
  const projectDir = join(isolatedConfigDir, "projects", sanitizedPath);

  await mkdir(projectDir, { recursive: true });

  const rewrittenData = session.data.replace(/\/home\/user\/repo/g, localProjectPath);
  const sessionFile = join(projectDir, `${session.sessionId}.jsonl`);
  await writeFile(sessionFile, rewrittenData, "utf-8");

  const indexData = {
    sessions: [
      {
        id: session.sessionId,
        firstPrompt: session.metadata.firstPrompt,
        messageCount: session.metadata.messageCount,
        created: session.metadata.created,
        modified: session.metadata.modified,
        gitBranch: session.metadata.gitBranch,
      },
    ],
  };
  const indexPath = join(projectDir, "sessions-index.json");
  await writeFile(indexPath, JSON.stringify(indexData, null, 2), "utf-8");
}

export function createSandboxImportHandlers() {
  return {
    sandboxImportImportSandboxChat: async ({
      sandboxId,
      remoteChatId,
      remoteSubChatId,
      projectId,
      chatName,
    }: {
      sandboxId: string;
      remoteChatId: string;
      remoteSubChatId?: string;
      projectId: string;
      chatName?: string;
    }) => {
      const db = await getDatabase();
      const apiUrl = getApiUrl();

      const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
      if (!project) {
        throw new Error("Project not found");
      }

      const chatExportUrl = remoteSubChatId
        ? `${apiUrl}/api/agents/chat/${remoteChatId}/export?subChatId=${remoteSubChatId}`
        : `${apiUrl}/api/agents/chat/${remoteChatId}/export`;

      const chatResponse = await fetch(chatExportUrl, {
        method: "GET",
      });

      if (!chatResponse.ok) {
        throw new Error(`Failed to fetch chat data: ${chatResponse.statusText}`);
      }

      const remoteChatData = normalizeRemoteChat(await chatResponse.json());

      let targetSessionId: string | undefined;
      if (remoteChatData.subChats.length > 0) {
        const targetSubChat = remoteChatData.subChats[0];
        const messagesArray = targetSubChat.messages || [];
        const lastAssistant = [...messagesArray].reverse().find((m: any) => m.role === "assistant");
        targetSessionId = lastAssistant?.metadata?.sessionId;
      }

      const worktreeResult = await createWorktreeForChat(
        project.path,
        projectId,
        `imported-${Date.now()}`,
      );

      if (!worktreeResult.success || !worktreeResult.worktreePath) {
        throw new Error(worktreeResult.error || "Failed to create worktree");
      }

      const importResult = await importSandboxToWorktree(
        worktreeResult.worktreePath,
        apiUrl,
        sandboxId,
        false,
        targetSessionId,
      );

      const chat = db
        .insert(chats)
        .values({
          name: chatName || remoteChatData.name || "Imported Chat",
          projectId,
          worktreePath: worktreeResult.worktreePath,
          branch: worktreeResult.branch,
          baseBranch: worktreeResult.baseBranch,
        })
        .returning()
        .get();

      const claudeSessions = importResult.claudeSessions || [];
      for (const remoteSubChat of remoteChatData.subChats) {
        const messagesArray = remoteSubChat.messages || [];
        const lastAssistant = [...messagesArray].reverse().find((m: any) => m.role === "assistant");
        const messageSessionId = lastAssistant?.metadata?.sessionId;
        const matchingSession = messageSessionId
          ? claudeSessions.find((s) => s.sessionId === messageSessionId)
          : undefined;

        const createdSubChat = db
          .insert(subChats)
          .values({
            chatId: chat.id,
            name: remoteSubChat.name,
            mode: remoteSubChat.mode === "plan" ? "plan" : "agent",
            messages: JSON.stringify(messagesArray),
            ...(matchingSession && { sessionId: messageSessionId }),
          })
          .returning()
          .get();

        if (matchingSession) {
          await writeClaudeSession(createdSubChat.id, worktreeResult.worktreePath, matchingSession).catch(
            (error) => {
              console.error("[sandbox-import] Failed to write Claude session:", error);
            },
          );
        }
      }

      const importedSubChats = db.select().from(subChats).where(eq(subChats.chatId, chat.id)).all();
      if (importedSubChats.length === 0) {
        db.insert(subChats)
          .values({ chatId: chat.id, name: "Main", mode: "agent", messages: "[]" })
          .run();
      }

      return {
        success: true,
        chatId: chat.id,
        worktreePath: worktreeResult.worktreePath,
        gitImportSuccess: importResult.success,
        gitImportError: importResult.error,
      };
    },

    sandboxImportCloneFromSandbox: async ({
      sandboxId,
      remoteChatId,
      remoteSubChatId,
      chatName,
      targetPath,
    }: {
      sandboxId: string;
      remoteChatId: string;
      remoteSubChatId?: string;
      chatName?: string;
      targetPath: string;
    }) => {
      const db = await getDatabase();
      const apiUrl = getApiUrl();

      const chatExportUrl = remoteSubChatId
        ? `${apiUrl}/api/agents/chat/${remoteChatId}/export?subChatId=${remoteSubChatId}`
        : `${apiUrl}/api/agents/chat/${remoteChatId}/export`;

      const chatResponse = await fetch(chatExportUrl, {
        method: "GET",
      });

      if (!chatResponse.ok) {
        throw new Error(`Failed to fetch chat data: ${chatResponse.statusText}`);
      }

      const remoteChatData = normalizeRemoteChat(await chatResponse.json());

      let targetSessionId: string | undefined;
      if (remoteChatData.subChats.length > 0) {
        const targetSubChat = remoteChatData.subChats[0];
        const messagesArray = targetSubChat.messages || [];
        const lastAssistant = [...messagesArray].reverse().find((m: any) => m.role === "assistant");
        targetSessionId = lastAssistant?.metadata?.sessionId;
      }

      await mkdir(targetPath, { recursive: true });
      await runGit(targetPath, ["init"]);

      const importResult = await importSandboxToWorktree(
        targetPath,
        apiUrl,
        sandboxId,
        true,
        targetSessionId,
      );

      const gitInfo = await getGitRemoteInfo(targetPath);
      let finalOwner = gitInfo.owner;
      let finalRepo = gitInfo.repo;
      let finalRemoteUrl = gitInfo.remoteUrl;
      let finalProvider = gitInfo.provider;

      if (!finalOwner || !finalRepo) {
        const repoFromMeta = remoteChatData.meta?.repository;
        if (repoFromMeta) {
          const [metaOwner, metaRepo] = repoFromMeta.split("/");
          if (metaOwner && metaRepo) {
            finalOwner = metaOwner;
            finalRepo = metaRepo;
            finalProvider = "github";
            const remoteUrl = `https://github.com/${metaOwner}/${metaRepo}`;
            finalRemoteUrl = remoteUrl;
            await runGit(targetPath, ["remote", "add", "origin", remoteUrl]).catch(async () => {
              await runGit(targetPath, ["remote", "set-url", "origin", remoteUrl]).catch(() => {});
            });
          }
        }
      }

      let actualBranch = remoteChatData.meta?.branch || "main";
      const branchResult = await runGit(targetPath, ["rev-parse", "--abbrev-ref", "HEAD"]);
      if (branchResult.code === 0 && branchResult.stdout.trim()) {
        actualBranch = branchResult.stdout.trim();
      }

      const existingProject = db.select().from(projects).where(eq(projects.path, targetPath)).get();
      const project = existingProject
        ? db
            .update(projects)
            .set({
              updatedAt: new Date(),
              gitRemoteUrl: finalRemoteUrl,
              gitProvider: finalProvider,
              gitOwner: finalOwner,
              gitRepo: finalRepo,
            })
            .where(eq(projects.id, existingProject.id))
            .returning()
            .get()!
        : db
            .insert(projects)
            .values({
              name: basename(targetPath),
              path: targetPath,
              gitRemoteUrl: finalRemoteUrl,
              gitProvider: finalProvider,
              gitOwner: finalOwner,
              gitRepo: finalRepo,
            })
            .returning()
            .get();

      const chat = db
        .insert(chats)
        .values({
          name: chatName || remoteChatData.name || "Imported Chat",
          projectId: project.id,
          worktreePath: targetPath,
          branch: actualBranch,
          baseBranch: "main",
        })
        .returning()
        .get();

      const claudeSessions = importResult.claudeSessions || [];
      for (const remoteSubChat of remoteChatData.subChats) {
        const messagesArray = remoteSubChat.messages || [];
        const lastAssistant = [...messagesArray].reverse().find((m: any) => m.role === "assistant");
        const messageSessionId = lastAssistant?.metadata?.sessionId;
        const matchingSession = messageSessionId
          ? claudeSessions.find((s) => s.sessionId === messageSessionId)
          : undefined;

        const createdSubChat = db
          .insert(subChats)
          .values({
            chatId: chat.id,
            name: remoteSubChat.name,
            mode: remoteSubChat.mode === "plan" ? "plan" : "agent",
            messages: JSON.stringify(messagesArray),
            ...(matchingSession && { sessionId: messageSessionId }),
          })
          .returning()
          .get();

        if (matchingSession) {
          await writeClaudeSession(createdSubChat.id, targetPath, matchingSession).catch((error) => {
            console.error("[sandbox-import] Failed to write Claude session:", error);
          });
        }
      }

      const importedSubChats = db.select().from(subChats).where(eq(subChats.chatId, chat.id)).all();
      if (importedSubChats.length === 0) {
        db.insert(subChats)
          .values({ chatId: chat.id, name: "Main", mode: "agent", messages: "[]" })
          .run();
      }

      return {
        success: true,
        projectId: project.id,
        chatId: chat.id,
        gitImportSuccess: importResult.success,
        gitImportError: importResult.error,
      };
    },
  };
}
