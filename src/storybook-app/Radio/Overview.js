import React from 'react';
import { RadioGroup, Radio } from '../../lib/radio';

class RadioOverview extends React.Component {
  constructor() {
    super();

    this.state = { value: null };
  }

  changeValue = ({ value }) => {
    this.setState({ value });
  };

  render() {
    return (
      <RadioGroup value={this.state.value} onChange={this.changeValue}>
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
      </RadioGroup>
    );
  }
}

export default RadioOverview;
