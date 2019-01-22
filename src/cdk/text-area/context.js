import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const AutoFillMonitorPropTypes = PropTypes.shape({
  monitor: PropTypes.func,
  stopMonitoring: PropTypes.func,
});

const AutoFillMonitorDefaultProps = {
  monitor: _.noop,
  stopMonitoring: _.noop,
};

const {
  Provider: AutoFillProvider,
  Consumer: AutoFillConsumer,
} = React.createContext(AutoFillMonitorDefaultProps);

/*
Convenience function
 */
function withAutoFillMonitor(Component) {
  function WithAutoFillConsumer(props) {
    return (
      <AutoFillConsumer>
        { value => <Component {...props} __autoFillMonitor={value} />}
      </AutoFillConsumer>
    );
  }
  
  WithAutoFillConsumer.displayName = `WithRadioGroupConsumer(${Component.displayName})`;
  
  return WithAutoFillConsumer;
}

export {
  AutoFillMonitorPropTypes,
  AutoFillMonitorDefaultProps,
  AutoFillProvider,
  AutoFillConsumer,
  withAutoFillMonitor,
};
