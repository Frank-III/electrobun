"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
var core_1 = require("@kobalte/core");
function useTheme() {
    var _a = (0, core_1.useColorMode)(), colorMode = _a.colorMode, setColorMode = _a.setColorMode;
    return {
        resolvedTheme: colorMode,
        setTheme: function (value) { return setColorMode(value); },
    };
}
