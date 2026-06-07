// Minimal state container + render scheduler.
// Replaces React's useState/useEffect/useMemo: the whole UI is a pure function
// of `state`, re-rendered (via requestAnimationFrame, coalesced) on every change.
let state = {};
let renderFn = null;
let scheduled = false;

export function initStore(initial, onRender) {
  state = initial;
  renderFn = onRender;
}

export function getState() {
  return state;
}

/** Shallow-merge a patch (object or updater function) into state and re-render. */
export function setState(patch) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  scheduleRender();
}

function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    if (renderFn) renderFn(state);
  });
}

/** Force an immediate re-render with the current state (e.g. after a focus-sensitive DOM tweak). */
export function rerender() {
  if (renderFn) renderFn(state);
}
