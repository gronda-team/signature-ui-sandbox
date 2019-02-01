import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '../lib/button';

const AVAILABLE_BUTTON_APPEARANCES = ['standard', 'fill', 'stroked'];
const AVAILABLE_BUTTON_SIZES = ['icon', 'standard', 'fill'];
const AVAILABLE_COLORS = ['primary', 'secondary'];

storiesOf('Button', module)
  .add('Available styles', () => (
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
  ))
  .add('as <a /> tags', () => (
    <div>
      { AVAILABLE_BUTTON_APPEARANCES.map(appearance => (
        <Button
          is="a"
          appearance={appearance}
          href="https://www.google.com"
        >
          I'm feeling lucky
        </Button>
      ))}
    </div>
  ));
