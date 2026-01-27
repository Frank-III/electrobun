import { getClaudeShellEnvironment } from "./claude-env"

export function createClaudeCodeHandlers() {
  return {
    claudeCodeHasExistingCliConfig: async () => {
      const shellEnv = await getClaudeShellEnvironment()
      const hasConfig = !!(shellEnv.ANTHROPIC_API_KEY || shellEnv.ANTHROPIC_BASE_URL)
      return {
        hasConfig,
        hasApiKey: !!shellEnv.ANTHROPIC_API_KEY,
        baseUrl: shellEnv.ANTHROPIC_BASE_URL || null,
      }
    },
  }
}
