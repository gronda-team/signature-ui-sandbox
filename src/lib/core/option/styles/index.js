import styled from 'styled-components';
import { optionThemeThunk, optionTypographyThunk } from './theme';
import { MENU_ITEM_BASE, MENU_SIDE_PADDING } from '../../styles/menu-common';
import { USER_SELECT } from '../../styles/vendor';

export const OptionGroupRoot = styled.div`
`;

export const OptionRoot = styled.div`
${MENU_ITEM_BASE}
position: relative;
cursor: pointer;
outline: none;
display: flex;
flex-direction: row;
max-width: 100%;
box-sizing: border-box;
align-items: center;
-webkit-tap-highlight-color: transparent;

&[aria-disabled=true] {
  ${USER_SELECT('none')}
  cursor: default;
}

${OptionGroupRoot} &:not([data-multiple=true]) {
  padding-left: ${MENU_SIDE_PADDING * 2}px;
  
  [dir=rtl] {
    padding-left: ${MENU_SIDE_PADDING}px;
    padding-right: ${MENU_SIDE_PADDING * 2}px;
  }
}
// theme
${optionThemeThunk()}
${optionTypographyThunk()}
`;

// Collapses unwanted whitespace created by newlines in code like the following:
// <OptionText>
//   { value }
// </OptionText>
export const OptionText = styled.span`
display: inline-block;
flex-grow: 1;
overflow: hidden;
text-overflow: ellipsis;
`;
