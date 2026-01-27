import { existsSync, lstatSync } from "fs";

let launchDirectory: string | null = null;

export function getLaunchDirectory(): string | null {
  const dir = launchDirectory;
  launchDirectory = null;
  return dir;
}

export function parseLaunchDirectory(): void {
  const args = process.argv.slice(1);

  for (const arg of args) {
    if (arg.startsWith("-") || arg.includes("://")) continue;
    if (!existsSync(arg)) continue;

    try {
      const stat = lstatSync(arg);
      if (stat.isDirectory()) {
        launchDirectory = arg;
        return;
      }
    } catch {
      continue;
    }
  }
}
