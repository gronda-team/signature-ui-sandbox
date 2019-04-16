import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  FocusMonitorDefaultProps, FocusMonitorPropTypes,
  withFocusMonitor,
} from '../../cdk/a11y';
import { stack } from '../core/components/util';
import {
  RadioButtonRoot, RadioContainer, RadioInnerCircle, RadioInput, RadioLabel, RadioLabelContent,
  RadioOuterCircle,
} from './styles/index';
import { withRadioGroupConsumer } from './context';
import {ButtonToggleRoot} from '../button-toggle/styles';

class RadioButton extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-radio:');

    this.state = {
      focusOrigin: null,
    };
  }
  
  /**
   * Lifecycle
   */
  componentWillUnmount() {
    this.props.__focusMonitor.stopMonitoring(this.RADIO_ROOT);
  }
  
  /**
   * Refs
   */
  getRadioRootRef = (radioRoot) => {
    this.RADIO_ROOT = radioRoot;
    if (radioRoot) {
      this.props.__focusMonitor.monitor({
        id: this.DEFAULT_ID,
        element: radioRoot,
        checkChildren: true,
        callback: touchRadioGroupFromMonitor.bind(this),
      });
    }
  };
  
  getRadioInputRef = (radioInput) => {
    this.RADIO_INPUT = radioInput;
  };
  
  /**
   * Derived data
   */
  /** Get the final ID */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** ID of the native input element inside `<mat-radio-button>` */
  getInputId = () => `${this.getId()}-input`;
  
  /** Get the native input's name value */
  getName = () => this.props.name || this.props.__radioGroup.name;
  
  /** Whether this radio is checked. */
  getChecked = () => {
    if (this.props.__radioGroup) {
      return _.get(this.props.__radioGroup, 'value') === this.props.value;
    }
    
    return this.props.checked;
  };
  
  /** Whether the label should appear after or before the radio button. Defaults to 'after' */
  getLabelPosition = () => {
    if (this.props.labelPosition) return this.props.labelPosition;
    if (this.props.__radioGroup) return _.get(this.props.__radioGroup, 'labelPosition');
    return 'after';
  };
  
  /** Whether the radio button is disabled. */
  getDisabled = () => {
    const radioGroupDisabled = _.get(this.props.__radioGroup, 'disabled', false);
    return this.props.disabled || radioGroupDisabled;
  };
  
  /** Whether the radio button is required. */
  getRequired = () => {
    const radioGroupRequired = _.get(this.props.__radioGroup, 'required', false);
    return this.props.required || radioGroupRequired;
  };
  
  /**
   * Actions
   */
  /** Input click handler */
  onClick = (event) => {
    /*
    nesting input inside label element will cause onChange to be triggered
    twice. We don't want that.
    */
    event.stopPropagation();
    if (_.isFunction(this.props.onClick)) {
      this.props.onClick(event);
    }
  };
  
  // Note: under normal conditions focus shouldn't land on this element, however it may be
  // programmatically set, for example inside of a focus trap, in this case we want to forward
  // the focus to the native element.
  onFocus = () => {
    if (this.RADIO_INPUT) {
      this.RADIO_INPUT.focus();
    }
  };
  
  /**
   * Triggered when the radio button received a click or the input recognized any change.
   * Clicking on a label element will trigger a change event on the associated input.
   */
  onChange = (event) => {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
    if (this.props.__radioGroup) {
      _.invoke(this.props.__radioGroup, 'onChange', event);
      
      this.props.__radioGroup.touch();
    }
    
    if (_.isFunction(this.props.onChange)) {
      this.props.onChange(event);
    }
  };
  
  render() {
    const { // keep className and style on root component
      id, style, className, tabIndex, labelBefore,
      __focusMonitor, __radioGroup, children,
      ['aria-label']: ariaLabel, ['aria-describedby']: ariaDescribedBy,
      ['aria-labelledby']: ariaLabelledBy,
      ...restProps
    } = this.props;
    
    const checked = this.getChecked();
    const disabled = this.getDisabled();
    
    return (
      <RadioButtonRoot
        style={style}
        className={className}
        id={this.getId()}
        tabIndex={null}
        data-focused={!!this.state.focusOrigin}
        data-focus-origin={this.state.focusOrigin}
        data-disabled={disabled}
        data-checked={checked}
        onFocus={this.onFocus}
        ref={this.getRadioRootRef}
      >
        <RadioLabel
          htmlFor={this.getInputId()}
        >
          {/* The actual radio part of the control */}
          <RadioContainer>
            <RadioOuterCircle />
            <RadioInnerCircle />
            <RadioInput
              {...restProps}
              type="radio"
              id={this.getInputId()}
              checked={checked}
              disabled={disabled}
              tabIndex={tabIndex}
              name={this.getName()}
              required={this.getRequired()}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              onChange={this.onChange}
              onClick={this.onClick}
              ref={this.getRadioInputRef}
            />
          </RadioContainer>
          {/* The label content for radio control */}
          <RadioLabelContent
            data-label-position={this.getLabelPosition() === 'before'}
          >
            {/* Add invisible span so JAWS can read the label */}
            <span style={{ display: 'none' }}>&nbsp;</span>
            { this.props.children }
          </RadioLabelContent>
        </RadioLabel>
      </RadioButtonRoot>
    )
  }
}

const RadioButtonPropTypes = {
  id: PropTypes.string,
  /** Whether the label should appear after or before the radio button. Defaults to 'after' */
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /** The value of this radio button. */
  value: PropTypes.any,
  /** Whether this radio is checked. */
  checked: PropTypes.bool,
  /** Whether the radio button is disabled. */
  disabled: PropTypes.bool,
  /** Whether the radio button is required. */
  required: PropTypes.bool,
  /** Radio button's tabIndex */
  tabIndex: PropTypes.number,
};

const RadioButtonDefaultProps = {
  id: null,
  labelPosition: null,
  value: null,
  checked: false,
  disabled: null,
  required: null,
  tabIndex: null,
  '__sui-internal-type': 'RadioButton',
};

RadioButton.propTypes = {
  ...RadioButtonPropTypes,
  __radioGroup: PropTypes.shape({
    labelPosition: PropTypes.oneOf(['before', 'after']),
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    name: PropTypes.string,
    touch: PropTypes.func,
  }),
  __focusMonitor: FocusMonitorPropTypes,
};

RadioButton.defaultProps = {
  ...RadioButtonDefaultProps,
  /** Radio groups are OPTIONAL */
  __radioGroup: null,
  __focusMonitor: FocusMonitorDefaultProps,
};

const StackedRadioButton = stack(
  withRadioGroupConsumer,
  withFocusMonitor,
)(RadioButton);

StackedRadioButton.propTypes = RadioButtonPropTypes;
StackedRadioButton.defaultProps = RadioButtonDefaultProps;

export default StackedRadioButton;

/**
 * Private methods
 */
function touchRadioGroupFromMonitor(origin) {
  this.setState({ focusOrigin: origin });
  if (!origin && this.props.__radioGroup) {
    this.props.__radioGroup.touch();
  }
}
