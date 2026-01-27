"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeLoginModal = ClaudeLoginModal;
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var atoms_1 = require("../../features/agents/atoms");
var atoms_2 = require("../../lib/atoms");
var jotai_store_1 = require("../../lib/jotai-store");
var trpc_1 = require("../../lib/trpc");
var alert_dialog_1 = require("../ui/alert-dialog");
var button_1 = require("../ui/button");
var icons_1 = require("../ui/icons");
var input_1 = require("../ui/input");
var logo_1 = require("../ui/logo");
function ClaudeLoginModal() {
    var _this = this;
    var _a = (0, jotai_1.useAtom)(atoms_2.agentsLoginModalOpenAtom), open = _a[0], setOpen = _a[1];
    var setSettingsOpen = (0, jotai_1.useSetAtom)(atoms_2.agentsSettingsDialogOpenAtom);
    var setSettingsActiveTab = (0, jotai_1.useSetAtom)(atoms_2.agentsSettingsDialogActiveTabAtom);
    var _b = (0, solid_js_1.createSignal)({ step: "idle" }), flowState = _b[0], setFlowState = _b[1];
    var _c = (0, solid_js_1.createSignal)(""), authCode = _c[0], setAuthCode = _c[1];
    var _d = (0, solid_js_1.createSignal)(false), userClickedConnect = _d[0], setUserClickedConnect = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), urlOpened = _e[0], setUrlOpened = _e[1];
    var _f = (0, solid_js_1.createSignal)(null), savedOauthUrl = _f[0], setSavedOauthUrl = _f[1];
    var _g = (0, solid_js_1.createSignal)(false), urlOpenedRef = _g[0], setUrlOpenedRef = _g[1];
    // tRPC mutations
    var startAuthMutation = trpc_1.trpc.claudeCode.startAuth.useMutation();
    var submitCodeMutation = trpc_1.trpc.claudeCode.submitCode.useMutation();
    var openOAuthUrlMutation = trpc_1.trpc.claudeCode.openOAuthUrl.useMutation();
    // Poll for OAuth URL
    var pollStatusQuery = trpc_1.trpc.claudeCode.pollStatus.useQuery({
        sandboxUrl: flowState.step === "waiting_url" ? flowState.sandboxUrl : "",
        sessionId: flowState.step === "waiting_url" ? flowState.sessionId : ""
    }, {
        enabled: flowState.step === "waiting_url",
        refetchInterval: 1500
    });
    // Update flow state when we get the OAuth URL
    (0, solid_js_1.createEffect)(function () {
        var _a, _b;
        if (flowState.step === "waiting_url" && ((_a = pollStatusQuery.data) === null || _a === void 0 ? void 0 : _a.oauthUrl)) {
            setSavedOauthUrl(pollStatusQuery.data.oauthUrl);
            setFlowState({
                step: "has_url",
                sandboxId: flowState.sandboxId,
                oauthUrl: pollStatusQuery.data.oauthUrl,
                sandboxUrl: flowState.sandboxUrl,
                sessionId: flowState.sessionId
            });
        }
        else if (flowState.step === "waiting_url" && ((_b = pollStatusQuery.data) === null || _b === void 0 ? void 0 : _b.state) === "error") {
            setFlowState({
                step: "error",
                message: pollStatusQuery.data.error || "Failed to get OAuth URL"
            });
        }
    });
    // Open URL in browser when ready (after user clicked Connect)
    (0, solid_js_1.createEffect)(function () {
        if (flowState.step === "has_url" && userClickedConnect && !urlOpenedRef.current) {
            urlOpenedRef.current = true;
            setUrlOpened(true);
            openOAuthUrlMutation.mutate(flowState.oauthUrl);
        }
    });
    // Reset state when modal closes
    (0, solid_js_1.createEffect)(function () {
        if (!open) {
            setFlowState({ step: "idle" });
            setAuthCode("");
            setUserClickedConnect(false);
            setUrlOpened(false);
            setSavedOauthUrl(null);
            urlOpenedRef.current = false;
        }
    });
    // Helper to trigger retry after successful OAuth
    var triggerAuthRetry = function () {
        var pending = jotai_store_1.appStore.get(atoms_1.pendingAuthRetryMessageAtom);
        if (pending) {
            console.log("[ClaudeLoginModal] OAuth success - triggering retry for subChatId:", pending.subChatId);
            jotai_store_1.appStore.set(atoms_1.pendingAuthRetryMessageAtom, __assign(__assign({}, pending), { readyToRetry: true }));
        }
    };
    // Helper to clear pending retry (on cancel/close without success)
    var clearPendingRetry = function () {
        var pending = jotai_store_1.appStore.get(atoms_1.pendingAuthRetryMessageAtom);
        if (pending && !pending.readyToRetry) {
            console.log("[ClaudeLoginModal] Modal closed without success - clearing pending retry");
            jotai_store_1.appStore.set(atoms_1.pendingAuthRetryMessageAtom, null);
        }
    };
    // Check if the code looks like a valid Claude auth code (format: XXX#YYY)
    var isValidCodeFormat = function (code) {
        var trimmed = code.trim();
        return trimmed.length > 50 && trimmed.includes("#");
    };
    var handleConnectClick = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1, result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setUserClickedConnect(true);
                    if (!(flowState.step === "has_url")) return [3 /*break*/, 1];
                    // URL is ready, open it immediately
                    urlOpenedRef.current = true;
                    setUrlOpened(true);
                    openOAuthUrlMutation.mutate(flowState.oauthUrl);
                    return [3 /*break*/, 10];
                case 1:
                    if (!(flowState.step === "error")) return [3 /*break*/, 6];
                    // Retry on error
                    urlOpenedRef.current = false;
                    setUrlOpened(false);
                    setFlowState({ step: "starting" });
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, startAuthMutation.mutateAsync()];
                case 3:
                    result = _a.sent();
                    setFlowState({
                        step: "waiting_url",
                        sandboxId: result.sandboxId,
                        sandboxUrl: result.sandboxUrl,
                        sessionId: result.sessionId
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    setFlowState({
                        step: "error",
                        message: err_1 instanceof Error ? err_1.message : "Failed to start authentication"
                    });
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 10];
                case 6:
                    if (!(flowState.step === "idle")) return [3 /*break*/, 10];
                    // Start auth
                    setFlowState({ step: "starting" });
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, startAuthMutation.mutateAsync()];
                case 8:
                    result = _a.sent();
                    setFlowState({
                        step: "waiting_url",
                        sandboxId: result.sandboxId,
                        sandboxUrl: result.sandboxUrl,
                        sessionId: result.sessionId
                    });
                    return [3 /*break*/, 10];
                case 9:
                    err_2 = _a.sent();
                    setFlowState({
                        step: "error",
                        message: err_2 instanceof Error ? err_2.message : "Failed to start authentication"
                    });
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmitCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var sandboxUrl, sessionId, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!authCode.trim() || flowState.step !== "has_url")
                        return [2 /*return*/];
                    sandboxUrl = flowState.sandboxUrl, sessionId = flowState.sessionId;
                    setFlowState({ step: "submitting" });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, submitCodeMutation.mutateAsync({
                            sandboxUrl: sandboxUrl,
                            sessionId: sessionId,
                            code: authCode.trim()
                        })];
                case 2:
                    _a.sent();
                    // Success - trigger retry and close modal
                    triggerAuthRetry();
                    setOpen(false);
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    setFlowState({
                        step: "error",
                        message: err_3 instanceof Error ? err_3.message : "Failed to submit code"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCodeChange = function (e) {
        var value = e.target.value;
        setAuthCode(value);
        // Auto-submit if the pasted value looks like a valid auth code
        if (isValidCodeFormat(value) && flowState.step === "has_url") {
            var sandboxUrl_1 = flowState.sandboxUrl, sessionId_1 = flowState.sessionId;
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                var err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setFlowState({ step: "submitting" });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, submitCodeMutation.mutateAsync({
                                    sandboxUrl: sandboxUrl_1,
                                    sessionId: sessionId_1,
                                    code: value.trim()
                                })];
                        case 2:
                            _a.sent();
                            // Success - trigger retry and close modal
                            triggerAuthRetry();
                            setOpen(false);
                            return [3 /*break*/, 4];
                        case 3:
                            err_4 = _a.sent();
                            setFlowState({
                                step: "error",
                                message: err_4 instanceof Error ? err_4.message : "Failed to submit code"
                            });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }, 100);
        }
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && authCode.trim()) {
            handleSubmitCode();
        }
    };
    var handleOpenFallbackUrl = function () {
        if (savedOauthUrl) {
            openOAuthUrlMutation.mutate(savedOauthUrl);
        }
    };
    var handleOpenModelsSettings = function () {
        clearPendingRetry();
        setSettingsActiveTab("models");
        setSettingsOpen(true);
        setOpen(false);
    };
    var isLoadingAuth = flowState.step === "starting" || flowState.step === "waiting_url";
    var isSubmitting = flowState.step === "submitting";
    // Handle modal open/close - clear pending retry if closing without success
    var handleOpenChange = function (newOpen) {
        if (!newOpen) {
            clearPendingRetry();
        }
        setOpen(newOpen);
    };
    return <alert_dialog_1.AlertDialog open={open} onOpenChange={handleOpenChange}>
      <alert_dialog_1.AlertDialogContent class="w-[380px] p-6">
        {/* Close button */}
        <alert_dialog_1.AlertDialogCancel class="absolute right-4 top-4 h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted rounded-sm opacity-70 hover:opacity-100">
          <lucide_solid_1.X class="h-4 w-4"/>
          <span class="sr-only">Close</span>
        </alert_dialog_1.AlertDialogCancel>

        <div class="space-y-8">
          {/* Header with dual icons */}
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <logo_1.Logo class="w-5 h-5" fill="white"/>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#D97757] flex items-center justify-center">
                <icons_1.ClaudeCodeIcon class="w-6 h-6 text-white"/>
              </div>
            </div>
            <div class="space-y-1">
              <h1 class="text-base font-semibold tracking-tight">
                Claude Code
              </h1>
              <p class="text-sm text-muted-foreground">
                Connect your Claude Code subscription
              </p>
            </div>
          </div>

          {/* Content */}
          <div class="space-y-6">
            {/* Connect Button - shows loader only if user clicked AND loading */}
            {!urlOpened && flowState.step !== "has_url" && flowState.step !== "error" && <button_1.Button onClick={handleConnectClick} class="w-full" disabled={userClickedConnect && isLoadingAuth}>
                {userClickedConnect && isLoadingAuth ? <icons_1.IconSpinner class="h-4 w-4"/> : "Connect"}
              </button_1.Button>}

            {/* Code Input - Show after URL is opened or if has_url */}
            {(urlOpened || flowState.step === "has_url" || flowState.step === "submitting") && <div class="space-y-4">
                <input_1.Input value={authCode} onChange={handleCodeChange} onKeyDown={handleKeyDown} placeholder="Paste your authentication code here..." class="font-mono text-center" autoFocus disabled={isSubmitting}/>
                <button_1.Button onClick={handleSubmitCode} class="w-full" disabled={!authCode.trim() || isSubmitting}>
                  {isSubmitting ? <icons_1.IconSpinner class="h-4 w-4"/> : "Continue"}
                </button_1.Button>
                <p class="text-xs text-muted-foreground text-center">
                  A new tab has opened for authentication.
                  {savedOauthUrl && <>
                      {" "}
                      <button onClick={handleOpenFallbackUrl} class="text-primary hover:underline">
                        Didn't open? Click here
                      </button>
                    </>}
                </p>
              </div>}

            {/* Error State */}
            {flowState.step === "error" && <div class="space-y-4">
                <div class="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p class="text-sm text-destructive">{flowState.message}</p>
                </div>
                <button_1.Button variant="secondary" onClick={handleConnectClick} class="w-full">
                  Try Again
                </button_1.Button>
              </div>}

            <div class="text-center !mt-2">
              <button type="button" onClick={handleOpenModelsSettings} class="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground">
                Set a custom model in Settings
              </button>
            </div>
          </div>
        </div>
      </alert_dialog_1.AlertDialogContent>
    </alert_dialog_1.AlertDialog>;
}
