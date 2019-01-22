import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const OverlayContainerPropTypes = PropTypes.shape({
  getContainer: PropTypes.func,
});

const OverlayContainerDefaultProps = {
  getContainer: _.noop,
};

const {
  Provider: OverlayContainerProvider, Consumer: OverlayContainerConsumer
} = React.createContext(OverlayContainerDefaultProps);

// This corresponds to 'Accordion.Consumer' and 'Accordion.Provider'
OverlayContainerConsumer.displayName = 'Overlay';

function withOverlayContainerConsumer(Component) {
  function WithOverlayContainerConsumer(props) {
    return (
      <OverlayContainerConsumer>
        { value => <Component {...props} __overlayContainer={value} />}
      </OverlayContainerConsumer>
    )
  }
  
  WithOverlayContainerConsumer.displayName = `WithOverlayContainer(${Component.displayName})`;
  
  return WithOverlayContainerConsumer;
}

export {
  OverlayContainerConsumer, OverlayContainerProvider, withOverlayContainerConsumer,
  OverlayContainerPropTypes, OverlayContainerDefaultProps,
};
