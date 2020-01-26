let shadowDomIsSupported;

/**
 * Checks whether the user's browser support Shadow DOM.
 * @return {boolean}
 */
export function supportsShadowDom() {
  if (shadowDomIsSupported == null) {
    const head = typeof document !== 'undefined' ? document.head : null;
    shadowDomIsSupported = !!(head && (head.createShadowRoot || head.attachShadow));
  }

  return shadowDomIsSupported;
}
