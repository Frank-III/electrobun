"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentExitPlanModeTool = void 0;
var solid_js_1 = require("solid-js");
var agent_tool_utils_1 = require("./agent-tool-utils");
exports.AgentExitPlanModeTool = (0, solid_js_1.memo)(function AgentExitPlanModeTool(_a) {
    var part = _a.part;
    // Plan is now shown in sidebar instead of inline
    // This component remains for potential future use
    return null;
}, agent_tool_utils_1.areToolPropsEqual);
