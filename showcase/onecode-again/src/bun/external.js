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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExternalHandlers = createExternalHandlers;
var bun_1 = require("electrobun/bun");
var os_1 = require("os");
var path_1 = require("path");
function expandTilde(filePath) {
    if (filePath.startsWith("~/") || filePath === "~") {
        return (0, path_1.join)((0, os_1.homedir)(), filePath.slice(1));
    }
    return filePath;
}
function createExternalHandlers() {
    var _this = this;
    return {
        openInFinder: function (_a) {
            var path = _a.path;
            var expandedPath = expandTilde(path);
            bun_1.Utils.showItemInFolder(expandedPath);
            return { success: true };
        },
        openFileInEditor: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var expandedPath, editors, _i, editors_1, editor, proc;
            var _c;
            var path = _b.path, cwd = _b.cwd;
            return __generator(this, function (_d) {
                expandedPath = expandTilde(path);
                editors = [
                    { cmd: "code", args: [expandedPath] },
                    { cmd: "cursor", args: [expandedPath] },
                    { cmd: "subl", args: [expandedPath] },
                    { cmd: "atom", args: [expandedPath] },
                    { cmd: "open", args: ["-t", expandedPath] },
                ];
                for (_i = 0, editors_1 = editors; _i < editors_1.length; _i++) {
                    editor = editors_1[_i];
                    try {
                        proc = Bun.spawn(__spreadArray([editor.cmd], editor.args, true), {
                            cwd: cwd,
                            stdin: "ignore",
                            stdout: "ignore",
                            stderr: "ignore",
                            detached: true,
                        });
                        (_c = proc.unref) === null || _c === void 0 ? void 0 : _c.call(proc);
                        return [2 /*return*/, { success: true, editor: editor.cmd }];
                    }
                    catch (_e) {
                        continue;
                    }
                }
                bun_1.Utils.openPath(expandedPath);
                return [2 /*return*/, { success: true, editor: "default" }];
            });
        }); },
    };
}
