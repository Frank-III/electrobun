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
exports.FileItem = FileItem;
var alert_dialog_1 = require("../../../../components/ui/alert-dialog");
var button_1 = require("../../../../components/ui/button");
var checkbox_1 = require("../../../../components/ui/checkbox");
var context_menu_1 = require("../../../../components/ui/context-menu");
var tooltip_1 = require("../../../../components/ui/tooltip");
var utils_1 = require("../../../../lib/utils");
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var trpc_1 = require("../../../../lib/trpc");
var icons_1 = require("../../../../components/ui/icons");
var lucide_solid_2 = require("lucide-solid");
var utils_2 = require("../../utils");
function LevelIndicators(_a) {
    var level = _a.level;
    if (level === 0)
        return null;
    return <div class="flex self-stretch shrink-0">
			{Array.from({ length: level }).map(function (_, i) { return <div key={i} class="w-3 self-stretch border-r border-border"/>; })}
		</div>;
}
function getFileName(path) {
    return path.split("/").pop() || path;
}
function FileItem(_a) {
    var _this = this;
    var file = _a.file, isSelected = _a.isSelected, onClick = _a.onClick, onDoubleClick = _a.onDoubleClick, _b = _a.showStats, showStats = _b === void 0 ? true : _b, _c = _a.level, level = _c === void 0 ? 0 : _c, onStage = _a.onStage, onUnstage = _a.onUnstage, _d = _a.isActioning, isActioning = _d === void 0 ? false : _d, worktreePath = _a.worktreePath, onDiscard = _a.onDiscard, _e = _a.showCheckbox, showCheckbox = _e === void 0 ? false : _e, _f = _a.isStaged, isStaged = _f === void 0 ? false : _f;
    var _g = (0, solid_js_1.createSignal)(false), showDiscardDialog = _g[0], setShowDiscardDialog = _g[1];
    var fileName = getFileName(file.path);
    var statusBadgeColor = (0, utils_2.getStatusColor)(file.status);
    var statusIndicator = (0, utils_2.getStatusIndicator)(file.status);
    var showStatsDisplay = showStats && (file.additions > 0 || file.deletions > 0);
    var hasIndent = level > 0;
    var hasAction = onStage || onUnstage;
    var handleCheckboxChange = function (checked) {
        if (checked && onStage) {
            onStage();
        }
        else if (!checked && onUnstage) {
            onUnstage();
        }
    };
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    var openInEditorMutation = trpc_1.trpc.external.openFileInEditor.useMutation();
    var absolutePath = worktreePath ? "".concat(worktreePath, "/").concat(file.path) : null;
    var handleCopyPath = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!absolutePath) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.clipboard.writeText(absolutePath)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyRelativePath = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.clipboard.writeText(file.path)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleRevealInFinder = function () {
        if (absolutePath) {
            openInFinderMutation.mutate(absolutePath);
        }
    };
    var handleOpenInEditor = function () {
        if (absolutePath && worktreePath) {
            openInEditorMutation.mutate({
                path: absolutePath,
                cwd: worktreePath
            });
        }
    };
    var handleDiscardClick = function () {
        setShowDiscardDialog(true);
    };
    var handleConfirmDiscard = function () {
        setShowDiscardDialog(false);
        onDiscard === null || onDiscard === void 0 ? void 0 : onDiscard();
    };
    var isDeleteAction = file.status === "untracked" || file.status === "added";
    var discardLabel = isDeleteAction ? "Delete" : "Discard Changes";
    var discardDialogTitle = isDeleteAction ? "Delete \"".concat(fileName, "\"?") : "Discard changes to \"".concat(fileName, "\"?");
    var discardDialogDescription = isDeleteAction ? "This will permanently delete this file. This action cannot be undone." : "This will revert all changes to this file. This action cannot be undone.";
    var fileContent = <div class={(0, utils_1.cn)("group w-full flex items-stretch gap-1 px-1.5 text-left rounded-sm", "cursor-pointer transition-colors overflow-hidden", isSelected ? "bg-muted" : "hover:bg-muted/80")}>
			{hasIndent && <LevelIndicators level={level}/>}

			{/* Checkbox for staging (GitHub Desktop style) */}
			{showCheckbox && (onStage || onUnstage) && <div class="flex items-center px-0.5" onClick={function (e) { return e.stopPropagation(); }}>
					<checkbox_1.Checkbox checked={isStaged} onCheckedChange={handleCheckboxChange} disabled={isActioning} class="size-3.5"/>
				</div>}

			<button type="button" onClick={onClick} onDoubleClick={onDoubleClick} class={(0, utils_1.cn)("flex items-center gap-1.5 flex-1 min-w-0", hasIndent ? "py-0.5" : "py-1")}>
				<span class={(0, utils_1.cn)("shrink-0 flex items-center text-xs", statusBadgeColor)}>
					{statusIndicator}
				</span>
				<span class="flex-1 min-w-0 flex items-center gap-1">
					<tooltip_1.Tooltip>
						<tooltip_1.TooltipTrigger asChild>
							<span class="text-xs text-start truncate overflow-hidden text-ellipsis">
								{fileName}
							</span>
						</tooltip_1.TooltipTrigger>
						<tooltip_1.TooltipContent side="right">{file.path}</tooltip_1.TooltipContent>
					</tooltip_1.Tooltip>
					{showStatsDisplay && <span class="flex items-center gap-0.5 text-[10px] font-mono shrink-0 whitespace-nowrap opacity-60">
							{file.additions > 0 && <span class="text-green-600 dark:text-green-500">
									+{file.additions}
								</span>}
							{file.deletions > 0 && <span class="text-red-600 dark:text-red-400">
									-{file.deletions}
								</span>}
						</span>}
				</span>
			</button>

			{/* Hover actions (only when checkbox is not shown) */}
			{!showCheckbox && hasAction && <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
					{onStage && <tooltip_1.Tooltip>
							<tooltip_1.TooltipTrigger asChild>
								<button_1.Button variant="ghost" size="icon" class="size-5 hover:bg-accent" onClick={function (e) {
                    e.stopPropagation();
                    onStage();
                }} disabled={isActioning}>
									<lucide_solid_1.Plus class="size-3"/>
								</button_1.Button>
							</tooltip_1.TooltipTrigger>
							<tooltip_1.TooltipContent side="right">Stage</tooltip_1.TooltipContent>
						</tooltip_1.Tooltip>}
					{onUnstage && <tooltip_1.Tooltip>
							<tooltip_1.TooltipTrigger asChild>
								<button_1.Button variant="ghost" size="icon" class="size-5 hover:bg-accent" onClick={function (e) {
                    e.stopPropagation();
                    onUnstage();
                }} disabled={isActioning}>
									<lucide_solid_1.Minus class="size-3"/>
								</button_1.Button>
							</tooltip_1.TooltipTrigger>
							<tooltip_1.TooltipContent side="right">Unstage</tooltip_1.TooltipContent>
						</tooltip_1.Tooltip>}
				</div>}
		</div>;
    if (!worktreePath) {
        return fileContent;
    }
    return <>
			<context_menu_1.ContextMenu>
				<context_menu_1.ContextMenuTrigger asChild>{fileContent}</context_menu_1.ContextMenuTrigger>
				<context_menu_1.ContextMenuContent class="w-48">
					<context_menu_1.ContextMenuItem onClick={handleCopyPath}>
						<icons_1.ClipboardIcon class="mr-2 size-4"/>
						Copy Path
					</context_menu_1.ContextMenuItem>
					<context_menu_1.ContextMenuItem onClick={handleCopyRelativePath}>
						<icons_1.ClipboardIcon class="mr-2 size-4"/>
						Copy Relative Path
					</context_menu_1.ContextMenuItem>
					<context_menu_1.ContextMenuSeparator />
					<context_menu_1.ContextMenuItem onClick={handleRevealInFinder}>
						<icons_1.FolderIcon class="mr-2 size-4"/>
						Reveal in Finder
					</context_menu_1.ContextMenuItem>
					<context_menu_1.ContextMenuItem onClick={handleOpenInEditor}>
						<icons_1.ExternalLinkIcon class="mr-2 size-4"/>
						Open in Editor
					</context_menu_1.ContextMenuItem>

					{(onStage || onUnstage || onDiscard) && <context_menu_1.ContextMenuSeparator />}

					{onStage && <context_menu_1.ContextMenuItem onClick={onStage} disabled={isActioning}>
							<lucide_solid_2.Plus class="mr-2 size-4"/>
							Stage
						</context_menu_1.ContextMenuItem>}

					{onUnstage && <context_menu_1.ContextMenuItem onClick={onUnstage} disabled={isActioning}>
							<lucide_solid_2.Minus class="mr-2 size-4"/>
							Unstage
						</context_menu_1.ContextMenuItem>}

					{onDiscard && <context_menu_1.ContextMenuItem onClick={handleDiscardClick} disabled={isActioning} class="data-[highlighted]:bg-red-500/15 data-[highlighted]:text-red-400">
							{discardLabel}
						</context_menu_1.ContextMenuItem>}
				</context_menu_1.ContextMenuContent>
			</context_menu_1.ContextMenu>

			<alert_dialog_1.AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
				<alert_dialog_1.AlertDialogContent class="w-[340px]">
					<alert_dialog_1.AlertDialogHeader>
						<alert_dialog_1.AlertDialogTitle>
							{discardDialogTitle}
						</alert_dialog_1.AlertDialogTitle>
					</alert_dialog_1.AlertDialogHeader>
					<alert_dialog_1.AlertDialogDescription class="px-5 pb-5">
						{discardDialogDescription}
					</alert_dialog_1.AlertDialogDescription>
					<alert_dialog_1.AlertDialogFooter>
						<button_1.Button variant="outline" size="sm" onClick={function () { return setShowDiscardDialog(false); }}>
							Cancel
						</button_1.Button>
						<button_1.Button variant="destructive" size="sm" onClick={handleConfirmDiscard}>
							{isDeleteAction ? "Delete" : "Discard"}
						</button_1.Button>
					</alert_dialog_1.AlertDialogFooter>
				</alert_dialog_1.AlertDialogContent>
			</alert_dialog_1.AlertDialog>
		</>;
}
