// Electrobun bundles the configured view entrypoint into `views/mainview/main.js`.
// Keep this file intentionally tiny: the actual UI is built by `scripts/build-ui.ts`
// into `dist/mainview/` and loaded by `views/mainview/index.html` via
// `<script type="module" src="./ui/main.js">` so DevTools can resolve sourcemaps.

console.log("[ViewEntry] mainview injected entry loaded");

export {};

