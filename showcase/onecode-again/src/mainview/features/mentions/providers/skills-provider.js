"use strict";
/**
 * Skills Mention Provider
 *
 * Wraps the existing tRPC skills.listEnabled endpoint as a mention provider.
 * Provides skill search with descriptions and source indicators.
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
exports.skillsProvider = void 0;
var trpc_1 = require("../../../lib/trpc");
var types_1 = require("../types");
/**
 * Skills provider
 */
exports.skillsProvider = (0, types_1.createMentionProvider)({
    id: "skills",
    name: "Skills",
    category: {
        label: "Skills",
        priority: 80,
    },
    trigger: {
        char: "@",
        position: "standalone",
        allowSpaces: true,
    },
    priority: 80,
    search: function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, skills, items, limitedItems, timing, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        // Check for abort
                        if (context.signal.aborted) {
                            return [2 /*return*/, { items: [], hasMore: false, timing: 0 }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, trpc_1.trpcClient.skills.listEnabled.query({
                                cwd: context.projectPath,
                            })
                            // Map to MentionItem format
                        ];
                    case 2:
                        skills = _a.sent();
                        items = skills.map(function (skill) { return ({
                            id: "".concat(types_1.MENTION_PREFIXES.SKILL).concat(skill.name),
                            label: skill.name,
                            description: skill.description || skill.path,
                            icon: "skill",
                            data: {
                                name: skill.name,
                                description: skill.description,
                                source: skill.source,
                                path: skill.path,
                            },
                            // Project skills have higher priority
                            priority: skill.source === "project" ? 10 : 0,
                            metadata: {
                                type: "skill",
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
                                totalCount: skills.length,
                                timing: timing,
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[SkillsProvider] Search error:", error_1);
                        return [2 /*return*/, {
                                items: [],
                                hasMore: false,
                                warning: "Failed to load skills",
                                timing: performance.now() - startTime,
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    serialize: function (item) {
        return "@[".concat(item.id, "]");
    },
    deserialize: function (token) {
        try {
            // Check if this token belongs to us
            if (!token.startsWith(types_1.MENTION_PREFIXES.SKILL)) {
                return null;
            }
            // Parse: skill:name
            var name_1 = token.slice(types_1.MENTION_PREFIXES.SKILL.length);
            if (!name_1) {
                return null;
            }
            return {
                id: token,
                label: name_1,
                description: "", // Will be resolved later if needed
                icon: "skill",
                data: {
                    name: name_1,
                    description: "",
                    source: "user", // Default, will be resolved
                    path: "",
                },
                metadata: {
                    type: "skill",
                },
            };
        }
        catch (error) {
            console.warn("[SkillsProvider] Failed to deserialize token: ".concat(token), error);
            return null;
        }
    },
    // Skills are always available
    isAvailable: function () {
        return true;
    },
});
exports.default = exports.skillsProvider;
