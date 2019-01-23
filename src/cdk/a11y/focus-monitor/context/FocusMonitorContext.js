import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

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
