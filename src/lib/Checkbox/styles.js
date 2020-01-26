import styled, { css } from 'styled-components';
import {
  EASE_OUT_DURATION,
  EASE_OUT_TIMING_FUNCTION,
  LINEAR_OUT_SLOW_IN_TIMING_FUNCTION,
  TOGGLE_PADDING,
} from '../core/style/variables';
import { fill } from '../core/style/layout';

// Manually calculated path length
const markPathLength = 23.35;

const checkboxSize = '20px';
const checkboxBorderRadius = '4px';
const checkboxBorderWidth = '1px';
const checkboxTransitionDuration = '90ms';
const checkboxMarkStrokeSize = `calc(2 / 15 * ${checkboxSize})`;
const checkboxMarkStrokeSizeRaw = 2 / 15 * Number.parseInt(checkboxSize, 10);
const checkboxMarkStrokeSizeRounded = `${Math.floor(checkboxMarkStrokeSizeRaw)}px`;

// Applied to elements that appear to make up the outer box of the checkmark, such as the frame
// that contains the border and the actual background element that contains the marks.
const checkboxOuterBox = css`
  ${fill}
  border-radius: ${checkboxBorderRadius};
  box-sizing: border-box;
  pointer-events: none;
`;

export const CheckboxLayout = styled.div`
  // Disable text selection on the label itself, because having text selected
  // will prevent focus from reaching the label. Below we'll re-enable it only
  // for the label's content so that people can still select the text.
  user-select: none;

  // "cursor: inherit" ensures that the wrapper element gets the same cursor as the mat-checkbox
  // (e.g. pointer by default, regular when disabled), instead of the browser default.
  cursor: inherit;
  align-items: baseline;
  vertical-align: middle;
  display: inline-flex;
  white-space: nowrap;
`;

export const CheckboxLabel = styled.div`
  // Re-enable text selection for the checkbox's content since
  // we disabled it above in the CheckboxLayout.
  user-select: auto;
`;

export const CheckboxInnerContainer = styled.div`
  display: inline-block;
  height: ${checkboxSize};
  height: ${checkboxSize};
  line-height: 0;
  margin: auto;
  margin-right: ${TOGGLE_PADDING};
  order: 0;
  position: relative;
  vertical-align: middle;
  white-space: nowrap;
  flex-shrink: 0;
  
  [dir="rtl"] & {
    margin-left: ${TOGGLE_PADDING};
    margin-right: auto;
  }
  
  &[data-no-side-margin="true"] {
    margin-left: 0;
    margin-right: 0;
  }
`;

export const CheckboxFrame = styled.div`
  ${checkboxOuterBox}
  
  background-color: transparent;
  transition: border-color ${checkboxTransitionDuration} ${LINEAR_OUT_SLOW_IN_TIMING_FUNCTION};
  border-width: ${checkboxBorderWidth};
  border-style: solid;
`;

export const CheckboxBackground = styled.div`
  ${checkboxOuterBox}
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${checkboxTransitionDuration} ${LINEAR_OUT_SLOW_IN_TIMING_FUNCTION},
    opacity ${checkboxTransitionDuration} ${LINEAR_OUT_SLOW_IN_TIMING_FUNCTION};
`;

export const CheckboxCheckmark = styled.div`
  ${fill}
  width: 100%;
`;

export const CheckboxCheckmarkPath = styled.div`
  stroke-dashoffset: ${markPathLength};
  stroke-dasharray: ${markPathLength};
  stroke-width: ${checkboxMarkStrokeSize}; 
`;

export const CheckboxMixedMark = styled.div`
  height: ${checkboxMarkStrokeSizeRounded};
  width: calc(100% - 6px);
  opacity: 0;
  transform: scaleX(0) rotate(0deg);
  border-radius: 2px;
  
  @media (-ms-high-contrast: active) {
    height: 0;
    border-top: solid ${checkboxMarkStrokeSizeRounded};
    margin-top: ${checkboxMarkStrokeSizeRounded};
  }
`;

export const CheckboxInput = styled.div`
  // Move the input to the bottom and in the middle.
  // Visual improvement to properly show browser popups when being required.
  bottom: 0;
  left: 50%;
`;

export const CheckboxRoot = styled.div`
  transition: background ${EASE_OUT_DURATION} ${EASE_OUT_TIMING_FUNCTION};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  
  &[data-label-before="true"] ${CheckboxInnerContainer} {
    order: 1;
    margin-left: ${TOGGLE_PADDING}
    margin-right: auto;
  }
  
  [dir="rtl"] &[data-label-before="true"] ${CheckboxInnerContainer} {
    margin-left: auto;
    margin-right: ${TOGGLE_PADDING};
  }
  
  &[data-disabled="true"] {
    cursor: default;
  }
  
  @media (-ms-high-contrast: active) {
    // Note that we change the border style of the checkbox frame to dotted because this
    // is how IE/Edge similarly treats native checkboxes in high contrast mode.
    &[data-cdk-focus="keyboard"] ${CheckboxFrame} {
      border-style: dotted;
    }
  }
`;
