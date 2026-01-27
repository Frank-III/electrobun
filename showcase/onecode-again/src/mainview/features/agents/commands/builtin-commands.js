"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILTIN_SLASH_COMMANDS = exports.COMMAND_PROMPTS = void 0;
exports.isPromptCommand = isPromptCommand;
exports.filterBuiltinCommands = filterBuiltinCommands;
/**
 * Prompt texts for prompt-based slash commands
 */
exports.COMMAND_PROMPTS = {
    review: "Please review the code in the current context and provide feedback on code quality, potential bugs, and improvements.",
    "pr-comments": "Generate detailed PR review comments for the changes in the current context.",
    "release-notes": "Generate release notes summarizing the changes in this codebase.",
    "security-review": "Perform a security audit of the code in the current context. Identify vulnerabilities, security risks, and suggest fixes.",
    commit: "Закоммить это аккуратно, не трогая больше ничего. Сделай коммит только для staged изменений, не добавляй никакие другие файлы и не вноси дополнительных изменений.",
    "worktree-setup": "Create a worktree setup script for this project.\n\nYour task:\n1. Analyze the project to understand what's needed to set up a working copy\n2. Create the file .1code/worktree.json with setup commands\n\nThe goal is to reproduce the EXACT same working state as the original repo in the new worktree.\n\nRules:\n- Use only \"setup-worktree\" key (works on all platforms)\n- Install dependencies using the project's package manager (check for bun.lockb, pnpm-lock.yaml, yarn.lock, package-lock.json)\n- Copy ALL real env files that exist (.env, .env.local, .env.development, etc) - NOT example files\n- Use $ROOT_WORKTREE_PATH to reference the main repo path\n- Don't include build steps unless absolutely necessary for the project to work\n\nExample output for .1code/worktree.json:\n{\n  \"setup-worktree\": [\n    \"bun install\",\n    \"cp $ROOT_WORKTREE_PATH/.env .env\",\n    \"cp $ROOT_WORKTREE_PATH/.env.local .env.local\"\n  ]\n}\n\nNow analyze this project and create .1code/worktree.json with the appropriate setup commands.",
};
/**
 * Check if a command is a prompt-based command
 */
function isPromptCommand(type) {
    return type in exports.COMMAND_PROMPTS;
}
/**
 * Built-in slash commands that are handled client-side
 */
exports.BUILTIN_SLASH_COMMANDS = [
    {
        id: "builtin:clear",
        name: "clear",
        command: "/clear",
        description: "Start a new conversation (creates new sub-chat)",
        category: "builtin",
    },
    {
        id: "builtin:plan",
        name: "plan",
        command: "/plan",
        description: "Switch to Plan mode (creates plan before making changes)",
        category: "builtin",
    },
    {
        id: "builtin:agent",
        name: "agent",
        command: "/agent",
        description: "Switch to Agent mode (applies changes directly)",
        category: "builtin",
    },
    {
        id: "builtin:compact",
        name: "compact",
        command: "/compact",
        description: "Compact conversation context to reduce token usage",
        category: "builtin",
    },
    // Prompt-based commands
    {
        id: "builtin:review",
        name: "review",
        command: "/review",
        description: "Ask agent to review your code",
        category: "builtin",
    },
    {
        id: "builtin:pr-comments",
        name: "pr-comments",
        command: "/pr-comments",
        description: "Ask agent to generate PR review comments",
        category: "builtin",
    },
    {
        id: "builtin:release-notes",
        name: "release-notes",
        command: "/release-notes",
        description: "Ask agent to generate release notes",
        category: "builtin",
    },
    {
        id: "builtin:security-review",
        name: "security-review",
        command: "/security-review",
        description: "Ask agent to perform a security audit",
        category: "builtin",
    },
    {
        id: "builtin:commit",
        name: "commit",
        command: "/commit",
        description: "Commit staged changes carefully without touching anything else",
        category: "builtin",
    },
    {
        id: "builtin:worktree-setup",
        name: "worktree-setup",
        command: "/worktree-setup",
        description: "Generate worktree setup config with AI",
        category: "builtin",
    },
];
/**
 * Filter builtin commands by search text
 */
function filterBuiltinCommands(searchText) {
    if (!searchText)
        return exports.BUILTIN_SLASH_COMMANDS;
    var query = searchText.toLowerCase();
    return exports.BUILTIN_SLASH_COMMANDS.filter(function (cmd) {
        return cmd.name.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query);
    });
}
