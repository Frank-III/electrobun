import { Utils } from "electrobun/bun";
import { eq } from "drizzle-orm";
import { getClaudeShellEnvironment } from "./claude-env";
import { getApiUrl } from "./config";
import {
  anthropicAccounts,
  anthropicSettings,
  claudeCodeCredentials,
  getDatabase,
} from "./db";
import { createId } from "./db/utils";
import { getExistingClaudeToken } from "./legacy/main/lib/claude-token";

function encryptToken(token: string): string {
  return Buffer.from(token).toString("base64");
}

function decryptToken(encrypted: string): string {
  return Buffer.from(encrypted, "base64").toString("utf-8");
}

function getDesktopToken(): string | null {
  return (
    process.env.DESKTOP_TOKEN ||
    process.env.TWENTYFIRST_DESKTOP_TOKEN ||
    process.env.X_DESKTOP_TOKEN ||
    null
  );
}

function storeOAuthToken(db: Awaited<ReturnType<typeof getDatabase>>, oauthToken: string, setAsActive = true): string {
  const encryptedToken = encryptToken(oauthToken);
  const newId = createId();

  db.insert(anthropicAccounts)
    .values({
      id: newId,
      oauthToken: encryptedToken,
      displayName: "Anthropic Account",
      connectedAt: new Date(),
      desktopUserId: null,
    })
    .run();

  if (setAsActive) {
    db.insert(anthropicSettings)
      .values({
        id: "singleton",
        activeAccountId: newId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: anthropicSettings.id,
        set: {
          activeAccountId: newId,
          updatedAt: new Date(),
        },
      })
      .run();
  }

  db.delete(claudeCodeCredentials).where(eq(claudeCodeCredentials.id, "default")).run();
  db.insert(claudeCodeCredentials)
    .values({
      id: "default",
      oauthToken: encryptedToken,
      connectedAt: new Date(),
      userId: null,
    })
    .run();

  return newId;
}

