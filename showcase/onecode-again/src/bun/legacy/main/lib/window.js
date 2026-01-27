"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bringToFront = bringToFront;
var electron_1 = require("electron");
function bringToFront(win) {
    var w = win !== null && win !== void 0 ? win : electron_1.BrowserWindow.getAllWindows().find(function (x) { return !x.isDestroyed(); });
    if (!w || w.isDestroyed())
        return;
    // If you hide to tray / not visible, focus() alone won't show it
    if (!w.isVisible())
        w.show();
    if (w.isMinimized())
        w.restore();
    // Helps on macOS (activates the app)
    if (process.platform === "darwin") {
        electron_1.app.focus({ steal: true });
    }
    // Normal attempt
    w.focus();
    // Windows sometimes ignores focus; this "topmost blip" often works
    if (process.platform === "win32") {
        w.setAlwaysOnTop(true);
        setTimeout(function () { return w.setAlwaysOnTop(false); }, 200);
    }
}
