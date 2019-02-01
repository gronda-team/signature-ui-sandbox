import { configure } from '@storybook/react';

/**
 * Dynamically load the stories from src/dev folder,
 * and target files that have .stories.js in the filename.
 */
const req = require.context('../src/dev', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
