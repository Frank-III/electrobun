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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAgentsFileUpload = useAgentsFileUpload;
// File upload hook for desktop app with base64 conversion for Claude API
var react_1 = require("react");
/**
 * Convert a blob URL to base64 data
 */
function blobUrlToBase64(blobUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var response, blob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(blobUrl)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.blob()];
                case 2:
                    blob = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var result = reader.result;
                                // Remove the data:image/xxx;base64, prefix
                                var base64 = result.split(",")[1];
                                resolve(base64 || "");
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        })];
            }
        });
    });
}
/**
 * Convert a File to base64 data
 */
function fileToBase64(file) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var result = reader.result;
                        // Remove the data:image/xxx;base64, prefix
                        var base64 = result.split(",")[1];
                        resolve(base64 || "");
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                })];
        });
    });
}
function useAgentsFileUpload() {
    var _this = this;
    var _a = (0, react_1.useState)([]), images = _a[0], setImages = _a[1];
    var _b = (0, react_1.useState)([]), files = _b[0], setFiles = _b[1];
    var _c = (0, react_1.useState)(false), isUploading = _c[0], setIsUploading = _c[1];
    var handleAddAttachments = (0, react_1.useCallback)(function (inputFiles) { return __awaiter(_this, void 0, void 0, function () {
        var imageFiles, otherFiles, newImages, newFiles;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsUploading(true);
                    imageFiles = inputFiles.filter(function (f) { return f.type.startsWith("image/"); });
                    otherFiles = inputFiles.filter(function (f) { return !f.type.startsWith("image/"); });
                    return [4 /*yield*/, Promise.all(imageFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var id, filename, mediaType, url, base64Data, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        id = crypto.randomUUID();
                                        filename = file.name || "screenshot-".concat(Date.now(), ".png");
                                        mediaType = file.type || "image/png";
                                        url = URL.createObjectURL(file);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fileToBase64(file)];
                                    case 2:
                                        base64Data = _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _a.sent();
                                        console.error("[useAgentsFileUpload] Failed to convert image to base64:", err_1);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/, {
                                            id: id,
                                            filename: filename,
                                            url: url,
                                            base64Data: base64Data,
                                            isLoading: false,
                                            mediaType: mediaType,
                                        }];
                                }
                            });
                        }); }))];
                case 1:
                    newImages = _a.sent();
                    newFiles = otherFiles.map(function (file) { return ({
                        id: crypto.randomUUID(),
                        filename: file.name,
                        url: URL.createObjectURL(file),
                        isLoading: false,
                        size: file.size,
                        type: file.type,
                    }); });
                    setImages(function (prev) { return __spreadArray(__spreadArray([], prev, true), newImages, true); });
                    setFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), newFiles, true); });
                    setIsUploading(false);
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var removeImage = (0, react_1.useCallback)(function (id) {
        setImages(function (prev) { return prev.filter(function (img) { return img.id !== id; }); });
    }, []);
    var removeFile = (0, react_1.useCallback)(function (id) {
        setFiles(function (prev) { return prev.filter(function (f) { return f.id !== id; }); });
    }, []);
    var clearImages = (0, react_1.useCallback)(function () {
        setImages([]);
    }, []);
    var clearFiles = (0, react_1.useCallback)(function () {
        setFiles([]);
    }, []);
    var clearAll = (0, react_1.useCallback)(function () {
        setImages([]);
        setFiles([]);
    }, []);
    // Direct state setters for restoring from draft
    var setImagesFromDraft = (0, react_1.useCallback)(function (draftImages) {
        setImages(draftImages);
    }, []);
    var setFilesFromDraft = (0, react_1.useCallback)(function (draftFiles) {
        setFiles(draftFiles);
    }, []);
    return {
        images: images,
        files: files,
        handleAddAttachments: handleAddAttachments,
        removeImage: removeImage,
        removeFile: removeFile,
        clearImages: clearImages,
        clearFiles: clearFiles,
        clearAll: clearAll,
        isUploading: isUploading,
        setImagesFromDraft: setImagesFromDraft,
        setFilesFromDraft: setFilesFromDraft,
    };
}
