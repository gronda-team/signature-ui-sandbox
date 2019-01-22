import { css } from 'styled-components';
import { GREEN, GREY } from '../../../components/core/theme/colors';

// font
const fontSize = '13px';

// border colors
const border = GREEN[500];
const inactiveBackground = 'transparent';
const inactiveForeground = border;
const activeBackground = border;
const activeForeground = 'white';

const disabledBorder = GREY[700];
const disabledForeground = disabledBorder;
const disabledBackground = 'transparent';

export const themeThunk = (components) => {
  const { Close } = components;
  return css`
  border-color: ${border};
  background-color: ${inactiveBackground};
  color: ${inactiveForeground};
  
  &:not([aria-disabled=true]) {
    &:active {
      bottom: 2px;
    }
    
    ${Close} {
      stroke: ${border};
      &:hover {
        opacity: 0.54;
      }
    }
  }
  
  &[aria-disabled=true] {
    border-color: ${disabledBorder};
    background-color: ${disabledBackground};
    color: ${disabledForeground};
    stroke: ${disabledForeground};
  }
  
  &[aria-selected=true][aria-disabled=false] {
    background-color: ${activeBackground};
    color: ${activeForeground};
  }
  
  font-size: ${fontSize};
  `;
};
