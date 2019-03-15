import React from 'react';
import { Button } from '../../lib/button';

const AVAILABLE_BUTTON_APPEARANCES = ['standard', 'fill', 'stroked'];

function AnchorTag() {
  return (
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
  );
}

export default AnchorTag;
