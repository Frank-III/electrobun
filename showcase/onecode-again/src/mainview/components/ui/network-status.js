"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkStatus = NetworkStatus;
var jotai_1 = require("../../lib/state/jotai");
var atoms_1 = require("../../lib/atoms");
var trpc_1 = require("../../lib/trpc");
var LightningIcon = function (_a) {
    var className = _a.className;
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class={className}>
    <path d="M9.06444 2C8.49628 2 7.97688 2.321 7.72279 2.82918L3.22279 11.8292C2.72412 12.8265 3.44936 14 4.56443 14H7.62982L5.62308 20.1874C5.15109 21.6427 6.90506 22.7879 8.04755 21.7703L21.6899 9.62015C22.7193 8.70329 22.0708 7 20.6922 7H16.7716L18.4086 4.27174C19.0084 3.27196 18.2883 2 17.1223 2H9.06444Z" fill="currentColor"/>
  </svg>;
};
function NetworkStatus() {
    var _a;
    var showOfflineFeatures = (0, jotai_1.useAtomValue)(atoms_1.showOfflineModeFeaturesAtom);
    var data = trpc_1.trpc.ollama.getStatus.useQuery(undefined, {
        refetchInterval: showOfflineFeatures ? 3e4 : false,
        enabled: showOfflineFeatures
    }).data;
    var online = (_a = data === null || data === void 0 ? void 0 : data.internet.online) !== null && _a !== void 0 ? _a : true;
    // Don't show anything when online or when offline features are disabled
    if (online || !showOfflineFeatures) {
        return null;
    }
    return <div class="flex items-center gap-1.5">
      <LightningIcon class="w-3 h-3 text-orange-500"/>
      <span class="text-xs text-muted-foreground">
        Offline
      </span>
    </div>;
}
