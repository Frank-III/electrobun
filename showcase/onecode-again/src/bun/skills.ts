import { access, readdir } from "fs/promises";
import { homedir } from "os";
import { join, relative } from "path";

export type FileSkill = {
  name: string;
  description: string;
  source: "user" | "project";
  path: string;
};

type SkillFrontmatter = {
  name?: string;
  description?: string;
};

function parseFrontmatter(content: string): SkillFrontmatter {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return {};
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return {};
  }

  const frontmatter = trimmed.slice(3, endIndex).trim();
  const data: SkillFrontmatter = {};

  for (const line of frontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "name") {
      data.name = value;
    } else if (key === "description") {
      data.description = value;
    }
  }

  return data;
}

function isValidEntryName(name: string): boolean {
  return !name.includes("..") && !name.includes("/") && !name.includes("\\");
}

async function scanSkillsDirectory(
  dir: string,
  source: "user" | "project",
  basePath?: string,
): Promise<FileSkill[]> {
  const skills: FileSkill[] = [];

  try {
    try {
      await access(dir);
    } catch {
      return skills;
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!isValidEntryName(entry.name)) {
        console.warn(`[skills] Skipping invalid directory name: ${entry.name}`);
        continue;
      }

      const skillMdPath = join(dir, entry.name, "SKILL.md");

      try {
        await access(skillMdPath);
        const content = await Bun.file(skillMdPath).text();
        const parsed = parseFrontmatter(content);

        let displayPath: string;
        if (source === "project" && basePath) {
          displayPath = relative(basePath, skillMdPath);
        } else {
          const homeDir = homedir();
          displayPath = skillMdPath.startsWith(homeDir)
            ? "~" + skillMdPath.slice(homeDir.length)
            : skillMdPath;
        }

        skills.push({
          name: parsed.name || entry.name,
          description: parsed.description || "",
          source,
          path: displayPath,
        });
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error(`[skills] Failed to scan directory ${dir}:`, err);
  }

  return skills;
}

export function createSkillsHandlers() {
  const listSkills = async ({ cwd }: { cwd?: string } = {}) => {
    const userSkillsDir = join(homedir(), ".claude", "skills");
    const userSkillsPromise = scanSkillsDirectory(userSkillsDir, "user");

    let projectSkillsPromise = Promise.resolve<FileSkill[]>([]);
    if (cwd) {
      const projectSkillsDir = join(cwd, ".claude", "skills");
      projectSkillsPromise = scanSkillsDirectory(projectSkillsDir, "project", cwd);
    }

    const [userSkills, projectSkills] = await Promise.all([
      userSkillsPromise,
      projectSkillsPromise,
    ]);

    return [...projectSkills, ...userSkills];
  };

  return {
    skillsList: listSkills,
    skillsListEnabled: listSkills,
  };
}
