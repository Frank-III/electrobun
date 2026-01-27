"use strict";
/**
 * Mention Providers
 *
 * This module exports all built-in mention providers and provides
 * utilities for registering them with the mention registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInProviders = exports.toolsProvider = exports.agentsProvider = exports.skillsProvider = exports.filesProvider = void 0;
exports.registerBuiltInProviders = registerBuiltInProviders;
exports.registerProvider = registerProvider;
var files_provider_1 = require("./files-provider");
Object.defineProperty(exports, "filesProvider", { enumerable: true, get: function () { return files_provider_1.filesProvider; } });
var skills_provider_1 = require("./skills-provider");
Object.defineProperty(exports, "skillsProvider", { enumerable: true, get: function () { return skills_provider_1.skillsProvider; } });
var agents_provider_1 = require("./agents-provider");
Object.defineProperty(exports, "agentsProvider", { enumerable: true, get: function () { return agents_provider_1.agentsProvider; } });
var tools_provider_1 = require("./tools-provider");
Object.defineProperty(exports, "toolsProvider", { enumerable: true, get: function () { return tools_provider_1.toolsProvider; } });
var files_provider_2 = require("./files-provider");
var skills_provider_2 = require("./skills-provider");
var agents_provider_2 = require("./agents-provider");
var tools_provider_2 = require("./tools-provider");
var registry_1 = require("../registry");
/**
 * All built-in providers
 */
exports.builtInProviders = [
    files_provider_2.filesProvider,
    skills_provider_2.skillsProvider,
    agents_provider_2.agentsProvider,
    tools_provider_2.toolsProvider,
];
/**
 * Register all built-in providers with the registry
 * Returns an unregister function
 */
function registerBuiltInProviders() {
    return registry_1.mentionRegistry.registerAll(exports.builtInProviders);
}
/**
 * Register a single provider
 */
function registerProvider(provider) {
    return registry_1.mentionRegistry.register(provider);
}
