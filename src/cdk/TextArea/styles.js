import { keyframes, css } from 'styled-components';

// Keyframes that apply no styles, but allow us to monitor when an text field becomes autofilled
// by watching for the animation events that are fired when they start. Note: the /*!*/ comment is
// needed to prevent LibSass from stripping the keyframes out.
export const AutofillStart = keyframes`/*!*/`;
export const AutofillEnd = keyframes`/*!*/`;

export const autofillStyles = css`
  &[data-autofill-monitored="true"] {
    &:-webkit-autofill {
      animation-name: ${AutofillStart};
    }
    
    &:not(:-webkit-autofill) {
      animation-name: ${AutofillEnd};
    }
  }
`;

export const autofillColorsMixin = (background, foreground = '') => {
  const AutofillColorAnim = keyframes`
    to {
      background: ${background};
      ${foreground !== '' ? `color: ${foreground};` : null }
    }
  `;

  return css`
    &:-webkit-autofill {
      animation-name: ${AutofillColorAnim};
      animation-fill-mode: both;
    }
    
    &[data-autofill-monitored="true"]:-webkit-autofill {
      animation-name: ${AutofillStart}, ${AutofillColorAnim};
    }
  `;
};
