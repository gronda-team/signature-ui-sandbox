import { css, keyframes } from 'styled-components';

/*
Keyframes that apply no styles, but allow us to monitor when an text field becomes autofilled
by watching for the animation events that are fired when they start. Note: the `/*!*`/ comment is
needed to prevent LibSass from stripping the keyframes out.
  Based on: https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */

/** Disable the yellow background when inputs are autofilled */
export const TEXT_FIELD_ANIMATION_START = keyframes`
  to {
    color: currentColor;
    background: transparent;
  }
`;
export const TEXT_FIELD_ANIMATION_END = keyframes`/*!*/`;

export const TEXT_FIELD_AUTOFILL_MONITOR = css`
&[data-autofill-monitored]:-webkit-autofill { animation-name: ${TEXT_FIELD_ANIMATION_START}; }
&[data-autofill-monitored]:-webkit-autofill { animation-name: ${TEXT_FIELD_ANIMATION_END}; }
`;
