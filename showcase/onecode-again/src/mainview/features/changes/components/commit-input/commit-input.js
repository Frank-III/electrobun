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
exports.CommitInput = CommitInput;
var button_1 = require("../../../../components/ui/button");
var solid_sonner_1 = require("solid-sonner");
var tooltip_1 = require("../../../../components/ui/tooltip");
var solid_js_1 = require("solid-js");
var trpc_1 = require("../../../../lib/trpc");
var utils_1 = require("../../../../lib/utils");
var icons_1 = require("../../../../components/ui/icons");
var react_query_1 = require("@tanstack/react-query");
var jotai_1 = require("../../../../lib/state/jotai");
var atoms_1 = require("../../../../lib/atoms");
function CommitInput(_a) {
    var _this = this;
    var worktreePath = _a.worktreePath, hasStagedChanges = _a.hasStagedChanges, onRefresh = _a.onRefresh, onCommitSuccess = _a.onCommitSuccess, stagedCount = _a.stagedCount, currentBranch = _a.currentBranch, selectedFilePaths = _a.selectedFilePaths, chatId = _a.chatId;
    var _b = (0, solid_js_1.createSignal)(""), summary = _b[0], setSummary = _b[1];
    var _c = (0, solid_js_1.createSignal)(""), description = _c[0], setDescription = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), isGenerating = _d[0], setIsGenerating = _d[1];
    var queryClient = (0, react_query_1.useQueryClient)();
    var selectedOllamaModel = (0, jotai_1.useAtomValue)(atoms_1.selectedOllamaModelAtom);
    // AI commit message generation
    var generateCommitMutation = trpc_1.trpc.chats.generateCommitMessage.useMutation();
    // Use atomic commit when we have selected files (safer, single operation)
    var atomicCommitMutation = trpc_1.trpc.changes.atomicCommit.useMutation({
        onSuccess: function () {
            setSummary("");
            setDescription("");
            // Invalidate the changes.getStatus query to force a fresh fetch
            queryClient.invalidateQueries({ queryKey: [["changes", "getStatus"]] });
            onRefresh();
            onCommitSuccess === null || onCommitSuccess === void 0 ? void 0 : onCommitSuccess();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Commit failed: ".concat(error.message)); }
    });
    // Fallback to regular commit for staged changes
    var commitMutation = trpc_1.trpc.changes.commit.useMutation({
        onSuccess: function () {
            setSummary("");
            setDescription("");
            queryClient.invalidateQueries({ queryKey: [["changes", "getStatus"]] });
            onRefresh();
            onCommitSuccess === null || onCommitSuccess === void 0 ? void 0 : onCommitSuccess();
        },
        onError: function (error) { return solid_sonner_1.toast.error("Commit failed: ".concat(error.message)); }
    });
    var isPending = commitMutation.isPending || atomicCommitMutation.isPending || isGenerating;
    // Build full commit message from summary and description
    var getCommitMessage = function () {
        var trimmedSummary = summary.trim();
        var trimmedDescription = description.trim();
        if (trimmedDescription) {
            return "".concat(trimmedSummary, "\n\n").concat(trimmedDescription);
        }
        return trimmedSummary;
    };
    // Can commit if files are selected (will auto-generate message if needed)
    var canCommit = hasStagedChanges;
    var handleCommit = function () { return __awaiter(_this, void 0, void 0, function () {
        var commitMessage, result, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!canCommit)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    commitMessage = getCommitMessage();
                    console.log("[CommitInput] handleCommit called, commitMessage:", commitMessage, "chatId:", chatId);
                    if (!(!commitMessage && chatId)) return [3 /*break*/, 6];
                    console.log("[CommitInput] No message, generating with AI for files:", selectedFilePaths);
                    setIsGenerating(true);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, generateCommitMutation.mutateAsync({
                            chatId: chatId,
                            filePaths: selectedFilePaths,
                            ollamaModel: selectedOllamaModel
                        })];
                case 3:
                    result = _a.sent();
                    console.log("[CommitInput] AI generated message:", result.message);
                    commitMessage = result.message;
                    // Also update the input field so user can see what was generated
                    setSummary(result.message);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("[CommitInput] Failed to generate message:", error_1);
                    solid_sonner_1.toast.error("Failed to generate commit message");
                    setIsGenerating(false);
                    return [2 /*return*/];
                case 5:
                    setIsGenerating(false);
                    _a.label = 6;
                case 6:
                    if (!commitMessage) {
                        solid_sonner_1.toast.error("Please enter a commit message");
                        return [2 /*return*/];
                    }
                    // Use atomic commit when we have selected files (single operation, safer)
                    if (selectedFilePaths && selectedFilePaths.length > 0) {
                        atomicCommitMutation.mutate({
                            worktreePath: worktreePath,
                            filePaths: selectedFilePaths,
                            message: commitMessage
                        });
                    }
                    else {
                        // Fallback to regular commit for pre-staged changes
                        commitMutation.mutate({
                            worktreePath: worktreePath,
                            message: commitMessage
                        });
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    solid_sonner_1.toast.error("Failed to prepare commit: ".concat(error_2 instanceof Error ? error_2.message : "Unknown error"));
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Build dynamic commit label
    var getCommitLabel = function () {
        if (stagedCount && stagedCount > 0 && currentBranch) {
            return "Commit ".concat(stagedCount, " to ").concat(currentBranch);
        }
        if (currentBranch) {
            return "Commit to ".concat(currentBranch);
        }
        return "Commit";
    };
    var getTooltip = function () {
        if (!hasStagedChanges)
            return "No staged changes";
        if (!summary.trim())
            return "AI will generate commit message";
        return "Commit staged changes";
    };
    return <div class="flex flex-col gap-2 p-2 border-t border-border/50 bg-background">
			{/* Summary input - single line */}
			<input type="text" placeholder="Summary (required)" value={summary} onChange={function (e) { return setSummary(e.target.value); }} class={(0, utils_1.cn)("w-full px-2 py-1.5 text-xs rounded-md", "bg-background border border-input", "placeholder:text-muted-foreground", "focus:outline-none focus:ring-1 focus:ring-ring")} onKeyDown={function (e) {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canCommit) {
                e.preventDefault();
                handleCommit();
            }
        }}/>

			{/* Description textarea - multiline */}
			<textarea placeholder="Description" value={description} onChange={function (e) { return setDescription(e.target.value); }} class={(0, utils_1.cn)("w-full px-2 py-1.5 text-xs rounded-md resize-none", "bg-background border border-input", "placeholder:text-muted-foreground", "focus:outline-none focus:ring-1 focus:ring-ring", "min-h-[60px]")} onKeyDown={function (e) {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canCommit) {
                e.preventDefault();
                handleCommit();
            }
        }}/>

			{/* Commit button - simple, no dropdown */}
			<tooltip_1.Tooltip>
				<tooltip_1.TooltipTrigger asChild>
					<button_1.Button variant="default" size="sm" class="w-full h-7 text-xs overflow-hidden" onClick={handleCommit} disabled={!canCommit || isPending}>
						{isPending ? <>
								<icons_1.IconSpinner class="h-3 w-3 mr-1.5 animate-spin"/>
								<span class="truncate">{isGenerating ? "Generating..." : "Committing..."}</span>
							</> : <span class="truncate">{getCommitLabel()}</span>}
					</button_1.Button>
				</tooltip_1.TooltipTrigger>
				<tooltip_1.TooltipContent side="top">{getTooltip()}</tooltip_1.TooltipContent>
			</tooltip_1.Tooltip>
		</div>;
}
