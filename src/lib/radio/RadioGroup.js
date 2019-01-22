import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { RadioGroupProvider } from './context';

class RadioGroup extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_NAME = _.uniqueId('sui-radio-group#name:');
  }
  
  /**
   * Derived data
   */
  /** Provider value */
  providerValue = () => ({
    touch: this.touch,
    name: this.getName(),
    value: this.props.value,
    required: this.props.required,
    disabled: this.props.disabled,
    labelPosition: this.props.labelPosition,
  });
  
  /** Get the final name */
  getName = () => this.props.name || this.DEFAULT_NAME;
  
  /**
   * Actions
   */
  /** Mark group as touched when RadioButton blurs */
  touch = () => {
    if (_.isFunction(this.props.onTouched)) {
      this.props.onTouched();
    }
  };
  
  render() {
    return (
      <RadioGroupRoot role="radiogroup">
        <RadioGroupProvider value={this.providerValue()}>
          { this.props.children }
        </RadioGroupProvider>
      </RadioGroupRoot>
    )
  }
}

const RadioGroupPropTypes = {
  /** Selected value for the radio group. */
  value: PropTypes.any,
  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  name: PropTypes.string,
  /** Whether the radio group is disabled. */
  disabled: PropTypes.bool,
  /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /** Whether the radio group is required. */
  required: PropTypes.bool,
  /** onTouch function */
  onTouched: PropTypes.func,
  /** Callback function when group value changes */
  onChange: PropTypes.func,
};

const RadioGroupDefaultProps = {
  value: null,
  name: null,
  disabled: false,
  labelPosition: 'after',
  required: false,
  onTouched: _.noop,
};

RadioGroup.propTypes = {
  ...RadioGroupPropTypes,
};

RadioGroup.propTypes = {
  ...RadioGroupDefaultProps,
};
