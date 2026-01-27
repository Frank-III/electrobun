"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppRouter = createAppRouter;
var index_1 = require("../index");
var projects_1 = require("./projects");
var chats_1 = require("./chats");
var claude_1 = require("./claude");
var claude_code_1 = require("./claude-code");
var claude_settings_1 = require("./claude-settings");
var anthropic_accounts_1 = require("./anthropic-accounts");
var ollama_1 = require("./ollama");
var terminal_1 = require("./terminal");
var external_1 = require("./external");
var files_1 = require("./files");
var debug_1 = require("./debug");
var skills_1 = require("./skills");
var agents_1 = require("./agents");
var worktree_config_1 = require("./worktree-config");
var sandbox_import_1 = require("./sandbox-import");
var commands_1 = require("./commands");
var voice_1 = require("./voice");
var git_1 = require("../../git");
/**
 * Create the main app router
 * Uses getter pattern to avoid stale window references
 */
function createAppRouter(getWindow) {
    return (0, index_1.router)({
        projects: projects_1.projectsRouter,
        chats: chats_1.chatsRouter,
        claude: claude_1.claudeRouter,
        claudeCode: claude_code_1.claudeCodeRouter,
        claudeSettings: claude_settings_1.claudeSettingsRouter,
        anthropicAccounts: anthropic_accounts_1.anthropicAccountsRouter,
        ollama: ollama_1.ollamaRouter,
        terminal: terminal_1.terminalRouter,
        external: external_1.externalRouter,
        files: files_1.filesRouter,
        debug: debug_1.debugRouter,
        skills: skills_1.skillsRouter,
        agents: agents_1.agentsRouter,
        worktreeConfig: worktree_config_1.worktreeConfigRouter,
        sandboxImport: sandbox_import_1.sandboxImportRouter,
        commands: commands_1.commandsRouter,
        voice: voice_1.voiceRouter,
        // Git operations - named "changes" to match Superset API
        changes: (0, git_1.createGitRouter)(),
    });
}
