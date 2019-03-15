import React from 'react';
import { Button } from '../../lib/button';

const AVAILABLE_BUTTON_APPEARANCES = ['standard', 'fill', 'stroked'];
const AVAILABLE_COLORS = ['primary', 'secondary'];

function Overview() {
  return (
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
              <Button color={color} appearance={appearance}>
                { color }, { appearance }
              </Button>
            </td>
          ))}
        </tr>
      )) }
      </tbody>
    </table>
  );
}

export default Overview;
