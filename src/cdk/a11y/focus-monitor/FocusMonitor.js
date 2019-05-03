import * as React from 'react';
import _ from 'lodash';
import {
  withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes,
  normalizePassiveListenerOptions,
} from '../../platform';
import {FocusMonitorProvider, TOUCH_BUFFER_MS} from './context/FocusMonitorContext';

class FocusMonitor extends React.Component {
  constructor() {
    super();
    
    this.state = {
      // where we key the monitoring information
      elementInfo: [],
      provide: {
        monitor: this.monitor,
        stopMonitoring: this.stopMonitoring,
        focusVia: this.focusVia,
      },
    };

    this.ORIGIN = null;
    this.LAST_FOCUS_ORIGIN = null;
    this.WINDOW_FOCUSED = false;
    this.LAST_TOUCH_TARGET = null;
    this.TOUCH_TIMEOUT_ID = null;
    this.WINDOW_FOCUS_TIMEOUT_ID = null;
    this.ORIGIN_TIMEOUT_ID = null;
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.state.elementInfo.length > 0 && prevState.elementInfo.length === 0) {
      // if we're incrementing the state from zero to one
      registerGlobalListeners.call(this);
    } else if (this.state.elementInfo.length === 0 && prevState.elementInfo.length > 0) {
      // if we're decrementing from one to zero
      this.UNREGISTER.call(this);
      this.UNREGISTER = () => {};
    }
  }
  
  componentWillUnmount() {
    this.state.elementInfo.forEach((info) => {
      this.stopMonitoring(info.id);
    });
  }
  
  /**
   * Derived data
   */
  /**
   * Monitors focus on an element and applies appropriate CSS classes.
   * @param element The element to monitor
   * @param checkChildren Whether to count the element as focused when its children are focused.
   * @param callback The callback to call whenever the element receives a blur event
   * @param id The id that is required to associate this component with the focus monitor
   */
  monitor = ({ element, id, checkChildren = false, callback = _.noop }) => {
    if (!this.props.__platform.is('browser')) return;
  
    // Check if we're already monitoring this element.
    if (_.find(this.state.elementInfo, { element }) > -1) return;
    
    // Create monitored element info.
    const defaultId = id || _.uniqueId('sui-focus-monitor:');
    const info = {
      id: defaultId,
      element,
      checkChildren,
      callback,
      unlisten: () => {
        element.removeEventListener('focus', focusListener, true);
        element.removeEventListener('blur', blurListener, true);
      },
    };
  
    // Start listening. We need to listen in capture phase since focus events don't bubble.
    const focusListener = (event) => onFocus.call(this, event, element);
    const blurListener = (event) => onBlur.call(this, event, element);
    
    this.setState((state) => {
      // add the information to the state
      return {
        elementInfo: [...state.elementInfo, info],
      };
    }, () => {
      // add the event listeners on the next tick
      element.addEventListener('focus', focusListener, true);
      element.addEventListener('blur', blurListener, true);
    });
  };
  
  /**
   * Stops monitoring an element and removes all focus classes.
   * @param element The element to stop monitoring.
   */
  stopMonitoring = (element) => {
    const index = _.findIndex(this.state.elementInfo, { element });
    
    if (index > -1) {
      const elementInfo = this.state.elementInfo[index];
      elementInfo.unlisten();

      this.setState((state) => {
        return {
          elementInfo: [...state.elementInfo].splice(0, index, 1),
        };
      });
    }
  };
  
  /**
   * Focuses the element via the specified focus origin.
   * @param element Element to focus.
   * @param origin Focus origin.
   * @param options Options that can be used to configure the focus behavior.
   */
  focusVia(element, origin, options) {
    setOriginForCurrentEventQueue.call(this, origin);
    
    if (typeof element.focus === 'function') {
      element.focus(options);
    }
  }
  
  render() {
    return (
      <FocusMonitorProvider value={this.state.provide}>
        { this.props.children }
      </FocusMonitorProvider>
    )
  }
}

FocusMonitor.propTypes = {
  __platform: PlatformPropTypes,
};

FocusMonitor.defaultProps = {
  __platform: PlatformDefaultProps,
};

export default withPlatformConsumer(FocusMonitor);

/**
 * Private methods
 */
