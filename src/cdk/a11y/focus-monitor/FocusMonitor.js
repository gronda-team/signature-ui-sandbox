import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes,
  normalizePassiveListenerOptions,
} from '../../platform';

// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
const TOUCH_BUFFER_MS = 650;

const FocusMonitorPropTypes = PropTypes.shape({
  focusVia: PropTypes.func,
  monitor: PropTypes.func,
  stopMonitoring: PropTypes.func,
});

const FocusMonitorDefaultProps = {
  focusVia: _.noop,
  monitor: _.noop,
  stopMonitoring: _.noop,
};

const { Provider: FocusMonitorProvider, Consumer: FocusMonitorConsumer } = React.createContext(
  FocusMonitorDefaultProps,
);

class FocusMonitor extends React.Component {
  constructor() {
    super();
    
    this.state = {
      origin: null,
      lastFocusOrigin: null,
      windowFocused: false,
      lastTouchTarget: null,
      touchTimeoutId: null,
      windowFocusTimeoutId: null,
      originTimeoutId: null,
      // where we key the monitoring information
      elementInfo: [],
    };
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.state.elementInfo.length === 1 && prevState.elementInfo.length === 0) {
      // if we're incrementing the state from zero to one
      registerGlobalListeners.call(this);
    } else if (this.state.elementInfo.length === 0 && prevState.elementInfo.length === 1) {
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
  providerValue = () => ({
    monitor: this.monitor,
    stopMonitoring: this.stopMonitoring,
    focusVia: this.focusVia,
  });
  
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
    if (this.state.elementInfo.indexOf(id) > -1) return;
    
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
    
    if (_.isFunction(element.focus)) {
      element.focus(options);
    }
  }
  
  render() {
    return (
      <FocusMonitorProvider value={this.providerValue()}>
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

function withFocusMonitor(Component) {
  function WithFocusMonitor(props) {
    return (
      <FocusMonitorConsumer>
        { value => <Component {...props} __focusMonitor={value} />}
      </FocusMonitorConsumer>
    );
  }
  
  WithFocusMonitor.displayName = `WithFocusMonitor${Component.displayName}`;
  
  return WithFocusMonitor;
}

export {
  TOUCH_BUFFER_MS,
  FocusMonitorPropTypes,
  FocusMonitorDefaultProps,
  FocusMonitorProvider,
  FocusMonitorConsumer,
  withFocusMonitor,
};

/**
 * Private methods
 */
/** Register necessary event listeners on the document and window. */
function registerGlobalListeners() {
  // Do nothing if we're not on the browser platform.
  if (!this.props.__platform.is('browser')) return;
  
  // On keydown record the origin and clear any touch event that may be in progress.
  let documentKeydownListener = () => {
    this.setState({
      lastTouchTarget: null,
    }, () => {
      setOriginForCurrentEventQueue.call(this, 'keyboard');
    });
  };
  
  // On mousedown record the origin only if there is not touch target, since a mousedown can
  // happen as a result of a touch event.
  let documentMousedownListener = () => {
    if (!this.state.lastTouchTarget) {
      setOriginForCurrentEventQueue.call(this, 'mouse');
    }
  };
  
  // When the touchstart event fires the focus event is not yet in the event queue. This means
  // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
  // see if a focus happens.
  let documentTouchstartListener = (event) => {
    if (!_.isNil(this.state.touchTimeoutId)) {
      window.clearTimeout(this.state.touchTimeoutId);
    }
    
    this.setState({
      lastTouchTarget: event.target,
      touchTimeoutId: window.setTimeout(() => {
        this.setState({ lastTouchTarget: null });
      }, TOUCH_BUFFER_MS),
    });
  };
  
  // Make a note of when the window regains focus, so we can restore the origin info for the
  // focused element.
  let windowFocusListener = () => {
    this.setState({
      windowFocused: true,
      windowFocusTimeoutId: window.setTimeout(() => {
        this.setState({ windowFocused: false });
      }),
    });
  };
  
  // Event listener options that enable capturing and also mark the the listener as passive
  // if the browser supports it.
  const captureEventListenerOptions = normalizePassiveListenerOptions({
    passive: true, capture: true,
  });
  
  // Note: we listen to events in the capture phase so we can detect them even if the user stops
  // propagation.
  _.defer(() => {
    document.addEventListener('keydown', documentKeydownListener, captureEventListenerOptions);
    document.addEventListener('mousedown', documentMousedownListener, captureEventListenerOptions);
    document.addEventListener('touchstart', documentTouchstartListener, captureEventListenerOptions);
    window.addEventListener('focus', windowFocusListener);
  });
  
  this.UNREGISTER = () => {
    document.removeEventListener('keydown', documentKeydownListener, captureEventListenerOptions);
    document.removeEventListener('mousedown', documentMousedownListener, captureEventListenerOptions);
    document.removeEventListener('touchstart', documentTouchstartListener, captureEventListenerOptions);
    window.removeEventListener('focus', windowFocusListener);
  
    // Clear timeouts for all potentially pending timeouts to prevent the leaks.
    window.clearTimeout(this.state.windowFocusTimeoutId);
    window.clearTimeout(this.state.touchTimeoutId);
    window.clearTimeout(this.state.originTimeoutId);
  };
}

/**
 * Sets the origin and schedules an async function to clear it at the end of the event queue.
 * @param origin The origin to set.
 */
function setOriginForCurrentEventQueue(origin) {
  this.setState({
    origin,
    // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
    // tick after the interaction event fired. To ensure the focus origin is always correct,
    // the focus origin will be determined at the beginning of the next tick.
    originTimeoutId: window.setTimeout(() => {
      this.setState({ origin: null })
    }, 1),
  });
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
  return this.state.lastTouchTarget instanceof Node && focusTarget instanceof Node &&
    (focusTarget === this.state.lastTouchTarget || focusTarget.contains(this.state.lastTouchTarget));
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
  let origin = this.state.origin;
  if (!origin) {
    if (this.state.windowFocused && this.state.lastFocusOrigin) {
      origin = this.state.lastFocusOrigin;
    } else if (wasCausedByTouch.call(this, event)) {
      origin = 'touch';
    } else {
      origin = 'program';
    }
  }

  // call the callback
  elementInfo.callback(origin);
  this.setState({ lastFocusOrigin: origin });
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
