"use strict";
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
exports.exportChat = exportChat;
exports.copyChat = copyChat;
var trpc_1 = require("../../../lib/trpc");
var remote_api_1 = require("../../../lib/remote-api");
var solid_sonner_1 = require("solid-sonner");
/**
 * Format messages for export
 */
function formatMessages(messages, format, chatName) {
    var timestamp = new Date().toISOString().split('T')[0];
    var safeName = chatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    if (format === "json") {
        return {
            content: JSON.stringify(messages, null, 2),
            filename: "".concat(safeName, "-").concat(timestamp, ".json"),
        };
    }
    var formattedMessages = messages.map(function (msg) {
        var role = msg.role === "user" ? "User" : msg.role === "assistant" ? "Assistant" : msg.role;
        var content = "";
        if (typeof msg.content === "string") {
            content = msg.content;
        }
        else if (Array.isArray(msg.content)) {
            content = msg.content
                .filter(function (part) { return part.type === "text" && part.text; })
                .map(function (part) { return part.text; })
                .join("\n");
        }
        if (format === "markdown") {
            return "## ".concat(role, "\n\n").concat(content);
        }
        else {
            return "".concat(role, ":\n").concat(content);
        }
    });
    var ext = format === "markdown" ? "md" : "txt";
    var separator = format === "markdown" ? "\n\n---\n\n" : "\n\n";
    return {
        content: formattedMessages.join(separator),
        filename: "".concat(safeName, "-").concat(timestamp, ".").concat(ext),
    };
}
/**
 * Export a chat or sub-chat to a file.
 * Shows download dialog to save the exported content.
 */
function exportChat(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var exportData, chat, subChat, messages, chatName, blob, url, link, error_1;
        var chatId = _b.chatId, subChatId = _b.subChatId, format = _b.format, _c = _b.isRemote, isRemote = _c === void 0 ? false : _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    exportData = void 0;
                    if (!isRemote) return [3 /*break*/, 2];
                    return [4 /*yield*/, remote_api_1.remoteApi.getAgentChat(chatId)];
                case 1:
                    chat = _d.sent();
                    subChat = subChatId
                        ? chat.subChats.find(function (sc) { return sc.id === subChatId; })
                        : chat.subChats[0];
                    if (!subChat) {
                        throw new Error("No chat data found");
                    }
                    messages = (subChat.messages || []);
                    chatName = subChat.name || chat.name || "remote-chat";
                    exportData = formatMessages(messages, format, chatName);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, trpc_1.trpcClient.chats.exportChat.query({
                        chatId: chatId,
                        subChatId: subChatId,
                        format: format,
                    })];
                case 3:
                    // Local chat export - use existing tRPC endpoint
                    exportData = _d.sent();
                    _d.label = 4;
                case 4:
                    blob = new Blob([exportData.content], { type: "text/plain;charset=utf-8" });
                    url = URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = exportData.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    solid_sonner_1.toast.success("Export complete", {
                        description: "Saved as ".concat(exportData.filename),
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error("[exportChat] Error:", error_1);
                    solid_sonner_1.toast.error("Export failed", {
                        description: error_1 instanceof Error ? error_1.message : "Unable to export chat",
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Copy chat or sub-chat content to clipboard.
 */
function copyChat(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var exportData, chat, subChat, messages, chatName, _c, error_2;
        var _d;
        var chatId = _b.chatId, subChatId = _b.subChatId, format = _b.format, _e = _b.isRemote, isRemote = _e === void 0 ? false : _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 11, , 12]);
                    exportData = void 0;
                    if (!isRemote) return [3 /*break*/, 2];
                    return [4 /*yield*/, remote_api_1.remoteApi.getAgentChat(chatId)];
                case 1:
                    chat = _f.sent();
                    subChat = subChatId
                        ? chat.subChats.find(function (sc) { return sc.id === subChatId; })
                        : chat.subChats[0];
                    if (!subChat) {
                        throw new Error("No chat data found");
                    }
                    messages = (subChat.messages || []);
                    chatName = subChat.name || chat.name || "remote-chat";
                    exportData = formatMessages(messages, format, chatName);
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, trpc_1.trpcClient.chats.exportChat.query({
                        chatId: chatId,
                        subChatId: subChatId,
                        format: format,
                    })];
                case 3:
                    // Local chat export - use existing tRPC endpoint
                    exportData = _f.sent();
                    _f.label = 4;
                case 4:
                    _f.trys.push([4, 6, , 10]);
                    return [4 /*yield*/, navigator.clipboard.writeText(exportData.content)];
                case 5:
                    _f.sent();
                    return [3 /*break*/, 10];
                case 6:
                    _c = _f.sent();
                    if (!((_d = window.desktopApi) === null || _d === void 0 ? void 0 : _d.clipboardWrite)) return [3 /*break*/, 8];
                    return [4 /*yield*/, window.desktopApi.clipboardWrite(exportData.content)];
                case 7:
                    _f.sent();
                    return [3 /*break*/, 9];
                case 8: throw new Error("Clipboard not available");
                case 9: return [3 /*break*/, 10];
                case 10:
                    solid_sonner_1.toast.success("Copied to clipboard");
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _f.sent();
                    console.error("[copyChat] Error:", error_2);
                    solid_sonner_1.toast.error("Copy failed", {
                        description: error_2 instanceof Error ? error_2.message : "Unable to copy chat",
                    });
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
