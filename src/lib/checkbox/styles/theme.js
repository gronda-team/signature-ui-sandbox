import styled, { css } from 'styled-components';
import { GREEN, GREY } from '../../../cdk/theme/colors';

// border colors
const inactiveBorder = GREY[500];
const inactiveBackground = 'transparent';
const activeBorder = GREEN[500];
const activeBackground = GREEN[100];
const disabledBorder = inactiveBorder;
const disabledBackground = GREY[100];
const focusedBackground = GREEN[100];
// checkmark colors
const defaultCheck = activeBorder;
const disabledCheck = GREY[700];

export const themeThunk = (components) => {
  const { Frame, Checkmark, IndeterminatePath } = components;
  return css`
  ${Frame} {
    border-color: ${inactiveBorder};
    background-color: ${inactiveBackground};
  }
  
  &[data-focused=true] {
    ${Frame} { border-color: ${activeBorder}; }
  }
  
  ${Checkmark} {
    fill: none;
  }
  
  &[data-focus-origin=keyboard] ${Checkmark} { fill: ${activeBackground}; }
  
  [data-shape=check-path] { stroke: ${defaultCheck} !important; }
  ${IndeterminatePath} { background-color: ${defaultCheck}; }
  
  &[data-disabled=true] {
    ${Frame} {
      border-color: ${disabledBorder};
      background-color: ${disabledBackground};
    }
    
    [data-shape=check-path] { stroke: ${disabledCheck} !important; }
    ${IndeterminatePath} { background-color: ${disabledCheck}; }
  }
  `;
};