/** Register necessary event listeners on the document and window. */
function registerGlobalListeners() {
  // Do nothing if we're not on the browser platform.
  if (!this.props.__platform.is('browser')) return;
  
  // On keydown record the origin and clear any touch event that may be in progress.
  let documentKeydownListener = () => {
    this.LAST_TOUCH_TARGET = null;
    window.setTimeout(() => {
      setOriginForCurrentEventQueue.call(this, 'keyboard');
    });
  };
  
  // On mousedown record the origin only if there is not touch target, since a mousedown can
  // happen as a result of a touch event.
  let documentMousedownListener = () => {
    if (!this.LAST_TOUCH_TARGET) {
      setOriginForCurrentEventQueue.call(this, 'mouse');
    }
  };
  
  // When the touchstart event fires the focus event is not yet in the event queue. This means
  // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
  // see if a focus happens.
  let documentTouchstartListener = (event) => {
    if (this.TOUCH_TIMEOUT_ID !== null) {
      window.clearTimeout(this.TOUCH_TIMEOUT_ID);
    }

    this.LAST_TOUCH_TARGET = event.target;
    this.TOUCH_TIMEOUT_ID = window.setTimeout(() => {
      this.LAST_TOUCH_TARGET = null;
    }, TOUCH_BUFFER_MS);
  };
  
  // Make a note of when the window regains focus, so we can restore the origin info for the
  // focused element.
  let windowFocusListener = () => {
    this.WINDOW_FOCUSED = true;
    this.WINDOW_FOCUS_TIMEOUT_ID = window.setTimeout(() => {
      this.WINDOW_FOCUSED = false;
    });
  };
  
  // Event listener options that enable capturing and also mark the the listener as passive
  // if the browser supports it.
  const captureEventListenerOptions = normalizePassiveListenerOptions({
    passive: true, capture: true,
  });
  
  // Note: we listen to events in the capture phase so we can detect them even if the user stops
  // propagation.
  document.addEventListener('keydown', documentKeydownListener, captureEventListenerOptions);
  document.addEventListener('mousedown', documentMousedownListener, captureEventListenerOptions);
  document.addEventListener('touchstart', documentTouchstartListener, captureEventListenerOptions);
  window.addEventListener('focus', windowFocusListener);
  
  this.UNREGISTER = () => {
    document.removeEventListener('keydown', documentKeydownListener, captureEventListenerOptions);
    document.removeEventListener('mousedown', documentMousedownListener, captureEventListenerOptions);
    document.removeEventListener('touchstart', documentTouchstartListener, captureEventListenerOptions);
    window.removeEventListener('focus', windowFocusListener);
  
    // Clear timeouts for all potentially pending timeouts to prevent the leaks.
    window.clearTimeout(this.WINDOW_FOCUS_TIMEOUT_ID);
    window.clearTimeout(this.TOUCH_TIMEOUT_ID);
    window.clearTimeout(this.ORIGIN_TIMEOUT_ID);
  };
}

/**
 * Sets the origin and schedules an async function to clear it at the end of the event queue.
 * @param origin The origin to set.
 */
function setOriginForCurrentEventQueue(origin) {
  this.ORIGIN = origin;
  this.ORIGIN_TIMEOUT_ID = window.setTimeout(() => {
    // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
    // tick after the interaction event fired. To ensure the focus origin is always correct,
    // the focus origin will be determined at the beginning of the next tick.
    this.ORIGIN = null;
  }, 1);
}

/**
 * Checks whether the given focus event was caused by a touchstart event.
 * @param event The focus event to check.
 * @returns Whether the event was caused by a touch.
 */
function wasCausedByTouch(event) {
  // Note(mmalerba): This implementation is not quite perfect, there is a small edge case.
  // Consider the following dom structure:
  //
  // <div #parent tabindex="0" cdkFocusClasses>
  //   <div #child (click)="#parent.focus()"></div>
  // </div>
  //
  // If the user touches the #child element and the #parent is programmatically focused as a
  // result, this code will still consider it to have been caused by the touch event and will
  // apply the cdk-touch-focused class rather than the cdk-program-focused class. This is a
  // relatively small edge-case that can be worked around by using
  // focusVia(parentEl, 'program') to focus the parent element.
  //
  // If we decide that we absolutely must handle this case correctly, we can do so by listening
  // for the first focus event after the touchstart, and then the first blur event after that
  // focus event. When that blur event fires we know that whatever follows is not a result of the
  // touchstart.
  let focusTarget = event.target;
  return this.LAST_TOUCH_TARGET instanceof Node && focusTarget instanceof Node &&
    (focusTarget === this.LAST_TOUCH_TARGET || focusTarget.contains(this.LAST_TOUCH_TARGET));
}

/**
 * Handles focus events on a registered element.
 * @param event The focus event.
 * @param element The monitored element.
 */
function onFocus(event, element) {
  // NOTE(mmalerba): We currently set the classes based on the focus origin of the most recent
  // focus event affecting the monitored element. If we want to use the origin of the first event
  // instead we should check for the cdk-focused class here and return if the element already has
  // it. (This only matters for elements that have includesChildren = true).
  
  // If we are not counting child-element-focus as focused, make sure that the event target is the
  // monitored element itself.
  const elementInfo = _.find(this.state.elementInfo, { element });
  if (!elementInfo || (!elementInfo.checkChildren && element !== event.target)) {
    return;
  }
  
  // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
  // 1) The window has just regained focus, in which case we want to restore the focused state of
  //    the element from before the window blurred.
  // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
  // 3) The element was programmatically focused, in which case we should mark the origin as
  //    'program'.
  let origin = this.ORIGIN;
  if (!origin) {
    if (this.WINDOW_FOCUSED && this.LAST_FOCUS_ORIGIN) {
      origin = this.LAST_FOCUS_ORIGIN;
    } else if (wasCausedByTouch.call(this, event)) {
      origin = 'touch';
    } else {
      origin = 'program';
    }
  }

  // call the callback
  elementInfo.callback(origin);
  this.LAST_FOCUS_ORIGIN = origin;
}

/**
 * Handles blur events on a registered element.
 * @param event The blur event.
 * @param element The monitored element.
 */
function onBlur(event, element) {
  // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
  // order to focus another child of the monitored element.
  const elementInfo = _.find(this.state.elementInfo, { element });

  if (
    !elementInfo
    || (elementInfo.checkChildren && event.relatedTarget instanceof Node && element.contains(event.relatedTarget))
  ) {
    return;
  }

  // call the callback
  elementInfo.callback(null);
}
