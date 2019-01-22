import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

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
  function WithKeyboardDispatcher(props) {
    return (
      <KeyboardDispatcherConsumer>
        { value => <Component {...props} __keyboardDispatcher={value} />}
      </KeyboardDispatcherConsumer>
    )
  }
  
  WithKeyboardDispatcher.displayName = `WithKeyboardDispatcher(${Component.displayName})`;
  
  return WithKeyboardDispatcher;
}

export {
  KeyboardDispatcherConsumer, KeyboardDispatcherProvider, withKeyboardDispatcher,
  KeyboardDispatcherPropTypes, KeyboardDispatcherDefaultProps,
};
