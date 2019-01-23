import { css } from 'styled-components';
import { GREEN, GREY } from '../../../cdk/theme/colors';

const primary = GREEN[500];
const primaryText = 'white';
const secondary = GREY[700];

const focusOverlayColorThunk = () => css`
[data-color=primary] > & { background-color: ${primary}; }
[data-color=secondary] > & { background-color: ${secondary}; }
[disabled=true] > & { background-color: transparent; }
`;

const buttonThemeProperty = property => {
  return css`
  &[data-color=primary] { ${property}: ${property === 'color' ? primaryText : primary}; }
  &[data-color=secondary] { ${property}: ${secondary}; }
  &[disabled=true] {
    ${property}:
  }
  `;
};

const buttonTypography = css`
font-size: 14px;
font-weight: 500;
`;

const themeThunk = (components) => {
  const { FocusOverlay } = components;
  return css`
  // Buttons without a background color should inherit the font color. This is necessary to
  // ensure that the button is readable on custom background colors. It's wrong to always assume
  // that those buttons are always placed inside of containers with the default background
  // color of the theme (e.g. themed toolbars).
  &, &[data-variant=icon], &[data-variant=stroked] {
    color: inherit;
    background: transparent;
    
    ${buttonThemeProperty('color')}
    ${FocusOverlay} {
      ${focusOverlayColorThunk()}
    }
  }
  
  ${FocusOverlay} { background-color: black; }
  
  &[data-variant=stroked]:not([disabled=true]) { border-color: rgba(0, 0, 0, 0.12); }
  &[data-variant=standard], &[data-variant=flat], &[data-variant=raised] {
    ${buttonThemeProperty('background-color')}
  }
  
  ${buttonTypography}
  `;
};

export default themeThunk;
