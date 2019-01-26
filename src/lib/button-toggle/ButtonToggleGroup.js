import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ButtonToggleGroupRoot } from './styles/index';
import { ButtonToggleGroupProvider } from './context/ButtonToggleGroupContext';
import { SelectionModel } from '../../cdk/collections';

class ButtonToggleGroup extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_NAME = _.uniqueId('sui-button-toggle-group:');
    this.selectionModel = React.createRef();
  }

  /**
   * Derived data
   */
  getName = () => this.props.name || this.DEFAULT_NAME;

  providerValue = () => ({
    name: this.getName(),
    selectionModel: this.selectionModel.current ?
      this.selectionModel.current :
      { isSelected: _.noop, toggle: _.noop },
    multiple: this.props.multiple,
    disabled: this.props.disabled,
    onTouched: this.props.onTouched,
    onChange: this.props.onChange,
  });
  
  render() {
    const {
      vertical, multiple, disabled, name, onTouched,
      onSelectionChange, onChange, value, ...restProps,
    } = this.props;
    return (
      <SelectionModel
        multiple={multiple}
        onChange={onSelectionChange}
        value={value}
        ref={this.selectionModel}
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
  /** Callback called in the form of { added: [], removed: [] } */
  onSelectionChange: PropTypes.func,
};

const ButtonToggleGroupDefaultProps = {
  vertical: false,
  value: null,
  multiple: false,
  disabled: false,
  name: '',
  onTouched: _.noop,
  onChange: _.noop,
  onSelectionChange: _.noop,
};

ButtonToggleGroup.propTypes = {
  ...ButtonToggleGroupPropTypes,
};

ButtonToggleGroup.defaultProps = {
  ...ButtonToggleGroupDefaultProps,
};

export default ButtonToggleGroup;
