import React from 'react';
import { FormField, Label, Prefix } from '../../lib/form-field';
import { Input } from '../../lib/input';

class PrefixSuffix extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <FormField>
        <Label>Telephone number</Label>
        <Prefix>
          +1&nbsp;
        </Prefix>
        <Input
          type="tel"
          value={this.state.value}
          onChange={this.updateText}
          placeholder="Telephone"
        />
      </FormField>
    );
  }
}

export default PrefixSuffix;
