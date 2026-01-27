import { getShellEnvironment } from "./shell-env";

const STRIPPED_ENV_KEYS = [
  "OPENAI_API_KEY",
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_VERTEX",
];

function stripSensitiveKeys(env: Record<string, string>): Record<string, string> {
  const result = { ...env };
  for (const key of STRIPPED_ENV_KEYS) {
    if (key in result) {
      delete result[key];
    }
  }
  return result;
}

export async function getClaudeShellEnvironment(): Promise<Record<string, string>> {
  const env = await getShellEnvironment();
  return stripSensitiveKeys(env);
}
