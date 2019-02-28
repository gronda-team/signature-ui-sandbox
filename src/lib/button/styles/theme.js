import { css } from 'styled-components';
import { GREEN, GREY } from '../../../cdk/theme/colors';

const primary = GREEN[500];
const darkPrimaryText = GREY[900];
const secondary = GREY[700];
const strokedBorder = 'rgba(0, 0, 0, 0.12);';

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
  
  &[data-appearance=stroked]:not([disabled=true]) {
    border-color: ${strokedBorder};
  }
  
  ${buttonTypography}
  `;
};

export default themeThunk;
