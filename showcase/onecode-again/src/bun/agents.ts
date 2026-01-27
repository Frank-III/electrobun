import { access, mkdir, readdir, unlink } from "fs/promises";
import { homedir } from "os";
import { join, relative } from "path";

export const VALID_AGENT_MODELS = ["sonnet", "opus", "haiku", "inherit"] as const;
export type AgentModel = (typeof VALID_AGENT_MODELS)[number];

export type ParsedAgent = {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
  disallowedTools?: string[];
  model?: AgentModel;
};

export type FileAgent = ParsedAgent & {
  source: "user" | "project";
  path: string;
};

type Frontmatter = {
  name?: string;
  description?: string;
  tools?: string[];
  disallowedTools?: string[];
  model?: AgentModel;
};

function parseFrontmatterValue(value: string): string[] | string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return trimmed;
}

function parseFrontmatter(content: string): Frontmatter {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return {};
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return {};
  }

  const lines = trimmed.slice(3, endIndex).trim().split("\n");
  const data: Frontmatter = {};

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (rawValue.length === 0) {
      const values: string[] = [];
      let j = i + 1;
      for (; j < lines.length; j += 1) {
        const nextLine = lines[j]?.trim();
        if (!nextLine) continue;
        if (!nextLine.startsWith("-")) break;
        values.push(nextLine.replace(/^-/, "").trim());
      }
      i = j - 1;
      if (key === "tools") data.tools = values;
      if (key === "disallowedTools") data.disallowedTools = values;
      continue;
    }

    const value = parseFrontmatterValue(rawValue);

    if (key === "name" && typeof value === "string") {
      data.name = value;
    } else if (key === "description" && typeof value === "string") {
      data.description = value;
    } else if (key === "tools") {
      data.tools = Array.isArray(value) ? value : value ? [value] : [];
    } else if (key === "disallowedTools") {
      data.disallowedTools = Array.isArray(value) ? value : value ? [value] : [];
    } else if (key === "model" && typeof value === "string" && VALID_AGENT_MODELS.includes(value as AgentModel)) {
      data.model = value as AgentModel;
    }
  }

  return data;
}

function stripFrontmatter(content: string): string {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return content.trim();
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return content.trim();
  }

  return trimmed.slice(endIndex + 4).trim();
}

function isValidEntryName(name: string): boolean {
  return !name.includes("..") && !name.includes("/") && !name.includes("\\");
}

function normalizeAgentName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function buildAgentMarkdown(agent: {
  name: string;
  description: string;
  prompt: string;
  tools?: string[];
  disallowedTools?: string[];
  model?: AgentModel;
}): string {
  const frontmatter: string[] = [];
  frontmatter.push(`name: ${agent.name}`);
  frontmatter.push(`description: ${agent.description}`);
  if (agent.tools && agent.tools.length > 0) {
    frontmatter.push(`tools: ${agent.tools.join(", ")}`);
  }
  if (agent.disallowedTools && agent.disallowedTools.length > 0) {
    frontmatter.push(`disallowedTools: ${agent.disallowedTools.join(", ")}`);
  }
  if (agent.model && agent.model !== "inherit") {
    frontmatter.push(`model: ${agent.model}`);
  }

  return `---\n${frontmatter.join("\n")}\n---\n\n${agent.prompt}`;
}

async function scanAgentsDirectory(
  dir: string,
  source: "user" | "project",
  basePath?: string,
): Promise<FileAgent[]> {
  const agents: FileAgent[] = [];

  try {
    await access(dir);
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (
        entry.name.includes("..") ||
        entry.name.includes("/") ||
        entry.name.includes("\\")
      ) {
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        const agentPath = join(dir, entry.name);
        try {
          const content = await Bun.file(agentPath).text();
          const parsed = parseFrontmatter(content);
          const prompt = stripFrontmatter(content);

          if (parsed.description && prompt) {
            let displayPath: string;
            if (source === "project" && basePath) {
              displayPath = relative(basePath, agentPath);
            } else {
              const homeDir = homedir();
              displayPath = agentPath.startsWith(homeDir)
                ? "~" + agentPath.slice(homeDir.length)
                : agentPath;
            }

            agents.push({
              name: parsed.name || entry.name.replace(".md", ""),
              description: parsed.description,
              prompt,
              tools: parsed.tools,
              disallowedTools: parsed.disallowedTools,
              model: parsed.model,
              source,
              path: displayPath,
            });
          }
        } catch (err) {
          console.error(`[agents] Failed to read agent ${entry.name}:`, err);
        }
      }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`[agents] Could not scan directory ${dir}:`, err);
    }
  }

  return agents;
}

