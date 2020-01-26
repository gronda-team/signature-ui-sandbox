import * as React from 'react';
import { FocusMonitorContext } from './context';
import { normalizePassiveListenerOptions, usePlatform } from '../../Platform';

/**
 * @typedef {'touch' | 'mouse' | 'keyboard' | 'program' | null} FocusOrigin
 * The means by which focus was obtained.
 */

/**
 * @typedef {Object} MonitoredElementInfo
 * @property unlisten {function}
 * @property checkChildren {boolean}
 * @property callback {function}
 */

// This is the value used by AngularJS Material.
export const TOUCH_BUFFER_MS = 650;

/**
 * Event listener options that enable capturing and also
 * mark the listener as passive if the browser supports it.
 */
const captureEventListenerOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true
});

/** Monitors mouse and keyboard events to determine the cause of focus events. */
function FocusMonitor({ children }) {
  const is = usePlatform();

  /**
   * The focus origin that the next focus event is a result of.
   * @type {React.MutableRefObject<?boolean>}
   */
  const listenersBound = React.useRef(null);

  /**
   * The focus origin that the next focus event is a result of.
   * @type {React.MutableRefObject<?FocusOrigin>}
   */
  const origin = React.useRef(null);

  /**
   * The FocusOrigin of the last focus event tracked by the FocusMonitor.
   * @type {React.MutableRefObject<?FocusOrigin>}
   */
  const lastFocusOrigin = React.useRef(null);

  /**
   * Whether the window has just been focused.
   * @type {React.MutableRefObject<?boolean>}
   */
  const windowFocused = React.useRef(null);

  /**
   * The target of the last touch event.
   * @type {React.MutableRefObject<?EventTarget>}
   */
  const lastTouchTarget = React.useRef(null);

  /**
   * The timeout id of the touch timeout, used to cancel timeout later.
   * @type {React.MutableRefObject<?number>}
   */
  const touchTimeoutId = React.useRef(null);

  /**
   * The timeout id of the window focus timeout.
   * @type {React.MutableRefObject<?number>}
   */
  const windowFocusTimeoutId = React.useRef(null);

  /**
   * The timeout id of the origin clearing timeout.
   * @type {React.MutableRefObject<?number>}
   */
  const originTimeoutId = React.useRef(null);

  /**
   * Map of elements being monitored to their info.
   * @type {React.MutableRefObject<?Map<HTMLElement, MonitoredElementInfo>>}
   */
  const elementInfo = React.useRef(new Map());

  /**
   * The number of elements currently being monitored.
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [monitoredElementCount, updateMonitoredCount] = React.useState(0);

  /**
   * Last count of monitored elements.
   * @type {React.MutableRefObject<?number>}
   */
  const lastMonitoredElementCount = React.useRef(0);

  const onBlur = React.useCallback(
    /**
     * Handles blur events on a registered element.
     * @param event {FocusEvent} The blur event.
     * @param element {HTMLElement} The monitored element.
     */
    (event, element) => {
      // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
      // order to focus another child of the monitored element.
      const info = elementInfo.current.get(element);

      if (
        !info
        || (
          info.checkChildren
          && event.relatedTarget instanceof Node
          && element.contains(event.relatedTarget)
        )
      ) {
        return;
      }

      info.callback(null);
    },
    [],
  );

  const wasCausedByTouchEvent = React.useCallback(
    /**
     * Checks whether the given focus event was caused by a touchstart event.
     * @param event {FocusEvent} The focus event to check.
     * @returns {boolean} Whether the event was caused by a touch.
     */
    (event) => {
      const focusTarget = event.target;
      const __lastTouchTarget = lastTouchTarget.current;
      return __lastTouchTarget instanceof Node && focusTarget instanceof Node
        && (focusTarget === __lastTouchTarget || focusTarget.contains(__lastTouchTarget));
    },
    [],
  );

  const onFocus = React.useCallback(
    /**
     * Handles focus events on a registered element.
     * @param event {FocusEvent} The focus event.
     * @param element {HTMLElement} The monitored element.
     */
    (event, element) => {
      const info = elementInfo.current.get(element);

      if (!info || (!info.checkChildren && element !== event.target)) return;

      // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
      // 1) The window has just regained focus, in which case we want to restore the focused state of
      //    the element from before the window blurred.
      // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
      // 3) The element was programmatically focused, in which case we should mark the origin as
      //    'program'.
      let currentOrigin = origin.current;
      if (!currentOrigin) {
        if (windowFocused.current && lastFocusOrigin.current) {
          currentOrigin = lastFocusOrigin.current;
        } else if (wasCausedByTouchEvent(event)) {
          currentOrigin = 'touch';
        } else {
          currentOrigin = 'program';
        }
      }

      info.callback(currentOrigin);
      lastFocusOrigin.current = currentOrigin;
    },
    [wasCausedByTouchEvent],
  );

  /** @type {function(FocusOrigin): void} */
  const setOriginForCurrentEventQueue = React.useCallback(
    /**
     * Sets the origin and schedules an async function to clear it at the end of the event queue.
     * @param focusOrigin {FocusOrigin} The origin to set.
     */
    (focusOrigin) => {
      origin.current = focusOrigin;

      // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
      // tick after the interaction event fired. To ensure the focus origin is always correct,
      // the focus origin will be determined at the beginning of the next tick.
      originTimeoutId.current = window.setTimeout(() => {
        origin.current = null;
      }, 1);
    },
    [],
  );

  const documentKeyDownListener = React.useCallback(
    /**
     * Event listener for `keydown` events on the document.
     * Needs to be an arrow function in order to preserve the context when it gets bound.
     */
    () => {
      lastTouchTarget.current = null;
      setOriginForCurrentEventQueue('keyboard');
    },
    [setOriginForCurrentEventQueue],
  );

  const documentMouseDownListener = React.useCallback(
    /**
     * Event listener for `mousedown` events on the document.
     * Needs to be an arrow function in order to preserve the context when it gets bound.
     */
    () => {
      // On mousedown record the origin only if there is not touch
      // target, since a mousedown can happen as a result of a touch event.
      if (!lastTouchTarget.current) {
        setOriginForCurrentEventQueue('mouse');
      }
    },
    [setOriginForCurrentEventQueue],
  );

  const documentTouchStartListener = React.useCallback(
    /**
     * Event listener for `touchstart` events on the document.
     * Needs to be an arrow function in order to preserve the context when it gets bound.
     * @param event {TouchEvent}
     */
    (event) => {
      // When the touchstart event fires the focus event is not yet in the event queue. This means
      // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
      // see if a focus happens.
      if (touchTimeoutId.current != null) {
        window.clearTimeout(touchTimeoutId.current);
      }

      // Since this listener is bound on the `document` level, any events coming from the shadow DOM
      // will have their `target` set to the shadow root. If available, use `composedPath` to
      // figure out the event target.
      lastTouchTarget.current = event.composedPath ? event.composedPath()[0] : event.target;
      touchTimeoutId.current = window.setTimeout(() => {
        lastTouchTarget.current = null;
      }, TOUCH_BUFFER_MS);
    },
    [],
  );

  const windowFocusListener = React.useCallback(
    /**
     * Event listener for `focus` events on the window.
     * Needs to be an arrow function in order to preserve the context when it gets bound.
     */
    () => {
      // Make a note of when the window regains focus, so we can
      // restore the origin info for the focused element.
      windowFocused.current = true;
      windowFocusTimeoutId.current = window.setTimeout(() => {
        windowFocused.current = false;
      }, 0);
    },
    [setOriginForCurrentEventQueue],
  );

  const monitor = React.useCallback(
    /**
     * Monitors focus on an element and applies appropriate CSS classes.
     * @param options {Object}
     * @param options.element {HTMLElement} The element to monitor
     * @param options.checkChildren {boolean} Whether to count the element as focused when its
     * children are focused.
     * @param options.callback {function} Callback to invoke when the focus origin has changed
     */
    (options) => {
      const { element, checkChildren, callback } = options;
      if (!is('browser')) return;

      if (elementInfo.current.has(element)) return;

      const info = { checkChildren, callback };

      elementInfo.current.set(element, info);
      updateMonitoredCount(count => count + 1);

      const focusListener = event => onFocus(event, element);
      const blurListener = event => onBlur(event, element);

      element.addEventListener('focus', focusListener, true);
      element.addEventListener('blur', blurListener, true);

      info.unlisten = () => {
        element.removeEventListener('focus', focusListener, true);
        element.removeEventListener('blur', blurListener, true);
      };
    },
    [updateMonitoredCount, onFocus, onBlur],
  );

  const stopMonitoring = React.useCallback(
    /**
     * Stops monitoring an element and removes all focus classes.
     * @param element {HTMLElement} The element to stop monitoring.
     */
    (element) => {
      const info = elementInfo.current.get(element);

      if (info) {
        info.unlisten();
        elementInfo.current.delete(element);
        updateMonitoredCount(count => count - 1);
      }
    },
    [updateMonitoredCount],
  );

  const focusVia = React.useCallback(
    /**
     * Focuses the element via the specified focus origin.
     * @param element {HTMLElement} Element to focus.
     * @param origin {FocusOrigin} Focus origin.
     * @param [options] {FocusOptions} Options that can be used to configure the focus behavior.
     */
    (element, origin, options) => {
      setOriginForCurrentEventQueue(origin);

      if (typeof element.focus === 'function') {
        element.focus(options);
      }
    },
    [setOriginForCurrentEventQueue]
  );

  const clearEventListeners = React.useCallback(() => {
    // Unregister global listeners when last element is unmonitored.
    document.removeEventListener('keydown', documentKeyDownListener,
      captureEventListenerOptions);
    document.removeEventListener('mousedown', documentMouseDownListener,
      captureEventListenerOptions);
    document.removeEventListener('touchstart', documentTouchStartListener,
      captureEventListenerOptions);
    window.removeEventListener('focus', windowFocusListener,
      captureEventListenerOptions);

    // Clear timeouts for all potentially pending timeouts to prevent the leaks.
    window.clearTimeout(windowFocusTimeoutId.current);
    window.clearTimeout(touchTimeoutId.current);
    window.clearTimeout(originTimeoutId.current);

  }, [
    documentKeyDownListener,
    documentMouseDownListener,
    documentTouchStartListener,
    windowFocusListener,
  ]);

  const bindEventListeners = React.useCallback(() => {
    if (is('browser')) {
      // Note: we listen to events in the capture phase so we
      // can detect them even if the user stops propagation.
      document.addEventListener('keydown', documentKeyDownListener,
        captureEventListenerOptions);
      document.addEventListener('mousedown', documentMouseDownListener,
        captureEventListenerOptions);
      document.addEventListener('touchstart', documentTouchStartListener,
        captureEventListenerOptions);
      window.addEventListener('focus', windowFocusListener);

    }
  }, [
    is,
    documentKeyDownListener,
    documentMouseDownListener,
    documentTouchStartListener,
    windowFocusListener,
  ]);

  // Track bound state of global listeners.
  React.useEffect(() => {
    if (lastMonitoredElementCount.current !== monitoredElementCount) {
      if (
        lastMonitoredElementCount.current === 0
        && monitoredElementCount > 0
        && !listenersBound.current
      ) {
        bindEventListeners();
        listenersBound.current = true;
      } else if (
        lastMonitoredElementCount.current > 0
        && monitoredElementCount === 0
        && listenersBound.current
      ) {
        clearEventListeners();
        listenersBound.current = false;
      }

      lastMonitoredElementCount.current = monitoredElementCount;
    }
  }, [monitoredElementCount, bindEventListeners, clearEventListeners]);

  React.useEffect(() => {
    return () => {
      elementInfo.current.forEach((info, element) => {
        stopMonitoring(element);
      });
    };
  }, [stopMonitoring]);

  const provider = React.useMemo(() => ({
    monitor,
    stopMonitoring,
    focusVia,
  }), [monitor, stopMonitoring, focusVia]);

  return (
    <FocusMonitorContext.Provider value={provider}>
      { children }
    </FocusMonitorContext.Provider>
  );
}

export default FocusMonitor;
