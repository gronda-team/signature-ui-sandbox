import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft,
  faEye, faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'
import './index.css';
import App from './App';
import { FocusMonitor } from './cdk/a11y';
import { Platform } from './cdk/platform';
import registerServiceWorker from './registerServiceWorker';
import { KeyboardDispatcher, OverlayContainer } from './cdk/overlay';
import { ViewportRuler } from './cdk/scrolling';

library.add(faExclamationCircle, faDollarSign, faHandPointRight, faHandPointLeft, faEye, faEyeSlash);

ReactDOM.render(
  <Platform>
    <ViewportRuler>
      <OverlayContainer>
        <KeyboardDispatcher>
          <FocusMonitor>
            <App />
          </FocusMonitor>
        </KeyboardDispatcher>
      </OverlayContainer>
    </ViewportRuler>
  </Platform>,
  document.getElementById('root'),
);
registerServiceWorker();
