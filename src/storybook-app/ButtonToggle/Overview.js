import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonToggleGroup, ButtonToggle } from '../../lib/button-toggle';

class Overview extends React.Component {
  constructor() {
    super();

    this.state = { value: null };
  }

  changeValue = ({ value }) => {
    this.setState({ value });
  };

  render() {
    return (
      <div>
        <ButtonToggleGroup value={this.state.value} onChange={this.changeValue}>
          <ButtonToggle value="bold">
            <FontAwesomeIcon icon="bold" />
          </ButtonToggle>
          <ButtonToggle value="italic">
            <FontAwesomeIcon icon="italic" />
          </ButtonToggle>
          <ButtonToggle value="underline">
            <FontAwesomeIcon icon="underline" />
          </ButtonToggle>
        </ButtonToggleGroup>
        Selected: <code>{ this.state.value || 'none' }</code>
      </div>
    );
  }
}

export default Overview;
