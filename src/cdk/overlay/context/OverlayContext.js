import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const OverlayContextPropTypes = PropTypes.shape({
  create: PropTypes.func,
  attach: PropTypes.func,
  detach: PropTypes.func,
  dispose: PropTypes.func,
  updateSize: PropTypes.func,
  updatePosition: PropTypes.func,
  setPositionStrategy: PropTypes.func,
  setScrollStrategy: PropTypes.func,
  host: PropTypes.node,
  pane: PropTypes.node,
  backdrop: PropTypes.node,
  canRender: PropTypes.func,
  created: PropTypes.bool,
  attached: PropTypes.bool,
});

const OverlayContextDefaultProps = {
  create: _.noop,
  attach: _.noop,
  detach: _.noop,
  dispose: _.noop,
  updateSize: _.noop,
  updatePosition: _.noop,
  setPositionStrategy: _.noop,
  setScrollStrategy: _.noop,
  host: null,
  pane: null,
  backdrop: null,
  canRender: _.noop,
  created: false,
  attached: false,
};

const {
  Provider: OverlayProvider, Consumer: OverlayConsumer
} = React.createContext(OverlayContextDefaultProps);

// This corresponds to 'Accordion.Consumer' and 'Accordion.Provider'
OverlayConsumer.displayName = 'Overlay';

function withOverlayConsumer(Component) {
  function WithOverlayConsumer(props) {
    return (
      <OverlayConsumer>
        { value => <Component {...props} __overlay={value} />}
      </OverlayConsumer>
    )
  }
  
  WithOverlayConsumer.displayName = `WithOverlay(${Component.displayName})`;
  
  return WithOverlayConsumer;
}

export {
  OverlayConsumer, OverlayProvider, withOverlayConsumer,
  OverlayContextPropTypes, OverlayContextDefaultProps,
};
