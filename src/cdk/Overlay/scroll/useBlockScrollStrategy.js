import * as React from 'react';
import noop from 'lodash/noop';
import { useViewportRuler } from '../../Scrolling';

function useBlockScrollStrategy() {
  const vr = useViewportRuler();
  /**
   * HTML styles that are saved before the strategy is applied
   * @type {React.MutableRefObject<{top: string, left: string}>}
   */
  const previousHtmlStyles = React.useRef({ top: '', left: '' });

  /**
   * Scroll position that is saved before strategy is applied
   * @type {React.MutableRefObject<{top: ?number, left: ?number}>}
   */
  const previousScrollPosition = React.useRef({ top: null, left: null });

  /**
   * Whether the strategy has been enabled
   * @type {React.MutableRefObject<boolean>}
   */
  const isEnabled = React.useRef(false);

  const attach = noop;

  /**
   * Check to make sure that we don't try to apply global scroll strategy multiple times.
   * @type {function(): boolean}
   */
  const canBeEnabled = React.useCallback(() => {
    const html = document.documentElement;

    if (html.dataset.hasScrollblockEnabled || isEnabled.current) {
      return false;
    }

    const body = document.body;
    const viewport = vr.getViewportSize();
    return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
  }, [vr.getViewportSize]);

  /** Blocks page-level scroll while the attached overlay is open. */
  const enable = React.useCallback(() => {
    if (canBeEnabled()) {
      const root = document.documentElement;

      previousScrollPosition.current = vr.getViewportScrollPosition();

      // Cache the previous inline styles in case the user had set them.
      previousHtmlStyles.current.left = root.style.left || '';
      previousHtmlStyles.current.top = root.style.top || '';

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = `${-previousScrollPosition.current.left}px`;
      root.style.top = `${-previousScrollPosition.current.top}px`;

      root.dataset.hasScrollblockEnabled = 'true';

      isEnabled.current = true;
    }
  }, [canBeEnabled, vr.getViewportScrollPosition]);

  const disable = React.useCallback(() => {
    if (isEnabled.current) {
      const html = document.documentElement;
      const body = document.body;
      const htmlStyle = html.style;
      const bodyStyle = body.style;
      const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
      const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

      isEnabled.current = false;

      htmlStyle.left = previousHtmlStyles.current.left;
      htmlStyle.top = previousHtmlStyles.current.top;
      delete html.dataset.hasScrollblockEnabled;

      // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
      // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
      htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';

      window.scroll(previousScrollPosition.current.left, previousScrollPosition.current.top);

      htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
      bodyStyle.scrollBehavior = previousBodyScrollBehavior;
    }
  }, []);

  return React.useMemo(() => ({
    attach, enable, disable
  }), [attach, enable, disable]);
}

export default useBlockScrollStrategy;
