import * as React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import { OptionTextWrapper, OptionWrapper, PanelWrapper } from './styles';
import { PROP_TYPE_STRING_OR_NUMBER } from '../../prop-types';
import asFocusableOption from '../../collection/focusable';

class Option extends React.Component {
  id = this.props.id || uniqueId('sui-option-');
  
  onSelectionChange = () => {
  
  };
  
  render() {
    const { selected, group, disabled, label, multiple, ...restProps } = this.props;
    return (
      <OptionWrapper
        {...restProps}
        innerRef={this.props.forwardedRef}
        id={this.id}
        role="option"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-selected={selected}
        aria-disabled={disabled}
      >
        <OptionTextWrapper>
          { this.props.children }
        </OptionTextWrapper>
      </OptionWrapper>
    )
  }
}

Option.propTypes = {
  selected: PropTypes.bool,
  group: PROP_TYPE_STRING_OR_NUMBER,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  value: PROP_TYPE_STRING_OR_NUMBER,
  label: PROP_TYPE_STRING_OR_NUMBER,
};

Option.defaultProps = {
  selected: false,
  group: null,
  disabled: false,
  multiple: false,
  value: null,
  label: null,
};

export default asFocusableOption(Option);
