import styled, { css } from 'styled-components';
import { TOGGLE_SIZE, TOGGLE_PADDING } from '../../core/styles/variables';
import { themeThunk, typographyThunk } from './theme';
import VISUALLY_HIDDEN from '../../core/styles/a11y';

const RADIO_SIZE = TOGGLE_SIZE; // px

// Inner label container, wrapping entire element.
// Enables focus by click.
export const RadioLabel = styled.label`
cursor: pointer;
display: inline-flex;
align-items: center;
white-space: nowrap;
vertical-align: middle;
[data-disabled=true] & { cursor: default; }
`;

// Container for radio circles and ripple.
export const RadioContainer = styled.div`
box-sizing: border-box;
display: inline-block;
position: relative;
width: ${RADIO_SIZE}px;
height: ${RADIO_SIZE}px;
// The radio container is inside of a inline-flex element and may shrink if the label
// is wide and text-wrapping is enabled.
flex-shrink: 0;
`;

// The outer circle for the radio, always present.
export const RadioOuterCircle = styled.div`
box-sizing: border-box;
height: ${RADIO_SIZE}px;
width: ${RADIO_SIZE}px;
left: 0;
top: 0;
position: absolute;
transition: border-color ease 280ms;
border: solid 1px;
border-radius: 50%;
`;

// The inner circle for the radio, shown when checked.
export const RadioInnerCircle = styled.div`
border-radius: 50%;
box-sizing: border-box;
height: ${RADIO_SIZE}px;
width: ${RADIO_SIZE}px;
left: 0;
top: 0;
position: absolute;
transition: transform ease 280ms, background-color ease 280ms;

// Note: This starts from 0.001 instead of 0, because transitioning from 0 to 0.5 causes
// IE to flash the entire circle for a couple of frames, throwing off the entire animation.
transform: scale(0.001);

[data-checked=true] & {
  transform: scale(0.5);
}
`;

export const RadioLabelContent = styled.div`
display: inline-block;
order: 0;
line-height: inherit;
padding-left: ${TOGGLE_PADDING}px;
padding-right: 0;

[dir='rtl'] & {
  padding-right: ${TOGGLE_PADDING}px;
  padding-left: 0;
}

&[data-label-position=before] {
order: -1;
padding-left: 0;
padding-right: ${TOGGLE_PADDING}px;

[dir='rtl'] & {
  padding-right: 0;
  padding-left: ${TOGGLE_PADDING}px;
}
}
`;

export const RadioInput = styled.input`
${VISUALLY_HIDDEN}
// Move the input in the middle and towards the bottom so
// the native validation messages are aligned correctly.
bottom: 0;
left: 50%;
`;

const components = {
  InnerCircle: RadioInnerCircle,
  OuterCircle: RadioOuterCircle,
};

// Top-level host container.
export const RadioButtonRoot = styled.div`
display: inline-block;
-webkit-tap-highlight-color: transparent;
&[data-disabled=true] { cursor: default; }
${themeThunk(components)}
${typographyThunk()}
`;

export const RadioGroupRoot = styled.div``;
