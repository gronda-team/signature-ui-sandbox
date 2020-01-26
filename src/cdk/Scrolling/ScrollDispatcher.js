import * as React from 'react';
import noop from 'lodash/noop';
import throttle from 'lodash/throttle';
import { ScrollDispatcherContext } from './context';
import { usePlatform } from '../Platform';

/** Time in ms to throttle the scrolling events by default. */
const DEFAULT_SCROLL_TIME = 20;

function ScrollDispatcher({ children }) {
  const is = usePlatform();

  /**
   * Keeps track of the global `scroll` and `resize` event handlers.
   * @type {React.MutableRefObject<boolean>}
   */
  const hasListenersAttached = React.useRef(false);

  /**
   * List of listeners to be iterated through for the scroll event.
   * @type {React.MutableRefObject<Function[]>}
   */
  const listeners = React.useRef([]);

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   * @type {React.MutableRefObject<Set<HTMLElement>>}
   */
  const currentScrollContainers = React.useRef(new Set());

  /**
   * Iterates through all of the listeners and invokes them one at a time.
   * @type {Function}
   */
  const handleScrollForGlobalListeners = React.useCallback((event) => {
    const currentListeners = listeners.current;

    for (let i = 0; i < currentListeners.length; i++) {
      const listener = currentListeners[i];
      listener(event);
    }
  }, []);

  /**
   * Noop event listener since we don't want to do anything with the scroll event.
   * @type {Function}
   */
  const noopEventListener = React.useCallback((event) => {
    handleScrollForGlobalListeners();
  }, [handleScrollForGlobalListeners]);

  /** Adds global scroll listener */
  const addGlobalListener = React.useCallback(() => {
    window.document.addEventListener('scroll', noopEventListener);
    hasListenersAttached.current = true;
  }, [noopEventListener]);

  /** Removes global scroll listener */
  const removeGlobalListener = React.useCallback(() => {
    if (hasListenersAttached.current) {
      window.document.removeEventListener('scroll', noopEventListener);
      hasListenersAttached.current = false;
    }
  }, [noopEventListener]);

  /**
   * Returns a cleanup function. Takes a callback that is called when the window fires a
   * scrolled event. Can provide a time in ms to override the default "throttle" time.
   * @type {function(callback: Function, throttleTime: number): Function}
   */
  const scrolled = React.useCallback((callback, throttleTime = DEFAULT_SCROLL_TIME) => {
    if (!is('browser')) return noop;

    if (!hasListenersAttached.current) {
      addGlobalListener();
    }

    // In the case of a 0ms delay, don't actually throttle the callback
    // since it does add a perceptible delay in processing overhead.
    const throttledCallback = throttleTime > 0 ?
      throttle(callback, throttleTime, { leading: false }) :
      callback;

    listeners.current.push(throttledCallback);

    // Return cleanup function to remove the listener
    return () => {
      const currentIndex = listeners.current.indexOf(throttledCallback);
      if (currentIndex > -1) {
        listeners.current.splice(currentIndex, 1);
      }

      if (!listeners.current.length) {
        removeGlobalListener();
      }
    };
  }, [addGlobalListener, removeGlobalListener]);

  /**
   * Callback to register an HTML element
   */
  const register = React.useCallback((element) => {
    currentScrollContainers.current.add(element);
  }, []);

  /**
   * Callback to register an HTML element
   */
  const deregister = React.useCallback((element) => {
    currentScrollContainers.current.delete(element);
  }, []);

  /**
   * Returns true if the element is contained within the provided Scrollable.
   * @type {function(potentialAncestor: HTMLElement, element: HTMLElement): boolean}
   */
  const scrollableContainsElement = React.useCallback((potentialAncestor, element) => {
    let el = element;

    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      if (el === potentialAncestor) {
        return true;
      }

      el = el.parentElement;
    } while (el);

    return false;
  }, []);

  /**
   * Returns all registered Scrollables that contain the provided element.
   * @type {function(element: HTMLElement): HTMLElement[]}
   */
  const getAncestorScrollContainers = React.useCallback((element) => {
    const scrollingContainers = [];

    currentScrollContainers.current.forEach((el) => {
      if (scrollableContainsElement(el, element)) {
        scrollingContainers.push(el);
      }
    });

    return scrollingContainers;
  }, [scrollableContainsElement]);

  /**
   * Accepts a callback that emits whenever any of the
   * scrollable ancestors of an element are scrolled.
   * @param elementRef Element whose ancestors to listen for.
   * @param auditTimeInMs Time to throttle the scroll events.
   */
  const onAncestorScroll = React.useCallback((element, callback, throttleTime) => {
    const ancestors = getAncestorScrollContainers(element);
    const filtered = (event) => {
      const target = event ? event.target : null;

      // Accept only when the ancestor has scrolled
      if (!target || ancestors.indexOf(target) > -1) {
        callback(event);
      }
    };

    return scrolled(filtered, throttleTime);
  }, [getAncestorScrollContainers, scrolled]);

  // Bind global events when the scroll event has changed
  React.useEffect(() => {
    if (hasListenersAttached.current) {
      window.document.addEventListener('scroll', noopEventListener);
    }

    return () => {
      window.document.removeEventListener('scroll', noopEventListener);
    };
  }, [noopEventListener]);

  // Clean up when unmounting
  React.useEffect(() => {
    return () => {
      currentScrollContainers.current.clear();
      removeGlobalListener();
    };
  }, [removeGlobalListener]);

  const provider = React.useMemo(() => ({
    register,
    deregister,
    handleScrollForGlobalListeners,
    getAncestorScrollContainers,
    onAncestorScroll,
    onScroll: scrolled,
  }), [
    register,
    deregister,
    handleScrollForGlobalListeners,
    getAncestorScrollContainers,
    onAncestorScroll,
    scrolled,
  ]);

  return (
    <ScrollDispatcherContext.Provider value={provider}>
      { children }
    </ScrollDispatcherContext.Provider>
  );
}

export default ScrollDispatcher;
