import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../util';

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
  // Must be a class component since refs can't exist on functional components
  class WithOverlayContainerConsumer extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <OverlayContainerConsumer>
          { value => (
            <Component
              {...restProps}
              __overlayContainer={value}
              ref={forwardedRef}
            />
          ) }
        </OverlayContainerConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithOverlayContainerConsumer {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithOverlayContainer(${getDisplayName(Component)})`;
  
  return React.forwardRef(forwardRef);
}

export {
  OverlayContainerConsumer, OverlayContainerProvider, withOverlayContainerConsumer,
  OverlayContainerPropTypes, OverlayContainerDefaultProps,
};
