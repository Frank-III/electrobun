import { eq } from "drizzle-orm";
import { getDatabase, projects } from "./db";
import {
  detectWorktreeConfig,
  getAvailableConfigPaths,
  saveWorktreeConfig,
  type WorktreeConfig,
} from "./worktree-config";

export function createWorktreeConfigHandlers() {
  return {
    worktreeConfigGet: async ({ projectId }: { projectId: string }) => {
      const db = await getDatabase();
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .get();

      if (!project) {
        throw new Error("Project not found");
      }

      const detected = await detectWorktreeConfig(project.path);
      const available = await getAvailableConfigPaths(project.path);

      return {
        config: detected.config,
        path: detected.path,
        source: detected.source,
        available,
        projectPath: project.path,
      };
    },

    worktreeConfigSave: async ({
      projectId,
      config,
      target,
    }: {
      projectId: string;
      config: WorktreeConfig;
      target?: string;
    }) => {
      const db = await getDatabase();
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .get();

      if (!project) {
        throw new Error("Project not found");
      }

      return saveWorktreeConfig(project.path, config, target || "1code");
    },

    worktreeConfigGetAvailablePaths: async ({ projectId }: { projectId: string }) => {
      const db = await getDatabase();
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .get();

      if (!project) {
        throw new Error("Project not found");
      }

      return getAvailableConfigPaths(project.path);
    },
  };
}
