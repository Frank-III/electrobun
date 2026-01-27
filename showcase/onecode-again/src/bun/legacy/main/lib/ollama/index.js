"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOllamaConfig = exports.checkOllamaStatus = exports.clearNetworkCache = exports.checkInternetConnection = void 0;
var network_detector_1 = require("./network-detector");
Object.defineProperty(exports, "checkInternetConnection", { enumerable: true, get: function () { return network_detector_1.checkInternetConnection; } });
Object.defineProperty(exports, "clearNetworkCache", { enumerable: true, get: function () { return network_detector_1.clearNetworkCache; } });
var detector_1 = require("./detector");
Object.defineProperty(exports, "checkOllamaStatus", { enumerable: true, get: function () { return detector_1.checkOllamaStatus; } });
Object.defineProperty(exports, "getOllamaConfig", { enumerable: true, get: function () { return detector_1.getOllamaConfig; } });
