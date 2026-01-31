import { index, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "./utils";

export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  gitRemoteUrl: text("git_remote_url"),
  gitProvider: text("git_provider"),
  gitOwner: text("git_owner"),
  gitRepo: text("git_repo"),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  chats: many(chats),
}));

export const chats = sqliteTable(
  "chats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    archivedAt: integer("archived_at", { mode: "timestamp" }),
    worktreePath: text("worktree_path"),
    branch: text("branch"),
    baseBranch: text("base_branch"),
    prUrl: text("pr_url"),
    prNumber: integer("pr_number"),
  },
  (table) => ({
    worktreePathIdx: index("chats_worktree_path_idx").on(table.worktreePath),
  }),
);

export const chatsRelations = relations(chats, ({ one, many }) => ({
  project: one(projects, {
    fields: [chats.projectId],
    references: [projects.id],
  }),
  subChats: many(subChats),
}));

export const subChats = sqliteTable("sub_chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  streamId: text("stream_id"),
  mode: text("mode").notNull().default("agent"),
  messages: text("messages").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const subChatsRelations = relations(subChats, ({ one }) => ({
  chat: one(chats, {
    fields: [subChats.chatId],
    references: [chats.id],
  }),
}));

// Claude Code credentials (legacy table for backward compatibility)
export const claudeCodeCredentials = sqliteTable("claude_code_credentials", {
  id: text("id").primaryKey(),
  oauthToken: text("oauth_token").notNull(),
  connectedAt: integer("connected_at", { mode: "timestamp" }),
  userId: text("user_id"),
});

// Anthropic accounts (multi-account support)
export const anthropicAccounts = sqliteTable("anthropic_accounts", {
  id: text("id").primaryKey(),
  oauthToken: text("oauth_token").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  connectedAt: integer("connected_at", { mode: "timestamp" }),
  desktopUserId: text("desktop_user_id"),
});

// Anthropic settings (singleton for active account selection)
export const anthropicSettings = sqliteTable("anthropic_settings", {
  id: text("id").primaryKey(),
  activeAccountId: text("active_account_id"),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type SubChat = typeof subChats.$inferSelect;
export type NewSubChat = typeof subChats.$inferInsert;
export type ClaudeCodeCredential = typeof claudeCodeCredentials.$inferSelect;
export type NewClaudeCodeCredential = typeof claudeCodeCredentials.$inferInsert;
export type AnthropicAccount = typeof anthropicAccounts.$inferSelect;
export type NewAnthropicAccount = typeof anthropicAccounts.$inferInsert;
export type AnthropicSettings = typeof anthropicSettings.$inferSelect;
