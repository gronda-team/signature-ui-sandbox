import React from 'react';
import { Checkbox } from '../../lib/checkbox';

class CheckboxOverview extends React.Component {
  constructor() {
    super();

    this.state = { checked: false };
  }

  toggle = () => {
    this.setState(state => ({ checked: !state.checked }));
  };

  render() {
    return (
      <Checkbox checked={this.state.checked} onChange={this.toggle}>
        Check this out!
      </Checkbox>
    );
  }
}

export default CheckboxOverview;
