import styled, { css, keyframes } from 'styled-components';
import FILL from '../../core/styles/layout-common';
import { CHECKBOX_BORDER_WIDTH, CHECKBOX_SIZE } from '../../core/styles/checkbox-common';
import { TOGGLE_PADDING } from '../../core/styles/variables';
import { themeThunk } from './theme';
import VISUALLY_HIDDEN from '../../core/styles/a11y';

// Manual SVG calculation
const MARK_PATH_LENGTH = 13.462;
const MARK_STROKE_SIZE = (2 / 15) * CHECKBOX_SIZE;

const checkboxOuterBoxMixin = css`
${FILL}
border-radius: 3px;
box-sizing: border-box;
pointer-events: none;
`;

// "Draws" in the checkmark when the checkbox goes from unchecked -> checked.
const checkedUncheckedAnimation = keyframes`
0%, 50% { stroke-dashoffset: ${MARK_PATH_LENGTH}; }
50% { animation-timing-function: cubic-bezier(0, 0, 0.2, 0.1); }
100% { stroke-dashoffset: 0; }
`;

export const CheckboxLayout = styled.label`
// "cursor: inherit" ensures that the wrapper element gets the same cursor as the checkbox
// (e.g. pointer by default, regular when disabled), instead of the browser default.
cursor: inherit;
align-items: baseline;
vertical-align: middle;
display: inline-flex;
white-space: nowrap;
`;

export const CheckboxInnerContainer = styled.div`
display: inline-block;
height: ${CHECKBOX_SIZE}px;
width: ${CHECKBOX_SIZE}px;
line-height: 0;
margin: auto ${TOGGLE_PADDING}px auto auto;
order: 0;
position: relative;
vertical-align: middle;
white-space: nowrap;
flex-shrink: 0;

[dir=rtl] & {
  margin-left: ${TOGGLE_PADDING}px;
  margin-right: auto;
}

&[data-has-label=false] {
  margin-left: 0;
  margin-right: 0;
}

[data-label-position=before] & {
  order: 1;
  margin-left: ${TOGGLE_PADDING};
  margin-right: auto;

  [dir=rtl] & {
    margin-left: auto;
    margin-right: ${TOGGLE_PADDING}px;
  }
}
`;

export const CheckboxFrame = styled.div`
${checkboxOuterBoxMixin}

background-color: transparent;
border: solid ${CHECKBOX_BORDER_WIDTH}px;
`;

export const CheckboxBackground = styled.div`
${checkboxOuterBoxMixin}

align-items: center;
display: inline-flex;
justify-content: center;

[data-checked=false] & { background-color: transparent; }

& svg {
  ${FILL}
  width: 100%;
  
  [data-checked=true] & { opacity: 1; }
  
  & path {
    stroke-dashoffset: ${MARK_PATH_LENGTH};
    stroke-dasharray: ${MARK_PATH_LENGTH};
    stroke-width: ${MARK_STROKE_SIZE}px;
    
    [data-checked=true] & { stroke-dashoffset: 0; animation: 180ms linear 0ms ${checkedUncheckedAnimation}; }
  }
}
`;

export const CheckboxIndeterminateMark = styled.div`
width: calc(100% - 8px);
height: ${Math.floor(MARK_STROKE_SIZE)}px;
opacity: 0;
border-radius: 3px;
`;

export const CheckboxInput = styled.input`
// Move the input to the bottom and in the middle.
// Visual improvement to properly show browser popups when being required.
bottom: 0;
left: 50%;
${VISUALLY_HIDDEN}
`;

export const CheckboxLabel = styled.div``;

const components = {
  Frame: CheckboxFrame,
  Checkmark: CheckboxCheckmark,
  CheckmarkPath: CheckboxCheckmarkPath,
};

export const CheckboxRoot = styled.div`
cursor: pointer;
-webkit-tap-highlight-color: transparent;
[data-disabled=true] { cursor: default; }
${themeThunk(components)}
`;
