import React from 'react';
import { Select } from '../../lib/select';
import { Option } from '../../lib/core/option';
import { FormField, Label } from '../../lib/form-field';

class Overview extends React.Component {
  constructor() {
    super();

    this.OPTIONS = [
      { value: 'asia', viewValue: 'Asia' },
      { value: 'africa', viewValue: 'Africa' },
      { value: 'antarctica', viewValue: 'Antarctica' },
      { value: 'north-america', viewValue: 'North America' },
      { value: 'south-america', viewValue: 'South America' },
      { value: 'europe', viewValue: 'Europe' },
      { value: 'australia', viewValue: 'Australia' },
    ];
  }

  selectContinent = (event) => {
    console.log(event);
  };

  render() {
    return (
      <div style={{ width: '400px', margin: '100px auto' }}>
        <FormField>
          <Label>Continent</Label>
          <Select onChange={this.selectContinent}>
            { this.OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                { option.viewValue }
              </Option>
            )) }
          </Select>
        </FormField>
      </div>
    );
  }
}

export default Overview;
