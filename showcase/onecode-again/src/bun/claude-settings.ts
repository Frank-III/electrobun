import { mkdir } from "fs/promises";
import { homedir } from "os";
import { dirname, join } from "path";

const CLAUDE_SETTINGS_PATH = join(homedir(), ".claude", "settings.json");

async function readClaudeSettings(): Promise<Record<string, unknown>> {
  try {
    const content = await Bun.file(CLAUDE_SETTINGS_PATH).text();
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeClaudeSettings(settings: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(CLAUDE_SETTINGS_PATH), { recursive: true });
  await Bun.write(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export function createClaudeSettingsHandlers() {
  return {
    claudeSettingsGetIncludeCoAuthoredBy: async () => {
      const settings = await readClaudeSettings();
      return settings.includeCoAuthoredBy !== false;
    },

    claudeSettingsSetIncludeCoAuthoredBy: async ({ enabled }: { enabled: boolean }) => {
      const settings = await readClaudeSettings();

      if (enabled) {
        delete settings.includeCoAuthoredBy;
      } else {
        settings.includeCoAuthoredBy = false;
      }

      await writeClaudeSettings(settings);
      return { success: true };
    },
  };
}
