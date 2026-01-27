import { checkInternetConnection } from "./network";

export type OllamaStatus = {
  available: boolean;
  version?: string;
  models: string[];
  recommendedModel?: string;
};

async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch("http://localhost:11434/api/tags", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { available: false, models: [] };
    }

    const data = await response.json();
    const models = data.models?.map((m: { name: string }) => m.name) || [];

    const codingModels = [
      "qwen2.5-coder:7b",
      "qwen2.5-coder:3b",
      "qwen2.5-coder:1.5b",
      "qwen3-coder:30b",
      "qwen3-coder:14b",
      "qwen3-coder:8b",
      "qwen3-coder:4b",
      "deepseek-coder:6.7b",
      "deepseek-coder:33b",
      "codestral:22b",
    ];

    let recommendedModel = codingModels.find((model) => models.includes(model));
    if (!recommendedModel) {
      recommendedModel = models.find(
        (model: string) =>
          (model.includes("qwen") && model.includes("coder")) ||
          (model.includes("deepseek") && model.includes("coder")) ||
          model.includes("codestral"),
      );
    }

    return {
      available: true,
      models,
      recommendedModel: recommendedModel || models[0],
      version: data.version,
    };
  } catch {
    return { available: false, models: [] };
  }
}

async function generateWithOllama(prompt: string, model?: string | null): Promise<string | null> {
  try {
    const status = await checkOllamaStatus();
    if (!status.available) {
      return null;
    }

    const modelToUse = model || status.recommendedModel || status.models[0];
    if (!modelToUse) {
      return null;
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelToUse,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 50,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.response?.trim() || null;
  } catch (error) {
    console.error("[Ollama] Generate error:", error);
    return null;
  }
}

export function createOllamaHandlers() {
  return {
    ollamaGetStatus: async () => {
      const [ollamaStatus, hasInternet] = await Promise.all([
        checkOllamaStatus(),
        checkInternetConnection(),
      ]);

      return {
        ollama: ollamaStatus,
        internet: {
          online: hasInternet,
          checked: Date.now(),
        },
      };
    },

    ollamaIsOfflineModeAvailable: async () => {
      const status = await checkOllamaStatus();
      return {
        available: status.available && !!status.recommendedModel,
        model: status.recommendedModel,
      };
    },

    ollamaGetModels: async () => {
      const status = await checkOllamaStatus();
      return {
        available: status.available,
        models: status.models,
        recommendedModel: status.recommendedModel,
      };
    },

    ollamaGenerateChatName: async ({ userMessage, model }: { userMessage: string; model?: string }) => {
      const prompt = `Generate a very short (2-5 words) title for a coding chat that starts with this message. Only output the title, nothing else. No quotes, no explanations.\n\nUser message: \"${userMessage.slice(0, 500)}\"\n\nTitle:`;

      const result = await generateWithOllama(prompt, model);
      if (result) {
        const cleaned = result
          .replace(/^[\"']|[\"']$/g, "")
          .replace(/^title:\s*/i, "")
          .trim()
          .slice(0, 50);
        if (cleaned.length > 0) {
          return { name: cleaned };
        }
      }

      return { name: null };
    },

    ollamaGenerateCommitMessage: async ({
      diff,
      fileCount,
      additions,
      deletions,
      model,
    }: {
      diff: string;
      fileCount: number;
      additions: number;
      deletions: number;
      model?: string;
    }) => {
      const prompt = `Generate a conventional commit message for these changes. Use format: type: short description\n\nTypes: feat (new feature), fix (bug fix), docs, style, refactor, test, chore\n\nChanges: ${fileCount} files, +${additions}/-${deletions} lines\n\nDiff (truncated):\n${diff.slice(0, 3000)}\n\nCommit message:`;

      const result = await generateWithOllama(prompt, model);
      if (result) {
        const firstLine = result.split("\n")[0]?.trim();
        if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
          return { message: firstLine };
        }
      }

      return { message: null };
    },
  };
}
