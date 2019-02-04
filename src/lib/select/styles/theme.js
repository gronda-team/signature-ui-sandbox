import { css } from 'styled-components';
import { GREY } from '../../../cdk/theme/colors';

const PLACEHOLDER_COLOR = GREY[500];
const ARROW_STROKE = GREY[700];

export const selectRootThemeThunk = (components) => {
  const { SelectPlaceholder, SelectArrow } = components;
  return css`  
  ${SelectPlaceholder} {
    color: ${PLACEHOLDER_COLOR};
  }
  
  ${SelectArrow} {
    fill: none;
    stroke: ${ARROW_STROKE};
  }
  
  &[aria-disabled=true] { color: ${GREY[500]}; }
  `;
};

/**
 * Since the panel is rendered in an overlay, we can't use
 * child CSS selectors to target the coloring. These colors
 * must instead be used on the panel root in order
 * to take advantage of theming.
 */
export const selectPanelThemeThunk = (components) => {
  const {
    SelectValue,
  } = components;
  return css`  
  & {
    background-color: white;
  }
  
  ${SelectValue} {
    color: ${GREY[900]};
  }`;
};
