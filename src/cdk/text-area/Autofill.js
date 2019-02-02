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
      allIds: [], // reactive entry point because window.Map isn't reactive
    };
    
    this.MONITORED_ELEMENTS = new Map();
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
    
    // Check if we're already monitoring this element.
    if (this.MONITORED_ELEMENTS.has(element)) return;
    
    // Generate a new ID for callback
    const defaultId = id || _.uniqueId('sui-autofill-monitor:');
    
    // Animation events fire on initial element render, we check for the presence of the autofill
    // CSS class to make sure this is a real change in state, not just the initial render before
    // we fire off events.
    const listener = (event) => {
      // debug: unsure if this returns `true` or `"true"`
      const elementAutofillStatus = _.get(element, ['dataset', 'autofilled']);
      console.log(elementAutofillStatus);
      if (
        event.animationName === TEXT_FIELD_ANIMATION_START.getName()
        && elementAutofillStatus !== 'true'
      ) {
        callback({ target: event.target, isAutofilled: true });
      } else if (
        event.animationName === TEXT_FIELD_ANIMATION_END.getName()
        && elementAutofillStatus === 'true'
      ) {
        callback({ target: event.target, isAutofilled: false });
      }
    };
    // create element info
    const info = {
      element,
      id: defaultId,
      // create unlistener here so componentWillUnmount can trigger it
      unlisten: () => element.removeEventListener('animationstart', listener, LISTENER_OPTIONS),
    };
    
    this.setState(state => ({
      // trigger a change
      allIds: [...state.allIds, defaultId],
    }), () => {
      // set it on the next tick
      this.MONITORED_ELEMENTS.set(element, info);
      element.addEventListener('animationstart', listener, LISTENER_OPTIONS);
    });
  };
  
  /** Stops monitoring an element and removes all focus classes. */
  stopMonitoring = (element) => {
    const elementInfo = this.ELEMENT_INFO.get(element);
    
    if (elementInfo) {
      elementInfo.unlisten();
      this.setState((state) => {
        const id = elementInfo.id;
        return {
          allIds: _.without(state.allIds, id),
        };
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
