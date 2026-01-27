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
exports.CraftOAuth = void 0;
exports.fetchOAuthMetadata = fetchOAuthMetadata;
exports.generatePKCE = generatePKCE;
exports.generateState = generateState;
exports.getMcpBaseUrl = getMcpBaseUrl;
var crypto_1 = require("crypto");
var bun_1 = require("electrobun/bun");
var http_1 = require("http");
var url_1 = require("url");
/**
 * Fetch OAuth metadata from server's well-known endpoint
 * Returns null if server doesn't support OAuth
 */
function fetchOAuthMetadata(mcpBaseUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var origin_1, metadataUrl, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    origin_1 = new url_1.URL(mcpBaseUrl).origin;
                    metadataUrl = "".concat(origin_1, "/.well-known/oauth-authorization-server");
                    return [4 /*yield*/, fetch(metadataUrl)];
                case 1:
                    response = _b.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [2 /*return*/, null];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var CALLBACK_PORT = 8914;
var CALLBACK_PATH = '/callback';
// Client names for OAuth registration
// Some MCP servers (like Figma) have an allowlist - try '1code' first, fall back to 'Codex'
var CLIENT_NAME = '1code';
var FALLBACK_CLIENT_NAME = 'Codex';
/**
 * Generate a styled OAuth callback page with terminal emulator aesthetic
 * Matches application design with Tokyo Night theme
 */
function generateOAuthPage(options) {
    var title = options.title, isSuccess = options.isSuccess, _a = options.autoClose, autoClose = _a === void 0 ? false : _a, errorDetail = options.errorDetail;
    // Terminal output lines based on success/error
    var terminalLines = isSuccess
        ? [
            { text: 'initiating handshake sequence...' },
            { text: 'verifying credentials', status: '[PROCESSING]', statusClass: 'status-wait' },
            { text: 'token exchange completed', status: '[OK]', statusClass: 'status-ok' },
            { text: 'AUTHORIZATION SUCCESSFUL', isHighlight: true, highlightColor: 'green' },
            { text: 'closing connection', hasCursor: true },
        ]
        : __spreadArray([
            { text: 'initiating handshake sequence...' },
            { text: 'verifying credentials', status: '[PROCESSING]', statusClass: 'status-wait' },
            { text: 'token exchange failed', status: '[ERROR]', statusClass: 'status-error' },
            { text: 'AUTHORIZATION FAILED', isHighlight: true, highlightColor: 'red' }
        ], (errorDetail ? [{ text: "error: ".concat(errorDetail), isError: true }] : []), true);
    var terminalLinesHtml = terminalLines.map(function (line, i) {
        var content = '';
        if (line.isHighlight) {
            var color = line.highlightColor === 'green' ? 'var(--green)' : 'var(--red)';
            var glow = line.highlightColor === 'green'
                ? 'rgba(158, 206, 106, 0.4)'
                : 'rgba(247, 118, 142, 0.4)';
            content = "<span class=\"cmd-text\" style=\"color: ".concat(color, "; text-shadow: 0 0 10px ").concat(glow, ";\">").concat(line.text, "</span>");
        }
        else if (line.isError) {
            content = "<span class=\"cmd-text\" style=\"color: var(--red);\">".concat(line.text, "</span>");
        }
        else {
            content = "<span class=\"cmd-text\">".concat(line.text).concat(line.status ? " <span class=\"".concat(line.statusClass, "\">").concat(line.status, "</span>") : '').concat(line.hasCursor ? ' <span class="cursor"></span>' : '', "</span>");
        }
        return "        <div class=\"line\" style=\"animation-delay: ".concat(0.2 + i * 0.4, "s;\">\n          <span class=\"prompt\">\u279C</span>\n          <span class=\"path\">~</span>\n          ").concat(content, "\n        </div>");
    }).join('\n');
    var progressSection = autoClose ? "\n      <div class=\"progress-section\">\n        <div class=\"timer-info\">\n          <span>Session Autokill</span>\n          <span id=\"countdown-text\">3.0s</span>\n        </div>\n        <div class=\"progress-bar\">\n          <div class=\"progress-fill\" id=\"progress-fill\"></div>\n        </div>\n      </div>" : '';
    var autoCloseScript = autoClose ? "\n    // Countdown Logic\n    setTimeout(() => {\n      const duration = 3000;\n      const start = Date.now();\n      const progressFill = document.getElementById('progress-fill');\n      const countdownText = document.getElementById('countdown-text');\n\n      const tick = () => {\n        const elapsed = Date.now() - start;\n        const remaining = Math.max(0, duration - elapsed);\n        const percent = Math.min(100, (elapsed / duration) * 100);\n\n        if(progressFill) progressFill.style.width = percent + '%';\n        if(countdownText) countdownText.textContent = (remaining / 1000).toFixed(1) + 's';\n\n        if (elapsed < duration) {\n          requestAnimationFrame(tick);\n        } else {\n          window.close();\n        }\n      };\n\n      requestAnimationFrame(tick);\n    }, 2200);" : '';
    var logoColor = isSuccess ? 'var(--blue)' : 'var(--red)';
    var logoGlow = isSuccess
        ? 'rgba(122, 162, 247, 0.3)'
        : 'rgba(247, 118, 142, 0.3)';
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Craft - ".concat(title, "</title>\n  <style>\n    :root {\n      /* Tokyo Night Palette */\n      --bg: #1a1b26;\n      --bg-dark: #16161e;\n      --bg-lighter: #24283b;\n      --fg: #c0caf5;\n      --comment: #565f89;\n      --blue: #7aa2f7;\n      --cyan: #7dcfff;\n      --green: #9ece6a;\n      --magenta: #bb9af7;\n      --red: #f7768e;\n      --yellow: #e0af68;\n      --orange: #ff9e64;\n      --terminal-black: #414868;\n    }\n\n    * { box-sizing: border-box; }\n\n    body {\n      margin: 0;\n      padding: 0;\n      width: 100vw;\n      height: 100vh;\n      background-color: var(--bg);\n      color: var(--fg);\n      font-family: ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      overflow: hidden;\n      position: relative;\n    }\n\n    /* CRT Scanline Effect */\n    body::before {\n      content: \"\";\n      position: absolute;\n      top: 0; left: 0; right: 0; bottom: 0;\n      background: linear-gradient(\n        to bottom,\n        rgba(18, 16, 16, 0) 50%,\n        rgba(0, 0, 0, 0.25) 50%\n      );\n      background-size: 100% 4px;\n      z-index: 20;\n      pointer-events: none;\n      opacity: 0.15;\n    }\n\n    /* CRT Flicker */\n    @keyframes flicker {\n      0% { opacity: 0.98; }\n      5% { opacity: 0.95; }\n      10% { opacity: 0.98; }\n      100% { opacity: 0.98; }\n    }\n\n    .terminal-window {\n      width: 90%;\n      max-width: 850px;\n      height: 70vh;\n      min-height: 500px;\n      background: rgba(22, 22, 30, 0.95);\n      border: 1px solid var(--terminal-black);\n      box-shadow:\n        0 0 40px rgba(0, 0, 0, 0.6),\n        0 0 10px rgba(0, 0, 0, 0.4),\n        0 0 0 1px rgba(122, 162, 247, 0.05);\n      border-radius: 6px;\n      position: relative;\n      z-index: 10;\n      display: flex;\n      flex-direction: column;\n      animation: bootUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);\n      overflow: hidden;\n      backdrop-filter: blur(4px);\n    }\n\n    .title-bar {\n      background: var(--bg-lighter);\n      border-bottom: 1px solid var(--terminal-black);\n      padding: 10px 16px;\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      user-select: none;\n    }\n\n    .title-text {\n      color: var(--comment);\n      font-size: 12px;\n      font-weight: 600;\n      letter-spacing: 0.5px;\n      display: flex;\n      align-items: center;\n      gap: 8px;\n    }\n\n    .window-controls {\n      display: flex;\n      gap: 8px;\n    }\n\n    .control {\n      width: 12px;\n      height: 12px;\n      border-radius: 50%;\n      position: relative;\n    }\n    .control.close { background: var(--red); }\n    .control.minimize { background: var(--yellow); }\n    .control.maximize { background: var(--green); }\n\n    .content {\n      padding: 30px;\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      position: relative;\n      overflow-y: auto;\n      animation: flicker 4s infinite;\n    }\n\n    .meta-info {\n      width: 100%;\n      text-align: left;\n      font-size: 12px;\n      color: var(--comment);\n      margin-bottom: 30px;\n      border-bottom: 1px dashed var(--terminal-black);\n      padding-bottom: 15px;\n      opacity: 0.8;\n    }\n\n    .logo-container {\n      margin-bottom: 30px;\n      width: 100%;\n      display: flex;\n      justify-content: center;\n      overflow-x: auto;\n      padding-bottom: 10px;\n    }\n\n    .logo {\n      color: ").concat(logoColor, ";\n      font-weight: 700;\n      font-size: 12px;\n      line-height: 1;\n      white-space: pre;\n      text-align: left;\n      text-shadow: 0 0 15px ").concat(logoGlow, ";\n      letter-spacing: normal;\n    }\n\n    .terminal-output {\n      width: 100%;\n      max-width: 600px;\n      text-align: left;\n      font-size: 14px;\n      line-height: 1.8;\n    }\n\n    .line {\n      display: flex;\n      gap: 12px;\n      margin-bottom: 6px;\n      opacity: 0;\n      animation: typeLine 0.1s forwards;\n    }\n\n    .prompt { color: var(--magenta); font-weight: bold; }\n    .path { color: var(--blue); }\n    .cmd-text { color: var(--fg); text-shadow: 0 0 2px rgba(192, 202, 245, 0.2); }\n\n    .status-ok { color: var(--green); font-weight: bold; }\n    .status-wait { color: var(--yellow); }\n    .status-error { color: var(--red); font-weight: bold; }\n    .highlight { color: var(--cyan); }\n\n    .cursor {\n      display: inline-block;\n      width: 8px;\n      height: 1.2em;\n      background: var(--fg);\n      vertical-align: sub;\n      margin-left: 8px;\n      opacity: 0;\n    }\n\n    .line:last-child .cursor {\n      animation: blink 1s step-end infinite, appear 0.1s forwards 2.2s;\n    }\n\n    .progress-section {\n      margin-top: 40px;\n      width: 100%;\n      max-width: 450px;\n      opacity: 0;\n      animation: fadeIn 0.5s forwards 2.0s;\n    }\n\n    .progress-bar {\n      height: 2px;\n      background: var(--bg-lighter);\n      margin-top: 10px;\n      position: relative;\n    }\n\n    .progress-fill {\n      height: 100%;\n      width: 0%;\n      background: var(--green);\n      box-shadow: 0 0 15px var(--green);\n    }\n\n    .timer-info {\n      display: flex;\n      justify-content: space-between;\n      font-size: 11px;\n      color: var(--comment);\n      text-transform: uppercase;\n      letter-spacing: 1px;\n    }\n\n    /* Mobile Responsive Styles */\n    @media (max-width: 640px) {\n      body {\n        align-items: flex-start;\n        padding-top: 0;\n        background: var(--bg-dark);\n      }\n\n      .terminal-window {\n        width: 100%;\n        height: 100vh;\n        max-width: none;\n        border-radius: 0;\n        border: none;\n        box-shadow: none;\n      }\n\n      .title-bar {\n        padding: 12px 15px;\n      }\n\n      .content {\n        padding: 20px 15px;\n        justify-content: flex-start;\n      }\n\n      .logo {\n        font-size: 2.2vw;\n        align-self: center;\n      }\n\n      @media (max-width: 400px) {\n        .logo { font-size: 1.9vw; }\n      }\n\n      .terminal-output {\n        font-size: 12px;\n        margin-top: 20px;\n      }\n\n      .meta-info {\n        margin-bottom: 20px;\n        font-size: 10px;\n      }\n    }\n\n    @keyframes bootUp {\n      from { opacity: 0; transform: scale(0.98); }\n      to { opacity: 1; transform: scale(1); }\n    }\n\n    @keyframes typeLine {\n      from { opacity: 0; transform: translateX(-4px); }\n      to { opacity: 1; transform: translateX(0); }\n    }\n\n    @keyframes blink {\n      0%, 100% { opacity: 1; }\n      50% { opacity: 0; }\n    }\n\n    @keyframes appear { to { opacity: 1; } }\n    @keyframes fadeIn { to { opacity: 1; } }\n\n  </style>\n</head>\n<body>\n  <div class=\"terminal-window\">\n    <div class=\"title-bar\">\n      <div class=\"window-controls\">\n        <div class=\"control close\"></div>\n        <div class=\"control minimize\"></div>\n        <div class=\"control maximize\"></div>\n      </div>\n      <div class=\"title-text\">\n        user@craft-auth-cli ~\n      </div>\n      <div style=\"width: 48px;\"></div>\n    </div>\n\n    <div class=\"content\">\n      <div class=\"meta-info\">\n        Last login: <span id=\"login-time\">...</span> on ttys003\n      </div>\n\n      <div class=\"logo-container\">\n<pre class=\"logo\"></pre>\n      </div>\n\n      <div class=\"terminal-output\">\n").concat(terminalLinesHtml, "\n      </div>\n").concat(progressSection, "\n    </div>\n  </div>\n\n  <script>\n    // Set Login Time\n    const now = new Date();\n    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];\n    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\n    const timeString = days[now.getDay()] + ' ' + months[now.getMonth()] + ' ' + now.getDate() + ' ' + now.toTimeString().split(' ')[0];\n    document.getElementById('login-time').textContent = timeString;\n").concat(autoCloseScript, "\n  </script>\n</body>\n</html>");
}
// Generate PKCE code verifier and challenge
function generatePKCE() {
    var verifier = (0, crypto_1.randomBytes)(32).toString('base64url');
    var challenge = (0, crypto_1.createHash)('sha256').update(verifier).digest('base64url');
    return { verifier: verifier, challenge: challenge };
}
// Generate random state for CSRF protection
function generateState() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
var CraftOAuth = /** @class */ (function () {
    function CraftOAuth(config, callbacks) {
        this.server = null;
        this.config = config;
        this.callbacks = callbacks;
    }
    // Get OAuth server metadata
    CraftOAuth.prototype.getServerMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadataUrl, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metadataUrl = "".concat(this.config.mcpBaseUrl, "/.well-known/oauth-authorization-server");
                        return [4 /*yield*/, fetch(metadataUrl)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to get OAuth metadata: ".concat(response.status));
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    // Register OAuth client dynamically
    CraftOAuth.prototype.registerClient = function (registrationEndpoint, clientName) {
        return __awaiter(this, void 0, void 0, function () {
            var redirectUri, response, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        redirectUri = this.config.redirectUri || "http://localhost:".concat(CALLBACK_PORT).concat(CALLBACK_PATH);
                        return [4 /*yield*/, fetch(registrationEndpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    client_name: clientName,
                                    redirect_uris: [redirectUri],
                                    grant_types: ['authorization_code', 'refresh_token'],
                                    response_types: ['code'],
                                    token_endpoint_auth_method: 'none', // Public client
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _a.sent();
                        throw new Error("Failed to register OAuth client: ".concat(error));
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        });
    };
    // Exchange authorization code for tokens
    CraftOAuth.prototype.exchangeCodeForTokens = function (tokenEndpoint, code, codeVerifier, clientId, redirectUri, clientSecret) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, params, response, error, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = redirectUri || this.config.redirectUri || "http://localhost:".concat(CALLBACK_PORT).concat(CALLBACK_PATH);
                        params = new URLSearchParams({
                            grant_type: 'authorization_code',
                            code: code,
                            redirect_uri: uri,
                            client_id: clientId,
                            code_verifier: codeVerifier,
                        });
                        // Add client_secret if provided (some servers require it)
                        if (clientSecret) {
                            params.set('client_secret', clientSecret);
                        }
                        return [4 /*yield*/, fetch(tokenEndpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: params.toString(),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _a.sent();
                        throw new Error("Failed to exchange code for tokens: ".concat(error));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        return [2 /*return*/, {
                                accessToken: data.access_token,
                                refreshToken: data.refresh_token,
                                expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
                                tokenType: data.token_type || 'Bearer',
                            }];
                }
            });
        });
    };
    // Refresh access token
    CraftOAuth.prototype.refreshAccessToken = function (refreshToken, clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, params, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getServerMetadata()];
                    case 1:
                        metadata = _a.sent();
                        params = new URLSearchParams({
                            grant_type: 'refresh_token',
                            refresh_token: refreshToken,
                            client_id: clientId,
                        });
                        return [4 /*yield*/, fetch(metadata.token_endpoint, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: params.toString(),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Failed to refresh token');
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, {
                                accessToken: data.access_token,
                                refreshToken: data.refresh_token || refreshToken,
                                expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
                                tokenType: data.token_type || 'Bearer',
                            }];
                }
            });
        });
    };
    // Check if the MCP server requires OAuth
    CraftOAuth.prototype.checkAuthRequired = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadataUrl, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metadataUrl = "".concat(this.config.mcpBaseUrl, "/.well-known/oauth-authorization-server");
                        this.callbacks.onStatus('Checking if authentication is required...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(metadataUrl)];
                    case 2:
                        response = _a.sent();
                        if (response.ok) {
                            this.callbacks.onStatus('OAuth required - server has OAuth metadata');
                            return [2 /*return*/, true];
                        }
                        // 404 or other error means no OAuth
                        this.callbacks.onStatus('No OAuth metadata found - server may be public');
                        return [2 /*return*/, false];
                    case 3:
                        error_1 = _a.sent();
                        this.callbacks.onStatus('Could not reach OAuth metadata - assuming public');
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Start the OAuth flow
    CraftOAuth.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, error_2, msg, clientId, client, error_3, client, fallbackError_1, msg, pkce, state, redirectUri, authUrl, codePromise, authCode, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.callbacks.onStatus('Fetching OAuth server configuration...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getServerMetadata()];
                    case 2:
                        metadata = _a.sent();
                        this.callbacks.onStatus("Found OAuth endpoints at ".concat(this.config.mcpBaseUrl));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        msg = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        this.callbacks.onStatus("Failed to get OAuth metadata: ".concat(msg));
                        throw error_2;
                    case 4:
                        if (!metadata.registration_endpoint) return [3 /*break*/, 13];
                        // Try primary client name first, fall back to alternative if rejected
                        this.callbacks.onStatus("Registering client as '".concat(CLIENT_NAME, "'..."));
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 12]);
                        return [4 /*yield*/, this.registerClient(metadata.registration_endpoint, CLIENT_NAME)];
                    case 6:
                        client = _a.sent();
                        clientId = client.client_id;
                        this.callbacks.onStatus("Registered as client: ".concat(clientId));
                        return [3 /*break*/, 12];
                    case 7:
                        error_3 = _a.sent();
                        // Try fallback client name (some servers have allowlists)
                        this.callbacks.onStatus("Registration as '".concat(CLIENT_NAME, "' failed, trying '").concat(FALLBACK_CLIENT_NAME, "'..."));
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.registerClient(metadata.registration_endpoint, FALLBACK_CLIENT_NAME)];
                    case 9:
                        client = _a.sent();
                        clientId = client.client_id;
                        this.callbacks.onStatus("Registered as client: ".concat(clientId));
                        return [3 /*break*/, 11];
                    case 10:
                        fallbackError_1 = _a.sent();
                        msg = fallbackError_1 instanceof Error ? fallbackError_1.message : 'Unknown error';
                        this.callbacks.onStatus("Client registration failed: ".concat(msg));
                        throw fallbackError_1;
                    case 11: return [3 /*break*/, 12];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        // Use a default client ID for public clients
                        clientId = 'craft-agent';
                        this.callbacks.onStatus("Using default client ID: ".concat(clientId));
                        _a.label = 14;
                    case 14:
                        pkce = generatePKCE();
                        state = generateState();
                        redirectUri = "http://localhost:".concat(CALLBACK_PORT).concat(CALLBACK_PATH);
                        this.callbacks.onStatus('Generated PKCE challenge and state');
                        authUrl = new url_1.URL(metadata.authorization_endpoint);
                        authUrl.searchParams.set('response_type', 'code');
                        authUrl.searchParams.set('client_id', clientId);
                        authUrl.searchParams.set('redirect_uri', redirectUri);
                        authUrl.searchParams.set('state', state);
                        authUrl.searchParams.set('code_challenge', pkce.challenge);
                        authUrl.searchParams.set('code_challenge_method', 'S256');
                        // Start local server to receive callback
                        this.callbacks.onStatus("Starting callback server on port ".concat(CALLBACK_PORT, "..."));
                        codePromise = this.startCallbackServer(state);
                        // Open browser for authorization
                        this.callbacks.onStatus('Opening browser for authorization...');
                        return [4 /*yield*/, bun_1.Utils.openExternal(authUrl.toString())];
                    case 15:
                        _a.sent();
                        // Wait for the authorization code
                        this.callbacks.onStatus('Waiting for you to authorize in browser...');
                        return [4 /*yield*/, codePromise];
                    case 16:
                        authCode = _a.sent();
                        this.callbacks.onStatus('Authorization code received!');
                        // Exchange code for tokens
                        this.callbacks.onStatus('Exchanging authorization code for tokens...');
                        return [4 /*yield*/, this.exchangeCodeForTokens(metadata.token_endpoint, authCode, pkce.verifier, clientId)];
                    case 17:
                        tokens = _a.sent();
                        this.callbacks.onStatus('Tokens received successfully!');
                        return [2 /*return*/, { tokens: tokens, clientId: clientId }];
                }
            });
        });
    };
    /**
     * Start OAuth flow without waiting for callback (for deeplink-based flows)
     * Returns the authorization URL and state/verifier for later token exchange
     * @param preloadedMetadata - Optional pre-fetched OAuth metadata to avoid duplicate fetch
     */
    CraftOAuth.prototype.startAuthFlow = function (preloadedMetadata) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, _a, clientId, clientSecret, client, error_4, client, pkce, state, redirectUri, authUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.callbacks.onStatus('Fetching OAuth server configuration...');
                        _a = preloadedMetadata;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getServerMetadata()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        metadata = _a;
                        if (!metadata.registration_endpoint) return [3 /*break*/, 8];
                        // Try primary client name first, fall back to alternative if rejected
                        this.callbacks.onStatus("Registering client as '".concat(CLIENT_NAME, "'..."));
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this.registerClient(metadata.registration_endpoint, CLIENT_NAME)];
                    case 4:
                        client = _b.sent();
                        clientId = client.client_id;
                        clientSecret = client.client_secret;
                        this.callbacks.onStatus("Registered as client: ".concat(clientId));
                        return [3 /*break*/, 7];
                    case 5:
                        error_4 = _b.sent();
                        // Try fallback client name (some servers have allowlists)
                        this.callbacks.onStatus("Registration as '".concat(CLIENT_NAME, "' failed, trying '").concat(FALLBACK_CLIENT_NAME, "'..."));
                        return [4 /*yield*/, this.registerClient(metadata.registration_endpoint, FALLBACK_CLIENT_NAME)];
                    case 6:
                        client = _b.sent();
                        clientId = client.client_id;
                        clientSecret = client.client_secret;
                        this.callbacks.onStatus("Registered as client: ".concat(clientId));
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        // No registration endpoint - use default client ID
                        clientId = '1code';
                        _b.label = 9;
                    case 9:
                        pkce = generatePKCE();
                        state = generateState();
                        redirectUri = this.config.redirectUri || "http://localhost:".concat(CALLBACK_PORT).concat(CALLBACK_PATH);
                        authUrl = new url_1.URL(metadata.authorization_endpoint);
                        authUrl.searchParams.set('response_type', 'code');
                        authUrl.searchParams.set('client_id', clientId);
                        authUrl.searchParams.set('redirect_uri', redirectUri);
                        authUrl.searchParams.set('state', state);
                        authUrl.searchParams.set('code_challenge', pkce.challenge);
                        authUrl.searchParams.set('code_challenge_method', 'S256');
                        return [2 /*return*/, {
                                authUrl: authUrl.toString(),
                                state: state,
                                codeVerifier: pkce.verifier,
                                tokenEndpoint: metadata.token_endpoint,
                                clientId: clientId,
                                clientSecret: clientSecret,
                            }];
                }
            });
        });
    };
    /**
     * Complete OAuth flow by exchanging code for tokens (called after deeplink callback)
     */
    CraftOAuth.prototype.completeAuthFlow = function (code, codeVerifier, tokenEndpoint, clientId, clientSecret) {
        return __awaiter(this, void 0, void 0, function () {
            var redirectUri;
            return __generator(this, function (_a) {
                redirectUri = this.config.redirectUri || "http://localhost:".concat(CALLBACK_PORT).concat(CALLBACK_PATH);
                return [2 /*return*/, this.exchangeCodeForTokens(tokenEndpoint, code, codeVerifier, clientId, redirectUri, clientSecret)];
            });
        });
    };
    // Start local HTTP server to receive OAuth callback
    CraftOAuth.prototype.startCallbackServer = function (expectedState) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                _this.stopServer();
                reject(new Error('OAuth timeout - no callback received'));
            }, 300000); // 5 minute timeout
            _this.server = (0, http_1.createServer)(function (req, res) {
                var url = new url_1.URL(req.url || '/', "http://localhost:".concat(CALLBACK_PORT));
                if (url.pathname === CALLBACK_PATH) {
                    var code = url.searchParams.get('code');
                    var state = url.searchParams.get('state');
                    var error = url.searchParams.get('error');
                    if (error) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(generateOAuthPage({
                            title: 'Authorization Failed',
                            message: 'You can close this window.',
                            isSuccess: false,
                            errorDetail: error,
                        }));
                        clearTimeout(timeout);
                        _this.stopServer();
                        reject(new Error("OAuth error: ".concat(error)));
                        return;
                    }
                    if (state !== expectedState) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(generateOAuthPage({
                            title: 'Security Error',
                            message: 'State mismatch - possible CSRF attack.',
                            isSuccess: false,
                        }));
                        clearTimeout(timeout);
                        _this.stopServer();
                        reject(new Error('OAuth state mismatch'));
                        return;
                    }
                    if (!code) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(generateOAuthPage({
                            title: 'Authorization Failed',
                            message: 'No authorization code received.',
                            isSuccess: false,
                        }));
                        clearTimeout(timeout);
                        _this.stopServer();
                        reject(new Error('No authorization code'));
                        return;
                    }
                    // Success!
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(generateOAuthPage({
                        title: 'Authorization Successful',
                        message: 'You can close this window and return to the terminal.',
                        isSuccess: true,
                        autoClose: true,
                    }));
                    clearTimeout(timeout);
                    _this.stopServer();
                    resolve(code);
                }
                else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            });
            _this.server.listen(CALLBACK_PORT, function () {
                // Server started
            });
            _this.server.on('error', function (err) {
                clearTimeout(timeout);
                reject(new Error("Failed to start callback server: ".concat(err.message)));
            });
        });
    };
    CraftOAuth.prototype.stopServer = function () {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    };
    // Cancel the OAuth flow
    CraftOAuth.prototype.cancel = function () {
        this.stopServer();
    };
    return CraftOAuth;
}());
exports.CraftOAuth = CraftOAuth;
// Helper to extract the base MCP URL from a full MCP URL
function getMcpBaseUrl(mcpUrl) {
    // Remove /mcp or /sse suffix if present
    return mcpUrl.replace(/\/(mcp|sse)\/?$/, '');
}
