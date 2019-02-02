import React from 'react';
import {FormField, Label} from '../../lib/form-field';
import { Input } from '../../lib/input';

class AutofillExample extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        margin: '100px auto'
      }}>
        <FormField>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            autocomplete="email"
            value={this.state.value}
            onChange={this.updateText}
            placeholder="Email address"
          />
        </FormField>
      </div>
    );
  }
}

export default AutofillExample;
