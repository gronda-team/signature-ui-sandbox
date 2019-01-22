import * as React from 'react';
import PropTypes from 'prop-types';
import invoke from 'lodash/invoke';

export default function asFocusableOption(Component) {
  class FocusableOption extends React.Component {
    constructor() {
      super();
      this.FOCUSABLE = React.createRef();
    }
    
    componentDidUpdate(prevProps) {
      if (!prevProps.hasFocus && this.props.hasFocus) {
        invoke(this, 'FOCUSABLE.current.focus');
      } else if (prevProps.hasFocus && !this.props.hasFocus) {
        invoke(this, 'FOCUSABLE.current.blur');
      }
    }
    
    render() {
      const { hasFocus, ...restProps } = this.props;
      return (
        <Component
          {...restProps}
          forwardedRef={this.FOCUSABLE}
        />
      )
    }
  }
  
  FocusableOption.propTypes = {
    hasFocus: PropTypes.bool,
  };
  
  FocusableOption.defaultProps = {
    hasFocus: false,
  };
  
  FocusableOption.displayName = `FocusableOption(${Component.displayName || Component.name})`;
  
  return FocusableOption;
}
