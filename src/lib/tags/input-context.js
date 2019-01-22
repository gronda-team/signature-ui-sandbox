import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const TagInputContextPropTypes = PropTypes.shape({
  setTagInputState: PropTypes.func,
  keydown: PropTypes.func,
  isFocused: PropTypes.func,
  blur: PropTypes.func,
});

const TagInputContextDefaultProps = {
  setTagInputState: _.noop,
  keydown: _.noop,
  isFocused: _.noop,
  blur: _.noop,
};

const {
  Provider: TagInputProvider,
  Consumer: TagInputConsumer,
} = React.createContext(TagInputContextDefaultProps);

/*
Convenience function
 */
function withTagInputConsumer(Component) {
  function WithTagInputConsumer(props) {
    return (
      <TagInputConsumer>
        { value => <Component {...props} __tagListInput={value} />}
      </TagInputConsumer>
    );
  }
  
  WithTagInputConsumer.displayName = `WithTagInputConsumer${Component.displayName}`;
  
  return WithTagInputConsumer;
}

export {
  TagInputContextPropTypes,
  TagInputContextDefaultProps,
  TagInputProvider,
  TagInputConsumer,
  withTagInputConsumer,
};
