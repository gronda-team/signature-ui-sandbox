import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../util';

const KeyboardDispatcherPropTypes = PropTypes.shape({
  add: PropTypes.func,
  remove: PropTypes.func,
});

const KeyboardDispatcherDefaultProps = {
  add: _.noop,
  remove: _.noop,
};

const {
  Provider: KeyboardDispatcherProvider, Consumer: KeyboardDispatcherConsumer
} = React.createContext(KeyboardDispatcherDefaultProps);

KeyboardDispatcherConsumer.displayName = 'KeyboardDispatcher';

function withKeyboardDispatcher(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithKeyboardDispatcher extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <KeyboardDispatcherConsumer>
          { value => (
            <Component
              {...restProps}
              __keyboardDispatcher={value}
              ref={forwardedRef}
            />
          )}
        </KeyboardDispatcherConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithKeyboardDispatcher {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithKeyboardDispatcher(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  KeyboardDispatcherConsumer, KeyboardDispatcherProvider, withKeyboardDispatcher,
  KeyboardDispatcherPropTypes, KeyboardDispatcherDefaultProps,
};
