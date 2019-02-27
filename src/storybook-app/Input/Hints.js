import React from 'react';
import _ from 'lodash';
import { FormField, Label, Hint } from '../../lib/form-field';
import { Input } from '../../lib/input';

class Hints extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <FormField style={{ width: '300px' }}>
        <Label>Message</Label>
        <Input
          maxLength={256}
          value={this.state.value}
          onChange={this.updateText}
          placeholder="Leave package by door"
        />
        <Hint align="start">
          <strong>Don’t disclose personal info</strong>
        </Hint>
        <Hint align="end">
          { _.get(this.state.value, 'length', 0) } / 256
        </Hint>
      </FormField>
    );
  }
}

export default Hints;
