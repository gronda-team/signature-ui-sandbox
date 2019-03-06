import React from 'react';
import { FormField, Label } from '../../lib/form-field';
import { Input } from '../../lib/input';

class Autosize extends React.Component {
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
        <Label>Autosize textarea</Label>
        <Input
          as="textarea"
          autosizeEnabled
          autosizeMinRows={2}
          autosizeMaxRows={5}
          value={this.state.value}
          onChange={this.updateText}
          placeholder="Watch me autosize"
        />
      </FormField>
    );
  }
}

export default Autosize;
