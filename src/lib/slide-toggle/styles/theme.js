import { css } from 'styled-components';
import { GREEN, GREY } from '../../../cdk/theme/colors';

// border colors
const ACTIVE = GREEN[500];
const BORDER = GREY[300];

const INACTIVE_BACKGROUND = GREY[100];
const ACTIVE_BACKGROUND = ACTIVE;

const THUMB = 'white';

const DISABLED_BACKGROUND = GREY[700];
const DISABLED_THUMB = GREY[100];

export const themeThunk = (components) => {
  const {
    Thumb,
    Bar,
    Label,
    ThumbContainer,
  } = components;
  return css`
  ${Thumb} { background-color: ${THUMB}; }
  ${Bar} {
    border-color: ${BORDER};
    background-color: ${INACTIVE_BACKGROUND};
  }
  &[data-disabled=true] {
    ${Thumb} { background-color: ${DISABLED_THUMB}; }
    ${Bar} { background-color: ${DISABLED_BACKGROUND}; }
    ${Label}, ${ThumbContainer} {
      cursor: default;
    }
  }
  &[data-checked=true] {
    ${Bar} {
      background-color: ${ACTIVE_BACKGROUND};
    }
  }
  `;
};

export default themeThunk;
