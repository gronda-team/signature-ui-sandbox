import * as React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withNotes } from '@storybook/addon-notes';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft,
  faEye, faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import {Platform} from '../src/cdk/platform';
import {OverlayContainer} from '../src/cdk/overlay';
import {FocusMonitor, InteractivityChecker} from '../src/cdk/a11y';
import { AutofillMonitor } from '../src/cdk/text-area';
import ViewportRuler from '../src/cdk/scrolling/ViewportRuler';
import ScrollDispatcher from '../src/cdk/scrolling/ScrollDispatcher';
import {DialogManager} from '../src/lib/dialog';

/**
 * Add the important global DI containers
 * so that FocusMonitor works, OverlayContainer exists, etc.
 */
addDecorator(story => (
  <Platform>
    <InteractivityChecker>
      <ViewportRuler>
        <ScrollDispatcher>
          <OverlayContainer>
            <DialogManager>
              <FocusMonitor>
                <AutofillMonitor>
                  { story() }
                </AutofillMonitor>
              </FocusMonitor>
            </DialogManager>
          </OverlayContainer>
        </ScrollDispatcher>
      </ViewportRuler>
    </InteractivityChecker>
  </Platform>
));

/**
 * Add markdown notes
 */
addDecorator(withNotes);

/**
 * Add any FontAwesome icons we want
 */
library.add(faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft, faEye, faEyeSlash);

/**
 * Dynamically load the stories from src/storybook-app folder,
 * and target files that have .stories.js in the filename.
 */
const req = require.context('../src/storybook-app', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
