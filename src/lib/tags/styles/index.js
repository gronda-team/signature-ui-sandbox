import styled, { css } from 'styled-components';
import FILL from '../../core/styles/layout-common';
import { EASE_IN_OUT } from '../../core/styles/animation';
import { BaseInput } from '../../input/styles/index';
import Close from '../../core/icons/Close';
import { themeThunk } from './theme';

const TAG_MIN_HEIGHT = 28;
const TAG_BORDER_RADIUS = 3;
const TAG_VERTICAL_PADDING = 4;
const TAG_HORIZONTAL_PADDING = 18;
const TAG_REMOVE_VERTICAL_PADDING = TAG_VERTICAL_PADDING;
const TAG_REMOVE_BEFORE_MARGIN = 20;
const TAG_REMOVE_AFTER_PADDING = 8;
const TAG_AVATAR_VERTICAL_PADDING = 0;
const TAG_AVATAR_BEFORE_PADDING = 0;
const TAG_AVATAR_BEFORE_MARGIN = 4;
const TAG_AVATAR_AFTER_MARGIN = 8;
const TAGS_TAG_MARGIN = 4;
const TAG_INPUT_WIDTH = 150;
const TAG_INPUT_MARGIN = 4;
const TAG_AVATAR_SIZE = 24;
const TAG_REMOVE_SIZE = 12;

export const TagClose = styled(Close)``;

const components = { Close: TagClose };
const TagRoot = styled.div`
position: relative;
overflow: hidden;
box-sizing: border-box;
-webkit-tap-highlight-color: transparent;
display: inline-flex;
padding: ${TAG_VERTICAL_PADDING}px ${TAG_HORIZONTAL_PADDING}px;
border-radius: ${TAG_BORDER_RADIUS}px;
align-items: center;
cursor: default;
min-height: ${TAG_MIN_HEIGHT}px;
border: solid 1px;

// Centering the content using flexbox won't work on IE, if we have
// a "min-height" without setting a "height". This height won't do
// anything since it's less than the minimum set above.
height: 1px;

// Overlay used to darken the chip on hover and focus.
&::after {
  ${FILL}
  border-radius: inherit;
  background-color: black;
  opacity: 0;
  content: '';
  pointer-events: none;
  transition: opacity 200ms ${EASE_IN_OUT.CURVE};
}

&:hover::after {
  opacity: 0.12;
}

&:focus {
  outline: none;

  &::after {
    opacity: 0.16;
  }
}

&[aria-disabled=true] {
  &::after {
    opacity: 0;
  }
  
  ${TagClose} {
    cursor: default;
  }
}

&[data-has-trailing-icon=true] {
  padding-top: ${TAG_REMOVE_VERTICAL_PADDING}px;
  padding-bottom: ${TAG_REMOVE_VERTICAL_PADDING}px;
  padding-right: ${TAG_REMOVE_AFTER_PADDING}px;
  padding-left: ${TAG_HORIZONTAL_PADDING}px;
  
  [dir=rtl] & {
    padding-left: ${TAG_REMOVE_AFTER_PADDING}px;
    padding-right: ${TAG_HORIZONTAL_PADDING}px;
  }
}

${TagClose} {
  width: ${TAG_REMOVE_SIZE}px;
  height: ${TAG_REMOVE_SIZE}px;
  cursor: pointer;
  
  margin-left: ${TAG_REMOVE_BEFORE_MARGIN}px;
  margin-right: 0;
  
  [dir=rtl] & {
    margin-right: ${TAG_REMOVE_BEFORE_MARGIN};
    margin-left: 0;
  }
}
${themeThunk(components)}
`;

export const TagListInput = BaseInput.extend`
width: ${TAG_INPUT_WIDTH}px;
margin: ${TAG_INPUT_MARGIN}px;
flex: 1 0 ${TAG_INPUT_WIDTH}px;
`;

export const TagListRoot = styled.div`
display: flex;
flex-direction: row;
flex-wrap: wrap;
align-items: center;
margin: -${TAGS_TAG_MARGIN}px;

${TagListInput}, ${TagRoot} {
  margin: ${TAGS_TAG_MARGIN}px;
}

&[aria-orientation=vertical] {
  flex-direction: column;
  align-items: flex-start;
  ${TagRoot} { width: 100%; }
}
`;

export default TagRoot;
