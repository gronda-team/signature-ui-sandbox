import styled, { css } from 'styled-components';
import { menuBase } from '../core/style/menu-common';
import { getColor } from '../core/theming/util';

const acPanelBorderRadius = '4px';

function autocompleteTheme(props) {
  const colors = props.theme.colors;

  return css`
    background: white;
    color: ${getColor(colors.GREY, 900)};
  `;
}

// Todo: add Divider component when we have one
export const AutocompleteRoot = styled.div`
  ${menuBase}

  visibility: hidden;
  max-width: none;
  max-height: 256px;
  position: relative;
  width: 100%;
  border-bottom-left-radius: ${acPanelBorderRadius};
  border-bottom-right-radius: ${acPanelBorderRadius};

  &[data-visibility="visible"] {
    visibility: visible;
  }

  &[data-visibility="hidden"] {
    visibility: hidden;
  }

  [data-panel-above="true"] & {
    border-radius: 0;
    border-top-left-radius: ${acPanelBorderRadius};
    border-top-right-radius: ${acPanelBorderRadius};
  }

  // We need to offset horizontal dividers by their height, because
  // they throw off the keyboard navigation inside the panel.
  [data-sui="divider"] {
    margin-top: -1px;
  }
  
  @media (-ms-high-contrast: active) {
    outline: solid 1px;
  }
  
  ${autocompleteTheme}
`;
