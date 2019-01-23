import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  FocusMonitorDefaultProps, FocusMonitorPropTypes,
  withFocusMonitor,
} from '../../cdk/a11y';
import {
  CheckboxBackground, CheckboxCheckmark, CheckboxCheckmarkPath, CheckboxFrame, CheckboxInnerContainer, CheckboxInput,
  CheckboxLabel,
  CheckboxLayout,
  CheckboxRoot,
} from './styles/index';
import {ButtonToggleRoot} from '../button-toggle/styles';

class Checkbox extends React.Component {
  constructor() {
    super();
    this.DEFAULT_ID = _.uniqueId('sui-checkbox:');

    this.state = {
      focusOrigin: null,
    };
  }
  
  /**
   * Lifecycle
   */
  componentWillUnmount() {
    this.props.__focusMonitor.stopMonitoring(this.CHECKBOX_ROOT);
  }
  
  /**
   * Refs
   */
  getCheckboxRoot = (checkboxRoot) => {
    this.CHECKBOX_ROOT = checkboxRoot;
    if (checkboxRoot) {
      this.props.__focusMonitor.monitor({
        element: checkboxRoot,
        checkChildren: true,
        callback: monitorFocus.bind(this),
      });
    }
  };
  
  getCheckboxInput = (checkboxInput) => {
    this.CHECKBOX_INPUT = checkboxInput;
  };
  
  /**
   * Derived data
   */
  /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Returns the unique id for the visual hidden input. */
  getInputId = () => `${this.getId()}-input`;
  
  /** String representation of aria-checked */
  getAriaChecked = () => {
    if (this.props.checked) return 'true';
    return this.props.indeterminate ? 'mixed' : 'false';
  };
  
  /**
   * Actions, listeners
   */
  onInteractionEvent = (event) => {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
    if (_.isFunction(this.props.onChange)) {
      this.props.onChange(event);
    }
  };
  
  /**
   * Event handler for checkbox input element.
   * Toggles checked state if element is not disabled.
   * Do not toggle on (change) event since IE doesn't fire change event when
   *   indeterminate checkbox is clicked.
   * @param event
   */
  onInputClick = (event) => {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `checkbox` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
    if (_.isFunction(this.props.onClick)) {
      this.props.onClick(event);
    }
  };
  
  /** Focuses the checkbox. */
  focus = () => {
    this.props.__focusMonitor.focusVia(this.CHECKBOX_INPUT, 'keyboard');
  };
  
  render() {
    const {
      id, required, labelPosition, name, value, checked, disabled, tabIndex,
      'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy,
      __focusMonitor, onTouched, ...restProps,
    } = this.props;

    return (
      <CheckboxRoot
        {...restProps}
        innerRef={this.getCheckboxRoot}
        id={this.getId()}
        tabIndex={null}
        data-focused={!!this.state.focusOrigin}
        data-focus-origin={this.state.focusOrigin}
        data-label-position={labelPosition}
        data-disabled={disabled.toString()}
        data-checked={this.getAriaChecked()}
      >
        <CheckboxLayout
          htmlFor={this.getInputId()}
        >
          <CheckboxInnerContainer
            data-has-label={(!!this.props.children).toString()}
          >
            <CheckboxInput
              type="checkbox"
              id={this.getInputId()}
              required={required}
              checked={checked}
              value={value}
              disabled={disabled}
              name={name}
              tabIndex={tabIndex}
              aria-label={ariaLabel || null}
              aria-labelledby={ariaLabelledBy || null}
              aria-checked={this.getAriaChecked()}
              onChange={this.onInteractionEvent}
              onClick={this.onInputClick}
              innerRef={this.getCheckboxInput}
            />
            <CheckboxFrame />
            <CheckboxBackground>
              <CheckboxCheckmark
                version="1.1"
                focusable="false"
                viewBox="0 0 20 20"
              >
                <CheckboxCheckmarkPath
                  fill="none"
                  stroke="white"
                  d="M 5,10 8,13 15,7"
                />
              </CheckboxCheckmark>
            </CheckboxBackground>
          </CheckboxInnerContainer>
          <CheckboxLabel>
            {/* add an invisible span so JAWS can read the label */}
            <span style={{ display: 'none' }} />
            { this.props.children }
          </CheckboxLabel>
        </CheckboxLayout>
      </CheckboxRoot>
    )
  }
}

const CheckboxPropTypes = {
  /** id */
  id: PropTypes.string,
  /** Whether the checkbox is required. */
  required: PropTypes.bool,
  /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /** Name value will be applied to the input element if present */
  name: PropTypes.string,
  /** The value attribute of the native input element */
  value: PropTypes.any,
  /** Called when the checkbox is blurred */
  onTouched: PropTypes.func,
  /** Whether the checkbox is checked. */
  checked: PropTypes.bool,
  /** Whether the checkbox is disabled. */
  disabled: PropTypes.bool,
  /** Whether the checkbox is indeterminate (mixed mode) */
  indeterminate: PropTypes.bool,/**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  'aria-label': PropTypes.string,
  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  'aria-labelledby': PropTypes.string,
};

const CheckboxDefaultProps = {
  id: null,
  required: false,
  labelPosition: 'after',
  name: null,
  value: null,
  onTouched: _.noop,
  checked: false,
  disabled: false,
  indeterminate: false,
  'aria-label': null,
  'aria-labelledby': null,
};

Checkbox.propTypes = {
  ...CheckboxPropTypes,
  __focusMonitor: FocusMonitorPropTypes,
};

Checkbox.defaultProps = {
  ...CheckboxDefaultProps,
  __focusMonitor: FocusMonitorDefaultProps,
};

const MonitoredCheckbox = withFocusMonitor(Checkbox);

MonitoredCheckbox.propTypes = CheckboxPropTypes;
MonitoredCheckbox.defaultProps = CheckboxDefaultProps;

export default MonitoredCheckbox;

/**
 * Private methods
 */
function monitorFocus(origin) {
  this.setState({ focusOrigin: origin });
  if (!origin) {
    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
    // To work around this, we defer telling the form control it
    // has been touched until the next tick.
    _.defer(this.props.onTouched);
  }
}
