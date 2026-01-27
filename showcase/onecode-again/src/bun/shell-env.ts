import os from "os";
import path from "path";

export type CommandResult = {
  code: number;
  stdout: string;
  stderr: string;
};

let cachedEnv: Record<string, string> | null = null;
let cacheTime = 0;
let isFallbackCache = false;

const CACHE_TTL_MS = 60_000;
const FALLBACK_CACHE_TTL_MS = 10_000;

let pathFixAttempted = false;
let pathFixSucceeded = false;

function normalizeEnv(env: NodeJS.ProcessEnv | Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

function buildWindowsPath(): string {
  const paths: string[] = [];
  const pathSeparator = ";";

  if (process.env.PATH) {
    paths.push(...process.env.PATH.split(pathSeparator).filter(Boolean));
  }

  const commonPaths = [
    path.join(os.homedir(), ".local", "bin"),
    "C:\\Program Files\\Git\\cmd",
    "C:\\Program Files\\Git\\bin",
    path.join(process.env.SystemRoot || "C:\\Windows", "System32"),
    path.join(process.env.SystemRoot || "C:\\Windows"),
  ];

  for (const commonPath of commonPaths) {
    const normalizedPath = path.normalize(commonPath);
    const normalizedLower = normalizedPath.toLowerCase();
    const alreadyExists = paths.some(
      (p) => path.normalize(p).toLowerCase() === normalizedLower,
    );
    if (!alreadyExists) {
      paths.push(normalizedPath);
    }
  }

  return paths.join(pathSeparator);
}

export async function runCommand(
  cmd: string,
  args: string[],
  options?: { cwd?: string; env?: Record<string, string> },
): Promise<CommandResult> {
  const proc = Bun.spawn([cmd, ...args], {
    cwd: options?.cwd,
    env: options?.env,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdoutPromise = proc.stdout ? new Response(proc.stdout).text() : Promise.resolve("");
  const stderrPromise = proc.stderr ? new Response(proc.stderr).text() : Promise.resolve("");
  const [stdout, stderr, code] = await Promise.all([stdoutPromise, stderrPromise, proc.exited]);

  return {
    code: code ?? 0,
    stdout,
    stderr,
  };
}

export async function getShellEnvironment(): Promise<Record<string, string>> {
  const now = Date.now();
  const ttl = isFallbackCache ? FALLBACK_CACHE_TTL_MS : CACHE_TTL_MS;
  if (cachedEnv && now - cacheTime < ttl) {
    return { ...cachedEnv };
  }

  if (process.platform === "win32") {
    const env = {
      ...process.env,
      PATH: buildWindowsPath(),
      HOME: os.homedir(),
      USER: os.userInfo().username,
      USERPROFILE: os.homedir(),
    };

    const stringEnv = normalizeEnv(env);
    cachedEnv = stringEnv;
    cacheTime = now;
    isFallbackCache = false;
    return { ...stringEnv };
  }

  const shell = process.env.SHELL || (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash");

  try {
    const { stdout } = await runCommand(shell, ["-lc", "env"], {
      env: normalizeEnv({ ...process.env, HOME: os.homedir() }),
    });

    const env: Record<string, string> = {};
    for (const line of stdout.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0) {
        const key = line.substring(0, idx);
        const value = line.substring(idx + 1);
        env[key] = value;
      }
    }

    cachedEnv = env;
    cacheTime = now;
    isFallbackCache = false;
    return { ...env };
  } catch (error) {
    const fallback = normalizeEnv(process.env);
    cachedEnv = fallback;
    cacheTime = now;
    isFallbackCache = true;
    console.warn(`[shell-env] Failed to derive shell environment: ${error}`);
    return { ...fallback };
  }
}

export async function checkGitLfsAvailable(env: Record<string, string>): Promise<boolean> {
  try {
    const result = await runCommand("git", ["lfs", "version"], { env });
    return result.code === 0;
  } catch {
    return false;
  }
}

export async function execWithShellEnv(
  cmd: string,
  args: string[],
  options?: { cwd?: string; env?: Record<string, string> },
): Promise<CommandResult> {
  try {
    return await runCommand(cmd, args, {
      cwd: options?.cwd,
      env: options?.env,
    });
  } catch (error: any) {
    const isDarwin = process.platform === "darwin";
    const isEnoent = error && typeof error === "object" && "code" in error && error.code === "ENOENT";

    if (!isDarwin || pathFixSucceeded || pathFixAttempted || !isEnoent) {
      throw error;
    }

    pathFixAttempted = true;

    try {
      const shellEnv = await getShellEnvironment();
      if (shellEnv.PATH) {
        process.env.PATH = shellEnv.PATH;
        pathFixSucceeded = true;
      }

      const retryEnv = shellEnv.PATH
        ? { ...shellEnv, ...options?.env, PATH: shellEnv.PATH }
        : { ...shellEnv, ...options?.env };

      return await runCommand(cmd, args, {
        cwd: options?.cwd,
        env: retryEnv,
      });
    } catch (retryError) {
      pathFixAttempted = false;
      throw retryError;
    }
  }
}
