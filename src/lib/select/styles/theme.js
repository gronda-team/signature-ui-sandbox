import { css } from 'styled-components';
import { GREY } from '../../../cdk/theme/colors';

const PLACEHOLDER_COLOR = GREY[500];

export const selectRootThemeThunk = (components) => {
  const { SelectPlaceholder } = components;
  return css`  
  ${SelectPlaceholder} {
    color: ${PLACEHOLDER_COLOR};
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
