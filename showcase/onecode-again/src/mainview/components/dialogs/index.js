"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsKeyboardTab = exports.AgentsDebugTab = exports.AgentsProfileTab = exports.AgentsAppearanceTab = exports.AgentsSettingsDialog = void 0;
// Dialogs
var agents_settings_dialog_1 = require("./agents-settings-dialog");
Object.defineProperty(exports, "AgentsSettingsDialog", { enumerable: true, get: function () { return agents_settings_dialog_1.AgentsSettingsDialog; } });
// Settings tabs
var agents_appearance_tab_1 = require("./settings-tabs/agents-appearance-tab");
Object.defineProperty(exports, "AgentsAppearanceTab", { enumerable: true, get: function () { return agents_appearance_tab_1.AgentsAppearanceTab; } });
var agents_profile_tab_1 = require("./settings-tabs/agents-profile-tab");
Object.defineProperty(exports, "AgentsProfileTab", { enumerable: true, get: function () { return agents_profile_tab_1.AgentsProfileTab; } });
var agents_debug_tab_1 = require("./settings-tabs/agents-debug-tab");
Object.defineProperty(exports, "AgentsDebugTab", { enumerable: true, get: function () { return agents_debug_tab_1.AgentsDebugTab; } });
var agents_keyboard_tab_1 = require("./settings-tabs/agents-keyboard-tab");
Object.defineProperty(exports, "AgentsKeyboardTab", { enumerable: true, get: function () { return agents_keyboard_tab_1.AgentsKeyboardTab; } });
