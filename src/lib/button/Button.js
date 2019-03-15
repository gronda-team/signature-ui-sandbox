import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ButtonRoot, ButtonFocusOverlay, ButtonWrapper } from './styles/index';
import { FocusMonitorPropTypes, FocusMonitorDefaultProps, withFocusMonitor } from '../../cdk/a11y';
import { ButtonDisabledOverlay } from './styles';

/** Default color palette for round buttons (mat-fab and mat-mini-fab) */
const DEFAULT_ROUND_BUTTON_COLOR = 'accent';

class Button extends React.Component {
  constructor(props) {
    super(props);
    
    this.BUTTON_ROOT = ButtonRoot.withComponent(props.is);

    this.state = {
      focusOrigin: null,
    };
  }
  
  /**
   * Lifecycle
   */
  componentWillUnmount() {
    this.props.__focusMonitor.stopMonitoring(this.BUTTON);
  }
  
  /**
   * Refs
   */
  // get Button ref
  getButtonRef = (button) => {
    this.BUTTON = button;
    if (button) {
      this.props.__focusMonitor.monitor({
        element: button,
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
  getNodeAttrs = () => {
    const disabled = this.props.disabled;
    return this.props.is === 'button' ?
      { disabled } : // if it's a button
      { // if it's a link, then we need to add more
        disabled,
        'aria-disabled': disabled.toString(),
        tabIndex: disabled ? -1 : (this.props.tabIndex || 0),
      };
  };
  
  /**
   * Actions
   */
  /** onClick handler */
  onClick = (event) => {
    if (this.props.is === 'a') {
      if (this.props.disabled) {
        // A disabled button shouldn't apply any actions
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    
    if (_.isFunction(this.props.onClick)) {
      this.props.onClick(event);
    }
  };
  
  render() {
    const { appearance, size, is, color, __focusMonitor, ...restProps } = this.props;
    return (
      <this.BUTTON_ROOT
        {...restProps}
        {...this.getNodeAttrs()}
        data-sui-type={'button'}
        data-appearance={appearance}
        data-size={size}
        data-color={color}
        data-focus-origin={this.state.focusOrigin}
        innerRef={this.getButtonRef}
        onClick={this.onClick}
      >
        <ButtonWrapper>{ this.props.children }</ButtonWrapper>
        <ButtonFocusOverlay />
        <ButtonDisabledOverlay />
      </this.BUTTON_ROOT>
    )
  }
}

const ButtonPropTypes = {
  /** HTML element */
  is: PropTypes.oneOf(['button', 'a']),
  /** Whether or not the button is disabled */
  disabled: PropTypes.bool,
  /** appearance, one of standard, flat, icon, raised, stroked, floating */
  appearance: PropTypes.oneOf(['standard', 'fill', 'stroked']),
  /** size of the button. icon, standard, full */
  size: PropTypes.oneOf(['icon', 'standard', 'full']),
  /** color: green = primary, grey = secondary */
  color: PropTypes.oneOf(['primary', 'secondary']),
};

const ButtonDefaultProps = {
  is: 'button',
  disabled: false,
  appearance: 'standard',
  size: 'standard',
  color: 'primary',
};

Button.propTypes = {
  ...ButtonPropTypes,
  /** Focus monitor */
  __focusMonitor: FocusMonitorPropTypes,
};

Button.defaultProps = {
  ...ButtonDefaultProps,
  __focusMonitor: FocusMonitorDefaultProps,
};

const MonitoredButton = withFocusMonitor(Button);
MonitoredButton.propTypes = ButtonPropTypes;
MonitoredButton.defaultProps = ButtonDefaultProps;
export default MonitoredButton;
