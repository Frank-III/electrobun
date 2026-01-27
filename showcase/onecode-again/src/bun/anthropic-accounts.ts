import { eq, sql } from "drizzle-orm";
import {
  anthropicAccounts,
  anthropicSettings,
  claudeCodeCredentials,
  getDatabase,
} from "./db";
import { createId } from "./db/utils";

function encryptToken(token: string): string {
  return Buffer.from(token).toString("base64");
}

function decryptToken(encrypted: string): string {
  return Buffer.from(encrypted, "base64").toString("utf-8");
}

export function createAnthropicAccountsHandlers() {
  return {
    anthropicAccountsList: async () => {
      const db = await getDatabase();
      try {
        const accounts = db
          .select({
            id: anthropicAccounts.id,
            email: anthropicAccounts.email,
            displayName: anthropicAccounts.displayName,
            connectedAt: anthropicAccounts.connectedAt,
            lastUsedAt: anthropicAccounts.lastUsedAt,
          })
          .from(anthropicAccounts)
          .orderBy(anthropicAccounts.connectedAt)
          .all();

        if (accounts.length > 0) {
          return accounts.map((acc) => ({
            ...acc,
            connectedAt: acc.connectedAt?.toISOString?.() ?? acc.connectedAt ?? null,
            lastUsedAt: acc.lastUsedAt?.toISOString?.() ?? acc.lastUsedAt ?? null,
          }));
        }
      } catch {
        // ignore
      }

      try {
        const legacyCred = db
          .select()
          .from(claudeCodeCredentials)
          .where(eq(claudeCodeCredentials.id, "default"))
          .get();

        if (legacyCred?.oauthToken) {
          return [
            {
              id: "legacy-default",
              email: null,
              displayName: "Anthropic Account",
              connectedAt: legacyCred.connectedAt?.toISOString?.() ?? legacyCred.connectedAt ?? null,
              lastUsedAt: null,
            },
          ];
        }
      } catch {
        // ignore
      }

      return [];
    },

    anthropicAccountsGetActive: async () => {
      const db = await getDatabase();

      try {
        const settings = db
          .select()
          .from(anthropicSettings)
          .where(eq(anthropicSettings.id, "singleton"))
          .get();

        if (settings?.activeAccountId) {
          const account = db
            .select({
              id: anthropicAccounts.id,
              email: anthropicAccounts.email,
              displayName: anthropicAccounts.displayName,
              connectedAt: anthropicAccounts.connectedAt,
            })
            .from(anthropicAccounts)
            .where(eq(anthropicAccounts.id, settings.activeAccountId))
            .get();

          if (account) {
            return {
              ...account,
              connectedAt: account.connectedAt?.toISOString?.() ?? account.connectedAt ?? null,
            };
          }
        }
      } catch {
        // ignore
      }

      try {
        const legacyCred = db
          .select()
          .from(claudeCodeCredentials)
          .where(eq(claudeCodeCredentials.id, "default"))
          .get();

        if (legacyCred?.oauthToken) {
          return {
            id: "legacy-default",
            email: null,
            displayName: "Anthropic Account",
            connectedAt: legacyCred.connectedAt?.toISOString?.() ?? legacyCred.connectedAt ?? null,
          };
        }
      } catch {
        // ignore
      }

      return null;
    },

    anthropicAccountsGetActiveToken: async () => {
      const db = await getDatabase();
      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      if (!settings?.activeAccountId) {
        return { token: null, error: "No active account" };
      }

      const account = db
        .select()
        .from(anthropicAccounts)
        .where(eq(anthropicAccounts.id, settings.activeAccountId))
        .get();

      if (!account) {
        return { token: null, error: "Active account not found" };
      }

      try {
        const token = decryptToken(account.oauthToken);
        return { token, error: null };
      } catch (error) {
        console.error("[AnthropicAccounts] Decrypt error:", error);
        return { token: null, error: "Failed to decrypt token" };
      }
    },

    anthropicAccountsSetActive: async ({ accountId }: { accountId: string }) => {
      const db = await getDatabase();

      const account = db
        .select()
        .from(anthropicAccounts)
        .where(eq(anthropicAccounts.id, accountId))
        .get();

      if (!account) {
        throw new Error("Account not found");
      }

      db.insert(anthropicSettings)
        .values({
          id: "singleton",
          activeAccountId: accountId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: anthropicSettings.id,
          set: {
            activeAccountId: accountId,
            updatedAt: new Date(),
          },
        })
        .run();

      db.update(anthropicAccounts)
        .set({ lastUsedAt: new Date() })
        .where(eq(anthropicAccounts.id, accountId))
        .run();

      return { success: true };
    },

    anthropicAccountsAdd: async ({
      oauthToken,
      email,
      displayName,
    }: {
      oauthToken: string;
      email?: string;
      displayName?: string;
    }) => {
      const db = await getDatabase();
      const encryptedToken = encryptToken(oauthToken);
      const newId = createId();

      db.insert(anthropicAccounts)
        .values({
          id: newId,
          email: email ?? null,
          displayName: displayName || email || "Anthropic Account",
          oauthToken: encryptedToken,
          connectedAt: new Date(),
          desktopUserId: null,
        })
        .run();

      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(anthropicAccounts)
        .get();

      if (countResult?.count === 1) {
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

      return { id: newId, success: true };
    },

    anthropicAccountsRename: async ({ accountId, displayName }: { accountId: string; displayName: string }) => {
      const db = await getDatabase();
      const result = db
        .update(anthropicAccounts)
        .set({ displayName })
        .where(eq(anthropicAccounts.id, accountId))
        .run();

      if (result.changes === 0) {
        throw new Error("Account not found");
      }

      return { success: true };
    },

    anthropicAccountsRemove: async ({ accountId }: { accountId: string }) => {
      const db = await getDatabase();
      const settings = db
        .select()
        .from(anthropicSettings)
        .where(eq(anthropicSettings.id, "singleton"))
        .get();

      db.delete(anthropicAccounts)
        .where(eq(anthropicAccounts.id, accountId))
        .run();

      if (settings?.activeAccountId === accountId) {
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

      return { success: true };
    },

    anthropicAccountsHasAccounts: async () => {
      const db = await getDatabase();
      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(anthropicAccounts)
        .get();

      return { hasAccounts: (countResult?.count ?? 0) > 0 };
    },

    anthropicAccountsMigrateLegacy: async () => {
      const db = await getDatabase();
      const existingAccounts = db
        .select({ count: sql<number>`count(*)` })
        .from(anthropicAccounts)
        .get();

      if ((existingAccounts?.count ?? 0) > 0) {
        return { migrated: false, reason: "accounts_exist" as const };
      }

      const legacyCred = db
        .select()
        .from(claudeCodeCredentials)
        .where(eq(claudeCodeCredentials.id, "default"))
        .get();

      if (!legacyCred?.oauthToken) {
        return { migrated: false, reason: "no_legacy" as const };
      }

      const newId = createId();
      db.insert(anthropicAccounts)
        .values({
          id: newId,
          oauthToken: legacyCred.oauthToken,
          displayName: "Anthropic Account",
          connectedAt: legacyCred.connectedAt,
          desktopUserId: legacyCred.userId,
        })
        .run();

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

      return { migrated: true, accountId: newId };
    },
  };
}
