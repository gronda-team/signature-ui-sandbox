import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormField } from '../../../../lib/form-field/index';
import Input from '../../../../lib/input/Input';

export default class Password extends React.Component {
  constructor() {
    super();
    
    this.state = {
      passwordVisible: false,
    };
  }
  
  toggleEye = () => {
    this.setState(state => ({
      passwordVisible: !state.passwordVisible,
    }));
  };
  
  renderEye = () => (
    <FontAwesomeIcon
      onClick={this.toggleEye}
      style={{ cursor: 'pointer' }}
      icon={this.state.passwordVisible ? 'eye-slash' : 'eye'}
    />
  );
  
  render() {
    return (
      <FormField
        label={this.props.label}
        style={{ display: 'block' }}
        suffix={this.renderEye()}
      >
        <Input
          type={this.state.passwordVisible ? 'text' : 'password'}
          name="password"
          required={this.props.required}
          autocomplete={
            this.props.type === 'current' ?
              'current-password' : 'new-password'
          }
          value={this.props.value}
          onChange={this.props.onChange}
        />
      </FormField>
    )
  }
}

Password.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  type: PropTypes.oneOf(['current', 'new']),
};

Password.defaultProps = {
  label: 'Password',
  value: '',
  onChange: _.noop,
  required: false,
  type: 'current',
};
