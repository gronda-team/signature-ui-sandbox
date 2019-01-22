import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const PositionStrategyPropTypes = PropTypes.shape({
  attach: PropTypes.func,
  apply: PropTypes.func,
  detach: PropTypes.func,
  dispose: PropTypes.func,
});

const PositionStrategyDefaultProps = {
  attach: _.noop,
  apply: _.noop,
  detach: _.noop,
  dispose: _.noop,
};

const {
  Provider: PositionStrategyProvider, Consumer: PositionStrategyConsumer
} = React.createContext(PositionStrategyDefaultProps);

PositionStrategyConsumer.displayName = 'PositionStrategy';

function withPositionStrategy(Component) {
  function WithPositionStrategy(props) {
    return (
      <PositionStrategyConsumer>
        { value => <Component {...props} __positionStrategy={value} />}
      </PositionStrategyConsumer>
    )
  }
  
  WithPositionStrategy.displayName = `WithPositionStrategy(${Component.displayName})`;
  
  return WithPositionStrategy;
}

export {
  PositionStrategyConsumer, PositionStrategyProvider, withPositionStrategy,
  PositionStrategyPropTypes, PositionStrategyDefaultProps,
};
