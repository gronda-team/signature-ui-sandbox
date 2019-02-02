import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {FormField, Label, Suffix} from '../../lib/form-field';
import { Input } from '../../lib/input';

class PrefixSuffix extends React.Component {
  constructor() {
    super();

    this.state = { value: '', type: 'password' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  toggleInputType = () => {
    this.setState(state => ({
      type: state.type === 'password' ?
        'text' :
        'password'
    }));
  };

  render() {
    return (
      <div style={{ width: '400px', margin: '100px auto' }}>
        <FormField>
          <Label>Password</Label>
          <Input
            required
            type={this.state.type}
            value={this.state.value}
            onChange={this.updateText}
            placeholder="Enter your password"
          />
          <Suffix>
            <FontAwesomeIcon
              style={{ cursor: 'pointer' }}
              onClick={this.toggleInputType}
              icon={this.state.type === 'password' ? 'eye' : 'eye-slash'}
            />
          </Suffix>
        </FormField>
      </div>
    );
  }
}

export default PrefixSuffix;
