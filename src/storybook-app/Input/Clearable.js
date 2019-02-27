import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormField, Label, Suffix } from '../../lib/form-field';
import { Input } from '../../lib/input';

class Clearable extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  clearText = () => {
    this.setState({ value: '' });
  };

  render() {
    return (
      <FormField style={{ width: '300px' }}>
        <Label>Clearable input</Label>
        <Input
          value={this.state.value}
          onChange={this.updateText}
          placeholder="Click to clear"
        />
        { this.state.value ? (
          <Suffix aria-label="Clear">
            <FontAwesomeIcon
              icon="times-circle"
              onClick={this.clearText}
              style={{ cursor: 'pointer' }}
            />
          </Suffix>
        ) : null }
      </FormField>
    );
  }
}

export default Clearable;
