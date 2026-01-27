"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusColor = getStatusColor;
exports.getStatusIndicator = getStatusIndicator;
/**
* Git status icon - Add (green square with plus)
*/
function IconStatusAdd(_a) {
    var className = _a.className;
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className}>
			<path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
			<path d="M16.2426 12H7.75736M12 16.2426V7.75732" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>;
}
/**
* Git status icon - Delete (red square with minus)
*/
function IconStatusDelete(_a) {
    var className = _a.className;
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className}>
			<path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
			<path d="M16.2426 12H7.75736" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>;
}
/**
* Git status icon - Edit/Modified (yellow square with dot)
*/
function IconStatusEdit(_a) {
    var className = _a.className;
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class={className}>
			<path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
			<path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>;
}
/**
* Get text color for status
*/
function getStatusColor(status) {
    switch (status) {
        case "added":
        case "untracked": return "text-green-500";
        case "modified": return "text-yellow-500";
        case "deleted": return "text-red-500";
        case "renamed": return "text-blue-500";
        case "copied": return "text-purple-500";
        default: return "text-muted-foreground";
    }
}
/**
* Git status indicator with appropriate icon and color
*/
function getStatusIndicator(status) {
    var color = getStatusColor(status);
    switch (status) {
        case "added":
        case "untracked": return <IconStatusAdd class={color}/>;
        case "modified": return <IconStatusEdit class={color}/>;
        case "deleted": return <IconStatusDelete class={color}/>;
        case "renamed": return <IconStatusEdit class={"".concat(color)}/>;
        case "copied": return <IconStatusAdd class={color}/>;
        default: return <IconStatusEdit class={color}/>;
    }
}
