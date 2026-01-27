"use strict";
/**
 * MCP Tools Mention Provider
 *
 * Provides MCP (Model Context Protocol) tools from connected servers.
 * Tools are passed via the search context from the component that has access to sessionInfoAtom.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsProvider = void 0;
var types_1 = require("../types");
/**
 * Format MCP tool name for display
 * Converts snake_case/underscore names to readable format
 * e.g., "get_design_context" -> "Get design context"
 */
function formatToolName(toolName) {
    return toolName
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); })
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * Get tools from context
 */
function getToolsFromContext(context) {
    if (!context.mcpTools || !context.mcpServers) {
        return [];
    }
    // Get connected MCP server names
    var connectedServers = new Set(context.mcpServers
        .filter(function (server) { return server.status === "connected"; })
        .map(function (server) { return server.name; }));
    // Filter tools that belong to connected MCP servers
    // Format: mcp__servername__toolname
    var mcpTools = context.mcpTools.filter(function (tool) {
        if (!tool.startsWith("mcp__"))
            return false;
        var parts = tool.split("__");
        if (parts.length < 3)
            return false;
        var serverName = parts[1];
        return connectedServers.has(serverName);
    });
    return mcpTools.map(function (tool) {
        var parts = tool.split("__");
        var serverName = parts[1] || "";
        var toolName = parts.slice(2).join("__");
        return {
            fullName: tool,
            toolName: toolName,
            serverName: serverName,
            displayName: formatToolName(toolName),
        };
    });
}
/**
 * MCP Tools provider
 */
exports.toolsProvider = (0, types_1.createMentionProvider)({
    id: "tools",
    name: "MCP Tools",
    category: {
        label: "MCP Tools",
        priority: 60,
    },
    trigger: {
        char: "@",
        position: "standalone",
        allowSpaces: true,
    },
    priority: 60,
    search: function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, tools, items, limitedItems, timing;
            return __generator(this, function (_a) {
                startTime = performance.now();
                // Check for abort
                if (context.signal.aborted) {
                    return [2 /*return*/, { items: [], hasMore: false, timing: 0 }];
                }
                try {
                    tools = getToolsFromContext(context);
                    items = tools.map(function (tool) { return ({
                        id: "".concat(types_1.MENTION_PREFIXES.TOOL).concat(tool.fullName),
                        label: tool.displayName,
                        description: "".concat(tool.serverName, " / ").concat(tool.toolName),
                        icon: "tool",
                        data: tool,
                        // Search by multiple fields
                        keywords: [tool.toolName, tool.serverName, tool.fullName],
                        metadata: {
                            type: "tool",
                        },
                    }); });
                    // Apply relevance sorting if there's a query
                    if (context.query) {
                        items = (0, types_1.sortByRelevance)(items, context.query);
                    }
                    limitedItems = items.slice(0, context.limit);
                    timing = performance.now() - startTime;
                    return [2 /*return*/, {
                            items: limitedItems,
                            hasMore: items.length > context.limit,
                            totalCount: tools.length,
                            timing: timing,
                        }];
                }
                catch (error) {
                    console.error("[ToolsProvider] Search error:", error);
                    return [2 /*return*/, {
                            items: [],
                            hasMore: false,
                            warning: "Failed to load MCP tools",
                            timing: performance.now() - startTime,
                        }];
                }
                return [2 /*return*/];
            });
        });
    },
    serialize: function (item) {
        return "@[".concat(item.id, "]");
    },
    deserialize: function (token) {
        try {
            // Check if this token belongs to us
            if (!token.startsWith(types_1.MENTION_PREFIXES.TOOL)) {
                return null;
            }
            // Parse: tool:mcp__servername__toolname
            var fullName = token.slice(types_1.MENTION_PREFIXES.TOOL.length);
            // Parse the full name
            var parts = fullName.split("__");
            if (parts.length < 3 || parts[0] !== "mcp") {
                return null;
            }
            var serverName = parts[1] || "";
            var toolName = parts.slice(2).join("__");
            if (!toolName) {
                return null;
            }
            return {
                id: token,
                label: formatToolName(toolName),
                description: "".concat(serverName, " / ").concat(toolName),
                icon: "tool",
                data: {
                    fullName: fullName,
                    toolName: toolName,
                    serverName: serverName,
                    displayName: formatToolName(toolName),
                },
                metadata: {
                    type: "tool",
                },
            };
        }
        catch (error) {
            console.warn("[ToolsProvider] Failed to deserialize token: ".concat(token), error);
            return null;
        }
    },
    isAvailable: function (context) {
        // Tools are available when we have MCP tools in context
        var toolsContext = context;
        return Array.isArray(toolsContext.mcpTools) && toolsContext.mcpTools.length > 0;
    },
});
exports.default = exports.toolsProvider;
