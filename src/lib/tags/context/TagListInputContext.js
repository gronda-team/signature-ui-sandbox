import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../../cdk/util';

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
  // Must be a class so we can pass refs
  class WithTagInputConsumer extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;

      return (
        <TagInputConsumer>
          { value => (
            <Component
              {...restProps}
              __tagListInput={value}
              ref={forwardedRef}
            />
          )}
        </TagInputConsumer>
      );
    }
  }

  function forwardRef(props, ref) {
    return <WithTagInputConsumer {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithTagList(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  TagInputContextPropTypes,
  TagInputContextDefaultProps,
  TagInputProvider,
  TagInputConsumer,
  withTagInputConsumer,
};
