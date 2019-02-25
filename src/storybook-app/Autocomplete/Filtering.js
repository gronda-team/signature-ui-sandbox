import * as React from 'react';
import {FormField} from '../../lib/form-field';
import {Input} from '../../lib/input';
import {Autocomplete} from '../../lib/autocomplete';
import {Option} from '../../lib/core/option';

/**
 * Demonstrating filtering for autocomplete
 * components.
 */
export default class Filtering extends React.Component {
  constructor() {
    super();

    this.state = {
      states: [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' },
      ],
      value: '',
    };
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
  };

  getFilteredStates = () => {
    const value = this.state.value;
    if (!value) return this.state.states;
    return this.state.states
      .filter(state => state.name.match(new RegExp(value, 'gi')));
  };

  displayFn = value => value ? value.name : value;

  render() {
    return (
      <FormField>
        <Input
          placeholder="State"
          autocompleteAttribute="auto"
          value={this.state.value}
          onChange={this.onChange}
          extensions={['autocomplete']}
        />
        <Autocomplete
          displayWith={this.displayFn}
        >
          { this.getFilteredStates().map(state => (
            <Option value={state} key={state.code}>
              { state.name }
            </Option>
          )) }
        </Autocomplete>
      </FormField>
    );
  }
}
