import { Utils, Updater } from "electrobun/bun";
import { getDatabase, projects, chats, subChats } from "./db";
import { clearNetworkCache, setOfflineSimulated } from "./network";

let simulateOfflineMode = false;

export function createDebugHandlers() {
  return {
    debugGetSystemInfo: async () => {
      let version = "unknown";
      try {
        version = await Updater.localInfo.version();
      } catch {
        // ignore
      }

      const isDev = process.env.NODE_ENV !== "production";
      let userDataPath = "";
      try {
        userDataPath = await Updater.appDataFolder();
      } catch {
        userDataPath = "";
      }

      return {
        version,
        platform: process.platform,
        arch: process.arch,
        isDev,
        userDataPath,
        protocolRegistered: false,
      };
    },

    debugGetDbStats: async () => {
      const db = await getDatabase();
      const projectCount = db.select().from(projects).all().length;
      const chatCount = db.select().from(chats).all().length;
      const subChatCount = db.select().from(subChats).all().length;

      return {
        projects: projectCount,
        chats: chatCount,
        subChats: subChatCount,
      };
    },

    debugClearChats: async () => {
      const db = await getDatabase();
      db.delete(subChats).run();
      db.delete(chats).run();
      return { success: true };
    },

    debugClearAllData: async () => {
      const db = await getDatabase();
      db.delete(subChats).run();
      db.delete(chats).run();
      db.delete(projects).run();
      return { success: true };
    },

    debugOpenUserDataFolder: async () => {
      try {
        const userDataPath = await Updater.appDataFolder();
        Utils.openPath(userDataPath);
      } catch {
        // ignore
      }
      return { success: true };
    },

    debugGetOfflineSimulation: () => {
      return { enabled: simulateOfflineMode };
    },

    debugSetOfflineSimulation: ({ enabled }: { enabled: boolean }) => {
      simulateOfflineMode = enabled;
      setOfflineSimulated(enabled);
      clearNetworkCache();
      return { success: true, enabled: simulateOfflineMode };
    },
  };
}
