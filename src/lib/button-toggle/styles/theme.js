import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { getFontFamily, getFontSize, getFontWeight, TYPOGRAPHY_DEFAULTS } from '../../text';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';

function buttonTypography(props) {
  const config = _.get(props, 'theme.typography', TYPOGRAPHY_DEFAULTS);
  return css`
  font-size: ${getFontSize(config, 'button')};
  font-weight: ${getFontWeight(config, 'button')};
  font-family: ${getFontFamily(config)}
  `;
}

export function themeThunk(components) {
  return function themeThunkFromScProps(props) {
    const colors = _.get(props, 'theme.colors', DEFAULT_THEME_CONFIG);

    // border colors
    const ACTIVE_BACKGROUND = colors.primary.default;
    const ACTIVE_FOREGROUND = 'white';
    const INACTIVE_BACKGROUND = 'transparent';
    const INACTIVE_FOREGROUND = GREY[900];
    const BORDER = GREY[500];

    const DISABLED_FOREGROUND = GREY[700];
    const DISABLED_BACKGROUND = GREY[100];
    const DISABLED_ACTIVE_BACKGROUND = colors.primary.lighter;

    // root context is ButtonToggleGroupRoot, not ButtonToggleRoot
    const { FocusOverlay, ButtonToggle } = components;
    return css`
    ${ButtonToggle} {
      color: ${INACTIVE_FOREGROUND};
      background-color: ${INACTIVE_BACKGROUND};
      
      ${FocusOverlay} {
        background-color: ${BORDER};
      }
    }
    
    ${ButtonToggle} + ${ButtonToggle} {
      border-left: solid 1px ${BORDER};
    
      [dir=rtl] & {
        border-left: none;
        border-right: solid 1px ${BORDER};
      }
    }
    
    &[data-vertical=true] {
      ${ButtonToggle} + ${ButtonToggle} {
        border-left: none;
        border-right: none;
        border-top: solid 1px ${BORDER};
      }
    }
    
    ${ButtonToggle} {
      &[data-checked=true] {
        background-color: ${ACTIVE_BACKGROUND};
        color: ${ACTIVE_FOREGROUND};
      }
      
      &[data-disabled=true] {
        background-color: ${DISABLED_BACKGROUND};
        color: ${DISABLED_FOREGROUND};
        &[data-checked=true] {
          background-color: ${DISABLED_ACTIVE_BACKGROUND};
        }
      }
    }
    
    &, ${ButtonToggle}[data-standalone=true] { border: solid 1px ${BORDER}; }
    ${buttonTypography}
    `;
  }
}

export default themeThunk;
