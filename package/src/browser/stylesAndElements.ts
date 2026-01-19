export const isAppRegionDrag = (e: MouseEvent) => {
  const DRAG_CLASS = "electrobun-webkit-app-region-drag";
  const NO_DRAG_CLASS = "electrobun-webkit-app-region-no-drag";

  const targetNode = e.target as Node | null;
  const startEl = targetNode instanceof Element ? targetNode : targetNode?.parentElement ?? null;
  if (!startEl) return false;

  const isInteractive = (el: Element) => {
    const tag = el.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || tag === "OPTION") {
      return true;
    }

    const role = el.getAttribute("role");
    if (
      role === "button" ||
      role === "link" ||
      role === "textbox" ||
      role === "combobox" ||
      role === "menuitem" ||
      role === "menuitemcheckbox" ||
      role === "menuitemradio" ||
      role === "option" ||
      role === "switch" ||
      role === "tab"
    ) {
      return true;
    }

    return el instanceof HTMLElement && el.isContentEditable;
  };

  let el: Element | null = startEl;
  let blockedByInteractive = false;

  while (el) {
    if (el.classList.contains(NO_DRAG_CLASS)) return false;

    if (isInteractive(el) && !el.classList.contains(DRAG_CLASS)) {
      blockedByInteractive = true;
    }

    if (el.classList.contains(DRAG_CLASS)) {
      return !blockedByInteractive;
    }

    el = el.parentElement;
  }

  return false;
};
