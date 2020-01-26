import React from 'react';
import { Button } from '../../lib/button';
import { Checkbox } from '../../lib/checkbox';

const AVAILABLE_BUTTON_APPEARANCES = ['standard', 'fill', 'stroked'];
const AVAILABLE_COLORS = ['primary', 'secondary'];

class Overview extends React.Component {
  constructor() {
    super();

    this.state = {
      disabled: false,
    };
  }

  toggleDisabled = () => {
    this.setState(state => ({ disabled: !state.disabled }));
  };

  render() {
    return (
      <div>
        <table>
          <tbody>
          <tr>
            <td><code>appearance:</code></td>
            { AVAILABLE_BUTTON_APPEARANCES.map(appearance => (
              <th key={appearance} scope="col"><code>{ appearance }</code></th>
            ))}
          </tr>
          { AVAILABLE_COLORS.map(color => (
            <tr key={color}>
              <th scope="row"><code>color: { color }</code></th>
              { AVAILABLE_BUTTON_APPEARANCES.map(appearance => (
                <td key={appearance}>
                  <Button disabled={this.state.disabled} color={color} appearance={appearance}>
                    { color }, { appearance }
                  </Button>
                </td>
              ))}
            </tr>
          )) }
          </tbody>
        </table>
        <Checkbox onChange={this.toggleDisabled} checked={this.state.disabled}>
          Disable
        </Checkbox>
      </div>
    );
  }
}

export default Overview;
