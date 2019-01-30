import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../util';

const ViewportContextPropTypes = PropTypes.shape({
  getViewportSize: PropTypes.func,
  getViewportRect: PropTypes.func,
  getViewportScrollPosition: PropTypes.func,
  add: PropTypes.func,
  remove: PropTypes.func,
});

const ViewportContextDefaultProps = {
  getViewportSize: _.noop,
  getViewportRect: _.noop,
  getViewportScrollPosition: _.noop,
  add: _.noop,
  remove: _.noop,
};

const {
  Provider: ViewportRulerProvider,
  Consumer: ViewportRulerConsumer,
} = React.createContext(ViewportContextDefaultProps);

ViewportRulerConsumer.displayName = 'ViewportRuler';

function withViewportRuler(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithViewportRuler extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <ViewportRulerConsumer>
          { value => (
            <Component
              {...restProps}
              __viewportRuler={value}
              ref={forwardedRef}
            />
          )}
        </ViewportRulerConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithViewportRuler {...props} forwardedRef={ref} />
  }

  forwardRef.displayName = `WithViewportRuler(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  ViewportRulerConsumer, ViewportRulerProvider, withViewportRuler,
  ViewportContextPropTypes, ViewportContextDefaultProps,
};
