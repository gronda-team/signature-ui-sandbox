import { css, keyframes } from 'styled-components';

/*
Keyframes that apply no styles, but allow us to monitor when an text field becomes autofilled
by watching for the animation events that are fired when they start. Note: the `/*!*`/ comment is
needed to prevent LibSass from stripping the keyframes out.
  Based on: https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */

export const TEXT_FIELD_ANIMATION_START = keyframes`/*!*/`;
export const TEXT_FIELD_ANIMATION_END = keyframes`/*!*/`;

export const TEXT_FIELD_AUTOFILL_MONITOR = css`
&:-webkit-autofill { animation-name: ${TEXT_FIELD_ANIMATION_START}; }
&:-webkit-autofill { animation-name: ${TEXT_FIELD_ANIMATION_END}; }
`;
