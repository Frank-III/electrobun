import { mkdir } from "fs/promises";
import { join } from "path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Updater } from "electrobun/bun";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlite: Database | null = null;

async function resolveUserDataDir() {
  try {
    const appDataFolder = await Updater.appDataFolder();
    if (appDataFolder) return appDataFolder;
  } catch {
    // Fallback handled below
  }

  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();

  if (platform === "win32") {
    const base = process.env.LOCALAPPDATA || join(home, "AppData", "Local");
    return join(base, "dev.onecode.again", "onecode-again");
  }

  if (platform === "darwin") {
    return join(home, "Library", "Application Support", "dev.onecode.again", "onecode-again");
  }

  const base = process.env.XDG_DATA_HOME || join(home, ".local", "share");
  return join(base, "dev.onecode.again", "onecode-again");
}

async function getDatabasePath(): Promise<string> {
  const userDataPath = await resolveUserDataDir();
  const dataDir = join(userDataPath, "data");
  await mkdir(dataDir, { recursive: true });
  return join(dataDir, "agents.db");
}

function getMigrationsPath(): string {
  return join(import.meta.dir, "..", "legacy", "drizzle");
}

export async function initDatabase() {
  if (db) {
    return db;
  }

  const dbPath = await getDatabasePath();
  sqlite = new Database(dbPath);
  sqlite.exec("PRAGMA journal_mode = WAL;");
  sqlite.exec("PRAGMA foreign_keys = ON;");

  db = drizzle(sqlite, { schema });

  const migrationsPath = getMigrationsPath();
  try {
    migrate(db, { migrationsFolder: migrationsPath });
  } catch (error) {
    console.error("[DB] Migration error:", error);
    throw error;
  }

  return db;
}

export async function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
  }
}

export * from "./schema";
