import { css } from 'styled-components';
import _ from 'lodash';
import { GREY } from '../../../cdk/theme/colors';
import { getFontFamily, getFontSize, getFontWeight } from '../../core/theming/typographic-utils';
import { DEFAULT_THEME_CONFIG } from '../../core/theming/colors';
import { DEFAULT_TYPOGRAPHY_CONFIG } from '../../core/theming/typography';

const strokedBorder = 'rgba(0, 0, 0, 0.18);';

const buttonColors = (foreground, background, border) => {
  return css`
  color: ${foreground};
  background: ${background};
  ${border ? `border-color: ${border};` : ''}
  `;
};

// Standard is a transparent button with colored text
const standardColor = foreground => (
  buttonColors(foreground, 'transparent')
);

// Fill is a color-filled button with white text
// But for color=default, it's the same as standard
const fillColor = background => (
  buttonColors('white', background)
);

const strokedColor = foreground => (
  buttonColors(foreground, 'transparent', strokedBorder)
);

/** Get button typography from the theming levels */
function buttonTypography(props) {
  const config = _.get(props, 'theme.TYPOGRAPHY', DEFAULT_TYPOGRAPHY_CONFIG);
  return css`
  font-size: ${getFontSize(config, 'button')};
  font-weight: ${getFontWeight(config, 'button')};
  font-family: ${getFontFamily(config)}
  `;
}

function themeThunk(components) {
  return function themeThunkFromScProps(props) {
    const { FocusOverlay, DisabledOverlay } = components;
    const colors = _.get(props, 'theme.COLORS', DEFAULT_THEME_CONFIG);

    const primary = colors.primary.default;
    const darkPrimaryText = GREY[900];

    return css`
    // Buttons without a background color should inherit the font color. This is necessary to
    // ensure that the button is readable on custom background colors. It's wrong to always assume
    // that those buttons are always placed inside of containers with the default background
    // color of the theme (e.g. themed toolbars).
    &[data-appearance=standard], &[data-appearance=stroked] {
      color: inherit;
      background: transparent;
      
      &[data-color=primary] > ${FocusOverlay} { background-color: ${primary}; }
      &[data-color=secondary] > 
      &[disabled=true] > ${FocusOverlay} { background-color: transparent; }
    }
    
    &[data-appearance=standard] {
      &[data-color=primary] { ${standardColor(primary)} }
      &[data-color=secondary] { ${standardColor(darkPrimaryText)} }
    }
    
    &[data-appearance=fill] {
      &[data-color=primary] { ${fillColor(primary)} }
      &[data-color=secondary] {
        ${standardColor(darkPrimaryText)}
      }
    }
    
    &[data-appearance=stroked] {
      &[data-color=primary] { ${strokedColor(primary)} }
      &[data-color=secondary] { ${strokedColor(darkPrimaryText)} }
    }
    
    ${FocusOverlay} { background-color: black; }
    ${DisabledOverlay} { background-color: white; }
    
    &[data-appearance=stroked]:not([disabled=true]) {
      border-color: ${strokedBorder};
    }
    
    ${buttonTypography}
    `;
  }
}

export default themeThunk;
