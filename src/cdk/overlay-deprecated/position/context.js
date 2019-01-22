import * as React from 'react';
import _ from 'lodash';

const { Consumer, Provider } = React.createContext({
  __paneStyles: {},
  __boundingBoxStyles: {},
  __setBoundingBox: _.noop,
  __setPane: _.noop,
  __setRoot: _.noop,
});

export const PositionStrategyProvider = Provider;
export const PositionStrategyConsumer = Consumer;

export function withPositionStrategyProvider(Component) {
  function WithPositionStrategyProvider(props) {
    return (
      <PositionStrategyProvider>
        <Component {...props} />
      </PositionStrategyProvider>
    );
  }
  
  WithPositionStrategyProvider.displayName = `WithPositionStrategyProvider(${Component.displayName})`;
  
  return WithPositionStrategyProvider;
}

export function withPositionStrategyConsumer(Component) {
  function WithPositionStrategyConsumer(props) {
    return (
      <PositionStrategyConsumer>
        { value => (
          <Component {...props} {...value} />
        )}
      </PositionStrategyConsumer>
    );
  }
  
  WithPositionStrategyConsumer.displayName = `WithPositionStrategyConsumer(${Component.displayName})`;
  
  return WithPositionStrategyConsumer;
}
