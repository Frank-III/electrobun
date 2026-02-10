import {
  ApplicationMenu,
  BrowserView,
  BrowserWindow,
  Utils,
  type RPCSchema,
} from "electrobun/bun";
import { spawn, type Subprocess } from "bun";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

// Types for RPC communication
export type OpenCodeRPC = {
  bun: RPCSchema<{
    requests: {
      ensureServerReady: {
        params: {};
        response: { ok: true; url: string; password: string | null } | { ok: false; error: string };
      };
      killSidecar: {
        params: {};
        response: { ok: true } | { ok: false; error: string };
      };
      getDefaultServerUrl: {
        params: {};
        response: { ok: true; url: string | null } | { ok: false; error: string };
      };
      setDefaultServerUrl: {
        params: { url: string | null };
        response: { ok: true } | { ok: false; error: string };
      };
      installCli: {
        params: {};
        response: { ok: true; path: string } | { ok: false; error: string };
      };
      openDirectoryPickerDialog: {
        params: { title?: string; multiple?: boolean };
        response: { ok: true; path: string | string[] | null } | { ok: false; error: string };
      };
      openFilePickerDialog: {
        params: { title?: string; multiple?: boolean };
        response: { ok: true; path: string | string[] | null } | { ok: false; error: string };
      };
      saveFilePickerDialog: {
        params: { title?: string; defaultPath?: string };
        response: { ok: true; path: string | null } | { ok: false; error: string };
      };
      parseMarkdown: {
        params: { markdown: string };
        response: { ok: true; html: string } | { ok: false; error: string };
      };
      openLink: {
        params: { url: string };
        response: { ok: true } | { ok: false; error: string };
      };
      restart: {
        params: {};
        response: { ok: true } | { ok: false; error: string };
      };
    };
    messages: {
      log: { level: "info" | "error"; message: string };
    };
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {
      serverReady: { url: string; password: string | null };
    };
  }>;
};

// Server state management
let serverProcess: Subprocess | null = null;
let serverUrl: string | null = null;
let serverPassword: string | null = null;
let serverReady = false;
const WEBVIEW_INFO_LOGS = Bun.env.OPENCODE_WEBVIEW_DEBUG === "1";

// Settings storage
const HOME_DIR = Bun.env.HOME || os.homedir();

const SETTINGS_FILE = path.join(
  HOME_DIR,
  ".opencode",
  "electrobun-settings.json"
);

function getAppSupportDir(): string {
  if (process.platform === "darwin") {
    return path.join(HOME_DIR, "Library", "Application Support");
  }
  if (process.platform === "win32") {
    return process.env.LOCALAPPDATA || path.join(HOME_DIR, "AppData", "Local");
  }
  return process.env.XDG_DATA_HOME || path.join(HOME_DIR, ".local", "share");
}

async function resolveSelfExtractionDirs(): Promise<string[]> {
  const root = getAppSupportDir();
  const dirs = new Set<string>();
  const isPackagedMacRuntime =
    process.platform === "darwin" && process.cwd().includes(".app/Contents/MacOS");

  // Best-effort: read app metadata from the packaged version file.
  try {
    const version = await Bun.file("../Resources/version.json").json() as {
      identifier?: string;
      name?: string;
      channel?: string;
    };
    if (version.identifier && version.name) {
      dirs.add(path.join(root, version.identifier, version.name, "self-extraction"));
    }
    if (version.identifier && version.channel) {
      dirs.add(path.join(root, version.identifier, version.channel, "self-extraction"));
    }
  } catch {
    // Ignore: this file does not exist in some development modes.
  }

  // Fallback for packaged macOS runtime when version metadata is unavailable.
  if (isPackagedMacRuntime) {
    dirs.add(path.join(root, "ai.opencode.electrobun", "oc-electrobun", "self-extraction"));
  }

  return [...dirs];
}

async function cleanupSelfExtractionArtifacts() {
  // Updater is currently disabled in the webview layer, so these artifacts are stale bloat.
  const dirs = await resolveSelfExtractionDirs();

  for (const extractionDir of dirs) {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(extractionDir);
    } catch {
      continue;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const isExtractionArtifact =
          entry === "backup.app" ||
          entry.startsWith("temp-") ||
          entry.startsWith("from-") ||
          entry.endsWith(".tar") ||
          entry.endsWith(".tar.zst") ||
          entry.endsWith(".patch");
        if (!isExtractionArtifact) return;
        await fs.rm(path.join(extractionDir, entry), { recursive: true, force: true }).catch(() => {});
      }),
    );

    try {
      const remaining = await fs.readdir(extractionDir);
      if (remaining.length === 0) {
        await fs.rmdir(extractionDir);
      }
    } catch {
      // Ignore cleanup races / permission issues.
    }
  }
}

