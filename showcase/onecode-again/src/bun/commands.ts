import { access, readdir } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

type CommandSource = "user" | "project";

export type FileCommand = {
  name: string;
  description: string;
  argumentHint?: string;
  source: CommandSource;
  path: string;
};

type CommandFrontmatter = {
  description?: string;
  argumentHint?: string;
};

function parseFrontmatter(content: string): CommandFrontmatter {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return {};
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return {};
  }

  const frontmatter = trimmed.slice(3, endIndex).trim();
  const data: CommandFrontmatter = {};

  for (const line of frontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "description") {
      data.description = value;
    } else if (key === "argument-hint") {
      data.argumentHint = value;
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

async function scanCommandsDirectory(
  dir: string,
  source: CommandSource,
  prefix = "",
): Promise<FileCommand[]> {
  const commands: FileCommand[] = [];

  try {
    try {
      await access(dir);
    } catch {
      return commands;
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!isValidEntryName(entry.name)) {
        console.warn(`[commands] Skipping invalid entry name: ${entry.name}`);
        continue;
      }

      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const nestedCommands = await scanCommandsDirectory(
          fullPath,
          source,
          prefix ? `${prefix}:${entry.name}` : entry.name,
        );
        commands.push(...nestedCommands);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const baseName = entry.name.replace(/\.md$/, "");
        const commandName = prefix ? `${prefix}:${baseName}` : baseName;

        try {
          const content = await Bun.file(fullPath).text();
          const parsed = parseFrontmatter(content);

          commands.push({
            name: commandName,
            description: parsed.description || "",
            argumentHint: parsed.argumentHint,
            source,
            path: fullPath,
          });
        } catch (err) {
          console.warn(`[commands] Failed to read ${fullPath}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(`[commands] Failed to scan directory ${dir}:`, err);
  }

  return commands;
}

export function createCommandsHandlers() {
  return {
    commandsList: async ({ projectPath }: { projectPath?: string } = {}) => {
      const userCommandsDir = join(homedir(), ".claude", "commands");
      const userCommandsPromise = scanCommandsDirectory(userCommandsDir, "user");

      let projectCommandsPromise = Promise.resolve<FileCommand[]>([]);
      if (projectPath) {
        const projectCommandsDir = join(projectPath, ".claude", "commands");
        projectCommandsPromise = scanCommandsDirectory(projectCommandsDir, "project");
      }

      const [userCommands, projectCommands] = await Promise.all([
        userCommandsPromise,
        projectCommandsPromise,
      ]);

      return [...projectCommands, ...userCommands];
    },

    commandsGetContent: async ({ path }: { path: string }) => {
      if (path.includes("..")) {
        throw new Error("Invalid path");
      }

      try {
        const content = await Bun.file(path).text();
        const body = stripFrontmatter(content);
        return { content: body.trim() };
      } catch (err) {
        console.error(`[commands] Failed to read command content:`, err);
        return { content: "" };
      }
    },
  };
}
