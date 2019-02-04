import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../util';

const ScrollDispatcherPropTypes = PropTypes.shape({
  register: PropTypes.func,
  add: PropTypes.func,
  remove: PropTypes.func,
});

const ScrollDispatcherDefaultProps = {
  register: _.noop,
  add: _.noop,
  remove: _.noop,
};

const {
  Provider: ScrollDispatcherProvider,
  Consumer: ScrollDispatcherConsumer
} = React.createContext(ScrollDispatcherDefaultProps);

function withScrollDispatcher(Component) {
  // Use a class to pass any refs down
  class WithScrollDispatcher extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <ScrollDispatcherConsumer>
          { value => (
            <Component
              {...restProps}
              __scrollDispatcher={value}
              ref={forwardedRef}
            />
          ) }
        </ScrollDispatcherConsumer>
      );
    }
  }

  function forwardRef(props, ref) {
    return <WithScrollDispatcher {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithScrollDispatcher(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  ScrollDispatcherPropTypes,
  ScrollDispatcherDefaultProps,
  ScrollDispatcherProvider,
  ScrollDispatcherConsumer,
  withScrollDispatcher
};
