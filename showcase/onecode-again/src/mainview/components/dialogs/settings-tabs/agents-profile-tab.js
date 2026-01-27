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
exports.AgentsProfileTab = AgentsProfileTab;
var solid_js_1 = require("solid-js");
var button_1 = require("../../ui/button");
var input_1 = require("../../ui/input");
var label_1 = require("../../ui/label");
var icons_1 = require("../../../icons");
var solid_sonner_1 = require("solid-sonner");
// Hook to detect narrow screen
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
function AgentsProfileTab() {
    var _this = this;
    var _a = (0, solid_js_1.createSignal)(null), user = _a[0], setUser = _a[1];
    var _b = (0, solid_js_1.createSignal)(""), fullName = _b[0], setFullName = _b[1];
    var _c = (0, solid_js_1.createSignal)(false), isSaving = _c[0], setIsSaving = _c[1];
    var _d = (0, solid_js_1.createSignal)(true), isLoading = _d[0], setIsLoading = _d[1];
    var isNarrowScreen = useIsNarrowScreen();
    // Fetch real user data from desktop API
    (0, solid_js_1.createEffect)(function () {
        function fetchUser() {
            return __awaiter(this, void 0, void 0, function () {
                var userData;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.getUser)) return [3 /*break*/, 2];
                            return [4 /*yield*/, window.desktopApi.getUser()];
                        case 1:
                            userData = _b.sent();
                            setUser(userData);
                            setFullName((userData === null || userData === void 0 ? void 0 : userData.name) || "");
                            _b.label = 2;
                        case 2:
                            setIsLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }
        fetchUser();
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var updatedUser, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsSaving(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    if (!((_a = window.desktopApi) === null || _a === void 0 ? void 0 : _a.updateUser)) return [3 /*break*/, 3];
                    return [4 /*yield*/, window.desktopApi.updateUser({ name: fullName })];
                case 2:
                    updatedUser = _b.sent();
                    if (updatedUser) {
                        setUser(updatedUser);
                        solid_sonner_1.toast.success("Profile updated successfully");
                    }
                    return [3 /*break*/, 4];
                case 3: throw new Error("Desktop API not available");
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    console.error("Error updating profile:", error_1);
                    solid_sonner_1.toast.error(error_1 instanceof Error ? error_1.message : "Failed to update profile");
                    return [3 /*break*/, 7];
                case 6:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return <div class="flex items-center justify-center h-full">
        <icons_1.IconSpinner class="h-6 w-6"/>
      </div>;
    }
    return <div class="p-6 space-y-6">
      {/* Profile Settings Card */}
      <div class="space-y-2">
        {/* Header - hidden on narrow screens since it's in the navigation bar */}
        {!isNarrowScreen && <div class="flex items-center justify-between pb-3 mb-4">
            <h3 class="text-sm font-medium text-foreground">Account</h3>
          </div>}
        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 space-y-6">
            {/* Full Name Field */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label_1.Label class="text-sm font-medium">Full Name</label_1.Label>
                <p class="text-sm text-muted-foreground">
                  This is your display name
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <input_1.Input value={fullName} onChange={function (e) { return setFullName(e.target.value); }} class="w-full" placeholder="Enter your name"/>
              </div>
            </div>

            {/* Email Field (read-only) */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <label_1.Label class="text-sm font-medium">Email</label_1.Label>
                <p class="text-sm text-muted-foreground">
                  Your account email
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <input_1.Input value={(user === null || user === void 0 ? void 0 : user.email) || ""} disabled class="w-full opacity-60"/>
              </div>
            </div>
          </div>

          {/* Save Button Footer */}
          <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-3 border-t">
            <button_1.Button onClick={handleSave} disabled={isSaving} size="sm" class="text-xs">
              <div class="flex items-center justify-center gap-2">
                {isSaving && <icons_1.IconSpinner class="h-3.5 w-3.5 text-current"/>}
                Save
              </div>
            </button_1.Button>
          </div>
        </div>
      </div>

    </div>;
}
