import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FormField from '../../../lib/form-field/FormField';
import Input from '../../../lib/input/Input';

export default class Password extends React.Component {
  constructor() {
    super();
    
    this.state = {
      type: 'password',
    };
  }
  
  toggleType = () => {
    this.setState((state) => ({
      type: state.type === 'text' ? 'password' : 'text',
    }));
  };
  
  renderEye = () => (
    <FontAwesomeIcon
      style={{ cursor: 'pointer' }}
      onClick={this.toggleType}
      icon={this.state.type === 'text' ? 'eye-slash' : 'eye'}
    />
  );
  
  render() {
    return (
      <FormField
        label={this.props.label}
        suffix={this.renderEye()}
      >
        <Input
          placeholder={this.props.placeholder}
          value={this.props.value}
          onChange={this.props.onChange}
          type={this.state.type}
        />
      </FormField>
    );
  }
}

Password.propTypes = {
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

Password.defaultProps = {
  label: 'Password',
  placeholder: 'Password',
  value: '',
  onChange: _.noop,
};
