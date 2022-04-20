import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  ButtonToggleButton, ButtonToggleFocusOverlay, ButtonToggleLabelContent,
  ButtonToggleRoot,
} from './styles/index';
import { ButtonToggleGroupContextPropTypes, withButtonToggleGroupConsumer } from './context/ButtonToggleGroupContext';
import {
  FocusMonitorDefaultProps, FocusMonitorPropTypes,
  withFocusMonitor,
} from '../../cdk/a11y';
import { stack } from '../core/components/util';

class ButtonToggle extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-button-toggle:');

    this.state = {
      focusOrigin: null,
    };
  }
  /**
   * Lifecycle
   */
  componentWillUnmount() {
    // unlisten
    this.props.__focusMonitor.stopMonitoring(this.NATIVE_BUTTON);
  }
  
  /**
   * refs
   */
  getButtonToggleButton = (buttonToggleButton) => {
    this.NATIVE_BUTTON = buttonToggleButton;
    if (buttonToggleButton) {
      this.props.__focusMonitor.monitor({
        element: buttonToggleButton,
        checkChildren: true,
        callback: (origin) => {
          this.setState({ focusOrigin: origin });
        },
      });
    }
  };
  
  /**
   * Derived data
   */
  /** The unique ID for this button toggle. */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Unique ID for the underlying `button` element. */
  getButtonId = () => `${this.getId()}-button`;
  
  /** Get the tab index */
  getTabIndex = () => {
    const index = _.toNumber(this.props.tabIndex);
    return _.isNumber(index) ? index : null
  };
  
  /** Whether the button is checked. */
  isChecked = () => {
    if (_.get(this.props.__buttonToggleGroup, 'selectionModel')) {
      // return the toggle group selection
      return this.props.__buttonToggleGroup.selectionModel.isSelected(this.props.value);
    }
    
    return this.props.checked;
  };
  
  /** Whether the button is disabled. */
  isDisabled = () => this.props.disabled || _.get(this.props.__buttonToggleGroup, 'disabled');
  
  /**
   * Actions
   */
  /** Focuses the button. */
  focus = () => {
    if (this.NATIVE_BUTTON) {
      this.NATIVE_BUTTON.focus();
    }
  };
  
  /** Checks the button toggle due to an interaction with the underlying native button. */
  onButtonClick = () => {
    let value = this.props.value;

    if (_.get(this.props.__buttonToggleGroup, 'name') !== null) {
      this.props.__buttonToggleGroup.onTouched();

      if (this.props.__buttonToggleGroup.selectionModel) {
        const selectionModel = this.props.__buttonToggleGroup.selectionModel;

        // Trigger BTG.props.onSelectionChange
        selectionModel.toggle(this.props.value);

        if (selectionModel.isMultipleSelection()) {
          // If we have multiple selection
          const selected = selectionModel.selected();
          if (selectionModel.isSelected(this.props.value)) {
            // If we already have the value, return the array without it
            value = _.without(selected, this.props.value);
          } else {
            // otherwise just append the value
            value = [...selectionModel.selected(), this.props.value];
          }
        } // otherwise just continue
      }
      this.props.__buttonToggleGroup.onChange({
        value,
        source: this.NATIVE_BUTTON
      });
    } else {
      value = this.isChecked() ? undefined : value;
    }
  
    // Emit a change event when it's the single selector
    this.props.onChange({
      value,
      source: this.NATIVE_BUTTON
    });
  };
  
  render() {
    const {
      disabled, checked,
      ['aria-label']: ariaLabel,
      ['aria-labelledby']: ariaLabelledBy,
      __buttonToggleGroup,
      type, value, onChange,
      ...restProps
    } = this.props;
    const disabledStatus = this.isDisabled();
    const checkedStatus = this.isChecked();
    return (
      <ButtonToggleRoot
        {...restProps}
        id={this.getId()}
        tabIndex={-1}
        onFocus={this.focus}
        data-disabled={disabledStatus}
        data-checked={checkedStatus}
        data-standalone={!this.props.__buttonToggleGroup}
        data-focused={!!this.state.focusOrigin}
        data-focus-origin={this.state.focusOrigin}
      >
        <ButtonToggleButton
          type="button"
          id={this.getButtonId()}
          tabIndex={this.getTabIndex()}
          disabled={disabledStatus || null}
          name={__buttonToggleGroup.name || null}
          aria-pressed={checkedStatus}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onClick={this.onButtonClick}
          ref={this.getButtonToggleButton}
        >
          <ButtonToggleLabelContent>
            { this.props.children }
          </ButtonToggleLabelContent>
        </ButtonToggleButton>
        <ButtonToggleFocusOverlay />
      </ButtonToggleRoot>
    );
  }
}

const ButtonTogglePropTypes = {
  /** Whether the button is checked. */
  checked: PropTypes.bool,
  /**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  'aria-label': PropTypes.string,
  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  'aria-labelledby': PropTypes.string,
  /** Type of the button toggle. Either 'radio' or 'checkbox'. */
  type: PropTypes.oneOf(['radio', 'checkbox']),
  /** MatButtonToggleGroup reads this to assign its own value. */
  value: PropTypes.any,
  /** Tabindex for the toggle. */
  tabIndex: PropTypes.number,
  /** Whether the button is disabled. */
  disabled: PropTypes.bool,
  /** Own onChange handler */
  onChange: PropTypes.func,
};

const ButtonToggleDefaultProps = {
  checked: false,
  'aria-label': null,
  'aria-labelledby': null,
  type: 'radio',
  value: null,
  tabIndex: null,
  onChange: _.noop,
};

ButtonToggle.propTypes = {
  ...ButtonTogglePropTypes,
  __focusMonitor: FocusMonitorPropTypes,
  __buttonToggleGroup: ButtonToggleGroupContextPropTypes,
};

ButtonToggle.defaultProps = {
  ...ButtonToggleDefaultProps,
  __focusMonitor: FocusMonitorDefaultProps,
  __buttonToggleGroup: null,
};

const StackedButtonToggle = stack(
  withButtonToggleGroupConsumer,
  withFocusMonitor,
)(ButtonToggle);

StackedButtonToggle.propTypes = ButtonTogglePropTypes;
StackedButtonToggle.defaultProps = ButtonToggleDefaultProps;

export default StackedButtonToggle;
