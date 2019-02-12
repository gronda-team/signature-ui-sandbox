import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../../../cdk/util';

const OptionParentPropTypes = PropTypes.shape({
  onSelectionChange: PropTypes.func,
  multiple: PropTypes.bool,
  activeItem: PropTypes.any,
});

const OptionParentDefaultProps = {
  onSelectionChange: _.noop,
  multiple: false,
  activeItem: null,
};

const {
  Provider: OptionParentProvider,
  Consumer: OptionParentConsumer,
} = React.createContext(OptionParentDefaultProps);

function withOptionParentConsumer(Component) {
  class WithOptionParent extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <OptionParentConsumer>
          { value => (
            <Component
              {...restProps}
              __parent={value}
              ref={forwardedRef}
            />
          ) }
        </OptionParentConsumer>
      );
    }
  }

  function forwardRef(props, ref) {
    return <WithOptionParent {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithOptionParent(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}

export {
  OptionParentPropTypes,
  OptionParentDefaultProps,
  OptionParentProvider,
  OptionParentConsumer,
  withOptionParentConsumer,
};
