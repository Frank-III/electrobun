import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { chats, getDatabase, projects, subChats } from "./db";

function getFallbackName(userMessage: string): string {
  const trimmed = userMessage.trim();
  if (trimmed.length <= 25) {
    return trimmed || "New Chat";
  }
  return trimmed.substring(0, 25) + "...";
}

export function createChatsHandlers() {
  return {
    chatsList: async ({ projectId }: { projectId?: string }) => {
      const db = await getDatabase();
      const conditions = [isNull(chats.archivedAt)];
      if (projectId) {
        conditions.push(eq(chats.projectId, projectId));
      }
      return db
        .select()
        .from(chats)
        .where(and(...conditions))
        .orderBy(desc(chats.updatedAt))
        .all();
    },

    chatsListArchived: async ({ projectId }: { projectId?: string }) => {
      const db = await getDatabase();
      const conditions = [isNotNull(chats.archivedAt)];
      if (projectId) {
        conditions.push(eq(chats.projectId, projectId));
      }
      return db
        .select()
        .from(chats)
        .where(and(...conditions))
        .orderBy(desc(chats.archivedAt))
        .all();
    },

    chatsGet: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      const chat = db.select().from(chats).where(eq(chats.id, id)).get();
      if (!chat) return null;

      const chatSubChats = db
        .select()
        .from(subChats)
        .where(eq(subChats.chatId, id))
        .orderBy(subChats.createdAt)
        .all();

      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, chat.projectId))
        .get();

      return { ...chat, subChats: chatSubChats, project };
    },

    chatsCreate: async ({
      projectId,
      name,
      initialMessage,
      initialMessageParts,
      mode = "agent",
      useWorktree = true,
    }: {
      projectId: string;
      name?: string;
      initialMessage?: string;
      initialMessageParts?: Array<
        | { type: "text"; text: string }
        | {
            type: "data-image";
            data: { url: string; mediaType?: string; filename?: string; base64Data?: string };
          }
        | { type: "file-content"; filePath: string; content: string }
      >;
      mode?: "plan" | "agent";
      useWorktree?: boolean;
    }) => {
      const db = await getDatabase();
      const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
      if (!project) throw new Error("Project not found");

      const chat = db
        .insert(chats)
        .values({ name, projectId })
        .returning()
        .get();

      let initialMessages = "[]";
      if (initialMessageParts && initialMessageParts.length > 0) {
        initialMessages = JSON.stringify([
          {
            id: `msg-${Date.now()}`,
            role: "user",
            parts: initialMessageParts,
          },
        ]);
      } else if (initialMessage) {
        initialMessages = JSON.stringify([
          {
            id: `msg-${Date.now()}`,
            role: "user",
            parts: [{ type: "text", text: initialMessage }],
          },
        ]);
      }

      const subChat = db
        .insert(subChats)
        .values({
          chatId: chat.id,
          mode,
          messages: initialMessages,
        })
        .returning()
        .get();

      const worktreePath = project.path;
      db.update(chats)
        .set({ worktreePath })
        .where(eq(chats.id, chat.id))
        .run();

      return {
        ...chat,
        worktreePath,
        branch: null,
        baseBranch: null,
        subChats: [subChat],
        useWorktree,
      };
    },

    chatsRename: async ({ id, name }: { id: string; name: string }) => {
      const db = await getDatabase();
      return db
        .update(chats)
        .set({ name, updatedAt: new Date() })
        .where(eq(chats.id, id))
        .returning()
        .get();
    },

    chatsArchive: async ({ id }: { id: string; deleteWorktree?: boolean }) => {
      const db = await getDatabase();
      return db
        .update(chats)
        .set({ archivedAt: new Date() })
        .where(eq(chats.id, id))
        .returning()
        .get();
    },

    chatsArchiveBatch: async ({ chatIds }: { chatIds: string[] }) => {
      const db = await getDatabase();
      if (chatIds.length === 0) return [];
      return db
        .update(chats)
        .set({ archivedAt: new Date() })
        .where(inArray(chats.id, chatIds))
        .returning()
        .all();
    },

    chatsRestore: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      return db
        .update(chats)
        .set({ archivedAt: null })
        .where(eq(chats.id, id))
        .returning()
        .get();
    },

    chatsDelete: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      return db.delete(chats).where(eq(chats.id, id)).returning().get();
    },

    chatsGetSubChat: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      const subChat = db.select().from(subChats).where(eq(subChats.id, id)).get();
      if (!subChat) return null;

      const chat = db.select().from(chats).where(eq(chats.id, subChat.chatId)).get();
      const project = chat
        ? db.select().from(projects).where(eq(projects.id, chat.projectId)).get()
        : null;

      return { ...subChat, chat: chat ? { ...chat, project } : null };
    },

    chatsCreateSubChat: async ({
      chatId,
      name,
      mode = "agent",
    }: {
      chatId: string;
      name?: string;
      mode?: "plan" | "agent";
    }) => {
      const db = await getDatabase();
      return db
        .insert(subChats)
        .values({ chatId, name, mode, messages: "[]" })
        .returning()
        .get();
    },

    chatsUpdateSubChatMessages: async ({ id, messages }: { id: string; messages: string }) => {
      const db = await getDatabase();
      return db
        .update(subChats)
        .set({ messages, updatedAt: new Date() })
        .where(eq(subChats.id, id))
        .returning()
        .get();
    },

    chatsUpdateSubChatSession: async ({ id, sessionId }: { id: string; sessionId: string | null }) => {
      const db = await getDatabase();
      return db
        .update(subChats)
        .set({ sessionId })
        .where(eq(subChats.id, id))
        .returning()
        .get();
    },

    chatsUpdateSubChatMode: async ({ id, mode }: { id: string; mode: "plan" | "agent" }) => {
      const db = await getDatabase();
      return db
        .update(subChats)
        .set({ mode })
        .where(eq(subChats.id, id))
        .returning()
        .get();
    },

    chatsRenameSubChat: async ({ id, name }: { id: string; name: string }) => {
      const db = await getDatabase();
      return db
        .update(subChats)
        .set({ name })
        .where(eq(subChats.id, id))
        .returning()
        .get();
    },

    chatsDeleteSubChat: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      return db.delete(subChats).where(eq(subChats.id, id)).returning().get();
    },

    chatsGenerateSubChatName: async ({ userMessage }: { userMessage: string; ollamaModel?: string }) => {
      return { name: getFallbackName(userMessage) };
    },

    chatsGenerateCommitMessage: async ({
      chatId,
      filePaths,
    }: {
      chatId: string;
      filePaths?: string[];
      ollamaModel?: string | null;
    }) => {
      const fallback = `chore: update ${filePaths?.length ? filePaths.length + " files" : "workspace"}`;
      return { message: fallback };
    },

    chatsGetDiff: async ({ chatId }: { chatId: string }) => {
      return { diff: null, error: "Diff unavailable in Bun backend" };
    },

    chatsGetParsedDiff: async ({ chatId }: { chatId: string }) => {
      return {
        files: [],
        totalAdditions: 0,
        totalDeletions: 0,
        fileContents: {},
        error: "Diff parsing unavailable in Bun backend",
      };
    },

    chatsGetPrContext: async ({ chatId }: { chatId: string }) => {
      return null;
    },

    chatsUpdatePrInfo: async ({ chatId, prUrl, prNumber }: { chatId: string; prUrl: string; prNumber: number }) => {
      const db = await getDatabase();
      return db
        .update(chats)
        .set({ prUrl, prNumber, updatedAt: new Date() })
        .where(eq(chats.id, chatId))
        .returning()
        .get();
    },

    chatsGetPrStatus: async ({ chatId }: { chatId: string }) => {
      return null;
    },

    chatsMergePr: async ({ chatId, method }: { chatId: string; method?: "merge" | "squash" | "rebase" }) => {
      return { success: false as const, error: "PR merge unavailable in Bun backend" };
    },

    chatsGetFileStats: async ({
      openSubChatIds,
      chatIds,
    }: {
      openSubChatIds?: string[];
      chatIds?: string[];
    }) => {
      const db = await getDatabase();

      if ((!openSubChatIds || openSubChatIds.length === 0) && (!chatIds || chatIds.length === 0)) {
        return [];
      }

      let allChats: Array<{ chatId: string | null; subChatId: string; messages: string | null }>;
      if (chatIds && chatIds.length > 0) {
        allChats = db
          .select({
            chatId: subChats.chatId,
            subChatId: subChats.id,
            messages: subChats.messages,
          })
          .from(subChats)
          .where(inArray(subChats.chatId, chatIds))
          .all();
      } else {
        allChats = db
          .select({
            chatId: subChats.chatId,
            subChatId: subChats.id,
            messages: subChats.messages,
          })
          .from(subChats)
          .where(inArray(subChats.id, openSubChatIds!))
          .all();
      }

      const statsMap = new Map<string, { additions: number; deletions: number; fileCount: number }>();

      for (const row of allChats) {
        if (!row.messages || !row.chatId) continue;
        const chatId = row.chatId;

        try {
          const messages = JSON.parse(row.messages) as Array<{
            role: string;
            parts?: Array<{
              type: string;
              input?: { file_path?: string; old_string?: string; new_string?: string; content?: string };
            }>;
          }>;

          const fileStates = new Map<string, { originalContent: string | null; currentContent: string }>();

          for (const msg of messages) {
            if (msg.role !== "assistant") continue;
            for (const part of msg.parts || []) {
              if (part.type === "tool-Edit" || part.type === "tool-Write") {
                const filePath = part.input?.file_path;
                if (!filePath) continue;
                if (filePath.includes("claude-sessions") || filePath.includes("Application Support")) {
                  continue;
                }
                const oldString = part.input?.old_string || "";
                const newString = part.input?.new_string || part.input?.content || "";

                const existing = fileStates.get(filePath);
                if (existing) {
                  existing.currentContent = newString;
                } else {
                  fileStates.set(filePath, {
                    originalContent: part.type === "tool-Write" ? null : oldString,
                    currentContent: newString,
                  });
                }
              }
            }
          }

          let subChatAdditions = 0;
          let subChatDeletions = 0;
          let subChatFileCount = 0;

          for (const [, state] of fileStates) {
            const original = state.originalContent || "";
            if (original === state.currentContent) continue;
            const oldLines = original ? original.split("\n").length : 0;
            const newLines = state.currentContent ? state.currentContent.split("\n").length : 0;

            if (!original) {
              subChatAdditions += newLines;
            } else {
              subChatAdditions += newLines;
              subChatDeletions += oldLines;
            }
            subChatFileCount += 1;
          }

          const existing = statsMap.get(chatId) || { additions: 0, deletions: 0, fileCount: 0 };
          existing.additions += subChatAdditions;
          existing.deletions += subChatDeletions;
          existing.fileCount += subChatFileCount;
          statsMap.set(chatId, existing);
        } catch {
          continue;
        }
      }

      return Array.from(statsMap.entries()).map(([chatId, stats]) => ({
        chatId,
        ...stats,
      }));
    },

    chatsGetPendingPlanApprovals: async ({ openSubChatIds }: { openSubChatIds: string[] }) => {
      const db = await getDatabase();
      if (openSubChatIds.length === 0) {
        return [];
      }

      const allSubChats = db
        .select({
          chatId: subChats.chatId,
          subChatId: subChats.id,
          mode: subChats.mode,
          messages: subChats.messages,
        })
        .from(subChats)
        .where(inArray(subChats.id, openSubChatIds))
        .all();

      const pendingApprovals: Array<{ subChatId: string; chatId: string }> = [];

      for (const row of allSubChats) {
        if (!row.subChatId || !row.chatId) continue;
        if (row.mode === "agent") continue;
        if (!row.messages) continue;

        try {
          const messages = JSON.parse(row.messages) as Array<{
            role: string;
            parts?: Array<{ type: string; output?: unknown }>;
          }>;

          const hasCompletedExitPlanMode = () => {
            for (let i = messages.length - 1; i >= 0; i -= 1) {
              const msg = messages[i];
              if (!msg) continue;
              if (msg.role === "assistant" && msg.parts) {
                const exitPlanPart = msg.parts.find((p) => p.type === "tool-ExitPlanMode");
                if (exitPlanPart && exitPlanPart.output !== undefined) {
                  return true;
                }
              }
            }
            return false;
          };

          if (hasCompletedExitPlanMode()) {
            pendingApprovals.push({ subChatId: row.subChatId, chatId: row.chatId });
          }
        } catch {
          continue;
        }
      }

      return pendingApprovals;
    },

    chatsGetWorktreeStatus: async ({ chatId }: { chatId: string }) => {
      return { hasWorktree: false, uncommittedCount: 0 };
    },

    chatsExportChat: async ({
      chatId,
      subChatId,
      format = "markdown",
    }: {
      chatId: string;
      subChatId?: string;
      format?: "json" | "markdown" | "text";
    }) => {
      const db = await getDatabase();
      const chat = db.select().from(chats).where(eq(chats.id, chatId)).get();
      if (!chat) throw new Error("Chat not found");

      const project = db.select().from(projects).where(eq(projects.id, chat.projectId)).get();

      let chatSubChats;
      if (subChatId) {
        const singleSubChat = db
          .select()
          .from(subChats)
          .where(and(eq(subChats.id, subChatId), eq(subChats.chatId, chatId)))
          .get();
        if (!singleSubChat) throw new Error("Sub-chat not found");
        chatSubChats = [singleSubChat];
      } else {
        chatSubChats = db
          .select()
          .from(subChats)
          .where(eq(subChats.chatId, chatId))
          .orderBy(subChats.createdAt)
          .all();
      }

      const allMessages: Array<{
        subChatId: string;
        subChatName: string | null;
        messages: Array<{ id: string; role: string; parts: Array<{ type: string; text?: string; [key: string]: any }> }>;
      }> = [];

      for (const subChat of chatSubChats) {
        try {
          const messages = JSON.parse(subChat.messages || "[]");
          allMessages.push({
            subChatId: subChat.id,
            subChatName: subChat.name,
            messages,
          });
        } catch {
          continue;
        }
      }

      const sanitizeFilename = (name: string): string => {
        return (
          name
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "")
            .slice(0, 100) || "chat"
        );
      };

      const exportName =
        subChatId && chatSubChats[0]?.name
          ? `${chat.name || "chat"}-${chatSubChats[0].name}`
          : chat.name || "chat";
      const safeFilename = sanitizeFilename(exportName);

      if (format === "json") {
        return {
          format: "json" as const,
          content: JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              chat: {
                id: chat.id,
                name: chat.name,
                createdAt: chat.createdAt,
                branch: chat.branch,
                baseBranch: chat.baseBranch,
                prUrl: chat.prUrl,
              },
              project: project
                ? {
                    id: project.id,
                    name: project.name,
                    path: project.path,
                  }
                : null,
              conversations: allMessages,
            },
            null,
            2,
          ),
          filename: `${safeFilename}-${chat.id.slice(0, 8)}.json`,
        };
      }

      if (format === "text") {
        let text = `# ${chat.name || "Untitled Chat"}\n`;
        text += `exported: ${new Date().toISOString()}\n`;
        if (project) {
          text += `project: ${project.name}\n`;
        }
        text += `\n---\n\n`;

        for (const subChatData of allMessages) {
          if (subChatData.subChatName) {
            text += `## ${subChatData.subChatName}\n\n`;
          }

          for (const msg of subChatData.messages) {
            const role = msg.role === "user" ? "You" : "Assistant";
            text += `${role}:\n`;

            for (const part of msg.parts || []) {
              if (part.type === "text" && part.text) {
                text += `${part.text}\n`;
              } else if (part.type?.startsWith("tool-") && part.toolName) {
                text += `[used ${part.toolName} tool]\n`;
              }
            }
            text += "\n";
          }
        }

        return {
          format: "text" as const,
          content: text,
          filename: `${safeFilename}-${chat.id.slice(0, 8)}.txt`,
        };
      }

      let markdown = `# ${chat.name || "Untitled Chat"}\n\n`;
      markdown += `**Exported:** ${new Date().toISOString()}\n\n`;
      if (project) {
        markdown += `**Project:** ${project.name}\n\n`;
      }
      if (chat.branch) {
        markdown += `**Branch:** \`${chat.branch}\`\n\n`;
      }
      if (chat.prUrl) {
        markdown += `**PR:** ${chat.prUrl}\n\n`;
      }
      markdown += `---\n\n`;

      for (const subChatData of allMessages) {
        if (subChatData.subChatName) {
          markdown += `## ${subChatData.subChatName}\n\n`;
        }

        for (const msg of subChatData.messages) {
          const role = msg.role === "user" ? "**You**" : "**Assistant**";
          markdown += `### ${role}\n\n`;

          for (const part of msg.parts || []) {
            if (part.type === "text" && part.text) {
              markdown += `${part.text}\n\n`;
            } else if (part.type?.startsWith("tool-") && part.toolName) {
              const toolName = part.toolName;
              if (toolName === "Bash" && part.input?.command) {
                markdown += `\`\`\`bash\n${part.input.command}\n\`\`\`\n\n`;
              } else if ((toolName === "Edit" || toolName === "Write") && part.input?.file_path) {
                markdown += `> Modified: \`${part.input.file_path}\`\n\n`;
              } else if (toolName === "Read" && part.input?.file_path) {
                markdown += `> Read: \`${part.input.file_path}\`\n\n`;
              } else {
                markdown += `> *Used ${toolName} tool*\n\n`;
              }
            }
          }
        }
      }

      return {
        format: "markdown" as const,
        content: markdown,
        filename: `${safeFilename}-${chat.id.slice(0, 8)}.md`,
      };
    },

    chatsGetChatStats: async ({
      chatId,
      subChatId,
    }: {
      chatId: string;
      subChatId?: string;
    }) => {
      const db = await getDatabase();

      let chatSubChats;
      if (subChatId) {
        const singleSubChat = db
          .select()
          .from(subChats)
          .where(and(eq(subChats.id, subChatId), eq(subChats.chatId, chatId)))
          .get();
        chatSubChats = singleSubChat ? [singleSubChat] : [];
      } else {
        chatSubChats = db.select().from(subChats).where(eq(subChats.chatId, chatId)).all();
      }

      let messageCount = 0;
      let userMessageCount = 0;
      let assistantMessageCount = 0;
      let toolCalls = 0;
      const toolUsage: Record<string, number> = {};
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      for (const subChat of chatSubChats) {
        try {
          const messages = JSON.parse(subChat.messages || "[]") as Array<{
            role: string;
            parts?: Array<{ type: string; toolName?: string }>;
            metadata?: { usage?: { inputTokens?: number; outputTokens?: number } };
          }>;

          for (const msg of messages) {
            messageCount += 1;
            if (msg.role === "user") {
              userMessageCount += 1;
            } else if (msg.role === "assistant") {
              assistantMessageCount += 1;
              for (const part of msg.parts || []) {
                if (part.type?.startsWith("tool-") && part.toolName) {
                  toolCalls += 1;
                  toolUsage[part.toolName] = (toolUsage[part.toolName] || 0) + 1;
                }
              }

              if (msg.metadata?.usage) {
                totalInputTokens += msg.metadata.usage.inputTokens || 0;
                totalOutputTokens += msg.metadata.usage.outputTokens || 0;
              }
            }
          }
        } catch {
          continue;
        }
      }

      return {
        messageCount,
        userMessageCount,
        assistantMessageCount,
        toolCalls,
        toolUsage,
        totalInputTokens,
        totalOutputTokens,
        subChatCount: chatSubChats.length,
      };
    },
  };
}
