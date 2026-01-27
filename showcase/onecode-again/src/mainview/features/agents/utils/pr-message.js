"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrMessage = generatePrMessage;
exports.generateCommitToPrMessage = generateCommitToPrMessage;
exports.generateReviewMessage = generateReviewMessage;
/**
 * Generates a message for Claude to create a PR
 */
function generatePrMessage(context) {
    var branch = context.branch, baseBranch = context.baseBranch, uncommittedCount = context.uncommittedCount, hasUpstream = context.hasUpstream;
    var lines = [
        uncommittedCount > 0
            ? "There are ".concat(uncommittedCount, " uncommitted changes.")
            : "All changes are committed.",
        "The current branch is ".concat(branch, "."),
        "The target branch is origin/".concat(baseBranch, "."),
        hasUpstream
            ? "The branch is already pushed to remote."
            : "There is no upstream branch yet.",
        "The user requested a PR.",
        "",
        "Follow these exact steps to create a PR:",
        "",
    ];
    var steps = [];
    if (uncommittedCount > 0) {
        steps.push("Run git diff to review uncommitted changes");
        steps.push("Commit them. Write a clear, concise commit message.");
    }
    if (!hasUpstream) {
        steps.push("Push to origin");
    }
    steps.push("Use git diff origin/".concat(baseBranch, "... to review the PR diff"));
    steps.push("Use gh pr create --base ".concat(baseBranch, " to create a PR. Keep the title under 80 characters and description under five sentences."));
    steps.push("If any of these steps fail, ask the user for help.");
    // Add numbered steps
    steps.forEach(function (step, index) {
        lines.push("".concat(index + 1, ". ").concat(step));
    });
    return lines.join("\n");
}
/**
 * Generates a message for Claude to commit and push changes to an existing PR
 */
function generateCommitToPrMessage(context) {
    var branch = context.branch, baseBranch = context.baseBranch, uncommittedCount = context.uncommittedCount;
    if (uncommittedCount === 0) {
        return "All changes are already committed. The branch ".concat(branch, " is up to date.");
    }
    return "There are ".concat(uncommittedCount, " uncommitted changes on branch ").concat(branch, ".\nThe PR already exists and targets origin/").concat(baseBranch, ".\n\nPlease commit and push these changes to update the PR:\n\n1. Run git diff to review uncommitted changes\n2. Commit them with a clear, concise commit message\n3. Push to origin to update the PR\n4. If any of these steps fail, ask the user for help.");
}
/**
 * Generates a message for Claude to perform a code review
 */
function generateReviewMessage(context) {
    var branch = context.branch, baseBranch = context.baseBranch;
    return "You are performing a code review on the changes in the current branch.\n\nThe current branch is ".concat(branch, ", and the target branch is origin/").concat(baseBranch, ".\n\n## Code Review Instructions\n\nWhen reviewing the diff:\n1. **Focus on logic and correctness** - Check for bugs, edge cases, and potential issues.\n2. **Consider readability** - Is the code clear and maintainable?\n3. **Evaluate performance** - Are there obvious performance concerns?\n4. **Assess test coverage** - Are there adequate tests for these changes?\n\n## Getting the Diff\n\nRun `git diff origin/").concat(baseBranch, "...` to get the changes.\n\n## Output Format\n\nProvide:\n1. A brief summary of what the changes do\n2. A table of issues found with columns: severity (\uD83D\uDD34 high, \uD83D\uDFE1 medium, \uD83D\uDFE2 low), file:line, issue, suggestion\n3. If no issues found, state that the code looks good\n\nKeep the review concise and actionable.");
}
