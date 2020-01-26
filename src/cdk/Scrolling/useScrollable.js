import * as React from 'react';
import noop from 'lodash/noop';
import { useScrollDispatcher } from './context';
import { useDir } from '../Bidi';
import { getRtlScrollAxisType, RtlScrollAxisType, supportsScrollBehavior } from '../Platform';

/**
 * An extended version of ScrollToOptions that allows expressing scroll offsets relative to the
 * top, bottom, left, right, start, or end of the viewport rather than just the top and left.
 * Please note: the top and bottom properties are mutually exclusive, as are the left, right,
 * start, and end properties.
 * @typedef {ScrollOptions} ExtendedScrollOptions
 * @property [top] {number}
 * @property [bottom] {number}
 * @property [left] {number}
 * @property [right] {number}
 * @property [start] {number}
 * @property [end] {number}
 */

/**
 * Sends an event when the element is scrolled. Registers itself with the ScrollDispatcher
 * to include itself as part of its collection of scrolling events that can be listened to
 * through the service.
 *
 * @param element {HTMLElement}
 * @param [onScroll] {Function}
 */
function useScrollable(element, onScroll = noop) {
  const dir = useDir();

  const { handleScrollForGlobalListeners, register, deregister } = useScrollDispatcher();

  /**
   * Whether the hook has been initialized. Once it has, we can start using the
   * global callbacks for scroll events too.
   * @type {React.MutableRefObject<boolean>}
   */
  const initialized = React.useRef(false);

  const handleElementScroll = React.useCallback((event) => {
    onScroll(event);

    // Dispatch the element's scroll event to all of the available listeners who subscribed
    // via the scroll dispatcher.
    if (initialized.current) {
      handleScrollForGlobalListeners({
        target: element,
      });
    }
  }, [element, onScroll]);

  /** @type {function(options: ExtendedScrollOptions): void} */
  const applyScrollToOptions = React.useCallback((options) => {
    if (supportsScrollBehavior()) {
      element.scrollTo(options);
    } else {
      if (options.top != null) {
        element.scrollTop = options.top;
      } else if (options.left != null) {
        element.scrollLeft = options.left;
      }
    }
  }, [element]);

  /**
   * Scrolls to the specified offsets. This is a normalized version of the browser's native scrollTo
   * method, since browsers are not consistent about what scrollLeft means in RTL. For this method
   * left and right always refer to the left and right side of the scrolling container irrespective
   * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
   * in an RTL context.
   * @type {function(options: ExtendedScrollOptions)}
   */
  const scrollTo = React.useCallback((options) => {
    const isRtl = dir === 'rtl';

    // Rewrite the start and end offsets as right or left offsets
    options.left = options.left == null ? (isRtl ? options.end : options.start) : options.left;
    options.right = options.right == null ? (isRtl ? options.start : options.end) : options.right;

    // Rewrite the bottom offsets as a top offset
    if (options.bottom != null) {
      options.top = element.scrollHeight - element.clientHeight - options.bottom;
    }

    // Rewrite the right offset as a left offset
    if (isRtl && getRtlScrollAxisType() !== RtlScrollAxisType.NORMAL) {
      if (options.left != null) {
        options.right = element.scrollWidth - element.clientWidth - options.left;
      }

      if (getRtlScrollAxisType() === RtlScrollAxisType.INVERTED) {
        options.left = options.right;
      } else if (getRtlScrollAxisType() === RtlScrollAxisType.NEGATED) {
        options.left = options.right ? -options.right : options.right;
      }
    } else {
      if (options.right != null) {
        options.left = element.scrollWidth - element.clientWidth - options.right;
      }
    }

    applyScrollToOptions(options);
  }, [element, applyScrollToOptions, dir]);

  /**
   * Measures the scroll offset relative to the specified edge of the viewport. This method can be
   * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
   * about what scrollLeft means in RTL. The values returned by this method are normalized such that
   * left and right always refer to the left and right side of the scrolling container irrespective
   * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
   * in an RTL context.
   * @param from The edge to measure from.
   * @type {function(from: string): number}
   */
  const measureScrollOffset = React.useCallback((from) => {
    const LEFT = 'left';
    const RIGHT = 'right';
    if (from === 'top') {
      return element.scrollTop;
    }

    if (from === 'bottom') {
      return element.scrollHeight - element.clientHeight - element.scrollTop;
    }

    // Rewrite start & end as left or right offsets.
    const isRtl = dir === 'rtl';
    if (from === 'start') {
      from = isRtl ? RIGHT : LEFT;
    } else if (from === 'end') {
      from = isRtl ? LEFT : RIGHT;
    }

    if (isRtl && getRtlScrollAxisType() === RtlScrollAxisType.INVERTED) {
      // For INVERTED, scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and
      // 0 when scrolled all the way right.
      if (from === LEFT) {
        return element.scrollWidth - element.clientWidth - element.scrollLeft;
      } else {
        return element.scrollLeft;
      }
    } else if (isRtl && getRtlScrollAxisType() === RtlScrollAxisType.NEGATED) {
      // For NEGATED, scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and
      // 0 when scrolled all the way right.
      if (from === LEFT) {
        return element.scrollLeft + element.scrollWidth - element.clientWidth;
      } else {
        return -element.scrollLeft;
      }
    } else {
      // For NORMAL, as well as non-RTL contexts, scrollLeft is 0 when scrolled all the way left and
      // (scrollWidth - clientWidth) when scrolled all the way right.
      if (from === LEFT) {
        return element.scrollLeft;
      } else {
        return element.scrollWidth - element.clientWidth - element.scrollLeft;
      }
    }
  }, [element, dir]);

  // Registers the current element to the scroll dispatcher. Once registered, it will dispatch
  // to all global listeners
  React.useEffect(() => {
    if (element) {
      register(element);
      initialized.current = true;
    }

    return () => {
      if (element) {
        deregister(element);
        initialized.current = false;
      }
    };
  }, [element]);

  // Return an object that has the public API for the scrollable exposed. Rather than bind
  // to onscroll event manually, we just return the handler and implement it through JSX.
  return React.useMemo(() => ({
    scrollTo,
    measureScrollOffset,
    onScroll: handleElementScroll,
  }), [handleElementScroll, scrollTo, measureScrollOffset]);
}

export default useScrollable;
