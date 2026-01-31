import { Utils } from "electrobun/bun";
import { eq } from "drizzle-orm";
import { getExistingClaudeToken, getClaudeShellEnvironment } from "./claude-token";
import { getDatabase } from "./db";
import { claudeCodeCredentials, anthropicAccounts, anthropicSettings } from "./db/schema";

// Simple base64 encoding for token storage (Electrobun doesn't have safeStorage)
// In production, consider using system keychain via native bindings
function encodeToken(token: string): string {
  return Buffer.from(token).toString("base64");
}

function decodeToken(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

function generateId(): string {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Store OAuth token in database
 */
function storeOAuthToken(oauthToken: string, setAsActive = true): string {
  const encodedToken = encodeToken(oauthToken);
  const db = getDatabase();
  const newId = generateId();

  // Store in multi-account table
  db.insert(anthropicAccounts)
    .values({
      id: newId,
      oauthToken: encodedToken,
      displayName: "Anthropic Account",
      connectedAt: new Date(),
    })
    .run();

  if (setAsActive) {
    // Set as active account
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

  // Also update legacy table for backward compatibility
  db.delete(claudeCodeCredentials)
    .where(eq(claudeCodeCredentials.id, "default"))
    .run();

  db.insert(claudeCodeCredentials)
    .values({
      id: "default",
      oauthToken: encodedToken,
      connectedAt: new Date(),
    })
    .run();

  return newId;
}

export function createClaudeCodeHandlers() {
  return {
    /**
     * Check if user has existing CLI config (API key or proxy)
     */
    claudeCodeHasExistingCliConfig: async () => {
      const shellEnv = getClaudeShellEnvironment();
      const hasConfig = !!(shellEnv.ANTHROPIC_API_KEY || shellEnv.ANTHROPIC_BASE_URL);
      return {
        hasConfig,
        hasApiKey: !!shellEnv.ANTHROPIC_API_KEY,
        baseUrl: shellEnv.ANTHROPIC_BASE_URL || null,
      };
    },

    /**
     * Check if user has Claude Code connected
     */
    claudeCodeGetIntegration: async () => {
      const db = getDatabase();

      // First try multi-account system
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
            connectedAt: account.connectedAt?.toISOString() ?? null,
            accountId: account.id,
            displayName: account.displayName,
          };
        }
      }

      // Fallback to legacy table
      const cred = db
        .select()
        .from(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .get();

      return {
        isConnected: !!cred?.oauthToken,
        connectedAt: cred?.connectedAt?.toISOString() ?? null,
        accountId: null,
        displayName: null,
      };
    },

    /**
     * Start OAuth flow - calls server to create sandbox
     * NOTE: This requires a backend server for sandbox creation
     * For now, return an error indicating manual setup is needed
     */
    claudeCodeStartAuth: async () => {
      // Check for existing system token first
      const existingToken = getExistingClaudeToken();
      if (existingToken) {
        return {
          sandboxId: "local",
          sandboxUrl: "local://",
          sessionId: "use-existing",
          hasExistingToken: true,
        };
      }

      throw new Error(
        "OAuth sandbox flow not yet implemented for Electrobun. " +
        "Please use ANTHROPIC_API_KEY environment variable or " +
        "run 'claude login' in terminal first."
      );
    },

    /**
     * Poll for OAuth URL
     */
    claudeCodePollStatus: async (input: { sandboxUrl: string; sessionId: string }) => {
      if (input.sessionId === "use-existing") {
        const token = getExistingClaudeToken();
        if (token) {
          return {
            state: "has_token" as const,
            oauthUrl: null,
            error: null,
          };
        }
      }

      return {
        state: "error" as const,
        oauthUrl: null,
        error: "OAuth flow not implemented",
      };
    },

    /**
     * Submit OAuth code
     */
    claudeCodeSubmitCode: async (_input: { sandboxUrl: string; sessionId: string; code: string }) => {
      throw new Error("OAuth code submission not implemented for Electrobun");
    },

    /**
     * Check for existing Claude token in system credentials
     */
    claudeCodeGetSystemToken: async () => {
      const token = getExistingClaudeToken()?.trim() ?? null;
      return { token };
    },

    /**
     * Import Claude token from system credentials
     */
    claudeCodeImportSystemToken: async () => {
      const token = getExistingClaudeToken()?.trim();
      if (!token) {
        throw new Error("No existing Claude token found. Run 'claude login' in terminal first.");
      }

      storeOAuthToken(token);
      console.log("[ClaudeCode] Token imported from system");
      return { success: true };
    },

    /**
     * Get decrypted OAuth token
     */
    claudeCodeGetToken: async () => {
      const db = getDatabase();

      // First try multi-account system
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
            const token = decodeToken(account.oauthToken);
            return { token, error: null };
          } catch (error) {
            console.error("[ClaudeCode] Decode error:", error);
            return { token: null, error: "Failed to decode token" };
          }
        }
      }

      // Fallback to legacy table
      const cred = db
        .select()
        .from(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .get();

      if (!cred?.oauthToken) {
        return { token: null, error: "Not connected" };
      }

      try {
        const token = decodeToken(cred.oauthToken);
        return { token, error: null };
      } catch (error) {
        console.error("[ClaudeCode] Decode error:", error);
        return { token: null, error: "Failed to decode token" };
      }
    },

    /**
     * Disconnect - delete credentials
     */
    claudeCodeDisconnect: async () => {
      const db = getDatabase();

      // Get active account
      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      if (settings?.activeAccountId) {
        // Remove active account
        db.delete(anthropicAccounts)
          .where(eq(anthropicAccounts.id, settings.activeAccountId))
          .run();

        // Try to set another account as active
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

      // Also clear legacy table
      db.delete(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .run();

      console.log("[ClaudeCode] Disconnected");
      return { success: true };
    },

    /**
     * Open OAuth URL in browser
     */
    claudeCodeOpenOAuthUrl: async (input: { url: string }) => {
      Utils.openExternal(input.url);
      return { success: true };
    },
  };
}
