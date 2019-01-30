import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../../util';

// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;

export const FocusMonitorPropTypes = PropTypes.shape({
  focusVia: PropTypes.func,
  monitor: PropTypes.func,
  stopMonitoring: PropTypes.func,
});

export const FocusMonitorDefaultProps = {
  focusVia: _.noop,
  monitor: _.noop,
  stopMonitoring: _.noop,
};

export const {
  Provider: FocusMonitorProvider,
  Consumer: FocusMonitorConsumer,
} = React.createContext(
  FocusMonitorDefaultProps,
);

export function withFocusMonitor(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithFocusMonitor extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <FocusMonitorConsumer>
          { value => (
            <Component
              {...restProps}
              __focusMonitor={value}
              ref={forwardedRef}
            />
          )}
        </FocusMonitorConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithFocusMonitor {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithFocusMonitor(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}
