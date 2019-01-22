import * as React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { InputStyle } from './styles';
import { withFormFieldContext } from '../context/form-field';

const INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];

class Input extends React.Component {
  getDescribedByIds() {
    // This is returned by
    return this.props.__describedByIds.join(' ');
  }
  
  componentDidMount() {
    this.onUpdateRequired();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.required !== this.props.required) {
      this.onUpdateRequired();
    }
  }
  
  onUpdateRequired = () => {
    this.props.__handleRequired();
  };
  
  render() {
    const { __errorState, __describedByIds, ui, disabled, required, ...restProps } = this.props;
    return (
      <InputStyle
        {...restProps}
        required={required}
        disabled={disabled || ui === 'disabled'}
        aria-invalid={__errorState}
        aria-required={required}
        aria-describedby={this.getDescribedByIds() || null}
      />
    )
  }
}

Input.propTypes = {
  // From context
  __errorState: PropTypes.bool,
  __describedByIds: PropTypes.arrayOf(PropTypes.string),
  __handleRequired: PropTypes.func,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  type(props, propName, componentName) {
    if (INVALID_TYPES.indexOf(props[propName]) > -1) {
      return new Error('Input type "' + props[propName] + '" not supported by <' + componentName + ' />.');
    }
    
    return null;
  },
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  readOnly: PropTypes.bool,
};

Input.defaultProps = {
  __errorState: false,
  __describedByIds: [],
  __handleRequired: () => {},
  disabled: false,
  placeholder: '',
  id: undefined,
  required: false,
  type: 'text',
  value: undefined,
  readOnly: false,
};

export default withFormFieldContext(Input);