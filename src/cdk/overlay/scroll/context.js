import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const ScrollStrategyPropTypes = PropTypes.shape({
  attach: PropTypes.func,
  enable: PropTypes.func,
  disable: PropTypes.func,
});

const ScrollStrategyDefaultProps = {
  attach: _.noop,
  enable: _.noop,
  disable: _.noop,
};

const {
  Provider: ScrollStrategyProvider, Consumer: ScrollStrategyConsumer
} = React.createContext(ScrollStrategyDefaultProps);

ScrollStrategyConsumer.displayName = 'ScrollStrategy';

function withScrollStrategy(Component) {
  function WithScrollStrategy(props) {
    return (
      <ScrollStrategyConsumer>
        { value => <Component {...props} __scrollStrategy={value} />}
      </ScrollStrategyConsumer>
    )
  }
  
  WithScrollStrategy.displayName = `WithScrollStrategy(${Component.displayName})`;
  
  return WithScrollStrategy;
}

export {
  ScrollStrategyConsumer, ScrollStrategyProvider, withScrollStrategy,
  ScrollStrategyPropTypes, ScrollStrategyDefaultProps,
};
