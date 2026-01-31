import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface ClaudeCredentials {
  claudeAiOauth?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    scopes?: string[];
  };
}

export interface ClaudeOAuthCredential {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
}

/**
 * Read Claude OAuth credentials from macOS Keychain
 */
function readFromMacOSKeychain(): ClaudeOAuthCredential | null {
  try {
    const result = execSync(
      'security find-generic-password -s "Claude Code-credentials" -w',
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    if (result) {
      const credentials: ClaudeCredentials = JSON.parse(result);
      if (credentials.claudeAiOauth) {
        return {
          accessToken: credentials.claudeAiOauth.accessToken,
          refreshToken: credentials.claudeAiOauth.refreshToken,
          expiresAt: credentials.claudeAiOauth.expiresAt,
          scopes: credentials.claudeAiOauth.scopes,
        };
      }
    }
  } catch {
    // Keychain entry not found or parse error
  }
  return null;
}

/**
 * Read Claude OAuth credentials from credentials file
 */
function readFromCredentialsFile(): ClaudeOAuthCredential | null {
  const credentialsPath = join(homedir(), '.claude', '.credentials.json');

  try {
    if (existsSync(credentialsPath)) {
      const content = readFileSync(credentialsPath, 'utf-8');
      const credentials: ClaudeCredentials = JSON.parse(content);
      if (credentials.claudeAiOauth) {
        return {
          accessToken: credentials.claudeAiOauth.accessToken,
          refreshToken: credentials.claudeAiOauth.refreshToken,
          expiresAt: credentials.claudeAiOauth.expiresAt,
          scopes: credentials.claudeAiOauth.scopes,
        };
      }
    }
  } catch {
    // File not found or parse error
  }
  return null;
}

/**
 * Get existing Claude OAuth credentials from keychain or credentials file
 */
export function getExistingClaudeCredentials(): ClaudeOAuthCredential | null {
  // Try keychain first (macOS)
  if (process.platform === 'darwin') {
    const keychainCreds = readFromMacOSKeychain();
    if (keychainCreds) {
      return keychainCreds;
    }
  }

  // Fall back to credentials file
  return readFromCredentialsFile();
}

/**
 * Get existing Claude OAuth token from keychain or credentials file
 */
export function getExistingClaudeToken(): string | null {
  const creds = getExistingClaudeCredentials();
  return creds?.accessToken || null;
}

/**
 * Check if Claude CLI environment is configured (API key or base URL)
 */
export function getClaudeShellEnvironment(): {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
} {
  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
  };
}
