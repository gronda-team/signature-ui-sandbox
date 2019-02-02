import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../util';

const AutofillMonitorPropTypes = PropTypes.shape({
  monitor: PropTypes.func,
  stopMonitoring: PropTypes.func,
});

const AutofillMonitorDefaultProps = {
  monitor: _.noop,
  stopMonitoring: _.noop,
};

const {
  Provider: AutofillProvider,
  Consumer: AutofillConsumer,
} = React.createContext(AutofillMonitorDefaultProps);

/*
Convenience function
 */
function withAutofillMonitor(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithAutofillConsumer extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <AutofillConsumer>
          { value => (
            <Component
              {...restProps}
              __autofillMonitor={value}
              ref={forwardedRef}
            />
          )}
        </AutofillConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithAutofillConsumer {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName =
    `AutofillMonitored(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  AutofillMonitorPropTypes,
  AutofillMonitorDefaultProps,
  AutofillProvider,
  AutofillConsumer,
  withAutofillMonitor,
};
