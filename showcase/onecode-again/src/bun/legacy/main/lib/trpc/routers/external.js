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
exports.externalRouter = void 0;
var electron_1 = require("electron");
var node_child_process_1 = require("node:child_process");
var os = require("node:os");
var path = require("node:path");
var zod_1 = require("zod");
var index_1 = require("../index");
function expandTilde(filePath) {
    if (filePath.startsWith("~/") || filePath === "~") {
        return path.join(os.homedir(), filePath.slice(1));
    }
    return filePath;
}
/**
 * External router for shell operations (open in finder, open in editor, etc.)
 */
exports.externalRouter = (0, index_1.router)({
    openInFinder: index_1.publicProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var expandedPath;
        var inputPath = _b.input;
        return __generator(this, function (_c) {
            expandedPath = expandTilde(inputPath);
            electron_1.shell.showItemInFolder(expandedPath);
            return [2 /*return*/, { success: true }];
        });
    }); }),
    openFileInEditor: index_1.publicProcedure
        .input(zod_1.z.object({
        path: zod_1.z.string(),
        cwd: zod_1.z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var path, cwd, editors, _i, editors_1, editor, child;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    path = input.path, cwd = input.cwd;
                    editors = [
                        { cmd: "code", args: [path] }, // VS Code
                        { cmd: "cursor", args: [path] }, // Cursor
                        { cmd: "subl", args: [path] }, // Sublime Text
                        { cmd: "atom", args: [path] }, // Atom
                        { cmd: "open", args: ["-t", path] }, // macOS default text editor
                    ];
                    for (_i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                        editor = editors_1[_i];
                        try {
                            child = (0, node_child_process_1.spawn)(editor.cmd, editor.args, {
                                cwd: cwd || undefined,
                                detached: true,
                                stdio: "ignore",
                            });
                            child.unref();
                            return [2 /*return*/, { success: true, editor: editor.cmd }];
                        }
                        catch (_d) {
                            // Try next editor
                            continue;
                        }
                    }
                    // Fallback: use shell.openPath which opens with default app
                    return [4 /*yield*/, electron_1.shell.openPath(path)];
                case 1:
                    // Fallback: use shell.openPath which opens with default app
                    _c.sent();
                    return [2 /*return*/, { success: true, editor: "default" }];
            }
        });
    }); }),
    openExternal: index_1.publicProcedure
        .input(zod_1.z.string())
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var url = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, electron_1.shell.openExternal(url)];
                case 1:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