export function createAgentsHandlers() {
  const listAgents = async ({ cwd }: { cwd?: string } = {}) => {
    const userAgentsDir = join(homedir(), ".claude", "agents");
    const userAgentsPromise = scanAgentsDirectory(userAgentsDir, "user");

    let projectAgentsPromise = Promise.resolve<FileAgent[]>([]);
    if (cwd) {
      const projectAgentsDir = join(cwd, ".claude", "agents");
      projectAgentsPromise = scanAgentsDirectory(projectAgentsDir, "project", cwd);
    }

    const [userAgents, projectAgents] = await Promise.all([
      userAgentsPromise,
      projectAgentsPromise,
    ]);

    return [...projectAgents, ...userAgents];
  };

  return {
    agentsList: listAgents,
    agentsListEnabled: listAgents,

    agentsGet: async ({ name, cwd }: { name: string; cwd?: string }) => {
      const locations = [
        { dir: join(homedir(), ".claude", "agents"), source: "user" as const },
        ...(cwd ? [{ dir: join(cwd, ".claude", "agents"), source: "project" as const }] : []),
      ];

      for (const { dir, source } of locations) {
        const agentPath = join(dir, `${name}.md`);
        try {
          const content = await Bun.file(agentPath).text();
          const parsed = parseFrontmatter(content);
          const prompt = stripFrontmatter(content);

          return {
            name: parsed.name || name,
            description: parsed.description || "",
            prompt,
            tools: parsed.tools,
            disallowedTools: parsed.disallowedTools,
            model: parsed.model,
            source,
            path: agentPath,
          };
        } catch {
          continue;
        }
      }

      return null;
    },

    agentsCreate: async ({
      name,
      description,
      prompt,
      tools,
      disallowedTools,
      model,
      source,
      cwd,
    }: {
      name: string;
      description: string;
      prompt: string;
      tools?: string[];
      disallowedTools?: string[];
      model?: AgentModel;
      source: "user" | "project";
      cwd?: string;
    }) => {
      const safeName = normalizeAgentName(name);
      if (!safeName || safeName.includes("..")) {
        throw new Error("Invalid agent name");
      }

      let targetDir: string;
      if (source === "project") {
        if (!cwd) {
          throw new Error("Project path (cwd) required for project agents");
        }
        targetDir = join(cwd, ".claude", "agents");
      } else {
        targetDir = join(homedir(), ".claude", "agents");
      }

      await mkdir(targetDir, { recursive: true });
      const agentPath = join(targetDir, `${safeName}.md`);

      try {
        await access(agentPath);
        throw new Error(`Agent "${safeName}" already exists`);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
          throw err;
        }
      }

      const content = buildAgentMarkdown({
        name: safeName,
        description,
        prompt,
        tools,
        disallowedTools,
        model,
      });

      await Bun.write(agentPath, content);

      return { name: safeName, path: agentPath, source };
    },

    agentsUpdate: async ({
      originalName,
      name,
      description,
      prompt,
      tools,
      disallowedTools,
      model,
      source,
      cwd,
    }: {
      originalName: string;
      name: string;
      description: string;
      prompt: string;
      tools?: string[];
      disallowedTools?: string[];
      model?: AgentModel;
      source: "user" | "project";
      cwd?: string;
    }) => {
      const safeOriginalName = normalizeAgentName(originalName);
      const safeName = normalizeAgentName(name);
      if (!safeOriginalName || !safeName || safeName.includes("..")) {
        throw new Error("Invalid agent name");
      }

      let targetDir: string;
      if (source === "project") {
        if (!cwd) {
          throw new Error("Project path (cwd) required for project agents");
        }
        targetDir = join(cwd, ".claude", "agents");
      } else {
        targetDir = join(homedir(), ".claude", "agents");
      }

      const originalPath = join(targetDir, `${safeOriginalName}.md`);
      const newPath = join(targetDir, `${safeName}.md`);

      try {
        await access(originalPath);
      } catch {
        throw new Error(`Agent "${safeOriginalName}" not found`);
      }

      if (safeOriginalName !== safeName) {
        try {
          await access(newPath);
          throw new Error(`Agent "${safeName}" already exists`);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
            throw err;
          }
        }
      }

      const content = buildAgentMarkdown({
        name: safeName,
        description,
        prompt,
        tools,
        disallowedTools,
        model,
      });

      if (safeOriginalName !== safeName) {
        await unlink(originalPath);
      }

      await Bun.write(newPath, content);

      return { name: safeName, path: newPath, source };
    },

    agentsDelete: async ({ name, source, cwd }: { name: string; source: "user" | "project"; cwd?: string }) => {
      const safeName = normalizeAgentName(name);
      if (!safeName || safeName.includes("..")) {
        throw new Error("Invalid agent name");
      }

      let targetDir: string;
      if (source === "project") {
        if (!cwd) {
          throw new Error("Project path (cwd) required for project agents");
        }
        targetDir = join(cwd, ".claude", "agents");
      } else {
        targetDir = join(homedir(), ".claude", "agents");
      }

      const agentPath = join(targetDir, `${safeName}.md`);
      await unlink(agentPath);

      return { deleted: true };
    },
  };
}
