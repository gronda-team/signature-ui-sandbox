import * as React from 'react';
import PropTypes from 'prop-types';
import head from 'lodash/head';
import union from 'lodash/union';
import without from 'lodash/without';
import includes from 'lodash/includes';
import isFunction from 'lodash/isFunction';
import castArray from 'lodash/castArray';
import { PROP_TYPE_STRING_OR_NUMBER } from '../prop-types';

export default function withSelection(Component) {
  class WithSelection extends React.Component {
    getSelection = () => (
      this.props.multiple ?
        this.props.selection :
        castArray(this.props.selection)
    );
    
    onSelect = (value) => {
      if (isFunction(this.props.onChange)) {
        this.props.onChange(
          this.props.multiple ?
            union(this.props.selection, [value]) :
            [value]
        );
      }
    };
    
    onDeselect = (value) => {
      if (isFunction(this.props.onChange)) {
        this.props.onChange(without(this.props.selection, value));
      }
    };
    
    onToggle = (value) => {
      if (includes(this.props.selection, value)) {
        this.onDeselect(value);
      } else {
        this.onSelect(value);
      }
    };
    
    onClear = () => {
      if (isFunction(this.props.onChange)) {
        this.props.onChange([]);
      }
    };
    
    render() {
      const { onChange, selection, ...restProps } = this.props;
      return (
        <Component
          {...restProps}
          selection={this.props.multiple ? this.getSelection() : head(this.getSelection())}
          select={this.onSelect}
          deselect={this.onDeselect}
          toggle={this.onToggle}
          clear={this.onClear}
        />
      )
    }
  }
  
  WithSelection.propTypes = {
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    selection: PropTypes.oneOfType([
      PROP_TYPE_STRING_OR_NUMBER,
      PropTypes.arrayOf(PROP_TYPE_STRING_OR_NUMBER),
    ]),
  };
  
  WithSelection.defaultProps = {
    multiple: false,
    onChange: () => {},
    selection: [],
  };
  
  WithSelection.displayName = `WithSelection(${Component.displayName || Component.name})`;
  
  return WithSelection;
}