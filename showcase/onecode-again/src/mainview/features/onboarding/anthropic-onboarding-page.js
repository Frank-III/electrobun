"use client";
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
exports.AnthropicOnboardingPage = AnthropicOnboardingPage;
var jotai_1 = require("../../lib/state/jotai");
var lucide_solid_1 = require("lucide-solid");
var solid_js_1 = require("solid-js");
var icons_1 = require("../../components/ui/icons");
var input_1 = require("../../components/ui/input");
var logo_1 = require("../../components/ui/logo");
var atoms_1 = require("../../lib/atoms");
var trpc_1 = require("../../lib/trpc");
function AnthropicOnboardingPage() {
    var _this = this;
    var _a, _b;
    var _c = (0, solid_js_1.createSignal)({ step: "idle" }), flowState = _c[0], setFlowState = _c[1];
    var _d = (0, solid_js_1.createSignal)(""), authCode = _d[0], setAuthCode = _d[1];
    var _e = (0, solid_js_1.createSignal)(false), userClickedConnect = _e[0], setUserClickedConnect = _e[1];
    var _f = (0, solid_js_1.createSignal)(false), urlOpened = _f[0], setUrlOpened = _f[1];
    var _g = (0, solid_js_1.createSignal)(null), savedOauthUrl = _g[0], setSavedOauthUrl = _g[1];
    var _h = (0, solid_js_1.createSignal)(false), ignoredExistingToken = _h[0], setIgnoredExistingToken = _h[1];
    var _j = (0, solid_js_1.createSignal)(false), isUsingExistingToken = _j[0], setIsUsingExistingToken = _j[1];
    var _k = (0, solid_js_1.createSignal)(null), existingTokenError = _k[0], setExistingTokenError = _k[1];
    var _l = (0, solid_js_1.createSignal)(false), urlOpenedRef = _l[0], setUrlOpenedRef = _l[1];
    var setAnthropicOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_1.anthropicOnboardingCompletedAtom);
    var setBillingMethod = (0, jotai_1.useSetAtom)(atoms_1.billingMethodAtom);
    var handleBack = function () {
        setBillingMethod(null);
    };
    var formatTokenPreview = function (token) {
        var trimmed = token.trim();
        if (trimmed.length <= 16)
            return trimmed;
        return "".concat(trimmed.slice(0, 19), "...").concat(trimmed.slice(-6));
    };
    // tRPC mutations
    var startAuthMutation = trpc_1.trpc.claudeCode.startAuth.useMutation();
    var submitCodeMutation = trpc_1.trpc.claudeCode.submitCode.useMutation();
    var openOAuthUrlMutation = trpc_1.trpc.claudeCode.openOAuthUrl.useMutation();
    var importSystemTokenMutation = trpc_1.trpc.claudeCode.importSystemToken.useMutation();
    var existingTokenQuery = trpc_1.trpc.claudeCode.getSystemToken.useQuery();
    var existingToken = (_b = (_a = existingTokenQuery.data) === null || _a === void 0 ? void 0 : _a.token) !== null && _b !== void 0 ? _b : null;
    var hasExistingToken = !!existingToken;
    var checkedExistingToken = existingTokenQuery.isFetched;
    var shouldOfferExistingToken = checkedExistingToken && hasExistingToken && !ignoredExistingToken;
    // Poll for OAuth URL
    var pollStatusQuery = trpc_1.trpc.claudeCode.pollStatus.useQuery({
        sandboxUrl: flowState.step === "waiting_url" ? flowState.sandboxUrl : "",
        sessionId: flowState.step === "waiting_url" ? flowState.sessionId : ""
    }, {
        enabled: flowState.step === "waiting_url",
        refetchInterval: 1500
    });
    // Auto-start auth on mount
    (0, solid_js_1.createEffect)(function () {
        if (!checkedExistingToken || shouldOfferExistingToken)
            return;
        if (flowState.step === "idle") {
            setFlowState({ step: "starting" });
            startAuthMutation.mutate(undefined, {
                onSuccess: function (result) {
                    setFlowState({
                        step: "waiting_url",
                        sandboxId: result.sandboxId,
                        sandboxUrl: result.sandboxUrl,
                        sessionId: result.sessionId
                    });
                },
                onError: function (err) {
                    setFlowState({
                        step: "error",
                        message: err.message || "Failed to start authentication"
                    });
                }
            });
        }
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
            // Use Electron's shell.openExternal via tRPC
            openOAuthUrlMutation.mutate(flowState.oauthUrl);
        }
    });
    // Check if the code looks like a valid Claude auth code (format: XXX#YYY)
    var isValidCodeFormat = function (code) {
        var trimmed = code.trim();
        return trimmed.length > 50 && trimmed.includes("#");
    };
    var handleConnectClick = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setUserClickedConnect(true);
                    if (!(flowState.step === "has_url")) return [3 /*break*/, 1];
                    // URL is ready, open it immediately
                    urlOpenedRef.current = true;
                    setUrlOpened(true);
                    openOAuthUrlMutation.mutate(flowState.oauthUrl);
                    return [3 /*break*/, 5];
                case 1:
                    if (!(flowState.step === "error")) return [3 /*break*/, 5];
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
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleUseExistingToken = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!hasExistingToken || isUsingExistingToken)
                        return [2 /*return*/];
                    setIsUsingExistingToken(true);
                    setExistingTokenError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, importSystemTokenMutation.mutateAsync()];
                case 2:
                    _a.sent();
                    setAnthropicOnboardingCompleted(true);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    setExistingTokenError(err_2 instanceof Error ? err_2.message : "Failed to use existing token");
                    setIsUsingExistingToken(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRejectExistingToken = function () {
        setIgnoredExistingToken(true);
        setExistingTokenError(null);
        handleConnectClick();
    };
    // Submit code - reusable for both auto-submit and manual Enter
    var submitCode = function (code) { return __awaiter(_this, void 0, void 0, function () {
        var sandboxUrl, sessionId, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!code.trim() || flowState.step !== "has_url")
                        return [2 /*return*/];
                    sandboxUrl = flowState.sandboxUrl, sessionId = flowState.sessionId;
                    setFlowState({ step: "submitting" });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, submitCodeMutation.mutateAsync({
                            sandboxUrl: sandboxUrl,
                            sessionId: sessionId,
                            code: code.trim()
                        })];
                case 2:
                    _a.sent();
                    // Success - mark onboarding as completed
                    setAnthropicOnboardingCompleted(true);
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
            // Small delay to let the UI update before submitting
            setTimeout(function () { return submitCode(value); }, 100);
        }
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && authCode.trim()) {
            submitCode(authCode);
        }
    };
    var handleOpenFallbackUrl = function () {
        if (savedOauthUrl) {
            openOAuthUrlMutation.mutate(savedOauthUrl);
        }
    };
    var isLoadingAuth = flowState.step === "starting" || flowState.step === "waiting_url";
    var isSubmitting = flowState.step === "submitting";
    return <div class="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div class="fixed top-0 left-0 right-0 h-10" style={{ WebkitAppRegion: "drag" }}/>

      {/* Back button - fixed in top left corner below traffic lights */}
      <button onClick={handleBack} class="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors">
        <lucide_solid_1.ChevronLeft class="h-5 w-5"/>
      </button>

      <div class="w-full max-w-[440px] space-y-8 px-4">
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
              Connect Claude Code
            </h1>
            <p class="text-sm text-muted-foreground">
              Connect your Claude Code subscription to get started
            </p>
          </div>
        </div>

        {/* Content */}
        <div class="space-y-6 flex flex-col items-center">
          {/* Existing token prompt */}
          {shouldOfferExistingToken && flowState.step === "idle" && <div class="space-y-4 w-full">
              <div class="p-4 bg-muted/50 border border-border rounded-lg">
                <p class="text-sm font-medium">
                  Existing Claude Code credentials found
                </p>
                {existingToken && <pre class="mt-2 px-2.5 py-2 text-xs text-foreground whitespace-pre-wrap break-words font-mono bg-background/60 rounded border border-border/60">
                    {formatTokenPreview(existingToken)}
                  </pre>}
              </div>
              {existingTokenError && <div class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p class="text-sm text-destructive">
                    {existingTokenError}
                  </p>
                </div>}
              <div class="flex w-full gap-2">
                <button onClick={handleRejectExistingToken} disabled={isUsingExistingToken} class="h-8 px-3 flex-1 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  Auth with Anthropic
                </button>
                <button onClick={handleUseExistingToken} disabled={isUsingExistingToken} class="h-8 px-3 flex-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isUsingExistingToken ? <icons_1.IconSpinner class="h-4 w-4"/> : "Use existing token"}
                </button>
              </div>
            </div>}

          {/* Connect Button - shows loader only if user clicked AND loading */}
          {checkedExistingToken && !shouldOfferExistingToken && !urlOpened && flowState.step !== "has_url" && flowState.step !== "error" && <button onClick={handleConnectClick} disabled={userClickedConnect && isLoadingAuth} class="h-8 px-4 min-w-[85px] bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {userClickedConnect && isLoadingAuth ? <icons_1.IconSpinner class="h-4 w-4"/> : "Connect"}
              </button>}

          {/* Code Input - Show after URL is opened, if has_url (after redirect), or if submitting */}
          {/* No Continue button - auto-submit on valid code paste */}
          {(urlOpened || flowState.step === "has_url" || flowState.step === "submitting") && <div class="space-y-4">
              <div class="relative">
                <input_1.Input value={authCode} onChange={handleCodeChange} onKeyDown={handleKeyDown} placeholder="Paste your authentication code here..." class="font-mono text-center pr-10" autoFocus disabled={isSubmitting}/>
                {isSubmitting && <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <icons_1.IconSpinner class="h-4 w-4"/>
                  </div>}
              </div>
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
              <button onClick={handleConnectClick} class="w-full h-8 px-3 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] flex items-center justify-center">
                Try Again
              </button>
            </div>}

        </div>
      </div>
    </div>;
}
