"use strict";
/**
 * Link popup utilities for terminal links.
 * Shows a tooltip with the URL and instructions when hovering over links.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMac = isMac;
exports.getModifierKeyName = getModifierKeyName;
exports.isModifierPressed = isModifierPressed;
exports.removeLinkPopup = removeLinkPopup;
exports.showLinkPopup = showLinkPopup;
var _linkPopup;
var _isMouseOverPopup = false;
var _removeTimeout;
var _showTimeout;
var _pendingUrl;
var _currentUrl;
/** Delay before showing the tooltip (ms) */
var SHOW_DELAY = 400;
/**
 * Check if the current platform is macOS.
 */
function isMac() {
    return typeof navigator !== "undefined"
        ? /Mac/.test(navigator.platform)
        : false;
}
/**
 * Get the modifier key name based on platform.
 */
function getModifierKeyName() {
    return isMac() ? "Cmd" : "Ctrl";
}
/**
 * Check if the correct modifier key is pressed for link activation.
 */
function isModifierPressed(event) {
    return isMac() ? event.metaKey : event.ctrlKey;
}
/**
 * Force remove the link popup immediately.
 */
function forceRemoveLinkPopup() {
    if (_showTimeout) {
        clearTimeout(_showTimeout);
        _showTimeout = undefined;
    }
    if (_removeTimeout) {
        clearTimeout(_removeTimeout);
        _removeTimeout = undefined;
    }
    if (_linkPopup) {
        _linkPopup.remove();
        _linkPopup = undefined;
    }
    _isMouseOverPopup = false;
    _pendingUrl = undefined;
    _currentUrl = undefined;
}
/**
 * Remove the link popup with a small delay to allow mouse to move to it.
 */
function removeLinkPopup() {
    // Clear any pending show timeout
    if (_showTimeout) {
        clearTimeout(_showTimeout);
        _showTimeout = undefined;
    }
    _pendingUrl = undefined;
    // Clear any existing remove timeout
    if (_removeTimeout) {
        clearTimeout(_removeTimeout);
    }
    // Add a small delay to allow mouse to move to popup
    _removeTimeout = setTimeout(function () {
        if (!_isMouseOverPopup && _linkPopup) {
            _linkPopup.remove();
            _linkPopup = undefined;
            _currentUrl = undefined;
        }
        _removeTimeout = undefined;
    }, 150);
}
/**
 * Show a popup with the link URL and instructions.
 * @param event - The mouse event
 * @param text - The URL text to display
 * @param onOpen - Optional callback to open the link when "Follow link" is clicked
 */
function showLinkPopup(event, text, onOpen) {
    // If we're already showing or pending the same URL, do nothing
    if (_currentUrl === text || _pendingUrl === text) {
        return;
    }
    // Cancel any existing popup for a different URL
    if (_linkPopup || _showTimeout) {
        forceRemoveLinkPopup();
    }
    // Clear any pending removal
    if (_removeTimeout) {
        clearTimeout(_removeTimeout);
        _removeTimeout = undefined;
    }
    // Store event coordinates - these are reliable even if element is detached
    var clientX = event.clientX;
    var clientY = event.clientY;
    _pendingUrl = text;
    // Delay before showing the tooltip
    _showTimeout = setTimeout(function () {
        _showTimeout = undefined;
        _pendingUrl = undefined;
        _currentUrl = text;
        createAndShowPopup(clientX, clientY, text, onOpen);
    }, SHOW_DELAY);
}
/**
 * Internal function to create and display the popup.
 */
function createAndShowPopup(clientX, clientY, text, onOpen) {
    var _a;
    var popup = document.createElement("div");
    popup.classList.add("xterm-link-popup");
    // Track mouse over popup to prevent it from disappearing
    popup.addEventListener("mouseenter", function () {
        _isMouseOverPopup = true;
        if (_removeTimeout) {
            clearTimeout(_removeTimeout);
            _removeTimeout = undefined;
        }
    });
    popup.addEventListener("mouseleave", function () {
        _isMouseOverPopup = false;
        forceRemoveLinkPopup();
    });
    // "Follow link" clickable text
    var followLink = document.createElement("span");
    followLink.innerText = "Follow link";
    followLink.style.color = "#2563eb"; // blue-600
    followLink.style.cursor = "pointer";
    followLink.style.textDecoration = "underline";
    followLink.style.textUnderlineOffset = "2px";
    if (onOpen) {
        followLink.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            onOpen(text);
            removeLinkPopup();
        });
    }
    popup.appendChild(followLink);
    // Shortcut hint
    var shortcutHint = document.createElement("span");
    shortcutHint.style.opacity = "0.5";
    shortcutHint.style.fontSize = "11px";
    shortcutHint.style.marginLeft = "4px";
    shortcutHint.innerText = "(".concat(getModifierKeyName(), " + click)");
    popup.appendChild(shortcutHint);
    // Find the terminal element using elementFromPoint at cursor position
    var elementAtCursor = document.elementFromPoint(clientX, clientY);
    var terminalElement = (_a = elementAtCursor === null || elementAtCursor === void 0 ? void 0 : elementAtCursor.closest(".xterm")) !== null && _a !== void 0 ? _a : null;
    // Fallback: try to find terminal by querying document
    if (!terminalElement) {
        terminalElement = document.querySelector(".xterm");
    }
    if (!terminalElement) {
        return;
    }
    // Use cursor position to position tooltip above the link
    // Try to find the actual link element at cursor position for better positioning
    var linkX = clientX;
    var linkY = clientY;
    // Try to find an element with underline decoration at cursor
    if (elementAtCursor) {
        var linkElement = elementAtCursor;
        // Walk up the tree to find an element with underline
        while (linkElement && linkElement !== terminalElement) {
            var style = window.getComputedStyle(linkElement);
            if (style.textDecoration.includes("underline")) {
                var rect = linkElement.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    linkX = rect.left + rect.width / 2;
                    linkY = rect.top;
                    break;
                }
            }
            linkElement = linkElement.parentElement;
        }
    }
    // Append popup to DOM first so we can measure it
    terminalElement.appendChild(popup);
    // Position the popup ABOVE the link (tooltip style)
    var terminalRect = terminalElement.getBoundingClientRect();
    // Force layout recalculation to get accurate dimensions
    var popupRect = popup.getBoundingClientRect();
    var popupHeight = popupRect.height;
    var popupWidth = popupRect.width;
    // Position above link with 6px gap, centered horizontally
    // linkY is absolute (viewport), terminalRect.top is absolute, so linkY - terminalRect.top is relative to terminal
    var top = linkY - terminalRect.top - popupHeight - 6;
    var left = linkX - terminalRect.left - popupWidth / 2;
    // If not enough space above, show below with gap
    if (top < 5) {
        top = linkY - terminalRect.top + 18;
    }
    // Keep within horizontal bounds
    if (left + popupWidth > terminalRect.width) {
        left = terminalRect.width - popupWidth - 10;
    }
    if (left < 10) {
        left = 10;
    }
    popup.style.top = "".concat(Math.max(0, top), "px");
    popup.style.left = "".concat(Math.max(0, left), "px");
    _linkPopup = popup;
}
