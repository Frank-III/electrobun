import { createSignal, createResource, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { treaty } from "@elysiajs/eden";
import type { App } from "../bun";

// Get the RPC port from Electrobun globals
declare global {
  interface Window {
    __electrobunRpcSocketPort: number;
  }
}

// Create Eden Treaty client with full type safety
const port = window.__electrobunRpcSocketPort;
const api = treaty<App>(`localhost:${port}`);

// Types inferred from Elysia routes!
type User = Awaited<ReturnType<typeof api.api.users.get>>["data"][number];
type SystemInfo = Awaited<ReturnType<typeof api.api.system.get>>["data"];

function App() {
  // Fetch users with createResource
  const [users, { refetch: refetchUsers }] = createResource(async () => {
    const { data, error } = await api.api.users.get();
    if (error) throw error;
    return data;
  });

  // Fetch system info
  const [systemInfo] = createResource(async () => {
    const { data, error } = await api.api.system.get();
    if (error) throw error;
    return data;
  });

  // Form state for creating new user
  const [newName, setNewName] = createSignal("");
  const [newEmail, setNewEmail] = createSignal("");
  const [creating, setCreating] = createSignal(false);

  const createUser = async (e: Event) => {
    e.preventDefault();
    if (!newName() || !newEmail()) return;

    setCreating(true);
    try {
      const { data, error } = await api.api.users.post({
        name: newName(),
        email: newEmail(),
      });

      if (error) {
        console.error("Failed to create user:", error);
        return;
      }

      console.log("Created user:", data);
      setNewName("");
      setNewEmail("");
      refetchUsers();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div class="container">
      <header class="header">
        <h1>Elysia + Solid + Eden</h1>
        <p>Type-safe API calls with Electrobun</p>
      </header>

      <section class="section">
        <h2>System Info</h2>
        <Show when={systemInfo()} fallback={<p>Loading...</p>}>
          {(info) => (
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Platform:</span>
                <span class="value">{info().platform}</span>
              </div>
              <div class="info-item">
                <span class="label">Arch:</span>
                <span class="value">{info().arch}</span>
              </div>
              <div class="info-item">
                <span class="label">Bun:</span>
                <span class="value">{info().bunVersion}</span>
              </div>
              <div class="info-item">
                <span class="label">Uptime:</span>
                <span class="value">{Math.round(info().uptime)}s</span>
              </div>
            </div>
          )}
        </Show>
      </section>

      <section class="section">
        <h2>Users</h2>
        <Show
          when={!users.loading}
          fallback={<p>Loading users...</p>}
        >
          <Show when={users()} fallback={<p>No users found</p>}>
            {(userList) => (
              <ul class="user-list">
                <For each={userList()}>
                  {(user) => (
                    <li class="user-item">
                      <strong>{user.name}</strong>
                      <span class="email">{user.email}</span>
                    </li>
                  )}
                </For>
              </ul>
            )}
          </Show>
        </Show>

        <form class="create-form" onSubmit={createUser}>
          <h3>Create New User</h3>
          <input
            type="text"
            placeholder="Name"
            value={newName()}
            onInput={(e) => setNewName(e.currentTarget.value)}
            disabled={creating()}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail()}
            onInput={(e) => setNewEmail(e.currentTarget.value)}
            disabled={creating()}
          />
          <button type="submit" disabled={creating() || !newName() || !newEmail()}>
            {creating() ? "Creating..." : "Create User"}
          </button>
        </form>
      </section>

      <footer class="footer">
        <p>
          Port: <code>{port}</code> | Eden Treaty provides full type inference
        </p>
      </footer>
    </div>
  );
}

render(() => <App />, document.getElementById("app")!);
