import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getDisplayName } from '../../../util';

export const InteractivityCheckerPropTypes = PropTypes.shape({
  isDisabled: PropTypes.func,
  isVisible: PropTypes.func,
  isTabbable: PropTypes.func,
  isFocusable: PropTypes.func,
});

export const InteractivityCheckerDefaultProps = {
  isDisabled: _.noop,
  isVisible: _.noop,
  isTabbable: _.noop,
  isFocusable: _.noop,
};

export const {
  Provider: InteractivityCheckerProvider,
  Consumer: InteractivityCheckerConsumer,
} = React.createContext(
  InteractivityCheckerDefaultProps,
);

export function withInteractivityChecker(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithInteractivityChecker extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <InteractivityCheckerConsumer>
          { value => (
            <Component
              {...restProps}
              __interactivity={value}
              ref={forwardedRef}
            />
          )}
        </InteractivityCheckerConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithInteractivityChecker {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithInteractivityChecker(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}
