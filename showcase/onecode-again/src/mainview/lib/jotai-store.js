"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appStore = void 0;
var jotai_1 = require("./state/jotai");
// Shared Jotai store - used by Provider and for reading atoms outside React
exports.appStore = (0, jotai_1.createStore)();
