import React from 'react';
import {FormField, Label} from '../../lib/form-field';
import { Input } from '../../lib/input';
import {Autocomplete} from '../../lib/autocomplete';
import Option from '../../lib/core/option/Option';

class AutocompleteExample extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };

    this.STATES = [{
      name: 'Arkansas',
      population: '2.978M',
    }, {
      name: 'California',
      population: '39.14M',
    }, {
      name: 'Florida',
      population: '20.27M',
    }, {
      name: 'Texas',
      population: '27.47M,'
    }];
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
          <Label>Autocomplete overview</Label>
          <Input
            extensions={['autocomplete']}
            value={this.state.value}
            onChange={this.updateText}
            autocomplete="auto"
            placeholder="State"
            aria-label="State"
          />
          <Autocomplete>
            { this.STATES.map(state => (
              <Option value={state.name}>
                { state.name }
                <small>(Pop: { state.population })</small>
              </Option>
            ))}
          </Autocomplete>
        </FormField>
      </div>
    );
  }
}

export default AutocompleteExample;
