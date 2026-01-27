"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropicSettings = exports.anthropicAccounts = exports.claudeCodeCredentials = exports.subChatsRelations = exports.subChats = exports.chatsRelations = exports.chats = exports.projectsRelations = exports.projects = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
var utils_1 = require("../utils");
// ============ PROJECTS ============
exports.projects = (0, sqlite_core_1.sqliteTable)("projects", {
    id: (0, sqlite_core_1.text)("id")
        .primaryKey()
        .$defaultFn(function () { return (0, utils_1.createId)(); }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    path: (0, sqlite_core_1.text)("path").notNull().unique(),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    // Git remote info (extracted from local .git)
    gitRemoteUrl: (0, sqlite_core_1.text)("git_remote_url"),
    gitProvider: (0, sqlite_core_1.text)("git_provider"), // "github" | "gitlab" | "bitbucket" | null
    gitOwner: (0, sqlite_core_1.text)("git_owner"),
    gitRepo: (0, sqlite_core_1.text)("git_repo"),
});
exports.projectsRelations = (0, drizzle_orm_1.relations)(exports.projects, function (_a) {
    var many = _a.many;
    return ({
        chats: many(exports.chats),
    });
});
// ============ CHATS ============
exports.chats = (0, sqlite_core_1.sqliteTable)("chats", {
    id: (0, sqlite_core_1.text)("id")
        .primaryKey()
        .$defaultFn(function () { return (0, utils_1.createId)(); }),
    name: (0, sqlite_core_1.text)("name"),
    projectId: (0, sqlite_core_1.text)("project_id")
        .notNull()
        .references(function () { return exports.projects.id; }, { onDelete: "cascade" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    archivedAt: (0, sqlite_core_1.integer)("archived_at", { mode: "timestamp" }),
    // Worktree fields (for git isolation per chat)
    worktreePath: (0, sqlite_core_1.text)("worktree_path"),
    branch: (0, sqlite_core_1.text)("branch"),
    baseBranch: (0, sqlite_core_1.text)("base_branch"),
    // PR tracking fields
    prUrl: (0, sqlite_core_1.text)("pr_url"),
    prNumber: (0, sqlite_core_1.integer)("pr_number"),
}, function (table) { return [
    (0, sqlite_core_1.index)("chats_worktree_path_idx").on(table.worktreePath),
]; });
exports.chatsRelations = (0, drizzle_orm_1.relations)(exports.chats, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        project: one(exports.projects, {
            fields: [exports.chats.projectId],
            references: [exports.projects.id],
        }),
        subChats: many(exports.subChats),
    });
});
// ============ SUB-CHATS ============
exports.subChats = (0, sqlite_core_1.sqliteTable)("sub_chats", {
    id: (0, sqlite_core_1.text)("id")
        .primaryKey()
        .$defaultFn(function () { return (0, utils_1.createId)(); }),
    name: (0, sqlite_core_1.text)("name"),
    chatId: (0, sqlite_core_1.text)("chat_id")
        .notNull()
        .references(function () { return exports.chats.id; }, { onDelete: "cascade" }),
    sessionId: (0, sqlite_core_1.text)("session_id"), // Claude SDK session ID for resume
    streamId: (0, sqlite_core_1.text)("stream_id"), // Track in-progress streams
    mode: (0, sqlite_core_1.text)("mode").notNull().default("agent"), // "plan" | "agent"
    messages: (0, sqlite_core_1.text)("messages").notNull().default("[]"), // JSON array
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
});
exports.subChatsRelations = (0, drizzle_orm_1.relations)(exports.subChats, function (_a) {
    var one = _a.one;
    return ({
        chat: one(exports.chats, {
            fields: [exports.subChats.chatId],
            references: [exports.chats.id],
        }),
    });
});
// ============ CLAUDE CODE CREDENTIALS ============
// Stores encrypted OAuth token for Claude Code integration
// DEPRECATED: Use anthropicAccounts for multi-account support
exports.claudeCodeCredentials = (0, sqlite_core_1.sqliteTable)("claude_code_credentials", {
    id: (0, sqlite_core_1.text)("id").primaryKey().default("default"), // Single row, always "default"
    oauthToken: (0, sqlite_core_1.text)("oauth_token").notNull(), // Encrypted with safeStorage
    connectedAt: (0, sqlite_core_1.integer)("connected_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    userId: (0, sqlite_core_1.text)("user_id"), // Desktop auth user ID (for reference)
});
// ============ ANTHROPIC ACCOUNTS (Multi-account support) ============
// Stores multiple Anthropic OAuth accounts for quick switching
exports.anthropicAccounts = (0, sqlite_core_1.sqliteTable)("anthropic_accounts", {
    id: (0, sqlite_core_1.text)("id")
        .primaryKey()
        .$defaultFn(function () { return (0, utils_1.createId)(); }),
    email: (0, sqlite_core_1.text)("email"), // User's email from OAuth (if available)
    displayName: (0, sqlite_core_1.text)("display_name"), // User-editable label
    oauthToken: (0, sqlite_core_1.text)("oauth_token").notNull(), // Encrypted with safeStorage
    connectedAt: (0, sqlite_core_1.integer)("connected_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
    lastUsedAt: (0, sqlite_core_1.integer)("last_used_at", { mode: "timestamp" }),
    desktopUserId: (0, sqlite_core_1.text)("desktop_user_id"), // Reference to 21st.dev user
});
// Tracks which Anthropic account is currently active
exports.anthropicSettings = (0, sqlite_core_1.sqliteTable)("anthropic_settings", {
    id: (0, sqlite_core_1.text)("id").primaryKey().default("singleton"), // Single row
    activeAccountId: (0, sqlite_core_1.text)("active_account_id"), // References anthropicAccounts.id
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).$defaultFn(function () { return new Date(); }),
});
