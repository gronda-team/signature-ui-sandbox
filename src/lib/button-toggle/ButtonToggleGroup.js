import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ButtonToggleGroupRoot } from './styles/index';
import { ButtonToggleGroupProvider } from './context';
import { SelectionModel } from '../../cdk/collections/selection-model';

class ButtonToggleGroup extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_NAME = _.uniqueId('sui-button-toggle-group:');
  }
  
  /**
   * Derived data
   */
  providerValue = () => ({
    name: this.props.name || this.DEFAULT_NAME,
    multiple: this.props.multiple,
    disabled: this.props.disabled,
    onTouched: this.props.onTouched,
  });
  
  render() {
    const {
      vertical, multiple, disabled, name, onTouched,
      onChange, value, ...restProps,
    } = this.props;
    return (
      <SelectionModel
        multiple={multiple}
        onChange={onChange}
        value={value}
      >
        <ButtonToggleGroupRoot
          {...restProps}
          role="group"
          aria-disabled={disabled}
          data-vertical={vertical}
        >
          <ButtonToggleGroupProvider value={this.providerValue()}>
            { this.props.children }
          </ButtonToggleGroupProvider>
        </ButtonToggleGroupRoot>
      </SelectionModel>
    );
  }
}

const ButtonToggleGroupPropTypes = {
  /** Whether the toggle group is vertical. */
  vertical: PropTypes.bool,
  /** Value of the toggle group. */
  value: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  /** Whether multiple button toggles can be selected. */
  multiple: PropTypes.bool,
  /** Whether button toggle group is disabled. */
  disabled: PropTypes.bool,
  /** `name` attribute for the underlying `input` element. */
  name: PropTypes.string,
  onTouched: PropTypes.func,
  /** Callback called whenever the value of the group changes. */
  onChange: PropTypes.func,
};

const ButtonToggleGroupDefaultProps = {
  vertical: false,
  value: null,
  multiple: false,
  disabled: false,
  name: '',
  onTouched: _.noop,
  onChange: _.noop,
};

ButtonToggleGroup.propTypes = {
  ...ButtonToggleGroupPropTypes,
};

ButtonToggleGroup.defaultProps = {
  ...ButtonToggleGroupDefaultProps,
};

export default ButtonToggleGroup;
