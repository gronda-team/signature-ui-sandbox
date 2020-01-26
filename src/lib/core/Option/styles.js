import styled, { css } from 'styled-components';
import { menuItemBase, menuItemSidePadding } from '../style/menu-common';
import { getColor } from '../theming/util';

export const OptGroupLabel = styled.div`
  ${menuItemBase}
  display: flex;
  align-items: center;
  flex-direction: row;
  user-select: none;
  cursor: default;
`;

export const OptGroupRoot = styled.div``;

export const OptionText = styled.div`
  display: inline-block;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function optionTheme(props) {
  const colors = props.theme.colors;
  return css`
    color: ${getColor(colors.GREY, 900, 0.86)};
    &:hover:not([data-disabled="true"]),
    &:focus:not([data-disabled="true"]) {
      background: ${getColor(colors.GREY, 900, 0.04)}; 
    }
    
    &[data-active="true"] {
      background: ${getColor(colors.GREY, 900, 0.04)};
      color: ${getColor(colors.GREY, 900)};
    }
  `;
}

export const OptionRoot = styled.div`
  ${menuItemBase}
  position: relative;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  flex-direction: row;
  max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  -webkit-tap-highlight-color: transparent;

  &[aria-disabled='true'] {
    user-select: none;
    cursor: default;
  }

  ${OptGroupRoot} &:not([data-multiple="true"]) {
    padding-left: calc(${menuItemSidePadding} * 2);

    [dir="rtl"] & {
      padding-left: ${menuItemSidePadding};
      padding-right: calc(${menuItemSidePadding} * 2);
    }
  }
  
  @media (-ms-high-contrast: active) {
    // Add a margin to offset the border that we're adding to active option, in order
    // to avoid the options shifting as the user is moving through the list.
    margin: 0 1px;
    
    &[data-active="true"] {
      // We use a border here, rather than an outline, because the outline will be cut off
      // by the "overflow: hidden" on the panel wrapping the options, whereas a border
      // will push the element inwards. This could be done using "outline-offset: -1px",
      // however the property isn't supported on IE11.
      border: solid 1px currentColor;
      margin: 0;
    }
  }
  
  ${optionTheme}
`;
