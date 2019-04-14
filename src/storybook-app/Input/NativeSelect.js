import React from 'react';
import { FormField, Label, Prefix } from '../../lib/form-field';
import { Input } from '../../lib/input';

class NativeSelect extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateCarType = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <FormField>
        <Label>Favorite car brand</Label>
        <Input
          as="select"
          value={this.state.value}
          onChange={this.updateCarType}
        >
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </Input>
      </FormField>
    );
  }
}

export default NativeSelect;
