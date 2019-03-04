import { css } from 'styled-components';
import { GREEN, GREY } from '../../../cdk/theme/colors';

// border colors
const ACTIVE = GREEN[500];
const BORDER = GREY[500];

const ACTIVE_BACKGROUND = GREEN[100]; // used for CDK focus

const DISABLED_FOREGROUND = GREY[700];
const DISABLED_BACKGROUND = GREY[100];

export const themeThunk = (components) => {
  const { OuterCircle, InnerCircle } = components;
  return css`
  ${OuterCircle} {
    border-color: ${BORDER};
  }
  
  &[data-disabled=true] { background-color: ${DISABLED_BACKGROUND}; }
  
  &[data-checked=true] {
    &[data-disabled=false] ${InnerCircle} { background-color: ${ACTIVE}; }
    &[data-disabled=true] ${InnerCircle} { background-color: ${DISABLED_FOREGROUND}; }
  }
  
  &[data-focused=true][data-focus-origin=keyboard] {
    ${OuterCircle} {
      border-color: ${ACTIVE};
      background-color: ${ACTIVE_BACKGROUND};
    }
  }
  `;
};
