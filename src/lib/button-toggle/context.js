import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const ButtonToggleGroupContextPropTypes = PropTypes.shape({
  name: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  onTouched: PropTypes.func,
});

const ButtonToggleGroupContextDefaultProps = {
  name: null,
  multiple: false,
  disabled: false,
  onTouched: _.noop,
};

const {
  Provider: ButtonToggleGroupProvider,
  Consumer: ButtonToggleGroupConsumer,
} = React.createContext(ButtonToggleGroupContextDefaultProps);

/*
Convenience function
 */
function withButtonToggleGroupConsumer(Component) {
  function WithButtonToggleGroupConsumer(props) {
    return (
      <ButtonToggleGroupConsumer>
        { value => <Component {...props} __buttonToggleGroup={value} />}
      </ButtonToggleGroupConsumer>
    );
  }
  
  WithButtonToggleGroupConsumer.displayName = `WithButtonToggleGroupConsumer(${Component.displayName})`;
  
  return WithButtonToggleGroupConsumer;
}

export {
  ButtonToggleGroupContextPropTypes,
  ButtonToggleGroupContextDefaultProps,
  ButtonToggleGroupProvider,
  ButtonToggleGroupConsumer,
  withButtonToggleGroupConsumer,
};
