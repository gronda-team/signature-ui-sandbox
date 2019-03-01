import * as React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withNotes } from '@storybook/addon-notes';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft,
  faEye, faEyeSlash, faTimesCircle, faTrash, faPencilAlt, faBold, faItalic, faUnderline,
} from '@fortawesome/free-solid-svg-icons'
import SUIProvider from '../src/lib/core/SUIProvider';

/**
 * Add the global provider so that FocusMonitor works, OverlayContainer exists, etc.
 */
addDecorator(story => (
  <SUIProvider>
    { story() }
  </SUIProvider>
));

/**
 * Add markdown notes
 */
addDecorator(withNotes);

/**
 * Add any FontAwesome icons we want
 */
library.add(faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft, faEye, faEyeSlash, faTimesCircle, faTrash, faBold, faItalic, faUnderline, faPencilAlt);

/**
 * Dynamically load the stories from src/storybook-app folder,
 * and target files that have .stories.js in the filename.
 */
const req = require.context('../src/storybook-app', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
