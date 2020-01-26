export function logCalls(arg) {
  if (window.Cypress) {
    if (!window.__calls__) {
      window.__calls__ = [];
    }

    window.__calls__.push(arg);
  }
}

export function resetCalls() {
  if (window.Cypress) {
    window.__calls__ = [];
  }
}
