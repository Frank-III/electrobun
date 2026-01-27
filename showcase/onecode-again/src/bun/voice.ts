let userConfiguredOpenAIKey: string | null = null;

function getOpenAIApiKey(): string | null {
  if (userConfiguredOpenAIKey && userConfiguredOpenAIKey.startsWith("sk-")) {
    return userConfiguredOpenAIKey;
  }

  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }

  return null;
}

export function createVoiceHandlers() {
  return {
    voiceTranscribe: async () => {
      throw new Error("Voice transcription is not available in the Bun backend yet.");
    },

    voiceIsAvailable: async () => {
      const hasKey = !!getOpenAIApiKey();
      if (!hasKey) {
        return {
          available: false,
          method: null,
          reason: "Voice transcription is not available in the Bun backend yet.",
        };
      }

      return {
        available: false,
        method: null,
        reason: "Voice transcription is not available in the Bun backend yet.",
      };
    },

    voiceSetOpenAIKey: async ({ key }: { key: string }) => {
      const trimmed = key.trim();
      if (trimmed && !trimmed.startsWith("sk-")) {
        throw new Error("Invalid OpenAI API key format. Key should start with 'sk-'.");
      }
      userConfiguredOpenAIKey = trimmed || null;
      return { success: true };
    },

    voiceHasOpenAIKey: async () => {
      return { hasKey: !!getOpenAIApiKey() };
    },
  };
}
