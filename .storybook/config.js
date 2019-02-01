import { configure } from '@storybook/react';

/**
 * Dynamically load the stories from src/storybook-app folder,
 * and target files that have .stories.js in the filename.
 */
const req = require.context('../src/storybook-app', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
