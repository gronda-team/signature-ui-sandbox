import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

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
  function WithScrollDispatcher(props) {
    return (
      <ScrollDispatcherConsumer>
        { value => <Component {...props} __scrollDispatcher={value} /> }
      </ScrollDispatcherConsumer>
    )
  }
  
  WithScrollDispatcher.displayName = `WithScrollDispatcher(${Component.displayName})`;
  
  return WithScrollDispatcher;
}

export {
  ScrollDispatcherPropTypes,
  ScrollDispatcherDefaultProps,
  ScrollDispatcherProvider,
  ScrollDispatcherConsumer,
  withScrollDispatcher
};