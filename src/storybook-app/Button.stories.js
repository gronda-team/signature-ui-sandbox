import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '../lib/button';

const AVAILABLE_BUTTON_APPEARANCES = ['standard', 'fill', 'stroked'];
const AVAILABLE_BUTTON_SIZES = ['icon', 'standard', 'fill'];
const AVAILABLE_COLORS = ['primary', 'secondary'];

storiesOf('Button', module)
  .add('Available styles', () => (
    <div>
      { AVAILABLE_COLORS.map(color => (
        <div key={color}>
          { AVAILABLE_BUTTON_APPEARANCES.map(appearance => (
            <Button color={color} appearance={appearance} key={appearance}>
              { color }, { appearance }
            </Button>
          ))}
        </div>
      )) }
    </div>
  ));
