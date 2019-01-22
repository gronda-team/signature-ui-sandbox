import { css } from 'styled-components';
import { USER_SELECT } from './vendor';

// Mixin overriding default button styles like the gray background, the border, and the outline.
const BUTTON_RESET = css`
${USER_SELECT('none')}
cursor: pointer;
outline: none;
border: none;
-webkit-tap-highlight-color: transparent;

// The "outline: none" from above works on all browsers, however Firefox also
// adds a special "focus-inner" which we have to disable explicitly. See:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Firefox
&::-moz-focus-inner {
  border: 0;
}
`;

export default BUTTON_RESET;
