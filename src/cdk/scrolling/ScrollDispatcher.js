import * as React from 'react';
import _ from 'lodash';
import { PlatformPropTypes, PlatformDefaultProps, withPlatformConsumer } from '../platform';
import { ScrollDispatcherProvider } from './context/ScrollDispatcherContext';

/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20; // ms

/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
class ScrollDispatcher extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /*
      todo: rethink this?
      rethink this idea because the presence/subscription of listeners
      isn't crucial (?) for component updates
      
      an alternative would be just to have a private property this.LISTENERS,
      since it's not reactive
       */
      listeners: [],
      provide: {
        register: this.register,
        add: this.add,
        remove: this.remove,
      },
    };
  
    /**
     * Array of all the scrollable references that are registered with the service and their
     * scroll event subscriptions.
     *
     * Keyed by a random ID generated from _.uniqueId and given an object of the callback,
     * debounce time, and ID
     */
    this.SCROLLABLE_CONTAINERS = new Map();
    
    this.performOnScroll = performOnScroll.bind(this);
  }
  
  /**
   * Lifecycle
   */
  componentWillUnmount() {
    removeGlobalListener.call(this);
  }
  
  /**
   * Actions
   */
  /**
   * Registers a scrollable instance with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event to its scrolled observable.
   *
   * Note: this means that when we're scrolling in this non-window element, then it would trigger
   * a callback of all the listeners.
   *
   * todo: do this
   */
  register = (scrollable) => {
    if (!this.SCROLLABLE_CONTAINERS.has(scrollable)) {
    
    }
  };
  
  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
   * to override the default "throttle" time.
   *
   * **Note:** in order to avoid hitting change detection for every scroll event,
   * all of the events emitted from this stream will be run outside the Angular zone.
   * If you need to update any data bindings as a result of a scroll event, you have
   * to run the callback using `NgZone.run`.
   */
  add = ({ id, callback = _.noop, throttleTime = DEFAULT_SCROLL_TIME }) => {
    if (!this.props.__platform.is('browser')) return null;
    
    /*
    Side effect
     */
    if (!this.GLOBAL_SUBSCRIPTION) addGlobalListener.call(this);
    
    this.setState((state) => ({
      listeners: [...state.listeners, {
        id,
        callback: throttleTime > 0 ? _.debounce(callback, throttleTime) : callback,
      }],
    }));
  };
  
  /** Remove scroll listener for cleanup */
  remove = (id) => {
    this.setState((state) => {
      const listeners = [...state.listeners];
      const index = _.findIndex(listeners, { id });
      if (index > -1) {
        listeners.splice(index, 1);
        return { listeners };
      }
      return null;
    }, () => {
      if (!this.state.listeners.length) {
        removeGlobalListener.call(this);
      }
    });
  };
  
  render() {
    return (
      <ScrollDispatcherProvider value={this.state.provide}>
        { this.props.children }
      </ScrollDispatcherProvider>
    );
  }
}

ScrollDispatcher.propTypes = {
  __platform: PlatformPropTypes,
};

ScrollDispatcher.propTypes = {
  __platform: PlatformDefaultProps,
};

export default withPlatformConsumer(ScrollDispatcher);

/**
 * Private functions
 */
/** Perform each of the callbacks when called */
function performOnScroll() {
  _.forEach(this.state.listeners, (listener) => {
    if (_.isFunction(listener.callback)) {
      listener.callback();
    }
  });
}

/** Sets up the global scroll listeners. */
function addGlobalListener() {
  this.GLOBAL_SUBSCRIPTION = _.defer(() => {
    window.document.addEventListener('scroll', this.performOnScroll);
  });
}

/** Cleans up the global scroll listener. */
function removeGlobalListener() {
  if (this.GLOBAL_SUBSCRIPTION) {
    window.document.removeEventListener('scroll', this.performOnScroll);
    this.GLOBAL_SUBSCRIPTION = null; // GC this guy
  }
}
