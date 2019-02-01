import * as React from 'react';
import { configure, addDecorator } from '@storybook/react';
import {Platform} from '../src/cdk/platform';
import {OverlayContainer} from '../src/cdk/overlay';
import {FocusMonitor} from '../src/cdk/a11y';

/**
 * Add the important global DI containers
 * so that FocusMonitor works, OverlayContainer exists, etc.
 */
addDecorator(story => (
  <Platform>
    <OverlayContainer>
      <FocusMonitor>
        { story() }
      </FocusMonitor>
    </OverlayContainer>
  </Platform>
));

/**
 * Dynamically load the stories from src/storybook-app folder,
 * and target files that have .stories.js in the filename.
 */
const req = require.context('../src/storybook-app', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
