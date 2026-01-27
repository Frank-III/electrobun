"use strict";
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
exports.getGitRemoteInfo = getGitRemoteInfo;
exports.getRepoNameFromPath = getRepoNameFromPath;
var path_1 = require("path");
function runGit(args, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var proc, stdout, _a, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    proc = Bun.spawn(__spreadArray(["git"], args, true), {
                        cwd: cwd,
                        stdout: "pipe",
                        stderr: "ignore",
                    });
                    if (!proc.stdout) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Response(proc.stdout).text()];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = "";
                    _b.label = 3;
                case 3:
                    stdout = _a;
                    return [4 /*yield*/, proc.exited];
                case 4:
                    code = _b.sent();
                    return [2 /*return*/, { code: code !== null && code !== void 0 ? code : 0, stdout: stdout }];
            }
        });
    });
}
function isGitRepo(path) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runGit(["rev-parse", "--git-dir"], path)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
function parseGitRemoteUrl(url) {
    var normalized = url.trim();
    if (normalized.endsWith(".git")) {
        normalized = normalized.slice(0, -4);
    }
    var provider = null;
    var owner = null;
    var repo = null;
    var httpsMatch = normalized.match(/https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/([^/]+)\/([^/]+)/);
    if (httpsMatch) {
        var host = httpsMatch[1], ownerPart = httpsMatch[2], repoPart = httpsMatch[3];
        provider =
            host === "github.com"
                ? "github"
                : host === "gitlab.com"
                    ? "gitlab"
                    : host === "bitbucket.org"
                        ? "bitbucket"
                        : null;
        owner = ownerPart || null;
        repo = repoPart || null;
        return { provider: provider, owner: owner, repo: repo };
    }
    var sshMatch = normalized.match(/git@(github\.com|gitlab\.com|bitbucket\.org):([^/]+)\/(.+)/);
    if (sshMatch) {
        var host = sshMatch[1], ownerPart = sshMatch[2], repoPart = sshMatch[3];
        provider =
            host === "github.com"
                ? "github"
                : host === "gitlab.com"
                    ? "gitlab"
                    : host === "bitbucket.org"
                        ? "bitbucket"
                        : null;
        owner = ownerPart || null;
        repo = repoPart || null;
        return { provider: provider, owner: owner, repo: repoPart || null };
    }
    return { provider: null, owner: null, repo: null };
}
function getGitRemoteInfo(projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var emptyResult, isRepo, result, remoteUrl, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emptyResult = {
                        remoteUrl: null,
                        provider: null,
                        owner: null,
                        repo: null,
                    };
                    return [4 /*yield*/, isGitRepo(projectPath)];
                case 1:
                    isRepo = _a.sent();
                    if (!isRepo) {
                        return [2 /*return*/, emptyResult];
                    }
                    return [4 /*yield*/, runGit(["remote", "get-url", "origin"], projectPath)];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        return [2 /*return*/, emptyResult];
                    }
                    remoteUrl = result.stdout.trim();
                    if (!remoteUrl) {
                        return [2 /*return*/, emptyResult];
                    }
                    parsed = parseGitRemoteUrl(remoteUrl);
                    return [2 /*return*/, __assign({ remoteUrl: remoteUrl }, parsed)];
            }
        });
    });
}
function getRepoNameFromPath(path) {
    return (0, path_1.basename)(path);
}
