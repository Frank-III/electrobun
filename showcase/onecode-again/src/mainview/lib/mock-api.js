"use strict";
/**
 * API bridge for desktop app
 * Wraps real tRPC calls and provides stubs for web-only features
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.api = void 0;
var react_1 = require("react");
var trpc_1 = require("./trpc");
exports.api = {
    agents: {
        getAgentChats: {
            useQuery: function (_args, _opts) {
                var _a;
                // Use real tRPC
                var result = trpc_1.trpc.chats.list.useQuery({});
                return {
                    data: (_a = result.data) !== null && _a !== void 0 ? _a : [],
                    isLoading: result.isLoading,
                };
            },
        },
        getAgentChat: {
            useQuery: function (args, opts) {
                var chatId = args === null || args === void 0 ? void 0 : args.chatId;
                var result = trpc_1.trpc.chats.get.useQuery({ id: chatId }, { enabled: !!chatId && (opts === null || opts === void 0 ? void 0 : opts.enabled) !== false });
                // Memoize transformation to prevent infinite re-renders
                var transformedData = (0, react_1.useMemo)(function () {
                    var _a;
                    if (!result.data)
                        return null;
                    return __assign(__assign({}, result.data), { 
                        // Desktop uses worktrees, not sandboxes
                        sandbox_id: null, meta: null, 
                        // Map subChats to expected format
                        subChats: (_a = result.data.subChats) === null || _a === void 0 ? void 0 : _a.map(function (sc) {
                            var parsedMessages = [];
                            try {
                                parsedMessages = sc.messages ? JSON.parse(sc.messages) : [];
                                // Transform old tool-invocation parts to new tool-{toolName} format
                                parsedMessages = parsedMessages.map(function (msg) {
                                    if (!msg.parts)
                                        return msg;
                                    return __assign(__assign({}, msg), { parts: msg.parts.map(function (part) {
                                            var _a, _b;
                                            // Migrate old "tool-invocation" type to "tool-{toolName}"
                                            if (part.type === "tool-invocation" && part.toolName) {
                                                return __assign(__assign({}, part), { type: "tool-".concat(part.toolName), toolCallId: part.toolCallId || part.toolInvocationId, input: part.input || part.args });
                                            }
                                            // Normalize state field from DB format to AI SDK format
                                            // DB stores: "result", "call" -> AI SDK expects: "output-available", "call"
                                            if (((_a = part.type) === null || _a === void 0 ? void 0 : _a.startsWith("tool-")) && part.state) {
                                                var normalizedState = part.state;
                                                if (part.state === "result") {
                                                    // Check if it was an error result
                                                    normalizedState =
                                                        ((_b = part.result) === null || _b === void 0 ? void 0 : _b.success) === false
                                                            ? "output-error"
                                                            : "output-available";
                                                }
                                                // Also add output field from result if present (for diff display)
                                                return __assign(__assign({}, part), { state: normalizedState, output: part.output || part.result });
                                            }
                                            return part;
                                        }) });
                                });
                            }
                            catch (_a) {
                                console.warn("[mock-api] Failed to parse messages for subChat:", sc.id);
                                parsedMessages = [];
                            }
                            return __assign(__assign({}, sc), { created_at: sc.createdAt, updated_at: sc.updatedAt, messages: parsedMessages, stream_id: null });
                        }) });
                }, [result.data]);
                return {
                    data: transformedData,
                    isLoading: result.isLoading,
                };
            },
        },
        getArchivedChats: {
            useQuery: function (_args, _opts) {
                var _a;
                var result = trpc_1.trpc.chats.listArchived.useQuery({});
                return {
                    data: (_a = result.data) !== null && _a !== void 0 ? _a : [],
                    isLoading: result.isLoading,
                };
            },
        },
        archiveChat: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.archive.useMutation({
                    onSuccess: function () { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSettled) === null || _a === void 0 ? void 0 : _a.call(opts); },
                    onError: function (err) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, err); },
                });
                return {
                    mutate: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        var context;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, ((_a = opts === null || opts === void 0 ? void 0 : opts.onMutate) === null || _a === void 0 ? void 0 : _a.call(opts, args))];
                                case 1:
                                    context = _b.sent();
                                    if (args === null || args === void 0 ? void 0 : args.chatId) {
                                        mutation.mutate({ id: args.chatId });
                                    }
                                    return [2 /*return*/, context];
                            }
                        });
                    }); },
                    isPending: mutation.isPending,
                };
            },
        },
        restoreChat: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.restore.useMutation({
                    onSuccess: function () { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSettled) === null || _a === void 0 ? void 0 : _a.call(opts); },
                    onError: function (err) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, err); },
                });
                return {
                    mutate: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        var context;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, ((_a = opts === null || opts === void 0 ? void 0 : opts.onMutate) === null || _a === void 0 ? void 0 : _a.call(opts, args))];
                                case 1:
                                    context = _b.sent();
                                    if (args === null || args === void 0 ? void 0 : args.chatId) {
                                        mutation.mutate({ id: args.chatId });
                                    }
                                    return [2 /*return*/, context];
                            }
                        });
                    }); },
                    isPending: mutation.isPending,
                };
            },
        },
        renameChat: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.rename.useMutation({
                    onSuccess: function (data) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSuccess) === null || _a === void 0 ? void 0 : _a.call(opts, data); },
                    onError: function (err) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, err); },
                });
                return {
                    mutate: function (args) {
                        if ((args === null || args === void 0 ? void 0 : args.chatId) && (args === null || args === void 0 ? void 0 : args.name)) {
                            mutation.mutate({ id: args.chatId, name: args.name });
                        }
                    },
                    mutateAsync: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if ((args === null || args === void 0 ? void 0 : args.chatId) && (args === null || args === void 0 ? void 0 : args.name)) {
                                return [2 /*return*/, mutation.mutateAsync({ id: args.chatId, name: args.name })];
                            }
                            return [2 /*return*/];
                        });
                    }); },
                };
            },
        },
        renameSubChat: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.renameSubChat.useMutation({
                    onSuccess: function (data) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSuccess) === null || _a === void 0 ? void 0 : _a.call(opts, data); },
                    onError: function (err) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, err); },
                });
                return {
                    mutate: function (args, callbacks) {
                        if ((args === null || args === void 0 ? void 0 : args.subChatId) && (args === null || args === void 0 ? void 0 : args.name)) {
                            mutation.mutate({ id: args.subChatId, name: args.name }, { onSuccess: callbacks === null || callbacks === void 0 ? void 0 : callbacks.onSuccess });
                        }
                    },
                    mutateAsync: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if ((args === null || args === void 0 ? void 0 : args.subChatId) && (args === null || args === void 0 ? void 0 : args.name)) {
                                return [2 /*return*/, mutation.mutateAsync({
                                        id: args.subChatId,
                                        name: args.name,
                                    })];
                            }
                            return [2 /*return*/];
                        });
                    }); },
                    isPending: mutation.isPending,
                };
            },
        },
        generateSubChatName: {
            useMutation: function () {
                var mutation = trpc_1.trpc.chats.generateSubChatName.useMutation();
                return {
                    mutateAsync: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, mutation.mutateAsync({ userMessage: args.userMessage, ollamaModel: args.ollamaModel })];
                        });
                    }); },
                    isPending: mutation.isPending,
                };
            },
        },
        updateSubChatMode: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.updateSubChatMode.useMutation({
                    onSuccess: function (data) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSuccess) === null || _a === void 0 ? void 0 : _a.call(opts, data); },
                    onError: function (err) { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, err); },
                });
                return {
                    mutate: function (args) {
                        if ((args === null || args === void 0 ? void 0 : args.subChatId) && (args === null || args === void 0 ? void 0 : args.mode)) {
                            mutation.mutate({ id: args.subChatId, mode: args.mode });
                        }
                    },
                    isPending: mutation.isPending,
                };
            },
        },
        // Desktop stubs - not needed for local development
        createAgentPr: {
            useMutation: function (opts) { return ({
                mutate: function (_args, callbacks) {
                    var _a;
                    // Desktop: PR creation not implemented yet
                    (_a = opts === null || opts === void 0 ? void 0 : opts.onError) === null || _a === void 0 ? void 0 : _a.call(opts, new Error("PR creation not available in desktop app"));
                },
                mutateAsync: function (_args) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error("PR creation not available in desktop app");
                    });
                }); },
                isPending: false,
            }); },
        },
        archiveChatsBatch: {
            useMutation: function (opts) {
                var mutation = trpc_1.trpc.chats.archiveBatch.useMutation({
                    onSuccess: function () { var _a; return (_a = opts === null || opts === void 0 ? void 0 : opts.onSuccess) === null || _a === void 0 ? void 0 : _a.call(opts); },
                });
                return {
                    mutate: function (args, callbacks) {
                        if (args === null || args === void 0 ? void 0 : args.chatIds) {
                            mutation.mutate({ chatIds: args.chatIds }, { onSuccess: callbacks === null || callbacks === void 0 ? void 0 : callbacks.onSuccess });
                        }
                    },
                    isPending: mutation.isPending,
                };
            },
        },
    },
    usage: {
        getUserUsage: {
            useQuery: function (_args, _opts) { return ({
                // Desktop: no usage limits
                data: {
                    usage: 0,
                    limit: Infinity,
                    planType: "desktop",
                    next_payment_at: null,
                },
                isLoading: false,
            }); },
        },
    },
    useUtils: function () {
        var utils = trpc_1.trpc.useUtils();
        return {
            agents: {
                getAgentChats: {
                    cancel: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, utils.chats.list.cancel()];
                    }); }); },
                    getData: function () { return utils.chats.list.getData({}); },
                    setData: function (keyOrUpdater, updater) {
                        // Handle both signatures
                        if (typeof keyOrUpdater === "function") {
                            utils.chats.list.setData({}, keyOrUpdater);
                        }
                        else if (updater) {
                            utils.chats.list.setData({}, updater);
                        }
                    },
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, utils.chats.list.invalidate()];
                    }); }); },
                },
                getArchivedChats: {
                    cancel: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, utils.chats.listArchived.cancel()];
                    }); }); },
                    getData: function () { return utils.chats.listArchived.getData({}); },
                    setData: function (keyOrUpdater, updater) {
                        if (typeof keyOrUpdater === "function") {
                            utils.chats.listArchived.setData({}, keyOrUpdater);
                        }
                        else if (updater) {
                            utils.chats.listArchived.setData({}, updater);
                        }
                    },
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, utils.chats.listArchived.invalidate()];
                    }); }); },
                },
                getAgentChat: {
                    cancel: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); },
                    getData: function (args) {
                        if (!(args === null || args === void 0 ? void 0 : args.chatId))
                            return null;
                        return utils.chats.get.getData({ id: args.chatId });
                    },
                    setData: function (args, updater) {
                        if ((args === null || args === void 0 ? void 0 : args.chatId) && updater) {
                            utils.chats.get.setData({ id: args.chatId }, updater);
                        }
                    },
                    invalidate: function (args) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(args === null || args === void 0 ? void 0 : args.chatId)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, utils.chats.get.invalidate({ id: args.chatId })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); },
                },
                getSubChats: {
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); },
                    setData: function () { },
                },
            },
            github: {
                getSlashCommandContent: {
                    fetch: function (_args) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, ({ content: "" })];
                    }); }); },
                },
                searchFiles: {
                    cancel: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, utils.files.search.cancel()];
                    }); }); },
                },
            },
            user: {
                getProfile: {
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); },
                },
            },
            stripe: {
                getCheckoutSession: {
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); },
                },
                getUserBalance: {
                    invalidate: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); },
                },
            },
        };
    },
    // Stubs for features not needed in desktop
    teams: {
        getUserTeams: { useQuery: function () { return ({ data: [], isLoading: false }); } },
        getTeam: { useQuery: function () { return ({ data: null, isLoading: false }); } },
        updateTeam: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
    },
    repositorySandboxes: {
        getRepositoriesWithStatus: {
            useQuery: function () { return ({
                data: { repositories: [] },
                isLoading: false,
                refetch: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ data: { repositories: [] } })];
                }); }); },
            }); },
        },
    },
    stripe: {
        getUserBalance: { useQuery: function () { return ({ data: 0, isLoading: false }); } },
        createCheckoutSession: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ url: "" })];
                }); }); },
                isPending: false,
            }); },
        },
        createBillingPortalSession: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ url: "" })];
                }); }); },
                isPending: false,
            }); },
        },
    },
    user: {
        getProfile: { useQuery: function () { return ({ data: null, isLoading: false }); } },
        updateProfile: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
    },
    github: {
        getBranches: {
            useQuery: function () { return ({
                data: { branches: [] },
                isLoading: false,
                refetch: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ data: { branches: [] } })];
                }); }); },
            }); },
        },
        searchFiles: {
            useQuery: function (args, opts) {
                var _a, _b, _c;
                // Use real tRPC to search local files
                var result = trpc_1.trpc.files.search.useQuery({
                    projectPath: (args === null || args === void 0 ? void 0 : args.projectPath) || "",
                    query: (args === null || args === void 0 ? void 0 : args.query) || "",
                    limit: (args === null || args === void 0 ? void 0 : args.limit) || 50,
                }, {
                    enabled: !!(args === null || args === void 0 ? void 0 : args.projectPath) && (opts === null || opts === void 0 ? void 0 : opts.enabled) !== false,
                    staleTime: (_a = opts === null || opts === void 0 ? void 0 : opts.staleTime) !== null && _a !== void 0 ? _a : 5000,
                    refetchOnWindowFocus: (_b = opts === null || opts === void 0 ? void 0 : opts.refetchOnWindowFocus) !== null && _b !== void 0 ? _b : false,
                    placeholderData: opts === null || opts === void 0 ? void 0 : opts.placeholderData,
                });
                return {
                    data: (_c = result.data) !== null && _c !== void 0 ? _c : [],
                    isLoading: result.isLoading,
                    isFetching: result.isFetching,
                    error: result.error,
                };
            },
        },
        getSlashCommands: { useQuery: function () { return ({ data: [], isLoading: false }); } },
        getUserInstallations: { useQuery: function () { return ({ data: [], isLoading: false }); } },
        getGithubConnection: {
            useQuery: function () { return ({ data: { isConnected: false }, isLoading: false }); },
        },
        connectGithub: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
        disconnectGithub: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
        createBranch: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ branch: "" })];
                }); }); },
                isPending: false,
            }); },
        },
    },
    claudeCode: {
        getClaudeCodeConnection: {
            useQuery: function () { return ({ data: { isConnected: true }, isLoading: false }); },
        },
        connectClaudeCode: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
        disconnectClaudeCode: {
            useMutation: function () { return ({
                mutate: function () { },
                mutateAsync: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({})];
                }); }); },
                isPending: false,
            }); },
        },
    },
    agentInvites: {
        getOrCreateInviteCode: {
            useQuery: function () { return ({
                data: { maxUses: 0, usesCount: 0 },
                isLoading: false,
            }); },
        },
    },
};
