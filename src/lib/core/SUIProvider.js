import * as React from 'react';
import PropTypes from 'prop-types';
import { ViewportRuler, ScrollDispatcher } from '../../cdk/scrolling';
import {OverlayContainer} from '../../cdk/overlay';
import {FocusMonitor, InteractivityChecker} from '../../cdk/a11y';
import {AutofillMonitor} from '../../cdk/text-area';
import {Platform} from '../../cdk/platform';
import DialogManager from '../dialog/DialogManager';

/**
 * This component represents a way to consolidate all of the
 * necessary service providers on which SUI depends. This includes
 * the platform, focus monitor, overlay container, and others.
 */

function SUIProvider(props) {
  return (
    <Platform>
      <InteractivityChecker>
        <ViewportRuler>
          <ScrollDispatcher>
            <OverlayContainer>
              <DialogManager>
                <FocusMonitor>
                  <AutofillMonitor>
                    { props.children }
                  </AutofillMonitor>
                </FocusMonitor>
              </DialogManager>
            </OverlayContainer>
          </ScrollDispatcher>
        </ViewportRuler></InteractivityChecker>
    </Platform>
  )
}

SUIProvider.displayName = 'SUIProvider';
SUIProvider.propTypes = {
  children: PropTypes.element,
};

export default SUIProvider;
