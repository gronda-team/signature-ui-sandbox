import { css } from 'styled-components';
import { GREY } from '../../../cdk/theme/colors';

export const selectRootThemeThunk = () => {
  return css`  
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
    SelectPlaceholder,
  } = components;
  return css`  
  & {
    background-color: white;
  }
  
  ${SelectValue} {
    color: ${GREY[900]};
  }
  
  ${SelectPlaceholder} {
    color: ${GREY[700]};
  }`;
};
