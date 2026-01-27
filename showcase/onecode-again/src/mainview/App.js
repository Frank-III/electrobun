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
exports.App = App;
var jotai_1 = require("./lib/state/jotai");
var core_1 = require("@kobalte/core");
var solid_js_1 = require("solid-js");
var sonner_1 = require("./components/ui/sonner");
var tooltip_1 = require("./components/ui/tooltip");
var TRPCProvider_1 = require("./contexts/TRPCProvider");
var WindowContext_1 = require("./contexts/WindowContext");
var atoms_1 = require("./features/agents/atoms");
var sub_chat_store_1 = require("./features/agents/stores/sub-chat-store");
var agents_layout_1 = require("./features/layout/agents-layout");
var onboarding_1 = require("./features/onboarding");
var analytics_1 = require("./lib/analytics");
var atoms_2 = require("./lib/atoms");
var jotai_store_1 = require("./lib/jotai-store");
var theme_provider_1 = require("./lib/themes/theme-provider");
var trpc_1 = require("./lib/trpc");
/**
* Custom Toaster that adapts to theme
*/
function ThemedToaster() {
    var colorMode = (0, core_1.useColorMode)().colorMode;
    return <sonner_1.Toaster position="bottom-right" theme={colorMode()} closeButton/>;
}
/**
* Main content router - decides which page to show based on onboarding state
*/
function AppContent() {
    var billingMethod = (0, jotai_1.useAtomValue)(atoms_2.billingMethodAtom);
    var setBillingMethod = (0, jotai_1.useSetAtom)(atoms_2.billingMethodAtom);
    var anthropicOnboardingCompleted = (0, jotai_1.useAtomValue)(atoms_2.anthropicOnboardingCompletedAtom);
    var setAnthropicOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_2.anthropicOnboardingCompletedAtom);
    var apiKeyOnboardingCompleted = (0, jotai_1.useAtomValue)(atoms_2.apiKeyOnboardingCompletedAtom);
    var setApiKeyOnboardingCompleted = (0, jotai_1.useSetAtom)(atoms_2.apiKeyOnboardingCompletedAtom);
    var selectedProject = (0, jotai_1.useAtomValue)(atoms_1.selectedProjectAtom);
    var setSelectedChatId = (0, jotai_1.useSetAtom)(atoms_1.selectedAgentChatIdAtom);
    var _a = (0, sub_chat_store_1.useAgentSubChatStore)(), setActiveSubChat = _a.setActiveSubChat, addToOpenSubChats = _a.addToOpenSubChats, setChatId = _a.setChatId;
    // Apply initial window params (chatId/subChatId) when opening via "Open in new window"
    (0, solid_js_1.createEffect)(function () {
        var params = (0, WindowContext_1.getInitialWindowParams)();
        if (params.chatId) {
            console.log("[App] Opening chat from window params:", params.chatId, params.subChatId);
            setSelectedChatId(params.chatId);
            setChatId(params.chatId);
            if (params.subChatId) {
                addToOpenSubChats(params.subChatId);
                setActiveSubChat(params.subChatId);
            }
        }
    }, [
        setSelectedChatId,
        setChatId,
        addToOpenSubChats,
        setActiveSubChat
    ]);
    // Check if user has existing CLI config (API key or proxy)
    // Based on PR #29 by @sa4hnd
    var _b = trpc_1.trpc.claudeCode.hasExistingCliConfig.useQuery(), cliConfig = _b.data, isLoadingCliConfig = _b.isLoading;
    // Migration: If user already completed Anthropic onboarding but has no billing method set,
    // automatically set it to "claude-subscription" (legacy users before billing method was added)
    (0, solid_js_1.createEffect)(function () {
        if (!billingMethod() && anthropicOnboardingCompleted()) {
            setBillingMethod("claude-subscription");
        }
    });
    // Auto-skip onboarding if user has existing CLI config (API key or proxy)
    // This allows users with ANTHROPIC_API_KEY to use the app without OAuth
    (0, solid_js_1.createEffect)(function () {
        if ((cliConfig === null || cliConfig === void 0 ? void 0 : cliConfig.hasConfig) && !billingMethod()) {
            console.log("[App] Detected existing CLI config, auto-completing onboarding");
            setBillingMethod("api-key");
            setApiKeyOnboardingCompleted(true);
        }
    });
    // Fetch projects to validate selectedProject exists
    var _c = trpc_1.trpc.projects.list.useQuery(), projects = _c.data, isLoadingProjects = _c.isLoading;
    // Validated project - only valid if exists in DB
    var validatedProject = (0, solid_js_1.createMemo)(function () {
        if (!selectedProject())
            return null;
        // While loading, trust localStorage value to prevent flicker
        if (isLoadingProjects)
            return selectedProject();
        // After loading, validate against DB
        if (!projects)
            return null;
        var current = selectedProject();
        if (!current)
            return null;
        var exists = projects.some(function (p) { return p.id === current.id; });
        return exists ? current : null;
    });
    // Determine which page to show:
    // 1. No billing method selected -> BillingMethodPage
    // 2. Claude subscription selected but not completed -> AnthropicOnboardingPage
    // 3. API key or custom model selected but not completed -> ApiKeyOnboardingPage
    // 4. No valid project selected -> SelectRepoPage
    // 5. Otherwise -> AgentsLayout
    if (!billingMethod()) {
        return <onboarding_1.BillingMethodPage />;
    }
    if (billingMethod() === "claude-subscription" && !anthropicOnboardingCompleted()) {
        return <onboarding_1.AnthropicOnboardingPage />;
    }
    if ((billingMethod() === "api-key" || billingMethod() === "custom-model") && !apiKeyOnboardingCompleted()) {
        return <onboarding_1.ApiKeyOnboardingPage />;
    }
    if (!validatedProject() && !isLoadingProjects) {
        return <onboarding_1.SelectRepoPage />;
    }
    return <agents_layout_1.AgentsLayout />;
}
function App() {
    var _this = this;
    // Initialize analytics on mount
    (0, solid_js_1.createEffect)(function () {
        (0, analytics_1.initAnalytics)();
        // Sync analytics opt-out status to main process
        var syncOptOutStatus = function () { return __awaiter(_this, void 0, void 0, function () {
            var optOut, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        optOut = localStorage.getItem("preferences:analytics-opt-out") === "true";
                        return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.setAnalyticsOptOut(optOut))];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.warn("[Analytics] Failed to sync opt-out status:", error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        syncOptOutStatus();
        // Identify user if already authenticated
        var identifyUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var user, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getUser())];
                    case 1:
                        user = _b.sent();
                        if (user === null || user === void 0 ? void 0 : user.id) {
                            (0, analytics_1.identify)(user.id, {
                                email: user.email,
                                name: user.name
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.warn("[Analytics] Failed to identify user:", error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        identifyUser();
        // Cleanup on unmount
        return function () {
            (0, analytics_1.shutdown)();
        };
    }, []);
    return <WindowContext_1.WindowProvider>
      <core_1.ColorModeScript initialColorMode="system"/>
      <core_1.ColorModeProvider initialColorMode="system">
        <jotai_1.Provider store={jotai_store_1.appStore}>
          <theme_provider_1.VSCodeThemeProvider>
            <tooltip_1.TooltipProvider delayDuration={100}>
              <TRPCProvider_1.TRPCProvider>
                <div data-agents-page class="h-screen w-screen bg-background text-foreground overflow-hidden">
                  <AppContent />
                </div>
                <ThemedToaster />
              </TRPCProvider_1.TRPCProvider>
            </tooltip_1.TooltipProvider>
          </theme_provider_1.VSCodeThemeProvider>
        </jotai_1.Provider>
      </core_1.ColorModeProvider>
    </WindowContext_1.WindowProvider>;
}
