import * as React from 'react';
import _ from 'lodash';
import {
  withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes,
  normalizePassiveListenerOptions,
} from '../platform';
import { TEXT_FIELD_ANIMATION_END, TEXT_FIELD_ANIMATION_START } from './styles/index';
import { AutofillProvider } from './context/AutofillContext';

const LISTENER_OPTIONS = normalizePassiveListenerOptions({ passive: true });

/**
 * A context that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
class AutofillMonitor extends React.Component {
  constructor() {
    super();
    
    this.state = {
      monitoredElements: [], // contain all of the listeners here
    };
  }

  /**
   * Lifecycle
   */
  componentWillUnmount() {
    // Remove all listeners
    this.state.monitoredElements.forEach(({ id }) => {
      this.stopMonitoring(id);
    });
  }

  /**
   * Derived data
   */
  providerValue = () => ({
    monitor: this.monitor,
    stopMonitoring: this.stopMonitoring,
  });
  
  /**
   * Actions
   */
  /** Monitor for changes in the autofill state of the given input element. */
  monitor = ({ element, callback, id }) => {
    if (!this.props.__platform.is('browser')) return;

    const existingInfo = _.find(this.state.monitoredElements, { id });
    if (existingInfo) return;

    // Add the important styling
    element.dataset.autofillMonitored = 'true';
    
    // Animation events fire on initial element render, we check for the presence of the autofill
    // CSS class to make sure this is a real change in state, not just the initial render before
    // we fire off events.
    const listener = (event) => {
      // debug: unsure if this returns `true` or `"true"`
      const elementAutofillStatus = _.get(element.dataset, 'autofilled','null');
      if (
        event.animationName.indexOf(TEXT_FIELD_ANIMATION_START) > -1
        && elementAutofillStatus !== 'true'
      ) {
        // If we're animating, then the callback should be called with true
        callback({ target: event.target, isAutofilled: true });
      } else if (
        event.animationName.indexOf(TEXT_FIELD_ANIMATION_END) > -1
        && elementAutofillStatus === 'true'
      ) {
        // Otherwise, call the callback with false
        callback({ target: event.target, isAutofilled: false });
      }
    };
    // create element info
    const info = {
      element,
      id,
      // create unlistener here so componentWillUnmount can trigger it
      unlisten: () => {
        element.removeEventListener('animationstart', listener, LISTENER_OPTIONS);
        delete element.dataset.autofillMonitored;
      },
    };
    
    this.setState(state => ({
      monitoredElements: [...state.monitoredElements, info],
    }), () => {
      // set it on the next tick
      element.addEventListener('animationstart', listener, LISTENER_OPTIONS);
    });
  };
  
  /** Stops monitoring an element and removes all focus classes. */
  stopMonitoring = (id) => {
    const index = _.findIndex(this.state.monitoredElements, { id });
    
    if (index > -1) {
      const elementInfo = this.state.monitoredElements[index];
      elementInfo.unlisten();
      this.setState((state) => {
        const monitoredElements = [...state.monitoredElements];
        monitoredElements.splice(index, 1);
        return { monitoredElements };
      });
    }
  };
  
  render() {
    return (
      <AutofillProvider value={this.providerValue()}>
        { this.props.children }
      </AutofillProvider>
    )
  }
}

AutofillMonitor.propTypes = {
  __platform: PlatformPropTypes,
};

AutofillMonitor.defaultProps = {
  __platform: PlatformDefaultProps,
};

const StackedAutofillMonitor = withPlatformConsumer(AutofillMonitor);

export default StackedAutofillMonitor;
