#!/usr/bin/env bun
"use strict";
/**
 * One-time React → Solid migration script
 *
 * Usage:
 *   bun scripts/migrate-react.ts src/path/to/file.tsx
 *   bun scripts/migrate-react.ts src/path/to/file.tsx --write  # overwrite file
 *   bun scripts/migrate-react.ts "src/components/*.tsx" --write # batch migrate
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var solid_jsx_oxc_1 = require("solid-jsx-oxc");
var bun_1 = require("bun");
// Use migrateReact for migration-only (no JSX compilation)
var migrateReact = solid_jsx_oxc_1.default.migrateReact;
var migrateConfig = {
    attributes: true, // className → class
    hooks: true, // useState → createSignal
    imports: true, // react → solid-js
    jotai: false, // TODO: enable when ready
};
function migrateFile(filePath, write) {
    return __awaiter(this, void 0, void 0, function () {
        var source, code, e_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, Bun.file(filePath).text()];
                case 1:
                    source = _a.sent();
                    code = migrateReact(source, migrateConfig).code;
                    if (!write) return [3 /*break*/, 3];
                    return [4 /*yield*/, Bun.write(filePath, code)];
                case 2:
                    _a.sent();
                    console.log("\u2705 ".concat(filePath));
                    return [3 /*break*/, 4];
                case 3:
                    console.log("\n".concat("=".repeat(60), "\n\uD83D\uDCC4 ").concat(filePath, "\n").concat("=".repeat(60), "\n"));
                    console.log(code);
                    _a.label = 4;
                case 4: return [2 /*return*/, { path: filePath, success: true }];
                case 5:
                    e_1 = _a.sent();
                    error = e_1 instanceof Error ? e_1.message : String(e_1);
                    console.error("\u274C ".concat(filePath, ": ").concat(error));
                    return [2 /*return*/, { path: filePath, success: false, error: error }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, write, patterns, files, _i, patterns_1, pattern, glob, _a, _b, _c, file, e_2_1, results, succeeded, failed;
        var _d, e_2, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    args = process.argv.slice(2);
                    write = args.includes("--write");
                    patterns = args.filter(function (a) { return !a.startsWith("--"); });
                    if (patterns.length === 0) {
                        console.log("\nReact \u2192 Solid Migration Tool\n\nUsage:\n  bun scripts/migrate-react.ts <file-or-glob> [--write]\n\nExamples:\n  bun scripts/migrate-react.ts src/App.tsx                    # Preview migration\n  bun scripts/migrate-react.ts src/App.tsx --write            # Overwrite file\n  bun scripts/migrate-react.ts \"src/**/*.tsx\" --write         # Batch migrate\n\nTransforms:\n  \u2022 className \u2192 class\n  \u2022 htmlFor \u2192 for  \n  \u2022 useState \u2192 createSignal\n  \u2022 useMemo \u2192 createMemo\n  \u2022 useEffect \u2192 createEffect\n  \u2022 useCallback \u2192 inline (removed)\n  \u2022 import from \"react\" \u2192 import from \"solid-js\"\n");
                        process.exit(0);
                    }
                    files = [];
                    _i = 0, patterns_1 = patterns;
                    _g.label = 1;
                case 1:
                    if (!(_i < patterns_1.length)) return [3 /*break*/, 16];
                    pattern = patterns_1[_i];
                    if (!pattern.includes("*")) return [3 /*break*/, 14];
                    glob = new bun_1.Glob(pattern);
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 7, 8, 13]);
                    _a = true, _b = (e_2 = void 0, __asyncValues(glob.scan(".")));
                    _g.label = 3;
                case 3: return [4 /*yield*/, _b.next()];
                case 4:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                    _f = _c.value;
                    _a = false;
                    file = _f;
                    files.push(file);
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(_b)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [3 /*break*/, 15];
                case 14:
                    files.push(pattern);
                    _g.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 1];
                case 16:
                    if (files.length === 0) {
                        console.error("No files matched the pattern(s)");
                        process.exit(1);
                    }
                    console.log("\n\uD83D\uDD04 Migrating ".concat(files.length, " file(s)").concat(write ? " (writing changes)" : " (preview mode)", "...\n"));
                    return [4 /*yield*/, Promise.all(files.map(function (f) { return migrateFile(f, write); }))];
                case 17:
                    results = _g.sent();
                    succeeded = results.filter(function (r) { return r.success; }).length;
                    failed = results.filter(function (r) { return !r.success; }).length;
                    console.log("\n\uD83D\uDCCA Done: ".concat(succeeded, " succeeded, ").concat(failed, " failed"));
                    if (failed > 0) {
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main();
