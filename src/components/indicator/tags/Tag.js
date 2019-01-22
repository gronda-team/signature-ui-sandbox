import React from 'react';
import PropTypes from 'prop-types';
import { BACKSPACE, DEL, DELETE, SPACE, SPACEBAR } from '../../core/keys'
import { TagStyle } from './styles'
import Close from '../../core/icons/Close';
import asFocusableOption from '../../core/collection/focusable';

class Tag extends React.Component {
  toggleSelected = () => {
    if (this.props.selected) {
      this.props.onDeselect();
    } else {
      this.props.onSelect();
    }
  };
  
  onClick = (event) => {
    if (this.props.disabled) return;
    event.preventDefault(); // don't focus
    event.stopPropagation();
  };
  
  onKeyDown = (event) => {
    if (this.props.disabled) {
      return;
    }
  
    switch (event.key) {
      case DELETE:
      case DEL:
      case BACKSPACE:
        this.props.onRemove();
        event.preventDefault(); // prevent navigation
        break;
      case SPACE:
      case SPACEBAR:
        if (this.props.selectable) {
          this.toggleSelected();
        }
        
        event.preventDefault(); // prevent going to bottom of page
        break;
      default: break;
    }
  };
  
  render() {
    const { disabled, children, selected, selectable, removable, onRemove, forwardedRef, ...restProps } = this.props;
    return (
      <TagStyle {...restProps} onClick={this.onClick} innerRef={forwardedRef} onKeyDown={this.onKeyDown} tabIndex={disabled ? null : -1} disabled={disabled || null} aria-disabled={disabled} aria-selected={selectable ? !!selected : null}>
        { children }
        { removable ?
          <Close onClick={onRemove} width={12} height={12} style={{ padding: '0 4px 0 8px', cursor: 'pointer' }} /> :
          null
        }
      </TagStyle>
    )
  }
}

Tag.propTypes = {
  forwardedRef: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  removable: PropTypes.bool,
  selected: PropTypes.bool,
  selectable: PropTypes.bool,
  // handling functions
  onSelect: PropTypes.func,
  onDeselect: PropTypes.func,
  onRemove: PropTypes.func,
};

Tag.defaultProps = {
  forwardedRef: null,
  value: null,
  disabled: false,
  removable: true,
  selected: false,
  selectable: true,
  // handling functions
  onSelect: () => {},
  onDeselect: () => {},
  onRemove: () => {},
};

export default asFocusableOption(Tag);
