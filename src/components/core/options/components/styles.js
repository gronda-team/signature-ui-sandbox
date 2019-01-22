import styled from 'styled-components';
import { CYAN, GREY } from '../../theme/colors';
import { baseItemStyle, PANEL_X_PADDING } from '../styles';

const FOCUSED = CYAN[100];
const DISABLED = GREY[500];
const GROUP = GREY[700];

export const OptionWrapper = styled.div`
${baseItemStyle}
position: relative;
cursor: pointer;
outline: none;
min-height: 32px;
padding: 0 ${PANEL_X_PADDING}px;
display: flex;
align-items: center;
flex-direction: row;
max-width: 100%;
box-sizing: border-box;
-webkit-tap-highlight-color: transparent;
&[aria-disabled="false"] {
  &:hover, &:focus { background-color: ${FOCUSED}; }
  
  &[aria-selected="true"] {
  
  }
}

&[aria-disabled="true"] {
  cursor: default;
  user-select: none;
  color: ${DISABLED};
}

[role="group"] & {
  padding-left: ${PANEL_X_PADDING * 2}px;
}
`;

export const OptionTextWrapper = styled.span`
display: inline-block;
flex-grow: 1;
overflow: hidden;
text-overflow: ellipsis;
`;

export const OptGroupLabel = styled.label`
margin: 0;
padding: 0;
cursor: default;
user-select: none;
color: ${GROUP};
font-weight: 700;
[aria-disabled="true"] & {
  color: ${DISABLED};
}
${baseItemStyle}
`;
