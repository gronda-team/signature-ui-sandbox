import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getDisplayName } from '../../../cdk/util';

const ButtonToggleGroupContextPropTypes = PropTypes.shape({
  name: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  onTouched: PropTypes.func,
  value: PropTypes.array,
  onChange: PropTypes.func,
});

const ButtonToggleGroupContextDefaultProps = {
  name: null,
  multiple: false,
  disabled: false,
  onTouched: _.noop,
  value: [],
  onChange: _.noop,
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
  
  WithButtonToggleGroupConsumer.displayName = `WithButtonToggleGroupConsumer(${getDisplayName(Component)})`;
  
  return WithButtonToggleGroupConsumer;
}

export {
  ButtonToggleGroupContextPropTypes,
  ButtonToggleGroupContextDefaultProps,
  ButtonToggleGroupProvider,
  ButtonToggleGroupConsumer,
  withButtonToggleGroupConsumer,
};
