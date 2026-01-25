import { Elysia, t } from "elysia";
import { BrowserWindow, electrobunPlugin, startServer } from "electrobun/bun";

// Create Elysia app with Electrobun plugin
const app = new Elysia()
  .use(electrobunPlugin())
  // Example: GET users
  .get("/api/users", () => [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
    { id: 3, name: "Charlie", email: "charlie@example.com" },
  ])
  // Example: GET single user
  .get(
    "/api/users/:id",
    ({ params }) => ({
      id: parseInt(params.id),
      name: `User ${params.id}`,
      email: `user${params.id}@example.com`,
    }),
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // Example: POST create user
  .post(
    "/api/users",
    ({ body }) => ({
      id: Math.floor(Math.random() * 1000),
      ...body,
      createdAt: new Date().toISOString(),
    }),
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  // Example: GET system info
  .get("/api/system", () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    bunVersion: Bun.version,
    uptime: process.uptime(),
  }));

// Start on an available port
const port = startServer(app);

// Export type for Eden Treaty client
export type App = typeof app;

// Create main window
const mainWindow = new BrowserWindow({
  title: "Elysia + Solid Minimal",
  url: "views://mainview/index.html",
  frame: {
    width: 800,
    height: 600,
    x: 100,
    y: 100,
  },
  titleBarStyle: "hiddenInset",
});

mainWindow.on("close", () => {
  process.exit(0);
});

console.log(`Elysia server running on port ${port}`);
console.log("Elysia + Solid minimal example started!");
