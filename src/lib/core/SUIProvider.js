import * as React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';
import { ViewportRuler, ScrollDispatcher } from '../../cdk/scrolling';
import {OverlayContainer} from '../../cdk/overlay';
import {FocusMonitor, InteractivityChecker} from '../../cdk/a11y';
import {AutofillMonitor} from '../../cdk/text-area';
import {Platform} from '../../cdk/platform';
import DialogManager from '../dialog/DialogManager';
import { DEFAULT_TYPOGRAPHY_CONFIG } from './theming/typography';
import { DEFAULT_THEME_CONFIG } from './theming/colors';

/**
 * This component represents a way to consolidate all of the
 * necessary service providers on which SUI depends. This includes
 * the platform, focus monitor, overlay container, and others.
 */

function SUIProvider(props) {
  return (
    <ThemeProvider theme={props.theme}>
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
          </ViewportRuler>
        </InteractivityChecker>
      </Platform>
    </ThemeProvider>
  )
}

/** Palette shape for the theme */
const PaletteShape = PropTypes.shape({
  lighter: PropTypes.string,
  default: PropTypes.string,
  darker: PropTypes.string
});

SUIProvider.displayName = 'SUIProvider';
SUIProvider.propTypes = {
  theme: PropTypes.shape({
    TYPOGRAPHY: PropTypes.shape({

    }),
    COLORS: PropTypes.shape({
      primary: PaletteShape,
      secondary: PaletteShape,
      warn: PaletteShape,
    }),
  }),
  children: PropTypes.element,
};

SUIProvider.defaultProps = {
  theme: {
    TYPOGRAPHY: DEFAULT_TYPOGRAPHY_CONFIG,
    COLORS: DEFAULT_THEME_CONFIG,
  },
};

export default SUIProvider;