// Run the spawned `opencode serve` with an isolated XDG home so it doesn't pick up
// CLI state (open projects, config dirs, etc.) that can brick the desktop app on startup.
const OPENCODE_XDG_ROOT = path.join(HOME_DIR, ".opencode", "electrobun-xdg");
const OPENCODE_XDG_ENV = {
  XDG_DATA_HOME: path.join(OPENCODE_XDG_ROOT, "data"),
  XDG_CONFIG_HOME: path.join(OPENCODE_XDG_ROOT, "config"),
  XDG_STATE_HOME: path.join(OPENCODE_XDG_ROOT, "state"),
  XDG_CACHE_HOME: path.join(OPENCODE_XDG_ROOT, "cache"),
};

async function ensureXdgDirs() {
  const dirs = [OPENCODE_XDG_ROOT, ...Object.values(OPENCODE_XDG_ENV)];
  await Promise.all(
    dirs.map((dir) =>
      fs.mkdir(dir, { recursive: true }).catch((error) => {
        console.error(`[BUN] Failed to create XDG dir: ${dir}`, error);
      }),
    ),
  );
}

interface Settings {
  defaultServerUrl?: string | null;
}

async function loadSettings(): Promise<Settings> {
  try {
    const file = Bun.file(SETTINGS_FILE);
    if (await file.exists()) {
      return await file.json();
    }
  } catch {
    // Ignore errors
  }
  return {};
}