export function createClaudeCodeHandlers() {
  return {
    claudeCodeHasExistingCliConfig: async () => {
      const shellEnv = await getClaudeShellEnvironment();
      const hasConfig = !!(shellEnv.ANTHROPIC_API_KEY || shellEnv.ANTHROPIC_BASE_URL);
      return {
        hasConfig,
        hasApiKey: !!shellEnv.ANTHROPIC_API_KEY,
        baseUrl: shellEnv.ANTHROPIC_BASE_URL || null,
      };
    },

    claudeCodeGetIntegration: async () => {
      const db = await getDatabase();
      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      if (settings?.activeAccountId) {
        const account = db
          .select()
          .from(anthropicAccounts)
          .where(eq(anthropicAccounts.id, settings.activeAccountId))
          .get();

        if (account) {
          return {
            isConnected: true,
            connectedAt: account.connectedAt?.toISOString?.() ?? account.connectedAt ?? null,
            accountId: account.id,
            displayName: account.displayName,
          };
        }
      }

      const cred = db
        .select()
        .from(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .get();

      return {
        isConnected: !!cred?.oauthToken,
        connectedAt: cred?.connectedAt?.toISOString?.() ?? cred?.connectedAt ?? null,
        accountId: null,
        displayName: null,
      };
    },

    claudeCodeStartAuth: async () => {
      const token = getDesktopToken();
      if (!token) {
        throw new Error("Missing desktop token. Set DESKTOP_TOKEN to start auth.");
      }

      const response = await fetch(`${getApiUrl()}/api/auth/claude-code/start`, {
        method: "POST",
        headers: { "x-desktop-token": token },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `Start auth failed: ${response.status}`);
      }

      return (await response.json()) as {
        sandboxId: string;
        sandboxUrl: string;
        sessionId: string;
      };
    },

    claudeCodePollStatus: async ({
      sandboxUrl,
      sessionId,
    }: {
      sandboxUrl: string;
      sessionId: string;
    }) => {
      try {
        const response = await fetch(`${sandboxUrl}/api/auth/${sessionId}/status`);
        if (!response.ok) {
          return { state: "error" as const, oauthUrl: null, error: "Failed to poll status" };
        }

        const data = await response.json();
        return {
          state: data.state as string,
          oauthUrl: data.oauthUrl ?? null,
          error: data.error ?? null,
        };
      } catch (error) {
        console.error("[ClaudeCode] Poll status error:", error);
        return { state: "error" as const, oauthUrl: null, error: "Connection failed" };
      }
    },

    claudeCodeSubmitCode: async ({
      sandboxUrl,
      sessionId,
      code,
    }: {
      sandboxUrl: string;
      sessionId: string;
      code: string;
    }) => {
      const codeRes = await fetch(`${sandboxUrl}/api/auth/${sessionId}/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!codeRes.ok) {
        throw new Error(`Code submission failed: ${codeRes.statusText}`);
      }

      let oauthToken: string | null = null;
      for (let i = 0; i < 10; i += 1) {
        await new Promise((r) => setTimeout(r, 1000));
        const statusRes = await fetch(`${sandboxUrl}/api/auth/${sessionId}/status`);
        if (!statusRes.ok) continue;
        const status = await statusRes.json();
        if (status.state === "success" && status.oauthToken) {
          oauthToken = status.oauthToken;
          break;
        }
        if (status.state === "error") {
          throw new Error(status.error || "Authentication failed");
        }
      }

      if (!oauthToken) {
        throw new Error("Timeout waiting for OAuth token");
      }

      const db = await getDatabase();
      storeOAuthToken(db, oauthToken);
      return { success: true };
    },

    claudeCodeGetSystemToken: async () => {
      const token = getExistingClaudeToken()?.trim() ?? null;
      return { token };
    },

    claudeCodeImportSystemToken: async () => {
      const token = getExistingClaudeToken()?.trim();
      if (!token) {
        throw new Error("No existing Claude token found");
      }

      const db = await getDatabase();
      storeOAuthToken(db, token);
      return { success: true };
    },

    claudeCodeGetToken: async () => {
      const db = await getDatabase();

      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      if (settings?.activeAccountId) {
        const account = db
          .select()
          .from(anthropicAccounts)
          .where(eq(anthropicAccounts.id, settings.activeAccountId))
          .get();

        if (account) {
          try {
            const token = decryptToken(account.oauthToken);
            return { token, error: null };
          } catch (error) {
            console.error("[ClaudeCode] Decrypt error:", error);
            return { token: null, error: "Failed to decrypt token" };
          }
        }
      }

      const cred = db
        .select()
        .from(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .get();

      if (!cred?.oauthToken) {
        return { token: null, error: "Not connected" };
      }

      try {
        const token = decryptToken(cred.oauthToken);
        return { token, error: null };
      } catch (error) {
        console.error("[ClaudeCode] Decrypt error:", error);
        return { token: null, error: "Failed to decrypt token" };
      }
    },

    claudeCodeDisconnect: async () => {
      const db = await getDatabase();

      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      if (settings?.activeAccountId) {
        db.delete(anthropicAccounts)
          .where(eq(anthropicAccounts.id, settings.activeAccountId))
          .run();

        const firstRemaining = db.select().from(anthropicAccounts).limit(1).get();
        if (firstRemaining) {
          db.update(anthropicSettings)
            .set({
              activeAccountId: firstRemaining.id,
              updatedAt: new Date(),
            })
            .where(eq(anthropicSettings.id, "singleton"))
            .run();
        } else {
          db.update(anthropicSettings)
            .set({
              activeAccountId: null,
              updatedAt: new Date(),
            })
            .where(eq(anthropicSettings.id, "singleton"))
            .run();
        }
      }

      db.delete(claudeCodeCredentials).where(eq(claudeCodeCredentials.id, "default")).run();
      return { success: true };
    },

    claudeCodeOpenOAuthUrl: async ({ url }: { url: string }) => {
      Utils.openExternal(url);
      return { success: true };
    },
  };
}
