import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  ButtonToggleButton, ButtonToggleFocusOverlay, ButtonToggleLabelContent,
  ButtonToggleRoot,
} from './styles/index';
import { ButtonToggleGroupContextPropTypes, withButtonToggleGroupConsumer } from './context';
import {
  SelectionModelDefaultProps, SelectionModelPropTypes,
  withSelectionModelConsumer,
} from '../../cdk/collections/selection-model';
import {
  FocusMonitorDefaultProps, FocusMonitorPropTypes,
  withFocusMonitor,
} from '../../cdk/a11y/focus-monitor';
import { stack } from '../core/components/util';

class ButtonToggle extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-button-toggle:');
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
    if (this.props.__buttonToggleGroup) {
      // return the toggle group selection
      return this.props.__selectionModel.isSelected(this.props.value);
    }
    
    return this.props.checked;
  };
  
  /** Whether the button is disabled. */
  isDisabled = () => this.props.disabled || _.get(this.props.__buttonToggleGroup, 'disabled');
  
  /** Get the focus origin according to the focus monitor */
  getFocusMonitorStatus = () => {
    if (!this.NATIVE_BUTTON) return {};
    return this.props.__focusMonitor.getInfo(this.NATIVE_BUTTON) || {};
  };
  
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
    if (this.props.__buttonToggleGroup) {
      this.props.__buttonToggleGroup.onTouched();
    }
    
    this.props.__selectionModel.toggle(this.props.value);
  
    // Emit a change event when it's the single selector
    this.props.onChange({ value: this.props.value, source: this.NATIVE_BUTTON });
  };
  
  render() {
    const {
      disabled, checked,
      ['aria-label']: ariaLabel,
      ['aria-labelledby']: ariaLabelledBy,
      __selectionModel,
      __buttonToggleGroup,
      type, value, onChange,
      ...restProps,
    } = this.props;
    const disabledStatus = this.isDisabled();
    const checkedStatus = this.isChecked();
    const monitor = this.getFocusMonitorStatus();
    return (
      <ButtonToggleRoot
        {...restProps}
        id={this.getId()}
        tabIndex={-1}
        onFocus={this.focus}
        data-disabled={disabledStatus}
        data-checked={checkedStatus}
        data-standalone={!this.props.__buttonToggleGroup}
        data-focused={monitor.focused}
        data-focus-origin={monitor.origin}
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
          innerRef={this.getButtonToggleButton}
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
  /** Event emitted when the group value changes. */
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
  __selectionModel: SelectionModelPropTypes,
};

ButtonToggle.defaultProps = {
  ...ButtonToggleDefaultProps,
  __focusMonitor: FocusMonitorDefaultProps,
  __buttonToggleGroup: null,
  __selectionModel: SelectionModelDefaultProps,
};

const StackedButtonToggle = stack(
  withButtonToggleGroupConsumer,
  withSelectionModelConsumer,
  withFocusMonitor,
)(ButtonToggle);

StackedButtonToggle.propTypes = ButtonTogglePropTypes;
StackedButtonToggle.defaultProps = ButtonToggleDefaultProps;

export default StackedButtonToggle;
