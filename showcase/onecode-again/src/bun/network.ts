export type NetworkStatus = {
  online: boolean;
  lastCheck: number;
};

let simulateOfflineMode = false;
let cachedStatus: NetworkStatus = {
  online: true,
  lastCheck: 0,
};

const CACHE_TTL = 10000;

export function isOfflineSimulated(): boolean {
  return simulateOfflineMode;
}

export function setOfflineSimulated(enabled: boolean): void {
  simulateOfflineMode = enabled;
}

export async function checkInternetConnection(): Promise<boolean> {
  if (simulateOfflineMode) {
    cachedStatus = { online: false, lastCheck: Date.now() };
    return false;
  }

  const now = Date.now();
  if (now - cachedStatus.lastCheck < CACHE_TTL) {
    return cachedStatus.online;
  }

  const endpoints = [
    "https://api.anthropic.com",
    "https://www.google.com",
    "https://1.1.1.1",
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(endpoint, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status >= 400) {
        cachedStatus = { online: true, lastCheck: now };
        return true;
      }
    } catch {
      continue;
    }
  }

  cachedStatus = { online: false, lastCheck: now };
  return false;
}

export function clearNetworkCache(): void {
  cachedStatus = { online: true, lastCheck: 0 };
}
