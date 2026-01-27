import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { homedir } from "os";
import { basename, join } from "path";
import { Utils } from "electrobun/bun";
import { desc, eq } from "drizzle-orm";
import { getDatabase, projects } from "./db";
import { getGitRemoteInfo } from "./git";
import { trackProjectOpened } from "./analytics";
import { getLaunchDirectory } from "./cli";

async function runCommand(command: string, args: string[], cwd?: string) {
  const proc = Bun.spawn([command, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = proc.stdout ? await new Response(proc.stdout).text() : "";
  const stderr = proc.stderr ? await new Response(proc.stderr).text() : "";
  const exitCode = await proc.exited;
  if ((exitCode ?? 0) !== 0) {
    throw new Error(stderr || `Command failed: ${command}`);
  }
  return stdout;
}

export function createProjectsHandlers() {
  return {
    projectsGetLaunchDirectory: () => getLaunchDirectory(),

    projectsList: async () => {
      const db = await getDatabase();
      return db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
    },

    projectsGet: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      return db.select().from(projects).where(eq(projects.id, id)).get();
    },

    projectsOpenFolder: async () => {
      const paths = await Utils.openFileDialog({
        directory: true,
        multiple: false,
      });

      if (!paths?.length) {
        return null;
      }

      const folderPath = paths[0]!;
      const folderName = basename(folderPath);
      const gitInfo = await getGitRemoteInfo(folderPath);
      const db = await getDatabase();

      const existing = db
        .select()
        .from(projects)
        .where(eq(projects.path, folderPath))
        .get();

      if (existing) {
        const updatedProject = db
          .update(projects)
          .set({
            updatedAt: new Date(),
            gitRemoteUrl: gitInfo.remoteUrl,
            gitProvider: gitInfo.provider,
            gitOwner: gitInfo.owner,
            gitRepo: gitInfo.repo,
          })
          .where(eq(projects.id, existing.id))
          .returning()
          .get();

        trackProjectOpened({
          id: updatedProject!.id,
          hasGitRemote: !!gitInfo.remoteUrl,
        });

        return updatedProject;
      }

      const newProject = db
        .insert(projects)
        .values({
          name: folderName,
          path: folderPath,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get();

      trackProjectOpened({
        id: newProject!.id,
        hasGitRemote: !!gitInfo.remoteUrl,
      });

      return newProject;
    },

    projectsCreate: async ({ path, name }: { path: string; name?: string }) => {
      const db = await getDatabase();
      const projectName = name || basename(path);

      const existing = db
        .select()
        .from(projects)
        .where(eq(projects.path, path))
        .get();

      if (existing) {
        return existing;
      }

      const gitInfo = await getGitRemoteInfo(path);

      return db
        .insert(projects)
        .values({
          name: projectName,
          path,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get();
    },

    projectsRename: async ({ id, name }: { id: string; name: string }) => {
      const db = await getDatabase();
      return db
        .update(projects)
        .set({ name, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning()
        .get();
    },

    projectsDelete: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      return db.delete(projects).where(eq(projects.id, id)).returning().get();
    },

    projectsRefreshGitInfo: async ({ id }: { id: string }) => {
      const db = await getDatabase();
      const project = db.select().from(projects).where(eq(projects.id, id)).get();

      if (!project) {
        return null;
      }

      const gitInfo = await getGitRemoteInfo(project.path);

      return db
        .update(projects)
        .set({
          updatedAt: new Date(),
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .where(eq(projects.id, id))
        .returning()
        .get();
    },

    projectsCloneFromGitHub: async ({ repoUrl }: { repoUrl: string }) => {
      let owner: string | null = null;
      let repo: string | null = null;

      const httpsMatch = repoUrl.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
      if (httpsMatch) {
        owner = httpsMatch[1] || null;
        repo = httpsMatch[2]?.replace(/\.git$/, "") || null;
      }

      const sshMatch = repoUrl.match(/git@github\.com:([^/]+)\/(.+)/);
      if (sshMatch) {
        owner = sshMatch[1] || null;
        repo = sshMatch[2]?.replace(/\.git$/, "") || null;
      }

      const shortMatch = repoUrl.match(/^([^/]+)\/([^/]+)$/);
      if (shortMatch) {
        owner = shortMatch[1] || null;
        repo = shortMatch[2]?.replace(/\.git$/, "") || null;
      }

      if (!owner || !repo) {
        throw new Error("Invalid GitHub URL or repo format");
      }

      const homePath = homedir();
      const reposDir = join(homePath, ".21st", "repos", owner);
      const clonePath = join(reposDir, repo);

      const db = await getDatabase();

      if (existsSync(clonePath)) {
        const existing = db
          .select()
          .from(projects)
          .where(eq(projects.path, clonePath))
          .get();

        if (existing) {
          trackProjectOpened({
            id: existing.id,
            hasGitRemote: !!existing.gitRemoteUrl,
          });
          return existing;
        }

        const gitInfo = await getGitRemoteInfo(clonePath);
        const newProject = db
          .insert(projects)
          .values({
            name: repo,
            path: clonePath,
            gitRemoteUrl: gitInfo.remoteUrl,
            gitProvider: gitInfo.provider,
            gitOwner: gitInfo.owner,
            gitRepo: gitInfo.repo,
          })
          .returning()
          .get();

        trackProjectOpened({
          id: newProject!.id,
          hasGitRemote: !!gitInfo.remoteUrl,
        });

        return newProject;
      }

      await mkdir(reposDir, { recursive: true });
      const cloneUrl = `https://github.com/${owner}/${repo}.git`;
      await runCommand("git", ["clone", cloneUrl, clonePath]);

      const gitInfo = await getGitRemoteInfo(clonePath);
      const newProject = db
        .insert(projects)
        .values({
          name: repo,
          path: clonePath,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get();

      trackProjectOpened({
        id: newProject!.id,
        hasGitRemote: !!gitInfo.remoteUrl,
      });

      return newProject;
    },

    projectsLocateAndAdd: async ({
      expectedOwner,
      expectedRepo,
    }: {
      expectedOwner: string;
      expectedRepo: string;
    }) => {
      const paths = await Utils.openFileDialog({
        directory: true,
        multiple: false,
      });

      if (!paths?.length) {
        return { success: false as const, reason: "canceled" as const };
      }

      const folderPath = paths[0]!;
      const gitInfo = await getGitRemoteInfo(folderPath);

      if (gitInfo.owner !== expectedOwner || gitInfo.repo !== expectedRepo) {
        return {
          success: false as const,
          reason: "wrong-repo" as const,
          found:
            gitInfo.owner && gitInfo.repo
              ? `${gitInfo.owner}/${gitInfo.repo}`
              : "not a git repository",
        };
      }

      const db = await getDatabase();
      const existing = db
        .select()
        .from(projects)
        .where(eq(projects.path, folderPath))
        .get();

      if (existing) {
        const updated = db
          .update(projects)
          .set({
            updatedAt: new Date(),
            gitRemoteUrl: gitInfo.remoteUrl,
            gitProvider: gitInfo.provider,
            gitOwner: gitInfo.owner,
            gitRepo: gitInfo.repo,
          })
          .where(eq(projects.id, existing.id))
          .returning()
          .get();

        return { success: true as const, project: updated };
      }

      const project = db
        .insert(projects)
        .values({
          name: basename(folderPath),
          path: folderPath,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get();

      return { success: true as const, project };
    },

    projectsPickCloneDestination: async ({ suggestedName }: { suggestedName: string }) => {
      const homePath = homedir();
      const defaultPath = join(homePath, ".21st", "repos");
      await mkdir(defaultPath, { recursive: true });

      const paths = await Utils.openFileDialog({
        directory: true,
        multiple: false,
        startingFolder: defaultPath,
      });

      if (!paths?.length) {
        return { success: false as const, reason: "canceled" as const };
      }

      const targetPath = join(paths[0]!, suggestedName);
      return { success: true as const, targetPath };
    },
  };
}
