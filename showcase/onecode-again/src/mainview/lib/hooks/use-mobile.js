"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsMobile = useIsMobile;
var React = require("solid-js");
// Breakpoint for narrow/mobile layout in desktop app
var NARROW_BREAKPOINT = 600;
function useIsMobile() {
    var _a = React.useState(function () {
        // Initialize immediately in Electron (no SSR concerns)
        return typeof window !== "undefined" && window.innerWidth < NARROW_BREAKPOINT;
    }), isMobile = _a[0], setIsMobile = _a[1];
    React.useEffect(function () {
        var mql = window.matchMedia("(max-width: ".concat(NARROW_BREAKPOINT - 1, "px)"));
        var onChange = function () {
            setIsMobile(window.innerWidth < NARROW_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < NARROW_BREAKPOINT);
        return function () { return mql.removeEventListener("change", onChange); };
    }, []);
    return isMobile;
}
