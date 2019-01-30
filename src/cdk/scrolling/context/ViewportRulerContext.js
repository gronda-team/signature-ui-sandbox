import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

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
  Provider: ViewportRulerProvider, Consumer: ViewportRulerConsumer
} = React.createContext(ViewportContextDefaultProps);

ViewportRulerConsumer.displayName = 'ViewportRuler';

function withViewportRuler(Component) {
  function WithViewportRuler(props) {
    return (
      <ViewportRulerConsumer>
        { value => <Component {...props} __viewportRuler={value} />}
      </ViewportRulerConsumer>
    )
  }
  
  WithViewportRuler.displayName = `WithViewportRuler(${Component.displayName})`;
  
  return WithViewportRuler;
}

export {
  ViewportRulerConsumer, ViewportRulerProvider, withViewportRuler,
  ViewportContextPropTypes, ViewportContextDefaultProps,
};
