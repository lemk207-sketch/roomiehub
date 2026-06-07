// Small DOM / formatting helpers shared across views.

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/** Join truthy class fragments, mirroring the inline `className={...}` patterns in the original JSX. */
export function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Delegate an event from `root` to elements matching `selector` carrying the
 * given attribute, invoking `handler(target, event)`. Mirrors React's
 * onClick/onChange handlers without re-binding listeners on every render.
 */
export function delegate(root, type, selector, handler) {
  root.addEventListener(type, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(target, e);
  });
}

export function qs(root, selector) {
  return root.querySelector(selector);
}

export function qsa(root, selector) {
  return Array.from(root.querySelectorAll(selector));
}
