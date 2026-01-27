import { mkdir, readdir, stat } from "fs/promises";
import { basename, join, relative } from "path";
import { Updater } from "electrobun/bun";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "release",
  ".next",
  ".nuxt",
  ".output",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  ".cache",
  ".turbo",
  ".vercel",
  ".netlify",
  "out",
  ".svelte-kit",
  ".astro",
]);

const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db", ".gitkeep"]);

const IGNORED_EXTENSIONS = new Set([
  ".log",
  ".lock",
  ".pyc",
  ".pyo",
  ".class",
  ".o",
  ".obj",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
]);

const ALLOWED_LOCK_FILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
]);

const APP_IDENTIFIER = "dev.onecode.again";
const APP_NAME = "onecode-again";
const CACHE_TTL = 5000;

interface FileEntry {
  path: string;
  type: "file" | "folder";
}

const fileListCache = new Map<string, { entries: FileEntry[]; timestamp: number }>();

async function resolveUserDataDir() {
  try {
    const appDataFolder = await Updater.appDataFolder();
    if (appDataFolder) return appDataFolder;
  } catch (error) {
    console.warn("[files] Updater.appDataFolder failed, using fallback path.", error);
  }

  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();

  if (platform === "win32") {
    const base = process.env.LOCALAPPDATA || join(home, "AppData", "Local");
    return join(base, APP_IDENTIFIER, APP_NAME);
  }

  if (platform === "darwin") {
    return join(home, "Library", "Application Support", APP_IDENTIFIER, APP_NAME);
  }

  const base = process.env.XDG_DATA_HOME || join(home, ".local", "share");
  return join(base, APP_IDENTIFIER, APP_NAME);
}

async function scanDirectory(
  rootPath: string,
  currentPath: string = rootPath,
  depth: number = 0,
  maxDepth: number = 15,
): Promise<FileEntry[]> {
  if (depth > maxDepth) return [];

  const entries: FileEntry[] = [];

  try {
    const dirEntries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of dirEntries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith(".") && !entry.name.startsWith(".github") && !entry.name.startsWith(".vscode")) {
          continue;
        }

        entries.push({ path: relativePath, type: "folder" });
        const subEntries = await scanDirectory(rootPath, fullPath, depth + 1, maxDepth);
        entries.push(...subEntries);
      } else if (entry.isFile()) {
        if (IGNORED_FILES.has(entry.name)) continue;

        const ext = entry.name.includes(".") ? "." + entry.name.split(".").pop()?.toLowerCase() : "";
        if (IGNORED_EXTENSIONS.has(ext) && !ALLOWED_LOCK_FILES.has(entry.name)) {
          continue;
        }

        entries.push({ path: relativePath, type: "file" });
      }
    }
  } catch (error) {
    console.warn(`[files] Could not read directory: ${currentPath}`, error);
  }

  return entries;
}

async function getEntryList(projectPath: string): Promise<FileEntry[]> {
  const cached = fileListCache.get(projectPath);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.entries;
  }

  const entries = await scanDirectory(projectPath);
  fileListCache.set(projectPath, { entries, timestamp: now });

  return entries;
}

function filterEntries(entries: FileEntry[], query: string, limit: number) {
  const queryLower = query.toLowerCase();

  let filtered = entries;
  if (query) {
    filtered = entries.filter((entry) => {
      const name = basename(entry.path).toLowerCase();
      const pathLower = entry.path.toLowerCase();
      return name.includes(queryLower) || pathLower.includes(queryLower);
    });
  }

  filtered.sort((a, b) => {
    const aName = basename(a.path).toLowerCase();
    const bName = basename(b.path).toLowerCase();

    if (query) {
      const aExact = aName === queryLower;
      const bExact = bName === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aName.startsWith(queryLower);
      const bStarts = bName.startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      if (aStarts && bStarts && aName.length !== bName.length) {
        return aName.length - bName.length;
      }

      const aContains = aName.includes(queryLower);
      const bContains = bName.includes(queryLower);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
    }

    return aName.localeCompare(bName);
  });

  const limited = filtered.slice(0, Math.min(limit, 200));

  return limited.map((entry) => ({
    id: `${entry.type}:local:${entry.path}`,
    label: basename(entry.path),
    path: entry.path,
    repository: "local",
    type: entry.type,
  }));
}

export function createFileHandlers() {
  return {
    filesSearch: async ({ projectPath, query, limit }: { projectPath: string; query?: string; limit?: number }) => {
      if (!projectPath) return [];

      try {
        const pathStat = await stat(projectPath);
        if (!pathStat.isDirectory()) {
          console.warn(`[files] Not a directory: ${projectPath}`);
          return [];
        }

        const entries = await getEntryList(projectPath);
        return filterEntries(entries, query ?? "", limit ?? 50);
      } catch (error) {
        console.error(`[files] Error searching files:`, error);
        return [];
      }
    },

    filesClearCache: ({ projectPath }: { projectPath: string }) => {
      fileListCache.delete(projectPath);
      return { success: true };
    },

    filesRead: async ({ filePath }: { filePath: string }) => {
      try {
        return await Bun.file(filePath).text();
      } catch (error) {
        console.error(`[files] Error reading file ${filePath}:`, error);
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },

    filesWritePastedText: async ({
      subChatId,
      text,
      filename,
    }: {
      subChatId: string;
      text: string;
      filename?: string;
    }) => {
      const userDataDir = await resolveUserDataDir();
      const sessionDir = join(userDataDir, "claude-sessions", subChatId);
      const pastedDir = join(sessionDir, "pasted");
      await mkdir(pastedDir, { recursive: true });

      const finalFilename = filename || `pasted_${Date.now()}.txt`;
      const filePath = join(pastedDir, finalFilename);

      await Bun.write(filePath, text);

      return {
        filePath,
        filename: finalFilename,
        size: text.length,
      };
    },
  };
}
