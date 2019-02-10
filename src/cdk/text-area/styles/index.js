import { css, keyframes } from 'styled-components';

/*
Keyframes that apply no styles, but allow us to monitor when an text field becomes autofilled
by watching for the animation events that are fired when they start. Note: the `/*!*`/ comment is
needed to prevent LibSass from stripping the keyframes out.
  Based on: https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */

/** Disable the yellow background when inputs are autofilled */
export const AUTOFILL_ANIMATION_START = keyframes`
  to {
    color: currentColor;
    background: transparent;
  }
`;
export const AUTOFILL_ANIMATION_END = keyframes`/*!*/`;

export const TEXT_FIELD_AUTOFILL_MONITOR = css`
&[data-autofill-monitored]:-webkit-autofill {
  animation-name: ${AUTOFILL_ANIMATION_START};
  animation-fill-mode: both;
}
&[data-autofill-monitored]:not(:-webkit-autofill) { animation-name: ${AUTOFILL_ANIMATION_END}; }
`;
