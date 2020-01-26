import React from 'react';
import PropTypes from 'prop-types';
import Theme from '../theming/Theme';
import { Platform, isBrowser } from '../../../cdk/Platform';
import { IconRegistry } from '../../Icon';
import { GlobalStyles, ProviderRoot } from './styles';
import { FocusMonitor } from '../../../cdk/A11y';
import { ScrollDispatcher, ViewportRuler } from '../../../cdk/Scrolling';
import { OverlayContainer } from '../../../cdk/Overlay';
import { BOOTSTRAP_BLUE, BOOTSTRAP_PURPLE, BOOTSTRAP_RED } from '../theming';

function Provider({ colors, typography, children, withGlobalStyles }) {
  React.useEffect(() => {
    if (isBrowser()) {
      document.body.dataset.suiRoot = 'true';
    }

    return () => {
      if (isBrowser()) {
        delete document.body.dataset.suiRoot;
      }
    };
  }, []);

  return (
    <Theme colors={colors} typography={typography}>
      <Platform>
        <ScrollDispatcher>
          <ViewportRuler>
            <FocusMonitor>
              <OverlayContainer>
                <ProviderRoot>
                  <IconRegistry>{ children }</IconRegistry>
                </ProviderRoot>
              </OverlayContainer>
            </FocusMonitor>
          </ViewportRuler>
        </ScrollDispatcher>
      </Platform>
      { withGlobalStyles ? <GlobalStyles /> : null }
    </Theme>
  );
}

Provider.propTypes = {
  colors: Theme.propTypes.colors,
  typography: Theme.propTypes.typography,
  // Whether or not we want global styles. Used in testing
  withGlobalStyles: PropTypes.bool,
};

Provider.defaultProps = {
  colors: Theme.propTypes.defaultProps,
  typography: Theme.propTypes.defaultProps,
  withGlobalStyles: true,
};

export default Provider;

const COLORS = {
  PRIMARY: BOOTSTRAP_BLUE,
  ACCENT: BOOTSTRAP_PURPLE,
  WARN: BOOTSTRAP_RED,
};
export function TestProviderWrapper({ children }) {
  return <Provider colors={COLORS} withGlobalStyles={false}>{ children }</Provider>;
}
