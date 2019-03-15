import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const RadioGroupContextPropTypes = PropTypes.shape({
  touch: PropTypes.func,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.any,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
});

const RadioGroupContextDefaultProps = {
  touch: _.noop,
  onChange: _.noop,
  name: null,
  value: null,
  required: false,
  disabled: false,
};

const {
  Provider: RadioGroupProvider,
  Consumer: RadioGroupConsumer,
} = React.createContext(RadioGroupContextDefaultProps);

/*
Convenience function
 */
function withRadioGroupConsumer(Component) {
  function WithRadioGroupConsumer(props) {
    return (
      <RadioGroupConsumer>
        { value => <Component {...props} __radioGroup={value} />}
      </RadioGroupConsumer>
    );
  }
  
  WithRadioGroupConsumer.displayName = `WithRadioGroupConsumer(${Component.displayName})`;
  
  return WithRadioGroupConsumer;
}

export {
  RadioGroupContextPropTypes,
  RadioGroupContextDefaultProps,
  RadioGroupProvider,
  RadioGroupConsumer,
  withRadioGroupConsumer,
};