async function saveSettings(settings: Settings): Promise<void> {
  try {
    await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// Find an available port
async function findFreePort(): Promise<number> {
  const server = Bun.serve({
    port: 0,
    fetch() {
      return new Response();
    },
  });
  const port = server.port;
  server.stop();
  return port;
}

// Get the opencode CLI path
function getOpencodePath(): string {
  // When running from bundled app (cwd is MacOS dir, CLI is in Resources/app)
  const bundledPath = path.join(process.cwd(), "..", "Resources", "app", "opencode-cli");

  // Platform detection for development builds
  const platformMap: Record<string, string> = { darwin: "darwin", linux: "linux" };
  const archMap: Record<string, string> = { arm64: "arm64", x64: "x64" };
  const platform = platformMap[process.platform] || process.platform;
  const arch = archMap[process.arch] || process.arch;

  // Development: built CLI in packages/opencode/dist
  const devPath = path.join(
    process.cwd(), "..", "opencode", "dist",
    `opencode-${platform}-${arch}`, "bin", "opencode"
  );

  // User's installed CLI
  const homeBinPath = path.join(Bun.env.HOME || "", ".opencode", "bin", "opencode");

  for (const p of [bundledPath, devPath, homeBinPath]) {
    try {
      if (Bun.spawnSync(["test", "-f", p]).exitCode === 0) {
        console.log(`[BUN] Found opencode CLI at: ${p}`);
        return p;
      }
    } catch {
      // Continue
    }
  }

  console.log("[BUN] Falling back to 'opencode' in PATH");
  return "opencode";
}

// Check if server is healthy
async function checkServerHealth(url: string, password?: string | null): Promise<boolean> {
  try {
    const healthUrl = `${url.replace(/\/$/, "")}/global/health`;
    const headers: Record<string, string> = {};

    if (password) {
      headers["Authorization"] = `Basic ${btoa(`opencode:${password}`)}`;
    }

    const response = await fetch(healthUrl, {
      headers,
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// Spawn the opencode server
async function spawnServer(port: number): Promise<Subprocess> {
  const opencodeCmd = getOpencodePath();

  console.log(`[BUN] Spawning opencode server on port ${port}...`);
  console.log(`[BUN] Using opencode command: ${opencodeCmd}`);
  await ensureXdgDirs();

  const proc = spawn({
    // `views://mainview` is the webview origin for Electrobun's built-in URL scheme.
    // Allow it explicitly so the browser can call the local server APIs from the webview.
    cmd: [opencodeCmd, "serve", "--port", String(port), "--cors", "views://mainview", "--cors", "null"],
    env: {
      ...process.env,
      HOME: HOME_DIR,
      ...OPENCODE_XDG_ENV,
      OPENCODE_CLIENT: "desktop",
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  // Stream stdout/stderr to console
  (async () => {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
  })();

  (async () => {
    const reader = proc.stderr.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stderr.write(decoder.decode(value));
    }
  })();

  return proc;
}

// Wait for server to be ready
async function waitForServer(url: string, password: string | null, timeoutMs = 30000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await checkServerHealth(url, password)) {
      return true;
    }
    await Bun.sleep(100);
  }

  return false;
}

// Initialize the server connection
async function setupServerConnection(): Promise<{ url: string; password: string | null }> {
  // Check for custom server URL in settings
  const settings = await loadSettings();
  if (settings.defaultServerUrl) {
    console.log(`Checking custom server URL: ${settings.defaultServerUrl}`);
    if (await checkServerHealth(settings.defaultServerUrl)) {
      return { url: settings.defaultServerUrl, password: null };
    }
    console.log("Custom server not available, starting local server...");
  }

  // Start local server
  const port = await findFreePort();
  const password = null;
  const url = `http://127.0.0.1:${port}`;

  serverProcess = await spawnServer(port);

  if (await waitForServer(url, password)) {
    serverUrl = url;
    serverPassword = password;
    serverReady = true;
    console.log(`Server ready at ${url}`);
    return { url, password };
  }

  throw new Error("Failed to start opencode server within timeout");
}

// Window management
const windows = new Map<number, BrowserWindow>();

function buildWindowUrl() {
  return "views://mainview/index.html";
}

function createAppWindow(): BrowserWindow {
  const rpc = BrowserView.defineRPC<OpenCodeRPC>({
    maxRequestTime: 60_000,
    handlers: {
      requests: {
        ensureServerReady: async () => {
          console.log("[BUN] ensureServerReady called, serverReady:", serverReady, "serverUrl:", serverUrl);
          try {
            if (serverReady && serverUrl) {
              console.log("[BUN] Returning cached server:", serverUrl);
              return { ok: true, url: serverUrl, password: serverPassword };
            }

            console.log("[BUN] Setting up new server connection...");
            const { url, password } = await setupServerConnection();
            console.log("[BUN] Server connection established:", url);
            return { ok: true, url, password };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[BUN] ensureServerReady failed:", message);
            return { ok: false, error: message };
          }
        },

        killSidecar: async () => {
          try {
            if (serverProcess) {
              serverProcess.kill();
              serverProcess = null;
              serverReady = false;
            }
            return { ok: true };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        getDefaultServerUrl: async () => {
          try {
            const settings = await loadSettings();
            return { ok: true, url: settings.defaultServerUrl ?? null };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        setDefaultServerUrl: async ({ url }) => {
          try {
            const settings = await loadSettings();
            settings.defaultServerUrl = url;
            await saveSettings(settings);
            return { ok: true };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        installCli: async () => {
          // For Electrobun, we bundle the CLI - this is a no-op
          return { ok: true, path: getOpencodePath() };
        },

        openDirectoryPickerDialog: async ({ title, multiple }) => {
          try {
            const result = await Utils.openFileDialog({
              title: title ?? "Choose a folder",
              startingFolder: Bun.env.HOME || "/",
              canChooseFiles: false,
              canChooseDirectory: true,
              allowsMultipleSelection: multiple ?? false,
            });

            if (!result || result.length === 0 || (result.length === 1 && result[0] === "")) {
              return { ok: true, path: null };
            }

            return { ok: true, path: multiple ? result : result[0] };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        openFilePickerDialog: async ({ title, multiple }) => {
          try {
            const result = await Utils.openFileDialog({
              title: title ?? "Choose a file",
              startingFolder: Bun.env.HOME || "/",
              canChooseFiles: true,
              canChooseDirectory: false,
              allowsMultipleSelection: multiple ?? false,
            });

            if (!result || result.length === 0 || (result.length === 1 && result[0] === "")) {
              return { ok: true, path: null };
            }

            return { ok: true, path: multiple ? result : result[0] };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        saveFilePickerDialog: async ({ title, defaultPath }) => {
          try {
            const result = await Utils.saveFileDialog({
              title: title ?? "Save file",
              startingFolder: defaultPath ? path.dirname(defaultPath) : Bun.env.HOME || "/",
              defaultFilename: defaultPath ? path.basename(defaultPath) : undefined,
            });

            if (!result || result === "") {
              return { ok: true, path: null };
            }

            return { ok: true, path: result };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        parseMarkdown: async ({ markdown }) => {
          try {
            const html = Bun.markdown.html(markdown, { headingIds: true });
            return { ok: true, html };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        openLink: async ({ url }) => {
          try {
            // Use macOS open command
            Bun.spawn(["open", url]);
            return { ok: true };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },

        restart: async () => {
          try {
            if (serverProcess) {
              serverProcess.kill();
              serverProcess = null;
              serverReady = false;
            }
            // Restart the app
            process.exit(0);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message };
          }
        },
      },
      messages: {
        log: (data) => {
          if (data.level === "info" && !WEBVIEW_INFO_LOGS) return;
          const out = data.level === "error" ? console.error : console.log;
          out(`[WEBVIEW] ${data.message}`);
        },
        "*": (messageName: string, payload: unknown) => {
          if (messageName === "log") return;
          console.log(`[webview message] ${messageName}`, payload);
        },
      },
    },
  });

  const window = new BrowserWindow({
    title: "OpenCode",
    url: buildWindowUrl(),
    frame: {
      width: 1280,
      height: 900,
    },
    titleBarStyle: "hiddenInset",
    rpc,
  });

  windows.set(window.id, window);

  window.on("close", () => {
    windows.delete(window.id);
    if (windows.size === 0) {
      // Clean up server on exit
      if (serverProcess) {
        serverProcess.kill();
      }
      process.exit(0);
    }
  });

  return window;
}

// Set up the application menu
ApplicationMenu.setApplicationMenu([
  {
    submenu: [
      { label: "About OpenCode", role: "about" },
      { type: "separator" },
      { label: "Preferences...", accelerator: ",", action: "preferences" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { label: "Quit OpenCode", role: "quit", accelerator: "q" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ],
  },
]);

// Create the main window
void cleanupSelfExtractionArtifacts().catch((error) => {
  console.warn("[BUN] Failed to clean self-extraction artifacts:", error);
});

createAppWindow();

console.log("OpenCode (Electrobun) started!");
