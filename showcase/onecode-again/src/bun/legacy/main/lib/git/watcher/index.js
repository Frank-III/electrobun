"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupGitWatchers = exports.registerGitWatcherIPC = exports.gitWatcherRegistry = exports.GitWatcher = void 0;
var git_watcher_1 = require("./git-watcher");
Object.defineProperty(exports, "GitWatcher", { enumerable: true, get: function () { return git_watcher_1.GitWatcher; } });
Object.defineProperty(exports, "gitWatcherRegistry", { enumerable: true, get: function () { return git_watcher_1.gitWatcherRegistry; } });
var ipc_bridge_1 = require("./ipc-bridge");
Object.defineProperty(exports, "registerGitWatcherIPC", { enumerable: true, get: function () { return ipc_bridge_1.registerGitWatcherIPC; } });
Object.defineProperty(exports, "cleanupGitWatchers", { enumerable: true, get: function () { return ipc_bridge_1.cleanupGitWatchers; } });
