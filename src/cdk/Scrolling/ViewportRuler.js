import * as React from 'react';
import debounce from 'lodash/debounce';
import { usePlatform } from '../Platform';
import { ViewportRulerContext } from './context';

/**
 * @typedef {Object} ViewportScrollPosition
 * @property top {number}
 * @property left {number}
 */

/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;

function ViewportRuler({ children }) {
  const is = usePlatform();

  /**
   * @type {React.MutableRefObject<?{width: ?number, height: ?number}>}
   */
  const viewportSize = React.useRef(null);
  const changeListeners = React.useRef([]);

  /** @type {function(): void} */
  const updateViewportSize = React.useCallback(
    /**
     * Updates the cached viewport size.
     */
    () => {
      viewportSize.current = is('browser') ?
        { width: window.innerWidth, height: window.innerHeight } :
        { width: 0, height: 0 };
    },
    [],
  );

  /** @type {function(): { width: ?number, height: ?number }} */
  const getViewportSize = React.useCallback(
    /**
     * Gets the (top, left) scroll position of the viewport.
     * @return {{ width: number, height: number }}
     */
    () => {
      if (!viewportSize.current) {
        updateViewportSize();
      }

      const output = { width: viewportSize.current.width, height: viewportSize.current.height };

      if (!is('browser')) {
        viewportSize.current = null;
      }

      return output;
    },
    [updateViewportSize],
  );

  /** @type {function(): ViewportScrollPosition} */
  const getViewportScrollPosition = React.useCallback(
    /**
     * Gets the (top, left) scroll position of the viewport.
     * @return {ViewportScrollPosition}
     */
    () => {
      if (!is('browser')) return { top: 0, left: 0 };

      // The top-left-corner of the viewport is determined by the scroll position of the document
      // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
      // whether `document.body` or `document.documentElement` is the scrolled element, so reading
      // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
      // `document.documentElement` works consistently, where the `top` and `left` values will
      // equal negative the scroll position.
      const documentElement = document.documentElement;
      const documentRect = documentElement.getBoundingClientRect();

      const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
        documentElement.scrollTop || 0;

      const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
        documentElement.scrollLeft || 0;

      return { top, left };
    },
    [],
  );

  /** @type {function(): ClientRect} */
  const getViewportRect = React.useCallback(
    /**
     * Gets a ClientRect for the viewport's bounds.
     * @return {ClientRect}
     */
    () => {
      // Use the document element's bounding rect rather than the window scroll properties
      // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
      // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
      // conceptual viewports. Under most circumstances these viewports are equivalent, but they
      // can disagree when the page is pinch-zoomed (on devices that support touch).
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
      // We use the documentElement instead of the body because, by default (without a css reset)
      // browsers typically give the document body an 8px margin, which is not included in
      // getBoundingClientRect().
      const scrollPosition = getViewportScrollPosition();
      const {width, height} = getViewportSize();

      return {
        top: scrollPosition.top,
        left: scrollPosition.left,
        bottom: scrollPosition.top + height,
        right: scrollPosition.left + width,
        height,
        width,
      };
    },
    [getViewportScrollPosition, getViewportSize],
  );

  const onViewportSizeChange = React.useCallback(
    (event) => {
      changeListeners.current.forEach(listener => listener(event));
    },
    [],
  );

  const addChangeListener = React.useCallback((callback, throttleTime) => {
    const debouncedCallback = throttleTime > 0 ?
      debounce(callback, DEFAULT_RESIZE_TIME) :
      callback;
    changeListeners.current.push(debouncedCallback);

    return () => {
      const index = changeListeners.current.indexOf(debouncedCallback);
      changeListeners.current.splice(index, 1);
    };
  }, []);

  React.useEffect(() => {
    if (is('browser')) {
      window.addEventListener('resize', onViewportSizeChange);
      window.addEventListener('orientationchange', onViewportSizeChange);
    }

    return () => {
      changeListeners.current = [];
      if (is('browser')) {
        window.removeEventListener('resize', onViewportSizeChange);
        window.removeEventListener('orientationchange', onViewportSizeChange);
      }
    };
  }, [onViewportSizeChange]);

  const provider = React.useMemo(() => ({
    addChangeListener,
    getViewportRect,
    getViewportScrollPosition,
    getViewportSize,
  }), [
    addChangeListener,
    getViewportRect,
    getViewportScrollPosition,
    getViewportSize,
  ]);

  return (
    <ViewportRulerContext.Provider value={provider}>{ children }</ViewportRulerContext.Provider>
  );
}

export default ViewportRuler;
