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
var node_path_1 = require("node:path");
var bun_plugin_tailwind_1 = require("bun-plugin-tailwind");
var solid_plugin_1 = require("./solid-plugin");
var isMinify = process.argv.includes("--minify");
var isWatch = process.argv.includes("--watch");
var outdir = node_path_1.default.resolve(import.meta.dir, "../dist/mainview");
function build() {
    return __awaiter(this, void 0, void 0, function () {
        var result, _i, _a, log;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("[build-ui] Building mainview ".concat(isMinify ? "(minified)" : "(dev)", "..."));
                    return [4 /*yield*/, Bun.build({
                            entrypoints: [node_path_1.default.resolve(import.meta.dir, "../src/mainview/main.tsx")],
                            outdir: outdir,
                            target: "browser",
                            format: "esm",
                            splitting: true,
                            sourcemap: isMinify ? "none" : "linked",
                            minify: isMinify,
                            plugins: [(0, solid_plugin_1.solidTransformPlugin)(), bun_plugin_tailwind_1.default],
                            define: {
                                "process.env.NODE_ENV": JSON.stringify(isMinify ? "production" : "development"),
                            },
                        })];
                case 1:
                    result = _b.sent();
                    if (!result.success) {
                        console.error("[build-ui] Build failed:");
                        for (_i = 0, _a = result.logs; _i < _a.length; _i++) {
                            log = _a[_i];
                            console.error(log);
                        }
                        process.exit(1);
                    }
                    console.log("[build-ui] Build complete: ".concat(result.outputs.length, " files"));
                    return [2 /*return*/, result];
            }
        });
    });
}
if (isWatch) {
    console.log("[build-ui] Watch mode enabled");
    // Initial build
    await build();
    // TODO: Add file watcher if needed
}
else {
    await build();
}
